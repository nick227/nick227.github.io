const CLICK_RESPONSE_DURATION = 80;
const SITE_TRANSITION_FALLBACK = 360;
const READER_TRANSITION_FALLBACK = 400;
const SHARE_TOAST_DURATION = 2200;

let initialized = false;
let state = 'closed';
let activeTrigger = null;
let articleLookup = new Map();

// Whether UI close should history.back() instead of replaceState.
// true  → article sits on its own history entry (click push, Back/Forward, or hashchange)
// false → article was the initial URL hash; replaceState cleans it without adding an entry
let closeViaBack = false;

let dialog;
let siteShell;
let siteTransitionTarget;
let readerTitle;
let readerDescription;
let readerMeta;
let readerBody;
let closeButtons;
let shareToast;
let shareToastTimer = null;

// ─── Lookup ───────────────────────────────────────────────────────────────────

function setArticleLookup(list) {
  articleLookup = new Map(list.map((a) => [a.slug, a]));
}

// ─── Routing helpers ──────────────────────────────────────────────────────────

function slugFromHash(hash) {
  const match = hash.match(/^#article\/(.+)$/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

/**
 * Called once on page load. Opens the article if the initial URL contains a
 * valid slug. If the slug is invalid the bad hash is silently replaced so the
 * URL is clean without affecting session history.
 */
function checkInitialRoute() {
  const slug = slugFromHash(location.hash);
  if (!slug) return;

  const article = articleLookup.get(slug);
  if (article) {
    // Hash was part of the initial load — no push, and close via replaceState.
    open(article, null, { fromNavigation: true, replaceOnClose: true });
  } else {
    // Unknown slug — clean the URL without creating a history entry.
    history.replaceState(null, '', location.pathname + location.search);
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
  if (initialized) return true;

  dialog = document.getElementById('article-reader');
  siteShell = document.getElementById('site-shell');
  shareToast = document.getElementById('share-toast');
  if (!dialog || !siteShell) return false;

  const readerSurface = dialog.querySelector('.reader-surface');
  readerTitle = dialog.querySelector('.reader-title');
  readerDescription = dialog.querySelector('.reader-description');
  readerMeta = dialog.querySelector('.reader-meta');
  readerBody = dialog.querySelector('.reader-body');
  closeButtons = dialog.querySelectorAll('[data-reader-close]');
  const transitionTargets = siteShell.querySelectorAll('.page > :not(.hidden)');
  siteTransitionTarget = transitionTargets[transitionTargets.length - 1];

  if (!readerSurface || !readerTitle || !readerBody || !siteTransitionTarget) {
    return false;
  }

  // Close buttons and backdrop use closeFromUI(), which handles history.
  closeButtons.forEach((button) => {
    button.addEventListener('click', closeFromUI);
  });

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeFromUI();
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeFromUI();
  });

  // Both fire for Back/Forward that change the hash; handleRouteChange is
  // idempotent so a double call is a no-op once state already matches the URL.
  window.addEventListener('popstate', handleRouteChange);
  // hashchange alone covers typed hashes / location.hash without pushState.
  window.addEventListener('hashchange', handleRouteChange);

  initialized = true;
  return true;
}

/**
 * Shared logic for popstate and hashchange: open, switch, or close the reader
 * to match the current URL. Safe to call twice for the same navigation.
 */
function handleRouteChange() {
  const slug = slugFromHash(location.hash);

  if (slug) {
    const article = articleLookup.get(slug);
    // Unknown slug: leave the URL as-is (user typed it) but don't open.
    if (!article) return;

    if (state === 'closed') {
      open(article, null, { fromNavigation: true });
    } else if (state === 'open') {
      // Already open — sync content for article→article hash changes.
      renderArticle(article);
      dialog.scrollTop = 0;
    }
  } else if (state === 'open') {
    closeUI();
  }
}

// ─── Open ─────────────────────────────────────────────────────────────────────

/**
 * @param {object} article
 * @param {Element|null} trigger  – the element that triggered the open (for focus-return)
 * @param {{ fromNavigation?: boolean, replaceOnClose?: boolean }} options
 *   fromNavigation: true when opened by the browser (popstate/hashchange/initial load).
 *     The caller has already changed the URL, so we must NOT push again.
 *   replaceOnClose: true only for initial-hash load — close cleans URL via replaceState.
 *     Omit for Back/Forward/hashchange so close uses history.back() and preserves the stack.
 */
async function open(article, trigger = document.activeElement, {
  fromNavigation = false,
  replaceOnClose = false,
} = {}) {
  if (!init() || state !== 'closed' || !article) return false;

  state = 'activating';
  activeTrigger = trigger;
  activeTrigger?.classList.add('article-link-activating');

  // Push the route exactly once — only when triggered by user interaction,
  // not when the browser has already navigated (popstate/hashchange/initial load).
  if (!fromNavigation) {
    history.pushState({ article: article.slug }, '', `#article/${encodeURIComponent(article.slug)}`);
    closeViaBack = true;
  } else {
    // Forward onto a prior article entry must still close via back(), or replaceState
    // would overwrite that entry and leave a duplicate base page in the stack.
    closeViaBack = !replaceOnClose;
  }

  renderArticle(article);
  dialog.scrollTop = 0;

  await nextFrame();
  if (!prefersReducedMotion()) await wait(CLICK_RESPONSE_DURATION);

  dialog.showModal();
  document.body.classList.add('reader-active');
  state = 'site-exiting';
  siteShell.classList.add('site-shell-exiting');
  await waitForTransition(siteTransitionTarget, SITE_TRANSITION_FALLBACK);

  siteShell.inert = true;
  state = 'reader-entering';
  dialog.classList.add('reader-visible');

  await waitForTransition(dialog, READER_TRANSITION_FALLBACK);

  state = 'open';
  closeButtons[0]?.focus({ preventScroll: true });
  return true;
}

// ─── Close ────────────────────────────────────────────────────────────────────

/**
 * Called by UI controls (buttons, backdrop, ESC).
 * Fixes history before closing the UI.
 */
async function closeFromUI() {
  if (!initialized || state !== 'open') return false;

  if (closeViaBack) {
    // Undo the article entry (our push, or one reached via Forward/hashchange).
    // history.back() fires popstate asynchronously; by then state will be
    // 'reader-exiting' or 'closed', so handleRouteChange() is a no-op.
    closeViaBack = false;
    history.back();
  } else {
    // Initial-hash open — replace the hash so no extra entry is added and
    // pressing Back leaves the site entirely.
    history.replaceState(null, '', location.pathname + location.search);
  }

  return closeUI();
}

/**
 * Pure UI close — no history manipulation. Called by closeFromUI() and by
 * handleRouteChange() when the browser has already moved in history.
 */
async function closeUI() {
  if (!initialized || state !== 'open') return false;

  closeViaBack = false;
  state = 'reader-exiting';
  dialog.classList.remove('reader-visible');

  await waitForTransition(dialog, READER_TRANSITION_FALLBACK);

  dialog.close();
  document.body.classList.remove('reader-active');
  state = 'site-entering';
  activeTrigger?.classList.remove('article-link-activating');
  siteShell.classList.remove('site-shell-exiting');

  await waitForTransition(siteTransitionTarget, SITE_TRANSITION_FALLBACK);

  siteShell.inert = false;
  state = 'closed';

  if (activeTrigger instanceof HTMLElement) {
    activeTrigger.focus({ preventScroll: true });
  }
  activeTrigger = null;
  return true;
}

// Keep the public `close` alias pointing to the UI-only close for any external
// callers; history is managed internally.
const close = closeFromUI;

// ─── Share ────────────────────────────────────────────────────────────────────

async function share(slug, title) {
  const url = `${location.origin}${location.pathname}#article/${encodeURIComponent(slug)}`;

  // 1. Native share sheet (mobile / supported desktop browsers)
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return; // shared successfully
    } catch (err) {
      // AbortError = user dismissed the share sheet — silent, no fallback.
      if (err.name === 'AbortError') return;
      // Any other error (e.g. DataError, NotAllowedError): fall through to clipboard.
    }
  }

  // 2. Async Clipboard API (HTTPS or localhost only)
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      showShareToast('Link copied!');
      return;
    } catch {
      // Permission denied or unavailable — fall through.
    }
  }

  // 3. Legacy execCommand fallback (HTTP, older browsers, some iframes)
  const textArea = document.createElement('textarea');
  textArea.value = url;
  textArea.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch { /* ignore */ }
  document.body.removeChild(textArea);

  if (copied) {
    showShareToast('Link copied!');
    return;
  }

  // 4. Last resort: browser prompt (always works, never throws)
  prompt('Copy this link:', url);
}

function showShareToast(message) {
  if (!shareToast) return;
  shareToast.textContent = message;
  shareToast.classList.add('share-toast-visible');
  clearTimeout(shareToastTimer);
  shareToastTimer = setTimeout(() => {
    shareToast.classList.remove('share-toast-visible');
  }, SHARE_TOAST_DURATION);
}

// ─── Render ───────────────────────────────────────────────────────────────────

function renderArticle(article) {
  const content = article.document?.trim() || '';

  readerTitle.textContent = article.title || 'Untitled';
  readerMeta.textContent = getArticleMeta(content);

  if (article.description) {
    readerDescription.textContent = article.description;
    readerDescription.classList.remove('hidden');
  } else {
    readerDescription.textContent = '';
    readerDescription.classList.add('hidden');
  }

  // Blog documents are local, author-controlled HTML.
  readerBody.innerHTML = content ||
    '<p class="reader-status">This essay is currently being prepared.</p>';
}

function getArticleMeta(content) {
  if (!content) return 'Nick Rios · Essay in progress';

  const wordCount = stripMarkup(content).split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 220));
  return `Nick Rios · ${readingTime} min read`;
}

function stripMarkup(content) {
  const template = document.createElement('template');
  template.innerHTML = content;
  return template.content.textContent || '';
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function nextFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

function wait(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

function waitForTransition(element, fallbackDuration) {
  if (prefersReducedMotion()) return Promise.resolve();

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      element.removeEventListener('transitionend', onTransitionEnd);
      clearTimeout(fallbackTimer);
      resolve();
    };
    const onTransitionEnd = (event) => {
      if (event.target === element && event.propertyName === 'opacity') finish();
    };
    const fallbackTimer = setTimeout(finish, fallbackDuration + 80);

    element.addEventListener('transitionend', onTransitionEnd);
  });
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const ArticleReader = Object.freeze({
  init,
  open,
  close,
  share,
  setArticleLookup,
  checkInitialRoute,
});
