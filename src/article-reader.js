const CLICK_RESPONSE_DURATION = 80;
const SITE_TRANSITION_FALLBACK = 360;
const READER_TRANSITION_FALLBACK = 400;
const SHARE_TOAST_DURATION = 2200;

/** @type {ReturnType<typeof createReader>[]} */
const readers = [];
let sharedDialogBound = false;

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Creates an independent reader instance backed by the same shared
 * `<dialog id="article-reader">` DOM element.  Multiple instances must NOT
 * be open simultaneously, but they share the dialog safely because only one
 * reader can be mounted at a time while the dialog is open.
 *
 * @param {{
 *   hashPrefix?:  string,   // URL hash prefix, e.g. 'article' → #article/<slug>
 *   eyebrow?:     string,   // text shown above the title in the reader header
 *   closeLabel?:  string,   // label for the close/back button
 *   nextLabel?:   string,   // label for the "next" eyebrow above the next-link
 *   footerClose?: string,   // label for the footer close button
 * }} config
 */
function createReader({
  hashPrefix  = 'article',
  eyebrow     = 'Nick Rios / Writing',
  closeLabel  = 'Back to writing',
  nextLabel   = 'Next Article',
  footerClose = 'Back to all articles',
} = {}) {
  let mounted = false;
  let state = 'closed';
  let activeSlug = null;
  let activeTrigger = null;
  let items = [];
  let itemLookup = new Map();

  // How many history entries sit above the list. closeFromUI uses go(-depth).
  let articleDepth = 0;
  let suppressRouteHandling = false;

  // Latest desired destination while opening/closing. undefined = none; null = want closed.
  let pendingSlug = undefined;
  let pendingOpts = null;

  let dialog;
  let siteShell;
  let siteTransitionTarget;
  let readerEyebrow;
  let readerTitle;
  let readerDescription;
  let readerMeta;
  let readerBody;
  let nextLink;
  let nextTitle;
  let nextEyebrow;
  let closeButtons;
  let shareToast;
  let shareToastTimer = null;

  // ─── Mount ──────────────────────────────────────────────────────────────────

  /**
   * Single entry point: owns lookup, routing, history, share, render, and nav.
   * @param {Array<{ slug: string, title: string, document?: string }>} itemList
   *   Ordered list — canonical for next/previous.
   */
  function mount(itemList) {
    items = itemList;
    itemLookup = new Map(itemList.map((a) => [a.slug, a]));
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
    readerEyebrow    = dialog.querySelector('.reader-eyebrow');
    readerTitle      = dialog.querySelector('.reader-title');
    readerDescription = dialog.querySelector('.reader-description');
    readerMeta       = dialog.querySelector('.reader-meta');
    readerBody       = dialog.querySelector('.reader-body');
    nextLink         = dialog.querySelector('[data-reader-next]');
    nextTitle        = dialog.querySelector('.next-article-title');
    nextEyebrow      = dialog.querySelector('.next-article-eyebrow');
    closeButtons     = dialog.querySelectorAll('[data-reader-close]');

    const transitionTargets = siteShell.querySelectorAll('.page > :not(.hidden)');
    siteTransitionTarget = transitionTargets[transitionTargets.length - 1];

    if (!readerSurface || !readerTitle || !readerBody || !siteTransitionTarget || !nextLink || !nextTitle) {
      return false;
    }

    if (!sharedDialogBound) {
      sharedDialogBound = true;
      closeButtons.forEach((button) => {
        button.addEventListener('click', () => activeReader()?.close());
      });
      dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        activeReader()?.close();
      });
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) activeReader()?.close();
      });
      nextLink.addEventListener('click', (event) => {
        if (isModifiedClick(event)) return;
        event.preventDefault();
        activeReader()?.next();
      });
      window.addEventListener('popstate', () => readers.forEach((r) => r.handleRouteChange()));
      window.addEventListener('hashchange', () => readers.forEach((r) => r.handleRouteChange()));
    }

    mounted = true;
    return true;
  }

  function applyChrome() {
    const closeBtn = dialog.querySelector('.reader-close');
    if (closeBtn) {
      closeBtn.textContent = '';
      const arrow = document.createElement('span');
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '←';
      closeBtn.prepend(arrow);
      closeBtn.append(document.createTextNode(' ' + closeLabel));
    }
    const footerCloseBtn = dialog.querySelector('.reader-footer-close');
    if (footerCloseBtn) footerCloseBtn.textContent = footerClose;
    if (nextEyebrow) nextEyebrow.textContent = nextLabel;
    if (readerEyebrow) readerEyebrow.textContent = eyebrow;
  }

  function isBusy() {
    return state !== 'closed';
  }

  function checkInitialRoute() {
    const slug = slugFromHash(location.hash);
    if (!slug) return;

    if (itemLookup.has(slug)) {
      navigate(slug, { fromNavigation: true, replaceOnClose: true });
    } else {
      history.replaceState(null, '', location.pathname + location.search);
    }
  }

  // ─── Slug helpers ────────────────────────────────────────────────────────────

  function slugFromHash(hash) {
    const escapedPrefix = hashPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = hash.match(new RegExp(`^#${escapedPrefix}\\/(.+)$`));
    if (!match) return null;
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return null;
    }
  }

  function itemHash(slug) {
    return `#${hashPrefix}/${encodeURIComponent(slug)}`;
  }

  function nextSlug() {
    if (!items.length || !activeSlug) return null;
    const i = items.findIndex((a) => a.slug === activeSlug);
    if (i < 0) return null;
    return items[(i + 1) % items.length].slug;
  }

  function previousSlug() {
    if (!items.length || !activeSlug) return null;
    const i = items.findIndex((a) => a.slug === activeSlug);
    if (i < 0) return null;
    return items[(i - 1 + items.length) % items.length].slug;
  }

  // ─── History depth ───────────────────────────────────────────────────────────

  function pushArticle(slug) {
    articleDepth += 1;
    history.pushState({ article: slug, depth: articleDepth }, '', itemHash(slug));
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
    history.replaceState({ article: slug, depth: articleDepth }, '', itemHash(slug));
  }

  // ─── Navigate (single path for cards, Next, browser) ────────────────────────

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

    const item = itemLookup.get(slug);
    if (!item) return false;

    if (state === 'closed') {
      return openReader(item, trigger, { fromNavigation, replaceOnClose });
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
      renderItem(item);
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

    // Foreign hash prefix — yield the dialog so the matching reader can open.
    if (location.hash && location.hash !== '#') {
      if (state === 'open') closeUI();
      else if (state !== 'closed') {
        pendingSlug = null;
        pendingOpts = null;
      }
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
      // Mid-open UI close may leave a hash; unwind depth if needed.
      if (slugFromHash(location.hash)) return closeFromUI();
      return closeUI();
    }

    return navigate(slug, opts ?? { fromNavigation: true });
  }

  // ─── Open / close ────────────────────────────────────────────────────────────

  async function openReader(item, trigger, { fromNavigation, replaceOnClose }) {
    if (state !== 'closed') return false;

    await yieldBusyReaders();

    state = 'activating';
    activeSlug = item.slug;
    activeTrigger = trigger ?? document.activeElement;
    activeTrigger?.classList?.add('article-link-activating');

    if (!fromNavigation) {
      pushArticle(item.slug);
    } else {
      syncDepthFromHistory(item.slug, { replaceOnClose });
    }

    renderItem(item);
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

  // ─── Share ───────────────────────────────────────────────────────────────────

  async function share(slug) {
    const item = itemLookup.get(slug);
    if (!item) return false;

    const title = item.title || '';
    const url = `${location.origin}${location.pathname}${itemHash(slug)}`;

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

  // ─── Render ──────────────────────────────────────────────────────────────────

  function renderItem(item) {
    const content = item.document?.trim() || '';

    applyChrome();
    readerTitle.textContent = item.title || 'Untitled';
    readerMeta.textContent = getItemMeta(content);

    if (item.description) {
      readerDescription.textContent = item.description;
      readerDescription.classList.remove('hidden');
    } else {
      readerDescription.textContent = '';
      readerDescription.classList.add('hidden');
    }

    readerBody.innerHTML = content ||
      '<p class="reader-status">This project case study is currently being prepared.</p>';

    updateNextLink();
  }

  function updateNextLink() {
    const slug = nextSlug();
    if (!slug) return;
    const item = itemLookup.get(slug);
    nextLink.href = itemHash(slug);
    nextTitle.textContent = item?.title || 'Untitled';
    if (nextEyebrow) nextEyebrow.textContent = nextLabel;
  }

  function getItemMeta(content) {
    if (!content) return `Nick Rios · ${eyebrow.includes('Project') ? 'Case study in progress' : 'Essay in progress'}`;
    const wordCount = stripMarkup(content).split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 220));
    return `Nick Rios · ${readingTime} min read`;
  }

  function stripMarkup(content) {
    const template = document.createElement('template');
    template.innerHTML = content;
    return template.content.textContent || '';
  }

  // ─── Utilities ───────────────────────────────────────────────────────────────

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

  return Object.freeze({
    mount,
    navigate,
    next,
    previous,
    close: closeFromUI,
    share,
    handleRouteChange,
    isBusy,
    forceCloseUI: closeUI,
  });
}

function activeReader() {
  return readers.find((r) => r.isBusy()) ?? null;
}

async function yieldBusyReaders() {
  await Promise.all(
    readers
      .filter((r) => r.isBusy())
      .map((r) => r.forceCloseUI())
  );
}

// ─── Pre-built instances ──────────────────────────────────────────────────────

/** Blog / Writing reader (default config — backward-compatible) */
export const ArticleReader = createReader({
  hashPrefix:  'article',
  eyebrow:     'Nick Rios / Writing',
  closeLabel:  'Back to writing',
  nextLabel:   'Next Article',
  footerClose: 'Back to all articles',
});

/** Project-backed writing reader — retains existing `#project/<filename-slug>` URLs. */
export const ProjectReader = createReader({
  hashPrefix:  'project',
  eyebrow:     'Nick Rios / Writing',
  closeLabel:  'Back to writing',
  nextLabel:   'Next Article',
  footerClose: 'Back to all articles',
});

readers.push(ArticleReader, ProjectReader);

export { createReader };
