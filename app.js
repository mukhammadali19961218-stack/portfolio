(function () {
  const FRAME_COUNT = 240;
  const FOLDER_NAME = 'ezgif-4349b864ac56fe57-jpg';

  let canvas, ctx, loader, loaderText, progressFill;
  let sec1, sec2, sec3, sec4, navLinks;
  const images = [];
  let loadedCount = 0;
  let isAppInitialized = false;

  // Frame interpolation variables
  let targetFrame = 0;
  let currentFrame = 0;
  let isLoopRunning = false;
  let currentProgress = 0;

  // Generate image frame URL
  function getFrameUrl(index) {
    const frameNum = String(index).padStart(3, '0');
    return `./${FOLDER_NAME}/ezgif-frame-${frameNum}.jpg`;
  }

  // Preload all 240 images
  function preloadImages() {
    const fallbackTimer = setTimeout(() => {
      if (!isAppInitialized) {
        console.warn('Preload timeout reached, initializing app...');
        initApp();
      }
    }, 2500);

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);

      const onComplete = () => {
        loadedCount++;
        const percent = Math.min(100, Math.floor((loadedCount / FRAME_COUNT) * 100));

        if (loaderText) loaderText.textContent = `Loading frames... ${percent}%`;
        if (progressFill) progressFill.style.width = `${percent}%`;

        if (i === 1 && !isAppInitialized) {
          renderFrame(0);
        }

        if (loadedCount >= FRAME_COUNT && !isAppInitialized) {
          clearTimeout(fallbackTimer);
          initApp();
        }
      };

      img.onload = onComplete;
      img.onerror = () => {
        console.warn(`Failed to load: ${getFrameUrl(i)}`);
        onComplete();
      };

      images.push(img);
    }
  }

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    renderFrame(Math.round(currentFrame));
  }

  function renderFrame(index) {
    if (!canvas || !ctx) return;
    const frameIdx = Math.max(0, Math.min(FRAME_COUNT - 1, index));
    const img = images[frameIdx];

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    ctx.clearRect(0, 0, viewportW, viewportH);

    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    // Cover math to fill 100% of screen without black borders
    const scale = Math.max(viewportW / imgW, viewportH / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const drawX = (viewportW - drawW) / 2;
    const drawY = (viewportH - drawH) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  function updateScrollTarget() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    currentProgress = Math.max(0, Math.min(1, scrollTop / maxScroll));

    targetFrame = currentProgress * (FRAME_COUNT - 1);
    updateSections(currentProgress);
  }

  function animateSection(elem, progress, startIn, fullIn, startOut, fullOut) {
    if (!elem) return;

    let opacity = 0;
    let translateY = 35;

    if (progress >= startIn && progress <= fullOut) {
      if (progress < fullIn && fullIn > startIn) {
        const t = (progress - startIn) / (fullIn - startIn);
        opacity = t;
        translateY = 35 * (1 - t);
      } else if (progress > startOut && fullOut > startOut) {
        const t = (progress - startOut) / (fullOut - startOut);
        opacity = 1 - t;
        translateY = -35 * t;
      } else {
        opacity = 1;
        translateY = 0;
      }
    }

    elem.style.opacity = opacity.toFixed(3);
    elem.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;

    if (opacity > 0.05) {
      elem.style.pointerEvents = 'auto';
      elem.classList.add('active');
    } else {
      elem.style.pointerEvents = 'none';
      elem.classList.remove('active');
    }
  }

  function updateSections(progress) {
    // Continuous cross-fade transitions with zero gaps
    animateSection(sec1, progress, 0.0, 0.0, 0.32, 0.46);
    animateSection(sec3, progress, 0.34, 0.48, 0.68, 0.80);
    animateSection(sec4, progress, 0.68, 0.80, 1.0, 1.0);

    if (navLinks && navLinks.length >= 3) {
      navLinks[0].classList.toggle('active', progress < 0.40);
      navLinks[1].classList.toggle('active', progress >= 0.40 && progress < 0.72);
      navLinks[2].classList.toggle('active', progress >= 0.72);
    }
  }

  function setupNavClickScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');

    anchors.forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href) return;

        e.preventDefault();

        let targetProgress = 0.0;
        if (href === '#sec-1') targetProgress = 0.0;
        else if (href === '#sec-3') targetProgress = 0.52;
        else if (href === '#sec-4') targetProgress = 0.85;

        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const targetY = maxScroll * targetProgress;

        window.scrollTo({
          top: targetY,
          behavior: 'smooth'
        });
      });
    });
  }

  function setup3DHoverEffects() {
    const selector = '.hero-statement, .about-title, .projects-title, .nav-links a, .btn-primary, .project-card, .service-item, .brand-logo';
    const targets = document.querySelectorAll(selector);

    targets.forEach(elem => {
      let isHovered = false;

      elem.addEventListener('mouseenter', () => {
        isHovered = true;
      });

      elem.addEventListener('mousemove', (e) => {
        if (!isHovered) return;
        const rect = elem.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) / (rect.width / 2);
        const deltaY = (e.clientY - centerY) / (rect.height / 2);

        const rotateX = (-deltaY * 18).toFixed(2);
        const rotateY = (deltaX * 18).toFixed(2);

        const isText = elem.classList.contains('hero-statement') ||
                       elem.classList.contains('about-title') ||
                       elem.classList.contains('projects-title') ||
                       elem.classList.contains('service-item') ||
                       elem.classList.contains('brand-logo');

        if (isText) {
          elem.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(24px)`;
          elem.style.textShadow = `${-deltaX * 12}px ${-deltaY * 12}px 25px rgba(255, 87, 34, 0.45), 0 0 40px rgba(255, 87, 34, 0.25)`;
        } else {
          elem.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(16px) scale3d(1.03, 1.03, 1.03)`;
          elem.style.boxShadow = `0 20px 40px rgba(0, 0, 0, 0.5), ${-deltaX * 14}px ${-deltaY * 14}px 35px rgba(255, 87, 34, 0.3)`;
        }
      });

      elem.addEventListener('mouseleave', () => {
        isHovered = false;
        elem.style.transform = '';
        if (isText) {
          elem.style.textShadow = '';
        } else {
          elem.style.boxShadow = '';
        }
      });
    });
  }

  function setupContactModal() {
    const contactModal = document.getElementById('contact-modal');
    const modalClose = document.getElementById('modal-close');
    const btnPrimaries = document.querySelectorAll('.btn-primary');

    if (!contactModal) return;

    btnPrimaries.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        contactModal.classList.add('open');
      });
    });

    if (modalClose) {
      modalClose.addEventListener('click', () => {
        contactModal.classList.remove('open');
      });
    }

    contactModal.addEventListener('click', (e) => {
      if (e.target === contactModal) {
        contactModal.classList.remove('open');
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && contactModal.classList.contains('open')) {
        contactModal.classList.remove('open');
      }
    });
  }

  function animate() {
    const diff = targetFrame - currentFrame;

    if (Math.abs(diff) > 0.001) {
      currentFrame += diff * 0.12;
      renderFrame(Math.round(currentFrame));
    } else if (currentFrame !== targetFrame) {
      currentFrame = targetFrame;
      renderFrame(Math.round(currentFrame));
    }

    requestAnimationFrame(animate);
  }

  function setupLightboxModal() {
    const modal = document.getElementById('lightbox-modal');
    const modalImg = document.getElementById('lightbox-img');
    const modalCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.getElementById('lightbox-close');
    const backdrop = document.getElementById('lightbox-backdrop');

    if (!modal) return;

    window.openImageLightbox = function(imgSrc, title) {
      if (modalImg) modalImg.src = imgSrc;
      if (modalCaption) modalCaption.textContent = title || '';
      modal.classList.add('open');
    };

    function closeModal() {
      modal.classList.remove('open');
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
      }
    });
  }

  function setupFanCarousel() {
    const wrapper = document.getElementById('fan-cards-wrapper');
    const cards = document.querySelectorAll('.fan-card-item');
    const prevBtn = document.getElementById('fan-prev-btn');
    const nextBtn = document.getElementById('fan-next-btn');
    const dotsContainer = document.getElementById('fan-dots');

    if (!cards.length) return;

    const total = cards.length;
    let centerIndex = 0;

    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      cards.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = `fan-dot ${i === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => {
          centerIndex = i;
          updateFanLayout();
        });
        dotsContainer.appendChild(dot);
      });
    }

    const fanPositions = [
      { rot: -21, scale: 0.78, x: -300, y: 30, zIndex: 1 },
      { rot: -14, scale: 0.85, x: -200, y: 15, zIndex: 2 },
      { rot: -7,  scale: 0.93, x: -100, y: 5,  zIndex: 3 },
      { rot: 0,   scale: 1.05, x: 0,    y: -10, zIndex: 10 },
      { rot: 7,   scale: 0.93, x: 100,  y: 5,  zIndex: 3 },
      { rot: 14,  scale: 0.85, x: 200,  y: 15, zIndex: 2 },
      { rot: 21,  scale: 0.78, x: 300,  y: 30, zIndex: 1 }
    ];

    function updateFanLayout(dragOffset = 0) {
      const isMobile = window.innerWidth < 640;
      const xMult = isMobile ? 0.45 : 1.0;

      cards.forEach((card, index) => {
        let diff = index - centerIndex;
        if (diff > total / 2) diff -= total;
        if (diff < -total / 2) diff += total;

        let slot = diff + 3;
        if (slot >= 0 && slot < fanPositions.length) {
          const pos = fanPositions[slot];
          const rotOffset = (dragOffset / 20);
          card.style.opacity = '1';
          card.style.transform = `translate3d(${pos.x * xMult + dragOffset}px, ${pos.y}px, 0) rotate(${pos.rot + rotOffset}deg) scale(${pos.scale})`;
          card.style.zIndex = pos.zIndex;
        } else {
          card.style.opacity = '0';
          card.style.transform = `translate3d(${dragOffset}px, 100px, 0) scale(0.5)`;
          card.style.zIndex = '0';
        }
      });

      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.fan-dot');
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === centerIndex);
        });
      }
    }

    // Mouse Drag / Touch Swipe Control
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let hasDragged = false;

    function onDragStart(e) {
      isDragging = true;
      hasDragged = false;
      startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    }

    function onDragMove(e) {
      if (!isDragging) return;
      currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const deltaX = currentX - startX;
      if (Math.abs(deltaX) > 8) hasDragged = true;
      updateFanLayout(deltaX * 0.8);
    }

    function onDragEnd(e) {
      if (!isDragging) return;
      isDragging = false;
      const deltaX = currentX - startX;
      if (hasDragged && Math.abs(deltaX) > 40) {
        if (deltaX < 0) {
          centerIndex = (centerIndex + 1) % total;
        } else {
          centerIndex = (centerIndex - 1 + total) % total;
        }
      }
      startX = 0;
      currentX = 0;
      updateFanLayout(0);
    }

    if (wrapper) {
      wrapper.addEventListener('mousedown', onDragStart);
      window.addEventListener('mousemove', onDragMove);
      window.addEventListener('mouseup', onDragEnd);

      wrapper.addEventListener('touchstart', onDragStart, { passive: true });
      window.addEventListener('touchmove', onDragMove, { passive: true });
      window.addEventListener('touchend', onDragEnd);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        centerIndex = (centerIndex - 1 + total) % total;
        updateFanLayout(0);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        centerIndex = (centerIndex + 1) % total;
        updateFanLayout(0);
      });
    }

    cards.forEach((card, index) => {
      card.addEventListener('click', (e) => {
        if (hasDragged) return;
        const img = card.getAttribute('data-img');
        const title = card.getAttribute('data-title');

        if (centerIndex === index) {
          if (window.openImageLightbox && img) {
            window.openImageLightbox(img, title);
          }
        } else {
          centerIndex = index;
          updateFanLayout(0);
        }
      });
    });

    updateFanLayout(0);
    window.addEventListener('resize', () => updateFanLayout(0));
  }

  function initApp() {
    if (isAppInitialized) return;
    isAppInitialized = true;

    // Cache elements
    sec1 = document.getElementById('sec-1');
    sec2 = document.getElementById('sec-2');
    sec3 = document.getElementById('sec-3');
    sec4 = document.getElementById('sec-4');
    navLinks = document.querySelectorAll('.nav-links a');

    // Hide loader immediately
    const loaderElem = document.getElementById('loader');
    if (loaderElem) {
      loaderElem.classList.add('hidden');
      loaderElem.style.display = 'none';
      setTimeout(() => {
        if (loaderElem.parentNode) loaderElem.parentNode.removeChild(loaderElem);
      }, 100);
    }

    // Set canvas dimensions & render current scroll position
    resizeCanvas();
    updateScrollTarget();
    currentFrame = targetFrame;
    renderFrame(Math.round(currentFrame));

    // Setup Nav Smooth Scroll, 3D Hover, Contact Modal, Lightbox & Fan Carousel
    setupNavClickScroll();
    setup3DHoverEffects();
    setupContactModal();
    setupLightboxModal();
    setupFanCarousel();

    // Global click listener for mentor items
    document.addEventListener('click', (e) => {
      const mentorItem = e.target.closest('.mentor-item');
      if (mentorItem) {
        const href = mentorItem.getAttribute('href');
        if (href) {
          window.open(href, '_blank', 'noopener,noreferrer');
        }
      }
    });

    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', updateScrollTarget, { passive: true });

    // Start animation loop
    if (!isLoopRunning) {
      isLoopRunning = true;
      animate();
    }
  }

  function start() {
    canvas = document.getElementById('hero-canvas');
    if (canvas) ctx = canvas.getContext('2d');
    loader = document.getElementById('loader');
    loaderText = document.getElementById('loader-text');
    progressFill = document.getElementById('progress-fill');

    if (loader) {
      loader.addEventListener('click', () => {
        initApp();
      });
    }

    preloadImages();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
