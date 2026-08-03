<!-- readme:hero -->

<div align="center">

[English](README.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [**Português do Brasil**](README.pt-BR.md)

# Stickman Video Director

### Transforme qualquer ideia em um vídeo de bonecos-palito de um minuto, cheio de movimento.

Uma única Skill do Codex transforma seu texto em uma narração em inglês para aprovação, uma proposta de direção pensada para o visual e seis prompts do Gemini Omni Flash prontos para produção.

![Codex Skill](https://img.shields.io/badge/Codex-Skill-111827?style=flat-square)
![Gemini Omni Flash](https://img.shields.io/badge/Gemini-Omni%20Flash-6d28d9?style=flat-square)
![Vídeo de um minuto](https://img.shields.io/badge/Video-≈60%20seconds-0066ff?style=flat-square)
![MIT License](https://img.shields.io/badge/License-MIT-16a34a?style=flat-square)

Feita para explicações visuais, histórias motivacionais, vídeos educativos e ensaios dinâmicos no **YouTube Shorts, TikTok, Instagram Reels e YouTube**.

</div>

<!-- readme:demos -->

## Dois estilos de alto contraste. Uma linguagem visual consistente.

| Tema claro | Tema escuro |
|:---:|:---:|
| <!-- demo:light:start --><a href="assets/readme/light-theme-demo.mp4"><img src="assets/readme/light-theme-demo.gif" alt="Demonstração animada do tema claro com fundo branco, boneco-palito preto e cores de destaque saturadas" width="600"></a><!-- demo:light:end --> | <!-- demo:dark:start --><a href="assets/readme/dark-theme-demo.mp4"><img src="assets/readme/dark-theme-demo.gif" alt="Demonstração animada do tema escuro com fundo preto, boneco-palito branco e cores de destaque saturadas" width="600"></a><!-- demo:dark:end --> |
| Tela branca · personagem preto | Tela preta · personagem branco |

> Clique em uma das prévias animadas para abrir o clipe completo de 10 segundos com som. Se este estilo visual despertar uma ideia, dê uma Star no repositório e ajude mais criadores a encontrá-lo.

## Ter um roteiro ainda não significa ter um vídeo

Uma boa ideia pode virar uma animação sem energia: um personagem, um fundo e dez segundos sem nada novo para olhar. Dirigir um minuto completo exige construir o gancho, controlar o ritmo da explicação, criar metáforas visuais relevantes, movimentar a câmera, conectar cenas e preservar a continuidade entre gerações separadas.

**O Stickman Video Director resolve esse trabalho de produção antes de você gastar créditos de geração.**

<!-- readme:advantages -->

## Por que criadores de vídeos curtos usam esta Skill

| Vantagem | O que você recebe |
|---|---|
| **Arquitetura de história mais forte** | Reorganiza o material em uma abertura marcante, uma explicação progressiva e um fechamento que retoma a ideia inicial, sem perder o sentido central. |
| **Um ponto real de aprovação** | Mostra uma proposta de direção legível com seis cenas antes dos prompts finais. Você ajusta a história enquanto as mudanças ainda custam pouco. |
| **Movimento rico e relevante** | Planeja três momentos em cada clipe, com metáforas visuais, mudanças de ambiente, câmera, texto, interações, transições, BGM e SFX. |
| **Travas de produção** | Repete personagem, espessura dos traços, paleta, voz, falas, áudio, transição e restrições negativas dentro de cada prompt independente. |
| **Direção adaptada ao formato** | Refaz composição, trajetória de câmera e posição dos textos para `9:16`, `16:9` ou `1:1`, em vez de apenas trocar a etiqueta da proporção. |
| **Contraste visual controlado** | Trabalha com fundo branco e personagem preto ou fundo preto e personagem branco, além de até três cores de destaque saturadas. |
| **Fidelidade ao material original** | Evita inventar fatos, estatísticas, citações ou promessas de produto sem fonte. |

Não exige API nem dependência de MCP. Instale a Skill, invoque-a e siga o fluxo guiado na conversa.

<!-- readme:platforms -->

## Uma ideia, recomposta para a tela certa

| Proporção | Melhor uso | Ênfase da direção |
|---|---|---|
| `9:16` | YouTube Shorts, TikTok, Instagram Reels | Profundidade vertical, silhueta central forte, revelações em camadas, texto seguro para celular |
| `16:9` | Vídeos explicativos no YouTube, conteúdo educativo, ensaios visuais | Encenação ampla, câmera lateral, comparações em tela dividida, espaço negativo generoso |
| `1:1` | Feeds sociais, histórias curtas de produto | Composição central forte, movimento radial, margens fáceis de ler |

<!-- readme:workflow -->

## Cole → Escolha → Aprove → Gere → Monte

1. **Cole** seu texto, anotações, um artigo ou apenas um tema.
2. **Escolha** `16:9`, `9:16` ou `1:1` e depois o tema claro ou escuro.
3. **Aprove** uma proposta detalhada com VO em inglês, tradução de referência, visuais, câmera, transições, BGM e SFX.
4. **Gere** exatamente seis prompts independentes do Gemini Omni Flash após aprovar a proposta atual.
5. **Monte** os seis clipes de aproximadamente dez segundos em um vídeo coerente de um minuto.

Você pode mudar proporção, tema, narração, estrutura das cenas, paleta, voz ou tom. Ao alterar uma configuração global, a Skill volta para a proposta e pede nova aprovação.

<!-- readme:output -->

## O que você recebe

- Título em inglês, mensagem central, gancho, tom, paleta, voz e direção musical pensados para criadores
- Cerca de **130–150 palavras de narração em inglês** para aproximadamente um minuto
- Seis cenas visuais diferentes, com uma mudança perceptível a cada dois ou três segundos
- Falas exatas em inglês e tradução de referência
- Seis prompts independentes do Gemini Omni Flash com momentos cronometrados e restrições negativas
- Finais e inícios correspondentes para transições mais limpas entre os clipes
- Orientação de BGM, efeitos sonoros, continuidade e montagem final

<details>
<summary><strong>Exemplo de pedido</strong></summary>

```text
Use $directing-stickman-videos to turn this copy into a one-minute English stickman video:

Gravity bends space and time so strongly around a black hole that even light cannot escape.
```

A Skill primeiro pergunta a proporção e o tema que estiverem faltando. Depois apresenta a proposta de direção com seis cenas para aprovação, sem gerar os prompts finais antes da confirmação.

</details>

<!-- readme:install -->

## Instalação

Clone o repositório:

```bash
git clone https://github.com/kaomei/stickman-video-director.git
cd stickman-video-director
```

Copie a pasta instalável da Skill para o diretório de skills do Codex:

```bash
cp -R skills/directing-stickman-videos "${CODEX_HOME:-$HOME/.codex}/skills/"
```

Reinicie o Codex para que a Skill apareça na lista disponível. Em seguida, invoque-a e cole seu material:

```text
$directing-stickman-videos
```

<!-- readme:reliability -->

## Feita para iterar, sem esconder as variações da geração

- **A aprovação é explícita.** A Phase B não começa até você aprovar a proposta atual.
- **Mudanças globais exigem nova composição.** Uma nova proporção ou tema refaz a direção, em vez de aplicar uma troca mecânica de texto.
- **Os prompts são independentes.** Cada um repete as travas essenciais para gerar seu clipe sozinho.
- **O sentido continua fundamentado.** A Skill pode fortalecer estrutura e apresentação, mas não acrescenta afirmações sem base.
- **O áudio ainda pode variar.** Gerações independentes podem apresentar pequenas diferenças de voz ou música. Para máxima consistência, mantenha os SFX sincronizados de cada clipe e adicione uma única faixa contínua de VO e BGM na montagem.

## Estrutura do repositório

```text
skills/directing-stickman-videos/  Skill instalável
assets/readme/                     Mídia de prévia do README
tests/                             Cenários de comportamento e verificações
docs/superpowers/specs/            Designs de produto aprovados
docs/superpowers/plans/            Planos de implementação
```

<!-- readme:contribute -->

## Ajude a melhorar

Casos de uso, exemplos, melhorias de prompts e observações de gerações reais são bem-vindos. Abra uma issue ou envie um pull request com uma mudança focada e contexto suficiente para reproduzir o resultado.

Se esta Skill ajudar você a transformar uma ideia parada em um vídeo que realmente pode ser publicado, **dê uma Star no repositório**. Isso ajuda o projeto a chegar ao próximo criador que procura o mesmo fluxo de produção.

## Licença

MIT
