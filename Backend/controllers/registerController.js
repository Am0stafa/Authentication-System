const crypto = require('crypto');
const userModel = require('./../model/User')

const handelNewUser = async (req, res) => {
    const {email, pwd} = req.body;
    if (!email || !pwd)
        return res.status(404).json({"status": "failed",message:"email and password are required"});
        
    try {

        const duplicate = await userModel.findOne({ email }).exec();
        if (duplicate) return res.status(409).json({"status": "Conflict",message:"A user with this email already exists"});
        
        const name = email.split('@')[0];
        
        const salt =  process.env.SALT
        const pepper = crypto.randomBytes(5).toString('hex');

        const hashPwd =crypto.createHash('sha512').update(salt+pwd+pepper).digest('hex');
        
        await userModel.create({
            name,
            email,
            "password":hashPwd,
            "pepper":pepper,
        })
 
        
        res.status(201).json({ 'success': `New user ${name} created!` });
        
    } catch (error) {
        return res.status(500).json({"status": "failed",message:error.message});
    }
}



module.exports = {handelNewUser}