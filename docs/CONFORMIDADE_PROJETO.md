# Comparação com o projeto escrito

Revisão: 13/11/2026. Referência: “Aplicativo de Gerenciamento de Medicamentos para Idosos”, PDF de seis páginas fornecido pelo autor.

## Complementos de 15/11/2026

A pedido do autor, os lembretes permanecem implementados, mas **bloqueados no código** por `src/config/recursos.js`, com `notificacoes: false`. O aplicativo não importa o serviço nativo de avisos, não pede permissão e não agenda lembretes nesta versão. Os Ajustes exibem a indisponibilidade sem botão de ativar ou testar. A configuração Android bloqueia as permissões de notificações e alarmes em novos builds. As instruções antigas de ativação abaixo só se aplicam a uma futura versão de teste com a chave habilitada.

Acrescentados: última consulta bem-sucedida ao servidor no início, rotina e histórico; resumo do cuidador com próximo horário e contagens de tomadas, pendentes e atrasadas; rotina de hoje como aba inicial da consulta; rótulos de situação; melhoria de legibilidade no cadastro. As alterações preservam a consulta do cuidador sem botão de confirmar dose pela pessoa acompanhada.

Resultados desta rodada: 27 testes automatizados, lint, verificação de tipos e exportação Android; apresentação simulada em 320, 390 e 430 px com letras normais e ampliadas. As datas de atualização não avançam em erro nem em resposta antiga. Nenhuma alteração foi aplicada ao banco de produção. Testes físicos, leitura pelo TalkBack e validação com contas autorizadas e revogadas continuam necessários.

Os registros de campo e o SUS continuam fora do fluxo normal do idoso: há calculadora e roteiro de pesquisa, sem resultados fictícios. Entrevistas, CEP e avaliação por participantes são atividades da pesquisa, não funções que o código possa concluir sozinho.

## Resultado da revisão anterior

O aplicativo segue a proposta de organizar medicamentos e permitir consulta pelo cuidador autorizado. A lacuna funcional mais importante era o serviço de lembretes: existia apenas uma implementação vazia que informava que as notificações estavam desativadas. Foi acrescentado o agendamento local de avisos com som, ativação voluntária, teste de som, atualização dos avisos e abertura da agenda ao tocar na notificação.

Código implementado não equivale a testes com participantes nem à validação do banco de produção. Essas evidências continuam separadas abaixo.

| Requisito do PDF | Evidência no aplicativo | Situação |
| --- | --- | --- |
| Perfis de idoso e cuidador (objetivo geral, p. 2) | Cadastro com escolha de perfil; home e navegação distintas | Implementado; validar com duas contas reais |
| Cadastro de medicamento e dose (objetivo 2, p. 3) | Nome/especificação no cadastro; quantidade por tomada e unidade na Agenda | Implementado |
| Poucos passos e instruções claras (objetivos 2 e 9, p. 3) | Cadastro abre na contagem direta de estoque; após salvar oferece “Agendar horários”; dias detalhados ficam recolhidos | Melhorado nesta revisão; medir o tempo com participantes |
| Dias e horários (objetivo 2, p. 3) | Seleção de dias, edição e pausa de horários | Implementado |
| Aviso no smartphone com nome, dose e horário (objetivo 8 e metodologia, p. 3) | `lembretesUtils`, `gerenciadorLembretes`, `lembretes` e “Lembretes com som” em Ajustes | Acrescentado; falta teste físico de entrega e som |
| Confirmação pelo idoso (objetivo 4, p. 3) | “Já tomei” na agenda com confirmação explícita; notificação abre a agenda e não grava tomada | Implementado; testar gravação no Supabase |
| Registro de doses confirmadas e não confirmadas (objetivo 4, p. 3) | Painel e histórico individual com filtros | Implementado no cliente; RPCs exigem validação no banco |
| Consulta do cuidador autorizado (objetivo 6, p. 3) | Solicitar, autorizar, revogar e consultar rotina/histórico em modo de leitura | Implementado no cliente; testar concessão e revogação com duas contas |
| Autenticação e controle de acesso (seção 3.3, p. 2) | Sessão Supabase; filtros por pessoa; consultas por RPC; área de permissões | Parcialmente verificável no código; políticas RLS e funções do servidor não foram auditadas ao vivo |
| Fontes ampliadas, botões e contraste (objetivo 9, p. 3) | Home simplificada; horário de 56 px; preferência de letras maiores; textos comuns de pelo menos 18 px e títulos de 26 px | Implementado nas telas que usam a interface comum; revisar TalkBack/VoiceOver e telas de autenticação no celular |
| Alertas sonoros (objetivos 1 e 9, p. 2–3) | Canal com som e vibração; botão de teste de som | Acrescentado; volume/permissões são controlados pelo aparelho |
| Entrevistas (objetivo 1, p. 2; metodologia/cronograma) | Roteiro em `PLANO_TESTES_USABILIDADE.md` | Preparado, não realizado |
| Alpha e registro de problemas (metodologia, p. 3; resultados, p. 4) | Testes automatizados e roteiro de testes físicos com registro de evidências | Alpha parcial; não há evidência de testes de campo |
| Beta com até 15 participantes e SUS (objetivo 7, p. 3) | Roteiro, modelo de registro e calculadora SUS | Preparado, não aplicado; nenhum resultado foi inventado |
| CEP (metodologia, p. 3) | Deve ser acompanhado pelo responsável e orientador | Pendente de comprovação; o aplicativo não concede aprovação ética |
| Análise de resultados e relatório final (p. 4–5) | Modelos de registro e cálculo preparados | Dependem da coleta real |
| Avaliar registro no INPI (p. 4) | Atividade final prevista na pesquisa | Não é funcionalidade do app e não foi realizado |

## O que é evolução futura no próprio documento

Estoque e reposição, leitura de embalagens/receitas, câmera, código de barras/OCR e alertas avançados aparecem como evoluções futuras (p. 2–3). O estoque já implementado foi preservado. Não foram acrescentados OCR ou reconhecimento de receita como se fossem requisitos obrigatórios do protótipo inicial.

O texto da metodologia menciona que “usuário ou cuidador” informa o cadastro; os objetivos descrevem acompanhamento básico de consulta. O app mantém a consulta do cuidador e as alterações na conta da pessoa acompanhada. Caso a pesquisa exija cadastro remoto pelo cuidador, será necessário definir a permissão de escrita e validá-la também no banco; não basta mostrar um botão.

## Validação futura dos lembretes quando liberados para teste

1. Abra o aplicativo no celular e entre na conta da própria pessoa.
2. Em **Ajustes > Lembretes com som**, toque em **Ativar lembretes** e responda à solicitação do sistema.
3. Use **Testar som do lembrete**. O aviso de teste é previsto para cerca de cinco segundos e não registra dose.
4. Com dados fictícios, agende um horário próximo. Verifique com o app aberto, em segundo plano e com a tela bloqueada.
5. Toque no aviso: a agenda deve abrir. A gravação depende do botão “Já tomei” e de sua confirmação.
6. Edite ou pause o horário. Verifique se o aviso anterior é substituído ou removido. Saia da conta e confirme que os avisos dela foram removidos.

São programadas as próximas ocorrências dentro de 30 dias, limitadas a 60 avisos por aparelho. A tela informa a última data programada. Abrir o app e sincronizar renova o planejamento. Os avisos já programados não precisam de internet; alterações e confirmações precisam sincronizar. Datas, dias e horários seguem o fuso do perfil, não o fuso do computador.

Os lembretes são da conta em uso, não dos idosos vistos pelo cuidador. A preferência é separada por conta/aparelho; o agendamento antigo é removido ao sair ou trocar de conta. Os avisos exibem nome e dose: quem usa o aparelho deve revisar a exibição na tela bloqueada. No Android o canal solicita conteúdo privado.

Notificações locais são suportadas no Expo Go compatível com SDK 57; notificações push remotas não foram acrescentadas. Para distribuição própria, gere um novo build com o plugin de notificações e a permissão de agendamento exato. Não há garantia de entrega pontual sem validar as permissões e restrições do aparelho.

Referência técnica: [Expo Notifications, SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/).

## Verificação do banco

O repositório chama funções que já devem existir no Supabase, mas não contém a definição completa delas. `supabase/verificar_seguranca.sql` contém apenas consultas de inspeção. Ele não cria políticas nem altera permissões.

Antes de considerar o requisito de segurança validado, registrar: RLS habilitada nas tabelas, políticas com vínculo autorizado e checagem de identidade nas RPCs; tentativa negada de uma conta não autorizada; bloqueio após revogação; cuidador sem permissão de confirmar dose por outra pessoa. Uma tela esconder um botão não substitui essas verificações.

## Comandos de verificação

### Evidências desta revisão

- 21 testes automatizados aprovados: planejamento de lembretes, fuso, dias ativos, dose confirmada, edição, pausa, saída/troca de conta, falha de conexão, falha parcial de agendamento, isolamento da notificação, resumo da home e cálculo SUS.
- `npm run lint`: concluído sem erros.
- `npm run typecheck`: concluído sem erros no escopo descrito abaixo.
- Compilação/exportação Android do Expo: concluída sem erros após as alterações.
- Revisão visual local com dados fictícios em larguras de 320, 390 e 430 px e letras normais/ampliadas; tela de lembretes verificada sem corte horizontal.
- Inspeção de diferenças: sem erros de espaços ou conflitos.
- Ainda não executados: entrega e som em dispositivo físico, teste autenticado contra o Supabase e coleta com participantes.

```text
npm test
npm run lint
npm run typecheck
```

Os testes de lembretes usam um simulador das APIs do aparelho, sem acessar dados reais de saúde. Eles não comprovam emissão de som nem a configuração do Supabase. O roteiro em `PLANO_TESTES_USABILIDADE.md` identifica as verificações ainda necessárias.

O comando `typecheck` cobre as regras puras de horários, resumo da home e planejamento/gerenciamento de lembretes. As telas continuam em JavaScript e são verificadas pelo lint e pela compilação do Expo; não foram convertidas integralmente para TypeScript.
