const User = require("../model/User");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const validator = require("validator");
// const DeviceDetector = require('node-device-detector');
// const DeviceHelper   = require('node-device-detector/helper');
// const ClientHints    = require('node-device-detector/client-hints')

// login
const handleLogin = async (req, res) => {
  const { email, pwd } = req.body;
  if (!email || !pwd)
    return res
      .status(400)
      .json({ message: "Email and password are required." });

  if (email.length > 256) {
    return res
      .status(400)
      .json({ status: "failed", message: "Email is too long" });
  }

  if (!validator.isEmail(email)) {
    return res
      .status(404)
      .json({ status: "failed", message: "Email is not valid" });
  }

  const foundUser = await User.findOne({ email }).exec();
  if (!foundUser) return res.sendStatus(401); //Unauthorized

  const foundPass = foundUser.password;
  const salt = process.env.SALT;
  const peppers = ["00", "01", "10", "11"];

  const match = peppers.find((pep) => {
    return (
      crypto
        .createHash("sha512")
        .update(salt + pwd + pep)
        .digest("hex") === foundPass
    );
  });

  if (!match) return res.sendStatus(401); //Unauthorized

  //TODO: get the device info

  const roles = Object.values(foundUser.roles).filter(Boolean);

  const accessToken = jwt.sign(
    {
      UserInfo: {
        email: foundUser.email,
        roles: roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const newRefreshToken = jwt.sign(
    { email: foundUser.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "60d" }
  );

  //* in case of cookie found

  //! there could be an existing cookie if we didn't sign out but the user went back to the login page if found we do 2 things
  const cookies = req.cookies;

  let newRefreshTokenArray = !cookies?.jwt
    ? foundUser.refreshToken
    : foundUser.refreshToken.filter((rt) => rt !== cookies.jwt);

  if (cookies?.jwt) {
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
      console.log("attempted refresh token reuse at login!");
      newRefreshTokenArray = [];
    }
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  }

  foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
  const user = await foundUser.save();

  // Creates Secure Cookie with refresh token
  res.cookie("jwt", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 60 * 60 * 24 * 60, // 60 days
  });

  // Send authorization roles and access token to user
  res.json({ user: foundUser.email, roles, accessToken, name: foundUser.name });
};

module.exports = { handleLogin };
