import { createClient } from "@/lib/supabase/client";
import { prepareMonthlyPlanForOS } from "@/lib/planos-mensais-os";

export async function applyMonthlyPlanToServiceOrder(params: {
  clientId: string;
  service: string;
  normalServiceValue: number;
}) {
  const result = await prepareMonthlyPlanForOS(
    params.clientId,
    params.service,
    params.normalServiceValue
  );

  return {
    plano_mensal_id: result.plano_mensal_id,
    plano_mensal_coberto: result.plano_mensal_coberto,
    plano_mensal_status: result.plano_mensal_status,
    plano_mensal_aviso: result.plano_mensal_aviso,
    plano_mensal_servico_incluso:
      result.plano_mensal_servico_incluso,

    valor_servicos: result.valor_servicos,

    /*
     * Se estiver coberto pelo plano:
     * serviço = R$ 0,00.
     *
     * Se não estiver:
     * mantém o preço normal.
     */
    servicoCoberto: result.plano_mensal_coberto,

    avisoTecnico: result.plano_mensal_aviso,

    mensagemPlano: result.plano_mensal_coberto
      ? "Serviço coberto pelo plano mensal."
      : result.plano_mensal_aviso ||
        "Serviço não coberto pelo plano mensal.",
  };
}

export async function registerPlanUse(params: {
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
      "Erro ao registrar utilização do plano:",
      error
    );

    throw new Error(error.message);
  }

  return data;
}
