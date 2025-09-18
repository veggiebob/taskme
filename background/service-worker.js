import { parseNaturalLanguage } from "./nlp-processor.js";
import { createCalendarEvent, undoLastEvent, listRecentEvents } from "./calendar-api.js";
import { loadSettings, saveSettings, onSettingsChange } from "../lib/settings.js";
import { applySettings } from "../lib/oauth-client.js";

let cachedSettings = null;

async function ensureSettings() {
  if (!cachedSettings) {
    cachedSettings = await loadSettings();
    applySettings(cachedSettings);
  }
  return cachedSettings;
}

onSettingsChange((settings) => {
  cachedSettings = settings;
  applySettings(settings);
});

async function sendMessageToActiveTab(message) {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  if (tabs.length === 0) {
    return;
  }
  const tabId = tabs[0].id;
  if (typeof tabId !== "number") {
    return;
  }
  try {
    await browser.tabs.sendMessage(tabId, message);
  } catch (error) {
    console.warn("TaskMe: failed to reach content script", error);
  }
}

async function handleCommand(command) {
  if (command === "open-command-bar") {
    await sendMessageToActiveTab({ type: "taskme.open" });
  }
  if (command === "undo-last-event") {
    const undone = await undoLastEvent();
    if (undone) {
      await sendMessageToActiveTab({ type: "taskme.undo", payload: undone });
    }
  }
}

browser.commands.onCommand.addListener(handleCommand);

browser.runtime.onInstalled.addListener(async () => {
  await ensureSettings();
  browser.contextMenus.create({
    id: "taskme-add-to-calendar",
    title: "Add to TaskMe Calendar",
    contexts: ["selection"],
  });
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "taskme-add-to-calendar" && info.selectionText) {
    await sendMessageToActiveTab({
      type: "taskme.open",
      payload: { initialText: info.selectionText },
    });
  }
});

browser.runtime.onMessage.addListener((message, sender) => {
  if (!message || !message.type) {
    return undefined;
  }

  switch (message.type) {
    case "taskme.ensureSettings":
      return ensureSettings();
    case "taskme.parse":
      return (async () => {
        await ensureSettings();
        return parseNaturalLanguage(message.payload.text, { referenceDate: message.payload.referenceDate });
      })();
    case "taskme.createEvent":
      return createCalendarEvent(message.payload.event, message.payload.metadata);
    case "taskme.undo":
      return undoLastEvent();
    case "taskme.listRecent":
      return listRecentEvents(message.payload?.limit || 10);
    case "taskme.saveSettings":
      return (async () => {
        await saveSettings(message.payload);
        return ensureSettings();
      })();
    case "taskme.open":
      return sendMessageToActiveTab({ type: "taskme.open", payload: message.payload });
    default:
      return undefined;
  }
});

ensureSettings();
