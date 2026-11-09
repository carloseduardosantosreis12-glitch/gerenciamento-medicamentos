import styles from "../styles/TelaCadastro.styles";
import { useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../services/supabase';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
const TIPOS = [{
  valor: 'idoso',
  titulo: 'Idoso',
  descricao: 'Quero organizar meus medicamentos.'
}, {
  valor: 'cuidador',
  titulo: 'Cuidador',
  descricao: 'Quero acompanhar uma pessoa com sua autoriza\u00e7\u00e3o.'
}];
const MENSAGENS_ERRO = {
  email_address_invalid: 'Esse endere\u00e7o de e-mail n\u00e3o foi aceito. Confira o endere\u00e7o informado.',
  email_address_not_authorized: 'N\u00e3o foi poss\u00edvel enviar a confirma\u00e7\u00e3o para esse endere\u00e7o de e-mail.',
  user_already_exists: 'J\u00e1 existe uma conta com esse e-mail. Use a op\u00e7\u00e3o Entrar.',
  email_exists: 'J\u00e1 existe uma conta com esse e-mail. Use a op\u00e7\u00e3o Entrar.',
  over_email_send_rate_limit: 'O limite de envio de e-mails foi atingido. Aguarde para tentar novamente.',
  over_request_rate_limit: 'H\u00e1 muitas tentativas. Aguarde para tentar novamente.',
  weak_password: 'Escolha uma senha mais longa, com letras, n\u00fameros e s\u00edmbolos.',
  signup_disabled: 'O cadastro de novas contas est\u00e1 indispon\u00edvel no momento.',
  email_provider_disabled: 'O cadastro por e-mail est\u00e1 indispon\u00edvel no momento.'
};
export default function TelaCadastro() {
  const navigation = useNavigation();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [tipoPerfil, setTipoPerfil] = useState('');
  const [enviando, setEnviando] = useState(false);
  const envioEmAndamento = useRef(false);
  async function cadastrarUsuario() {
    if (envioEmAndamento.current) return;
    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim();
    if (!nomeLimpo || !emailLimpo || !senha.trim() || !confirmarSenha.trim()) {
      Alert.alert('Preencha os campos', 'Informe seu nome, e-mail, senha e confirma\u00e7\u00e3o da senha.');
      return;
    }
    if (!TIPOS.some(tipo => tipo.valor === tipoPerfil)) {
      Alert.alert('Escolha seu perfil', 'Selecione Idoso ou Cuidador para criar sua conta.');
      return;
    }
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formatoEmail.test(emailLimpo)) {
      Alert.alert('Confira seu e-mail', 'Digite um e-mail no formato nome@exemplo.com.');
      return;
    }
    if (senha.length < 8) {
      Alert.alert('Senha muito curta', 'Use uma senha com pelo menos 8 caracteres.');
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert('Senhas diferentes', 'Digite a mesma senha nos dois campos.');
      return;
    }
    envioEmAndamento.current = true;
    setEnviando(true);
    try {
      const {
        data,
        error
      } = await supabase.auth.signUp({
        email: emailLimpo,
        password: senha,
        options: {
          data: {
            nome: nomeLimpo,
            tipo_perfil: tipoPerfil
          }
        }
      });
      if (error) throw error;
      if (!data?.user) {
        throw new Error('O cadastro n\u00e3o retornou os dados da conta.');
      }
      setSenha('');
      setConfirmarSenha('');
      if (data.session) return;
      Alert.alert('Confira seu e-mail', 'Digite no aplicativo o c\u00f3digo recebido para confirmar seu cadastro.', [{
        text: 'Continuar',
        onPress: () => navigation.navigate('ConfirmarEmail', {
          email: emailLimpo
        })
      }]);
    } catch (erro) {
      const mensagem = MENSAGENS_ERRO[erro?.code] || 'N\u00e3o foi poss\u00edvel concluir o cadastro. Confira sua conex\u00e3o e tente novamente.';
      console.log('Erro no cadastro:', {
        nome: erro?.name,
        mensagem: erro?.message,
        status: erro?.status,
        codigo: erro?.code
      });
      Alert.alert('N\u00e3o foi poss\u00edvel cadastrar', mensagem);
    } finally {
      envioEmAndamento.current = false;
      setEnviando(false);
    }
  }
  return <ScrollView style={styles.container} contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
      <View style={styles.formulario}>
        <Text style={styles.titulo}>Criar conta</Text>
        <Text style={styles.subtitulo}>
          {'Preencha seus dados para come\u00e7ar.'}
        </Text>

        <Text style={styles.rotulo}>
          Como deseja usar o aplicativo?
        </Text>

        {TIPOS.map(tipo => {
        const selecionado = tipoPerfil === tipo.valor;
        return <Pressable key={tipo.valor} onPress={() => setTipoPerfil(tipo.valor)} disabled={enviando} accessibilityRole="radio" accessibilityLabel={tipo.titulo + '. ' + tipo.descricao} accessibilityState={{
          checked: selecionado,
          disabled: enviando
        }} style={styles.opcaoPerfil(selecionado)}>
              <View style={styles.circulo}>
                {selecionado && <View style={styles.ponto} />}
              </View>

              <View style={styles.textosOpcao}>
                <Text style={styles.tituloOpcao}>{tipo.titulo}</Text>
                <Text style={styles.descricaoOpcao}>{tipo.descricao}</Text>
              </View>
            </Pressable>;
      })}

        <Text style={styles.rotulo}>Nome completo</Text>
        <TextInput style={styles.campo} value={nome} onChangeText={setNome} placeholder="Digite seu nome completo" placeholderTextColor={styles.placeholderNome} autoCapitalize="words" editable={!enviando} accessibilityLabel="Nome completo" />

        <Text style={styles.rotulo}>E-mail</Text>
        <TextInput style={styles.campo} value={email} onChangeText={setEmail} placeholder="seu@email.com" placeholderTextColor={styles.placeholderEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} editable={!enviando} accessibilityLabel="E-mail" />

        <Text style={styles.rotulo}>Senha</Text>
        <TextInput style={styles.campo} value={senha} onChangeText={setSenha} placeholder="Pelo menos 8 caracteres" placeholderTextColor={styles.placeholderSenha} secureTextEntry autoCapitalize="none" autoCorrect={false} editable={!enviando} accessibilityLabel="Senha" />

        <Text style={styles.rotulo}>Confirmar senha</Text>
        <TextInput style={styles.campo} value={confirmarSenha} onChangeText={setConfirmarSenha} placeholder="Repita a senha" placeholderTextColor={styles.placeholderConfirmacao} secureTextEntry autoCapitalize="none" autoCorrect={false} editable={!enviando} accessibilityLabel="Confirmar senha" />

        <Pressable style={styles.botaoCriarConta(enviando)} onPress={cadastrarUsuario} disabled={enviando} accessibilityRole="button" accessibilityState={{
        disabled: enviando,
        busy: enviando
      }}>
          {enviando && <ActivityIndicator size="small" color={styles.corCarregamento} />}
          <Text style={styles.textoBotao}>
            {enviando ? 'Criando conta...' : 'Criar conta'}
          </Text>
        </Pressable>
      </View>

      <StatusBar style={styles.barraStatus} />
    </ScrollView>;
}
