const VIEW_NAME_PATTERN = /^[a-z0-9][a-z0-9-_]*$/i;

function pageEntries(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new TypeError(
      'pageData must be an object keyed by view name.',
    );
  }

  return Object.entries(data);
}

function requireEntries(entries) {
  if (entries.length === 0) {
    throw new TypeError(
      'pageData requires at least one view.',
    );
  }
}

function requireViewName(view) {
  if (!VIEW_NAME_PATTERN.test(view)) {
    throw new TypeError(
      `Page view "${view}" contains invalid characters.`,
    );
  }
}

function requireViewObject(view, group) {
  if (!group || typeof group !== 'object' || Array.isArray(group)) {
    throw new TypeError(
      `Page view "${view}" must be an object.`,
    );
  }
}

function requireText(view, group, key) {
  const value = group[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new TypeError(
      `Page view "${view}" requires ${key}.`,
    );
  }
}

function requireScreenList(view, screens) {
  if (!Array.isArray(screens) || screens.length === 0) {
    throw new TypeError(
      `Page view "${view}" requires at least one screen.`,
    );
  }
}

function requireScreenObject(view, screen, index) {
  if (!screen || typeof screen !== 'object' || Array.isArray(screen)) {
    throw new TypeError(
      `Screen ${index} in page view "${view}" must be an object.`,
    );
  }
}

function requireScreenHtml(view, screen, index) {
  if (typeof screen.html !== 'string' || !screen.html.trim()) {
    throw new TypeError(
      `Screen ${index} in page view "${view}" requires html.`,
    );
  }
}

function requireView(view, group) {
  requireViewName(view);
  requireViewObject(view, group);
  requireText(view, group, 'backgroundColor');
  requireText(view, group, 'color');
  requireScreenList(view, group.screens);
  group.screens.forEach((screen, index) => {
    requireScreenObject(view, screen, index);
    requireScreenHtml(view, screen, index);
  });
}

export const validatePageData = data => {
  const entries = pageEntries(data);
  requireEntries(entries);

  for (const [view, group] of entries) {
    requireView(view, group);
  }
};
