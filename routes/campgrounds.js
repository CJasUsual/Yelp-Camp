var express     =   require("express"),
    router      =   express.Router(),
    campground  =   require("../models/campground"),
    middleware  =   require("../middleware/index");

router.get("/", function(req, res){
    campground.find({}, function (err, allCampgrounds) {
        if (err) {
            console.log(err);
        }
        else{
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    });
});

//RENDER THE CAMPGROUND
router.get("/new",middleware.isLoggedIn, function(req, res) {
   res.render("campgrounds/new"); 
});


//SHOW - shows more info about one campground
router.get("/:id", function(req, res) {
   //find the campground with the specific ID
   campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
       if(err){
           console.log(err);
       }
       else{
           res.render("campgrounds/show", {campground: foundCampground});
       }
   });
});

//EDIT CAMPGROUND
router.get("/:id/edit", middleware.checkCampgroundOwnership, function (req, res) {
    campground.findById(req.params.id, function(err, foundCampground){
            res.render("campgrounds/edit", {campground: foundCampground});
    });
});

//UPDATE CAMPGROUND
router.put("/:id", middleware.checkCampgroundOwnership ,function(req, res){
   //find and update the campground
   campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err){
           res.redirect("/campgrounds");
       } else {
           //redirect to the show page
           res.redirect("/campgrounds/" + req.params.id);
       }
   });
});

//DESTROY ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership , function(req, res){
    campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});

//CREATE CAMPGROUND
router.post("/",middleware.isLoggedIn, function(req, res) {
    //get data from the form and pass into the array
    var newName = req.body.name;
    var newImage = req.body.image;
    var description = req.body.description;
    var price       = req.body.price;
    var author      = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = {name: newName, image: newImage, description: description, price: price, author: author};
    //create a new campground and save to the DB
    campground.create(newCampground, function (err, newlyCreated) {
        if (err) {
            console.log("Something is wrong somewhere");
            console.log(err);
        }
        else{
            //redirects back to the campground (get Route)
            res.redirect("/campgrounds");
        }
    });
});

module.exports  = router;