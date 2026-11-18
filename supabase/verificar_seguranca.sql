-- SOMENTE LEITURA: inspeção a executar pelo responsável no SQL Editor do Supabase.
-- Não cria tabelas, não muda políticas e não concede acesso.
-- Os resultados precisam ser analisados e complementados pelos testes com duas contas.

select n.nspname as esquema, c.relname as tabela,
       c.relrowsecurity as rls_habilitada, c.relforcerowsecurity as rls_forcada
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind in ('r', 'p')
order by c.relname;

select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

select n.nspname as esquema, p.proname as funcao,
       pg_get_function_identity_arguments(p.oid) as argumentos,
       p.prosecdef as security_definer, p.proconfig as configuracao,
       p.proacl as permissoes
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('obter_painel_medicamentos', 'obter_historico_medicamentos',
    'listar_idosos_acompanhados', 'solicitar_acompanhamento', 'confirmar_tomada',
    'salvar_agendamento_com_dose', 'editar_agendamento_com_dose')
order by p.proname;

-- Depois: verificar no corpo das funções as checagens de auth.uid() e de vínculo
-- autorizado. Não concluir que a política é segura apenas por existir ou habilitar RLS.
