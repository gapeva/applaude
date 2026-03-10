// ─── Auth & User ─────────────────────────────────────────
export interface GitHubUser {
  id: number
  login: string
  name: string
  avatar_url: string
  email: string | null
  html_url: string
}

export interface AuthState {
  user: GitHubUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

// ─── Repo & Session ──────────────────────────────────────
export interface Repository {
  id: number
  name: string
  full_name: string
  html_url: string
  clone_url: string
  default_branch: string
  language: string | null
  private: boolean
}

export interface Session {
  id: string
  user_id: number
  repo: Repository
  focus_prompt: string
  status: SessionStatus
  branch_mode: BranchMode
  sandbox_path: string
  created_at: string
  updated_at: string
}

export type SessionStatus =
  | 'initializing'
  | 'cloning'
  | 'environment_ready'
  | 'attacking'
  | 'healing'
  | 'review'
  | 'pushing'
  | 'completed'
  | 'error'

export type BranchMode = 'main' | 'applaude/fix'

// ─── Agent Events (WebSocket) ─────────────────────────────
export type AgentEventType =
  | 'log'
  | 'file_update'
  | 'metric_update'
  | 'status_change'
  | 'fix_ready'
  | 'push_complete'
  | 'error'

export interface AgentEvent {
  type: AgentEventType
  agent: 'destroyer' | 'surgeon' | 'orchestrator' | 'system'
  timestamp: string
  payload: LogPayload | FileUpdatePayload | MetricPayload | StatusPayload | FixPayload
}

export interface LogPayload {
  message: string
  level: 'info' | 'success' | 'warning' | 'error' | 'default'
}

export interface FileUpdatePayload {
  file_path: string
  content: string
  language: string
  change_description: string
}

export interface MetricPayload {
  total_agents: number
  active_agents: number
  requests_per_second: number
  errors_per_second: number
  avg_latency_ms: number
  pass_count: number
  fail_count: number
  routes_tested: RouteMetric[]
}

export interface RouteMetric {
  route: string
  method: string
  pass: number
  fail: number
  avg_ms: number
}

export interface StatusPayload {
  status: SessionStatus
  message: string
}

export interface FixPayload {
  files_changed: string[]
  explanation: string
  test_results: {
    passed: boolean
    summary: string
    details: string[]
  }
}

// ─── Terminal Log Entry ───────────────────────────────────
export interface TerminalEntry {
  id: string
  timestamp: string
  agent: string
  message: string
  level: LogPayload['level']
}

// ─── Pricing ─────────────────────────────────────────────
export type PlanType = 'monthly' | 'yearly'

export interface Plan {
  id: PlanType
  name: string
  price: number
  period: string
  features: string[]
  highlighted?: boolean
}

// ─── Subscription ─────────────────────────────────────────
export interface Subscription {
  id: string
  user_id: number
  plan: PlanType
  status: 'active' | 'cancelled' | 'expired'
  expires_at: string
}
