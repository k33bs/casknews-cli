import { execFile } from 'child_process';

function run(cmd: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, (err, stdout, stderr) => {
      if (err) {
        const message = stderr?.trim() || err.message;
        return reject(new Error(message));
      }
      resolve({ stdout, stderr });
    });
  });
}

export async function getInstalledCasks(): Promise<string[]> {
  // Check if brew is available
  try {
    await run('which', ['brew']);
  } catch {
    throw new Error('Homebrew not found. Install it from https://brew.sh');
  }

  const { stdout } = await run('brew', ['list', '--cask']);

  return stdout
    .trim()
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
}
