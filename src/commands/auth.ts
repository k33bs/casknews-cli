import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import open from 'open';
import { authStart, authPoll, sanitize } from '../lib/api.ts';
import { getConfig, saveConfig, clearConfig } from '../lib/config.ts';
import { renderError } from '../lib/ui.ts';

export async function loginCommand() {
  let existing;
  try {
    existing = getConfig();
  } catch {
    existing = null;
  }
  if (existing?.apiToken) {
    console.log(chalk.yellow('\n  Already logged in. Run `casknews auth logout` first to re-authenticate.\n'));
    return;
  }

  const spinner = ora('Starting authentication...').start();

  try {
    const authResponse = await authStart();
    spinner.stop();

    const deviceCode = authResponse.deviceCode;
    const userCode = sanitize(authResponse.userCode);
    const expiresIn = authResponse.expiresIn;
    const interval = authResponse.interval;

    // Validate verifyUrl is an https URL
    const verifyUrl = authResponse.verifyUrl;
    if (!verifyUrl.startsWith('https://')) {
      renderError('Server returned an invalid verification URL.');
      process.exit(1);
    }

    // Show the code prominently
    console.log();
    console.log(
      boxen(
        [
          chalk.bold('Open this URL in your browser:'),
          chalk.underline.blue(verifyUrl),
          '',
          chalk.bold('Enter code:'),
          chalk.bold.hex('#FF6B35').bgBlack(` ${userCode} `),
        ].join('\n'),
        {
          padding: 1,
          margin: { left: 1, right: 0, top: 0, bottom: 0 },
          borderStyle: 'round',
          borderColor: '#FF6B35',
          title: 'casknews login',
          titleAlignment: 'center',
        }
      )
    );
    console.log();

    // Try to open browser
    try {
      const openUrl = new URL(verifyUrl);
      openUrl.searchParams.set('code', userCode);
      await open(openUrl.toString());
    } catch {
      // Browser open failed silently — user can copy URL manually
    }

    // Poll for confirmation
    const pollSpinner = ora('Waiting for browser confirmation...').start();
    const deadline = Date.now() + expiresIn * 1000;
    const pollInterval = Math.max(interval, 3) * 1000;

    while (Date.now() < deadline) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      let result;
      try {
        result = await authPoll(deviceCode);
      } catch {
        // Network hiccup — keep polling
        continue;
      }

      if (result.status === 'granted' && result.token && result.userId) {
        pollSpinner.succeed(chalk.green('Logged in successfully!'));
        try {
          saveConfig({ apiToken: result.token, userId: result.userId });
        } catch (err) {
          renderError(`Auth succeeded but failed to save credentials: ${err instanceof Error ? err.message : String(err)}`);
          process.exit(1);
        }
        console.log();
        return;
      }

      if (result.status === 'expired') {
        pollSpinner.fail('Code expired. Run `casknews auth login` to try again.');
        return;
      }
    }

    pollSpinner.fail('Authentication timed out. Run `casknews auth login` to try again.');
  } catch (err) {
    spinner.fail('Failed to start authentication');
    renderError(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

export function logoutCommand() {
  try {
    clearConfig();
    console.log(chalk.green('\n  Logged out successfully.\n'));
  } catch (err) {
    renderError(`Failed to remove credentials: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

export function statusCommand() {
  console.log();
  try {
    const config = getConfig();
    if (config?.apiToken) {
      console.log(chalk.green('  Authenticated'));
      console.log(chalk.dim(`  User ID: ${config.userId}`));
      if (config.syncedAt) {
        console.log(chalk.dim(`  Last sync: ${new Date(config.syncedAt).toLocaleString()}`));
      }
    } else {
      console.log(chalk.yellow('  Not logged in'));
      console.log(chalk.dim('  Run `casknews auth login` to authenticate.'));
    }
  } catch {
    console.log(chalk.yellow('  Not logged in'));
    console.log(chalk.dim('  Run `casknews auth login` to authenticate.'));
  }
  console.log();
}
