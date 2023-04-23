# How to contribute

## Requirements

[Node.js](https://nodejs.org/) >= 14, [PNPM](https://pnpm.io/) >= 7, [Rust](https://www.rust-lang.org/)

After Rust is installed, add `wasm32-wasi`.

```shell
rustup target add wasm32-wasi
```

## Setup the repository locally

1. Fork and clone the repository.

```shell
git clone https://github.com/<your name>/dumi.git
cd dumi
```

2. Install all dependencies

```shell
pnpm install
```

> Due to the network download required by the scripts that need to be run during installation, you may need to set up a network proxy if an error occurs.

Now you can start developing

```shell
pnpm dev
pnpm docs:dev
```

## Submitting the Pull Request

Submit a pull request from your topic branch to the master branch on the umijs/dumi repository.
