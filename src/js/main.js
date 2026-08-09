/* ==========================================================================
   GROW MORE DIGITALLY - MAIN APPLICATION LOGIC
   Founder: Rachit Soni | WhatsApp: 9327784142 | Instagram: Grow.moredigitally
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Smooth 0%-100% Preloader Counter
  initPreloader();

  // 2. Custom Neon Cursor & Magnet Buttons
  initCustomCursor();

  // 3. Navbar Scroll & Mobile Menu
  initNavigation();

  // 4. Scroll Reveal Animations
  initScrollReveals();

  // 5. 5-Field Direct WhatsApp Inquiry Form
  initWhatsAppForm();

  // 6. Init features that rely on CDN scripts (with retry logic)
  tryInitLucide();
  tryInit3D();
  initCounters();
  init3DTilt();
});

function tryInitLucide(attempts) {
  attempts = attempts || 0;
  if (window.lucide) {
    lucide.createIcons();
  } else if (attempts < 20) {
    setTimeout(() => tryInitLucide(attempts + 1), 200);
  }
}

function tryInit3D(attempts) {
  attempts = attempts || 0;
  if (typeof THREE !== 'undefined') {
    init3DBackground();
  } else if (attempts < 20) {
    setTimeout(() => tryInit3D(attempts + 1), 300);
  }
}

/* ==========================================================================
   1. PRELOADER
   ========================================================================== */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const preloaderBar = document.getElementById('preloaderBar');
  const preloaderNumber = document.getElementById('preloaderNumber');
  
  if (!preloader) return;

  function dismiss() {
    preloader.classList.add('hide');
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 700);
  }

  // Hard timeout: always dismiss preloader after 1.5 seconds no matter what
  const hardTimeout = setTimeout(dismiss, 1500);

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 10;
    if (progress > 100) progress = 100;

    if (preloaderBar) preloaderBar.style.width = `${progress}%`;
    if (preloaderNumber) preloaderNumber.textContent = `${progress}%`;

    if (progress >= 100) {
      clearInterval(interval);
      clearTimeout(hardTimeout);
      setTimeout(dismiss, 300);
    }
  }, 40);
}

/* ==========================================================================
   2. THREE.JS 3D MOTION BACKGROUND
   ========================================================================== */
function init3DBackground() {
  const canvas = document.getElementById('bg3dCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Create Particle Geometry
  const particleCount = 120;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorLime = new THREE.Color('#8CDB00');
  const colorWhite = new THREE.Color('#ffffff');

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 60;
    positions[i + 1] = (Math.random() - 0.5) * 60;
    positions[i + 2] = (Math.random() - 0.5) * 40;

    const mixedColor = Math.random() > 0.4 ? colorLime : colorWhite;
    colors[i] = mixedColor.r;
    colors[i + 1] = mixedColor.g;
    colors[i + 2] = mixedColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  });

  const particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);

  // Line Mesh Connecting Particles
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x8CDB00,
    transparent: true,
    opacity: 0.15
  });
  
  const lineGeometry = new THREE.BufferGeometry();
  const linePositions = new Float32Array(particleCount * 6);
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lineMesh);

  // Mouse Interactivity
  let mouseX = 0;
  let mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);

    particleSystem.rotation.y += 0.0015;
    particleSystem.rotation.x += 0.0008;

    camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 5 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    // Update connecting lines
    const pos = particleSystem.geometry.attributes.position.array;
    let lineIdx = 0;
    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < 12 && lineIdx < particleCount * 6 - 6) {
          linePositions[lineIdx++] = pos[i * 3];
          linePositions[lineIdx++] = pos[i * 3 + 1];
          linePositions[lineIdx++] = pos[i * 3 + 2];
          linePositions[lineIdx++] = pos[j * 3];
          linePositions[lineIdx++] = pos[j * 3 + 1];
          linePositions[lineIdx++] = pos[j * 3 + 2];
        }
      }
    }
    lineMesh.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();

  // Window Resize Listener
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* ==========================================================================
   3. CUSTOM CURSOR & MAGNETIC BUTTONS
   ========================================================================== */
function initCustomCursor() {
  const dot = document.getElementById('cursorDot');
  const outline = document.getElementById('cursorOutline');
  if (!dot || !outline) return;

  let mouseX = 0, mouseY = 0;
  let outlineX = 0, outlineY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  function renderCursor() {
    outlineX += (mouseX - outlineX) * 0.18;
    outlineY += (mouseY - outlineY) * 0.18;

    outline.style.left = `${outlineX}px`;
    outline.style.top = `${outlineY}px`;

    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Hover States
  const hoverables = document.querySelectorAll('a, button, input, label, .tilt-card');
  hoverables.forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Magnetic Button Effect
  const magnetBtns = document.querySelectorAll('.magnet-btn');
  magnetBtns.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);

      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });
}

/* ==========================================================================
   4. NAVIGATION & MOBILE MENU
   ========================================================================== */
function initNavigation() {
  const navbar = document.getElementById('navbar');
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const drawer = document.getElementById('mobileDrawer');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = drawer.style.display === 'flex';
      drawer.style.display = isOpen ? 'none' : 'flex';
      drawer.style.flexDirection = 'column';
    });

    const mobileLinks = drawer.querySelectorAll('a');
    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        drawer.style.display = 'none';
      });
    });
  }
}

/* ==========================================================================
   5. 3D TILT CARDS
   ========================================================================== */
function init3DTilt() {
  const tiltCards = document.querySelectorAll('.tilt-card');

  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

/* ==========================================================================
   6. ANIMATED STATS COUNTERS
   ========================================================================== */
function initCounters() {
  const counters = document.querySelectorAll('.metric-number');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const targetVal = parseFloat(counter.getAttribute('data-target') || '0');
        const suffix = counter.getAttribute('data-suffix') || '';
        const isDecimal = counter.getAttribute('data-decimal') === 'true';

        let current = 0;
        const duration = 2000;
        const stepTime = 30;
        const totalSteps = duration / stepTime;
        const increment = targetVal / totalSteps;

        const timer = setInterval(() => {
          current += increment;
          if (current >= targetVal) {
            current = targetVal;
            clearInterval(timer);
          }

          counter.textContent = isDecimal ? current.toFixed(1) + suffix : Math.floor(current) + suffix;
        }, stepTime);

        observer.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach((c) => observer.observe(c));
}

/* ==========================================================================
   7. ENTRANCE REVEALS
   ========================================================================== */
function initScrollReveals() {
  const reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  // Activate hero section elements immediately after preloader
  setTimeout(() => {
    document.querySelectorAll('#hero .reveal-up, #hero .reveal-left, #hero .reveal-right').forEach((el) => {
      el.classList.add('active');
    });
  }, 400);

  // Safety fallback after 1.5s so everything reveals cleanly
  setTimeout(() => {
    reveals.forEach((el) => el.classList.add('active'));
  }, 1500);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('active'));
  }
}

/* ==========================================================================
   8. DIRECT WHATSAPP INQUIRY FORM (5 FIELDS)
   ========================================================================== */
function initWhatsAppForm() {
  const form = document.getElementById('whatsappInquiryForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('clientName')?.value.trim();
    const number = document.getElementById('clientNumber')?.value.trim();
    const email = document.getElementById('clientEmail')?.value.trim();
    const business = document.getElementById('clientBusiness')?.value.trim();

    // Checked services
    const checkedBoxes = form.querySelectorAll('input[name="servicesNeeded"]:checked');
    const selectedServices = Array.from(checkedBoxes).map(cb => cb.value);

    if (!name || !number || !email || !business) {
      alert('Please fill in all required fields.');
      return;
    }

    if (selectedServices.length === 0) {
      alert('Please select at least one service you need.');
      return;
    }

    // Trigger Celebration Confetti
    if (window.confetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Construct WhatsApp Formatted Payload
    const formattedServices = selectedServices.map(s => `• ${s}`).join('\n');
    
    const message = `🔥 *NEW INQUIRY - GROW MORE DIGITALLY* 🔥\n\n` +
      `👤 *Name:* ${name}\n` +
      `📞 *Phone/WhatsApp:* ${number}\n` +
      `✉️ *Email:* ${email}\n` +
      `🏢 *Business / Handle:* ${business}\n\n` +
      `⚡ *Services Required:*\n${formattedServices}\n\n` +
      `🌐 _Sent via Grow More Digitally Official Website_`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappPhone = '919327784142'; // Rachit Soni WhatsApp Number
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${encodedMessage}`;

    // Direct window location redirect so popup blockers in browser/iframe never block WhatsApp opening
    window.location.href = whatsappUrl;
  });
}

/* ==========================================================================
   9. SERVICE MODAL DETAILS
   ========================================================================== */
const serviceData = {
  'script-writing': {
    title: 'SCRIPT WRITING',
    sub: 'IDEA & CONCEPT',
    description: 'Our scriptwriting strategy focuses on retention engineering. We craft viral hooks that capture audience attention in the first 3 seconds, structure high-value story arcs, and weave seamlessly into strong Calls-To-Action (CTAs).',
    bullets: [
      'Custom hook frameworks tailored to your niche',
      'Word-for-word spoken scripts with camera angle cues',
      'Audience retention optimization & visual pacing',
      'Pitched for high-converting Instagram Reels & Shorts'
    ]
  },
  'video-creation': {
    title: 'VIDEO CREATION',
    sub: 'SHOOTING FOR REELS',
    description: 'High-end video production designed to showcase your personal brand or business. We manage lighting, audio clarity, and creative direction on-set.',
    bullets: [
      'Professional Shooting',
      'Microphone Audio Capture'
    ]
  },
  'reel-editing': {
    title: 'REEL EDITING',
    sub: 'MAKING POSTS',
    description: 'Turn raw footage into thumb-stopping visual assets. We utilize fast-paced cuts, motion graphics, and background tracks to maximize watch time.',
    bullets: [
      'Kinetic Captions & Motion FX',
      'Sound Design & Background Tracks'
    ]
  },
  'instagram-handling': {
    title: 'INSTAGRAM HANDLING',
    sub: 'GROW YOUR BRAND',
    description: 'Comprehensive Instagram growth management. We turn your profile into a high-converting landing page, schedule content strategically, and optimize for the algorithm.',
    bullets: [
      'Content Calendar & Bio Setup',
      'Hashtag & Audio Trend Strategy',
      'Weekly Analytics & Growth Audits'
    ]
  },
  'digital-marketing': {
    title: 'DIGITAL MARKETING',
    sub: 'RESULTS THAT GROW',
    description: 'Targeted growth campaigns, lead generation funnels, and search engine optimization to scale your business.',
    bullets: [
      'SEO Management',
      'Social Media Marketing',
      'Leads Generation',
      'Trackable Revenue Growth'
    ]
  }
};

window.openServiceModal = function(id) {
  const modal = document.getElementById('serviceModal');
  const content = document.getElementById('modalContent');
  const data = serviceData[id];

  if (!modal || !content || !data) return;

  content.innerHTML = `
    <span class="tag-pill neon-pill">${data.sub}</span>
    <h2 style="font-family: var(--font-heading); font-weight: 900; font-size: 2rem; margin: 12px 0;">${data.title}</h2>
    <p style="color: var(--text-muted); margin-bottom: 24px;">${data.description}</p>
    <h4 style="font-family: var(--font-heading); margin-bottom: 12px;">Deliverables & Highlights:</h4>
    <ul style="list-style: none; margin-bottom: 28px;">
      ${data.bullets.map(b => `<li style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;"><span style="color: var(--lime-primary);">✓</span> ${b}</li>`).join('')}
    </ul>
    <a href="#inquiry" onclick="closeServiceModal()" class="btn btn-neon width-full magnet-btn">Inquire for ${data.title}</a>
  `;

  modal.classList.add('active');
};

window.closeServiceModal = function() {
  const modal = document.getElementById('serviceModal');
  modal?.classList.remove('active');
};
