const mongoose = require("mongoose");
const placeSchema = new mongoose.Schema(
    {
        title: {
            type : String
        },
        description : {
            type : String
        },
        image  : {
                filename : String,
                url : String
        },
        price : {
            type : Number
        },
        location : {
            type : String
        },
        country :{
            type : String
        }
    }
)
const Place = mongoose.model("Place" , placeSchema);
module.exports = Place;