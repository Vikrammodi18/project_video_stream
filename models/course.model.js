const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const lessonSchema = Schema({
    title:{
        type:String,
        required:true,
    },
    videoId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"uploads.files"
    },
    order:{
        type:Number,
    }
})
const Lesson = mongoose.model("Lesson",lessonSchema)
const courseSchema = Schema({
    title:{
        type:String,
        required:true,

    },
    description:{
        type:String,
        
    },
    price:{
        type:Number,
        required:true,
        default:0,
    },
    duration:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true,
    },
    instructor:{
        type:String,
        required:true,
    },
    
    lesson:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
    }]

},{Timestamp:true})

const Course = mongoose.model("Course",courseSchema)
module.exports = {Course,Lesson}