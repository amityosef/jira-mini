import { ISSUE_STATUSES } from '@/types'
import type {
  ActivityEvent,
  Issue,
  IssuePriority,
  IssueStatus,
  IssueType,
  Sprint,
  StoryPoints,
  TeamMember,
  Workspace,
} from '@/types'

export type MockDatabase = {
  version: 1
  workspace: Workspace
  members: TeamMember[]
  sprints: Sprint[]
  issues: Issue[]
  activity: ActivityEvent[]
  nextIssueNumber: number
}

type SeedIssue = {
  number: number
  title: string
  description: string
  status: IssueStatus
  priority: IssuePriority
  type: IssueType
  points: StoryPoints
  assigneeId: string | null
  sprintId: string | null
  labels: string[]
  createdDaysAgo: number
}

type SeedComment = {
  issueNumber: number
  authorId: string
  body: string
  hoursAfterCreation: number
}

const DAY = 86_400_000
const HOUR = 3_600_000
const ISSUE_PREFIX = 'SF'

const MEMBERS: TeamMember[] = [
  {
    id: 'usr-maya',
    name: 'Maya Cohen',
    initials: 'MC',
    role: 'Engineering Manager',
    avatarTone: 'indigo',
  },
  {
    id: 'usr-daniel',
    name: 'Daniel Levi',
    initials: 'DL',
    role: 'Senior Frontend Engineer',
    avatarTone: 'sky',
  },
  {
    id: 'usr-priya',
    name: 'Priya Raman',
    initials: 'PR',
    role: 'Backend Engineer',
    avatarTone: 'emerald',
  },
  {
    id: 'usr-lucas',
    name: 'Lucas Martins',
    initials: 'LM',
    role: 'Full-stack Engineer',
    avatarTone: 'amber',
  },
  {
    id: 'usr-amara',
    name: 'Amara Okafor',
    initials: 'AO',
    role: 'Product Designer',
    avatarTone: 'rose',
  },
  { id: 'usr-jonas', name: 'Jonas Weber', initials: 'JW', role: 'QA Engineer', avatarTone: 'teal' },
  {
    id: 'usr-noa',
    name: 'Noa Shapiro',
    initials: 'NS',
    role: 'Staff Engineer',
    avatarTone: 'violet',
  },
]

const SEED_ISSUES: SeedIssue[] = [
  {
    number: 101,
    title: 'Move session tokens to HttpOnly cookies',
    description:
      'Tokens currently live in localStorage and are readable by any injected script. Issue them as HttpOnly, Secure, SameSite=Lax cookies and rotate on privilege change.',
    status: 'done',
    priority: 'high',
    type: 'feature',
    points: 8,
    assigneeId: 'usr-noa',
    sprintId: 'sprint-23',
    labels: ['security', 'auth'],
    createdDaysAgo: 24,
  },
  {
    number: 102,
    title: 'Add CSRF protection to account forms',
    description:
      'Double-submit cookie pattern for every state-changing account endpoint, including the profile and address forms.',
    status: 'done',
    priority: 'high',
    type: 'feature',
    points: 5,
    assigneeId: 'usr-priya',
    sprintId: 'sprint-23',
    labels: ['security'],
    createdDaysAgo: 23,
  },
  {
    number: 103,
    title: 'Lock accounts after 10 failed sign-in attempts',
    description:
      'Temporary lockout with exponential back-off and an email notification to the account owner.',
    status: 'done',
    priority: 'medium',
    type: 'feature',
    points: 3,
    assigneeId: 'usr-daniel',
    sprintId: 'sprint-23',
    labels: ['auth'],
    createdDaysAgo: 22,
  },
  {
    number: 104,
    title: 'Upgrade the storefront to React 19 and enable the React Compiler',
    description:
      'Remove forwardRef wrappers, migrate context providers to the direct provider syntax and delete hand-written useMemo/useCallback once the compiler is on.',
    status: 'done',
    priority: 'medium',
    type: 'chore',
    points: 8,
    assigneeId: 'usr-noa',
    sprintId: 'sprint-24',
    labels: ['platform'],
    createdDaysAgo: 12,
  },
  {
    number: 106,
    title: 'Announce cart updates to screen readers',
    description:
      'Quantity changes and removals happen silently. Add a polite live region that summarises the new cart total.',
    status: 'done',
    priority: 'medium',
    type: 'feature',
    points: 2,
    assigneeId: 'usr-amara',
    sprintId: 'sprint-24',
    labels: ['a11y', 'cart'],
    createdDaysAgo: 11,
  },
  {
    number: 108,
    title: 'Webhook retries exceed the provider’s 10s timeout',
    description:
      'The provider retries https://api.acme-payments.internal/v2/webhooks/stripe/events?delivery=evt_3Q8xY2LkR9vT1mNpZcW4bH7a&attempt=4 because the handler blocks on the ledger write. Acknowledge first, then process asynchronously.',
    status: 'in_review',
    priority: 'high',
    type: 'bug',
    points: 3,
    assigneeId: 'usr-priya',
    sprintId: 'sprint-24',
    labels: ['webhooks', 'payments'],
    createdDaysAgo: 10,
  },
  {
    number: 109,
    title: 'Rate-limit the password reset endpoint',
    description:
      'Five requests per hour per account and per IP, with a generic response so the endpoint cannot be used to enumerate accounts.',
    status: 'done',
    priority: 'high',
    type: 'chore',
    points: 3,
    assigneeId: 'usr-priya',
    sprintId: 'sprint-24',
    labels: ['security', 'auth'],
    createdDaysAgo: 10,
  },
  {
    number: 111,
    title: 'Remove the legacy-checkout feature flag',
    description:
      'The new checkout has been at 100% for three weeks. Delete the flag, the old route and its tests.',
    status: 'done',
    priority: 'low',
    type: 'chore',
    points: 1,
    assigneeId: 'usr-lucas',
    sprintId: 'sprint-24',
    labels: ['cleanup'],
    createdDaysAgo: 9,
  },
  {
    number: 112,
    title: 'Payment intent created twice when “Place order” is double-clicked',
    description:
      'On slow connections the second click lands before the button disables, creating two payment intents and occasionally charging twice.',
    status: 'in_progress',
    priority: 'urgent',
    type: 'bug',
    points: 5,
    assigneeId: 'usr-daniel',
    sprintId: 'sprint-24',
    labels: ['checkout', 'payments'],
    createdDaysAgo: 8,
  },
  {
    number: 113,
    title: 'Sentry: TypeError reading ‘currency’ of undefined in PriceTag',
    description:
      'Fingerprint 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08 — 1.2k events in 24h, all from the bundle-pricing experiment.',
    status: 'done',
    priority: 'urgent',
    type: 'bug',
    points: 2,
    assigneeId: 'usr-daniel',
    sprintId: 'sprint-24',
    labels: ['pricing'],
    createdDaysAgo: 8,
  },
  {
    number: 115,
    title: 'Add idempotency keys to POST /v2/orders',
    description:
      'Accept an Idempotency-Key header, persist the first response for 24 hours and replay it for retries with the same key.',
    status: 'in_progress',
    priority: 'high',
    type: 'feature',
    points: 5,
    assigneeId: 'usr-priya',
    sprintId: 'sprint-24',
    labels: ['api', 'payments'],
    createdDaysAgo: 8,
  },
  {
    number: 117,
    title: 'Keyboard trap in the coupon code modal',
    description:
      'Shift+Tab from the first field moves focus to the page behind the modal, and Escape does not close it.',
    status: 'in_review',
    priority: 'high',
    type: 'bug',
    points: 2,
    assigneeId: 'usr-amara',
    sprintId: 'sprint-24',
    labels: ['a11y', 'checkout'],
    createdDaysAgo: 7,
  },
  {
    number: 118,
    title: 'Flaky e2e: cart badge shows a stale count after sign-in',
    description:
      'Fails roughly one run in eight on CI. The badge reads from a cache that is not invalidated when the guest cart merges into the account cart.',
    status: 'todo',
    priority: 'high',
    type: 'bug',
    points: 2,
    assigneeId: 'usr-jonas',
    sprintId: 'sprint-24',
    labels: ['e2e', 'cart'],
    createdDaysAgo: 7,
  },
  {
    number: 119,
    title: 'Persist the cart across devices for signed-in shoppers',
    description:
      'Merge the device cart into the account cart on sign-in and resolve quantity conflicts by keeping the larger value.',
    status: 'in_progress',
    priority: 'medium',
    type: 'feature',
    points: 8,
    assigneeId: 'usr-lucas',
    sprintId: 'sprint-24',
    labels: ['cart'],
    createdDaysAgo: 7,
  },
  {
    number: 121,
    title: 'Disable “Place order” while the payment intent is pending',
    description:
      'Show progress in the button itself and keep it focusable with aria-disabled so screen reader users hear why it is unavailable.',
    status: 'todo',
    priority: 'urgent',
    type: 'bug',
    points: 1,
    assigneeId: 'usr-daniel',
    sprintId: 'sprint-24',
    labels: ['checkout', 'a11y'],
    createdDaysAgo: 6,
  },
  {
    number: 125,
    title: 'Inline validation for the shipping address form',
    description:
      'Validate on blur, keep what the shopper typed when the server rejects the address, and link every error to its field.',
    status: 'todo',
    priority: 'medium',
    type: 'feature',
    points: 3,
    assigneeId: 'usr-lucas',
    sprintId: 'sprint-24',
    labels: ['checkout', 'forms'],
    createdDaysAgo: 6,
  },
  {
    number: 129,
    title: 'Respect prefers-reduced-motion in the order confirmation animation',
    description:
      'Replace the confetti burst with a static check mark when reduced motion is requested.',
    status: 'todo',
    priority: 'low',
    type: 'chore',
    points: 1,
    assigneeId: 'usr-amara',
    sprintId: 'sprint-24',
    labels: ['a11y', 'motion'],
    createdDaysAgo: 5,
  },
  {
    number: 131,
    title: 'Retry budget metrics on the payments dashboard',
    description:
      'Chart retries per provider and alert when more than 5% of requests need a second attempt.',
    status: 'backlog',
    priority: 'medium',
    type: 'feature',
    points: 3,
    assigneeId: 'usr-priya',
    sprintId: 'sprint-24',
    labels: ['payments', 'observability'],
    createdDaysAgo: 4,
  },
  {
    number: 132,
    title: 'Document idempotency guarantees for partner integrations',
    description:
      'Explain key scope, retention and replay semantics in the developer portal, with examples for each SDK.',
    status: 'backlog',
    priority: 'low',
    type: 'chore',
    points: 2,
    assigneeId: null,
    sprintId: 'sprint-24',
    labels: ['docs', 'api'],
    createdDaysAgo: 4,
  },
  {
    number: 133,
    title: 'Migrate account settings pages to design-system tokens',
    description:
      'Replace hard-coded colours and spacing with semantic tokens so the pages support dark mode and density settings.',
    status: 'todo',
    priority: 'high',
    type: 'feature',
    points: 8,
    assigneeId: 'usr-amara',
    sprintId: 'sprint-25',
    labels: ['design-system'],
    createdDaysAgo: 5,
  },
  {
    number: 134,
    title: 'Replace moment.js with Temporal across the account area',
    description:
      'Drops 67 kB from the account bundle. Use the polyfill until native support lands everywhere we ship.',
    status: 'todo',
    priority: 'medium',
    type: 'chore',
    points: 5,
    assigneeId: 'usr-noa',
    sprintId: 'sprint-25',
    labels: ['platform', 'bundle-size'],
    createdDaysAgo: 5,
  },
  {
    number: 135,
    title: 'Visual regression tests for Button, Input and Dialog',
    description: 'Capture light, dark, RTL and forced-colors snapshots for every variant.',
    status: 'backlog',
    priority: 'medium',
    type: 'chore',
    points: 3,
    assigneeId: 'usr-jonas',
    sprintId: 'sprint-25',
    labels: ['design-system', 'testing'],
    createdDaysAgo: 4,
  },
  {
    number: 136,
    title: 'RTL: mirror directional icons in breadcrumbs and pagination',
    description:
      'Chevrons point the wrong way in Hebrew and Arabic. Flip them with logical transforms instead of separate assets.',
    status: 'todo',
    priority: 'medium',
    type: 'bug',
    points: 2,
    assigneeId: 'usr-lucas',
    sprintId: 'sprint-25',
    labels: ['i18n', 'rtl'],
    createdDaysAgo: 4,
  },
  {
    number: 137,
    title: 'Dark mode tokens for data tables',
    description:
      'Zebra striping and selected rows lose contrast in dark mode. Add surface tokens for both.',
    status: 'backlog',
    priority: 'low',
    type: 'feature',
    points: 3,
    assigneeId: 'usr-amara',
    sprintId: 'sprint-25',
    labels: ['design-system'],
    createdDaysAgo: 3,
  },
  {
    number: 138,
    title: 'Empty states for order history and saved addresses',
    description: 'Each empty state explains why it is empty and offers the next step.',
    status: 'backlog',
    priority: 'low',
    type: 'feature',
    points: 2,
    assigneeId: 'usr-lucas',
    sprintId: 'sprint-25',
    labels: ['ux'],
    createdDaysAgo: 3,
  },
  {
    number: 139,
    title: 'Audit focus order on the profile edit form',
    description:
      'The avatar uploader receives focus after the save button. Fix DOM order rather than using positive tabindex.',
    status: 'todo',
    priority: 'medium',
    type: 'chore',
    points: 1,
    assigneeId: 'usr-jonas',
    sprintId: 'sprint-25',
    labels: ['a11y'],
    createdDaysAgo: 3,
  },
  {
    number: 140,
    title: 'Deprecate the v1 address autocomplete API',
    description:
      'Return a Sunset header, email the four partners still calling it and remove it after 90 days.',
    status: 'backlog',
    priority: 'low',
    type: 'chore',
    points: 2,
    assigneeId: 'usr-priya',
    sprintId: 'sprint-25',
    labels: ['api'],
    createdDaysAgo: 2,
  },
  {
    number: 141,
    title: 'Add OpenTelemetry tracing to the checkout service',
    description:
      'Propagate trace context from the storefront through payments and the ledger so a slow order can be followed end to end.',
    status: 'backlog',
    priority: 'high',
    type: 'feature',
    points: 5,
    assigneeId: 'usr-noa',
    sprintId: 'sprint-26',
    labels: ['observability'],
    createdDaysAgo: 2,
  },
  {
    number: 142,
    title: 'Fail CI when product page LCP exceeds 2.5s',
    description:
      'Run the lab test on a throttled mid-range profile and block merges that regress the budget.',
    status: 'backlog',
    priority: 'medium',
    type: 'chore',
    points: 3,
    assigneeId: 'usr-daniel',
    sprintId: 'sprint-26',
    labels: ['performance'],
    createdDaysAgo: 2,
  },
  {
    number: 143,
    title: 'Index orders.created_at for range scans',
    description: 'The admin order search does a sequential scan on 40M rows for date filters.',
    status: 'backlog',
    priority: 'medium',
    type: 'chore',
    points: 2,
    assigneeId: 'usr-priya',
    sprintId: 'sprint-26',
    labels: ['database', 'performance'],
    createdDaysAgo: 2,
  },
  {
    number: 144,
    title: 'Alert when the webhook retry queue exceeds 500 jobs',
    description: 'Page the on-call engineer when depth stays above the threshold for five minutes.',
    status: 'backlog',
    priority: 'medium',
    type: 'feature',
    points: 2,
    assigneeId: 'usr-priya',
    sprintId: 'sprint-26',
    labels: ['observability', 'webhooks'],
    createdDaysAgo: 1,
  },
  {
    number: 145,
    title: 'CSV export of invoices times out above 10k rows',
    description:
      'Stream the export instead of building it in memory, and email a download link for very large ranges.',
    status: 'backlog',
    priority: 'medium',
    type: 'bug',
    points: 5,
    assigneeId: null,
    sprintId: null,
    labels: ['billing'],
    createdDaysAgo: 14,
  },
  {
    number: 146,
    title: 'Abandoned-cart email ignores the unsubscribe preference',
    description:
      'Marketing preferences are read from a stale replica. This is a compliance issue and needs a fix before the next campaign.',
    status: 'backlog',
    priority: 'high',
    type: 'bug',
    points: 3,
    assigneeId: null,
    sprintId: null,
    labels: ['email', 'compliance'],
    createdDaysAgo: 9,
  },
  {
    number: 147,
    title: 'Audit third-party scripts for CSP violations',
    description:
      'Collect violation reports for two weeks, then move to an enforcing policy with nonces.',
    status: 'backlog',
    priority: 'medium',
    type: 'chore',
    points: 3,
    assigneeId: null,
    sprintId: null,
    labels: ['security'],
    createdDaysAgo: 8,
  },
  {
    number: 148,
    title: 'Support Apple Pay on the express checkout sheet',
    description: 'Requires domain verification and a new payment method in the ledger.',
    status: 'backlog',
    priority: 'low',
    type: 'feature',
    points: 8,
    assigneeId: null,
    sprintId: null,
    labels: ['payments'],
    createdDaysAgo: 6,
  },
  {
    number: 149,
    title: 'Per-locale currency formatting in transactional emails',
    description:
      'Emails always render amounts as en-US. Use the shopper’s locale and the order currency.',
    status: 'backlog',
    priority: 'low',
    type: 'feature',
    points: 2,
    assigneeId: null,
    sprintId: null,
    labels: ['i18n', 'email'],
    createdDaysAgo: 5,
  },
  {
    number: 150,
    title: 'Investigate heap growth in ssr-worker-2026-10-14T03:12:44Z.heapsnapshot',
    description:
      'Retained size grows by roughly 40 MB per hour under steady traffic. The snapshot points at a module-level cache keyed by request URL.',
    status: 'backlog',
    priority: 'medium',
    type: 'bug',
    points: 3,
    assigneeId: null,
    sprintId: null,
    labels: ['performance'],
    createdDaysAgo: 3,
  },
]

const SEED_COMMENTS: SeedComment[] = [
  {
    issueNumber: 112,
    authorId: 'usr-jonas',
    body: 'Reproduced on Safari with a throttled connection: the second click lands about 300 ms before the button disables.',
    hoursAfterCreation: 5,
  },
  {
    issueNumber: 112,
    authorId: 'usr-daniel',
    body: 'Moving the disable into the click handler and adding an idempotency key on the request. Pairing with SF-115.',
    hoursAfterCreation: 30,
  },
  {
    issueNumber: 108,
    authorId: 'usr-priya',
    body: 'Ledger write p95 is 7.8 s. Plan: acknowledge with 202, enqueue, process in the worker.',
    hoursAfterCreation: 20,
  },
  {
    issueNumber: 117,
    authorId: 'usr-amara',
    body: 'Switched the modal to a native dialog element. Focus now stays inside and Escape closes it.',
    hoursAfterCreation: 40,
  },
  {
    issueNumber: 104,
    authorId: 'usr-noa',
    body: 'Compiler is on in production. Deleted 212 manual memoisation calls with no measurable regressions.',
    hoursAfterCreation: 200,
  },
  {
    issueNumber: 146,
    authorId: 'usr-maya',
    body: 'Legal asked for this to land before the November campaign. Pulling into the next sprint if capacity allows.',
    hoursAfterCreation: 26,
  },
]

function atStartOfDay(now: Date, dayOffset: number): Date {
  const date = new Date(now)
  date.setHours(9, 0, 0, 0)
  return new Date(date.getTime() + dayOffset * DAY)
}

function createSprints(now: Date): Sprint[] {
  const sprint = (
    id: string,
    name: string,
    goal: string,
    startOffset: number,
    state: Sprint['state'],
  ): Sprint => ({
    id,
    name,
    goal,
    startDate: atStartOfDay(now, startOffset).toISOString(),
    endDate: atStartOfDay(now, startOffset + 14).toISOString(),
    state,
  })
  return [
    sprint(
      'sprint-23',
      'Sprint 23',
      'Harden authentication and session handling',
      -20,
      'completed',
    ),
    sprint(
      'sprint-24',
      'Sprint 24',
      'Make checkout resilient to retries and partial failures',
      -6,
      'active',
    ),
    sprint(
      'sprint-25',
      'Sprint 25',
      'Ship the design-system migration for account pages',
      8,
      'planned',
    ),
    sprint('sprint-26', 'Sprint 26', 'Observability and performance budgets', 22, 'planned'),
  ]
}

function toIssue(seed: SeedIssue, now: Date): Issue {
  const createdAt = new Date(now.getTime() - seed.createdDaysAgo * DAY).toISOString()
  const updatedAt = new Date(now.getTime() - HOUR * ((seed.number % 7) + 1)).toISOString()
  return {
    id: `${ISSUE_PREFIX}-${seed.number}`,
    title: seed.title,
    description: seed.description,
    status: seed.status,
    priority: seed.priority,
    type: seed.type,
    points: seed.points,
    assigneeId: seed.assigneeId,
    sprintId: seed.sprintId,
    labels: seed.labels,
    createdAt,
    updatedAt,
  }
}

function statusHistory(issue: Issue, actorId: string, now: Date): ActivityEvent[] {
  const steps = ISSUE_STATUSES.slice(0, ISSUE_STATUSES.indexOf(issue.status) + 1)
  const start = new Date(issue.createdAt).getTime()
  const span = Math.max(now.getTime() - 2 * HOUR - start, HOUR)
  const created: ActivityEvent = {
    id: `act-${issue.id}-0`,
    issueId: issue.id,
    actorId,
    occurredAt: issue.createdAt,
    kind: 'created',
  }
  const transitions = steps.slice(1).map((to, index): ActivityEvent => ({
    id: `act-${issue.id}-${index + 1}`,
    issueId: issue.id,
    actorId,
    occurredAt: new Date(start + (span * (index + 1)) / steps.length).toISOString(),
    kind: 'status_changed',
    from: steps[index] ?? 'backlog',
    to,
  }))
  return [created, ...transitions]
}

function seedComments(issues: Issue[]): ActivityEvent[] {
  return SEED_COMMENTS.flatMap((comment, index) => {
    const issue = issues.find(
      (candidate) => candidate.id === `${ISSUE_PREFIX}-${comment.issueNumber}`,
    )
    if (!issue) return []
    const occurredAt = new Date(
      new Date(issue.createdAt).getTime() + comment.hoursAfterCreation * HOUR,
    ).toISOString()
    return [
      {
        id: `act-comment-${index}`,
        issueId: issue.id,
        actorId: comment.authorId,
        occurredAt,
        kind: 'commented',
        body: comment.body,
      },
    ]
  })
}

export function createSeedDatabase(now: Date = new Date()): MockDatabase {
  const issues = SEED_ISSUES.map((seed) => toIssue(seed, now))
  const workspace: Workspace = {
    id: 'ws-acme',
    name: 'Acme Commerce',
    teamName: 'Checkout Platform',
    issuePrefix: ISSUE_PREFIX,
    currentUserId: 'usr-maya',
  }
  const activity = [
    ...issues.flatMap((issue) =>
      statusHistory(issue, issue.assigneeId ?? workspace.currentUserId, now),
    ),
    ...seedComments(issues),
  ]
  return {
    version: 1,
    workspace,
    members: MEMBERS,
    sprints: createSprints(now),
    issues,
    activity,
    nextIssueNumber: Math.max(...SEED_ISSUES.map((seed) => seed.number)) + 1,
  }
}
