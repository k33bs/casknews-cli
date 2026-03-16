import ora from 'ora';
import { fetchCaskDetail } from '../lib/api.ts';
import { renderCaskDetail, renderError } from '../lib/ui.ts';

export async function infoCommand(token: string, options: { json?: boolean }) {
  const spinner = options.json ? null : ora(`Fetching details for ${token}...`).start();

  try {
    const detail = await fetchCaskDetail(token);
    spinner?.stop();

    if (options.json) {
      console.log(JSON.stringify(detail, null, 2));
      return;
    }

    renderCaskDetail(detail);
  } catch (err) {
    spinner?.fail(`Failed to fetch ${token}`);
    renderError(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}
