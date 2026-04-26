const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Place = require("../models/places.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Joi = require('joi');
const listingSchema = require("../schema.js");
const { isAuthenticated, isOwner , validatefn } = require("../authenticate_mdlware.js");
router.get("/" , wrapAsync(async (req , res)=>{
    // show all the properties
    let properties = await Place.find({});
    res.render("listing.ejs" , {properties});
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

router.post("/" ,validatefn , wrapAsync(async (req,res , next)=>{
    // if we come here that means a new listing have been created
    // console.log(req.user);
    req.flash("success" , "New Listing created");
    let {title,description,url,price,country,location} =req.body;
    await Place.insertOne(
        {
            title : title,
            description : description,
           image : {
            url : url
           },
            price : price ,
            location : location ,
            country : country,
            owner : req.user._id,
        }
    );
    res.redirect("/listing");
}));
router.get("/:id" , wrapAsync(async (req , res)=>{
    // show the details and with that also have the button of edit and delete
    let {id} = req.params;
    let place = await Place.findById(id).populate("review").populate("owner").populate({
        path : "review",
        populate : {path : "owner"},
    });
    console.log(place.review);
    if(!place)
    {
        req.flash("failure" , "The place you are trying to acees does not exist");
         return res.redirect("/listing");
    }
    res.render("details.ejs" , {place});
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
    res.render("edit.ejs" , {place});
}));
router.post("/:id" , validatefn , isOwner , wrapAsync(async (req , res)=>{
    // change the data in the database 
    let {id} = req.params;
    let {title , description  , url , price , country , location} =req.body;
    let place = await Place.findById(id);
    if(!(res.locals.currUser && place.owner.equals(res.locals.currUser._id))){
        //  then you cant edit
        req.flash("error" , "You donot have permission to access this");
        return res.redirect(`/listing/${id}`);
    }
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
}));
router.delete("/:id" ,isAuthenticated ,isOwner ,   wrapAsync(async (req ,res)=>{
    req.flash("deleted" , "Place has been deleted");
    let {id} = req.params;
    await Place.findByIdAndDelete(id);
    res.redirect("/listing");
}));
module.exports = router;