# Admin Platform Information Architecture

## Product model

```text
OI Platform
├── Admin Platform        /admin/*       NextAuth administrator
├── Customer Workspace    /workspace     card-scoped EditorSession
└── Public Experience     /c/[slug]      visitor, read-only
```

No product consumes another product's navigation or credential as its own.

## Admin hierarchy

```text
Admin Platform
├── Overview
│   └── truthful platform summary only
├── Customers
│   └── Customer detail
│       ├── Profile
│       ├── Cards
│       ├── Access Codes
│       └── Activity
├── Cards
│   └── Card detail
│       ├── Lifecycle metadata
│       ├── Public view
│       ├── Initial issuance
│       └── Support capability status
├── Access Codes
│   ├── Lifecycle inventory
│   ├── Regenerate
│   ├── Revoke
│   └── Usage
├── Analytics
└── Settings
```

## Permission boundaries

### Administrator

Authenticated by the existing NextAuth admin session. The `/admin` layout checks this session on the server before rendering the operator shell. Issuance actions repeat the same server-side check rather than trusting rendered UI.

### Customer

Enters `/workspace?slug=...`, supplies the card access code when no session is reusable, and receives a card-scoped EditorSession. This user never receives Admin navigation.

### Visitor

Uses `/c/[slug]` and receives only `PublicCardDTO` rendering. No editing or operator controls are present.

## Shared capabilities

Admin and customer products may call the same approved application services or use cases, but they do not share screens, navigation, or credentials. In Sprint 8, Admin card issuance reuses `GenerateInitialAccessCode`; it does not reuse customer Workspace components.

## Current capability boundary

The frozen application ports have ID-based reads but no collection or aggregate read models. Therefore list routes render their final information architecture and truthful unavailable states, plus ID lookup to reach real detail records. They do not use legacy Gallery data or direct Prisma. Enabling full rows and metrics requires a separately approved admin query/read-model sprint.

Likewise, admin support editing is shown as unavailable because customer update use cases require EditorSession credentials. A future admin support capability must add explicit administrator-authorized commands and audit logging; it must never mint or impersonate a customer session.
