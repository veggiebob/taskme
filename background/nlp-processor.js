import { analyseText, toCalendarEventPayload } from "../lib/date-parser.js";
import { loadSettings } from "../lib/settings.js";

async function callOpenAI(text, settings) {
  if (!settings.openAiApiKey) {
    return null;
  }

  const body = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are an assistant that extracts Google Calendar event details. Return structured JSON matching the parse_calendar_event function schema.",
      },
      {
        role: "user",
        content: text,
      },
    ],
    temperature: 0.2,
    max_tokens: 256,
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.openAiApiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content;
    if (!assistantMessage) {
      return null;
    }
    const parsed = JSON.parse(assistantMessage);
    return parsed;
  } catch (error) {
    console.warn("TaskMe: OpenAI parsing failed", error);
    return null;
  }
}

export async function parseNaturalLanguage(text, options = {}) {
  const settings = await loadSettings();
  const referenceDate = options.referenceDate || new Date().toISOString();

  let parsed = await callOpenAI(text, settings);
  let usedLLM = Boolean(parsed);

  if (!parsed) {
    parsed = analyseText(text, {
      referenceDate,
      timezone: settings.timezone,
    });
  }

  const payload = toCalendarEventPayload({
    ...parsed,
    timezone: parsed.timezone || settings.timezone,
    duration_minutes: parsed.duration_minutes || settings.defaultDuration,
    extracted_entities: parsed.extracted_entities,
  });

  return {
    parsed,
    payload,
    usedLLM,
  };
}

export default {
  parseNaturalLanguage,
};
