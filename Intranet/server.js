
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const bcrypt = require('bcrypt');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Initialisiere Express, HTTP und Socket.IO
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Konfiguration
const PORT = 3000;
const UPLOAD_DIR = './public/uploads';
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// SQLite-Datenbank einrichten
const db = new sqlite3.Database('./database/intranet.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Verbindung zur SQLite-Datenbank hergestellt.');
});

// Erstellt die erforderlichen Tabellen
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_name TEXT NOT NULL,
            due_date TEXT
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL
        )
    `);
});



// Multer für Datei-Uploads konfigurieren
const storage = multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// Routen
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Benutzer konnte nicht erstellt werden.');
        }
        res.redirect('/');
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err || !user) {
            return res.status(401).send('Ungültige Anmeldedaten.');
        }
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            res.redirect('/dashboard');
        } else {
            res.status(401).send('Ungültige Anmeldedaten.');
        }
    });
});





app.get('/stream', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'stream.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'main.html'));
});

app.get('/paint', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'cad.html'));
});





















app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Keine Datei hochgeladen.');
    }
    res.redirect('/dashboard2');
});

app.get('/tasks', (req, res) => {
    db.all('SELECT * FROM tasks', [], (err, tasks) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Fehler beim Abrufen der Aufgaben.');
        }
        res.json(tasks);
    });
});

app.post('/tasks', (req, res) => {
    const { task_name, due_date } = req.body;
    db.run('INSERT INTO tasks (task_name, due_date) VALUES (?, ?)', [task_name, due_date], (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Fehler beim Hinzufügen der Aufgabe.');
        }
        res.redirect('/dashboard');
    });
});

app.get('/calendar', (req, res) => {
    db.all('SELECT * FROM events', [], (err, events) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Fehler beim Abrufen der Ereignisse.');
        }
        res.json(events);
    });
});

app.post('/calendar', (req, res) => {
    const { title, start_time, end_time } = req.body;
    db.run('INSERT INTO events (title, start_time, end_time) VALUES (?, ?, ?)', [title, start_time, end_time], (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Fehler beim Hinzufügen des Ereignisses.');
        }
        res.redirect('/dashboard');
    });
});

// Chat-Handling mit Socket.IO
io.on('connection', (socket) => {
    console.log('Ein Benutzer hat sich verbunden.');
    socket.on('message', (msg) => {
        io.emit('message', msg);
    });
    socket.on('disconnect', () => {
        console.log('Ein Benutzer hat die Verbindung getrennt.');
    });
});

// Server starten
server.listen(PORT, () => {
    console.log(`Server läuft unter http://localhost:${PORT}`);
});
