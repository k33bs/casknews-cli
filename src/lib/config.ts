import { homedir } from 'os';
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, chmodSync } from 'fs';
import type { AuthConfig } from '../types.ts';

function configDir(): string {
  return join(process.env.XDG_CONFIG_HOME || join(homedir(), '.config'), 'casknews');
}

function configFile(): string {
  return join(configDir(), 'config.json');
}

function ensureDir() {
  const dir = configDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true, mode: 0o700 });
  }
}

export function getConfig(): AuthConfig | null {
  const file = configFile();
  if (!existsSync(file)) return null;
  const raw = readFileSync(file, 'utf-8');
  const parsed = JSON.parse(raw);
  if (typeof parsed?.apiToken !== 'string' || typeof parsed?.userId !== 'string') {
    return null;
  }
  return parsed as AuthConfig;
}

export function saveConfig(config: AuthConfig) {
  ensureDir();
  const file = configFile();
  writeFileSync(file, JSON.stringify(config, null, 2) + '\n', { mode: 0o600 });
  chmodSync(file, 0o600);
}

export function clearConfig() {
  const file = configFile();
  if (existsSync(file)) unlinkSync(file);
}

export function getApiToken(): string | null {
  try {
    return getConfig()?.apiToken ?? null;
  } catch {
    return null;
  }
}
