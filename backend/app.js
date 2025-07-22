require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const { connectMainDB } = require("./config/config");

const authRoutes = require("./routes/auth")

const app = express()

const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, "public")))
app.use(cors())

connectMainDB()

app.use("/", authRoutes)

app.use("*", (req, res) => {
    res.status(404).json({ message: "Route not found" });
})

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})