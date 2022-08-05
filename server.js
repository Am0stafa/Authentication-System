const express = require('express');
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const dotenv = require('dotenv').config()

const app = express();
const PORT = process.env.PORT || 3500;

//? custom middleware logger
app.use(logger);

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

app.use('/employees', require('./routes/api/employees'));

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


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));