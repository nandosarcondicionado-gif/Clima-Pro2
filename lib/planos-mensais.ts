import { createClient } from "@/lib/supabase/client";

export type PlanCheckResult = {
  hasPlan: boolean;
  eligible: boolean;
  planId: string | null;
  planNumber: string;
  planStatus: string;
  paymentStatus: "Em dia" | "Em atraso" | "Sem carnê";
  serviceIncluded: boolean;
  includedService: string;
  warning: string;
  reason: string;
};

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getServiceText(item: unknown): string {
  if (typeof item === "string") {
    return item;
  }

  if (item && typeof item === "object") {
    const data = item as Record<string, unknown>;

    return [
      data.nome,
      data.servico,
      data.descricao,
      data.name,
      data.title,
    ]
      .filter(Boolean)
      .join(" ");
  }

  return "";
}

function isServiceIncluded(
  requestedService: string,
  includedServices: unknown[]
): {
  included: boolean;
  matchedService: string;
} {
  const target = normalizeText(requestedService);

  if (!target) {
    return {
      included: false,
      matchedService: "",
    };
  }

  for (const item of includedServices) {
    const originalText = getServiceText(item);
    const normalized = normalizeText(originalText);

    if (!normalized) {
      continue;
    }

    if (
      target === normalized ||
      target.includes(normalized) ||
      normalized.includes(target)
    ) {
      return {
        included: true,
        matchedService: originalText,
      };
    }
  }

  return {
    included: false,
    matchedService: "",
  };
}

function todayISO(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function checkMonthlyPlanEligibility(
  clientId: string,
  requestedService: string
): Promise<PlanCheckResult> {
  const supabase = createClient();

  const emptyResult: PlanCheckResult = {
    hasPlan: false,
    eligible: false,
    planId: null,
    planNumber: "",
    planStatus: "",
    paymentStatus: "Sem carnê",
    serviceIncluded: false,
    includedService: "",
    warning: "",
    reason: "",
  };

  if (!clientId) {
    return {
      ...emptyResult,
      reason: "Cliente não informado.",
    };
  }

  /*
   * 1. Procura o plano mensal ativo do cliente.
   */
  const { data: plan, error: planError } = await supabase
    .from("planos_mensais")
    .select("*")
    .eq("cliente_id", clientId)
    .eq("status", "Ativo")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (planError) {
    console.error(
      "Erro ao consultar plano mensal:",
      planError
    );

    return {
      ...emptyResult,
      reason: "Não foi possível consultar o plano mensal.",
    };
  }

  /*
   * 2. Cliente não possui plano ativo.
   */
  if (!plan) {
    return {
      ...emptyResult,
      reason: "Cliente sem plano mensal ativo.",
    };
  }

  /*
   * 3. Busca o carnê do plano.
   */
  const { data: installments, error: installmentsError } =
    await supabase
      .from("parcelas_planos")
      .select(
        "id, numero_parcela, competencia, vencimento, valor, status, pago_em"
      )
      .eq("plano_id", plan.id)
      .neq("status", "Cancelada")
      .order("vencimento", { ascending: true });

  if (installmentsError) {
    console.error(
      "Erro ao consultar carnê do plano:",
      installmentsError
    );

    return {
      ...emptyResult,
      hasPlan: true,
      planId: plan.id,
      planNumber: plan.numero ?? "",
      planStatus: plan.status ?? "Ativo",
      reason: "Não foi possível consultar o carnê do plano.",
    };
  }

  const today = todayISO();

  /*
   * 4. Verifica se existe alguma parcela vencida
   *    e ainda não paga.
   */
  const overdueInstallments = (installments ?? []).filter(
    (item) => {
      const status = String(item.status ?? "");

      return (
        status !== "Paga" &&
        item.vencimento &&
        String(item.vencimento) < today
      );
    }
  );

  let paymentStatus: PlanCheckResult["paymentStatus"];

  if (!installments || installments.length === 0) {
    paymentStatus = "Sem carnê";
  } else if (overdueInstallments.length > 0) {
    paymentStatus = "Em atraso";
  } else {
    paymentStatus = "Em dia";
  }

  /*
   * 5. Verifica se o serviço solicitado está incluído.
   */
  const includedServices = Array.isArray(plan.servicos_inclusos)
    ? plan.servicos_inclusos
    : [];

  const serviceCheck = isServiceIncluded(
    requestedService,
    includedServices
  );

  /*
   * 6. Regras automáticas:
   *
   * Plano ativo + carnê em dia + serviço incluído
   * = serviço coberto pelo plano.
   *
   * Qualquer outra situação
   * = serviço não coberto.
   */
  if (paymentStatus === "Em atraso") {
    return {
      hasPlan: true,
      eligible: false,
      planId: plan.id,
      planNumber: plan.numero ?? "",
      planStatus: plan.status ?? "Ativo",
      paymentStatus,
      serviceIncluded: serviceCheck.included,
      includedService: serviceCheck.matchedService,
      warning: "Cliente em atraso — notificar responsável",
      reason:
        "O cliente possui plano mensal, porém existem parcelas vencidas em aberto.",
    };
  }

  if (paymentStatus === "Sem carnê") {
    return {
      hasPlan: true,
      eligible: false,
      planId: plan.id,
      planNumber: plan.numero ?? "",
      planStatus: plan.status ?? "Ativo",
      paymentStatus,
      serviceIncluded: serviceCheck.included,
      includedService: serviceCheck.matchedService,
      warning:
        "Plano ativo sem parcelas no carnê — verificar responsável",
      reason:
        "O plano está ativo, mas ainda não possui parcelas registradas no carnê.",
    };
  }

  if (!serviceCheck.included) {
    return {
      hasPlan: true,
      eligible: false,
      planId: plan.id,
      planNumber: plan.numero ?? "",
      planStatus: plan.status ?? "Ativo",
      paymentStatus,
      serviceIncluded: false,
      includedService: "",
      warning: "",
      reason:
        "Serviço solicitado não está incluído no plano mensal.",
    };
  }

  /*
   * 7. Cliente está em dia e o serviço está coberto.
   */
  return {
    hasPlan: true,
    eligible: true,
    planId: plan.id,
    planNumber: plan.numero ?? "",
    planStatus: plan.status ?? "Ativo",
    paymentStatus,
    serviceIncluded: true,
    includedService: serviceCheck.matchedService,
    warning: "",
    reason:
      "Serviço incluído no plano mensal e cliente está em dia com o carnê.",
  };
}
