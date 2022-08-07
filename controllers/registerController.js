const fsPromises = require('fs').promises;
const path = require('path');
//! for hashing and salting the password
const bcrypt = require('bcrypt');

const usersDB = {
    users: require('../model/users.json'),
    setUsers: function (data) { this.users = data }
}


const handelNewUser = async (req, res) => {
    const {user, pwd} = req.body;
    if (!user || !pwd){
        return res.status(404).json({"status": "failed",message:"username and password are required"});}
    try {
        const hashPwd = await bcrypt.hash(pwd,10)
        const newUser = {"username":user,"password":hashPwd}
        usersDB.setUsers([...usersDB.users, newUser])
        await fsPromises.writeFile(
            path.join(__dirname, '..', 'model', 'users.json'),
            JSON.stringify(usersDB.users)
        );

        res.status(201).json({ 'success': `New user ${user} created!` });
        
    } catch (error) {
        return res.status(500).json({"status": "failed",message:error.message});
    }



}



module.exports = {handelNewUser}