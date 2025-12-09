#!/bin/bash

mkdir -p Docs
mkdir -p Public
mkdir -p src/styles
mkdir -p src/js
mkdir -p scripts
mkdir -p .github/workflows

touch public/index.html
touch src/js/app.js
touch src/styles/main.css
touch scripts/build.js
touch .github/workflows/sync.yml
touch package.json
touch .gitignore 

echo "Done"