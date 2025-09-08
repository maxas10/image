const express = require('express')
const path = require("path")
const multer = require("multer");
const fs = require("fs");
const app = express()
const port = 3000

app.use(express.static(path.join(__dirname, "public")));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
	destination: (req,file,cb) => cb(null, uploadDir),
	filename: (req, file, cb) => {
    		const safeName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    		cb(null, safeName);
  	}
})

const upload = multer({storage})

app.get("/", (req,res) => {
	res.sendFile(path.join(__dirname, "index.html"))
})
app.get("/uploads", (req,res) => {
        fs.readdir(uploadDir, (err, files) => {
		if(err) res.status(500).send("Error reading uploads");
		const images = files
		.map(file => `<div style="margin: 10px; display: flex; justify-content: center">
			<img 
				src="/uploads/${file}"
				style=" margin: 10px; width: 300px; height: 300px; object-fit: cover;"
			/>
			<p>${file}</p>
		</div>`)
		.join("");

		res.send(`
			<div style="display: flex; flex-wrap: wrap;">${images}</div>
		`)
	})
})

app.post('/upload', upload.single('imageFile'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  console.count(`uploaded ${req.file.filename}`)
  res.json({
    message: 'Upload successful',
    file: req.file.filename,
    url: `/uploads/${req.file.filename}`
  });
});

app.listen(port, ()=>{
	console.log(`Listening on port ${port}`)
})
