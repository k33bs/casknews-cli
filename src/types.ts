export interface Cask {
  token: string;
  name: string;
  desc: string | null;
  homepage: string | null;
  version: string | null;
  category: string | null;
  aiScore: number | null;
  compositeScore: number | null;
  installCount30d: number;
  installCount90d: number;
  installCount365d: number;
  firstSeen: string;
  lastUpdated: string;
  deprecated: boolean;
  autoUpdates: boolean;
}

export interface CaskReview {
  summary: string;
  whatItDoes: string | null;
  maturity: string | null;
  pros: string | null;
  cons: string | null;
}

export interface CaskGithub {
  repoUrl: string | null;
  stars: number | null;
  forks: number | null;
  openIssues: number | null;
  license: string | null;
  language: string | null;
  lastCommit: string | null;
}

export interface CaskDetail {
  cask: Cask;
  review: CaskReview | null;
  github: CaskGithub | null;
}

export interface TrendingCask extends Cask {
  velocity: number;
  trendScore: number;
}

export interface AuthConfig {
  apiToken: string;
  userId: string;
  syncedAt?: string;
}

export interface AuthStartResponse {
  deviceCode: string;
  userCode: string;
  verifyUrl: string;
  expiresIn: number;
  interval: number;
}

export interface AuthPollResponse {
  status: 'pending' | 'granted' | 'expired';
  token?: string;
  userId?: string;
  error?: string;
}

export interface SyncResponse {
  stackId: string;
  stackUrl: string;
  caskCount: number;
}
