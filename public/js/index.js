// Vitrine: busca os produtos na API e monta os cartões na tela.

const lista = document.querySelector("#lista-produtos");
const aviso = document.querySelector("#aviso");
const modelo = document.querySelector("#modelo-produto");

// Monta o cartão de um produto a partir do <template> do index.html.
function criarCartao(produto) {
  const cartao = modelo.content.cloneNode(true); // copia o modelo

  // Usamos textContent para que o texto digitado pelo administrador
  // apareça sempre como texto, nunca como código HTML.
  cartao.querySelector(".produto-foto").src = produto.fotoUrl;
  cartao.querySelector(".produto-nome").textContent = produto.nome;
  cartao.querySelector(".produto-descricao").textContent = produto.descricao;

  // Transforma 19.9 em "R$ 19,90".
  cartao.querySelector(".preco").textContent = produto.preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const etiqueta = cartao.querySelector(".etiqueta");
  if (produto.quantidade > 0) {
    etiqueta.textContent = `${produto.quantidade} em estoque`;
  } else {
    etiqueta.textContent = "Esgotado";
    etiqueta.classList.add("etiqueta-esgotado");
  }

  return cartao;
}

async function carregarProdutos() {
  try {
    const resposta = await fetch("/api/produtos");
    const produtos = await resposta.json();

    if (produtos.length === 0) {
      aviso.textContent = "Nenhum produto cadastrado ainda.";
      return;
    }

    aviso.hidden = true;
    for (const produto of produtos) {
      lista.append(criarCartao(produto));
    }
  } catch {
    aviso.textContent = "Não foi possível carregar os produtos. Tente novamente mais tarde.";
  }
}

carregarProdutos();
