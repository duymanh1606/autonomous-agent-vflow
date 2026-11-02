# check-prototype-cleanup.ps1 — Kiểm tra prototype code đã được cleanup chưa
# Usage: .\check-prototype-cleanup.ps1 [<feature-number>]
#        .\check-prototype-cleanup.ps1 005
#
# Rule: Sau khi có verdict, thư mục prototype/ nên được xóa.
#       Chỉ prototype-notes.md là được phép còn lại.

param(
    [string]$FeatureNum = ""
)

function Check-SingleFeature {
    param([string]$featureDir)

    $prototypeDir = Join-Path $featureDir "prototype"
    $notesFile    = Join-Path $featureDir "prototype-notes.md"
    $errors       = 0

    Write-Host "📋 Prototype Cleanup Check: $featureDir"
    Write-Host "══════════════════════════════════════════"

    # Check 1: prototype/ còn tồn tại không
    Write-Host ""
    Write-Host "### 1. Prototype Directory"
    if (-not (Test-Path $prototypeDir)) {
        Write-Host "   ✅ prototype/ directory not found — already cleaned up" -ForegroundColor Green
    } else {
        if (Test-Path $notesFile) {
            Write-Host "   ❌ prototype/ still exists after verdict was captured" -ForegroundColor Red
            Write-Host "   Files:"
            Get-ChildItem $prototypeDir | ForEach-Object { Write-Host "     - $($_.Name)" }
            Write-Host ""
            Write-Host "   → To cleanup:"
            Write-Host "     Remove-Item -Recurse -Force '$prototypeDir'"
            $errors++
        } else {
            Write-Host "   ⚠️  prototype/ exists but no prototype-notes.md yet" -ForegroundColor Yellow
            Write-Host "      → Capture verdict first before cleanup"
            $errors++
        }
    }

    # Check 2: prototype-notes.md tồn tại
    Write-Host ""
    Write-Host "### 2. Prototype Notes (the one thing to keep)"
    if (Test-Path $notesFile) {
        Write-Host "   ✅ prototype-notes.md present" -ForegroundColor Green
        $size = (Get-Item $notesFile).Length
        if ($size -lt 200) {
            Write-Host "   ⚠️  File is very small ($size bytes) — may be incomplete" -ForegroundColor Yellow
            $errors++
        }
    } else {
        Write-Host "   ⚠️  prototype-notes.md not found" -ForegroundColor Yellow
        Write-Host "      → If prototype is done, create notes before deleting prototype/"
    }

    Write-Host ""
    Write-Host "══════════════════════════════════════════"
    Write-Host "📊 Errors: $errors"
    if ($errors -eq 0) {
        Write-Host "✅ PASS — prototype cleanup complete" -ForegroundColor Green
        return 0
    } else {
        Write-Host "❌ FAIL — cleanup needed" -ForegroundColor Red
        return 1
    }
}

# ── Main ──────────────────────────────────────────────────────────

if (-not $FeatureNum) {
    # Auto-detect: scan tất cả features
    $allFeatureDirs = Get-Item ".v-flow/features/*/" -ErrorAction SilentlyContinue
    if (-not $allFeatureDirs) {
        Write-Host "❌ No feature directories found under .v-flow/features/" -ForegroundColor Red
        exit 1
    }

    $foundAny   = $false
    $totalErrors = 0

    foreach ($dir in $allFeatureDirs) {
        $prototypeDir = Join-Path $dir.FullName "prototype"
        $notesFile    = Join-Path $dir.FullName "prototype-notes.md"

        if ((Test-Path $notesFile) -and (Test-Path $prototypeDir)) {
            $foundAny = $true
            Write-Host "⚠️  STALE PROTOTYPE DETECTED: $($dir.FullName)" -ForegroundColor Yellow
            Write-Host "   prototype-notes.md exists (verdict captured) BUT prototype/ folder still present"
            Write-Host "   Files in prototype/:"
            Get-ChildItem $prototypeDir | ForEach-Object { Write-Host "     - $($_.Name)" }
            Write-Host "   → Run: Remove-Item -Recurse -Force '$prototypeDir'"
            $totalErrors++
        } elseif ((Test-Path $prototypeDir) -and -not (Test-Path $notesFile)) {
            $foundAny = $true
            Write-Host "⚠️  PROTOTYPE WITHOUT NOTES: $($dir.FullName)" -ForegroundColor Yellow
            Write-Host "   prototype/ folder exists but prototype-notes.md is missing"
            Write-Host "   → Capture verdict first, then cleanup"
            $totalErrors++
        }
    }

    if (-not $foundAny) {
        Write-Host "✅ No active prototype directories found — all clean" -ForegroundColor Green
        exit 0
    }

    Write-Host ""
    Write-Host "📊 Total issues: $totalErrors"
    if ($totalErrors -gt 0) { exit 1 } else { exit 0 }
}

# Single feature mode
$padded = $FeatureNum.PadLeft(3, '0')
$featureDir = Get-Item ".v-flow/features/$padded-*/" -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $featureDir) {
    $featureDir = ".v-flow/features/$FeatureNum/"
} else {
    $featureDir = $featureDir.FullName
}

$exitCode = Check-SingleFeature -featureDir $featureDir
exit $exitCode
