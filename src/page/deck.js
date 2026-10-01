function motion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth';
}

export function mountDeck(deck) {
  const widgets = [...deck.querySelectorAll(':scope > .widget')];
  const dots = [...deck.querySelectorAll('.deck-dots button')];
  const prev = deck.querySelector('.deck-arrow-prev');
  const next = deck.querySelector('.deck-arrow-next');
  let index = 0;

  const mark = () => {
    dots.forEach((dot, dotIndex) => {
      dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
    });
    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === widgets.length - 1;
  };

  const show = (nextIndex) => {
    index = Math.max(0, Math.min(widgets.length - 1, nextIndex));
    widgets[index].scrollIntoView({
      inline: 'start',
      block: 'nearest',
      behavior: motion(),
    });
    mark();
  };

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => show(dotIndex));
  });
  prev?.addEventListener('click', () => show(index - 1));
  next?.addEventListener('click', () => show(index + 1));

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;

    const nextIndex = widgets.indexOf(visible.target);
    if (nextIndex < 0 || nextIndex === index) return;

    index = nextIndex;
    mark();
  }, { root: deck, threshold: 0.6 });

  widgets.forEach(widget => observer.observe(widget));
  deck.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    show(index + (event.key === 'ArrowRight' ? 1 : -1));
  });
  mark();

  return {
    show,
    disconnect() {
      observer.disconnect();
    },
  };
}
