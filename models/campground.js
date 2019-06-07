var mongoose = require("mongoose");
 
var campgroundSchema = new mongoose.Schema({
   name: String,
   image: String,
   description: String,
   price: String,
   location: String,
   lat: Number,
   lng: Number,
   author: {
      id:{
         type: mongoose.Schema.Types.ObjectId,
         ref: "user"
      },
      username: String
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "comment"
      }
   ]
});
 
module.exports = mongoose.model("campground", campgroundSchema);