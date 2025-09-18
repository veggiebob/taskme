const SETTINGS_KEY = "taskme::settings";

const DEFAULT_SETTINGS = {
  defaultDuration: 60,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  confidenceThreshold: 0.7,
  googleClientId: "",
  llmProvider: "openai",
  openAiApiKey: "",
};

export async function loadSettings() {
  const stored = await browser.storage.local.get(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(stored[SETTINGS_KEY] || {}) };
}

export async function saveSettings(settings) {
  await browser.storage.local.set({ [SETTINGS_KEY]: settings });
}

export function onSettingsChange(callback) {
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes[SETTINGS_KEY]) {
      callback(changes[SETTINGS_KEY].newValue || DEFAULT_SETTINGS);
    }
  });
}

export default {
  loadSettings,
  saveSettings,
  onSettingsChange,
};
