import React, { useState, useCallback } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { safe, formatCount, parseList } from '../lib/ui.ts';
import type { Cask, TrendingCask, CaskDetail } from '../types.ts';

interface CaskBrowserProps {
  casks: Cask[];
  title: string;
  onInstall: (tokens: string[]) => void;
  onViewDetail: (token: string) => Promise<CaskDetail | null>;
  mode?: 'new' | 'trending';
}

type View = 'list' | 'detail';

export function CaskBrowser({ casks, title, onInstall, onViewDetail, mode }: CaskBrowserProps) {
  const { exit } = useApp();
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [view, setView] = useState<View>('list');
  const [detail, setDetail] = useState<CaskDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const pageSize = Math.min(casks.length, 15);
  const scrollOffset = Math.max(0, Math.min(cursor - Math.floor(pageSize / 2), casks.length - pageSize));
  const visibleCasks = casks.slice(scrollOffset, scrollOffset + pageSize);

  const toggleSelect = useCallback((token: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(token)) next.delete(token);
      else next.add(token);
      return next;
    });
  }, []);

  const installSelected = useCallback(() => {
    if (selected.size === 0) {
      setMessage('Nothing selected. Use [space] to pick casks first.');
      return;
    }
    onInstall(Array.from(selected));
  }, [selected, onInstall]);

  const installSingle = useCallback((token: string) => {
    onInstall([token]);
  }, [onInstall]);

  const viewDetail = useCallback(async () => {
    const cask = casks[cursor];
    if (!cask) return;
    setLoading(true);
    try {
      const result = await onViewDetail(cask.token);
      if (result) {
        setDetail(result);
        setView('detail');
      } else {
        setMessage(`Could not load details for ${cask.token}`);
      }
    } finally {
      setLoading(false);
    }
  }, [cursor, casks, onViewDetail]);

  useInput((input, key) => {
    setMessage('');

    if (loading) return;

    if (view === 'detail') {
      if (input === 'q' || key.escape || key.return) {
        setView('list');
        setDetail(null);
      }
      return;
    }

    // Navigation
    if (key.upArrow || input === 'k') {
      setCursor(prev => Math.max(0, prev - 1));
    } else if (key.downArrow || input === 'j') {
      setCursor(prev => Math.min(casks.length - 1, prev + 1));
    }

    // Toggle selection
    else if (input === ' ') {
      const cask = casks[cursor];
      if (cask) toggleSelect(cask.token);
    }

    // Select all / none
    else if (input === 'a') {
      setSelected(new Set(casks.map(c => c.token)));
    } else if (input === 'n') {
      setSelected(new Set());
    }

    // Install
    else if (input === 'i') {
      installSelected();
    } else if (input === 'x') {
      const cask = casks[cursor];
      if (cask) installSingle(cask.token);
    }

    // View detail
    else if (key.return) {
      viewDetail();
    }

    // Quit
    else if (input === 'q') {
      exit();
    }
  });

  if (loading) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="yellow">Loading...</Text>
      </Box>
    );
  }

  if (view === 'detail' && detail) {
    return <DetailView detail={detail} />;
  }

  return (
    <Box flexDirection="column">
      {/* Header */}
      <Box paddingX={1} paddingTop={1}>
        <Text bold color="#FF6B35">{title}</Text>
        {casks.length > pageSize && (
          <Text dimColor> ({scrollOffset + 1}-{Math.min(scrollOffset + pageSize, casks.length)} of {casks.length})</Text>
        )}
      </Box>

      {/* Cask list */}
      <Box flexDirection="column" paddingX={1}>
        {visibleCasks.map((cask, i) => {
          const globalIdx = scrollOffset + i;
          const isCursor = globalIdx === cursor;
          const isSelected = selected.has(cask.token);
          const trendingCask = cask as TrendingCask;
          const desc = safe(cask.desc);

          return (
            <Box key={cask.token} flexDirection="column">
              <Box>
                <Text color={isCursor ? '#FF6B35' : undefined} bold={isCursor}>
                  {isCursor ? '>' : ' '} {isSelected ? '[x]' : '[ ]'}{' '}
                </Text>
                <Text bold={isCursor} color={isCursor ? 'white' : undefined}>
                  {safe(cask.name).padEnd(22)}
                </Text>
                {mode === 'trending' && trendingCask.velocity != null && (
                  <Text color={trendingCask.velocity >= 2 ? 'green' : 'yellow'}>
                    {`${trendingCask.velocity >= 1.5 ? '▲' : ' '} ${trendingCask.velocity.toFixed(1)}x  `.padEnd(10)}
                  </Text>
                )}
                <Text color="cyan">{safe(cask.category || 'Uncategorized').padEnd(18)}</Text>
                <Text color={cask.aiScore == null ? 'gray' : cask.aiScore >= 8 ? 'green' : cask.aiScore >= 6 ? 'yellow' : 'red'} dimColor={cask.aiScore == null}>
                  {cask.aiScore != null ? cask.aiScore.toFixed(1).padEnd(6) : '  -   '}
                </Text>
                <Text color="magenta">{formatCount(cask.installCount30d).padStart(6)}/mo</Text>
              </Box>
              {isCursor && desc && (
                <Box paddingLeft={6}>
                  <Text dimColor>{desc.slice(0, 70)}{desc.length > 70 ? '...' : ''}</Text>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Cart */}
      <Box paddingX={1} paddingTop={1} flexDirection="column">
        <Box>
          <Text bold dimColor>{'─'.repeat(50)}</Text>
        </Box>
        <Box>
          <Text bold color={selected.size > 0 ? 'green' : undefined}>
            Cart ({selected.size})
          </Text>
          {selected.size > 0 && (
            <Text dimColor>
              {'  '}
              {Array.from(selected).slice(0, 5).join(', ')}
              {selected.size > 5 ? `, +${selected.size - 5} more` : ''}
            </Text>
          )}
        </Box>
      </Box>

      {/* Hotkeys */}
      <Box paddingX={1} paddingBottom={1}>
        <Text dimColor>
          [space] toggle  [a]ll  [n]one  [i]nstall cart  [x] install cursor  [enter] details  [q]uit
        </Text>
      </Box>

      {/* Messages */}
      {message && (
        <Box paddingX={1}>
          <Text color="yellow">{message}</Text>
        </Box>
      )}
    </Box>
  );
}

function DetailView({ detail }: { detail: CaskDetail }) {
  const { cask, review, github } = detail;

  return (
    <Box flexDirection="column" padding={1}>
      <Box>
        <Text bold color="#FF6B35">{safe(cask.name)}</Text>
        {cask.version && <Text dimColor>  v{safe(cask.version)}</Text>}
      </Box>
      <Text color="cyan">{safe(cask.category) || 'Uncategorized'}</Text>

      {cask.desc && (
        <Box paddingTop={1}>
          <Text>{safe(cask.desc)}</Text>
        </Box>
      )}

      <Box paddingTop={1} gap={2}>
        <Text><Text bold>Score:</Text> <Text color={cask.aiScore == null ? 'gray' : cask.aiScore >= 8 ? 'green' : cask.aiScore >= 6 ? 'yellow' : 'red'}>{cask.aiScore?.toFixed(1) ?? '-'}</Text></Text>
        <Text><Text bold>30d:</Text> <Text color="magenta">{formatCount(cask.installCount30d)}</Text></Text>
        <Text><Text bold>90d:</Text> <Text color="magenta">{formatCount(cask.installCount90d)}</Text></Text>
        <Text><Text bold>365d:</Text> <Text color="magenta">{formatCount(cask.installCount365d)}</Text></Text>
      </Box>

      {cask.homepage && (
        <Text><Text bold>Homepage:</Text> <Text color="blue">{safe(cask.homepage)}</Text></Text>
      )}

      {github && (
        <Box flexDirection="column" paddingTop={1}>
          <Text bold dimColor>-- GitHub --</Text>
          <Box gap={2}>
            {github.stars != null && <Text>★ {formatCount(github.stars)}</Text>}
            {github.forks != null && <Text>⑂ {formatCount(github.forks)}</Text>}
            {github.openIssues != null && <Text>◉ {github.openIssues} issues</Text>}
            {github.license && <Text>⚖ {safe(github.license)}</Text>}
          </Box>
          {github.repoUrl && <Text color="blue">{safe(github.repoUrl)}</Text>}
        </Box>
      )}

      {review && (
        <Box flexDirection="column" paddingTop={1}>
          <Text bold dimColor>-- AI Review --</Text>
          <Text>{safe(review.summary)}</Text>

          {parseList(review.pros).length > 0 && (
            <Box flexDirection="column" paddingTop={1}>
              <Text bold color="green">Pros:</Text>
              {parseList(review.pros).map((p, i) => (
                <Text key={i} color="green">  + {p.replace(/^[•\-+]\s*/, '')}</Text>
              ))}
            </Box>
          )}

          {parseList(review.cons).length > 0 && (
            <Box flexDirection="column">
              <Text bold color="red">Cons:</Text>
              {parseList(review.cons).map((c, i) => (
                <Text key={i} color="red">  - {c.replace(/^[•\-+]\s*/, '')}</Text>
              ))}
            </Box>
          )}
        </Box>
      )}

      <Box paddingTop={1}>
        <Text bold>Install: </Text>
        <Text color="green">brew install --cask {safe(cask.token)}</Text>
      </Box>

      <Box paddingTop={1}>
        <Text dimColor>[enter/q/esc] back to list</Text>
      </Box>
    </Box>
  );
}
