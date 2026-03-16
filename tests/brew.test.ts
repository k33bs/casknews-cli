import { describe, test, expect } from 'bun:test';
import { getInstalledCasks } from '../src/lib/brew.ts';

describe('getInstalledCasks', () => {
  test('returns an array of strings', async () => {
    const casks = await getInstalledCasks();
    expect(Array.isArray(casks)).toBe(true);
    expect(casks.length).toBeGreaterThan(0);
  });

  test('each token is a non-empty trimmed string', async () => {
    const casks = await getInstalledCasks();
    for (const cask of casks) {
      expect(typeof cask).toBe('string');
      expect(cask.length).toBeGreaterThan(0);
      expect(cask).toBe(cask.trim());
    }
  });

  test('tokens contain no whitespace or newlines', async () => {
    const casks = await getInstalledCasks();
    for (const cask of casks) {
      expect(cask).not.toContain('\n');
      expect(cask).not.toContain(' ');
    }
  });
});
