---
description: Push changes to GitHub and deploy to Vercel
---

# Push to Production

This workflow pushes all staged changes to GitHub, which triggers a Vercel deployment.

## When to use
Use `/push` when you're happy with the local prototype and want to deploy to production.

## Steps

1. Stage all changes
// turbo
```bash
git add -A
```

2. Commit with a message (ask user for message or use a default)
```bash
git commit -m "<message>"
```

3. Push to main branch
// turbo
```bash
git push origin main
```

4. Confirm deployment URL: https://pnew-project.vercel.app
