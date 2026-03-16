import ora from 'ora';
import { fetchTrendingCasks } from '../lib/api.ts';
import { renderTrendingTable, renderError } from '../lib/ui.ts';
import { launchBrowser } from '../lib/interactive.tsx';

export async function trendingCommand(options: { limit?: string; interactive?: boolean; json?: boolean }) {
  const limit = options.limit ? parseInt(options.limit, 10) : 10;
  const spinner = options.json ? null : ora('Fetching trending casks...').start();

  try {
    const casks = await fetchTrendingCasks(limit);
    spinner?.stop();

    if (options.json) {
      console.log(JSON.stringify(casks, null, 2));
      return;
    }

    if (options.interactive === false || !process.stdout.isTTY) {
      renderTrendingTable(casks);
    } else {
      await launchBrowser(casks, 'Trending Casks', 'trending');
    }
  } catch (err) {
    spinner?.fail('Failed to fetch trending casks');
    renderError(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}
