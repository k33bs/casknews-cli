import ora from 'ora';
import { fetchNewCasks } from '../lib/api.ts';
import { renderCaskTable, renderError } from '../lib/ui.ts';
import { launchBrowser } from '../lib/interactive.tsx';

export async function newCommand(options: { limit?: string; days?: string; category?: string; interactive?: boolean; json?: boolean }) {
  const limit = options.limit ? parseInt(options.limit, 10) : 10;
  const days = options.days ? parseInt(options.days, 10) : 7;
  const spinner = options.json ? null : ora('Fetching new casks...').start();

  try {
    const casks = await fetchNewCasks({ limit, days, category: options.category });
    spinner?.stop();

    if (options.json) {
      console.log(JSON.stringify(casks, null, 2));
      return;
    }

    const title = options.category
      ? `New ${options.category} Casks (last ${days} days)`
      : `New Casks (last ${days} days)`;

    if (options.interactive === false || !process.stdout.isTTY) {
      renderCaskTable(casks, title);
    } else {
      await launchBrowser(casks, title, 'new');
    }
  } catch (err) {
    spinner?.fail('Failed to fetch casks');
    renderError(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}
