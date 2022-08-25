const router = require("express").Router();
const passport = require("passport");
const CLIENT_URL = "http://localhost:3000/";

//! if the callback send us to failed page
router.get("/login/failed", (req, res) => {
    res.status(401).json({
      success: false,
      message: "failure",
    });
});  

//! if the call back end us to success page
router.get("/login/success", (req, res) => {
    //^ passport is going to return to us a user which is going to be inside our request
    if (req.user) {
        //* if we found the user this means that the user is authenticated
        res.status(200).json({
            success: true,
            message: "successfully",
            user: req.user,
            cookies: req.cookies
          });        
    }
})

router.get("/logout", (req, res) => {
    req.logout(); //! use the logout method provided by passport and what this method will do is delete this user by deleting req.user 
    
    res.redirect(CLIENT_URL);
});
  

router.get('/google', passport.authenticate("google", { scope: ["profile"] }));//! we want only profile info

router.get('/google/callback', passport.authenticate("google", {
    successRedirect: CLIENT_URL, //! client url
    failureRedirect: "/login/failed",//! server url
    })
)
module.exports = router
