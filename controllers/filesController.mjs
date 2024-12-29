import supabase from '../supabaseClient.mjs';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import os from 'os';

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
        const extension = file.mimetype.split('/')[1]; // Ejemplo: image/jpeg -> jpeg
        const fileName = `${file.name.split('.')[0]}.${extension}`; // Nombre con extensión correcta        console.log(file)

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
    const { fileID, newFileName } = req.body;

    try {
        // Obtener el archivo desde la base de datos
        const file = await prisma.file.findUnique({
            where: {
                id: fileID,
            },
        });

        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Extraer la extensión del nombre actual del archivo
        const currentName = file.name; // Nombre actual del archivo
        const extension = currentName.split('.').pop(); // Extraer la extensión

        // Crear el nuevo nombre con la misma extensión
        const updatedName = `${newFileName}.${extension}`;

        // Actualizar el archivo en la base de datos
        await prisma.file.update({
            where: {
                id: fileID,
            },
            data: {
                name: updatedName,
            },
        });

        res.redirect('/files?rename_successfully');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to rename file' });
    }
};



const deleteFile = async (req, res) => {
    const { delFileID } = req.body;

    await prisma.fileFolder.deleteMany({
        where: { fileId: delFileID }
    });    
    
    await prisma.file.delete({
        where: {
            id: delFileID
        }
    })

    res.redirect('/files?=delete_successfully')

}

const downloadFile = async (req, res) => {
    const file = await prisma.file.findUnique({
        where: {
            id: req.params.fileIndex
        }
    });
    
    try {
        // Obtener la ruta del escritorio del usuario
        const userPath = path.join(os.homedir(), 'projects');
        const fileName = file.name // Obtener el nombre del archivo desde la URL
        const destinationPath = path.join(userPath, fileName); // Ruta final del archivo

        console.log('Descargando archivo a:', destinationPath);

        // Descargar el archivo desde la URL
        const response = await axios.get(file.url, { responseType: 'stream' });

        // Guardar el archivo en el escritorio
        const writer = fs.createWriteStream(destinationPath);
        response.data.pipe(writer);

        writer.on('finish', () => {
            console.log('Archivo descargado exitosamente en el escritorio:', destinationPath);
        });

        writer.on('error', (err) => {
            console.error('Error al guardar el archivo:', err);
        });

        res.redirect('/files?=file_downloaded')
    } catch (error) {
        console.error('Error al descargar el archivo:', error);
    }
};


export default { viewFiles, uploadFile, renameFile, deleteFile, downloadFile }