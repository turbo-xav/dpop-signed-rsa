// Générer une paire de clés RSA (2048 bits)
const generateKeyPair = async () => {
    return await crypto.subtle.generateKey(
        {
            name: "RSASSA-PKCS1-v1_5", // Algorithme pour signer les JWT DPoP
            modulusLength: 2048,      // Longueur de la clé RSA
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // Exposant public: 65537
            hash: { name: "SHA-256" }, // Algorithme de hachage SHA-256
        },
        true, // Les clés sont exportables
        ["sign", "verify"] // Clé privée pour signer, clé publique pour vérifier
    );
}

// Convertir un buffer en Base64URL
const toBase64Url = (buffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, ""); // Transformer Base64 en Base64URL
}

// Créer et signer une preuve DPoP
const createAndSignDPoPProof = async (privateKey, method, url) =>{
    // En-tête du JWT
    const header = {
        alg: "RS256", // Type d'algorithme
        typ: "dpop+jwt", // Indique qu'il s'agit d'une preuve DPoP
    };

    // Payload du JWT
    const payload = {
        htm: method,               // Méthode HTTP (par ex., "GET", "POST")
        htu: url,                  // URL cible
        jti: crypto.randomUUID(),  // Identifiant unique (nonce pour éviter les replays)
        iat: Math.floor(Date.now() / 1000), // Timestamp (en secondes)
    };

    // Encodage en Base64URL des parties du JWT
    const encoder = new TextEncoder();
    const headerEncoded = toBase64Url(encoder.encode(JSON.stringify(header)));
    const payloadEncoded = toBase64Url(encoder.encode(JSON.stringify(payload)));

    // JWT non signé
    const unsignedJwt = `${headerEncoded}.${payloadEncoded}`;

    // Signer le JWT avec la clé privée
    const signature = await crypto.subtle.sign(
        { name: "RSASSA-PKCS1-v1_5" },    // Algorithme RSA
        privateKey,                       // La clé privée pour signer
        encoder.encode(unsignedJwt)       // Signer les données du JWT non signé
    );

    // Ajouter la signature au JWT pour le compléter
    const signatureEncoded = toBase64Url(signature);
    return `${unsignedJwt}.${signatureEncoded}`;
}

// Exemple d'intégration avec une requête Fetch
const makeSecureRequest = async (privateKey) => {
    // URL de l'API cible
    const apiUrl = "http://localhost:8081";

    // Créer une preuve DPoP pour cette requête
    const dpopProof = await createAndSignDPoPProof(privateKey, "GET", apiUrl);

    // Envoyer la requête avec DPoP
    const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
            Authorization: `Bearer ACCESS_TOKEN`, // Token d'accès OAuth2 (par exemple)
            DPoP: dpopProof, // Preuve DPoP ajoutée à l'en-tête
        },
    });

    // Traiter la réponse
    if (response.ok) {
        const data = await response.text();
        console.log("Réponse de l'API :", data);
    } else {
        console.error("Erreur API :", response.status);
    }
}

// Exporter les clés au format JWK pour les sauvegarder ou les transmettre
const exportKeys= async (keyPair) => {
    const publicKey = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
    const privateKey = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
    return { publicKey, privateKey };
}

const  sendPublicKeyToServer = async (keyPair) => {
    // Exporter la clé publique au format JWK
    const exportedKeys = await exportKeys(keyPair);
    const jwk = exportedKeys.publicKey;
    // Exemple d'URL d'enregistrement de clé publique sur le serveur
    const serverUrl = "http://localhost:3000/register-dpop-key";

    // Faire une requête POST pour envoyer la clé au serveur
    const response = await fetch(serverUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            clientId: "my-client-id", // Identifiant unique pour le client (si nécessaire)
            dpopKey: jwk, // Clé publique JWK
        }),
    });

    if (!response.ok) {
        console.error("Erreur lors de l'envoi de la clé publique :", response.status, await response.text());
        return;
    }

    console.log("Clé publique enregistrée avec succès !");
}

const sendRequestWithHeaders = async (privateKey) => {
    const clientId = "my-client-id";

    // Exemple de données
    const method = "GET";
    const url = "http://localhost:3000/secure-endpoint";

    // Générer une preuve DPoP signée (en supposant que vous avez `createAndSignDPoPProof`)
    const dpopProof = await createAndSignDPoPProof(privateKey, method, url); // Clé privée utilisée pour signer

    // Appeler l'endpoint sécurisé
    fetch(url, {
        method: "GET",
        headers: {
            "x-client-id": clientId,
            "dpop": dpopProof, // Ajout de la preuve DPoP signée
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP : ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log("Réponse sécurisée (avec preuve DPoP) :", data);
        })
        .catch((error) => {
            console.error("Erreur lors de la requête sécurisée :", error);
        });
};



const boostrap = async () => {
    // Génération de la paire de clés RSA (si ce n'est pas encore fait)
    const keyPair = await generateKeyPair();
    console.warn("Public key :", keyPair.publicKey);
    console.warn("Private key :", keyPair.privateKey);
    await sendPublicKeyToServer(keyPair);
    const exportedKeys = await exportKeys(keyPair); // Exporter au format JWK
    console.warn("Clé publique (JWK) :", exportedKeys.publicKey);
    console.warn("Clé privée (JWK) :", exportedKeys.privateKey);
    // Récupérer la clé privée
    const privateKey = keyPair.privateKey;
    sendRequestWithHeaders(privateKey);
    // Envoyer une requête à une API avec la preuve DPoP
    try {
        await makeSecureRequest(privateKey);
    } catch (err) {
        console.error("Une erreur est survenue :", err);
    }
};

boostrap()