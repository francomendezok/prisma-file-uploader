import { Router } from "express"
import registerController from "../controllers/registerController.mjs"

const router = Router()

router.get('/', registerController.renderSignUp)

router.post('/', registerController.signUp)

export default router