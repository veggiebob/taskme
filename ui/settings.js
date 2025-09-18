const form = document.getElementById("settings-form");
const statusEl = document.getElementById("status");
const providerSelect = document.getElementById("llmProvider");

function setStatus(type, message) {
  statusEl.textContent = message;
  statusEl.className = type ? type : "";
}

function applyProviderVisibility(provider) {
  const providerFields = document.querySelectorAll("[data-provider]");
  providerFields.forEach((field) => {
    const targetProvider = field.getAttribute("data-provider");
    field.style.display = targetProvider === provider ? "flex" : "none";
  });
}

async function loadSettingsFromBackground() {
  try {
    const settings = await browser.runtime.sendMessage({ type: "taskme.ensureSettings" });
    form.defaultDuration.value = settings.defaultDuration;
    form.timezone.value = settings.timezone;
    form.confidenceThreshold.value = settings.confidenceThreshold;
    form.googleClientId.value = settings.googleClientId;
    form.llmProvider.value = settings.llmProvider;
    form.openAiApiKey.value = settings.openAiApiKey;
    applyProviderVisibility(settings.llmProvider);
  } catch (error) {
    console.error("TaskMe: unable to load settings", error);
    setStatus("error", "Unable to load settings");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    defaultDuration: Number(form.defaultDuration.value) || 60,
    timezone: form.timezone.value || Intl.DateTimeFormat().resolvedOptions().timeZone,
    confidenceThreshold: Number(form.confidenceThreshold.value) || 0.7,
    googleClientId: form.googleClientId.value.trim(),
    llmProvider: form.llmProvider.value,
    openAiApiKey: form.openAiApiKey.value.trim(),
  };

  setStatus(null, "Saving...");
  try {
    await browser.runtime.sendMessage({
      type: "taskme.saveSettings",
      payload,
    });
    setStatus("success", "Settings saved");
  } catch (error) {
    console.error("TaskMe: unable to save settings", error);
    setStatus("error", "Unable to save settings");
  }
});

providerSelect.addEventListener("change", (event) => {
  applyProviderVisibility(event.target.value);
});

loadSettingsFromBackground();
