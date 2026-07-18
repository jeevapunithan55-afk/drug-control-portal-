const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/secret-p2-link', express.static(path.join(__dirname, 'admin')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

let reportsDatabase = [];

app.post('/admin-login', (req, res) => {
    const { password } = req.body;
    if (password === 'OtteriP2@2026') {
        res.json({ success: true, data: reportsDatabase });
    } else {
        res.json({ success: false, msg: 'Access Denied' });
    }
});

app.post('/submit-report', upload.single('evidence'), (req, res) => {
    const newReport = {
        location: req.body.location,
        details: req.body.details,
        jurisdiction: req.body.jurisdiction, // Stores P1 or P2 status values
        lat: parseFloat(req.body.lat) || 13.0988,
        lng: parseFloat(req.body.lng) || 80.2484,
        file: req.file ? req.file.filename : null
    };
    reportsDatabase.unshift(newReport);
    res.send("<h2 style='text-align:center; font-family:sans-serif; margin-top:50px; color:#2ecc71;'>Report Logged Safely.</h2>");
});

if (!fs.existsSync('./uploads')){ fs.mkdirSync('./uploads'); }
app.listen(3000, () => console.log('🚀 Server running on port 3000'));