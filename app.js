var express         = require ("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    flash           = require("connect-flash"),
    passport        = require("passport"),
    localStrategy   = require("passport-local"),
    methodOverride  = require("method-override"),
    campground      = require("./models/campground"),
    comment         = require("./models/comment"),
    user            = require("./models/user"),
    seedDB          = require("./seeds");
    
var commentRoutes   = require("./routes/comments"),
    campgroundRoutes= require("./routes/campgrounds"),
    indexRoutes     = require("./routes/index");

//declarations
// mongoose.connect("mongodb://localhost:27017/yelp_camp", { useNewUrlParser: true });   //LOCAL DB
mongoose.connect("mongodb://CJ:test@ds131313.mlab.com:31313/yelp_camp", { useNewUrlParser: true });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// seedDB(); seed DB

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Save trees, save water!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

//pass data on all pages
app.use(function (req, res, next){
  res.locals.currentUser    = req.user;
  res.locals.error          = req.flash("error");
  res.locals.success        = req.flash("success");
  next();
});

//ROUTES
app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

//SERVER
app.listen(process.env.PORT, process.env.IP, function(){
});