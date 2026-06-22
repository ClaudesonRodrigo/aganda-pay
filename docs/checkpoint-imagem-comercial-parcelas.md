# Checkpoint - Imagem Comercial das Parcelas

## 1. Objetivo de negocio

A funcionalidade de imagem comercial das parcelas oferece uma apresentacao visual das condicoes de pagamento para abordagem e negociacao por WhatsApp.

A imagem foi pensada para:

- destacar o valor de cada parcela;
- apoiar a conversa comercial antes do cliente acessar o checkout completo;
- manter o PIX visivel como valor base a vista;
- evitar que o total financiado seja o foco principal da arte;
- continuar transparente sobre os custos da operacao de pagamento.

A imagem nao substitui o checkout completo. Ela e um material de apoio comercial, gerado a partir da proposta salva e das taxas atuais resolvidas pela aplicacao.

Nao foi adotada linguagem que atribua as taxas exclusivamente a operadora, banco ou fintech. O texto da arte informa que os valores das parcelas ja incluem os custos da operacao de pagamento.

## 2. Escopo implementado

O escopo entregue inclui:

- botao `Imagem` nos cards de propostas abertas;
- geracao baseada na proposta ja salva em `links_gerados`;
- uso do valor salvo da proposta como valor base;
- leitura das taxas atuais antes de abrir a pre-visualizacao;
- geracao das opcoes parceladas de 1x ate 10x;
- apresentacao do PIX como valor base;
- modal de previa da arte;
- exportacao local em PNG;
- dimensoes de exportacao de 1080 x 1350;
- download local sem persistencia no Firestore;
- nome de arquivo sanitizado.

O checkout publico nao foi alterado por esta funcionalidade.

## 3. Fluxo completo

```text
proposta salva
-> clique em Imagem
-> leitura das configuracoes
-> resolucao das taxas
-> geracao das parcelas
-> abertura do modal
-> revisao da arte
-> geracao do PNG
-> download local
```

## 4. Arquivos envolvidos

Responsabilidades principais:

- `src/lib/commercialInstallments.ts`: gera as opcoes comerciais de parcelamento a partir do valor base e das taxas de credito.
- `src/components/CommercialInstallmentsPreview.tsx`: renderiza a arte de pre-visualizacao que sera convertida em PNG.
- `src/components/CommercialInstallmentsModal.tsx`: controla o modal de previa, fechamento e acao de baixar PNG.
- `src/lib/imageExport.ts`: cria o PNG a partir do DOM do preview e monta o nome de arquivo seguro.
- `src/app/page.tsx`: integra o botao `Imagem` ao fluxo administrativo, carrega configuracoes, resolve taxas, abre o modal e dispara o download.
- `src/lib/financialConfiguration.ts`: resolve taxas validas usando configuracao do proprietario, configuracao geral e fallback.
- `src/config/rates.ts`: mantem o fallback financeiro local usado quando as configuracoes nao trazem uma taxa valida.

## 5. Politica financeira preservada

A politica de resolucao financeira permanece:

```text
taxa valida da configuracao do proprietario
-> taxa valida de configuracoes/geral
-> fallback de src/config/rates.ts
```

Pontos preservados:

- PIX e o valor base da proposta;
- a imagem mostra parcelas de 1x ate 10x;
- o checkout continua podendo trabalhar com ate 12x;
- as formulas financeiras nao foram alteradas;
- o arredondamento atual nao foi alterado;
- os valores continuam usando `number`;
- nao existe snapshot historico de taxas por proposta;
- a imagem sempre usa as taxas atuais no momento da geracao.

Formulas preservadas:

```text
valor com taxa = valor base * (1 + taxa / 100)
valor da parcela = valor total / quantidade de parcelas
PIX = valor base
```

## 6. Contratos internos

Contratos adicionados ou utilizados:

- `CommercialInstallmentOption`: representa uma opcao comercial com `installments` e `installmentAmount`.
- `generateCommercialInstallmentOptions(baseAmount, creditRates, minInstallments, maxInstallments)`: retorna opcoes parceladas em ordem crescente, por padrao de 1x ate 10x.
- `CommercialInstallmentsPreview`: componente visual que recebe PIX, opcoes de parcelas e dados opcionais de identificacao da proposta para renderizar a arte.
- `CommercialInstallmentsModal`: componente cliente que exibe a previa, bloqueia fechamento durante geracao e aciona o download.
- `buildCommercialInstallmentsFilename(proposalTitle, proposalId)`: gera nome de arquivo `.png` sanitizado.
- `createCommercialInstallmentsPngDataUrl(element)`: converte o elemento do preview em PNG no navegador.
- `downloadCommercialInstallmentsPng(element, proposalTitle, proposalId)`: gera o PNG e dispara o download local.

Os objetos de opcoes comerciais nao retornam:

- valor total financiado;
- taxa;
- percentual;
- texto formatado;
- flag visual.

## 7. Seguranca e privacidade

Decisoes preservadas:

- o PNG e gerado no navegador;
- a imagem nao e enviada para servidor;
- a imagem nao e salva no Firestore;
- o nome do arquivo nao inclui telefone ou nome de cliente;
- `.env.local` nao foi alterado;
- Firebase Rules nao foram alteradas;
- Firebase CLI nao foi utilizada;
- nenhum servico externo recebe a imagem.

## 8. Dependencia adicionada

Dependencia adicionada:

```text
html-to-image@1.11.13
```

Finalidade:

- converter o DOM do preview em PNG no navegador.

Estado registrado na auditoria:

- nenhuma outra dependencia foi adicionada neste ciclo;
- `npm audit --omit=dev` permaneceu com 2 vulnerabilidades moderadas de producao relacionadas a Next/PostCSS;
- nenhuma vulnerabilidade foi atribuida ao `html-to-image`;
- `npm audit fix` nao foi executado.

## 9. Testes e validacoes

Ultimo estado confirmado:

```text
5 arquivos de teste
56 testes aprovados
lint: 0 erros
warnings antigos: 4
build: aprovado
PNG: 1080 x 1350
Branch Deploy develop: funcionando
teste de fluxo online: aprovado pelo proprietario
```

Validacoes de produto confirmadas no ambiente online pelo proprietario:

- fluxo administrativo funcionou;
- botao de imagem funcionou;
- modal abriu corretamente;
- valores das parcelas foram apresentados;
- PNG foi gerado e baixado corretamente;
- conteudo da imagem saiu completo.

Nao houve afirmacao de teste em todos os navegadores.

## 10. Limitacoes conhecidas

Limitacoes atuais:

- a imagem usa taxas atuais, nao snapshot do momento em que a proposta foi criada;
- valores monetarios continuam usando `number`;
- nao existe arredondamento monetario explicito;
- a imagem mostra somente 1x a 10x;
- o checkout completo permanece como fonte das condicoes detalhadas;
- nao ha compartilhamento automatico no WhatsApp;
- nao ha armazenamento ou historico das imagens;
- nao ha editor de template;
- teste em outros navegadores e aparelhos ainda pode ser ampliado.

## 11. Fora do escopo

Nao foi implementado:

- gateway de pagamento;
- confirmacao de pagamento;
- envio automatico pelo WhatsApp;
- upload do PNG;
- snapshot financeiro;
- editor de imagem;
- multiplos templates;
- alteracao das formulas;
- alteracao do checkout;
- alteracao das Firestore Rules.

## 12. Checklist de homologacao antes do merge

- [ ] login na aplicacao online
- [ ] carregamento das propostas
- [ ] botao Imagem nos cards esperados
- [ ] modal abre com titulo correto
- [ ] PIX correto
- [ ] parcelas de 1x a 10x corretas
- [ ] nenhuma soma total exibida
- [ ] PNG baixa corretamente
- [ ] PNG completo e legivel
- [ ] nome do arquivo sanitizado
- [ ] teste em celular
- [ ] copiar link continua funcionando
- [ ] abrir checkout continua funcionando
- [ ] exclusao e demais acoes continuam funcionando
- [ ] checkout publico preservado
- [ ] nenhum erro relevante no console

## 13. Procedimento futuro de merge

Orientacao futura, sem execucao neste ciclo:

```text
validar develop
-> atualizar develop com o remoto
-> confirmar working tree limpo
-> abrir merge ou PR para main
-> revisar diff
-> executar testes, lint e build
-> integrar em main
-> validar deploy de producao
```

Nao ha orientacao de force push ou comandos destrutivos neste procedimento.

## 14. Estado de encerramento

Este documento encerra tecnicamente a funcionalidade de geracao de imagem comercial das parcelas no estado em que o proprietario confirmou o teste online do Branch Deploy `develop`.

Neste ciclo de documentacao:

- nenhum codigo da aplicacao foi alterado;
- nenhuma dependencia foi alterada;
- nenhum arquivo de configuracao foi alterado;
- nenhum commit foi criado;
- nenhum push foi executado;
- nenhum merge foi executado;
- nenhum deploy manual foi executado;
- Firebase CLI nao foi utilizada.
