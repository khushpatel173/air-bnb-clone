const Joi = require('joi');
const listingSchema = Joi.object({
    title : Joi.string().required(),
    description : Joi.string().required(),
    // image : Joi.object({
    //     url : Joi.string()
    // }),
    url : Joi.string(),
    location : Joi.string().required(),
    country : Joi.string().required(),
    price : Joi.number().required().min(0)
});
module.exports = listingSchema;