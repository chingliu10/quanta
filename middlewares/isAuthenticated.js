export const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next(); // User is authenticated, proceed to the next middleware
    }

    console.log(req.baseUrl)

    if(req.baseUrl == "/api"){
        return res.status(401).json({
            success : false,
            error : "Unauthorized"
        })
    }
    // Default behavior: redirect for UI requests
    res.redirect('/login');
};

