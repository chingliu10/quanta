import express from 'express';
import exphbs from 'express-handlebars';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import flash from 'connect-flash';
import connection from './config/connection.js'; // Import connection
import dashboardRoutes from "./routes/dashboard.js"
import borrowerRoutes from "./routes/borrower.js"
import loanRoutes from "./routes/loan.js"
import savingRoutes from "./routes/saving.js"
import payrollRoutes from "./routes/payroll.js"
import branchRoutes from "./routes/branch.js"
import repaymentRoutes from "./routes/repayment.js"
import reportRoutes from "./routes/report.js"
import apiRoutes from "./api/routes/index.js"
import capitalRoutes from "./routes/capital.js"
import incomeRoutes from "./routes/income.js"
import expenseRoutes from "./routes/expense.js"
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

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

//using flash messages
app.use(flash());
// Middleware to make session variables accessible to templates
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.warning = req.flash('warning');
    res.locals.error = req.flash('error');
    res.locals.title = res.locals.title || 'Default Title';
    next();
});
// Serve static files from the "public" directory
app.use(express.static('assets'));

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//subroutes
app.use("/dashboard", dashboardRoutes);
app.use("/borrower", borrowerRoutes);
app.use("/loan", loanRoutes);
app.use("/savings", savingRoutes);
app.use("/payroll", payrollRoutes);
app.use("/branch", branchRoutes);
app.use("/api", apiRoutes);
app.use("/repayment", repaymentRoutes);
app.use("/report", reportRoutes)
app.use("/capital", capitalRoutes)
app.use("/income", incomeRoutes)
app.use("/expense", expenseRoutes)

// View Engine Setup
const hbs = exphbs.create({
    extname: 'handlebars',  // change to handlebars extension
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    helpers: {
        fifteenCharacters : function (str, len = 15)  {
             if (!str || typeof str !== 'string') return '';
             return str.length > len ? str.substring(0, len) + '...' : str;
        },
        eq : function (a, b) {
            return String(a) === String(b); // not ===
        },
        ifEquals: function(arg1, arg2, options) {
            return arg1 === arg2 ? options.fn(this) : options.inverse(this);
        },
        formatDecimalNumbersWithoutComma 
: (value) => {
            if (!value) return '0';
            return Math.round(parseFloat(value)).toString();
        },
        formatDecimalNumbers: (value) => {
    if (!value) return '0';
    
    const num = parseFloat(value);

    // If decimal part is exactly 0, return without decimals
    if (num % 1 === 0) {
        return num.toLocaleString('en-US', {
            maximumFractionDigits: 0,
        });
    }

    // Otherwise, show the number as-is, with up to 1 decimal
    return num.toLocaleString('en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    });
},
        eq: (a, b) => a === b,
        formatDate : (date) => {
            return new Date(date).toLocaleDateString();
        },
         formatCurrency : function(amount) {
            return parseFloat(amount).toLocaleString();
        },
        formatDateTime: (dateString) => {
            try {
                const date = new Date(dateString);
        if (isNaN(date)) throw new Error('Invalid Date');

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
              } catch (error) {
                return 'Invalid Date';
              }
        },
          inputDate: (dateString) => {
            try {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return ''; // Invalid date

                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');

                return `${year}-${month}-${day}`;
            } catch (error) {
                return '';
            }
            
        },
        ordinal: (day) => {
            const suffixes = ["th", "st", "nd", "rd"];
            const value = day % 100;
            return suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
        },
        check : (v, c) => {
            return (v === c) ? 'N/A' : v
        },
        addOne : function(index) {
            return index + 1;
        },
        sum: (...args) => {
            const values = args.slice(0, -1); // Exclude the last `options` argument
            return values.reduce((acc, curr) => acc + Number(curr), 0);
        },
        json: (context) => JSON.stringify(context)
    }
});

// Set up express-handlebars
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));


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
    res.render('login', { layout : false });
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
        const tokenPayload = {
                id: user.id,
                name: user.first_name,
                branchId: branch[0].branch_id,
        };

        let token =  jwt.sign(tokenPayload, 
            //process.env.JWT_SECRET
             "debora", {
            expiresIn: '1h', // Or longer
        });

        req.session.user = {
            id: user.id,
            user: user.first_name,
            branchId : branch[0].branch_id,
            branchName : branch[0].branch_name,
        };

                // Set token as HTTP-only cookie
        res.cookie('token', token, {
        httpOnly: true,          // Prevent client-side JS access
        secure: process.env.NODE_ENV === 'production', // HTTPS-only in production
        maxAge: 3600000,         // 1 hour expiration (matches token)
        sameSite: 'lax'          // Balance security and usability
        });

        console.log(req.session);
        console.log(req.flash("warning", "Your message"));
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
