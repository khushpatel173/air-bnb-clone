const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

async function uploadfn(req , res, next){
        cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.API_KEY, 
        api_secret: process.env.API_SECRET // Click 'View API Keys' above to copy your API secret
    });

           
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path);
      fs.unlinkSync(req.file.path);
      return uploadResult;
    } else {
      return next(new ExpressError(400, "Image file is required"));
    }
    
};

module.exports = uploadfn;