const express = require('express');

const router = express.Router({mergeParams: true});
const passport = require('passport');
const wrapAsync = require("../util/wrapAsync.js");
const { isloggedin } = require("../util/isloggedin.js");
const {saveredirecturl} = require("../util/isloggedin.js");


const User = require("../models/user.js");

router.get('/signup', (req, res) => {
    res.render('users/signup');
});

router.post('/signup', async (req, res) => {
      try{
        let { username, email, password } = req.body;
      const newUser = new User({ username, email });
      const registeredUser = await User.register(newUser,password);
      console.log(registeredUser);
      req.login(registeredUser, (err) => {
        if (err) {
          req.flash('error', 'Login failed after registration');
          return res.redirect('/signup');
        }
        req.flash('success', 'Welcome to the app!');
        res.redirect('/listings');
      });
      
      }
      catch(err){
        req.flash('error', err.message);
        res.redirect('/signup');
      }


});

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login',saveredirecturl,passport.authenticate("local",{failureRedirect:'/login',failureFlash : true}), async (req, res) => {
  req.flash( "success","Login successful");
  res.redirect(res.locals.redirectUrl || '/listings');


});
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Logged out successfully');
        res.redirect('/listings');
    });
});



module.exports = router;
