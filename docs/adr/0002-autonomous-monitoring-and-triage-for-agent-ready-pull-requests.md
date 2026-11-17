# ADR 0002: Autonomous Monitoring and Triage for Agent-Ready Pull Requests

- **Status:** Accepted
- **Date:** 2026-11-16
- **Deciders:** Engineering Leadership, Repository Maintainers, Autonomous
  Agent Protocol Team
- **Scope:** Universal across all repositories utilizing autonomous agent
  workflows, CI/CD automation, and GitHub pull requests.

## Context and Problem Statement

In autonomous software engineering workflows, agents frequently create, update,
or take over pull requests labeled as `agent-ready` (typically two-way-door tasks
with easy-to-moderate complexity). Historically, once code was pushed and an
initial response rendered, agents would terminate execution or fail to actively
monitor the PR lifecycle.

This created several operational deficiencies:

1. **Unattended Review Comments:** Reviewers often leave review comments,
   request clarifications, or report visual bugs (e.g., deploy preview quirks,
   mobile touch behavior) that linger without prompt autonomous attention.
2. **Silent CI & Deployment Failures:** Flaky network calls, cloud worker
   deployments (e.g., Cloudflare/Alchemy preview URLs), or static code analysis
   jobs (Codacy, Semgrep) might complete asynchronously with warnings or
   failures after the agent has ended its turn.
3. **Ambiguity on Blocker Ownership:** Without active monitoring and periodic
   triage, maintainers must repeatedly re-prompt agents to check if a PR is
   ready, stuck, or waiting on human intervention.
4. **Lack of Lifecycle Accountability:** An agent's responsibility does not
   conclude merely upon `git push`; it extends until the PR is successfully
   validated, checks are green, preview deployments are verified, and human
   maintainers can merge with full confidence.

## Decision Drivers

- **Continuous Lifecycle Accountability:** An agent assigned to an
  `agent-ready` PR must remain attached to its lifecycle until merge or explicit
  handback.
- **Proactive Self-Healing:** Failures in automated CI checks, test suites, or
  review comments reporting reproducible defects must be triaged and fixed
  autonomously by the agent without waiting for manual intervention.
- **Clear Separation of Concerns:** Distinguish automatically between issues an
  agent can resolve autonomously versus decisions that strictly require human
  authorization (e.g., final merge execution, product architectural changes).
- **Tool Protocol Enforcement:** Strict adherence to pull request monitoring
  protocols (`watch_pull_request`, `link_pull_request`, and event-driven
  wakeups).

## Architectural Decision

Whenever an `agent-ready` pull request is created, updated, or remains unmerged:

1. **Mandatory PR Watch Protocol:**
   - The agent MUST call `watch_pull_request` whenever the PR is waiting on CI
     checks, reviews, deploy preview validations, or maintainer feedback.
   - Pushes, branch updates, and test validations must be executed first,
     followed immediately by `watch_pull_request`.
2. **Autonomous Triage Matrix:**
   The agent must regularly assess and triage the pull request state against the
   following matrix:

   | Trigger / State            | Classification | Agent Autonomous Action                                                 |
   | :------------------------- | :------------- | :---------------------------------------------------------------------- |
   | CI / Test / Linter Failure | Agent-Ready    | Pull logs, reproduce locally, apply fix, commit, push, verify.          |
   | Deploy Preview Issue       | Agent-Ready    | Verify deployment URL, inspect runtime logs/DOM, resolve discrepancies. |
   | Review Feedback (Bugs)     | Agent-Ready    | Reproduce feedback, update code/tests, record updated evidence, push.   |
   | Merge Execution            | Needs-Human    | Strict repo invariant: Merging remains restricted to human maintainers. |
   | Ambiguous Design Fork      | Needs-Human    | Formulate concise question or structured summary for human decision.    |

3. **Handback and Completion Gate:**
   - The agent unwatches the PR (`unwatch_pull_request`) ONLY upon explicit
     handback, terminal error, or after human approval and final merge.
   - Before ending each turn on active PR work, the agent must output the
     verified state:
     `PR <full URL>, head <SHA>, checks and reviews <state>`.

## Consequences

### Positive Consequences

- **Zero-Latency Fixes:** Review feedback and failing checks are addressed
  immediately without waiting for human escalation loops.
- **Consistent PR Velocity:** Time-to-merge is significantly reduced for
  two-way-door pull requests.
- **Deterministic State Visibility:** Maintainers always have up-to-date
  visibility into PR health, preview URLs, and blocker classifications.

### Negative / Operational Consequences

- Agents must manage event subscriptions responsibly and avoid tight busy-wait
  polling loops (relying on event-driven wakeups, MCP watchers, and scheduler
  hooks).
- Requires strict adherence to the No-Autonomous-Merge invariant to prevent
  accidental merges without human review.

## References

- [ADR 0001: Mandatory Visual Testing and Media Evidence](0001-mandatory-ui-visual-testing-and-evidence.md)
