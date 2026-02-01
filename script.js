// Elements
const envelope = document.getElementById("envelope-container");
const letter = document.getElementById("letter-container");
const noBtn = document.querySelector(".no-btn");
const yesBtn = document.querySelector(".btn[alt='Yes']");

const title = document.getElementById("letter-title");
const catImg = document.getElementById("letter-cat");
const buttons = document.getElementById("letter-buttons");
const finalText = document.getElementById("final-text");

// Click Envelope

envelope.addEventListener("click", () => {
    envelope.style.display = "none";
    letter.style.display = "flex";

    setTimeout( () => {
        document.querySelector(".letter-window").classList.add("open");
    },50);
    startMusic();
});

// Logic to move the NO btn

// NO button chaos: moves, spawns clones, and plays a little boop sound
let audioCtx = null;
let masterGain = null;
let musicInterval = null;
function startMusic(){
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.12;
    masterGain.connect(audioCtx.destination);
    // Ensure the AudioContext is running (resume on user gesture)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(()=>{});
    }

    // Try playing the <audio> element fallback if present
    const bgAudio = document.getElementById('bg-music');
    if (bgAudio) {
        try {
            bgAudio.volume = 0.18;
            bgAudio.play().catch(()=>{});
        } catch (err) {}
    }

    // Simple valentine-y arpeggio (C, E, G, C5) loop
    const notes = [261.63, 329.63, 392.0, 523.25];
    let idx = 0;
    function playNote(freq, dur = 0.28){
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.value = 0;
        o.connect(g);
        g.connect(masterGain);
        const now = audioCtx.currentTime;
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.12, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        o.start(now);
        o.stop(now + dur + 0.02);
    }

    musicInterval = setInterval(() => {
        playNote(notes[idx % notes.length], 0.36);
        // occasional harmony
        if (Math.random() > 0.6) playNote(notes[(idx + 2) % notes.length] * 0.5, 0.5);
        idx++;
    }, 380);
}

function boop(time = 0){
    if (!audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'triangle';
    o.frequency.value = 800 + Math.random() * 400;
    g.gain.value = 0.0001;
    o.connect(g);
    g.connect(masterGain);
    const now = audioCtx.currentTime + time;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.08, now + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    o.start(now);
    o.stop(now + 0.15);
}

const wrapper = document.querySelector('.no-wrapper');
let cloneCount = 0;
const MAX_CLONES = 20;

const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

function randomMove(el, distanceMin = 120, distanceMax = 320){
    const distance = Math.random() * (distanceMax - distanceMin) + distanceMin;
    const angle = Math.random() * Math.PI * 2;
    const moveX = Math.cos(angle) * distance;
    const moveY = Math.sin(angle) * distance;
    const rot = (Math.random() * 50) - 25;
    const scale = 0.9 + Math.random() * 0.5;
    el.style.transition = 'transform 0.28s cubic-bezier(.2,.9,.3,1)';
    el.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rot}deg) scale(${scale})`;
}

function spawnClone(x,y){
    if (cloneCount >= MAX_CLONES) return;
    const clone = noBtn.cloneNode(true);
    clone.classList.add('no-clone');
    cloneCount++;
    // position absolute inside wrapper
    clone.style.position = 'absolute';
    clone.style.left = `${x}px`;
    clone.style.top = `${y}px`;
    clone.style.transform = `translate(0,0)`;
    wrapper.appendChild(clone);

    // slight random z stacking so they overlap playfully
    clone.style.zIndex = 5 + Math.floor(Math.random()*40);

    // repel nearby clones for extra chaos
    const nearby = wrapper.querySelectorAll('.no-clone');
    nearby.forEach(n => {
        if (n === clone) return;
        const dx = (Math.random()-0.5)*120;
        const dy = (Math.random()-0.5)*120;
        n.style.transition = 'transform 0.38s ease-out';
        n.style.transform = `translate(${dx}px, ${dy}px) rotate(${(Math.random()*60)-30}deg)`;
    });

    const moveAway = () => {
        boop();
        randomMove(clone, 60, 260);
    };

    if (isTouch) {
        clone.addEventListener('touchstart', (ev)=>{ ev.preventDefault(); moveAway(); });
    } else {
        clone.addEventListener('mouseover', moveAway);
    }
    clone.addEventListener('click', (e) => {
        e.stopPropagation();
        // small burst
        for (let i=0;i<3;i++) setTimeout(()=> spawnClone(Math.random()*40 - 20 + x, Math.random()*40 - 20 + y), i*60);
    });

    // auto-remove after some time
    setTimeout(()=>{
        if (clone.parentNode) clone.parentNode.removeChild(clone);
        cloneCount = Math.max(0, cloneCount-1);
    }, 4200 + Math.random()*3000);

    // small initial nudge
    setTimeout(moveAway, 60);
    // random wiggle sometimes
    if (Math.random()>0.45) clone.classList.add('wiggle');
}

// create small heart particles that fly out and fade
function emitHeartParticles(x,y,count=8){
    for (let i=0;i<count;i++){
        const p = document.createElement('div');
        p.className = 'particle-heart';
        p.textContent = '❤';
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        // random delay/scale
        p.style.transform = `translate(0,0) scale(${0.6 + Math.random()*0.9}) rotate(${Math.random()*40-20}deg)`;
        wrapper.appendChild(p);
        // remove after animation
        setTimeout(()=>{ if (p.parentNode) p.parentNode.removeChild(p); }, 1600 + Math.random()*800);
    }
}

function noiseChance(p){ return Math.random() < p; }

function handleNoInteract(ev){
    boop();
    // on small screens use smaller distances
    const small = window.innerWidth < 600 || isTouch;
    randomMove(noBtn, small ? 80 : 160, small ? 160 : 360);

    // spawn clones more aggressively on desktops, but keep mobile lighter
    if (noiseChance(small ? 0.28 : 0.72)){
        const rect = wrapper.getBoundingClientRect();
        const x = (ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left - 20;
        const y = (ev.touches ? ev.touches[0].clientY : ev.clientY) - rect.top - 6;
        spawnClone(x, y);
        // emit some hearts around the interaction
        emitHeartParticles(x+20, y+8, small ? 4 : 9);
    } else {
        // sometimes still emit tiny hearts for visual interest
        if (noiseChance(0.18)){
            const rect = wrapper.getBoundingClientRect();
            const x = (ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left - 20;
            const y = (ev.touches ? ev.touches[0].clientY : ev.clientY) - rect.top - 6;
            emitHeartParticles(x,y,3);
        }
    }
}

if (isTouch){
    noBtn.addEventListener('touchstart', (e)=>{ e.preventDefault(); handleNoInteract(e); });
} else {
    noBtn.addEventListener('mouseover', handleNoInteract);
}

noBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const rect = wrapper.getBoundingClientRect();
    const burstCount = isTouch ? 4 : 10;
    for (let i=0;i<burstCount;i++){
        setTimeout(()=>{
            spawnClone(Math.random()*(rect.width-20), Math.random()*(rect.height-20));
            boop();
        }, i*60);
    }
    // big heart particle explosion centered on NO button
    const nbRect = noBtn.getBoundingClientRect();
    const cx = nbRect.left - rect.left + nbRect.width/2;
    const cy = nbRect.top - rect.top + nbRect.height/2;
    emitHeartParticles(cx, cy, isTouch ? 10 : 22);

    // brief screen shake for drama
    const heartWrap = document.querySelector('.heart-wrap') || document.body;
    heartWrap.classList.add('shake');
    setTimeout(()=> heartWrap.classList.remove('shake'), 480);
});

// Logic to make YES btn to grow

// let yesScale = 1;

// yesBtn.style.position = "relative"
// yesBtn.style.transformOrigin = "center center";
// yesBtn.style.transition = "transform 0.3s ease";

// noBtn.addEventListener("click", () => {
//     yesScale += 2;

//     if (yesBtn.style.position !== "fixed") {
//         yesBtn.style.position = "fixed";
//         yesBtn.style.top = "50%";
//         yesBtn.style.left = "50%";
//         yesBtn.style.transform = `translate(-50%, -50%) scale(${yesScale})`;
//     }else{
//         yesBtn.style.transform = `translate(-50%, -50%) scale(${yesScale})`;
//     }
// });

// YES is clicked

yesBtn.addEventListener("click", () => {
    title.textContent = "Yippeeee!";

    catImg.src = "cat_dance.gif";

    document.querySelector(".letter-window").classList.add("final");

    buttons.style.display = "none";

    finalText.style.display = "block";
});
