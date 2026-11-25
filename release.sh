#!/usr/bin/env bash
# Use the repository's checked GitHub/Vercel release workflow.
exec bash "$(dirname -- "${BASH_SOURCE[0]}")/release-safe.sh" "$@"
