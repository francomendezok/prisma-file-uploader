import { Router } from "express"
import driveController from '../controllers/driveController.mjs'

const router = Router()

router.get('/', driveController.renderDrive)

router.post('/', driveController.uploadFile)

export default router