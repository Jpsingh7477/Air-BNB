if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const dburl= process.env.ATLAS_DB_URL ;





const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./util/wrapAsync.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const expressError = require("./util/expressError.js");
const { listingSchema,reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/reviews.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const User = require("./models/user.js");
const userRouter = require("./routes/users.js");
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

const LocalStrategy = require("passport-local").Strategy;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static('public'));


app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

const store = MongoStore.create({
    mongoUrl: dburl,
    crypto: {
        secret : process.env.SECRET,
    },
    touchAfter: 24 * 3600, 


}) 
store.on("error", function(e) {
    console.log("session store error", e);
});  

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 day
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true, // helps prevent XSS attacks
    }
    
    }

 

app.use(session(sessionOptions));    
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
}
);


main().then(()=>{
    console.log("connected to DB");
}).catch( (err) =>{
    console.log(err);
});




async function main(){
    await mongoose.connect(dburl);
}

const validateSchema = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if (error) {
        let errmsg = error.details.map((el) => el.message).join(",");
        throw new expressError(400,errmsg );
    }
    next();
}


// app.get("/",(req,res)=>{
//     res.send("Root working");
// });


app.get("/demouser", async (req, res) => {
    let fakeUser = new User({
    username : "demoUser",
    email : "demo@gmail.com"
    });

    let registeredUser = await User.register(fakeUser, "password123");
    res.send(registeredUser);
});







app.use('/listings', listingRouter);
app.use('/listings/:id/reviews', reviewRouter);

app.use("/",userRouter);







//review



    

    
    // app.get("/testlisting", async (req, res) => {
    //     try {
    //         let sampleTesting = new Listing({
    //             title: "My NewVilla",
    //             description: "By the beach",
    //             price: 1200,
    //             location: "calungate,goa",
    //             country: "India",
    //             image: {
    //                 filename: "listingimage",
    //                 url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
    //             }
    //         });
            
    //         await sampleTesting.save();
    //         console.log("Sample was saved successfully");
    //         res.send("successful");
    //     } catch (err) {
    //         console.error("Error saving listing:", err);
    //         res.status(500).send("Error saving listing");
    //     }
    // });

app.use((err,req,res,next)=>{
    let{statuscode = 500 , message = "something went wrong"} = err;
    console.log(err);
    res.render("listings/error",{message});
});    

app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});

