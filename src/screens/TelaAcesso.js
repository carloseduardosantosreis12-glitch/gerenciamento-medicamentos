import styles from "../styles/TelaAcesso.styles";
import { StatusBar } from 'expo-status-bar';
import { ScrollView, View, Text, Pressable } from 'react-native';
export default function TelaAcesso({
  navigation
}) {
  return <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
      <View style={styles.cartao}>
        <Text style={styles.marca}>Meus medicamentos</Text>

        <Text style={styles.titulo}>Bem-vindo!</Text>

        <Text style={styles.subtitulo}>
          Escolha como deseja continuar.
        </Text>

        <Pressable style={styles.botaoEntrar} onPress={() => navigation.navigate('Login')} accessibilityRole="button" accessibilityState={{
        disabled: false
      }}>
          <Text style={styles.textoEntrar}>Entrar</Text>
        </Pressable>

        <Pressable style={styles.botaoCriarConta} onPress={() => navigation.navigate('Cadastro')} accessibilityRole="button" accessibilityState={{
        disabled: false
      }}>
          <Text style={styles.textoCriarConta}>
            Criar conta
          </Text>
        </Pressable>

        <View style={styles.divisor} />

        <Text style={styles.descricao}>
          Acompanhe seus medicamentos e horários em um só lugar.
        </Text>
      </View>

      <StatusBar style={styles.barraStatus} />
    </ScrollView>;
}
