const mongoose = require("mongoose");
require("dotenv").config();

const Room = require("../models/room");

// Connect to database
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/student_system", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const seedRooms = async () => {
    try {
        console.log("Starting room seeding...");

        // Clear existing rooms
        await Room.deleteMany({});
        console.log("Cleared existing rooms");

        // Initialize default rooms
        await Room.initializeDefaultRooms();
        console.log("Default rooms created");

        // Add some sample schedules for demonstration
        const sampleSchedules = [
            {
                roomNumber: '101',
                schedule: [
                    { startTime: '09:00', endTime: '10:30', status: 'occupied', purpose: 'Лекция по математике' },
                    { startTime: '11:00', endTime: '12:30', status: 'reserved', purpose: 'Семинар' },
                    { startTime: '14:00', endTime: '15:30', status: 'free' }
                ]
            },
            {
                roomNumber: '102',
                schedule: [
                    { startTime: '08:00', endTime: '09:30', status: 'occupied', purpose: 'Практическое занятие' },
                    { startTime: '10:00', endTime: '11:30', status: 'free' },
                    { startTime: '13:00', endTime: '14:30', status: 'reserved', purpose: 'Консультация' }
                ]
            },
            {
                roomNumber: '103',
                schedule: [
                    { startTime: '09:00', endTime: '10:30', status: 'reserved', purpose: 'Компьютерная практика' },
                    { startTime: '11:00', endTime: '12:30', status: 'occupied', purpose: 'Лабораторная работа' },
                    { startTime: '15:00', endTime: '16:30', status: 'free' }
                ]
            }
        ];

        // Update rooms with schedules
        for (const scheduleData of sampleSchedules) {
            await Room.findOneAndUpdate(
                { roomNumber: scheduleData.roomNumber },
                { schedule: scheduleData.schedule }
            );
        }

        console.log("Sample schedules added");

        // Set some rooms to maintenance for testing
        await Room.findOneAndUpdate(
            { roomNumber: '105' },
            { currentStatus: 'maintenance' }
        );

        await Room.findOneAndUpdate(
            { roomNumber: '209' },
            { currentStatus: 'maintenance' }
        );

        await Room.findOneAndUpdate(
            { roomNumber: '309' },
            { currentStatus: 'maintenance' }
        );

        console.log("Set maintenance status for some rooms");

        // Display final count
        const totalRooms = await Room.countDocuments();
        console.log(`✅ Seeding completed! Total rooms: ${totalRooms}`);

        // Display room statistics
        const stats = await Room.aggregate([
            {
                $group: {
                    _id: "$currentStatus",
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log("\n📊 Room Status Statistics:");
        stats.forEach(stat => {
            const statusNames = {
                'free': 'Свободно',
                'occupied': 'Занято',
                'reserved': 'Забронировано',
                'maintenance': 'На ремонте'
            };
            console.log(`   ${statusNames[stat._id] || stat._id}: ${stat.count}`);
        });

        const floorStats = await Room.aggregate([
            {
                $group: {
                    _id: "$floor",
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        console.log("\n🏢 Rooms by Floor:");
        floorStats.forEach(stat => {
            console.log(`   Этаж ${stat._id}: ${stat.count} комнат`);
        });

        console.log("\n✨ Ready to use! Start your server with: npm start");

    } catch (error) {
        console.error("❌ Error seeding rooms:", error);
    } finally {
        mongoose.disconnect();
    }
};

// Run the seeder
seedRooms();