require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Require database models
require('./app_api/models/db');

// Load routers
const indexRouter = require('./app_server/routes/index');
const apiRouter = require('./app_api/routes/index'); // Ensure this points to your API routes
const usersRouter = require('./app_server/routes/users');

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'pug');

// Middleware setup
app.use(logger('dev'));

// Enable parsing of JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Use routers
app.use('/', indexRouter);
app.use('/api', apiRouter);
app.use('/users', usersRouter);

// Catch 404 and forward to error handler
// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404, 'Not Found'));
});

// Error handler
app.use(function (err, req, res, next) {
    console.error(err.stack); // Log the error stack
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

// Example route for 'About' page
app.get('/about', function (req, res) {
    res.render('about');  // Render the 'about' page
});

module.exports = app;

