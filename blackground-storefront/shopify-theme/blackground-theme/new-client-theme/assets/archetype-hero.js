(function () {
  function initArchetypeHero(sectionRoot) {
    const hero = sectionRoot
      ? sectionRoot.querySelector('.archetype-hero')
      : document.querySelector('.archetype-hero');

    if (!hero) return;
    if (hero.dataset.archetypeInitialized === 'true') return;

    hero.dataset.archetypeInitialized = 'true';

    document.documentElement.classList.add('archetype-hero-page');
    document.body.classList.add('archetype-hero-page');

    const cards = Array.from(hero.querySelectorAll('.card'));
    const dotsEl = hero.querySelector('#archetype-dots');

    if (!cards.length || !dotsEl) return;

    const total = cards.length;
    const tab = 18;

    const slides = [
      { bg: '#f0ece0', dark: true },
      { bg: '#c87145', dark: false },
      { bg: '#0a0a0a', dark: false },
      { bg: '#4a1015', dark: false },
      { bg: '#f8f5ef', dark: true },
      { bg: '#D4AF00', dark: true },
      { bg: '#8b1520', dark: false },
      { bg: '#1f6363', dark: false }
    ];

    let current = 0;
    let busy = false;
    let wheelAccumulator = 0;
    let wheelTimer = null;
    let touchStartY = 0;

    dotsEl.innerHTML = '';

    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'dot';
      dot.setAttribute('aria-label', `Go to archetype ${i + 1}`);
      dot.addEventListener('click', function () {
        goTo(i);
      });
      dotsEl.appendChild(dot);
    }

    const dotEls = Array.from(dotsEl.querySelectorAll('.dot'));

    function layout() {
      cards.forEach(function (card, index) {
        const k = index - current;

        let translateY;
        let zIndex;
        let opacity;

        if (k < 0) {
          translateY = '-110%';
          zIndex = 5;
          opacity = 0;
          card.classList.remove('is-active');
        } else if (k === 0) {
          translateY = '0px';
          zIndex = 50;
          opacity = 1;
          card.classList.add('is-active');
        } else {
          translateY = `calc(-${k * tab}px)`;
          zIndex = 50 - k;
          opacity = k <= 5 ? 1 : 0;
          card.classList.remove('is-active');
        }

        card.style.transform = `translateY(${translateY})`;
        card.style.zIndex = String(zIndex);
        card.style.opacity = String(opacity);
      });

      const slide = slides[current] || slides[0];

      hero.style.transition = 'background 0.7s ease';
      hero.style.background = slide.bg;

      dotEls.forEach(function (dot, index) {
        const isActive = index === current;

        dot.classList.toggle('on', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');

        if (isActive) {
          dot.style.background = slide.dark
            ? 'rgba(20, 14, 0, 0.7)'
            : 'var(--gold)';
        } else {
          dot.style.background = slide.dark
            ? 'rgba(20, 14, 0, 0.25)'
            : 'rgba(242, 240, 235, 0.25)';
        }
      });
    }

    function goTo(index) {
      if (busy) return;
      if (index === current) return;
      if (index < 0 || index >= total) return;

      busy = true;
      current = index;
      layout();

      window.setTimeout(function () {
        busy = false;
      }, 720);
    }

    function next() {
      goTo(current + 1);
    }

    function prev() {
      goTo(current - 1);
    }

    function onWheel(event) {
      event.preventDefault();

      if (busy) return;

      wheelAccumulator += event.deltaY;

      window.clearTimeout(wheelTimer);

      wheelTimer = window.setTimeout(function () {
        wheelAccumulator = 0;
      }, 180);

      if (Math.abs(wheelAccumulator) > 40) {
        if (wheelAccumulator > 0) {
          next();
        } else {
          prev();
        }

        wheelAccumulator = 0;
      }
    }

    function onKeydown(event) {
      const activeElement = document.activeElement;
      const isTyping =
        activeElement &&
        (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'SELECT' ||
          activeElement.isContentEditable
        );

      if (isTyping) return;

      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        next();
      }

      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        prev();
      }
    }

    function onTouchStart(event) {
      if (!event.touches || !event.touches.length) return;
      touchStartY = event.touches[0].clientY;
    }

    function onTouchEnd(event) {
      if (!event.changedTouches || !event.changedTouches.length) return;

      const deltaY = touchStartY - event.changedTouches[0].clientY;

      if (Math.abs(deltaY) > 40) {
        if (deltaY > 0) {
          next();
        } else {
          prev();
        }
      }
    }

    hero.addEventListener('wheel', onWheel, { passive: false });
    hero.addEventListener('touchstart', onTouchStart, { passive: true });
    hero.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeydown);

    layout();
  }

  function initAllArchetypeHeroes() {
    document.querySelectorAll('.shopify-section').forEach(function (section) {
      if (section.querySelector('.archetype-hero')) {
        initArchetypeHero(section);
      }
    });

    if (document.querySelector('.archetype-hero')) {
      initArchetypeHero(document);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllArchetypeHeroes);
  } else {
    initAllArchetypeHeroes();
  }

  document.addEventListener('shopify:section:load', function (event) {
    initArchetypeHero(event.target);
  });
})();
