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
        min: 1,
        max: 10
    },
    type: {
        type: String,
        required: true,
        enum: [
            'Лекционная аудитория',
            'Семинарская аудитория',
            'Компьютерный класс',
            'Лаборатория физики',
            'Химическая лаборатория',
            'Актовый зал',
            'Библиотека',
            'Кабинет декана',
            'Столовая',
            'Лаборатория ИТ',
            'Конференц-зал',
            'Лаборатория электроники',
            'Мультимедийная аудитория',
            'Кабинет математики',
            'Языковая лаборатория',
            'Кафедра программирования',
            'Исследовательская лаборатория',
            'Переговорная',
            'Архив',
            'Серверная',
            'Кабинет ректора',
            'Зал заседаний',
            'Методический кабинет',
            'Аудитория курсового проектирования'
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

// Static method to initialize default rooms
roomSchema.statics.initializeDefaultRooms = async function() {
    const defaultRooms = [
        // Floor 1
        { roomNumber: '101', floor: 1, type: 'Лекционная аудитория', capacity: 80, equipment: 'Проектор, доска, кондиционер' },
        { roomNumber: '102', floor: 1, type: 'Семинарская аудитория', capacity: 40, equipment: 'Доска, столы' },
        { roomNumber: '103', floor: 1, type: 'Компьютерный класс', capacity: 25, equipment: '25 ПК, проектор' },
        { roomNumber: '104', floor: 1, type: 'Лаборатория физики', capacity: 30, equipment: 'Лабораторное оборудование' },
        { roomNumber: '105', floor: 1, type: 'Химическая лаборатория', capacity: 35, equipment: 'Вытяжки, реактивы' },
        { roomNumber: '106', floor: 1, type: 'Актовый зал', capacity: 200, equipment: 'Сцена, звуковая система' },
        { roomNumber: '107', floor: 1, type: 'Библиотека', capacity: 50, equipment: 'Читальный зал' },
        { roomNumber: '108', floor: 1, type: 'Кабинет декана', capacity: 10, equipment: 'Переговорная зона' },
        { roomNumber: '109', floor: 1, type: 'Столовая', capacity: 100, equipment: 'Кухня, столы' },

        // Floor 2
        { roomNumber: '201', floor: 2, type: 'Лекционная аудитория', capacity: 90, equipment: 'Проектор, интерактивная доска' },
        { roomNumber: '202', floor: 2, type: 'Семинарская аудитория', capacity: 45, equipment: 'Модульные столы' },
        { roomNumber: '203', floor: 2, type: 'Лаборатория ИТ', capacity: 20, equipment: 'Серверы, сетевое оборудование' },
        { roomNumber: '204', floor: 2, type: 'Конференц-зал', capacity: 60, equipment: 'Видеосвязь, презентационное оборудование' },
        { roomNumber: '205', floor: 2, type: 'Лаборатория электроники', capacity: 25, equipment: 'Осциллографы, паяльные станции' },
        { roomNumber: '206', floor: 2, type: 'Мультимедийная аудитория', capacity: 70, equipment: 'Интерактивные панели' },
        { roomNumber: '207', floor: 2, type: 'Кабинет математики', capacity: 35, equipment: 'Специализированные программы' },
        { roomNumber: '208', floor: 2, type: 'Языковая лаборатория', capacity: 30, equipment: 'Аудиооборудование, наушники' },
        { roomNumber: '209', floor: 2, type: 'Лекционная аудитория', capacity: 100, equipment: 'Амфитеатр' },

        // Floor 3
        { roomNumber: '301', floor: 3, type: 'Кафедра программирования', capacity: 15, equipment: 'Преподавательские места' },
        { roomNumber: '302', floor: 3, type: 'Исследовательская лаборатория', capacity: 20, equipment: 'Научное оборудование' },
        { roomNumber: '303', floor: 3, type: 'Переговорная', capacity: 12, equipment: 'Круглый стол, видеосвязь' },
        { roomNumber: '304', floor: 3, type: 'Архив', capacity: 0, equipment: 'Документооборот' },
        { roomNumber: '305', floor: 3, type: 'Серверная', capacity: 0, equipment: 'IT-инфраструктура' },
        { roomNumber: '306', floor: 3, type: 'Кабинет ректора', capacity: 8, equipment: 'Приёмная, кабинет' },
        { roomNumber: '307', floor: 3, type: 'Зал заседаний', capacity: 30, equipment: 'Большой стол, презентационное оборудование' },
        { roomNumber: '308', floor: 3, type: 'Методический кабинет', capacity: 25, equipment: 'Учебные материалы' },
        { roomNumber: '309', floor: 3, type: 'Аудитория курсового проектирования', capacity: 40, equipment: 'Чертёжные столы' }
    ];

    try {
        const existingRooms = await this.countDocuments();
        if (existingRooms === 0) {
            await this.insertMany(defaultRooms);
            console.log('Default rooms initialized successfully');
        }
    } catch (error) {
        console.error('Error initializing default rooms:', error);
    }
};

module.exports = mongoose.model("Room", roomSchema);