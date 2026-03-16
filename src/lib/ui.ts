import chalk from 'chalk';
import boxen from 'boxen';
import Table from 'cli-table3';
import { sanitize } from './api.ts';
import type { Cask, CaskDetail, TrendingCask } from '../types.ts';

/** Sanitize a string from the API before rendering to terminal */
export function safe(text: string | null | undefined): string {
  return text ? sanitize(text) : '';
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 100_000) return `${Math.round(n / 1_000)}K`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function timeAgo(dateStr: string): string {
  const ts = new Date(dateStr).getTime();
  if (isNaN(ts)) return 'unknown';
  const diff = Math.max(0, Date.now() - ts);
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  const years = Math.floor(days / 365);
  const remainingMonths = Math.floor((days % 365) / 30);
  return remainingMonths > 0 ? `${years}y ${remainingMonths}mo ago` : `${years}y ago`;
}

function scoreColor(score: number | null): string {
  if (score === null) return chalk.dim('—');
  if (score >= 8) return chalk.green(`${score.toFixed(1)}`);
  if (score >= 6) return chalk.yellow(`${score.toFixed(1)}`);
  return chalk.red(`${score.toFixed(1)}`);
}

function categoryBadge(cat: string | null): string {
  if (!cat) return chalk.dim('Uncategorized');
  return chalk.cyan(safe(cat));
}

export function header(title: string) {
  console.log();
  console.log(chalk.bold.hex('#FF6B35')(` ${title}`));
  console.log(chalk.dim(' ─'.repeat(30)));
  console.log();
}

export function renderCaskTable(casks: Cask[], title: string) {
  if (casks.length === 0) {
    header(title);
    console.log(chalk.dim('  No casks found.'));
    console.log();
    return;
  }

  header(title);

  const table = new Table({
    chars: {
      top: '', 'top-mid': '', 'top-left': '', 'top-right': '',
      bottom: '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
      left: '  ', 'left-mid': '', mid: '', 'mid-mid': '',
      right: '', 'right-mid': '', middle: '  ',
    },
    style: { 'padding-left': 0, 'padding-right': 0 },
  });

  for (const cask of casks) {
    const desc = safe(cask.desc);
    table.push([
      chalk.bold.white(safe(cask.name)),
      categoryBadge(cask.category),
      scoreColor(cask.aiScore),
      chalk.magenta(formatCount(cask.installCount30d) + '/mo'),
      chalk.dim(timeAgo(cask.firstSeen)),
    ]);

    if (desc) {
      table.push([
        {
          content: chalk.dim(`  ${desc.slice(0, 80)}${desc.length > 80 ? '...' : ''}`),
          colSpan: 5,
        },
      ]);
    }
  }

  console.log(table.toString());
  console.log();
}

export function renderTrendingTable(casks: TrendingCask[]) {
  if (casks.length === 0) {
    header('Trending Casks');
    console.log(chalk.dim('  No trending casks found.'));
    console.log();
    return;
  }

  header('Trending Casks');

  const table = new Table({
    chars: {
      top: '', 'top-mid': '', 'top-left': '', 'top-right': '',
      bottom: '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
      left: '  ', 'left-mid': '', mid: '', 'mid-mid': '',
      right: '', 'right-mid': '', middle: '  ',
    },
    style: { 'padding-left': 0, 'padding-right': 0 },
  });

  for (const cask of casks) {
    const desc = safe(cask.desc);
    const velocityStr = cask.velocity >= 2
      ? chalk.green.bold(`▲ ${cask.velocity.toFixed(1)}x`)
      : cask.velocity >= 1.5
        ? chalk.yellow(`▲ ${cask.velocity.toFixed(1)}x`)
        : chalk.dim(`${cask.velocity.toFixed(1)}x`);

    table.push([
      chalk.bold.white(safe(cask.name)),
      velocityStr,
      categoryBadge(cask.category),
      chalk.magenta(formatCount(cask.installCount30d) + '/mo'),
      scoreColor(cask.aiScore),
    ]);

    if (desc) {
      table.push([
        {
          content: chalk.dim(`  ${desc.slice(0, 80)}${desc.length > 80 ? '...' : ''}`),
          colSpan: 5,
        },
      ]);
    }
  }

  console.log(table.toString());
  console.log();
}

export function renderCaskDetail(detail: CaskDetail) {
  const { cask, review, github } = detail;

  // Header box
  const titleLine = chalk.bold.hex('#FF6B35')(safe(cask.name));
  const versionLine = cask.version ? chalk.dim(`v${safe(cask.version)}`) : '';
  const categoryLine = categoryBadge(cask.category);

  const lines: string[] = [
    `${titleLine}  ${versionLine}`,
    categoryLine,
    '',
  ];

  const desc = safe(cask.desc);
  if (desc) {
    lines.push(chalk.white(desc));
    lines.push('');
  }

  // Stats row
  const stats = [
    `${chalk.bold('Score:')} ${scoreColor(cask.aiScore)}`,
    `${chalk.bold('30d:')} ${chalk.magenta(formatCount(cask.installCount30d))}`,
    `${chalk.bold('90d:')} ${chalk.magenta(formatCount(cask.installCount90d))}`,
    `${chalk.bold('365d:')} ${chalk.magenta(formatCount(cask.installCount365d))}`,
  ];
  lines.push(stats.join('   '));

  if (cask.homepage) {
    lines.push(`${chalk.bold('Homepage:')} ${chalk.underline.blue(safe(cask.homepage))}`);
  }

  lines.push(`${chalk.bold('First seen:')} ${timeAgo(cask.firstSeen)}`);

  // GitHub stats
  if (github) {
    lines.push('');
    lines.push(chalk.bold.dim('── GitHub ──'));
    const ghStats = [];
    if (github.stars != null) ghStats.push(`★ ${formatCount(github.stars)}`);
    if (github.forks != null) ghStats.push(`⑂ ${formatCount(github.forks)}`);
    if (github.openIssues != null) ghStats.push(`◉ ${github.openIssues} issues`);
    if (github.license) ghStats.push(`⚖ ${safe(github.license)}`);
    if (ghStats.length) lines.push(ghStats.join('   '));
    if (github.repoUrl) {
      lines.push(chalk.underline.blue(safe(github.repoUrl)));
    }
  }

  // AI Review
  if (review) {
    lines.push('');
    lines.push(chalk.bold.dim('── AI Review ──'));
    lines.push(chalk.white(safe(review.summary)));

    const whatItDoes = safe(review.whatItDoes);
    if (whatItDoes) {
      lines.push('');
      lines.push(chalk.bold('What it does:'));
      lines.push(chalk.white(whatItDoes));
    }

    const pros = safe(review.pros);
    if (pros) {
      lines.push('');
      lines.push(chalk.green.bold('Pros:'));
      for (const pro of pros.split('\n').filter(Boolean)) {
        lines.push(chalk.green(`  + ${pro.replace(/^[•\-+]\s*/, '')}`));
      }
    }

    const cons = safe(review.cons);
    if (cons) {
      lines.push(chalk.red.bold('Cons:'));
      for (const con of cons.split('\n').filter(Boolean)) {
        lines.push(chalk.red(`  - ${con.replace(/^[•\-+]\s*/, '')}`));
      }
    }
  }

  // Install command
  lines.push('');
  lines.push(chalk.bold('Install:'));
  lines.push(chalk.green(`  brew install --cask ${safe(cask.token)}`));

  console.log();
  console.log(
    boxen(lines.join('\n'), {
      padding: 1,
      margin: { left: 1, right: 0, top: 0, bottom: 0 },
      borderStyle: 'round',
      borderColor: '#FF6B35',
    })
  );
  console.log();
}

export function renderSyncResult(tokens: string[], stackUrl?: string) {
  console.log();
  console.log(
    boxen(
      [
        chalk.bold.hex('#FF6B35')('Sync Complete'),
        '',
        `${chalk.bold(String(tokens.length))} casks synced to cask.news`,
        '',
        stackUrl
          ? `${chalk.bold('Your stack:')} ${chalk.underline.blue(stackUrl)}`
          : chalk.dim('Stack URL will be available after API is deployed.'),
      ].join('\n'),
      {
        padding: 1,
        margin: { left: 1, right: 0, top: 0, bottom: 0 },
        borderStyle: 'round',
        borderColor: 'green',
      }
    )
  );
  console.log();
}

export function renderError(message: string) {
  console.error(chalk.red(`\n  Error: ${message}\n`));
}

export function renderBrewing(tokens: string[]) {
  header(`Installed Casks (${tokens.length})`);

  const cols = 3;
  const rows: string[][] = [];
  for (let i = 0; i < tokens.length; i += cols) {
    rows.push(
      tokens.slice(i, i + cols).map(t => chalk.white(t.padEnd(30)))
    );
  }

  for (const row of rows) {
    console.log('  ' + row.join(''));
  }
  console.log();
}
