import { Command, InvalidArgumentError } from 'commander';
import { createRequire } from 'module';
import { newCommand } from './commands/new.ts';
import { trendingCommand } from './commands/trending.ts';
import { searchCommand } from './commands/search.ts';
import { infoCommand } from './commands/info.ts';
import { syncCommand } from './commands/sync.ts';
import { loginCommand, logoutCommand, statusCommand } from './commands/auth.ts';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

function parsePositiveInt(value: string): string {
  if (!/^\d+$/.test(value)) throw new InvalidArgumentError('Must be a positive integer.');
  const n = parseInt(value, 10);
  if (n < 1) throw new InvalidArgumentError('Must be a positive integer.');
  return String(n);
}

const program = new Command();

program
  .name('casknews')
  .description('Discover Homebrew casks from your terminal — powered by cask.news')
  .version(version);

program
  .command('new')
  .description('Show recently added casks (interactive by default)')
  .option('-l, --limit <n>', 'Number of casks to show', parsePositiveInt, '10')
  .option('-d, --days <n>', 'Look back N days', parsePositiveInt, '7')
  .option('-c, --category <cat>', 'Filter by category')
  .option('--no-interactive', 'Disable interactive mode (plain output)')
  .option('--json', 'Output raw JSON')
  .action(newCommand);

program
  .command('trending')
  .description('Show trending casks by install velocity (interactive by default)')
  .option('-l, --limit <n>', 'Number of casks to show', parsePositiveInt, '10')
  .option('--no-interactive', 'Disable interactive mode (plain output)')
  .option('--json', 'Output raw JSON')
  .action(trendingCommand);

program
  .command('search <query>')
  .description('Search casks by name or description (interactive by default)')
  .option('-l, --limit <n>', 'Max results', parsePositiveInt, '20')
  .option('--no-interactive', 'Disable interactive mode (plain output)')
  .option('--json', 'Output raw JSON')
  .action(searchCommand);

program
  .command('info <token>')
  .description('Show detailed info about a cask')
  .option('--json', 'Output raw JSON')
  .action(infoCommand);

program
  .command('sync')
  .description('Sync your installed casks to cask.news')
  .option('--dry-run', 'Show what would be synced without uploading')
  .option('-t, --title <title>', 'Name for your stack')
  .action(syncCommand);

const auth = program
  .command('auth')
  .description('Manage authentication');

auth
  .command('login')
  .description('Log in to cask.news')
  .action(loginCommand);

auth
  .command('logout')
  .description('Log out and clear stored credentials')
  .action(logoutCommand);

auth
  .command('status')
  .description('Show current authentication status')
  .action(statusCommand);

await program.parseAsync();
