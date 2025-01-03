const express = require("express");
const bodyParser = require("body-parser"); // Permet de lire les JSON POST
const cors = require("cors");
const { importJWK, jwtVerify } = require("jose"); // Pour gérer JWK et preuve DPoP

const app = express();
const PORT = 3000;
app.use(cors({
    origin: "http://localhost:8081", // Adresse du frontend autorisée
    methods: ["GET", "POST"], // Méthodes HTTP autorisées
    allowedHeaders: ["Content-Type", "x-client-id", "dpop",'authorization'], // En-têtes autorisés
}));
// Middleware pour lire le JSON des requêtes
app.use(bodyParser.json());

// Inventaire simulé de clé (stockage en mémoire pour cet exemple)
const dpopKeysStore = {};

// Endpoint : Enregistrement de la clé publique
app.post("/register-dpop-key", async (req, res) => {
    try {
        const { clientId, dpopKey } = req.body;

        // Valider les champs
        if (!clientId || !dpopKey) {
            return res.status(400).send("Le champ 'clientId' ou 'dpopKey' est manquant.");
        }

        // Importer la clé publique depuis le format JWK
        const publicKey = await importJWK(dpopKey, "RS256");

        // Sauvegarder la clé publique dans la mémoire (associée au clientId)
        dpopKeysStore[clientId] = publicKey;

        console.log(`Clé publique enregistrée pour le clientId ${clientId}.`);

        res.status(200).send("Clé publique DPoP enregistrée avec succès !");
    } catch (err) {
        console.error("Erreur lors de l'enregistrement de la clé DPoP :", err);
        res.status(500).send("Erreur serveur : Impossible d'enregistrer la clé publique.");
    }
});

// Endpoint : API simulée sécurisée avec DPoP
app.get("/secure-endpoint", async (req, res) => {
    try {
        const clientId = req.headers["x-client-id"]; // Lire l'identifiant du client depuis l'en-tête
        const dpopProof = req.headers["dpop"]; // Lire la preuve DPoP

        // Valider la présence de `clientId` et `dpop`
        if (!clientId || !dpopProof) {
            return res.status(400).send("Client ID ou preuve DPoP manquant dans les en-têtes.");
        }

        // Récupérer la clé publique sauvegardée pour ce client
        const publicKey = dpopKeysStore[clientId];
        if (!publicKey) {
            return res.status(404).send("Client ID inconnu ou clé publique non enregistrée.");
        }

        // Vérifier la preuve DPoP
        const { payload } = await jwtVerify(dpopProof, publicKey);

        // Vérifications supplémentaires (optionnel)
        const currentTimestamp = Math.floor(Date.now() / 1000);
        console.warn("Timestamp actuel :", currentTimestamp);
        console.warn("Timestamp trouvé :", payload.iat);
        if (payload.iat < currentTimestamp - 300) {
            // Token émis il y a plus de 5 minutes
            return res.status(401).send("La preuve DPoP est expirée.");
        }

        console.log("Preuve DPoP valide pour le client :", clientId);
        console.log("Payload DPoP :", payload);

        // Réponse de l'API sécurisée
        res.status(200).json({
            message: "Requête sécurisée réussie. Votre preuve DPoP est valide.",
        });
    } catch (err) {
        console.error("Erreur de vérification DPoP :", err);
        res.status(401).send("Preuve DPoP invalide.");
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur : http://localhost:${PORT}`);
});