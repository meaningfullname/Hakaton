require("dotenv").config()
const mongoose = require("mongoose")

const connectMainDB = async() => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/auth_system", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log("Connected to MongoDB")
    } catch(error) {
        console.error("MongoDB Main connection eror:", error)
        process.exit(1)
    }
}

module.exports = {
    connectMainDB
}