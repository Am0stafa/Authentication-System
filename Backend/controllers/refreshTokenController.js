const User = require('../model/User');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.status(401).json({ 'message': 'No cookie' }) //unauthorized
    
    
    //! here we will be receiving the refresh token and save it in this variable
    const refreshToken = cookies.jwt;
    
    //! we want to delete the cookie after we receives it as we will send a new cookie
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true});

    //! search for the user by the refresh token findOne will search through the refreshToken array
    const foundUser = await User.findOne({ refreshToken }).exec();
    console.log(foundUser)
    //? detected refresh token reuse! two different sources trying to use the same token
    //! stolen cookie that has been used before
    if (!foundUser){
        //! what we want to do here is we want to decode the token that we received and see if we can pull out a username so we can match that to an account and delete all of the refresh tokens that exist with that account as this is an indecision that this users cookies had been compromised
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
            //^ if there is an error this means that it expired so we dont need to worry about that soo much
                if (err) return res.status(403).json({ 'message': 'invalid token' }) //Forbidden
            //^ otherwise we know that somebody is attempting to use a refresh token that would be valid if we hadn't invalidated it already because it was used before so we know that this is a reuse attempt
            console.log('attempted refresh token reuse!')
            const hackedUser = await User.findOne({ username: decoded.username }).exec();
                hackedUser.refreshToken = [];
                const result = await hackedUser.save();
                console.log(result);
        })
        return res.status(403).json({ 'message': 'No user with such token' }); //Forbidden

    }
    
    //! Now we have found the token it is a valid and we are ready to resend a new one after removing this old token from the database
    const newRefreshTokenArray = foundUser.refreshToken.filter((token) => token !== refreshToken)
    
    
    //! lw el user mawgood w el token sa7 we will generate a new accessToken
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            //! we have received the token but at the same time the token has expired we found the user it is related to all that is good but we have an expired token in the database
            if (err) {
                //^ in that case we need to update the data in the database
                console.log('expired refresh token')
                foundUser.refreshToken = [...newRefreshTokenArray];
                const result = await foundUser.save();
                console.log(result);
            }
            //! after that a 403 is send
            if (err || foundUser.username !== decoded.username) return res.sendStatus(403);
            
            
            const roles = Object.values(foundUser.roles).filter(Boolean);
            
            //& accessToken
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": decoded.username,
                        "roles": roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '60s' }
            );
            //& refreshToken
            const newRefreshToken = jwt.sign(
                { "username": foundUser.username },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '1d' }
            );
            
            //! Saving refreshToken with current user
            foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
            await foundUser.save();

            //! Creates Secure Cookie with refresh token
            res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

            res.json({ accessToken })
        }
    );

}


module.exports = { handleRefreshToken }
