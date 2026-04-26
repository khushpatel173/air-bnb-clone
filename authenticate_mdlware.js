const Place = require("./models/places");
const listingSchema = require("./schema");
const reviewSchema = require("./reviewSchema");
module.exports.isAuthenticated = (req ,res , next)=>{
    console.log(req.originalUrl);
    // req.session.redirectUrl = req.originalUrl;
if(!(req.isAuthenticated())){
     if (req.method === "GET") {
      req.session.redirectUrl = req.originalUrl;
    } else {
      req.session.redirectUrl = req.get("referer") || "/listing";
    }
        req.flash("error" , "You need to loggen in order to add a place")
        return res.redirect("/login");
    }
    // authenticated then call next
    next();
}

module.exports.saveRedirectUrl = (req , res , next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req , res ,next)=>{
   let {id} = req.params;
    let place = await Place.findById(id);
    if(!(res.locals.currUser && place.owner.equals(res.locals.currUser._id))){
        //  then you cant edit
        req.flash("error" , "You donot have permission to access this");
        return res.redirect(`/listing/${id}`);
    }
    next();
}

module.exports.validatefn = (req , res , next)=>{
    let {error} = listingSchema.validate(req.body , { abortEarly: false });
    if(error)
    {
        console.log(error);
        let errMsg = error.details.map((el)=> el.message).join(" ,");
       throw new ExpressError(400 , errMsg);
    }
    else{
        next();
    }
}

module.exports.validatereview = ((req , res , next)=>{
let {error} = reviewSchema.validate(req.body , { abortEarly: false });
    if(error)
    {
        console.log(error);
        let errMsg = error.details.map((el)=> el.message).join(" ,");
       throw new ExpressError(400 , errMsg);
    // next(error);
    }
    else{
        next();
    }
});