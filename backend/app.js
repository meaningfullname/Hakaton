require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { connectMainDB } = require("./config/config");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const todoRoutes = require("./routes/todos");
const roomRoutes = require("./routes/rooms");

const app = express();

const PORT = process.env.PORT || 3000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Campus Management API",
      version: "1.0.0",
      description: "A comprehensive campus management system with authentication, student management, todo functionality, and room management",
    },
    servers: [
      {
        url: `http://0.0.0.0:${PORT}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration for development
app.use(cors({
  origin: ["http://0.0.0.0:5173", "http://0.0.0.0:5173"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Swagger UI - accessible at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Database connection and room initialization
connectMainDB().then(async () => {
  // Initialize default rooms if none exist
  const Room = require("./models/Room");
  await Room.initializeDefaultRooms();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/rooms", roomRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    service: "Campus Management API"
  });
});

// Development mode - API only, frontend is served by Vite
app.get("/", (req, res) => {
  res.json({ 
    message: "Campus Management API is running",
    docs: `http://localhost:${PORT}/api-docs`,
    frontend: "http://localhost:5173",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users", 
      admin: "/api/admin",
      todos: "/api/todos",
      rooms: "/api/rooms"
    }
  });
});

// Handle API 404s
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong!",
    ...(isDevelopment && { stack: err.stack })
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Backend API running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`⚛️  Frontend (Vite): http://localhost:5173`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏢 Room management: /api/rooms`);
});