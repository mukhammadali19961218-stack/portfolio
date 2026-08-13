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

        if (loaderText) loaderText.textContent = `Sahifa yuklanmoqda... ${percent}%`;
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

  const TRANSLATIONS = {
    uz: {
      nav_home: "Bosh sahifa",
      nav_about: "Men haqimda",
      nav_projects: "Loyihalarim",
      nav_contact: "Bog'lanish",
      hero_greet: "Salom, Mening ismim",
      hero_name: "Namazov<br>Muhammad",
      hero_role: "AI mutaxassisi",
      hero_statement: "Ajoyib dizayn o‘zini namoyon qilmaydi — u shunchaki mukammal his etiladi.",
      hero_description: "G‘oyadan vizual identifikatsiyagacha — insonlar bilan bog‘lanadigan, taassurot qoldiradigan va brendni natijaga aylantiradigan raqamli tajribalar yarataman",
      service_1: "Brend Strategiyasi",
      service_2: "Brend Identifikasiya Dizayni",
      service_3: "Qadoqlash Dizayni",
      service_4: "Kreativ Yo‘nalish",
      tools_label: "Men ishlatadigan vositalar",
      about_tag: "Men haqimda",
      about_title: "G‘oyalarni AI orqali<br>vizual tajribaga<br>aylantiraman",
      about_exp1: "⚡ 1 yillik AI Video & Image Gen",
      about_exp2: "🎨 6 oylik AI Web Design",
      about_role: "AI Creative Specialist & AI Web Designer",
      about_desc: "Men — <strong>AI Creative Specialist</strong> va <strong>AI Web Designer</strong>man. 1 yillik AI video va image generation, hamda 6 oylik AI-powered web design tajribasiga egaman.",
      about_subdesc: "Sun’iy intellekt orqali kreativlik va zamonaviy dizaynni birlashtirib, premium vizual kontent, <em>cinematic video</em> va zamonaviy web tajribalar yarataman.",
      mentors_label: "Bilim ulashgan ustozlarim",
      projects_title: "Mening Loyihalarim",
      tab_images: "Rasmlar",
      tab_videos: "Videolar",
      contact_tag: "Bog'lanish",
      contact_title: "Men bilan aloqa",
      contact_subtitle: "Savollaringiz bo'lsa yoki hamkorlik uchun quyidagi kanallardan birini tanlang:",
      contact_phone_type: "Telefon raqam",
      contact_telegram_type: "Telegram",
      contact_email_type: "Gmail pochtasi"
    },
    ru: {
      nav_home: "Главная",
      nav_about: "Обо мне",
      nav_projects: "Проекты",
      nav_contact: "Связаться",
      hero_greet: "Привет, меня зовут",
      hero_name: "Намазов<br>Мухаммад",
      hero_role: "AI Специалист",
      hero_statement: "Великолепный дизайн не громко заявляет о себе — он просто ощущается безупречно.",
      hero_description: "От идеи до визуальной айдентики — создаю цифровой опыт, который вдохновляет людей и приносит результат бренду.",
      service_1: "Стратегия Бренда",
      service_2: "Дизайн Айдентики",
      service_3: "Дизайн Упаковки",
      service_4: "Креативное Направление",
      tools_label: "Инструменты, которые я использую",
      about_tag: "Обо мне",
      about_title: "Превращаю идеи<br>в визуальный опыт<br>с помощью AI",
      about_exp1: "⚡ 1 год в AI Video & Image Gen",
      about_exp2: "🎨 6 месяцев в AI Web Design",
      about_role: "AI Creative Specialist & AI Web Designer",
      about_desc: "Я — <strong>AI Creative Specialist</strong> и <strong>AI Web Designer</strong>. Имею 1 год опыта в генерации AI видео и изображений, а также 6 месяцев в веб-дизайне.",
      about_subdesc: "Объединяя искусственный интеллект и современный дизайн, создаю премиальный визуальный контент, <em>синематик видео</em> и инновационные веб-проекты.",
      mentors_label: "Мои наставники",
      projects_title: "Мои Проекты",
      tab_images: "Изображения",
      tab_videos: "Видео",
      contact_tag: "Контакты",
      contact_title: "Связаться со мной",
      contact_subtitle: "Если у вас есть вопросы или предложение о сотрудничестве, выберите удобный канал:",
      contact_phone_type: "Номер телефона",
      contact_telegram_type: "Телеграм",
      contact_email_type: "Электронная почта"
    },
    en: {
      nav_home: "Home",
      nav_about: "About Me",
      nav_projects: "Projects",
      nav_contact: "Contact Me",
      hero_greet: "Hello, My name is",
      hero_name: "Namazov<br>Muhammad",
      hero_role: "AI Specialist",
      hero_statement: "Great design doesn’t demand attention — it simply feels effortless.",
      hero_description: "From concept to visual identity — I craft digital experiences that connect people, leave a lasting impression, and drive brand results.",
      service_1: "Brand Strategy",
      service_2: "Visual Identity Design",
      service_3: "Packaging Design",
      service_4: "Creative Direction",
      tools_label: "Tools I Use",
      about_tag: "About Me",
      about_title: "Transforming Ideas<br>into Visual Experiences<br>with AI",
      about_exp1: "⚡ 1 Year in AI Video & Image Gen",
      about_exp2: "🎨 6 Months in AI Web Design",
      about_role: "AI Creative Specialist & AI Web Designer",
      about_desc: "I am an <strong>AI Creative Specialist</strong> and <strong>AI Web Designer</strong> with 1 year of experience in AI video and image generation, and 6 months in AI-powered web design.",
      about_subdesc: "Combining artificial intelligence with modern design, I create premium visual content, <em>cinematic video</em>, and state-of-the-art web experiences.",
      mentors_label: "Mentors Who Shared Knowledge",
      projects_title: "My Projects",
      tab_images: "Images",
      tab_videos: "Videos",
      contact_tag: "Contact",
      contact_title: "Get in Touch",
      contact_subtitle: "If you have questions or collaboration opportunities, choose your preferred channel:",
      contact_phone_type: "Phone Number",
      contact_telegram_type: "Telegram",
      contact_email_type: "Gmail Email"
    }
  };

  function setupLanguageSwitcher() {
    const langBtns = document.querySelectorAll('.lang-btn');
    let currentLang = localStorage.getItem('preferred_lang') || 'uz';

    function setLanguage(lang) {
      if (!TRANSLATIONS[lang]) return;
      currentLang = lang;
      localStorage.setItem('preferred_lang', lang);

      langBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
      });

      const dict = TRANSLATIONS[lang];
      document.querySelectorAll('[data-i18n]').forEach(elem => {
        const key = elem.getAttribute('data-i18n');
        if (dict[key]) {
          elem.innerHTML = dict[key];
        }
      });
    }

    langBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        setLanguage(lang);
      });
    });

    setLanguage(currentLang);
  }

  function setupProjectTabs() {
    const tabBtns = document.querySelectorAll('.project-tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const targetContent = document.getElementById(`tab-${targetTab}`);
        if (targetContent) {
          targetContent.classList.add('active');
          window.dispatchEvent(new Event('resize'));
        }
      });
    });
  }

  function setupMediaLightboxModal() {
    const modal = document.getElementById('lightbox-modal');
    const modalImg = document.getElementById('lightbox-img');
    const modalVideo = document.getElementById('lightbox-video');
    const backdrop = document.getElementById('lightbox-backdrop');
    const card = document.getElementById('lightbox-card');

    if (!modal) return;

    window.openMediaLightbox = function(type, src, title) {
      if (type === 'video') {
        if (modalImg) {
          modalImg.classList.remove('active');
          modalImg.src = '';
        }
        if (modalVideo) {
          modalVideo.classList.add('active');
          if (modalVideo.src !== src && !modalVideo.src.endsWith(src)) {
            modalVideo.src = src;
            modalVideo.load();
          }
          modalVideo.currentTime = 0;
          modalVideo.play().catch(() => {});
        }
      } else {
        if (modalVideo) {
          modalVideo.classList.remove('active');
          modalVideo.pause();
          modalVideo.src = '';
        }
        if (modalImg) {
          modalImg.classList.add('active');
          modalImg.src = src;
        }
      }

      modal.classList.add('open');
    };

    function closeModal() {
      modal.classList.remove('open');
      if (modalVideo) {
        modalVideo.pause();
        modalVideo.src = '';
      }
    }

    if (backdrop) backdrop.addEventListener('click', closeModal);
    if (card) card.addEventListener('click', closeModal);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target === backdrop || e.target === card || e.target === modalImg) {
          closeModal();
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
      }
    });
  }

  function initFanCarousel(wrapperId, prevBtnId, nextBtnId, dotsId) {
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;
    const cards = wrapper.querySelectorAll('.fan-card-item');
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);
    const dotsContainer = document.getElementById(dotsId);

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
      const isTinyMobile = window.innerWidth < 380;
      const isMobileSmall = window.innerWidth < 480;
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth < 1024;
      const xMult = isTinyMobile ? 0.28 : (isMobileSmall ? 0.38 : (isMobile ? 0.55 : (isTablet ? 0.8 : 1.0)));

      cards.forEach((card, index) => {
        const vid = card.querySelector('video');
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

          if (vid) {
            if (index === centerIndex) {
              vid.play().catch(() => {});
            } else {
              vid.pause();
            }
          }
        } else {
          card.style.opacity = '0';
          card.style.transform = `translate3d(${dragOffset}px, 100px, 0) scale(0.5)`;
          card.style.zIndex = '0';
          if (vid) vid.pause();
        }
      });

      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.fan-dot');
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === centerIndex);
        });
      }
    }

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
      if (Math.abs(deltaX) > 6) hasDragged = true;

      // Real-time card switching as cursor moves left/right!
      const stepDistance = 45; // distance moved to trigger card change
      if (deltaX < -stepDistance) {
        centerIndex = (centerIndex + 1) % total;
        startX = currentX;
        updateFanLayout(0);
      } else if (deltaX > stepDistance) {
        centerIndex = (centerIndex - 1 + total) % total;
        startX = currentX;
        updateFanLayout(0);
      } else {
        updateFanLayout(deltaX * 0.6);
      }
    }

    function onDragEnd(e) {
      if (!isDragging) return;
      isDragging = false;
      startX = 0;
      currentX = 0;
      updateFanLayout(0);
    }

    wrapper.addEventListener('mousedown', onDragStart);
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);

    wrapper.addEventListener('touchstart', onDragStart, { passive: true });
    window.addEventListener('touchmove', onDragMove, { passive: true });
    window.addEventListener('touchend', onDragEnd);

    // Mouse wheel scroll listener
    let wheelTimeout;
    wrapper.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) > 10 || Math.abs(e.deltaY) > 10) {
        if (!wheelTimeout) {
          wheelTimeout = setTimeout(() => { wheelTimeout = null; }, 150);
          if (e.deltaX > 0 || e.deltaY > 0) {
            centerIndex = (centerIndex + 1) % total;
          } else {
            centerIndex = (centerIndex - 1 + total) % total;
          }
          updateFanLayout(0);
        }
      }
    }, { passive: true });

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
      card.addEventListener('click', () => {
        if (hasDragged) return;
        const type = card.getAttribute('data-type') || 'image';
        const src = card.getAttribute('data-src');
        const title = card.getAttribute('data-title');

        centerIndex = index;
        updateFanLayout(0);

        if (window.openMediaLightbox && src) {
          window.openMediaLightbox(type, src, title);
        }
      });
    });

    updateFanLayout(0);
    window.addEventListener('resize', () => updateFanLayout(0));
  }

  function setupMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const drawer = document.getElementById('mobile-nav-drawer');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (!menuBtn || !drawer) return;

    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      drawer.classList.toggle('open');
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        mobileLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });

    document.addEventListener('click', (e) => {
      if (!drawer.contains(e.target) && !menuBtn.contains(e.target)) {
        drawer.classList.remove('open');
      }
    });
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

    // Setup Nav Smooth Scroll, Mobile Menu, 3D Hover, Contact Modal, Tabs, Lightbox & Fan Carousels
    setupNavClickScroll();
    setupMobileMenu();
    setup3DHoverEffects();
    setupContactModal();
    setupProjectTabs();
    setupMediaLightboxModal();
    setupLanguageSwitcher();
    initFanCarousel('fan-wrapper-images', 'fan-prev-images', 'fan-next-images', 'fan-dots-images');
    initFanCarousel('fan-wrapper-videos', 'fan-prev-videos', 'fan-next-videos', 'fan-dots-videos');

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
