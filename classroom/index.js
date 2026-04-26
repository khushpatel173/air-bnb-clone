// state 

// stateful protocol - where your session related info gets stored Ex - ftp 
// stateless protocol - where it does not get stored Ex- http

// express sessions - in the server side there is one sessionId for all the users and that have the data related to their cart or anything and in the client side that is in the browser we will have that session id via in the form of cookie which is needed to store the info in browser because info like that in cart or something that are not permanent we dont save them in database that is why we need something else which is cookie to store the info
const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
app.set("views" , path.join(__dirname , "views"));
app.set("view engine" , "ejs");
app.listen(3000 , ()=>{
    console.log("session running on port 3000");
})
app.use(session(
    {
        secret : "secretcode",
        resave : false,
        saveUninitialized : true
    }
));
app.use(flash());
// flash can only be used when we use sessions
app.use((req ,res , next)=>{
     res.locals.susMsg = req.flash("success");
     res.locals.errMsg = req.flash("failure");
     next();
})
app.get("/test" , (req ,res)=>{
    res.send("Test done! session id is added in the cookie  ");
})
app.get("/reqcount" ,(req ,res)=>{
    if(req.session.count)
    {
        req.session.count++;
    }
    else{
 req.session.count = 1;
    }
    console.dir(req.session);
    res.send(`You send ${req.session.count} times`);
})
// we can store variables in req.session in obj and this will be use and accessed through session and will be different for every session this is Memory Storage which should not be used in in production lvl but can be used while development
app.get("/register" , (req ,res)=>{
    let {name = "default"} = req.query;
    req.session.name = name;
    // res.send(`Session name saved this can also be accessed in diff pages like below`); 
    if(name === "default"){
req.flash("failure" , "user not registered");
    }
    else{
 req.flash("success" , "user registered successfully");
    }
    // console.log(res.locals.errMsg); here it will not there but when greet is called then again the middle ware will be used and then it will be stored so in the greet it will be there
    res.redirect("/greet");
});


app.get("/greet" , (req , res)=>{
    // console.log(res.locals.errMsg); here it will be there as mentioned above
    // res.locals.messages = req.flash("success");
    // you can use this in any file this locals one , inside rendering so here you can use it in page.ejs
   res.render("page.ejs" , {name : req.session.name});
// res.send(`Hey ${req.session.name }`);
});
// flash will sent that message once and then we will refresh or anything it wont be there 