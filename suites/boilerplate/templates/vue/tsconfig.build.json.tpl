{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "emitDeclarationOnly": true,
    "declarationDir": "./dist/typings",
    "lib": ["esnext", "dom"]
  },
  "include": ["src/**/*"],
  "exclude": ["src/**/*.test.*"]
}
