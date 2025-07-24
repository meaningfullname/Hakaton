const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// Middleware для проверки админских прав
router.use(authenticateToken, authorizeRoles("admin"));

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get system statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total number of students
 *                 active:
 *                   type: integer
 *                   description: Number of active students
 *                 inactive:
 *                   type: integer
 *                   description: Number of inactive students
 *                 male:
 *                   type: integer
 *                   description: Number of male students
 *                 female:
 *                   type: integer
 *                   description: Number of female students
 *                 other:
 *                   type: integer
 *                   description: Number of students with other gender
 *                 byFaculty:
 *                   type: object
 *                   description: Students grouped by faculty
 *                 byCourse:
 *                   type: object
 *                   description: Students grouped by course
 *       403:
 *         description: Access denied
 */
router.get("/stats", async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const activeStudents = await User.countDocuments({ role: "student", isActive: true });
    const inactiveStudents = await User.countDocuments({ role: "student", isActive: false });
    
    // Gender statistics
    const maleStudents = await User.countDocuments({ role: "student", gender: "male" });
    const femaleStudents = await User.countDocuments({ role: "student", gender: "female" });
    const otherGenderStudents = await User.countDocuments({ role: "student", gender: "other" });
    
    // Faculty statistics
    const facultyStats = await User.aggregate([
      { $match: { role: "student" } },
      { $group: { _id: "$faculty", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Course statistics
    const courseStats = await User.aggregate([
      { $match: { role: "student" } },
      { $group: { _id: "$course", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    const byFaculty = {};
    facultyStats.forEach(stat => {
      byFaculty[stat._id] = stat.count;
    });
    
    const byCourse = {};
    courseStats.forEach(stat => {
      byCourse[`Course ${stat._id}`] = stat.count;
    });

    res.json({
      total: totalStudents,
      active: activeStudents,
      inactive: inactiveStudents,
      male: maleStudents,
      female: femaleStudents,
      other: otherGenderStudents,
      byFaculty,
      byCourse
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/admin/students:
 *   get:
 *     summary: Get all students with pagination and filtering (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of students per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, student ID, or email
 *       - in: query
 *         name: faculty
 *         schema:
 *           type: string
 *         description: Filter by faculty
 *       - in: query
 *         name: course
 *         schema:
 *           type: integer
 *         description: Filter by course
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of students
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 students:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *       403:
 *         description: Access denied
 *   post:
 *     summary: Create a new student (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - studentId
 *               - gender
 *               - dateOfBirth
 *               - faculty
 *               - course
 *               - specialization
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *                 maxLength: 50
 *               lastName:
 *                 type: string
 *                 maxLength: 50
 *               studentId:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               customGender:
 *                 type: string
 *                 maxLength: 50
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country:
 *                     type: string
 *               faculty:
 *                 type: string
 *               course:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 6
 *               specialization:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student created successfully
 *       400:
 *         description: Validation error or student already exists
 *       403:
 *         description: Access denied
 */
router.get("/students", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = { role: "student" };
    
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { studentId: searchRegex },
        { username: searchRegex }
      ];
    }
    
    if (req.query.faculty) {
      filter.faculty = req.query.faculty;
    }
    
    if (req.query.course) {
      filter.course = parseInt(req.query.course);
    }
    
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const students = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    res.json({
      students,
      total,
      page,
      pages,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/students", async (req, res) => {
  try {
    const {
      username, email, password, firstName, lastName, studentId,
      gender, customGender, dateOfBirth, phoneNumber, address,
      faculty, course, specialization
    } = req.body;

    // Validation
    if (!username || !email || !password || !firstName || !lastName || 
        !studentId || !gender || !dateOfBirth || !faculty || !course || !specialization) {
      return res.status(400).json({
        message: "All required fields must be provided"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long"
      });
    }

    if (gender === 'other' && !customGender) {
      return res.status(400).json({
        message: "Custom gender is required when gender is 'other'"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email },
        { username },
        { studentId }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username, email, or student ID already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const studentData = {
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      studentId,
      gender,
      dateOfBirth,
      faculty,
      course: parseInt(course),
      specialization,
      role: 'student'
    };

    if (gender === 'other') {
      studentData.customGender = customGender;
    }

    if (phoneNumber) {
      studentData.phoneNumber = phoneNumber;
    }

    if (address) {
      studentData.address = address;
    }

    const newStudent = new User(studentData);
    await newStudent.save();

    res.status(201).json({
      message: "Student created successfully",
      student: newStudent
    });
  } catch (error) {
    console.error("Error creating student:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Username, email, or student ID already exists"
      });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/admin/students/recent:
 *   get:
 *     summary: Get recently added students (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *         description: Number of recent students to return
 *     responses:
 *       200:
 *         description: List of recent students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get("/students/recent", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 5, 20);
    
    const recentStudents = await User.find({ role: "student" })
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(recentStudents);
  } catch (error) {
    console.error("Error fetching recent students:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/admin/students/{id}:
 *   get:
 *     summary: Get student by ID (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Student not found
 *   put:
 *     summary: Update student (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               studentId:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               customGender:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               phoneNumber:
 *                 type: string
 *               faculty:
 *                 type: string
 *               course:
 *                 type: integer
 *               specialization:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Student updated successfully
 *       404:
 *         description: Student not found
 *   delete:
 *     summary: Delete student (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *       404:
 *         description: Student not found
 */
router.get("/students/:id", async (req, res) => {
  try {
    const student = await User.findOne({ 
      _id: req.params.id, 
      role: "student" 
    }).select("-password");
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/students/:id", async (req, res) => {
  try {
    const student = await User.findOne({ 
      _id: req.params.id, 
      role: "student" 
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const updateData = { ...req.body };
    
    // Remove fields that shouldn't be updated directly
    delete updateData.password;
    delete updateData.role;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Handle gender and customGender validation
    if (updateData.gender === 'other' && !updateData.customGender) {
      return res.status(400).json({
        message: "Custom gender is required when gender is 'other'"
      });
    }

    if (updateData.gender !== 'other') {
      updateData.customGender = undefined;
    }

    // Convert course to number if provided
    if (updateData.course) {
      updateData.course = parseInt(updateData.course);
    }

    // Convert isActive to boolean if provided
    if (updateData.isActive !== undefined) {
      updateData.isActive = Boolean(updateData.isActive);
    }

    const updatedStudent = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      message: "Student updated successfully",
      student: updatedStudent
    });
  } catch (error) {
    console.error("Error updating student:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Username, email, or student ID already exists"
      });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/students/:id", async (req, res) => {
  try {
    const student = await User.findOne({ 
      _id: req.params.id, 
      role: "student" 
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: "Student deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/admin/students/bulk-import:
 *   post:
 *     summary: Bulk import students from CSV/JSON (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               students:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     password:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     studentId:
 *                       type: string
 *                     gender:
 *                       type: string
 *                     customGender:
 *                       type: string
 *                     dateOfBirth:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                     faculty:
 *                       type: string
 *                     course:
 *                       type: integer
 *                     specialization:
 *                       type: string
 *     responses:
 *       200:
 *         description: Bulk import completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 successful:
 *                   type: integer
 *                 failed:
 *                   type: integer
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.post("/students/bulk-import", async (req, res) => {
  try {
    const { students } = req.body;
    
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        message: "Students array is required and must not be empty"
      });
    }

    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < students.length; i++) {
      try {
        const studentData = students[i];
        
        // Validate required fields
        const requiredFields = ['username', 'email', 'password', 'firstName', 'lastName', 'studentId', 'gender', 'dateOfBirth', 'faculty', 'course', 'specialization'];
        const missingFields = requiredFields.filter(field => !studentData[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Check if student already exists
        const existingStudent = await User.findOne({
          $or: [
            { email: studentData.email },
            { username: studentData.username },
            { studentId: studentData.studentId }
          ]
        });

        if (existingStudent) {
          throw new Error('Student with this username, email, or student ID already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(studentData.password, 12);
        
        const newStudentData = {
          ...studentData,
          password: hashedPassword,
          course: parseInt(studentData.course),
          role: 'student'
        };

        const newStudent = new User(newStudentData);
        await newStudent.save();
        
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          index: i + 1,
          studentData: students[i].username || students[i].email || `Student ${i + 1}`,
          error: error.message
        });
      }
    }

    res.json({
      message: `Bulk import completed. ${results.successful} successful, ${results.failed} failed.`,
      ...results
    });
  } catch (error) {
    console.error("Error in bulk import:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;