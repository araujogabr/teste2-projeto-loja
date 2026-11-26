// Página de login: entra ou cria uma conta com e-mail e senha
// usando o Firebase Authentication.

import {
  auth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "./firebase.js";

const formulario = document.querySelector("#form-login");
const titulo = document.querySelector("#titulo");
const subtitulo = document.querySelector("#subtitulo");
const campoEmail = document.querySelector("#email");
const campoSenha = document.querySelector("#senha");
const mensagem = document.querySelector("#mensagem");
const botaoEnviar = document.querySelector("#botao-enviar");
const botaoAlternar = document.querySelector("#botao-alternar");

let criandoConta = false; // false = tela de entrar | true = tela de criar conta

// O Firebase devolve códigos de erro em inglês; aqui traduzimos os mais comuns.
const ERROS = {
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/user-not-found": "E-mail ou senha incorretos.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  "auth/invalid-email": "Digite um e-mail válido.",
  "auth/email-already-in-use": "Já existe uma conta com esse e-mail.",
  "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
  "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco e tente de novo.",
  "auth/network-request-failed": "Sem conexão com a internet.",
  "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
    "Configuração do Firebase não preenchida (veja public/js/firebase.js).",
};

function mostrarErro(texto) {
  mensagem.textContent = texto;
  mensagem.className = "mensagem mensagem-erro";
  mensagem.hidden = false;
}

// Quem já está logado vai direto para o painel.
onAuthStateChanged(auth, (usuario) => {
  if (usuario) window.location.href = "admin.html";
});

// Troca os textos da tela entre "entrar" e "criar conta".
botaoAlternar.addEventListener("click", () => {
  criandoConta = !criandoConta;
  mensagem.hidden = true;

  if (criandoConta) {
    titulo.textContent = "Criar conta";
    subtitulo.textContent = "Crie sua conta de administrador.";
    botaoEnviar.textContent = "Criar conta";
    botaoAlternar.textContent = "Já tem conta? Entrar";
  } else {
    titulo.textContent = "Entrar";
    subtitulo.textContent = "Acesse o painel para gerenciar os produtos.";
    botaoEnviar.textContent = "Entrar";
    botaoAlternar.textContent = "Ainda não tem conta? Criar conta";
  }
});

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault(); // impede a página de recarregar
  mensagem.hidden = true;
  botaoEnviar.disabled = true;

  const email = campoEmail.value.trim();
  const senha = campoSenha.value;

  try {
    if (criandoConta) {
      await createUserWithEmailAndPassword(auth, email, senha);
    } else {
      await signInWithEmailAndPassword(auth, email, senha);
    }
    // Deu certo: o onAuthStateChanged lá em cima faz o redirecionamento.
  } catch (erro) {
    mostrarErro(ERROS[erro.code] ?? "Não foi possível entrar. Tente novamente.");
    botaoEnviar.disabled = false;
  }
});
