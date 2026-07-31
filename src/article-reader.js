const CLICK_RESPONSE_DURATION = 80;
const SITE_TRANSITION_FALLBACK = 360;
const READER_TRANSITION_FALLBACK = 400;
const SHARE_TOAST_DURATION = 2200;

let mounted = false;
let state = 'closed';
let activeSlug = null;
let activeTrigger = null;
let articles = [];
let articleLookup = new Map();

// How many article history entries sit above the list. closeFromUI uses go(-depth).
let articleDepth = 0;
let suppressRouteHandling = false;

// Latest desired destination while opening/closing. undefined = none; null = want closed.
let pendingSlug = undefined;
let pendingOpts = null;

let dialog;
let siteShell;
let siteTransitionTarget;
let readerTitle;
let readerDescription;
let readerMeta;
let readerBody;
let nextLink;
let nextTitle;
let closeButtons;
let shareToast;
let shareToastTimer = null;

// ─── Mount ────────────────────────────────────────────────────────────────────

/**
 * Single entry point: owns lookup, routing, history, share, render, and nav.
 * @param {Array<{ slug: string, title: string, document?: string }>} articleList
 *   Ordered list (articleMetadata order) — canonical for next/previous.
 */
function mount(articleList) {
  articles = articleList;
  articleLookup = new Map(articleList.map((a) => [a.slug, a]));
  if (!bindDom()) return false;
  checkInitialRoute();
  return true;
}

function bindDom() {
  if (mounted) return true;

  dialog = document.getElementById('article-reader');
  siteShell = document.getElementById('site-shell');
  shareToast = document.getElementById('share-toast');
  if (!dialog || !siteShell) return false;

  const readerSurface = dialog.querySelector('.reader-surface');
  readerTitle = dialog.querySelector('.reader-title');
  readerDescription = dialog.querySelector('.reader-description');
  readerMeta = dialog.querySelector('.reader-meta');
  readerBody = dialog.querySelector('.reader-body');
  nextLink = dialog.querySelector('[data-reader-next]');
  nextTitle = dialog.querySelector('.next-article-title');
  closeButtons = dialog.querySelectorAll('[data-reader-close]');
  const transitionTargets = siteShell.querySelectorAll('.page > :not(.hidden)');
  siteTransitionTarget = transitionTargets[transitionTargets.length - 1];

  if (!readerSurface || !readerTitle || !readerBody || !siteTransitionTarget || !nextLink || !nextTitle) {
    return false;
  }

  closeButtons.forEach((button) => button.addEventListener('click', closeFromUI));

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeFromUI();
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeFromUI();
  });

  nextLink.addEventListener('click', (event) => {
    if (isModifiedClick(event)) return;
    event.preventDefault();
    next();
  });

  window.addEventListener('popstate', handleRouteChange);
  window.addEventListener('hashchange', handleRouteChange);

  mounted = true;
  return true;
}

function checkInitialRoute() {
  const slug = slugFromHash(location.hash);
  if (!slug) return;

  if (articleLookup.has(slug)) {
    navigate(slug, { fromNavigation: true, replaceOnClose: true });
  } else {
    history.replaceState(null, '', location.pathname + location.search);
  }
}

// ─── Slug helpers ─────────────────────────────────────────────────────────────

function slugFromHash(hash) {
  const match = hash.match(/^#article\/(.+)$/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

function articleHash(slug) {
  return `#article/${encodeURIComponent(slug)}`;
}

function nextSlug() {
  if (!articles.length || !activeSlug) return null;
  const i = articles.findIndex((a) => a.slug === activeSlug);
  if (i < 0) return null;
  return articles[(i + 1) % articles.length].slug;
}

function previousSlug() {
  if (!articles.length || !activeSlug) return null;
  const i = articles.findIndex((a) => a.slug === activeSlug);
  if (i < 0) return null;
  return articles[(i - 1 + articles.length) % articles.length].slug;
}

// ─── History depth ────────────────────────────────────────────────────────────

function pushArticle(slug) {
  articleDepth += 1;
  history.pushState({ article: slug, depth: articleDepth }, '', articleHash(slug));
}

function syncDepthFromHistory(slug, { replaceOnClose = false } = {}) {
  if (replaceOnClose) {
    articleDepth = 0;
    return;
  }

  const stamped = history.state?.depth;
  if (typeof stamped === 'number') {
    articleDepth = stamped;
    return;
  }

  // Hashchange / unstamped entry: count it and stamp so later go(-depth) is exact.
  articleDepth += 1;
  history.replaceState({ article: slug, depth: articleDepth }, '', articleHash(slug));
}

// ─── Navigate (single path for cards, Next, browser) ──────────────────────────

/**
 * @param {string} slug
 * @param {{ trigger?: Element|null, fromNavigation?: boolean, replaceOnClose?: boolean }} options
 */
function navigate(slug, {
  trigger = null,
  fromNavigation = false,
  replaceOnClose = false,
} = {}) {
  if (!mounted && !bindDom()) return false;

  const article = articleLookup.get(slug);
  if (!article) return false;

  if (state === 'closed') {
    return openReader(article, trigger, { fromNavigation, replaceOnClose });
  }

  if (state === 'open') {
    if (activeSlug === slug) return true;

    if (fromNavigation) {
      syncDepthFromHistory(slug);
    } else {
      pushArticle(slug);
    }

    activeSlug = slug;
    activeTrigger = trigger ?? activeTrigger;
    renderArticle(article);
    dialog.scrollTop = 0;
    return true;
  }

  // Opening/closing: queue and reconcile once the transition settles.
  pendingSlug = slug;
  pendingOpts = { trigger, fromNavigation, replaceOnClose };
  return true;
}

function next() {
  const slug = nextSlug();
  return slug ? navigate(slug) : false;
}

function previous() {
  const slug = previousSlug();
  return slug ? navigate(slug) : false;
}

function handleRouteChange() {
  if (suppressRouteHandling) return;

  const slug = slugFromHash(location.hash);
  if (slug) {
    navigate(slug, { fromNavigation: true });
    return;
  }

  // Hash cleared — want the list.
  articleDepth = 0;
  if (state === 'open') {
    closeUI();
  } else if (state !== 'closed') {
    pendingSlug = null;
    pendingOpts = null;
  }
}

async function reconcilePending() {
  if (pendingSlug === undefined) return;

  const slug = pendingSlug;
  const opts = pendingOpts;
  pendingSlug = undefined;
  pendingOpts = null;

  if (slug === null) {
    if (state !== 'open') return;
    // Mid-open UI close may leave an article hash; unwind depth if needed.
    if (slugFromHash(location.hash)) return closeFromUI();
    return closeUI();
  }

  return navigate(slug, opts ?? { fromNavigation: true });
}

// ─── Open / close ─────────────────────────────────────────────────────────────

async function openReader(article, trigger, { fromNavigation, replaceOnClose }) {
  if (state !== 'closed') return false;

  state = 'activating';
  activeSlug = article.slug;
  activeTrigger = trigger ?? document.activeElement;
  activeTrigger?.classList?.add('article-link-activating');

  if (!fromNavigation) {
    pushArticle(article.slug);
  } else {
    syncDepthFromHistory(article.slug, { replaceOnClose });
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
  await reconcilePending();
  return true;
}

async function closeFromUI() {
  if (!mounted) return false;

  if (state !== 'open') {
    if (state === 'closed') return false;
    pendingSlug = null;
    pendingOpts = null;
    return true;
  }

  const depth = articleDepth;
  articleDepth = 0;

  if (depth > 0) {
    suppressRouteHandling = true;
    history.go(-depth);
    setTimeout(() => { suppressRouteHandling = false; }, 0);
  } else {
    history.replaceState(null, '', location.pathname + location.search);
  }

  return closeUI();
}

async function closeUI() {
  if (!mounted || state !== 'open') return false;

  articleDepth = 0;
  activeSlug = null;
  state = 'reader-exiting';
  dialog.classList.remove('reader-visible');

  await waitForTransition(dialog, READER_TRANSITION_FALLBACK);

  dialog.close();
  document.body.classList.remove('reader-active');
  state = 'site-entering';
  activeTrigger?.classList?.remove('article-link-activating');
  siteShell.classList.remove('site-shell-exiting');

  await waitForTransition(siteTransitionTarget, SITE_TRANSITION_FALLBACK);

  siteShell.inert = false;
  state = 'closed';

  if (activeTrigger instanceof HTMLElement) {
    activeTrigger.focus({ preventScroll: true });
  }
  activeTrigger = null;
  await reconcilePending();
  return true;
}

// ─── Share ────────────────────────────────────────────────────────────────────

async function share(slug) {
  const article = articleLookup.get(slug);
  if (!article) return false;

  const title = article.title || '';
  const url = `${location.origin}${location.pathname}${articleHash(slug)}`;

  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return true;
    } catch (err) {
      if (err.name === 'AbortError') return false;
    }
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      showShareToast('Link copied!');
      return true;
    } catch { /* fall through */ }
  }

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
    return true;
  }

  prompt('Copy this link:', url);
  return true;
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

  readerBody.innerHTML = content ||
    '<p class="reader-status">This essay is currently being prepared.</p>';

  updateNextLink();
}

function updateNextLink() {
  const slug = nextSlug();
  if (!slug) return;
  const article = articleLookup.get(slug);
  nextLink.href = articleHash(slug);
  nextTitle.textContent = article?.title || 'Untitled';
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

function isModifiedClick(event) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

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
  mount,
  navigate,
  next,
  previous,
  close: closeFromUI,
  share,
});
