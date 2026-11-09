import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { criarEstilosIcone } from '../styles/Icone.styles';

export default function Icone({ tipo, cor }) {
  const desenho = useMemo(() => criarEstilosIcone(cor), [cor]);

  if (tipo === 'medicamentos') {
    return (
      <View style={desenho.capsula}>
        <View style={desenho.divisaoCapsula} />
      </View>
    );
  }
  if (tipo === 'agenda') {
    return (
      <View style={desenho.calendario}>
        <View style={desenho.linhaCalendario} />
        <View style={desenho.anelEsquerdo} />
        <View style={desenho.anelDireito} />
        <View style={desenho.diaCalendario} />
      </View>
    );
  }
  if (tipo === 'cuidador') {
    return (
      <View style={desenho.pessoa}>
        <View style={desenho.cabecaPessoa} />
        <View style={desenho.corpoPessoa} />
      </View>
    );
  }
  if (tipo === 'configuracoes') {
    return (
      <View style={desenho.engrenagem}>
        {desenho.dentes.map((dente, indice) => (
          <View key={indice} style={dente} />
        ))}
        <View style={desenho.anelEngrenagem} />
      </View>
    );
  }
  if (tipo === 'relogio') {
    return (
      <View style={desenho.relogio}>
        <View style={desenho.ponteiroVertical} />
        <View style={desenho.ponteiroHorizontal} />
      </View>
    );
  }
  if (tipo === 'lista') {
    return (
      <View style={desenho.lista}>
        {[0, 1, 2].map(linha => (
          <View key={linha} style={desenho.linhaLista}>
            <View style={desenho.pontoLista} />
            <View style={desenho.tracoLista} />
          </View>
        ))}
      </View>
    );
  }
  const simbolos = { adicionar: '+', tomado: '\u2713' };
  return <Text style={desenho.simbolo}>{simbolos[tipo] || ''}</Text>;
}
