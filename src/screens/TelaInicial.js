import { useState } from 'react';
import { Image, Pressable, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Botao, Card, Tela, Texto, usePreferencias } from '../components/Interface';
import Icone from '../components/Icone';
import PainelRotina from '../components/PainelRotina';
import estilos, { criarDetalhesInicio } from '../styles/TelaInicial.styles';

const ATALHOS = [
  { tipo: 'adicionar', titulo: 'Cadastrar medicamento', rota: 'CadastrarMedicamento' },
  { tipo: 'relogio', titulo: 'Agendar medicamento', rota: 'Agenda' },
  { tipo: 'lista', titulo: 'Medicamentos e estoque', rota: 'Medicamentos' },
  { tipo: 'tomado', titulo: 'Histórico de tomadas', rota: 'Historico' },
];

export default function TelaInicial({ usuario, navigation }) {
  const ehCuidador = usuario?.user_metadata?.tipo_perfil === 'cuidador';
  const { tema } = usePreferencias();
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const [fotoFalhou, setFotoFalhou] = useState(false);
  const detalhes = criarDetalhesInicio(tema);
  const empilhar = width < 380 || fontScale * tema.escala > 1.2;
  const nome = String(
    usuario?.user_metadata?.nome || usuario?.user_metadata?.full_name || ''
  ).trim();
  const primeiroNome = nome.split(/\s+/)[0] || '';
  const foto = usuario?.user_metadata?.avatar_url || usuario?.user_metadata?.picture;

  return (
    <Tela>
      <View style={estilos.espacoSuperior(insets)} />
      <View style={estilos.cabecalho}>
        <View style={detalhes.marca}>
          <Image
            source={require('../../assets/logo-medicamentos.png')}
            style={detalhes.logo}
            resizeMode="contain"
            accessible={false}
          />
          <Texto style={detalhes.marcaTexto}>Meus{'\n'}medicamentos</Texto>
        </View>
        <Pressable
          onPress={() => navigation.navigate('Configuracoes')}
          accessibilityRole="button"
          accessibilityLabel="Abrir configurações da conta"
          style={estilos.avatar(tema)}
        >
          {typeof foto === 'string' && /^https?:\/\//i.test(foto) && !fotoFalhou ? (
            <Image
              source={{ uri: foto }}
              onError={() => setFotoFalhou(true)}
              style={estilos.foto}
            />
          ) : (
            <Texto titulo cor={estilos.corAvatar(tema)}>
              {primeiroNome.charAt(0).toUpperCase() || 'M'}
            </Texto>
          )}
        </Pressable>
      </View>
      <Texto titulo>{primeiroNome ? `Olá, ${primeiroNome}!` : 'Olá!'}</Texto>
      <Card style={estilos.cardRotina(tema)}>
        <Texto titulo cor={estilos.corTituloRotina}>
          {ehCuidador ? 'Meus medicamentos e horários' : 'Sua rotina de hoje'}
        </Texto>
        <Texto cor={estilos.corTextoRotina}>
          Acompanhe seus horários, suas tomadas e os alertas de estoque e validade.
        </Texto>
      </Card>
      {ehCuidador && (
        <Card>
          <Texto titulo>Idosos que acompanho</Texto>
          <Texto>Veja o nome, a idade e os medicamentos de cada idoso autorizado.</Texto>
          <Botao titulo="Abrir idosos acompanhados" onPress={() => navigation.navigate('Cuidador')} />
          <Texto pequeno>Os atalhos e a rotina abaixo são dos seus próprios medicamentos.</Texto>
        </Card>
      )}
      <Texto titulo>Acesso rápido</Texto>
      <View style={estilos.acessosRapidos}>
        {ATALHOS.map(item => (
          <Pressable
            key={item.rota}
            onPress={() => navigation.navigate(
              item.rota,
              item.rota === 'Historico' ? { idosoId: usuario.id, nome: '' } : undefined
            )}
            accessibilityRole="button"
            accessibilityLabel={item.titulo}
            style={({ pressed }) => [
              detalhes.atalho,
              empilhar && detalhes.atalhoEmpilhado,
              pressed && detalhes.pressionado,
            ]}
          >
            <View
              style={detalhes.atalhoIcone}
              importantForAccessibility="no-hide-descendants"
              accessibilityElementsHidden
            >
              <Icone tipo={item.tipo} cor={tema.azul} />
            </View>
            <Texto style={detalhes.atalhoTexto}>{item.titulo}</Texto>
          </Pressable>
        ))}
      </View>
      <PainelRotina idosoId={usuario.id} navigation={navigation} />
    </Tela>
  );
}
