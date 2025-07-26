const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema({
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['free', 'occupied', 'reserved', 'maintenance'],
        default: 'free'
    },
    reservedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    purpose: {
        type: String,
        default: ''
    }
});

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true
    },
    floor: {
        type: Number,
        required: true,
        min: 0,
        max: 10
    },
    building: {
        type: String,
        required: true,
        default: 'Main Building'
    },
    type: {
        type: String,
        required: true,
        enum: [
            'Lecture Theatre',
            'Seminar Room',
            'Computer Lab',
            'Physics Laboratory',
            'Chemistry Laboratory',
            'Assembly Hall',
            'Library',
            'Dean\'s Office',
            'Cafeteria',
            'IT Laboratory',
            'Conference Room',
            'Electronics Laboratory',
            'Multimedia Room',
            'Mathematics Room',
            'Language Laboratory',
            'Programming Department',
            'Research Laboratory',
            'Meeting Room',
            'Archive',
            'Server Room',
            'Vice-Chancellor\'s Office',
            'Council Chamber',
            'Teaching Resource Centre',
            'Design Studio',
            'Study Room'
        ]
    },
    capacity: {
        type: Number,
        required: true,
        min: 0
    },
    equipment: {
        type: String,
        required: true
    },
    currentStatus: {
        type: String,
        enum: ['free', 'occupied', 'reserved', 'maintenance'],
        default: 'free'
    },
    // Daily schedule - array of time slots
    schedule: [timeSlotSchema],
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Method to get current time slot status
roomSchema.methods.getCurrentStatus = function() {
    const now = new Date();
    const currentTime = now.toTimeString().substring(0, 5); // HH:MM format

    // Find the time slot that contains current time
    const currentSlot = this.schedule.find(slot => {
        return currentTime >= slot.startTime && currentTime <= slot.endTime;
    });

    return currentSlot ? currentSlot.status : this.currentStatus;
};

// Method to update room status for specific time
roomSchema.methods.updateTimeSlot = function(startTime, endTime, status, userId, purpose = '') {
    const existingSlot = this.schedule.find(slot =>
        slot.startTime === startTime && slot.endTime === endTime
    );

    if (existingSlot) {
        existingSlot.status = status;
        existingSlot.reservedBy = status === 'reserved' ? userId : null;
        existingSlot.purpose = purpose;
    } else {
        this.schedule.push({
            startTime,
            endTime,
            status,
            reservedBy: status === 'reserved' ? userId : null,
            purpose
        });
    }

    this.lastUpdated = new Date();
    this.updatedBy = userId;

    // Update current status if the time slot is current
    const now = new Date();
    const currentTime = now.toTimeString().substring(0, 5);
    if (currentTime >= startTime && currentTime <= endTime) {
        this.currentStatus = status;
    }
};

// Static method to get rooms by floor
roomSchema.statics.getRoomsByFloor = function(floor) {
    return this.find({ floor })
        .populate('updatedBy', 'firstName lastName username')
        .sort({ roomNumber: 1 });
};

// Static method to initialize default rooms for UK university
roomSchema.statics.initializeDefaultRooms = async function() {
    const defaultRooms = [
        // Ground Floor
        { roomNumber: 'G01', floor: 0, building: 'Main Building', type: 'Lecture Theatre', capacity: 200, equipment: 'Projector, microphone system, tiered seating' },
        { roomNumber: 'G02', floor: 0, building: 'Main Building', type: 'Assembly Hall', capacity: 300, equipment: 'Stage, sound system, lighting' },
        { roomNumber: 'G03', floor: 0, building: 'Main Building', type: 'Cafeteria', capacity: 150, equipment: 'Kitchen facilities, dining tables' },
        { roomNumber: 'G04', floor: 0, building: 'Main Building', type: 'Library', capacity: 100, equipment: 'Reading areas, computer terminals' },
        { roomNumber: 'G05', floor: 0, building: 'Main Building', type: 'Computer Lab', capacity: 30, equipment: '30 PCs, projector, network access' },

        // First Floor
        { roomNumber: '101', floor: 1, building: 'Main Building', type: 'Lecture Theatre', capacity: 120, equipment: 'Interactive whiteboard, projector, audio system' },
        { roomNumber: '102', floor: 1, building: 'Main Building', type: 'Seminar Room', capacity: 25, equipment: 'Modular tables, whiteboard' },
        { roomNumber: '103', floor: 1, building: 'Main Building', type: 'Computer Lab', capacity: 25, equipment: '25 workstations, software suite' },
        { roomNumber: '104', floor: 1, building: 'Main Building', type: 'Physics Laboratory', capacity: 20, equipment: 'Laboratory benches, scientific equipment' },
        { roomNumber: '105', floor: 1, building: 'Main Building', type: 'Chemistry Laboratory', capacity: 24, equipment: 'Fume cupboards, safety equipment' },
        { roomNumber: '106', floor: 1, building: 'Main Building', type: 'Study Room', capacity: 12, equipment: 'Study desks, quiet environment' },

        // Second Floor
        { roomNumber: '201', floor: 2, building: 'Main Building', type: 'Lecture Theatre', capacity: 80, equipment: 'Smart board, video conferencing' },
        { roomNumber: '202', floor: 2, building: 'Main Building', type: 'Seminar Room', capacity: 20, equipment: 'Flexible seating, presentation screen' },
        { roomNumber: '203', floor: 2, building: 'Main Building', type: 'IT Laboratory', capacity: 18, equipment: 'High-spec computers, development software' },
        { roomNumber: '204', floor: 2, building: 'Main Building', type: 'Conference Room', capacity: 16, equipment: 'Video conferencing, presentation facilities' },
        { roomNumber: '205', floor: 2, building: 'Main Building', type: 'Language Laboratory', capacity: 24, equipment: 'Audio equipment, language software' },
        { roomNumber: '206', floor: 2, building: 'Main Building', type: 'Multimedia Room', capacity: 30, equipment: 'Interactive displays, media equipment' },

        // Third Floor
        { roomNumber: '301', floor: 3, building: 'Main Building', type: 'Research Laboratory', capacity: 15, equipment: 'Specialized research equipment' },
        { roomNumber: '302', floor: 3, building: 'Main Building', type: 'Programming Department', capacity: 10, equipment: 'Faculty offices, meeting space' },
        { roomNumber: '303', floor: 3, building: 'Main Building', type: 'Meeting Room', capacity: 8, equipment: 'Conference table, video link' },
        { roomNumber: '304', floor: 3, building: 'Main Building', type: 'Dean\'s Office', capacity: 6, equipment: 'Executive office, reception area' },
        { roomNumber: '305', floor: 3, building: 'Main Building', type: 'Server Room', capacity: 0, equipment: 'IT infrastructure, climate control' },
        { roomNumber: '306', floor: 3, building: 'Main Building', type: 'Vice-Chancellor\'s Office', capacity: 8, equipment: 'Executive suite, meeting area' },
        { roomNumber: '307', floor: 3, building: 'Main Building', type: 'Council Chamber', capacity: 40, equipment: 'Formal meeting setup, recording facilities' },
        { roomNumber: '308', floor: 3, building: 'Main Building', type: 'Teaching Resource Centre', capacity: 20, equipment: 'Educational materials, printing facilities' },
        { roomNumber: '309', floor: 3, building: 'Main Building', type: 'Design Studio', capacity: 25, equipment: 'Drawing tables, design software' }
    ];

    try {
        const existingRooms = await this.countDocuments();
        if (existingRooms === 0) {
            await this.insertMany(defaultRooms);
            console.log('✅ Default rooms initialized successfully for UK university');
        }
    } catch (error) {
        console.error('❌ Error initializing default rooms:', error);
    }
};

module.exports = mongoose.model("Room", roomSchema);