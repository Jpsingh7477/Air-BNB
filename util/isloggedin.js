const express = require('express');
const router = express.Router();  
const Listing = require('../models/listing.js');
const Review = require('../models/review.js');  

module.exports.isloggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirecturl= req.originalUrl; // Store the original URL
        req.flash('error', 'You must be logged in to do that');
        return res.redirect('/login');
    }
    next();
}

module.exports.saveredirecturl = (req, res, next) => {
    if (req.session.redirecturl) {
        res.locals.redirectUrl = req.session.redirecturl; // Make it available in views
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params; // Extract id from URL parameters
    const currentUser = res.locals.currentUser; // Get authenticated user
    
    const listing = await Listing.findById(id);
    
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    
    if (!listing.owner.equals(currentUser._id)) {
        req.flash("error", "You do not have permission to edit this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.isreviewAuthor = async (req, res, next) => {
    const { reviewId, id } = req.params;

    try {
        const review = await Review.findById(reviewId).populate("author");

        if (!review) {
            req.flash("error", "Review not found.");
            return res.redirect(`/listings/${id}`);
        }

        if (!review.author || !review.author._id.equals(res.locals.currentUser._id)) {
            req.flash("error", "You are not authorized to delete this review");
            return res.redirect(`/listings/${id}`);
        }

        next();
    } catch (err) {
        console.error("Error in isreviewAuthor middleware:", err);
        req.flash("error", "Something went wrong. Please try again.");
        return res.redirect(`/listings/${id}`);
    }
};
