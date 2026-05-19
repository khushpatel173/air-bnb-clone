const express = require("express");
const { saveRedirectUrl } = require("../authenticate_mdlware");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const User = require("../models/users.js");

const localStrategy = require("passport-local");
router.get(
  "/auth/google/login",
  passport.authenticate("google", {
    scope: ["openid", "profile", "email"],
    prompt: "select_account"
  })
);
router.get('/auth/google/callback', passport.authenticate('google', {
  successReturnToOrRedirect: '/listing',
  failureRedirect: '/login'
}));


router
.route("/login")
.get((req , res)=>{
    res.render("login.ejs")})
.post(saveRedirectUrl , passport.authenticate("local" , {failureRedirect : "/login" , failureFlash : true}) ,(req ,res)=>{
    // if you are here that means you are logged in
    let redirectUrl = res.locals.redirectUrl || "/listing";
    delete req.session.redirectUrl;
    req.flash("success" , "Welcome to airbnb , you are logged in");
    res.redirect(redirectUrl)});

router
.route("/signup")
.get((req ,res)=>{
    // render a form which will take users details
    res.render("signup_form.ejs")})
    .post(wrapAsync(async(req ,res , next)=>{
        // get all the details
        try{
            let {username , email , password} = req.body;
    
        
        // make a new user with this and store in the database
        let user = new User({
            email,
            username,
        });
       let registeredUser =  await User.register(user , password);
        // let checkUser = await User.findOne({email : email});
        // if(checkUser){
        //     req.flash("failure" , "User with this email already exists");
        //     res.redirect("/signup");
        //     return;
        // }
           req.login(registeredUser , (err)=>{
                 if(err){
                    next(err);
                }
         req.flash("success" , "Welcome to airbnb , you are signedup");
        res.redirect("/listing");
            })
            }
            catch(e){
                // error would be that user exists
                req.flash("failure" , "User with this username already exists");
                    res.redirect("/signup");
            }
            }));

            router.get("/logout" , (req , res ,next )=>{
                req.logout((err)=>{
                    if(err){
                        next(err);
                    }
                    req.flash("success" , "You are logged out");
                    res.redirect("/listing");
                })
            });

            module.exports = router;
