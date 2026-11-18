import { useState } from 'react';
import { View } from 'react-native';
import { Botao } from './Interface';

// Os campos continuam no estado da tela quando o conteúdo é recolhido.
export default function Detalhes({ titulo = 'Ver detalhes', children, abertoInicial = false }) {
  const [aberto, setAberto] = useState(abertoInicial);
  return <View style={{ gap: 12 }}>
    <Botao titulo={`${aberto ? '−' : '+'} ${titulo}`} rotuloAcessivel={titulo}
      secundario expandido={aberto} onPress={() => setAberto(valor => !valor)} />
    {aberto && children}
  </View>;
}
