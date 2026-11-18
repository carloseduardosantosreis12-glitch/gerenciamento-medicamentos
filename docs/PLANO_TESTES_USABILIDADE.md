# Plano de testes e avaliação de usabilidade

Preparado em 13/11/2026 com base nas seções 4, 5 e 7 do projeto escrito. Este é um roteiro a executar, não um relatório de pesquisa concluída.

## Preparação

Confirmar com o orientador o procedimento de aprovação e consentimento previsto no projeto antes da etapa Beta. O documento prevê até 15 participantes, somando idosos e cuidadores; não significa que 15 pessoas já participaram.

Nos testes técnicos, usar contas e medicamentos fictícios. Não pedir que alguém tome um medicamento para testar a interface. Preferir códigos de participante (P01, P02...) nos registros; separar qualquer identificação/consentimento do registro de respostas. Não incluir senhas, códigos de acesso, medicamentos reais ou nomes de pessoas nos relatórios de erro.

Registrar versão do app, Android/iOS, modelo do aparelho, data, fuso, tamanho de fonte, estado da conexão e permissões de notificação.

## Entrevistas de requisitos

Perguntas abertas, sem sugerir a resposta:

1. Como você costuma organizar os horários dos medicamentos?
2. Em que parte dessa rotina encontra mais dificuldade?
3. O que ajuda a perceber e entender um aviso no celular?
4. Como prefere informar a quantidade e os horários?
5. Quais informações gostaria que o cuidador pudesse consultar?
6. Como gostaria de autorizar ou retirar esse acesso?

Registrar as necessidades relatadas e relacioná-las a mudanças concretas de interface. Não tratar opiniões do desenvolvedor como resultados das entrevistas.

## Alpha: roteiro funcional

| Caso | Procedimento com dados fictícios | Resultado esperado | Evidência a registrar |
| --- | --- | --- | --- |
| A01 | Criar conta de idoso e conta de cuidador, confirmar e-mail e entrar | Perfil e dados corretos, sem troca entre contas | Versão, resultado e falhas |
| A02 | Cadastrar medicamento e selecionar “Agendar horários” | Cadastro salvo; medicamento selecionado na Agenda | Tempo, número de etapas e erros |
| A03 | Definir unidade, quantidade, todos os dias e um horário | Dados exatamente como informados | Horário/dias de teste e resultado |
| A04 | Escolher apenas dois dias; editar depois | Dias preservados; os outros não recebem aviso | Comparação com os dias selecionados |
| A05 | Ativar lembretes; aceitar e depois negar permissão em instalações de teste | Só agenda quando autorizado; negativa com mensagem clara | Sistema, permissão e resultado |
| A06 | Acionar teste de som | Aviso de teste em cerca de 5 s, sem registro de dose | Entrega, som, vibração e atraso observado |
| A07 | Agendar dose próxima; app aberto, em segundo plano e bloqueado | Aviso com nome, especificação, quantidade e horário | Captura sem dados reais e atraso observado |
| A08 | Tocar no aviso sem confirmar e depois confirmar no app | Primeiro toque só abre Agenda; confirmação grava uma única dose | Estado anterior/posterior |
| A09 | Confirmar antes de um aviso futuro; editar, pausar ou arquivar medicamento | Avisos correspondentes removidos ou substituídos | Ausência de aviso antigo |
| A10 | Trocar de conta, sair e entrar novamente | Sem avisos de outra conta; preferência da conta restaurada | Contas fictícias e resultado |
| A11 | Desconectar internet após programar lembretes | Aviso local permanece; gravações/atualizações explicam falta de conexão | Estado do app e do sistema |
| A12 | Trocar o fuso no perfil e mudar data no ambiente controlado | Avisos no fuso do perfil, sem duplicação ou dose em dia incorreto | Fuso e hora esperada/observada |
| A13 | Cuidador solicitar vínculo; idoso autorizar; depois revogar | Consulta só com autorização; bloqueio após revogação | Teste com duas contas e evidência do servidor |
| A14 | Conta não autorizada tentar consultar diretamente os dados/RPCs | Servidor não devolve dados protegidos | Resposta do servidor, sem credenciais |
| A15 | Cuidador abrir pessoa autorizada | Consulta de medicamentos e histórico; sem confirmar dose pela pessoa | Resultado da interface e do servidor |
| A16 | Letras maiores do app e do sistema; TalkBack/VoiceOver | Rótulos claros, leitura coerente, sem botões/textos cortados | Tela, fonte, leitor e dificuldade |
| A17 | Consultar histórico e estoque | Confirmadas/não confirmadas coerentes; dados da conta correta | Resultado e eventual divergência |
| A18 | Reiniciar celular e testar novo horário; ativar restrição de bateria no aparelho de teste | Verificar limites reais do sistema e documentar falhas | Resultado por aparelho, sem presumir sucesso |

Separar “passou”, “falhou” e “não executado”. Um teste automatizado não substitui A06, A07, A13, A14, A16 ou A18 no dispositivo/servidor.

## Beta: tarefas de facilidade de uso

Apresentar o objetivo de cada tarefa, sem apontar previamente o botão. Registrar ajuda solicitada, conclusão sem ajuda/com ajuda, desistência, erros, tempo e comentário espontâneo. Não interpretar lentidão como incapacidade da pessoa.

- Idoso: encontrar o próximo horário; cadastrar um medicamento fictício; agendar dois horários; confirmar uma dose fictícia; consultar histórico; ativar e identificar um lembrete; autorizar e revogar um cuidador.
- Cuidador: solicitar vínculo; identificar a pessoa acompanhada; consultar medicamentos; distinguir dose confirmada de não confirmada; constatar bloqueio após revogação.

### Ficha de tarefa

| Campo | Preencher |
| --- | --- |
| Código do participante e perfil | |
| Tarefa e versão do aplicativo | |
| Início/fim e duração em segundos | |
| Conclusão sem ajuda / com ajuda / não concluída | |
| Erro observado, sem dados de saúde reais | |
| Comentário do participante | |
| Ajuste proposto e número do problema | |

## Escala de Usabilidade do Sistema (SUS)

Aplicar depois das tarefas, usando os dez itens na ordem original e a versão em português escolhida/validada pelo orientador. Este roteiro não inventa uma tradução validada nem substitui os enunciados por perguntas próprias. Registrar a referência e a versão do questionário efetivamente aplicado.

Respostas: 1 a 5, de discordância total a concordância total. Registrar R1 a R10, sem alterar a ordem. O modelo `respostas-sus.exemplo.json` começa vazio. Exemplo de estrutura de um registro a preencher: `codigo`, `perfil` e `respostas` (lista das dez respostas inteiras).

Para cada participante, nos itens ímpares subtrair 1 da resposta; nos pares subtrair a resposta de 5. Somar e multiplicar por 2,5. O resultado vai de 0 a 100 e não é uma porcentagem. Respostas incompletas não recebem nota automática nesta ferramenta.

```text
node scripts/calcular-sus.cjs docs/respostas-sus.exemplo.json
```

A calculadora valida dez respostas de 1 a 5, códigos únicos e perfil. Ela calcula resultado individual e resumo por perfil. Não cria respostas nem interpreta a nota como aprovação clínica ou conclusão de pesquisa.

Referência de cálculo: [Brooke, J. (1996), SUS: A quick and dirty usability scale](https://hci-studies.org/methods-and-measures/downloads/SUS_Brooke1996.pdf). A versão traduzida usada na coleta deve ser indicada separadamente.

## Registro de problemas e relatório final

| Problema | Caso/tarefa | Evidência | Impacto observado | Correção | Nova verificação | Situação |
| --- | --- | --- | --- | --- | --- | --- |
| Preencher após executar | | | | | | |

Relatório final: contexto e versão testada; número real de participantes por perfil; critérios e procedimento utilizados; tempos das tarefas; conclusões com/sem ajuda; notas SUS; dificuldades relatadas; mudanças realizadas; limitações e casos não testados. Documentar o andamento do CEP e a avaliação da possibilidade de registro do software conforme o cronograma do projeto. Não preencher resultados antes de coletá-los.
