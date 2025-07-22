const express = require("express")
const bcrypt = require("bcrypt")
const path = require("path")
const User = require("../models/User")

const router = express.Router()

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