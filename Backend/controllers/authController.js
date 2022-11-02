const User = require('../model/User');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
// const DeviceDetector = require('node-device-detector');
// const DeviceHelper   = require('node-device-detector/helper');
// const ClientHints    = require('node-device-detector/client-hints')



const handleLogin = async (req, res) => {

    const { email, pwd } = req.body;
    if (!email || !pwd) return res.status(400).json({ 'message': 'Email and password are required.' });

    const foundUser = await User.findOne({ email }).exec();
    if (!foundUser) return res.sendStatus(401); //Unauthorized
        
    const foundPass = foundUser.password
    const salt = process.env.SALT
    const pepper = foundUser.pepper
    const match = crypto.createHash('sha512').update(salt + pwd + pepper).digest('hex') === foundPass;
    
    if (!match) return res.sendStatus(401); //Unauthorized
    
    //! get the device info
    // const detector = new DeviceDetector({
    //     clientIndexes: true,
    //     deviceIndexes: true,
    //     deviceAliasCode: false,
    //     osIndexes: true,
    //     osAliasCode: false,        
    // });
    // const clientHints = new ClientHints;
    // const userAgent = JSON.stringify(req.headers['user-agent']);
    // const clientHintData = clientHints.parse(res.headers);
    // const deviceInfo = detector.detect(userAgent, clientHintData);
               
    const roles = Object.values(foundUser.roles).filter(Boolean);

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "email": foundUser.email,
                "roles": roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    );
    
    const newRefreshToken = jwt.sign(
        { "email": foundUser.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '60d' }
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

    // Creates Secure Cookie with refresh token
    res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

    // Send authorization roles and access token to user
    res.json({ roles, accessToken });

    
}

module.exports = { handleLogin };