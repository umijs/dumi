#!/usr/bin/env bash
set -euo pipefail

export PATH="${CARGO_HOME:-$HOME/.cargo}/bin:/rust/bin:$PATH"

TOOLCHAIN="$(tr -d '[:space:]' < rust-toolchain)"
TARGET="wasm32-wasip1"

if ! command -v rustup >/dev/null 2>&1; then
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain "$TOOLCHAIN" --target "$TARGET"
fi

if ! rustup toolchain list | grep -q "^$TOOLCHAIN"; then
  rustup toolchain install "$TOOLCHAIN" --target "$TARGET"
fi
rustup target add "$TARGET" --toolchain "$TOOLCHAIN"
pnpm i
