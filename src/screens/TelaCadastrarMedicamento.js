import estilos from "../styles/TelaCadastrarMedicamento.styles";
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Botao, Campo, Card, Estado, Opcoes, Tela, Texto, useAcao } from '../components/Interface';
import { contaId, resultado } from '../services/api';
import { supabase } from '../services/supabase';
import { dataBR, numero, quantidade, validadeISO } from '../services/painelUtils';
const EMBALAGENS = [{
  valor: 'caixa',
  titulo: 'Caixa',
  pergunta: 'Quantas caixas você tem?'
}, {
  valor: 'cartela',
  titulo: 'Cartela',
  pergunta: 'Quantas cartelas você tem?'
}, {
  valor: 'frasco',
  titulo: 'Frasco',
  pergunta: 'Quantos frascos você tem?'
}];
const CONTEUDOS = [{
  valor: 'comprimido',
  titulo: 'Comprimidos',
  plural: 'comprimidos'
}, {
  valor: 'cápsula',
  titulo: 'Cápsulas',
  plural: 'cápsulas'
}, {
  valor: 'mL',
  titulo: 'Líquido',
  plural: 'mL'
}];
const FORMAS = [{
  valor: 'embalagens',
  titulo: 'Por embalagens'
}, {
  valor: 'total',
  titulo: 'Total restante'
}];
const VAZIO = {
  nome: '',
  dosagem: '',
  quantidade_estoque: '',
  unidade_estoque: '',
  limite_alerta: '',
  validade: ''
};
function normalizarUnidade(valor) {
  const texto = String(valor || '').trim();
  const unidade = texto.toLowerCase();
  if (['comprimido', 'comprimidos'].includes(unidade)) return 'comprimido';
  if (['cápsula', 'cápsulas', 'capsula', 'capsulas'].includes(unidade)) return 'cápsula';
  if (unidade === 'ml') return 'mL';
  return texto;
}
function calcularEstoque(embalagens, porEmbalagem, unidade) {
  if (!['comprimido', 'cápsula', 'mL'].includes(unidade)) return null;
  const quantidadeEmbalagens = numero(embalagens);
  const conteudo = numero(porEmbalagem, false);
  if (quantidadeEmbalagens === null || !Number.isInteger(quantidadeEmbalagens) || conteudo === null) return null;
  if (unidade !== 'mL' && !Number.isInteger(conteudo)) return null;
  const total = quantidadeEmbalagens * conteudo;
  if (!Number.isFinite(total) || total > 999999999.999) return null;
  return Number(total.toFixed(3));
}
export default function TelaCadastrarMedicamento({
  route,
  navigation
}) {
  const id = route?.params?.medicamentoId;
  const [dados, setDados] = useState(VAZIO);
  const [forma, setForma] = useState('embalagens');
  const [embalagem, setEmbalagem] = useState('');
  const [numeroEmbalagens, setNumeroEmbalagens] = useState('');
  const [conteudoEmbalagem, setConteudoEmbalagem] = useState('');
  const [carregando, setCarregando] = useState(!!id);
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const [ocupado, executar] = useAcao();
  const embalagemSelecionada = EMBALAGENS.find(item => item.valor === embalagem);
  const conteudoSelecionado = CONTEUDOS.find(item => item.valor === dados.unidade_estoque);
  const conteudosDisponiveis = forma === 'embalagens' && embalagem === 'cartela' ? CONTEUDOS.filter(item => item.valor !== 'mL') : CONTEUDOS;
  const total = forma === 'embalagens' ? calcularEstoque(numeroEmbalagens, conteudoEmbalagem, dados.unidade_estoque) : numero(dados.quantidade_estoque);
  useEffect(() => {
    let ativo = true;
    setErro('');
    setDados(VAZIO);
    setForma(id ? 'total' : 'embalagens');
    setEmbalagem('');
    setNumeroEmbalagens('');
    setConteudoEmbalagem('');
    if (!id) {
      setCarregando(false);
      return;
    }
    setCarregando(true);
    async function carregar() {
      try {
        const uid = await contaId();
        const item = await resultado(supabase.from('medicamentos').select('*').eq('id', id).eq('idoso_id', uid).single());
        if (ativo) setDados({
          nome: item.nome || '',
          dosagem: item.dosagem || '',
          quantidade_estoque: String(item.quantidade_estoque ?? ''),
          unidade_estoque: normalizarUnidade(item.unidade_estoque),
          limite_alerta: String(item.limite_alerta ?? ''),
          validade: item.validade ? dataBR(item.validade) : ''
        });
      } catch (falha) {
        if (ativo) setErro(falha?.message || 'Não foi possível carregar o medicamento.');
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    carregar();
    return () => {
      ativo = false;
    };
  }, [id, tentativa]);
  function alterar(chave, valor) {
    if (chave === 'validade') {
      const numeros = valor.replace(/\D/g, '').slice(0, 8);
      valor = numeros.length > 4 ? `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}` : numeros.length > 2 ? `${numeros.slice(0, 2)}/${numeros.slice(2)}` : numeros;
    }
    setDados(anterior => ({
      ...anterior,
      [chave]: valor
    }));
  }
  function escolherConteudo(valor) {
    if (valor === dados.unidade_estoque) return;
    setDados(anterior => ({
      ...anterior,
      unidade_estoque: valor,
      quantidade_estoque: '',
      limite_alerta: ''
    }));
    setConteudoEmbalagem('');
    if (valor === 'mL' && embalagem === 'cartela') {
      setEmbalagem('');
      setNumeroEmbalagens('');
    }
  }
  function escolherEmbalagem(valor) {
    if (valor === embalagem) return;
    setEmbalagem(valor);
    setNumeroEmbalagens('');
    setConteudoEmbalagem('');
    if (valor === 'cartela' && dados.unidade_estoque === 'mL') escolherConteudo('');
  }
  function escolherForma(valor) {
    if (valor === forma) return;
    if (valor === 'total') alterar('quantidade_estoque', total === null ? '' : String(total));
    if (valor === 'embalagens' && embalagem === 'cartela' && dados.unidade_estoque === 'mL') setEmbalagem('');
    setForma(valor);
  }
  function salvar() {
    executar(async () => {
      const nome = dados.nome.trim();
      const dosagem = dados.dosagem.trim();
      const limite = numero(dados.limite_alerta);
      if (!nome || !dosagem) throw new Error('Preencha o nome e a especificação do remédio.');
      if (nome.length > 200 || dosagem.length > 200) throw new Error('Use até 200 caracteres para o nome e a especificação.');
      if (!conteudoSelecionado) throw new Error('Selecione o conteúdo: comprimidos, cápsulas ou líquido.');
      if (forma === 'embalagens' && !embalagemSelecionada) throw new Error('Selecione a embalagem do medicamento.');
      if (total === null || dados.unidade_estoque !== 'mL' && !Number.isInteger(total)) {
        throw new Error('Confira as quantidades do estoque. Use números inteiros para comprimidos e cápsulas. Para líquidos, use até três casas decimais.');
      }
      if (limite === null || dados.unidade_estoque !== 'mL' && !Number.isInteger(limite)) {
        throw new Error('Informe um limite de alerta igual ou maior que zero. Para comprimidos e cápsulas, use números inteiros.');
      }
      const item = {
        nome,
        dosagem,
        quantidade_estoque: total,
        unidade_estoque: dados.unidade_estoque,
        limite_alerta: limite,
        validade: validadeISO(dados.validade)
      };
      const uid = await contaId();
      if (id) {
        await resultado(supabase.from('medicamentos').update(item).eq('id', id).eq('idoso_id', uid).select('id').single());
      } else {
        await resultado(supabase.from('medicamentos').insert({
          ...item,
          idoso_id: uid
        }).select('id').single());
      }
      Alert.alert('Medicamento salvo', `Estoque registrado: ${quantidade(total, dados.unidade_estoque)}.`);
      navigation.goBack();
    });
  }
  return <Tela>
      <Texto titulo>{id ? 'Editar medicamento' : 'Cadastrar medicamento'}</Texto>
      <Estado erro={erro} carregando={carregando} atualizar={() => setTentativa(valor => valor + 1)} />
      {!carregando && !erro && <>
        <Card>
          <Campo rotulo="Nome do medicamento" value={dados.nome} onChangeText={valor => alterar('nome', valor)} placeholder="Nome escrito na embalagem" maxLength={200} editable={!ocupado} />
          <Campo rotulo="Especificação do remédio" value={dados.dosagem} onChangeText={valor => alterar('dosagem', valor)} placeholder="Ex.: 500 mg ou 20 mg/mL" maxLength={200} editable={!ocupado} />
          <Texto pequeno>Copie a informação da embalagem. A quantidade por tomada é definida na Agenda.</Texto>
        </Card>
        <Card>
          <Texto titulo>Estoque</Texto>
          <Texto>Como deseja informar a quantidade?</Texto>
          <Opcoes itens={FORMAS} selecionado={forma} onChange={escolherForma} disabled={ocupado} />
          {forma === 'embalagens' ? <>
            <Texto pequeno>Use esta opção para embalagens completas com a mesma quantidade em cada uma.</Texto>
            <Texto style={estilos.rotuloEmbalagem}>Como ele vem embalado?</Texto>
            <Opcoes itens={EMBALAGENS} selecionado={embalagem} onChange={escolherEmbalagem} disabled={ocupado} />
          </> : <Texto pequeno>Informe o que ainda resta. Esta opção também serve para caixas e frascos já abertos.</Texto>}
          {!!dados.unidade_estoque && !conteudoSelecionado && <Texto pequeno>
            Estoque anterior: {quantidade(dados.quantidade_estoque, dados.unidade_estoque)}. Escolha o conteúdo abaixo e informe os valores na nova medida.
          </Texto>}
          <Texto style={estilos.rotuloConteudo}>{forma === 'embalagens' ? 'O que vem dentro?' : 'O que você está contando?'}</Texto>
          <Opcoes itens={conteudosDisponiveis} selecionado={dados.unidade_estoque} onChange={escolherConteudo} disabled={ocupado} />
          {forma === 'embalagens' && embalagemSelecionada && conteudoSelecionado && <>
            <Campo rotulo={embalagemSelecionada.pergunta} value={numeroEmbalagens} onChangeText={setNumeroEmbalagens} placeholder="Ex.: 2" keyboardType="number-pad" maxLength={9} editable={!ocupado} />
            <Campo rotulo={`Quantos ${conteudoSelecionado.plural} há em cada ${embalagemSelecionada.valor}?`} value={conteudoEmbalagem} onChangeText={setConteudoEmbalagem} placeholder={dados.unidade_estoque === 'mL' ? 'Ex.: 100' : 'Ex.: 20'} keyboardType={dados.unidade_estoque === 'mL' ? 'decimal-pad' : 'number-pad'} maxLength={13} editable={!ocupado} />
            {embalagem === 'caixa' && <Texto pequeno>Conte todo o conteúdo de uma caixa, incluindo todas as cartelas ou frascos que vêm dentro dela.</Texto>}
          </>}
          {forma === 'total' && conteudoSelecionado && <Campo rotulo={`Quantos ${conteudoSelecionado.plural} restam?`} value={dados.quantidade_estoque} onChangeText={valor => alterar('quantidade_estoque', valor)} placeholder={dados.unidade_estoque === 'mL' ? 'Ex.: 75,5' : 'Ex.: 15'} keyboardType={dados.unidade_estoque === 'mL' ? 'decimal-pad' : 'number-pad'} maxLength={13} editable={!ocupado} />}
          {conteudoSelecionado && total !== null && <Texto style={estilos.totalEstoque}>
            Estoque total: {quantidade(total, dados.unidade_estoque)}
          </Texto>}
          {conteudoSelecionado && <Campo rotulo={`Avisar quando restarem até (${conteudoSelecionado.plural})`} value={dados.limite_alerta} onChangeText={valor => alterar('limite_alerta', valor)} placeholder="Ex.: 5" keyboardType={dados.unidade_estoque === 'mL' ? 'decimal-pad' : 'number-pad'} maxLength={13} editable={!ocupado} />}
        </Card>
        <Card>
          <Campo rotulo="Validade (opcional)" value={dados.validade} onChangeText={valor => alterar('validade', valor)} placeholder="DD/MM/AAAA" keyboardType="number-pad" maxLength={10} editable={!ocupado} />
        </Card>
        <Botao titulo={ocupado ? 'Salvando...' : 'Salvar medicamento'} onPress={salvar} disabled={ocupado} />
      </>}
    </Tela>;
}
