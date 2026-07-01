const BASE_RATES = Object.freeze({
  USD: 1.0, EUR: 0.9201, GBP: 0.7887, INR: 83.47, JPY: 153.82,
  AUD: 1.5312, CAD: 1.3641, SGD: 1.3478, AED: 3.6725, MXN: 17.154,
});

const SEED_EXPENSES = [
  { id: 1, date: '2026-02-03', merchant: 'Indigo Airlines', amount: 8200, currency: 'INR', category: 'Travel' },
  { id: 2, date: '2026-02-10', merchant: 'Slack Pro', amount: 12.5, currency: 'USD', category: 'Software' },
  { id: 3, date: '2026-02-14', merchant: 'Dishoom London', amount: 68.4, currency: 'GBP', category: 'Food' },
  { id: 4, date: '2026-02-19', merchant: 'AWS', amount: 143, currency: 'USD', category: 'Software' },
  { id: 5, date: '2026-02-25', merchant: 'Singapore Taxi', amount: 32, currency: 'SGD', category: 'Travel' },
  { id: 6, date: '2026-03-02', merchant: 'Figma', amount: 15, currency: 'USD', category: 'Software' },
  { id: 7, date: '2026-03-07', merchant: 'Boulangerie Utopie', amount: 9.8, currency: 'EUR', category: 'Food' },
  { id: 8, date: '2026-03-11', merchant: 'JR Rail Pass', amount: 50000, currency: 'JPY', category: 'Travel' },
  { id: 9, date: '2026-03-15', merchant: 'Netflix', amount: 15.49, currency: 'USD', category: 'Entertainment' },
  { id: 10, date: '2026-03-20', merchant: 'Swiggy', amount: 620, currency: 'INR', category: 'Food' },
  { id: 11, date: '2026-03-28', merchant: 'Air Canada', amount: 410, currency: 'CAD', category: 'Travel' },
  { id: 12, date: '2026-04-02', merchant: 'GitHub Copilot', amount: 10, currency: 'USD', category: 'Software' },
  { id: 13, date: '2026-04-08', merchant: 'Burj Khalifa tickets', amount: 149, currency: 'AED', category: 'Entertainment' },
  { id: 14, date: '2026-04-12', merchant: 'Qantas', amount: 520, currency: 'AUD', category: 'Travel' },
  { id: 15, date: '2026-04-15', merchant: 'Linear', amount: 8, currency: 'USD', category: 'Software' },
  { id: 16, date: '2026-04-18', merchant: 'Tacos el Califa', amount: 180, currency: 'MXN', category: 'Food' },
  { id: 17, date: '2026-04-22', merchant: 'Spotify', amount: 10.99, currency: 'USD', category: 'Entertainment' },
  { id: 18, date: '2026-04-25', merchant: 'Zoom', amount: 15.99, currency: 'USD', category: 'Software' },
  { id: 19, date: '2026-04-29', merchant: 'Lune Croissanterie', amount: 22, currency: 'AUD', category: 'Food' },
  { id: 20, date: '2026-05-01', merchant: 'Emirates flight', amount: 1850, currency: 'AED', category: 'Travel' },
];

const CATEGORIES = ['Travel', 'Food', 'Software', 'Entertainment'];
const state = { expenses: [...SEED_EXPENSES], selectedCategory: null, sortField: 'date', sortDirection: 'desc', eurRate: BASE_RATES.EUR };
const $ = (selector) => document.querySelector(selector);
const usdFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

function toUsd(expense, rates = currentRates()) {
  const rate = rates[expense.currency];
  if (!Number.isFinite(rate) || rate <= 0) throw new Error(`A valid rate is unavailable for ${expense.currency}.`);
  return expense.amount / rate;
}

function currentRates() { return { ...BASE_RATES, EUR: state.eurRate }; }
function money(value) { return usdFormatter.format(value); }
function originalAmount(expense) { return `${numberFormatter.format(expense.amount)} ${expense.currency}`; }
function formatDate(value) { return new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)); }
function sum(items, selector) { return items.reduce((total, item) => total + selector(item), 0); }

function categorySummary() {
  return CATEGORIES.map((category) => {
    const rows = state.expenses.filter((item) => item.category === category);
    return { category, count: rows.length, total: sum(rows, toUsd), largest: Math.max(...rows.map((expense) => toUsd(expense)), 0) };
  }).sort((a, b) => b.total - a.total);
}

function merchantSummary() {
  const totals = new Map();
  state.expenses.forEach((expense) => totals.set(expense.merchant, (totals.get(expense.merchant) || 0) + toUsd(expense)));
  return [...totals.entries()].map(([merchant, total]) => ({ merchant, total })).sort((a, b) => b.total - a.total).slice(0, 3);
}

function renderSummary() {
  const categories = categorySummary();
  const total = sum(state.expenses, toUsd);
  const baseTotal = sum(state.expenses, (expense) => toUsd(expense, BASE_RATES));
  const delta = total - baseTotal;
  const largestExpense = [...state.expenses].sort((a, b) => toUsd(b) - toUsd(a))[0];
  $('#overall-total').textContent = money(total);
  $('#largest-category').textContent = categories[0]?.category || '—';
  $('#largest-category-value').textContent = categories[0] ? `${money(categories[0].total)} · ${categories[0].count} expenses` : '—';
  $('#largest-expense').textContent = largestExpense ? money(toUsd(largestExpense)) : '—';
  $('#largest-expense-merchant').textContent = largestExpense?.merchant || '—';
  $('#currency-count').textContent = new Set(state.expenses.map((item) => item.currency)).size;
  $('#total-change').textContent = Math.abs(delta) < 0.005 ? 'Across all recorded expenses' : `${delta >= 0 ? '+' : '−'}${money(Math.abs(delta))} vs base EUR rate`;
  $('#total-change').className = `change-note ${delta > 0.005 ? 'positive' : delta < -0.005 ? 'negative' : ''}`;
  $('#category-body').innerHTML = categories.map((item) => `
    <tr tabindex="0" data-category="${item.category}" class="${state.selectedCategory === item.category ? 'selected' : ''}" aria-label="Filter by ${item.category}">
      <td><span class="category-dot ${item.category.toLowerCase()}"></span><strong>${item.category}</strong></td><td>${item.count}</td><td><strong>${money(item.total)}</strong></td><td>${money(item.largest)}</td>
    </tr>`).join('');
  $('#merchant-list').innerHTML = merchantSummary().map((item, index) => `
    <li><span class="rank">0${index + 1}</span><div><strong>${escapeHtml(item.merchant)}</strong><small>${money(item.total)}</small></div><div class="merchant-bar"><span style="width:${(item.total / merchantSummary()[0].total) * 100}%"></span></div></li>`).join('');
}

function visibleExpenses() {
  return state.expenses.filter((item) => !state.selectedCategory || item.category === state.selectedCategory).sort((a, b) => {
    const first = state.sortField === 'date' ? a.date : toUsd(a);
    const second = state.sortField === 'date' ? b.date : toUsd(b);
    return (first < second ? -1 : first > second ? 1 : 0) * (state.sortDirection === 'asc' ? 1 : -1);
  });
}

function renderExpenses() {
  const rows = visibleExpenses();
  $('#expense-body').innerHTML = rows.map((expense) => `
    <tr><td>${formatDate(expense.date)}</td><td><strong>${escapeHtml(expense.merchant)}</strong></td><td><span class="category-pill ${expense.category.toLowerCase()}">${expense.category}</span></td><td>${originalAmount(expense)}</td><td><strong>${money(toUsd(expense))}</strong></td></tr>`).join('');
  $('#empty-state').hidden = rows.length !== 0;
  $('#row-count').textContent = `${rows.length} ${rows.length === 1 ? 'expense' : 'expenses'} shown`;
  $('#active-context').textContent = `${state.selectedCategory || 'All categories'} · ${rows.length} expenses`;
  $('#category-filters').innerHTML = ['All', ...CATEGORIES].map((category) => {
    const selected = category === 'All' ? !state.selectedCategory : state.selectedCategory === category;
    return `<button type="button" data-filter="${category}" class="${selected ? 'active' : ''}" aria-pressed="${selected}">${category}</button>`;
  }).join('');
  const directionCopy = state.sortField === 'date' ? (state.sortDirection === 'desc' ? 'Newest first ↓' : 'Oldest first ↑') : (state.sortDirection === 'desc' ? 'Highest first ↓' : 'Lowest first ↑');
  $('#sort-direction').textContent = directionCopy;
}

function render() { renderSummary(); renderExpenses(); $('#eur-output').textContent = state.eurRate.toFixed(4); }
function setFilter(category) { state.selectedCategory = category === 'All' || state.selectedCategory === category ? null : category; render(); }
function escapeHtml(value) { const element = document.createElement('span'); element.textContent = value; return element.innerHTML; }

function populateForm() {
  $('#currency').innerHTML = Object.keys(BASE_RATES).map((code) => `<option value="${code}">${code}</option>`).join('');
  $('#category').innerHTML = CATEGORIES.map((category) => `<option value="${category}">${category}</option>`).join('');
  $('#date').value = '2026-05-01';
}

function clearErrors() { document.querySelectorAll('.error').forEach((item) => item.textContent = ''); $('#form-error').textContent = ''; }
function validateForm(data) {
  clearErrors(); let valid = true;
  if (!data.merchant.trim()) { $('[data-for="merchant"]').textContent = 'Enter a merchant name.'; valid = false; }
  const amount = Number(data.amount);
  if (!Number.isFinite(amount) || amount <= 0) { $('[data-for="amount"]').textContent = 'Enter an amount greater than zero.'; valid = false; }
  if (!data.date) { $('[data-for="date"]').textContent = 'Choose a date.'; valid = false; }
  if (!BASE_RATES[data.currency]) { $('#form-error').textContent = 'The selected currency does not have a valid rate.'; valid = false; }
  return valid;
}

function closeDialog() { $('#expense-dialog').close(); clearErrors(); }
function showToast() { $('#toast').classList.add('show'); window.setTimeout(() => $('#toast').classList.remove('show'), 2800); }

$('#category-body').addEventListener('click', (event) => { const row = event.target.closest('[data-category]'); if (row) setFilter(row.dataset.category); });
$('#category-body').addEventListener('keydown', (event) => { if (['Enter', ' '].includes(event.key)) { const row = event.target.closest('[data-category]'); if (row) { event.preventDefault(); setFilter(row.dataset.category); } } });
$('#category-filters').addEventListener('click', (event) => { const button = event.target.closest('[data-filter]'); if (button) setFilter(button.dataset.filter); });
$('#sort-field').addEventListener('change', (event) => { state.sortField = event.target.value; renderExpenses(); });
$('#sort-direction').addEventListener('click', () => { state.sortDirection = state.sortDirection === 'desc' ? 'asc' : 'desc'; renderExpenses(); });
$('#eur-rate').addEventListener('input', (event) => { state.eurRate = Number(event.target.value); render(); });
$('#reset-rate').addEventListener('click', () => { state.eurRate = BASE_RATES.EUR; $('#eur-rate').value = BASE_RATES.EUR; render(); });
$('#open-form').addEventListener('click', () => $('#expense-dialog').showModal());
$('#close-form').addEventListener('click', closeDialog);
$('#cancel-form').addEventListener('click', closeDialog);
$('#expense-dialog').addEventListener('click', (event) => { if (event.target === $('#expense-dialog')) closeDialog(); });
$('#expense-form').addEventListener('submit', (event) => {
  event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget));
  if (!validateForm(data)) return;
  state.expenses.push({ id: Math.max(...state.expenses.map((item) => item.id), 0) + 1, date: data.date, merchant: data.merchant.trim(), amount: Number(data.amount), currency: data.currency, category: data.category });
  event.currentTarget.reset(); populateForm(); closeDialog(); render(); showToast();
});

populateForm();
render();
