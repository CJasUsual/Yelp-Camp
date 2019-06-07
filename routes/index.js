var express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    user = require("../models/user");



router.get("/", function (req, res) {
    res.render("index");
});

// show register form
router.get("/register", function (req, res) {
    res.render("register", {
        page: 'register'
    });
});

router.post("/register", function (req, res) {
    var newUser = new user({
        username: req.body.username
    });

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

router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",

    failureFlash: true
}), function (req, res) {});

//logout route
router.get("/logout", function (req, res) {
    req.logout();
    req.flash("success", "You have successfully Logged Out!");
    res.redirect("/campgrounds");
});

module.exports = router;