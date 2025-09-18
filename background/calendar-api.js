import { loadSettings } from "../lib/settings.js";

const EVENT_STORAGE_KEY = "taskme::created-events";
const UNDO_QUEUE_KEY = "taskme::undo-queue";

async function getStoredEvents() {
  const stored = await browser.storage.local.get({ [EVENT_STORAGE_KEY]: [] });
  return stored[EVENT_STORAGE_KEY];
}

async function setStoredEvents(events) {
  await browser.storage.local.set({ [EVENT_STORAGE_KEY]: events });
}

async function getUndoQueue() {
  const stored = await browser.storage.local.get({ [UNDO_QUEUE_KEY]: [] });
  return stored[UNDO_QUEUE_KEY];
}

async function setUndoQueue(queue) {
  await browser.storage.local.set({ [UNDO_QUEUE_KEY]: queue });
}

export async function createCalendarEvent(eventPayload, metadata = {}) {
  const settings = await loadSettings();
  const events = await getStoredEvents();
  const id = `local-${Date.now()}`;
  const event = {
    id,
    createdAt: Date.now(),
    payload: eventPayload,
    metadata,
    status: "pending",
  };
  events.push(event);
  await setStoredEvents(events);

  const undoQueue = await getUndoQueue();
  undoQueue.unshift(event);
  await setUndoQueue(undoQueue.slice(0, 10));

  return {
    id,
    status: event.status,
    storedLocally: true,
    settingsSnapshot: settings,
  };
}

export async function undoLastEvent() {
  const queue = await getUndoQueue();
  const [last] = queue;
  if (!last) {
    return null;
  }

  const remaining = queue.slice(1);
  await setUndoQueue(remaining);

  const events = await getStoredEvents();
  const filtered = events.filter((event) => event.id !== last.id);
  await setStoredEvents(filtered);

  return last;
}

export async function listRecentEvents(limit = 10) {
  const events = await getStoredEvents();
  return events.slice(-limit).reverse();
}

export async function getLastEvent() {
  const events = await listRecentEvents(1);
  return events.length ? events[0] : null;
}

export default {
  createCalendarEvent,
  undoLastEvent,
  listRecentEvents,
  getLastEvent,
};
