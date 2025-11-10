# Deployment Playbooks

Resources for shipping Nomad Stop to staging or production environments.

## Contents

- `DEPLOYMENT_GUIDE.md` – End-to-end deployment walkthrough.
- `DEPLOY_GODADDY_CPANEL.md` – Steps tailored for GoDaddy cPanel hosting.
- `deploy-checklist.txt` – Quick pre-flight checks before promoting a build.
- `deploy.sh` – Helper script to bundle and upload the app.

### How to Use

1. Start with `DEPLOYMENT_GUIDE.md` to understand the full workflow.
2. If you are deploying to GoDaddy cPanel, follow the specialised guide afterward.
3. Run through `deploy-checklist.txt` just before flipping traffic.
4. Keep scripts executable (`chmod +x deploy.sh`) and document any environment-specific tweaks you make.

> Add a new Markdown file in this folder whenever we support another hosting provider or automate more of the pipeline. Update this README accordingly.

