import express from 'express';
import hbs from 'hbs';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import connection from './config/connection.js'; // Import connection
import dashboardRoutes from "./routes/dashboard.js"
import borrowerRoutes from "./routes/borrower.js"
import loanRoutes from "./routes/loan.js"
import savingRoutes from "./routes/saving.js"
import path from 'path'
import { fileURLToPath } from 'url'



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { pool } = connection; // Destructure pool from connection

const app = express();
const PORT = 3000;




// Configure Session Middleware
app.use(
    session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Use secure cookies in production with HTTPS
    })
);

// Serve static files from the "public" directory
app.use(express.static('assets'));

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//subroutes
app.use("/dashboard", dashboardRoutes);
app.use("/borrower", borrowerRoutes);
app.use("/loan", loanRoutes);
app.use("/savings", savingRoutes);

// View Engine
app.set('view engine', 'hbs');
app.set('views', './views');

// Register the partials directory
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));
hbs.registerHelper("ifEquals", function (arg1, arg2, options) {
    return arg1 === arg2 ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper('formatDecimalNumbers', (value) => {
    if (!value) return '0';
    return parseFloat(value).toLocaleString('en-US', {
        maximumFractionDigits: 0,
    });
});
hbs.registerHelper('eq', (a, b) => a === b);


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
        return res.redirect('/dashboard');
    }
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('login');
});



// POST route for login
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Use the pool to execute the query
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

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
        req.session.user = { id: user.id, user : user.first_name };
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
