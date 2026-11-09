import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { Botao, Campo, Card, Tela, Texto, useAcao } from '../components/Interface';
import { supabase } from '../services/supabase';
import { resultado } from '../services/api';

export default function TelaConfirmarEmail({ route, navigation }) {
  const email = route?.params?.email || '';
  const [token, setToken] = useState('');
  const [ocupado, executar] = useAcao();
  const ultimoEnvio = useRef(0);
  function confirmar() {
    executar(async () => {
      if (!email || !/^\d{6,10}$/.test(token.trim())) throw new Error('Informe o código numérico completo recebido por e-mail.');
      await resultado(supabase.auth.verifyOtp({ email, token: token.trim(), type: 'signup' }));
    });
  }
  function reenviar() {
    executar(async () => {
      if (!email) throw new Error('Volte ao login e informe seu e-mail.');
      if (Date.now() - ultimoEnvio.current < 60000) throw new Error('Aguarde um minuto antes de pedir outro código.');
      await resultado(supabase.auth.resend({ type: 'signup', email }));
      ultimoEnvio.current = Date.now(); Alert.alert('Envio solicitado', 'Confira também a pasta de spam.');
    });
  }
  return <Tela><Texto titulo>Confirme seu e-mail</Texto><Card>
    <Texto>{email}</Texto><Campo rotulo="Código recebido por e-mail" value={token} onChangeText={setToken}
      keyboardType="number-pad" maxLength={10} editable={!ocupado} />
    <Texto pequeno>Se o e-mail recebido contém um link de confirmação, abra o link e depois volte ao aplicativo para entrar.</Texto>
  </Card><Botao titulo="Confirmar código" disabled={ocupado} onPress={confirmar} />
    <Botao titulo="Reenviar e-mail" secundario disabled={ocupado} onPress={reenviar} />
    <Botao titulo="Voltar para entrar" secundario onPress={() => navigation.navigate('Login')} />
  </Tela>;
}
