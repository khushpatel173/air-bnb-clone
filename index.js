const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Place = require("./models/places.js");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const Joi = require('joi');
const listingSchema = require("./schema.js");
const reviewSchema = require("./reviewSchema.js");
const Review = require("./models/reviews.js");
const cookieParser = require("cookie-parser");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const session = require("express-session");
const flash = require("connect-flash");
const { saveRedirectUrl } = require("./authenticate_mdlware.js");

const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/users.js");
// to use passport we also need express-session


app.engine("ejs" , engine);

app.use(methodOverride("_method"));
main().then(()=>{
    console.log("connection successful");
}).catch((err)=>{
    console.log(err);
})
async function main(){
   await mongoose.connect('mongodb://127.0.0.1:27017/airbnb');
}
let port = 8080;
app.listen(port , ()=>{
console.log("Server is running on port 8080");
});
app.set("views" , path.join(__dirname , "views"));
app.set("view engine" , "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
const sessionOptions = {
    secret : "secretcode",
        resave : false,
        saveUninitialized : true,
        cookie : {
            expires : Date.now() + 7 * 24 * 60 * 60 * 1000, // in ms
            //   expires : Date.now(), // in ms
            maxAge : 7 * 24 * 60 * 60 * 100,
            // maxAge : 0,
            httpOnly : true, // for security purposes
        }
};


app.use(session(sessionOptions));
app.use(flash());
// we use passport after session cause it need session

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req , res , next)=>{
    res.locals.createdMsg = req.flash("success");
    res.locals.deletedMsg = req.flash("deleted");
    res.locals.failureMsg = req.flash("failure");
    res.locals.errorMsg = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

// app.get("/registerDemo" ,async (req , res)=>{
//     let fakeUser = new User({
//         email : "khush@gmail.com" , 
//         username : "delta_student" // we can write this it will auto add username here
//     });

//     let registeredUser = await User.register(fakeUser , "password"); // it will be saved in the db with this password
//     res.send(registeredUser);
// });


app.get("/signup" , (req ,res)=>{
    // render a form which will take users details
    res.render("signup_form.ejs");
})
app.get("/login" ,(req , res)=>{
    res.render("login.ejs");
})
app.get("/logout" , (req , res ,next )=>{
    req.logout((err)=>{
        if(err){
            next(err);
        }
        req.flash("success" , "You are logged out");
        res.redirect("/listing");
    })
});
app.post("/login",saveRedirectUrl , passport.authenticate("local" , {failureRedirect : "/login" , failureFlash : true}) ,(req ,res)=>{
    // if you are here that means you are logged in
    let redirectUrl = res.locals.redirectUrl || "/listing";

    req.flash("success" , "Welcome to airbnb , you are logged in");
    res.redirect(redirectUrl);
})
app.post("/signup" , wrapAsync(async(req ,res)=>{
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

app.use("/listing/:id/review" , reviewRouter);
app.use("/listing" , listingRouter);

// signed cookies - if you change the whole thing then it will be null if you change just the name then it will come but as false and in signed cookies noithing else the normal cookies will come
// app.use(cookieParser("secretcode"));

// // Route to set cookie
// app.get("/getcookies", (req, res) => {
//     res.cookie("name", "khush" , {signed : true});
//     res.send("cookie sent");
// });

// // Route to read cookie
// app.get("/print", (req, res) => {
//     console.dir(req.signedCookies);
//     res.send("done");
// });
app.all("/{*path}" , (req , res , next)=>{
    next(new ExpressError(404 , "Page not found"));
})
// app.use((err , req, res ,next)=>{
//      next(new ExpressError(401 , "Invalid form"));
// })
app.use((err , req , res , next)=>{
   let {status=500 , message="something went wrong"} = err;
//    res.status(status).send(message);
res.status(status).render("error.ejs" , {err}); // such that it comes in the same page
})

