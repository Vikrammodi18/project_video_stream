const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const path = require('path')
const app = express();
const PORT = 3000;

// app.use(express.static('public'))

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/videodb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
app.use(express.urlencoded({extended:false}))
// GridFS Bucket
let gridfsBucket;
db.once("open", () => {
    gridfsBucket = new GridFSBucket(db.db, { bucketName: "uploads" });
    console.log("Connected to MongoDB GridFS");
});

// Multer setup (Only capturing request, no storage)
const storage = multer.memoryStorage(); // No disk or memory storage
const upload = multer({ storage });

const indexPage = path.join('LECTURE',"/public/fronend/index.html")

app.get('/home',(req,res)=>{
   
    res.sendFile(path.join(__dirname,"/public/frontend/index.html"))
})
// ✅ **Upload Route (Multer + GridFS + Streams)**
app.post("/upload", upload.single("file"), (req, res) => {
    console.log(req.file)
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Create a writable stream in GridFS
    const writeStream = gridfsBucket.openUploadStream(req.file.originalname);
    
    // Stream file buffer to GridFS
    writeStream.end(req.file.buffer);

    writeStream.on("finish", () => {
        res.json({ message: "File uploaded successfully!", filename: req.file.originalname });
    });

    writeStream.on("error", (err) => {
        res.status(500).json({ error: err.message });
    });
});

// ✅ **Download Route (Streaming File from GridFS)**


app.get("/file/:filename", async (req, res) => {
    try {
        // Find file details in GridFS
        const files = await gridfsBucket.find({ filename: req.params.filename }).toArray();
        if (!files || files.length === 0) {
            return res.status(404).json({ message: "File not found" });
        }

        const file = files[0];
        const fileSize = file.length;

        // Get range header (important for streaming)
        const range = req.headers.range;
        if (!range) {
            return res.status(400).send("Requires Range header");
        }

        // Parse range value
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        // Set response headers for streaming
        res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize,
            "Content-Type": "video/mp4", // Change if storing different formats
        });

        // Create a read stream for the requested chunk
        const readStream = gridfsBucket.openDownloadStreamByName(req.params.filename, { start, end });

        // Pipe the read stream to the response
        readStream.pipe(res);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



    // const fileId = new mongoose.Types.ObjectId("67b6390ac4163b4abdf3ef35");
    // const readStream = gridfsBucket.openDownloadStream(fileId);
    // readStream.pipe(res); // Streams file back to client


// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




// const express = require('express');
// const multer  = require('multer');
// const {GridFsStorage} = require('multer-gridfs-storage');
// const url = 'mongodb://127.0.0.1:27017/videoDB';
// const path = require('path')
// const storage = new GridFsStorage({ url });
// const upload = multer({ storage });


// const indexFile = path.join('LECTURE','public/frontend/index.html')
// const app = express()
// app.use(express.static('public'))
// app.use(express.urlencoded({extended:false}))



// app.get('/home',(req,res)=>{
//     console.log()
//     res.sendFile(`/${indexFile}`)
// })

// app.listen(3000,()=>{
//     console.log("your app is runing")
// })