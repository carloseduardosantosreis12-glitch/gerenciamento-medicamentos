# Interface simplificada — Meus Medicamentos

Revisão aplicada em 15/11/2026 nos arquivos do aplicativo.

## Idoso

- Início com Agendamento em destaque, horário grande, situação da dose e botão Ver agenda.
- Remédios e Estoque em cartões separados, um abaixo do outro.
- Agenda com horário, nome, especificação do medicamento, quantidade e situação visíveis. A confirmação continua exigindo confirmação adicional.
- Tomadas confirmadas, instruções e detalhes secundários ficam em seções que abrem ao toque.
- Lista de remédios mantém especificação, estoque e validade visíveis. Edição, agendamento e arquivamento ficam nas opções de cada medicamento.
- Permissões e compartilhamento do código ficam em Ajustes → Meu cuidador e permissões. Solicitações recebidas continuam visíveis para autorizar ou recusar.

## Cuidador

- Início separa Pessoas acompanhadas de Meus medicamentos.
- Pessoas acompanhadas prioriza nome, idade e Ver rotina. Gerenciamento de acesso e inclusão de pessoas abrem ao toque.
- A rotina acompanhada mostra nome, próximo horário, resumo de tomadas, pendentes e atrasadas. As abas Hoje, Alertas e Remédios organizam o restante.
- Não há botão de confirmar tomada na rotina de outra pessoa.

## Padrão de leitura

- Títulos de 26 px, textos de pelo menos 18 px e botões com área mínima de 48 px.
- Letras maiores continuam disponíveis. Cores, cartões, botões e navegação seguem os mesmos componentes.
- Formulários mantêm os valores no estado da tela ao recolher uma seção. Campos obrigatórios da tarefa continuam visíveis.
- Recursos de notificação continuam desabilitados em `src/config/recursos.js`.

## Verificação

- 27 testes automatizados passaram.
- Lint e verificação de tipos passaram.
- Exportação Android concluída sem erros.
- Prévia dos componentes reais com dados fictícios: 144 combinações de apresentação em 10 telas, larguras de 320/390/430 px, letras normais/ampliadas e seções abertas/fechadas. Nenhum texto ultrapassou a largura e os botões medidos atingiram a altura mínima.
- Regras de seleção e retorno da navegação verificadas separadamente.

As prévias usam React Native Web e serviços simulados. Ainda é necessário conferir o resultado no aparelho físico, com leitor de tela, e executar os fluxos completos com duas contas autorizadas. Esta revisão não altera regras do banco nem ativa notificações.
