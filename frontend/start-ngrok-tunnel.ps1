# Script pour exposer le backend local via ngrok
# Permet au frontend Netlify d'accéder au backend local

Write-Host "===========================================`n" -ForegroundColor Cyan
Write-Host "   🌐 DÉMARRAGE DU TUNNEL NGROK" -ForegroundColor Yellow
Write-Host "`n===========================================" -ForegroundColor Cyan

# Vérifier si ngrok existe
$ngrokPath = ".\ngrok.exe"
if (-not (Test-Path $ngrokPath)) {
    Write-Host "❌ ngrok.exe non trouvé!" -ForegroundColor Red
    Write-Host "Téléchargez ngrok depuis: https://ngrok.com/download" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n📋 Configuration requise:" -ForegroundColor Cyan
Write-Host "   • Backend doit tourner sur port 8085" -ForegroundColor White
Write-Host "   • Compte ngrok gratuit: https://ngrok.com/signup" -ForegroundColor White
Write-Host "`n"

# Vérifier si ngrok est configuré
$configCheck = & $ngrokPath config check 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Ngrok n'est pas configuré!" -ForegroundColor Yellow
    Write-Host "`nPour configurer ngrok:" -ForegroundColor Cyan
    Write-Host "1. Créer un compte sur https://ngrok.com" -ForegroundColor White
    Write-Host "2. Récupérer votre authtoken" -ForegroundColor White
    Write-Host "3. Exécuter: .\ngrok.exe config add-authtoken VOTRE_TOKEN" -ForegroundColor White
    Write-Host "`n"
    
    $response = Read-Host "Voulez-vous configurer maintenant? (o/n)"
    if ($response -eq "o") {
        $token = Read-Host "Entrez votre authtoken ngrok"
        & $ngrokPath config add-authtoken $token
        Write-Host "✅ Configuration réussie!" -ForegroundColor Green
    } else {
        exit 1
    }
}

Write-Host "🚀 Démarrage du tunnel ngrok sur port 8085..." -ForegroundColor Green
Write-Host "   (Ctrl+C pour arrêter)`n" -ForegroundColor Gray

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "   📝 INSTRUCTIONS" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "1. Copier l'URL HTTPS ngrok affichée ci-dessous" -ForegroundColor White
Write-Host "2. Sur Netlify → Environment Variables" -ForegroundColor White
Write-Host "3. Définir VITE_API_URL = https://VOTRE-URL.ngrok-free.app/api" -ForegroundColor White
Write-Host "4. Redéployer le site Netlify" -ForegroundColor White
Write-Host "==========================================`n" -ForegroundColor Cyan

# Démarrer ngrok
& $ngrokPath http 8085 --region eu
