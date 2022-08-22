require("dotenv").config();
const cors = require("cors");
const db = require("./dbConnect")
const express = require('express')
const mongoose = require('mongoose');
const app = express()
const PORT = process.env.PORT ||  5001
const userRoutes= require('./routes/users')
const authRoutes = require('./routes/auth')

db();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors())


// routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);


mongoose.connection.on('open',() => {
    console.log("Connected to database successfully");
    app.listen(PORT,() => {console.log(`http://localhost:${PORT}/`)})
})