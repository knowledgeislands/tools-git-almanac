#!/usr/bin/env bash

set -euo pipefail

readonly release_owner='knowledgeislands'
readonly release_repository='tools-gitlendar'
readonly release_base="https://github.com/${release_owner}/${release_repository}"
script_dir=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
install_dir=${GITLENDAR_INSTALL_DIR:-"$HOME/.local/bin"}
man_install_dir=${GITLENDAR_MAN_INSTALL_DIR:-"$(dirname -- "$install_dir")/share/man/man1"}
mode='release'
requested_version=${GITLENDAR_VERSION:-}
stage=''

say() {
  printf 'gitlendar-install: %s\n' "$*"
}

die() {
  printf 'gitlendar-install: error: %s\n' "$*" >&2
  exit 1
}

usage() {
  cat <<'EOF'
Usage: ./install.sh [vX.Y.Z]
       ./install.sh --link

Install the latest released gitlendar, or an exact v-prefixed version.

Environment:
  GITLENDAR_INSTALL_DIR      executable directory (default: ~/.local/bin)
  GITLENDAR_MAN_INSTALL_DIR  manual directory (default: ../share/man/man1)
  GITLENDAR_VERSION          exact release version when no argument is given

--link links this checkout's development executable and manual. It requires Bun.
EOF
}

cleanup() {
  if [[ -n "$stage" && -d "$stage" ]]; then
    rm -rf -- "$stage"
  fi
}
trap cleanup EXIT HUP INT TERM

if [[ "$#" -gt 1 ]]; then
  usage >&2
  exit 2
fi

case "${1:-}" in
  '')
    ;;
  --link)
    mode='link'
    ;;
  -h | --help)
    usage
    exit 0
    ;;
  v*)
    requested_version=$1
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "$1 is required"
}

if [[ "$mode" == 'link' ]]; then
  require_command bun
  source_bin="$script_dir/bin/gitlendar"
  source_man="$script_dir/man/gitlendar.1"
  [[ -x "$source_bin" ]] || die "local executable not found: $source_bin"
  [[ -f "$source_man" ]] || die "local manual not found: $source_man"
  mkdir -p -- "$install_dir" "$man_install_dir"
  for target in "$install_dir/gitlendar" "$man_install_dir/gitlendar.1"; do
    if [[ -e "$target" && ! -L "$target" ]]; then
      die "refusing to replace regular file in --link mode: $target"
    fi
  done
  ln -sfn -- "$source_bin" "$install_dir/gitlendar"
  ln -sfn -- "$source_man" "$man_install_dir/gitlendar.1"
  say "linked $install_dir/gitlendar -> $source_bin"
  say "linked $man_install_dir/gitlendar.1 -> $source_man"
  exit 0
fi

require_command curl
require_command tar
require_command node

if [[ -z "$requested_version" ]]; then
  requested_version=$(curl --fail --silent --show-error --location --max-redirs 3 \
    --proto '=https' --proto-redir '=https' \
    "https://api.github.com/repos/${release_owner}/${release_repository}/releases/latest" |
    sed -n 's/.*"tag_name": *"\([^"]*\)".*/\1/p' |
    head -n 1)
fi

printf '%s\n' "$requested_version" | grep -Eq '^v[0-9]+\.[0-9]+\.[0-9]+$' ||
  die "expected exact version such as v0.1.0"

stage=$(mktemp -d "${TMPDIR:-/tmp}/gitlendar-install.XXXXXX") ||
  die 'could not create staging directory'
archive_name="gitlendar-${requested_version}.tar.gz"
archive="$stage/$archive_name"
checksums="$stage/SHA256SUMS"
asset_base="${release_base}/releases/download/${requested_version}"

curl --fail --silent --show-error --location --max-redirs 3 \
  --proto '=https' --proto-redir '=https' --output "$archive" "${asset_base}/${archive_name}" ||
  die "could not download ${asset_base}/${archive_name}"
curl --fail --silent --show-error --location --max-redirs 3 \
  --proto '=https' --proto-redir '=https' --output "$checksums" "${asset_base}/SHA256SUMS" ||
  die "could not download ${asset_base}/SHA256SUMS"

expected=$(awk -v name="$archive_name" '$2 == name { print $1 }' "$checksums")
[[ "$expected" =~ ^[0-9a-f]{64}$ ]] || die 'release checksum entry is missing or malformed'
if command -v shasum >/dev/null 2>&1; then
  actual=$(shasum -a 256 "$archive" | awk '{ print $1 }')
elif command -v sha256sum >/dev/null 2>&1; then
  actual=$(sha256sum "$archive" | awk '{ print $1 }')
else
  die 'shasum or sha256sum is required'
fi
[[ "$actual" == "$expected" ]] || die 'release checksum verification failed'

tar -xzf "$archive" -C "$stage"
payload="$stage/gitlendar-${requested_version}"
[[ -x "$payload/gitlendar" ]] || die 'release executable is missing'
[[ -f "$payload/gitlendar.1" ]] || die 'release manual is missing'

mkdir -p -- "$install_dir" "$man_install_dir"
install -m 0755 "$payload/gitlendar" "$install_dir/gitlendar"
install -m 0644 "$payload/gitlendar.1" "$man_install_dir/gitlendar.1"
say "installed gitlendar ${requested_version} to $install_dir/gitlendar"
say "installed manual to $man_install_dir/gitlendar.1"
