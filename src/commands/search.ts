import ora from 'ora';
import { fetchSearchCasks } from '../lib/api.ts';
import { renderCaskTable, renderError } from '../lib/ui.ts';
import { launchBrowser } from '../lib/interactive.tsx';

export async function searchCommand(query: string, options: { limit?: string; interactive?: boolean; json?: boolean }) {
  const limit = options.limit ? parseInt(options.limit, 10) : 20;
  const spinner = options.json ? null : ora(`Searching for "${query}"...`).start();

  try {
    const casks = await fetchSearchCasks(query, limit);
    spinner?.stop();

    if (options.json) {
      console.log(JSON.stringify(casks, null, 2));
      return;
    }

    const title = `Search: "${query}" (${casks.length} results)`;

    if (options.interactive === false || !process.stdout.isTTY) {
      renderCaskTable(casks, title);
    } else {
      await launchBrowser(casks, title, 'new');
    }
  } catch (err) {
    spinner?.fail('Search failed');
    renderError(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}
