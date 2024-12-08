import { body } from "express-validator"

const alphaErr = "must only contain letters and numbers."
const lengthErr = "must be between 1 and 255 characters."
const passLengthErr = "must be between 8 and 255 characters"

const validateCreateUser = [
    body("username").trim()
        .isAlphanumeric().withMessage(`Username ${alphaErr}`)
        .isLength({ min: 1, max: 255 }).withMessage(`Username ${lengthErr}`),
    body("password").trim()
        .isLength({ min: 8, max: 255 }).withMessage(`Password ${passLengthErr}`) 
];

const validateLogUser = [
    body("log-username").trim()
        .isAlphanumeric().withMessage(`Username ${alphaErr}`)
        .isLength({ min: 1, max: 255 }).withMessage(`Username ${lengthErr}`),
    body("log-password").trim()
        .isLength({ min: 8, max: 255 }).withMessage(`Password ${passLengthErr}`)
]



export { validateCreateUser, validateLogUser }