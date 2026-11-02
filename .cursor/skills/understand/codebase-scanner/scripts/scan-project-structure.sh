#!/bin/bash
# scan-project-structure.sh — Quét cấu trúc dự án cho Understand Agent
# Usage: ./scan-project-structure.sh <project_root>
#
# Output: Summary cấu trúc dự án, dependencies, entry points

ROOT="${1:-.}"

echo "📂 Project Structure Scan: $ROOT"
echo "════════════════════════════════════════"
echo ""

# 1. Tech Stack Detection
echo "### 1. Tech Stack"
[ -f "$ROOT/package.json" ] && echo "   📦 Node.js — $(grep '"name"' "$ROOT/package.json" | head -1)"
[ -f "$ROOT/pubspec.yaml" ] && echo "   🎯 Flutter/Dart"
[ -f "$ROOT/requirements.txt" ] && echo "   🐍 Python"
[ -f "$ROOT/pom.xml" ] && echo "   ☕ Java (Maven)"
[ -f "$ROOT/build.gradle" ] && echo "   ☕ Java/Kotlin (Gradle)"
[ -f "$ROOT/go.mod" ] && echo "   🐹 Go"
[ -f "$ROOT/Cargo.toml" ] && echo "   🦀 Rust"
echo ""

# 2. File Statistics
echo "### 2. File Statistics"
for ext in js ts jsx tsx py dart java kt go rs; do
  count=$(find "$ROOT" -name "*.$ext" -not -path "*/node_modules/*" -not -path "*/.dart_tool/*" -not -path "*/build/*" 2>/dev/null | wc -l | tr -d ' ')
  [ "$count" -gt 0 ] && echo "   .$ext: $count files"
done
echo ""

# 3. Entry Points
echo "### 3. Potential Entry Points"
for pattern in "main.js" "index.js" "app.js" "server.js" "main.ts" "index.ts" "main.dart" "main.py" "app.py" "Main.java"; do
  find "$ROOT" -name "$pattern" -not -path "*/node_modules/*" -not -path "*/build/*" 2>/dev/null | while read f; do
    echo "   → $f"
  done
done
echo ""

# 4. Test Coverage
echo "### 4. Test Files"
test_count=$(find "$ROOT" -name "*.test.*" -o -name "*.spec.*" -o -name "*_test.*" 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')
src_count=$(find "$ROOT" -name "*.js" -o -name "*.ts" -o -name "*.dart" -o -name "*.py" 2>/dev/null | grep -v node_modules | grep -v test | grep -v spec | wc -l | tr -d ' ')
echo "   Source files: $src_count"
echo "   Test files: $test_count"
[ "$src_count" -gt 0 ] && echo "   Ratio: $(echo "scale=0; $test_count * 100 / $src_count" | bc 2>/dev/null || echo "N/A")%"
echo ""

# 5. Potential No-Go Zones
echo "### 5. Potential No-Go Zones (large files, no tests)"
find "$ROOT" -name "*.js" -o -name "*.ts" -o -name "*.dart" -o -name "*.py" 2>/dev/null | \
  grep -v node_modules | grep -v test | grep -v spec | while read f; do
    loc=$(wc -l < "$f" 2>/dev/null | tr -d ' ')
    if [ "$loc" -gt 300 ]; then
      basename="${f##*/}"
      testfile=$(find "$ROOT" -name "${basename%.*}.test.*" -o -name "${basename%.*}.spec.*" -o -name "${basename%.*}_test.*" 2>/dev/null | head -1)
      [ -z "$testfile" ] && echo "   ⚠️  $f ($loc LOC, NO TEST)"
    fi
  done
echo ""

echo "════════════════════════════════════════"
echo "📊 Scan complete."
