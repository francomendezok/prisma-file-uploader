import { validationResult } from 'express-validator'
import { validateLogUser } from './validation.mjs'
import passport from '../passport-config.mjs'

const renderLogIn = async (req, res) => {
    res.render('log-in')
}

const logIn = [
    validateLogUser, 
    async (req, res, next) => {

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        passport.authenticate('local', (err, user, info) => {
            if (err) {
                console.error('Error during authentication:', err);
                return res.status(500).json({ message: 'Error interno del servidor' });
            }
            if (!user) {
                console.log('Authentication failed:', info.message);
                return res.status(401).json({ message: info.message || 'Credenciales inválidas' });
            }
        
            req.logIn(user, (err) => {
                if (err) {
                    console.error('Error logging in user:', err);
                    return res.status(500).json({ message: 'Error al iniciar sesión' });
                }
                console.log('Authentication successful for user:', user.username);
                return res.redirect('/');
            });
        })(req, res, next);        
    }
]

export default { renderLogIn, logIn }

