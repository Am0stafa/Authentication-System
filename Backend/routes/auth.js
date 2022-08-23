const router = require("express").Router();
const { User, validate } = require("../models/user");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
    try {    
        const { error } = validate(req.body);
    		if (error)
    			return res.status(400).send({ message: error.details[0].message });
    
    	const user = await User.findOne({ email: req.body.email });
    	if (!user)
    		return res.status(401).send({ message: "Invalid Email or Password" });
    			
        const validPassword = await bcrypt.compare(
            req.body.password,
    		user.password
    	);
		if (!validPassword)
		return res.status(401).send({ message: "Invalid Email or Password" });
    	
    	const token = user.generateAuthToken();
		res.status(200).send({ data: token, message: "logged in successfully" });
		
  
		if (!user.verified) {
	
			const Vtoken = user?.activateToken?.token 

			if (!Vtoken) {
				
				const newUser =await User.findByIdAndUpdate(user._id, {"activateToken.token":crypto.randomBytes(32).toString("hex"), "activateToken.createdAt":Date.now()},
				{
						new: true,
						runValidators: true
				});
				const url = `${process.env.BASE_URL}users/${newUser.id}/verify/${newUser.activateToken.token}`;
				console.log(newUser)
				await sendEmail(newUser.email, "Verify Email", url);
				
			}


			return res
				.status(400)
				.send({ message: "An Email sent to your account please verify" });
		}

    		
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });

    }
})


module.exports = router;
