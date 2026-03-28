const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Place = require("./models/places.js");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
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

app.get("/listing" , async (req , res)=>{
    // show all the properties
    let properties = await Place.find({});
    res.render("listing.ejs" , {properties});
})
app.get("/listing/add" , (req,res)=>{
    // render a form which will take the data
    res.render("create.ejs");
})
app.post("/listing" , async (req,res)=>{
    // store the data
    let {title , description  , url , price , country , location} =req.body;
    // store all of this in the data base
    await Place.insertOne(
        {
            title : title,
            description : description,
           image : {
            url : url
           },
            price : price ,
            location : location ,
            country : country
        }
    );

    res.redirect("/listing");
});
app.get("/listing/:id" , async (req , res)=>{
    // show the details and with that also have the button of edit and delete
    let {id} = req.params;
    let place = await Place.findById(id);
    res.render("details.ejs" , {place});
})
app.get("/listing/:id/edit" , async (req ,res)=>{
    // render a from which will allow user to edit also add an button to go to back to listing
    let {id} = req.params;
    let place = await Place.findById(id);
    res.render("edit.ejs" , {place});
})
app.post("/listing/:id" , async (req , res)=>{
    // change the data in the database 
    let {id} = req.params;
    let {title , description  , url , price , country , location} =req.body;
    await Place.findByIdAndUpdate(id , {
        title,
        description,
        image : {
            url : url
        } ,
        price , 
        country ,
        location
    });
    res.redirect(`/listing/${id}`);
})
app.delete("/listing/:id" , async (req ,res)=>{
    let {id} = req.params;
    await Place.findByIdAndDelete(id);
    res.redirect("/listing");
});