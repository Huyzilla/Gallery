document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.querySelector('.close');
    const navBtns = document.querySelectorAll('.nav-btn');
    const passwordModal = document.getElementById('passwordModal');
    const passwordInput = document.getElementById('passwordInput');
    const submitPassword = document.getElementById('submitPassword');
    const passwordError = document.getElementById('passwordError');
    const folderNameDisplay = document.querySelector('.folder-name');
    const togglePassword = document.getElementById('togglePassword');
    
    let selectedCategory = null;
    let isPasswordVisible = false;

    // Function to check if we're running on Netlify
    function isNetlify() {
        return window.location.hostname.includes('netlify.app');
    }

    // Function to get the correct base path
    function getBasePath() {
        return isNetlify() ? '' : '.';
    }

    // Background effects
    function createSparkles() {
        const sparklesContainer = document.querySelector('.sparkles');
        for (let i = 0; i < 50; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = `${Math.random() * 100}%`;
            sparkle.style.top = `${Math.random() * 100}%`;
            sparkle.style.animationDelay = `${Math.random() * 2}s`;
            sparklesContainer.appendChild(sparkle);
        }
    }

    function createFallingItems() {
        const container = document.querySelector('.falling-items');
        const items = ['🌸', '🍂', '🌺', '🍁', '🌹', '🌷', '🐥', '👨‍👩‍👧‍👦', '🍇', '⚽️', '👣'];
        
        setInterval(() => {
            const item = document.createElement('div');
            item.className = 'falling-item';
            item.textContent = items[Math.floor(Math.random() * items.length)];
            item.style.left = `${Math.random() * 100}%`;
            item.style.animationDuration = `${Math.random() * 3 + 4}s`;
            container.appendChild(item);
            
            setTimeout(() => item.remove(), 7000);
        }, 300);
    }

    // Initialize background effects
    createSparkles();
    createFallingItems();

    // Function to create image element with fade-in animation
    function createImageElement(src, category) {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.src = src;
        img.alt = `${category} photo`;
        img.loading = 'lazy';
        
        img.onerror = () => {
            div.remove();
        };
        
        div.appendChild(img);
        return div;
    }

    // Function to load images from a specific category
    function loadImages(category) {
        gallery.style.display = 'grid';
        gallery.innerHTML = '';
        
        // Get the list of images directly from the directory
        fetch(`${getBasePath()}/images/${category}/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load images');
                }
                return response.text();
            })
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const links = Array.from(doc.querySelectorAll('a'))
                    .filter(a => {
                        const href = a.getAttribute('href');
                        return href && /\.(jpg|jpeg|png|gif|webp)$/i.test(href);
                    })
                    .map(a => a.getAttribute('href'));

                if (links.length === 0) {
                    // If no images found through directory listing, try loading known image extensions
                    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
                    const imagePromises = [];
                    
                    imageExtensions.forEach(ext => {
                        const images = document.createElement('div');
                        images.innerHTML = '';
                        
                        // Try to load all images with index 1-50 for each extension
                        for (let i = 1; i <= 50; i++) {
                            const imgPath = `${getBasePath()}/images/${category}/${i}${ext}`;
                            const img = document.createElement('img');
                            img.src = imgPath;
                            
                            const promise = new Promise((resolve) => {
                                img.onload = () => resolve(imgPath);
                                img.onerror = () => resolve(null);
                            });
                            imagePromises.push(promise);
                        }
                    });
                    
                    return Promise.all(imagePromises).then(paths => {
                        return paths.filter(path => path !== null);
                    });
                }
                
                return links.map(href => `${getBasePath()}/images/${category}/${href}`);
            })
            .then(imagePaths => {
                if (imagePaths.length === 0) {
                    throw new Error('No images found');
                }
                
                imagePaths.forEach(path => {
                    const imageElement = createImageElement(path, category);
                    gallery.appendChild(imageElement);

                    const delay = gallery.children.length * 100;
                    setTimeout(() => {
                        imageElement.style.opacity = '1';
                        imageElement.style.transform = 'translateY(0)';
                    }, delay);
                });
            })
            .catch(error => {
                console.error('Error loading images:', error);
                gallery.innerHTML = '<p style="text-align: center; color: #fff; font-size: 1.2rem;">No images found in this category</p>';
            });
    }

    // Zoom functionality
    let currentZoom = 1;
    let isDragging = false;
    let startX, startY, translateX = 0, translateY = 0;

    document.getElementById('zoomIn').addEventListener('click', () => {
        currentZoom = Math.min(currentZoom * 1.2, 3);
        updateZoom();
    });

    document.getElementById('zoomOut').addEventListener('click', () => {
        currentZoom = Math.max(currentZoom / 1.2, 1);
        updateZoom();
    });

    document.getElementById('resetZoom').addEventListener('click', () => {
        currentZoom = 1;
        translateX = 0;
        translateY = 0;
        updateZoom();
    });

    function updateZoom() {
        modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
    }

    // Image dragging functionality
    modalImg.addEventListener('mousedown', (e) => {
        if (currentZoom > 1) {
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            modalImg.style.cursor = 'grabbing';
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateZoom();
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        modalImg.style.cursor = 'move';
    });

    // Password handling for folders
    function showFolderPasswordModal(category) {
        selectedCategory = category;
        passwordModal.style.display = 'flex';
        passwordInput.value = '';
        passwordError.style.display = 'none';
        folderNameDisplay.textContent = `Folder: ${category}`;
        passwordInput.focus();
        resetPasswordVisibility();
    }

    function checkFolderPassword() {
        let correctPassword;
        
        switch(selectedCategory) {
            case 'lover':
                correctPassword = '30121802';
                break;
            case 'Me':
                correctPassword = '280920032004';
                break;
            case 'Relatives':
                correctPassword = '280726';
                break;
            case 'Undergraduate & Graduate':
                correctPassword = '280904';
                break;
            default:
                correctPassword = '';
        }
        
        if (passwordInput.value === correctPassword) {
            passwordModal.style.display = 'none';
            loadImages(selectedCategory);
            passwordError.style.display = 'none';
            
            // Update active button
            navBtns.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.category === selectedCategory) {
                    btn.classList.add('active');
                }
            });
        } else {
            passwordError.textContent = 'Incorrect password';
            passwordError.style.display = 'block';
            passwordInput.value = '';
        }
    }

    // Modal functionality
    function openModal(imgSrc) {
        modal.style.display = 'flex';
        modalImg.src = imgSrc;
        currentZoom = 1;
        translateX = 0;
        translateY = 0;
        updateZoom();
    }

    function closeModal() {
        modal.style.display = 'none';
        currentZoom = 1;
        translateX = 0;
        translateY = 0;
    }

    // Event listeners
    gallery.addEventListener('click', (e) => {
        const clickedElement = e.target;
        if (clickedElement.tagName === 'IMG') {
            openModal(clickedElement.src);
        }
    });

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            passwordModal.style.display = 'none';
            resetPasswordVisibility();
        }
    });

    // Add click event to navigation buttons
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showFolderPasswordModal(btn.dataset.category);
        });
    });

    // Handle password submission
    submitPassword.addEventListener('click', checkFolderPassword);
    passwordInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            checkFolderPassword();
        }
    });

    // Password visibility toggle
    togglePassword.addEventListener('click', () => {
        isPasswordVisible = !isPasswordVisible;
        passwordInput.type = isPasswordVisible ? 'text' : 'password';
        togglePassword.classList.toggle('show');
        togglePassword.querySelector('i').className = isPasswordVisible ? 'fas fa-eye-slash' : 'fas fa-eye';
    });

    // Reset password visibility when modal closes
    function resetPasswordVisibility() {
        isPasswordVisible = false;
        passwordInput.type = 'password';
        togglePassword.classList.remove('show');
        togglePassword.querySelector('i').className = 'fas fa-eye';
    }

    // Music Player
    const playlist = [
        {
            title: 'A Thousand Years',
            artist: 'Christina Perri',
            file: `${getBasePath()}/music/A Thousand Years.mp3`
        },
        {
            title: 'Canon in D',
            artist: 'Johann Pachelbel',
            file: `${getBasePath()}/music/Canon in D.mp3`
        },
        {
            title: 'Kiss The Rain',
            artist: 'Yiruma',
            file: `${getBasePath()}/music/Kiss The Rain.mp3`
        },
        {
            title: 'River Flows in You',
            artist: 'Yiruma',
            file: `${getBasePath()}/music/River Flows in You.mp3`
        },
        {
            title: 'No Surprises',
            artist: 'Yiruma',
            file: `${getBasePath()}/music/No Surprises.mp3`
        },
        {
            title: 'About You',
            artist: 'The 1975',
            file: `${getBasePath()}/music/About You - The 1975.mp3`
        },
        {
            title: 'Photograph',
            artist: 'Ed Sheeran',
            file: `${getBasePath()}/music/Photograph.mp3`
        },
        {
            title: 'Giấc mơ',
            artist: 'Tùng',
            file: `${getBasePath()}/music/Giấc mơ.mp3`
        },
        {
            title: 'Đoạn kết',
            artist: 'Em Ellata',
            file: `${getBasePath()}/music/Đoạn kết.mp3`
        },
        {
            title: 'Everything will be okay',
            artist: 'HIEUTHUHAI',
            file: `${getBasePath()}/music/Everything will be okay.mp3`
        }
    ];

    let currentTrack = 0;
    let isPlaying = false;
    const audio = new Audio();
    audio.volume = 0.5;

    // Music Player Elements
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const progressBar = document.querySelector('.progress');
    const currentTimeSpan = document.getElementById('currentTime');
    const durationSpan = document.getElementById('duration');
    const songTitle = document.getElementById('songTitle');
    const artistName = document.getElementById('artist');

    function loadTrack(trackIndex) {
        const track = playlist[trackIndex];
        audio.src = track.file;
        songTitle.textContent = track.title;
        artistName.textContent = track.artist;
        
        // Always try to play when loading a track
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                updatePlayButton();
            }).catch(error => {
                console.error('Error playing audio:', error);
                isPlaying = false;
                updatePlayButton();
            });
        }
    }

    function updatePlayButton() {
        const icon = playBtn.querySelector('i');
        icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    function updateProgress() {
        if (audio.duration) {
            const percent = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = `${percent}%`;
            currentTimeSpan.textContent = formatTime(audio.currentTime);
            durationSpan.textContent = formatTime(audio.duration);
        }
    }

    // Event Listeners for Music Player
    playBtn.addEventListener('click', () => {
        if (audio.src) {
            if (isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
            isPlaying = !isPlaying;
            updatePlayButton();
        }
    });

    prevBtn.addEventListener('click', () => {
        currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrack);
    });

    nextBtn.addEventListener('click', () => {
        currentTrack = (currentTrack + 1) % playlist.length;
        loadTrack(currentTrack);
    });

    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value / 100;
    });

    const progressContainer = document.querySelector('.progress-bar');
    progressContainer.addEventListener('click', (e) => {
        const percent = e.offsetX / progressContainer.offsetWidth;
        audio.currentTime = percent * audio.duration;
    });

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => {
        currentTrack = (currentTrack + 1) % playlist.length;
        loadTrack(currentTrack);
    });

    audio.addEventListener('play', () => {
        isPlaying = true;
        updatePlayButton();
    });

    audio.addEventListener('pause', () => {
        isPlaying = false;
        updatePlayButton();
    });

    audio.addEventListener('loadedmetadata', () => {
        durationSpan.textContent = formatTime(audio.duration);
    });

    // Initialize music player with autoplay
    function initializeMusic() {
        loadTrack(0);
        
        // Try to autoplay with user interaction
        const startMusic = () => {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        isPlaying = true;
                        updatePlayButton();
                    })
                    .catch(error => {
                        console.error('Playback failed:', error);
                        isPlaying = false;
                        updatePlayButton();
                    });
            }
            
            ['click', 'touchstart', 'keydown'].forEach(event => {
                document.removeEventListener(event, startMusic);
            });
        };
        
        ['click', 'touchstart', 'keydown'].forEach(event => {
            document.addEventListener(event, startMusic, { once: true });
        });
    }

    // Start music as soon as possible
    if (document.readyState === 'complete') {
        initializeMusic();
    } else {
        window.addEventListener('load', initializeMusic);
    }

    // Initially hide the gallery
    gallery.style.display = 'none';
});
