{
  "private": true,
  "name": "dumi-lib",
  "scripts": {
    "start": "dumi dev",
    "docs:build": "dumi build",
    "build": "father-build",
    "prettier": "prettier --write '**/*.{js,jsx,tsx,ts,less,md,json}'",
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
    "@umijs/preset-react": "1.x",
    "@umijs/test": "^3.0.5",
    "dumi": "^{{{ version }}}",
    "father-build": "^1.17.2",
    "lint-staged": "^10.0.7",
    "prettier": "^1.19.1",
    "react": "^16.12.0",
    "yorkie": "^2.0.0"
  }
}
