const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Core File Database Setup
const DB_FILE = path.join(__dirname, 'database.json');

// Helper function to safely read the file database
function readDatabase() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            fs.writeFileSync(DB_FILE, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error("Database read error, resetting storage:", error);
        return [];
    }
}

// Helper function to safely write to the file database
function writeDatabase(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

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

app.post('/admin-login', (req, res) => {
    const { password } = req.body;
    if (password === 'OtteriP2@2026') {
        const currentData = readDatabase();
        res.json({ success: true, data: currentData });
    } else {
        res.json({ success: false, msg: 'Access Denied' });
    }
});

app.post('/submit-report', upload.single('evidence'), (req, res) => {
    const currentData = readDatabase();

    const newReport = {
        incident_details: req.body.incident_details || "No details provided",
        scene_status: req.body.scene_status || "Active Now (Ongoing)",
        location: req.body.location || "Unspecified Location",
        incident_time: req.body.incident_time || "Not logged",
        substance_known: req.body.substance_known || "Unknown",
        details: req.body.details || "No description provided", 
        user_details: req.body.user_details || "",
        comm_willingness: req.body.comm_willingness || "Anonymous",
        contact_number: req.body.contact_number || "",
        jurisdiction: req.body.jurisdiction || "P2", 
        lat: parseFloat(req.body.lat) || 13.0988,
        lng: parseFloat(req.body.lng) || 80.2484,
        file: req.file ? req.file.filename : null
    };

    currentData.unshift(newReport);
    writeDatabase(currentData);

    res.send("<h2 style='text-align:center; font-family:sans-serif; margin-top:50px; color:#2ecc71;'>Information Transmitted Securely to District Vault.</h2>");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Persistent Server running on port ${PORT}`));