import estilos from "../styles/PainelRotina.styles";
import { useCallback, useState } from 'react';
import { Alert, View } from 'react-native';
import { Botao, Card, Estado, Opcoes, Texto, useAcao, usePreferencias } from './Interface';
import { painel, resultado } from '../services/api';
import { supabase } from '../services/supabase';
import { useDados } from '../services/useDados';
import { dataBR, montarPainel, quantidade, textoValidade } from '../services/painelUtils';
import { resumirDias } from '../services/agendaUtils';
import { sincronizarLembretes } from '../services/lembretes';
import { resumirInicio } from '../services/resumoInicio';
import StatusAtualizacao from './StatusAtualizacao';
import Detalhes from './Detalhes';
export default function PainelRotina({
  idosoId,
  navigation,
  somenteLeitura = false,
  exibirMedicamentos = false
}) {
  const {
    preferencias,
    tema
  } = usePreferencias();
  const [aba, setAba] = useState(exibirMedicamentos && !somenteLeitura ? 'medicamentos' : 'hoje');
  const [ocupado, executar] = useAcao();
  const buscar = useCallback(() => painel(idosoId), [idosoId]);
  const {
    dados,
    erro,
    carregando,
    atualizar,
    atualizadoEm
  } = useDados(buscar);
  const resumo = montarPainel(dados, preferencias.diasValidade);
  const totalAlertas = resumo.estoque.length + resumo.validade.length;
  const inicio = resumirInicio(dados, preferencias.diasValidade);
  const pendentes = resumo.pendentes.filter(item => !item.semConfirmacao);
  function confirmar(item) {
    Alert.alert('Confirmar tomada?', `${item.medicamento.nome}\n${quantidade(item.quantidade_dose, item.unidade_dose)}\nHorário previsto: ${item.horario.slice(0, 5)}\nConfirme somente se você já tomou.`, [{
      text: 'Voltar',
      style: 'cancel'
    }, {
      text: 'Já tomei',
      onPress: () => executar(async () => {
        await resultado(supabase.rpc('confirmar_tomada', {
          p_horario_id: item.id,
          p_data_local: dados.hoje
        }));
        await atualizar();
        await sincronizarLembretes();
      })
    }]);
  }
  return <>
    <Estado erro={erro} carregando={carregando && !dados} atualizar={atualizar} />

    {dados && <>
      {somenteLeitura && <Card>
        <Texto titulo>Resumo de hoje</Texto>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <Texto>Tomadas: {resumo.tomadas.length}</Texto>
          <Texto>Pendentes: {pendentes.length}</Texto>
          <Texto cor={inicio.atrasadas ? tema.aviso : tema.texto}>Atrasadas: {inicio.atrasadas}</Texto>
        </View>
        {inicio.proxima ? <>
          <Texto titulo>{inicio.proxima.semConfirmacao ? 'Horário sem confirmação' : 'Próximo horário'}: {inicio.proxima.horario.slice(0, 5)}</Texto>
          <Texto>{inicio.proxima.medicamento.nome}</Texto>
          <Texto>{quantidade(inicio.proxima.quantidade_dose, inicio.proxima.unidade_dose)}</Texto>
        </> : <Texto>Nenhum horário pendente para hoje.</Texto>}

      </Card>}
      <Texto titulo={!somenteLeitura}>Hoje, {dataBR(dados.hoje)}</Texto>

      <Opcoes itens={[
        {
        valor: 'hoje',
        titulo: 'Hoje'
      }, {
        valor: 'alertas',
        titulo: `Alertas (${totalAlertas})`
      }, ...(exibirMedicamentos ? [{ valor: 'medicamentos', titulo: `Remédios (${dados.medicamentos.length})` }] : [])]} selecionado={aba} onChange={setAba} />
      {aba === 'medicamentos' ? <>
        <Texto titulo>Medicamentos cadastrados</Texto>
        {!dados.medicamentos.length && <Card><Texto>Nenhum medicamento ativo cadastrado para esta pessoa.</Texto></Card>}
        {dados.medicamentos.map(item => <Card key={item.id}>
          <Texto titulo>{item.nome}</Texto>
          <Texto>{item.dosagem}</Texto>
          <Texto>Estoque: {quantidade(item.quantidade_estoque, item.unidade_estoque)}</Texto>
          <Detalhes titulo={`Horários e validade de ${item.nome}`}>
          <Texto pequeno>Validade: {dataBR(item.validade)}</Texto>
          {!(item.horarios || []).some(h => h.ativo) && <Texto pequeno>Nenhum horário ativo agendado.</Texto>}
          {(item.horarios || []).filter(h => h.ativo).map(h => <Texto pequeno key={h.id}>
            {h.horario.slice(0, 5)} · {quantidade(h.quantidade_dose, h.unidade_dose)} · {resumirDias(h.dias || [])}
          </Texto>)}
          </Detalhes>
        </Card>)}
      </> : aba === 'hoje' ? <>
        <Texto titulo>Doses de hoje</Texto>
        {!resumo.pendentes.length && <Card><Texto>Nenhuma tomada pendente para hoje.</Texto></Card>}
        {resumo.pendentes.map(item => <Card key={item.id}>
          <Texto titulo>{item.horario.slice(0, 5)} · {item.medicamento.nome}</Texto>
          <Texto>{quantidade(item.quantidade_dose, item.unidade_dose)} por tomada</Texto>
          <Texto>{item.medicamento.dosagem}</Texto>
          <Texto cor={item.semConfirmacao ? estilos.corAtraso(tema) : tema.texto}>
            {item.semConfirmacao ? 'Atrasada · sem confirmação' : 'Pendente'}
          </Texto>
          {item.medicamento.dias_validade != null && item.medicamento.dias_validade <= 0 && <Texto cor={estilos.corVencido(tema)}>{textoValidade(item.medicamento)}</Texto>}
          {!somenteLeitura && <>
            <Botao titulo={ocupado ? 'Salvando...' : 'Já tomei'} disabled={ocupado || !item.quantidade_dose} onPress={() => confirmar(item)} />
            {!item.quantidade_dose && <Botao titulo="Preencher quantidade da dose" secundario onPress={() => navigation.navigate('Agenda', { medicamentoId: item.medicamento.id })} />}
            {item.quantidade_dose > 0 && <Detalhes titulo={`Detalhes de ${item.medicamento.nome} às ${item.horario.slice(0, 5)}`}>
            <Botao titulo={item.quantidade_dose ? 'Editar agendamento' : 'Preencher quantidade na Agenda'} secundario onPress={() => navigation.navigate('Agenda', {
              medicamentoId: item.medicamento.id
            })} /></Detalhes>}
          </>}
        </Card>)}
        <Detalhes titulo={`Tomadas confirmadas (${resumo.tomadas.length})`}>
        {!resumo.tomadas.length && <Card><Texto>Nenhuma tomada confirmada para hoje.</Texto></Card>}
        {resumo.tomadas.map(item => <Card key={item.id}>
          <Texto titulo>{item.nome_medicamento}</Texto>
          <Texto>{quantidade(item.quantidade_registrada, item.unidade_registrada)}</Texto>
          <Texto pequeno>Previsto: {new Date(item.previsto_para).toLocaleTimeString('pt-BR', {
              timeZone: item.fuso_registrado || dados.fuso,
              hour: '2-digit',
              minute: '2-digit'
            })}</Texto>
          <Texto pequeno>Confirmado: {new Date(item.confirmado_em).toLocaleTimeString('pt-BR', {
              timeZone: item.fuso_registrado || dados.fuso,
              hour: '2-digit',
              minute: '2-digit'
            })}</Texto>
        </Card>)}
        </Detalhes>
      </> : <>
        <Texto titulo>Estoque baixo ({resumo.estoque.length})</Texto>
        {!resumo.estoque.length && <Card><Texto>Nenhum medicamento com estoque no limite ou abaixo dele.</Texto></Card>}
        {resumo.estoque.map(item => <Card key={item.id}>
          <Texto titulo>{item.nome}</Texto>
          <Texto cor={estilos.corEstoque(tema)}>Restam {quantidade(item.quantidade_estoque, item.unidade_estoque)}</Texto>
          <Texto pequeno>Limite: {quantidade(item.limite_alerta, item.unidade_estoque)}</Texto>
          {!somenteLeitura && <Botao titulo="Atualizar estoque" secundario onPress={() => navigation.navigate('CadastrarMedicamento', {
            medicamentoId: item.id
          })} />}
        </Card>)}
        <Texto titulo>Validade ({resumo.validade.length})</Texto>
        {!resumo.validade.length && <Card><Texto>Nenhum vencido ou com vencimento nos próximos {preferencias.diasValidade} dias.</Texto></Card>}
        {resumo.validade.map(item => <Card key={item.id}>
          <Texto titulo>{item.nome}</Texto><Texto cor={estilos.corValidade(item, tema)}>{textoValidade(item)}</Texto>
        </Card>)}
        {resumo.semValidade > 0 && <Texto pequeno>{resumo.semValidade} medicamento(s) sem validade informada.</Texto>}
      </>}
    </>}
    <Detalhes titulo="Atualização e ajuda">
      <StatusAtualizacao atualizadoEm={atualizadoEm} carregando={carregando} erro={erro} fuso={dados?.fuso} />
      <Texto>Atrasada significa que o horário passou sem confirmação no aplicativo.</Texto>
    </Detalhes>
    <Botao titulo={carregando ? 'Atualizando...' : 'Atualizar dados'} secundario disabled={carregando || ocupado} onPress={atualizar} />
  </>;
}
