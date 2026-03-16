# casknews

The CLI for [cask.news](https://cask.news). Browse, search, and install Homebrew casks right from your terminal.

[cask.news](https://cask.news) indexes 7,300+ Homebrew casks with AI reviews, install stats, GitHub data, and trending info. This CLI lets you tap into all of that without opening a browser.

## What it does

- **Interactive browser** with keyboard navigation, selection cart, and one-key install
- Search by name or description
- See what's trending by install velocity
- Get detailed info on any cask (AI review, GitHub stats, install counts)
- Select one or multiple casks, then install them all at once or one by one
- Sync your installed casks to cask.news and get a shareable link
- Log in with a simple browser-based device code (like `gh auth login`)

## Install

**Try it without installing:**

```bash
npx casknews new
```

**Or install globally:**

```bash
npm install -g casknews
```

**Or build from source** (needs [Bun](https://bun.sh)):

```bash
git clone https://github.com/k33bs/casknews-cli.git
cd casknews-cli
bun install
bun run build
./dist/index.js --help
```

## Interactive mode

`new`, `trending`, and `search` all launch an interactive browser by default when running in a terminal. You get a scrollable list where you can pick casks, add them to a cart, view details, and install.

```
 New Casks (last 7 days)                    (1-10 of 24)

 > [ ] Ghostty             Developer Tools     9.2  12.5K/mo
        A GPU-accelerated terminal emulator with native macOS integration...
   [x] Zen Browser         Browsers            8.1   4.2K/mo
   [x] WezTerm             Developer Tools     8.8   8.9K/mo
   [ ] Obsidian            Productivity        9.0  45.0K/mo
──────────────────────────────────────────────────────
 Cart (2)  zen-browser, wezterm

 [space] toggle  [a]ll  [n]one  [i]nstall cart  [x] install cursor  [enter] details  [q]uit
```

**Keyboard shortcuts:**

| Key | What it does |
|-----|-------------|
| `j` / `k` or arrows | Move cursor up/down |
| `space` | Toggle cask in/out of cart |
| `a` | Select all |
| `n` | Deselect all |
| `enter` | View full details for highlighted cask |
| `i` | Install everything in the cart |
| `x` | Install just the highlighted cask |
| `q` | Quit |

When you press `i` or `x`, the browser exits and runs `brew install --cask` with real-time output.

To get plain (non-interactive) output for scripting or piping, use `--no-interactive`:

```bash
casknews new --no-interactive
casknews search firefox --no-interactive | grep something
```

Interactive mode is also automatically disabled when output is piped.

## Commands

### `casknews new`

Browse recently added casks.

| Flag | What it does | Default |
|------|-------------|---------|
| `-l, --limit <n>` | How many to show | 10 |
| `-d, --days <n>` | Look back N days | 7 |
| `-c, --category <cat>` | Filter by category | all |
| `--no-interactive` | Plain table output | off |
| `--json` | Output raw JSON | off |

### `casknews trending`

Browse casks growing faster than their yearly average.

| Flag | What it does | Default |
|------|-------------|---------|
| `-l, --limit <n>` | How many to show | 10 |
| `--no-interactive` | Plain table output | off |
| `--json` | Output raw JSON | off |

### `casknews search <query>`

Find casks by name or description.

| Flag | What it does | Default |
|------|-------------|---------|
| `-l, --limit <n>` | Max results | 20 |
| `--no-interactive` | Plain table output | off |
| `--json` | Output raw JSON | off |

### `casknews info <token>`

Full detail view for a single cask. Shows the AI review, GitHub stats, install numbers, and the brew install command.

| Flag | What it does | Default |
|------|-------------|---------|
| `--json` | Output raw JSON | off |

```
$ casknews info ghostty

 ╭──────────────────────────────────────────────────────────╮
 │                                                          │
 │   Ghostty  v1.2.0                                        │
 │   Developer Tools                                        │
 │                                                          │
 │   Score: 9.2   30d: 12.5K   90d: 35.0K   365d: 120.0K   │
 │   Homepage: https://ghostty.org                          │
 │                                                          │
 │   -- GitHub --                                           │
 │   * 28.5K   890 forks   342 issues   MIT                 │
 │                                                          │
 │   -- AI Review --                                        │
 │   Ghostty is a blazing-fast terminal emulator...         │
 │                                                          │
 │   Install:                                               │
 │     brew install --cask ghostty                          │
 │                                                          │
 ╰──────────────────────────────────────────────────────────╯
```

### `casknews sync`

Reads your installed Homebrew casks and uploads them to cask.news. You get a public (but unlisted) shareable link to your stack.

You need to be logged in first. See `casknews auth login` below.

| Flag | What it does |
|------|-------------|
| `--dry-run` | Preview what would be synced, don't upload |
| `-t, --title <title>` | Give your stack a name |

### `casknews auth`

Log in to cask.news using a device code flow (works like `gh auth login`).

```bash
casknews auth login    # start login
casknews auth status   # check if you're logged in
casknews auth logout   # clear credentials
```

**How login works:**

1. Run `casknews auth login`
2. You'll see a code like `CASK-7X9K` in your terminal
3. Your browser opens to cask.news where you enter the code and confirm
4. The CLI picks up the token automatically
5. Credentials get stored at `$XDG_CONFIG_HOME/casknews/config.json` (defaults to `~/.config/casknews/config.json`)

No passwords needed. No email required.

## Configuration

Credentials live at `$XDG_CONFIG_HOME/casknews/config.json` (defaults to `~/.config/casknews/config.json`) with restricted permissions (`0600`). The directory is created with `0700`.

| Env variable | What it does | Default |
|-------------|-------------|---------|
| `CASKNEWS_API_URL` | Override the API base URL (useful for local dev) | `https://cask.news` |
| `CASKNEWS_MOCK` | Set to `1` to use fake data (demo without API) | not set |
| `XDG_CONFIG_HOME` | Override config directory base | `~/.config` |
| `NO_COLOR` | Disable colors in output | not set |

## Development

**You'll need:**
- [Bun](https://bun.sh) for building and running tests
- [Node.js](https://nodejs.org) 20+ for running the built output
- [Homebrew](https://brew.sh) if you want to test the sync command

**Setup:**

```bash
git clone https://github.com/k33bs/casknews-cli.git
cd casknews-cli
bun install
```

**Run from source:**

```bash
bun run dev -- new
bun run dev -- search firefox
bun run dev -- auth status
```

**Build:**

Creates a single `dist/index.js` that works on any machine with Node 20+. Bun is only needed for building, not for running.

```bash
bun run build
node dist/index.js --help
```

**Tests:**

```bash
bun test
```

59 tests covering unit logic, config module (real getConfig/saveConfig/clearConfig with temp dirs), API error paths, brew integration, and full CLI end-to-end.

**Project layout:**

```
src/
├── index.ts              # Entry point, Commander setup
├── components/
│   └── CaskBrowser.tsx   # Interactive browser (Ink/React)
├── commands/
│   ├── new.ts            # casknews new
│   ├── trending.ts       # casknews trending
│   ├── search.ts         # casknews search
│   ├── info.ts           # casknews info
│   ├── sync.ts           # casknews sync
│   └── auth.ts           # casknews auth login/logout/status
├── lib/
│   ├── api.ts            # API client (timeout, sanitization, error handling)
│   ├── config.ts         # Credential storage (XDG-compliant, 0600 perms)
│   ├── brew.ts           # Reads installed casks via brew list --cask
│   ├── interactive.tsx   # Launches Ink browser, handles install flow
│   ├── mock.ts           # Fake data for CASKNEWS_MOCK=1 demos
│   └── ui.ts             # Static terminal output (tables, detail cards, colors)
└── types.ts              # TypeScript types
```

## Tech

- [Ink](https://github.com/vadimdemedes/ink) + React for the interactive browser
- [Commander.js](https://github.com/tj/commander.js) for command parsing
- [chalk](https://github.com/chalk/chalk), [boxen](https://github.com/sindresorhus/boxen), [cli-table3](https://github.com/cli-table/cli-table3) for static output
- Built with [Bun](https://bun.sh), runs on Node 20+

## Requirements

- macOS (Homebrew casks are a macOS thing)
- Node.js 20+
- Homebrew (for install and sync commands)

## Links

- [cask.news](https://cask.news) - the web platform
- [Homebrew Cask](https://github.com/Homebrew/homebrew-cask) - the package manager

## License

MIT
