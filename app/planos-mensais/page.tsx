"use client";

import {
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Edit3,
  FileText,
  History,
  MessageCircle,
  Plus,
  Receipt,
  Search,
  Trash2,
  User,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type PlanType = "Residencial" | "Empresarial";

type PlanStatus =
  | "Ativo"
  | "Em atraso"
  | "Pausado"
  | "Cancelado";

type InstallmentStatus =
  | "Pendente"
  | "Pago"
  | "Atrasado"
  | "Cancelado";

type Client = {
  id: string;
  name: string;
  type: string;
  document: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  zipCode: string;
  status: string;
};

type Installment = {
  id: string;
  planId: string;
  number: number;
  reference: string;
  dueDate: string;
  value: number;
  status: InstallmentStatus;
  paidAt: string | null;
  paymentMethod: string;
  notes: string;
};

type Plan = {
  id: string;
  number: string;

  clientId: string;
  clientName: string;

  type: PlanType;

  document: string;
  phone: string;
  whatsapp: string;
  email: string;

  address: string;
  addressNumber: string;
  complement: string;
  neighborhood: string;
  city: string;
  zipCode: string;

  equipmentQuantity: number;
  equipmentList: string[];

  includedServices: string[];
  excludedServices: string[];

  frequency: string;

  monthlyValue: number;
  dueDay: number;

  materialsSeparate: boolean;

  startDate: string;
  renewalDate: string;

  paymentMethod: string;

  status: PlanStatus;

  notes: string;

  createdAt: string;
};

const INCLUDED_SERVICES = [
  "Manutenção preventiva",
  "Higienização",
  "Limpeza de filtros",
  "Inspeção geral",
  "Verificação elétrica",
  "Verificação de dreno",
  "Teste de funcionamento",
  "Relatório técnico",
];

const EXCLUDED_SERVICES = [
  "Instalação",
  "Desinstalação",
  "Troca de compressor",
  "Troca de peças",
  "Materiais",
  "Serviços fora do escopo contratado",
];

const emptyForm = {
  clientId: "",
  clientName: "",
  type: "Residencial" as PlanType,

  document: "",
  phone: "",
  whatsapp: "",
  email: "",

  address: "",
  addressNumber: "",
  complement: "",
  neighborhood: "",
  city: "",
  zipCode: "",

  equipmentQuantity: "1",
  equipmentText: "",

  includedServices: ["Manutenção preventiva"],
  excludedServices: ["Instalação", "Troca de peças", "Materiais"],

  frequency: "Mensal",

  monthlyValue: "",
  dueDay: "10",

  materialsSeparate: true,

  startDate: new Date().toISOString().slice(0, 10),
  renewalDate: "",

  paymentMethod: "PIX",

  status: "Ativo" as PlanStatus,

  notes: "",
};

function money(value: number) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function parseMoney(value: string) {
  const cleaned = String(value || "")
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : 0;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Não informado";

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("pt-BR");
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("pt-BR");
}

function monthName(date: Date) {
  return date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

function normalizePhone(phone: string) {
  return String(phone || "").replace(/\D/g, "");
}

function statusClass(status: string) {
  if (status === "Ativo" || status === "Pago") {
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }

  if (status === "Em atraso" || status === "Atrasado") {
    return "bg-red-500/10 text-red-400 border-red-500/20";
  }

  if (status === "Pausado" || status === "Pendente") {
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }

  return "bg-slate-700/30 text-slate-400 border-slate-700";
}

export default function PlanosMensaisPage() {
  const supabase = createClient();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [installments, setInstallments] = useState<
    Record<string, Installment[]>
  >({});

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"Todos" | PlanStatus>("Todos");

  const [typeFilter, setTypeFilter] =
    useState<"Todos" | PlanType>("Todos");

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [selectedPlan, setSelectedPlan] =
    useState<Plan | null>(null);

  const [expandedPlan, setExpandedPlan] =
    useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const [
      plansResult,
      clientsResult,
      installmentsResult,
    ] = await Promise.all([
      supabase
        .from("planos_mensais")
        .select("*")
        .order("created_at", { ascending: false }),

      supabase
        .from("clientes")
        .select("*")
        .order("created_at", { ascending: false }),

      supabase
        .from("planos_mensais_parcelas")
        .select("*")
        .order("vencimento", { ascending: true }),
    ]);

    if (plansResult.error) {
      console.error(
        "Erro ao carregar planos:",
        plansResult.error
      );
      alert(
        "Não foi possível carregar os planos mensais."
      );
    }

    if (clientsResult.error) {
      console.error(
        "Erro ao carregar clientes:",
        clientsResult.error
      );
    }

    if (installmentsResult.error) {
      console.error(
        "Erro ao carregar carnês:",
        installmentsResult.error
      );
    }

    const formattedClients: Client[] = (
      clientsResult.data ?? []
    ).map((client: any) => ({
      id: String(client.id),
      name: client.nome ?? "",
      type: client.tipo ?? "",
      document: client.documento ?? "",
      phone: client.telefone ?? "",
      whatsapp: client.whatsapp ?? "",
      email: client.email ?? "",
      address: client.endereco ?? "",
      number: client.numero ?? "",
      complement: client.complemento ?? "",
      neighborhood: client.bairro ?? "",
      city: client.cidade ?? "",
      zipCode: client.cep ?? "",
      status: client.status ?? "Ativo",
    }));

    const formattedPlans: Plan[] = (
      plansResult.data ?? []
    ).map((item: any) => ({
      id: String(item.id),
      number: item.numero ?? "",

      clientId: item.cliente_id ?? "",
      clientName: item.cliente_nome ?? "",

      type:
        item.tipo_cliente === "Empresarial"
          ? "Empresarial"
          : "Residencial",

      document: item.cpf_cnpj ?? "",
      phone: item.telefone ?? "",
      whatsapp: item.whatsapp ?? "",
      email: item.email ?? "",

      address: item.endereco ?? "",
      addressNumber: item.numero_endereco ?? "",
      complement: item.complemento ?? "",
      neighborhood: item.bairro ?? "",
      city: item.cidade ?? "",
      zipCode: item.cep ?? "",

      equipmentQuantity: Number(
        item.quantidade_equipamentos ?? 1
      ),

      equipmentList: Array.isArray(item.equipamentos)
        ? item.equipamentos
        : [],

      includedServices: Array.isArray(
        item.servicos_inclusos
      )
        ? item.servicos_inclusos
        : [],

      excludedServices: Array.isArray(
        item.servicos_nao_inclusos
      )
        ? item.servicos_nao_inclusos
        : [],

      frequency: item.frequencia ?? "Mensal",

      monthlyValue: Number(item.valor_mensal ?? 0),

      dueDay: Number(item.dia_vencimento ?? 10),

      materialsSeparate:
        item.materiais_a_parte ?? true,

      startDate: item.data_inicio ?? "",

      renewalDate: item.data_renovacao ?? "",

      paymentMethod:
        item.forma_pagamento ?? "PIX",

      status: item.status ?? "Ativo",

      notes: item.observacoes ?? "",

      createdAt: item.created_at ?? "",
    }));

    const formattedInstallments: Record<
      string,
      Installment[]
    > = {};

    (
      installmentsResult.data ?? []
    ).forEach((item: any) => {
      const planId = String(item.plano_id);

      if (!formattedInstallments[planId]) {
        formattedInstallments[planId] = [];
      }

      formattedInstallments[planId].push({
        id: String(item.id),
        planId,
        number: Number(item.numero_parcela ?? 0),
        reference: item.referencia ?? "",
        dueDate: item.vencimento ?? "",
        value: Number(item.valor ?? 0),
        status: item.status ?? "Pendente",
        paidAt: item.pago_em ?? null,
        paymentMethod: item.forma_pagamento ?? "",
        notes: item.observacoes ?? "",
      });
    });

    setPlans(formattedPlans);
    setClients(formattedClients);
    setInstallments(formattedInstallments);
    setLoading(false);
  }

  const filteredPlans = useMemo(() => {
    const term = search.toLowerCase().trim();

    return plans.filter((plan) => {
      const matchesSearch =
        !term ||
        plan.number.toLowerCase().includes(term) ||
        plan.clientName.toLowerCase().includes(term) ||
        plan.city.toLowerCase().includes(term) ||
        plan.document.toLowerCase().includes(term) ||
        plan.phone.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "Todos" ||
        plan.status === statusFilter;

      const matchesType =
        typeFilter === "Todos" ||
        plan.type === typeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }, [
    plans,
    search,
    statusFilter,
    typeFilter,
  ]);

  const stats = useMemo(() => {
    const active = plans.filter(
      (plan) => plan.status === "Ativo"
    ).length;

    const overdue = plans.filter(
      (plan) => plan.status === "Em atraso"
    ).length;

    const residential = plans.filter(
      (plan) => plan.type === "Residencial"
    ).length;

    const business = plans.filter(
      (plan) => plan.type === "Empresarial"
    ).length;

    const monthlyRevenue = plans
      .filter((plan) => plan.status === "Ativo")
      .reduce(
        (sum, plan) => sum + plan.monthlyValue,
        0
      );

    return {
      total: plans.length,
      active,
      overdue,
      residential,
      business,
      monthlyRevenue,
    };
  }, [plans]);

  function updateField(
    field: keyof typeof form,
    value: any
  ) {
    setForm((old) => ({
      ...old,
      [field]: value,
    }));
  }

  function selectClient(clientId: string) {
    const client = clients.find(
      (item) => item.id === clientId
    );

    if (!client) {
      updateField("clientId", "");
      return;
    }

    setForm((old) => ({
      ...old,

      clientId: client.id,
      clientName: client.name,

      type:
        client.type === "Empresarial"
          ? "Empresarial"
          : "Residencial",

      document: client.document,
      phone: client.phone,
      whatsapp: client.whatsapp,
      email: client.email,

      address: client.address,
      addressNumber: client.number,
      complement: client.complement,
      neighborhood: client.neighborhood,
      city: client.city,
      zipCode: client.zipCode,
    }));
  }

  function toggleIncludedService(
    service: string
  ) {
    setForm((old) => ({
      ...old,

      includedServices:
        old.includedServices.includes(service)
          ? old.includedServices.filter(
              (item) => item !== service
            )
          : [
              ...old.includedServices,
              service,
            ],
    }));
  }

  function toggleExcludedService(
    service: string
  ) {
    setForm((old) => ({
      ...old,

      excludedServices:
        old.excludedServices.includes(service)
          ? old.excludedServices.filter(
              (item) => item !== service
            )
          : [
              ...old.excludedServices,
              service,
            ],
    }));
  }

  function openNewPlan() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      startDate: new Date()
        .toISOString()
        .slice(0, 10),
    });
    setShowForm(true);
  }

  function openEditPlan(plan: Plan) {
    setEditingId(plan.id);

    setForm({
      clientId: plan.clientId,
      clientName: plan.clientName,
      type: plan.type,

      document: plan.document,
      phone: plan.phone,
      whatsapp: plan.whatsapp,
      email: plan.email,

      address: plan.address,
      addressNumber: plan.addressNumber,
      complement: plan.complement,
      neighborhood: plan.neighborhood,
      city: plan.city,
      zipCode: plan.zipCode,

      equipmentQuantity: String(
        plan.equipmentQuantity
      ),

      equipmentText:
        plan.equipmentList.join("\n"),

      includedServices:
        plan.includedServices,

      excludedServices:
        plan.excludedServices,

      frequency: plan.frequency,

      monthlyValue:
        String(plan.monthlyValue),

      dueDay:
        String(plan.dueDay),

      materialsSeparate:
        plan.materialsSeparate,

      startDate:
        plan.startDate,

      renewalDate:
        plan.renewalDate,

      paymentMethod:
        plan.paymentMethod,

      status:
        plan.status,

      notes:
        plan.notes,
    });

    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function generatePlanNumber() {
    let highest = 0;

    plans.forEach((plan) => {
      const match =
        plan.number.match(/(\d+)$/);

      if (match) {
        highest = Math.max(
          highest,
          Number(match[1])
        );
      }
    });

    return `PM-${String(
      highest + 1
    ).padStart(4, "0")}`;
  }

  function generateContractNumber(
    planNumber: string
  ) {
    return `CTR-${planNumber.replace(
      "PM-",
      ""
    )}`;
  }

  async function createInitialInstallments(
    planId: string,
    startDate: string,
    monthlyValue: number,
    dueDay: number
  ) {
    const start = new Date(
      `${startDate}T12:00:00`
    );

    const rows = [];

    for (let i = 0; i < 12; i++) {
      const date = new Date(start);

      date.setMonth(
        date.getMonth() + i
      );

      const year = date.getFullYear();
      const month = date.getMonth();

      const lastDay = new Date(
        year,
        month + 1,
        0
      ).getDate();

      date.setDate(
        Math.min(
          dueDay,
          lastDay
        )
      );

      rows.push({
        plano_id: planId,
        numero_parcela: i + 1,
        referencia: monthName(date),
        vencimento: date
          .toISOString()
          .slice(0, 10),
        valor: monthlyValue,
        status: "Pendente",
        pago_em: null,
        forma_pagamento:
          form.paymentMethod || "PIX",
        observacoes: "",
      });
    }

    const { error } = await supabase
      .from("planos_mensais_parcelas")
      .insert(rows);

    if (error) {
      console.error(
        "Erro ao criar carnê:",
        error
      );

      throw error;
    }
  }

  async function savePlan() {
    if (!form.clientId) {
      alert(
        "Selecione um cliente."
      );
      return;
    }

    if (!form.clientName.trim()) {
      alert(
        "O nome do cliente é obrigatório."
      );
      return;
    }

    const monthlyValue =
      parseMoney(form.monthlyValue);

    if (monthlyValue <= 0) {
      alert(
        "Informe o valor mensal do plano."
      );
      return;
    }

    const dueDay = Math.min(
      31,
      Math.max(
        1,
        Number(form.dueDay) || 10
      )
    );

    const equipmentList =
      form.equipmentText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

    const equipmentQuantity =
      Math.max(
        1,
        Number(form.equipmentQuantity) || 1
      );

    setSaving(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from("planos_mensais")
          .update({
            cliente_id:
              form.clientId,
            cliente_nome:
              form.clientName.trim(),

            tipo_cliente:
              form.type,

            cpf_cnpj:
              form.document.trim(),

            telefone:
              form.phone.trim(),

            whatsapp:
              form.whatsapp.trim(),

            email:
              form.email.trim(),

            endereco:
              form.address.trim(),

            numero_endereco:
              form.addressNumber.trim(),

            complemento:
              form.complement.trim(),

            bairro:
              form.neighborhood.trim(),

            cidade:
              form.city.trim(),

            cep:
              form.zipCode.trim(),

            quantidade_equipamentos:
              equipmentQuantity,

            equipamentos:
              equipmentList,

            servicos_inclusos:
              form.includedServices,

            servicos_nao_inclusos:
              form.excludedServices,

            frequencia:
              form.frequency,

            valor_mensal:
              monthlyValue,

            dia_vencimento:
              dueDay,

            materiais_a_parte:
              form.materialsSeparate,

            data_inicio:
              form.startDate || null,

            data_renovacao:
              form.renewalDate || null,

            forma_pagamento:
              form.paymentMethod,

            status:
              form.status,

            observacoes:
              form.notes.trim(),

            updated_at:
              new Date().toISOString(),
          })
          .eq("id", editingId);

        if (error) {
          throw error;
        }

        alert(
          "Plano mensal atualizado com sucesso."
        );
      } else {
        const planNumber =
          generatePlanNumber();

        const { data, error } =
          await supabase
            .from("planos_mensais")
            .insert({
              numero: planNumber,

              cliente_id:
                form.clientId,

              cliente_nome:
                form.clientName.trim(),

              tipo_cliente:
                form.type,

              cpf_cnpj:
                form.document.trim(),

              telefone:
                form.phone.trim(),

              whatsapp:
                form.whatsapp.trim(),

              email:
                form.email.trim(),

              endereco:
                form.address.trim(),

              numero_endereco:
                form.addressNumber.trim(),

              complemento:
                form.complement.trim(),

              bairro:
                form.neighborhood.trim(),

              cidade:
                form.city.trim(),

              cep:
                form.zipCode.trim(),

              quantidade_equipamentos:
                equipmentQuantity,

              equipamentos:
                equipmentList,

              servicos_inclusos:
                form.includedServices,

              servicos_nao_inclusos:
                form.excludedServices,

              frequencia:
                form.frequency,

              valor_mensal:
                monthlyValue,

              dia_vencimento:
                dueDay,

              materiais_a_parte:
                form.materialsSeparate,

              data_inicio:
                form.startDate || null,

              data_renovacao:
                form.renewalDate || null,

              forma_pagamento:
                form.paymentMethod,

              status:
                form.status,

              observacoes:
                form.notes.trim(),
            })
            .select("id")
            .single();

        if (error) {
          throw error;
        }

        if (!data?.id) {
          throw new Error(
            "O plano foi criado, mas o ID não foi retornado."
          );
        }

        await createInitialInstallments(
          String(data.id),
          form.startDate ||
            new Date()
              .toISOString()
              .slice(0, 10),
          monthlyValue,
          dueDay
        );

        await supabase
          .from("contratos_planos_mensais")
          .insert({
            plano_id:
              data.id,

            numero_contrato:
              generateContractNumber(
                planNumber
              ),

            status:
              "Rascunho",

            texto_contrato:
              "",

            assinatura_cliente:
              "",

            assinatura_responsavel:
              "",

            nome_responsavel:
              "Responsável Nando's Ar-Condicionado",

            cargo_responsavel:
              "Responsável Técnico",
          });

        alert(
          `Plano ${planNumber} criado com sucesso.\n\nO carnê de 12 meses e o contrato em rascunho também foram criados.`
        );
      }

      closeForm();
      await loadData();
    } catch (error: any) {
      console.error(
        "Erro ao salvar plano:",
        error
      );

      alert(
        `Não foi possível salvar o plano.\n\n${
          error?.message ||
          "Erro desconhecido."
        }`
      );
    } finally {
      setSaving(false);
    }
  }

  async function deletePlan(
    plan: Plan
  ) {
    const confirmed =
      window.confirm(
        `Excluir o plano ${plan.number} de ${plan.clientName}?\n\nO carnê e o contrato desse plano também serão excluídos.`
      );

    if (!confirmed) return;

    const { error } =
      await supabase
        .from("planos_mensais")
        .delete()
        .eq("id", plan.id);

    if (error) {
      console.error(
        "Erro ao excluir plano:",
        error
      );

      alert(
        "Não foi possível excluir o plano."
      );

      return;
    }

    if (selectedPlan?.id === plan.id) {
      setSelectedPlan(null);
    }

    await loadData();
  }

  async function markInstallmentPaid(
    installment: Installment
  ) {
    const confirmed =
      window.confirm(
        `Confirmar pagamento da parcela ${installment.number}?\n\nValor: ${money(
          installment.value
        )}`
      );

    if (!confirmed) return;

    const { error } =
      await supabase
        .from(
          "planos_mensais_parcelas"
        )
        .update({
          status: "Pago",
          pago_em:
            new Date().toISOString(),
          forma_pagamento:
            installment.paymentMethod ||
            "PIX",
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", installment.id);

    if (error) {
      console.error(
        "Erro ao marcar parcela:",
        error
      );

      alert(
        "Não foi possível confirmar o pagamento."
      );

      return;
    }

    await updatePlanPaymentStatus(
      installment.planId
    );

    await loadData();
  }

  async function markInstallmentPending(
    installment: Installment
  ) {
    const confirmed =
      window.confirm(
        "Voltar esta parcela para Pendente?"
      );

    if (!confirmed) return;

    const { error } =
      await supabase
        .from(
          "planos_mensais_parcelas"
        )
        .update({
          status: "Pendente",
          pago_em: null,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", installment.id);

    if (error) {
      alert(
        "Não foi possível atualizar a parcela."
      );
      return;
    }

    await updatePlanPaymentStatus(
      installment.planId
    );

    await loadData();
  }

  async function updatePlanPaymentStatus(
    planId: string
  ) {
    const { data, error } =
      await supabase
        .from(
          "planos_mensais_parcelas"
        )
        .select(
          "status, vencimento"
        )
        .eq(
          "plano_id",
          planId
        );

    if (error) {
      console.error(error);
      return;
    }

    const today =
      new Date()
        .toISOString()
        .slice(0, 10);

    const hasOverdue = (
      data ?? []
    ).some(
      (item: any) =>
        item.status !== "Pago" &&
        item.status !== "Cancelado" &&
        item.vencimento < today
    );

    const hasPending = (
      data ?? []
    ).some(
      (item: any) =>
        item.status === "Pendente"
    );

    let newStatus: PlanStatus =
      "Ativo";

    if (hasOverdue) {
      newStatus = "Em atraso";
    } else if (!hasPending) {
      newStatus = "Ativo";
    }

    await supabase
      .from("planos_mensais")
      .update({
        status: newStatus,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", planId);
  }

  function getPlanInstallments(
    planId: string
  ) {
    return installments[planId] ?? [];
  }

  function getPaidAmount(
    planId: string
  ) {
    return getPlanInstallments(
      planId
    )
      .filter(
        (item) =>
          item.status === "Pago"
      )
      .reduce(
        (sum, item) =>
          sum + item.value,
        0
      );
  }

  function getPendingAmount(
    planId: string
  ) {
    return getPlanInstallments(
      planId
    )
      .filter(
        (item) =>
          item.status !== "Pago" &&
          item.status !== "Cancelado"
      )
      .reduce(
        (sum, item) =>
          sum + item.value,
        0
      );
  }

  function sendPlanWhatsApp(
    plan: Plan
  ) {
    const phone = normalizePhone(
      plan.whatsapp ||
        plan.phone
    );

    if (!phone) {
      alert(
        "Este cliente não possui telefone/WhatsApp cadastrado."
      );
      return;
    }

    const message = `
*Nando's Ar-Condicionado*
*Plano Mensal ${plan.number}*

Cliente: ${plan.clientName}
Tipo: ${plan.type}
Cidade: ${plan.city}

Valor mensal: ${money(
      plan.monthlyValue
    )}
Vencimento: dia ${
      plan.dueDay
    }
Forma de pagamento: ${
      plan.paymentMethod
    }

Status do plano: ${
      plan.status
    }

Serviços incluídos:
${plan.includedServices
  .map((item) => `• ${item}`)
  .join("\n")}

${
  plan.materialsSeparate
    ? "Peças e materiais são cobrados à parte quando necessários."
    : ""
}

Qualquer dúvida, estamos à disposição.
*Nando's Ar-Condicionado*
`.trim();

    window.open(
      `https://wa.me/55${phone}?text=${encodeURIComponent(
        message
      )}`,
      "_blank"
    );
  }

  function printPlan(
    plan: Plan
  ) {
    const services =
      plan.includedServices
        .map(
          (item) =>
            `<li>${item}</li>`
        )
        .join("");

    const excluded =
      plan.excludedServices
        .map(
          (item) =>
            `<li>${item}</li>`
        )
        .join("");

    const equipment =
      plan.equipmentList.length
        ? plan.equipmentList
            .map(
              (item) =>
                `<li>${item}</li>`
            )
            .join("")
        : `<li>${plan.equipmentQuantity} equipamento(s) cadastrado(s)</li>`;

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Plano ${plan.number}</title>

<style>
body {
  font-family: Arial, sans-serif;
  color: #111827;
  padding: 35px;
  line-height: 1.5;
}

.header {
  border-bottom: 3px solid #0f172a;
  padding-bottom: 15px;
  margin-bottom: 25px;
}

.header h1 {
  margin: 0;
  font-size: 24px;
}

.header p {
  margin: 4px 0;
}

h2 {
  font-size: 17px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
  margin-top: 25px;
}

.box {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

ul {
  margin-top: 6px;
}

.signatures {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 70px;
  margin-top: 80px;
}

.signature {
  text-align: center;
  border-top: 1px solid #111;
  padding-top: 8px;
}

.footer {
  margin-top: 50px;
  font-size: 11px;
  color: #666;
  text-align: center;
}
</style>
</head>

<body>

<div class="header">
  <h1>Nando's Ar-Condicionado</h1>
  <p>Qualidade e confiança em todos os detalhes.</p>
  <p>Plano Mensal ${plan.number}</p>
</div>

<div class="box">
  <div class="grid">
    <div>
      <strong>Cliente</strong><br>
      ${plan.clientName}
    </div>

    <div>
      <strong>Tipo</strong><br>
      ${plan.type}
    </div>

    <div>
      <strong>CPF/CNPJ</strong><br>
      ${plan.document || "Não informado"}
    </div>

    <div>
      <strong>Telefone</strong><br>
      ${plan.phone || "Não informado"}
    </div>

    <div>
      <strong>Cidade</strong><br>
      ${plan.city || "Não informado"}
    </div>

    <div>
      <strong>Status</strong><br>
      ${plan.status}
    </div>
  </div>
</div>

<h2>Endereço</h2>

<div class="box">
  ${plan.address || "Não informado"}
  ${plan.addressNumber ? `, ${plan.addressNumber}` : ""}
  ${plan.complement ? ` - ${plan.complement}` : ""}
  <br>
  ${plan.neighborhood ? `${plan.neighborhood} - ` : ""}
  ${plan.city}
  ${plan.zipCode ? ` - CEP ${plan.zipCode}` : ""}
</div>

<h2>Equipamentos</h2>

<div class="box">
  <p><strong>Quantidade:</strong> ${
    plan.equipmentQuantity
  }</p>

  <ul>
    ${equipment}
  </ul>
</div>

<h2>Serviços incluídos</h2>

<div class="box">
  <ul>
    ${services}
  </ul>
</div>

<h2>Serviços / itens não incluídos</h2>

<div class="box">
  <ul>
    ${excluded}
  </ul>

  ${
    plan.materialsSeparate
      ? "<p><strong>Materiais e peças:</strong> cobrados separadamente quando necessários.</p>"
      : ""
  }
</div>

<h2>Condições do plano</h2>

<div class="box">
  <p>
    <strong>Frequência:</strong>
    ${plan.frequency}
  </p>

  <p>
    <strong>Valor mensal:</strong>
    ${money(plan.monthlyValue)}
  </p>

  <p>
    <strong>Vencimento:</strong>
    Dia ${plan.dueDay} de cada mês
  </p>

  <p>
    <strong>Forma de pagamento:</strong>
    ${plan.paymentMethod}
  </p>

  <p>
    <strong>Início:</strong>
    ${formatDate(plan.startDate)}
  </p>

  ${
    plan.renewalDate
      ? `<p><strong>Renovação:</strong> ${formatDate(
          plan.renewalDate
        )}</p>`
      : ""
  }
</div>

<h2>Observações</h2>

<div class="box">
  ${
    plan.notes ||
    "Nenhuma observação adicional."
  }
</div>

<div class="signatures">

  <div class="signature">
    CONTRATANTE<br>
    ${plan.clientName}
  </div>

  <div class="signature">
    CONTRATADA<br>
    Nando's Ar-Condicionado
  </div>

</div>

<div class="footer">
  Documento gerado pelo sistema ClimaPro.
</div>

<script>
window.onload = function() {
  window.print();
};
</script>

</body>
</html>
`;

    const win =
      window.open(
        "",
        "_blank",
        "width=900,height=700"
      );

    if (!win) {
      alert(
        "O navegador bloqueou a janela de impressão."
      );
      return;
    }

    win.document.write(html);
    win.document.close();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
            Carregando Planos Mensais...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white md:p-6">

      <div className="mx-auto max-w-7xl">

        {/* CABEÇALHO */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500/10 p-3">
                <Receipt className="h-7 w-7 text-cyan-400" />
              </div>

              <div>
                <h1 className="text-2xl font-bold md:text-3xl">
                  Planos Mensais
                </h1>

                <p className="text-sm text-slate-400">
                  Contratos, mensalidades e cobertura automática.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openNewPlan}
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <Plus className="h-5 w-5" />
            Novo plano mensal
          </button>

        </div>

        {/* CARDS */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-3 flex justify-between">
              <span className="text-sm text-slate-400">
                Total
              </span>

              <Receipt className="h-5 w-5 text-cyan-400" />
            </div>

            <p className="text-2xl font-bold">
              {stats.total}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Planos cadastrados
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-3 flex justify-between">
              <span className="text-sm text-slate-400">
                Ativos
              </span>

              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>

            <p className="text-2xl font-bold">
              {stats.active}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Planos ativos
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-3 flex justify-between">
              <span className="text-sm text-slate-400">
                Em atraso
              </span>

              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>

            <p className="text-2xl font-bold">
              {stats.overdue}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Precisam de atenção
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-3 flex justify-between">
              <span className="text-sm text-slate-400">
                Residenciais
              </span>

              <User className="h-5 w-5 text-blue-400" />
            </div>

            <p className="text-2xl font-bold">
              {stats.residential}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Planos residenciais
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-3 flex justify-between">
              <span className="text-sm text-slate-400">
                Receita mensal
              </span>

              <Wallet className="h-5 w-5 text-violet-400" />
            </div>

            <p className="text-xl font-bold">
              {money(
                stats.monthlyRevenue
              )}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Planos ativos
            </p>
          </div>

        </div>

        {/* FILTROS */}
        <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-900 p-4">

          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Buscar cliente, plano, cidade ou documento..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(
                  e.target.value as
                    | "Todos"
                    | PlanType
                )
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none"
            >
              <option value="Todos">
                Todos os tipos
              </option>

              <option value="Residencial">
                Residencial
              </option>

              <option value="Empresarial">
                Empresarial
              </option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as
                    | "Todos"
                    | PlanStatus
                )
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none"
            >
              <option value="Todos">
                Todos os status
              </option>

              <option value="Ativo">
                Ativo
              </option>

              <option value="Em atraso">
                Em atraso
              </option>

              <option value="Pausado">
                Pausado
              </option>

              <option value="Cancelado">
                Cancelado
              </option>
            </select>

          </div>

        </div>

        {/* LISTA */}
        <div className="space-y-4">

          {filteredPlans.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center">

              <Receipt className="mx-auto mb-4 h-10 w-10 text-slate-600" />

              <h2 className="text-lg font-semibold">
                Nenhum plano encontrado
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Crie o primeiro plano mensal para começar.
              </p>

            </div>
          ) : (
            filteredPlans.map(
              (plan) => {
                const planInstallments =
                  getPlanInstallments(
                    plan.id
                  );

                const isExpanded =
                  expandedPlan ===
                  plan.id;

                const paidAmount =
                  getPaidAmount(
                    plan.id
                  );

                const pendingAmount =
                  getPendingAmount(
                    plan.id
                  );

                return (
                  <div
                    key={plan.id}
                    className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"
                  >

                    {/* CABEÇALHO DO PLANO */}
                    <div className="p-5">

                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex items-start gap-4">

                          <div className="rounded-xl bg-cyan-500/10 p-3">
                            {plan.type ===
                            "Empresarial" ? (
                              <Building2 className="h-6 w-6 text-cyan-400" />
                            ) : (
                              <User className="h-6 w-6 text-cyan-400" />
                            )}
                          </div>

                          <div>

                            <div className="flex flex-wrap items-center gap-2">

                              <h2 className="text-lg font-bold">
                                {plan.clientName}
                              </h2>

                              <span
                                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(
                                  plan.status
                                )}`}
                              >
                                {plan.status}
                              </span>

                              <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-400">
                                {plan.type}
                              </span>

                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                              {plan.number} •{" "}
                              {plan.city ||
                                "Cidade não informada"}
                            </p>

                          </div>

                        </div>

                        <div className="text-left lg:text-right">

                          <p className="text-2xl font-bold text-cyan-400">
                            {money(
                              plan.monthlyValue
                            )}
                          </p>

                          <p className="text-xs text-slate-500">
                            mensal • vencimento dia{" "}
                            {plan.dueDay}
                          </p>

                        </div>

                      </div>

                      {/* INFORMAÇÕES */}
                      <div className="mt-5 grid gap-3 md:grid-cols-4">

                        <div className="rounded-xl bg-slate-950 p-3">
                          <p className="text-xs text-slate-500">
                            Equipamentos
                          </p>

                          <p className="mt-1 font-semibold">
                            {
                              plan.equipmentQuantity
                            }
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-950 p-3">
                          <p className="text-xs text-slate-500">
                            Frequência
                          </p>

                          <p className="mt-1 font-semibold">
                            {plan.frequency}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-950 p-3">
                          <p className="text-xs text-slate-500">
                            Recebido
                          </p>

                          <p className="mt-1 font-semibold text-emerald-400">
                            {money(
                              paidAmount
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-950 p-3">
                          <p className="text-xs text-slate-500">
                            Pendente
                          </p>

                          <p className="mt-1 font-semibold text-amber-400">
                            {money(
                              pendingAmount
                            )}
                          </p>
                        </div>

                      </div>

                      {/* SERVIÇOS */}
                      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">

                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Serviços incluídos
                        </p>

                        <div className="flex flex-wrap gap-2">

                          {plan.includedServices.map(
                            (service) => (
                              <span
                                key={service}
                                className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400"
                              >
                                ✓ {service}
                              </span>
                            )
                          )}

                        </div>

                      </div>

                      {/* BOTÕES */}
                      <div className="mt-5 flex flex-wrap gap-2">

                        <button
                          onClick={() =>
                            setSelectedPlan(
                              plan
                            )
                          }
                          className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm hover:bg-slate-800"
                        >
                          <FileText className="h-4 w-4" />
                          Ver plano
                        </button>

                        <button
                          onClick={() =>
                            setExpandedPlan(
                              isExpanded
                                ? null
                                : plan.id
                            )
                          }
                          className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm hover:bg-slate-800"
                        >
                          <Receipt className="h-4 w-4" />

                          Carnê

                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          onClick={() =>
                            printPlan(plan)
                          }
                          className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm hover:bg-slate-800"
                        >
                          <FileText className="h-4 w-4" />
                          Imprimir
                        </button>

                        <button
                          onClick={() =>
                            sendPlanWhatsApp(
                              plan
                            )
                          }
                          className="flex items-center gap-2 rounded-xl border border-emerald-500/30 px-4 py-2.5 text-sm text-emerald-400 hover:bg-emerald-500/10"
                        >
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp
                        </button>

                        <button
                          onClick={() =>
                            openEditPlan(
                              plan
                            )
                          }
                          className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm hover:bg-slate-800"
                        >
                          <Edit3 className="h-4 w-4" />
                          Editar
                        </button>

                        <button
                          onClick={() =>
                            deletePlan(
                              plan
                            )
                          }
                          className="flex items-center gap-2 rounded-xl border border-red-500/20 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </button>

                      </div>

                    </div>

                    {/* CARNÊ */}
                    {isExpanded && (
                      <div className="border-t border-slate-800 bg-slate-950 p-5">

                        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

                          <div>
                            <h3 className="flex items-center gap-2 font-bold">
                              <Receipt className="h-5 w-5 text-cyan-400" />
                              Carnê mensal
                            </h3>

                            <p className="text-sm text-slate-500">
                              Controle das mensalidades do plano.
                            </p>
                          </div>

                          <div className="text-sm text-slate-400">
                            {planInstallments.length} parcelas
                          </div>

                        </div>

                        {planInstallments.length ===
                        0 ? (
                          <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
                            Nenhuma parcela cadastrada.
                          </div>
                        ) : (
                          <div className="space-y-2">

                            {planInstallments.map(
                              (installment) => (
                                <div
                                  key={
                                    installment.id
                                  }
                                  className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 md:flex-row md:items-center md:justify-between"
                                >

                                  <div>
                                    <p className="font-semibold">
                                      {installment.number}ª parcela
                                    </p>

                                    <p className="text-sm capitalize text-slate-500">
                                      {installment.reference}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-sm text-slate-400">
                                      Vencimento
                                    </p>

                                    <p className="font-semibold">
                                      {formatDate(
                                        installment.dueDate
                                      )}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-sm text-slate-400">
                                      Valor
                                    </p>

                                    <p className="font-semibold">
                                      {money(
                                        installment.value
                                      )}
                                    </p>
                                  </div>

                                  <div>

                                    <span
                                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                                        installment.status
                                      )}`}
                                    >
                                      {installment.status}
                                    </span>

                                    {installment.paidAt && (
                                      <p className="mt-1 text-xs text-slate-500">
                                        Pago em{" "}
                                        {formatDateTime(
                                          installment.paidAt
                                        )}
                                      </p>
                                    )}

                                  </div>

                                  <div>

                                    {installment.status ===
                                    "Pago" ? (
                                      <button
                                        onClick={() =>
                                          markInstallmentPending(
                                            installment
                                          )
                                        }
                                        className="rounded-xl border border-slate-700 px-3 py-2 text-xs hover:bg-slate-800"
                                      >
                                        Voltar para pendente
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() =>
                                          markInstallmentPaid(
                                            installment
                                          )
                                        }
                                        className="flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
                                      >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Marcar como pago
                                      </button>
                                    )}

                                  </div>

                                </div>
                              )
                            )}

                          </div>
                        )}

                      </div>
                    )}

                  </div>
                );
              }
            )
          )}

        </div>

      </div>

      {/* MODAL NOVO / EDITAR */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4">

          <div className="mx-auto my-6 max-w-5xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900 p-5">

              <div>
                <h2 className="text-xl font-bold">
                  {editingId
                    ? "Editar plano mensal"
                    : "Novo plano mensal"}
                </h2>

                <p className="text-sm text-slate-500">
                  Cadastre o plano, cobertura e condições.
                </p>
              </div>

              <button
                onClick={closeForm}
                className="rounded-xl p-2 hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <div className="space-y-6 p-5">

              {/* CLIENTE */}
              <section>

                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <User className="h-5 w-5 text-cyan-400" />
                  Cliente
                </h3>

                <div className="grid gap-4 md:grid-cols-2">

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm text-slate-400">
                      Cliente *
                    </label>

                    <select
                      value={form.clientId}
                      onChange={(e) =>
                        selectClient(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                    >
                      <option value="">
                        Selecione um cliente
                      </option>

                      {clients
                        .filter(
                          (client) =>
                            client.status !==
                            "Inativo"
                        )
                        .map((client) => (
                          <option
                            key={client.id}
                            value={client.id}
                          >
                            {client.name} —{" "}
                            {client.type}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-400">
                      Tipo do plano
                    </label>

                    <select
                      value={form.type}
                      onChange={(e) =>
                        updateField(
                          "type",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                    >
                      <option value="Residencial">
                        Residencial
                      </option>

                      <option value="Empresarial">
                        Empresarial
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-400">
                      CPF / CNPJ
                    </label>

                    <input
                      value={form.document}
                      onChange={(e) =>
                        updateField(
                          "document",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-400">
                      Telefone
                    </label>

                    <input
                      value={form.phone}
                      onChange={(e) =>
                        updateField(
                          "phone",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-400">
                      WhatsApp
                    </label>

                    <input
                      value={form.whatsapp}
                      onChange={(e) =>
                        updateField(
                          "whatsapp",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm text-slate-400">
                      E-mail
                    </label>

                    <input
                      value={form.email}
                      onChange={(e) =>
                        updateField(
                          "email",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                    />
                  </div>

                </div>

              </section>

              {/* ENDEREÇO */}
              <section>

                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <Building2 className="h-5 w-5 text-cyan-400" />
                  Endereço do atendimento
                </h3>

                <div className="grid gap-4 md:grid-cols-2">

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm text-slate-400">
                      Endereço
                    </label>

                    <input
                      value={form.address}
                      onChange={(e) =>
                        updateField(
                          "address",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-400">
                      Número
                    </label>

                    <input
                      value={form.addressNumber}
                      onChange={(e) =>
                        updateField(
                          "addressNumber",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-400">
                      Complemento
                    </label>

                    <input
                      value={form.complement}
                      onChange={(e) =>
                        updateField(
                          "complement",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-400">
                      Bairro
                    </label>

                    <input
                      value={form.neighborhood}
                      onChange={(e) =>
                        updateField(
                          "neighborhood",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-400">
                      Cidade
                    </label>

                    <input
                      value={form.city}
                      onChange={(e) =>
                        updateField(
                          "city",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-400">
                      CEP
                    </label>

                    <input
                      value={form.zipCode}
                      onChange={(e) =>
                        updateField(
                          "zipCode",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                    />
                  </div>

                </div>

              </section>

              {/* EQUIPAMENTOS */}
              <section>

                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <History className="h-5 w-5 text-cyan-400" />
                  Equipamentos do plano
                </h3>

                <div className="grid gap-4 md:grid-cols-3">

                  <div>
                    <label className="mb-1 block text-sm text-slate-400">
                      Quantidade de equipamentos
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={
                        form.equipmentQuantity
                      }
                      onChange={(e) =>
                        updateField(
                          "equipmentQuantity",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm text-slate-400">
                      Equipamentos — um por linha
                    </label>

                    <textarea
                      rows={4}
                      value={
                        form.equipmentText
                      }
                      onChange={(e) =>
                        updateField(
                          "equipmentText",
                          e.target.value
                        )
                      }
                      placeholder={`Exemplo:
Split Samsung 12.000 BTUs — Sala
Split Fujitsu 18.000 BTUs — Quarto`}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                    />
                  </div>

                </div>

              </section>

              {/* SERVIÇOS */}
              <section>

                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <ClipboardList className="h-5 w-5 text-cyan-400" />
                  Serviços cobertos pelo plano
                </h3>

                <div className="grid gap-2 md:grid-cols-2">

                  {INCLUDED_SERVICES.map(
                    (service) => (
                      <label
                        key={service}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 hover:border-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={form.includedServices.includes(
                            service
                          )}
                          onChange={() =>
                            toggleIncludedService(
                              service
                            )
                          }
                          className="h-4 w-4"
                        />

                        <span className="text-sm">
                          {service}
                        </span>
                      </label>
                    )
                  )}

                </div>

              </section>

              {/* NÃO INCLUSOS */}
              <section>

                <h3 className="mb-3 font-semibold">
                  Serviços e itens não incluídos
                </h3>

                <div className="grid gap-2 md:grid-cols-2">

                  {EXCLUDED_SERVICES.map(
                    (service) => (
                      <label
                        key={service}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 hover:border-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={form.excludedServices.includes(
                            service
                          )}
                          onChange={() =>
                            toggleExcludedService(
                              service
                            )
                          }
                          className="h-4 w-4"
                        />

                        <span className="text-sm">
                          {service}
                        </span>
                      </label>
                    )
                  )}

                </div>

              </section>

              {/* CONDIÇÕES */}
              <section>

                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <Wallet className="h-5 w-5 text-cyan-400" />
                  Condições financeiras
                </h3>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                  <div>
                    <label className="mb-1 block text-sm text-slate-400">
                      Valor mensal *
                    </label>

                    <input
                      value={
                        form.monthlyValue
                      }
                      onChange={(e) =>
                        updateField(
                          "monthlyValue",
                          e.target.value
                        )
                      }
                      placeholder="250,00"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-400">
                      Dia do vencimento
                    </label>

                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={form.dueDay}
                      onChange={(e) =>
                        updateField(
                          "dueDay",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-400">
                      Frequência
                    </label>

                    <select
                      value={
                        form.frequency
                      }
                      onChange={(e) =>
                        updateField(
                          "frequency",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                    >
                      <option>
                        Mensal
                      </option>

                      <option>
                        Bimestral
                      </option>

                      <option>
                        Trimestral
                      </option>

                      <option>
                        Semestral
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-400">
                      Forma de pagamento
                    </label>

                    <select
                      value={
                        form.paymentMethod
                      }
                      onChange={(e) =>
                        updateField(
                          "paymentMethod",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                    >
                      <option>
                        PIX
                      </option>

                      <option>
                        Dinheiro
                      </option>

                      <option>
                        Cartão
                      </option>

                      <option>
                        Transferência
                      </option>

                      <option>
                        Outro
                      </option>
                    </select>
                  </div>

                </div>

                <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">

                  <input
                    type="checkbox"
                    checked={
                      form.materialsSeparate
                    }
                    onChange={(e) =>
                      updateField(
                        "materialsSeparate",
                        e.target.checked
                      )
                    }
                    className="h-5 w-5"
                  />

                  <div>
                    <p className="font-semibold">
                      Materiais e peças cobrados à parte
                    </p>

                    <p className="text-sm text-slate-500">
                      O plano cobre a mão de obra prevista, mas peças e materiais poderão ser cobrados separadamente.
                    </p>
                  </div>

                </label>

              </section>

              {/* DATAS */}
              <section>

                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <CalendarDays className="h-5 w-5 text-cyan-400" />
                  Vigência
                </h3>

                <div className="grid gap-4 md:grid-cols-3">

                  <div>
                    <label className="mb-1 block text-sm text-slate-400">
                      Início
                    </label>

                    <input
                      type="date"
                      value={
                        form.startDate
                      }
                      onChange={(e) =>
                        updateField(
                          "startDate",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-400">
                      Renovação
                    </label>

                    <input
                      type="date"
                      value={
                        form.renewalDate
                      }
                      onChange={(e) =>
                        updateField(
                          "renewalDate",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-400">
                      Status
                    </label>

                    <select
                      value={
                        form.status
                      }
                      onChange={(e) =>
                        updateField(
                          "status",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                    >
                      <option value="Ativo">
                        Ativo
                      </option>

                      <option value="Pausado">
                        Pausado
                      </option>

                      <option value="Cancelado">
                        Cancelado
                      </option>

                      <option value="Em atraso">
                        Em atraso
                      </option>
                    </select>
                  </div>

                </div>

              </section>

              {/* OBSERVAÇÕES */}
              <section>

                <label className="mb-1 block text-sm text-slate-400">
                  Observações
                </label>

                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(e) =>
                    updateField(
                      "notes",
                      e.target.value
                    )
                  }
                  placeholder="Informações adicionais do plano..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                />

              </section>

            </div>

            {/* RODAPÉ */}
            <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-slate-800 bg-slate-900 p-5">

              <button
                onClick={closeForm}
                className="rounded-xl border border-slate-700 px-5 py-3 text-sm hover:bg-slate-800"
              >
                Cancelar
              </button>

              <button
                onClick={savePlan}
                disabled={saving}
                className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
              >
                {saving
                  ? "Salvando..."
                  : editingId
                  ? "Salvar alterações"
                  : "Criar plano mensal"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* MODAL DETALHES */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4">

          <div className="mx-auto my-6 max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-800 p-5">

              <div>
                <p className="text-sm text-cyan-400">
                  {selectedPlan.number}
                </p>

                <h2 className="text-xl font-bold">
                  {selectedPlan.clientName}
                </h2>

                <p className="text-sm text-slate-500">
                  Plano {selectedPlan.type}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedPlan(null)
                }
                className="rounded-xl p-2 hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <div className="space-y-5 p-5">

              <div className="grid gap-3 md:grid-cols-3">

                <div className="rounded-xl bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">
                    Valor mensal
                  </p>

                  <p className="mt-1 text-xl font-bold text-cyan-400">
                    {money(
                      selectedPlan.monthlyValue
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">
                    Vencimento
                  </p>

                  <p className="mt-1 font-semibold">
                    Dia{" "}
                    {
                      selectedPlan.dueDay
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">
                    Status
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                      selectedPlan.status
                    )}`}
                  >
                    {
                      selectedPlan.status
                    }
                  </span>
                </div>

              </div>

              <div className="rounded-xl bg-slate-950 p-4">

                <h3 className="mb-3 font-semibold">
                  Dados do cliente
                </h3>

                <div className="grid gap-3 md:grid-cols-2">

                  <p>
                    <span className="text-slate-500">
                      CPF/CNPJ:
                    </span>{" "}
                    {
                      selectedPlan.document ||
                      "Não informado"
                    }
                  </p>

                  <p>
                    <span className="text-slate-500">
                      WhatsApp:
                    </span>{" "}
                    {
                      selectedPlan.whatsapp ||
                      selectedPlan.phone ||
                      "Não informado"
                    }
                  </p>

                  <p>
                    <span className="text-slate-500">
                      E-mail:
                    </span>{" "}
                    {
                      selectedPlan.email ||
                      "Não informado"
                    }
                  </p>

                  <p>
                    <span className="text-slate-500">
                      Cidade:
                    </span>{" "}
                    {
                      selectedPlan.city ||
                      "Não informado"
                    }
                  </p>

                </div>

              </div>

              <div className="rounded-xl bg-slate-950 p-4">

                <h3 className="mb-3 font-semibold">
                  Equipamentos
                </h3>

                <p className="mb-2 text-sm text-slate-400">
                  Quantidade:{" "}
                  {
                    selectedPlan.equipmentQuantity
                  }
                </p>

                <ul className="space-y-1 text-sm">

                  {selectedPlan.equipmentList.map(
                    (item) => (
                      <li key={item}>
                        • {item}
                      </li>
                    )
                  )}

                </ul>

              </div>

              <div className="grid gap-4 md:grid-cols-2">

                <div className="rounded-xl bg-slate-950 p-4">

                  <h3 className="mb-3 font-semibold text-emerald-400">
                    Serviços incluídos
                  </h3>

                  <ul className="space-y-1 text-sm">

                    {selectedPlan.includedServices.map(
                      (item) => (
                        <li key={item}>
                          ✓ {item}
                        </li>
                      )
                    )}

                  </ul>

                </div>

                <div className="rounded-xl bg-slate-950 p-4">

                  <h3 className="mb-3 font-semibold text-red-400">
                    Não incluídos
                  </h3>

                  <ul className="space-y-1 text-sm">

                    {selectedPlan.excludedServices.map(
                      (item) => (
                        <li key={item}>
                          • {item}
                        </li>
                      )
                    )}

                  </ul>

                </div>

              </div>

              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">

                <p className="text-sm">
                  <strong>
                    Regra do plano:
                  </strong>{" "}
                  quando a mensalidade estiver em dia e o serviço estiver listado como incluído, o ClimaPro poderá reconhecer automaticamente o atendimento como coberto pelo plano quando fizermos a integração com as Ordens de Serviço.
                </p>

              </div>

            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-800 p-5">

              <button
                onClick={() =>
                  printPlan(
                    selectedPlan
                  )
                }
                className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm hover:bg-slate-800"
              >
                <FileText className="h-4 w-4" />
                Imprimir
              </button>

              <button
                onClick={() =>
                  sendPlanWhatsApp(
                    selectedPlan
                  )
                }
                className="flex items-center gap-2 rounded-xl border border-emerald-500/30 px-4 py-2.5 text-sm text-emerald-400 hover:bg-emerald-500/10"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </button>

              <button
                onClick={() => {
                  openEditPlan(
                    selectedPlan
                  );
                  setSelectedPlan(
                    null
                  );
                }}
                className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm hover:bg-slate-800"
              >
                <Edit3 className="h-4 w-4" />
                Editar
              </button>

              <button
                onClick={() =>
                  setSelectedPlan(null)
                }
                className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
              >
                Fechar
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}
