const express = require('express');

const router = express.Router({mergeParams: true});

const Review = require("../models/review.js");
const { listingSchema,reviewSchema } = require("../schema.js");
const expressError = require("../util/expressError.js");
const wrapAsync = require("../util/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isloggedin,isreviewAuthor } = require("../util/isloggedin.js");
const reviewcontroller = require("../controller/reviewcon.js");



const validateReview = (req, res, next) => {
    
    let {error} = reviewSchema.validate(req.body);
    if (error) {
        let errmsg = error.details.map((el) => el.message).join(",");
        throw new expressError(400,errmsg );
    }
    next();
}

router.get("/", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate({
        path: "reviews",
        populate: { path: "author" }
    });
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    res.render("listings/show", { listing });
}));



//review
router.post("/",isloggedin,validateReview, wrapAsync (reviewcontroller.createReview)    

);


// delete review
router.delete("/:reviewId",isreviewAuthor, reviewcontroller.destroyReview );

module.exports = router;
