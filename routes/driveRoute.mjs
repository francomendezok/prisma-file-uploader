import { Router } from "express"
import multer from 'multer'
const upload = multer({ dest: 'uploads/' })

import driveController from '../controllers/driveController.mjs'

const router = Router()

router.get('/', driveController.renderDrive)

router.post('/', upload.single('avatar'), driveController.upload)

export default router