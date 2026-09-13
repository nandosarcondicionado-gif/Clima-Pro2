"use client";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Search,
  User,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";

type BudgetStatus =
  | "Rascunho"
  | "Enviado"
  | "Aprovado"
  | "Recusado";

type Budget = {
  id: number;
  number: string;
  client: string;
  city: string;
  service: string;
  equipment: string;
  value: number;
  date: string;
  status: BudgetStatus;
};

const initialBudgets: Budget[] = [
  {
    id: 1,
    number: "ORC-0001",
    client: "João da Silva",
    city: "Araraquara",
    service: "Higienização de ar-condicionado",
    equipment: "2 equipamentos",
    value: 380,
    date: "09/09/2026",
    status: "Enviado",
  },
  {
    id: 2,
    number: "ORC-0002",
    client: "Clínica Saúde",
    city: "Araraquara",
    service: "Manutenção preventiva",
    equipment: "6 equipamentos",
    value: 950,
    date: "08/09/2026",
    status: "Aprovado",
  },
  {
    id: 3,
    number: "ORC-0003",
    client: "Empresa ABC Ltda.",
    city: "São Carlos",
    service: "Instalação de equipamentos",
    equipment: "4 equipamentos",
    value: 4800,
    date: "07/09/2026",
    status: "Rascunho",
  },
];

const statusStyles: Record<BudgetStatus, string> = {
  Rascunho: "bg-slate-100 text-slate-600",
  Enviado: "bg-blue-50 text-blue-700",
  Aprovado: "bg-emerald-50 text-emerald-700",
  Recusado: "bg-red-50 text-red-700",
};

export default function OrcamentosPage() {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Todos" | BudgetStatus>("Todos");
  const [showForm, setShowForm] = useState(false);

  const [client, setClient] = useState("");
  const [city, setCity] = useState("Araraquara");
  const [service, setService] = useState("");
  const [equipment, setEquipment] = useState("");
  const [value, setValue] = useState("");

  const filteredBudgets = budgets.filter((budget) => {
    const term = search.toLowerCase();

    const matchesSearch =
      budget.number.toLowerCase().includes(term) ||
      budget.client.toLowerCase().includes(term) ||
      budget.city.toLowerCase().includes(term) ||
      budget.service.toLowerCase().includes(term);

    const matchesFilter =
      filter === "Todos" || budget.status === filter;

    return matchesSearch && matchesFilter;
  });

  function addBudget(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!client.trim() || !service.trim() || !value.trim()) {
      return;
    }

    const nextNumber = String(budgets.length + 1).padStart(4, "0");

    const newBudget: Budget = {
      id: Date.now(),
      number: `ORC-${nextNumber}`,
      client: client.trim(),
      city,
      service: service.trim(),
      equipment: equipment.trim() || "Não informado",
      value: Number(value.replace(",", ".")) || 0,
      date: new Date().toLocaleDateString("pt-BR"),
      status: "Rascunho",
    };

    setBudgets((current) => [newBudget, ...current]);

    setClient("");
    setCity("Araraquara");
    setService("");
    setEquipment("");
    setValue("");
    setShowForm(false);
  }

  function changeStatus(id: number, status: BudgetStatus) {
    setBudgets((current) =>
      current.map((budget) =>
        budget.id === id ? { ...budget, status } : budget
      )
    );
  }

  const total = budgets.reduce((sum, budget) => sum + budget.value, 0);

  const approved = budgets.filter(
    (budget) => budget.status === "Aprovado"
  );

  const approvedTotal = approved.reduce(
    (sum, budget) => sum + budget.value,
    0
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500 p-3 text-white">
              <FileText size={22} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Orçamentos
              </h1>

              <p className="text-sm text-slate-500">
                Crie e acompanhe suas propostas comerciais
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-cyan-600"
          >
            <Plus size={18} />

            <span className="hidden sm:inline">
              Novo orçamento
            </span>

            <span className="sm:hidden">Novo</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <ArrowLeft size={16} />
          <span>ClimaPro</span>
          <span>/</span>
          <span className="font-medium text-slate-700">
            Orçamentos
          </span>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total de orçamentos
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {budgets.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Em análise
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-600">
              {
                budgets.filter(
                  (budget) => budget.status === "Enviado"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Aprovados
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {approved.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Valor aprovado
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {approvedTotal.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <Search
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar orçamento, cliente ou serviço..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto">
                {(
                  [
                    "Todos",
                    "Rascunho",
                    "Enviado",
                    "Aprovado",
                    "Recusado",
                  ] as const
                ).map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilter(item)}
                    className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      filter === item
                        ? "bg-cyan-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredBudgets.length === 0 ? (
              <div className="p-10 text-center">
                <FileText
                  size={34}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 font-medium text-slate-700">
                  Nenhum orçamento encontrado
                </p>
              </div>
            ) : (
              filteredBudgets.map((budget) => (
                <div
                  key={budget.id}
                  className="p-5 hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                        <FileText size={22} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-cyan-600">
                            {budget.number}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[budget.status]}`}
                          >
                            {budget.status}
                          </span>
                        </div>

                        <h3 className="mt-1 font-semibold text-slate-900">
                          {budget.service}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            {budget.client.includes("Empresa") ||
                            budget.client.includes("Clínica") ? (
                              <Building2 size={14} />
                            ) : (
                              <User size={14} />
                            )}

                            {budget.client}
                          </span>

                          <span>
                            {budget.city}
                          </span>

                          <span>
                            {budget.equipment}
                          </span>

                          <span className="flex items-center gap-1">
                            <CalendarDays size={14} />
                            {budget.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="sm:text-right">
                        <p className="text-xs text-slate-400">
                          Valor
                        </p>

                        <p className="text-lg font-bold text-slate-900">
                          {budget.value.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {budget.status === "Rascunho" && (
                          <button
                            onClick={() =>
                              changeStatus(budget.id, "Enviado")
                            }
                            className="flex items-center gap-1.5 rounded-xl bg-blue-500 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-600"
                          >
                            <Clock size={14} />
                            Enviar
                          </button>
                        )}

                        {budget.status === "Enviado" && (
                          <>
                            <button
                              onClick={() =>
                                changeStatus(
                                  budget.id,
                                  "Aprovado"
                                )
                              }
                              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
                            >
                              <CheckCircle2 size={14} />
                              Aprovar
                            </button>

                            <button
                              onClick={() =>
                                changeStatus(
                                  budget.id,
                                  "Recusado"
                                )
                              }
                              className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                            >
                              <XCircle size={14} />
                              Recusar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50 p-5">
          <div className="flex gap-3">
            <FileText
              className="mt-0.5 shrink-0 text-cyan-600"
              size={20}
            />

            <div>
              <h3 className="font-semibold text-cyan-900">
                Próxima evolução
              </h3>

              <p className="mt-1 text-sm text-cyan-800">
                Depois vamos transformar um orçamento aprovado
                automaticamente em uma Ordem de Serviço e,
                futuramente, permitir envio pelo WhatsApp.
              </p>
            </div>
          </div>
        </section>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Novo orçamento
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Crie uma proposta para o cliente.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addBudget} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Cliente
                </label>

                <input
                  value={client}
                  onChange={(event) =>
                    setClient(event.target.value)
                  }
                  placeholder="Nome ou razão social"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Cidade
                </label>

                <select
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                >
                  <option>Araraquara</option>
                  <option>São Carlos</option>
                  <option>Matão</option>
                  <option>Américo Brasiliense</option>
                  <option>Boa Esperança do Sul</option>
                  <option>Gavião Peixoto</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Serviço
                </label>

                <input
                  value={service}
                  onChange={(event) =>
                    setService(event.target.value)
                  }
                  placeholder="Ex.: Manutenção preventiva"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Equipamentos
                </label>

                <input
                  value={equipment}
                  onChange={(event) =>
                    setEquipment(event.target.value)
                  }
                  placeholder="Ex.: 4 equipamentos Split"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Valor do orçamento
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={value}
                  onChange={(event) =>
                    setValue(event.target.value)
                  }
                  placeholder="0,00"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-white hover:bg-cyan-600"
                >
                  Salvar orçamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 pb-8 text-xs text-slate-400 sm:px-6">
        Valor total dos orçamentos cadastrados:{" "}
        {total.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </div>
    </main>
  );
}
