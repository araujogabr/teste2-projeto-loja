// Conexão do FRONT-END com o Firebase (usada só para o login).
// O banco de dados não é acessado daqui: quem fala com o Firestore é a API.

// No navegador, sem empacotador (bundler), o Firebase é importado por um
// endereço completo. O import "firebase/app" que o console do Firebase mostra
// só funciona em projetos com empacotador (Vite, Webpack...).
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

// Configuração do projeto no Firebase.
// Estes dados não são secretos: eles só identificam o projeto.
const firebaseConfig = {
  apiKey: "AIzaSyBicOEKYq6zB6F3nWbERzpKj7rwyfJnICs",
  authDomain: "projeto-loja-7be08.firebaseapp.com",
  projectId: "projeto-loja-7be08",
  storageBucket: "projeto-loja-7be08.firebasestorage.app",
  messagingSenderId: "936831939674",
  appId: "1:936831939674:web:b8f472468525296553d463",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Repassamos as funções de autenticação para os outros arquivos
// importarem daqui, sem precisar repetir o endereço do Firebase.
export {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
