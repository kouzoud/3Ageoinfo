# Script pour retirer les fichiers sensibles de Git
# Exécuter ce script AVANT de push

Write-Host "Nettoyage des fichiers sensibles du repository Git..." -ForegroundColor Yellow

# Fichiers sensibles à retirer
$filesToRemove = @(
    "backend/src/main/resources/keystore.p12",
    "frontend/.env.development",
    "frontend/.env.production",
    "frontend/localhost-cert.pem",
    "frontend/localhost-key.pem",
    "frontend/rootCA.pem",
    "frontend/mkcert.exe",
    "frontend/ngrok.exe",
    "frontend/ngrok.zip"
)

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Write-Host "Retrait de: $file" -ForegroundColor Cyan
        git rm --cached $file 2>$null
    }
}

Write-Host "`nCréation de fichiers .example pour documentation..." -ForegroundColor Yellow

# Créer .env.example si n'existe pas
if (-not (Test-Path "frontend/.env.example")) {
    @"
# Configuration de développement
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=3AGeoInfo
"@ | Out-File "frontend/.env.example" -Encoding utf8
    Write-Host "Créé: frontend/.env.example" -ForegroundColor Green
}

Write-Host "`n✅ Nettoyage terminé!" -ForegroundColor Green
Write-Host "`nProchaines étapes:" -ForegroundColor Yellow
Write-Host "1. git add .gitignore" -ForegroundColor White
Write-Host "2. git commit -m 'chore: ajout .gitignore pour fichiers sensibles'" -ForegroundColor White
Write-Host "3. git push" -ForegroundColor White
