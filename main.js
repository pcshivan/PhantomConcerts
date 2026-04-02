/*
  Phantom Concerts JavaScript
  This script adds interactivity to the Phantom Concerts website, including responsive
  navigation, scroll animations, countdown timer, audio visualization, and placeholders
  for ticket purchasing. It leverages GSAP for smooth animations and Lottie for icons.
*/

// Wait until DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
  /* Navigation toggle for mobile */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.classList.toggle('open');
  });
  // Close navigation on link click (mobile)
  document.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
    });
  });

  /* Sticky Navbar on scroll */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  /* GSAP scroll animations */
  if (typeof gsap !== 'undefined') {
    gsap.utils.toArray('.section').forEach((section) => {
      gsap.from(section, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
        },
      });
    });
  }

  /* Lottie icons for feature cards
     Replace the JSON paths below with your own Lottie JSON files or remote URLs.
  */
  const lottieAnimations = {
    ai: 'https://assets3.lottiefiles.com/packages/lf20_rovf9gzu.json',
    performance: 'https://assets4.lottiefiles.com/packages/lf20_bosycmvf.json',
    audio: 'https://assets2.lottiefiles.com/packages/lf20_ewhxhgms.json',
  };
  const loadLottie = (containerId, path) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path,
    });
  };
  loadLottie('lottie-ai', lottieAnimations.ai);
  loadLottie('lottie-performance', lottieAnimations.performance);
  loadLottie('lottie-audio', lottieAnimations.audio);

  /* Countdown Timer */
  const countdownElements = {
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
  };
  const targetDate = new Date('2026-06-01T20:00:00+05:30');
  function updateCountdown() {
    const now = new Date();
    const diff = targetDate - now;
    if (diff <= 0) {
      // Countdown finished
      countdownElements.days.textContent = '00';
      countdownElements.hours.textContent = '00';
      countdownElements.minutes.textContent = '00';
      countdownElements.seconds.textContent = '00';
      clearInterval(countdownInterval);
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    countdownElements.days.textContent = String(days).padStart(2, '0');
    countdownElements.hours.textContent = String(hours).padStart(2, '0');
    countdownElements.minutes.textContent = String(minutes).padStart(2, '0');
    countdownElements.seconds.textContent = String(seconds).padStart(2, '0');
  }
  const countdownInterval = setInterval(updateCountdown, 1000);
  updateCountdown();

  /* Audio Visualization Placeholder
     This creates a simple animated bar graph. Replace the implementation below with one
     that reacts to your music source via Web Audio API for an authentic visualization.
  */
  const audioCanvas = document.getElementById('audio-visualization');
  if (audioCanvas) {
    const ctx = audioCanvas.getContext('2d');
    const bars = 64;
    function resizeCanvas() {
      audioCanvas.width = window.innerWidth;
      audioCanvas.height = audioCanvas.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, audioCanvas.width, audioCanvas.height);
      for (let i = 0; i < bars; i++) {
        const x = (i / bars) * audioCanvas.width;
        const barWidth = audioCanvas.width / bars - 2;
        const height = (Math.sin((i + frame) * 0.3) * 0.5 + 0.5) * audioCanvas.height * 0.6;
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#ff007a');
        gradient.addColorStop(0.5, '#6e00ff');
        gradient.addColorStop(1, '#00e0ff');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, audioCanvas.height - height, barWidth, height);
      }
      frame += 0.5;
      requestAnimationFrame(animate);
    }
    animate();
  }

  /* Ticket Purchase Handler
     When the user clicks the book button, integrate with your payment gateway. The placeholder
     simply displays an alert. Replace this with Razorpay, Stripe, or another service.
  */
  const bookBtn = document.getElementById('book-tickets');
  bookBtn.addEventListener('click', () => {
    alert('Ticket purchasing is coming soon. Please follow us for updates!');
    // Example integration (pseudo-code):
    // const options = { key: 'yourKey', amount: 5000, currency: 'INR', ... };
    // const paymentObject = new Razorpay(options);
    // paymentObject.open();
  });

  /* Enter Experience Handler
     Scroll to the first section or trigger a 3D WebGL scene. For demonstration, we scroll to
     the experience section. Replace with your immersive scene initialization if desired.
  */
  const enterBtn = document.getElementById('enter-experience');
  enterBtn.addEventListener('click', () => {
    const experienceSection = document.getElementById('experience');
    experienceSection.scrollIntoView({ behavior: 'smooth' });
  });
});