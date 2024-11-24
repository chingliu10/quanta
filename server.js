import express from 'express';
import hbs from 'hbs';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import mysql from './database/connection.js';

const app = express();
const PORT = 3000;

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Session Middleware
app.use(
    session({
        secret: 'your-secret-key', // Replace with a strong secret key in production
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Use secure cookies in production with HTTPS
    })
);

// View Engine
app.set('view engine', 'hbs');
app.set('views', './views');

// Middleware to make session variables accessible to templates
app.use((req, res, next) => {
    res.locals.error = req.session.error || null;
    res.locals.success = req.session.success || null;
    req.session.error = null;
    req.session.success = null;
    next();
});

// Routes
app.get('/', (req, res) => {
    if (req.session.user) {
        // If user is logged in, redirect to dashboard
        return res.redirect('/dashboard');
    }
    // Otherwise, redirect to login
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    if (req.session.user) {
        // If user is already logged in, redirect to dashboard
        return res.redirect('/dashboard');
    }
    // Render login page for unauthenticated users
    res.render('login');
});


app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        req.session.error = 'Please log in to access the dashboard.';
        return res.redirect('/login');
    }

    res.render('dashboard', { user: req.session.user });
});

// POST route for login
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if email exists in the database
        const [rows] = await mysql.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            req.session.error = 'Invalid email.';
            return res.redirect('/login');
        }

        const user = rows[0];

        // Email is valid, now check password
        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if (!isPasswordValid) {
            req.session.error = 'Invalid password.';
            return res.redirect('/login');
        }

        // Email and password are valid
        req.session.user = { id: user.id, email: user.email }; // Store user details in the session
        req.session.success = 'Login successful!';
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Error during login:', err);
        req.session.error = 'An unexpected error occurred.';
        return res.redirect('/login');
    }
});

// Logout Route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error during logout:', err);
        }
        res.redirect('/login');
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
