import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const createFolder = async (req, res) => {
    const folder = await prisma.folder.create({
        data: {
            name: req.body.folderName,
            userId: req.user.id,
        }
    })
    console.log(folder)
    const folders = await prisma.folder.findMany()
    console.log(folders)

    res.redirect('/drive')
}

export default { createFolder }