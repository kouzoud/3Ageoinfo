# Script de démarrage complet pour déploiement Netlify + Backend local
# Démarre le backend Spring Boot

Write-Host "===========================================`n" -ForegroundColor Cyan
Write-Host "   🚀 DÉMARRAGE BACKEND SPRING BOOT" -ForegroundColor Yellow
Write-Host "`n===========================================" -ForegroundColor Cyan

Set-Location -Path $PSScriptRoot

# Vérifier si Maven est installé
$mavenInstalled = Get-Command mvn -ErrorAction SilentlyContinue
if (-not $mavenInstalled) {
    Write-Host "❌ Maven n'est pas installé ou pas dans le PATH!" -ForegroundColor Red
    Write-Host "Téléchargez Maven depuis: https://maven.apache.org/download.cgi" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Maven trouvé!" -ForegroundColor Green
Write-Host "`n📦 Démarrage du backend sur port 8085..." -ForegroundColor Cyan
Write-Host "   (Ctrl+C pour arrêter)`n" -ForegroundColor Gray

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "   📝 INSTRUCTIONS PARALLÈLES" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Dans un AUTRE terminal, exécutez:" -ForegroundColor White
Write-Host "  cd frontend" -ForegroundColor Cyan
Write-Host "  .\ngrok.exe http 8085" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

# Démarrer Spring Boot
mvn clean spring-boot:run -DskipTests
