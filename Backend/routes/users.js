const router = require("express").Router();
const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const crypto = require("crypto");
const sendEmail = require("../sendEmail")
router.post('/',async (req, res) => {
    try {

			
	    //! check for duplicates

		const user = await User.findOne({ email: req.body.email });
		if (user)
			return res
				.status(409)
				.send({ message: "User with given email already Exist!" });
		
		
		const hashPassword = await bcrypt.hash(req.body.password, 10);
		
        const newUser = await User.create({
            ...req.body, password: hashPassword,
            activateToken:{ token:crypto.randomBytes(32).toString("hex")}
        })
    

		const url = `${process.env.BASE_URL}users/${newUser.id}/verify/${newUser.activateToken.token}`;
		await sendEmail(newUser.email, "Verify Email", url);
		
        res.status(201).json({ 'success':"an email send to your account"});
				
		
    } catch (err) {
        return res.status(500).json({"status": "failed",message:err.message});

    }
    
})
router.get("/:id/verify/:token/", async (req, res) => {
try {


	const userId = req.params.id
	const tokenVal = req.params.token
	const user = await User.findOne({_id: userId})
	if (!user) return res.status(400).send({ message: "Invalid link" });
	const token = await User.findOne({"activateToken.token":tokenVal})
	if (!token) return res.status(400).send({ message: "Invalid token" });
	const newUser =await User.findByIdAndUpdate(user._id, {verified: true , $unset: { activateToken: 1 } },
	{
		new: true,
		runValidators: true
	});

	res.status(200).send({ message: "Email verified successfully" });

} catch (error) {
	res.status(500).send({ message: "Internal Server Error" });

}
})



module.exports = router;
