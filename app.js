
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var settings = require('./settings');
var flash = require('connect-flash');
var mongoose = require('mongoose');
var SessionStore = require("session-mongoose")(express);

mongoose.connect('mongodb://localhost/blog');

var store = new SessionStore({
    interval: 120000, // expiration check worker run interval in millisec (default: 60000)
    connection: mongoose.connection // <== custom connection
});

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());
app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(express.cookieParser());
app.use(express.session({
	secret: settings.cookieSecret,
	key: settings.db, //cookie key name
	cookie: {maxAge: 1000 * 60 * 60 * 24 * 30}, //30 days
	store: store
}));


app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

routes(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
