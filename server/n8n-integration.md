# n8n Automation Integration

## Environment variables

Set these values in your `.env`:

- `N8N_WEBHOOK_USER_SIGNUP_URL` - n8n webhook URL for signup events.
- `N8N_WEBHOOK_TEST_COMPLETE_URL` - n8n webhook URL for typing test completion events.
- `N8N_WEBHOOK_SECRET` - optional shared secret attached to outbound webhooks as `x-n8n-secret`.
- `N8N_INTERNAL_SECRET` - required secret for n8n -> backend automation APIs.
- `N8N_REQUEST_TIMEOUT_MS` - optional outbound webhook timeout (defaults to `6000` ms).

## Outbound events (backend -> n8n)

- Signup: emitted from `POST /api/auth/signup`
  - Event name: `userSignup`
- Typing test completion: emitted from `POST /api/score`
  - Event name: `testComplete`

## Inbound automation APIs (n8n -> backend)

All endpoints below require header `x-n8n-secret: <N8N_INTERNAL_SECRET>`.

- `POST /api/automation/daily-challenge`
  - Upserts daily challenge content.
- `POST /api/automation/xp-reward`
  - Applies XP reward to a user and recalculates level.
- `GET /api/automation/reports/weekly?userId=<id>&days=7`
  - Returns weekly performance summary for email workflows.
- `POST /api/automation/leaderboard/recompute`
  - Recomputes ranked users, stores rank metadata, and saves snapshot.

## Public endpoint

- `GET /api/daily-challenge`
  - Returns today's challenge (or latest available challenge).

## n8n import blueprint

- Import workflow JSON from `server/n8n-workflow-blueprint.json`.
- After import, open `Webhook User Signup` and `Webhook Test Complete` nodes and copy their production URLs.
- Set backend env values:
  - `N8N_WEBHOOK_USER_SIGNUP_URL=<signup webhook production URL>`
  - `N8N_WEBHOOK_TEST_COMPLETE_URL=<test webhook production URL>`
- Ensure the same secret value is used by:
  - backend `N8N_INTERNAL_SECRET`
  - n8n request headers `x-n8n-secret`
