# ==============================================
# GUIDE: DÉPLOYER FRONTEND SUR NETLIFY + BACKEND LOCAL
# ==============================================

## 📱 Objectif
Frontend sur Netlify (gratuit) + Backend local accessible depuis mobile via PWA

## 🛠️ ÉTAPE 1: Exposer le backend local à internet

### Option A: Avec ngrok (recommandé - déjà téléchargé)

1. **Créer un compte gratuit sur https://ngrok.com**
   - Inscription gratuite
   - Récupérer votre authtoken

2. **Configurer ngrok** (exécuter une seule fois):
   ```powershell
   cd frontend
   .\ngrok.exe config add-authtoken VOTRE_TOKEN_ICI
   ```

3. **Démarrer le tunnel ngrok**:
   ```powershell
   .\start-ngrok-tunnel.ps1
   ```
   
   Vous obtiendrez une URL publique du type:
   `https://abc123.ngrok-free.app`

### Option B: Avec localtunnel (alternative)
```powershell
npm install -g localtunnel
lt --port 8085 --subdomain 3ageoinfo
```

## 🚀 ÉTAPE 2: Déployer sur Netlify

### 2.1 Préparer le build
```powershell
cd frontend
npm run build
```

### 2.2 Déployer sur Netlify

**Méthode 1: Via l'interface web** (recommandé pour débuter)
1. Aller sur https://www.netlify.com
2. Créer un compte (gratuit)
3. "Add new site" → "Deploy manually"
4. Glisser-déposer le dossier `frontend/dist`
5. Noter l'URL de votre site: `https://votre-app.netlify.app`

**Méthode 2: Via CLI**
```powershell
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

### 2.3 Configurer les variables d'environnement sur Netlify
1. Dans Netlify Dashboard → Site settings → Environment variables
2. Ajouter:
   - `VITE_API_URL` = `https://VOTRE-URL-NGROK.ngrok-free.app/api`
   - `VITE_APP_NAME` = `3AGeoInfo`

3. Redéployer le site pour appliquer les changements

## ⚙️ ÉTAPE 3: Configuration CORS backend

Le backend doit accepter les requêtes depuis Netlify.
Cette configuration est déjà appliquée dans WebConfig.java.

## 📲 ÉTAPE 4: Tester sur mobile

1. **Démarrer le backend local**:
   ```powershell
   cd backend
   .\start-dev.ps1
   ```

2. **Démarrer ngrok** (nouveau terminal):
   ```powershell
   cd frontend
   .\start-ngrok-tunnel.ps1
   ```
   Copier l'URL ngrok affichée

3. **Mettre à jour VITE_API_URL sur Netlify** avec l'URL ngrok

4. **Accéder depuis mobile**:
   - Ouvrir `https://votre-app.netlify.app` sur votre téléphone
   - Chrome proposera d'installer le PWA
   - Appuyer sur "Ajouter à l'écran d'accueil"

## 🔄 Workflow quotidien

```powershell
# Terminal 1: Backend
cd backend
.\start-dev.ps1

# Terminal 2: Ngrok tunnel
cd frontend
.\start-ngrok-tunnel.ps1
```

L'URL ngrok peut changer à chaque redémarrage (version gratuite).
Vous devrez mettre à jour VITE_API_URL sur Netlify si l'URL change.

## 💡 Conseils

- **Ngrok gratuit**: L'URL change à chaque redémarrage (limite: 1 tunnel)
- **Ngrok payant** ($8/mois): URL fixe + tunnels illimités
- **Alternative**: Déployer backend sur Render.com (gratuit) pour URL fixe
- **PWA**: Fonctionne uniquement en HTTPS (Netlify le fournit automatiquement)

## 🐛 Dépannage

**Problème: "Failed to fetch"**
- Vérifier que le backend est démarré
- Vérifier que ngrok est actif
- Vérifier que VITE_API_URL sur Netlify est correct

**Problème: CORS errors**
- Vérifier WebConfig.java (déjà configuré)
- Nettoyer et redéployer

**Problème: PWA ne s'installe pas**
- Vérifier que manifest.webmanifest existe
- Vérifier que le site est en HTTPS
