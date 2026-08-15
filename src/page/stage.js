const EXIT_ANIMATION_FALLBACK_MS = 750;

export class Stage {
  #container;
  #abortController = null;

  constructor(container) {
    this.#container = container;
  }

  async play(screens) {
    this.clear();

    this.#abortController = new AbortController();
    const { signal } = this.#abortController;

    try {
      for (const screen of screens) {
        if (signal.aborted) return;

        const screenElement = this.#renderScreen(screen.html);

        // No timer means this screen remains until the stage is cleared
        // or another sequence begins.
        if (screen.timer == null) return;

        await this.#wait(screen.timer, signal);

        if (signal.aborted) return;

        await this.#exitScreen(screenElement, signal);

        if (signal.aborted) return;

        screenElement.remove();
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        throw error;
      }
    }
  }

  clear() {
    this.#abortController?.abort();
    this.#abortController = null;
    this.#container.replaceChildren();
  }

  #renderScreen(html) {
    const element = document.createElement('div');

    element.className = 'stage-item';

    // Trusted boundary:
    // pageData is locally authored application content.
    element.innerHTML = html;

    this.#container.appendChild(element);

    return element;
  }

  #exitScreen(element, signal) {
    return new Promise(resolve => {
      if (signal.aborted) {
        resolve();
        return;
      }

      element.classList.add('stage-item-out');

      if (
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        resolve();
        return;
      }

      let timerId = null;

      const cleanup = () => {
        element.removeEventListener('animationend', onEnd);
        element.removeEventListener('animationcancel', onEnd);
        signal.removeEventListener('abort', onAbort);

        if (timerId !== null) {
          clearTimeout(timerId);
        }
      };

      const finish = () => {
        cleanup();
        resolve();
      };

      const onEnd = event => {
        // Ignore bubbled animation events from child elements.
        if (event.target !== element) return;

        finish();
      };

      const onAbort = () => {
        finish();
      };

      timerId = setTimeout(
        finish,
        EXIT_ANIMATION_FALLBACK_MS,
      );

      element.addEventListener('animationend', onEnd);
      element.addEventListener('animationcancel', onEnd);
      signal.addEventListener('abort', onAbort, { once: true });
    });
  }

  #wait(ms, signal) {
    return new Promise((resolve, reject) => {
      let timerId = null;

      const cleanup = () => {
        signal.removeEventListener('abort', onAbort);

        if (timerId !== null) {
          clearTimeout(timerId);
        }
      };

      const onAbort = () => {
        cleanup();
        reject(
          new DOMException(
            'Sequence aborted',
            'AbortError',
          ),
        );
      };

      timerId = setTimeout(() => {
        cleanup();
        resolve();
      }, ms);

      signal.addEventListener('abort', onAbort, { once: true });
    });
  }
}
