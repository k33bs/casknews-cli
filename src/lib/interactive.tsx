import React from 'react';
import { render } from 'ink';
import { spawn } from 'child_process';
import { CaskBrowser } from '../components/CaskBrowser.tsx';
import { fetchCaskDetail } from './api.ts';
import type { Cask, TrendingCask, CaskDetail } from '../types.ts';

function brewInstall(tokens: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('brew', ['install', '--cask', ...tokens], {
      stdio: 'inherit',
    });
    proc.on('close', (code) => {
      if (code !== 0) return reject(new Error(`brew exited with code ${code}`));
      resolve();
    });
    proc.on('error', reject);
  });
}

export async function launchBrowser(
  casks: Cask[] | TrendingCask[],
  title: string,
  mode: 'new' | 'trending' = 'new'
) {
  if (casks.length === 0) {
    console.log(`\n  ${title}\n  No casks found.\n`);
    return;
  }

  const onInstall = async (tokens: string[]) => {
    instance.unmount();

    console.log(`\nInstalling ${tokens.length} cask${tokens.length > 1 ? 's' : ''}:\n`);
    for (const token of tokens) {
      console.log(`  brew install --cask ${token}`);
    }
    console.log();

    try {
      await brewInstall(tokens);
      process.exit(0);
    } catch (err) {
      console.error(`\nInstall failed: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  };

  const onViewDetail = async (token: string): Promise<CaskDetail | null> => {
    try {
      return await fetchCaskDetail(token);
    } catch {
      return null;
    }
  };

  const instance = render(
    <CaskBrowser
      casks={casks}
      title={title}
      onInstall={onInstall}
      onViewDetail={onViewDetail}
      mode={mode}
    />
  );

  await instance.waitUntilExit();
}
