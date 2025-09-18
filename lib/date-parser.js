const WEEKDAYS = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const DEFAULT_DURATION_MINUTES = 60;

function toUTCString(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function resolveReferenceDate(referenceDate) {
  return referenceDate ? new Date(referenceDate) : new Date();
}

function normalize(text) {
  return text.toLowerCase();
}

function parseExplicitDate(text, reference) {
  const isoMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [_, year, month, day] = isoMatch;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), reference.getUTCHours(), reference.getUTCMinutes()));
  }

  const monthRegex = new RegExp(`\\b(${MONTHS.join("|")})\\s+(\\d{1,2})(?:,?\\s*(\\d{4}))?`);
  const monthMatch = text.match(monthRegex);
  if (monthMatch) {
    const month = MONTHS.indexOf(monthMatch[1].toLowerCase());
    const day = Number(monthMatch[2]);
    const year = monthMatch[3] ? Number(monthMatch[3]) : reference.getFullYear();
    const date = new Date(year, month, day, reference.getHours(), reference.getMinutes());
    return date;
  }

  return null;
}

function parseRelativeDate(text, reference) {
  const normalized = normalize(text);

  if (/\btoday\b/.test(normalized)) {
    return new Date(reference.getFullYear(), reference.getMonth(), reference.getDate(), reference.getHours(), reference.getMinutes());
  }

  if (/\btomorrow\b/.test(normalized)) {
    const tomorrow = new Date(reference);
    tomorrow.setDate(reference.getDate() + 1);
    return new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), reference.getHours(), reference.getMinutes());
  }

  const nextMatch = normalized.match(/next\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/);
  if (nextMatch) {
    const weekdayIndex = WEEKDAYS[nextMatch[1]];
    const result = new Date(reference);
    const currentDay = reference.getDay();
    let offset = weekdayIndex - currentDay;
    if (offset <= 0) {
      offset += 7;
    }
    result.setDate(reference.getDate() + offset);
    return new Date(result.getFullYear(), result.getMonth(), result.getDate(), reference.getHours(), reference.getMinutes());
  }

  const weekdayMatch = normalized.match(/\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/);
  if (weekdayMatch) {
    const weekdayIndex = WEEKDAYS[weekdayMatch[1]];
    const result = new Date(reference);
    const currentDay = reference.getDay();
    let offset = weekdayIndex - currentDay;
    if (offset < 0) {
      offset += 7;
    }
    if (offset === 0) {
      // If the day is the same and no "next" keyword, we treat it as the same day
      return new Date(result.getFullYear(), result.getMonth(), result.getDate(), reference.getHours(), reference.getMinutes());
    }
    result.setDate(reference.getDate() + offset);
    return new Date(result.getFullYear(), result.getMonth(), result.getDate(), reference.getHours(), reference.getMinutes());
  }

  return null;
}

function parseTime(text, reference) {
  const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!timeMatch) {
    return {
      hours: reference.getHours(),
      minutes: reference.getMinutes(),
      hasExplicitTime: false,
    };
  }

  let hours = Number(timeMatch[1]);
  const minutes = timeMatch[2] ? Number(timeMatch[2]) : 0;
  const period = timeMatch[3] ? timeMatch[3].toLowerCase() : null;

  if (period === "pm" && hours < 12) {
    hours += 12;
  }

  if (period === "am" && hours === 12) {
    hours = 0;
  }

  if (!period && hours <= 12 && /\b(?:evening|tonight|pm)\b/.test(normalize(text))) {
    if (hours < 12) {
      hours += 12;
    }
  }

  return { hours, minutes, hasExplicitTime: true };
}

function parseDuration(text) {
  const durationMatch = text.match(/for\s+(\d{1,3})\s*(minutes?|hours?)/i);
  if (!durationMatch) {
    return DEFAULT_DURATION_MINUTES;
  }

  const value = Number(durationMatch[1]);
  const unit = durationMatch[2].toLowerCase();
  if (unit.startsWith("hour")) {
    return value * 60;
  }
  return value;
}

export function parseDateTime(text, options = {}) {
  const reference = resolveReferenceDate(options.referenceDate);
  const timezone = options.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const explicitDate = parseExplicitDate(text, reference);
  const relativeDate = parseRelativeDate(text, reference);
  const baseDate = explicitDate || relativeDate || reference;

  const timeResult = parseTime(text, reference);
  const durationMinutes = parseDuration(text);

  const start = new Date(baseDate);
  start.setHours(timeResult.hours, timeResult.minutes, 0, 0);

  const end = new Date(start);
  end.setMinutes(start.getMinutes() + durationMinutes);

  return {
    start,
    end,
    timezone,
    confidence: explicitDate || relativeDate || timeResult.hasExplicitTime ? 0.8 : 0.5,
  };
}

export function formatAsCalendarEvent(parsed) {
  return {
    start: {
      dateTime: parsed.start.toISOString(),
      timeZone: parsed.timezone,
    },
    end: {
      dateTime: parsed.end.toISOString(),
      timeZone: parsed.timezone,
    },
  };
}

export function computeRecurrence(text) {
  const recurrenceMatch = text.match(/every\s+(day|week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
  if (!recurrenceMatch) {
    return null;
  }

  const value = recurrenceMatch[1].toLowerCase();
  if (value === "day") {
    return ["RRULE:FREQ=DAILY"];
  }
  if (value === "week") {
    return ["RRULE:FREQ=WEEKLY"];
  }
  if (value === "month") {
    return ["RRULE:FREQ=MONTHLY"];
  }
  if (value in WEEKDAYS) {
    const weekday = value.substring(0, 2).toUpperCase();
    return [`RRULE:FREQ=WEEKLY;BYDAY=${weekday}`];
  }
  return null;
}

export function extractLocation(text) {
  const locationMatch = text.match(/at\s+([\w\s,'&.-]+)/i);
  if (locationMatch) {
    return locationMatch[1].trim();
  }
  return null;
}

export function extractTitle(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return "Untitled event";
  }
  const normalized = trimmed.replace(/\b(tomorrow|today|next\s+\w+|on\s+\w+\s+\d{1,2}|at\s+\d{1,2}:\d{2}|for\s+\d+\s+\w+)\b/gi, "").trim();
  if (normalized.length > 3) {
    return normalized.replace(/^\W+|\W+$/g, "");
  }
  return trimmed;
}

export function extractDescription(text) {
  const descriptionMatch = text.match(/note\s*:\s*(.+)$/i);
  if (descriptionMatch) {
    return descriptionMatch[1].trim();
  }
  return "";
}

export function analyseText(text, options = {}) {
  const dateTime = parseDateTime(text, options);
  const recurrence = computeRecurrence(text);
  const location = extractLocation(text);
  const title = extractTitle(text);
  const description = extractDescription(text);

  const entities = {
    dates: [],
    times: [],
    locations: location ? [location] : [],
    people: [],
  };

  const isoDate = dateTime.start.toISOString().slice(0, 10);
  entities.dates.push(isoDate);
  entities.times.push(dateTime.start.toISOString().slice(11, 16));

  return {
    title,
    start_date: isoDate,
    start_time: dateTime.start.toISOString().slice(11, 16),
    duration_minutes: Math.round((dateTime.end - dateTime.start) / 60000),
    location: location || undefined,
    description: description || undefined,
    recurrence: recurrence
      ? {
          frequency: recurrence[0].split(";")[0].split("=")[1].toLowerCase(),
        }
      : undefined,
    confidence: dateTime.confidence,
    extracted_entities: entities,
    timezone: dateTime.timezone,
  };
}

export function toCalendarEventPayload(parsed) {
  const { start, end, timezone, recurrence, location, title, description } = {
    start: new Date(parsed.start_date + "T" + (parsed.start_time || "00:00") + ":00"),
    end: new Date(parsed.start_date + "T" + (parsed.start_time || "00:00") + ":00"),
    timezone: parsed.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    recurrence: parsed.recurrence,
    location: parsed.location,
    title: parsed.title,
    description: parsed.description,
  };

  end.setMinutes(start.getMinutes() + (parsed.duration_minutes || DEFAULT_DURATION_MINUTES));

  const payload = {
    summary: title,
    description: description,
    location: location,
    start: {
      dateTime: start.toISOString(),
      timeZone: timezone,
    },
    end: {
      dateTime: end.toISOString(),
      timeZone: timezone,
    },
    reminders: {
      useDefault: true,
    },
  };

  if (recurrence) {
    if (recurrence.frequency === "weekly" && parsed.extracted_entities?.dates) {
      const startDate = new Date(parsed.start_date);
      const byDay = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][startDate.getDay()];
      payload.recurrence = [`RRULE:FREQ=WEEKLY;BYDAY=${byDay}`];
    } else {
      payload.recurrence = [`RRULE:FREQ=${recurrence.frequency.toUpperCase()}`];
    }
  }

  return payload;
}

export default {
  parseDateTime,
  formatAsCalendarEvent,
  computeRecurrence,
  extractLocation,
  extractTitle,
  extractDescription,
  analyseText,
  toCalendarEventPayload,
};
