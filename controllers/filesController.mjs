import supabase from '../supabaseClient.mjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const viewFiles = async (req, res) => {
    try {
        const folders = await prisma.folder.findMany({
            where: {
              userId: req.user.id,
            },
            orderBy: {
              createdAt: 'desc',
            },
          });

        const files = await prisma.file.findMany({
            where: {
              userId: req.user.id,
            },
            orderBy: {
              createdAt: 'desc',
            },
          });
          res.render('files', { folders: folders, files: files })
    } catch (error) {
        console.log(error)
        res.status(500)
    }
}

const uploadFile = async (req, res) => {
    try {
        if (!req.files.uploaded_file) {
        return res.redirect('/drive?error=no_file');
        }

        const file = req.files.uploaded_file; // Archivo cargado desde el formulario
        const fileName = `${Date.now()}_${file.name}`; // Generar un nombre único

        // Subir archivo a Supabase Storage
        const { data, error } = await supabase.storage
        .from('odin_files')
        .upload(fileName, file.tempFilePath, {
            contentType: file.mimetype, // Agregar el tipo MIME
            cacheControl: '3600',
            upsert: false
        });

        if (error) {
        console.error('Supabase Storage Error:', error);
        throw error;
        }

        const { data: { publicUrl } } = supabase.storage
        .from('odin_files')
        .getPublicUrl(fileName);

        // Guardar detalles del archivo en la base de datos
        const createdFile = await prisma.file.create({
        data: {
            name: file.name,
            url: publicUrl,
            size: Math.round(file.size / 1024), // Convertir a KB
            userId: req.user.id
        },
        });

        const selectedFolders = Array.isArray(req.body.selectedFolders) 
        ? req.body.selectedFolders 
        : req.body.selectedFolders ? [req.body.selectedFolders] : []; // Si no es un array, hacerlo un array

        // Si hay carpetas seleccionadas (una o varias)
        if (selectedFolders.length > 0) {
        // Si solo se selecciona una carpeta
        if (selectedFolders.length === 1) {
        const folderConnection = {
            fileId: createdFile.id,
            folderId: selectedFolders[0], // Usamos el único folderId
        };

        // Crear solo una conexión en la tabla intermedia para una carpeta
        await prisma.fileFolder.create({
            data: folderConnection,
        });
        } 
        // Si se seleccionaron varias carpetas
        else {
        const folderConnections = selectedFolders.map(folderId => ({
            fileId: createdFile.id,
            folderId,
        }));

        // Crear conexiones en la tabla intermedia para todas las carpetas seleccionadas
        await prisma.fileFolder.createMany({
            data: folderConnections,
        });
        }
        } else {
        // Si no se selecciona ninguna carpeta, manejarlo de alguna manera (si es necesario)
        console.error("No se seleccionaron carpetas");
        }

        res.redirect('/files');
    } catch (err) {
        console.error('Error al subir archivo:', err);
        res.redirect('/files?error=upload_failed');
    }
};

const renameFile = async (req, res) => {
    res.json({id: req.body.fileID})

    // try {
    //     await prisma.file.update({
    //         where: {
    //             id: req.body.id,
    //         },
    //         data: {
    //             name: req.body.newFileName
    //         }
    //     })
    // } catch (error) {
    //     console.log(error)
    //     res.status(500)
    // }
}

const deleteFile = async (req, res) => {
    res.json({id: req.body.delFileID})
}

const downloadFile = async (req, res) => {
    res.json({id: req.params.folderIndex })
    // const { data, error } = await supabase
    // .storage
    // .from('odin_files')
    // .download('ruta/al/archivo.ext')

    // if (error) {
    //     return res.status(500).json({ error: error.message });
    // }
}

export default { viewFiles, uploadFile, renameFile, deleteFile, downloadFile }