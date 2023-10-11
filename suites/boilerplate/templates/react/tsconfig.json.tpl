{
  "compilerOptions": {
    "strict": true,
    "declaration": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "jsx": "react",
    "baseUrl": "./",
    "paths": {
      "@@/*": [".dumi/tmp/*"],
      "{{{ name }}}": ["src"],
      "{{{ name }}}/*": ["src/*", "*"]
    }
  },
  "include": [".dumirc.ts", "src/**/*"]
}
