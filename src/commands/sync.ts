import chalk from 'chalk';
import ora from 'ora';
import { getConfig, saveConfig } from '../lib/config.ts';
import { getInstalledCasks } from '../lib/brew.ts';
import { syncCasks } from '../lib/api.ts';
import { renderBrewing, renderSyncResult, renderError } from '../lib/ui.ts';

export async function syncCommand(options: { dryRun?: boolean; title?: string }) {
  // Check auth
  let config;
  try {
    config = getConfig();
  } catch {
    config = null;
  }
  if (!config?.apiToken) {
    console.log(chalk.yellow('\n  Not logged in. Run `casknews auth login` first.\n'));
    process.exit(1);
  }

  // Get installed casks
  const spinner = ora('Reading installed casks...').start();

  let tokens: string[];
  try {
    tokens = await getInstalledCasks();
    spinner.succeed(`Found ${tokens.length} installed casks`);
  } catch (err) {
    spinner.fail('Failed to read installed casks');
    renderError(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  if (tokens.length === 0) {
    console.log(chalk.yellow('\n  No casks installed. Install some with `brew install --cask <name>`.\n'));
    return;
  }

  // Show what we found
  renderBrewing(tokens);

  // Dry run — stop here
  if (options.dryRun) {
    console.log(chalk.dim('  Dry run — nothing uploaded.\n'));
    return;
  }

  // Upload
  const uploadSpinner = ora('Syncing to cask.news...').start();

  let result;
  try {
    result = await syncCasks(tokens, options.title);
    uploadSpinner.succeed('Synced!');
  } catch (err) {
    uploadSpinner.fail('Sync failed');
    renderError(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  // Save local sync time (non-fatal if this fails)
  try {
    saveConfig({ ...config, syncedAt: new Date().toISOString() });
  } catch {
    // Remote sync succeeded — don't fail over local bookkeeping
  }

  renderSyncResult(tokens, result.stackUrl);
}
