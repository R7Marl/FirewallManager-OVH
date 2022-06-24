const router = require('express').Router();
const pool = require('../database');
const { isadmin } = require('../lib/isadmin');
router.get('/', isadmin, async (req, res) => {


res.redirect('/admin/certificaciones')

});
router.get('/certificaciones', isadmin, async(req, res) => {
    const certificados = await pool.query('SELECT NombreCuenta FROM certificaciones WHERE Certificado = 1');
    res.render('admin/certificaciones.hbs', {
        certificados,
        nombre: req.user.Nombre
    });
})

router.get('/certificaciones/:nombre', isadmin, async (req, res) => {
let { nombre } = req.params;
    const cuenta = await pool.query('SELECT * FROM certificaciones WHERE NombreCuenta = ?', [nombre]);
    if(cuenta.length > 0) {
        if(cuenta[0].Certificado == 1) {
            res.render('admin/certificacion.hbs', {
                certificado: nombre,
                cuenta: cuenta[0],
                nombre: req.user.Nombre
            });
        } else {
            res.redirect('/admin/certificaciones');
        }
    } else {
        res.redirect('/admin/certificaciones');
    }
});

router.post('/certificaciones/:nombre', isadmin, async (req, res) => {
    let { nombre } = req.params;
    let { comentario } = req.body;
    let cuenta = await pool.query('SELECT * FROM certificaciones WHERE NombreCuenta = ?', [nombre]);
    console.log(req.body);
    if(req.body.aceptar == '') {
        const certificado = await pool.query('UPDATE certificaciones SET Certificado = 2, ComentarioAdmin = ? WHERE NombreCuenta = ?', [comentario, nombre]);
        res.redirect('/admin/certificaciones');
    } else if(req.body.rechazar === '') {
        const certificado = await pool.query('UPDATE certificaciones SET Certificado = 3, ComentarioAdmin = ?, Intentos = ? WHERE NombreCuenta = ?', [comentario, cuenta[0].Intentos--, nombre]);
        res.redirect('/admin/certificaciones');
    }
})
module.exports = router;