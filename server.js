const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/secret-p2-link/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsPath = path.join(__dirname, 'uploads');
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
    // Encapsulates the explicit structural database updates 
    const newReport = {
        incident_details: req.body.incident_details || "No observation metrics logged.",
        scene_status: req.body.scene_status || "Active Now (Ongoing)", // Captures the dropdown value
        location: req.body.location,
        incident_time: req.body.incident_time || "Not logged",
        substance_known: req.body.substance_known || "",
        details: req.body.details, 
        user_details: req.body.user_details || "",
        comm_willingness: req.body.comm_willingness || "Anonymous",
        contact_number: req.body.contact_number || "",
        jurisdiction: req.body.jurisdiction, 
        lat: parseFloat(req.body.lat) || 13.0988,
        lng: parseFloat(req.body.lng) || 80.2484,
        file: req.file ? req.file.filename : null
    };
    reportsDatabase.unshift(newReport);
    res.send("<h2 style='text-align:center; font-family:sans-serif; margin-top:50px; color:#2ecc71;'>Information Transmitted Securely to District Vault.</h2>");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server processing on port ${PORT}`));