const express = require('express');
require('dotenv').config();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser')
const credentials = require('./middleware/credentials')
const connectDB = require('./config/dbConnect')
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3500;


//! connect to db
connectDB()


//? custom middleware logger
app.use(logger);
app.use(cookieParser());



// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);
// Cross Origin Resource Sharing
app.use(cors(corsOptions));

//? built-in middleware to handle urlencoded form data
//? this middleware is for handling url encoded data such as form data
app.use(express.urlencoded({ extended: false }));

//? built-in middleware for json 
app.use(express.json());

//? serve static files
//? this is important to make files available to the public to us css and img
app.use('/', express.static(path.join(__dirname, '/public')));

//? routes
app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/logout', require('./routes/logout'));
app.use('/refresh', require('./routes/refresh'))
app.use('/employees', require('./routes/api/employees'));//! to be deleted
app.use('/users', require('./routes/api/users'));


app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

app.use(errorHandler);

//! app.use vs app.all: app.use() doesn't accept regex and will be likely used by middleware.. app.all() is used for routing as it is applied to all http methods and it accepts regex


mongoose.connection.on('open',() => {
    app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
})
