export class Navigation {
  #element;
  #onViewSelect;
  #abortController = null;

  constructor(element, onViewSelect) {
    this.#element = element;
    this.#onViewSelect = onViewSelect;
  }

  start() {
    if (this.#abortController) return;

    this.#abortController = new AbortController();

    this.#element.addEventListener('click', this.#handleClick, {
      signal: this.#abortController.signal,
    });
  }

  stop() {
    this.#abortController?.abort();
    this.#abortController = null;
  }

  #handleClick = event => {
    if (!(event.target instanceof Element)) return;

    const trigger = event.target.closest('[data-view]');

    if (!trigger || !this.#element.contains(trigger)) return;

    const view = trigger.dataset.view;

    if (view) {
      this.#onViewSelect(view);
    }
  };
}
