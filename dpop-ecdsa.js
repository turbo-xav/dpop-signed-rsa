async function generateECDSAKeyPair() {
    const keyPair = await crypto.subtle.generateKey(
        {
            name: "ECDSA", // Algorithme ECDSA
            namedCurve: "P-256" // Courbe elliptique P-256
        },
        true, // Les clés doivent être exportables
        ["sign", "verify"] // Usage : signer et vérifier
    );

    return keyPair;
}

(async () => {
    const keyPair = await generateECDSAKeyPair();

    // Exporter la clé publique
    const publicKey = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
    console.log("Clé publique (ECDSA) :", publicKey);

    // Exporter la clé privée
    const privateKey = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
    console.log("Clé privée (ECDSA) :", privateKey);
})();