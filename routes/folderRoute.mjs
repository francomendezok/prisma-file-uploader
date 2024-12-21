import { Router } from "express"
import folderController from '../controllers/folderController.mjs'

const router = Router()

router.get('/:folderID', folderController.getFolder)

router.post('/create', folderController.createFolder)

router.post('/rename', folderController.renameFolder)

router.post('/delete', folderController.deleteFolder)

export default router