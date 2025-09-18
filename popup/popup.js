async function fetchRecentEvents() {
  try {
    const events = await browser.runtime.sendMessage({
      type: "taskme.listRecent",
      payload: { limit: 5 },
    });
    return events || [];
  } catch (error) {
    console.error("TaskMe: unable to fetch events", error);
    return [];
  }
}

function renderEvents(container, events) {
  container.textContent = "";
  if (!events.length) {
    const empty = document.createElement("li");
    empty.textContent = "No events created yet.";
    container.appendChild(empty);
    return;
  }

  for (const event of events) {
    const item = document.createElement("li");
    const title = document.createElement("div");
    title.className = "title";
    title.textContent = event.payload?.summary || "Untitled event";

    const meta = document.createElement("div");
    meta.className = "meta";
    if (event.payload?.start?.dateTime) {
      const start = new Date(event.payload.start.dateTime);
      meta.textContent = `${start.toLocaleDateString()} • ${start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      meta.textContent = "Saved locally";
    }

    item.appendChild(title);
    item.appendChild(meta);
    container.appendChild(item);
  }
}

async function openCommandBar() {
  await browser.runtime.sendMessage({ type: "taskme.open" });
  window.close();
}

async function init() {
  const openButton = document.getElementById("open-command");
  const listContainer = document.getElementById("recent-events");

  openButton.addEventListener("click", openCommandBar);

  const events = await fetchRecentEvents();
  renderEvents(listContainer, events);
}

init();
