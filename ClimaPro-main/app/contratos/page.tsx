"use client";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  FileText,
  Plus,
  Search,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

type Plan = "Residencial" | "Comercial" | "Empresarial";

type ContractStatus = "Ativo" | "Pendente" | "Vencido" | "Cancelado";

type Contract = {
  id: number;
  number: string;
  client: string;
  city: string;
  plan: Plan;
  equipment: number;
  monthlyValue: number;
  startDate: string;
  nextVisit: string;
  status: ContractStatus;
};

const plans = {
  Residencial: {
    price: 149,
    color: "bg-blue-50 text-blue-700",
    description: "Para casas e apartamentos",
  },
  Comercial: {
    price: 299,
    color: "bg-purple-50 text-purple-700",
    description: "Para lojas e pequenos comércios",
  },
  Empresarial: {
    price: 599,
    color: "bg-cyan-50 text-cyan-700",
    description: "Para empresas e instalações maiores",
  },
};

const initialContracts: Contract[] = [
  {
    id: 1,
    number: "CTR-0001",
    client: "João da Silva",
    city: "Araraquara",
    plan: "Residencial",
    equipment: 2,
    monthlyValue: 149,
    startDate: "01/09/2026",
    nextVisit: "01/12/2026",
    status: "Ativo",
  },
  {
    id: 2,
    number: "CTR-0002",
    client: "Clínica Saúde",
    city: "Araraquara",
    plan: "Comercial",
    equipment: 6,
    monthlyValue: 299,
    startDate: "01/09/2026",
    nextVisit: "15/10/2026",
    status: "Ativo",
  },
  {
    id: 3,
    number: "CTR-0003",
    client: "Empresa ABC Ltda.",
    city: "São Carlos",
    plan: "Empresarial",
    equipment: 14,
    monthlyValue: 599,
    startDate: "01/09/2026",
    nextVisit: "20/10/2026",
    status: "Pendente",
  },
];

const statusStyles: Record<ContractStatus, string> = {
  Ativo: "bg-emerald-50 text-emerald-700",
  Pendente: "bg-amber-50 text-amber-700",
  Vencido: "bg-red-50 text-red-700",
  Cancelado: "bg-slate-100 text-slate-500",
};

export default function ContratosPage() {
  const [contracts, setContracts] =
    useState<Contract[]>(initialContracts);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [client, setClient] = useState("");
  const [city, setCity] = useState("Araraquara");
  const [plan, setPlan] = useState<Plan>("Residencial");
  const [equipment, setEquipment] = useState("1");
  const [monthlyValue, setMonthlyValue] = useState(
    String(plans.Residencial.price)
  );
  const [startDate, setStartDate] = useState("");

  const activeContracts = contracts.filter(
    (contract) => contract.status === "Ativo"
  );

  const monthlyRevenue = activeContracts.reduce(
    (sum, contract) => sum + contract.monthlyValue,
    0
  );

  const filteredContracts = contracts.filter((contract) => {
    const term = search.toLowerCase();

    return (
      contract.number.toLowerCase().includes(term) ||
      contract.client.toLowerCase().includes(term) ||
      contract.city.toLowerCase().includes(term) ||
      contract.plan.toLowerCase().includes(term)
    );
  });

  function selectPlan(selectedPlan: Plan) {
    setPlan(selectedPlan);
    setMonthlyValue(String(plans[selectedPlan].price));
  }

  function addContract(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!client.trim() || !startDate) {
      return;
    }

    const number = String(contracts.length + 1).padStart(4, "0");

    const formattedStart = new Date(
      `${startDate}T12:00:00`
    ).toLocaleDateString("pt-BR");

    const newContract: Contract = {
      id: Date.now(),
      number: `CTR-${number}`,
      client: client.trim(),
      city,
      plan,
      equipment: Number(equipment) || 1,
      monthlyValue:
        Number(monthlyValue.replace(",", ".")) || 0,
      startDate: formattedStart,
      nextVisit: "A definir",
      status: "Ativo",
    };

    setContracts((current) => [newContract, ...current]);

    setClient("");
    setCity("Araraquara");
    setPlan("Residencial");
    setEquipment("1");
    setMonthlyValue(String(plans.Residencial.price));
    setStartDate("");
    setShowForm(false);
  }

  function cancelContract(id: number) {
    setContracts((current) =>
      current.map((contract) =>
        contract.id === id
          ? { ...contract, status: "Cancelado" }
          : contract
      )
    );
  }

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
                Contratos
              </h1>

              <p className="text-sm text-slate-500">
                Planos de manutenção recorrente
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-600"
          >
            <Plus size={18} />

            <span className="hidden sm:inline">
              Novo contrato
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
            Contratos
          </span>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Contratos ativos
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {activeContracts.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Receita recorrente mensal
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {monthlyRevenue.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Equipamentos contratados
            </p>

            <p className="mt-2 text-3xl font-bold text-cyan-600">
              {activeContracts.reduce(
                (sum, contract) => sum + contract.equipment,
                0
              )}
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {(Object.keys(plans) as Plan[]).map((planName) => {
            const planData = plans[planName];

            return (
              <div
                key={planName}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold ${planData.color}`}
                  >
                    {planName}
                  </div>

                  <CheckCircle2
                    size={19}
                    className="text-emerald-500"
                  />
                </div>

                <p className="mt-4 text-2xl font-bold text-slate-900">
                  {planData.price.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                  <span className="text-sm font-normal text-slate-400">
                    /mês
                  </span>
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {planData.description}
                </p>

                <button
                  onClick={() => {
                    selectPlan(planName);
                    setShowForm(true);
                  }}
                  className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Contratar plano
                </button>
              </div>
            );
          })}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <div className="relative">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Buscar cliente, cidade ou plano..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredContracts.map((contract) => (
              <div
                key={contract.id}
                className="p-5 hover:bg-slate-50"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                      <FileText size={22} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-cyan-600">
                          {contract.number}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[contract.status]}`}
                        >
                          {contract.status}
                        </span>
                      </div>

                      <h3 className="mt-1 font-semibold text-slate-900">
                        {contract.client}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                        <span>
                          {contract.plan}
                        </span>

                        <span>
                          {contract.city}
                        </span>

                        <span>
                          {contract.equipment} equipamento
                          {contract.equipment !== 1 ? "s" : ""}
                        </span>

                        <span>
                          Desde {contract.startDate}
                        </span>

                        <span className="flex items-center gap-1">
                          <CalendarDays size={13} />
                          Próxima visita: {contract.nextVisit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-5 sm:justify-end">
                    <div className="sm:text-right">
                      <p className="text-xs text-slate-400">
                        Mensalidade
                      </p>

                      <p className="text-lg font-bold text-emerald-600">
                        {contract.monthlyValue.toLocaleString(
                          "pt-BR",
                          {
                            style: "currency",
                            currency: "BRL",
                          }
                        )}
                      </p>
                    </div>

                    {contract.status === "Ativo" && (
                      <button
                        onClick={() =>
                          cancelContract(contract.id)
                        }
                        className="rounded-xl border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredContracts.length === 0 && (
              <div className="p-10 text-center">
                <FileText
                  size={36}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 font-medium text-slate-700">
                  Nenhum contrato encontrado
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <div className="flex gap-3">
            <CheckCircle2
              size={21}
              className="mt-0.5 shrink-0 text-emerald-600"
            />

            <div>
              <h3 className="font-semibold text-emerald-900">
                Estratégia de receita recorrente
              </h3>

              <p className="mt-1 text-sm leading-6 text-emerald-800">
                O objetivo é transformar clientes de serviços
                avulsos em contratos mensais. Na próxima versão,
                cada contrato poderá gerar automaticamente as
                visitas preventivas, cobranças e ordens de serviço.
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
                  Novo contrato
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Crie um plano de manutenção recorrente.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={addContract}
              className="space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Cliente
                </label>

                <input
                  value={client}
                  onChange={(event) =>
                    setClient(event.target.value)
                  }
                  placeholder="Nome ou empresa"
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
                  onChange={(event) =>
                    setCity(event.target.value)
                  }
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
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Plano
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(plans) as Plan[]).map(
                    (planName) => (
                      <button
                        type="button"
                        key={planName}
                        onClick={() =>
                          selectPlan(planName)
                        }
                        className={`rounded-xl border p-3 text-xs font-semibold ${
                          plan === planName
                            ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                            : "border-slate-200 text-slate-600"
                        }`}
                      >
                        {planName}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Quantidade de equipamentos
                </label>

                <input
                  type="number"
                  min="1"
                  value={equipment}
                  onChange={(event) =>
                    setEquipment(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Mensalidade
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={monthlyValue}
                  onChange={(event) =>
                    setMonthlyValue(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />

                <p className="mt-1 text-xs text-slate-400">
                  O valor sugerido muda conforme o plano escolhido.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Data de início
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(event) =>
                    setStartDate(event.target.value)
                  }
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
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
                  Criar contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
