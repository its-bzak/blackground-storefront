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

    let current = 0;
    let busy = false;
    let wheelAccumulator = 0;
    let wheelTimer = null;
    let touchStartY = 0;

    /*
      Keep the page/hero background black for every card.
      This replaces the old slide-based background color behavior.
    */
    hero.style.background = '#080808';
    document.body.style.background = '#080808';

    /*
      Keep nav button color the same for every card.
      Change this value if you want the nav to be white instead.
    */
    const fixedNavColor = 'var(--gold)';

    const topNav = hero.querySelector('#archetype-top-nav');
    const bottomNav = hero.querySelector('#archetype-bottom-nav');

    if (topNav) topNav.style.color = fixedNavColor;
    if (bottomNav) bottomNav.style.color = fixedNavColor;

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

      /*
        Keep dots the same color for every card too.
      */
      dotEls.forEach(function (dot, index) {
        const isActive = index === current;

        dot.classList.toggle('on', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');

        dot.style.background = isActive
          ? 'var(--gold)'
          : 'rgba(242, 240, 235, 0.25)';
      });

      /*
        Re-apply fixed colors in case Shopify theme scripts/styles interfere.
      */
      hero.style.background = '#080808';
      if (topNav) topNav.style.color = fixedNavColor;
      if (bottomNav) bottomNav.style.color = fixedNavColor;
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

    /*
      Dropdown behavior for:
      - Collections
      - Log In
      - About
      - Join Us
    */
    const dropdownToggles = Array.from(hero.querySelectorAll('[data-dropdown-toggle]'));
    const dropdowns = Array.from(hero.querySelectorAll('.dd-wrap'));

    dropdownToggles.forEach(function (toggle) {
      toggle.addEventListener('click', function (event) {
        event.stopPropagation();

        const id = toggle.getAttribute('data-dropdown-toggle');
        const dropdown = hero.querySelector(`#${id}`);

        if (!dropdown) return;

        const wasOpen = dropdown.classList.contains('open');

        dropdowns.forEach(function (item) {
          item.classList.remove('open');
        });

        if (!wasOpen) {
          dropdown.classList.add('open');
        }
      });
    });

    document.addEventListener('click', function (event) {
      if (!event.target.closest('.dd-wrap')) {
        dropdowns.forEach(function (item) {
          item.classList.remove('open');
        });
      }
    });

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