const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fsPromises = require('fs').promises;
const path = require('path');

const usersDB = {
    users: require('../model/users.json'),
    setUsers: function (data) { this.users = data }
}

const handleLogin = async (req, res) => {
    const {user, pwd} = req.body;
    const foundUser = usersDB.users.find(person => person.username == user)
    if (!foundUser) return res.status(401).json("user Not found")
    samePwd = await bcrypt.compare(pwd, foundUser.password)
    if (!samePwd) return res.status(404).json("wrong password")
    const accessToken = jwt.sign({"username":foundUser.username},process.env.ACCESS_TOKEN_SECRET,{
     expiresIn:'30s',
    })
    //! we will save our refresh token in the database which will allow us to crate a logout route which will allow us to invalidate the refresh token when the user logs out 
    const refreshToken = jwt.sign({"username":foundUser.username},process.env.REFRESH_TOKEN_SECRET,{
     expiresIn:'1d',
    })
    //? saving current user to db with there refresh token
    const otherUsers = usersDB.users.filter(person => person.username !== foundUser.username);
    const currentUser = { ...foundUser, refreshToken };
    usersDB.setUsers([...otherUsers, currentUser]);
    await fsPromises.writeFile(
        path.join(__dirname, '..', 'model', 'users.json'),
        JSON.stringify(usersDB.users)
    );
    //! send the refresh token as cookie
    res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 });

    //! send the accessToken in the response
    res.json({ accessToken });
 

}

module.exports = { handleLogin };














