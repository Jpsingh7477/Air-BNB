const express = require('express');
const router = express.Router();
const Listing = require('../models/listing.js');
const wrapAsync = require("../util/wrapAsync.js");
const { listingSchema,reviewSchema } = require("../schema.js");
const expressError = require("../util/expressError.js");
const { isloggedin } = require("../util/isloggedin");
const { isOwner } = require("../util/isloggedin");
const listingcontroller = require("../controller/list.js");
const multer = require("multer");
const storage = require("../cloudconfig.js").storage;
const upload = multer({ storage });


const methodOverride = require('method-override');
router.use(methodOverride('_method'));





const validateSchema = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errmsg = error.details.map((el) => el.message).join(",");
        throw new expressError(400, errmsg);
    }
    next();
};

router.route("/").get(isloggedin, wrapAsync(listingcontroller.index))
.post(
    isloggedin,
    upload.single('listing[image]'),
    validateSchema,
    wrapAsync(listingcontroller.createListing)
);



//new route
router.get("/new",isloggedin, listingcontroller.renderNewForm
);


    


//edit route
router.get("/:id/edit",isloggedin, listingcontroller.renderEditForm);


//update route
router.put("/:id",isloggedin,isOwner, listingcontroller.updateListing);


//delete route
router.delete("/:id",isloggedin,isOwner, listingcontroller.destroyListing);


//show route
router.get("/:id", listingcontroller.showListing);

module.exports = router;

