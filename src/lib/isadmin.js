module.exports = {
    isadmin (req, res, next) {
        if (req.isAuthenticated()) {
            if (req.user.admin > 1) {
            return next();
            } else return res.redirect('/dashboard');
        } else return res.redirect('/login');
    }
};