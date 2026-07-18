const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Relative path mapping prevents root directory mismatches on Render
const publicPath = path.resolve(__dirname, 'public');
const adminPath = path.resolve(__dirname, 'admin');
const uploadsPath = path.resolve(__dirname, 'uploads');

app.use('/', express.static(publicPath));
app.use('/secret-p2-link', express.static(adminPath));
app.use('/uploads', express.static(uploadsPath));

// Adaptive root catch-all
app.get('/', (req, res) => {
    const fallbackFile = path.join(publicPath, 'index.html');
    if (fs.existsSync(fallbackFile)) {
        res.sendFile(fallbackFile);
    } else {
        res.status(404).send("Error: public/index.html not found. Please verify your folder upload structure on GitHub.");
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(uploadsPath)){ fs.mkdirSync(uploadsPath, { recursive: true }); }
        cb(null, uploadsPath);
    },
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
        jurisdiction: req.body.jurisdiction, 
        lat: parseFloat(req.body.lat) || 13.0988,
        lng: parseFloat(req.body.lng) || 80.2484,
        file: req.file ? req.file.filename : null
    };
    reportsDatabase.unshift(newReport);
    res.send("<h2 style='text-align:center; font-family:sans-serif; margin-top:50px; color:#2ecc71;'>Report Logged Safely.</h2>");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running dynamically on port ${PORT}`));