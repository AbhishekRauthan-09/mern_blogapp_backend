const mongoose = require('mongoose');
const conn = mongoose.connect(process.env.URL).then(()=>{
    console.log("Database connection established")
}).catch(err => console.log("Error connecting to Database"+err))

module.exports =conn;

