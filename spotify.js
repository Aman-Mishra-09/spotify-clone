import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Heart, Shuffle, Repeat, Search, Music, LogOut, User, Loader,
TrendingUp, Disc, Radio } from 'lucide-react';

export default function SpotifyWithAPI() {
const [currentSong, setCurrentSong] = useState(null);
const [isPlaying, setIsPlaying] = useState(false);
const [progress, setProgress] = useState(0);
const [volume, setVolume] = useState(70);
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState([]);
const [likedSongs, setLikedSongs] = useState(new Set());
const [activeTab, setActiveTab] = useState('home');
const [isLoading, setIsLoading] = useState(false);
const [trendingTracks, setTrendingTracks] = useState([]);
const [genres, setGenres] = useState([]);
const audioRef = useRef(null);

const API_BASE = 'https://api.deezer.com';
const CORS_PROXY = 'https://corsproxy.io/?';

// Predefined popular searches
const popularSearches = [
{ name: 'Top Hits 2024', query: 'top hits 2024', icon: '🔥' },
{ name: 'Bollywood Hits', query: 'arijit singh', icon: '🇮🇳' },
{ name: 'Pop Music', query: 'pop music', icon: '🎵' },
{ name: 'Rock Classics', query: 'rock classics', icon: '🎸' },
{ name: 'EDM Party', query: 'edm party', icon: '💃' },
{ name: 'Chill Vibes', query: 'chill music', icon: '😌' }
];

useEffect(() => {
if (audioRef.current) {
audioRef.current.volume = volume / 100;
}
}, [volume]);

useEffect(() => {
const audio = audioRef.current;
if (!audio) return;

const updateProgress = () => {
if (audio.duration) {
setProgress((audio.currentTime / audio.duration) * 100);
}
};

audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', handleNext);

return () => {
audio.removeEventListener('timeupdate', updateProgress);
audio.removeEventListener('ended', handleNext);
};
}, [currentSong]);

useEffect(() => {
loadTrendingMusic();
}, []);

const loadTrendingMusic = async () => {
setIsLoading(true);
try {
// Load chart tracks (trending)
const response = await fetch(`${CORS_PROXY}${API_BASE}/chart/0/tracks?limit=20`);
const data = await response.json();

if (data.data) {
setTrendingTracks(data.data.map(track => ({
id: track.id,
name: track.title,
artist: track.artist.name,
preview: track.preview,
cover: track.album.cover_medium,
duration: formatTime(track.duration)
})));
}
} catch (error) {
console.error('Error loading trending:', error);
}
setIsLoading(false);
};

const searchMusic = async (query) => {
if (!query.trim()) {
setSearchResults([]);
return;
}

setIsLoading(true);
try {
const response = await fetch(`${CORS_PROXY}${API_BASE}/search?q=${encodeURIComponent(query)}&limit=30`);
const data = await response.json();

if (data.data) {
setSearchResults(data.data.map(track => ({
id: track.id,
name: track.title,
artist: track.artist.name,
preview: track.preview,
cover: track.album.cover_medium,
duration: formatTime(track.duration)
})));
}
} catch (error) {
console.error('Error searching:', error);
setSearchResults([]);
}
setIsLoading(false);
};

const playSong = (song) => {
setCurrentSong(song);
setIsPlaying(true);
if (audioRef.current && song.preview) {
audioRef.current.src = song.preview;
audioRef.current.play().catch(err => console.log('Playback error:', err));
}
};

const togglePlay = () => {
if (!currentSong) {
if (trendingTracks.length > 0) {
playSong(trendingTracks[0]);
}
return;
}

if (isPlaying) {
audioRef.current?.pause();
setIsPlaying(false);
} else {
audioRef.current?.play();
setIsPlaying(true);
}
};

const handleNext = () => {
const currentList = activeTab === 'search' ? searchResults : trendingTracks;
if (!currentSong || currentList.length === 0) return;

const currentIndex = currentList.findIndex(s => s.id === currentSong.id);
const nextIndex = (currentIndex + 1) % currentList.length;
playSong(currentList[nextIndex]);
};

const handlePrevious = () => {
const currentList = activeTab === 'search' ? searchResults : trendingTracks;
if (!currentSong || currentList.length === 0) return;

const currentIndex = currentList.findIndex(s => s.id === currentSong.id);
const prevIndex = (currentIndex - 1 + currentList.length) % currentList.length;
playSong(currentList[prevIndex]);
};

const handleProgressChange = (e) => {
const newProgress = parseFloat(e.target.value);
setProgress(newProgress);
if (audioRef.current && audioRef.current.duration) {
audioRef.current.currentTime = (newProgress / 100) * audioRef.current.duration;
}
};

const toggleLike = (songId) => {
setLikedSongs(prev => {
const newSet = new Set(prev);
if (newSet.has(songId)) {
newSet.delete(songId);
} else {
newSet.add(songId);
}
return newSet;
});
};

const formatTime = (seconds) => {
if (!seconds || isNaN(seconds)) return '0:00';
const mins = Math.floor(seconds / 60);
const secs = Math.floor(seconds % 60);
return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const handleSearch = (query) => {
setSearchQuery(query);
if (query.trim()) {
searchMusic(query);
setActiveTab('search');
}
};

const SongItem = ({ song, index }) => (
<div className={`group bg-white/5 backdrop-blur-sm rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer ${
    currentSong?.id===song.id ? 'ring-2 ring-green-500 bg-white/10' : '' }`} onClick={()=> playSong(song)}
    >
    <div className="flex items-center gap-4">
        <div className="w-8 text-gray-400 font-semibold text-center">{index}</div>

        <div className="relative">
            <img src={song.cover || 'https://via.placeholder.com/48' } alt={song.name}
                className="w-12 h-12 rounded-md object-cover" />
            {currentSong?.id === song.id && isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-md">
                <div className="flex gap-1">
                    {[0, 150, 300].map((delay, i) => (
                    <div key={i} className="w-1 h-4 bg-white animate-pulse" style={{ animationDelay: `${delay}ms` }} />
                    ))}
                </div>
            </div>
            )}
        </div>

        <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate text-sm">{song.name}</h3>
            <p className="text-sm text-gray-400 truncate">{song.artist}</p>
        </div>

        <button onClick={(e)=> {
            e.stopPropagation();
            toggleLike(song.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
            <Heart className={`w-5 h-5 transition-all ${ likedSongs.has(song.id) ? 'fill-green-500 text-green-500'
                : 'text-gray-400 hover:text-white' }`} />
        </button>

        <span className="text-sm text-gray-400">{song.duration}</span>
    </div>
</div>
);

return (
<div className="min-h-screen bg-black text-white flex flex-col">
    <audio ref={audioRef} crossOrigin="anonymous" />

    <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-black border-r border-white/10 flex flex-col p-6">
            <div className="flex items-center gap-2 mb-8">
                <div
                    className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                    <Music className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold">Spotify</span>
            </div>

            <nav className="space-y-2 flex-1">
                <button onClick={()=> setActiveTab('home')}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'home' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                    >
                    <TrendingUp className="w-6 h-6" />
                    <span className="font-semibold">Trending</span>
                </button>

                <button onClick={()=> setActiveTab('search')}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'search' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                    >
                    <Search className="w-6 h-6" />
                    <span className="font-semibold">Search</span>
                </button>

                <button onClick={()=> setActiveTab('liked')}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'liked' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                    >
                    <Heart className={`w-6 h-6 ${likedSongs.size> 0 ? 'fill-purple-500 text-purple-500' : ''}`} />
                        <span className="font-semibold">Liked Songs</span>
                </button>
            </nav>

            <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-3 mb-3">
                    <div
                        className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">Music Lover</p>
                        <p className="text-xs text-gray-400">Free API Music</p>
                    </div>
                </div>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-900 to-black pb-32">
            {/* Search Bar */}
            <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10 p-6">
                <div className="relative max-w-2xl">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Search for songs, artists..." value={searchQuery} onChange={(e)=>
                    handleSearch(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-full py-3 pl-12 pr-4 text-white
                    placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white/20
                    transition-all"
                    />
                </div>
            </div>

            <div className="p-6">
                {/* Home/Trending Tab */}
                {activeTab === 'home' && (
                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Trending Now 🔥</h1>
                        <p className="text-gray-400">Top tracks from around the world</p>
                    </div>

                    {/* Popular Searches */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Popular Searches</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {popularSearches.map((item, idx) => (
                            <button key={idx} onClick={()=> handleSearch(item.query)}
                                className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-xl hover:scale-105
                                transition-transform text-left"
                                >
                                <div className="text-4xl mb-2">{item.icon}</div>
                                <div className="font-bold text-lg">{item.name}</div>
                            </button>
                            ))}
                        </div>
                    </div>

                    {/* Trending Tracks */}
                    {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader className="w-12 h-12 animate-spin text-green-500" />
                    </div>
                    ) : (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Top Tracks</h2>
                        <div className="space-y-2">
                            {trendingTracks.map((song, idx) => (
                            <SongItem key={song.id} song={song} index={idx + 1} />
                            ))}
                        </div>
                    </div>
                    )}
                </div>
                )}

                {/* Search Results Tab */}
                {activeTab === 'search' && (
                <div className="space-y-6">
                    <h1 className="text-4xl font-bold">
                        {searchQuery ? `Results for "${searchQuery}"` : 'Search Music'}
                    </h1>

                    {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader className="w-12 h-12 animate-spin text-green-500" />
                    </div>
                    ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
                        {searchResults.map((song, idx) => (
                        <SongItem key={song.id} song={song} index={idx + 1} />
                        ))}
                    </div>
                    ) : searchQuery ? (
                    <div className="text-center py-20">
                        <Music className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                        <p className="text-xl text-gray-400">No results found</p>
                    </div>
                    ) : (
                    <div className="text-center py-20">
                        <Search className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                        <p className="text-xl text-gray-400">Start searching for music</p>
                    </div>
                    )}
                </div>
                )}

                {/* Liked Songs Tab */}
                {activeTab === 'liked' && (
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-8 rounded-xl">
                        <Heart className="w-16 h-16 mb-4 fill-white" />
                        <h1 className="text-4xl font-bold mb-2">Liked Songs</h1>
                        <p className="text-white/80">{likedSongs.size} songs</p>
                    </div>

                    {likedSongs.size > 0 ? (
                    <div className="space-y-2">
                        {[...trendingTracks, ...searchResults]
                        .filter(song => likedSongs.has(song.id))
                        .map((song, idx) => (
                        <SongItem key={song.id} song={song} index={idx + 1} />
                        ))}
                    </div>
                    ) : (
                    <div className="text-center py-20">
                        <Heart className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                        <p className="text-xl text-gray-400">No liked songs yet</p>
                    </div>
                    )}
                </div>
                )}
            </div>
        </main>
    </div>

    {/* Player */}
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 p-4">
        <div className="max-w-screen-2xl mx-auto">
            <div className="mb-2">
                <input type="range" min="0" max="100" value={progress} onChange={handleProgressChange}
                    className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer" style={{ background:
                    `linear-gradient(to right, #1db954 0%, #1db954 ${progress}%, #4b5563 ${progress}%, #4b5563 100%)`
                    }} />
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img src={currentSong?.cover || 'https://via.placeholder.com/56' } alt="cover"
                        className="w-14 h-14 rounded-md object-cover" />
                    <div className="min-w-0 flex-1">
                        <h4 className="font-semibold truncate text-sm">
                            {currentSong?.name || 'No song playing'}
                        </h4>
                        <p className="text-xs text-gray-400 truncate">
                            {currentSong?.artist || 'Select a song'}
                        </p>
                    </div>
                    {currentSong && (
                    <button onClick={()=> toggleLike(currentSong.id)}>
                        <Heart className={`w-5 h-5 ${ likedSongs.has(currentSong.id) ? 'fill-green-500 text-green-500'
                            : 'text-gray-400 hover:text-white' }`} />
                    </button>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={handlePrevious} className="text-gray-400 hover:text-white transition-colors">
                        <SkipBack className="w-5 h-5" />
                    </button>

                    <button onClick={togglePlay}
                        className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                        {isPlaying ? (
                        <Pause className="w-5 h-5 fill-black" />
                        ) : (
                        <Play className="w-5 h-5 fill-black ml-0.5" />
                        )}
                    </button>

                    <button onClick={handleNext} className="text-gray-400 hover:text-white transition-colors">
                        <SkipForward className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center gap-2 flex-1 justify-end">
                    <Volume2 className="w-5 h-5 text-gray-400" />
                    <input type="range" min="0" max="100" value={volume} onChange={(e)=>
                    setVolume(parseInt(e.target.value))}
                    className="w-24 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
                    style={{
                    background: `linear-gradient(to right, #fff 0%, #fff ${volume}%, #4b5563 ${volume}%, #4b5563 100%)`
                    }}
                    />
                    <span className="text-xs text-gray-400 w-8">{volume}%</span>
                </div>
            </div>
        </div>
    </div>

    <style>
        {
            ` input[type="range"]::-webkit-slider-thumb {
                appearance: none;
                width: 12px;
                height: 12px;
                background: white;
                border-radius: 50%;
                cursor: pointer;
            }

            input[type="range"]::-moz-range-thumb {
                width: 12px;
                height: 12px;
                background: white;
                border-radius: 50%;
                cursor: pointer;
                border: none;
            }

            `
        }
    </style>
</div>
);
}