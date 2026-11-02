# check-prototype-notes.ps1 — Validate prototype-notes.md có đủ required fields
# Usage: .\check-prototype-notes.ps1 [<prototype-notes.md path>]
#
# Checks: required fields, verdict value, REQ refs, spec impact, routing

param(
    [string]$Notes = ""
)

# Resolve path
if (-not $Notes) {
    $found = Get-Item ".v-flow/features/*/prototype-notes.md" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) { $Notes = $found.FullName }
}

if (-not $Notes -or -not (Test-Path $Notes)) {
    Write-Host "❌ File not found: $Notes" -ForegroundColor Red
    Write-Host "   Usage: .\check-prototype-notes.ps1 <path/to/prototype-notes.md>"
    exit 1
}

$content = Get-Content $Notes -Raw
Write-Host "📋 Prototype Notes Compliance Check: $Notes"
Write-Host "════════════════════════════════════════════"
$errors   = 0
$warnings = 0

# 1. Required fields
Write-Host ""
Write-Host "### 1. Required Fields"
$requiredFields = @("Branch", "Question", "Verdict", "REQ refs", "Spec impact", "Routing")
foreach ($field in $requiredFields) {
    if ($content -match "(?i)$field") {
        Write-Host "   ✅ '$field' present" -ForegroundColor Green
    } else {
        Write-Host "   ❌ '$field' MISSING" -ForegroundColor Red
        $errors++
    }
}

# 2. Verdict value phải hợp lệ
Write-Host ""
Write-Host "### 2. Verdict Value"
if ($content -match "(?i)(VALIDATED|REJECTED|INCONCLUSIVE)") {
    $verdict = $Matches[1].ToUpper()
    Write-Host "   ✅ Verdict: $verdict" -ForegroundColor Green
} else {
    Write-Host "   ❌ No valid verdict found (must be VALIDATED | REJECTED | INCONCLUSIVE)" -ForegroundColor Red
    $errors++
}

# 3. REQ refs có format đúng không
Write-Host ""
Write-Host "### 3. REQ References"
$reqMatches = [regex]::Matches($content, "REQ-[UESO]\d+")
if ($reqMatches.Count -eq 0) {
    Write-Host "   ⚠️  No REQ-xxx references found (should link to spec requirements)" -ForegroundColor Yellow
    $warnings++
} else {
    $unique = $reqMatches | ForEach-Object { $_.Value } | Sort-Object -Unique
    Write-Host "   ✅ REQ refs found: $($reqMatches.Count) ($($unique -join ', '))" -ForegroundColor Green
}

# 4. Run command documented
Write-Host ""
Write-Host "### 4. Run Command"
if ($content -match "(?i)(run command|cách chạy|npm run|pnpm|tsx|python|bun)") {
    Write-Host "   ✅ Run command documented" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  No run command found (user needs to know how to start the prototype)" -ForegroundColor Yellow
    $warnings++
}

# 5. Kết quả interact (evidence for verdict)
Write-Host ""
Write-Host "### 5. Interact Evidence"
if ($content -match "(?i)(\[x\]|\[✓\]|✅|✔|case|test|interact|kết quả|result|finding)") {
    Write-Host "   ✅ Interact results present" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  No evidence of user interaction (verdict without evidence is unreliable)" -ForegroundColor Yellow
    $warnings++
}

# 6. Cleanup checklist
Write-Host ""
Write-Host "### 6. Cleanup Checklist"
if ($content -match "(?i)(cleanup|flow-state|_session|prototype/)") {
    Write-Host "   ✅ Cleanup references present" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  No cleanup checklist (flow-state.yaml, _session.md may not be updated)" -ForegroundColor Yellow
    $warnings++
}

Write-Host ""
Write-Host "════════════════════════════════════════════"
Write-Host "📊 Errors: $errors | Warnings: $warnings"

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "✅ PASS — prototype-notes.md is complete" -ForegroundColor Green
    exit 0
} elseif ($errors -eq 0) {
    Write-Host "⚠️  PASS WITH WARNINGS — review warnings before routing to next phase" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "❌ FAIL — fix $errors error(s) before continuing pipeline" -ForegroundColor Red
    exit 1
}
