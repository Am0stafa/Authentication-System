const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {

    const { user, pwd } = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });

    const foundUser = await User.findOne({ username: user }).exec();
    if (!foundUser) return res.sendStatus(401); //Unauthorized
    
    
    // evaluate password 
    const match = await bcrypt.compare(pwd, foundUser.password);
    if (match) {                               
        //! way to quickly remove all empty items from an array .filter(Boolean);
        const roles = Object.values(foundUser.roles).filter(Boolean);
    
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
        
        //* in case of cookie found
        
       //! there could be an existing cookie if we didn't sign out but the user went back to the login page if found we do 2 things 
        //? of course we could prevent this in the frontend but for extra security
        const cookies = req.cookies;

        //! 1) if we dont have any cookie with the jwt  we just get the cookies array from the db and if there is we will filter it from the array
        let newRefreshTokenArray = !cookies?.jwt ? foundUser.refreshToken : foundUser.refreshToken.filter(rt => rt !== cookies.jwt);
        
        //! 2) if we have an old cookie we need to remove it
        if(cookies?.jwt){
            //! we need to add reuse detection as this user cookie might be stolen so we need to clear all of the refresh tokens so when the user logs back in it will find that that token what actually reused because the token wouldn't be there
            /* 
            Scenario added here: 
                1) User logs in but never uses RT and does not logout 
                2) RT is stolen and used by the hacker
                3) If 1 & 2, reuse detection is needed to clear all RTs when user logs in
            */
            const refreshToken = cookies.jwt;
            const foundToken = await User.findOne({ refreshToken }).exec();

            // Detected refresh token reuse!
            //! if we dont find the token we know that its already had been used then because our user would not have used that token to it should be in the array even if it is expired. However, if they have not used there token but it isn't in there then we know somebody else had used it
            if (!foundToken) { 
                console.log('attempted refresh token reuse at login!')
                newRefreshTokenArray = [];
            }
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