const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const pool = require('../database');

passport.use('local.signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  console.log(email);
  const rows = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  console.log(rows);
  if (rows.length > 0) {
    const userlogin = rows[0];
    //if(user.Contra === '00001') return res.redirect('/cuenta/cambiar-contra?email="'+email+'"');
    const hash = crypto.createHash('whirlpool');
    const data = hash.update(password, 'utf-8');
    const gen_hash= data.digest('hex');
    console.log("INPUTTEXT: "+gen_hash.toUpperCase())
    console.log("PASSWORD ENCRIPTED: "+userlogin.password)
    if (gen_hash.toUpperCase() === userlogin.password) {

      return done(null, userlogin, req.flash('success', 'Bienvenido. ' + userlogin.email));
    } else {
      return done(null, false, req.flash('message', 'La contraseña es incorrecta.'));
    }
  } else {
    return done(null, false, req.flash('message', 'No pudimos encontrar tu cuenta.'));
  }
}));

passport.use('local.signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  
  let newUser = {
    email,
    password,
  };
  const nombreandemail = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if(nombreandemail.length > 0) return done(null, false, req.flash('message', 'El nombre de usuario o el correo ya están en uso.'));
  const hash = crypto.createHash('whirlpool');
  const data = hash.update(password, 'utf-8');
  const gen_hash= data.digest('hex'); 
  newUser.password = gen_hash.toUpperCase();
  const result = await pool.query('INSERT INTO users (email, password, created, updated) VALUES (?, ?, ?, ?)', [newUser.email, newUser.password, new Date(), new Date()]);
  newUser.id = result.insertId;
  console.log(result);
  console.log(newUser);
  return done(null, newUser);
}));

passport.serializeUser((user, done) => {
  done(null, user.id || user.ID);
});

passport.deserializeUser(async (id, done) => {
  const rows = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  done(null, rows[0]);
});

