const express = require('express');
const router = express.Router();

const passport = require('passport');
const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');
const request = require('request-promise');
// SIGNUP
router.get('/register', (req, res) => {
  res.render('auth/register');
});

router.post('/register', passport.authenticate('local.signup', {
    successRedirect: '/dashboard',
    failureRedirect: '/register',
    session: true
  }));

// SINGIN
router.get('/login', (req, res) => {
  res.render('auth/login.hbs');
});

router.post('/login', async (req, res, next) => {
  console.log(req.body);
  var options = {
    method: 'POST',
    uri: 'https://www.google.com/recaptcha/api/siteverify',
    form: {
      secret: '6LcoVhUfAAAAAEXtaKedSneXPZF4AN26erlMilNN',
      response: req.body["g-recaptcha-response"],
    },
    json: true // Automatically stringifies the body to JSON
  };

  request(options)
    .then((response) => {
      console.log(response);
      if(response.success === true){
      passport.authenticate('local.signin', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
      })(req, res, next);
    } else {
      req.flash('message', 'Completa el captcha.');
      res.redirect('/login')
    }
    })
    .catch((err) => {
      console.log('error');
    })


});
router.get('/logout', (req, res) => {
  req.logOut();
  res.redirect('/');
});

module.exports = router;
