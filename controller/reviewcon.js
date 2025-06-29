const Review = require('../models/review');
const Listing = require('../models/listing');

module.exports.createReview = async(req, res) => {
    const listing = await Listing.findById(req.params.id);
    const review = new Review(req.body.review); // expects { rating, comment }
    review.author = req.user._id;
    await review.save(); // Assuming req.user is set by authentication middleware
    listing.reviews.push(review);
    await review.save();
    await listing.save();
    req.flash("success","  New Review Created !");
    
    res.redirect(`/listings/${listing._id}`);};


module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success"," Review Deleted !");
    res.redirect(`/listings/${id}`);
};    
