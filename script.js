console.log("🎵 Spotify Clone - Local + Online Music!");

// ============================
// CONFIGURATION - MULTIPLE API OPTIONS
// ============================
const API_CONFIGS = {
    deezer: {
        base: 'https://api.deezer.com',
        proxies: [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://api.codetabs.com/v1/proxy?quest='
        ]
    },
    itunes: {
        base: 'https://itunes.apple.com',
        needsProxy: false
    }
};

let currentProxyIndex = 0;

// ============================
// GLOBAL VARIABLES
// ============================
let currentSong = null;
let currentPlaylist = [];
let songIndex = 0;
let audioElement = new Audio();
let isShuffleOn = false;
let isRepeatOn = false;
let likedSongs = new Set();
let allLocalSongs = [];

// DOM Elements
const masterPlay = document.getElementById('masterPlay');
const myProgressBar = document.getElementById('myProgressBar');
const masterSongName = document.getElementById('masterSongName');
const masterArtistName = document.getElementById('masterArtistName');
const songCover = document.getElementById('songCover');
const likeCurrentBtn = document.getElementById('likeCurrentBtn');
const currentTimeDisplay = document.getElementById('currentTime');
const totalTimeDisplay = document.getElementById('totalTime');
const volumeSlider = document.getElementById('volumeSlider');
const volumePercent = document.getElementById('volumePercent');
const volumeIcon = document.getElementById('volumeIcon');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const songTypeBadge = document.getElementById('songTypeBadge');

// ============================
// LOCAL SONGS DATA
// ============================
const localFolders = {
    bollywood: {
        name: "Bollywood Hits 🇮🇳",
        color: "bollywood",
        icon: "🎵",
        songs: [
            { id: 'local-1', name: "Jaadugar", artist: "Arijit Singh", filepath: "songs/4.mp3", coverPath: "covers/4.jpg", duration: "3:12", type: 'local' },
            { id: 'local-2', name: "Aashiqui2", artist: "Arijit Singh", filepath: "songs/5.mp3", coverPath: "covers/9.jpg", duration: "4:59", type: 'local' },
            { id: 'local-3', name: "Jeena Haraam", artist: "Neha Kakkar", filepath: "songs/6.mp3", coverPath: "covers/6.jpg", duration: "2:35", type: 'local' },
            { id: 'local-4', name: "Toota Dil", artist: "Atif Aslam", filepath: "songs/9.mp3", coverPath: "covers/5.jpg", duration: "4:26", type: 'local' },
            { id: 'local-5', name: "Aashiqui2 (Hum tere bin)", artist: "Arijit Singh", filepath: "songs/10.mp3", coverPath: "covers/9.jpg", duration: "4:22", type: 'local' }
        ]
    },
    english: {
        name: "English Collection 🎧",
        color: "english",
        icon: "🎸",
        songs: [
            { id: 'local-6', name: "Movement", artist: "Hozier", filepath: "songs/1.mp3", coverPath: "covers/1.jpg", duration: "2:11", type: 'local' },
            { id: 'local-7', name: "Sunrise", artist: "Norah Jones", filepath: "songs/2.mp3", coverPath: "covers/2.jpg", duration: "2:35", type: 'local' },
            { id: 'local-8', name: "Feel the Song", artist: "The Weeknd", filepath: "songs/7.mp3", coverPath: "covers/7.jpg", duration: "3:05", type: 'local' }
        ]
    },
    party: {
        name: "Party Mix 🎉",
        color: "party",
        icon: "🔥",
        songs: [
            { id: 'local-9', name: "Dj Beat", artist: "Calvin Harris", filepath: "songs/3.mp3", coverPath: "covers/3.jpg", duration: "2:08", type: 'local' },
            { id: 'local-10', name: "Dj Upbeats", artist: "David Guetta", filepath: "songs/8.mp3", coverPath: "covers/8.jpg", duration: "2:43", type: 'local' }
        ]
    }
};

// Flatten all local songs
allLocalSongs = Object.values(localFolders).flatMap(folder => folder.songs);

// ============================
// INITIALIZATION
// ============================
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    renderLocalFolders();
    updateSongCount();
    loadLikedSongs();
    setupEventListeners();
    updateLikedDisplay();
    
    // Set initial volume
    audioElement.volume = 0.7;
    
    console.log("✅ Spotify Clone Initialized!");
    console.log("📡 Testing API connection...");
    testAPIConnection();
});

// ============================
// API CONNECTION TEST
// ============================
async function testAPIConnection() {
    console.log("🔍 Testing iTunes API...");
    try {
        const response = await fetch('https://itunes.apple.com/search?term=arijit&limit=5&media=music');
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            console.log("✅ iTunes API working!");
            showToast('Online music ready!');
        }
    } catch (error) {
        console.error("❌ API connection failed:", error);
        showToast('Online features may be limited');
    }
}

// ============================
// AUTHENTICATION
// ============================
function checkAuth() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
        window.location.href = 'login.html';
        return false;
    }
    
    const userData = JSON.parse(user);
    document.getElementById('userName').textContent = userData.name || userData.email || 'Music Lover';
    return true;
}

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('likedSongs');
    window.location.href = 'login.html';
});

// ============================
// UI RENDERING
// ============================
function updateSongCount() {
    document.getElementById('songCount').textContent = `${allLocalSongs.length} local songs`;
}

function renderLocalFolders() {
    const container = document.getElementById('localFoldersContainer');
    container.innerHTML = '';

    Object.entries(localFolders).forEach(([folderId, folder]) => {
        const folderDiv = document.createElement('div');
        folderDiv.className = 'folder-section';
        folderDiv.innerHTML = `
            <div class="folder-header ${folder.color}" data-folder="${folderId}">
                <div class="folder-header-content">
                    <div class="folder-info">
                        <div class="folder-icon">${folder.icon}</div>
                        <div>
                            <div class="folder-title">${folder.name}</div>
                            <div class="folder-count">${folder.songs.length} tracks</div>
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-down folder-arrow"></i>
                </div>
            </div>
            <div class="folder-songs" id="folder-${folderId}">
                ${folder.songs.map((song, index) => createSongItem(song, index + 1)).join('')}
            </div>
        `;
        container.appendChild(folderDiv);
    });

    setupFolderListeners();
    setupSongListeners();
}

function createSongItem(song, number) {
    const isLiked = likedSongs.has(song.id);
    const songType = song.type === 'local' ? 'LOCAL' : 'ONLINE';
    const badgeClass = song.type === 'local' ? 'badge-local' : 'badge-online';
    
    return `
        <div class="song-item ${currentSong?.id === song.id ? 'playing' : ''}" data-song-id="${song.id}">
            <div class="song-number">${number}</div>
            <div class="song-cover-small">
                ${song.coverPath ? `<img src="${song.coverPath}" alt="${song.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
                <i class="fa-solid fa-music" style="${song.coverPath ? 'display:none;' : ''}"></i>
                <div class="playing-indicator">
                    <div class="playing-bar"></div>
                    <div class="playing-bar"></div>
                    <div class="playing-bar"></div>
                </div>
            </div>
            <div class="song-info-item">
                <div class="song-name">${song.name}</div>
                <div class="song-artist">${song.artist}</div>
            </div>
            <span class="song-type-badge ${badgeClass}">${songType}</span>
            <button class="song-like-btn ${isLiked ? 'liked' : ''}" data-song-id="${song.id}">
                <i class="fa-${isLiked ? 'solid' : 'regular'} fa-heart"></i>
            </button>
            <div class="song-duration">
                <i class="fa-regular fa-clock"></i>
                <span>${song.duration}</span>
            </div>
        </div>
    `;
}

function setupFolderListeners() {
    document.querySelectorAll('.folder-header').forEach(header => {
        header.addEventListener('click', () => {
            const folderId = header.getAttribute('data-folder');
            const folderSongs = document.getElementById(`folder-${folderId}`);
            const arrow = header.querySelector('.folder-arrow');
            
            folderSongs.classList.toggle('open');
            arrow.classList.toggle('rotated');
        });
    });
}

// ============================
// MUSIC PLAYER FUNCTIONS
// ============================
function playSong(song, playlist = null) {
    currentSong = song;
    
    // Set the playlist correctly
    if (playlist && playlist.length > 0) {
        currentPlaylist = playlist;
        songIndex = playlist.findIndex(s => s.id === song.id);
    } else {
        // If no playlist provided, use appropriate default based on song type
        if (song.type === 'online') {
            // For online songs, use online songs array
            const onlineSongs = [...(window.onlineSongs || []), ...(window.trendingSongs || [])];
            currentPlaylist = onlineSongs;
            songIndex = onlineSongs.findIndex(s => s.id === song.id);
        } else {
            // For local songs, use local songs
            currentPlaylist = allLocalSongs;
            songIndex = allLocalSongs.findIndex(s => s.id === song.id);
        }
    }
    
    console.log('🎵 Playing:', song.name);
    console.log('📋 Playlist type:', song.type);
    console.log('📊 Playlist length:', currentPlaylist.length);
    console.log('🔢 Current index:', songIndex);
    
    // Set audio source
    if (song.type === 'local') {
        audioElement.src = song.filepath;
    } else {
        audioElement.src = song.preview;
    }
    
    audioElement.play().catch(err => {
        console.error('Playback error:', err);
        showToast('Error playing song');
    });
    
    // Show preview notification for online songs
    if (song.type === 'online') {
        setTimeout(() => {
            showToast('🎵 Playing 30-second preview');
        }, 500);
    }
    
    // Update UI
    masterSongName.textContent = song.name;
    masterArtistName.textContent = song.artist;
    
    // Update cover
    if (song.coverPath) {
        songCover.innerHTML = `<img src="${song.coverPath}" alt="${song.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fa-solid fa-music\\'></i>';">`;
    } else {
        songCover.innerHTML = '<i class="fa-solid fa-music"></i>';
    }
    
    // Update type badge
    if (song.type === 'local') {
        songTypeBadge.textContent = 'LOCAL';
        songTypeBadge.className = 'song-badge badge-local';
        songTypeBadge.style.display = 'inline-block';
    } else {
        songTypeBadge.textContent = 'ONLINE';
        songTypeBadge.className = 'song-badge badge-online';
        songTypeBadge.style.display = 'inline-block';
    }
    
    masterPlay.querySelector('i').classList.remove('fa-circle-play');
    masterPlay.querySelector('i').classList.add('fa-circle-pause');
    
    updatePlayingIndicators();
    updateCurrentSongLikeButton();
    
    showToast(`Now playing: ${song.name}`);
}

function togglePlay() {
    if (!currentSong) {
        if (allLocalSongs.length > 0) {
            playSong(allLocalSongs[0]);
        }
        return;
    }
    
    if (audioElement.paused) {
        audioElement.play();
        masterPlay.querySelector('i').classList.remove('fa-circle-play');
        masterPlay.querySelector('i').classList.add('fa-circle-pause');
    } else {
        audioElement.pause();
        masterPlay.querySelector('i').classList.remove('fa-circle-pause');
        masterPlay.querySelector('i').classList.add('fa-circle-play');
    }
}

function handleNext() {
    if (!currentSong || currentPlaylist.length === 0) return;
    
    let nextIndex;
    if (isShuffleOn) {
        nextIndex = Math.floor(Math.random() * currentPlaylist.length);
    } else {
        nextIndex = (songIndex + 1) % currentPlaylist.length;
    }
    
    playSong(currentPlaylist[nextIndex], currentPlaylist);
}

function handlePrevious() {
    if (!currentSong || currentPlaylist.length === 0) return;
    
    let prevIndex = (songIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    playSong(currentPlaylist[prevIndex], currentPlaylist);
}

function updatePlayingIndicators() {
    document.querySelectorAll('.song-item').forEach(item => {
        item.classList.remove('playing');
    });
    
    if (currentSong) {
        const currentItem = document.querySelector(`.song-item[data-song-id="${currentSong.id}"]`);
        if (currentItem) {
            currentItem.classList.add('playing');
        }
    }
}

function updateCurrentSongLikeButton() {
    if (!currentSong) return;
    
    const isLiked = likedSongs.has(currentSong.id);
    const icon = likeCurrentBtn.querySelector('i');
    
    if (isLiked) {
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
        likeCurrentBtn.classList.add('liked');
    } else {
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
        likeCurrentBtn.classList.remove('liked');
    }
}

// ============================
// LIKE FUNCTIONALITY
// ============================
function toggleLike(songId) {
    if (likedSongs.has(songId)) {
        likedSongs.delete(songId);
        showToast('Removed from liked songs');
    } else {
        likedSongs.add(songId);
        showToast('Added to liked songs');
    }
    
    saveLikedSongs();
    updateAllLikeButtons(songId);
    updateLikedDisplay();
    
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab.id === 'likedTab') {
        renderLikedSongs();
    }
}

function updateAllLikeButtons(songId) {
    const isLiked = likedSongs.has(songId);
    
    document.querySelectorAll(`.song-like-btn[data-song-id="${songId}"]`).forEach(btn => {
        const icon = btn.querySelector('i');
        if (isLiked) {
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            btn.classList.add('liked');
        } else {
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
            btn.classList.remove('liked');
        }
    });
    
    if (currentSong && currentSong.id === songId) {
        updateCurrentSongLikeButton();
    }
}

function saveLikedSongs() {
    const likedArray = [...likedSongs];
    localStorage.setItem('likedSongs', JSON.stringify(likedArray));
    console.log("💾 Saved liked songs:", likedArray);
    
    // Also save the actual song data for offline access
    const allAvailableSongs = [
        ...allLocalSongs,
        ...(window.onlineSongs || []),
        ...(window.trendingSongs || [])
    ];
    
    const likedSongsData = allAvailableSongs.filter(song => likedSongs.has(song.id));
    localStorage.setItem('likedSongsData', JSON.stringify(likedSongsData));
    console.log("💾 Saved liked songs data:", likedSongsData.length, "songs");
}

function loadLikedSongs() {
    const saved = localStorage.getItem('likedSongs');
    if (saved) {
        likedSongs = new Set(JSON.parse(saved));
        console.log("📂 Loaded liked songs:", likedSongs.size);
    }
    
    // Load liked songs data
    const savedData = localStorage.getItem('likedSongsData');
    if (savedData) {
        const likedData = JSON.parse(savedData);
        console.log("📂 Loaded liked songs data:", likedData.length, "songs");
        
        // Store in global array for access
        window.savedLikedSongs = likedData;
    }
}

function updateLikedDisplay() {
    document.getElementById('likedBadge').textContent = likedSongs.size;
    document.getElementById('likedCount').textContent = `${likedSongs.size} songs`;
}

function renderLikedSongs() {
    const likedList = document.getElementById('likedSongsList');
    const noLiked = document.getElementById('noLiked');
    
    console.log("❤️ Rendering liked songs...");
    console.log("📊 Total liked:", likedSongs.size);
    console.log("🔢 Liked IDs:", [...likedSongs]);
    
    // Collect all songs from all sources including saved data
    const allAvailableSongs = [
        ...allLocalSongs,
        ...(window.onlineSongs || []),
        ...(window.trendingSongs || []),
        ...(window.savedLikedSongs || []) // Include previously saved liked songs
    ];
    
    // Remove duplicates based on ID
    const uniqueSongs = [];
    const seenIds = new Set();
    allAvailableSongs.forEach(song => {
        if (!seenIds.has(song.id)) {
            seenIds.add(song.id);
            uniqueSongs.push(song);
        }
    });
    
    console.log("📚 Total unique songs:", uniqueSongs.length);
    
    // Filter liked songs
    const likedSongsList = uniqueSongs.filter(song => {
        const isLiked = likedSongs.has(song.id);
        if (isLiked) {
            console.log("✅ Found liked song:", song.name);
        }
        return isLiked;
    });
    
    console.log("💚 Liked songs to display:", likedSongsList.length);
    
    if (likedSongsList.length === 0) {
        likedList.style.display = 'none';
        noLiked.style.display = 'block';
        return;
    }
    
    likedList.style.display = 'block';
    noLiked.style.display = 'none';
    likedList.innerHTML = likedSongsList.map((song, index) => createSongItem(song, index + 1)).join('');
    setupSongListeners();
}

// ============================
// ONLINE MUSIC API - iTunes (More Reliable)
// ============================
async function searchOnlineMusic(query) {
    if (!query.trim()) {
        document.getElementById('searchResults').innerHTML = '';
        document.getElementById('noResults').style.display = 'none';
        return;
    }
    
    const loader = document.getElementById('searchLoader');
    const results = document.getElementById('searchResults');
    const noResults = document.getElementById('noResults');
    const title = document.getElementById('searchResultTitle');
    
    loader.style.display = 'flex';
    results.innerHTML = '';
    noResults.style.display = 'none';
    title.textContent = `Searching for "${query}"...`;
    
    try {
        console.log("🔍 Searching iTunes API for:", query);
        
        // Using iTunes API (no CORS issues)
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=30&media=music&entity=song`);
        const data = await response.json();
        
        console.log("📡 API Response:", data);
        
        loader.style.display = 'none';
        
        if (data.results && data.results.length > 0) {
            const onlineSongs = data.results.map(track => ({
                id: `online-${track.trackId}`,
                name: track.trackName,
                artist: track.artistName,
                preview: track.previewUrl,
                coverPath: track.artworkUrl100.replace('100x100', '300x300'),
                duration: formatTime(track.trackTimeMillis / 1000),
                type: 'online'
            }));
            
            window.onlineSongs = onlineSongs;
            title.textContent = `Results for "${query}" (${onlineSongs.length} tracks)`;
            results.innerHTML = onlineSongs.map((song, index) => createSongItem(song, index + 1)).join('');
            setupSongListeners();
            
            console.log("✅ Search successful! Found", onlineSongs.length, "songs");
            showToast(`Found ${onlineSongs.length} songs`);
        } else {
            noResults.style.display = 'block';
            title.textContent = `No results for "${query}"`;
            console.log("❌ No results found");
        }
    } catch (error) {
        console.error('❌ Search error:', error);
        loader.style.display = 'none';
        noResults.style.display = 'block';
        title.textContent = 'Error searching music';
        showToast('Error searching. Please try again.');
    }
}

async function loadTrendingMusic() {
    const loader = document.getElementById('trendingLoader');
    const results = document.getElementById('trendingResults');
    
    loader.style.display = 'flex';
    results.innerHTML = '';
    
    try {
        console.log("🔥 Loading trending music from iTunes...");
        
        // Multiple popular queries for better trending results
        const trendingQueries = [
            'top hits 2024',
            'arijit singh',
            'taylor swift',
            'ed sheeran',
            'the weeknd'
        ];
        
        const randomQuery = trendingQueries[Math.floor(Math.random() * trendingQueries.length)];
        console.log("🔍 Using query:", randomQuery);
        
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(randomQuery)}&limit=30&media=music&entity=song`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("📡 Trending API Response:", data);
        
        loader.style.display = 'none';
        
        if (data.results && data.results.length > 0) {
            const trendingSongs = data.results.map(track => ({
                id: `online-${track.trackId}`,
                name: track.trackName,
                artist: track.artistName,
                preview: track.previewUrl,
                coverPath: track.artworkUrl100.replace('100x100', '300x300'),
                duration: formatTime(track.trackTimeMillis / 1000),
                type: 'online'
            }));
            
            window.trendingSongs = trendingSongs;
            results.innerHTML = trendingSongs.map((song, index) => createSongItem(song, index + 1)).join('');
            setupSongListeners();
            
            console.log("✅ Trending loaded! Found", trendingSongs.length, "songs");
            showToast(`Loaded ${trendingSongs.length} trending tracks!`);
        } else {
            throw new Error('No results found');
        }
    } catch (error) {
        console.error('❌ Trending error:', error);
        loader.style.display = 'none';
        results.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-exclamation-triangle"></i>
                <p>Error loading trending music</p>
                <small>Please check your internet connection and try again</small>
                <button onclick="loadTrendingMusic()" style="margin-top: 16px; padding: 12px 24px; background: var(--spotify-green); border: none; border-radius: 24px; color: white; cursor: pointer; font-weight: 600;">
                    <i class="fa-solid fa-rotate-right"></i> Retry
                </button>
            </div>
        `;
        showToast('Error loading trending music');
    }
}

// Make loadTrendingMusic available globally for retry button
window.loadTrendingMusic = loadTrendingMusic;

// ============================
// TAB SWITCHING
// ============================
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.getElementById(`${tabName}Tab`).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    const searchContainer = document.getElementById('searchContainer');
    if (tabName === 'search') {
        searchContainer.classList.add('active');
        searchInput.focus();
    } else {
        searchContainer.classList.remove('active');
    }
    
    if (tabName === 'liked') {
        renderLikedSongs();
    }
    
    if (tabName === 'trending') {
        console.log("🔥 Switching to trending tab...");
        if (!window.trendingSongs || window.trendingSongs.length === 0) {
            console.log("📡 Loading trending for first time...");
            loadTrendingMusic();
        } else {
            console.log("✅ Trending already loaded:", window.trendingSongs.length, "songs");
        }
    }
}

// ============================
// EVENT LISTENERS
// ============================
function setupEventListeners() {
    masterPlay.addEventListener('click', togglePlay);
    document.getElementById('next').addEventListener('click', handleNext);
    document.getElementById('previous').addEventListener('click', handlePrevious);
    
    audioElement.addEventListener('timeupdate', () => {
        if (audioElement.duration) {
            const progress = (audioElement.currentTime / audioElement.duration) * 100;
            myProgressBar.value = progress;
            currentTimeDisplay.textContent = formatTime(audioElement.currentTime);
            totalTimeDisplay.textContent = formatTime(audioElement.duration);
        }
    });
    
    myProgressBar.addEventListener('input', (e) => {
        if (audioElement.duration) {
            const time = (e.target.value / 100) * audioElement.duration;
            audioElement.currentTime = time;
        }
    });
    
    audioElement.addEventListener('ended', () => {
        if (isRepeatOn) {
            audioElement.currentTime = 0;
            audioElement.play();
        } else {
            // Always play next song in current playlist
            if (currentPlaylist.length > 0) {
                if (songIndex >= currentPlaylist.length - 1) {
                    // Loop back to first song of current playlist
                    playSong(currentPlaylist[0], currentPlaylist);
                } else {
                    // Play next song
                    handleNext();
                }
            } else {
                // No playlist - stop
                masterPlay.querySelector('i').classList.remove('fa-circle-pause');
                masterPlay.querySelector('i').classList.add('fa-circle-play');
            }
        }
    });
    
    volumeSlider.addEventListener('input', (e) => {
        const volume = e.target.value;
        audioElement.volume = volume / 100;
        volumePercent.textContent = `${volume}%`;
        updateVolumeIcon(volume);
    });
    
    volumeIcon.addEventListener('click', () => {
        if (audioElement.volume > 0) {
            audioElement.volume = 0;
            volumeSlider.value = 0;
            volumePercent.textContent = '0%';
        } else {
            audioElement.volume = 0.7;
            volumeSlider.value = 70;
            volumePercent.textContent = '70%';
        }
        updateVolumeIcon(volumeSlider.value);
    });
    
    shuffleBtn.addEventListener('click', () => {
        isShuffleOn = !isShuffleOn;
        shuffleBtn.classList.toggle('active', isShuffleOn);
        showToast(isShuffleOn ? 'Shuffle on' : 'Shuffle off');
    });
    
    repeatBtn.addEventListener('click', () => {
        isRepeatOn = !isRepeatOn;
        repeatBtn.classList.toggle('active', isRepeatOn);
        showToast(isRepeatOn ? 'Repeat on' : 'Repeat off');
    });
    
    likeCurrentBtn.addEventListener('click', () => {
        if (currentSong) {
            toggleLike(currentSong.id);
        }
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = item.getAttribute('data-tab');
            switchTab(tab);
        });
    });
    
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchOnlineMusic(e.target.value);
        }, 800);
    });
    
    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        document.getElementById('searchResults').innerHTML = '';
    });
    
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const query = card.getAttribute('data-query');
            searchInput.value = query;
            switchTab('search');
            searchOnlineMusic(query);
        });
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        
        if (e.code === 'Space') {
            e.preventDefault();
            togglePlay();
        } else if (e.code === 'ArrowRight') {
            e.preventDefault();
            handleNext();
        } else if (e.code === 'ArrowLeft') {
            e.preventDefault();
            handlePrevious();
        }
    });
}

function setupSongListeners() {
    document.querySelectorAll('.song-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.song-like-btn')) return;
            
            const songId = item.getAttribute('data-song-id');
            let song;
            let playlist;
            
            if (songId.startsWith('local-')) {
                song = allLocalSongs.find(s => s.id === songId);
                playlist = allLocalSongs;
            } else {
                // Find in online songs
                const allOnline = [
                    ...(window.onlineSongs || []),
                    ...(window.trendingSongs || [])
                ];
                song = allOnline.find(s => s.id === songId);
                playlist = allOnline;
            }
            
            if (song) {
                console.log('🎵 Clicked song:', song.name, 'Type:', song.type);
                console.log('📋 Using playlist length:', playlist.length);
                playSong(song, playlist);
            }
        });
    });
    
    document.querySelectorAll('.song-like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const songId = btn.getAttribute('data-song-id');
            toggleLike(songId);
        });
    });
}

// ============================
// UTILITY FUNCTIONS
// ============================
function formatTime(seconds) {
    if (isNaN(seconds) || seconds === undefined) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateVolumeIcon(volume) {
    const icon = volumeIcon;
    icon.className = 'fa-solid';
    
    if (volume == 0) {
        icon.classList.add('fa-volume-xmark');
    } else if (volume < 50) {
        icon.classList.add('fa-volume-low');
    } else {
        icon.classList.add('fa-volume-high');
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================
// INITIALIZE
// ============================
window.onlineSongs = [];
window.trendingSongs = [];

console.log("✅ All systems ready!");
console.log("🎵 Local songs:", allLocalSongs.length);
console.log("🌐 Online streaming: iTunes API");