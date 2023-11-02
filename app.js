const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

//require('dotenv').config();
const DATABASE_URL = process.env.DATABASE_URL ? process.env.DATABASE_URL : "mongodb+srv://admin:Tonkita-22@cluster0.kna3k3z.mongodb.net/members_only?retryWrites=true&w=majority";
const session = require('express-session');
const mongoose = require('mongoose')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcryptjs');
const UserSchema = require('./models/user');

const indexRouter = require('./routes/index');

mongoose.connect(DATABASE_URL);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection ereror"));

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await UserSchema.findOne({username: username});
      if (!user) {
        return done(null, false, { message: "Incorrect Username" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect Password"});
      }
      return done(null, user);
    } catch(err) {
      return done(err);
    }
  })
)

passport.serializeUser((user, done) => {
  done(null, user.id);
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserSchema.findById(id);
    done(null, user);
  } catch(err) {
    done(err);
  }
})

app.use(session({ secret: "tonka", resave: false, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
