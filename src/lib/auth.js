module.exports = {
    isLoggedIn (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }else {
            req.flash('message', 'Correo o contraseña incorrectos / captcha incompleto.');
            res.redirect('/login');
        }
        
        
    }
};