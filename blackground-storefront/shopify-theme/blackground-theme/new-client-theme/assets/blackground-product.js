(function () {
  function money(cents) {
    if (typeof Shopify !== 'undefined' && typeof Shopify.formatMoney === 'function') {
      return Shopify.formatMoney(cents);
    }

    return '$' + (Number(cents || 0) / 100).toFixed(2);
  }

  function normalize(value) {
    return String(value || '').trim();
  }

  function initProduct(root) {
    if (!root || root.dataset.bgProductInitialized === 'true') return;
    root.dataset.bgProductInitialized = 'true';

    var product = {};
    try {
      product = JSON.parse(root.getAttribute('data-product') || '{}');
    } catch (error) {
      product = {};
    }

    var form = root.querySelector('[data-product-form]');
    var variantInput = root.querySelector('[data-variant-id]');
    var priceEl = root.querySelector('[data-product-price]');
    var addButton = root.querySelector('[data-add-to-cart]');
    var optionSelects = Array.prototype.slice.call(root.querySelectorAll('[data-option-select]'));
    var mediaCards = Array.prototype.slice.call(root.querySelectorAll('[data-product-card]'));
    var mediaStack = root.querySelector('[data-product-media-stack]');
    var detailTriggers = Array.prototype.slice.call(root.querySelectorAll('[data-product-detail-trigger]'));
    var detailPanels = Array.prototype.slice.call(root.querySelectorAll('[data-product-detail-panel]'));

    var activeMediaIndex = 0;

    function selectedOptions() {
      return optionSelects.map(function (select) {
        return normalize(select.value);
      });
    }

    function findVariant() {
      var options = selectedOptions();

      if (!product.variants) return null;

      return product.variants.find(function (variant) {
        return options.every(function (value, index) {
          if (!value) return false;
          return normalize(variant.options[index]) === value;
        });
      });
    }

    function updateVariant() {
      var variant = findVariant();

      if (!variant) {
        if (addButton) {
          addButton.disabled = true;
          addButton.textContent = 'SELECT OPTIONS';
        }
        return;
      }

      if (variantInput) {
        variantInput.value = variant.id;
      }

      if (priceEl) {
        priceEl.textContent = money(variant.price);
      }

      if (addButton) {
        addButton.disabled = !variant.available;
        addButton.textContent = variant.available ? 'ADD TO BAG' : 'SOLD OUT';
      }

      if (variant.featured_image && variant.featured_image.id) {
        showMediaByImageId(variant.featured_image.id);
      }

      var url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url.toString());
    }

    function setMediaStates() {
      mediaCards.forEach(function (card, index) {
        card.classList.remove('is-active', 'is-previous', 'is-next');
        card.setAttribute('data-layer-state', 'hidden');

        if (index === activeMediaIndex) {
          card.classList.add('is-active');
          card.setAttribute('data-layer-state', 'front');
        } else if (index === activeMediaIndex - 1) {
          card.classList.add('is-previous');
          card.setAttribute('data-layer-state', 'back');
        } else if (index === activeMediaIndex + 1) {
          card.classList.add('is-next');
          card.setAttribute('data-layer-state', 'mid');
        }
      });
    }

    function showMediaByImageId(imageId) {
      var index = mediaCards.findIndex(function (card) {
        return String(card.getAttribute('data-image-id')) === String(imageId);
      });

      if (index >= 0) {
        activeMediaIndex = index;
        setMediaStates();
      }
    }

    function nextMedia() {
      if (!mediaCards.length) return;
      activeMediaIndex = (activeMediaIndex + 1) % mediaCards.length;
      setMediaStates();
    }

    function updateDetailPanel(value) {
      detailPanels.forEach(function (panel) {
        panel.classList.toggle('is-active', panel.getAttribute('data-product-detail-panel') === value);
      });
    }

    optionSelects.forEach(function (select) {
      select.addEventListener('change', updateVariant);
    });

    if (mediaStack && mediaCards.length > 1) {
      mediaStack.addEventListener('click', nextMedia);
    }

    detailTriggers.forEach(function (trigger) {
      trigger.addEventListener('change', function () {
        updateDetailPanel(trigger.value);
      });
    });

    if (form) {
      form.addEventListener('submit', function (event) {
        var variant = findVariant();

        if (!variant || !variant.available) {
          event.preventDefault();
          updateVariant();
        }
      });
    }

    setMediaStates();
    updateVariant();

    var checkedDetail = root.querySelector('[data-product-detail-trigger]:checked');
    if (checkedDetail) {
      updateDetailPanel(checkedDetail.value);
    }
  }

  function initAllProducts() {
    document.querySelectorAll('[data-product-root]').forEach(initProduct);
  }

  document.addEventListener('DOMContentLoaded', initAllProducts);
  document.addEventListener('shopify:section:load', function (event) {
    initProduct(event.target.querySelector('[data-product-root]'));
  });
})();
