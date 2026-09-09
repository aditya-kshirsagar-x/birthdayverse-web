/* =========================================================
   BirthdayVerse — script.js
   Vanilla JavaScript
   Lightweight / Responsive / Safe
   ========================================================= */

(() => {
  "use strict";


  /* =======================================================
     CONSTANTS
  ======================================================= */

  const STORAGE_KEY = "birthdayverse:lastName";

  const COUNTDOWN_START = 3;
  const COUNTDOWN_INTERVAL = 900;

  const DESKTOP = {
    particles: 32,
    balloons: 7,
    confetti: 95,
    fireworkSparks: 22
  };

  const MOBILE = {
    particles: 15,
    balloons: 4,
    confetti: 55,
    fireworkSparks: 13
  };

  const CONFETTI_COLORS = [
    "#8b5cf6",
    "#db4da4",
    "#ff83bd",
    "#4ac8ff",
    "#f4cd82"
  ];

  const BALLOON_COLORS = [
    "#8b5cf6",
    "#db4da4",
    "#ff83bd",
    "#4ac8ff",
    "#f4cd82"
  ];

  const FIREWORK_COLORS = [
    "#ffe6a9",
    "#ff83bd",
    "#65dcff",
    "#9d7bff"
  ];


  /* =======================================================
     STATE
  ======================================================= */

  const state = {
    name: "",
    birthday: null,

    countdownTimer: null,
    countdownRevealTimer: null,

    countdownValue: COUNTDOWN_START,

    reducedMotion: false,
    isLowPower: false,

    musicPlaying: false,
    musicStartedByUser: false,

    wishUsed: false,

    pageVisible: true,

    confettiTimeouts: new Set(),
    fireworkTimeouts: new Set()
  };


  /* =======================================================
     DOM CACHE
  ======================================================= */

  const els = {};


  /* =======================================================
     INITIALIZE
  ======================================================= */

  function init() {

    cacheElements();

    if (!els.welcomeScreen) {
      return;
    }

    detectEnvironment();

    setupEventListeners();

    restoreSavedName();

    handleReducedMotion();

    createBackgroundParticles();

    hideLoadingScreen();

  }


  /* =======================================================
     CACHE ELEMENTS
  ======================================================= */

  function cacheElements() {

    els.loadingScreen =
      document.getElementById("loadingScreen");

    els.statusLive =
      document.getElementById("statusLive");


    /* Welcome */

    els.welcomeScreen =
      document.getElementById("welcomeScreen");

    els.welcomeForm =
      document.getElementById("welcomeForm");

    els.nameInput =
      document.getElementById("nameInput");

    els.birthdayInput =
      document.getElementById("birthdayInput");

    els.nameError =
      document.getElementById("nameError");

    els.birthdayError =
      document.getElementById("birthdayError");

    els.startButton =
      document.getElementById("startButton");


    /* Countdown */

    els.countdownScreen =
      document.getElementById("countdownScreen");

    els.countdownNumber =
      document.getElementById("countdownNumber");


    /* Birthday */

    els.birthdayScreen =
      document.getElementById("birthdayScreen");

    els.birthdayTitle =
      document.getElementById("birthdayTitle");

    els.birthdayName =
      document.getElementById("birthdayName");

    els.birthdayMessage =
      document.getElementById("birthdayMessage");

    els.nameInlineEls =
      document.querySelectorAll(".name-inline");


    /* Cake */

    els.cake =
      document.getElementById("cake");

    els.candle =
      document.getElementById("candle");


    /* Wish */

    els.wishButton =
      document.getElementById("wishButton");

    els.wishText =
      document.getElementById("wishText");


    /* Music */

    els.musicButton =
      document.getElementById("musicButton");

    els.musicStatus =
      document.getElementById("musicStatus");

    els.birthdayAudio =
      document.getElementById("birthdayAudio");


    /* Surprise */

    els.surpriseCard =
      document.getElementById("surpriseCard");

    els.revealButton =
      document.getElementById("revealButton");

    els.surpriseBack =
      document.getElementById("surpriseBack");


    /* Final */

    els.replayButton =
      document.getElementById("replayButton");

    els.shareButton =
      document.getElementById("shareButton");


    /* Effects */

    els.confettiContainer =
      document.getElementById("confettiContainer");

    els.fireworksContainer =
      document.getElementById("fireworksContainer");

    els.balloonsContainer =
      document.getElementById("balloonsContainer");

    els.particlesContainer =
      document.getElementById("particlesContainer");

  }


  /* =======================================================
     ENVIRONMENT DETECTION
  ======================================================= */

  function detectEnvironment() {

    const reducedQuery =
      window.matchMedia
        ? window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          )
        : null;

    state.reducedMotion =
      reducedQuery?.matches ?? false;


    const cores =
      navigator.hardwareConcurrency || 4;

    const memory =
      navigator.deviceMemory || 4;

    const mobile =
      window.innerWidth < 768;


    state.isLowPower =
      mobile ||
      cores <= 4 ||
      memory <= 4;


    if (reducedQuery) {

      const motionHandler = (event) => {

        state.reducedMotion =
          event.matches;

        handleReducedMotion();

        createBackgroundParticles();

      };


      if ("addEventListener" in reducedQuery) {
        reducedQuery.addEventListener(
          "change",
          motionHandler
        );
      } else if ("addListener" in reducedQuery) {
        reducedQuery.addListener(
          motionHandler
        );
      }

    }

  }


  /* =======================================================
     LOADING
  ======================================================= */

  function hideLoadingScreen() {

    const MINIMUM_LOADING_TIME = 900;

    window.setTimeout(() => {

      if (!els.loadingScreen) {
        return;
      }

      els.loadingScreen.classList.add(
        "is-hidden"
      );

      window.setTimeout(() => {

        if (els.loadingScreen) {
          els.loadingScreen.style.display = "none";
        }

      }, 700);

    }, MINIMUM_LOADING_TIME);

  }


  /* =======================================================
     VALIDATION
  ======================================================= */

  function validateInputs(name, birthdayValue) {

    const errors = {
      name: "",
      birthday: ""
    };

    let valid = true;


    /* Name */

    if (!name) {

      errors.name =
        "Please enter a name ✨";

      valid = false;

    } else if (name.length > 40) {

      errors.name =
        "That name is a little too long ✨";

      valid = false;

    }


    /* Birthday */

    if (!birthdayValue) {

      errors.birthday =
        "Please choose a birthday 🎂";

      valid = false;

    } else {

      const parsed =
        new Date(
          `${birthdayValue}T00:00:00`
        );


      if (
        Number.isNaN(
          parsed.getTime()
        )
      ) {

        errors.birthday =
          "That date doesn't look right ✨";

        valid = false;

      }

    }


    return {
      valid,
      errors
    };

  }


  /* =======================================================
     LIVE STATUS
  ======================================================= */

  function announce(message) {

    if (!els.statusLive) {
      return;
    }

    els.statusLive.textContent = "";

    window.setTimeout(() => {

      els.statusLive.textContent =
        message;

    }, 20);

  }


  /* =======================================================
     FORM SUBMISSION
  ======================================================= */

  function handleWelcomeSubmit(event) {

    event.preventDefault();


    const name =
      (els.nameInput?.value || "")
        .trim();


    const birthdayValue =
      els.birthdayInput?.value || "";


    const validation =
      validateInputs(
        name,
        birthdayValue
      );


    if (els.nameError) {
      els.nameError.textContent =
        validation.errors.name;
    }


    if (els.birthdayError) {
      els.birthdayError.textContent =
        validation.errors.birthday;
    }


    if (!validation.valid) {

      announce(
        validation.errors.name ||
        validation.errors.birthday
      );


      if (validation.errors.name) {

        els.nameInput?.focus();

      } else {

        els.birthdayInput?.focus();

      }

      return;

    }


    /* Save state */

    state.name = name;

    state.birthday =
      new Date(
        `${birthdayValue}T00:00:00`
      );


    saveName(name);

    personalize(name);


    /*
      CRITICAL MUSIC BEHAVIOUR

      The Begin the Surprise submit event is the
      direct user gesture.

      We start audio HERE.

      Nothing before this point calls audio.play().
    */

    beginMusicOnUserGesture();


    /* Transition */

    showCountdown();

  }


  /* =======================================================
     PERSONALIZATION
  ======================================================= */

  function personalize(name) {

    if (els.birthdayName) {
      els.birthdayName.textContent =
        name;
    }


    els.nameInlineEls?.forEach(
      (node) => {

        node.textContent =
          name;

      }
    );


    if (els.birthdayMessage) {

      els.birthdayMessage.textContent =
        `Another year brighter, ${name} — may today hold every bit of joy you deserve.`;

    }

  }


  /* =======================================================
     MUSIC — BEGIN SURPRISE
  ======================================================= */

  function beginMusicOnUserGesture() {

    const audio =
      els.birthdayAudio;


    if (!audio) {
      return;
    }


    /*
      Important:
      Don't call play() twice.
    */

    if (
      !audio.paused ||
      state.musicPlaying
    ) {

      return;

    }


    state.musicStartedByUser =
      true;


    /*
      Attempt playback directly inside
      the user's form-submit gesture.
    */

    try {

      const playPromise =
        audio.play();


      if (
        playPromise &&
        typeof playPromise.then === "function"
      ) {

        playPromise
          .then(() => {

            state.musicPlaying = true;

            setMusicUI(true);

          })
          .catch(() => {

            /*
              Some browsers can still reject
              playback. Don't interrupt the
              birthday experience.
            */

            state.musicPlaying = false;

            setMusicUI(false);

            announce(
              "Tap Play birthday music to start the song."
            );

          });

      } else {

        state.musicPlaying = true;

        setMusicUI(true);

      }

    } catch (_error) {

      state.musicPlaying = false;

      setMusicUI(false);

    }

  }


  /* =======================================================
     MUSIC BUTTON
  ======================================================= */

  async function toggleMusic() {

    const audio =
      els.birthdayAudio;


    if (!audio) {
      return;
    }


    if (state.musicPlaying) {

      audio.pause();

      setMusicUI(false);

      return;

    }


    try {

      await audio.play();

      state.musicPlaying = true;

      setMusicUI(true);

    } catch (_error) {

      state.musicPlaying = false;

      setMusicUI(false);

      announce(
        "Music could not be played on this device."
      );

    }

  }


  /* =======================================================
     MUSIC UI
  ======================================================= */

  function setMusicUI(isPlaying) {

    state.musicPlaying =
      Boolean(isPlaying);


    if (els.musicButton) {

      els.musicButton.setAttribute(
        "aria-pressed",
        String(state.musicPlaying)
      );


      els.musicButton.setAttribute(
        "aria-label",
        state.musicPlaying
          ? "Pause birthday music"
          : "Play birthday music"
      );

    }


    if (els.musicStatus) {

      els.musicStatus.textContent =
        state.musicPlaying
          ? "Pause birthday music"
          : "Play birthday music";

    }

  }


  /* =======================================================
     COUNTDOWN SCREEN
  ======================================================= */

  function showCountdown() {

    els.welcomeScreen?.classList.add(
      "hidden"
    );

    els.birthdayScreen?.classList.add(
      "hidden"
    );

    els.countdownScreen?.classList.remove(
      "hidden"
    );


    startCountdown();

  }


  /* =======================================================
     COUNTDOWN
  ======================================================= */

  function startCountdown() {

    clearCountdown();

    state.countdownValue =
      COUNTDOWN_START;


    renderCountdown(
      state.countdownValue
    );


    state.countdownTimer =
      window.setInterval(() => {

        state.countdownValue -= 1;


        if (
          state.countdownValue <= 0
        ) {

          clearCountdown();

          renderCountdown(
            "GO!"
          );


          state.countdownRevealTimer =
            window.setTimeout(
              showBirthday,
              560
            );


          return;

        }


        renderCountdown(
          state.countdownValue
        );

      }, COUNTDOWN_INTERVAL);

  }


  /* =======================================================
     RENDER COUNTDOWN
  ======================================================= */

  function renderCountdown(value) {

    if (!els.countdownNumber) {
      return;
    }


    /*
      Restart animation without changing
      layout-related properties.
    */

    els.countdownNumber.style.animation =
      "none";


    void els.countdownNumber.offsetHeight;


    els.countdownNumber.style.animation =
      "";


    els.countdownNumber.textContent =
      String(value);

  }


  /* =======================================================
     CLEAR COUNTDOWN
  ======================================================= */

  function clearCountdown() {

    if (state.countdownTimer) {

      window.clearInterval(
        state.countdownTimer
      );

      state.countdownTimer = null;

    }


    if (state.countdownRevealTimer) {

      window.clearTimeout(
        state.countdownRevealTimer
      );

      state.countdownRevealTimer = null;

    }

  }


  /* =======================================================
     SHOW BIRTHDAY
  ======================================================= */

  function showBirthday() {

    clearCountdown();


    els.countdownScreen?.classList.add(
      "hidden"
    );

    els.birthdayScreen?.classList.remove(
      "hidden"
    );


    startCelebration();


    window.setTimeout(() => {

      els.birthdayTitle?.focus();

    }, 400);


    announce(
      `Happy Birthday ${state.name}!`
    );

  }


  /* =======================================================
     CELEBRATION
  ======================================================= */

  function startCelebration() {

    cleanupEffects();


    createBalloons();

    startConfetti();

    triggerFireworkBurstSeries();

  }


  /* =======================================================
     CSS BALLOONS
     No PNGs required.
  ======================================================= */

  function createBalloons() {

    const container =
      els.balloonsContainer;


    if (
      !container ||
      state.reducedMotion
    ) {

      return;

    }


    cleanupBalloons();


    const config =
      state.isLowPower
        ? MOBILE
        : DESKTOP;


    const count =
      config.balloons;


    const fragment =
      document.createDocumentFragment();


    const columnWidth =
      100 / count;


    for (
      let i = 0;
      i < count;
      i += 1
    ) {

      const balloon =
        document.createElement("span");


      balloon.className =
        "balloon";


      const size =
        state.isLowPower
          ? 38 + Math.random() * 13
          : 45 + Math.random() * 20;


      const left =
        i * columnWidth +
        Math.random() *
        columnWidth *
        0.65;


      const duration =
        13 + Math.random() * 8;


      const delay =
        -(Math.random() * duration);


      const drift =
        (Math.random() - 0.5) * 70;


      const color =
        BALLOON_COLORS[
          i % BALLOON_COLORS.length
        ];


      balloon.style.setProperty(
        "--balloon-size",
        `${size}px`
      );


      balloon.style.setProperty(
        "--balloon-duration",
        `${duration}s`
      );


      balloon.style.setProperty(
        "--balloon-delay",
        `${delay}s`
      );


      balloon.style.setProperty(
        "--balloon-drift",
        `${drift}px`
      );


      balloon.style.setProperty(
        "--balloon-color",
        color
      );


      balloon.style.left =
        `${left}%`;


      balloon.style.animationDelay =
        `${delay}s`;


      /*
        Balloon body
      */

      const body =
        document.createElement("span");


      body.className =
        "balloon-body";


      /*
        Highlight
      */

      const highlight =
        document.createElement("span");


      highlight.className =
        "balloon-highlight";


      /*
        Knot
      */

      const knot =
        document.createElement("span");


      knot.className =
        "balloon-knot";


      /*
        String
      */

      const string =
        document.createElement("span");


      string.className =
        "balloon-string";


      body.appendChild(
        highlight
      );


      balloon.appendChild(
        body
      );


      balloon.appendChild(
        knot
      );


      balloon.appendChild(
        string
      );


      fragment.appendChild(
        balloon
      );

    }


    container.appendChild(
      fragment
    );

  }


  /* =======================================================
     CLEAN BALLOONS
  ======================================================= */

  function cleanupBalloons() {

    if (els.balloonsContainer) {

      els.balloonsContainer.replaceChildren();

    }

  }


  /* =======================================================
     CONFETTI
  ======================================================= */

  function startConfetti() {

    const container =
      els.confettiContainer;


    if (
      !container ||
      state.reducedMotion
    ) {

      return;

    }


    cleanupConfetti();


    const config =
      state.isLowPower
        ? MOBILE
        : DESKTOP;


    const count =
      config.confetti;


    const fragment =
      document.createDocumentFragment();


    for (
      let i = 0;
      i < count;
      i += 1
    ) {

      const piece =
        document.createElement("span");


      piece.className =
        "confetti-piece";


      const width =
        5 + Math.random() * 6;


      const height =
        8 + Math.random() * 8;


      const duration =
        3.3 + Math.random() * 2.4;


      const delay =
        Math.random() * 0.65;


      const drift =
        (Math.random() - 0.5) *
        180;


      const rotate =
        Math.round(
          260 + Math.random() * 700
        );


      const left =
        Math.random() * 100;


      const color =
        CONFETTI_COLORS[
          Math.floor(
            Math.random() *
            CONFETTI_COLORS.length
          )
        ];


      piece.style.left =
        `${left}%`;


      piece.style.setProperty(
        "--w",
        `${width}px`
      );


      piece.style.setProperty(
        "--h",
        `${height}px`
      );


      piece.style.setProperty(
        "--dur",
        `${duration}s`
      );


      piece.style.setProperty(
        "--delay",
        `${delay}s`
      );


      piece.style.setProperty(
        "--drift",
        `${drift}px`
      );


      piece.style.setProperty(
        "--rotate",
        `${rotate}deg`
      );


      piece.style.setProperty(
        "--c",
        color
      );


      fragment.appendChild(
        piece
      );


      const timeout =
        window.setTimeout(() => {

          piece.remove();

          state.confettiTimeouts.delete(
            timeout
          );

        }, (duration + delay) * 1000 + 300);


      state.confettiTimeouts.add(
        timeout
      );

    }


    container.appendChild(
      fragment
    );

  }


  /* =======================================================
     CLEAN CONFETTI
  ======================================================= */

  function cleanupConfetti() {

    state.confettiTimeouts.forEach(
      (timeout) => {

        window.clearTimeout(
          timeout
        );

      }
    );


    state.confettiTimeouts.clear();


    if (els.confettiContainer) {

      els.confettiContainer.replaceChildren();

    }

  }


  /* =======================================================
     FIREWORKS
  ======================================================= */

  function createFirework(
    originX,
    originY
  ) {

    const container =
      els.fireworksContainer;


    if (
      !container ||
      state.reducedMotion
    ) {

      return;

    }


    const config =
      state.isLowPower
        ? MOBILE
        : DESKTOP;


    const sparks =
      config.fireworkSparks;


    const fragment =
      document.createDocumentFragment();


    const color =
      FIREWORK_COLORS[
        Math.floor(
          Math.random() *
          FIREWORK_COLORS.length
        )
      ];


    for (
      let i = 0;
      i < sparks;
      i += 1
    ) {

      const spark =
        document.createElement("span");


      spark.className =
        "firework-spark";


      const angle =
        (Math.PI * 2 * i) /
        sparks;


      const radius =
        45 + Math.random() * 70;


      const tx =
        Math.cos(angle) *
        radius;


      const ty =
        Math.sin(angle) *
        radius;


      const duration =
        700 + Math.random() * 400;


      spark.style.left =
        `${originX}px`;


      spark.style.top =
        `${originY}px`;


      spark.style.setProperty(
        "--tx",
        `${tx}px`
      );


      spark.style.setProperty(
        "--ty",
        `${ty}px`
      );


      spark.style.setProperty(
        "--dur",
        `${duration}ms`
      );


      spark.style.setProperty(
        "--c",
        color
      );


      fragment.appendChild(
        spark
      );


      const timeout =
        window.setTimeout(() => {

          spark.remove();

          state.fireworkTimeouts.delete(
            timeout
          );

        }, duration + 200);


      state.fireworkTimeouts.add(
        timeout
      );

    }


    container.appendChild(
      fragment
    );

  }


  /* =======================================================
     FIREWORK SERIES
  ======================================================= */

  function triggerFireworkBurstSeries() {

    if (state.reducedMotion) {
      return;
    }


    cleanupFireworks();


    const width =
      window.innerWidth;


    const height =
      window.innerHeight;


    /*
      Three controlled bursts instead of
      a continuous expensive simulation.
    */

    const bursts =
      state.isLowPower
        ? 2
        : 3;


    for (
      let i = 0;
      i < bursts;
      i += 1
    ) {

      const delay =
        i * 580;


      const timeout =
        window.setTimeout(() => {

          const x =
            width *
            (0.22 + Math.random() * 0.56);


          const y =
            height *
            (0.14 + Math.random() * 0.25);


          createFirework(
            x,
            y
          );


          state.fireworkTimeouts.delete(
            timeout
          );

        }, delay);


      state.fireworkTimeouts.add(
        timeout
      );

    }

  }


  /* =======================================================
     CLEAN FIREWORKS
  ======================================================= */

  function cleanupFireworks() {

    state.fireworkTimeouts.forEach(
      (timeout) => {

        window.clearTimeout(
          timeout
        );

      }
    );


    state.fireworkTimeouts.clear();


    if (els.fireworksContainer) {

      els.fireworksContainer.replaceChildren();

    }

  }


  /* =======================================================
     BACKGROUND PARTICLES
  ======================================================= */

  function createBackgroundParticles() {

    const container =
      els.particlesContainer;


    if (!container) {
      return;
    }


    container.replaceChildren();


    if (state.reducedMotion) {
      return;
    }


    const config =
      state.isLowPower
        ? MOBILE
        : DESKTOP;


    const count =
      config.particles;


    const fragment =
      document.createDocumentFragment();


    for (
      let i = 0;
      i < count;
      i += 1
    ) {

      const dot =
        document.createElement("span");


      dot.className =
        "p-dot";


      const size =
        1 + Math.random() * 2;


      const x =
        Math.random() * 100;


      const y =
        Math.random() * 100;


      const duration =
        4 + Math.random() * 6;


      const delay =
        Math.random() * 5;


      const opacity =
        0.25 + Math.random() * 0.5;


      dot.style.setProperty(
        "--s",
        `${size}px`
      );


      dot.style.setProperty(
        "--x",
        `${x}%`
      );


      dot.style.setProperty(
        "--y",
        `${y}%`
      );


      dot.style.setProperty(
        "--dur",
        `${duration}s`
      );


      dot.style.setProperty(
        "--delay",
        `${delay}s`
      );


      dot.style.setProperty(
        "--o",
        opacity
      );


      fragment.appendChild(
        dot
      );

    }


    container.appendChild(
      fragment
    );

  }


  /* =======================================================
     MAKE A WISH
  ======================================================= */

  function makeWish() {

    if (
      state.wishUsed
    ) {

      return;

    }


    state.wishUsed =
      true;


    if (els.wishText) {

      els.wishText.textContent =
        "Close your eyes… Make a beautiful wish ✨";

    }


    els.candle?.classList.add(
      "is-blown"
    );


    announce(
      "Make a beautiful wish."
    );


    /*
      Small celebration around the cake.
    */

    if (
      els.cake &&
      !state.reducedMotion
    ) {

      const rect =
        els.cake.getBoundingClientRect();


      createFirework(
        rect.left +
        rect.width / 2,

        rect.top +
        rect.height * 0.28
      );

    }


    window.setTimeout(() => {

      state.wishUsed = false;

    }, 2200);

  }


  /* =======================================================
     SURPRISE CARD
  ======================================================= */

  function revealSurprise() {

    if (!els.surpriseCard) {
      return;
    }


    const currentlyRevealed =
      els.surpriseCard.getAttribute(
        "data-revealed"
      ) === "true";


    const next =
      !currentlyRevealed;


    els.surpriseCard.setAttribute(
      "data-revealed",
      String(next)
    );


    els.revealButton?.setAttribute(
      "aria-expanded",
      String(next)
    );


    els.surpriseBack?.setAttribute(
      "aria-hidden",
      String(!next)
    );


    const label =
      els.revealButton?.querySelector(
        "span"
      );


    if (label) {

      label.textContent =
        next
          ? "Close the Card"
          : "Open the Card";

    }

  }


  /* =======================================================
     REPLAY
  ======================================================= */

  function resetExperience() {

    clearCountdown();

    cleanupEffects();


    state.wishUsed =
      false;

    state.countdownValue =
      COUNTDOWN_START;


    /*
      Stop music
    */

    if (els.birthdayAudio) {

      els.birthdayAudio.pause();

      try {

        els.birthdayAudio.currentTime = 0;

      } catch (_error) {

        /* Ignore unsupported seek */

      }

    }


    state.musicPlaying =
      false;


    state.musicStartedByUser =
      false;


    setMusicUI(false);


    /*
      Reset wish
    */

    els.wishText &&
      (els.wishText.textContent = "");


    els.candle?.classList.remove(
      "is-blown"
    );


    /*
      Reset card
    */

    els.surpriseCard?.setAttribute(
      "data-revealed",
      "false"
    );


    els.revealButton?.setAttribute(
      "aria-expanded",
      "false"
    );


    els.surpriseBack?.setAttribute(
      "aria-hidden",
      "true"
    );


    const revealLabel =
      els.revealButton?.querySelector(
        "span"
      );


    if (revealLabel) {

      revealLabel.textContent =
        "Open the Card";

    }


    /*
      Reset screen
    */

    els.birthdayScreen?.classList.add(
      "hidden"
    );


    els.countdownScreen?.classList.add(
      "hidden"
    );


    els.welcomeScreen?.classList.remove(
      "hidden"
    );


    /*
      Reset validation
    */

    if (els.nameError) {
      els.nameError.textContent = "";
    }


    if (els.birthdayError) {
      els.birthdayError.textContent = "";
    }


    announce(
      "Birthday surprise reset."
    );


    /*
      Bring user back to the welcome area
      without refreshing the page.
    */

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });


    window.setTimeout(() => {

      els.nameInput?.focus();

    }, 350);

  }


  /* =======================================================
     SHARE
  ======================================================= */

  async function handleShare() {

    const shareData = {
      title: "BirthdayVerse",
      text:
        `A birthday surprise for ${state.name || "someone special"} 🎂`
    };


    /*
      Use native share where supported.
    */

    if (
      navigator.share &&
      state.name
    ) {

      try {

        await navigator.share(
          shareData
        );

        announce(
          "BirthdayVerse shared successfully."
        );

        return;

      } catch (error) {

        /*
          User cancelled share —
          no need to show an error.
        */

        if (
          error &&
          error.name ===
            "AbortError"
        ) {

          return;

        }

      }

    }


    announce(
      "Share is available on supported devices."
    );

  }


  /* =======================================================
     VISIBILITY
  ======================================================= */

  function handleVisibilityChange() {

    state.pageVisible =
      document.visibilityState ===
      "visible";


    /*
      Stop fireworks while the tab is
      not visible to avoid unnecessary work.
    */

    if (!state.pageVisible) {

      cleanupFireworks();

    }

  }


  /* =======================================================
     REDUCED MOTION
  ======================================================= */

  function handleReducedMotion() {

    document.body.classList.toggle(
      "reduce-motion",
      state.reducedMotion
    );


    if (state.reducedMotion) {

      cleanupEffects();

    }

  }


  /* =======================================================
     CLEAN ALL EFFECTS
  ======================================================= */

  function cleanupEffects() {

    cleanupConfetti();

    cleanupFireworks();

    cleanupBalloons();

  }


  /* =======================================================
     STORAGE
  ======================================================= */

  function saveName(name) {

    try {

      window.localStorage.setItem(
        STORAGE_KEY,
        name
      );

    } catch (_error) {

      /*
        Storage can be disabled
        in private browsing.
      */

    }

  }


  function restoreSavedName() {

    try {

      const saved =
        window.localStorage.getItem(
          STORAGE_KEY
        );


      if (
        saved &&
        els.nameInput
      ) {

        els.nameInput.value =
          saved;

      }

    } catch (_error) {

      /* Ignore storage errors */

    }

  }


  /* =======================================================
     EVENT LISTENERS
  ======================================================= */

  function setupEventListeners() {

    /*
      Main welcome submit
    */

    els.welcomeForm?.addEventListener(
      "submit",
      handleWelcomeSubmit
    );


    /*
      Music
    */

    els.musicButton?.addEventListener(
      "click",
      toggleMusic
    );


    /*
      Wish
    */

    els.wishButton?.addEventListener(
      "click",
      makeWish
    );


    /*
      Surprise card
    */

    els.revealButton?.addEventListener(
      "click",
      revealSurprise
    );


    /*
      Replay
    */

    els.replayButton?.addEventListener(
      "click",
      resetExperience
    );


    /*
      Share
    */

    els.shareButton?.addEventListener(
      "click",
      handleShare
    );


    /*
      Visibility
    */

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );


    /*
      Resize
    */

    window.addEventListener(
      "resize",
      debounce(() => {

        detectEnvironment();

        createBackgroundParticles();

      }, 300)
    );

  }


  /* =======================================================
     DEBOUNCE
  ======================================================= */

  function debounce(
    callback,
    wait
  ) {

    let timeoutId = null;


    return (...args) => {

      window.clearTimeout(
        timeoutId
      );


      timeoutId =
        window.setTimeout(
          () => {

            callback(...args);

          },
          wait
        );

    };

  }


  /* =======================================================
     BOOT
  ======================================================= */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );

  } else {

    init();

  }

})();