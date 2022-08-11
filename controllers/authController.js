const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
    //! there could be an existing cookie
    const cookies = req.cookies;


    const { user, pwd } = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });

    const foundUser = await User.findOne({ username: user }).exec();
    if (!foundUser) return res.sendStatus(401); //Unauthorized 
    // evaluate password 
    const match = await bcrypt.compare(pwd, foundUser.password);
    if (match) {                                //! way to quickly remove all empty items from an array
        const roles = Object.values(foundUser.roles).filter(Boolean);
        //! example
        // const array = [{ good }, null, { great }, undefined]
        // const truthyArray = array.filter(Boolean)
        // truthyArray = [{ good }, { great }]
        
        // create JWT
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": foundUser.username,
                    "roles": roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '60s' }
        );
        const newRefreshToken = jwt.sign(
            { "username": foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        
        //? if we dont have any cookie with the jwt and if there is we will filter it
        let newRefreshTokenArray = !cookies?.jwt ? foundUser.refreshToken : foundUser.refreshToken.filter(rt => rt !== cookies.jwt);
        
        //! if we have an old cookie we need to remove it
        if(cookies?.jwt){
            res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });        
        }
        
        
        
        // Saving refreshToken with current user
        foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        const result = await foundUser.save();
        console.log(result);
        console.log(roles);

        // Creates Secure Cookie with refresh token
        res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

        // Send authorization roles and access token to user
        res.json({ roles, accessToken });

    } else {
        res.sendStatus(401);
    }
}

module.exports = { handleLogin };