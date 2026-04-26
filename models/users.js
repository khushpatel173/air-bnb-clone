const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default || require("passport-local-mongoose");
const userSchema = new Schema(
    {
         email : {
            type : String,
            required : true,
            unique : true,
         }
         // username and password the pass local mongoose will automatically create it so no nede to mention it here by doing hashing and salting 
   


    }
)
userSchema.plugin(passportLocalMongoose);
 const User = mongoose.model("User" , userSchema);
 module.exports = User;