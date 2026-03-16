import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { existsSync, rmSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Point config module at a temp directory for isolation
const TEST_CONFIG_HOME = join(tmpdir(), `casknews-config-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
process.env.XDG_CONFIG_HOME = TEST_CONFIG_HOME;

// Import AFTER setting env so the module picks up the override
const { getConfig, saveConfig, clearConfig, getApiToken } = await import('../src/lib/config.ts');
const CONFIG_DIR = join(TEST_CONFIG_HOME, 'casknews');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

beforeEach(() => {
  if (existsSync(CONFIG_DIR)) rmSync(CONFIG_DIR, { recursive: true });
});

afterEach(() => {
  if (existsSync(CONFIG_DIR)) rmSync(CONFIG_DIR, { recursive: true });
});

describe('getConfig', () => {
  test('returns null when no config file exists', () => {
    expect(getConfig()).toBeNull();
  });

  test('returns null for invalid JSON', () => {
    const { mkdirSync, writeFileSync } = require('fs');
    mkdirSync(CONFIG_DIR, { recursive: true });
    writeFileSync(CONFIG_FILE, '{broken');
    expect(() => getConfig()).toThrow();
  });

  test('returns null for config missing apiToken', () => {
    const { mkdirSync, writeFileSync } = require('fs');
    mkdirSync(CONFIG_DIR, { recursive: true });
    writeFileSync(CONFIG_FILE, JSON.stringify({ userId: 'test' }));
    expect(getConfig()).toBeNull();
  });

  test('returns null for config with non-string apiToken', () => {
    const { mkdirSync, writeFileSync } = require('fs');
    mkdirSync(CONFIG_DIR, { recursive: true });
    writeFileSync(CONFIG_FILE, JSON.stringify({ apiToken: 123, userId: 'test' }));
    expect(getConfig()).toBeNull();
  });
});

describe('saveConfig', () => {
  test('creates directory and file', () => {
    saveConfig({ apiToken: 'ck_test123', userId: 'usr_abc' });
    expect(existsSync(CONFIG_FILE)).toBe(true);
  });

  test('writes valid JSON', () => {
    const data = { apiToken: 'ck_test123', userId: 'usr_abc', syncedAt: '2026-03-15T00:00:00Z' };
    saveConfig(data);
    const raw = readFileSync(CONFIG_FILE, 'utf-8');
    expect(JSON.parse(raw)).toEqual(data);
  });

  test('creates directory with 0700 permissions', () => {
    saveConfig({ apiToken: 'ck_test', userId: 'usr_test' });
    const stat = statSync(CONFIG_DIR);
    expect(stat.mode & 0o777).toBe(0o700);
  });

  test('creates file with 0600 permissions', () => {
    saveConfig({ apiToken: 'ck_test', userId: 'usr_test' });
    const stat = statSync(CONFIG_FILE);
    expect(stat.mode & 0o777).toBe(0o600);
  });

  test('round-trips through getConfig', () => {
    const data = { apiToken: 'ck_roundtrip', userId: 'usr_roundtrip' };
    saveConfig(data);
    const result = getConfig();
    expect(result).toEqual(data);
  });
});

describe('clearConfig', () => {
  test('removes config file', () => {
    saveConfig({ apiToken: 'ck_delete', userId: 'usr_delete' });
    expect(existsSync(CONFIG_FILE)).toBe(true);
    clearConfig();
    expect(existsSync(CONFIG_FILE)).toBe(false);
  });

  test('does not throw when file does not exist', () => {
    expect(() => clearConfig()).not.toThrow();
  });
});

describe('getApiToken', () => {
  test('returns null when no config', () => {
    expect(getApiToken()).toBeNull();
  });

  test('returns token when config exists', () => {
    saveConfig({ apiToken: 'ck_mytoken', userId: 'usr_me' });
    expect(getApiToken()).toBe('ck_mytoken');
  });
});
