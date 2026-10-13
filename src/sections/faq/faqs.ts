import type { AgentId } from '@/data/agents'

export interface Faq {
  id: string
  question: string
  /** Short label for the question list and related chips. */
  short: string
  /** Paragraphs separated by a blank line; `backticks` render as code. */
  answer: string
  agent: AgentId
  /** What the agent "reads" while thinking. */
  sources: string[]
  keywords: string[]
  related: string[]
}

export const FAQS: Faq[] = [
  {
    id: 'main',
    question: 'Does Vesper push to main on its own?',
    short: 'Pushing to main',
    answer:
      'No. Every change lands on a branch as a pull request, and merges and deploys wait for your approval.\n\nIf you want, you can allow auto-merge for low-risk paths, like dependency patches with green tests. That policy lives in `vesper.policy.ts` and every merge is written to the audit log.',
    agent: 'deploy',
    sources: ['docs/guardrails.md', 'vesper.policy.ts'],
    keywords: ['main', 'push', 'merge', 'approve', 'approval', 'permission', 'auto', 'control'],
    related: ['breaks', 'stuck'],
  },
  {
    id: 'training',
    question: 'Is my code used to train AI models?',
    short: 'Code privacy',
    answer:
      'Never. Your code is processed inside isolated sandboxes and is never used to train models, ours or anyone else’s.\n\nRetention is configurable down to zero, secrets are redacted before anything leaves the sandbox, and on Constellation everything runs inside your own cloud.',
    agent: 'qa',
    sources: ['security/data-handling.md', 'trust.vesper.dev'],
    keywords: ['train', 'training', 'privacy', 'private', 'data', 'secure', 'security', 'retention', 'secret', 'model'],
    related: ['cloud', 'main'],
  },
  {
    id: 'stuck',
    question: 'What happens when an agent gets stuck?',
    short: 'When an agent gets stuck',
    answer:
      'It tries a different approach, up to three times. If it still can’t get the tests green, it stops instead of guessing.\n\nYou get a short write-up in Slack or Linear: what it tried, where it got stuck and the branch with its work so far, so you can pick it up or point it in a new direction.',
    agent: 'development',
    sources: ['docs/agents/builder.md', 'runbooks/escalation.md'],
    keywords: ['stuck', 'fail', 'fails', 'error', 'wrong', 'mistake', 'hallucinate', 'bug', 'help'],
    related: ['main', 'hours'],
  },
  {
    id: 'stack',
    question: 'Which languages and stacks does it support?',
    short: 'Languages & stacks',
    answer:
      'TypeScript, Python, Go, Rust, Java, Kotlin, Ruby, PHP and Swift are first-class, and monorepos are fine. If your toolchain runs in a Linux container, the crew can build and test it.\n\nScout learns your conventions from the repo itself (linting, folder structure, naming), so new code reads like the code your team already writes.',
    agent: 'research',
    sources: ['docs/languages.md', 'acme/web-app · .eslintrc'],
    keywords: ['language', 'languages', 'stack', 'framework', 'typescript', 'python', 'go', 'rust', 'java', 'monorepo', 'support'],
    related: ['integrations', 'training'],
  },
  {
    id: 'hours',
    question: 'How is an agent-hour counted?',
    short: 'Agent-hours',
    answer:
      'An agent-hour is time an agent spends actively working in a sandbox. Waiting for your review or for CI is free.\n\nA typical ticket takes two to four agent-hours. On Night Shift, unused hours roll over for one month, and extra hours cost `$0.20` each, with a spend cap you control.',
    agent: 'planning',
    sources: ['pricing/agent-hours.md', 'billing/usage.ts'],
    keywords: ['hour', 'hours', 'agent-hour', 'price', 'pricing', 'cost', 'billing', 'pay', 'expensive', 'budget', 'cap'],
    related: ['stuck', 'cloud'],
  },
  {
    id: 'integrations',
    question: 'Does it work with our CI, Linear and Slack?',
    short: 'Integrations',
    answer:
      'Yes. Vesper connects to GitHub, GitLab and Bitbucket, runs on top of GitHub Actions, CircleCI or Buildkite, and picks up work from Linear or Jira.\n\nUpdates and approvals arrive in Slack or Teams, and errors flow in from Sentry or Datadog. Anything custom can plug in over MCP.',
    agent: 'analysis',
    sources: ['docs/integrations.md', 'mcp.json'],
    keywords: ['ci', 'linear', 'jira', 'slack', 'teams', 'github', 'gitlab', 'bitbucket', 'sentry', 'datadog', 'integration', 'integrations', 'mcp', 'tools'],
    related: ['stack', 'breaks'],
  },
  {
    id: 'breaks',
    question: 'What if a deploy breaks production?',
    short: 'Broken deploys',
    answer:
      'Pilot ships behind a canary and watches error rate and p95 latency in every region. If either goes past your threshold, it rolls back automatically, usually within a minute.\n\nYou get an incident summary with the timeline, the suspected commit and a proposed fix, ready for review in the morning.',
    agent: 'deploy',
    sources: ['docs/deploys/canary.md', 'status.acme.dev'],
    keywords: ['deploy', 'deploys', 'production', 'prod', 'break', 'breaks', 'broken', 'rollback', 'incident', 'outage', 'downtime'],
    related: ['main', 'integrations'],
  },
  {
    id: 'cloud',
    question: 'Can we run Vesper in our own cloud?',
    short: 'Self-hosting',
    answer:
      'Yes. Constellation deploys the whole crew into your AWS, GCP or Azure account, so code and data never leave your network.\n\nYou get the same agents and guardrails, plus SSO, SCIM and audit export to your SIEM. Most teams are running within a week.',
    agent: 'deploy',
    sources: ['docs/self-hosting.md', 'terraform/vesper'],
    keywords: ['cloud', 'vpc', 'self', 'host', 'hosted', 'hosting', 'premise', 'aws', 'gcp', 'azure', 'enterprise', 'sso', 'compliance'],
    related: ['training', 'hours'],
  },
]

export const faqById = (id: string) => FAQS.find((f) => f.id === id)

/** Reply used when a typed question doesn't match anything we know. */
export const FALLBACK: Faq = {
  id: 'fallback',
  question: '',
  short: 'Ask a human',
  answer:
    'I couldn’t find that in our docs yet, so I’ve passed it to the humans on the team.\n\nYou’ll usually hear back within a day at `hello@vesper.dev`. In the meantime, one of the questions on the left might help.',
  agent: 'research',
  sources: ['docs/', 'changelog/'],
  keywords: [],
  related: ['main', 'hours'],
}

/** Lightweight keyword match for free-text questions (no network, no model). */
export function matchQuestion(input: string): Faq {
  const words = input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
  let best: Faq = FALLBACK
  let bestScore = 0
  for (const faq of FAQS) {
    const score = words.reduce((sum, w) => sum + (faq.keywords.some((k) => k === w || (w.length > 3 && k.startsWith(w))) ? 1 : 0), 0)
    if (score > bestScore) {
      best = faq
      bestScore = score
    }
  }
  return best
}
