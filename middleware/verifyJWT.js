const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    //! here we verify the access token
    const auth = req.headers['authorization']
    if (!auth) return res.sendStatus(401);
    console.log(auth) // bearer token
    const token = auth.split(' ')[1]
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, 
        (err, decoded) => {
            if (err) return res.sendStatus(403); //invalid token
            req.user = decoded.username;
            next();
    })
    
}
module.exports = {verifyJWT}