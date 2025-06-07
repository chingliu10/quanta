// export function verifyToken(req, res, next) {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1]; // Extract the token part

//     if (!token) return res.status(401).json({ message: 'No token provided' });

//     jwt.verify(token, "debora", (err, user) => {
//         if (err) return res.status(403).json({ message: 'Invalid or expired token' });

//         req.user = user; // Make user data available to the route
//         next();
//     });
// }


// const jwt = require('jsonwebtoken');
import jwt from 'jsonwebtoken';

export  function verifyToken(req, res, next) {

    const token = req.cookies.token; // 👈 get token from cookie

    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, 'debora', (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });

        req.user = user;
        next();
    });
    
}

