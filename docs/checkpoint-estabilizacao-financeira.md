# Checkpoint — Estabilização Técnica e Financeira

## 1. Objetivo da fase

Esta fase teve como objetivo estabilizar o projeto `agencia-pay` antes do inicio de uma funcionalidade de medio porte.

As entregas se concentraram em:

- reduzir risco de regressao;
- proteger os calculos financeiros do checkout;
- impedir persistencia de taxas invalidas;
- impedir consumo de taxas invalidas vindas do Firestore;
- caracterizar o comportamento financeiro atual com testes unitarios;
- reduzir vulnerabilidades de producao;
- remover funcionalidade experimental fora do produto atual;
- corrigir problemas pequenos de infraestrutura e manifesto.

## 2. Estado do projeto antes da fase

Antes desta fase, o projeto ainda tinha alguns riscos tecnicos e financeiros relevantes:

- formulas financeiras embutidas diretamente no checkout;
- ausencia de testes unitarios para os calculos financeiros;
- possibilidade de gravar taxas invalidas em `configuracoes/{uid}`;
- possibilidade de consumir taxas invalidas vindas de documentos antigos, adulterados ou incompletos;
- dependencia direta `firebase` em versao com vulnerabilidade critica na arvore de producao;
- dependencia direta `next` com vulnerabilidade alta em producao;
- warnings antigos de lint ja existentes;
- inferencia incorreta de raiz pelo Turbopack em ambiente local;
- caminhos incorretos dos icones no manifesto;
- funcionalidade antiga "Escrever com IA" ainda presente no frontend de roteiros.

## 3. Problemas identificados

Os principais problemas confirmados foram:

- o checkout calculava diretamente `valorBase * (1 + taxa / 100)`;
- o valor da parcela era calculado diretamente como divisao simples;
- a configuracao permitia que `NaN`, infinitos e taxas negativas chegassem ao estado de taxas;
- taxas de credito invalidas podiam ser convertidas silenciosamente para `0`;
- documentos antigos do Firestore ainda poderiam conter dados invalidos;
- o checkout confiava que `taxas.debito` e `taxas.credito` eram sempre numericos e validos;
- o fallback para `configuracoes/geral` existia para documento ausente, mas nao para taxa individual invalida;
- o manifesto apontava para `/icon-192.png` e `/icon-512.png`, enquanto os arquivos reais eram `/icon-192x192.png` e `/icon-512x512.png`;
- o Next/Turbopack inferia uma raiz fora do projeto em determinadas condicoes locais.

## 4. Estabilizacao da aplicacao

A fase incluiu estabilizacoes pequenas e pontuais:

- correcao de erros de lint em `src/app/admin/page.tsx` e `src/app/login/page.tsx`;
- remocao da funcionalidade experimental antiga "Escrever com IA" da tela de roteiros;
- definicao explicita e portavel da raiz do Turbopack em `next.config.ts`;
- correcao dos caminhos dos icones no manifesto;
- preservacao do comportamento do MVP, sem refatoracoes amplas e sem alteracao das regras Firestore.

O arquivo `next.config.ts` passou a derivar `projectRoot` de `import.meta.url`, usando `node:path` e `node:url`, e atribuir esse diretorio a `turbopack.root`.

## 5. Extracao do dominio financeiro

O dominio financeiro foi isolado em funcoes puras em `src/lib`.

Funcoes principais:

- `calculateAmountWithRate(baseAmount, ratePercent)`: calcula o valor total com taxa percentual.
- `calculateInstallmentAmount(totalAmount, installments)`: calcula o valor de cada parcela.
- `isValidNonNegativeRate(value)`: valida se uma taxa numerica e finita e maior ou igual a zero.
- `resolveValidRate(ownerRate, generalRate, fallbackRate)`: resolve uma taxa individual com fallback defensivo.
- `resolveCheckoutRates(ownerRates, generalRates, fallbackRates)`: normaliza o conjunto de taxas usado pelo checkout.

Fronteiras preservadas:

- funcoes financeiras puras nao acessam React;
- funcoes financeiras puras nao acessam Firebase;
- funcoes financeiras puras nao leem variaveis de ambiente;
- formatacao monetaria permanece no componente de checkout;
- leitura e escrita do Firestore permanecem nas paginas da aplicacao.

## 6. Testes de caracterizacao

Foi criada infraestrutura minima de testes unitarios com Vitest.

Arquivos de teste atuais:

- `src/lib/financialCalculations.test.ts`;
- `src/lib/financialValidation.test.ts`;
- `src/lib/financialConfiguration.test.ts`.

Os testes caracterizam:

- calculo de valor com taxa;
- calculo de parcela;
- comportamento atual de ponto flutuante;
- validacao de taxas nao negativas;
- rejeicao de `NaN`, `Infinity`, `-Infinity`, negativos e strings numericas;
- fallback defensivo por taxa;
- comportamento de credito ausente, parcela ausente e tipo inesperado.

Estado final confirmado nesta fase:

- 3 arquivos de teste;
- 34 testes aprovados.

## 7. Validacao das taxas na gravacao

A pagina `src/app/configuracoes/page.tsx` passou a validar taxas antes de salvar no Firestore.

Regras de gravacao:

- debito deve ser valido;
- todas as 12 parcelas de credito devem ser validas;
- `NaN`, `Infinity`, `-Infinity` e negativos sao bloqueados;
- `0` continua valido;
- valores positivos continuam validos;
- decimais continuam validos;
- `150` continua valido neste ciclo, pois nenhum limite maximo foi definido;
- nenhum documento parcial e salvo quando ha taxa invalida;
- a estrutura de `configuracoes/{targetUid}` foi preservada.

Mensagem exibida em caso de taxa invalida:

```text
Revise as taxas. Use apenas números iguais ou maiores que zero.
```

O documento continua sendo salvo em `configuracoes/{targetUid}`, onde `targetUid` e o UID do usuario comum ou o UID personificado durante suporte administrativo.

## 8. Validacao defensiva no checkout

O checkout foi protegido contra taxas invalidas vindas do Firestore.

Protecoes implementadas:

- nenhum valor bruto invalido deve chegar a `calculateAmountWithRate`;
- debito recebe uma taxa numerica valida;
- cada parcela de credito recebe uma taxa numerica valida;
- documentos antigos, adulterados ou incompletos sao tratados defensivamente;
- strings numericas nao sao aceitas implicitamente;
- PIX permanece independente das taxas e usa o valor base.

O checkout continua somente lendo Firestore. Nenhuma configuracao e gravada durante a simulacao publica.

## 9. Estrategia de fallback

A ordem de fallback para cada taxa individual e:

```text
taxa valida do proprietario
-> taxa valida da configuracao geral
-> fallback hardcoded existente
```

Essa resolucao ocorre por taxa individual.

Consequencias:

- uma parcela invalida nao invalida as demais parcelas validas;
- debito e credito sao resolvidos separadamente;
- uma taxa `0` valida do proprietario e preservada;
- uma taxa decimal valida e preservada;
- uma taxa negativa, infinita, `NaN` ou com tipo inesperado cai para a proxima fonte valida.

## 10. Politica de contatos

A politica de contatos no checkout e diferente da politica financeira por taxa.

Contatos seguem a fonte documental principal:

```text
documento do proprietario existente
-> contatos do proprietario

proprietario ausente
-> contatos da configuracao geral

ambos ausentes
-> contatos hardcoded
```

Uma taxa invalida do proprietario nao troca automaticamente `whatsapp`, `instagram` ou `site` pelos contatos da configuracao geral.

## 11. Atualizacoes de seguranca

Dependencias diretas atualizadas nesta fase:

```text
firebase: 12.10.0 -> 12.15.0
next: 16.1.6 -> 16.2.9
```

Efeitos confirmados:

```text
vulnerabilidades criticas em producao: 1 -> 0
vulnerabilidades altas em producao: 1 -> 0
```

A atualizacao do Firebase tambem atualizou dependencias transitivas relacionadas, incluindo `protobufjs`, `@grpc/grpc-js` e `@protobufjs/utf8`.

A atualizacao do Next reduziu a severidade de producao, mas ainda permanecem vulnerabilidades moderadas relacionadas a Next/PostCSS e vulnerabilidades em tooling/dev.

Nao foi executado `npm audit fix`.

## 12. Testes e validacoes atuais

Estado validado no final da fase:

```text
npm test      -> 3 arquivos, 34 testes aprovados
npm run lint  -> 0 erros, 4 warnings antigos
npm run build -> aprovado
```

Warnings antigos de lint ainda presentes:

- `src/app/page.tsx`: `linkGerado` atribuido e nao usado;
- `src/app/roteiro/[id]/page.tsx`: `index` nao usado;
- `src/app/roteiros/novo/page.tsx`: `fazendoUpload` nao usado;
- `src/app/roteiros/novo/page.tsx`: `index` nao usado.

Validacoes HTTP realizadas ao longo da fase incluiram rotas como:

- `/`;
- `/login`;
- `/manifest.webmanifest`;
- `/icon-192x192.png`;
- `/icon-512x512.png`;
- `/checkout/id-inexistente-de-teste`.

## 13. Arquivos principais envolvidos

Arquivos financeiros:

- `src/lib/financialCalculations.ts`;
- `src/lib/financialCalculations.test.ts`;
- `src/lib/financialValidation.ts`;
- `src/lib/financialValidation.test.ts`;
- `src/lib/financialConfiguration.ts`;
- `src/lib/financialConfiguration.test.ts`.

Paginas e configuracoes:

- `src/app/checkout/[hash]/page.tsx`;
- `src/app/configuracoes/page.tsx`;
- `src/app/roteiros/novo/page.tsx`;
- `src/app/manifest.ts`;
- `src/app/admin/page.tsx`;
- `src/app/login/page.tsx`;
- `next.config.ts`;
- `package.json`;
- `package-lock.json`.

## 14. Commits da fase

Commits registrados nesta fase:

```text
866bef5f fix: corrigir erros de lint em admin e login
a923db49 refactor: remover geracao de descricao por IA
ae79bd40 fix: definir raiz do turbopack
da4034ab fix: corrigir icones do manifesto
07cad7f2 refactor: extrair calculos financeiros
24c170e3 test: caracterizar calculos financeiros
153393b2 fix: atualizar firebase por seguranca
18571f58 fix: atualizar next por seguranca
2e2cac73 fix: validar taxas antes de salvar
be512a65 fix: validar taxas lidas no checkout
```

## 15. Riscos resolvidos

Riscos mitigados nesta fase:

- calculos financeiros sem caracterizacao automatizada;
- gravacao de taxas negativas, infinitas ou `NaN`;
- consumo de taxas invalidas vindas de Firestore;
- conversao silenciosa de credito invalido para `0`;
- uso direto de taxas brutas no checkout;
- vulnerabilidade critica de producao na arvore do Firebase;
- vulnerabilidade alta de producao associada ao Next;
- erro de resolucao do Tailwind causado por raiz incorreta do Turbopack;
- `404` dos icones declarados no manifesto;
- presenca de funcionalidade experimental de IA fora do produto atual.

## 16. Riscos ainda existentes

Riscos conhecidos que permanecem:

- nao existe limite maximo de taxa;
- precisao monetaria ainda depende de `number`;
- nao ha arredondamento financeiro explicito;
- o checkout depende de leitura de `configuracoes/geral` para fallback defensivo;
- permanecem duas vulnerabilidades moderadas de producao relacionadas a Next/PostCSS;
- permanecem vulnerabilidades em tooling/dev;
- ainda existem 4 warnings antigos de lint;
- nao ha testes de integracao com Firestore;
- nao ha testes de interface;
- a branch local esta a frente do remoto;
- nao houve push ou deploy desta fase.

## 17. Decisoes que devem ser preservadas

Decisoes importantes:

- calculos validos nao devem mudar sem novo ciclo explicito;
- `0` e taxa valida;
- decimais sao validos;
- strings numericas nao sao aceitas implicitamente;
- fallback financeiro ocorre por taxa individual;
- contatos nao seguem fallback financeiro por campo;
- nenhuma politica de limite maximo foi definida nesta fase;
- formulas nao devem ganhar arredondamento implicito;
- Firebase CLI nao deve ser usado neste projeto sem confirmacao explicita do ambiente e do alvo;
- mudancas devem continuar pequenas, revisaveis e validadas antes de commit.

Formulas preservadas:

```text
valor com taxa = valor base * (1 + taxa / 100)
valor da parcela = valor total / quantidade de parcelas
PIX = valor base
```

Nao foram introduzidos:

- arredondamento novo;
- conversao para centavos;
- limite maximo de taxa;
- mudanca de formato dos documentos Firestore.

## 18. Proximos passos recomendados

Opcoes possiveis:

1. levantamento e implementacao do dashboard comercial;
2. auditoria completa do modelo de dados e acesso;
3. tratamento formal de precisao monetaria.

Proxima prioridade recomendada: levantamento e implementacao do dashboard comercial.

Justificativa: a base financeira central do checkout foi isolada, caracterizada e protegida contra dados invalidos. Isso reduz o risco de iniciar uma funcionalidade comercial de medio porte. A auditoria de modelo de dados e o tratamento formal de precisao monetaria continuam importantes, mas podem ser planejados como ciclos especificos com escopo proprio.

## 19. Estado final da fase

Estado final confirmado:

```text
branch: develop
HEAD: be512a65
develop ahead de origin/develop por 10 commits
working tree: clean antes da criacao deste documento
```

O documento foi criado antes de push ou deploy. As Firestore Rules continuam fora deste ciclo e devem ser administradas manualmente pelo proprietario no painel do Firebase, conforme decisao operacional do projeto.
