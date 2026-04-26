const express = require("express");
const router = express.Router({mergeParams: true});
const mongoose = require("mongoose");
const Place = require("../models/places.js");
const Review = require("../models/reviews.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Joi = require('joi');
const reviewSchema = require("../reviewSchema.js");
const {validatereview , isAuthenticated , isOwner} = require("../authenticate_mdlware.js");
router.post("/" , isAuthenticated ,validatereview , wrapAsync(async (req, res)=>{
    let {id} = req.params;
    let {rating , comment} = req.body;
    let review = await Review.insertOne({
       rating,
       comment,
       owner : req.user._id,
    })
    console.log(review);
    // also add this review to the place
        let place = await Place.findById(id);
        place.review.push(review);
        await place.save();
        req.flash("success" , "New Review Added");
   res.redirect(`/listing/${id}`);

}));
router.delete("/:reviewId" , isAuthenticated , async(req , res)=>{
    let {id , reviewId} = req.params;
    // remove the review from review as well as listing
    // console.log(listing);
    let review = await Review.findById(reviewId);
      if(!(res.locals.currUser && review.owner._id.equals(res.locals.currUser._id))){
        req.flash("error" , "You donot have access to delete this review");
        return res.redirect(`/listing/${id}`);
    }
    // console.log(currUser._id);
    // console.log(review.owner._id);
    await Review.findByIdAndDelete(reviewId);
    // find the same id in listing.review and delete it from there
    await Place.findByIdAndUpdate(id , {
       $pull: { review : reviewId }
    });
    req.flash("deleted" , " Review Deleted");
    res.redirect(`/listing/${id}`);
});

module.exports = router;