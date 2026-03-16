import type { Cask, TrendingCask, CaskDetail } from '../types.ts';

export const MOCK_ENABLED = process.env.CASKNEWS_MOCK === '1';

const MOCK_CASKS: Cask[] = [
  { token: 'ghostty', name: 'Ghostty', desc: 'A fast, feature-rich, and cross-platform terminal emulator that uses platform-native UI and GPU acceleration', homepage: 'https://ghostty.org', version: '1.2.0', category: 'Developer Tools', aiScore: 9.2, compositeScore: 8.5, installCount30d: 12500, installCount90d: 35000, installCount365d: 120000, firstSeen: '2024-12-26T00:00:00Z', lastUpdated: '2026-03-14T00:00:00Z', deprecated: false, autoUpdates: true },
  { token: 'cursor', name: 'Cursor', desc: 'AI-first code editor built on VS Code with integrated chat, autocomplete, and codebase understanding', homepage: 'https://cursor.com', version: '0.48.0', category: 'Developer Tools', aiScore: 9.0, compositeScore: 8.8, installCount30d: 45000, installCount90d: 100000, installCount365d: 180000, firstSeen: '2024-03-15T00:00:00Z', lastUpdated: '2026-03-14T00:00:00Z', deprecated: false, autoUpdates: true },
  { token: 'zen-browser', name: 'Zen Browser', desc: 'Privacy-focused browser based on Firefox with vertical tabs, split views, and custom themes', homepage: 'https://zen-browser.app', version: '1.0.0', category: 'Browsers', aiScore: 8.1, compositeScore: 7.5, installCount30d: 4200, installCount90d: 10000, installCount365d: 25000, firstSeen: '2025-09-01T00:00:00Z', lastUpdated: '2026-03-14T00:00:00Z', deprecated: false, autoUpdates: false },
  { token: 'wezterm', name: 'WezTerm', desc: 'A GPU-accelerated cross-platform terminal emulator and multiplexer with Lua configuration', homepage: 'https://wezfurlong.org/wezterm', version: '20260312-nightly', category: 'Developer Tools', aiScore: 8.8, compositeScore: 8.0, installCount30d: 8900, installCount90d: 25000, installCount365d: 90000, firstSeen: '2022-05-01T00:00:00Z', lastUpdated: '2026-03-12T00:00:00Z', deprecated: false, autoUpdates: true },
  { token: 'obsidian', name: 'Obsidian', desc: 'Private and flexible writing app that adapts to the way you think with local Markdown files', homepage: 'https://obsidian.md', version: '1.8.2', category: 'Productivity', aiScore: 9.0, compositeScore: 8.7, installCount30d: 45000, installCount90d: 130000, installCount365d: 480000, firstSeen: '2020-10-01T00:00:00Z', lastUpdated: '2026-03-10T00:00:00Z', deprecated: false, autoUpdates: true },
  { token: 'raycast', name: 'Raycast', desc: 'Blazingly fast launcher that lets you control your tools with a few keystrokes', homepage: 'https://raycast.com', version: '1.92.0', category: 'Productivity', aiScore: 9.4, compositeScore: 9.1, installCount30d: 38000, installCount90d: 110000, installCount365d: 400000, firstSeen: '2021-02-01T00:00:00Z', lastUpdated: '2026-03-14T00:00:00Z', deprecated: false, autoUpdates: true },
  { token: 'arc', name: 'Arc', desc: 'Browser designed to be yours with Spaces, Profiles, and a command bar', homepage: 'https://arc.net', version: '1.76.0', category: 'Browsers', aiScore: 8.5, compositeScore: 8.2, installCount30d: 22000, installCount90d: 65000, installCount365d: 250000, firstSeen: '2023-07-01T00:00:00Z', lastUpdated: '2026-03-14T00:00:00Z', deprecated: false, autoUpdates: true },
  { token: 'linear-linear', name: 'Linear', desc: 'Streamlined issue tracker and project management tool built for modern software teams', homepage: 'https://linear.app', version: '2026.03.0', category: 'Developer Tools', aiScore: 8.9, compositeScore: 8.4, installCount30d: 15000, installCount90d: 42000, installCount365d: 150000, firstSeen: '2021-11-01T00:00:00Z', lastUpdated: '2026-03-13T00:00:00Z', deprecated: false, autoUpdates: true },
  { token: 'figma', name: 'Figma', desc: 'Collaborative design tool for building meaningful products together', homepage: 'https://figma.com', version: '124.5.0', category: 'Design', aiScore: 9.1, compositeScore: 9.0, installCount30d: 52000, installCount90d: 150000, installCount365d: 550000, firstSeen: '2019-08-01T00:00:00Z', lastUpdated: '2026-03-14T00:00:00Z', deprecated: false, autoUpdates: true },
  { token: 'orbstack', name: 'OrbStack', desc: 'Fast, light, and simple way to run containers and Linux machines on macOS', homepage: 'https://orbstack.dev', version: '1.9.0', category: 'Developer Tools', aiScore: 9.3, compositeScore: 9.0, installCount30d: 18000, installCount90d: 50000, installCount365d: 160000, firstSeen: '2023-06-01T00:00:00Z', lastUpdated: '2026-03-14T00:00:00Z', deprecated: false, autoUpdates: true },
];

const MOCK_TRENDING: TrendingCask[] = MOCK_CASKS.slice(0, 7).map((c, i) => ({
  ...c,
  velocity: [3.2, 2.8, 2.5, 2.1, 1.9, 1.7, 1.5][i]!,
  trendScore: [14.0, 12.5, 10.1, 8.5, 7.2, 6.1, 5.0][i]!,
}));

const MOCK_REVIEW = {
  summary: 'A well-crafted, performant application with strong community support and active development. Shows maturity in its core feature set while continuing to innovate.',
  whatItDoes: 'Provides a modern, polished experience for its category with thoughtful defaults and extensive customization options.',
  maturity: 'Mature',
  pros: 'Excellent performance and responsiveness\nClean, intuitive interface\nActive development and community\nGood documentation',
  cons: 'Some advanced features require paid plan\nLearning curve for power features',
};

const MOCK_GITHUB = {
  repoUrl: 'https://github.com/example/repo',
  stars: 28500,
  forks: 890,
  openIssues: 342,
  license: 'MIT',
  language: 'Rust',
  lastCommit: '2026-03-14T12:00:00Z',
};

export function getMockNewCasks(options: { limit?: number; days?: number; category?: string }): Cask[] {
  let casks = [...MOCK_CASKS];
  if (options.category) {
    casks = casks.filter(c => c.category?.toLowerCase() === options.category!.toLowerCase());
  }
  return casks.slice(0, options.limit ?? 10);
}

export function getMockTrendingCasks(limit?: number): TrendingCask[] {
  return MOCK_TRENDING.slice(0, limit ?? 10);
}

export function getMockSearchCasks(query: string, limit?: number): Cask[] {
  const q = query.toLowerCase();
  return MOCK_CASKS
    .filter(c => c.name.toLowerCase().includes(q) || c.desc?.toLowerCase().includes(q) || c.token.includes(q))
    .slice(0, limit ?? 20);
}

export function getMockCaskDetail(token: string): CaskDetail | null {
  const cask = MOCK_CASKS.find(c => c.token === token);
  if (!cask) return null;
  return { cask, review: MOCK_REVIEW, github: MOCK_GITHUB };
}
