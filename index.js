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
const authRouter = require("./routes/auth.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const { saveRedirectUrl } = require("./authenticate_mdlware.js");

const passport = require("passport");
const localStrategy = require("passport-local");
var GoogleStrategy = require('passport-google-oidc');
const User = require("./models/users.js");
// to use passport we also need express-session


app.engine("ejs" , engine);
const dbUrl = process.env.ATLAS_URL;
app.use(methodOverride("_method"));
main().then(()=>{
    console.log("connection successful");
}).catch((err)=>{
    console.log(err);
})
async function main(){
   await mongoose.connect(dbUrl);
}
let port = 8080;
app.listen(port , ()=>{
console.log("Server is running on port 8080");
});
app.set("views" , path.join(__dirname , "views"));
app.set("view engine" , "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const store = MongoStore.create(
    {
        mongoUrl : dbUrl,
        touchAfter : 24 * 3600,
      crypto: {
    secret: process.env.SECRET_KEY,
  },
    }
);
store.on("error" , (err)=>{
    console.log(" Error in mongo session store" , err);
})
const sessionOptions = {
    store , 
     secret: process.env.SECRET_KEY,
        resave : false,
        saveUninitialized : false,
        cookie : {
            expires : Date.now() + 7 * 24 * 60 * 60 * 1000, // in ms
            //   expires : Date.now(), // in ms
            maxAge : 7 * 24 * 60 * 60 * 1000,
          
            httpOnly : true, // the cookie become unaccesseble to the java script
        }
};


app.use(session(sessionOptions));
app.use(flash());
// we use passport after session cause it need session

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate())); // mentioning what are we using like the local one or like oauth\

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'https://air-bnb-clone-vouh.onrender.com/auth/google/callback',
    },
    async (issuer, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || profile._json?.email;

        let user = await User.findOne({ googleId: profile.id });

        if (!user && email) {
          user = await User.findOne({ email });

          if (user) {
            user.googleId = profile.id;
            await user.save();
          }
        }

        if (!user) {
          user = await User.create({
            email,
            username: profile.displayName,
            googleId: profile.id,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




// res.locals is like storing a data for that particular request
app.use((req , res , next)=>{
    res.locals.createdMsg = req.flash("success");
    res.locals.deletedMsg = req.flash("deleted");
    res.locals.failureMsg = req.flash("failure");
    res.locals.errorMsg = req.flash("error");
    res.locals.currUser = req.user;
    next();
})
app.use("/" , authRouter);
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

