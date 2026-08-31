// PRODUCTION
const STRIPE_PUBLISHABLE_KEY="pk_live_doCHB0jglD5eISjEmB1vB6mb00xIg51noK"
// const STRIPE_PUBLISHABLE_KEY = "pk_test_51KRElxBHssw16TqHLVweh7MZorffCzySrRWdwAeURnEjnjuNZ7tsIfnmcBq1px0qSGWfJ3Kl2bDQRjaCCJpEO27W005Qidmdci"; // STAGING
const API_BASE_URL="https://hazwoper-osha.com/api";

// Course codes match the enroll form's data-value attributes (index.html #enrollCourseTabs).
// ids/prices are the hazwoper-osha.com catalog identifiers this order gets billed against.
var courses = [
  {id: 218, code: 'awareness', name: 'Mold Awareness Training', price: 59.99},
  {id: 372, code: 'pm-team', name: 'Property Management Mold Training', price: 229.99},
  {id: 237, code: 'inspector', name: 'Mold Inspector Certification Training', price: 329.99}
];

// Bulk seat pricing per course, matching HAZWOPER OSHA Training's published per-seat rates.
// Single source of truth — shared by the enroll form pricing (main.js) and checkout (checkout.js).
var bulkPricing = {
  'awareness': [
    { label: '1', min: 1, price: 59.99 },
    { label: '2 – 10', min: 2, price: 59.39 },
    { label: '11 – 20', min: 11, price: 58.79 },
    { label: '21 – 50', min: 21, price: 58.19 },
    { label: '51 – 100', min: 51, price: 56.99 },
    { label: '101 – 250', min: 101, price: 55.79 }
  ],
  'pm-team': [
    { label: '1', min: 1, price: 229.99 },
    { label: '2 – 10', min: 2, price: 227.69 },
    { label: '11 – 20', min: 11, price: 225.39 },
    { label: '21 – 50', min: 21, price: 223.09 },
    { label: '51 – 100', min: 51, price: 220.79 },
    { label: '101 – 250', min: 101, price: 218.49 }
  ],
  'inspector': [
    { label: '1', min: 1, price: 329.99 },
    { label: '2 – 10', min: 2, price: 326.69 },
    { label: '11 – 20', min: 11, price: 313.49 },
    { label: '21 – 50', min: 21, price: 296.99 },
    { label: '51 – 100', min: 51, price: 280.49 },
    { label: '101 – 250', min: 101, price: 263.99 }
  ]
};

function tierForCourse(courseCode, seats) {
  var tiers = bulkPricing[courseCode] || bulkPricing['pm-team'];
  var match = tiers[0];
  for (var i = 0; i < tiers.length; i++) {
    if (seats >= tiers[i].min) match = tiers[i];
  }
  return match;
}

function formatMoney(amount) {
  return Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Mobile nav toggle (shared by all pages; lets the checkout page run without main.js)
document.addEventListener('DOMContentLoaded', function () {
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav && !navToggle.dataset.navWired) {
    navToggle.dataset.navWired = '1';
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
});
