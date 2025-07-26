const express = require("express");
const Room = require("../models/Room");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Room:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Room ID
 *         roomNumber:
 *           type: string
 *           description: Room number/identifier
 *         floor:
 *           type: number
 *           description: Floor number (0 for ground floor)
 *         building:
 *           type: string
 *           description: Building name
 *         type:
 *           type: string
 *           enum: [Lecture Theatre, Seminar Room, Computer Lab, Physics Laboratory, Chemistry Laboratory, Assembly Hall, Library, Dean's Office, Cafeteria, IT Laboratory, Conference Room, Electronics Laboratory, Multimedia Room, Mathematics Room, Language Laboratory, Programming Department, Research Laboratory, Meeting Room, Archive, Server Room, Vice-Chancellor's Office, Council Chamber, Teaching Resource Centre, Design Studio, Study Room]
 *         capacity:
 *           type: number
 *           description: Room capacity
 *         equipment:
 *           type: string
 *           description: Available equipment
 *         currentStatus:
 *           type: string
 *           enum: [free, occupied, reserved, maintenance]
 *         schedule:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [free, occupied, reserved, maintenance]
 *               purpose:
 *                 type: string
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Get all rooms with current status
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: floor
 *         schema:
 *           type: number
 *         description: Filter by floor number
 *       - in: query
 *         name: building
 *         schema:
 *           type: string
 *         description: Filter by building
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by room type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [free, occupied, reserved, maintenance]
 *         description: Filter by current status
 *     responses:
 *       200:
 *         description: List of rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Room'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", authenticateToken, async (req, res) => {
    try {
        const { floor, building, type, status } = req.query;
        let query = {};

        // Build query filters with proper validation
        if (floor !== undefined && floor !== '') {
            const floorNumber = parseInt(floor);
            // Проверяем, что floor является валидным числом
            if (!isNaN(floorNumber)) {
                query.floor = floorNumber;
            }
        }
        
        if (building && building.trim() !== '') {
            query.building = building;
        }
        
        if (type && type.trim() !== '') {
            query.type = type;
        }
        
        if (status && ['free', 'occupied', 'reserved', 'maintenance'].includes(status)) {
            query.currentStatus = status;
        }

        const rooms = await Room.find(query)
            .populate('updatedBy', 'firstName lastName username')
            .sort({ floor: 1, roomNumber: 1 });

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

/**
 * @swagger
 * /api/rooms/{roomNumber}:
 *   get:
 *     summary: Get specific room details
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Room number
 *     responses:
 *       200:
 *         description: Room details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       404:
 *         description: Room not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/rooms/{roomNumber}/schedule:
 *   get:
 *     summary: Get room schedule for specific date
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Room number
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in YYYY-MM-DD format
 *     responses:
 *       200:
 *         description: Room schedule
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 roomNumber:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date
 *                 schedule:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Room not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
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
router.post("/admin", async (req, res) => {
    try {
        const { roomNumber, floor, building, type, capacity, equipment } = req.body;

        // Validation
        if (!roomNumber || floor === undefined || !type || capacity === undefined || !equipment) {
            return res.status(400).json({
                message: "All fields are required: roomNumber, floor, type, capacity, equipment"
            });
        }

        // Валидация числовых значений
        const floorNumber = parseInt(floor);
        const capacityNumber = parseInt(capacity);

        if (isNaN(floorNumber) || floorNumber < 0 || floorNumber > 10) {
            return res.status(400).json({
                message: "Floor must be a valid number between 0 and 10"
            });
        }

        if (isNaN(capacityNumber) || capacityNumber < 0) {
            return res.status(400).json({
                message: "Capacity must be a valid positive number"
            });
        }

        // Check if room already exists
        const existingRoom = await Room.findOne({ roomNumber });
        if (existingRoom) {
            return res.status(400).json({ message: "Room with this number already exists" });
        }

        const newRoom = new Room({
            roomNumber: roomNumber.trim(),
            floor: floorNumber,
            building: building?.trim() || 'Main Building',
            type: type.trim(),
            capacity: capacityNumber,
            equipment: equipment.trim(),
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

/**
 * @swagger
 * /api/rooms/admin/{roomNumber}/status:
 *   patch:
 *     summary: Update room status (Admin only)
 *     tags: [Rooms - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Room number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [free, occupied, reserved, maintenance]
 *               startTime:
 *                 type: string
 *                 description: Start time for scheduled update (HH:MM)
 *               endTime:
 *                 type: string
 *                 description: End time for scheduled update (HH:MM)
 *               purpose:
 *                 type: string
 *                 description: Purpose of reservation
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Room status updated successfully
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Room not found
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/rooms/admin/bulk-update:
 *   patch:
 *     summary: Bulk update room statuses (Admin only)
 *     tags: [Rooms - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               updates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     roomNumber:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [free, occupied, reserved, maintenance]
 *                     startTime:
 *                       type: string
 *                     endTime:
 *                       type: string
 *                     purpose:
 *                       type: string
 *     responses:
 *       200:
 *         description: Bulk update completed
 *       400:
 *         description: Invalid request format
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
router.patch("/admin/bulk-update", async (req, res) => {
    try {
        const { updates } = req.body;

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

/**
 * @swagger
 * /api/rooms/admin:
 *   post:
 *     summary: Create new room (Admin only)
 *     tags: [Rooms - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomNumber:
 *                 type: string
 *               floor:
 *                 type: number
 *               building:
 *                 type: string
 *               type:
 *                 type: string
 *               capacity:
 *                 type: number
 *               equipment:
 *                 type: string
 *             required:
 *               - roomNumber
 *               - floor
 *               - type
 *               - capacity
 *               - equipment
 *     responses:
 *       201:
 *         description: Room created successfully
 *       400:
 *         description: Invalid input or room already exists
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
router.post("/admin", async (req, res) => {
    try {
        const { roomNumber, floor, building, type, capacity, equipment } = req.body;

        // Validation
        if (!roomNumber || floor === undefined || !type || capacity === undefined || !equipment) {
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
            building: building || 'Main Building',
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

/**
 * @swagger
 * /api/rooms/admin/{roomNumber}:
 *   put:
 *     summary: Update room details (Admin only)
 *     tags: [Rooms - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomNumber
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               capacity:
 *                 type: number
 *               equipment:
 *                 type: string
 *               building:
 *                 type: string
 *     responses:
 *       200:
 *         description: Room updated successfully
 *       404:
 *         description: Room not found
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete room (Admin only)
 *     tags: [Rooms - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room deleted successfully
 *       404:
 *         description: Room not found
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
router.put("/admin/:roomNumber", async (req, res) => {
    try {
        const { type, capacity, equipment, building } = req.body;

        const room = await Room.findOne({ roomNumber: req.params.roomNumber });
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        if (type) room.type = type;
        if (capacity !== undefined) room.capacity = parseInt(capacity);
        if (equipment) room.equipment = equipment;
        if (building) room.building = building;
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

/**
 * @swagger
 * /api/rooms/admin/stats:
 *   get:
 *     summary: Get room statistics (Admin only)
 *     tags: [Rooms - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Room statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                 free:
 *                   type: number
 *                 occupied:
 *                   type: number
 *                 reserved:
 *                   type: number
 *                 maintenance:
 *                   type: number
 *                 byFloor:
 *                   type: object
 *                 byType:
 *                   type: object
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
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

        const roomsByBuilding = await Room.aggregate([
            { $group: { _id: "$building", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            total: totalRooms,
            free: freeRooms,
            occupied: occupiedRooms,
            reserved: reservedRooms,
            maintenance: maintenanceRooms,
            byFloor: roomsByFloor.reduce((acc, item) => {
                const floorName = item._id === 0 ? 'Ground Floor' : `Floor ${item._id}`;
                acc[floorName] = item.count;
                return acc;
            }, {}),
            byType: roomsByType.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            byBuilding: roomsByBuilding.reduce((acc, item) => {
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