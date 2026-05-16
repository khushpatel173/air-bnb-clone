const mongoose = require("mongoose");
const Review = require("./reviews.js");
const placeSchema = new mongoose.Schema(
    {
        title: {
            type : String,
            required : true
        },
        description : {
            type : String
        },
        image  : {
                filename : String,
                url : {
                    type: String,
                }
            },
        price : {
            type : Number
        },
        location : {
            type : String
        },
        country :{
            type : String
        },
        review : [{
            type : mongoose.Schema.Types.ObjectId,
            ref : "Review"
        }],
        owner : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        },
        geometry:{
            type : {
                type : String,
                enum : ['Point'],
            },
            coordinates :{
                type : [Number],
                default : [-74.0060 , 40.7128],
            }
        }
    }
)
placeSchema.post("findOneAndDelete" ,async(listing)=>{
    if(listing)
    {
    await Review.deleteMany({
        _id : {$in : listing.review}
    })
    }
})

const Place = mongoose.model("Place" , placeSchema);
module.exports = Place;