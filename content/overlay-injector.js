let overlayContainer = null;
let overlayShadow = null;
let commandModule = null;

async function loadTemplate() {
  const response = await fetch(browser.runtime.getURL("ui/command-bar.html"));
  return response.text();
}

async function ensureModule() {
  if (!commandModule) {
    commandModule = await import(browser.runtime.getURL("ui/command-bar.js"));
  }
  return commandModule;
}

export async function ensureOverlay() {
  if (overlayContainer && overlayShadow) {
    return { overlayContainer, overlayShadow };
  }

  const template = await loadTemplate();
  overlayContainer = document.createElement("div");
  overlayContainer.className = "taskme-overlay-container taskme-hidden";

  overlayShadow = overlayContainer.attachShadow({ mode: "open" });
  overlayShadow.innerHTML = template;

  document.documentElement.appendChild(overlayContainer);
  overlayContainer.addEventListener("click", (event) => {
    if (event.target === overlayContainer) {
      hideOverlay();
    }
  });

  const { bootstrapCommandBar } = await ensureModule();
  await bootstrapCommandBar({
    shadowRoot: overlayShadow,
    hide: () => overlayContainer.classList.add("taskme-hidden"),
    show: () => overlayContainer.classList.remove("taskme-hidden"),
  });

  return { overlayContainer, overlayShadow };
}

export async function showOverlay(initialText) {
  const { overlayContainer } = await ensureOverlay();
  overlayContainer.classList.remove("taskme-hidden");
  const { focusInput, setInitialValue } = await ensureModule();
  if (typeof setInitialValue === "function" && initialText) {
    setInitialValue(initialText);
  }
  if (typeof focusInput === "function") {
    focusInput();
  }
}

export async function hideOverlay() {
  if (!overlayContainer) {
    return;
  }
  overlayContainer.classList.add("taskme-hidden");
  const { clearInput } = await ensureModule();
  if (typeof clearInput === "function") {
    clearInput();
  }
}

export default {
  ensureOverlay,
  showOverlay,
  hideOverlay,
};
