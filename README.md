## OAuth 2.0 DPoP (Demonstrating Proof of Possession)

### Qu'est-ce que DPoP ?

DPoP est une extension de OAuth 2.0 qui permet de lier cryptographiquement les tokens d'accès à un client spécifique lorsqu'ils sont émis[_{{{CITATION{{{_2{RFC 9449: OAuth 2.0 Demonstrating Proof of Possession (DPoP) - RFC Editor](https://www.rfc-editor.org/rfc/rfc9449.pdf). Cela améliore la sécurité des tokens porteur en exigeant que l'application utilisant le token prouve qu'elle possède la même clé privée utilisée pour obtenir le token[_{{{CITATION{{{_1{OAuth 2.0 DPoP - Demonstrating Proof of Possession - RFC9449](https://oauth.net/2/dpop/).

### Fonctionnalités

- **Protection des tokens** : Assure que seules les applications autorisées peuvent utiliser les tokens d'accès et de rafraîchissement[_{{{CITATION{{{_3{OAuth 2.0 Security Enhancements | Auth0](https://auth0.com/blog/oauth2-security-enhancements/).
- **Détection des attaques de rejeu** : Permet de détecter les attaques de rejeu avec les tokens d'accès et de rafraîchissement[_{{{CITATION{{{_2{RFC 9449: OAuth 2.0 Demonstrating Proof of Possession (DPoP) - RFC Editor](https://www.rfc-editor.org/rfc/rfc9449.pdf).
- **Utilisation de la cryptographie asymétrique** : L'application doit prouver qu'elle possède la clé privée correspondante[_{{{CITATION{{{_3{OAuth 2.0 Security Enhancements | Auth0](https://auth0.com/blog/oauth2-security-enhancements/).

### Comment ça fonctionne ?

1. **Génération de clé publique/privée** : L'application génère une paire de clés publique/privée[_{{{CITATION{{{_3{OAuth 2.0 Security Enhancements | Auth0](https://auth0.com/blog/oauth2-security-enhancements/).
2. **Création de preuve DPoP** : L'application crée une preuve DPoP, qui est un JWT contenant la clé publique et les informations sur l'HTTP request[_{{{CITATION{{{_3{OAuth 2.0 Security Enhancements | Auth0](https://auth0.com/blog/oauth2-security-enhancements/).
3. **Envoi de la preuve DPoP** : L'application inclut la preuve DPoP dans l'en-tête DPoP de l'HTTP request lors de la demande du token[_{{{CITATION{{{_3{OAuth 2.0 Security Enhancements | Auth0](https://auth0.com/blog/oauth2-security-enhancements/).
4. **Vérification de la preuve DPoP** : Le serveur d'autorisation vérifie la preuve DPoP pour s'assurer que l'application est bien la destinataire légitime du token[_{{{CITATION{{{_3{OAuth 2.0 Security Enhancements | Auth0](https://auth0.com/blog/oauth2-security-enhancements/).

Pour plus d'informations, consulte la [RFC 9449](https://www.rfc-editor.org/rfc/rfc9449.pdf).


# Jeton DPop avec OAuth2

## Description
Le jeton DPop est une extension de l'OAuth 2.0 qui permet de lier cryptographiquement les jetons d'accès à un client spécifique lors de leur émission. Cela améliore la sécurité des jetons d'accès en exigeant que l'application utilisant le jeton prouve qu'elle possède la clé privée utilisée pour obtenir le jeton.

## Fonctionnalités principales
- **Sécurité renforcée** : Les jetons sont liés à un client spécifique, réduisant les risques de vol et d'utilisation frauduleuse.
- **Authenticité** : Utilisation de clés publiques/privées pour créer une signature DPoP qui confirme l'authenticité de la demande.
- **Protection des tokens** : Les tokens sont moins utilisables si volés.

## Instructions d'installation
1. **Configurer le serveur OAuth2** : Assurez-vous que votre serveur OAuth2 est configuré pour utiliser DPoP.
2. **Générer les clés** : Créez une paire de clés publique/privée pour votre application cliente.
3. **Émettre des jetons** : Lors de l'émission des jetons d'accès, liez-les cryptographiquement à l'application cliente en utilisant la clé privée.
4. **Valider les requêtes** : Sur le serveur de ressources, validez les requêtes en vérifiant la signature DPoP pour confirmer l'authenticité de la demande.

## Guide d'utilisation
1. **Envoyer des requêtes** : Ajoutez les en-têtes DPoP nécessaires avec la signature lors de l'envoi de requêtes HTTP.
2. **Recevoir des réponses** : Le serveur de ressources valide les requêtes et renvoie les réponses si la signature DPoP est correcte.
3. **Gérer les jetons** : Surveillez et gérez les jetons d'accès pour garantir leur sécurité et leur validité.

## Exemple de jeton DPoP

### Exemple de demande de jeton DPoP

Lorsqu'une application cliente demande un jeton d'accès en utilisant DPoP, elle doit inclure l'en-tête `DPoP` dans sa requête HTTP. Voici un exemple de cette requête :

```http
POST /token HTTP/1.1
Host: auth.example.com
Content-Type: application/x-www-form-urlencoded

```javascript
{
  "typ": "dpop+jwt",
  "alg": "RS256",
  "jwk": {
    "kty": "RSA",
    "e": "AQAB",
    "use": "sig",
    "kid": "b2c7a9d1b7714d88a7c5b1c",
    "n": "r2PY7Oro8fQLuU2_e4...C7VBo"
  }
}
,
{
  "htm": "POST",
  "htu": "https://auth.example.com/token",
  "iat": 1615284586,
  "exp": 1615288186,
  "jti": "4c2cb748-1cb3-45bc-8f07-7e7d9f7e8e90"
}
,
```
