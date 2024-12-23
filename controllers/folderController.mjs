import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const getFolder = async (req, res) => {
    try {
        const filesIds = await prisma.fileFolder.findMany({
            where: { folderId: req.query.folderId },
            select: { fileId: true }, // Seleccionamos solo el fileId
          });
          
          const files = await prisma.file.findMany({
            where: {
              id: { in: filesIds.map(file => file.fileId) } // Filtra por los fileIds obtenidos
            }
          });
          
        const folder = await prisma.folder.findUnique({
            where: { id: req.query.folderId }
        });

        if (!folder) {
            return res.status(404).send('Folder not found');
        }
        console.log(files)
        // Renderiza la vista o envía la respuesta con la información del folder
        // pasar la folder y los files // 
        res.render('folder', {folder: folder, files: files});
    } catch (error) {
        console.error('Error fetching folder:', error);
        res.status(500).send('Internal server error');
    }
}

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
export default { getFolder, createFolder, renameFolder, deleteFolder }