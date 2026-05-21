# Shallow-clone pinned QBox framework dependencies into apps/fivem-resources/.
# Run via: pnpm fivem:deps  (from repo root)
# Safe to re-run: skips any dep whose directory already exists.

$ErrorActionPreference = 'Stop'

$deps = @(
  @{ name = 'ox_lib';      url = 'https://github.com/overextended/ox_lib';      tag = 'v3.14.0'  }
  @{ name = 'ox_inventory'; url = 'https://github.com/overextended/ox_inventory'; tag = 'v2.35.1'  }
  @{ name = 'qbx_core';    url = 'https://github.com/Qbox-project/qbx_core';    tag = 'v1.37.0'  }
)

$root = Split-Path -Parent $PSScriptRoot   # apps/fivem-resources/

foreach ($dep in $deps) {
  $dest = Join-Path $root $dep.name
  if (Test-Path $dest) {
    Write-Host "[$($dep.name)] already present — skipping"
    continue
  }
  Write-Host "[$($dep.name)] cloning $($dep.tag) ..."
  git clone --depth 1 --branch $dep.tag $dep.url $dest
  Write-Host "[$($dep.name)] done"
}

Write-Host ""
Write-Host "All FiveM framework dependencies ready."
