<div align="center">

[🇺🇸 EN](README.en.md) · [🇨🇳 简中](README.zh-CN.md) · [🇯🇵 日本語](README.ja.md) · [🇰🇷 한국어](README.ko.md) · [🇫🇷 FR](README.fr.md) · [**🇧🇷 PT-BR**](README.pt-BR.md) · [🇹🇷 TR](README.tr.md) · [🇮🇩 ID](README.id.md)

# 🎬 Stickman Video Director

**Transforme qualquer roteiro em vídeos animados de bonecos de palito virais, em vários estilos, para canais do YouTube sem aparecer na câmera. Totalmente de código aberto.**

[![GitHub Stars](https://img.shields.io/github/stars/kaomei/stickman-video-director?style=flat-square)](https://github.com/kaomei/stickman-video-director/stargazers)
![MIT License](https://img.shields.io/badge/License-MIT-16a34a?style=flat-square)

Basta fornecer um tema, um artigo ou um link para gerar automaticamente imagens, narração, legendas, efeitos sonoros e microanimações — e receber um vídeo completo de bonecos de palito. **Crie um canal no YouTube com identidade própria, sem aparecer na câmera.**

Reúne estilos de animação com bonecos de palito populares na internet, com atualizações contínuas e código aberto — para **divulgação científica, psicologia e motivação, educação e conscientização, acolhimento emocional, histórias em alta e muitos outros nichos.**

</div>

<table width="100%">
<tr>
<td width="50%" align="center">
<strong>Preto e branco clássico</strong><br>
<a href="#a1"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/dark-theme-demo.gif" alt="Animação clássica com bonecos de palito brancos sobre fundo preto" width="90%"></a>
</td>
<td width="50%" align="center">
<strong>Pop moderno</strong><br>
<a href="#a2"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-2a-demo.gif" alt="Boneco de palito de gorro vermelho em cenário tecnológico moderno" width="90%"></a>
</td>
</tr>
<tr>
<td width="50%" align="center">
<strong>Cavernas pré-históricas</strong><br>
<a href="#a3"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-3-demo.gif" alt="História pré-histórica com bonecos de palito e uma virada cômica" width="90%"></a>
</td>
<td width="50%" align="center">
<strong>Histórias acolhedoras</strong><br>
<a href="#a4"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-4-cozy-cafe.gif" alt="Personagens expressivos em um cenário cotidiano colorido" width="90%"></a>
</td>
</tr>
<tr>
<td width="50%" align="center">
<strong>Cartoon histórico</strong><br>
<a href="#style-5"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-5-japan-hero.gif" alt="Animação histórica com bonecos de palito no Japão do período Edo" width="90%"></a>
</td>
<td width="50%" align="center">
<strong>Desenho à mão minimalista</strong><br>
<a href="#b1"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@fa0a68d1ccf9fd057230abab2af832f768debe86/assets/readme/previews/b1-minimal-handdrawn.gif" alt="Vídeo em desenho à mão minimalista com bonecos expressivos, texto em destaque e microanimações" width="90%"></a>
</td>
</tr>
</table>

<div align="center">

**6 estilos · 8 opções visuais · Exemplos testados · Grátis e de código aberto**

⭐ **O projeto continua crescendo. Deixe um Star para acompanhar os próximos estilos.**

[Começar](#quick-start) · [Estilos A](#a-styles) · [Estilos B](#b-styles) · [Perguntas frequentes](#faq)

</div>

<a id="creation-modes"></a>

## Dois modos de criar vídeos

**Quer controlar cada cena? Escolha A · Director. Quer um vídeo longo sem montar trecho por trecho? Escolha B · Autopilot.** Um projeto, duas formas de produzir.

|  | <div align="center">A · Director</div> | <div align="center">B · Autopilot</div> |
|:---:|:---|:---|
| **Proposta** | **Você controla a produção, a IA cuida da direção:** recebe storyboard e prompts e decide como gerar e editar os clipes. | **Passe um tema ou pedido e receba o vídeo pronto:** ilustrações, narração, legendas, microanimações e montagem automática. |
| **Duração** | **Pensado primeiro para vídeos curtos**, como 30 segundos a 3 minutos; também permite produzir vídeos maiores por trechos. | **Pensado primeiro para vídeos longos**, especialmente narrados de **10 minutos ou mais**; também faz vídeos curtos e histórias em episódios. |
| **Ferramentas** | Um assistente de IA com suporte a Skills prepara a proposta; **Google Flow** ou outra plataforma gera os clipes; **CapCut** ou outro editor faz a montagem. | Roda em agentes como **Codex e Claude Code**, capazes de ler e gravar arquivos, usar ferramentas e executar comandos para conectar a geração de materiais à montagem local. |
| **Visual** | **Animação gerada por trecho:** foco em ações, direção de câmera e interação entre personagens. | **Cenas ilustradas + microanimações:** cortes, aproximações e movimentos de câmera acompanham a narração, sem precisar gerar uma animação completa para cada trecho. |
| **Entrega** | Proposta de direção, storyboard, prompts de vídeo por trecho e design de som. | **Arquivo de vídeo completo, com narração, legendas e microanimações.** |
| **Começar** | <div align="center"><a href="#director-start">Usar o modo Director</a></div> | <div align="center"><a href="#autopilot-start">Usar o modo Autopilot</a></div> |

Os dois modos aceitam **um tema, um texto ou um roteiro completo**. **As séries A e B têm numeração, estilos e exemplos próprios; novos estilos entram em sua respectiva série.** Você escolhe formato, idioma da narração e voz. As durações acima são sugestões, não limites.

O Autopilot precisa de serviços de imagem e voz disponíveis, além de um ambiente local de montagem de vídeo. Uma janela de chat comum não substitui essa estrutura. A Skill é gratuita e de código aberto; os serviços conectados podem cobrar pelo uso.

<a id="quick-start"></a>

## Como começar

Envie a mensagem abaixo a um assistente de IA com suporte a Skills. Depois de instalar, ele apresentará **o que cada modo entrega e como começar**, com exemplos prontos para adaptar.

```text
Instale esta Skill para mim:
https://github.com/kaomei/stickman-video-director

Depois de instalar, leia imediatamente o SKILL.md instalado.
Explique de forma simples o que cada modo entrega,
quais ferramentas preciso usar e como funciona a produção.
Dê exemplos de pedidos que eu possa adaptar.
Com base no que quero criar, diga o que falta configurar
e qual é o próximo passo.
```

<a id="director-start"></a>

### A · Director: prompts de vídeo cena por cena

Depois de instalar, envie este pedido ao assistente de IA e troque pelo seu tema:

```text
Use o modo Director / modo A para transformar o tema,
texto ou pedido abaixo em um vídeo com bonecos de palito:
[Escreva o tema, cole o texto ou descreva o que precisa]

Quero formato horizontal 16:9, estilo A3 “Cavernas pré-históricas”.
Vamos começar com 30 segundos.
Apresente a proposta de direção primeiro.
Depois da minha aprovação, entregue os prompts de vídeo por trecho.
```

**Fluxo: tema e pedido → roteiro → confirmação opcional das três vistas do personagem → prompts detalhados de cada cena → geração dos clipes e edição manual do vídeo**

A proposta inclui estrutura da história, narração por trecho, ações, câmera e som. Depois de receber os prompts, copie-os um a um para o [Google Flow](https://flow.google.com/) ou outra ferramenta de vídeo. Use o CapCut ou outro editor para adicionar legendas e finalizar a montagem.

Na primeira produção, siga o [tutorial completo em chinês](https://x.com/CrazyKaomei/status/2102311241046008268).

<a id="autopilot-start"></a>

### B · Autopilot: de um pedido ao vídeo completo

Depois de instalar em um ambiente com acesso a arquivos e execução de comandos, como Codex ou Claude Code, diga:

```text
Use o modo Autopilot / modo B para transformar o tema, artigo,
post, notícia ou pedido abaixo em um vídeo atraente para o YouTube:
[Cole o conteúdo ou link, ou descreva o vídeo promocional que precisa]

Quero 5 a 10 minutos, horizontal 16:9, no estilo B1
“Desenho à mão minimalista”, com narração, legendas e efeitos sonoros.

Primeiro, confira a configuração de imagens, voz e montagem de vídeo.
Depois, entregue o roteiro e uma amostra de 20 segundos com áudio.
Após minha aprovação, produza o vídeo completo com as imagens
acompanhando o ritmo da narração. Entregue o arquivo final,
sem que eu precise montar os trechos manualmente.
```

**Fluxo: tema, conteúdo ou pedido → aprovação do roteiro → aprovação da amostra de 20 segundos com áudio → produção automática → arquivo de vídeo completo**

O assistente de IA planeja as cenas, gera imagens e narração, prepara legendas e efeitos sonoros e monta o vídeo no ritmo da voz. Você aprova o roteiro e a amostra, sem precisar gerar e juntar cada trecho por conta própria.

Na primeira vez, ele confere a configuração e explica o que falta e como resolver, passo a passo. Se uma imagem ou voz não ficar boa, é possível ajustar só o trecho afetado e preservar o que você já aprovou.

<a id="style-gallery"></a>

<a id="a-styles"></a>

## Estilos A · Director

Os estilos seguem a numeração A1, A2, A3… Cada um tem seus próprios exemplos de animação.

<a id="a1"></a>

### A1: Preto e branco clássico

Poucas linhas, uma ideia bem explicada. Em um fundo totalmente branco ou preto, personagens, objetos e cores de destaque conduzem a história. Funciona bem para explicações claras e ágeis.

- **Visual:** Cabeça redonda, membros feitos de linhas, traço uniforme e, quando fizer sentido, expressões simples. Até três cores vibrantes ajudam a separar emoções, riscos e ações. Conceitos abstratos viram imagens: ansiedade pode ser uma prisão; atenção, uma barra de progresso.
- **Indicado para:** Ciência, psicologia, motivação, organização pessoal, análise de negócios e explicação de conceitos.
- **Como escolher:** Fundo branco para um resultado limpo e direto; fundo preto para mais contraste, tensão e carga emocional.

| A1.1 · Bonecos pretos em fundo branco | A1.2 · Bonecos brancos em fundo preto |
|:---:|:---:|
| <!-- demo:light:start --><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/light-theme-demo.gif" alt="A1.1: animação com bonecos de palito pretos em fundo branco" width="360"><!-- demo:light:end --> | <!-- demo:dark:start --><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/dark-theme-demo.gif" alt="A1.2: animação com bonecos de palito brancos em fundo preto" width="360"><!-- demo:dark:end --> |
| Fundo branco · Personagem preto | Fundo preto · Personagem branco |

---

<a id="a2"></a>

### A2: Pop moderno

O gorro vermelho e a camiseta amarela são a marca do personagem. Ele pode explicar um produto em um ambiente tecnológico ou viver uma história em um quarto, na rua ou em uma paisagem aberta.

- **Visual:** Um personagem reconhecível, dois tipos de cenário. A tecnologia minimalista combina espaço branco, grade discreta, interfaces flutuantes com aparência de vidro e luz azul-ciano. A narrativa colorida aposta em cenários, iluminação cinematográfica e profundidade.
- **Indicado para:** Tecnologia minimalista para ferramentas de IA, produtos de tecnologia, tutoriais e demonstrações. Narrativa colorida para crescimento pessoal, cotidiano, aventuras e histórias de superação.
- **Como escolher:** Para explicar uma ferramenta ou um método, vá de tecnologia minimalista. Para acompanhar a experiência de um personagem, escolha narrativa colorida.

| A2.1 · Tecnologia minimalista | A2.2 · Narrativa colorida |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-2a-demo.gif" alt="A2.1: animação em um ambiente tecnológico minimalista" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-2b-demo.gif" alt="A2.2: personagem em cenário colorido com iluminação cinematográfica" width="360"> |
| Espaço branco · Grade discreta · Brilho ciano | Cenários coloridos · Luz de cinema · Clima de história |

---

<a id="a3"></a>

### A3: Cavernas pré-históricas

E se os problemas de hoje fossem parar em um mundo sem celular nem escritório? Cavernas, roupas de pele, fogueiras e expressões exageradas transformam situações de trabalho e pequenas contradições humanas em histórias com uma boa virada.

- **Visual:** Contornos soltos, cabeça preenchida de branco, membros escuros, roupas de pele e cenários em tons de terra. O foco está na interação, nas reações e nas pausas cômicas. O elenco acompanha a história: adultos, crianças e idosos podem ter aparências diferentes. Não é preciso repetir o mesmo rosto em todos os vídeos.
- **Indicado para:** Imaginação pré-histórica, sátira do trabalho, comportamento humano, humor ácido, fábulas e histórias infantis para aprender inglês.
- **Como escolher:** Quando um pequeno acontecimento precisa levar a um final inesperado. Relações modernas ficam familiares e absurdas ao mesmo tempo em uma tribo pré-histórica.

| Exemplo 1: “Como surgiu o primeiro emprego da humanidade?” | Exemplo 2: “A primeira descoberta do fogo” |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-3-demo.gif" alt="Prévia de Como surgiu o primeiro emprego da humanidade?" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-3-community-fire.gif" alt="A primeira descoberta do fogo em uma animação da comunidade" width="360"> |
| História pré-histórica · Sátira do trabalho | Descoberta do fogo · Criação da comunidade |

---

<a id="a4"></a>

### A4: Histórias acolhedoras

Uma caneca que você guarda para uma ocasião especial. Uma mensagem que parece exigir resposta imediata. Uma tarde que finalmente fica só para você. Personagens simples entram em cenários coloridos e contam pequenas histórias por meio de gestos, expressões e enquadramentos.

- **Visual:** Cabeças redondas preenchidas de branco, corpos alongados, membros finos e escuros e expressões discretas em cenários 2D coloridos. Planos abertos apresentam o lugar; closes mostram hesitação ou alívio; a câmera acompanha o personagem para a história seguir em frente.
- **Indicado para:** Identificação com o cotidiano, crescimento pessoal, relacionamentos, momentos de afeto, novos hábitos e conteúdo infantil em inglês.
- **Como escolher:** Para quem quer que o público pense “isso também acontece comigo”. A cor e a luz acompanham o tema, seja acolhimento, ansiedade, cansaço ou recomeço.

| Exemplo 1: A ansiedade das mensagens no caminho para o trabalho | Exemplo 2: Reservar um tempo para si |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-4-cozy-station.gif" alt="Personagem preocupado com mensagens na estação" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-4-cozy-cafe.gif" alt="Uma pausa em um café ao ar livre" width="360"> |
| Estação · Câmera acompanhando o personagem · Close nas emoções | Café ao ar livre · Luz quente · Gestos cotidianos |

---

<a id="style-5"></a>
<a id="a5"></a>

### A5: Cartoon histórico

Um samurai pelas ruas de Edo, um gato preto num templo egípcio, um soldado num acampamento romano. Figurinos de época, cenários coloridos e pequenas reviravoltas transformam um assunto de história em uma cena que dá vontade de acompanhar.

- **Visual:** Cabeças redondas preenchidas de branco, olhos ovais pretos, contornos marcados e membros finos. Roupas de época recebem sombras suaves em cel shading; os cenários têm acabamento de pintura. Ao mudar de país ou período, troque roupas, arquitetura, objetos e trilha, mantendo o mesmo jeito de desenhar os personagens.
- **Indicado para:** História mundial, curiosidades, cotidiano de outras épocas, personagens históricos e comédias com tema histórico.
- **Como escolher:** Para mostrar um fato por meio de uma situação, em vez de só explicá-lo. Uma reação ou uma virada bem colocada ajuda a conduzir a narrativa.

| Exemplo 1: O cotidiano de um samurai em Edo | Exemplo 2: Gatos e múmias no Egito Antigo |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-5-japan.gif" alt="O dia a dia de um samurai no Japão do período Edo" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-5-egypt.gif" alt="Um gato preto e uma múmia num templo do Egito Antigo" width="360"> |
| Ruas de Edo · Trajes de samurai · Surpresas do cotidiano | Templo colorido · Gato preto · Curiosidade histórica |

Contribuição de estilo e prompts: [Lawal Ridwan / @leksautomate](https://github.com/leksautomate).

---

<a id="b-styles"></a>

## Estilos B · Autopilot

Os estilos seguem a numeração B1, B2, B3… Cada um tem seus próprios vídeos com cenas ilustradas e microanimações, mantidos separadamente da série A.

<a id="b1"></a>

### B1: Desenho à mão minimalista

O visual acompanha a narração. Bonecos expressivos, objetos coloridos com traço à mão e textos em destaque tornam ideias, histórias e benefícios de produtos mais claros e interessantes.

- **Visual:** Fundo de papel quase branco com uma grade muito discreta, linhas pretas à mão e poucos objetos coloridos. Expressões, microanimações, transições contínuas e efeitos sonoros conduzem as cenas; os textos destacam o essencial e as legendas acompanham a voz.
- **Indicado para:** Vídeos explicativos no YouTube, psicologia e crescimento pessoal, histórias de trabalho, conteúdo educativo e divulgação de produtos.
- **Como escolher:** Para transformar um tema, texto ou roteiro em um vídeo completo com narração e legendas. As imagens seguem o ritmo da voz, tanto em explicações contínuas quanto em narrativas longas.

Clique no GIF para assistir ou baixar a amostra com áudio.

<table width="100%">
  <tr>
    <th width="50%" align="center">Exemplo 1: YouTube sem aparecer</th>
    <th width="50%" align="center">Exemplo 2: Por que ninguém está assistindo?</th>
  </tr>
  <tr>
    <td width="50%" align="center"><a href="assets/readme/b1-minimal-handdrawn.mp4"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@fa0a68d1ccf9fd057230abab2af832f768debe86/assets/readme/previews/b1-minimal-handdrawn.gif" alt="Exemplo B1 de desenho à mão minimalista: clique para assistir ou baixar a amostra com áudio sobre criar vídeos para YouTube sem aparecer" width="360"></a></td>
    <td width="50%" align="center"><a href="skills/directing-stickman-videos/assets/b1/approved-2026-10-23.mp4"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@61e202ccecf9d9926cf76e13f3284181297729b8/assets/readme/previews/b1-minimal-handdrawn-2026-10-23.gif" alt="Exemplo B1 de desenho à mão minimalista: clique para assistir ou baixar a amostra com voz Bodi, legendas, personagens desenhados à mão e microanimações" width="360"></a></td>
  </tr>
  <tr>
    <td align="center">Personagens à mão · Texto em destaque · Microanimações</td>
    <td align="center">Narração Bodi · Expressões marcantes · Microanimações</td>
  </tr>
</table>

---

<a id="b2"></a>

### B2: Em breve…

A descrição do estilo, as amostras e os exemplos de uso serão publicados aqui.

<!-- readme:reliability -->

<a id="faq"></a>

## Perguntas frequentes

### Q1. Dá para criar um vídeo sem ter roteiro?

Sim. Passe um tema, artigo, link ou pedido específico, e o assistente de IA organiza o material em um roteiro. Se você já tiver um, pode usá-lo diretamente. Vale informar também o público, a plataforma e a duração desejada.

### Q2. Dá para automatizar os estilos do Director? Por que manter esse modo?

Por enquanto, os estilos da série A têm fluxos de produção próprios. Mas você pode pedir ao assistente de IA para combinar seu estilo favorito da série A com o fluxo de produção da série B e montar uma solução DIY, do seu jeito.

Manter o Director é, principalmente, uma forma de controlar o custo da geração de vídeo e das tentativas. Para um vídeo de dez e poucos minutos, uma rodada completa de geração pode custar **algumas dezenas de dólares americanos**, e refazer o trabalho aumenta a conta. Por isso, o Director mantém a geração e a revisão cena a cena, com edição manual: você controla cada plano e pode conferir o resultado antes de decidir se continua.

### Q3. Como manter o personagem consistente no modo Director?

Você pode pedir: “Crie primeiro um boneco de palito que combine com o estilo escolhido. Quero aprovar as três vistas — frente, lado e costas — antes dos prompts das cenas.” É uma boa opção para ter um personagem próprio. Se já houver uma referência aprovada, reutilize-a; se não precisar personalizar, pode pular essa etapa.

Em ferramentas de vídeo que aceitam imagens de referência, **anexe o personagem aprovado ao gerar cada clipe**. A referência é um apoio extra: não substitui os prompts das cenas nem altera as regras do estilo escolhido. Confira a consistência entre os clipes antes de finalizar.

### Q4. Só funciona no Codex?

Não. O modo Director funciona em assistentes de IA que permitem instalar e usar Skills.

O Autopilot precisa de um ambiente como Codex ou Claude Code, capaz de ler e gravar arquivos e executar comandos, com os serviços de imagem e voz e as dependências locais configurados.

<!-- readme:platforms -->

### Q5. Como transformar um artigo ou referência em um vídeo mais interessante?

Diga a quem quer chegar, qual é a ideia principal e o que deseja que o público faça ao terminar. O assistente de IA usa isso para encontrar um ângulo, criar um gancho de abertura, organizar a narrativa e planejar a chamada final antes do storyboard.

Tem um vídeo de referência? Mostre-o e explique se gosta do ritmo, da linguagem ou da estrutura. Aproveite as técnicas sem copiar a opinião e a expressão de outra pessoa. Fatos históricos, comerciais e científicos ainda precisam ser verificados antes da publicação.

### Q6. É pago?

A Skill é gratuita e de código aberto. Serviços de imagem, voz e geração de vídeo podem cobrar conforme a plataforma e o plano da sua conta. Uma assinatura não inclui necessariamente créditos de API.

### Q7. Se não gostar de uma imagem ou da narração, preciso refazer tudo?

Não. Aprove primeiro o roteiro e o plano de produção. Depois, use uma amostra curta para conferir estilo, personagem, voz, legendas e ritmo antes de produzir o vídeo completo.

Se o problema estiver em um trecho, ajuste só essa parte e reaproveite a narração e os materiais já aprovados. Isso reduz retrabalho e custos repetidos.

### Q8. Posso publicar no YouTube ou usar comercialmente?

O projeto usa a licença MIT, que permite uso comercial. Imagens, músicas, efeitos sonoros e serviços de voz de terceiros continuam sujeitos às suas próprias licenças. A monetização no YouTube depende da análise e das regras da plataforma.

<!-- readme:contribute -->

## Mais estilos, mais possibilidades de criar

⭐ **Quer criar um canal no YouTube sem aparecer e explorar a monetização de conteúdo?** Deixe um Star para acompanhar estilos de bonecos de palito, prompts de vídeo e fluxos de produção automatizados — e tirar o “como vou produzir?” do caminho.

🔔 **Siga [@CrazyKaomei](https://x.com/CrazyKaomei)** para conhecer ferramentas e fluxos de automação para vídeos no YouTube sem aparecer: roteiro, narração, imagens e edição conectados para reduzir tarefas repetitivas e facilitar a produção solo. Também tem ideias de conteúdo, crescimento de canal e caminhos para monetização.

<a id="whats-next"></a>

🎨 **Estilos planejados:** livro ilustrado, lutas em grafite, sitcom de dois personagens, aventura com cartas, mistura de cenários reais e ilustrados e explicações com quadro ou apresentação.

💬 **Sugestões e trabalhos da comunidade:** quer propor um estilo, mostrar um vídeo ou relatar um problema? Fale com [@CrazyKaomei](https://t.me/CrazyKaomei) no Telegram. Para sugerir um estilo, inclua referências e o tema que quer explorar. Para enviar um trabalho, inclua o vídeo, o estilo usado e o link do autor para exibição e créditos.

<div align="center">
<a href="https://www.star-history.com/?repos=kaomei%2Fstickman-video-director&amp;type=date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=kaomei/stickman-video-director&amp;type=Date&amp;theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=kaomei/stickman-video-director&amp;type=Date">
    <img src="https://api.star-history.com/svg?repos=kaomei/stickman-video-director&amp;type=Date" alt="Histórico de Stars no GitHub de kaomei/stickman-video-director" width="800">
  </picture>
</a>
</div>

## Licença

Este projeto usa a [licença MIT](https://github.com/kaomei/stickman-video-director/blob/main/LICENSE): você pode usar, modificar, distribuir e utilizar comercialmente sem pagar pela Skill. Ao distribuir o projeto ou partes substanciais dele, mantenha os avisos de direitos autorais e de licença.

Fornecido “como está”, sem garantias. Consulte os termos completos em [LICENSE](https://github.com/kaomei/stickman-video-director/blob/main/LICENSE).
