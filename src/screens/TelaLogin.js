import { useState } from 'react';
import { Botao, Campo, Card, Tela, Texto, useAcao } from '../components/Interface';
import { supabase } from '../services/supabase';

export default function TelaLogin({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [ocupado, executar] = useAcao();
  function entrar() {
    executar(async () => {
      if (!email.trim() || !senha) throw new Error('Preencha o e-mail e a senha.');
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
      if (error?.code === 'email_not_confirmed') {
        navigation.navigate('ConfirmarEmail', { email: email.trim() }); return;
      }
      if (error) throw new Error(error.code === 'invalid_credentials'
        ? 'E-mail ou senha não conferem.' : error.message);
    });
  }
  return <Tela><Texto titulo>Entre na sua conta</Texto><Card>
    <Campo rotulo="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" editable={!ocupado} />
    <Campo rotulo="Senha" value={senha} onChangeText={setSenha} secureTextEntry autoCapitalize="none" editable={!ocupado} />
  </Card><Botao titulo={ocupado ? 'Entrando...' : 'Entrar'} onPress={entrar} disabled={ocupado} />
    <Botao titulo="Criar conta" secundario onPress={() => navigation.navigate('Cadastro')} />
  </Tela>;
}
