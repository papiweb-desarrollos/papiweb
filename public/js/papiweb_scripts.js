class MediaExplorer {
    constructor() {
        this.mediaGrid = document.getElementById('mediaGrid');
        this.mediaModal = document.getElementById('mediaModal');
        this.modalContent = document.getElementById('modalContent');
        this.currentTab = 'images'; // Pestaña por defecto
        this.mediaCache = { images: [], videos: [] };
        this.playHistory = new Set(); // Para rastrear la reproducción
        this.setupEventListeners();
        this.loadMedia();
    }

    setupEventListeners() {
        // Cerrar modal con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.mediaModal.classList.contains('active')) {
                this.closeModal();
            }
        });

        // Manejadores para los tabs (Imágenes/Videos)
        const tabs = document.querySelectorAll('.media-explorer-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.switchTab(tab.dataset.type);
            });
        });

        // Cerrar modal al hacer clic fuera del contenido o en el botón de cerrar
        if (this.mediaModal) {
            const closeButton = this.mediaModal.querySelector('.close-modal');
            if (closeButton) {
                closeButton.addEventListener('click', () => this.closeModal());
            }
            this.mediaModal.addEventListener('click', (e) => {
                if (e.target === this.mediaModal) { // Clic fuera del contenido del modal
                    this.closeModal();
                }
            });
        }
    }

    async loadMedia() {
        try {
            const response = await fetch('http://localhost:3000/api/media');
            if (!response.ok) {
                console.error('Error al cargar los medios, estado:', response.status);
                throw new Error(`Error al cargar los medios: ${response.statusText}`);
            }
            const data = await response.json();
            
            const sortByDate = (a, b) => new Date(b.dateCreated) - new Date(a.dateCreated);
            this.mediaCache = {
                images: (data.images || []).sort(sortByDate),
                videos: (data.videos || []).sort(sortByDate)
            };
            
            // Opcional: Barajar si se desea un orden aleatorio inicial
            // this.shuffleArray(this.mediaCache.images);
            // this.shuffleArray(this.mediaCache.videos);
            this.renderThumbnails();
        } catch (error) {
            console.error('Error cargando medios desde /api/media:', error);
            this.mediaGrid.innerHTML = '<p>No se pudieron cargar los medios. Intenta de nuevo más tarde.</p>';
        }
    }

    getFileName(src) {
        if (!src) return 'Archivo multimedia';
        const parts = src.split('/');
        return parts[parts.length - 1];
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    renderThumbnails() {
        const mediaList = this.mediaCache[this.currentTab] || [];
        this.mediaGrid.innerHTML = '';

        if (mediaList.length === 0) {
            this.mediaGrid.innerHTML = `<p>No hay ${this.currentTab === 'images' ? 'imágenes' : 'videos'} disponibles en esta categoría.</p>`;
            return;
        }

        mediaList.forEach(media => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'thumbnail';
            thumbnail.onclick = () => this.openMedia(media);

            const img = document.createElement('img');
            img.alt = media.title || this.getFileName(media.src);
            
            if (media.type === 'video') {
                img.src = media.thumbnail || '/public/branding/video_placeholder.png'; // Usar placeholder si no hay thumbnail
                img.onerror = () => { img.src = '/public/branding/video_placeholder.png'; }; // Fallback si el thumbnail falla

                const playIcon = document.createElement('i');
                playIcon.className = 'fas fa-play play-icon';
                thumbnail.appendChild(playIcon);
            } else {
                img.src = media.src;
                img.onerror = () => { img.src = '/public/branding/image_placeholder.png'; }; // Fallback si la imagen falla
            }
            thumbnail.appendChild(img);

            const title = document.createElement('div');
            title.className = 'media-title';
            title.textContent = media.title || this.getFileName(media.src);
            thumbnail.appendChild(title);

            this.mediaGrid.appendChild(thumbnail);
        });
    }

    openMedia(media) {
        this.modalContent.innerHTML = ''; // Limpiar contenido anterior
        let mediaElement;

        if (media.type === 'image') {
            mediaElement = document.createElement('img');
            mediaElement.src = media.src;
            mediaElement.alt = media.title || this.getFileName(media.src);
            mediaElement.className = 'modal-media-item';
        } else if (media.type === 'video') {
            mediaElement = document.createElement('video');
            mediaElement.src = media.src;
            mediaElement.controls = true;
            mediaElement.autoplay = true;
            mediaElement.className = 'modal-media-item';
            mediaElement.onended = () => this.playNextRandom(); // Reproducir siguiente al terminar
        }
        
        if (mediaElement) {
            this.modalContent.appendChild(mediaElement);
            this.mediaModal.classList.add('active');
            this.playHistory.add(media.src); // Añadir al historial
        }
    }

    closeModal() {
        const videoElement = this.modalContent.querySelector('video');
        if (videoElement) {
            videoElement.pause(); // Pausar video al cerrar
            videoElement.currentTime = 0;
        }
        this.mediaModal.classList.remove('active');
        this.modalContent.innerHTML = ''; // Limpiar para liberar memoria
    }

    switchTab(type) {
        this.currentTab = type;
        this.renderThumbnails();
    }

    playNextRandom() {
        const availableMedia = this.mediaCache[this.currentTab].filter(m => !this.playHistory.has(m.src));
        if (availableMedia.length > 0) {
            const nextMedia = availableMedia[Math.floor(Math.random() * availableMedia.length)];
            this.openMedia(nextMedia);
        } else {
            // Opcional: Reiniciar historial si todo se ha reproducido
            // this.playHistory.clear(); 
            this.closeModal(); // O simplemente cerrar si no hay más
        }
    }
}

// Clase LogoSpinner (Placeholder - necesitaría el código original)
class LogoSpinner {
    constructor(logoId, spinInterval = 10000, smartSpin = true) {
        this.logo = document.getElementById(logoId);
        if (!this.logo) {
            console.error('Logo element not found:', logoId);
            return;
        }
        this.spinInterval = spinInterval;
        this.smartSpin = smartSpin;
        this.scrollTimeout = null;
        this.randomIntervalId = null;

        this.init();
    }

    init() {
        // Lógica de inicialización del LogoSpinner
        // Ejemplo: this.logo.addEventListener('click', () => this.spin());
        if (this.smartSpin) {
            window.addEventListener('scroll', () => this.handleScroll());
            this.randomIntervalId = setInterval(() => this.spinRandomly(), this.spinInterval + Math.random() * 5000);
        }
        console.log('LogoSpinner initialized for:', this.logo.id);
    }

    spin() {
        if (!this.logo) return;
        this.logo.classList.add('spin-animation');
        setTimeout(() => {
            if (this.logo) this.logo.classList.remove('spin-animation');
        }, 1000); // Duración de la animación
    }

    handleScroll() {
        if (!this.logo) return;
        clearTimeout(this.scrollTimeout);
        this.logo.classList.remove('spin-animation'); // Detener si está girando
        this.scrollTimeout = setTimeout(() => {
            this.spin();
        }, 200); // Girar si se detiene el scroll por 200ms
    }
    
    spinRandomly() {
        if (Math.random() < 0.3) { // 30% de probabilidad de girar
            this.spin();
        }
    }
}


// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const mediaExplorer = new MediaExplorer();
    const logoSpinner = new LogoSpinner('floatingLogo'); // Asume que el ID del logo es 'floatingLogo'

    // Lógica del modal de contacto (Placeholder)
    const contactButton = document.getElementById('contactButton');
    const contactModal = document.getElementById('contactModal');
    const closeModalButton = document.querySelector('.contact-modal .close-modal');

    if (contactButton && contactModal) {
        contactButton.addEventListener('click', () => {
            contactModal.classList.add('active');
        });
    }
    if (closeModalButton && contactModal) {
        closeModalButton.addEventListener('click', () => {
            contactModal.classList.remove('active');
        });
    }
    if (contactModal) {
        contactModal.addEventListener('click', (e) => {
            if (e.target === contactModal) {
                contactModal.classList.remove('active');
            }
        });
    }
    
    // Otros scripts de inicialización pueden ir aquí
});
