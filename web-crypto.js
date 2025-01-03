// Constantes pour l'IndexedDB
const DB_NAME = "SecureDB";
const STORE_NAME = "DataStore";

// Générer une clé cryptographique AES-GCM
const generateKey= async () => {
    return window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256 // Longueur de clé en bits
        },
        true, // Peut être exportée
        ["encrypt", "decrypt"]
    );
}

// Chiffrer une donnée (plaintext)
const encryptData = async (key, plaintext) => {
    const encoder = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Vecteur d'initialisation
    const ciphertext = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        encoder.encode(plaintext)
    );
    return { ciphertext, iv };
}

// Déchiffrer une donnée
const decryptData = async (key, encryptedData) => {
    const { ciphertext, iv } = encryptedData;
    const decoder = new TextDecoder();
    const plaintext = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        ciphertext
    );
    return decoder.decode(plaintext);
}

// Initialiser IndexedDB
const initIndexedDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// Enregistrer une donnée chiffrée dans IndexedDB
const saveToIndexedDB = async (db, id, data) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        store.put({ id, data });

        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject(event.target.error);
    });
}

// Lire une donnée depuis IndexedDB
const readFromIndexedDB = async (db, id) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result?.data);
        request.onerror = (event) => reject(event.target.error);
    });
}

// Exemple complet : Chiffrement, stockage et récupération
(async () => {
    // Générer une clé
    const key = await generateKey();

    // Données à sécuriser
    const plaintext = "Hello, Secure World!";

    // Chiffrer et stocker
    const { ciphertext, iv } = await encryptData(key, plaintext);
    const db = await initIndexedDB();
    await saveToIndexedDB(db, "secureData", { ciphertext, iv });

    // Lire et déchiffrer
    const encryptedData = await readFromIndexedDB(db, "secureData");
    const decryptedText = await decryptData(key, encryptedData);

    console.log("Donnée déchiffrée : ", decryptedText);
})();