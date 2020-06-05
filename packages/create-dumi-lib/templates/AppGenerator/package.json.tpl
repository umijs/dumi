{
  "private": true,
  "name": "{{{ packageName }}}",
  "version": "1.0.0",
  "scripts": {
    "start": "dumi dev",
    "docs:build": "dumi build",
    "docs:deploy": "gh-pages -d docs-dist",
    "build": "father-build",
    "deploy": "npm run docs:build && npm run docs:deploy",
    "release": "npm run build && npm publish",
    "prettier": "prettier --write \"**/*.{js,jsx,tsx,ts,less,md,json}\"",
    "test": "umi-test",
    "test:coverage": "umi-test --coverage"
  },
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "typings": "dist/index.d.ts",
  "gitHooks": {
    "pre-commit": "lint-staged"
  },
  "lint-staged": {
    "*.{js,jsx,less,md,json}": [
      "prettier --write"
    ],
    "*.ts?(x)": [
      "prettier --parser=typescript --write"
    ]
  },
  "dependencies": {
    "react": "^16.12.0"
  },
  "devDependencies": {
    "@umijs/preset-react": "1.x",
    "@umijs/test": "^3.0.5",
    "dumi": "^{{{ version }}}",
    "father-build": "^1.17.2",
    "gh-pages": "^3.0.0",
    "lint-staged": "^10.0.7",
    "prettier": "^1.19.1",
    "yorkie": "^2.0.0"
  }
}
