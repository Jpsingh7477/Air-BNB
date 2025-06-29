const Joi=require('joi');

module.exports.listingSchema=Joi.object({
    listing : Joi.object({
        title: Joi.string().min(3).max(100).required(),
        description: Joi.string().min(10).max(500).required(),
        price: Joi.number().positive().required(),
        location: Joi.string().min(3).max(100).required(),
        country : Joi.string().min(3).max(100).required(),
        image: Joi.string().allow("",null)
    }).required(),
    });

module.exports.reviewSchema=Joi.object({
    review : Joi.object({
        comment: Joi.string().min(10).max(500).required(),
        rating: Joi.number().min(1).max(5).required()
    }).required()
});    
