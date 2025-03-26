#!/usr/bin/env bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y -t wasm32-wasip1 --default-toolchain nightly
source "$HOME/.cargo/env"
pnpm i
