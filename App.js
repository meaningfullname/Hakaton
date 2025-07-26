const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");

const roomRoutes = require("./routes/rooms"); // New room routes

// Import socket setup
const setupRoomSocket = require("./socket/roomSocket");

// Import models
const Room = require("./models/room");

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Make io available in routes
app.locals.io = io;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files (your HTML frontend)
app.use(express.static('public'));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/rooms", roomRoutes); // New room routes

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        services: {
            database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            socket: 'active'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/student_system", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
        console.log("Connected to MongoDB");

        // Initialize default rooms if none exist
        await Room.initializeDefaultRooms();
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    });

// Setup Socket.IO for rooms
setupRoomSocket(io);

// Server startup
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.IO server ready for real-time room updates`);
});