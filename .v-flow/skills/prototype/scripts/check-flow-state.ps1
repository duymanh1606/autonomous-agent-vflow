# check-flow-state.ps1 — Kiểm tra .flow-state.yaml đã được update sau prototype
# Usage: .\check-flow-state.ps1 [<feature-number>]
#        .\check-flow-state.ps1 005
#
# Checks: artifacts.prototype.* fields tồn tại và có giá trị

param(
    [string]$FeatureNum = ""
)

# ── Resolve feature dir & flow-state path ─────────────────────────

if (-not $FeatureNum) {
    # Auto-detect: tìm feature có prototype-notes.md
    $featureDir = Get-Item ".v-flow/features/*/" -ErrorAction SilentlyContinue |
        Where-Object { Test-Path (Join-Path $_.FullName "prototype-notes.md") } |
        Select-Object -First 1

    if (-not $featureDir) {
        Write-Host "❌ Cannot find feature directory with prototype-notes.md" -ForegroundColor Red
        Write-Host "   Usage: .\check-flow-state.ps1 <feature-number>  (e.g. .\check-flow-state.ps1 005)"
        exit 1
    }
    $flowState = Join-Path $featureDir.FullName ".flow-state.yaml"
} else {
    $padded = $FeatureNum.PadLeft(3, '0')
    $featureDir = Get-Item ".v-flow/features/$padded-*/" -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $featureDir) {
        $featureDir = [PSCustomObject]@{ FullName = ".v-flow/features/$FeatureNum/" }
    }
    $flowState = Join-Path $featureDir.FullName ".flow-state.yaml"
}

if (-not (Test-Path $flowState)) {
    Write-Host "❌ .flow-state.yaml not found: $flowState" -ForegroundColor Red
    exit 1
}

$content = Get-Content $flowState -Raw
Write-Host "📋 Flow State Check (prototype section): $flowState"
Write-Host "════════════════════════════════════════════════════"
$errors   = 0
$warnings = 0

# 1. Section artifacts.prototype tồn tại
Write-Host ""
Write-Host "### 1. Prototype Section Exists"
if ($content -match "prototype") {
    Write-Host "   ✅ 'prototype' section found" -ForegroundColor Green
} else {
    Write-Host "   ❌ No 'prototype' section in .flow-state.yaml" -ForegroundColor Red
    Write-Host "      Add: artifacts.prototype.verdict, artifacts.prototype.branch, etc."
    $errors++
}

# 2. Verdict đã được điền
Write-Host ""
Write-Host "### 2. Verdict Field"
if ($content -match "(?i)verdict\s*:\s*(VALIDATED|REJECTED|INCONCLUSIVE)") {
    $verdict = $Matches[1].ToUpper()
    Write-Host "   ✅ verdict: $verdict" -ForegroundColor Green
} elseif ($content -match "(?i)verdict\s*:\s*(null|~|`"`")") {
    Write-Host "   ❌ verdict is empty/null — prototype not yet concluded" -ForegroundColor Red
    $errors++
} else {
    Write-Host "   ⚠️  verdict field not found under prototype section" -ForegroundColor Yellow
    $warnings++
}

# 3. Branch đã được điền
Write-Host ""
Write-Host "### 3. Branch Field"
if ($content -match "(?i)branch\s*:\s*(LOGIC|UI)") {
    $branch = $Matches[1].ToUpper()
    Write-Host "   ✅ branch: $branch" -ForegroundColor Green
} elseif ($content -match "(?i)branch\s*:\s*(null|~|`"`")") {
    Write-Host "   ⚠️  branch field empty/missing (should be LOGIC or UI)" -ForegroundColor Yellow
    $warnings++
} else {
    Write-Host "   ⚠️  branch field not found (should be LOGIC or UI)" -ForegroundColor Yellow
    $warnings++
}

# 4. Phase hiện tại có tiến sang B.0 chưa
Write-Host ""
Write-Host "### 4. Pipeline Phase"
if ($content -match "(?i)(current_phase|phase)\s*:\s*[`"']?([SBR]\.\d+[\d.]*)[`"']?") {
    $currentPhase = $Matches[2]
    Write-Host "   ℹ️  Current phase: $currentPhase"
    if ($currentPhase -eq "S.1.5") {
        Write-Host "   ⚠️  Still at S.1.5 — have you routed to /v.plan yet?" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "   ⚠️  Cannot determine current phase" -ForegroundColor Yellow
    $warnings++
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════"
Write-Host "📊 Errors: $errors | Warnings: $warnings"

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "✅ PASS — .flow-state.yaml correctly updated" -ForegroundColor Green
    exit 0
} elseif ($errors -eq 0) {
    Write-Host "⚠️  PASS WITH WARNINGS — check warnings above" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "❌ FAIL — .flow-state.yaml needs to be updated before continuing" -ForegroundColor Red
    exit 1
}
