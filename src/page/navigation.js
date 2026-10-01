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

  #handleClick = event => {
    const view = selectedView(event, this.#element);
    if (view) this.#onViewSelect(view);
  };
}

function selectedView(event, root) {
  if (!(event.target instanceof Element)) return '';

  const trigger = event.target.closest('[data-view]');
  if (!trigger || !root.contains(trigger)) return '';

  return trigger.dataset.view;
}
