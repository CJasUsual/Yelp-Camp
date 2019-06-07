const   express         = require ("express"),
        app             = express(),
        bodyParser      = require("body-parser"),
        mongoose        = require("mongoose"),
        flash           = require("connect-flash"),
        session         = require("express-session"),
        passport        = require("passport"),
        localStrategy   = require("passport-local"),
        methodOverride  = require("method-override"),
        campground      = require("./models/campground"),
        comment         = require("./models/comment"),
        user            = require("./models/user"),
        seedDB          = require("./seeds");
    
const   commentRoutes   = require("./routes/comments"),
        campgroundRoutes= require("./routes/campgrounds"),
        indexRoutes     = require("./routes/index");
    
let url                 = process.env.DATABASEURL || "mongodb://localhost:27017/yelp_camp"; // fallback in case global var not working

mongoose.connect(url, { useNewUrlParser: true });//LOCAL Database

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// seedDB(); seed DB for test purposes

//PASSPORT CONFIGURATION
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

//PASS currentUser ON ALL ROUTES
app.use(function (req, res, next){
  res.locals.currentUser    = req.user;
  res.locals.error          = req.flash("error");
  res.locals.success        = req.flash("success");
  next();
});

//USE ROUTES
app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

//SERVER LISTENING
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server Started");
});