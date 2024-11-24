import express from 'express';
import hbs from 'hbs';
import mysql from './database/connection.js';

const app = express();
const PORT = 3000;

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View Engine
app.set('view engine', 'hbs');
app.set('views', './views');

// Routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

// Sample POST route for login
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    mysql.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        if (results.length > 0) {
            res.send('Login successful');
        } else {
            res.status(401).send('Invalid email or password');
        }
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
