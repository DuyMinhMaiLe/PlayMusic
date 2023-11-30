const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PALYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd');
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')


const app = {

    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PALYER_STORAGE_KEY)) || {},
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PALYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    songs: [
        {
            name: "Chiều hôm ấy",
            singer: 'JayKii',
            path:'./music/music9.mp3',
            img: './img/img9.jpg',
        },
        {
            name: "Miên man",
            singer: 'Minh Huy',
            path: './music/music8.mp3',
            img: './img/img8.jpg',
        },
        {
            name: 'Đưa em về nhà',
            singer: 'GREY D',
            path: './music/music5.mp3',
            img: './img/img5.jpg'
        },
        {
            name: "Yêu anh đi mẹ anh bán bánh mì",
            singer: 'Phúc Du',
            path: './music/music10.mp3',
            img: './img/img10.jpg',
        },
    ],
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
      <div class="thumb" style="background-image: url('${song.img}')">
      </div>
      <div class="body">
        <h3 class="title">${song.name}</h3>
        <p class="author">${song.singer}</p>
      </div>
      <div class="option">
        <i class="fas fa-ellipsis-h"></i>
      </div>
    </div>  `

        })

    playlist.innerHTML = htmls.join('');
    },
    defineProperty: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvent: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Xu li CD quay & dung
        const cdThumbAnimate = cd.animate([{ transform: "rotate(360deg)" }], {
            duration: 10000, // 10 seconds
            iterations: Infinity
          });
          cdThumbAnimate.pause();

        // Xu li phong to & thu nho
        document.onscroll = function() {
            const scrollTop = window.scrollY || window.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth +'px': 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xu li khi kich play
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause()
            }else {
                audio.play()
            }
        }

        // Xu li khi nhac chay
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // Xu li khi nhac dung
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // Khi tien do bai hat thay doi
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        // Xu li khi tua 
        progress.oninput = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }
        // Khi next bai hat
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            }else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        // Khi prev bai hat
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            }else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        // Khi random bai hat
        randomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
           randomBtn.classList.toggle('active', _this.isRandom)
        }
        // Xu li khi audio ended
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }
        // Xu li khi repeat nhac
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.repeatBtn)
        }
        // Xu li khi click vao bai hat
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)') 
            if (songNode || e.target.closest('.option')) {

                if (songNode) {
                    _this.currentIndex = Number (songNode.dataset.index)
                    _this.loadCurrentSong()
                    audio.play()
                    _this.render()
                }

            }
        }
    },

    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollToIntoView ({
                behavior: 'smooth',
                block: 'nearest',
            })
        }, 500)
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.img}')`;
        audio.src = this.currentSong.path;
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    nextSong: function() {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length ) {
            this.currentIndex = 0
        }

        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--
        if(this.currentIndex < 0 ) {
            this.currentIndex = this.songs.length - 1
        }

        this.loadCurrentSong()
    },
    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },


    start: function() {
        this.loadConfig()
        this.defineProperty()
        this.handleEvent()
        this.loadCurrentSong()
        this.render()            
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.repeatBtn)

    },

}

app.start();