import { PrismaSessionStore } from '@quixo3/prisma-session-store'
import { PrismaClient } from '@prisma/client'
import { validateCreateUser } from '../controllers/validation.mjs'
import { validationResult } from 'express-validator'
import bcrypt, { hash } from 'bcrypt'

const prisma = new PrismaClient()

const renderSignUp = async (req, res) => {
    res.render('register')
}
const signUp = [
    validateCreateUser,
    async (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {            
            return res.status(400).json({ errors: errors.array() });
        }
        const { username, password } = req.body

        try {
            const hashedPassword = await bcrypt.hash(password, 10)

            await prisma.user.create({ // create es undefined. usar bien al client // 
                data: {
                    username: username,           // Email del usuario
                    password: hashedPassword, // Contraseña encriptada
                },
            })

            const response = await prisma.user.findMany()
            console.log(response);
            
            res.redirect("/log-in?success=true")
        } catch (error) {
            console.log(error)
            return next(error)
            
        }
    }
]

export default { renderSignUp, signUp }