// Générer une paire de clés RSA
async function generateDPoPKeyPair() {
    const keyPair = await crypto.subtle.generateKey(
        {
            name: "RSASSA-PKCS1-v1_5", // Algorithme RSA
            modulusLength: 2048,      // Taille de la clé (2048 bits est recommandé)
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // Exposant public (65537)
            hash: { name: "SHA-256" }, // Algorithme de hachage
        },
        true, // Les clés doivent être exportables
        ["sign", "verify"] // Usage : signer et vérifier
    );

    return keyPair; // Renvoie l'objet contenant les clés publique et privée
}

// Exemple d'utilisation
(async () => {
    const keyPair = await generateDPoPKeyPair();

    // Exporter la clé publique
    const publicKey = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
    console.log("Clé publique :", publicKey);

    // Exporter la clé privée
    const privateKey = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
    console.log("Clé privée :", privateKey);
})();