# GitHub Pages

The static companion in `apps/web/site/` is published by `.github/workflows/pages.yml` using **GitHub Actions** as the Pages source (`build_type: workflow`).

The legacy `gh-pages` branch is **retired**. Do not recreate it for deploys. Future publishes happen on CI-green pushes to `main` (via `workflow_run`) or manual `workflow_dispatch` of `pages.yml`.
