"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  FileText,
  Edit,
  Trash2,
  X,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Ban,
} from "lucide-react";
import { createClient } from "../../lib/supabase/client";

type Plan = "Residencial" | "Comercial" | "Empresarial";
type ContractStatus = "Ativo" | "Pendente" | "Vencido" | "Cancelado";

type Client = {
  id: string;
  nome: string;
  cidade: string | null;
  ativo?: boolean;
};

type Contract = {
  id: string;
  numero: string;
  cliente_id: string | null;
  cliente_nome: string;
  cidade: string;
  plano: Plan;
  equipamentos: number;
  valor_mensal: number;
  data_inicio: string;
  proxima_visita: string | null;
  status: ContractStatus;
  observacoes: string | null;
  created_at?: string;
  updated_at?: string;
};

type PlanInfo = {
  price: number;
  description: string;
};

const plans = {
  Residencial: {
    price: 149,
    description: "Ideal para residências e pequenos ambientes.",
  },
  Comercial: {
    price: 299,
    description: "Para lojas, escritórios e pequenos comércios.",
  },
  Empresarial: {
    price: 599,
    description: "Para empresas e instalações com vários equipamentos.",
  },
};

const statusOptions: ContractStatus[] = [
  "Ativo",
  "Pendente",
  "Vencido",
  "Cancelado",
];

const emptyForm = {
  cliente_id: "",
  cidade: "",
  plano: "Residencial" as Plan,
  equipamentos: "1",
  valor_mensal: "149",
  data_inicio: new Date().toISOString().slice(0, 10),
  proxima_visita: "",
  status: "Ativo" as ContractStatus,
  observacoes: "",
};

export default function ContratosPage() {
  const supabase = createClient();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const [modalOpen, setModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedContract, setSelectedContract] =
    useState<Contract | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);

    const [contractsResult, clientsResult] = await Promise.all([
      supabase
        .from("contratos")
        .select("*")
        .order("created_at", { ascending: false }),

      supabase
        .from("clientes")
        .select("id,nome,cidade,ativo")
        .eq("ativo", true)
        .order("nome"),
    ]);

    if (contractsResult.error) {
      console.error("Erro ao carregar contratos:", contractsResult.error);
      alert("Não foi possível carregar os contratos.");
    } else {
      setContracts((contractsResult.data || []) as Contract[]);
    }

    if (clientsResult.error) {
      console.error("Erro ao carregar clientes:", clientsResult.error);
    } else {
      setClients((clientsResult.data || []) as Client[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(contract: Contract) {
    setEditingId(contract.id);

    setForm({
      cliente_id: contract.cliente_id || "",
      cidade: contract.cidade || "",
      plano: contract.plano,
      equipamentos: String(contract.equipamentos || 1),
      valor_mensal: String(contract.valor_mensal || 0),
      data_inicio: contract.data_inicio || "",
      proxima_visita: contract.proxima_visita || "",
      status: contract.status,
      observacoes: contract.observacoes || "",
    });

    setModalOpen(true);
  }

  function openDetails(contract: Contract) {
    setSelectedContract(contract);
    setDetailsOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleClientChange(clientId: string) {
    const client = clients.find((item) => item.id === clientId);

    setForm((previous) => ({
      ...previous,
      cliente_id: clientId,
      cidade: client?.cidade || "",
    }));
  }

  function handlePlanChange(plan: Plan) {
    const planInfo = plans[plan] as PlanInfo;

    setForm((previous) => ({
      ...previous,
      plano: plan,
      valor_mensal: String(planInfo.price),
    }));
  }

  async function generateNumber() {
    const { data, error } = await supabase
      .from("contratos")
      .select("numero")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return "CTR-0001";
    }

    const lastNumber = String(data[0].numero || "CTR-0000");
    const match = lastNumber.match(/(\d+)$/);

    if (!match) {
      return "CTR-0001";
    }

    const next = Number(match[1]) + 1;

    return `CTR-${String(next).padStart(4, "0")}`;
  }

  async function saveContract(event: React.FormEvent) {
    event.preventDefault();

    if (!form.cliente_id) {
      alert("Selecione um cliente.");
      return;
    }

    const client = clients.find(
      (item) => item.id === form.cliente_id
    );

    if (!client) {
      alert("Cliente não encontrado.");
      return;
    }

    setSaving(true);

    try {
      const baseData = {
        cliente_id: client.id,
        cliente_nome: client.nome,
        cidade: form.cidade || client.cidade || "",
        plano: form.plano,
        equipamentos: Number(form.equipamentos) || 1,
        valor_mensal: Number(form.valor_mensal) || 0,
        data_inicio: form.data_inicio,
        proxima_visita: form.proxima_visita || null,
        status: form.status,
        observacoes: form.observacoes.trim() || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from("contratos")
          .update(baseData)
          .eq("id", editingId);

        if (error) {
          console.error(error);
          alert(`Erro ao atualizar contrato: ${error.message}`);
          return;
        }

        alert("Contrato atualizado com sucesso.");
      } else {
        const numero = await generateNumber();

        const { error } = await supabase
          .from("contratos")
          .insert({
            numero,
            ...baseData,
          });

        if (error) {
          console.error(error);
          alert(`Erro ao criar contrato: ${error.message}`);
          return;
        }

        alert("Contrato criado com sucesso.");
      }

      closeModal();
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  async function deleteContract(id: string) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este contrato?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("contratos")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(`Erro ao excluir contrato: ${error.message}`);
      return;
    }

    setContracts((previous) =>
      previous.filter((contract) => contract.id !== id)
    );

    if (selectedContract?.id === id) {
      setSelectedContract(null);
      setDetailsOpen(false);
    }

    alert("Contrato excluído.");
  }

  async function changeStatus(
    contract: Contract,
    status: ContractStatus
  ) {
    const { error } = await supabase
      .from("contratos")
      .update({ status })
      .eq("id", contract.id);

    if (error) {
      console.error(error);
      alert(`Erro ao alterar status: ${error.message}`);
      return;
    }

    setContracts((previous) =>
      previous.map((item) =>
        item.id === contract.id
          ? { ...item, status }
          : item
      )
    );

    if (selectedContract?.id === contract.id) {
      setSelectedContract({
        ...selectedContract,
        status,
      });
    }
  }

  const filteredContracts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return contracts.filter((contract) => {
      const matchesSearch =
        !term ||
        contract.numero.toLowerCase().includes(term) ||
        contract.cliente_nome.toLowerCase().includes(term) ||
        contract.cidade.toLowerCase().includes(term) ||
        contract.plano.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "Todos" ||
        contract.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [contracts, search, statusFilter]);

  const totalContracts = contracts.length;

  const activeContracts = contracts.filter(
    (item) => item.status === "Ativo"
  ).length;

  const pendingContracts = contracts.filter(
    (item) => item.status === "Pendente"
  ).length;

  const monthlyTotal = contracts
    .filter((item) => item.status === "Ativo")
    .reduce(
      (total, item) => total + Number(item.valor_mensal || 0),
      0
    );

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  function formatDate(value: string | null) {
    if (!value) return "-";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("pt-BR");
  }

  function statusClass(status: ContractStatus) {
    if (status === "Ativo") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Pendente") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (status === "Vencido") {
      return "bg-red-100 text-red-700";
    }

    return "bg-gray-100 text-gray-700";
  }

  function statusIcon(status: ContractStatus) {
    if (status === "Ativo") {
      return <CheckCircle size={15} />;
    }

    if (status === "Pendente") {
      return <Clock size={15} />;
    }

    if (status === "Vencido") {
      return <AlertCircle size={15} />;
    }

    return <Ban size={15} />;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Contratos
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Gerencie os contratos de manutenção dos clientes.
            </p>
          </div>

          <button
            onClick={openNew}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={19} />
            Novo contrato
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total de contratos
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {totalContracts}
                </p>
              </div>

              <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                <FileText size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Contratos ativos
                </p>
                <p className="mt-1 text-2xl font-bold text-green-600">
                  {activeContracts}
                </p>
              </div>

              <div className="rounded-lg bg-green-100 p-3 text-green-600">
                <CheckCircle size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Pendentes
                </p>
                <p className="mt-1 text-2xl font-bold text-yellow-600">
                  {pendingContracts}
                </p>
              </div>

              <div className="rounded-lg bg-yellow-100 p-3 text-yellow-600">
                <Clock size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Receita mensal
                </p>
                <p className="mt-1 text-2xl font-bold text-blue-600">
                  {formatCurrency(monthlyTotal)}
                </p>
              </div>

              <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                <FileText size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-5 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Buscar contrato, cliente ou cidade..."
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="Todos">Todos os status</option>

              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Carregando contratos...
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="p-10 text-center">
              <FileText
                size={45}
                className="mx-auto mb-3 text-gray-300"
              />

              <p className="font-semibold text-gray-700">
                Nenhum contrato encontrado
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Crie o primeiro contrato para começar.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      Contrato
                    </th>

                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      Cliente
                    </th>

                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      Plano
                    </th>

                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      Equipamentos
                    </th>

                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      Valor mensal
                    </th>

                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      Próxima visita
                    </th>

                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      Status
                    </th>

                    <th className="px-4 py-4 text-right text-sm font-semibold text-gray-600">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredContracts.map((contract) => (
                    <tr
                      key={contract.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-4">
                        <div className="font-semibold text-gray-900">
                          {contract.numero}
                        </div>

                        <div className="text-xs text-gray-500">
                          Início:{" "}
                          {formatDate(contract.data_inicio)}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">
                          {contract.cliente_nome}
                        </div>

                        <div className="text-sm text-gray-500">
                          {contract.cidade}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          {contract.plano}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        {contract.equipamentos}
                      </td>

                      <td className="px-4 py-4 font-semibold text-gray-900">
                        {formatCurrency(
                          Number(contract.valor_mensal || 0)
                        )}
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        {formatDate(contract.proxima_visita)}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                            contract.status
                          )}`}
                        >
                          {statusIcon(contract.status)}
                          {contract.status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              openDetails(contract)
                            }
                            title="Visualizar"
                            className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            onClick={() =>
                              openEdit(contract)
                            }
                            title="Editar"
                            className="rounded-lg border border-blue-200 p-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Edit size={17} />
                          </button>

                          <button
                            onClick={() =>
                              deleteContract(contract.id)
                            }
                            title="Excluir"
                            className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId
                    ? "Editar contrato"
                    : "Novo contrato"}
                </h2>

                <p className="text-sm text-gray-500">
                  Preencha os dados do contrato.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={21} />
              </button>
            </div>

            <form
              onSubmit={saveContract}
              className="space-y-5 p-5"
            >
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Cliente
                </label>

                <select
                  required
                  value={form.cliente_id}
                  onChange={(event) =>
                    handleClientChange(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-blue-500"
                >
                  <option value="">
                    Selecione um cliente
                  </option>

                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Cidade
                  </label>

                  <input
                    value={form.cidade}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        cidade: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Plano
                  </label>

                  <select
                    value={form.plano}
                    onChange={(event) =>
                      handlePlanChange(
                        event.target.value as Plan
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="Residencial">
                      Residencial - R$ 149
                    </option>

                    <option value="Comercial">
                      Comercial - R$ 299
                    </option>

                    <option value="Empresarial">
                      Empresarial - R$ 599
                    </option>
                  </select>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                {plans[form.plano].description}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Quantidade de equipamentos
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={form.equipamentos}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        equipamentos: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Valor mensal
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.valor_mensal}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        valor_mensal: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Data de início
                  </label>

                  <input
                    type="date"
                    required
                    value={form.data_inicio}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        data_inicio: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Próxima visita
                  </label>

                  <input
                    type="date"
                    value={form.proxima_visita}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        proxima_visita: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Status
                </label>

                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status:
                        event.target.value as ContractStatus,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-blue-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Observações
                </label>

                <textarea
                  rows={4}
                  value={form.observacoes}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      observacoes: event.target.value,
                    })
                  }
                  placeholder="Observações do contrato..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Salvando..."
                    : editingId
                    ? "Salvar alterações"
                    : "Criar contrato"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailsOpen && selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedContract.numero}
                </h2>

                <p className="text-sm text-gray-500">
                  Detalhes do contrato
                </p>
              </div>

              <button
                onClick={() => setDetailsOpen(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={21} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Cliente
                </p>

                <p className="font-semibold text-gray-900">
                  {selectedContract.cliente_nome}
                </p>

                <p className="text-sm text-gray-500">
                  {selectedContract.cidade}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Plano
                  </p>

                  <p className="font-semibold">
                    {selectedContract.plano}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Equipamentos
                  </p>

                  <p className="font-semibold">
                    {selectedContract.equipamentos}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Valor mensal
                  </p>

                  <p className="font-semibold text-blue-600">
                    {formatCurrency(
                      Number(selectedContract.valor_mensal || 0)
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Status
                  </p>

                  <span
                    className={`mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                      selectedContract.status
                    )}`}
                  >
                    {statusIcon(selectedContract.status)}
                    {selectedContract.status}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Início
                  </p>

                  <p className="font-semibold">
                    {formatDate(selectedContract.data_inicio)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Próxima visita
                  </p>

                  <p className="font-semibold">
                    {formatDate(
                      selectedContract.proxima_visita
                    )}
                  </p>
                </div>
              </div>

              {selectedContract.observacoes && (
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Observações
                  </p>

                  <div className="mt-1 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                    {selectedContract.observacoes}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="mb-2 text-sm font-semibold text-gray-700">
                  Alterar status
                </p>

                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        changeStatus(
                          selectedContract,
                          status
                        )
                      }
                      className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                        selectedContract.status === status
                          ? statusClass(status)
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  onClick={() => {
                    setDetailsOpen(false);
                    openEdit(selectedContract);
                  }}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                >
                  <Edit size={17} />
                  Editar
                </button>

                <button
                  onClick={() =>
                    setDetailsOpen(false)
                  }
                  className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
