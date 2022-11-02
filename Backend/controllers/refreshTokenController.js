const User = require('../model/User');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.status(401).json({ 'message': 'No cookie' }) //unauthorized
    
    const refreshToken = cookies.jwt;
    
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true});

    
    const foundUser = await User.findOne({ refreshToken }).exec();
    
    //? detected refresh token reuse! two different sources trying to use the same token
    //! stolen cookie that has been used before
    if (!foundUser){
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
            //^ if there is an error this means that it expired so we dont need to worry about that soo much
                if (err) return res.status(403).json({ 'message': 'invalid token' }) //Forbidden
            //^ otherwise we know that somebody is attempting to use a refresh token that would be valid if we hadn't invalidated it already because it was used before so we know that this is a reuse attempt
            console.log('attempted refresh token reuse!')
            const hackedUser = await User.findOne({ email: decoded.email }).exec();
                hackedUser.refreshToken = [];
                const result = await hackedUser.save();
                console.log(result);
        })
        return res.status(403).json({ 'message': 'No user with such token' }); //Forbidden

    }
    
    //! Now we have found the token it is a valid and we are ready to resend a new one after removing this old token from the database
    const newRefreshTokenArray = foundUser.refreshToken.filter((token) => token !== refreshToken)
    
    
    
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {

            if (err) {
                //^ in that case we need to update the data in the database
                console.log('expired refresh token')
                foundUser.refreshToken = [...newRefreshTokenArray];
                const result = await foundUser.save();
                
            }
            //! after that a 403 is send
            if (err || foundUser.email !== decoded.email) return res.sendStatus(403);
            
            
            const roles = Object.values(foundUser.roles).filter(Boolean);
            
            //& accessToken
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "email": decoded.email,
                        "roles": roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            );
            //& refreshToken
            const newRefreshToken = jwt.sign(
                { "email": foundUser.email },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '60d' }
            );
            
            //! Saving refreshToken with current user
            foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
            await foundUser.save();

            //! Creates Secure Cookie with refresh token
            res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

            res.json({ roles, accessToken })
        }
    );

}


module.exports = { handleRefreshToken }
