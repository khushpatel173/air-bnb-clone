const Joi = require('joi');
const reviewSchema = Joi.object({
    rating : Joi.number().required(),
    comment : Joi.string().required(),
});
module.exports = reviewSchema;