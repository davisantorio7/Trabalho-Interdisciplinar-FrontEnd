const produtos = [
    { id: "marguerita", produtoID: 1, nome: "Marguerita", preco: 49.90 },
    { id: "calabresa", produtoID: 2, nome: "Calabresa", preco: 49.90 },
    { id: "queijos", produtoID: 3, nome: "Quatro Queijos", preco: 54.90 },
    { id: "frango", produtoID: 4, nome: "Frango com Cebola", preco: 52.90 }
];

const botaoTema = document.getElementById("botao-tema");
const iconeTema = document.getElementById("icone-tema");
const botaoMenu = document.getElementById("botao-menu");
const navegacao = document.getElementById("navegacao");
const modalCarrinho = document.getElementById("modal-carrinho");
const itensCarrinho = document.getElementById("itens-carrinho");
let carrinho = JSON.parse(localStorage.getItem("lylloCarrinho")) || [];

function atualizarTema() {
    const escuro = localStorage.getItem("lylloTema") === "escuro";
    document.body.classList.toggle("escuro", escuro);
    iconeTema.src = escuro ? "sol.svg" : "lua.svg";
}

atualizarTema();

botaoTema.addEventListener("click", function () {
    const novoTema = document.body.classList.contains("escuro") ? "claro" : "escuro";
    localStorage.setItem("lylloTema", novoTema);
    atualizarTema();
});

botaoMenu.addEventListener("click", function () {
    const aberto = navegacao.classList.toggle("aberta");
    botaoMenu.setAttribute("aria-expanded", aberto);
});

function salvarCarrinho() {
    localStorage.setItem("lylloCarrinho", JSON.stringify(carrinho));
}

function mostrarCarrinho() {
    itensCarrinho.innerHTML = "";
    let total = 0;

    if (carrinho.length === 0) {
        itensCarrinho.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio.</p>';
    }

    for (const item of carrinho) {
        const produto = produtos.find(function (p) {
            return p.id === item.id;
        });

        if (!produto) {
            continue;
        }

        total += produto.preco * item.quantidade;
        itensCarrinho.innerHTML += `
            <div class="item-carrinho">
                <div>
                    <h3>${produto.nome}</h3>
                    <p>R$ ${produto.preco.toFixed(2).replace(".", ",")} cada</p>
                </div>
                <div class="quantidade">
                    <button type="button" data-acao="diminuir" data-id="${item.id}" aria-label="Diminuir quantidade"><img src="menos.svg"></button>
                    <span>${item.quantidade}</span>
                    <button type="button" data-acao="aumentar" data-id="${item.id}" aria-label="Aumentar quantidade"><img src="mais.svg"></button>
                    <button class="remover-item" type="button" data-acao="remover" data-id="${item.id}" aria-label="Remover item"><img src="lixeira.svg"></button>
                </div>
            </div>
        `;
    }

    document.getElementById("valor-total").textContent = "R$ " + total.toFixed(2).replace(".", ",");
}

document.getElementById("botao-carrinho").addEventListener("click", function () {
    mostrarCarrinho();
    modalCarrinho.showModal();
});

document.querySelectorAll(".botao-pedir").forEach(function (botao) {
    botao.addEventListener("click", function () {
        const id = botao.dataset.id;
        let item = carrinho.find(function (p) {
            return p.id === id;
        });

        if (item) {
            item.quantidade++;
        } else {
            carrinho.push({ id: id, quantidade: 1 });
        }

        salvarCarrinho();
        mostrarCarrinho();
        modalCarrinho.showModal();
    });
});

itensCarrinho.addEventListener("click", function (evento) {
    const botao = evento.target.closest("button");

    if (!botao) {
        return;
    }

    const item = carrinho.find(function (p) {
        return p.id === botao.dataset.id;
    });

    if (!item) {
        return;
    }

    if (botao.dataset.acao === "aumentar") {
        item.quantidade++;
    }

    if (botao.dataset.acao === "diminuir") {
        item.quantidade--;
    }

    if (botao.dataset.acao === "remover" || item.quantidade === 0) {
        carrinho = carrinho.filter(function (p) {
            return p.id !== item.id;
        });
    }

    salvarCarrinho();
    mostrarCarrinho();
});

document.getElementById("exportar-pedidos").addEventListener("click", function () {
    const mensagem = document.getElementById("mensagem-exportacao");
    const dados = JSON.parse(localStorage.getItem("lylloPerfil")) || {};

    if (carrinho.length === 0) {
        mensagem.textContent = "Adicione uma pizza antes de salvar o pedido.";
        return;
    }

    if (!dados.nome || !dados.telefone || !dados.endereco) {
        mensagem.textContent = "Preencha os dados do perfil antes de salvar o pedido.";
        return;
    }

    const pedidos = carrinho.map(function (item) {
        const produto = produtos.find(function (p) {
            return p.id === item.id;
        });

        return {
            Cliente: dados.nome,
            Telefone: dados.telefone,
            Endereco: dados.endereco,
            ProdutoID: produto.produtoID,
            Quantidade: item.quantidade
        };
    });

    const arquivo = new Blob([JSON.stringify(pedidos, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(arquivo);
    link.download = "pedidos.json";
    link.click();
    URL.revokeObjectURL(link.href);
    mensagem.textContent = "Arquivo de pedidos salvo.";
});

document.querySelectorAll(".fechar-modal").forEach(function (botao) {
    botao.addEventListener("click", function () {
        botao.closest("dialog").close();
    });
});

document.querySelectorAll("dialog").forEach(function (modal) {
    modal.addEventListener("click", function (evento) {
        if (evento.target === modal) {
            modal.close();
        }
    });
});

const gradeProdutos = document.getElementById("lista-pizzas");

if (gradeProdutos) {
    const termo = new URLSearchParams(window.location.search).get("busca") || "";
    document.getElementById("campo-busca").value = termo;
    let encontrados = 0;

    document.querySelectorAll(".produto").forEach(function (card) {
        const aparece = card.textContent.toLowerCase().includes(termo.toLowerCase());
        card.hidden = !aparece;

        if (aparece) {
            encontrados++;
        }
    });

    document.getElementById("sem-resultado").hidden = encontrados !== 0;
}

function mascaraTelefone(valor) {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    if (numeros.length <= 2) {
        return numeros.length ? "(" + numeros : "";
    }

    if (numeros.length <= 7) {
        return "(" + numeros.slice(0, 2) + ") " + numeros.slice(2);
    }

    return "(" + numeros.slice(0, 2) + ") " + numeros.slice(2, 7) + "-" + numeros.slice(7);
}

function mascaraCpf(valor) {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    if (numeros.length <= 3) {
        return numeros;
    }

    if (numeros.length <= 6) {
        return numeros.slice(0, 3) + "." + numeros.slice(3);
    }

    if (numeros.length <= 9) {
        return numeros.slice(0, 3) + "." + numeros.slice(3, 6) + "." + numeros.slice(6);
    }

    return numeros.slice(0, 3) + "." + numeros.slice(3, 6) + "." + numeros.slice(6, 9) + "-" + numeros.slice(9);
}

document.querySelectorAll("#cadastro-telefone, #perfil-telefone").forEach(function (campo) {
    campo.addEventListener("input", function () {
        campo.value = mascaraTelefone(campo.value);
    });
});

const campoCpf = document.getElementById("cadastro-cpf");

if (campoCpf) {
    campoCpf.addEventListener("input", function () {
        campoCpf.value = mascaraCpf(campoCpf.value);
    });
}

const campoNumero = document.getElementById("cadastro-numero");

if (campoNumero) {
    campoNumero.addEventListener("input", function () {
        campoNumero.value = campoNumero.value.replace(/\D/g, "").slice(0, 6);
    });
}

const abrirCadastro = document.getElementById("abrir-cadastro");

if (abrirCadastro) {
    const modalCadastro = document.getElementById("modal-cadastro");

    abrirCadastro.addEventListener("click", function () {
        modalCadastro.showModal();
    });

    document.getElementById("form-cadastro").addEventListener("submit", function (evento) {
        evento.preventDefault();

        const telefone = document.getElementById("cadastro-telefone").value.replace(/\D/g, "");
        const cpf = campoCpf.value.replace(/\D/g, "");
        const senha = document.getElementById("cadastro-senha").value;
        const confirmacao = document.getElementById("cadastro-confirmacao").value;
        const mensagem = document.getElementById("mensagem-cadastro");

        if (telefone.length !== 11 || cpf.length !== 11) {
            mensagem.textContent = "Confira o telefone e o CPF.";
            return;
        }

        if (senha !== confirmacao) {
            mensagem.textContent = "As senhas precisam ser iguais.";
            return;
        }

        const dados = {
            nome: document.getElementById("cadastro-nome").value,
            email: document.getElementById("cadastro-email").value,
            telefone: document.getElementById("cadastro-telefone").value,
            endereco: document.getElementById("cadastro-endereco").value + ", " + campoNumero.value
        };

        localStorage.setItem("lylloPerfil", JSON.stringify(dados));
        mensagem.textContent = "Dados salvos neste navegador.";
    });

    document.getElementById("form-entrar").addEventListener("submit", function (evento) {
        evento.preventDefault();
        document.getElementById("mensagem-entrar").textContent = "O acesso estará disponível com a integração do sistema.";
    });
}

const formPerfil = document.getElementById("form-perfil");

if (formPerfil) {
    const dados = JSON.parse(localStorage.getItem("lylloPerfil")) || {};
    document.getElementById("perfil-nome").value = dados.nome || "";
    document.getElementById("perfil-email").value = dados.email || "";
    document.getElementById("perfil-telefone").value = dados.telefone || "";
    document.getElementById("perfil-endereco").value = dados.endereco || "";

    formPerfil.addEventListener("submit", function (evento) {
        evento.preventDefault();
        const novosDados = {
            nome: document.getElementById("perfil-nome").value,
            email: document.getElementById("perfil-email").value,
            telefone: document.getElementById("perfil-telefone").value,
            endereco: document.getElementById("perfil-endereco").value
        };

        if (novosDados.telefone.replace(/\D/g, "").length !== 11) {
            document.getElementById("mensagem-perfil").textContent = "Confira o telefone.";
            return;
        }

        localStorage.setItem("lylloPerfil", JSON.stringify(novosDados));
        document.getElementById("mensagem-perfil").textContent = "Dados salvos neste navegador.";
    });
}
