{
  "name": "{{{ name }}}",
  "version": "0.0.1",
  "description": "{{{ description }}}",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "start": "npm run dev",
    "dev": "dumi dev",
    "build": "father build",
    "build:watch": "father dev",
    "docs:build": "dumi build",
    "prepare": "husky install && dumi setup",
    "doctor": "father doctor",
    "lint": "npm run lint:es && npm run lint:css",
    "lint:css": "stylelint \"{src,test}/**/*.{css,less}\"",
    "lint:es": "eslint \"{src,test}/**/*.{js,jsx,ts,tsx}\"",
    "prepublishOnly": "father doctor && npm run build"
  },
  "authors": [{{#author}}
    "{{{ author }}}"
  {{/author}}],
  "license": "MIT",
  "files": [
    "dist"
  ],
  "commitlint": {
    "extends": [
      "@commitlint/config-conventional"
    ]
  },
  "lint-staged": {
    "*.{md,json}": [
      "prettier --write --no-error-on-unmatched-pattern"
    ],
    "*.{css,less}": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.{js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --parser=typescript --write"
    ]
  },
  "publishConfig": {
    "access": "public"
  },
  "peerDependencies": {
    "react": ">=16.9.0",
    "react-dom": ">=16.9.0"
  },
  "devDependencies": {
    "@commitlint/cli": "^17.1.2",
    "@commitlint/config-conventional": "^17.1.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@umijs/lint": "^4.0.0",
    "dumi": "{{{ version }}}",
    "eslint": "^8.23.0",
    "father": "^4.1.0",
    "husky": "^8.0.1",
    "lint-staged": "^13.0.3",
    "prettier": "^2.7.1",
    "prettier-plugin-organize-imports": "^3.0.0",
    "prettier-plugin-packagejson": "^2.2.18",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "stylelint": "^14.9.1"
  }
}
