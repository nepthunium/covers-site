let songs = [];

let currentSongIndex = null;  

let audioPlayer = new Audio();  

let isPlaying = false;

let waveform;

function uploadSong() {
    const fileInput = document.getElementById('file-upload');
    const titleInput = document.getElementById('song-title');
    const artistInput = document.getElementById('song-artist');
    const albumInput = document.getElementById('song-album');
    const coverInput = document.getElementById('album-cover');

    const songFile = fileInput.files[0];
    const coverFile = coverInput.files[0];

    if (!songFile || !titleInput.value || !artistInput.value || !albumInput.value) {
        alert('Please fill in all fields and select a song!');
        return;
    }

    const songData = {
        title: titleInput.value,
        artist: artistInput.value,
        album: albumInput.value,
        cover: coverFile ? URL.createObjectURL(coverFile) : 'default_cover.png',  
        file: URL.createObjectURL(songFile),  
    };

    songs.push(songData);  
    displaySongs();  
    localStorage.setItem('songs', JSON.stringify(songs));  
}

function displaySongs() {
    const songListDiv = document.getElementById('song-list');
    songListDiv.innerHTML = '';  

    songs.forEach((song, index) => {
        const songItem = document.createElement('div');
        songItem.classList.add('song-item');

        songItem.innerHTML = `
            <div class="song-item-container">
                <img class="album-cover" src="${song.cover}" alt="Album Cover">
                <div class="song-info">
                    <div class="song-title">${song.title}</div>
                    <div class="artist-album">${song.artist}: ${song.album}</div>
                </div>
            </div>
        `;
        songListDiv.appendChild(songItem);
        const songTitle = songItem.querySelector('.song-title');
        const songItemContainer = songItem.querySelector('.song-item-container');

        songTitle.addEventListener('click', function(){
            openSongData(index);
        })

        songItemContainer.addEventListener('click', function() {
            playSong(index);
        });

    });
}

function openSongData(index) {
    const song = songs[index];

    document.getElementById('modal-cover').src = song.cover;
    document.getElementById('modal-title').innerText = song.title;
    document.getElementById('modal-artist').innerText = song.artist;
    document.getElementById('modal-album').innerText = song.album;
    document.getElementById('waveform').style.display = 'block'

    if (waveform) {
        waveform.destroy()
    }
    waveform = WaveSurfer.create({
        container: '#waveform',
        waveColor: '#ababab',
        progressColor: '#ff6006',
        height: 50,
        barGap: 2,
        barWidth: 1,
        dragToSeek: true,
        cursorWidth: 0,
        url: song.file
    });

    waveform.load(song.file);

    const modal = document.getElementById('song-data-modal');
    modal.style.display = 'block';
}

document.getElementById('close-modal').onclick = function() {
    const modal = document.getElementById('song-data-modal');
    modal.style.display = 'none';
};

function deleteAllSongs() {
    songs = [];

    displaySongs();

    localStorage.removeItem('songs');

    alert("All songs have been deleted.");
}

function playSong(index) {
    const song = songs[index];
    currentSongIndex = index;
    const player_container = document.getElementById('player-container');

    player_container.style.display = 'flex';
    document.getElementById('player-title').innerText = song.title;
    document.getElementById('player-artist').innerText = song.artist;
    document.getElementById('player-album').innerText = song.album;
    document.getElementById('player-cover').src = song.cover;

    const prog1 = document.getElementById('prog1');
    const prog2 = document.getElementById('prog2');

    audioPlayer.src = song.file;
    audioPlayer.play();

    player_container.addEventListener('click', function() {
        if (event.target !== playButton && event.target !== skipButton) {
            openSongData(index);
        }
    })

    audioPlayer.onloadedmetadata = () => {
        const totalDuration = audioPlayer.duration;
        prog2.innerText = formatTime(totalDuration);
    };

    audioPlayer.ontimeupdate = () => {
        const currentTime = audioPlayer.currentTime;
        prog1.innerText = formatTime(currentTime);
        waveform.setTime(currentTime)
    };

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes < 10 ? '0' + minutes : minutes}:${secs < 10 ? '0' + secs : secs}`;
    }

    const skipButton = document.getElementById("next-button")
    const playButton = document.getElementById("play-button");
    playButton.src = "pause.png"

    audioPlayer.onended = () => {
        playButton.src = "play.png"
    }
}

function togglePlay() {
    const playButton = document.getElementById("play-button");

    if (audioPlayer.paused) {
        audioPlayer.play();
        playButton.src = 'pause.png';
    } else {
        audioPlayer.pause();
        playButton.src = 'play.png';
    }
}

function playNext() {
    const modal = document.getElementById('song-data-modal');
    currentSongIndex = (currentSongIndex + 1) % songs.length;  
    playSong(currentSongIndex);

    if (modal.style.display == 'block') {
        openSongData(currentSongIndex);
    }
}

function playPrevious() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;  
    playSong(currentSongIndex);
}

window.onload = function() {
    const storedSongs = localStorage.getItem('songs');
    if (storedSongs) {
        songs = JSON.parse(storedSongs);
        displaySongs();  
    }
};