const express = require('express');
const morgan = require('morgan');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const validator = require('express-validator');
const passport = require('passport');
const flash = require('connect-flash');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
let hbs = require('hbs');
const { database } = require('./keys');

// Intializations
const app = express();
require('./lib/passport');

// Settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});
app.set('view engine', '.hbs');
app.engine('.hbs', hbs.__express);
// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(session({
  secret: 'faztmysqlnodemysql',
  resave: false,
  saveUninitialized: false,
  store: new MySQLStore(database)
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(validator());

// Global variables
app.use((req, res, next) => {
  app.locals.message = req.flash('message');
  app.locals.success = req.flash('success');
  app.locals.user = req.user;
  next();
});

// Routes
app.use(require('./routes/authentication'));
app.use(require('./routes/index'));
// Public
app.use(express.static(path.join(__dirname, 'public')));

// Starting
const ovh = require('ovh')({
  endpoint: 'ovh-ca',
  appKey: 'C3h3u9skvkrti6KC',
  appSecret: 'aPFNX5XCBhRfEbBF5UpXNK2vTJ9Gc2c3',
  consumerKey: 'PUeLdiFXf4KuSQPOYN2JaDNK0tPI77FJ'
});
app.listen(app.get('port'), () => {
  ovh.request('GET', '/dedicated/server', function(error, result) {
    console.log(result || error);
  })
  console.log('Server is in port', app.get('port'));
});
