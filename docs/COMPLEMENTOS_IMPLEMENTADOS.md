# Complementos implementados em 15 de novembro de 2026

## Notificações desativadas

A chave `notificacoes` está definida como `false` em `src/config/recursos.js`. Ela controla o gerenciador, a importação nativa, o acompanhamento em segundo plano e a configuração do Expo. Preferências antigas não reativam o recurso. Os Ajustes não apresentam ação para ligar ou testar avisos. A implementação dos lembretes permanece para futura validação.

O novo build Android remove o plugin e bloqueia POST_NOTIFICATIONS, SCHEDULE_EXACT_ALARM e USE_EXACT_ALARM. Uma futura liberação exige alterar a chave, gerar um build compatível e testar no aparelho; não é uma opção disponível ao usuário nesta versão. O código não consegue apagar avisos já entregues ou programados pelo sistema por uma instalação anterior sem executar o módulo nativo. Se uma versão anterior foi ativada no aparelho, seus agendamentos devem ser cancelados nela ou removidos ao limpar/reinstalar o app.

## Acompanhamento

O cuidador abre a rotina do dia com contagem das doses confirmadas, pendentes e atrasadas, próximo horário disponível e acesso aos alertas. A consulta permanece em modo de leitura. Atraso significa ausência de confirmação depois do horário previsto, sem afirmar que o medicamento não foi ingerido.

A última consulta ao servidor aparece no início, rotina e histórico. O instante corresponde à resposta bem-sucedida; falhas não avançam a data. Respostas antigas ou recebidas depois de sair da tela são descartadas. Em falha, os dados anteriores não ficam apresentados como se estivessem atualizados.

## Verificações

- 27 testes automatizados de regras, bloqueio de avisos, falhas, concorrência e cálculo SUS.
- Lint e verificação de tipos no escopo configurado no repositório.
- Exportação Android do Expo e conferência da configuração efetiva sem plugin/permissões de avisos.
- Telas de início, consulta do cuidador e lembretes em apresentação local com dados fictícios, em 320, 390 e 430 px e duas escalas de letras.

## O que depende de validação externa

- Aparelho físico e TalkBack; a apresentação local não comprova comportamento nativo.
- Duas contas de teste e ambiente Supabase para validar autorização, revogação, RPCs e políticas RLS. O repositório não contém todas as definições do servidor; não foram inventadas migrações nem alteradas tabelas reais.
- Entrevistas, autorização ética, testes com participantes e SUS. Nenhum resultado de pesquisa foi gerado pelo aplicativo.
