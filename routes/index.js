var express     = require("express"),
    router      = express.Router(),
    passport    = require("passport"),
    user        = require("../models/user"),
    campground  = require("../models/campground");



router.get("/", function (req, res) {
    res.render("index");
});

// show register form
router.get("/register", function (req, res) {
    res.render("register", {
        page: 'register'
    });
});

// handle sign up logic
router.post("/register", function (req, res) {
    var newUser = new user({
        username: req.body.username,
        firstname: req.body.firstName,
        lastname: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar
    });

    if(req.body.adminCode === process.env.ADMINCODE){
        newUser.isAdmin = true;
    }

    user.register(newUser, req.body.password, function (err, user) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("register");
        }
        passport.authenticate("local")(req, res, function () {
            req.flash("success", "Welcome to Yelpcamp " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

//show login form
router.get("/login", function (req, res) {
    res.render("login", {
        page: 'login'
    });
});

//handle login logic
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",

    failureFlash: true
}), function (req, res) {});

//User Profile Route
router.get("/users/:id", function(req, res){
    user.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error", "We couldn't find that");
            res.redirect("/campgrounds");
        }
        campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds){
            if(err){
                req.flash("error", "We couldn't find that");
                res.redirect("/campgrounds");
            }
            res.render("users/show", {user: foundUser, campground: campgrounds});
        })
    })
})

//logout route
router.get("/logout", function (req, res) {
    req.logout();
    req.flash("success", "You have successfully Logged Out!");
    res.redirect("/campgrounds");
});

module.exports = router;