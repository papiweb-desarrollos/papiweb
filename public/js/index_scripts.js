document.addEventListener('DOMContentLoaded', () => {

    // --- Particle Generation ---
    const particlesContainer = document.getElementById('particles');
    const numParticles = 50;
    for (let i = 0; i < numParticles; i++) {
        let particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.top = `${Math.random() * 100}vh`;
        particle.style.animationDuration = `${Math.random() * 5 + 5}s`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particlesContainer.appendChild(particle);
    }

    // --- Floating Logo Animation ---
    const floatingLogo = document.querySelector('.floating-logo');
    const logoImg = floatingLogo.querySelector('img');
    floatingLogo.addEventListener('click', () => {
        const animations = ['spin-y', 'spin-x', 'spin-z', 'spin-diagonal'];
        const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
        logoImg.classList.add(randomAnimation);
        setTimeout(() => logoImg.classList.remove(randomAnimation), 1200);
    });
    
    // --- Media Player Logic ---
    const fileInput = document.getElementById('fileInput');
    const videoPlayer = document.getElementById('videoPlayer');
    const audioPlayer = document.getElementById('audioPlayer');
    const defaultView = document.getElementById('defaultView');
    const mediaInfoTitle = document.querySelector('.media-info .media-title');
    const mediaInfoDetails = document.querySelector('.media-info .media-details');
    
    const playPauseBtn = document.getElementById('playPauseBtn');
    const rewindBtn = document.getElementById('rewindBtn');
    const forwardBtn = document.getElementById('forwardBtn');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const currentTimeEl = document.getElementById('currentTime');
    const totalDurationEl = document.getElementById('totalDuration');
    const volumeBtn = document.getElementById('volumeBtn');
    const volumeSlider = document.getElementById('volumeSlider');

    let activePlayer = null;

    function loadMedia(file, type, title = null) {
        const mediaURL = URL.createObjectURL(file);
        title = title || file.name;

        videoPlayer.style.display = 'none';
        defaultView.style.display = 'flex';
        videoPlayer.pause();
        audioPlayer.pause();
        activePlayer = null;

        if (type.startsWith('video')) {
            videoPlayer.src = mediaURL;
            videoPlayer.style.display = 'block';
            defaultView.style.display = 'none';
            activePlayer = videoPlayer;
        } else if (type.startsWith('audio')) {
            audioPlayer.src = mediaURL;
            activePlayer = audioPlayer;
        }
        
        if(activePlayer) {
            mediaInfoTitle.textContent = title;
            mediaInfoDetails.textContent = `Tipo: ${type}, Tamaño: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
            activePlayer.load();
            activePlayer.play().catch(error => {
                if (error.name === 'AbortError') {
                    console.log('Play request was aborted in loadMedia. This is often normal.');
                } else {
                    console.error('Error during play in loadMedia:', error);
                }
            });
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            addPlayerEventListeners(activePlayer);
        }
    }
    
    function loadMediaFromUrl(url, type, title, details) {
        videoPlayer.style.display = 'none';
        defaultView.style.display = 'flex';
        videoPlayer.pause();
        audioPlayer.pause();
        activePlayer = null;
        
        if (type.startsWith('video')) {
            videoPlayer.src = url;
            videoPlayer.style.display = 'block';
            defaultView.style.display = 'none';
            activePlayer = videoPlayer;
        } else if (type.startsWith('audio')) {
            audioPlayer.src = url;
            activePlayer = audioPlayer;
        }
        
        if(activePlayer) {
            mediaInfoTitle.textContent = title;
            mediaInfoDetails.textContent = details;
            activePlayer.load();
            activePlayer.play().catch(error => {
                if (error.name === 'AbortError') {
                    console.log('Play request was aborted in loadMediaFromUrl. This is often normal.');
                } else {
                    console.error('Error during play in loadMediaFromUrl:', error);
                }
            });
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            addPlayerEventListeners(activePlayer);
        }
    }
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            loadMedia(file, file.type);
        }
    });

    function addPlayerEventListeners(player) {
        player.ontimeupdate = updateProgress;
        player.onloadedmetadata = updateProgress;
        player.onended = () => { playPauseBtn.innerHTML = '<i class="fas fa-play"></i>'; };
    }
    
    playPauseBtn.addEventListener('click', () => {
        if (!activePlayer) return;
        if (activePlayer.paused) {
            activePlayer.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            activePlayer.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    rewindBtn.addEventListener('click', () => activePlayer ? activePlayer.currentTime -= 10 : null);
    forwardBtn.addEventListener('click', () => activePlayer ? activePlayer.currentTime += 10 : null);
    
    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    function updateProgress() {
        if (!activePlayer || !isFinite(activePlayer.duration)) return;
        const progressPercent = (activePlayer.currentTime / activePlayer.duration) * 100;
        progressFill.style.width = `${progressPercent}%`;
        currentTimeEl.textContent = formatTime(activePlayer.currentTime);
        totalDurationEl.textContent = formatTime(activePlayer.duration);
    }

    progressBar.addEventListener('click', (e) => {
        if (!activePlayer || !isFinite(activePlayer.duration)) return;
        const progressWidth = progressBar.clientWidth;
        const clickX = e.offsetX;
        activePlayer.currentTime = (clickX / progressWidth) * activePlayer.duration;
    });
    
    volumeSlider.addEventListener('input', (e) => {
        if (!activePlayer) return;
        activePlayer.volume = e.target.value;
        updateVolumeIcon(activePlayer.volume, activePlayer.muted);
    });
    
    volumeBtn.addEventListener('click', () => {
        if (!activePlayer) return;
        activePlayer.muted = !activePlayer.muted;
        updateVolumeIcon(activePlayer.volume, activePlayer.muted);
    });
    
    function updateVolumeIcon(volume, muted) {
        const icon = volumeBtn.querySelector('i');
        if(muted || volume === 0) {
            icon.className = 'fas fa-volume-mute';
        } else if (volume < 0.5) {
            icon.className = 'fas fa-volume-down';
        } else {
            icon.className = 'fas fa-volume-up';
        }
    }
    
    // --- Media Explorer ---
    const mediaGrid = document.getElementById('mediaGrid');
    const tabs = document.querySelectorAll('.media-explorer-tab');

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Initialize mediaData. Pictures and Videos will be loaded asynchronously.
    const mediaData = {
        pictures: [], // Will be populated from API
        videos: []    // Will be populated from API
    };

    async function loadBrandingPictures() {
        console.log("[loadBrandingPictures] Iniciando carga de imágenes de branding...");
        try {
            const response = await fetch('/public/media.json'); // MODIFICADO: Cargar JSON local
            console.log("[loadBrandingPictures] Respuesta de media.json recibida, estado:", response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('[loadBrandingPictures] Falló la obtención de media.json:', response.status, errorText);
                throw new Error(`media.json request failed with status ${response.status}`);
            }
            const allMedia = await response.json();
            console.log("[loadBrandingPictures] Datos JSON de media.json:", allMedia);
            
            if (!allMedia || !allMedia.images || !Array.isArray(allMedia.images)) {
                console.error('[loadBrandingPictures] No se encontró el array \'images\' en media.json o no es un array:', allMedia);
                mediaData.pictures = []; 
                return; 
            }
            // console.log("[loadBrandingPictures] allMedia.images antes de filtrar:", JSON.parse(JSON.stringify(allMedia.images)));

            // MODIFICADO: No es necesario filtrar por ruta si el JSON ya está estructurado
            // let brandingImgs = allMedia.images.filter(img => {
            //     const startsWithFilter = img.src && img.src.startsWith('/public/branding/Pictures/');
            //     return startsWithFilter;
            // });
            // console.log("[loadBrandingPictures] brandingImgs después de filtrar por '/public/branding/Pictures/':", JSON.parse(JSON.stringify(brandingImgs)));
            
            mediaData.pictures = allMedia.images.map(img => ({
                title: img.title || img.src.split('/').pop(),
                info: `Branding Image (${(img.src.split('.').pop() || 'image').toUpperCase()})`,
                thumb: img.src, // La ruta ya debe ser correcta desde media.json
                url: img.src,   // La ruta ya debe ser correcta desde media.json
                type: img.type || 'image' 
            }));
            // console.log("[loadBrandingPictures] mediaData.pictures después de mapear:", JSON.parse(JSON.stringify(mediaData.pictures)));

            shuffleArray(mediaData.pictures);
            // console.log("[loadBrandingPictures] mediaData.pictures después de mezclar:", JSON.parse(JSON.stringify(mediaData.pictures)));
            console.log("[loadBrandingPictures] Carga de imágenes de branding completada desde media.json.");

        } catch (error) {
            console.error("[loadBrandingPictures] Error cargando o procesando imágenes de branding desde media.json:", error);
            mediaData.pictures = []; 
        }
    }

    async function loadBrandingVideos() {
        console.log("[loadBrandingVideos] Iniciando carga de videos de branding...");
        try {
            const response = await fetch('/public/media.json'); // MODIFICADO: Cargar JSON local
            console.log("[loadBrandingVideos] Respuesta de media.json recibida, estado:", response.status);
            if (!response.ok) {
                console.error('Failed to fetch media.json for videos:', response.status, await response.text());
                throw new Error(`media.json request failed with status ${response.status}`);
            }
            const allMedia = await response.json();
            console.log("[loadBrandingVideos] Datos JSON de media.json:", allMedia);

            if (!allMedia.videos || !Array.isArray(allMedia.videos)) {
                console.error('No videos array found in media.json or it is not an array:', allMedia);
                mediaData.videos = []; 
                return; 
            }

            // MODIFICADO: No es necesario filtrar por ruta si el JSON ya está estructurado
            // let brandingVids = allMedia.videos.filter(vid => vid.src && vid.src.startsWith('/public/branding/videos/'));
            
            mediaData.videos = allMedia.videos.map(vid => ({
                title: vid.title || vid.src.split('/').pop(),
                info: `Branding Video (${(vid.type || 'video/mp4')})`,
                thumb: vid.thumbnail || '/public/branding/video_placeholder.png', // La ruta ya debe ser correcta
                url: vid.src,    // La ruta ya debe ser correcta
                type: vid.type || 'video/mp4' 
            }));

            shuffleArray(mediaData.videos);
            console.log("[loadBrandingVideos] Carga de videos de branding completada desde media.json.");

        } catch (error) {
            console.error("Error loading or processing branding videos from media.json:", error);
            mediaData.videos = []; 
        }
    }

    function renderMedia(items, type) {
        mediaGrid.innerHTML = ''; // Limpiar grid
        if (!items || items.length === 0) {
            mediaGrid.innerHTML = '<p class="no-media">No hay elementos para mostrar.</p>';
            return;
        }

        items.forEach(item => {
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.dataset.type = type;
            // CORRECCIÓN: Usar item.url en lugar de item.path
            mediaItem.dataset.src = item.url; 
            mediaItem.dataset.title = item.title; // Usar item.title que ya está procesado

            let mediaElement;
            if (type === 'pictures') {
                mediaElement = document.createElement('a'); // Envolver la imagen en un enlace para Lightbox
                // CORRECCIÓN: Usar item.url
                mediaElement.href = item.url;
                mediaElement.dataset.lightbox = 'gallery-pictures'; // Agrupar imágenes en una galería
                mediaElement.dataset.title = item.title; // Usar item.title

                const img = document.createElement('img');
                // CORRECCIÓN: Usar item.url (o item.thumb si fuera diferente y preferido para grid)
                img.src = item.thumb; // item.thumb y item.url son iguales para imágenes según la carga
                img.alt = item.title; // Usar item.title
                img.onerror = () => img.src = 'public/branding/image_placeholder.png'; // Placeholder en caso de error
                mediaElement.appendChild(img);

            } else if (type === 'videos') {
                mediaElement = document.createElement('img');
                // CORRECCIÓN: Usar item.thumb para el thumbnail del video
                mediaElement.src = item.thumb || 'public/branding/video_placeholder.png';
                mediaElement.alt = item.title; // Usar item.title
                mediaElement.style.cursor = 'pointer'; 
                mediaElement.addEventListener('click', () => {
                    // CORRECCIÓN: Usar item.url para la fuente del video
                    loadMediaFromUrl(item.url, item.type || 'video/mp4', item.title, item.info);
                    const videoPlayerElement = document.getElementById('videoPlayer');
                    if (videoPlayerElement) {
                        videoPlayerElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                });
            }

            const itemName = document.createElement('p');
            itemName.textContent = item.title; // Usar item.title

            if (mediaElement) { 
                mediaItem.appendChild(mediaElement);
            }
            mediaItem.appendChild(itemName);
            mediaGrid.appendChild(mediaItem);
        });

        // Inicializar Lightbox para los nuevos elementos agregados (si es necesario, aunque Lightbox2 suele detectar automáticamente)
        if (typeof lightbox !== 'undefined') {
            lightbox.option({
                'resizeDuration': 200,
                'wrapAround': true,
                'disableScrolling': true, // Evita el scroll del body cuando el lightbox está abierto
                'albumLabel': "Imagen %1 de %2" // Personalizar etiqueta del álbum
            });
        }
    }
    
    function loadAndRenderMedia(mediaType) {
        if (mediaType === 'pictures') {
            if (mediaData.pictures && mediaData.pictures.length > 0) {
                renderMedia(mediaData.pictures, 'pictures');
            } else {
                mediaGrid.innerHTML = '<p class="no-media">No hay imágenes para mostrar o aún se están cargando.</p>';
            }
        } else if (mediaType === 'videos') {
            if (mediaData.videos && mediaData.videos.length > 0) {
                renderMedia(mediaData.videos, 'videos');
            } else {
                mediaGrid.innerHTML = '<p class="no-media">No hay videos para mostrar o aún se están cargando.</p>';
            }
        } else {
            console.warn('Tipo de medio desconocido:', mediaType);
            mediaGrid.innerHTML = '<p class="no-media">Tipo de medio no reconocido.</p>';
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const mediaType = tab.dataset.type;
            loadAndRenderMedia(mediaType); 
        });
    });

    // --- Scroll to Top Button Functionality ---
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) { // Muestra el botón después de 300px de scroll
            if (scrollToTopBtn.style.display !== "flex") {
                scrollToTopBtn.style.opacity = '0';
                scrollToTopBtn.style.display = 'flex';
                setTimeout(() => scrollToTopBtn.style.opacity = '1', 10); // Pequeña transición de fade-in
            }
        } else {
            if (scrollToTopBtn.style.display === "flex") {
                scrollToTopBtn.style.opacity = '0';
                setTimeout(() => scrollToTopBtn.style.display = 'none', 300); // Espera a que termine el fade-out
            }
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // --- Initial Load ---
    async function initializePage() {
        await loadBrandingPictures(); // Carga imágenes primero
        await loadBrandingVideos();   // Luego videos
        
        const activeTab = document.querySelector('.media-explorer-tab.active');
        let initialMediaType = 'pictures'; // Por defecto a imágenes
        if (activeTab) {
            initialMediaType = activeTab.dataset.type;
        }
        loadAndRenderMedia(initialMediaType);
    }

    initializePage();

    // --- Floating Logo Eyes Interaction ---
    const leftPupil = document.querySelector('.left-pupil');
    const rightPupil = document.querySelector('.right-pupil');
    const logoForEyes = document.querySelector('.floating-logo'); // El contenedor de las pupilas

    if (leftPupil && rightPupil && logoForEyes) {
        let isFollowingEyes = false;
        let followTimeoutId;
        let idleTimeoutId;

        const MAX_PUPIL_TRANSLATE = 6; // Máximo desplazamiento en px de la pupila desde su centro. Ajustar según sea necesario.
                                      // Esto dependerá del tamaño de los ojos en tu logo y el tamaño de las pupilas.

        function movePupilsToMouse(event) {
            const logoRect = logoForEyes.getBoundingClientRect();

            // Iterar sobre cada pupila
            [leftPupil, rightPupil].forEach(pupil => {
                // Para calcular el movimiento, necesitamos el centro del "ojo" al que pertenece la pupila.
                // Dado que las pupilas están posicionadas absolutamente dentro de .floating-logo,
                // su 'offsetLeft' y 'offsetTop' nos dan su posición relativa al .floating-logo.
                // El centro del ojo sería (pupil.offsetLeft + pupil.offsetWidth / 2, pupil.offsetTop + pupil.offsetHeight / 2)
                // Y esto es relativo al .floating-logo.
                // El cursor (event.clientX, event.clientY) es relativo al viewport.
                
                // Centro de la pupila (en su posición CSS original) relativo al viewport
                const pupilInitialX_viewport = logoRect.left + pupil.offsetLeft + pupil.offsetWidth / 2;
                const pupilInitialY_viewport = logoRect.top + pupil.offsetTop + pupil.offsetHeight / 2;

                const deltaX = event.clientX - pupilInitialX_viewport;
                const deltaY = event.clientY - pupilInitialY_viewport;
                
                const angle = Math.atan2(deltaY, deltaX);
                
                // Limitar la distancia de movimiento
                // La 'fuerza' del seguimiento puede ajustarse dividiendo deltaX/Y o la distancia.
                // Aquí, simplemente usamos un desplazamiento máximo (MAX_PUPIL_TRANSLATE).
                const distance = Math.min(MAX_PUPIL_TRANSLATE, Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 15); // El divisor (15) reduce la sensibilidad

                const moveX = Math.cos(angle) * distance;
                const moveY = Math.sin(angle) * distance;

                pupil.style.transform = `translate(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px)`;
            });
        }

        function resetPupilsPosition() {
            leftPupil.style.transform = 'translate(0px, 0px)';
            rightPupil.style.transform = 'translate(0px, 0px)';
        }

        function startFollowingMouse() {
            if (isFollowingEyes) return; // Ya está siguiendo
            isFollowingEyes = true;
            // console.log("Eyes: Start following mouse.");
            document.addEventListener('mousemove', movePupilsToMouse);

            // Detener el seguimiento después de un tiempo aleatorio
            clearTimeout(followTimeoutId);
            followTimeoutId = setTimeout(() => {
                stopFollowingMouse();
                scheduleNextActivation(); // Programar la próxima vez que "despertarán"
            }, Math.random() * 7000 + 5000); // Sigue entre 5 y 12 segundos
        }

        function stopFollowingMouse() {
            if (!isFollowingEyes) return; // Ya está detenido
            isFollowingEyes = false;
            document.removeEventListener('mousemove', movePupilsToMouse);
            resetPupilsPosition();
            // console.log("Eyes: Stopped following. Reset to neutral.");
        }

        function scheduleNextActivation() {
            clearTimeout(idleTimeoutId);
            idleTimeoutId = setTimeout(() => {
                startFollowingMouse();
            }, Math.random() * 12000 + 8000); // Se activa de nuevo entre 8 y 20 segundos después
            // console.log("Eyes: Scheduled next activation.");
        }

        // Iniciar el ciclo
        scheduleNextActivation(); // La primera activación será después de un retardo aleatorio.
                                  // Si quieres que empiece a seguir antes o inmediatamente al cargar:
                                  // setTimeout(startFollowingMouse, 2000); // Empieza a seguir después de 2s, por ejemplo
    }

});
