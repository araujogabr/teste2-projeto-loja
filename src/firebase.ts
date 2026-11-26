// Conexão do servidor com o Firebase.
// Aqui usamos o "Admin SDK" (kit de desenvolvimento para administrador),
// a versão do Firebase feita para rodar no back-end.

import { readFileSync } from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// A chave de serviço é um arquivo JSON baixado no console do Firebase.
// Ela dá acesso total ao projeto, por isso fica fora do Git (veja o .gitignore).
// Na nuvem (Vercel) a chave vem da variável de ambiente FIREBASE_SERVICE_ACCOUNT.
// No computador, continua vindo do arquivo serviceAccountKey.json.
const chave = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : JSON.parse(readFileSync("./serviceAccountKey.json", "utf-8"));

initializeApp({ credential: cert(chave) });

// db   -> banco de dados Firestore
// auth -> serviço de autenticação (usado para conferir o token do usuário)
export const db = getFirestore();
export const auth = getAuth();
