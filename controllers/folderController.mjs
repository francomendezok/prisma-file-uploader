import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const createFolder = async (req, res) => {
    await prisma.folder.create({
        data: {
            name: req.body.folderName,
            userId: req.user.id,
        }
    })

    res.redirect('/drive')
}

export default { createFolder }