#!/usr/bin/env bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y -t wasm32-wasi --default-toolchain nightly-2022-09-23
source "$HOME/.cargo/env"
pnpm i
