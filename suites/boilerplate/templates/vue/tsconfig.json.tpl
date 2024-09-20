{
  "compilerOptions": {
    "strict": true,
    "declaration": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "jsx": "preserve",
    "jsxImportSource": "vue",
    "strictNullChecks": false,
    "baseUrl": "./",
    "paths": {
      "@@/*": [".dumi/tmp/*"],
      "{{{ name }}}": ["src"],
      "{{{ name }}}/*": ["src/*", "*"]
    }
  },
  "include": [".dumirc.ts", "src/**/*"]
}
