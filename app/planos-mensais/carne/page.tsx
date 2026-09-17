"use client";

import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Edit3,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Plan = {
  id: string;
  numero: string;
  clienteNome: string;
  valorMensal: number;
  status: string;
};

type Installment = {
  id: string;
  planId: string;
  installmentNumber: number;
  competence: string;
  dueDate: string;
  value: number;
  status: "Aberta" | "Paga" | "Cancelada";
  paidAt: string | null;
  paymentMethod: string;
  notes: string;
};

type InstallmentForm = {
  competence: string;
  dueDate: string;
  value: string;
  status: "Aberta" | "Paga" | "Cancelada";
  paymentMethod: string;
  notes: string;
};

const emptyForm: InstallmentForm = {
  competence: "",
  dueDate: "",
  value: "",
  status: "Aberta",
  paymentMethod: "",
  notes: "",
};

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

function dateBR(value: string | null | undefined) {
  if (!value) return "-";

  const [year, month, day] = value.slice(0, 10).split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeMoney(value: string) {
  const clean = value
    .replace(/\s/g, "")
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".");

  const number = Number(clean);

  return Number.isFinite(number) ? number : 0;
}

function getAutomaticStatus(
  installment: Installment
): "Aberta" | "Paga" | "Cancelada" | "Atrasada" {
  if (installment.status === "Paga") return "Paga";
  if (installment.status === "Cancelada") return "Cancelada";

  if (installment.dueDate < todayISO()) {
    return "Atrasada";
  }

  return "Aberta";
}

export default function CarnePlanosPage() {
  const supabase = createClient();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);

  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<InstallmentForm>(emptyForm);

  async function loadPlans() {
    const { data, error } = await supabase
      .from("planos_mensais")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar planos:", error);
      alert("Não foi possível carregar os planos mensais.");
      return;
    }

    const formatted: Plan[] = (data ?? []).map((item) => ({
      id: item.id,
      numero: item.numero ?? `PLANO-${String(item.id).slice(0, 6)}`,
      clienteNome: item.cliente_nome ?? "Cliente não informado",
      valorMensal: Number(item.valor_mensal ?? 0),
      status: item.status ?? "Ativo",
    }));

    setPlans(formatted);

    if (!selectedPlanId && formatted.length > 0) {
      setSelectedPlanId(formatted[0].id);
    }
  }

  async function loadInstallments(planId?: string) {
    const id = planId ?? selectedPlanId;

    if (!id) {
      setInstallments([]);
      return;
    }

    const { data, error } = await supabase
      .from("parcelas_planos")
      .select("*")
      .eq("plano_id", id)
      .order("numero_parcela", { ascending: true });

    if (error) {
      console.error("Erro ao carregar carnê:", error);
      alert("Não foi possível carregar as parcelas.");
      return;
    }

    const formatted: Installment[] = (data ?? []).map((item) => ({
      id: item.id,
      planId: item.plano_id,
      installmentNumber: Number(item.numero_parcela ?? 0),
      competence: item.competencia ?? "",
      dueDate: item.vencimento ?? "",
      value: Number(item.valor ?? 0),
      status: item.status ?? "Aberta",
      paidAt: item.pago_em ?? null,
      paymentMethod: item.forma_pagamento ?? "",
      notes: item.observacoes ?? "",
    }));

    setInstallments(formatted);
  }

  async function loadData() {
    setLoading(true);

    await loadPlans();

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedPlanId) {
      loadInstallments(selectedPlanId);
    }
  }, [selectedPlanId]);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? null,
    [plans, selectedPlanId]
  );

  const filteredInstallments = useMemo(() => {
    const term = search.toLowerCase().trim();

    return installments.filter((item) => {
      if (!term) return true;

      return (
        String(item.installmentNumber).includes(term) ||
        dateBR(item.dueDate).includes(term) ||
        item.status.toLowerCase().includes(term) ||
        item.paymentMethod.toLowerCase().includes(term)
      );
    });
  }, [installments, search]);

  const totalOpen = installments
    .filter((item) => getAutomaticStatus(item) === "Aberta")
    .reduce((total, item) => total + item.value, 0);

  const totalOverdue = installments
    .filter((item) => getAutomaticStatus(item) === "Atrasada")
    .reduce((total, item) => total + item.value, 0);

  const totalPaid = installments
    .filter((item) => item.status === "Paga")
    .reduce((total, item) => total + item.value, 0);

  const planUpToDate =
    selectedPlan &&
    installments.length > 0 &&
    totalOverdue === 0;

  function openNewInstallment() {
    if (!selectedPlan) {
      alert("Selecione um plano primeiro.");
      return;
    }

    const nextNumber =
      installments.reduce(
        (max, item) => Math.max(max, item.installmentNumber),
        0
      ) + 1;

    const baseDate =
      installments.length > 0
        ? new Date(
            `${installments[installments.length - 1].dueDate}T12:00:00`
          )
        : new Date();

    if (installments.length > 0) {
      baseDate.setMonth(baseDate.getMonth() + 1);
    }

    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, "0");
    const day = String(baseDate.getDate()).padStart(2, "0");

    setEditingId(null);

    setForm({
      competence: `${year}-${month}-01`,
      dueDate: `${year}-${month}-${day}`,
      value: String(selectedPlan.valorMensal).replace(".", ","),
      status: "Aberta",
      paymentMethod: "",
      notes: "",
    });

    setShowForm(true);
  }

  function openEditInstallment(item: Installment) {
    setEditingId(item.id);

    setForm({
      competence: item.competence,
      dueDate: item.dueDate,
      value: item.value.toFixed(2).replace(".", ","),
      status: item.status,
      paymentMethod: item.paymentMethod,
      notes: item.notes,
    });

    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveInstallment() {
    if (!selectedPlan) {
      alert("Selecione um plano.");
      return;
    }

    if (!form.dueDate) {
      alert("Informe o vencimento.");
      return;
    }

    const value = normalizeMoney(form.value);

    if (value <= 0) {
      alert("Informe um valor válido.");
      return;
    }

    setSaving(true);

    if (editingId) {
      const existing = installments.find(
        (item) => item.id === editingId
      );

      const paidAt =
        form.status === "Paga"
          ? existing?.paidAt ?? new Date().toISOString()
          : null;

      const { data, error } = await supabase
        .from("parcelas_planos")
        .update({
          competencia:
            form.competence ||
            `${form.dueDate.slice(0, 7)}-01`,
          vencimento: form.dueDate,
          valor: value,
          status: form.status,
          pago_em: paidAt,
          forma_pagamento: form.paymentMethod || "",
          observacoes: form.notes || "",
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId)
        .select()
        .single();

      if (error) {
        console.error("Erro ao editar parcela:", error);
        alert("Não foi possível editar a parcela.");
        setSaving(false);
        return;
      }

      const updated: Installment = {
        id: data.id,
        planId: data.plano_id,
        installmentNumber: Number(data.numero_parcela),
        competence: data.competencia ?? "",
        dueDate: data.vencimento,
        value: Number(data.valor ?? 0),
        status: data.status,
        paidAt: data.pago_em ?? null,
        paymentMethod: data.forma_pagamento ?? "",
        notes: data.observacoes ?? "",
      };

      setInstallments((old) =>
        old.map((item) =>
          item.id === editingId ? updated : item
        )
      );

      closeForm();
      setSaving(false);
      return;
    }

    const nextNumber =
      installments.reduce(
        (max, item) => Math.max(max, item.installmentNumber),
        0
      ) + 1;

    const paidAt =
      form.status === "Paga"
        ? new Date().toISOString()
        : null;

    const { data, error } = await supabase
      .from("parcelas_planos")
      .insert({
        plano_id: selectedPlan.id,
        numero_parcela: nextNumber,
        competencia:
          form.competence ||
          `${form.dueDate.slice(0, 7)}-01`,
        vencimento: form.dueDate,
        valor: value,
        status: form.status,
        pago_em: paidAt,
        forma_pagamento: form.paymentMethod || "",
        observacoes: form.notes || "",
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar parcela:", error);
      alert("Não foi possível criar a parcela.");
      setSaving(false);
      return;
    }

    const newInstallment: Installment = {
      id: data.id,
      planId: data.plano_id,
      installmentNumber: Number(data.numero_parcela),
      competence: data.competencia ?? "",
      dueDate: data.vencimento,
      value: Number(data.valor ?? 0),
      status: data.status,
      paidAt: data.pago_em ?? null,
      paymentMethod: data.forma_pagamento ?? "",
      notes: data.observacoes ?? "",
    };

    setInstallments((old) => [...old, newInstallment]);

    closeForm();
    setSaving(false);
  }

  async function markAsPaid(item: Installment) {
    if (item.status === "Paga") {
      const confirmReopen = window.confirm(
        `Deseja reabrir a parcela ${String(
          item.installmentNumber
        ).padStart(2, "0")}?`
      );

      if (!confirmReopen) return;

      const { error } = await supabase
        .from("parcelas_planos")
        .update({
          status: "Aberta",
          pago_em: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (error) {
        console.error(error);
        alert("Não foi possível reabrir a parcela.");
        return;
      }

      setInstallments((old) =>
        old.map((current) =>
          current.id === item.id
            ? {
                ...current,
                status: "Aberta",
                paidAt: null,
              }
            : current
        )
      );

      return;
    }

    const paymentMethod =
      window.prompt(
        "Forma de pagamento:\nEx.: PIX, Dinheiro, Cartão, Transferência",
        item.paymentMethod || "PIX"
      ) ?? item.paymentMethod;

    const { error } = await supabase
      .from("parcelas_planos")
      .update({
        status: "Paga",
        pago_em: new Date().toISOString(),
        forma_pagamento: paymentMethod,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (error) {
      console.error(error);
      alert("Não foi possível registrar o pagamento.");
      return;
    }

    setInstallments((old) =>
      old.map((current) =>
        current.id === item.id
          ? {
              ...current,
              status: "Paga",
              paidAt: new Date().toISOString(),
              paymentMethod,
            }
          : current
      )
    );
  }

  async function deleteInstallment(item: Installment) {
    const confirmed = window.confirm(
      `Excluir a parcela ${String(
        item.installmentNumber
      ).padStart(2, "0")}?\n\nEssa ação não poderá ser desfeita.`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("parcelas_planos")
      .delete()
      .eq("id", item.id);

    if (error) {
      console.error(error);
      alert("Não foi possível excluir a parcela.");
      return;
    }

    setInstallments((old) =>
      old.filter((current) => current.id !== item.id)
    );
  }

  async function generateNext12Months() {
    if (!selectedPlan) {
      alert("Selecione um plano.");
      return;
    }

    const confirmed = window.confirm(
      "Deseja gerar as próximas 12 parcelas deste plano?\n\nAs parcelas que já existem não serão duplicadas."
    );

    if (!confirmed) return;

    setSaving(true);

    const existingMonths = new Set(
      installments.map((item) => item.dueDate.slice(0, 7))
    );

    let lastDate =
      installments.length > 0
        ? new Date(
            `${installments[installments.length - 1].dueDate}T12:00:00`
          )
        : new Date();

    if (installments.length > 0) {
      lastDate.setMonth(lastDate.getMonth() + 1);
    }

    const rows: {
      plano_id: string;
      numero_parcela: number;
      competencia: string;
      vencimento: string;
      valor: number;
      status: "Aberta";
      forma_pagamento: string;
      observacoes: string;
    }[] = [];

    let nextNumber =
      installments.reduce(
        (max, item) => Math.max(max, item.installmentNumber),
        0
      ) + 1;

    for (let i = 0; i < 12; i++) {
      const current = new Date(lastDate);

      current.setMonth(current.getMonth() + i);

      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");

      const monthKey = `${year}-${month}`;

      if (existingMonths.has(monthKey)) {
        continue;
      }

      const dueDay = Math.min(
        current.getDate(),
        new Date(year, current.getMonth() + 1, 0).getDate()
      );

      const dueDate = `${year}-${month}-${String(
        dueDay
      ).padStart(2, "0")}`;

      rows.push({
        plano_id: selectedPlan.id,
        numero_parcela: nextNumber,
        competencia: `${monthKey}-01`,
        vencimento: dueDate,
        valor: selectedPlan.valorMensal,
        status: "Aberta",
        forma_pagamento: "",
        observacoes: "",
      });

      nextNumber++;
    }

    if (rows.length === 0) {
      alert("Não há novos meses para gerar.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("parcelas_planos")
      .insert(rows);

    if (error) {
      console.error("Erro ao gerar parcelas:", error);
      alert("Não foi possível gerar as parcelas.");
      setSaving(false);
      return;
    }

    await loadInstallments(selectedPlan.id);

    alert(`${rows.length} parcela(s) gerada(s) com sucesso.`);

    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
            Carregando carnê...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* CABEÇALHO */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <button
              onClick={() => window.history.back()}
              className="mb-3 flex items-center gap-2 text-sm text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Carnê Mensal
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Controle das parcelas dos planos mensais.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                selectedPlanId && loadInstallments(selectedPlanId)
              }
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </button>

            <button
              onClick={generateNext12Months}
              disabled={!selectedPlan || saving}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Gerar 12 meses
            </button>

            <button
              onClick={openNewInstallment}
              disabled={!selectedPlan}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Nova parcela
            </button>
          </div>
        </div>

        {/* SELEÇÃO DO PLANO */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl sm:p-5">
          <div className="mb-3 text-sm font-semibold text-slate-300">
            Selecione o plano
          </div>

          <div className="relative">
            <select
              value={selectedPlanId}
              onChange={(event) => {
                setSelectedPlanId(event.target.value);
                setSearch("");
              }}
              className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-10 text-sm text-white outline-none focus:border-blue-500"
            >
              <option value="">
                Selecione um plano mensal
              </option>

              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.numero} — {plan.clienteNome} —{" "}
                  {money(plan.valorMensal)}
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </div>

          {selectedPlan && (
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-slate-500">
                    Plano
                  </p>
                  <p className="font-semibold">
                    {selectedPlan.numero}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Cliente
                  </p>
                  <p className="font-semibold">
                    {selectedPlan.clienteNome}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Mensalidade
                  </p>
                  <p className="font-semibold text-emerald-400">
                    {money(selectedPlan.valorMensal)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Situação financeira
                  </p>

                  {installments.length === 0 ? (
                    <span className="inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                      Sem parcelas
                    </span>
                  ) : planUpToDate ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      EM DIA
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                      EM ATRASO
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* INDICADORES */}
        {selectedPlan && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Em aberto
              </p>
              <p className="mt-2 text-2xl font-bold text-blue-400">
                {money(totalOpen)}
              </p>
            </div>

            <div className="rounded-2xl border border-red-500/20 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Em atraso
              </p>
              <p className="mt-2 text-2xl font-bold text-red-400">
                {money(totalOverdue)}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Já recebido
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-400">
                {money(totalPaid)}
              </p>
            </div>
          </div>
        )}

        {/* PESQUISA */}
        {selectedPlan && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Pesquisar parcela, vencimento ou situação..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* LISTA */}
        {!selectedPlan ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <p className="text-slate-400">
              Selecione um plano para visualizar o carnê.
            </p>
          </div>
        ) : installments.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <p className="text-lg font-semibold">
              Nenhuma parcela cadastrada
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Use “Gerar 12 meses” para criar o carnê
              automaticamente.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-800 bg-slate-950/60">
                  <tr>
                    <th className="px-4 py-4 text-left text-slate-400">
                      Parcela
                    </th>

                    <th className="px-4 py-4 text-left text-slate-400">
                      Competência
                    </th>

                    <th className="px-4 py-4 text-left text-slate-400">
                      Vencimento
                    </th>

                    <th className="px-4 py-4 text-left text-slate-400">
                      Valor
                    </th>

                    <th className="px-4 py-4 text-left text-slate-400">
                      Situação
                    </th>

                    <th className="px-4 py-4 text-right text-slate-400">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredInstallments.map((item) => {
                    const automaticStatus =
                      getAutomaticStatus(item);

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-slate-800 last:border-0"
                      >
                        <td className="px-4 py-4 font-semibold">
                          {String(
                            item.installmentNumber
                          ).padStart(2, "0")}
                        </td>

                        <td className="px-4 py-4 text-slate-300">
                          {dateBR(item.competence)}
                        </td>

                        <td className="px-4 py-4 text-slate-300">
                          {dateBR(item.dueDate)}
                        </td>

                        <td className="px-4 py-4 font-semibold">
                          {money(item.value)}
                        </td>

                        <td className="px-4 py-4">
                          {automaticStatus === "Paga" && (
                            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                              Paga
                            </span>
                          )}

                          {automaticStatus === "Aberta" && (
                            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                              Em aberto
                            </span>
                          )}

                          {automaticStatus === "Atrasada" && (
                            <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                              Em atraso
                            </span>
                          )}

                          {automaticStatus === "Cancelada" && (
                            <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">
                              Cancelada
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                markAsPaid(item)
                              }
                              className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                                item.status === "Paga"
                                  ? "border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                                  : "border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                              }`}
                            >
                              {item.status === "Paga"
                                ? "Reabrir"
                                : "Marcar paga"}
                            </button>

                            <button
                              onClick={() =>
                                openEditInstallment(item)
                              }
                              className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
                            >
                              <Edit3 className="mr-1 inline h-3.5 w-3.5" />
                              Editar
                            </button>

                            <button
                              onClick={() =>
                                deleteInstallment(item)
                              }
                              className="rounded-lg border border-red-500/20 px-3 py-2 text-red-400 hover:bg-red-500/10"
                              title="Excluir parcela"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}
            <div className="space-y-3 p-3 md:hidden">
              {filteredInstallments.map((item) => {
                const automaticStatus =
                  getAutomaticStatus(item);

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold">
                          Parcela{" "}
                          {String(
                            item.installmentNumber
                          ).padStart(2, "0")}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Competência:{" "}
                          {dateBR(item.competence)}
                        </p>
                      </div>

                      {automaticStatus === "Paga" && (
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                          Paga
                        </span>
                      )}

                      {automaticStatus === "Aberta" && (
                        <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-400">
                          Aberta
                        </span>
                      )}

                      {automaticStatus === "Atrasada" && (
                        <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
                          Atrasada
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-500">
                          Vencimento
                        </p>
                        <p className="mt-1">
                          {dateBR(item.dueDate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Valor
                        </p>
                        <p className="mt-1 font-bold">
                          {money(item.value)}
                        </p>
                      </div>
                    </div>

                    {item.paymentMethod && (
                      <p className="mt-3 text-xs text-slate-400">
                        Pagamento:{" "}
                        {item.paymentMethod}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          markAsPaid(item)
                        }
                        className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${
                          item.status === "Paga"
                            ? "border border-yellow-500/30 text-yellow-400"
                            : "border border-emerald-500/30 text-emerald-400"
                        }`}
                      >
                        {item.status === "Paga"
                          ? "Reabrir"
                          : "Marcar paga"}
                      </button>

                      <button
                        onClick={() =>
                          openEditInstallment(item)
                        }
                        className="rounded-lg border border-slate-700 px-3 py-2 text-slate-300"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() =>
                          deleteInstallment(item)
                        }
                        className="rounded-lg border border-red-500/20 px-3 py-2 text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODAL */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-4">
                <div>
                  <h2 className="text-lg font-bold">
                    {editingId
                      ? "Editar parcela"
                      : "Nova parcela"}
                  </h2>

                  <p className="text-xs text-slate-500">
                    {selectedPlan?.clienteNome}
                  </p>
                </div>

                <button
                  onClick={closeForm}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5 p-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm text-slate-400">
                      Competência
                    </label>

                    <input
                      type="date"
                      value={form.competence}
                      onChange={(event) =>
                        setForm((old) => ({
                          ...old,
                          competence:
                            event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm text-slate-400">
                      Vencimento *
                    </label>

                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(event) =>
                        setForm((old) => ({
                          ...old,
                          dueDate: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-slate-400">
                    Valor da parcela *
                  </label>

                  <input
                    inputMode="decimal"
                    value={form.value}
                    onChange={(event) =>
                      setForm((old) => ({
                        ...old,
                        value: event.target.value,
                      }))
                    }
                    placeholder="Ex.: 250,00"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-slate-400">
                    Situação
                  </label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((old) => ({
                        ...old,
                        status:
                          event.target.value as InstallmentForm["status"],
                      }))
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
                  >
                    <option value="Aberta">
                      Aberta
                    </option>
                    <option value="Paga">
                      Paga
                    </option>
                    <option value="Cancelada">
                      Cancelada
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-slate-400">
                    Forma de pagamento
                  </label>

                  <select
                    value={form.paymentMethod}
                    onChange={(event) =>
                      setForm((old) => ({
                        ...old,
                        paymentMethod:
                          event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
                  >
                    <option value="">
                      Não informado
                    </option>
                    <option value="PIX">
                      PIX
                    </option>
                    <option value="Dinheiro">
                      Dinheiro
                    </option>
                    <option value="Cartão">
                      Cartão
                    </option>
                    <option value="Transferência">
                      Transferência
                    </option>
                    <option value="Boleto">
                      Boleto
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-slate-400">
                    Observações
                  </label>

                  <textarea
                    value={form.notes}
                    onChange={(event) =>
                      setForm((old) => ({
                        ...old,
                        notes: event.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Observações da parcela..."
                    className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    onClick={closeForm}
                    className="rounded-xl border border-slate-700 px-5 py-3 text-sm text-slate-300 hover:bg-slate-800"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={saveInstallment}
                    disabled={saving}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500 disabled:opacity-50"
                  >
                    {saving
                      ? "Salvando..."
                      : editingId
                      ? "Salvar alterações"
                      : "Criar parcela"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
