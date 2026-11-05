/* ==========================================================================
   PARA EDELLEM MARIA ♥ — Hand-Drawn Romantic Music Player Logic
   - Phase 1: Realistic Handwritten Intro Animation + Sketch Play Button
   - Phase 2: Play Button Exit & Staggered Hand-Drawn Player Assembly
   - Phase 3: 109 BPM Heartbeat Engine (00:25 - 00:33) -> Video Cover (00:33+)
   - Surrounding Doodles & Sketch Equalizer Synced to Music Rhythm
   ========================================================================== */

(() => {
  // --- Constants & Timing Configuration ---
  const BPM = 109;
  const BEAT_INTERVAL = 60 / BPM; // ~0.5504587 seconds (~550ms per beat)
  const HEARTBEAT_START = 24.85;  // [00:25] Cassette heart beats start
  const HEARTBEAT_END = 33.0;     // [00:33] "Oh, her eyes, her eyes..." + Video enters
  const BEAT_GRID_ANCHOR = 25.0;  // Beat grid anchor at 00:25.00

  // Intro Handwritten Lines requested
  const INTRO_LINES = [
    'Oi...',
    'Eu queria fazer algo pra você com o que sei fazer...',
    'Como sou programador e amante da musica....',
    'eu fiz isso aqui...'
  ];

  // Synchronized Lyrics & Moments for the 3:56 Official Video Audio Track
  const TIMELINE_LYRICS = [
    { time: 0.0, text: '♪ Moldando a fita cassete para Edellem Maria... ♥' },
    { time: 12.0, text: '♪ Preparando cada traço desta canção pra você...' },
    { time: 24.8, text: '♥ Sinta o coração bater no ritmo da música (109 BPM)...' },
    { time: 29.0, text: '♥ Cada batida a cada 0,55s... prestes a começar...' },
    { time: 33.0, text: '“Oh, her eyes, her eyes make the stars look like they’re not shinin’...”' },
    { time: 41.5, text: '“Her hair, her hair falls perfectly without her tryin’...”' },
    { time: 50.0, text: '“She’s so beautiful, and I tell her every day...”' },
    { time: 59.0, text: '“Yeah, I know, I know when I compliment her, she won’t believe me...”' },
    { time: 67.5, text: '“And it’s so, it’s so sad to think that she don’t see what I see...”' },
    { time: 76.0, text: '“But every time she asks me, ‘Do I look okay?’ I say:”' },
    { time: 84.5, text: '“When I see your face, there’s not a thing that I would change...” ♥' },
    { time: 93.5, text: '“’Cause you’re amazing, just the way you are...” ♥' },
    { time: 102.0, text: '“And when you smile, the whole world stops and stares for a while...”' },
    { time: 111.0, text: '“’Cause girl, you’re amazing, just the way you are...” ♥' },
    { time: 120.5, text: '“Her lips, her lips, I could kiss them all day if she’d let me...”' },
    { time: 129.0, text: '“Her laugh, her laugh, she hates, but I think it’s so sexy...”' },
    { time: 137.5, text: '“She’s so beautiful, and I tell her every day...”' },
    { time: 146.5, text: '“Oh, you know, you know, you know I’d never ask you to change...”' },
    { time: 155.0, text: '“If perfect’s what you’re searchin’ for, then just stay the same...”' },
    { time: 163.5, text: '“So don’t even bother askin’ if you look okay, you know I’ll say:”' },
    { time: 172.0, text: '“When I see your face, there’s not a thing that I would change...” ♥' },
    { time: 181.0, text: '“’Cause you’re amazing, just the way you are...” ♥' },
    { time: 189.5, text: '“And when you smile, the whole world stops and stares for a while...”' },
    { time: 198.5, text: '“’Cause girl, you’re amazing, just the way you are...”' },
    { time: 207.0, text: '“The way you are... the way you are...” ♥' },
    { time: 215.5, text: '“Girl, you’re amazing, just the way you are...” ♥' },
    { time: 224.0, text: '“When I see your face, there’s not a thing that I would change...”' },
    { time: 231.0, text: '♥ Para sempre incrível do jeitinho que você é, Edellem Maria ♥' }
  ];

  // --- DOM Elements ---
  const rootStyle = document.documentElement.style;
  const stage = document.getElementById('stage');
  const introScreen = document.getElementById('introScreen');
  const handwritingArea = document.getElementById('handwritingArea');
  const penCursor = document.getElementById('penCursor');
  const hwUnderline = document.getElementById('hwUnderline');
  const introPlayWrapper = document.getElementById('introPlayWrapper');
  const introPlayBtn = document.getElementById('introPlayBtn');

  const playerScreen = document.getElementById('playerScreen');
  const coverBox = document.getElementById('coverBox');
  const coverHeartStage = document.getElementById('coverHeartStage');
  const heartShockwaves = document.getElementById('heartShockwaves');
  const ecgLine = document.getElementById('ecgLine');
  const coverVideo = document.getElementById('coverVideo');

  const sketchEqBars = Array.from(document.querySelectorAll('#sketchEqBars .eq-bar'));
  const beatParticles = document.getElementById('beatParticles');
  const likeHeartBtn = document.getElementById('likeHeartBtn');
  const lyricLine = document.getElementById('lyricLine');

  const progressBarContainer = document.getElementById('progressBarContainer');
  const progressFillPath = document.getElementById('progressFillPath');
  const progressThumb = document.getElementById('progressThumb');
  const currentTimeLabel = document.getElementById('currentTimeLabel');
  const durationLabel = document.getElementById('durationLabel');
  const bpmStatusPill = document.getElementById('bpmStatusPill');

  const playPauseBtn = document.getElementById('playPauseBtn');
  const iconPlayGroup = document.getElementById('iconPlayGroup');
  const iconPauseGroup = document.getElementById('iconPauseGroup');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const repeatBtn = document.getElementById('repeatBtn');
  const replayIntroBtn = document.getElementById('replayIntroBtn');
  const jumpHeartbeatBtn = document.getElementById('jumpHeartbeatBtn');

  const musicAudio = document.getElementById('musicAudio');

  // --- State ---
  let introAbortController = null;
  let isPlayerMounted = false;
  let isVideoRevealed = false;
  let isDraggingProgress = false;
  let isRepeatEnabled = true;

  // Web Audio API State
  let audioCtx = null;
  let analyser = null;
  let freqData = null;
  let audioSourceCreated = false;

  // Beat Tracking State
  let lastBeatIndex = -1;
  let lastParticleTime = 0;
  let activeLyricText = '';

  // --- 1. Frame-by-Frame 2D Sketch Boil Loop (~8 fps) ---
  let boilFrame = 0;
  setInterval(() => {
    stage.classList.remove('boil-frame-0', 'boil-frame-1', 'boil-frame-2');
    boilFrame = (boilFrame + 1) % 3;
    stage.classList.add(`boil-frame-${boilFrame}`);
  }, 125);

  // --- 2. Handwritten Intro Sequence ---
  function sleep(ms, signal) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, ms);
      if (signal) {
        signal.addEventListener(
          'abort',
          () => {
            clearTimeout(timer);
            reject(new Error('Aborted'));
          },
          { once: true }
        );
      }
    });
  }

  function updatePenPosition(spanEl) {
    if (!spanEl || !handwritingArea) return;
    const areaRect = handwritingArea.getBoundingClientRect();
    const range = document.createRange();
    const textNode = spanEl.firstChild;

    if (textNode && textNode.nodeType === Node.TEXT_NODE && textNode.length > 0) {
      range.setStart(textNode, Math.max(0, textNode.length - 1));
      range.setEnd(textNode, textNode.length);
      const charRect = range.getBoundingClientRect();
      if (charRect.width > 0 || charRect.height > 0) {
        const x = charRect.right - areaRect.left;
        const y = charRect.bottom - areaRect.top - 12;
        penCursor.style.left = `${x}px`;
        penCursor.style.top = `${y}px`;
        return;
      }
    }

    const spanRect = spanEl.getBoundingClientRect();
    penCursor.style.left = `${spanRect.left - areaRect.left}px`;
    penCursor.style.top = `${spanRect.top - areaRect.top}px`;
  }

  async function runHandwritingIntro() {
    if (introAbortController) {
      introAbortController.abort();
    }
    introAbortController = new AbortController();
    const { signal } = introAbortController;

    // Reset DOM state for intro
    stage.classList.add('intro-ready');
    stage.classList.remove('player-mode');
    introScreen.classList.remove('is-exiting', 'is-hidden');
    playerScreen.classList.remove('is-active');
    introPlayWrapper.classList.remove('is-visible', 'is-ClickedExit');
    hwUnderline.classList.remove('is-drawn');

    const lineSpans = INTRO_LINES.map((_, idx) =>
      document.querySelector(`#hwLine${idx} .hw-text`)
    );
    lineSpans.forEach((span) => {
      if (span) span.textContent = '';
    });

    try {
      await sleep(350, signal);
      penCursor.classList.add('is-writing');

      for (let lineIdx = 0; lineIdx < INTRO_LINES.length; lineIdx++) {
        const fullText = INTRO_LINES[lineIdx];
        const spanEl = lineSpans[lineIdx];
        if (!spanEl) continue;

        for (let charIdx = 1; charIdx <= fullText.length; charIdx++) {
          spanEl.textContent = fullText.slice(0, charIdx);
          updatePenPosition(spanEl);

          const ch = fullText[charIdx - 1];
          let delay = 48 + Math.random() * 26;
          if (ch === '.') delay = 110;
          else if (ch === ' ') delay = 36;

          await sleep(delay, signal);
        }

        // Pause naturally between handwritten lines
        if (lineIdx < INTRO_LINES.length - 1) {
          await sleep(420, signal);
        }
      }

      // Draw sketchy underline beneath "eu fiz isso aqui..."
      hwUnderline.classList.add('is-drawn');
      await sleep(450, signal);

      penCursor.classList.remove('is-writing');

      // Sketch in the Play Button
      introPlayWrapper.classList.add('is-visible');
    } catch (_err) {
      // Aborted if user jumped or re-triggered
    }
  }

  // --- 3. Web Audio API Setup for Real-Time Rhythm Analysis ---
  function initWebAudio() {
    if (audioSourceCreated) {
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      audioCtx = new AudioContextClass();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.72;

      const source = audioCtx.createMediaElementSource(musicAudio);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);

      freqData = new Uint8Array(analyser.frequencyBinCount);
      audioSourceCreated = true;
    } catch (_e) {
      // Fallback: 109 BPM precision clock handles beat reactivity seamlessly
    }
  }

  // --- 4. Transition: Play Button Exit -> Mount Hand-Drawn Player & Start Music ---
  function handleIntroPlayClick() {
    if (introAbortController) {
      introAbortController.abort();
    }

    // 1. Retract Play Button strokes
    introPlayWrapper.classList.add('is-ClickedExit');
    penCursor.classList.remove('is-writing');

    // 2. Unlock & start audio + prime video inside user gesture
    initWebAudio();
    musicAudio.currentTime = 0;
    musicAudio.play().catch(() => {});
    updatePlayPauseIcons(true);

    // Prime video muted inside the gesture so iOS/Android allows seamless playback at 00:33
    if (coverVideo) {
      coverVideo.muted = true;
      const playPromise = coverVideo.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => {
            if (musicAudio.currentTime < HEARTBEAT_END) {
              coverVideo.pause();
              coverVideo.currentTime = 0;
            }
          })
          .catch(() => {});
      }
    }

    // 3. Fade out intro & mount the hand-drawn player
    setTimeout(() => {
      introScreen.classList.add('is-exiting');
    }, 220);

    setTimeout(() => {
      introScreen.classList.add('is-hidden');
      stage.classList.add('player-mode');
      playerScreen.classList.add('is-active');
      isPlayerMounted = true;
      syncCoverStageWithTime(musicAudio.currentTime);
    }, 680);
  }

  introPlayBtn.addEventListener('click', handleIntroPlayClick);

  // --- 5. Heart Shockwaves & Floating Beat Particles ---
  function triggerHeartShockwave(strong = true) {
    if (!heartShockwaves) return;
    const ring = document.createElement('div');
    ring.className = 'shockwave-ring';
    if (!strong) {
      ring.style.opacity = '0.4';
    }
    heartShockwaves.appendChild(ring);
    setTimeout(() => {
      ring.remove();
    }, 680);

    // Flash burst rays on heart
    coverHeartStage.classList.add('pulse-hit');
    setTimeout(() => {
      coverHeartStage.classList.remove('pulse-hit');
    }, 170);
  }

  function spawnBeatParticle(symbolOverride) {
    if (!beatParticles) return;
    const symbols = ['♥', '♪', '♫', '♡', '✦', '♥'];
    const symbol = symbolOverride || symbols[Math.floor(Math.random() * symbols.length)];

    const el = document.createElement('span');
    el.className = 'beat-particle';
    el.textContent = symbol;

    // Position around the left or right sides of the player card
    const isLeft = Math.random() < 0.5;
    const xPct = isLeft
      ? 4 + Math.random() * 14
      : 82 + Math.random() * 14;
    const yPct = 22 + Math.random() * 58;
    const sizeRem = 1.15 + Math.random() * 0.7;

    el.style.left = `${xPct}%`;
    el.style.top = `${yPct}%`;
    el.style.fontSize = `${sizeRem}rem`;

    beatParticles.appendChild(el);
    setTimeout(() => {
      el.remove();
    }, 2350);
  }

  // --- 6. Cover Stage Sync: Heart (00:00 - 00:33) vs Video (00:33+) ---
  function syncCoverStageWithTime(t) {
    const inHeartbeatWindow = t >= HEARTBEAT_START && t < HEARTBEAT_END;
    const inVideoWindow = t >= HEARTBEAT_END;

    coverHeartStage.classList.toggle('is-beating-window', inHeartbeatWindow);

    if (inVideoWindow && !isVideoRevealed) {
      isVideoRevealed = true;
      coverBox.classList.add('video-mode');
      if (!musicAudio.paused) {
        coverVideo.play().catch(() => {});
      }
      bpmStatusPill.textContent = '109 BPM • ★ VÍDEO';
    } else if (!inVideoWindow && isVideoRevealed) {
      isVideoRevealed = false;
      coverBox.classList.remove('video-mode');
      coverVideo.pause();
    }

    // Update BPM pill during intro vs heartbeat section (00:00 - 00:33)
    if (!inVideoWindow) {
      if (inHeartbeatWindow) {
        bpmStatusPill.textContent = '♥ 109 BPM • PULSANDO';
      } else {
        bpmStatusPill.textContent = '109 BPM • ♥';
      }
    }
  }

  // --- 7. 60fps Rhythm & Heartbeat Animation Loop ---
  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function updateLyrics(t) {
    let chosen = TIMELINE_LYRICS[0].text;
    for (let i = 0; i < TIMELINE_LYRICS.length; i++) {
      if (t >= TIMELINE_LYRICS[i].time) {
        chosen = TIMELINE_LYRICS[i].text;
      } else {
        break;
      }
    }
    if (chosen !== activeLyricText) {
      activeLyricText = chosen;
      lyricLine.style.opacity = '0';
      lyricLine.style.transform = 'translateY(4px)';
      setTimeout(() => {
        lyricLine.textContent = chosen;
        lyricLine.style.opacity = '1';
        lyricLine.style.transform = 'translateY(0)';
      }, 140);
    }
  }

  function updateEqualizerBars(t, isPlaying, bassEnergy, beatPulse) {
    for (let i = 0; i < sketchEqBars.length; i++) {
      const bar = sketchEqBars[i];
      if (!isPlaying) {
        bar.style.height = '4px';
        continue;
      }

      let val = 0;
      if (freqData && analyser) {
        const binIndex = Math.min(freqData.length - 1, i * 2 + 1);
        val = freqData[binIndex] / 255;
      }

      // Combine live FFT bin with 109 BPM rhythmic wave so bars always dance livelily
      const wave =
        0.35 +
        0.35 * Math.sin(t * 11.4 + i * 0.65) +
        0.3 * Math.cos(t * 5.7 - i * 0.4);
      const combined = Math.min(1, Math.max(0.15, val * 0.55 + wave * 0.45 + beatPulse * 0.35 + bassEnergy * 0.25));
      const heightPx = Math.round(4 + combined * 16);
      bar.style.height = `${heightPx}px`;
    }
  }

  function rhythmTick() {
    const isPlaying = isPlayerMounted && !musicAudio.paused && !musicAudio.ended;
    const t = musicAudio.currentTime || 0;
    const dur = musicAudio.duration || 236.8;

    // Update timeline UI if not currently dragging
    if (isPlayerMounted && !isDraggingProgress) {
      const pct = Math.min(100, Math.max(0, (t / dur) * 100));
      const dashOffset = 312 - (312 * pct) / 100;
      progressFillPath.style.strokeDashoffset = `${dashOffset}`;
      progressThumb.style.left = `${pct}%`;
      currentTimeLabel.textContent = formatTime(t);
      if (isFinite(musicAudio.duration) && musicAudio.duration > 0) {
        durationLabel.textContent = formatTime(musicAudio.duration);
      }
    }

    if (isPlayerMounted) {
      syncCoverStageWithTime(t);
      updateLyrics(t);
    }

    // Read Live Audio Frequencies if available
    let bassEnergy = 0;
    let midEnergy = 0;
    if (isPlaying && analyser && freqData) {
      analyser.getByteFrequencyData(freqData);
      // Bass bins (approx 0..5)
      let bassSum = 0;
      for (let i = 0; i < 6; i++) bassSum += freqData[i];
      bassEnergy = bassSum / (6 * 255);

      // Mid bins (approx 6..18)
      let midSum = 0;
      for (let i = 6; i < 18; i++) midSum += freqData[i];
      midEnergy = midSum / (12 * 255);
    }

    if (isPlaying) {
      // Calculate 109 BPM Beat Phase (0.0 -> 1.0 every ~0.55046s)
      const relTime = t - BEAT_GRID_ANCHOR;
      const beatIndex = Math.floor(relTime / BEAT_INTERVAL);
      const phase = ((relTime % BEAT_INTERVAL) + BEAT_INTERVAL) % BEAT_INTERVAL / BEAT_INTERVAL;

      // Cardiac lub-dub / drum envelope shaped from phase (sharp attack at 0.0, secondary bump at 0.28)
      const primaryAttack = Math.exp(-phase * 7.5);
      const secondaryBump = 0.38 * Math.exp(-Math.pow((phase - 0.26) / 0.11, 2));
      const rawBeatEnvelope = Math.min(1, primaryAttack + secondaryBump);

      const inIntroAmbient = t < HEARTBEAT_START;
      const inHeartbeatSection = t >= HEARTBEAT_START && t < HEARTBEAT_END;
      const inFullSong = t >= HEARTBEAT_END;

      // Detect discrete beat crossings (~every 550ms)
      if (beatIndex !== lastBeatIndex) {
        lastBeatIndex = beatIndex;

        if (inHeartbeatSection) {
          // Strong Heartbeat Shockwave inside cover between [00:25] and [00:33]
          triggerHeartShockwave(true);
          spawnBeatParticle('♥');
        } else if (inFullSong) {
          // Spawn musical notes & hearts around the player on beats
          const now = performance.now();
          if (now - lastParticleTime > 480) {
            lastParticleTime = now;
            spawnBeatParticle();
          }
        }
      }

      // Compute scales for Central Heart and Surrounding Doodles
      let heartScale = 1;
      let beatScale = 1;
      let doodleBounce = 0;
      let doodleTilt = 0;

      if (inIntroAmbient) {
        // 00:00 - 00:25: Gentle cassette intro breathing + live audio reactivity
        const gentleBreath = 0.045 * Math.sin(t * 3.2) + bassEnergy * 0.08;
        heartScale = 1 + gentleBreath;
        beatScale = 1 + gentleBreath * 0.65;
        doodleBounce = Math.sin(t * 3.2) * -3;
        doodleTilt = Math.cos(t * 2.4) * 3;
      } else if (inHeartbeatSection) {
        // 00:25 - 00:33: Powerful 109 BPM Heartbeat Pulses (~550ms interval)
        const pulsePower = Math.max(rawBeatEnvelope, bassEnergy * 0.95);
        heartScale = 1 + pulsePower * 0.34;
        beatScale = 1 + pulsePower * 0.16;
        doodleBounce = -pulsePower * 8;
        doodleTilt = (beatIndex % 2 === 0 ? 1 : -1) * pulsePower * 8;

        // Animate ECG line spike height dynamically with the heartbeat
        if (ecgLine) {
          const spikeTop = Math.round(174 - pulsePower * 24);
          const spikeBot = Math.round(224 + pulsePower * 18);
          ecgLine.setAttribute(
            'd',
            `M24 205 L88 205 L98 195 L108 216 L120 ${spikeTop} L132 ${spikeBot} L143 188 L152 210 L160 205 L236 205`
          );
        }
      } else {
        // 00:33+: Full Song ("Oh, her eyes...") — Doodles & Frame dance to 109 BPM + Audio FFT
        const songPulse = Math.max(rawBeatEnvelope * 0.85, (bassEnergy * 0.7 + midEnergy * 0.3));
        heartScale = 1 + songPulse * 0.2;
        beatScale = 1 + songPulse * 0.13;
        doodleBounce = -songPulse * 7;
        doodleTilt = Math.sin(relTime * Math.PI / BEAT_INTERVAL) * 6.5;
      }

      rootStyle.setProperty('--heart-scale', heartScale.toFixed(3));
      rootStyle.setProperty('--beat-scale', beatScale.toFixed(3));
      rootStyle.setProperty('--beat-energy', Math.max(rawBeatEnvelope, bassEnergy).toFixed(3));
      rootStyle.setProperty('--doodle-bounce', `${doodleBounce.toFixed(1)}px`);
      rootStyle.setProperty('--doodle-tilt', `${doodleTilt.toFixed(1)}deg`);

      updateEqualizerBars(t, true, bassEnergy, rawBeatEnvelope);
    } else {
      rootStyle.setProperty('--heart-scale', '1');
      rootStyle.setProperty('--beat-scale', '1');
      rootStyle.setProperty('--beat-energy', '0');
      rootStyle.setProperty('--doodle-bounce', '0px');
      rootStyle.setProperty('--doodle-tilt', '0deg');
      updateEqualizerBars(t, false, 0, 0);
    }

    requestAnimationFrame(rhythmTick);
  }

  // --- 8. Player Controls & Interactive Scrubber ---
  function updatePlayPauseIcons(playing) {
    if (playing) {
      iconPlayGroup.style.display = 'none';
      iconPauseGroup.style.display = 'block';
    } else {
      iconPlayGroup.style.display = 'block';
      iconPauseGroup.style.display = 'none';
    }
  }

  function togglePlayPause() {
    initWebAudio();
    if (musicAudio.paused) {
      musicAudio.play().catch(() => {});
      if (isVideoRevealed) {
        coverVideo.play().catch(() => {});
      }
      updatePlayPauseIcons(true);
    } else {
      musicAudio.pause();
      coverVideo.pause();
      updatePlayPauseIcons(false);
    }
  }

  playPauseBtn.addEventListener('click', togglePlayPause);

  // Like Heart Button bursts with mini hearts
  likeHeartBtn.addEventListener('click', () => {
    likeHeartBtn.classList.toggle('is-liked');
    for (let i = 0; i < 4; i++) {
      setTimeout(() => spawnBeatParticle('♥'), i * 90);
    }
  });

  // Previous Button: jumps between 00:25 (Heartbeat) and 00:00 (Start)
  prevBtn.addEventListener('click', () => {
    initWebAudio();
    if (musicAudio.currentTime > HEARTBEAT_END + 2) {
      musicAudio.currentTime = HEARTBEAT_START;
    } else {
      musicAudio.currentTime = 0;
    }
    syncCoverStageWithTime(musicAudio.currentTime);
    if (musicAudio.paused) {
      musicAudio.play().catch(() => {});
      updatePlayPauseIcons(true);
    }
  });

  // Next Button: jumps to 00:25 Heartbeat or 00:33 Video entry
  nextBtn.addEventListener('click', () => {
    initWebAudio();
    if (musicAudio.currentTime < HEARTBEAT_START - 0.5) {
      musicAudio.currentTime = HEARTBEAT_START;
    } else if (musicAudio.currentTime < HEARTBEAT_END - 0.5) {
      musicAudio.currentTime = HEARTBEAT_END;
    } else {
      musicAudio.currentTime = HEARTBEAT_START;
    }
    syncCoverStageWithTime(musicAudio.currentTime);
    if (musicAudio.paused) {
      musicAudio.play().catch(() => {});
      updatePlayPauseIcons(true);
    }
  });

  // Header three-dots button jumps directly to 00:25 Heartbeat moment
  jumpHeartbeatBtn.addEventListener('click', () => {
    initWebAudio();
    musicAudio.currentTime = HEARTBEAT_START;
    syncCoverStageWithTime(HEARTBEAT_START);
    if (musicAudio.paused) {
      musicAudio.play().catch(() => {});
      updatePlayPauseIcons(true);
    }
  });

  // Header back chevron replays the romantic handwritten intro
  replayIntroBtn.addEventListener('click', () => {
    musicAudio.pause();
    coverVideo.pause();
    isPlayerMounted = false;
    isVideoRevealed = false;
    coverBox.classList.remove('video-mode');
    runHandwritingIntro();
  });

  shuffleBtn.addEventListener('click', () => {
    shuffleBtn.classList.toggle('is-active');
    spawnBeatParticle('♥');
  });

  repeatBtn.addEventListener('click', () => {
    isRepeatEnabled = !isRepeatEnabled;
    repeatBtn.classList.toggle('is-active', isRepeatEnabled);
  });

  // Loop song when ended if repeat is active
  musicAudio.addEventListener('ended', () => {
    if (isRepeatEnabled) {
      musicAudio.currentTime = 0;
      syncCoverStageWithTime(0);
      musicAudio.play().catch(() => {});
    } else {
      updatePlayPauseIcons(false);
    }
  });

  musicAudio.addEventListener('play', () => updatePlayPauseIcons(true));
  musicAudio.addEventListener('pause', () => updatePlayPauseIcons(false));

  // Progress Bar Scrubbing (Mouse & Touch)
  function seekFromPointerEvent(e) {
    const rect = progressBarContainer.getBoundingClientRect();
    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const dur = musicAudio.duration || 236.8;
    const targetTime = ratio * dur;

    const dashOffset = 312 - 312 * ratio;
    progressFillPath.style.strokeDashoffset = `${dashOffset}`;
    progressThumb.style.left = `${ratio * 100}%`;
    currentTimeLabel.textContent = formatTime(targetTime);
    return targetTime;
  }

  progressBarContainer.addEventListener('pointerdown', (e) => {
    isDraggingProgress = true;
    progressBarContainer.setPointerCapture(e.pointerId);
    const targetTime = seekFromPointerEvent(e);
    musicAudio.currentTime = targetTime;
    syncCoverStageWithTime(targetTime);
  });

  progressBarContainer.addEventListener('pointermove', (e) => {
    if (!isDraggingProgress) return;
    const targetTime = seekFromPointerEvent(e);
    musicAudio.currentTime = targetTime;
    syncCoverStageWithTime(targetTime);
  });

  progressBarContainer.addEventListener('pointerup', (e) => {
    if (!isDraggingProgress) return;
    isDraggingProgress = false;
    try {
      progressBarContainer.releasePointerCapture(e.pointerId);
    } catch (_err) {}
  });

  // Start the 60fps rhythm engine & handwritten intro on load
  requestAnimationFrame(rhythmTick);
  runHandwritingIntro();
})();
