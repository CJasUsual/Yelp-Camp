var express = require("express"),
    router = express.Router(),
    campground = require("../models/campground"),
    middleware = require("../middleware/index"),
    NodeGeocoder = require('node-geocoder');

var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

var geocoder = NodeGeocoder(options);

//INDEX - Show All Campgrounds
router.get("/", function (req, res) {
    // Get all campgrounds from DB
    campground.find({}, function (err, allCampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", {
                campgrounds: allCampgrounds,
                page: 'campgrounds'
            });
        }
    });
});

//RENDER THE CAMPGROUND
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("campgrounds/new");
});


//SHOW - shows more info about one campground
router.get("/:id", function (req, res) {
    //find the campground with the specific ID
    campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/show", {
                campground: foundCampground
            });
        }
    });
});

//EDIT CAMPGROUND
router.get("/:id/edit", middleware.checkCampgroundOwnership, function (req, res) {
    campground.findById(req.params.id, function (err, foundCampground) {
        res.render("campgrounds/edit", {
            campground: foundCampground
        });
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;

        campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, campground) {
            if (err) {
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                req.flash("success", "Successfully Updated!");
                res.redirect("/campgrounds/" + campground._id);
            }
        });
    });
});

//DESTROY ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    campground.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            req.flash("error", "Campground Deleted!");
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function (req, res) {
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var price = req.body.price;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var newCampground = {
            name: name,
            image: image,
            description: desc,
            author: author,
            price: price,
            location: location,
            lat: lat,
            lng: lng
        };
        // Create a new campground and save to DB
        campground.create(newCampground, function (err, newlyCreated) {
            if (err) {
                console.log(err);
            } else {
                //redirect back to campgrounds page
                res.redirect("/campgrounds");
            }
        });
    });
});

module.exports = router;