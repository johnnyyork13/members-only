const express = require('express');
const router = express.Router();
const UserSchema = require('../models/user');
const PostSchema = require('../models/post');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

/* GET home page. */
router.get('/', async function(req, res, next) {
  const posts = await PostSchema.find().exec();
  console.log(posts);
  res.render('index', { title: 'Members Only', user: req.user, posts: posts});
});

router.get('/sign-up', (req, res, next) => {
  res.render('sign-up', { title: "Sign Up" });
})

router.get('/log-in', (req, res, next) => {
  res.render('log-in', { title: "Login" });
})

router.get('/add-post', (req, res, next) => {
  if (!req.user) {
    res.redirect('/');
  } else {
    res.render('add-post', { title: "Add Post", user: req.user})
  }
})

router.get('/profile', async(req, res, next) => {
  const user = await UserSchema.findOne({username: req.user.username}).exec();
  res.render('profile', {title: "Profile", user: user});
})

router.get('/profile/delete-post/:id', async(req, res, next) => {
  //console.log(req.user.username);
  try {
    await PostSchema.deleteOne({_id: req.params.id}).exec();
    await mongoose.connection.db.collection('users').updateOne({
      username: req.user.username
    }, {
      $pull: {posts: {id: req.params.id}}
    });
    res.redirect('/profile');
  } catch(err) {
    return next(err);
  }
})

router.get('/admin/delete-post/:id', async(req, res, next) => {
  try {
    const post = await PostSchema.findOne({_id: req.params.id});
    await mongoose.connection.db.collection('users').updateOne({
      username: post.authorUsername,
    }, {
      $pull: {posts: {id: req.params.id}}
    });
    await PostSchema.deleteOne({_id: req.params.id});
    res.redirect('/');
  } catch(err) {
    return next(err);
  }
})

router.get('/membership', async(req, res, next) => {
  res.render('membership', { title: "Become a Member", user: req.user})
})

router.post('/add-post', async(req, res, next) => {
  const date = new Date();
  try {
    const user = await UserSchema.findOne({username: req.user.username}).exec();
    const post = new PostSchema({
      title: req.body.title,
      body: req.body.body,
      date: `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getFullYear()}`,
      time: date.toLocaleTimeString(),
      author: req.body.displayName,
      authorUsername: user.username,
      upvotes: 0
    })
    await UserSchema.updateOne({username: req.user.username}, { $push: {posts : {
      title: post.title,
      body: post.body,
      date: post.date,
      time: post.time,
      author: post.author,
      id: post._id.toString(),
      upvotes: 0
    }}});
    await post.save()
    res.redirect('/');
  } catch(err) {
    return next(err);
  }
})

router.post(
  '/log-in', 
  passport.authenticate('local', {
    successRedirect: "/",
    failureRedirect: "/log-in"
  }))

router.post('/sign-up', (req, res, next) => {
  bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
    try {
      const checkUsername = await UserSchema.findOne({username: req.body.username}).exec();
      if (!checkUsername) {
        const user = new UserSchema({
          username: req.body.username,
          password: hashedPassword,
          displayName: req.body.displayName,
          membershipType: "basic"
        });
        await user.save()
        req.login(user, function(err) {
          if (err) {
            console.log(err);
          }
          return res.redirect('/');
        })
       } else {
        return res.render("sign-up", {title: "Sign Up", usernameErrorMessage: "Username Already in Use"});
       }
    } catch(err) {
      return next(err);
    }
  })
})

router.post('/secret', async(req, res, next) => {
  try {
    if (req.body.secretWord.toLowerCase() === "hullaballoo") {
      await UserSchema.findOneAndUpdate({username: req.user.username}, {$set: {membershipType: "member"}}).exec();
      res.render("membership", {title: "Become a Member", showModal: true, user: req.user})
    } else {
      res.render('membership', {title: "Become a Member", showModal: true, showError: true, user: req.user})
    }
  } catch(err) {
    return next(err);
  }
})

router.get('/log-out', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  })
})

module.exports = router;
