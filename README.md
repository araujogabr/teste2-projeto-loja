# Loja Simples

Projeto de estudo que junta **HTML, CSS e JavaScript** no front-end com uma **API em Express + TypeScript** e o **Firebase** (login e banco de dados).

O sistema tem duas partes:

- **Vitrine** (`/`): página pública que mostra todos os produtos.
- **Painel do administrador** (`/admin.html`): quem faz login pode cadastrar, listar, editar e excluir produtos (CRUD).

Cada produto tem nome, descrição, preço, quantidade disponível e o link de uma foto. Não há carrinho nem compra.

## Como rodar

### 1. Pré-requisito

Node.js **22 ou mais novo** (`node -v` para conferir). É uma exigência da versão atual do `firebase-admin`.

### 2. Instalar as dependências

```bash
npm install
```

### 3. Criar o projeto no Firebase

No [console do Firebase](https://console.firebase.google.com) (os nomes dos menus podem variar um pouco):

1. **Criar projeto** — o Google Analytics pode ficar desativado.
2. **Authentication → Método de login → E-mail/senha → Ativar.**
3. **Firestore Database → Criar banco de dados.** Pode escolher o *modo de produção*: o navegador nunca acessa o banco direto, só a API.
4. **Configurações do projeto (engrenagem) → Contas de serviço → Gerar nova chave privada.** O download é um arquivo `.json`. Renomeie para `serviceAccountKey.json` e coloque na **raiz do projeto** (ao lado do `package.json`).

> Esse arquivo dá acesso total ao projeto. Ele já está no `.gitignore` — nunca envie para o GitHub.

### 4. Configurar o login no front-end

Ainda em **Configurações do projeto → Geral → Seus aplicativos**, clique no ícone **Web (`</>`)**, registre o app e copie o objeto `firebaseConfig`. Cole os valores em `public/js/firebase.js`, no lugar dos `COLE_AQUI`.

### 5. Iniciar

```bash
npm run dev
```

Abra **http://localhost:3000**. Para o primeiro acesso ao painel, use **Criar conta** na tela de login.

> Abra sempre pelo endereço `http://localhost:3000`. Abrir o `index.html` com dois cliques (endereço `file://`) não funciona, porque a página precisa conversar com a API.

## Estrutura

```
loja-simples/
├── public/                  FRONT-END (HTML, CSS e JS puro)
│   ├── index.html           vitrine pública
│   ├── login.html           entrar / criar conta
│   ├── admin.html           painel com o CRUD
│   ├── css/estilo.css
│   └── js/
│       ├── index.js         busca os produtos e monta a vitrine
│       ├── login.js         login e cadastro de usuário
│       ├── admin.js         cadastrar, listar, editar e excluir
│       └── firebase.js      configuração do Firebase no navegador (login)
├── src/                     BACK-END (Express + TypeScript)
│   ├── server.ts            o servidor e todas as rotas da API
│   └── firebase.ts          conexão com o Firestore e o Authentication
└── serviceAccountKey.json   (você cria no passo 3 — não vai para o Git)
```

## Rotas da API

| Verbo  | Endereço            | Precisa de login? | O que faz               |
| ------ | ------------------- | ----------------- | ----------------------- |
| GET    | `/api/produtos`     | não               | lista todos os produtos |
| GET    | `/api/produtos/:id` | não               | busca um produto        |
| POST   | `/api/produtos`     | sim               | cadastra um produto     |
| PUT    | `/api/produtos/:id` | sim               | altera um produto       |
| DELETE | `/api/produtos/:id` | sim               | apaga um produto        |

`POST` e `PUT` recebem um JSON como este:

```json
{
  "nome": "Caneca de cerâmica",
  "descricao": "Caneca artesanal de 300 ml.",
  "preco": 39.9,
  "quantidade": 12,
  "fotoUrl": "https://exemplo.com/caneca.jpg"
}
```

Respostas de erro têm sempre o formato `{ "erro": "mensagem" }`, com os códigos 400 (dados inválidos), 401 (sem login) ou 404 (não encontrado).

## Como o login funciona

1. O navegador envia e-mail e senha para o **Firebase Authentication** (`login.js`).
2. O Firebase devolve um **token** (um texto que comprova quem é o usuário).
3. A cada requisição protegida, o front envia o token no cabeçalho `Authorization: Bearer <token>` (`admin.js`).
4. O middleware (função intermediária) `autenticar`, no `server.ts`, pede ao Firebase para conferir o token. Se for válido, a rota continua; se não for, responde com o erro 401.

A senha nunca passa pela nossa API nem fica no nosso banco: quem cuida dela é o Firebase.

Qualquer usuário logado pode gerenciar todos os produtos.

## Onde ficam os dados

No **Firestore**, na coleção `produtos`. Cada documento tem os campos `nome`, `descricao`, `preco`, `quantidade`, `fotoUrl` e `criadoEm` (data do cadastro, usada para ordenar a lista).

## Outros comandos

```bash
npm run verificar   # confere os tipos do TypeScript, sem gerar arquivos
npm run build       # compila para JavaScript na pasta dist/
npm start           # roda a versão compilada
```

## Ideias para continuar

- Página de detalhes do produto (a rota `GET /api/produtos/:id` já existe).
- Campo de busca ou ordenação por preço na vitrine.
- Campo de categoria no produto.
- Enviar a foto como arquivo, em vez de colar um link.
- Separar o `server.ts` em pastas (`routes`, `controllers`, `middlewares`).
