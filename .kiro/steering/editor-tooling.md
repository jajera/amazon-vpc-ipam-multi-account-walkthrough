---
inclusion: fileMatch
fileMatchPattern: [".vscode/**", "src/**/*.md", "src/**/*.mdx", ".kiro/**/*.md"]
---

# Editor and VS Code tooling

This project includes committed `.vscode/` configuration. Preserve and update it when scaffolding or extending the site.

## Files

- Spell check: `#[[file:.vscode/cspell.json]]` — domain terms for IPAM, Astro, Terraform
- Extensions: `#[[file:.vscode/extensions.json]]` — Astro, Prettier, Code Spell Checker
- Settings: `#[[file:.vscode/settings.json]]` — format on save, cSpell path
- Tasks: `#[[file:.vscode/tasks.json]]` — `npm run dev` and `npm run build`

## Conventions

- Add new project-specific terms to `cspell.json` when they appear in content or specs
- Keep Route53 or unrelated stack terms out of the dictionary
- Do not remove `.vscode/` when implementing from `tasks.md` — it is part of the project scaffold
