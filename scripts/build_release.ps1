<#
  build_release.ps1
  Creates a source-only ZIP for release. 
  Usage: powershell -ExecutionPolicy Bypass -File scripts\build_release.ps1 -Version 1.0.0
#>
param(
  [string]$Version = "1.0.0",
  [string]$OutName = "quizdd-$Version-source.zip"
)

# Calculate repository root (parent directory of the scripts folder)
# Use PSScriptRoot to reliably get the script directory when available
if ($PSScriptRoot) {
  $ScriptPath = $PSScriptRoot
} else {
  $ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
}
$Root = Resolve-Path (Join-Path $ScriptPath "..")
Set-Location $Root

Write-Host "Building whitelist-only source ZIP for version $Version..."

# Whitelist: explicitly include only these top-level files and folders (relative to repo root)
$whitelist = @(
  'src',
  'public',
  'src-tauri',
  'package.json',
  'README.md',
  'CHANGELOG.md',
  'LICENSE',
  'RELEASE_DOCS',
  'tsconfig.json',
  'vite.config.ts',
  'tsconfig.node.json',
  '.gitignore'
)

$excludeDirs = @('node_modules','dist','build','target','.git','.vscode','.kiro')
$paths = @()
foreach ($item in $whitelist) {
  $full = Join-Path $Root $item
  if (Test-Path $full) {
    $attr = Get-Item $full
    if ($attr.PSIsContainer) {
      # include all files under this directory, but exclude unwanted subdirs
      $children = Get-ChildItem -Path $full -Recurse -File | Where-Object {
        $f = $_.FullName
        foreach ($d in $excludeDirs) {
          if ($f -like "*\\$d\\*") { return $false }
        }
        return $true
      } | ForEach-Object { $_.FullName }
      $paths += $children
    } else {
      $paths += $full
    }
  } else {
    Write-Host "Note: whitelist entry '$item' not found in repo root - skipping"
  }
}

if (-not $paths -or $paths.Count -eq 0) {
  Write-Error "No whitelisted files found to include in the release. Abort."
  exit 1
}

if (Test-Path $OutName) { Remove-Item $OutName -Force }

try {
  # Normalize timestamps for files that have out-of-range values (Zip format limitation)
  $min = [datetime]'1980-01-01'
  $max = [datetime]'2107-12-31'
  foreach ($p in $paths) {
    try {
      $it = Get-Item -LiteralPath $p -ErrorAction Stop
      if ($it.LastWriteTime -lt $min -or $it.LastWriteTime -gt $max) {
        # set to now (local) which is safe for zip
        $it.LastWriteTime = (Get-Date)
      }
    } catch {
      # ignore issues with timestamp normalization
    }
  }

  # Deduplicate paths to avoid duplicate-entry errors
  $paths = $paths | Select-Object -Unique
  Compress-Archive -LiteralPath $paths -DestinationPath $OutName -Force
  Write-Host "Created $OutName with $($paths.Count) files."
} catch {
  Write-Error "Compress failed: $_"
  exit 2
}

Write-Host "Release ZIP ready: $OutName"
