git checkout --orphan temp-main
git add .
git commit -m "Initial release: Dasom Warmth Wall"
git push origin-b temp-main:main --force
git push origin-b temp-main:local-dev --force
git checkout local-dev
git branch -D temp-main
