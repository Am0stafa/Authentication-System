const mongoose = require("mongoose");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true },
	activateToken:{
		token: { type: String },
		createdAt: { type: Date, default: Date.now, expires: 3600 }
	},
	verified: { type: Boolean, default: false }
});

const User = mongoose.model("user", userSchema);

//! method that return jwt
userSchema.methods.generateAuthToken = function () {
	const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
		expiresIn: "7d",
	});
	return token;
};


module.exports = { User };
