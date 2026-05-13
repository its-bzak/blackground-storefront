(() => {
  const initializedResultSections = new WeakSet();

  const archetypeContent = {
    Renaissance: {
      title: 'Renaissance',
      description: 'You move with range, curiosity, and creative flexibility.',
      signal: 'Range without fragmentation',
      perspective: 'You do not need one lane to be legible. Your power comes from synthesis, taste, and the ability to move between ideas without losing yourself.',
    },
    'System Breaker': {
      title: 'System Breaker',
      description: 'You question inherited rules and build new paths.',
      signal: 'New paths over inherited scripts',
      perspective: 'You can feel where structures stop serving you. Your instinct is not just to critique the frame, but to design a better one and move first.',
    },
    'Legacy Builder': {
      title: 'Legacy Builder',
      description: 'You are focused on building something that lasts beyond the present moment.',
      signal: 'Durability over spectacle',
      perspective: 'You are motivated by what stays. Even your ambition has roots: ownership, responsibility, and the desire to leave something stronger than you found it.',
    },
    'Culture Carrier': {
      title: 'Culture Carrier',
      description: 'You carry memory, place, and tradition into everything you do.',
      signal: 'Memory as a living resource',
      perspective: 'You treat history as active material. What you keep, repeat, and pass forward is part of the work, not separate from it.',
    },
    'Quiet Storm': {
      title: 'Quiet Storm',
      description: 'Your presence is measured, intentional, and deeply felt.',
      signal: 'Restraint with impact',
      perspective: 'You are not interested in noise for its own sake. Your influence lands through precision, control, and knowing when presence says more than explanation.',
    },
    'Self-Made': {
      title: 'Self-Made',
      description: 'You know what it means to build from what you had.',
      signal: 'Resourcefulness under pressure',
      perspective: 'You trust what you can create with your own hands, mind, and discipline. Independence is not branding for you; it is lived practice.',
    },
    'First-Gen': {
      title: 'First-Gen',
      description: 'You are navigating rooms and responsibilities that did not come with a manual.',
      signal: 'Navigation without a map',
      perspective: 'You are translating across expectations, institutions, and family stakes in real time. Your growth carries both personal ambition and collective weight.',
    },
    'Dual Citizen': {
      title: 'Dual Citizen',
      description: 'You live between places, contexts, and versions of home.',
      signal: 'Belonging in more than one place',
      perspective: 'You understand how identity shifts across geography, class, and context. Your sensitivity to contrast becomes part of your instinct and taste.',
    },
  };

  const resourceLensContent = {
    'family-first': {
      title: 'Family-First',
      description: 'Your decisions are filtered through care, reciprocity, and what your people need next.',
      emphasis: 'Security means shared stability, not just individual relief.',
    },
    'debt-first': {
      title: 'Debt-First',
      description: 'Relief and stability matter. You want freedom that changes the weight you carry every day.',
      emphasis: 'You define wealth as reduced pressure and more room to breathe.',
    },
    'invest-first': {
      title: 'Invest-First',
      description: 'You think in systems, leverage, and what compounds over time.',
      emphasis: 'You are oriented toward future ownership, not just immediate reward.',
    },
    'experience-first': {
      title: 'Experience-First',
      description: 'You value memory, movement, and the feeling of being fully present in your own life.',
      emphasis: 'You want money to become motion, perspective, and lived memory.',
    },
  };

  const aestheticLensContent = {
    'monochrome-minimal': {
      title: 'Monochrome Minimal',
      description: 'You are drawn to restraint, precision, and a silhouette that speaks without noise.',
      emphasis: 'Clean lines, discipline, and intentional calm.',
    },
    'warmth-heritage': {
      title: 'Warmth Heritage',
      description: 'You want texture, memory, and spaces that feel lived-in and inherited.',
      emphasis: 'Atmosphere, softness, and the feeling of story in the room.',
    },
    'solo-elevated': {
      title: 'Solo Elevated',
      description: 'You move toward polish, height, and a mood that feels deliberate and self-possessed.',
      emphasis: 'Clarity, altitude, and a composed sense of arrival.',
    },
    'maker-disheveled': {
      title: 'Maker Disheveled',
      description: 'You are most yourself in process, around materials, worktables, and unfinished ideas becoming real.',
      emphasis: 'Texture, process, and creative evidence left in plain view.',
    },
  };

  const formatHandle = (value) =>
    String(value || '')
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const getStorage = () => {
    try {
      return window.sessionStorage;
    } catch (error) {
      return null;
    }
  };

  const readStoredData = () => {
    if (!window.BlackgroundQuiz) {
      return { payload: null, result: null };
    }

    const storage = getStorage();

    if (!storage) {
      return { payload: null, result: null };
    }

    return {
      payload: window.BlackgroundQuiz.safeParse(storage.getItem(window.BlackgroundQuiz.STORAGE_KEYS.payload)),
      result: window.BlackgroundQuiz.safeParse(storage.getItem(window.BlackgroundQuiz.STORAGE_KEYS.result)),
    };
  };

  const buildScoreRows = (scores) => {
    const maxScore = Math.max(...Object.values(scores), 1);

    return Object.entries(scores)
      .sort((left, right) => right[1] - left[1])
      .map(
        ([label, value]) => `
          <div class="bg-result__score-row">
            <span class="bg-result__score-label bg-mono">${escapeHtml(label)}</span>
            <div class="bg-result__score-bar" aria-hidden="true">
              <span class="bg-result__score-bar-fill" style="width: ${(value / maxScore) * 100}%;"></span>
            </div>
            <span class="bg-result__score-value">${escapeHtml(value)}</span>
          </div>
        `
      )
      .join('');
  };

  const renderEmptyState = (section) => `
    <div class="bg-result">
      <div class="bg-result__empty">
        <h2 class="bg-result__empty-title bg-serif">No result saved yet</h2>
        <p class="bg-result__empty-text">Take The Blackground Check first. This first phase stores your result in the browser only, so results only appear here after completing the quiz on this device.</p>
        <div class="bg-result__actions">
          <a class="bg-result__action bg-result__action--primary" href="${escapeHtml(section.dataset.quizUrl || '/pages/blackground-quiz')}">Go To The Quiz</a>
        </div>
      </div>
    </div>
  `;

  const renderResult = (section, payload, result) => {
    const primaryContent = archetypeContent[result.primaryArchetype] || {
      title: result.primaryArchetype,
      description: 'Your result can be expanded with richer brand copy in a later content pass.',
    };
    const secondaryContent = archetypeContent[result.secondaryArchetype] || {
      title: result.secondaryArchetype,
      description: 'This secondary archetype adds nuance to how your Blackground shows up.',
    };
    const resourceContent = resourceLensContent[result.resourceLens] || {
      title: result.resourceLens,
      description: 'This resource lens placeholder can be replaced with final editorial copy.',
    };
    const aestheticContent = aestheticLensContent[result.aestheticLens] || {
      title: result.aestheticLens,
      description: 'This aesthetic lens placeholder can be replaced with final editorial copy.',
    };
    const blendLine = `${primaryContent.title} led, ${secondaryContent.title} shaped.`;
    const scoreLeaderSummary = Object.entries(result.scores)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 3)
      .map(([label]) => label)
      .join(' / ');

    return `
      <div class="bg-result">
        <div class="bg-result__hero">
          <div>
            <p class="bg-result__eyebrow bg-mono">Primary archetype</p>
            <h2 class="bg-result__title bg-serif">${escapeHtml(primaryContent.title)}</h2>
            <p class="bg-result__description">${escapeHtml(primaryContent.description)}</p>
            <div class="bg-result__chips" aria-label="Result summary">
              <span class="bg-result__chip">${escapeHtml(primaryContent.signal || blendLine)}</span>
              <span class="bg-result__chip">${escapeHtml(resourceContent.title)}</span>
              <span class="bg-result__chip">${escapeHtml(aestheticContent.title)}</span>
            </div>
          </div>
          <div class="bg-result__meta">
            <div class="bg-result__meta-card">
              <p class="bg-result__label bg-mono">Secondary archetype</p>
              <p class="bg-result__value">${escapeHtml(secondaryContent.title)}</p>
            </div>
            <div class="bg-result__meta-card">
              <p class="bg-result__label bg-mono">Resource lens</p>
              <p class="bg-result__value">${escapeHtml(resourceContent.title)}</p>
            </div>
            <div class="bg-result__meta-card">
              <p class="bg-result__label bg-mono">Aesthetic lens</p>
              <p class="bg-result__value">${escapeHtml(aestheticContent.title)}</p>
            </div>
          </div>
        </div>

        <div class="bg-result__section bg-result__section--quote">
          <p class="bg-result__manifest-label bg-mono">Read on first glance</p>
          <p class="bg-result__manifest bg-serif">${escapeHtml(blendLine)} You move through the world with ${escapeHtml(resourceContent.title.toLowerCase())} instincts and a ${escapeHtml(aestheticContent.title.toLowerCase())} visual center.</p>
        </div>

        <div class="bg-result__section">
          <div class="bg-result__section-grid">
            <article class="bg-result__content-card">
              <p class="bg-result__label bg-mono">Primary read</p>
              <h3 class="bg-result__content-title">${escapeHtml(primaryContent.signal || primaryContent.title)}</h3>
              <p class="bg-result__content-text">${escapeHtml(primaryContent.perspective || primaryContent.description)}</p>
            </article>
            <article class="bg-result__content-card">
              <p class="bg-result__label bg-mono">Secondary modifier</p>
              <h3 class="bg-result__content-title">${escapeHtml(secondaryContent.title)}</h3>
              <p class="bg-result__content-text">${escapeHtml(secondaryContent.perspective || secondaryContent.description)}</p>
            </article>
            <article class="bg-result__content-card">
              <p class="bg-result__label bg-mono">Resource lens</p>
              <h3 class="bg-result__content-title">${escapeHtml(resourceContent.title)}</h3>
              <p class="bg-result__content-text">${escapeHtml(resourceContent.description)}</p>
              <p class="bg-result__content-subtext">${escapeHtml(resourceContent.emphasis || '')}</p>
            </article>
            <article class="bg-result__content-card">
              <p class="bg-result__label bg-mono">Aesthetic lens</p>
              <h3 class="bg-result__content-title">${escapeHtml(aestheticContent.title)}</h3>
              <p class="bg-result__content-text">${escapeHtml(aestheticContent.description)}</p>
              <p class="bg-result__content-subtext">${escapeHtml(aestheticContent.emphasis || '')}</p>
            </article>
          </div>
        </div>

        <div class="bg-result__section">
          <div class="bg-result__section-grid">
            <article class="bg-result__content-card bg-result__content-card--accent">
              <p class="bg-result__label bg-mono">Top score pattern</p>
              <h3 class="bg-result__content-title">${escapeHtml(scoreLeaderSummary)}</h3>
              <p class="bg-result__content-text">These were the strongest signals in your answer pattern. The score breakdown below shows the full spread, but this trio gives the cleanest quick read.</p>
            </article>
            <article class="bg-result__content-card bg-result__content-card--accent">
              <p class="bg-result__label bg-mono">Future backend note</p>
              <h3 class="bg-result__content-title">Ready for a server-side handoff later</h3>
              <p class="bg-result__content-text">This result is still browser-only in phase one. The structure is already aligned with a later payload submission and `custom.*` metafield save path.</p>
            </article>
          </div>
        </div>

        <div class="bg-result__section">
          <p class="bg-result__label bg-mono">Score breakdown</p>
          <div class="bg-result__scores">
            ${buildScoreRows(result.scores)}
          </div>
          <div class="bg-result__footer">
            <div>
              ${payload && payload.completedAt ? `<p class="bg-result__timestamp">Completed: ${escapeHtml(new Date(payload.completedAt).toLocaleString())}</p>` : ''}
              ${result.resultSlug ? `<p class="bg-result__slug">Result slug: ${escapeHtml(result.resultSlug)}</p>` : ''}
              ${(result.resourceLens || result.aestheticLens) ? `<p class="bg-result__slug">Lens pair: ${escapeHtml(formatHandle(result.resourceLens))} / ${escapeHtml(formatHandle(result.aestheticLens))}</p>` : ''}
            </div>
            <div class="bg-result__actions">
              <a class="bg-result__action" href="${escapeHtml(section.dataset.quizUrl || '/pages/blackground-quiz')}">Retake Quiz</a>
              <a class="bg-result__action bg-result__action--primary" href="/collections/all">Shop The Collection</a>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const initResultSection = (section) => {
    if (!section || initializedResultSections.has(section)) {
      return;
    }

    const mount = section.querySelector('[data-blackground-result-app]');

    if (!mount) {
      return;
    }

    const { payload, result } = readStoredData();
    const resolvedResult = payload && payload.result ? payload.result : result;

    mount.innerHTML = resolvedResult ? renderResult(section, payload, resolvedResult) : renderEmptyState(section);
    initializedResultSections.add(section);
  };

  const initResultSections = (root = document) => {
    root.querySelectorAll('[data-blackground-result]').forEach(initResultSection);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initResultSections(document), { once: true });
  } else {
    initResultSections(document);
  }

  document.addEventListener('shopify:section:load', (event) => {
    initResultSections(event.target);
  });
})();