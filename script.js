/* ================= BloomCart script.js ================= */

const products = [
  { id: 1, name: 'Pink Romance', category: 'Bouquet', price: 899, img: 'https://images.unsplash.com/photo-1565279445322-30ab5314ff94?auto=format&fit=crop&w=900&q=85', desc: 'A lovely bouquet of pink roses that expresses love, gratitude and sweet memories.' },
  { id: 2, name: 'Sunset Tulips', category: 'Bouquet', price: 699, img: 'assets/natural/sunset-tulips-user.png', desc: 'Warm, cheerful blooms perfect for birthdays and celebrations.' },
  { id: 3, name: 'Lavender Dreams', category: 'Bouquet', price: 799, img: 'assets/natural/lavender-dreams-user.png', desc: 'Soft lavender flowers for a calm and elegant gift.' },
  { id: 4, name: 'Love in Bloom', category: 'Gift', price: 599, img: 'assets/natural/love-in-bloom-user.png', desc: 'A romantic flower gift prepared for someone special.' },
  { id: 5, name: 'Tulip Gift Box', category: 'Gift', price: 499, img: 'assets/natural/tulip-gift-box-user.png', desc: 'A charming gift box with fresh blooms and a sweet finish.' },
  { id: 6, name: 'Baby Breath', category: 'Bouquet', price: 499, img: 'https://images.unsplash.com/photo-1491492565236-6bf09e5d445a?auto=format&fit=crop&w=900&q=85', desc: 'Simple and delicate blooms for a thoughtful surprise.' }
];

/* ---------- helpers ---------- */
const FALLBACK_IMG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='100%25' height='100%25' fill='%23fde7ef'/><text x='50%25' y='58%25' font-size='120' text-anchor='middle'>🌷</text></svg>";
const IMG_ATTR = 'onerror="this.onerror=null;this.src=FALLBACK_IMG"';

const peso = n => '₱' + n.toLocaleString('en-PH');
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const getId = () => Number(new URLSearchParams(location.search).get('id')) || 1;

/* ---------- cart storage ---------- */
let cart = [];
try { cart = JSON.parse(localStorage.getItem('bloomcart')) || []; } catch { cart = []; }

function save() {
  localStorage.setItem('bloomcart', JSON.stringify(cart));
  count();
}
function count() {
  const n = cart.reduce((a, b) => a + b.qty, 0);
  document.querySelectorAll('.badge').forEach(x => {
    x.textContent = n;
    x.classList.remove('bump'); void x.offsetWidth; x.classList.add('bump');
  });
}
const cartTotal = () => cart.reduce((a, b) => a + b.price * b.qty, 0);

/* ---------- toast (replaces alert) ---------- */
function toast(msg, type = 'ok') {
  let box = $('toastBox');
  if (!box) { box = document.createElement('div'); box.id = 'toastBox'; document.body.appendChild(box); }
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  box.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2200);
}

/* ---------- add to cart (instant, no confirm) ---------- */
function add(id, custom = '', silent = false) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const key = id + '-' + custom;
  const old = cart.find(x => x.key === key);
  if (old) old.qty++; else cart.push({ ...p, key, qty: 1, custom });
  save();
  if (!silent) toast('✓ ' + p.name + ' Added to Cart');
}

/* ---------- product cards ---------- */
function cards(list, id) {
  const el = $(id);
  if (!el) return;
  if (!list.length) { el.innerHTML = '<p class="empty-note">No flowers found. Try a different search </p>'; return; }
  el.innerHTML = list.map(p => `
    <article class="card">
      <a href="product.html?id=${p.id}"><div class="card-img"><img src="${p.img}" alt="${esc(p.name)}" loading="lazy" ${IMG_ATTR}></div></a>
      <div class="card-info">
        <span class="tag">${p.category}</span>
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.desc)}</p>
        <div class="price">${peso(p.price)}</div>
        <button class="mini" onclick="add(${p.id})">Add to Cart</button>
        <a class="mini" href="customize.html?id=${p.id}">Customize</a>
      </div>
    </article>`).join('');
}

/* ---------- product page ---------- */
function productPage() {
  const box = $('productDetail');
  if (!box) return;
  const p = products.find(x => x.id === getId()) || products[0];
  document.title = p.name + ' — BloomCart';
  box.innerHTML = `
    <div class="detail-img"><img src="${p.img}" alt="${esc(p.name)}" ${IMG_ATTR}></div>
    <div>
      <span class="tag">${p.category}</span>
      <h1>${esc(p.name)}</h1>
      <div class="price">${peso(p.price)}</div>
      <p>${esc(p.desc)}</p>
      <p>Choose your customization and make your gift extra special.</p>
      <button class="btn" onclick="add(${p.id})">Add to Cart</button>
      <a class="text-btn" style="margin-left:16px" href="customize.html?id=${p.id}">CUSTOMIZE →</a>
    </div>`;
}

/* ---------- shop page (search + filter + sort) ---------- */
function shop() {
  const input = $('search'), filter = $('filter'), sort = $('sort');
  const countEl = $('resultCount'), clear = $('clearFilters');
  if (!input || !filter) return;

  // allow links like shop.html?category=Gift or ?q=rose
  const params = new URLSearchParams(location.search);
  if (params.get('category')) filter.value = params.get('category');
  if (params.get('q')) input.value = params.get('q');

  const run = () => {
    const q = input.value.trim().toLowerCase(), c = filter.value, s = sort ? sort.value : 'default';
    let list = products.filter(p =>
      (c === 'all' || p.category === c) &&
      (p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)));

    if (s === 'low') list.sort((a, b) => a.price - b.price);
    if (s === 'high') list.sort((a, b) => b.price - a.price);
    if (s === 'az') list.sort((a, b) => a.name.localeCompare(b.name));

    cards(list, 'shopGrid');
    if (countEl) countEl.textContent = list.length + (list.length === 1 ? ' item found' : ' items found');
    if (clear) clear.hidden = !(q || c !== 'all' || (sort && s !== 'default'));
  };

  input.addEventListener('input', run);
  filter.addEventListener('change', run);
  if (sort) sort.addEventListener('change', run);
  if (clear) clear.addEventListener('click', () => {
    input.value = ''; filter.value = 'all'; if (sort) sort.value = 'default';
    run(); input.focus();
  });
  run();
}

/* ---------- cart page ---------- */
function cartPage() {
  const box = $('cartList'), sum = $('summary');
  if (!box) return;
  if (!cart.length) {
    box.innerHTML = '<div class="form-card"><h2>Your Cart is Empty </h2><p>Find a beautiful gift for someone special.</p><a class="btn" href="shop.html">SHOP NOW</a></div>';
    sum.innerHTML = '';
    return;
  }
  box.innerHTML = cart.map((p, i) => `
    <div class="cart-item">
      <img src="${p.img}" alt="${esc(p.name)}" ${IMG_ATTR}>
      <div>
        <b>${esc(p.name)}</b>
        <p>${esc(p.custom)}</p>
        <span class="price">${peso(p.price)}</span>
      </div>
      <div class="qty">
        <button onclick="change(${i},-1)" aria-label="Decrease">−</button>
        <b>${p.qty}</b>
        <button onclick="change(${i},1)" aria-label="Increase">+</button>
        <button class="mini" onclick="removeItem(${i})">Remove</button>
      </div>
    </div>`).join('');
  sum.innerHTML = `
    <div class="summary">
      <h2>Order Summary</h2>
      <p>${cart.reduce((a, b) => a + b.qty, 0)} item(s)</p>
      <h2>Total: ${peso(cartTotal())}</h2>
      <a class="btn" href="checkout.html">CHECKOUT</a>
    </div>`;
}
function change(i, n) {
  if (!cart[i]) return;
  cart[i].qty += n;
  if (cart[i].qty < 1) cart.splice(i, 1);
  save(); cartPage();
}
function removeItem(i) {
  const name = cart[i]?.name;
  cart.splice(i, 1);
  save(); cartPage();
  toast(name + ' removed', 'info');
}

/* ---------- browser-local demo accounts ---------- */
const ACCOUNT_KEY = 'bloomcart_accounts';
const SESSION_KEY = 'bloomcart_session';
const AUTH_REQUIRED_PAGES = new Set([
  'index.html',
  'shop.html',
  'about.html',
  'cart.html',
  'product.html',
  'customize.html',
  'checkout.html'
]);

function readAccounts() {
  const stored = localStorage.getItem(ACCOUNT_KEY);
  if (!stored) return [];
  const accounts = JSON.parse(stored);
  if (!Array.isArray(accounts)) throw new Error('Saved account data is invalid.');
  return accounts;
}

function readSession() {
  const email = localStorage.getItem(SESSION_KEY);
  if (!email) return null;
  const accounts = readAccounts();
  return accounts.find(account => account.email === email) || null;
}

function requireAuthentication() {
  const page = location.pathname.split('/').pop() || 'index.html';
  if (!AUTH_REQUIRED_PAGES.has(page)) return true;

  try {
    if (readSession()) return true;
  } catch (error) {
    console.error('Could not verify the BloomCart account session.', error);
  }

  const returnTo = page + location.search + location.hash;
  location.replace('login.html?returnTo=' + encodeURIComponent(returnTo));
  return false;
}

function returnToRequestedPage() {
  const requestedPage = new URLSearchParams(location.search).get('returnTo');
  if (requestedPage) {
    const page = requestedPage.split(/[?#]/, 1)[0];
    if (AUTH_REQUIRED_PAGES.has(page) && !page.includes('/') && !page.includes('\\')) {
      location.replace(requestedPage);
      return;
    }
  }
  location.replace('index.html');
}

async function hashPassword(password, salt) {
  if (!crypto.subtle) throw new Error('Account sign-in requires a secure browser context. Open this site using Live Server or HTTPS.');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 150000 },
    key,
    256
  );
  return Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2, '0')).join('');
}

function setAuthMessage(message, type = '') {
  const box = $('authMessage');
  if (!box) return;
  box.textContent = message;
  box.className = 'auth-message' + (type ? ' ' + type : '');
}

function showAuthMode(mode) {
  const signIn = mode === 'signin';
  $('signInPanel').hidden = !signIn;
  $('signUpPanel').hidden = signIn;
  $('signInTab').classList.toggle('active', signIn);
  $('signUpTab').classList.toggle('active', !signIn);
  $('signInTab').setAttribute('aria-selected', String(signIn));
  $('signUpTab').setAttribute('aria-selected', String(!signIn));
  $(signIn ? 'signInEmail' : 'signUpName')?.focus();
  setAuthMessage('');
}

function refreshAccountNavigation() {
  let account;
  try {
    account = readSession();
  } catch (error) {
    console.error('Could not read the BloomCart account session.', error);
    return;
  }
  document.querySelectorAll('[data-account-link]').forEach(link => {
    link.textContent = account ? 'Hi, ' + account.name : 'Sign in';
  });
}

function authPage() {
  const signInForm = $('signInPanel');
  if (!signInForm) return;

  const signUpForm = $('signUpPanel');
  const signedInPanel = $('signedInPanel');
  const updatePanel = () => {
    try {
      const account = readSession();
      signedInPanel.hidden = !account;
      document.querySelector('.auth-tabs').hidden = Boolean(account);
      if (account) {
        signInForm.hidden = true;
        signUpForm.hidden = true;
        $('accountName').textContent = account.name;
      } else {
        const signInActive = $('signInTab').getAttribute('aria-selected') === 'true';
        signInForm.hidden = !signInActive;
        signUpForm.hidden = signInActive;
      }
    } catch (error) {
      setAuthMessage(error.message || 'Could not load your account. Please try again.', 'error');
    }
  };

  $('signInTab').addEventListener('click', () => showAuthMode('signin'));
  $('signUpTab').addEventListener('click', () => showAuthMode('signup'));
  document.querySelectorAll('[data-show-signup]').forEach(button => button.addEventListener('click', () => showAuthMode('signup')));
  document.querySelectorAll('[data-show-signin]').forEach(button => button.addEventListener('click', () => showAuthMode('signin')));

  signUpForm.addEventListener('submit', async event => {
    event.preventDefault();
    const data = new FormData(signUpForm);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim().toLowerCase();
    const password = String(data.get('password') || '');
    const confirmation = String(data.get('confirmPassword') || '');
    if (password !== confirmation) {
      setAuthMessage('Those passwords do not match. Please try again.', 'error');
      $('confirmPassword').focus();
      return;
    }

    try {
      const accounts = readAccounts();
      if (accounts.some(account => account.email === email)) {
        setAuthMessage('An account with this email already exists. Sign in instead.', 'error');
        return;
      }
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const passwordHash = await hashPassword(password, salt);
      accounts.push({
        name,
        email,
        salt: Array.from(salt, byte => byte.toString(16).padStart(2, '0')).join(''),
        passwordHash
      });
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accounts));
      localStorage.setItem(SESSION_KEY, email);
      setAuthMessage('Your account is ready. Welcome to BloomCart!', 'success');
      refreshAccountNavigation();
      updatePanel();
      returnToRequestedPage();
    } catch (error) {
      setAuthMessage(error.message || 'Could not create your account. Please try again.', 'error');
    }
  });

  signInForm.addEventListener('submit', async event => {
    event.preventDefault();
    const data = new FormData(signInForm);
    const email = String(data.get('email') || '').trim().toLowerCase();
    const password = String(data.get('password') || '');
    try {
      const account = readAccounts().find(savedAccount => savedAccount.email === email);
      if (!account) {
        setAuthMessage('No account was found for that email. Create an account to get started.', 'error');
        return;
      }
      const salt = Uint8Array.from(account.salt.match(/.{2}/g) || [], byte => parseInt(byte, 16));
      const passwordHash = await hashPassword(password, salt);
      if (passwordHash !== account.passwordHash) {
        setAuthMessage('That password is incorrect. Please try again.', 'error');
        return;
      }
      localStorage.setItem(SESSION_KEY, email);
      setAuthMessage('You are signed in. Welcome back!', 'success');
      refreshAccountNavigation();
      updatePanel();
      returnToRequestedPage();
    } catch (error) {
      setAuthMessage(error.message || 'Could not sign in. Please try again.', 'error');
    }
  });

  $('signOutButton').addEventListener('click', () => {
    try {
      localStorage.removeItem(SESSION_KEY);
      updatePanel();
      refreshAccountNavigation();
      showAuthMode('signin');
      setAuthMessage('You have signed out.', 'success');
    } catch (error) {
      setAuthMessage(error.message || 'Could not sign out. Please try again.', 'error');
    }
  });

  updatePanel();
}

/* ---------- customize page ---------- */
function customizePage() {
  const form = $('customForm');
  if (!form) return;
  const id = getId();
  form.addEventListener('submit', e => {
    e.preventDefault();
    const v = n => ($(n)?.value || '').trim();
    const c = `${v('flowerColor')} flowers • ${v('arrangement')} • ${v('wrap')} wrap • ${v('ribbon')} ribbon • Message: ${v('message') || 'None'}`;
    add(id, c, true);
    location.href = 'cart.html';
  });
}

/* ---------- checkout page (no alert, no redirect) ---------- */
function checkoutPage() {
  const form = $('checkoutForm');
  if (!form) return;

  // order summary shown above the form
  const sumBox = document.createElement('div');
  sumBox.className = 'form-card order-mini';
  form.parentNode.insertBefore(sumBox, form);
  const renderMini = () => {
    sumBox.innerHTML = cart.length
      ? `<h2>Your Order</h2>` + cart.map(p => `<p>${p.qty} × ${esc(p.name)} <span style="float:right">${peso(p.price * p.qty)}</span></p>`).join('') +
        `<hr><p><b>Total <span style="float:right">${peso(cartTotal())}</span></b></p>`
      : `<h2>Your Cart is Empty </h2><p><a href="shop.html">Browse flowers</a></p>`;
  };
  renderMini();

  const date = form.querySelector('[name="date"]');
  if (date) date.min = new Date().toISOString().split('T')[0];

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!cart.length) { toast('Your Cart is Empty', 'error'); return; }

    const data = Object.fromEntries(new FormData(form).entries());
    const orderNo = 'BC' + Date.now().toString().slice(-6);
    const total = cartTotal();

    try {
      const orders = JSON.parse(localStorage.getItem('bloomcart_orders')) || [];
      orders.push({ orderNo, ...data, items: cart, total, placedAt: new Date().toISOString() });
      localStorage.setItem('bloomcart_orders', JSON.stringify(orders));
    } catch {}

    cart = []; save();
    sumBox.remove();
    form.outerHTML = `
      <div class="form-card success-card">
        <div class="check">✓</div>
        <h2>Order placed! </h2>
        <p>Thank you, <b>${esc(data.name)}</b>. Your order <b>#${orderNo}</b> is confirmed.</p>
        <p> ${esc(data.address)}</p>
        <p> ${esc(data.date)} · ${esc(data.time)}</p>
        <p> ${esc(data.payment)}</p>
        <p class="price">Total: ${peso(total)}</p>
        <a class="btn" href="shop.html">Continue Shopping</a>
      </div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast('Order placed successfully');
  });
}

/* ---------- init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuthentication()) return;
  count();
  refreshAccountNavigation();
  cards(products.slice(0, 3), 'featuredGrid');
  shop();
  productPage();
  cartPage();
  customizePage();
  checkoutPage();
  authPage();
});