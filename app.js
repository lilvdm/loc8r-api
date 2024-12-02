require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport'); // Required before the database models

require('./app_api/models/db');
require('./app_api/config/passport'); // Configuration after the database models

const usersRouter = require('./app_server/routes/users');
const apiRouter = require('./app_api/routes/index');

const app = express();

const cors = require('cors');
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // for legacy browser support
};
app.use(cors(corsOptions));

app.use('/api', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-with, Content-type, Accept, Authorization");
    next();
});

app.set('views', path.join(__dirname, 'app_server', 'views')); // view engine setup
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'app_public', 'build')));
app.use(passport.initialize());

app.use('/users', usersRouter);
app.use('/api', apiRouter);

app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res
            .status(401)
            .json({ "message": err.name + ": " + err.message });
    }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

// Fallback route for Angular app
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'app_public', 'build', 'index.html'));
});

module.exports = app; 