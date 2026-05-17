require('dotenv').config();

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Place = require("../models/places.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Joi = require('joi');
const listingSchema = require("../schema.js");
const { isAuthenticated, isOwner , validatefn } = require("../authenticate_mdlware.js");
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const uploadfn = require("../cloudUpload.js");
router
.route("/")
.get(wrapAsync(async (req , res)=>{
    // show all the properties
    let properties = await Place.find({});
    res.render("listing.ejs" , {properties});
}))
.post(isAuthenticated , upload.single('url'),validatefn, wrapAsync(async (req,res , next)=>{
   if (!req.file) {
        return next(new ExpressError(400, "Image file is required"));
      }
let url , filename;
         let result = await uploadfn(req ,res , next);
         url = result.secure_url;
          filename = result.original_filename;

    //   get the cordinates and store them in the database

   const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${req.body.location}&format=geojson&limit=1`,
    {
      headers: {
        'User-Agent': 'airbnb-sample-app/1.0 (khush9427528660@gmail.com)', // REQUIRED by Nominatim policy
        'Referer': 'https://air-bnb-clone-vouh.onrender.com' 
      },
      timeout: 5000
    }
  );
      
        const data = await response.json();
        // data.geometry is the geojson format so just store it
//    remove the file from the system
                // let {title,description,price,country,location} =req.body;
                // await Place.insertOne(  
                //     {
                //         title : title,
                //         description : description,
                //     image : {
                //         url : url,
                //         filename : filename
                //     },
                //         price : price ,
                //         location : location ,
                //         country : country,
                //         owner : req.user._id,
                //     }
                // );
    let listing = new Place(req.body);
    listing.owner = req.user._id;
    listing.image = {url , filename};
    listing.geometry = data.features[0].geometry;
    await listing.save();
    req.flash("success" , "New Listing created");

    res.redirect("/listing");
}));

router.get("/add" ,isAuthenticated, (req,res)=>{
    // render a form which will take the data

    // when you login in passpoert add the user to the session basically and to authenticate it basically checks that if the user is in the session or not and lets say we have loggen in and then we have deleted the data from the db then also we will not be authenticated as in the next req the deserealize will be called and it will remove that user from the session if it is not in the db

    // also rather than checking in each like edit , delete , update we can make a middleware and pass it in that
    // if(!(req.isAuthenticated())){
    //     req.flash("error" , "You need to loggen in order to add a place")
    //     res.redirect("/login");
    //     return;
    // }
    res.render("create.ejs");
})


router
.route("/:id")
.get(wrapAsync(async (req , res)=>{
    // show the details and with that also have the button of edit and delete
    let {id} = req.params;
    let place = await Place.findById(id).populate("review").populate("owner").populate({
        path : "review",
        populate : {path : "owner"},
    });
    if(!place)
    {
        req.flash("failure" , "The place you are trying to acees does not exist");
         return res.redirect("/listing");
    }
    res.render("details.ejs" , {place});
}))
.post( isAuthenticated ,upload.single("url"), isOwner , validatefn , wrapAsync(async (req , res,next)=>{
    // change the data in the database 
    let url , filename;
  if(req.file){
         let result = await uploadfn(req ,res , next);
         url = result.secure_url;
          filename = result.original_filename;
  }
    let {id} = req.params;
    let place = await Place.findById(id);
    if(!(res.locals.currUser && place.owner.equals(res.locals.currUser._id))){
        //  then you cant edit
        req.flash("error" , "You donot have permission to access this");
        return res.redirect(`/listing/${id}`);
    }
    await Place.findByIdAndUpdate(id , {
        ...req.body
    });
    if(req.file){
    place.image = {
        url ,filename
    };
    await place.save();
}
    res.redirect(`/listing/${id}`);
}))
.delete(isAuthenticated ,isOwner ,   wrapAsync(async (req ,res)=>{
    req.flash("deleted" , "Place has been deleted");
    let {id} = req.params;
    await Place.findByIdAndDelete(id);
    res.redirect("/listing");
}));
router.get("/:id/edit" , isAuthenticated , isOwner , wrapAsync(async (req ,res)=>{
   
    // render a from which will allow user to edit also add an button to go to back to listing

    let {id} = req.params;
    let place = await Place.findById(id);
    if(!place)
    {
        req.flash("failure" , "The place you are trying to edit does not exist");
         return res.redirect("/listing");
    }
    let currentUrl = place.image.url;
    currentUrl.replace("/upload" , "/upload/w_250");
    res.render("edit.ejs" , {place , currentUrl});
}));

module.exports = router;