import { Router } from "express"
import logInController from "../controllers/logInController.mjs"

const router = Router()

router.get('/', logInController.renderLogIn)

router.post('/', logInController.logIn)

export default router