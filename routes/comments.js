var express =   require("express"),
    router  =   express.Router({mergeParams: true}),
    campground   = require("../models/campground"),
    comment      = require("../models/comment"),
    middleware  =   require("../middleware/index");

//GET COMMENTS
router.get("/new",middleware.isLoggedIn,function(req, res) {
    //find campground by id
    campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else{
            res.render("comments/new", {campground: campground});
        }
    });
});

//CREATE COMMENTS
router.post("/",middleware.isLoggedIn, function(req,res){
    //lookup campground using ID
    campground.findById(req.params.id, function(err, campground) {
        if(err){
            req.flash("error", "Something went wrong");
            res.redirect("/campgrounds");
        } else{
            //create new comment
            comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                } else{
                    // add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //connect new comment to campground and save
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    //redirect to campground show page
                    req.flash("success", "Successfully added comment");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

//EDIT COMMENT
router.get("/:comment_id/edit", middleware.checkCommentOwnership , function(req, res){
    comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment Edited");
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        }
    });
});

//UPDATE COMMENT
router.put("/:comment_id", middleware.checkCommentOwnership , function(req, res){
    comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment Updated");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//DESTROY COMMENTS
router.delete("/:comment_id", middleware.checkCommentOwnership , function(req, res){
    //find by ID and remove
    comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment Deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports  = router;