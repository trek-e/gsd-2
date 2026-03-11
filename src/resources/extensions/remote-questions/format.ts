/**
 * Remote Questions — Payload formatting for Slack and Discord
 *
 * Converts Question[] to channel-specific payloads and parses replies
 * back into RemoteAnswer objects.
 */

import type { FormattedQuestion, RemoteAnswer } from "./channels.js";

// ─── Slack Block Kit ─────────────────────────────────────────────────────────

export interface SlackBlock {
  type: string;
  text?: { type: string; text: string };
  elements?: Array<{ type: string; text: string }>;
}

/**
 * Format questions as Slack Block Kit blocks for chat.postMessage.
 */
export function formatForSlack(questions: FormattedQuestion[]): SlackBlock[] {
  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: { type: "plain_text", text: "GSD needs your input" },
    },
  ];

  for (const q of questions) {
    // Question header + text
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${q.header}*\n${q.question}`,
      },
    });

    // Numbered options
    const optionLines = q.options.map(
      (opt, i) => `${i + 1}. *${opt.label}* — ${opt.description}`,
    );
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: optionLines.join("\n"),
      },
    });

    // Instructions
    const instruction = q.allowMultiple
      ? `Reply in this thread with numbers separated by comma (e.g. \`1,3\`) or type a custom answer.`
      : `Reply in this thread with the number of your choice (e.g. \`1\`) or type a custom answer.`;

    blocks.push({
      type: "context",
      elements: [{ type: "mrkdwn", text: instruction }],
    });

    blocks.push({ type: "divider" });
  }

  return blocks;
}

// ─── Discord Embed ───────────────────────────────────────────────────────────

export interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  fields: Array<{ name: string; value: string; inline?: boolean }>;
  footer?: { text: string };
}

const NUMBER_EMOJIS = ["1\ufe0f\u20e3", "2\ufe0f\u20e3", "3\ufe0f\u20e3", "4\ufe0f\u20e3", "5\ufe0f\u20e3"];

/**
 * Format questions as a Discord embed for channel message.
 */
export function formatForDiscord(questions: FormattedQuestion[]): { embeds: DiscordEmbed[]; reactionEmojis: string[] } {
  const allEmojis: string[] = [];
  const embeds: DiscordEmbed[] = [];

  for (const q of questions) {
    const optionLines = q.options.map((opt, i) => {
      const emoji = NUMBER_EMOJIS[i] ?? `${i + 1}.`;
      allEmojis.push(NUMBER_EMOJIS[i] ?? "");
      return `${emoji} **${opt.label}** — ${opt.description}`;
    });

    const instruction = q.allowMultiple
      ? "React with numbers or reply with comma-separated choices (e.g. `1,3`)"
      : "React with a number or reply with your choice";

    embeds.push({
      title: `${q.header}`,
      description: q.question,
      color: 0x7c3aed, // Purple accent
      fields: [
        { name: "Options", value: optionLines.join("\n") },
      ],
      footer: { text: instruction },
    });
  }

  return { embeds, reactionEmojis: allEmojis.filter(Boolean) };
}

// ─── Reply Parsing ───────────────────────────────────────────────────────────

/**
 * Parse a Slack thread reply into a RemoteAnswer.
 * Supports: single number, comma-separated numbers, or free text.
 */
export function parseSlackReply(text: string, questions: FormattedQuestion[]): RemoteAnswer {
  const answers: RemoteAnswer["answers"] = {};
  const trimmed = text.trim();

  // For single-question scenarios, map the reply directly
  if (questions.length === 1) {
    const q = questions[0];
    answers[q.id] = parseAnswerForQuestion(trimmed, q);
    return { answers };
  }

  // Multi-question: try to split by lines or semicolons
  const parts = trimmed.includes(";")
    ? trimmed.split(";").map((s) => s.trim())
    : trimmed.split("\n").map((s) => s.trim()).filter(Boolean);

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const part = parts[i] ?? "";
    answers[q.id] = parseAnswerForQuestion(part, q);
  }

  return { answers };
}

/**
 * Parse a Discord reaction or reply into a RemoteAnswer.
 */
export function parseDiscordResponse(
  reactions: Array<{ emoji: string; count: number }>,
  replyText: string | null,
  questions: FormattedQuestion[],
): RemoteAnswer {
  // Prefer text reply if present
  if (replyText) {
    return parseSlackReply(replyText, questions);
  }

  // Fall back to reactions
  const answers: RemoteAnswer["answers"] = {};

  if (questions.length === 1) {
    const q = questions[0];
    const picked = reactions
      .filter((r) => NUMBER_EMOJIS.includes(r.emoji) && r.count > 0)
      .map((r) => {
        const idx = NUMBER_EMOJIS.indexOf(r.emoji);
        return q.options[idx]?.label;
      })
      .filter(Boolean) as string[];

    if (picked.length > 0) {
      answers[q.id] = { answers: picked };
    } else {
      answers[q.id] = { answers: [], user_note: "No clear response via reactions" };
    }
    return { answers };
  }

  // Multi-question with reactions: map first N emojis to first question
  for (const q of questions) {
    answers[q.id] = { answers: [], user_note: "Reaction-based multi-question not supported — use text reply" };
  }

  return { answers };
}

// ─── Internal helpers ────────────────────────────────────────────────────────

function parseAnswerForQuestion(
  text: string,
  q: FormattedQuestion,
): { answers: string[]; user_note?: string } {
  if (!text) {
    return { answers: [], user_note: "No response provided" };
  }

  // Check for comma-separated numbers: "1,3" or "1, 3"
  const numberPattern = /^[\d,\s]+$/;
  if (numberPattern.test(text)) {
    const nums = text
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n >= 1 && n <= q.options.length);

    if (nums.length > 0) {
      const selected = nums.map((n) => q.options[n - 1].label);
      return { answers: q.allowMultiple ? selected : [selected[0]] };
    }
  }

  // Single number
  const singleNum = parseInt(text, 10);
  if (!isNaN(singleNum) && singleNum >= 1 && singleNum <= q.options.length) {
    return { answers: [q.options[singleNum - 1].label] };
  }

  // Free text response
  return { answers: [], user_note: text };
}
