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
                    default : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIMq0Utl9O-TUtLMs4xn6n1q0jyqAYN0YB3w&s" 
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