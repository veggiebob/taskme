let shadowRootRef = null;
let hideOverlay = () => {};
let showOverlay = () => {};
let inputEl = null;
let previewEl = null;
let statusEl = null;
let lastParseResult = null;
let contextDetails = {};
let debounceHandle = null;

function renderEmptyPreview() {
  if (!previewEl) {
    return;
  }
  previewEl.classList.add("empty");
  previewEl.innerHTML = "Start typing to see the event preview.";
  lastParseResult = null;
}

function renderPreview(result) {
  if (!previewEl) {
    return;
  }

  if (!result?.parsed) {
    renderEmptyPreview();
    return;
  }

  const { parsed, usedLLM } = result;
  const confidence = typeof parsed.confidence === "number" ? parsed.confidence : 0.5;
  const details = [
    `<strong>Title:</strong> ${parsed.title || "Untitled event"}`,
    `<strong>Start:</strong> ${parsed.start_date} ${parsed.start_time || ""}`,
    `<strong>Duration:</strong> ${(parsed.duration_minutes || 60)} minutes`,
  ];
  if (parsed.location) {
    details.push(`<strong>Location:</strong> ${parsed.location}`);
  }
  if (parsed.recurrence?.frequency) {
    details.push(`<strong>Recurrence:</strong> ${parsed.recurrence.frequency}`);
  }
  if (parsed.description) {
    details.push(`<strong>Description:</strong> ${parsed.description}`);
  }

  previewEl.classList.remove("empty");
  previewEl.innerHTML = `
    <ul>
      ${details.map((line) => `<li>${line}</li>`).join("")}
    </ul>
    <div class="taskme-preview-footnote">Confidence ${(confidence * 100).toFixed(0)}%${
      usedLLM ? " • LLM" : " • Local"
    }</div>
  `;
}

function setStatus(type, message) {
  if (!statusEl) {
    return;
  }
  statusEl.textContent = message || "";
  statusEl.className = `taskme-status${type ? ` ${type}` : ""}`;
}

async function requestPreview(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    renderEmptyPreview();
    setStatus(null, "");
    return;
  }

  setStatus(null, "Parsing...");
  try {
    const result = await browser.runtime.sendMessage({
      type: "taskme.parse",
      payload: {
        text: trimmed,
        referenceDate: new Date().toISOString(),
      },
    });
    lastParseResult = result;
    renderPreview(result);
    setStatus("success", "Preview ready");
  } catch (error) {
    console.error("TaskMe: preview failed", error);
    setStatus("error", "Unable to parse input");
  }
}

function schedulePreview(value) {
  if (debounceHandle) {
    clearTimeout(debounceHandle);
  }
  debounceHandle = setTimeout(() => {
    requestPreview(value);
  }, 250);
}

async function handleCreate() {
  if (!lastParseResult) {
    await requestPreview(inputEl.value);
    if (!lastParseResult) {
      return;
    }
  }

  setStatus(null, "Creating event...");
  try {
    const response = await browser.runtime.sendMessage({
      type: "taskme.createEvent",
      payload: {
        event: lastParseResult.payload,
        metadata: {
          context: contextDetails,
          createdFrom: "command-bar",
        },
      },
    });
    setStatus("success", "Event saved locally");
    hideOverlay();
    setTimeout(() => {
      clearInput();
      renderEmptyPreview();
      setStatus(null, "");
    }, 500);
    return response;
  } catch (error) {
    console.error("TaskMe: create failed", error);
    setStatus("error", "Unable to create event");
    return null;
  }
}

async function handleUndo() {
  try {
    const undone = await browser.runtime.sendMessage({ type: "taskme.undo" });
    if (undone) {
      setStatus("success", "Last event undone");
    } else {
      setStatus("error", "Nothing to undo");
    }
  } catch (error) {
    console.error("TaskMe: undo failed", error);
    setStatus("error", "Unable to undo");
  }
}

export async function bootstrapCommandBar(options) {
  shadowRootRef = options.shadowRoot;
  hideOverlay = options.hide;
  showOverlay = options.show;

  inputEl = shadowRootRef.getElementById("taskme-input");
  previewEl = shadowRootRef.getElementById("taskme-preview");
  statusEl = shadowRootRef.getElementById("taskme-status");

  renderEmptyPreview();

  shadowRootRef.getElementById("taskme-close").addEventListener("click", () => hideOverlay());
  shadowRootRef.getElementById("taskme-create").addEventListener("click", handleCreate);
  shadowRootRef.getElementById("taskme-undo").addEventListener("click", handleUndo);

  inputEl.addEventListener("input", (event) => {
    schedulePreview(event.target.value);
  });

  inputEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      handleCreate();
    }
  });
}

export function setInitialValue(value) {
  if (!inputEl) {
    return;
  }
  inputEl.value = value;
  schedulePreview(value);
}

export function focusInput() {
  inputEl?.focus({ preventScroll: true });
}

export function clearInput() {
  if (!inputEl) {
    return;
  }
  inputEl.value = "";
  lastParseResult = null;
}

export function setContext(context = {}) {
  contextDetails = context;
}

export default {
  bootstrapCommandBar,
  setInitialValue,
  focusInput,
  clearInput,
  setContext,
};
