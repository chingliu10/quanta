export const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next(); // User is authenticated, proceed to the next middleware
    }

    // Check the Accept header to determine the response format
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
        // Respond with JSON for API requests
        return res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: 'You must be logged in to access this resource.',
        });
    }

    // Default behavior: redirect for UI requests
    res.redirect('/login');
};

