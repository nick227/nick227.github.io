const STEP = 5;

/** Reveals list children five at a time until every item is visible. */
export function attachShowMore(list) {
  const items = [...list.children];
  if (items.length <= STEP) return;

  let shown = STEP;
  const control = document.createElement('button');
  control.type = 'button';
  control.className = 'link show-more';
  control.textContent = 'Show more';

  const paint = () => {
    items.forEach((item, index) => {
      item.classList.toggle('hidden', index >= shown);
    });
    control.classList.toggle('hidden', shown >= items.length);
  };

  control.addEventListener('click', () => {
    shown = Math.min(shown + STEP, items.length);
    paint();
  });

  list.insertAdjacentElement('afterend', control);
  paint();
}
