
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy;

var app = express();

//all environments
app.set('port', process.env.PORT || 3000);
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'secret' }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(__dirname + '/public'));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var TWITTER_CONSUMER_KEY = "pWeT9NtSRCo5mbyzOGrew";
var TWITTER_CONSUMER_SECRET = "5MsC72jswcKEhFOBz9QiyS3OcQiWvGQZhk6HdaiiII";

// Passport session setup.
// To support persistent login sessions, Passport needs to be able to
// serialize users into and deserialize users out of the session. Typically,
// this will be as simple as storing the user ID when serializing, and finding
// the user by ID when deserializing. However, since this example does not
// have a database of user records, the complete Twitter profile is serialized
// and deserialized.
passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});


// Use the TwitterStrategy within Passport.
// Strategies in passport require a `verify` function, which accept
// credentials (in this case, a token, tokenSecret, and Twitter profile), and
// invoke a callback with a user object.
passport.use(new TwitterStrategy({
		consumerKey: TWITTER_CONSUMER_KEY,
		consumerSecret: TWITTER_CONSUMER_SECRET,
		callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
	},
	function(token, tokenSecret, profile, done) {
	// asynchronous verification, for effect...
		process.nextTick(function () {
			 // To keep the example simple, the user's Twitter profile is returned to
			 // represent the logged-in user. In a typical application, you would want
			 // to associate the Twitter account with a user record in your database,
			 // and return that user instead.
			 return done(null, profile);
		});
	}
));

//GET /auth/twitter
//Use passport.authenticate() as route middleware to authenticate the
//request.  The first step in Twitter authentication will involve redirecting
//the user to twitter.com.  After authorization, the Twitter will redirect
//the user back to this application at /auth/twitter/callback
app.get('/auth/twitter',
  passport.authenticate('twitter'),
  function(req, res){
    // The request will be redirected to Twitter for authentication, so this
    // function will not be called.
	}
);


//GET /auth/twitter/callback
//Use passport.authenticate() as route middleware to authenticate the
//request.  If authentication fails, the user will be redirected back to the
//login page.  Otherwise, the primary route function function will be called,
//which, in this example, will redirect the user to the home page.
app.get('/auth/twitter/callback', 
	passport.authenticate('twitter', { failureRedirect: '/users' }),
	function(req, res) {
		res.redirect('/users');
});


app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
