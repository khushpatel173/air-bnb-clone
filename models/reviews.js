const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema(
    {
        rating : Number,
        comment : String,
        createdAt: {
            type : Date,
            default : Date.now()
        },
        owner : {
                    type : mongoose.Schema.Types.ObjectId,
                    ref : "User"
                }
    }
);
const Review = mongoose.model("Review" , reviewSchema);
module.exports = Review;
