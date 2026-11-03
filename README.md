# Universo Marvel

Projeto acadêmico desenvolvido com HTML, CSS e JavaScript, com integração de APIs para exibir personagens e quadrinhos do universo Marvel.

## Sobre o projeto

O Universo Marvel é um site que desenvolvi como parte de um trabalho da faculdade, na disciplina de Web Development Front-End.

Escolhi a Marvel como tema porque gosto dos personagens, das histórias e dos filmes. A ideia foi criar uma página que apresentasse um pouco da história da editora, seus personagens e suas histórias em quadrinhos.

Durante o desenvolvimento, utilizei HTML, CSS e JavaScript para construir a interface e integrar APIs que fornecem informações sobre os personagens e quadrinhos.

## Tecnologias utilizadas

- **HTML5:** estrutura e organização dos elementos da página.
- **CSS3:** estilização, cores, espaçamentos e responsividade.
- **JavaScript:** integração com as APIs, manipulação do DOM e criação dinâmica dos cards.
- **Figma:** planejamento e desenvolvimento do layout do site.

## Protótipo no Figma

Antes de começar a desenvolver o site, utilizei o Figma para planejar a interface e organizar visualmente as seções da página.

O protótipo serviu como referência para definir as cores, os espaçamentos, a disposição dos elementos e a apresentação dos personagens e quadrinhos.

**Acesse o projeto no Figma:**

[Visualizar Universo Marvel no Figma](https://www.figma.com/design/FXTHFq47alHA1mfDrXNVwc/Marvel?node-id=0-1&t=ShIAwkRNMKPeI2lK-1)

## Funcionalidades

O site possui as seguintes funcionalidades:

- Página inicial com apresentação do universo Marvel.
- Seção sobre a história da Marvel.
- Cards de personagens com imagem, nome e informações adicionais.
- Seção de histórias em quadrinhos com capas e detalhes das edições.
- Botões para carregar mais personagens e quadrinhos.
- Layout responsivo para diferentes tamanhos de tela.
- Carregamento dinâmico de informações por meio de APIs.

## APIs utilizadas

Para buscar os dados apresentados no site, utilizei duas APIs:

**1. Superhero API**

Utilizada para consultar informações dos personagens, como nome, imagem, editora, primeira aparição e ocupação.

https://akabab.github.io/superhero-api/

**2. Marvel Metadata API**

Utilizada para consultar informações de histórias em quadrinhos, como título, capa, edição, ano, descrição e número de páginas.

https://marvel.emreparker.com/

Os dados são consultados pelo JavaScript por meio da função `fetch()` e utilizados para preencher os elementos da página.

## Organização dos arquivos

O projeto está dividido da seguinte forma:

- `index.html` — estrutura principal do site.
- `css/style.css` — estilos e configurações de responsividade.
- `js/app.js` — integração com as APIs e funcionalidades JavaScript.
- `assets/` — imagens e elementos visuais utilizados no site.

## Como executar o projeto

1. Baixe ou clone este repositório.
2. Abra a pasta do projeto no Visual Studio Code.
3. Instale a extensão Live Server, caso ainda não tenha.
4. Abra o arquivo `index.html`.
5. Clique com o botão direito e selecione **Open with Live Server**.
6. O site será aberto no navegador.

**Observação:** é necessário ter conexão com a internet para carregar as informações das APIs. Se alguma API estiver indisponível, parte dos dados poderá não aparecer.

## O que aprendi com o projeto

Durante o desenvolvimento, consegui colocar em prática conhecimentos de HTML, CSS e JavaScript.

Uma das partes mais importantes foi aprender como consumir informações de uma API e utilizar esses dados para criar elementos dinamicamente na página, sem precisar cadastrar cada personagem manualmente no HTML.

Também pratiquei a organização dos arquivos, a criação de layouts responsivos e a manipulação do DOM utilizando JavaScript.

O uso do Figma também me ajudou a entender melhor a importância de planejar a interface antes de começar a programação.

## Objetivo

Este projeto foi desenvolvido para fins acadêmicos e também faz parte do meu aprendizado em desenvolvimento web.

Minha intenção é continuar aprimorando meus conhecimentos e utilizar os projetos desenvolvidos durante a faculdade para construir meu portfólio.

---

**Projeto acadêmico — Ciência da Computação**

**Desenvolvido por Gustavo Braz**
