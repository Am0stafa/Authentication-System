const router = require("express").Router();
const { User } = require("../models/user");
const bcrypt = require("bcrypt");

router.post('/',async (req, res) => {
    try {
        const { error } = validate(req.body);
		if (error)
			return res.status(400).send({ message: error.details[0].message });
			
	    //! check for duplicates

		const user = await User.findOne({ email: req.body.email });
		if (user)
			return res
				.status(409)
				.send({ message: "User with given email already Exist!" });
		
		
		const hashPassword = await bcrypt.hash(req.body.password, 10);
		
        const newUser = await User.create({
            ...req.body, password: hashPassword 
        })
 

        
        res.status(201).json({ 'success': `New user ${user} created!` });
				
		
    } catch (err) {
        return res.status(500).json({"status": "failed",message:err.message});

    }
    
})

const validate = (data) => {
	const schema = Joi.object({
		email: Joi.string().email().required().label("Email"),
		password: Joi.string().required().label("Password"),
	});
	return schema.validate(data);
};

module.exports = router;
