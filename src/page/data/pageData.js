/*
  pageData.js
  Object of page identifiers containing:
  - backgroundColor: The background color for the page view.
  - color: The text color for the page view.
  - screens: An array of screen objects, each containing:
    - html: The HTML content for the screen
*/

import { architecture } from "../content/architecture.js";
import { home } from "../content/home.js";
import { aiAutomation } from "../content/aiAutomation.js";
import { webPlatforms } from "../content/webPlatforms.js";
import { pipelineSystems } from "../content/pipelineSystems.js";
import { creativeDesign } from "../content/creativeDesign.js";
import { leadership } from "../content/leadership.js";

export const pageData = {
  home: home,
  
  architecture: architecture,

  'ai-automation': aiAutomation,

  'web-platforms': webPlatforms,

  'pipeline-systems': pipelineSystems,

  'creative-design': creativeDesign,

  leadership: leadership,
};
