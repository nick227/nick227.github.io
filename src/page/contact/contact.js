import { contactEndpoint, contactIntents, contactLinks } from './data.js';

const MOTION_MS = 280;

const faceImageNames = [
  'faces/1.jpg',
  'faces/2.jpg',
  'faces/3.jpg',
  'faces/4.png',
  'faces/5.png',
  'faces/6.png',
  'faces/7.png',
  'faces/8.png',
  'faces/9.png',
  'faces/10.png',
  'faces/11.png',
  'faces/12.png',
];

function iterateFacialExpressions(duration){
  // randomly jump arouhnd faceImageNames array
  setInterval(() => {
    const randomImage = faceImageNames[Math.floor(Math.random() * faceImageNames.length)];
    const imgElement = document.querySelector('.contact-portrait');
    imgElement.src = randomImage;
  }, duration);

}

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
    <div class="screen contact-split">
        <div class="contact-links">${contactLinks.map(linkMarkup).join('')}</div>
    </div>
  `;
}

function resultMessage(result) {
  if (!result || typeof result.message !== 'string') return '';
  return result.message;
}

function failureMessage(result) {
  const message = resultMessage(result);
  if (message.toLowerCase().includes('activation')) {
    return 'Check nicholas.jay.rios@gmail.com for the FormSubmit activation email, open it, then send again.';
  }
  if (!message) return "Didn't send. Try again.";
  return message;
}

function shouldReplaceMessage(value, previous) {
  return value === '' || value === previous;
}

function feedbackStatus(root) {
  const view = root.querySelector('.contact-feedback');
  if (!view) return null;

  const status = view.querySelector('.contact-status');
  if (!status) return null;

  return { view, status };
}

async function postContact(formData) {
  const name = fieldValue(formData, 'name');
  const topic = fieldValue(formData, 'topic');
  const message = fieldValue(formData, 'message');
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
  const failed = sendFailed(response, result);
  return { text: failed ? failureMessage(result) : 'Sent', failed };
}

function sendFailed(response, result) {
  if (!response.ok) return true;
  return result.success === 'false' || result.success === false;
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
  #generation = 0;
  #currentFaceIndex = 0;

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

    if (shouldReplaceMessage(message.value, previous)) {
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
    const generation = this.#generation;
    this.#showFeedback();

    if (fieldValue(formData, '_honey')) {
      this.#setStatus(generation, 'Sent', false);
      return;
    }

    await this.#send(formData, generation);
  };

  async #send(formData, generation) {
    try {
      const result = await postContact(formData);
      this.#setStatus(generation, result.text, result.failed);
    } catch {
      this.#setStatus(generation, "Didn't send. Try again.", true);
    }
  };

  #showFeedback() {
    const view = document.createElement('div');
    view.className = 'contact-form contact-feedback';
    view.setAttribute('role', 'status');
    view.setAttribute('aria-busy', 'true');

    const heading = document.createElement('h2');
    heading.className = 'contact-heading';
    heading.textContent = 'Message sent';

    const copy = document.createElement('div');
    copy.className = 'contact-copy';
    ['You message has been sent. Thanks for reaching out! I look forward to speaking with you soon.'].forEach(line => {
      const paragraph = document.createElement('p');
      paragraph.textContent = line;
      copy.append(paragraph);
    });

    const progress = document.createElement('div');
    progress.className = 'contact-progress';

    const status = document.createElement('p');
    status.className = 'contact-status is-pending';
    const spinner = document.createElement('span');
    spinner.className = 'contact-spinner';
    spinner.setAttribute('aria-hidden', 'true');
    status.append(spinner);

    const again = document.createElement('button');
    again.className = 'contact-again';
    again.type = 'button';
    again.textContent = 'Send another';
    again.addEventListener('click', this.#again);

    progress.append(status, again);
    view.append(heading, copy, progress);
    this.#element.querySelector('.contact-form').replaceWith(view);
  }

  #setStatus(generation, text, failed) {
    if (generation !== this.#generation) return;

    const feedback = feedbackStatus(this.#element);
    if (!feedback) return;

    feedback.view.setAttribute('aria-busy', 'false');
    feedback.status.classList.remove('is-pending');
    feedback.status.classList.toggle('is-error', failed);
    feedback.status.textContent = text;
    feedback.view.querySelector('.contact-copy').hidden = failed;
    if (failed) feedback.view.querySelector('.contact-heading').textContent = 'Not sent';
  }

  #again = () => {
    this.#generation += 1;
    this.mount();
  };
}


    iterateFacialExpressions(2000);