(() => {
  const stage = document.querySelector('.softly-stage');
  const invitation = document.querySelector('.invitation');
  const stillLife = document.querySelector('.still-life');
  const garden = document.querySelector('.flower-garden');
  const ring = document.querySelector('.flower-ring');
  const status = document.querySelector('.softly-status');
  const song = document.querySelector('#softly-song');
  const label = document.querySelector('.song-name');
  const toggle = document.querySelector('.song-toggle');
  const bgm = document.querySelector('#funeral-bgm');
  const bgmButton = document.querySelector('#funeral-mute');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const coverSrc = 'assets/art/die-softly-cover.png';
  const flowerPhoto = 'https://www.publicdomainpictures.net/pictures/640000/velka/flower-chrysanthemum-isolated.png';
  const tracks = [
    { title: 'growing pains', src: 'assets/art/softly-track-1.wav' },
    { title: 'how to say', src: 'assets/art/softly-track-2.wav' },
    { title: 'i flew away and?', src: 'assets/art/softly-track-3.wav' },
    { title: 'so i built a grave for it to escape', src: 'assets/art/softly-track-4.wav' },
    { title: 'would that bruise still bleed', src: 'assets/art/softly-track-5.wav' }
  ];
  let selected = -1;
  let enteredGarden = false;

  const fade = async (element, from, to, duration) => {
    const animation = element.animate([{ opacity: from }, { opacity: to }], {
      duration: reducedMotion.matches ? 120 : duration,
      easing: 'ease-in-out',
      fill: 'forwards'
    });
    try { await animation.finished; } catch { /* A page exit can cancel the dissolve. */ }
  };

  // The composition follows the actual navigation height, including text zoom.
  const header = document.querySelector('.masthead');
  const syncStage = () => {
    document.body.style.setProperty('--softly-nav-height', `${header.getBoundingClientRect().height}px`);
    positionTooltip();
  };
  if ('ResizeObserver' in window) new ResizeObserver(syncStage).observe(header);

  bgm.volume = .35;
  function syncBgm() {
    bgmButton.textContent = bgm.paused ? 'Play sound' : bgm.muted ? 'Unmute' : 'Mute';
    bgmButton.setAttribute('aria-label', bgm.paused ? 'Play Chopin, Funeral March' : bgm.muted ? 'Unmute Funeral March' : 'Mute Funeral March');
  }
  function startBgm() {
    if (enteredGarden) return;
    bgm.play().then(() => { if (enteredGarden) bgm.pause(); syncBgm(); }).catch(syncBgm);
  }
  bgmButton.addEventListener('click', () => {
    if (bgm.paused) { bgm.muted = false; startBgm(); }
    else { bgm.muted = !bgm.muted; syncBgm(); }
  });
  ['play', 'pause', 'volumechange'].forEach(event => bgm.addEventListener(event, syncBgm));
  startBgm();

  const player = document.createElement('dialog');
  player.className = 'flower-player';
  player.setAttribute('aria-labelledby', 'flower-player-title');
  player.setAttribute('aria-describedby', 'flower-player-credit');
  player.innerHTML = `
    <div class="flower-player-top"><span>LEÓN / LISTENING ROOM</span><button class="flower-player-close" type="button" autofocus>&lt;Back</button></div>
    <div class="flower-player-body">
      <img class="flower-player-cover" src="${coverSrc}" alt="The moment when I die softly album cover">
      <div class="flower-player-details">
        <p class="flower-player-kicker"><span>ORIGINAL SOUNDTRACK</span><span class="flower-track-number"></span></p>
        <h2 class="flower-player-title" id="flower-player-title"></h2>
        <p class="flower-player-credit" id="flower-player-credit">Music by León</p>
        <div class="flower-transport">
          <div class="flower-time"><span class="elapsed">0:00</span><span class="duration">0:00</span></div>
          <input class="flower-seek" type="range" min="0" max="100" value="0" step="0.1" aria-label="Playback position" disabled>
          <div class="flower-controls"><button class="flower-player-toggle" type="button">Play</button><label>Volume <input class="flower-volume" type="range" min="0" max="1" value="1" step="0.01" aria-label="Volume"></label></div>
          <p class="player-status" role="status"></p>
        </div>
      </div>
    </div>`;
  document.body.append(player);
  const playerTitle = player.querySelector('.flower-player-title');
  const playerToggle = player.querySelector('.flower-player-toggle');
  const playerStatus = player.querySelector('.player-status');
  const seek = player.querySelector('.flower-seek');
  const volume = player.querySelector('.flower-volume');
  const elapsed = player.querySelector('.elapsed');
  const durationLabel = player.querySelector('.duration');
  const stamp = value => {
    const seconds = Number.isFinite(value) ? Math.max(0, value) : 0;
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  };
  function syncTime() {
    const duration = Number.isFinite(song.duration) ? song.duration : 0;
    seek.disabled = !duration;
    seek.max = duration || 100;
    seek.value = song.currentTime || 0;
    seek.style.setProperty('--progress', `${duration ? song.currentTime / duration * 100 : 0}%`);
    seek.setAttribute('aria-valuetext', `${stamp(song.currentTime)} of ${stamp(duration)}`);
    elapsed.textContent = stamp(song.currentTime);
    durationLabel.textContent = stamp(duration);
  }
  function syncPlayback() {
    const action = song.paused ? 'Play' : 'Pause';
    playerToggle.textContent = action;
    toggle.textContent = action;
    [playerToggle, toggle].forEach(control => control.setAttribute('aria-label', `${action} ${tracks[selected]?.title || 'recording'}`));
    player.classList.toggle('is-playing', !song.paused);
  }
  function syncVolume() {
    volume.value = song.muted ? 0 : song.volume;
    volume.style.setProperty('--progress', `${Number(volume.value) * 100}%`);
    volume.setAttribute('aria-valuetext', `${Math.round(Number(volume.value) * 100)} percent`);
  }
  function setPlaybackMessage(message) {
    playerStatus.textContent = message;
    status.textContent = message;
  }
  async function playSong() {
    const requested = selected;
    setPlaybackMessage('');
    try { await song.play(); }
    catch (error) {
      if (selected !== requested || error.name === 'AbortError') return;
      setPlaybackMessage(song.error ? 'This recording could not load. Please try again.' : 'Press Play to start the recording.');
    }
    syncPlayback();
  }
  seek.addEventListener('input', () => {
    if (!Number.isFinite(song.duration)) return;
    song.currentTime = Number(seek.value);
    syncTime();
  });
  volume.addEventListener('input', () => { song.muted = false; song.volume = Number(volume.value); });
  ['timeupdate', 'loadedmetadata', 'durationchange', 'emptied'].forEach(event => song.addEventListener(event, syncTime));
  ['play', 'pause', 'ended'].forEach(event => song.addEventListener(event, syncPlayback));
  song.addEventListener('volumechange', syncVolume);
  song.addEventListener('waiting', () => setPlaybackMessage('Loading recording…'));
  song.addEventListener('playing', () => setPlaybackMessage(''));
  song.addEventListener('error', () => {
    setPlaybackMessage('This recording could not load. Please try again.');
    if (selected >= 0) label.textContent = `${tracks[selected].title} · Unable to load`;
  });
  toggle.addEventListener('click', () => song.paused ? playSong() : song.pause());
  playerToggle.addEventListener('click', () => song.paused ? playSong() : song.pause());
  player.querySelector('.flower-player-close').addEventListener('click', () => player.close());
  player.addEventListener('close', () => {
    if (selected >= 0) flowers[selected].focus({ preventScroll: true });
  });
  function openPlayer() {
    hideTitle();
    playerTitle.textContent = tracks[selected].title;
    player.querySelector('.flower-track-number').textContent = `${String(selected + 1).padStart(2, '0')} / 05`;
    syncPlayback(); syncTime(); syncVolume();
    if (!player.open) player.showModal();
  }

  const tooltip = document.createElement('div');
  tooltip.className = 'flower-tooltip';
  tooltip.id = 'flower-tooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.hidden = true;
  document.body.append(tooltip);
  let activeFlower = null;
  let tooltipFrame = 0;
  function positionTooltip() {
    if (!activeFlower || tooltip.hidden) return;
    const flowerRect = activeFlower.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const tipRect = tooltip.getBoundingClientRect();
    const margin = 14;
    const center = flowerRect.left + flowerRect.width / 2;
    const middle = flowerRect.top + flowerRect.height / 2;
    const cover = document.querySelector('.garden-label').getBoundingClientRect();
    const protectedRects = [cover, ...[...ring.children].filter(item => item !== activeFlower).map(item => item.getBoundingClientRect())];
    const side = center < innerWidth * .4 ? flowerRect.left - tipRect.width - 12 : flowerRect.right + 12;
    const candidates = [
      [side, middle - tipRect.height / 2],
      [flowerRect.left - tipRect.width - 12, middle - tipRect.height / 2],
      [flowerRect.right + 12, middle - tipRect.height / 2],
      [center - tipRect.width / 2, flowerRect.top - tipRect.height - 12],
      [center - tipRect.width / 2, flowerRect.bottom + 12],
      [center - tipRect.width / 2, cover.top - tipRect.height - 16],
      [center - tipRect.width / 2, cover.bottom + 16],
      [center - tipRect.width / 2, stageRect.bottom - tipRect.height - 20]
    ].map(([left, top], order) => {
      left = Math.max(margin, Math.min(left, innerWidth - tipRect.width - margin));
      top = Math.max(stageRect.top + margin, Math.min(top, stageRect.bottom - tipRect.height - margin));
      const overlap = protectedRects.reduce((area, r) => area + Math.max(0, Math.min(left + tipRect.width, r.right + 8) - Math.max(left, r.left - 8)) * Math.max(0, Math.min(top + tipRect.height, r.bottom + 8) - Math.max(top, r.top - 8)), 0);
      return {left, top, score: overlap * 1000 + Math.hypot(left + tipRect.width / 2 - center, top + tipRect.height / 2 - middle) + order};
    }).sort((a, b) => a.score - b.score);
    tooltip.style.left = `${candidates[0].left}px`;
    tooltip.style.top = `${candidates[0].top}px`;
  }

  function scheduleTooltip() {
    cancelAnimationFrame(tooltipFrame);
    tooltipFrame = requestAnimationFrame(positionTooltip);
  }
  function showTitle(flower, title) {
    if (player.open || document.body.classList.contains('about-open')) return;
    activeFlower = flower;
    tooltip.textContent = title;
    tooltip.hidden = false;
    positionTooltip();
  }
  function hideTitle() { activeFlower = null; tooltip.hidden = true; }
  addEventListener('resize', scheduleTooltip);
  addEventListener('scroll', scheduleTooltip, { passive: true });
  document.querySelector('.about-trigger').addEventListener('click', hideTitle);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hideTitle(); });
  const positions = [[50, 12], [87, 39], [74, 86], [26, 86], [13, 39]];
  const flowers = tracks.map((track, index) => {
    const flower = document.createElement('button');
    flower.className = 'song-flower';
    flower.type = 'button';
    flower.setAttribute('aria-label', `Play ${track.title} by León`);
    flower.setAttribute('aria-pressed', 'false');
    flower.style.setProperty('--x', `${positions[index][0]}%`);
    flower.style.setProperty('--y', `${positions[index][1]}%`);
    flower.style.setProperty('--tilt', `${(index - 2) * 7}deg`);
    flower.innerHTML = `<span class="flower-photo-wrap"><img class="flower-photo ${index % 2 ? 'ivory' : 'yellow'}" src="${flowerPhoto}" alt="" decoding="async"></span>`;
    const photo = flower.querySelector('.flower-photo');
    let sway;
    flower.addEventListener('pointerenter', () => {
      showTitle(flower, track.title);
      if (reducedMotion.matches) return;
      sway?.cancel();
      sway = photo.animate([
        { transform: 'rotate(0deg)' }, { transform: 'rotate(-4deg)', offset: .28 },
        { transform: 'rotate(3deg)', offset: .58 }, { transform: 'rotate(-1deg)', offset: .82 },
        { transform: 'rotate(0deg)' }
      ], { duration: 2200, easing: 'ease-in-out' });
    });
    flower.addEventListener('pointerleave', () => { if (!flower.matches(':focus-visible')) hideTitle(); });
    flower.addEventListener('focus', () => showTitle(flower, track.title));
    flower.addEventListener('blur', hideTitle);
    flower.addEventListener('click', () => {
      if (selected === index) { openPlayer(); return; }
      song.pause();
      selected = index;
      song.src = track.src;
      label.textContent = track.title;
      toggle.hidden = false;
      flowers.forEach((item, itemIndex) => {
        item.setAttribute('aria-pressed', String(itemIndex === index));
        item.setAttribute('aria-label', itemIndex === index
          ? `Open listening room for ${tracks[itemIndex].title} by León`
          : `Play ${tracks[itemIndex].title} by León`);
      });
      playSong();
    });
    ring.append(flower);
    return flower;
  });

  invitation.addEventListener('click', async event => {
    if (invitation.disabled) return;
    invitation.disabled = true;
    const keyboardEntry = event.detail === 0;
    startBgm();
    await fade(stillLife, 1, 0, 950);
    stillLife.hidden = true;
    enteredGarden = true;
    bgm.pause();
    bgm.currentTime = 0;
    document.querySelector('.funeral-sound').hidden = true;
    garden.hidden = false;
    status.textContent = 'Five songs by León. Select a flower to listen; select it again to enter the listening room.';
    await fade(garden, 0, 1, 1100);
    if (keyboardEntry) flowers[0].focus({ preventScroll: true });
  });
  addEventListener('pagehide', () => { bgm.pause(); song.pause(); hideTitle(); });
  syncStage(); syncTime(); syncVolume();
})();
