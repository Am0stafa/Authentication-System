const User = require('../model/User');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
// const DeviceDetector = require('node-device-detector');
// const DeviceHelper   = require('node-device-detector/helper');
// const ClientHints    = require('node-device-detector/client-hints')



const handleLogin = async (req, res) => {

    const { email, pwd } = req.body;
    if (!email || !pwd) return res.status(400).json({ 'message': 'Email and password are required.' });
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(email))
        return res.status(404).json({"status": "failed",message:"email is not valid"});

    const foundUser = await User.findOne({ email }).exec();
    if (!foundUser) return res.sendStatus(401); //Unauthorized
        
    const foundPass = foundUser.password
    const salt = process.env.SALT
    const peppers = ["00","01","10","11"];
    
    const match = peppers.find((pep) => {
        return (crypto.createHash('sha512').update(salt+pwd+pep).digest('hex') === foundPass)
    })

    
    if (!match) return res.sendStatus(401); //Unauthorized
    
    //TODO: get the device info
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
        { expiresIn: '10s' }
    );
    
    const newRefreshToken = jwt.sign(
        { "email": foundUser.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '60d' }
    );
    
    //* in case of cookie found
    
   //! there could be an existing cookie if we didn't sign out but the user went back to the login page if found we do 2 things 
    const cookies = req.cookies;

    //! 1) if we dont have any cookie with the jwt  we just get the cookies array from the db and if there is we will filter it from the array
    let newRefreshTokenArray = !cookies?.jwt ? foundUser.refreshToken : foundUser.refreshToken.filter(rt => rt !== cookies.jwt);
    
    //! 2) if we have an old cookie we need to remove it
    if(cookies?.jwt){
        /* 
        Scenario added here: 
            1) User logs in but never uses RT and does not logout 
            2) RT is stolen and used by the hacker
            3) If 1 & 2, reuse detection is needed to clear all RTs when user logs in
        */
        const refreshToken = cookies.jwt;
        const foundToken = await User.findOne({ refreshToken }).exec();
        
        //! if we dont find the token we know that its already had been used then because our user would not have used that token to it should be in the array even if it is expired. However, if they have not used there token but it isn't in there then we know somebody else had used it
        if (!foundToken) { 
            console.log('attempted refresh token reuse at login!')
            newRefreshTokenArray = [];
        }
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });        
    }
    
    
    
    // Saving refreshToken with current user
    foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    const user = await foundUser.save();

    // Creates Secure Cookie with refresh token
    res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

    // Send authorization roles and access token to user
    res.json({ user:foundUser.email , roles, accessToken, name:foundUser.name });

    
}

const handleSocialLogin = async (req, res) => {
    const {displayName , email , photoURL, token} = req.body;
    if (!email || !token) return res.status(400).json({ 'message': 'invalid request' });

    //TODO: verify token that we got from firebase
    
    
    let user = await User.findOne({ email }).exec();  
    if (!user) {
        user = new User({
            email,
            name:displayName,
            "password":crypto.createHash('sha512').update(process.env.SALT+token).digest('hex'),
            profilePic:photoURL
        });
    }

    const roles = Object.values(user.roles).filter(Boolean);
    
    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "email": foundUser.email,
                "roles": roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '10s' }
    );
    
    const newRefreshToken = jwt.sign(
        { "email": foundUser.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '60d' }
    );
    
    const cookies = req.cookies;

    let newRefreshTokenArray = !cookies?.jwt ? user.refreshToken : user.refreshToken.filter(rt => rt !== cookies.jwt);
    
    if(cookies?.jwt){
        const refreshToken = cookies.jwt;
        const foundToken = await User.findOne({ refreshToken }).exec();
        if (!foundToken) { 
            console.log('attempted refresh token reuse at login!')
            newRefreshTokenArray = [];
        }
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });        
    }
    
    
    user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    await user.save();

    res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });


    res.json({ user:foundUser.email , roles, accessToken, name:foundUser.name });

}

module.exports = { handleLogin };