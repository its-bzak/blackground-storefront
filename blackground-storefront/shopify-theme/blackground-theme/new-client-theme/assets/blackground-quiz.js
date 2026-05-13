(() => {
  if (window.BlackgroundQuiz && window.BlackgroundQuiz.__initialized) {
    window.BlackgroundQuiz.initQuizSections(document);
    return;
  }

  const QUIZ_VERSION = 'blackground-check-v1';
  const STORAGE_KEYS = {
    answers: 'blackground_quiz_answers',
    result: 'blackground_quiz_result',
    payload: 'blackground_quiz_payload',
  };

  const ARCHETYPES = [
    'Renaissance',
    'System Breaker',
    'Legacy Builder',
    'Culture Carrier',
    'Quiet Storm',
    'Self-Made',
    'First-Gen',
    'Dual Citizen',
  ];

  const QUESTIONS = [
    {
      id: 'Q1',
      prompt: 'What does a successful Sunday look like?',
      options: [
        { id: 'A', title: 'Long brunch with four people I actually like' },
        { id: 'B', title: 'Cooking something that took all afternoon, for the people I love' },
        { id: 'C', title: 'Nothing on the calendar. Nothing.' },
        { id: 'D', title: 'Three things back-to-back and I\'m thriving' },
      ],
    },
    {
      id: 'Q2',
      prompt: 'A check for $50K hits tomorrow. What\'s the first thing you do with it?',
      options: [
        { id: 'A', title: 'Send some to my mama. Or whoever raised me.' },
        { id: 'B', title: 'Pay off the card. Then breathe.' },
        { id: 'C', title: 'Most of it goes in investments. I\'ll find something nice later.' },
        { id: 'D', title: 'Book the trip I\'ve been talking about for two years.' },
      ],
    },
    {
      id: 'Q3',
      prompt: 'When people describe you to someone who hasn\'t met you, what do they say?',
      options: [
        { id: 'A', title: 'They\'re solid. Always thinking long-term. Someone you can rely on.' },
        { id: 'B', title: 'They came up. And they\'re not done.' },
        { id: 'C', title: 'They\'re different. Creative. Hard to put in a box.' },
        { id: 'D', title: 'They\'re quiet - but when they speak or show up, you feel it.' },
      ],
    },
    {
      id: 'Q4',
      prompt: 'Which of these feels most like you right now?',
      helper: 'Choose the visual direction that feels closest to your current mood and presence.',
      visual: true,
      options: [
        {
          id: 'A',
          title: 'Monochrome Minimal',
          description: 'Black subject in fitted all-black, hands in pockets, neutral backdrop, intentional stillness',
          alt: 'Black subject in fitted all-black, hands in pockets, neutral backdrop, intentional stillness',
        },
        {
          id: 'B',
          title: 'Warmth Heritage',
          description: 'Black subject in warm scene, multi-generational gathering, food visible, natural light',
          alt: 'Black subject in warm scene, multi-generational gathering, food visible, natural light',
        },
        {
          id: 'C',
          title: 'Solo Elevated',
          description: 'Black subject solo at rooftop or elevated space, golden hour, glass or cigar in hand',
          alt: 'Black subject solo at rooftop or elevated space, golden hour, glass or cigar in hand',
        },
        {
          id: 'D',
          title: 'Maker Disheveled',
          description: 'Black subject candid in creative workspace, mid-project, materials around',
          alt: 'Black subject candid in creative workspace, mid-project, materials around',
        },
      ],
    },
    {
      id: 'Q5',
      prompt: 'Which question makes you sit with it the longest?',
      options: [
        { id: 'A', title: 'Am I building something that will outlive me?' },
        { id: 'B', title: 'Did I really do enough with what I had?' },
        { id: 'C', title: 'Am I fully being myself - or the version people expect?' },
        { id: 'D', title: 'Do people truly understand me - or just the parts I let them see?' },
      ],
    },
    {
      id: 'Q6',
      prompt: 'What compliment would actually mean something to you?',
      options: [
        { id: 'A', title: 'You\'re building something real. And it\'s going to last.' },
        { id: 'B', title: 'I respect how you figured it out on your own.' },
        { id: 'C', title: 'You don\'t move like anyone else - I can\'t put you in a box.' },
        { id: 'D', title: 'You don\'t say much - but your presence speaks for you.' },
      ],
    },
    {
      id: 'Q7',
      prompt: 'Where\'s home to you?',
      options: [
        { id: 'A', title: 'The place that raised me. I carry it with me.' },
        { id: 'B', title: 'Wherever my family is. That\'s always been the real answer.' },
        { id: 'C', title: 'A city I chose for myself. Not the one I was given.' },
        { id: 'D', title: 'Two places. And I\'m still negotiating which one wins.' },
      ],
    },
    {
      id: 'Q8',
      prompt: 'Finish this: My Blackground is the reason I -',
      options: [
        { id: 'A', title: 'know exactly who I am.' },
        { id: 'B', title: 'don\'t stop building.' },
        { id: 'C', title: 'don\'t need the applause.' },
        { id: 'D', title: 'can walk into any room.' },
      ],
    },
  ];

  const BLACKGROUND_SCORING_MAP = {
    Q1: {
      A: ['Renaissance', 'System Breaker'],
      B: ['Legacy Builder', 'Culture Carrier'],
      C: ['Quiet Storm', 'Self-Made'],
      D: ['Renaissance', 'First-Gen'],
    },
    Q2: {
      A: { archetypes: ['First-Gen', 'Legacy Builder'], lens_tag: 'family-first' },
      B: { archetypes: ['Self-Made', 'First-Gen'], lens_tag: 'debt-first' },
      C: { archetypes: ['Self-Made', 'System Breaker'], lens_tag: 'invest-first' },
      D: { archetypes: ['Dual Citizen', 'Renaissance'], lens_tag: 'experience-first' },
    },
    Q3: {
      A: ['Legacy Builder', 'Culture Carrier'],
      B: ['First-Gen', 'Self-Made'],
      C: ['Renaissance', 'System Breaker'],
      D: ['Quiet Storm', 'Dual Citizen'],
    },
    Q4: {
      A: { archetypes: ['Quiet Storm', 'Self-Made'], lens_tag: 'monochrome-minimal' },
      B: { archetypes: ['Legacy Builder', 'Culture Carrier'], lens_tag: 'warmth-heritage' },
      C: { archetypes: ['System Breaker', 'Renaissance'], lens_tag: 'solo-elevated' },
      D: { archetypes: ['Renaissance', 'First-Gen'], lens_tag: 'maker-disheveled' },
    },
    Q5: {
      A: ['Legacy Builder', 'Culture Carrier'],
      B: ['First-Gen', 'Self-Made'],
      C: ['Renaissance', 'System Breaker'],
      D: ['Quiet Storm', 'Dual Citizen'],
    },
    Q6: {
      A: ['Legacy Builder', 'Culture Carrier'],
      B: ['First-Gen', 'Self-Made'],
      C: ['Renaissance', 'System Breaker'],
      D: ['Quiet Storm', 'Dual Citizen'],
    },
    Q7: {
      A: ['Culture Carrier', 'Legacy Builder'],
      B: ['First-Gen', 'Legacy Builder'],
      C: ['System Breaker', 'Self-Made'],
      D: ['Dual Citizen', 'System Breaker'],
    },
    Q8: {
      A: ['Legacy Builder', 'Culture Carrier'],
      B: ['Self-Made', 'System Breaker'],
      C: ['Quiet Storm', 'First-Gen'],
      D: ['Renaissance', 'Dual Citizen'],
    },
  };

  const TIEBREAKER_QUESTION_IDS = ['Q8', 'Q7', 'Q5'];
  const QUESTION_ORDER = QUESTIONS.map((question) => question.id);
  const initializedQuizSections = new WeakSet();

  const getStorage = () => {
    try {
      return window.sessionStorage;
    } catch (error) {
      return null;
    }
  };

  const safeParse = (value) => {
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  };

  const readStoredAnswers = () => {
    const storage = getStorage();

    if (!storage) {
      return {};
    }

    const value = safeParse(storage.getItem(STORAGE_KEYS.answers));

    if (!value || typeof value !== 'object') {
      return {};
    }

    return QUESTION_ORDER.reduce((answers, questionId) => {
      const answer = value[questionId];

      if (typeof answer === 'string' && ['A', 'B', 'C', 'D'].includes(answer)) {
        answers[questionId] = answer;
      }

      return answers;
    }, {});
  };

  const writeStorageValue = (key, value) => {
    const storage = getStorage();

    if (!storage) {
      return;
    }

    storage.setItem(key, JSON.stringify(value));
  };

  const slugify = (value) =>
    String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const getScoringEntry = (questionId, answerId) => {
    const questionScores = BLACKGROUND_SCORING_MAP[questionId];

    if (!questionScores) {
      return null;
    }

    return questionScores[answerId] || null;
  };

  const extractArchetypes = (entry) => {
    if (!entry) {
      return [];
    }

    return Array.isArray(entry) ? entry : entry.archetypes || [];
  };

  const calculateBlackgroundResult = (answers) => {
    const scores = ARCHETYPES.reduce((result, archetype) => {
      result[archetype] = 0;
      return result;
    }, {});

    const questionHits = ARCHETYPES.reduce((result, archetype) => {
      result[archetype] = {};
      return result;
    }, {});

    const earliestHit = ARCHETYPES.reduce((result, archetype) => {
      result[archetype] = Number.POSITIVE_INFINITY;
      return result;
    }, {});

    let resourceLens = null;
    let aestheticLens = null;

    QUESTION_ORDER.forEach((questionId, index) => {
      const answerId = answers[questionId];
      const entry = getScoringEntry(questionId, answerId);
      const archetypes = extractArchetypes(entry);
      const weight = questionId === 'Q8' ? 2 : 1;

      if (questionId === 'Q2' && entry && !Array.isArray(entry)) {
        resourceLens = entry.lens_tag;
      }

      if (questionId === 'Q4' && entry && !Array.isArray(entry)) {
        aestheticLens = entry.lens_tag;
      }

      archetypes.forEach((archetype) => {
        scores[archetype] += weight;
        questionHits[archetype][questionId] = weight;

        if (earliestHit[archetype] === Number.POSITIVE_INFINITY) {
          earliestHit[archetype] = index;
        }
      });
    });

    const scoreValues = Object.values(scores);
    const allScoresEqual = scoreValues.every((score) => score === scoreValues[0]);

    if (allScoresEqual) {
      return {
        primaryArchetype: 'Self-Made',
        secondaryArchetype: 'First-Gen',
        resourceLens,
        aestheticLens,
        scores,
        resultSlug: [
          slugify('Self-Made'),
          slugify('First-Gen'),
          slugify(resourceLens),
          slugify(aestheticLens),
        ].join('-'),
      };
    }

    const rankedArchetypes = [...ARCHETYPES].sort((left, right) => {
      if (scores[right] !== scores[left]) {
        return scores[right] - scores[left];
      }

      for (const questionId of TIEBREAKER_QUESTION_IDS) {
        const rightHit = questionHits[right][questionId] || 0;
        const leftHit = questionHits[left][questionId] || 0;

        if (rightHit !== leftHit) {
          return rightHit - leftHit;
        }
      }

      if (earliestHit[left] !== earliestHit[right]) {
        return earliestHit[left] - earliestHit[right];
      }

      return ARCHETYPES.indexOf(left) - ARCHETYPES.indexOf(right);
    });

    const primaryArchetype = rankedArchetypes[0];
    const secondaryArchetype = rankedArchetypes.find((archetype) => archetype !== primaryArchetype) || 'First-Gen';

    return {
      primaryArchetype,
      secondaryArchetype,
      resourceLens,
      aestheticLens,
      scores,
      resultSlug: [
        slugify(primaryArchetype),
        slugify(secondaryArchetype),
        slugify(resourceLens),
        slugify(aestheticLens),
      ].join('-'),
    };
  };

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const getFirstIncompleteIndex = (answers) => {
    const incompleteIndex = QUESTIONS.findIndex((question) => !answers[question.id]);
    return incompleteIndex === -1 ? QUESTIONS.length - 1 : incompleteIndex;
  };

  const isQuizComplete = (answers) => QUESTIONS.every((question) => ['A', 'B', 'C', 'D'].includes(answers[question.id]));

  const getAnsweredCount = (answers) => QUESTION_ORDER.filter((questionId) => ['A', 'B', 'C', 'D'].includes(answers[questionId])).length;

  const parseConfig = (section) => {
    const node = section.querySelector('[data-blackground-quiz-config]');

    if (!node) {
      return { q4Images: {} };
    }

    return safeParse(node.textContent) || { q4Images: {} };
  };

  const buildOptionVisual = (question, option, config) => {
    if (!question.visual) {
      return '';
    }

    const imageUrl = config.q4Images && config.q4Images[option.id];

    if (imageUrl) {
      return `
        <div class="bg-quiz__option-visual">
          <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(option.alt)}" loading="lazy">
        </div>
      `;
    }

    return `
      <div class="bg-quiz__option-visual" role="img" aria-label="${escapeHtml(option.alt)}">
        <div class="bg-quiz__option-placeholder">
          <span class="bg-quiz__option-placeholder-text">${escapeHtml(option.title)}</span>
        </div>
      </div>
    `;
  };

  const renderQuestion = (state, config) => {
    const question = QUESTIONS[state.currentIndex];
    const selectedAnswer = state.answers[question.id] || '';
    const isLastQuestion = state.currentIndex === QUESTIONS.length - 1;
    const progress = Math.round(((state.currentIndex + 1) / QUESTIONS.length) * 100);
    const answeredCount = getAnsweredCount(state.answers);
    const stepsMarkup = QUESTIONS.map((quizQuestion, index) => {
      const status = index === state.currentIndex ? ' is-current' : state.answers[quizQuestion.id] ? ' is-complete' : '';
      return `<span class="bg-quiz__step${status}" aria-hidden="true"></span>`;
    }).join('');

    const optionsMarkup = question.options
      .map((option) => {
        const isSelected = option.id === selectedAnswer;

        return `
          <div class="bg-quiz__choice${isSelected ? ' is-selected' : ''}">
            <input
              class="bg-quiz__choice-input"
              id="${question.id}-${option.id}"
              type="radio"
              name="${question.id}"
              value="${option.id}"
              data-quiz-choice
              ${isSelected ? 'checked' : ''}
            >
            <label class="bg-quiz__choice-label" for="${question.id}-${option.id}">
              <div class="bg-quiz__choice-header">
                <span class="bg-quiz__option-key bg-mono">${option.id}</span>
                <span class="bg-quiz__option-state bg-mono">Selected</span>
              </div>
              ${buildOptionVisual(question, option, config)}
              <div>
                <p class="bg-quiz__option-title">${escapeHtml(option.title)}</p>
                ${option.description ? `<p class="bg-quiz__option-description">${escapeHtml(option.description)}</p>` : ''}
              </div>
            </label>
          </div>
        `;
      })
      .join('');

    return `
      <div class="bg-quiz">
        <div class="bg-quiz__panel">
          <div class="bg-quiz__meta">
            <div class="bg-quiz__topline">
              <p class="bg-quiz__progress bg-mono">Question ${state.currentIndex + 1} of ${QUESTIONS.length}</p>
              <p class="bg-quiz__save-note bg-mono">${answeredCount} saved on this device</p>
            </div>
            <div class="bg-quiz__meta-row">
              <div class="bg-quiz__indicator" aria-hidden="true">
                <span class="bg-quiz__indicator-bar" style="width: ${progress}%;"></span>
              </div>
              <div class="bg-quiz__stepper" aria-hidden="true">
                ${stepsMarkup}
              </div>
            </div>
          </div>
          <div class="bg-quiz__body">
            <h2 class="bg-quiz__question bg-serif">${escapeHtml(question.prompt)}</h2>
            ${question.helper ? `<p class="bg-quiz__prompt">${escapeHtml(question.helper)}</p>` : ''}
            <fieldset class="bg-quiz__options">
              <legend class="bg-quiz__sr-only">${escapeHtml(question.prompt)}</legend>
              <div class="bg-quiz__options-grid">
                ${optionsMarkup}
              </div>
            </fieldset>
            <div class="bg-quiz__actions">
              <p class="bg-quiz__status bg-mono" role="status">${escapeHtml(state.message || '')}</p>
              <div class="bg-quiz__action-group">
                <button class="bg-quiz__action" type="button" data-quiz-back ${state.currentIndex === 0 ? 'disabled' : ''}>Back</button>
                <button class="bg-quiz__action bg-quiz__action--primary" type="button" data-quiz-next ${selectedAnswer ? '' : 'disabled'}>${isLastQuestion ? 'See My Result' : 'Next'}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const buildPayload = (answers, result) => ({
    quizVersion: QUIZ_VERSION,
    answers,
    result,
    completedAt: new Date().toISOString(),
  });

  const completeQuiz = (section, state) => {
    if (!isQuizComplete(state.answers)) {
      state.message = 'Please answer every question before seeing your result.';
      return false;
    }

    const result = calculateBlackgroundResult(state.answers);
    const payload = buildPayload(state.answers, result);

    writeStorageValue(STORAGE_KEYS.answers, state.answers);
    writeStorageValue(STORAGE_KEYS.result, result);
    writeStorageValue(STORAGE_KEYS.payload, payload);

    // Future backend phase: submit this payload to /apps/blackground/quiz/submit.
    window.location.assign(section.dataset.resultUrl || '/pages/blackground-result');
    return true;
  };

  const initQuizSection = (section) => {
    if (!section || initializedQuizSections.has(section)) {
      return;
    }

    const mount = section.querySelector('[data-blackground-quiz-app]');

    if (!mount) {
      return;
    }

    const config = parseConfig(section);
    const state = {
      answers: readStoredAnswers(),
      currentIndex: 0,
      message: '',
    };

    state.currentIndex = getFirstIncompleteIndex(state.answers);

    const render = () => {
      mount.innerHTML = renderQuestion(state, config);
    };

    mount.addEventListener('change', (event) => {
      const choice = event.target.closest('[data-quiz-choice]');

      if (!choice) {
        return;
      }

      state.answers[choice.name] = choice.value;
      state.message = '';
      writeStorageValue(STORAGE_KEYS.answers, state.answers);
      render();
    });

    mount.addEventListener('click', (event) => {
      const backButton = event.target.closest('[data-quiz-back]');
      const nextButton = event.target.closest('[data-quiz-next]');

      if (backButton) {
        state.currentIndex = Math.max(0, state.currentIndex - 1);
        state.message = '';
        render();
        return;
      }

      if (!nextButton) {
        return;
      }

      const question = QUESTIONS[state.currentIndex];

      if (!state.answers[question.id]) {
        state.message = 'Please select an answer to continue.';
        render();
        return;
      }

      if (state.currentIndex === QUESTIONS.length - 1) {
        completeQuiz(section, state);
        return;
      }

      state.currentIndex += 1;
      state.message = '';
      render();
    });

    initializedQuizSections.add(section);
    render();
  };

  const initQuizSections = (root = document) => {
    root.querySelectorAll('[data-blackground-quiz]').forEach(initQuizSection);
  };

  window.BlackgroundQuiz = {
    __initialized: true,
    QUIZ_VERSION,
    STORAGE_KEYS,
    QUESTIONS,
    calculateBlackgroundResult,
    initQuizSections,
    readStoredAnswers,
    safeParse,
  };

  window.calculateBlackgroundResult = calculateBlackgroundResult;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initQuizSections(document), { once: true });
  } else {
    initQuizSections(document);
  }

  document.addEventListener('shopify:section:load', (event) => {
    initQuizSections(event.target);
  });
})();