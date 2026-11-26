// API da Loja Simples: servidor Express com o CRUD de produtos.
// CRUD = Create, Read, Update, Delete (criar, ler, atualizar, apagar).

import express, { NextFunction, Request, Response } from "express";
import { auth, db } from "./firebase";

const app = express();
const PORTA = 3000;

app.use(express.json()); // permite receber JSON no corpo das requisições
app.use(express.static("public")); // entrega as páginas HTML, o CSS e o JS

// Na Vercel, a pasta public é entregue pela CDN, mas o endereço "/" chega ao Express.
// Este redirecionamento leva o visitante para a vitrine.
app.get("/", (req, res) => {
  res.redirect("/index.html");
});


// "produtos" é o nome da coleção no Firestore.
const produtos = db.collection("produtos");

// Formato de um produto.
interface Produto {
  nome: string;
  descricao: string;
  preco: number; // em reais, ex.: 19.9
  quantidade: number; // unidades disponíveis
  fotoUrl: string; // link de uma imagem da internet
}

// ---------- Funções de apoio ----------

// Confere os dados enviados pelo formulário.
// Devolve a mensagem de erro, ou um texto vazio quando está tudo certo.
function validar(produto: Produto): string {
  if (typeof produto.nome !== "string" || produto.nome.trim() === "") {
    return "Informe o nome do produto.";
  }
  if (typeof produto.descricao !== "string" || produto.descricao.trim() === "") {
    return "Informe a descrição do produto.";
  }
  if (typeof produto.preco !== "number" || produto.preco < 0) {
    return "Informe um preço válido.";
  }
  if (!Number.isInteger(produto.quantidade) || produto.quantidade < 0) {
    return "Informe uma quantidade válida (número inteiro).";
  }
  if (typeof produto.fotoUrl !== "string" || !produto.fotoUrl.startsWith("http")) {
    return "Informe o link da foto (começando com http).";
  }
  return "";
}

// Middleware (função intermediária) que protege as rotas do administrador.
//
// O front-end faz login no Firebase Authentication e recebe um token.
// Em cada requisição protegida ele envia esse token no cabeçalho:
//
//   Authorization: Bearer <token>
//
// Aqui o servidor confere com o Firebase se o token é verdadeiro.
async function autenticar(req: Request, res: Response, next: NextFunction) {
  const cabecalho = req.headers.authorization ?? "";
  const token = cabecalho.replace("Bearer ", "");

  try {
    await auth.verifyIdToken(token);
    next(); // tudo certo: segue para a rota
  } catch {
    res.status(401).json({ erro: "Você precisa estar logado." });
  }
}

// ---------- Rotas públicas (qualquer visitante) ----------

// READ — lista todos os produtos, do mais novo para o mais antigo.
app.get("/api/produtos", async (req, res) => {
  const resultado = await produtos
    .orderBy("criadoEm", "desc")
    .get();
  const lista = resultado.docs.map((doc) => ({ 
    id: doc.id, 
    ...doc.data() 
  }));
  res.json(lista);
});

// READ — busca um produto pelo id.
app.get("/api/produtos/:id", async (req, res) => {
  const id = String(req.params.id); // o id que veio no endereço
  const doc = await produtos.doc(id).get();

  if (!doc.exists) {
    res.status(404).json({ erro: "Produto não encontrado." });
    return;
  }

  res.json({ id: doc.id, ...doc.data() });
});

// ---------- Rotas protegidas (precisam de login) ----------
// O middleware "autenticar" roda antes da função da rota.

// CREATE — cadastra um produto.
app.post("/api/produtos", autenticar, async (req, res) => {
  // Pegamos do corpo só os campos que interessam; o resto é ignorado.
  const { nome, descricao, preco, quantidade, fotoUrl }: Produto = req.body ?? {};
  const produto = { nome, descricao, preco, quantidade, fotoUrl };

  const erro = validar(produto);
  if (erro) {
    res.status(400).json({ erro });
    return;
  }

  // criadoEm guarda a data do cadastro e serve para ordenar a lista.
  const doc = await produtos.add({ ...produto, criadoEm: Date.now() });
  res.status(201).json({ id: doc.id, ...produto }); // 201 = criado
});

// UPDATE — altera um produto.
app.put("/api/produtos/:id", autenticar, async (req, res) => {
  const { nome, descricao, preco, quantidade, fotoUrl }: Produto = req.body ?? {};
  const produto = { nome, descricao, preco, quantidade, fotoUrl };

  const erro = validar(produto);
  if (erro) {
    res.status(400).json({ erro });
    return;
  }

  const id = String(req.params.id);
  const referencia = produtos.doc(id);
  const doc = await referencia.get();

  if (!doc.exists) {
    res.status(404).json({ erro: "Produto não encontrado." });
    return;
  }

  await referencia.update({ ...produto });
  res.json({ id: doc.id, ...produto });
});

// DELETE — apaga um produto.
app.delete("/api/produtos/:id", autenticar, async (req, res) => {
  const id = String(req.params.id);
  const referencia = produtos.doc(id);
  const doc = await referencia.get();

  if (!doc.exists) {
    res.status(404).json({ erro: "Produto não encontrado." });
    return;
  }

  await referencia.delete();
  res.status(204).send(); // 204 = deu certo e não há conteúdo para devolver
});

// ---------- Erros e início do servidor ----------

// Qualquer falha inesperada nas rotas cai aqui.
// (Ter 4 parâmetros é o que faz o Express entender que é um tratador de erro.)
app.use((erro: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(erro);
  res.status(500).json({ erro: "Erro interno no servidor." });
});

app.listen(PORTA, (erro) => {
  if (erro) {
    console.error(`Não foi possível iniciar: a porta ${PORTA} já está em uso.`);
    process.exit(1);
  }

  console.log(`Loja rodando em http://localhost:${PORTA}`);
});
