import { Router } from "express"
import folderController from '../controllers/folderController.mjs'

const router = Router()

router.post('/', folderController.createFolder)

export default router