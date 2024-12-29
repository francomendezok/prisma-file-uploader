import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const renderDrive = async (req, res) => {
  if (res.locals.user) {
    try {
      const folders = await prisma.folder.findMany({
        where: {
          userId: req.user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.render('drive', { folders });
    } catch (err) {
      console.error('Error al cargar Drive:', err);
      res.redirect('/drive?error=load_failed');
    }
  } else {
    res.redirect('/log-in');
  }
};

const getFolder = async (req, res) => {
    try {
        const folders = await prisma.folder.findMany({
          where: {
            userId: req.user.id,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

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
        res.render('folder', {folder, files, folders });
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
  const { delfolderID } = req.body;

  try {
      await prisma.fileFolder.deleteMany({
          where: { folderId: delfolderID }
      });    

      await prisma.folder.delete({
          where: { id: delfolderID }
      });

      res.redirect('/drive');
  } catch (error) {
      console.error(error);
      res.status(500).send('Error deleting folder');
  }
};




export default { renderDrive, getFolder, createFolder, renameFolder, deleteFolder }