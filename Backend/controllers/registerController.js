const crypto = require('crypto');
const userModel = require('./../model/User')

const handelNewUser = async (req, res) => {
    const {email, pwd} = req.body;
    if (!email || !pwd)
        return res.status(404).json({"status": "failed",message:"email and password are required"});
       
    
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(email))
        return res.status(404).json({"status": "failed",message:"email is not valid"});
       
    try {

        const duplicate = await userModel.findOne({ email }).exec();
        if (duplicate) return res.status(409).json({"status": "Conflict",message:"A user with this email already exists"});
        
        let name = email.split('@')[0];
        //! validate name from xss
        const nameRegex = /^[a-zA-Z0-9_]{3,25}$/;
        if (!nameRegex.test(name))
            name = 'user';

        
        const salt =  process.env.SALT
        const peppers = ["00","01","10","11"];
        const pepper = peppers[Math.floor(Math.random() * 4)]
        console.log(pepper)
        const hashPwd = crypto.createHash('sha512').update(salt+pwd+pepper).digest('hex');
        
        await userModel.create({
            name,
            email,
            "password":hashPwd,
        })
                
        
        res.status(201).json({ 'success': `New user ${name} created!` });
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({"status": "failed",message:error.message});
    }
}



module.exports = {handelNewUser}