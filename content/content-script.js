import { showOverlay, hideOverlay, ensureOverlay } from "./overlay-injector.js";
import { getSelectedText, inferContextualDetails } from "./text-extractor.js";

let isOverlayVisible = false;

async function openCommandBar(options = {}) {
  await ensureOverlay();
  await showOverlay(options.initialText || "");
  isOverlayVisible = true;

  const context = inferContextualDetails();
  const { setContext } = await import(browser.runtime.getURL("ui/command-bar.js"));
  if (typeof setContext === "function") {
    setContext({ ...context, selectedText: options.initialText || getSelectedText() });
  }
}

async function closeCommandBar() {
  if (!isOverlayVisible) {
    return;
  }
  await hideOverlay();
  isOverlayVisible = false;
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && isOverlayVisible) {
    closeCommandBar();
  }
});

browser.runtime.onMessage.addListener((message) => {
  if (!message || !message.type) {
    return;
  }

  switch (message.type) {
    case "taskme.open":
      openCommandBar(message.payload || {});
      break;
    case "taskme.hide":
      closeCommandBar();
      break;
    case "taskme.undo":
      // TODO: Display undo banner inside overlay if needed
      break;
    default:
      break;
  }
});

ensureOverlay();
