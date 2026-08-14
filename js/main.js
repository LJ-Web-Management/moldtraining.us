document.addEventListener('DOMContentLoaded', function () {

  // Mobile nav toggle
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // FAQ accordion (each faq-list/faq-page-list container manages its own open item)
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var answer = btn.nextElementSibling;
      var container = btn.closest('.faq-list, .faq-page-list') || document;

      container.querySelectorAll('.faq-question').forEach(function (other) {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          other.nextElementSibling.style.maxHeight = null;
        }
      });

      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      answer.style.maxHeight = expanded ? null : answer.scrollHeight + 'px';
    });
  });

  // One shared set of course tabs drives both Curriculum and Who It's For panels
  var infoCourseTabs = document.getElementById('infoCourseTabs');
  if (infoCourseTabs) {
    var infoPanels = document.querySelectorAll('#curriculum .course-panel, #audience .course-panel');
    infoCourseTabs.querySelectorAll('.course-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        infoCourseTabs.querySelectorAll('.course-tab').forEach(function (other) {
          other.classList.remove('active');
          other.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        infoPanels.forEach(function (panel) {
          panel.classList.toggle('active', panel.dataset.panel === tab.dataset.panel);
        });
      });
    });
  }

  // State-by-state mold law search (FAQ page)
  var stateSearchInput = document.getElementById('stateSearchInput');
  var stateLawGrid = document.getElementById('stateLawGrid');
  var stateSearchEmpty = document.getElementById('stateSearchEmpty');

  if (stateSearchInput && stateLawGrid) {
    var stateCards = Array.prototype.slice.call(stateLawGrid.querySelectorAll('.state-law-card'));
    stateSearchInput.addEventListener('input', function () {
      var query = stateSearchInput.value.trim().toLowerCase();
      var visibleCount = 0;
      stateCards.forEach(function (card) {
        var matches = card.textContent.toLowerCase().indexOf(query) !== -1;
        card.hidden = !matches;
        if (matches) visibleCount++;
      });
      if (stateSearchEmpty) stateSearchEmpty.hidden = visibleCount !== 0;
    });
  }

  // Enroll form (seat count only; Stripe checkout wires in later)
  var enrollForm = document.getElementById('enrollForm');
  var formSuccess = document.getElementById('formSuccess');
  var seatsInput = document.getElementById('seats');
  var formTotal = document.getElementById('formTotal');
  var priceOriginal = document.getElementById('priceOriginal');
  var priceAmount = document.getElementById('priceAmount');
  var enrollCourseTabs = document.getElementById('enrollCourseTabs');
  var courseName = document.getElementById('courseName');
  var courseHours = document.getElementById('courseHours');
  var bulkPricingToggle = document.getElementById('bulkPricingToggle');
  var bulkPricingPanel = document.getElementById('bulkPricingPanel');
  var bulkPricingBody = document.getElementById('bulkPricingBody');

  // Bulk seat discount tiers, as a percentage off the selected course's base price
  var bulkTiers = [
    { label: '1', min: 1, discount: 0 },
    { label: '2 – 10', min: 2, discount: 0.01 },
    { label: '11 – 20', min: 11, discount: 0.02 },
    { label: '21 – 50', min: 21, discount: 0.03 },
    { label: '51 – 100', min: 51, discount: 0.05 },
    { label: '101 – 250', min: 101, discount: 0.07 },
    { label: '251 – 500', min: 251, discount: 0.08 },
    { label: '501 – 1,000', min: 501, discount: 0.10 }
  ];

  if (enrollForm && seatsInput && formTotal) {
    var basePrice = parseFloat(enrollForm.dataset.pricePerSeat);

    var tierFor = function (seats) {
      var match = bulkTiers[0];
      for (var i = 0; i < bulkTiers.length; i++) {
        if (seats >= bulkTiers[i].min) match = bulkTiers[i];
      }
      return match;
    };
    var priceForDiscount = function (discount) {
      return Math.round(basePrice * (1 - discount) * 100) / 100;
    };
    var renderBulkTable = function (activeTier) {
      if (!bulkPricingBody) return;
      bulkPricingBody.innerHTML = bulkTiers.map(function (tier) {
        var rowClass = tier === activeTier ? ' class="active"' : '';
        return '<tr' + rowClass + '><td>' + tier.label + '</td><td>$' + priceForDiscount(tier.discount).toFixed(2) + '</td></tr>';
      }).join('');
    };
    var updatePricing = function () {
      var seats = Math.max(1, parseInt(seatsInput.value, 10) || 1);
      var tier = tierFor(seats);
      var pricePerSeat = priceForDiscount(tier.discount);
      var discounted = pricePerSeat < basePrice;

      if (priceOriginal && priceAmount) {
        priceOriginal.hidden = !discounted;
        priceOriginal.textContent = '$' + basePrice.toFixed(2);
        priceAmount.textContent = '$' + pricePerSeat.toFixed(2);
      }
      var totalFormatted = (seats * pricePerSeat).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      formTotal.textContent = 'Total: $' + totalFormatted;

      renderBulkTable(tier);
    };
    seatsInput.addEventListener('input', updatePricing);

    if (bulkPricingToggle && bulkPricingPanel) {
      bulkPricingToggle.addEventListener('click', function () {
        var expanded = bulkPricingToggle.getAttribute('aria-expanded') === 'true';
        bulkPricingToggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        bulkPricingPanel.hidden = expanded;
      });
    }

    if (enrollCourseTabs && courseName && courseHours) {
      var applyCourse = function (tab) {
        enrollCourseTabs.querySelectorAll('.course-tab').forEach(function (other) {
          other.classList.toggle('active', other === tab);
          other.setAttribute('aria-selected', other === tab ? 'true' : 'false');
        });
        basePrice = parseFloat(tab.dataset.price);
        enrollForm.dataset.pricePerSeat = basePrice;
        courseName.textContent = tab.dataset.name;
        courseHours.textContent = tab.dataset.hours + ' of self-paced online training';
        updatePricing();
      };
      enrollCourseTabs.querySelectorAll('.course-tab').forEach(function (tab) {
        tab.addEventListener('click', function () { applyCourse(tab); });
      });
    }

    updatePricing();
  }

  // Any element with data-select-course or data-course selects that course and jumps to the enroll form
  document.querySelectorAll('[data-select-course], [data-course]').forEach(function (el) {
    el.addEventListener('click', function () {
      if (!enrollCourseTabs) return;
      var value = el.dataset.selectCourse || el.dataset.course;
      var tab = enrollCourseTabs.querySelector('.course-tab[data-value="' + value + '"]');
      if (tab) tab.click();
    });
  });

  if (enrollForm && formSuccess) {
    enrollForm.addEventListener('submit', function (e) {
      e.preventDefault();
      enrollForm.hidden = true;
      formSuccess.hidden = false;
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // Human / Machine view toggle
  var modeToggle = document.querySelector('.mode-toggle');
  if (modeToggle) {
    var modeButtons = modeToggle.querySelectorAll('.mode-toggle__btn');
    modeButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.dataset.modeBtn;
        document.documentElement.setAttribute('data-mode', mode);
        modeButtons.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-checked', active ? 'true' : 'false');
        });
        if (window.Tawk_API) {
          if (mode === 'machine') {
            if (typeof window.Tawk_API.minimize === 'function') window.Tawk_API.minimize();
            if (typeof window.Tawk_API.hideWidget === 'function') window.Tawk_API.hideWidget();
          } else if (typeof window.Tawk_API.showWidget === 'function') {
            window.Tawk_API.showWidget();
          }
        }
      });
    });
  }

});
