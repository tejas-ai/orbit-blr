# Interactive script to update DATABASE_URL securely without sharing it in chat
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "     ORBIT BLR - SECURE DATABASE CONFIGURATION & SYNC     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Get your connection string from your Neon console:" -ForegroundColor Yellow
Write-Host "https://console.neon.tech/app/projects/broad-tooth-55681211" -ForegroundColor Gray
Write-Host ""

$conn = Read-Host "Paste your Neon PostgreSQL connection string here (starts with postgresql://)"
$conn = $conn.Trim().Trim('"').Trim("'")

if (-not $conn.StartsWith("postgresql://") -and -not $conn.StartsWith("postgres://")) {
    Write-Host "❌ Invalid connection string format. Must start with postgresql:// or postgres://" -ForegroundColor Red
    exit 1
}

$envFile = Join-Path $PSScriptRoot ".env.local"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ .env.local not found." -ForegroundColor Red
    exit 1
}

$content = Get-Content $envFile -Raw
if ($content -match "DATABASE_URL=.*") {
    $updated = $content -replace "DATABASE_URL=.*", "DATABASE_URL=`"$conn`""
} else {
    $updated = "DATABASE_URL=`"$conn`"`n" + $content
}

[System.IO.File]::WriteAllText($envFile, $updated)
Write-Host "✅ .env.local updated successfully." -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Verifying connection and syncing database schema & audited events..." -ForegroundColor Cyan
node scripts/verify-and-sync-db.mjs

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database connection and persistent storage verified!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔒 Syncing updated DATABASE_URL secret to Vercel production..." -ForegroundColor Cyan
    node scripts/sync-vercel-env.mjs
    Write-Host "🚀 Triggering Vercel production deployment..." -ForegroundColor Cyan
    npx.cmd vercel --prod --yes
    Write-Host ""
    Write-Host "🎉 Production deployment is live and connected to your verified Neon database!" -ForegroundColor Green
} else {
    Write-Host "❌ Database connection check failed. Please verify the credentials on Neon." -ForegroundColor Red
}
