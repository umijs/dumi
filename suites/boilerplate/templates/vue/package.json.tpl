{
  "name": "{{{ name }}}",
  "version": "0.0.1",
  "description": "{{{ description }}}",
  "scripts": {
    "build": "vite build && vue-tsc --project ./tsconfig.build.json",
    "build:watch": "vite build --watch",
    "dev": "dumi dev",
    "docs:build": "dumi build",
    "docs:preview": "dumi preview",
    "lint": "npm run lint:es && npm run lint:css",
    "lint:css": "stylelint \"{src,test}/**/*.{css,less}\"",
    "lint:es": "eslint \"{src,test}/**/*.{js,jsx,ts,tsx,vue}\"",
    "prepare": "husky install && dumi setup",
    "prepublishOnly": "npm run test && npm run build",
    "start": "npm run dev",
    "test": "vitest",
    "test:cov": "vitest --coverage",
    "typecheck": "vue-tsc --noEmit"
  },
  "authors": [{{#author}}
    "{{{ author }}}"
  {{/author}}],
  "repository": {
    "type": "git"
  },
  "license": "MIT",
  "exports": {
    ".": {
      "types": "./dist/typings/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.umd.js"
    },
    "./dist/style.css": "./dist/style.css"
  },
  "main": "./dist/index.umd.js",
  "module": "./dist/index.mjs",
  "types": "./dist/typings/index.d.ts",
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
    "vue": ">=3.3.0"
  },
  "devDependencies": {
    "@commitlint/cli": "^17.1.2",
    "@commitlint/config-conventional": "^17.1.0",
    "@dumijs/preset-vue": "^2.4.12",
    "@eslint/js": "^9.11.1",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@typescript-eslint/eslint-plugin": "^8.7.0",
    "@typescript-eslint/parser": "^8.7.0",
    "@umijs/lint": "^4.3.24",
    "@vitejs/plugin-vue": "^5.1.4",
    "@vitejs/plugin-vue-jsx": "^4.0.1",
    "@vitest/coverage-v8": "^2.1.1",
    "@vue/test-utils": "^2.4.6",
    "dumi": "{{{ version }}}",
    "eslint": "^8.57.1",
    "eslint-plugin-vue": "^9.17.0",
    "happy-dom": "^15.7.4",
    "husky": "^8.0.1",
    "less": "^4.2.0",
    "lint-staged": "^13.0.3",
    "prettier": "^2.7.1",
    "prettier-plugin-organize-imports": "^3.0.0",
    "prettier-plugin-packagejson": "^2.2.18",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "stylelint": "^14.9.1",
    "typescript": "~5.5.4",
    "vite": "^5.4.8",
    "vitest": "^2.1.1",
    "vue": "^3.5.10",
    "vue-tsc": "^2.1.6"
  }
}
