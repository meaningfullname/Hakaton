const express = require("express");
const Room = require("../models/room");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// Get all rooms with current status (accessible to all authenticated users)
router.get("/", authenticateToken, async (req, res) => {
    try {
        const { floor } = req.query;
        let rooms;

        if (floor) {
            rooms = await Room.getRoomsByFloor(parseInt(floor));
        } else {
            rooms = await Room.find({})
                .populate('updatedBy', 'firstName lastName username')
                .sort({ floor: 1, roomNumber: 1 });
        }

        // Update current status based on time for each room
        const updatedRooms = rooms.map(room => {
            const roomObj = room.toObject();
            roomObj.currentStatus = room.getCurrentStatus();
            return roomObj;
        });

        res.json(updatedRooms);
    } catch (error) {
        console.error("Error fetching rooms:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get specific room details
router.get("/:roomNumber", authenticateToken, async (req, res) => {
    try {
        const room = await Room.findOne({ roomNumber: req.params.roomNumber })
            .populate('updatedBy', 'firstName lastName username')
            .populate('schedule.reservedBy', 'firstName lastName username');

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        const roomData = room.toObject();
        roomData.currentStatus = room.getCurrentStatus();

        res.json(roomData);
    } catch (error) {
        console.error("Error fetching room:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get room schedule for specific date
router.get("/:roomNumber/schedule", authenticateToken, async (req, res) => {
    try {
        const { date } = req.query; // Format: YYYY-MM-DD
        const room = await Room.findOne({ roomNumber: req.params.roomNumber })
            .populate('schedule.reservedBy', 'firstName lastName username');

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // For now, return today's schedule. In a real app, you'd filter by date
        res.json({
            roomNumber: room.roomNumber,
            date: date || new Date().toISOString().split('T')[0],
            schedule: room.schedule
        });
    } catch (error) {
        console.error("Error fetching room schedule:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// === ADMIN ROUTES ===
router.use("/admin", authenticateToken, authorizeRoles("admin"));

// Admin: Update room status (immediate or scheduled)
router.patch("/admin/:roomNumber/status", async (req, res) => {
    try {
        const { status, startTime, endTime, purpose } = req.body;

        if (!['free', 'occupied', 'reserved', 'maintenance'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const room = await Room.findOne({ roomNumber: req.params.roomNumber });
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        if (startTime && endTime) {
            // Update specific time slot
            room.updateTimeSlot(startTime, endTime, status, req.user._id, purpose);
        } else {
            // Update current status immediately
            room.currentStatus = status;
            room.lastUpdated = new Date();
            room.updatedBy = req.user._id;
        }

        await room.save();

        // Emit socket event for real-time updates
        if (req.app.locals.io) {
            req.app.locals.io.emit('roomStatusUpdate', {
                roomNumber: room.roomNumber,
                status: room.getCurrentStatus(),
                lastUpdated: room.lastUpdated,
                updatedBy: {
                    name: `${req.user.firstName} ${req.user.lastName}`,
                    username: req.user.username
                }
            });
        }

        res.json({
            message: "Room status updated successfully",
            room: {
                roomNumber: room.roomNumber,
                currentStatus: room.getCurrentStatus(),
                lastUpdated: room.lastUpdated
            }
        });
    } catch (error) {
        console.error("Error updating room status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Admin: Bulk update room statuses
router.patch("/admin/bulk-update", async (req, res) => {
    try {
        const { updates } = req.body; // Array of { roomNumber, status, startTime?, endTime?, purpose? }

        if (!Array.isArray(updates)) {
            return res.status(400).json({ message: "Updates must be an array" });
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
                    room.updateTimeSlot(startTime, endTime, status, req.user._id, purpose);
                } else {
                    room.currentStatus = status;
                    room.lastUpdated = new Date();
                    room.updatedBy = req.user._id;
                }

                await room.save();
                results.push({ roomNumber, status: room.getCurrentStatus() });

                // Emit socket event
                if (req.app.locals.io) {
                    req.app.locals.io.emit('roomStatusUpdate', {
                        roomNumber: room.roomNumber,
                        status: room.getCurrentStatus(),
                        lastUpdated: room.lastUpdated,
                        updatedBy: {
                            name: `${req.user.firstName} ${req.user.lastName}`,
                            username: req.user.username
                        }
                    });
                }
            } catch (err) {
                errors.push({ roomNumber: update.roomNumber, error: err.message });
            }
        }

        res.json({
            message: `Bulk update completed. ${results.length} successful, ${errors.length} failed.`,
            successful: results,
            errors
        });
    } catch (error) {
        console.error("Error in bulk update:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Admin: Create new room
router.post("/admin", async (req, res) => {
    try {
        const { roomNumber, floor, type, capacity, equipment } = req.body;

        // Validation
        if (!roomNumber || !floor || !type || capacity === undefined || !equipment) {
            return res.status(400).json({
                message: "All fields are required: roomNumber, floor, type, capacity, equipment"
            });
        }

        // Check if room already exists
        const existingRoom = await Room.findOne({ roomNumber });
        if (existingRoom) {
            return res.status(400).json({ message: "Room with this number already exists" });
        }

        const newRoom = new Room({
            roomNumber,
            floor: parseInt(floor),
            type,
            capacity: parseInt(capacity),
            equipment,
            updatedBy: req.user._id
        });

        await newRoom.save();

        // Emit socket event
        if (req.app.locals.io) {
            req.app.locals.io.emit('roomCreated', {
                room: newRoom,
                createdBy: {
                    name: `${req.user.firstName} ${req.user.lastName}`,
                    username: req.user.username
                }
            });
        }

        res.status(201).json({
            message: "Room created successfully",
            room: newRoom
        });
    } catch (error) {
        console.error("Error creating room:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Admin: Update room details
router.put("/admin/:roomNumber", async (req, res) => {
    try {
        const { type, capacity, equipment } = req.body;

        const room = await Room.findOne({ roomNumber: req.params.roomNumber });
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        if (type) room.type = type;
        if (capacity !== undefined) room.capacity = parseInt(capacity);
        if (equipment) room.equipment = equipment;
        room.updatedBy = req.user._id;
        room.lastUpdated = new Date();

        await room.save();

        res.json({
            message: "Room updated successfully",
            room
        });
    } catch (error) {
        console.error("Error updating room:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Admin: Delete room
router.delete("/admin/:roomNumber", async (req, res) => {
    try {
        const room = await Room.findOne({ roomNumber: req.params.roomNumber });
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        await Room.deleteOne({ roomNumber: req.params.roomNumber });

        // Emit socket event
        if (req.app.locals.io) {
            req.app.locals.io.emit('roomDeleted', {
                roomNumber: req.params.roomNumber,
                deletedBy: {
                    name: `${req.user.firstName} ${req.user.lastName}`,
                    username: req.user.username
                }
            });
        }

        res.json({ message: "Room deleted successfully" });
    } catch (error) {
        console.error("Error deleting room:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Admin: Get room statistics
router.get("/admin/stats", async (req, res) => {
    try {
        const totalRooms = await Room.countDocuments();
        const freeRooms = await Room.countDocuments({ currentStatus: 'free' });
        const occupiedRooms = await Room.countDocuments({ currentStatus: 'occupied' });
        const reservedRooms = await Room.countDocuments({ currentStatus: 'reserved' });
        const maintenanceRooms = await Room.countDocuments({ currentStatus: 'maintenance' });

        const roomsByFloor = await Room.aggregate([
            { $group: { _id: "$floor", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const roomsByType = await Room.aggregate([
            { $group: { _id: "$type", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            total: totalRooms,
            free: freeRooms,
            occupied: occupiedRooms,
            reserved: reservedRooms,
            maintenance: maintenanceRooms,
            byFloor: roomsByFloor.reduce((acc, item) => {
                acc[`Floor ${item._id}`] = item.count;
                return acc;
            }, {}),
            byType: roomsByType.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {})
        });
    } catch (error) {
        console.error("Error fetching room stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;