/* --- Animated Candlestick Chart --- */
function initChart() {
    const canvas = document.getElementById('chartCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const CW = 11;   // candle body width
    const GAP = 7;   // gap between candles
    const PITCH = CW + GAP;
    const SPEED = 0.5;

    function resize() {
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Generate candles procedurally (seeded look with upward bias)
    const NUM = 90;
    const candles = [];
    let price = 0.45;
    // simple pseudo-random sequence for consistency
    const seq = [0.7,0.3,0.8,0.2,0.9,0.4,0.6,0.1,0.75,0.35,0.85,0.25,0.65,0.15,0.55,0.45,0.05,0.95,0.5,0.5];
    for (let i = 0; i < NUM; i++) {
        const r = seq[i % seq.length];
        const move = (r - 0.44) * 0.09;
        const open  = price;
        price = Math.max(0.05, Math.min(0.95, price + move));
        const close = price;
        const wick  = 0.015 + seq[(i + 3) % seq.length] * 0.025;
        candles.push({
            open,
            close,
            high: Math.min(Math.max(open, close) + wick, 0.97),
            low:  Math.max(Math.min(open, close) - wick, 0.03)
        });
    }

    const TOTAL = NUM * PITCH;
    let offset = 0;

    function toY(p) {
        const margin = 8;
        return margin + (1 - p) * (canvas.height - margin * 2);
    }

    function draw() {
        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        // Subtle horizontal grid lines
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.05)';
        ctx.lineWidth = 1;
        for (let k = 1; k < 4; k++) {
            const y = H * k / 4;
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        // Draw visible candles
        const startIdx = Math.floor(offset / PITCH);
        const startOff = offset % PITCH;
        const visible  = Math.ceil(W / PITCH) + 2;

        for (let i = 0; i < visible; i++) {
            const idx   = (startIdx + i) % NUM;
            const c     = candles[idx];
            const x     = i * PITCH - startOff;
            if (x > W + PITCH) break;

            const green = c.close >= c.open;
            const col   = green ? '#FFD700' : '#ff3355';
            const glow  = green ? 'rgba(255,215,0,0.45)' : 'rgba(255,51,85,0.45)';

            const openY  = toY(c.open);
            const closeY = toY(c.close);
            const highY  = toY(c.high);
            const lowY   = toY(c.low);
            const bodyTop = Math.min(openY, closeY);
            const bodyH   = Math.max(Math.abs(closeY - openY), 2);

            ctx.shadowColor = glow;
            ctx.shadowBlur  = 7;

            // Wick
            ctx.strokeStyle = col;
            ctx.lineWidth   = 1.5;
            ctx.beginPath();
            ctx.moveTo(x + CW / 2, highY);
            ctx.lineTo(x + CW / 2, lowY);
            ctx.stroke();

            // Body
            ctx.fillStyle = col;
            ctx.fillRect(x, bodyTop, CW, bodyH);
            ctx.shadowBlur = 0;
        }

        // Fade left & right edges
        const lg = ctx.createLinearGradient(0, 0, 55, 0);
        lg.addColorStop(0, 'rgba(4,4,4,1)');
        lg.addColorStop(1, 'rgba(4,4,4,0)');
        ctx.fillStyle = lg; ctx.fillRect(0, 0, 55, H);

        const rg = ctx.createLinearGradient(W - 55, 0, W, 0);
        rg.addColorStop(0, 'rgba(4,4,4,0)');
        rg.addColorStop(1, 'rgba(4,4,4,1)');
        ctx.fillStyle = rg; ctx.fillRect(W - 55, 0, 55, H);

        offset = (offset + SPEED) % TOTAL;
        requestAnimationFrame(draw);
    }

    draw();
}

document.addEventListener('DOMContentLoaded', () => {
    initChart();
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // SVG Icons
    const iconMuted = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
    const iconUnmuted = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
    const iconPlay = '<svg viewBox="0 0 24 24" width="32" height="32" fill="white"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    const iconPause = '<svg viewBox="0 0 24 24" width="32" height="32" fill="white"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';

    // Helpers
    const pauseVideo = (video, btn) => {
        if (!video.paused) {
            video.pause();
            if (btn) {
                btn.innerHTML = iconPlay;
                btn.classList.add('show-paused');
            }
        }
    };

    const playVideo = (video, btn) => {
        if (video.paused) {
            video.play();
            if (btn) {
                btn.innerHTML = iconPause;
                btn.classList.remove('show-paused');
            }
        }
    };

    // Initialize Swiper 3D Carousel
    if(typeof Swiper !== 'undefined') {
        const swiper = new Swiper('.videoSwiper', {
            effect: 'coverflow',
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 'auto',
            loop: true,
            initialSlide: 3,
            autoHeight: true,
            coverflowEffect: {
                rotate: 25,
                stretch: 0,
                depth: 150,
                modifier: 1,
                slideShadows: true,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            on: {
                slideChangeTransitionStart: function () {
                    // Pausa todos os vídeos
                    this.slides.forEach((slide) => {
                        const video = slide.querySelector('.carousel-video');
                        const playBtn = slide.querySelector('.toggle-play-btn');
                        if (video) pauseVideo(video, playBtn);
                    });
                    
                    // Dá play no vídeo que ficou ativo no centro
                    const activeSlide = this.slides[this.activeIndex];
                    const activeVideo = activeSlide.querySelector('.carousel-video');
                    const activeBtn = activeSlide.querySelector('.toggle-play-btn');
                    if (activeVideo) playVideo(activeVideo, activeBtn);
                }
            }
        });
    }

    // Mute/Unmute Video Logic
    const muteBtns = document.querySelectorAll('.toggle-mute-btn');
    muteBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Avoid triggering play/pause
            const video = this.parentElement.querySelector('.carousel-video');
            if(video) {
                video.muted = !video.muted;
                if(video.muted) {
                    this.innerHTML = iconMuted;
                } else {
                    this.innerHTML = iconUnmuted;
                }
            }
        });
    });

    // Play/Pause Click Logic
    const playBtns = document.querySelectorAll('.toggle-play-btn');
    playBtns.forEach(btn => {
        btn.innerHTML = iconPause; // Starts assuming autoplay
        const video = btn.parentElement.querySelector('.carousel-video');
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (video.paused) {
                playVideo(video, btn);
            } else {
                pauseVideo(video, btn);
            }
        });
        
        // Also allow clicking the video to pause/play
        if(video) {
            video.addEventListener('click', () => {
                if (video.paused) {
                    playVideo(video, btn);
                } else {
                    pauseVideo(video, btn);
                }
            });
        }
    });

});
