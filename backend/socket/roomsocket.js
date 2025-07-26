const Room = require("../models/room");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication error"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");

        if (!user || !user.isActive) {
            return next(new Error("User not found or inactive"));
        }

        socket.user = user;
        next();
    } catch (error) {
        next(new Error("Authentication error"));
    }
};

const setupRoomSocket = (io) => {
    // Apply authentication middleware
    io.use(authenticateSocket);

    io.on("connection", (socket) => {
        console.log(`User ${socket.user.username} connected to room system`);

        // Join room for real-time updates
        socket.join("room-updates");

        // Send current user info
        socket.emit("userConnected", {
            userId: socket.user._id,
            username: socket.user.username,
            role: socket.user.role,
            name: `${socket.user.firstName} ${socket.user.lastName}`
        });

        // Handle room status requests
        socket.on("getRoomStatus", async (roomNumber) => {
            try {
                const room = await Room.findOne({ roomNumber })
                    .populate('updatedBy', 'firstName lastName username');

                if (room) {
                    socket.emit("roomStatus", {
                        roomNumber: room.roomNumber,
                        status: room.getCurrentStatus(),
                        lastUpdated: room.lastUpdated,
                        updatedBy: room.updatedBy
                    });
                } else {
                    socket.emit("error", { message: "Room not found" });
                }
            } catch (error) {
                console.error("Error fetching room status:", error);
                socket.emit("error", { message: "Error fetching room status" });
            }
        });

        // Handle real-time room status updates (admin only)
        socket.on("updateRoomStatus", async (data) => {
            try {
                if (socket.user.role !== "admin") {
                    socket.emit("error", { message: "Unauthorized - Admin access required" });
                    return;
                }

                const { roomNumber, status, startTime, endTime, purpose } = data;

                if (!['free', 'occupied', 'reserved', 'maintenance'].includes(status)) {
                    socket.emit("error", { message: "Invalid status" });
                    return;
                }

                const room = await Room.findOne({ roomNumber });
                if (!room) {
                    socket.emit("error", { message: "Room not found" });
                    return;
                }

                if (startTime && endTime) {
                    room.updateTimeSlot(startTime, endTime, status, socket.user._id, purpose);
                } else {
                    room.currentStatus = status;
                    room.lastUpdated = new Date();
                    room.updatedBy = socket.user._id;
                }

                await room.save();

                // Broadcast to all connected clients
                io.to("room-updates").emit("roomStatusUpdate", {
                    roomNumber: room.roomNumber,
                    status: room.getCurrentStatus(),
                    lastUpdated: room.lastUpdated,
                    updatedBy: {
                        name: `${socket.user.firstName} ${socket.user.lastName}`,
                        username: socket.user.username
                    }
                });

                // Confirm to the admin who made the change
                socket.emit("updateConfirmed", {
                    roomNumber,
                    status: room.getCurrentStatus()
                });

            } catch (error) {
                console.error("Error updating room status via socket:", error);
                socket.emit("error", { message: "Error updating room status" });
            }
        });

        // Handle bulk status updates (admin only)
        socket.on("bulkUpdateRoomStatus", async (updates) => {
            try {
                if (socket.user.role !== "admin") {
                    socket.emit("error", { message: "Unauthorized - Admin access required" });
                    return;
                }

                const results = [];
                const errors = [];

                for (const update of updates) {
                    try {
                        const { roomNumber, status, startTime, endTime, purpose } = update;

                        const room = await Room.findOne({ roomNumber });
                        if (!room) {
                            errors.push({ roomNumber, error: "Room not found" });
                            continue;
                        }

                        if (startTime && endTime) {
                            room.updateTimeSlot(startTime, endTime, status, socket.user._id, purpose);
                        } else {
                            room.currentStatus = status;
                            room.lastUpdated = new Date();
                            room.updatedBy = socket.user._id;
                        }

                        await room.save();
                        results.push({ roomNumber, status: room.getCurrentStatus() });

                        // Broadcast individual room update
                        io.to("room-updates").emit("roomStatusUpdate", {
                            roomNumber: room.roomNumber,
                            status: room.getCurrentStatus(),
                            lastUpdated: room.lastUpdated,
                            updatedBy: {
                                name: `${socket.user.firstName} ${socket.user.lastName}`,
                                username: socket.user.username
                            }
                        });

                    } catch (err) {
                        errors.push({ roomNumber: update.roomNumber, error: err.message });
                    }
                }

                socket.emit("bulkUpdateCompleted", { results, errors });

            } catch (error) {
                console.error("Error in bulk update via socket:", error);
                socket.emit("error", { message: "Error in bulk update" });
            }
        });

        // Handle joining specific floor updates
        socket.on("joinFloor", (floorNumber) => {
            socket.join(`floor-${floorNumber}`);
            socket.emit("floorJoined", { floor: floorNumber });
        });

        // Handle leaving floor updates
        socket.on("leaveFloor", (floorNumber) => {
            socket.leave(`floor-${floorNumber}`);
            socket.emit("floorLeft", { floor: floorNumber });
        });

        // Handle disconnect
        socket.on("disconnect", () => {
            console.log(`User ${socket.user.username} disconnected from room system`);
        });

        // Send periodic status updates every 30 seconds
        const statusInterval = setInterval(async () => {
            try {
                const rooms = await Room.find({}).select('roomNumber currentStatus lastUpdated');
                const roomStatuses = rooms.map(room => ({
                    roomNumber: room.roomNumber,
                    status: room.getCurrentStatus(),
                    lastUpdated: room.lastUpdated
                }));

                socket.emit("periodicStatusUpdate", roomStatuses);
            } catch (error) {
                console.error("Error in periodic status update:", error);
            }
        }, 30000);

        // Clear interval on disconnect
        socket.on("disconnect", () => {
            clearInterval(statusInterval);
        });
    });

    // Function to simulate random status changes (for demo purposes)
    const simulateStatusChanges = () => {
        setInterval(async () => {
            try {
                const rooms = await Room.find({ currentStatus: { $ne: 'maintenance' } });
                if (rooms.length === 0) return;

                const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
                const statuses = ['free', 'occupied', 'reserved'];
                const newStatus = statuses[Math.floor(Math.random() * statuses.length)];

                randomRoom.currentStatus = newStatus;
                randomRoom.lastUpdated = new Date();
                await randomRoom.save();

                // Broadcast the change
                io.to("room-updates").emit("roomStatusUpdate", {
                    roomNumber: randomRoom.roomNumber,
                    status: newStatus,
                    lastUpdated: randomRoom.lastUpdated,
                    updatedBy: {
                        name: "System",
                        username: "system"
                    },
                    isAutoUpdate: true
                });

            } catch (error) {
                console.error("Error in status simulation:", error);
            }
        }, 10000); // Every 10 seconds
    };

    // Start simulation (comment out in production)
    // simulateStatusChanges();
};

module.exports = setupRoomSocket;