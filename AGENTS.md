<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->
<!-- PROJECT RULES -->

# OI Cards Development Rules

## Read First

Before writing any code, always read:

1. docs/PROJECT_SPEC.md
2. docs/DATABASE_SPEC.md
3. docs/API_SPEC.md
4. docs/UI_SPEC.md
5. docs/THEMES_SPEC.md
6. docs/ROADMAP.md

---

## Development Rules

- Never redesign the UI unless explicitly requested.
- Never modify unrelated files.
- Never remove existing APIs without verification.
- Never modify the Prisma schema without approval.
- Preserve existing data during migrations.
- Keep components reusable.
- Use TypeScript strict mode.
- Prefer Server Components.
- Avoid breaking changes.
- Follow the project architecture.

---

## Workflow

Work on one task at a time.

For every completed task:

- Generate TASK_REPORT.md.
- List modified files.
- Explain why each file changed.
- Mention any risks.
- Stop and wait for confirmation before continuing.

---

## Code Style

- Small reusable components.
- Feature-based organization.
- No duplicated logic.
- Clear naming.
- Strong typing.
- Mobile-first.
- Responsive by default.
- Accessible UI.

---

## Documentation

Whenever architecture changes:

Update the related file inside /docs.

Never leave documentation outdated.
