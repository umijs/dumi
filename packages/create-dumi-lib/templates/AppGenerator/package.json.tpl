{
  "private": true,
  "name": "{{{ packageName }}}",
  "version": "1.0.0",
  "scripts": {
    "start": "dumi dev",
    "docs:build": "dumi build",
    "docs:deploy": "gh-pages -d docs-dist",
    "build": "father build",
    "deploy": "npm run docs:build && npm run docs:deploy",
    "prettier": "prettier --write \"**/*.{js,jsx,tsx,ts,less,md,json}\"",
    "test": "umi-test",
    "test:coverage": "umi-test --coverage",
    "prepublishOnly": "npm run build"
  },
  "files": [
    "dist"
  ],
  "module": "dist/esm/index.js",
  "typings": "dist/esm/index.d.ts",
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
    "react": "^16.12.0 || ^17.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^5.15.1",
    "@testing-library/react": "^12.1.2",
    "@types/jest": "^27.0.3",
    "@umijs/fabric": "^2.8.1",
    "@umijs/test": "^3.0.5",
    "dumi": "^{{{ version }}}",
    "father": "^4.0.0-rc.2",
    "gh-pages": "^3.0.0",
    "lint-staged": "^10.0.7",
    "prettier": "^2.2.1",
    "yorkie": "^2.0.0"
  }
}
