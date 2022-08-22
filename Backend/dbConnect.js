
const mongoose = require('mongoose');

const connectDB =  () => {

try {


    mongoose.connect(process.env.DB, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });
    

    
} catch (err) {
    console.log(err)
}

}

module.exports = connectDB