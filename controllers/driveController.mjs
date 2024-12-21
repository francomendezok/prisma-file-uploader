import multer from 'multer'
const upload = multer({ dest: './public/data/uploads/' })
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const renderDrive = async (req, res) => {
    if (res.locals.user) {
      const folders = await prisma.folder.findMany({
        where: {
          userId: req.user.id
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      // find files and send it to drive //       
        res.render('drive', { folders: folders, files: [] })
    }
    else {
        res.redirect('log-in')
    }
}

const uploadFile = async (req, res) => {
    upload.single('uploaded_file')(req, res, (err) => {
      if (err) {
        console.error('Error al subir archivo:', err)
        return res.redirect('/drive?error=file_upload_failed')
      }
  
      if (req.file) {
        console.log(req.file)
        res.redirect('/drive')
      } else {
        res.redirect('/drive?error=file_upload_failed')
      }
    })
}

export default { renderDrive, uploadFile }