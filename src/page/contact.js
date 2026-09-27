import { contactEndpoint, contactIntents, contactLinks } from './content/contact.js';

const MOTION_MS = 280;

function linkMarkup(link) {
  const external = link.href.startsWith('http');
  const attrs = [
    `href="${link.href}"`,
    external ? 'target="_blank" rel="noopener"' : '',
    link.download ? 'download' : '',
  ].filter(Boolean).join(' ');

  return `<a ${attrs}>${link.label}</a>`;
}

function sectionMarkup() {
  const intents = contactIntents.map(intent => `
    <button class="contact-intent" type="button" data-intent="${intent.id}" aria-pressed="false">${intent.label}</button>
  `).join('');

  return `
    <div class="contact-panel">
      <h2 class="contact-heading">Contact</h2>
      <form class="contact-form" method="POST" action="${contactEndpoint}">
        <input class="contact-honey" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">
        <input type="hidden" name="topic" value="">
        <div class="contact-intents">${intents}</div>
        <div class="contact-fields" hidden>
          <label class="contact-field">
            Name
            <input name="name" autocomplete="name" required>
          </label>
          <label class="contact-field">
            Message
            <textarea name="message" required></textarea>
          </label>
          <p class="contact-error" role="alert" hidden></p>
          <div class="contact-actions">
            <button class="contact-change" type="button">Change</button>
            <button class="contact-send" type="submit">Send</button>
          </div>
        </div>
      </form>
      <div class="contact-links">${contactLinks.map(linkMarkup).join('')}</div>
    </div>
  `;
}

function fieldValue(formData, name) {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export class Contact {
  #element;
  #timer = 0;

  constructor(element) {
    this.#element = element;
  }

  mount() {
    this.#element.innerHTML = sectionMarkup();
    this.#element.querySelector('.contact-form').addEventListener('submit', this.#submit);
    this.#element.querySelector('.contact-intents').addEventListener('click', this.#choose);
    this.#element.querySelector('.contact-change').addEventListener('click', this.#reset);
  }

  #choose = event => {
    const button = event.target.closest('.contact-intent');
    if (!button || !this.#element.contains(button)) return;

    const intent = contactIntents.find(item => item.id === button.dataset.intent);
    this.#open(intent, button);
  };

  #open(intent, button) {
    window.clearTimeout(this.#timer);

    const panel = this.#element.querySelector('.contact-panel');
    const message = panel.querySelector('[name=message]');
    const previous = panel.dataset.prompt ?? '';

    if (message.value === '' || message.value === previous) {
      message.value = intent.prompt;
    }

    panel.dataset.prompt = intent.prompt;
    panel.querySelector('[name=topic]').value = intent.label;
    panel.querySelectorAll('.contact-intent').forEach(item => {
      const selected = item === button;
      item.classList.toggle('is-selected', selected);
      item.classList.toggle('is-leaving', !selected);
      item.setAttribute('aria-pressed', String(selected));
    });

    const finish = () => {
      panel.classList.add('is-open');
      const fields = panel.querySelector('.contact-fields');
      fields.hidden = false;
      requestAnimationFrame(() => fields.classList.add('is-shown'));
      panel.querySelector('[name=name]').focus();
    };

    if (prefersReducedMotion()) {
      finish();
      return;
    }

    this.#timer = window.setTimeout(finish, MOTION_MS);
  }

  #reset = () => {
    window.clearTimeout(this.#timer);

    const panel = this.#element.querySelector('.contact-panel');
    const fields = panel.querySelector('.contact-fields');
    fields.classList.remove('is-shown');

    const finish = () => {
      fields.hidden = true;
      panel.classList.remove('is-open');
      panel.querySelectorAll('.contact-intent').forEach(item => {
        item.classList.remove('is-selected', 'is-leaving');
        item.setAttribute('aria-pressed', 'false');
      });
    };

    if (prefersReducedMotion()) {
      finish();
      return;
    }

    this.#timer = window.setTimeout(finish, MOTION_MS);
  };

  #submit = async event => {
    event.preventDefault();

    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement) || !form.reportValidity()) return;

    const formData = new FormData(form);
    const name = fieldValue(formData, 'name');
    const topic = fieldValue(formData, 'topic');
    const message = fieldValue(formData, 'message');

    if (fieldValue(formData, '_honey')) {
      this.#showSuccess(name);
      return;
    }

    const error = form.querySelector('.contact-error');
    const button = form.querySelector('.contact-send');
    error.hidden = true;
    error.textContent = '';
    button.disabled = true;

    try {
      const response = await fetch(contactEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name,
          topic,
          message,
          _subject: `${name} — ${topic}`,
          _template: 'box',
          _captcha: 'false',
          _honey: '',
        }),
      });
      const result = await response.json();

      if (!response.ok || result.success === 'false' || result.success === false) {
        throw new Error('FormSubmit rejected the message');
      }

      this.#showSuccess(name);
    } catch {
      button.disabled = false;
      error.hidden = false;
      error.textContent = "Didn't send. Try again.";
    }
  };

  #showSuccess(name) {
    const note = document.createElement('p');
    note.className = 'contact-success';
    note.textContent = `Got it, ${name}.`;
    this.#element.querySelector('.contact-form').replaceWith(note);
  }
}
