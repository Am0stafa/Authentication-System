//! for hashing and salting the password
const bcrypt = require('bcrypt');
const userModel = require('./../model/User')


const handelNewUser = async (req, res) => {
    const {user, pwd} = req.body;
    if (!user || !pwd){
        return res.status(404).json({"status": "failed",message:"username and password are required"});}
    try {
        const duplicate = await userModel.findOne({ username: user }).exec();
        if (duplicate) return res.sendStatus(409); //Conflict 
    
        const hashPwd = await bcrypt.hash(pwd,10)
        const newUser = await userModel.create({"username":user,
        "password":hashPwd
        })
 

        
        res.status(201).json({ 'success': `New user ${user} created!` });
        
    } catch (error) {
        return res.status(500).json({"status": "failed",message:error.message});
    }



}



module.exports = {handelNewUser}