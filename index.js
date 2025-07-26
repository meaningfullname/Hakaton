

const express = require("express");

const mongoose = require("mongoose");
const cors = require('cors');


const app =express();
mongoose.connect("mongodb://localhost:27017/Classroms" ,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
app.use(cors());
const db = mongoose.connection;

app.use(express.json());
db.on("error" ,console.error.bind(console,"MongoDB connection error"));

db.once("open",()=> console.log("Connected to DB."));


const student_model= new mongoose.Schema({
    student_id:{type:String ,required: true},
    name:{type:String ,required: true },
    lastname:{type:String ,required: true },
    email:{type:String ,required: true },
    password:{type:String ,required: true },
    gender:{type:String ,required: true },

});


const Student =mongoose.model("students", student_model);

app.post("/student" , async (req,res) =>{
    try {

        const {student_id, name ,lastname, email ,password ,gender } =req.body;
        if(!student_id || !name || !lastname || !email || !password || !gender){
            return res.status(400).json({error: "all fields is required"});
        }
        const student =new Student({student_id,name,lastname,email,password,gender});
        await student.save();
        res.status(201).json(student);

        // const {student_id,name, lastname, email, password,gender} = req.body;
        // if (!student_id || !name || !lastname || !email || !password || !gender) {
        //     return res.status(400).json({error: "All fields required"});
        // }
        // const student = new Student({student_id,name, lastname, email, password,gender});
        // await student.save();
        // res.status(201).json(student);




    }catch (error){
        res.status(500).json({error:error.message});
    }
})
app.get("/student", async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get("/student/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const student = await Student.findById(id).select("-password");
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put("/student/:id", async (req, res) => {
    try {

        const { student_id, name ,lastname, email ,password ,gender  } = req.body;
        const student= await Student.findByIdAndUpdate(req.params.id, { student_id, name ,lastname, email ,password ,gender  }, { new: true });
        if (!student) return res.status(404).json({ error: "Blog not found" });
        res.json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch("/student/:id" , async (req,res) =>{
    try{
        const {id} =req.params;
        const update =req.body;

        const allowedupdates=["student_id","name","lastname","email","password","gender"];
        const isvalid =Object.keys(update).every(key=>allowedupdates.includes(key));

        if (!isvalid) return res.status(400).json({error: "Invalid update fields"});

        const updatedStudent = await Student.findByIdAndUpdate(id,update,{new:true,runValidators:true});

        if(!updatedStudent){
            return res.status(400).json({error: "Student not found"});
        }
        res.json(updatedStudent);
    }catch (error){
        res.status(500).json({error: error.message});
    }
})
app.delete("/student/:id" , async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) return res.status(404).json({ error: "Student not found" });
        res.json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
app.get("/students", async (req, res) => {
    try {
        const blogs =await  Blog.find();
        res.json(blogs);

    }catch (error){
        res.status(500).json({error :error.message})
    }

})


const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


