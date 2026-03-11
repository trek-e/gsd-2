/**
 * Remote Questions — Configuration resolution
 *
 * Reads remote_questions config from GSD preferences and verifies
 * the corresponding token exists in process.env.
 */

import { loadEffectiveGSDPreferences, type RemoteQuestionsConfig } from "../gsd/preferences.js";

export interface ResolvedConfig {
  channel: "slack" | "discord";
  channelId: string;
  timeoutMs: number;
  pollIntervalMs: number;
  token: string;
}

const ENV_KEYS: Record<string, string> = {
  slack: "SLACK_BOT_TOKEN",
  discord: "DISCORD_BOT_TOKEN",
};

const DEFAULT_TIMEOUT_MINUTES = 5;
const DEFAULT_POLL_INTERVAL_SECONDS = 5;

/**
 * Resolve remote questions configuration from preferences + env.
 * Returns null if not configured or token is missing.
 */
export function resolveRemoteConfig(): ResolvedConfig | null {
  const prefs = loadEffectiveGSDPreferences();
  const rq: RemoteQuestionsConfig | undefined = prefs?.preferences.remote_questions;
  if (!rq || !rq.channel || !rq.channel_id) return null;

  const envVar = ENV_KEYS[rq.channel];
  if (!envVar) return null;

  const token = process.env[envVar];
  if (!token) return null;

  const timeoutMinutes = rq.timeout_minutes ?? DEFAULT_TIMEOUT_MINUTES;
  const pollIntervalSeconds = rq.poll_interval_seconds ?? DEFAULT_POLL_INTERVAL_SECONDS;

  // Always coerce channel_id to string — parseScalar may convert large numeric
  // Discord IDs to a lossy Number (exceeds Number.MAX_SAFE_INTEGER).
  const channelId = String(rq.channel_id);

  return {
    channel: rq.channel,
    channelId,
    timeoutMs: timeoutMinutes * 60 * 1000,
    pollIntervalMs: pollIntervalSeconds * 1000,
    token,
  };
}

/**
 * Return a human-readable status string for the remote questions config.
 * Used by session_start notification and /gsd remote status.
 */
export function getRemoteConfigStatus(): string {
  const prefs = loadEffectiveGSDPreferences();
  const rq: RemoteQuestionsConfig | undefined = prefs?.preferences.remote_questions;

  if (!rq || !rq.channel || !rq.channel_id) {
    return "Remote questions: not configured";
  }

  const envVar = ENV_KEYS[rq.channel];
  if (!envVar) return `Remote questions: unknown channel type "${rq.channel}"`;

  const token = process.env[envVar];
  if (!token) {
    return `Remote questions: ${envVar} not set — remote questions disabled`;
  }

  return `Remote questions: ${rq.channel} (channel ${rq.channel_id}) configured`;
}
