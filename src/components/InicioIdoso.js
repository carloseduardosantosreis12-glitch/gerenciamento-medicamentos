import { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Estado, Tela, Texto, usePreferencias } from './Interface';
import Icone from './Icone';
import CabecalhoApp from './CabecalhoApp';
import Detalhes from './Detalhes';
import StatusAtualizacao from './StatusAtualizacao';
import { painel } from '../services/api';
import { useDados } from '../services/useDados';
import { resumirInicio } from '../services/resumoInicio';
import { quantidade } from '../services/painelUtils';
import { criarEstilosInicioIdoso } from '../styles/InicioIdoso.styles';

function IconeDecorativo({ tipo, cor }) {
  return (
    <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <Icone tipo={tipo} cor={cor} />
    </View>
  );
}

export default function InicioIdoso({ usuario, navigation }) {
  const { tema, preferencias } = usePreferencias();
  const insets = useSafeAreaInsets();
  const estilos = criarEstilosInicioIdoso(tema, insets);
  const buscar = useCallback(() => painel(usuario.id), [usuario.id]);
  const { dados, erro, carregando, atualizar, atualizadoEm } = useDados(buscar);
  const resumo = resumirInicio(dados, preferencias.diasValidade);
  const { proxima } = resumo;
  const abrirAgenda = () => navigation.navigate('Rotina');

  return (
    <Tela atualizar={atualizar} carregando={carregando}>
      <View style={estilos.conteudo}>
        <CabecalhoApp usuario={usuario} navigation={navigation} />

        <View style={estilos.agendamento}>
          <View style={estilos.linhaTitulo}>
            <IconeDecorativo tipo="agenda" cor={tema.branco} />
            <Texto titulo cor={tema.branco} style={estilos.titulo}>Agendamento</Texto>
          </View>
          {!dados ? (
            <Texto cor={tema.branco}>
              {erro ? 'Não foi possível consultar seus horários.' : 'Carregando seus horários…'}
            </Texto>
          ) : proxima ? (
            <>
              <Texto cor={tema.branco}>
                {proxima.semConfirmacao ? 'Dose sem confirmação' : 'Próxima dose de hoje'}
              </Texto>
              <Texto cor={tema.branco} style={estilos.horario}
                accessibilityLabel={`Horário: ${proxima.horario.slice(0, 5)}`}>
                {proxima.horario.slice(0, 5)}
              </Texto>
              <Texto cor={tema.branco} style={estilos.medicamento}>{proxima.medicamento.nome}</Texto>
              <View style={estilos.situacao}>
                <Texto cor={tema.texto} style={estilos.textoSituacao}>
                  {proxima.semConfirmacao ? 'Atrasada · sem confirmação' : 'Pendente'}
                </Texto>
              </View>
              {!!resumo.atrasadas && !proxima.semConfirmacao && (
                <Texto cor={tema.branco}>
                  {resumo.atrasadas === 1 ? '1 dose anterior sem confirmação'
                    : `${resumo.atrasadas} doses anteriores sem confirmação`}
                </Texto>
              )}
            </>
          ) : (
            <Texto cor={tema.branco} style={estilos.medicamento}>
              {resumo.tomadas.length ? 'Todas as doses de hoje foram confirmadas.'
                : 'Nenhuma dose agendada para hoje.'}
            </Texto>
          )}
          <Pressable onPress={abrirAgenda} accessibilityRole="button"
            accessibilityLabel="Ver agenda e doses de hoje"
            style={({ pressed }) => [estilos.botaoAgenda, pressed && estilos.pressionado]}>
            <IconeDecorativo tipo="agenda" cor={tema.azul} />
            <Texto cor={tema.azul} style={estilos.textoBotao}>Ver agenda</Texto>
          </Pressable>
        </View>

        <Estado erro={erro} carregando={carregando && !dados} atualizar={atualizar} />


        <Pressable onPress={() => navigation.navigate('Medicamentos')}
          accessibilityRole="button" accessibilityLabel="Abrir meus remédios"
          style={({ pressed }) => [estilos.cartao, pressed && estilos.pressionado]}>
          <View style={estilos.linhaTitulo}>
            <IconeDecorativo tipo="medicamentos" cor={tema.azul} />
            <Texto titulo style={estilos.titulo}>Remédios</Texto>
            <Texto cor={tema.azul} style={estilos.seta} accessible={false}>›</Texto>
          </View>
          <Texto>{dados
            ? `${resumo.totalMedicamentos} ${resumo.totalMedicamentos === 1
              ? 'medicamento cadastrado' : 'medicamentos cadastrados'}`
            : erro ? 'Toque para consultar seus remédios.' : 'Carregando medicamentos…'}</Texto>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Estoque')}
          accessibilityRole="button" accessibilityLabel="Ver estoque e medicamentos acabando"
          style={({ pressed }) => [estilos.cartao, pressed && estilos.pressionado]}>
          <View style={estilos.linhaTitulo}>
            <IconeDecorativo tipo="lista" cor={tema.azul} />
            <Texto titulo style={estilos.titulo}>Estoque</Texto>
            <Texto cor={tema.azul} style={estilos.seta} accessible={false}>›</Texto>
          </View>
          {!dados ? <Texto>{erro ? 'Toque para consultar seu estoque.' : 'Carregando estoque…'}</Texto>
            : <>
              <Texto cor={resumo.estoque.length ? tema.aviso : tema.texto} style={estilos.alerta}>
                {resumo.estoque.length
                  ? `${resumo.estoque.length} ${resumo.estoque.length === 1 ? 'item acabando' : 'itens acabando'}`
                  : 'Nenhum item acabando'}
              </Texto>
              {resumo.estoque.slice(0, 2).map(item => (
                <Texto key={item.id}>
                  {item.nome}: {quantidade(item.quantidade_estoque, item.unidade_estoque)}
                </Texto>
              ))}
              {resumo.estoque.length > 2 && <Texto>Ver mais {resumo.estoque.length - 2} no estoque</Texto>}
              {!!resumo.validade.length && <Texto cor={tema.perigo}>
                {resumo.validade.length === 1 ? '1 alerta de validade na agenda'
                  : `${resumo.validade.length} alertas de validade na agenda`}
              </Texto>}
            </>}
        </Pressable>
        <Detalhes titulo="Atualização dos dados">
          <StatusAtualizacao atualizadoEm={atualizadoEm} carregando={carregando} erro={erro} fuso={dados?.fuso} />
          <Texto>Consulte a Agenda para atualizar sua rotina.</Texto>
        </Detalhes>
      </View>
    </Tela>
  );
}
