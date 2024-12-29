import { Router } from "express"
import filesController from '../controllers/filesController.mjs'

const router = Router()

router.get('/', filesController.viewFiles)

router.post('/create', filesController.uploadFile)

router.post('/rename', filesController.renameFile)

router.post('/delete', filesController.deleteFile)

router.get('/download/:fileIndex', filesController.downloadFile)

export default router