const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
const helmet = require('helmet'); // Para cabeceras de seguridad
const app = express();
const PORT = process.env.PORT || 3000;

// Rutas base para los directorios multimedia
const PUBLIC_DIR = path.join(__dirname, 'public');
const PICTURES_DIR = path.join(PUBLIC_DIR, 'Pictures');
const VIDEOS_DIR = path.join(PUBLIC_DIR, 'videos');
const THUMBNAILS_DIR = path.join(PUBLIC_DIR, 'thumbnails');
const BRANDING_DIR = path.join(PUBLIC_DIR, 'branding');
const BRANDING_VIDEOS_DIR = path.join(BRANDING_DIR, 'videos'); // Nuevo directorio para videos de branding
const BRANDING_PICTURES_DIR = path.join(BRANDING_DIR, 'Pictures'); // Nuevo directorio para imágenes de branding

// Crear directorios si no existen
const createDirIfNotExists = async (dir) => {
    try {
        await fs.access(dir);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.mkdir(dir, { recursive: true });
            console.log(`Directorio creado: ${dir}`);
        } else {
            throw error;
        }
    }
};

// Constantes para las extensiones permitidas
const ALLOWED_EXTENSIONS = {
    images: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    videos: ['.mp4', '.webm', '.mov', '.ogg'] // Agregado .ogg
};

// Middleware
app.use(cors()); // Habilitar CORS para todas las rutas
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'"], // Solo permite scripts del mismo origen. 'unsafe-inline' ya no es necesario.
            "img-src": ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://peach.blender.org", "https://orange.blender.org"], // Permite imágenes de estos dominios adicionales
            "media-src": ["'self'", "blob:"] // Permite medios (audio/video) del mismo origen y blob URIs
        }
    }
})); // Añadir cabeceras de seguridad básicas
app.use(express.json()); // Para parsear JSON en las peticiones

// Servir archivos estáticos desde la carpeta 'public' y sus subdirectorios
// Acceso: /Pictures/imagen.jpg, /videos/video.mp4, /branding/logo.png
app.use(express.static(PUBLIC_DIR));


// Serve index.html for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Caché para la lista de medios (simple implementación en memoria)
let mediaCache = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos

// Función para obtener metadatos de un archivo
async function getFileMetadata(filePath, type, baseDir) {
    try {
        const stats = await fs.stat(filePath);
        const fileName = path.basename(filePath);
        const relativePath = path.relative(PUBLIC_DIR, filePath).replace(/\\/g, '/'); // Ruta relativa a /public

        let thumbnail = null;
        if (type === 'video') {
            const thumbnailName = `${path.parse(fileName).name}.jpg`;
            const thumbnailPath = path.join(THUMBNAILS_DIR, thumbnailName);
            try {
                await fs.access(thumbnailPath);
                thumbnail = path.relative(PUBLIC_DIR, thumbnailPath).replace(/\\/g, '/');
            } catch (err) {
                // No se encontró miniatura específica, se podría generar una o usar un placeholder
                console.warn(`Miniatura no encontrada para ${fileName}, se usará null.`);
            }
        }

        return {
            src: `/${relativePath}`, // Ruta accesible por el cliente
            type: type,
            title: fileName,
            dateCreated: stats.mtime, // Usar mtime como fecha de creación/modificación
            size: stats.size,
            thumbnail: thumbnail ? `/${thumbnail}` : null
        };
    } catch (error) {
        console.error(`Error obteniendo metadatos para ${filePath}:`, error);
        return null;
    }
}

// Ruta para obtener la lista de todos los medios (imágenes y videos)
app.get('/api/media', async (req, res) => {
    const now = Date.now();
    if (mediaCache && (now - lastCacheTime < CACHE_DURATION)) {
        console.log('Sirviendo lista de medios desde caché.');
        return res.json(mediaCache);
    }

    console.log('Generando nueva lista de medios.');
    try {
        // Leer archivos de Pictures, Branding (imágenes), Videos (principal) y Branding/videos
        const [filesInPicturesDir, filesInBrandingDir, filesInVideosDir, filesInBrandingVideosDir, filesInBrandingPicturesDir] = await Promise.all([
            fs.readdir(PICTURES_DIR).catch(err => { console.error(`Error leyendo ${PICTURES_DIR}:`, err); return []; }),
            fs.readdir(BRANDING_DIR).catch(err => { console.error(`Error leyendo ${BRANDING_DIR}:`, err); return []; }), 
            fs.readdir(VIDEOS_DIR).catch(err => { console.error(`Error leyendo ${VIDEOS_DIR}:`, err); return []; }),
            fs.readdir(BRANDING_VIDEOS_DIR).catch(err => { console.error(`Error leyendo ${BRANDING_VIDEOS_DIR}:`, err); return []; }),
            fs.readdir(BRANDING_PICTURES_DIR).catch(err => { console.error(`Error leyendo ${BRANDING_PICTURES_DIR}:`, err); return []; }) // Leer nuevo directorio
        ]);

        console.log('[API Media] Archivos encontrados en PICTURES_DIR:', filesInPicturesDir.length);
        console.log('[API Media] Archivos encontrados en BRANDING_DIR (para imágenes/videos):', filesInBrandingDir.length);
        console.log('[API Media] Archivos encontrados en VIDEOS_DIR:', filesInVideosDir.length);
        console.log('[API Media] Archivos encontrados en BRANDING_VIDEOS_DIR:', filesInBrandingVideosDir.length);
        console.log('[API Media] Archivos encontrados en BRANDING_PICTURES_DIR:', filesInBrandingPicturesDir.length); // Nuevo log

        // Procesar imágenes de Pictures
        const imageDetailsPictures = (await Promise.all(
            filesInPicturesDir
                .filter(file => ALLOWED_EXTENSIONS.images.includes(path.extname(file).toLowerCase()))
                .map(file => getFileMetadata(path.join(PICTURES_DIR, file), 'image', PICTURES_DIR))
        )).filter(Boolean);

        console.log('[API Media] Detalles de imágenes procesadas (Pictures):', imageDetailsPictures.length);

        // Procesar imágenes de Branding (directamente de /public/branding)
        const imageDetailsBranding = (await Promise.all(
            filesInBrandingDir
                .filter(file => ALLOWED_EXTENSIONS.images.includes(path.extname(file).toLowerCase()))
                .map(file => getFileMetadata(path.join(BRANDING_DIR, file), 'image', BRANDING_DIR))
        )).filter(Boolean);

        console.log('[API Media] Detalles de imágenes procesadas (Branding):', imageDetailsBranding.length);

        // Procesar imágenes de Branding/Pictures
        const imageDetailsFromBrandingPicturesDir = (await Promise.all(
            filesInBrandingPicturesDir // Usar archivos del nuevo directorio
                .filter(file => ALLOWED_EXTENSIONS.images.includes(path.extname(file).toLowerCase()))
                .map(file => getFileMetadata(path.join(BRANDING_PICTURES_DIR, file), 'image', BRANDING_PICTURES_DIR))
        )).filter(Boolean);

        console.log('[API Media] Detalles de imágenes procesadas (Branding Pictures Dir):', imageDetailsFromBrandingPicturesDir.length); // Nuevo log

        // Procesar videos de Videos (principal /public/videos)
        const videoDetailsFromVideosDir = (await Promise.all(
            filesInVideosDir
                .filter(file => ALLOWED_EXTENSIONS.videos.includes(path.extname(file).toLowerCase()))
                .map(file => getFileMetadata(path.join(VIDEOS_DIR, file), 'video', VIDEOS_DIR))
        )).filter(Boolean);

        console.log('[API Media] Detalles de videos procesados (Videos Dir):', videoDetailsFromVideosDir.length);

        // Procesar videos de Branding/videos (/public/branding/videos)
        const videoDetailsFromBrandingVideosDir = (await Promise.all(
            filesInBrandingVideosDir 
                .filter(file => ALLOWED_EXTENSIONS.videos.includes(path.extname(file).toLowerCase()))
                .map(file => getFileMetadata(path.join(BRANDING_VIDEOS_DIR, file), 'video', BRANDING_VIDEOS_DIR))
        )).filter(Boolean);

        console.log('[API Media] Detalles de videos procesados (Branding Videos Dir):', videoDetailsFromBrandingVideosDir.length);

        mediaCache = {
            images: [...imageDetailsPictures, ...imageDetailsBranding, ...imageDetailsFromBrandingPicturesDir], // Añadir nuevas imágenes
            videos: [...videoDetailsFromVideosDir, ...videoDetailsFromBrandingVideosDir]
        };
        lastCacheTime = now;

        console.log('[API Media] Total imágenes en caché:', mediaCache.images.length);
        if (mediaCache.images.length > 0) {
            console.log('[API Media] Ejemplo primera imagen en caché src:', mediaCache.images[0].src);
        }
        console.log('[API Media] Total videos en caché:', mediaCache.videos.length);
        if (mediaCache.videos.length > 0) {
            console.log('[API Media] Ejemplo primer video en caché src:', mediaCache.videos[0].src);
        }

        res.json(mediaCache);
    } catch (error) {
        console.error('Error al obtener la lista de medios:', error);
        // No enviar error 404 genérico aquí si algunos directorios fallaron pero otros no
        // El catch en readdir ya maneja errores individuales de directorio
        res.status(500).json({ error: 'Error interno del servidor al obtener medios' });
    }
});

// Iniciar el servidor y crear directorios
async function startServer() {
    try {
        await Promise.all([
            createDirIfNotExists(PUBLIC_DIR),
            createDirIfNotExists(PICTURES_DIR),
            createDirIfNotExists(VIDEOS_DIR),
            createDirIfNotExists(THUMBNAILS_DIR),
            createDirIfNotExists(BRANDING_DIR),
            createDirIfNotExists(BRANDING_VIDEOS_DIR), // Asegurar que se crea el nuevo directorio
            createDirIfNotExists(BRANDING_PICTURES_DIR) // Asegurar que se crea el nuevo directorio de imágenes de branding
        ]);

        app.listen(PORT, () => {
            console.log(`Servidor Express escuchando en http://localhost:${PORT}`);
            console.log(`Sirviendo archivos estáticos desde: ${PUBLIC_DIR}`);
            console.log(`  Imágenes desde: ${PICTURES_DIR}`);
            console.log(`  Videos (principal) desde: ${VIDEOS_DIR}`);
            console.log(`  Branding (imágenes) desde: ${BRANDING_DIR}`);
            console.log(`  Branding (imágenes específicas) desde: ${BRANDING_PICTURES_DIR}`); // Log actualizado
            console.log(`  Branding (videos) desde: ${BRANDING_VIDEOS_DIR}`); // Log para el nuevo directorio
            console.log(`  Miniaturas desde: ${THUMBNAILS_DIR}`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor o crear directorios:', error);
        process.exit(1); // Salir si no se pueden crear los directorios
    }
}

startServer();