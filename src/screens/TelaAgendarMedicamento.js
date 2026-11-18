import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Botao, Campo, Card, Estado, Opcoes, Tela, Texto, useAcao } from '../components/Interface';
import { contaId, resultado } from '../services/api';
import { supabase } from '../services/supabase';
import { useDados } from '../services/useDados';
import { DIAS_SEMANA, UNIDADES_DOSE, horarioValido, mascararHorario, resumirDias, unidadeDose } from '../services/agendaUtils';
import { numero, quantidade } from '../services/painelUtils';
import Detalhes from '../components/Detalhes';
import { sincronizarLembretes } from '../services/lembretes';

export default function TelaAgendarMedicamento({ navigation, route }) {
  const [selecionado, setSelecionado] = useState(route?.params?.medicamentoId || '');
  const [dias, setDias] = useState([1, 2, 3, 4, 5, 6, 7]);
  const [mostrarDias, setMostrarDias] = useState(false);
  const [horarios, setHorarios] = useState([]);
  const [digitado, setDigitado] = useState('');
  const [dose, setDose] = useState('');
  const [unidade, setUnidade] = useState('');
  const [editando, setEditando] = useState(null);
  const [ocupado, executar] = useAcao();
  const buscar = useCallback(async () => {
    const uid = await contaId();
    return resultado(supabase.from('medicamentos').select('id,nome,dosagem,unidade_estoque,horarios(id,horario,ativo,quantidade_dose,unidade_dose,dias_horario(dia_semana))')
      .eq('idoso_id', uid).eq('ativo', true).order('nome'));
  }, []);
  const { dados, erro, carregando, atualizar } = useDados(buscar);
  useEffect(() => {
    if (route?.params?.medicamentoId) {
      setSelecionado(route.params.medicamentoId);
      setEditando(null); setDose(''); setUnidade(''); setHorarios([]); setDigitado('');
    }
  }, [route?.params?.medicamentoId]);
  function limpar() {
    setEditando(null); setDose(''); setHorarios([]); setDigitado('');
    setDias([1, 2, 3, 4, 5, 6, 7]);
    setMostrarDias(false);
    setUnidade(unidadeDose((dados || []).find(m => m.id === selecionado)?.unidade_estoque));
  }
  function escolher(id) {
    setSelecionado(id); setEditando(null); setDose(''); setHorarios([]); setDigitado('');
    setDias([1, 2, 3, 4, 5, 6, 7]);
    setMostrarDias(false);
    setUnidade(unidadeDose((dados || []).find(m => m.id === id)?.unidade_estoque));
  }
  function adicionar() {
    if (!horarioValido(digitado)) return Alert.alert('Confira o horário', 'Use HH:MM, entre 00:00 e 23:59.');
    if (editando) { setHorarios([digitado]); setDigitado(''); return; }
    if (horarios.includes(digitado)) return Alert.alert('Horário repetido', 'Esse horário já está na lista.');
    if (horarios.length >= 24) return Alert.alert('Limite atingido', 'Salve a lista antes de adicionar mais horários.');
    setHorarios((lista) => [...lista, digitado].sort()); setDigitado('');
  }
  function salvar() {
    executar(async () => {
      if (!(dados || []).some((m) => m.id === selecionado)) throw new Error('Escolha um medicamento ativo.');
      const valor = numero(dose, false);
      if (valor === null || !UNIDADES_DOSE.some(item => item.valor === unidade)) throw new Error('Preencha a quantidade por tomada e escolha comprimidos, cápsulas ou mL.');
      if (!dias.length || !horarios.length) throw new Error('Escolha pelo menos um dia e adicione um horário.');
      if (digitado) throw new Error('Adicione o horário digitado à lista ou apague o campo.');
      if (editando && horarios.length !== 1) throw new Error('Escolha um único horário para substituir o anterior.');
      await resultado(supabase.rpc(editando ? 'editar_agendamento_com_dose' : 'salvar_agendamento_com_dose', {
        ...(editando ? { p_horario_id: editando.id } : { p_medicamento_id: selecionado }),
        p_horarios: horarios, p_dias_semana: dias, p_quantidade_dose: valor, p_unidade_dose: unidade }));
      limpar(); await atualizar(); await sincronizarLembretes(); Alert.alert('Agendamento salvo', editando
        ? 'O horário anterior foi substituído. Os outros horários foram mantidos.'
        : 'A rotina da tela inicial foi atualizada.');
    });
  }
  function pausar(item) {
    Alert.alert('Pausar horário?', `${item.nome}, ${item.horario.slice(0, 5)}.`, [
      { text: 'Voltar', style: 'cancel' }, { text: 'Pausar', onPress: () => executar(async () => {
        await resultado(supabase.from('horarios').update({ ativo: false }).eq('id', item.id).select('id').single());
        await sincronizarLembretes();
        await atualizar();
      }) },
    ]);
  }
  const agendamentos = (dados || []).flatMap((m) => (m.horarios || []).filter((h) => h.ativo)
    .map((h) => ({ ...h, nome: m.nome, medicamentoId: m.id, dias: (h.dias_horario || []).map((d) => d.dia_semana) })))
    .sort((a, b) => a.horario.localeCompare(b.horario));
  return <Tela atualizar={atualizar} carregando={carregando}>
    <Texto titulo>Agendar medicamento</Texto>
    {editando && <Card><Texto titulo>Editando {editando.horario.slice(0, 5)} · {editando.nome}</Texto>
      <Texto pequeno>Salve para substituir somente este horário.</Texto>
      <Botao titulo="Cancelar edição" secundario disabled={ocupado} onPress={limpar} />
    </Card>}
    <Estado erro={erro} carregando={carregando && !dados} atualizar={atualizar} />
    {dados && <>
      <Card><Texto titulo>1. Medicamento</Texto>
        {!dados.length && <Texto>Cadastre um medicamento para agendar.</Texto>}
        {selecionado && <Texto>{dados.find(m => m.id === selecionado)?.nome || 'Escolha um medicamento'}</Texto>}
        <Detalhes key={selecionado || 'escolher'} titulo={selecionado ? 'Trocar medicamento' : 'Escolher medicamento'} abertoInicial={!selecionado}>
        {dados.map((m) => <Botao key={m.id} titulo={`${m.nome} · ${m.dosagem}`} secundario={selecionado !== m.id}
          disabled={ocupado} onPress={() => escolher(m.id)} />)}
        <Botao titulo="Cadastrar medicamento" secundario onPress={() => navigation.navigate('CadastrarMedicamento')} />
        </Detalhes>
      </Card>
      {!!dados.length && !!selecionado && <>
        <Card><Texto titulo>2. Quantidade por tomada</Texto>
          <Opcoes itens={UNIDADES_DOSE}
            selecionado={unidade} onChange={setUnidade} disabled={ocupado} />
          <Campo rotulo="Quantidade em cada horário" value={dose} onChangeText={setDose} keyboardType="decimal-pad"
            maxLength={13} placeholder="Ex.: 1 ou 2,5" editable={!ocupado} />
          <Detalhes titulo="Ajuda com a quantidade"><Texto>A quantidade vale para todos os horários desta lista. Para quantidades diferentes, salve os horários separadamente.</Texto></Detalhes>
        </Card>
        <Card><Texto titulo>3. Dias</Texto>
          <Texto>{dias.length ? resumirDias(dias) : 'Escolha pelo menos um dia.'}</Texto>
          <Botao titulo={mostrarDias ? 'Fechar escolha dos dias' : 'Escolher outros dias'} secundario
            disabled={ocupado} onPress={() => setMostrarDias(valor => !valor)} />
          {mostrarDias && <>{DIAS_SEMANA.map((d) => <Botao key={d.valor} titulo={`${dias.includes(d.valor) ? '✓ ' : ''}${d.nome}`}
            secundario={!dias.includes(d.valor)} disabled={ocupado} onPress={() => setDias((lista) => lista.includes(d.valor)
              ? lista.filter((dia) => dia !== d.valor) : [...lista, d.valor].sort((a, b) => a - b))} />)}
          <Botao titulo="Todos os dias" secundario disabled={ocupado} onPress={() => {
            setDias([1, 2, 3, 4, 5, 6, 7]); setMostrarDias(false);
          }} /></>}
        </Card>
        <Card><Texto titulo>4. Horários</Texto>
          <Campo rotulo={editando ? 'Horário que substituirá o anterior' : 'Novo horário'} value={digitado} onChangeText={(v) => setDigitado(mascararHorario(v))}
            placeholder="HH:MM" keyboardType="number-pad" maxLength={5} editable={!ocupado} />
          <Botao titulo={editando ? 'Usar este horário na edição' : 'Adicionar horário'} secundario onPress={adicionar} disabled={ocupado} />
          {horarios.map((h) => <Botao key={h} titulo={`${h} · remover da lista`} secundario disabled={ocupado}
            onPress={() => setHorarios((lista) => lista.filter((v) => v !== h))} />)}
          <Texto pequeno>{editando ? 'A edição substitui o horário anterior e preserva o histórico.' : 'Para mudar um horário existente, use Editar este horário na lista abaixo.'}</Texto>
          <Botao titulo={ocupado ? 'Salvando...' : editando ? 'Salvar alteração' : 'Salvar agendamento'} onPress={salvar} disabled={ocupado} />
        </Card>
      </>}
      <Detalhes titulo={`Horários já agendados (${agendamentos.length})`}>
      {!agendamentos.length && <Texto>Nenhum horário ativo cadastrado.</Texto>}
      {agendamentos.map((h) => <Card key={h.id}>
        <Texto titulo>{h.horario.slice(0, 5)} · {h.nome}</Texto>
        <Texto>{quantidade(h.quantidade_dose, h.unidade_dose)} por tomada</Texto><Texto pequeno>{resumirDias(h.dias)}</Texto>
        <Botao titulo="Editar este horário" secundario disabled={ocupado} onPress={() => {
          setEditando(h);
          setSelecionado(h.medicamentoId); setDias(h.dias); setDose(h.quantidade_dose == null ? '' : String(h.quantidade_dose));
          setMostrarDias(h.dias.length !== 7);
          setUnidade(h.unidade_dose || ''); setHorarios([h.horario.slice(0, 5)]); setDigitado('');
          Alert.alert('Horário carregado', 'Altere os campos acima e toque em Salvar agendamento.');
        }} />
        <Botao titulo="Pausar este horário" secundario disabled={ocupado} onPress={() => pausar(h)} />
      </Card>)}
      </Detalhes>
    </>}
  </Tela>;
}
