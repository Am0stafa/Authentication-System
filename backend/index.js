const express = require('express')
const cors = require('cors')
const passport = require("passport");
const passportSetup = require("./passport"); //! middleware which will run directly
const cookieSession = require("cookie-session");
require('dotenv').config()
const authRoute = require('./routes/auth')

const app = express()
const PORT = 5001



//! set a cookie session
app.use(
    cookieSession({ name: "session", keys: ["abdo"], maxAge: 24 * 60 * 60 * 100 })
);

//! initialize the passport library

app.use(passport.initialize());
app.use(passport.session());

app.use(
    cors({
      origin: "http://localhost:3000",
      methods: "GET,POST,PUT,DELETE",
      credentials: true,
    })
);

app.use("/auth", authRoute);


app.listen(PORT, () => console.log(`http://localhost:${PORT}`))