import { Texto } from './Interface';
import { formatarAtualizacao } from '../services/atualizacaoUtils';

export default function StatusAtualizacao({ atualizadoEm, carregando, erro, fuso }) {
  const horario = formatarAtualizacao(atualizadoEm, fuso);
  if (!horario) return null;
  return <Texto pequeno>
    Última consulta ao servidor: {horario}.
    {carregando ? ' Atualizando…' : erro ? ' A atualização falhou. Tente novamente.' : ''}
  </Texto>;
}
