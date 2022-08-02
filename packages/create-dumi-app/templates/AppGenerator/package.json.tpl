{
  "private": true,
  "name": "dumi-app",
  "scripts": {
    "start": "dumi dev",
    "build": "dumi build",
    "prettier": "prettier --write \"**/*.{js,jsx,tsx,ts,less,md,json}\""
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
  "devDependencies": {
    "dumi": "^{{{ version }}}",
    "lint-staged": "^10.0.7",
    "prettier": "^2.2.1",
    "yorkie": "^2.0.0"
  }
}
