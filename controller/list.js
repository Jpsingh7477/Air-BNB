const Listing = require("../models/listing");
const mbxTilesets = require('@mapbox/mapbox-sdk/services/tilesets');
const maptoken = process.env.MAP_TOKEN;
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const geocodingclient = mbxGeocoding({ accessToken: maptoken });


module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    
    res.render("listings/index" , {allListings});

};


module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
};


module.exports.createListing = async (req, res) => {
    let coordinate = await geocodingclient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1
})
  .send()
  
    
    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url,"..", filename);
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {
        url,
        filename
    };
    newListing.geometry = coordinate.body.features[0].geometry;
    let savedlistings = await newListing.save();
    console.log(savedlistings); 
    req.flash("success", "New listing created successfully!");
    res.redirect("/listings");
};


module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(req.params.id)
  .populate({
    path: 'reviews',
    populate: { path: 'author' }
  })
  .populate('owner');

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    res.render("listings/show", { listing });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    res.render("listings/edit", { listing });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    
    let lisitng = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    if(typeof req.file === 'undefined') {
        let url = req.file.path;
    let filename = req.file.filename;
    lisitng.image = {
        url,
        filename
    };
    await lisitng.save();
        
    }
    

    req.flash("success"," Listing Updated Successfully !");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
};


