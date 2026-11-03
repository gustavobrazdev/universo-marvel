// UNIVERSO MARVEL: todos os dados apresentados nos cards vêm das APIs.
// Personagens: https://akabab.github.io/superhero-api/api/all.json
// Quadrinhos: https://marvel.emreparker.com/v1

const API_HEROIS = "https://akabab.github.io/superhero-api/api";
const API_HQS = "https://marvel.emreparker.com/v1";
const POR_CLIQUE = 3;
const HQS_POR_CLIQUE = 2;

// IDs usados somente para escolher a ordem dos personagens mais conhecidos.
// Depois deles, o catálogo continua com outros personagens da Marvel.
const DESTAQUES = [346, 332, 414, 659, 149, 620, 106, 107, 579, 697, 717, 226];

// Preferimos HQs com dados completos. Edições antigas podem ter só capa/título.
// Secret Wars #1 (52447) é o exemplo documentado pela própria API.
const HQS_PREFERIDAS = [52447, 43528, 43512, 6951, 8906];

let personagens = [];
let proximoPersonagem = 0;
let carregandoPersonagens = false;
let carregandoHQs = false;
let offsetHQ = 0;
let filaHQ = [];
let acabouHQ = false;
const hqsConsultadas = new Set();
const hqsExibidas = new Set();

async function buscarJSON(url) {
    const resposta = await fetch(url);
    if (!resposta.ok) {
        throw new Error(`Erro HTTP ${resposta.status}: ${url}`);
    }
    return resposta.json();
}

function texto(valor) {
    if (valor === null || valor === undefined) return "Não informado";
    const resultado = String(valor).trim();
    return resultado && resultado !== "-" ? resultado : "Não informado";
}

function colocarImagem(img, endereco, legenda) {
    img.alt = legenda;
    img.onerror = null;
    img.removeAttribute("src");
    if (typeof endereco !== "string" || !endereco.trim()) return;
    img.onerror = () => {
        img.onerror = null;
        img.removeAttribute("src");
        img.alt = `${legenda} (imagem indisponível)`;
    };
    img.src = endereco.replace(/^http:/, "https:");
}

// FILTRAR PERSONAGENS REALMENTE PERTENCENTES À MARVEL
async function obterPersonagensMarvel() {
    const todos = await buscarJSON(`${API_HEROIS}/all.json`);
    if (!Array.isArray(todos)) throw new Error("Catálogo inválido de personagens");

    const soMarvel = todos.filter(p =>
        /marvel/i.test(p.biography?.publisher || "") &&
        p.name && (p.images?.lg || p.images?.md)
    );

    // Mantemos os destaques do Figma primeiro; os demais vêm em seguida.
    const prioridade = new Map(DESTAQUES.map((id, posicao) => [id, posicao]));
    soMarvel.sort((a, b) => {
        const pa = prioridade.has(a.id) ? prioridade.get(a.id) : Infinity;
        const pb = prioridade.has(b.id) ? prioridade.get(b.id) : Infinity;
        return pa !== pb ? pa - pb : a.name.localeCompare(b.name);
    });
    return soMarvel;
}

function montarCardPersonagem(dados, modelo) {
    const card = modelo.cloneNode(true);
    card.dataset.personagemId = String(dados.id);

    card.querySelector(".linha-personagem h3").textContent = texto(dados.name);
    card.querySelector(".etiqueta-hqs").textContent =
        `Força: ${texto(dados.powerstats?.strength)}`;
    card.querySelector(".quantidade-series").textContent =
        `Identidade: ${texto(dados.biography?.fullName)}`;
    card.querySelector(".conteudo-card h4").textContent = "Informações";

    const aparicao = texto(dados.biography?.firstAppearance);
    const ocupacao = texto(dados.work?.occupation);
    card.querySelector(".descricao-personagem").textContent =
        `Primeira aparição: ${aparicao}. Ocupação: ${ocupacao}.`;

    colocarImagem(
        card.querySelector(".imagem-personagem"),
        dados.images?.lg || dados.images?.md,
        `Imagem de ${texto(dados.name)}`
    );
    return card;
}

function mostrarMaisPersonagens(lista, modelo, botao) {
    if (carregandoPersonagens) return;
    carregandoPersonagens = true;
    try {
        const grupo = personagens.slice(proximoPersonagem, proximoPersonagem + POR_CLIQUE);
        for (const personagem of grupo) {
            lista.appendChild(montarCardPersonagem(personagem, modelo));
        }
        proximoPersonagem += grupo.length;
        botao.disabled = proximoPersonagem >= personagens.length;
        botao.textContent = botao.disabled
            ? "Todos os personagens carregados"
            : "Ver mais personagens";
    } finally {
        carregandoPersonagens = false;
    }
}

// QUADRINHOS: todos os dados abaixo são recebidos da Marvel Metadata API.
function sinopseHQ(dados) {
    if (typeof dados.description !== "string") return "";
    return dados.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function numeroHQ(dados) {
    const direto = dados.issue_number ?? dados.issueNumber;
    if (direto !== null && direto !== undefined && String(direto).trim()) {
        return String(direto);
    }
    // Quando o campo não vier, lemos a edição DO TÍTULO recebido da API.
    return dados.title?.match(/#\s*([\d.]+)/)?.[1] || "Não informado";
}

function anoHQ(dados) {
    const data = dados.dates?.on_sale || dados.dates?.onSale;
    if (typeof data === "string" && /^\d{4}/.test(data)) return data.slice(0, 4);
    // Algumas edições antigas informam o ano apenas no próprio título da API.
    return dados.title?.match(/\((\d{4})\)/)?.[1] || "Não informado";
}

function paginasHQ(dados) {
    const n = Number(dados.page_count ?? dados.pageCount);
    return Number.isFinite(n) && n > 0 ? String(n) : "Não informado";
}

function capaHQ(dados) {
    const capa = dados.cover || dados.thumbnail;
    if (typeof capa === "string") return capa;
    if (capa?.path && capa?.extension) return `${capa.path}.${capa.extension}`;
    return "";
}

function hqComDetalhes(dados) {
    // Só mostramos HQs cujas informações principais realmente existem na API.
    return Boolean(
        dados && dados.title && capaHQ(dados) &&
        sinopseHQ(dados) && paginasHQ(dados) !== "Não informado"
    );
}

function montarCardHQ(dados, modelo) {
    const card = modelo.cloneNode(true);
    card.querySelector(".hq-informacoes h3").textContent = texto(dados.title);

    const etiquetas = card.querySelectorAll(".hq-dados .etiqueta-dado");
    if (etiquetas[0]) etiquetas[0].textContent = numeroHQ(dados);
    if (etiquetas[1]) etiquetas[1].textContent = anoHQ(dados);

    card.querySelector(".hq-descricao").textContent = sinopseHQ(dados);
    card.querySelector(".hq-paginas .etiqueta-dado").textContent = paginasHQ(dados);
    colocarImagem(card.querySelector(".hq-imagem img"), capaHQ(dados), `Capa de ${texto(dados.title)}`);
    return card;
}

async function consultarHQ(id) {
    const numero = Number(id);
    if (!Number.isInteger(numero) || numero <= 0 || hqsConsultadas.has(numero)) return null;
    hqsConsultadas.add(numero);
    return buscarJSON(`${API_HQS}/issues/${numero}`);
}

async function tentarAdicionarHQ(id, lista, modeloTexto, modeloImagem) {
    let dados;
    try {
        dados = await consultarHQ(id);
    } catch (erro) {
        console.warn(`Falha na HQ ${id}:`, erro);
        return false;
    }
    if (!dados || !hqComDetalhes(dados)) return false;

    const idReal = Number(dados.id);
    if (!Number.isInteger(idReal) || hqsExibidas.has(idReal)) return false;

    const modelo = lista.children.length % 2 === 0 ? modeloTexto : modeloImagem;
    lista.appendChild(montarCardHQ(dados, modelo));
    hqsExibidas.add(idReal);
    return true;
}

async function proximoIdHQ() {
    while (true) {
        while (filaHQ.length) {
            const item = filaHQ.shift();
            const id = Number(item?.id);
            if (Number.isInteger(id) && id > 0 && !hqsConsultadas.has(id)) return id;
        }
        if (acabouHQ) return null;

        const limite = 30;
        const pagina = await buscarJSON(
            `${API_HQS}/issues?year=2015&limit=${limite}&offset=${offsetHQ}`
        );
        const itens = Array.isArray(pagina.items) ? pagina.items : [];
        offsetHQ += itens.length;
        filaHQ = itens;
        if (pagina.has_next === false || itens.length < limite) acabouHQ = true;
        if (!itens.length) return null;
    }
}

async function carregarMaisHQs(lista, modeloTexto, modeloImagem, botao, status) {
    if (carregandoHQs) return;
    carregandoHQs = true;
    botao.disabled = true;
    botao.textContent = "Buscando quadrinhos...";
    if (status) status.textContent = "Procurando HQs com sinopse e páginas cadastradas...";

    let novas = 0;
    let verificadas = 0;
    let erroDeLista = false;
    try {
        // Não exagerar nas requisições: a API tem limite de 60 por minuto.
        while (novas < HQS_POR_CLIQUE && verificadas < 12) {
            const id = await proximoIdHQ();
            if (id === null) break;
            verificadas++;
            if (await tentarAdicionarHQ(id, lista, modeloTexto, modeloImagem)) novas++;
        }
    } catch (erro) {
        console.error("Erro ao procurar HQs:", erro);
        erroDeLista = true;
    } finally {
        carregandoHQs = false;
        const terminou = acabouHQ && filaHQ.length === 0;
        botao.disabled = terminou;
        botao.textContent = terminou ? "Não há mais quadrinhos" : "Ver mais quadrinhos";
        if (status) {
            status.textContent = erroDeLista
                ? "Não foi possível consultar mais HQs agora. Tente novamente."
                : novas === 0 && !terminou
                    ? "Nenhuma HQ completa neste grupo. Clique novamente para buscar outras."
                    : "";
        }
    }
}

async function iniciarSite() {
    const listaPersonagens = document.querySelector("#lista-personagens");
    const listaHQs = document.querySelector("#lista-quadrinhos");
    const botaoPersonagens = document.querySelector("#ver-mais-personagens");
    const botaoHQs = document.querySelector("#ver-mais-quadrinhos");
    const statusPersonagens = document.querySelector("#status-personagens");
    const statusHQs = document.querySelector("#status-quadrinhos");
    const modeloPersonagem = document.querySelector("#modelo-personagem")?.content?.firstElementChild;
    const modeloTexto = document.querySelector("#modelo-hq-texto")?.content?.firstElementChild;
    const modeloImagem = document.querySelector("#modelo-hq-imagem")?.content?.firstElementChild;

    if (!listaPersonagens || !listaHQs || !botaoPersonagens || !botaoHQs ||
        !modeloPersonagem || !modeloTexto || !modeloImagem) {
        console.error("Estrutura HTML incompleta. Use o index.html atualizado.");
        return;
    }
    listaPersonagens.replaceChildren();
    listaHQs.replaceChildren();

    botaoPersonagens.disabled = true;
    botaoHQs.disabled = true;
    botaoPersonagens.textContent = "Carregando...";
    botaoHQs.textContent = "Carregando...";
    if (statusPersonagens) statusPersonagens.textContent = "Carregando catálogo de personagens...";
    if (statusHQs) statusHQs.textContent = "Buscando HQs com informações completas...";

    botaoPersonagens.addEventListener("click", () =>
        mostrarMaisPersonagens(listaPersonagens, modeloPersonagem, botaoPersonagens)
    );
    botaoHQs.addEventListener("click", () =>
        carregarMaisHQs(listaHQs, modeloTexto, modeloImagem, botaoHQs, statusHQs)
    );

    // As duas APIs são independentes: uma falha não impede a outra.
    const tarefaPersonagens = (async () => {
        try {
            personagens = await obterPersonagensMarvel();
            mostrarMaisPersonagens(listaPersonagens, modeloPersonagem, botaoPersonagens);
            if (statusPersonagens) statusPersonagens.textContent = "";
        } catch (erro) {
            console.error("Erro na Superhero API:", erro);
            botaoPersonagens.textContent = "Personagens indisponíveis";
            if (statusPersonagens) statusPersonagens.textContent =
                "Falha ao carregar personagens. Verifique a conexão e o Console (F12).";
        }
    })();

    const tarefaHQs = (async () => {
        try {
            for (const id of HQS_PREFERIDAS) {
                if (listaHQs.children.length >= HQS_POR_CLIQUE) break;
                await tentarAdicionarHQ(id, listaHQs, modeloTexto, modeloImagem);
            }
            if (listaHQs.children.length < HQS_POR_CLIQUE) {
                await carregarMaisHQs(listaHQs, modeloTexto, modeloImagem, botaoHQs, statusHQs);
            } else {
                botaoHQs.disabled = false;
                botaoHQs.textContent = "Ver mais quadrinhos";
                if (statusHQs) statusHQs.textContent = "";
            }
            if (!listaHQs.children.length && statusHQs) {
                statusHQs.textContent = "A API não retornou HQs completas no momento. Confira o Console (F12).";
            }
        } catch (erro) {
            console.error("Erro ao inicializar quadrinhos:", erro);
            botaoHQs.disabled = false;
            botaoHQs.textContent = "Tentar novamente";
            if (statusHQs) statusHQs.textContent =
                "Erro ao buscar HQs. Confira a conexão e o Console (F12).";
        }
    })();

    await Promise.allSettled([tarefaPersonagens, tarefaHQs]);
    console.log("Consultas iniciais às APIs finalizadas.");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarSite);
} else {
    iniciarSite();
}
