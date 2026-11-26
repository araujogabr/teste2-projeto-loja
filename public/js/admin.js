// Painel do administrador: CRUD de produtos.

import { auth, onAuthStateChanged, signOut } from "./firebase.js";

const painel = document.querySelector("#painel");
const emailUsuario = document.querySelector("#email-usuario");
const botaoSair = document.querySelector("#botao-sair");

const menuListar = document.querySelector("#menu-listar");
const menuCadastrar = document.querySelector("#menu-cadastrar");
const telaLista = document.querySelector("#tela-lista");
const telaFormulario = document.querySelector("#tela-formulario");
const mensagem = document.querySelector("#mensagem");

const lista = document.querySelector("#lista-produtos");
const aviso = document.querySelector("#aviso");
const modelo = document.querySelector("#modelo-item");

const formulario = document.querySelector("#form-produto");
const tituloForm = document.querySelector("#titulo-form");
const botaoSalvar = document.querySelector("#botao-salvar");
const botaoCancelar = document.querySelector("#botao-cancelar");

// null = cadastrando um produto novo | id = editando o produto com esse id
let idEmEdicao = null;

// ---------- Conversa com a API ----------

// Faz uma requisição para a API enviando o token do usuário logado.
// É esse token que o middleware "autenticar" confere no servidor.
async function chamarApi(metodo, caminho, produto) {
  const token = await auth.currentUser.getIdToken();

  const resposta = await fetch(`/api/produtos${caminho}`, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: produto ? JSON.stringify(produto) : undefined,
  });

  if (resposta.status === 204) return null; // apagou: não há corpo na resposta

  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.erro);
  return dados;
}

function mostrarMensagem(texto, ehErro = false) {
  mensagem.textContent = texto;
  mensagem.className = ehErro ? "mensagem mensagem-erro" : "mensagem";
  mensagem.hidden = false;
}

// ---------- Menu lateral: troca de tela ----------

// Mostra uma das telas ("lista" ou "formulario") e esconde a outra.
function mostrarTela(nome) {
  telaLista.hidden = nome !== "lista";
  telaFormulario.hidden = nome !== "formulario";

  // Destaca a opção do menu. Editar faz parte de "Listar produtos".
  const cadastrando = nome === "formulario" && idEmEdicao === null;
  menuCadastrar.classList.toggle("ativo", cadastrando);
  menuListar.classList.toggle("ativo", !cadastrando);
}

// Volta o formulário para o modo "novo produto".
function limparFormulario() {
  idEmEdicao = null;
  formulario.reset();

  tituloForm.textContent = "Novo produto";
  botaoSalvar.textContent = "Cadastrar produto";
}

function abrirLista() {
  limparFormulario();
  mensagem.hidden = true;
  mostrarTela("lista");
}

menuListar.addEventListener("click", abrirLista);
botaoCancelar.addEventListener("click", abrirLista);

menuCadastrar.addEventListener("click", () => {
  limparFormulario();
  mensagem.hidden = true;
  mostrarTela("formulario");
});

// ---------- READ: listar ----------

// Monta a linha de um produto a partir do <template> do admin.html.
function criarItem(produto) {
  const item = modelo.content.cloneNode(true); // copia o modelo

  const preco = produto.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  item.querySelector(".item-foto").src = produto.fotoUrl;
  item.querySelector(".item-nome").textContent = produto.nome;
  item.querySelector(".item-detalhes").textContent = `${preco} · ${produto.quantidade} un.`;

  item.querySelector(".botao-editar").addEventListener("click", () => iniciarEdicao(produto));
  item.querySelector(".botao-excluir").addEventListener("click", () => excluir(produto));

  return item;
}

async function carregarProdutos() {
  try {
    const produtos = await chamarApi("GET", "");

    lista.replaceChildren(); // esvazia a lista antes de montar de novo
    for (const produto of produtos) {
      lista.append(criarItem(produto));
    }

    aviso.textContent = "Nenhum produto cadastrado ainda.";
    aviso.hidden = produtos.length > 0;
  } catch (erro) {
    aviso.textContent = erro.message;
    aviso.hidden = false;
  }
}

// ---------- CREATE e UPDATE: salvar ----------

// Abre o formulário preenchido com os dados do produto escolhido.
function iniciarEdicao(produto) {
  idEmEdicao = produto.id;

  formulario.nome.value = produto.nome;
  formulario.descricao.value = produto.descricao;
  formulario.preco.value = produto.preco;
  formulario.quantidade.value = produto.quantidade;
  formulario.fotoUrl.value = produto.fotoUrl;

  tituloForm.textContent = "Editar produto";
  botaoSalvar.textContent = "Salvar alterações";
  mensagem.hidden = true;

  mostrarTela("formulario");
}

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault(); // impede a página de recarregar

  // Monta o objeto que será enviado como JSON para a API.
  const produto = {
    nome: formulario.nome.value,
    descricao: formulario.descricao.value,
    preco: Number(formulario.preco.value),
    quantidade: Number(formulario.quantidade.value),
    fotoUrl: formulario.fotoUrl.value,
  };

  try {
    if (idEmEdicao === null) {
      await chamarApi("POST", "", produto);
      mostrarMensagem("Produto cadastrado.");
    } else {
      await chamarApi("PUT", `/${idEmEdicao}`, produto);
      mostrarMensagem("Produto atualizado.");
    }

    // Deu certo: limpa o formulário e volta para a lista atualizada.
    limparFormulario();
    mostrarTela("lista");
    await carregarProdutos();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
});

// ---------- DELETE: excluir ----------

async function excluir(produto) {
  const confirmou = window.confirm(`Excluir "${produto.nome}"?`);
  if (!confirmou) return;

  try {
    await chamarApi("DELETE", `/${produto.id}`);
    mostrarMensagem("Produto excluído.");
    await carregarProdutos();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

// ---------- Login e logout ----------

// Roda sempre que o estado do login muda (entrou, saiu ou abriu a página).
onAuthStateChanged(auth, (usuario) => {
  if (!usuario) {
    window.location.href = "login.html"; // sem login não entra no painel
    return;
  }

  emailUsuario.textContent = usuario.email;
  painel.hidden = false;
  carregarProdutos();
});

botaoSair.addEventListener("click", () => signOut(auth));
