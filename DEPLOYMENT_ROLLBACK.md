# Deployment & Rollback

Quick rollback steps:

1. Use Vercel dashboard
   - Open your project on Vercel → Deployments
   - Find the last known good deployment and click "Restore" or "Redeploy".

2. Use Git (revert commit)
   - `git revert <commit-sha>` on `main`, push, and Vercel will deploy the reverted state.

3. Emergency DNS redirect
   - If using a static fallback, temporarily point the domain to a status page while investigating.

Always communicate the rollback window and inform users if any data migrations were reverted.
