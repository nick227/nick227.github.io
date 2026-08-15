const VIEW_NAME_PATTERN = /^[a-z0-9][a-z0-9-_]*$/i;

export const validatePageData = data => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new TypeError(
      'pageData must be an object keyed by view name.',
    );
  }

  const entries = Object.entries(data);

  if (entries.length === 0) {
    throw new TypeError(
      'pageData requires at least one view.',
    );
  }

  for (const [view, group] of entries) {
    if (!VIEW_NAME_PATTERN.test(view)) {
      throw new TypeError(
        `Page view "${view}" contains invalid characters.`,
      );
    }

    if (
      !group ||
      typeof group !== 'object' ||
      Array.isArray(group)
    ) {
      throw new TypeError(
        `Page view "${view}" must be an object.`,
      );
    }

    if (
      typeof group.backgroundColor !== 'string' ||
      !group.backgroundColor.trim()
    ) {
      throw new TypeError(
        `Page view "${view}" requires backgroundColor.`,
      );
    }

    if (
      typeof group.color !== 'string' ||
      !group.color.trim()
    ) {
      throw new TypeError(
        `Page view "${view}" requires color.`,
      );
    }

    if (
      !Array.isArray(group.screens) ||
      group.screens.length === 0
    ) {
      throw new TypeError(
        `Page view "${view}" requires at least one screen.`,
      );
    }

    group.screens.forEach((screen, index) => {
      if (
        !screen ||
        typeof screen !== 'object' ||
        Array.isArray(screen)
      ) {
        throw new TypeError(
          `Screen ${index} in page view "${view}" must be an object.`,
        );
      }

      if (
        typeof screen.html !== 'string' ||
        !screen.html.trim()
      ) {
        throw new TypeError(
          `Screen ${index} in page view "${view}" requires html.`,
        );
      }

      if (
        screen.timer !== undefined &&
        screen.timer !== null &&
        (
          !Number.isFinite(screen.timer) ||
          screen.timer < 0
        )
      ) {
        throw new TypeError(
          `Screen ${index} in page view "${view}" timer must be a non-negative number when provided.`,
        );
      }
    });
  }
};
