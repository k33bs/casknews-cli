import { describe, test, expect } from 'bun:test';
import { resolve } from 'path';

const ENTRY = resolve(import.meta.dir, '../src/index.ts');

async function run(...args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = Bun.spawn(['bun', 'run', ENTRY, ...args], {
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      ...process.env,
      NO_COLOR: '1',
      // Isolate tests from real user config
      XDG_CONFIG_HOME: '/tmp/casknews-test-cli-' + Date.now(),
    },
  });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;
  return { stdout, stderr, exitCode };
}

describe('CLI end-to-end', () => {
  test('--help shows usage', async () => {
    const { stdout, exitCode } = await run('--help');
    expect(exitCode).toBe(0);
    expect(stdout).toContain('casknews');
    expect(stdout).toContain('Commands:');
    expect(stdout).toContain('new');
    expect(stdout).toContain('trending');
    expect(stdout).toContain('search');
    expect(stdout).toContain('info');
    expect(stdout).toContain('sync');
    expect(stdout).toContain('auth');
  });

  test('--version prints version', async () => {
    const { stdout, exitCode } = await run('--version');
    expect(exitCode).toBe(0);
    expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test('auth status shows not logged in', async () => {
    const { stdout, exitCode } = await run('auth', 'status');
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Not logged in');
  });

  test('auth --help shows subcommands', async () => {
    const { stdout, exitCode } = await run('auth', '--help');
    expect(exitCode).toBe(0);
    expect(stdout).toContain('login');
    expect(stdout).toContain('logout');
    expect(stdout).toContain('status');
  });

  test('sync --help shows options', async () => {
    const { stdout, exitCode } = await run('sync', '--help');
    expect(exitCode).toBe(0);
    expect(stdout).toContain('--dry-run');
    expect(stdout).toContain('--title');
  });

  test('new --limit rejects invalid input', async () => {
    const { stderr, exitCode } = await run('new', '--limit', 'abc');
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Must be a positive integer');
  });

  test('new --limit rejects negative numbers', async () => {
    const { stderr, exitCode } = await run('new', '--limit', '-5');
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Must be a positive integer');
  });

  test('new --days rejects zero', async () => {
    const { stderr, exitCode } = await run('new', '--days', '0');
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Must be a positive integer');
  });

  test('search requires a query argument', async () => {
    const { stderr, exitCode } = await run('search');
    expect(exitCode).toBe(1);
    expect(stderr).toContain("missing required argument 'query'");
  });

  test('info requires a token argument', async () => {
    const { stderr, exitCode } = await run('info');
    expect(exitCode).toBe(1);
    expect(stderr).toContain("missing required argument 'token'");
  });

  test('unknown command shows help', async () => {
    const { stderr, exitCode } = await run('foobar');
    expect(exitCode).toBe(1);
    expect(stderr).toContain("unknown command 'foobar'");
  });

  test('sync without auth exits with error', async () => {
    const { stdout, exitCode } = await run('sync');
    expect(exitCode).toBe(1);
    expect(stdout).toContain('Not logged in');
  });

  test('sync --dry-run without auth still requires login', async () => {
    const { stdout, exitCode } = await run('sync', '--dry-run');
    expect(exitCode).toBe(1);
    expect(stdout).toContain('Not logged in');
  });
});
