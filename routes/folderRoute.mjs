import { Router } from "express"
import folderController from '../controllers/folderController.mjs'

const router = Router()


router.get('/', folderController.renderDrive)

router.get('/folder/:folderID', folderController.getFolder)

router.post('/folder/create', folderController.createFolder)

router.post('/folder/rename', folderController.renameFolder)

router.post('/folder/delete', folderController.deleteFolder)

export default router