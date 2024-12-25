import express from 'express';
import hbs from 'hbs';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import connection from './config/connection.js'; // Import connection
import dashboardRoutes from "./routes/dashboard.js"
import borrowerRoutes from "./routes/borrower.js"
import loanRoutes from "./routes/loan.js"
import savingRoutes from "./routes/saving.js"
import payrollRoutes from "./routes/payroll.js"
import branchRoutes from "./routes/branch.js"
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { pool } = connection; // Destructure pool from connection

const app = express();
const PORT = process.env.SERVER_PORT;




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
app.use("/payroll", payrollRoutes);
app.use("/branch", branchRoutes);

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
import Handlebars from 'handlebars';


hbs.registerHelper('formatDateTime', (dateString) => {
    try {
        const date = new Date(dateString);
        const options = {
            weekday: 'short', // Abbreviated weekday (e.g., Sat)
            month: 'short',   // Abbreviated month (e.g., Aug)
            day: '2-digit',   // Two-digit day (e.g., 03)
        };

        return date.toLocaleDateString('en-US', options);
    } catch (error) {
        return 'Invalid Date';
    }
});

hbs.registerHelper('ordinal', (day) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const value = day % 100;
    return suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
});



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
// POST route for login
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Query the users table to check if the user exists
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            req.session.error = 'Invalid email.';
            return res.redirect('/login');
        }

        const user = users[0];

        // Validate the password
        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if (!isPasswordValid) {
            req.session.error = 'Invalid password.';
            return res.redirect('/login');
        }

        // Fetch the user's accessible branches
        const [branch] = await pool.query(`
            SELECT b.id AS branch_id, b.name AS branch_name
            FROM branch_users bu
            JOIN branches b ON bu.branch_id = b.id
            WHERE bu.user_id = 1 limit 1
        `, [user.id]);

        if (branch.length === 0) {
            req.session.error = 'No branches assigned to this user.';
            return res.redirect('/login');
        }

        // // Use the most recently created branch as the active branch or the default branch
        // const activeBranch = branches.find(branch => branch.default_branch === 1) || branches[0];

        // Save user and branch information in the session
        req.session.user = {
            id: user.id,
            user: user.first_name,
            branchId : branch[0].branch_id,
            branchName : branch[0].branch_name,
        };

        console.log(req.session);

        req.session.success = 'Login successful!';
        return res.redirect('/dashboard');
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



app.all("*", (req, res) => {
    res.status(404).render("notfound")
});


// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
