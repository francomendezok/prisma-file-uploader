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

const renameFolder = async (req, res) => {
    try {
        await prisma.folder.update({
            where: {
                id: req.body.folderID
            },
            data: {
                name: req.body.newFolderName
            }
        })
        res.redirect('/drive')

    }
    catch (error) {
        console.log(error)
    }
}

const deleteFolder = async (req, res) => {
    console.log(req.body)
    try {
        await prisma.folder.delete({
            where: {
                id: req.body.delfolderID
            }
        })
        res.redirect('/drive')
    } catch (error) {
        console.log(error)
    }
}
export default { createFolder, renameFolder, deleteFolder }