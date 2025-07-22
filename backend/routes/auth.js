const express = require("express")
const bcrypt = require("bcrypt")
const path = require("path")
const User = require("../models/user")

const router = express.Router()

router.get("/", (req, res) => res.sendFile(path.join(__dirname, "../frontend/public", "login.html")))
router.get("/register", (req, res) => res.sendFile(path.join(__dirname, "../frontend/public", "register.html")))

router.post("/register", async (req, res) => {
    const {username, password} = req.body 

    if(!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        
        res.status(201).send('Registration successful. <a href="/">Login here</a>');
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Username already exists" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
})

router.post("/login", async (req, res) =>{
const {username, password} = req.body
if (!username || password) return res.status(400).json({
    message: "Username and password required"
})
try {
    const user = await User.findOne({ username })
    if (!user) return res.status(400).json({
        message: "Username nad password required"
    })
    const isPasswordValid = await bcrypt.compare(password, User.password)
if(!isPasswordValid) return res.status(400).json({
    message: "Invalid username or password"
})
res.redirect("/")
} catch (error) {
    res.status(500).json({
        message: "Internal server error"
    })
}
})

module.exports = router 