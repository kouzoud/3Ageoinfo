# Script de déploiement rapide sur Netlify
# Nécessite: npm install -g netlify-cli

Write-Host "===========================================`n" -ForegroundColor Cyan
Write-Host "   🚀 DÉPLOIEMENT NETLIFY" -ForegroundColor Yellow
Write-Host "`n===========================================" -ForegroundColor Cyan

# Vérifier si netlify-cli est installé
$netlifyInstalled = Get-Command netlify -ErrorAction SilentlyContinue
if (-not $netlifyInstalled) {
    Write-Host "❌ Netlify CLI non installé!" -ForegroundColor Red
    Write-Host "`nInstallation de Netlify CLI..." -ForegroundColor Yellow
    npm install -g netlify-cli
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Échec de l'installation!" -ForegroundColor Red
        exit 1
    }
}

# Aller dans le dossier frontend
Set-Location -Path $PSScriptRoot

Write-Host "`n📦 Construction du build de production..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Échec du build!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Build réussi!" -ForegroundColor Green

Write-Host "`n🔐 Connexion à Netlify..." -ForegroundColor Cyan
netlify login

Write-Host "`n🚀 Déploiement en cours..." -ForegroundColor Cyan
netlify deploy --prod --dir=dist

Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "   ✅ DÉPLOIEMENT TERMINÉ!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan

Write-Host "`n📝 PROCHAINES ÉTAPES:" -ForegroundColor Yellow
Write-Host "1. Noter l'URL de votre site" -ForegroundColor White
Write-Host "2. Aller sur Netlify Dashboard → Site Settings → Environment Variables" -ForegroundColor White
Write-Host "3. Ajouter VITE_API_URL avec l'URL ngrok de votre backend" -ForegroundColor White
Write-Host "4. Redéployer pour appliquer les changements" -ForegroundColor White
Write-Host "`n"
