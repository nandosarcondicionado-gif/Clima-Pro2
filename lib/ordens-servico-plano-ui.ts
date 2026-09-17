export type PlanoOSStatus =
  | "Sem plano"
  | "Em dia"
  | "Em atraso"
  | "Sem carnê";

export type PlanoOSInfo = {
  status: PlanoOSStatus;
  coberto: boolean;
  aviso: string;
  servico: string;
  descricao: string;
};

export function getPlanoOSInfo(data: {
  plano_mensal_status?: string | null;
  plano_mensal_coberto?: boolean | null;
  plano_mensal_aviso?: string | null;
  plano_mensal_servico_incluso?: string | null;
}): PlanoOSInfo {
  const status =
    (data.plano_mensal_status as PlanoOSStatus) ||
    "Sem plano";

  const coberto = Boolean(data.plano_mensal_coberto);

  const aviso = String(
    data.plano_mensal_aviso || ""
  ).trim();

  const servico = String(
    data.plano_mensal_servico_incluso || ""
  ).trim();

  let descricao = "";

  if (coberto) {
    descricao =
      "Serviço coberto pelo plano mensal. Não cobrar o serviço do cliente.";
  } else if (status === "Em atraso") {
    descricao =
      "Cliente em atraso. Notificar o responsável. Serviço deve ser cobrado normalmente.";
  } else if (status === "Sem carnê") {
    descricao =
      "Plano ativo sem carnê. Verificar com o responsável antes de considerar o serviço coberto.";
  } else if (status === "Em dia") {
    descricao =
      "Cliente possui plano mensal em dia, porém este serviço não está incluído no plano.";
  } else {
    descricao =
      "Cliente não possui plano mensal ativo.";
  }

  return {
    status,
    coberto,
    aviso,
    servico,
    descricao,
  };
}

export function getPlanoOSBadgeClass(
  status: PlanoOSStatus,
  coberto: boolean
): string {
  if (coberto) {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (status === "Em atraso") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  if (status === "Sem carnê") {
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }

  if (status === "Em dia") {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }

  return "bg-gray-100 text-gray-700 border-gray-200";
}
