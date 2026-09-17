import { createClient } from "@/lib/supabase/client";
import { checkMonthlyPlanEligibility } from "@/lib/planos-mensais";

export type MonthlyPlanOSData = {
  plano_mensal_id: string | null;
  plano_mensal_coberto: boolean;
  plano_mensal_status: string;
  plano_mensal_aviso: string;
  plano_mensal_servico_incluso: string;
  valor_servicos: number;
};

export async function prepareMonthlyPlanForOS(
  clientId: string,
  requestedService: string,
  normalServiceValue: number
): Promise<MonthlyPlanOSData> {
  const result = await checkMonthlyPlanEligibility(
    clientId,
    requestedService
  );

  /*
   * Cliente sem plano mensal.
   * A OS segue normalmente com o valor normal.
   */
  if (!result.hasPlan) {
    return {
      plano_mensal_id: null,
      plano_mensal_coberto: false,
      plano_mensal_status: "Sem plano",
      plano_mensal_aviso: "",
      plano_mensal_servico_incluso: "",
      valor_servicos: normalServiceValue,
    };
  }

  /*
   * Plano ativo, cliente em atraso.
   *
   * O técnico recebe o aviso, mas não precisa
   * decidir nada manualmente.
   *
   * O serviço NÃO é considerado coberto.
   */
  if (result.paymentStatus === "Em atraso") {
    return {
      plano_mensal_id: result.planId,
      plano_mensal_coberto: false,
      plano_mensal_status: "Em atraso",
      plano_mensal_aviso:
        "Cliente em atraso — notificar responsável",
      plano_mensal_servico_incluso:
        result.includedService || "",
      valor_servicos: normalServiceValue,
    };
  }

  /*
   * Plano ativo sem carnê.
   */
  if (result.paymentStatus === "Sem carnê") {
    return {
      plano_mensal_id: result.planId,
      plano_mensal_coberto: false,
      plano_mensal_status: "Sem carnê",
      plano_mensal_aviso:
        "Plano ativo sem parcelas no carnê — verificar responsável",
      plano_mensal_servico_incluso:
        result.includedService || "",
      valor_servicos: normalServiceValue,
    };
  }

  /*
   * Cliente em dia, mas o serviço não está incluído.
   *
   * Nesse caso cobra o valor normal.
   */
  if (!result.serviceIncluded) {
    return {
      plano_mensal_id: result.planId,
      plano_mensal_coberto: false,
      plano_mensal_status: "Em dia",
      plano_mensal_aviso: "",
      plano_mensal_servico_incluso: "",
      valor_servicos: normalServiceValue,
    };
  }

  /*
   * PLANO VÁLIDO:
   *
   * Cliente em dia
   * +
   * serviço incluído
   *
   * = serviço coberto pelo plano.
   *
   * O valor do serviço passa para R$ 0,00.
   * Materiais continuam separados.
   */
  return {
    plano_mensal_id: result.planId,
    plano_mensal_coberto: true,
    plano_mensal_status: "Em dia",
    plano_mensal_aviso:
      "Serviço coberto pelo plano mensal",
    plano_mensal_servico_incluso:
      result.includedService || requestedService,
    valor_servicos: 0,
  };
}

/**
 * Registra o uso do plano mensal depois que a OS
 * foi criada.
 */
export async function registerMonthlyPlanUsage(params: {
  planoId: string;
  ordemServicoId: string;
  clientId: string;
  service: string;
  equipment?: string;
  covered: boolean;
  reason?: string;
  notes?: string;
}) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("uso_planos_mensais")
    .insert({
      plano_id: params.planoId,
      ordem_servico_id: params.ordemServicoId,
      cliente_id: params.clientId,
      data_uso: new Date().toISOString().slice(0, 10),
      servico: params.service,
      equipamento: params.equipment || "",
      coberto: params.covered,
      motivo: params.reason || "",
      observacoes: params.notes || "",
    })
    .select()
    .single();

  if (error) {
    console.error(
      "Erro ao registrar uso do plano mensal:",
      error
    );

    throw new Error(
      error.message || "Não foi possível registrar o uso do plano."
    );
  }

  return data;
}
