var express = require('express');
// var path = require('path')
var bodyParser = require('body-parser');
var cors 		= require('cors');
var session = require('express-session');
var config 		= require('./config.js');
var massive = require('massive');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');

var app = module.exports = express();
app.use(bodyParser.json());
app.use(cors());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.secret,
  cookie: {maxAge: 1000 * 60 * 60 * 24}
}))
app.set('port', (process.env.PORT || 8080));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/build'));

// import  webpack from 'webpack';
// import webpackMiddleware from 'webpack-dev-middleware';
// import webpackHotMiddleware from 'webpack-hot-middleware';
// import webpackConfig from '../webpack.config.dev';
// const compiler = webpack(webpackConfig);
// app.use(webpackMiddleware(compiler, {
//   hot: true,
//   publicPath: webpackConfig.output.publicPath,
//   noInfo: false
// }));
// app.use(webpackHotMiddleware(compiler));


// app.get('/*', (req, res) => {
//   res.sendFile(path.join(__dirname, './index.html'));
//  })

var connect = massive.connectSync({connectionString: config.connectionString});
app.set('db', connect);
var db = app.get('db');

passport.use(new GoogleStrategy({
  clientID: config.google.clientID,
  clientSecret: config.google.clientSecret,
  callbackURL: "/auth/google/callback",
  profileFields: ['id', 'displayName']
},
function(accessToken, refreshToken, profile, cb) {
  db.getUserBygoogleId([profile.id], function(err, user) {
    user = user[0];
    if (!user) {
      console.log('CREATING USER');
      db.create_user([profile.displayName, profile.id], function(err, user) {
        console.log('USER CREATED', user);
        return cb(err, user[0]);//add the index because we are creating an user and it return it in an array
      })
    } else {
      return cb(err, user);
    }
  })
}));

passport.serializeUser(function(user, done) {
  console.log(user, 'seeee');
  return done(null, user.google_id);
})

passport.deserializeUser(function(id, done) {
  console.log(id, 'desttt');
  //..possible to add a statement. if we have user google id
  db.getUserBygoogleId([id], function(err, user)  {//was causing errors because we did not return google_id in the db .create
    console.log(user, 'after');
    user = user[0];
    if (err) console.log(err);
    else console.log('RETRIEVED USER');

    return done(null, user);
  })
})

app.get('/auth/google', passport.authenticate('google',{scope:['https://www.googleapis.com/auth/plus.login',
       'https://www.googleapis.com/auth/plus.me']}, (req, res) => {
    const token = jwt.sign()
}))

app.get('/auth/google/callback',
  passport.authenticate('google', {successRedirect: '/' }), function(req, res) {
    res.status(200).send(req.user);
  })

app.get('/auth/me', function(req, res) {
  if (!req.user) return res.sendStatus(404);
  res.status(200).send(req.user);
})

app.get('/auth/logout', function(req, res) {
  req.logout();
  res.redirect('/');
})
var usersCtrl = require('./server/controllers/usersCtrl') ;
var projectsCtrl = require('./server/controllers/projectsCtrl') ;
var stripeCtrl = require('./server/controllers/stripeCtrl')



// router.post('/api/users', (req, res) => {
//   const {username, password, timezone, email} = req.body;
//   dom.create_user([username, password, timezone, email], function (err, result) {
//     if (err) {
//       res.status(500).send(err)
//     }else {
//       res.json({ success: true });
//     }
// })
// })





app.get('/api/user', function(req, res) {
  if (!req.user) return res.status(500).json('error')
  res.status(200).send(req.user);
})

app.get('/api/projects', projectsCtrl.GetAll);
app.post('/api/project', projectsCtrl.Create);
app.post('/api/charge', stripeCtrl.Charge);

app.get('*', (req,res)=>{
  res.sendFile(`${__dirname}/build/index.html`)
})


app.listen(app.get('port'), function () {
  console.log('Running localhost', app.get('port'))
})
