"use client";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Edit,
  MapPin,
  Plus,
  Search,
  Snowflake,
  Trash2,
  User,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";

type ServiceOrder = {
  id: number;
  client: string;
  equipment: string;
  city: string;
  serviceType:
    | "Preventiva"
    | "Corretiva"
    | "Instalação"
    | "Higienização"
    | "Visita técnica";
  description: string;
  date: string;
  technician: string;
  value: number;
  status:
    | "Aberta"
    | "Agendada"
    | "Em andamento"
    | "Concluída"
    | "Cancelada";
  notes: string;
};

const initialOrders: ServiceOrder[] = [
  {
    id: 1,
    client: "João da Silva",
    equipment: "LG Dual Inverter • 12.000 BTUs",
    city: "Araraquara",
    serviceType: "Preventiva",
    description: "Limpeza e revisão geral do equipamento.",
    date: "12/09/2026",
    technician: "Carlos",
    value: 180,
    status: "Agendada",
    notes: "Verificar filtro e drenagem.",
  },
  {
    id: 2,
    client: "Clínica Saúde",
    equipment: "Daikin EcoSwing • 24.000 BTUs",
    city: "Araraquara",
    serviceType: "Corretiva",
    description: "Equipamento apresentando baixa refrigeração.",
    date: "10/09/2026",
    technician: "Marcos",
    value: 350,
    status: "Em andamento",
    notes: "Verificar pressão do gás.",
  },
  {
    id: 3,
    client: "Empresa ABC Ltda.",
    equipment: "Sistema VRF",
    city: "São Carlos",
    serviceType: "Higienização",
    description: "Higienização dos equipamentos do escritório.",
    date: "05/09/2026",
    technician: "Carlos",
    value: 850,
    status: "Concluída",
    notes: "Serviço realizado sem intercorrências.",
  },
];

const statusStyles = {
  Aberta: "bg-blue-50 text-blue-700",
  Agendada: "bg-purple-50 text-purple-700",
  "Em andamento": "bg-amber-50 text-amber-700",
  Concluída: "bg-emerald-50 text-emerald-700",
  Cancelada: "bg-red-50 text-red-700",
};

const serviceTypes = [
  "Preventiva",
  "Corretiva",
  "Instalação",
  "Higienização",
  "Visita técnica",
] as const;

const statuses = [
  "Aberta",
  "Agendada",
  "Em andamento",
  "Concluída",
  "Cancelada",
] as const;

export default function OrdensServicoPage() {
  const [orders, setOrders] =
    useState<ServiceOrder[]>(initialOrders);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"Todos" | ServiceOrder["status"]>("Todos");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [editingOrder, setEditingOrder] =
    useState<ServiceOrder | null>(null);

  const [selectedOrder, setSelectedOrder] =
    useState<ServiceOrder | null>(null);

  const [client, setClient] = useState("");
  const [equipment, setEquipment] = useState("");
  const [city, setCity] = useState("Araraquara");
  const [serviceType, setServiceType] =
    useState<ServiceOrder["serviceType"]>("Preventiva");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [technician, setTechnician] = useState("");
  const [value, setValue] = useState("");
  const [status, setStatus] =
    useState<ServiceOrder["status"]>("Aberta");
  const [notes, setNotes] = useState("");

  const filteredOrders = orders.filter((order) => {
    const term = search.toLowerCase().trim();

    const matchesSearch =
      order.client.toLowerCase().includes(term) ||
      order.equipment.toLowerCase().includes(term) ||
      order.city.toLowerCase().includes(term) ||
      order.technician.toLowerCase().includes(term) ||
      order.serviceType.toLowerCase().includes(term) ||
      order.description.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === "Todos" ||
      order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  function clearForm() {
    setClient("");
    setEquipment("");
    setCity("Araraquara");
    setServiceType("Preventiva");
    setDescription("");
    setDate("");
    setTechnician("");
    setValue("");
    setStatus("Aberta");
    setNotes("");
    setEditingOrder(null);
  }

  function openNewOrder() {
    clearForm();
    setShowForm(true);
  }

  function openEdit(order: ServiceOrder) {
    setEditingOrder(order);

    setClient(order.client);
    setEquipment(order.equipment);
    setCity(order.city);
    setServiceType(order.serviceType);
    setDescription(order.description);
    setDate(order.date);
    setTechnician(order.technician);
    setValue(String(order.value));
    setStatus(order.status);
    setNotes(order.notes);

    setShowForm(true);
  }

  function openDetails(order: ServiceOrder) {
    setSelectedOrder(order);
    setShowDetails(true);
  }

  function saveOrder(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !client.trim() ||
      !equipment.trim() ||
      !description.trim()
    ) {
      return;
    }

    const numericValue =
      Number(value.replace(",", ".")) || 0;

    if (editingOrder) {
      setOrders((current) =>
        current.map((order) =>
          order.id === editingOrder.id
            ? {
                ...order,
                client: client.trim(),
                equipment: equipment.trim(),
                city,
                serviceType,
                description: description.trim(),
                date,
                technician: technician.trim(),
                value: numericValue,
                status,
                notes: notes.trim(),
              }
            : order
        )
      );
    } else {
      const newOrder: ServiceOrder = {
        id: Date.now(),
        client: client.trim(),
        equipment: equipment.trim(),
        city,
        serviceType,
        description: description.trim(),
        date,
        technician: technician.trim(),
        value: numericValue,
        status,
        notes: notes.trim(),
      };

      setOrders((current) => [
        newOrder,
        ...current,
      ]);
    }

    clearForm();
    setShowForm(false);
  }

  function deleteOrder(id: number) {
    const order = orders.find(
      (item) => item.id === id
    );

    if (!order) return;

    const confirmed = window.confirm(
      `Deseja realmente excluir a OS #${order.id}?`
    );

    if (!confirmed) return;

    setOrders((current) =>
      current.filter((item) => item.id !== id)
    );

    if (selectedOrder?.id === id) {
      setSelectedOrder(null);
      setShowDetails(false);
    }
  }

  function changeStatus(
    order: ServiceOrder,
    newStatus: ServiceOrder["status"]
  ) {
    setOrders((current) =>
      current.map((item) =>
        item.id === order.id
          ? {
              ...item,
              status: newStatus,
            }
          : item
      )
    );

    if (selectedOrder?.id === order.id) {
      setSelectedOrder({
        ...order,
        status: newStatus,
      });
    }
  }

  const totalValue = orders.reduce(
    (total, order) => total + order.value,
    0
  );

  const openOrders = orders.filter(
    (order) =>
      order.status === "Aberta" ||
      order.status === "Agendada"
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === "Concluída"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* CABEÇALHO */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500 p-3 text-white">
              <ClipboardList size={22} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Ordens de Serviço
              </h1>

              <p className="text-sm text-slate-500">
                Controle dos serviços e atendimentos
              </p>
            </div>
          </div>

          <button
            onClick={openNewOrder}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-600"
          >
            <Plus size={18} />

            <span className="hidden sm:inline">
              Nova ordem de serviço
            </span>

            <span className="sm:hidden">
              Nova OS
            </span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* CAMINHO */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <ArrowLeft size={16} />

          <span>ClimaPro</span>

          <span>/</span>

          <span className="font-medium text-slate-700">
            Ordens de Serviço
          </span>
        </div>

        {/* RESUMO */}
        <section className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total de OS
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {orders.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Em aberto
            </p>

            <p className="mt-2 text-2xl font-bold text-purple-600">
              {openOrders}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Concluídas
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {completedOrders}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Valor total
            </p>

            <p className="mt-2 text-2xl font-bold text-cyan-600">
              R${" "}
              {totalValue.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </section>

        {/* BUSCA E FILTROS */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Buscar cliente, equipamento, técnico ou serviço..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target
                      .value as "Todos" | ServiceOrder["status"]
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-cyan-400"
              >
                <option>Todos</option>

                {statuses.map((item) => (
                  <option key={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* LISTA */}
          <div className="divide-y divide-slate-100">
            {filteredOrders.length === 0 ? (
              <div className="p-10 text-center">
                <ClipboardList
                  size={36}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 font-medium text-slate-700">
                  Nenhuma ordem de serviço encontrada
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Tente alterar sua busca ou filtro.
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 transition hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    {/* INFORMAÇÕES */}
                    <button
                      onClick={() => openDetails(order)}
                      className="flex items-start gap-4 text-left"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                        <Wrench size={22} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-cyan-600">
                            OS #{order.id}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[order.status]}`}
                          >
                            {order.status}
                          </span>
                        </div>

                        <h3 className="mt-1 font-semibold text-slate-900">
                          {order.serviceType}
                        </h3>

                        <p className="mt-1 text-sm text-slate-600">
                          {order.description}
                        </p>

                        <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {order.client}
                          </span>

                          <span className="flex items-center gap-1">
                            <Snowflake size={14} />
                            {order.equipment}
                          </span>

                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {order.city}
                          </span>

                          <span className="flex items-center gap-1">
                            <CalendarDays size={14} />
                            {order.date || "Data não definida"}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* AÇÕES */}
                    <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        <p className="text-[11px] text-slate-400">
                          Técnico
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {order.technician || "Não definido"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-emerald-50 px-4 py-3">
                        <p className="text-[11px] text-emerald-500">
                          Valor
                        </p>

                        <p className="mt-1 text-sm font-semibold text-emerald-700">
                          R${" "}
                          {order.value.toLocaleString(
                            "pt-BR",
                            {
                              minimumFractionDigits: 2,
                            }
                          )}
                        </p>
                      </div>

                      <button
                        onClick={() => openEdit(order)}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-cyan-600"
                      >
                        <Edit size={16} />
                        Editar
                      </button>

                      <button
                        onClick={() =>
                          deleteOrder(order.id)
                        }
                        className="rounded-xl border border-slate-200 p-3 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        title="Excluir OS"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* AVISO */}
        <section className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50 p-5">
          <div className="flex gap-3">
            <Wrench
              size={20}
              className="mt-0.5 shrink-0 text-cyan-600"
            />

            <div>
              <h3 className="font-semibold text-cyan-900">
                Próxima etapa
              </h3>

              <p className="mt-1 text-sm text-cyan-800">
                Depois vamos conectar as ordens de serviço à
                agenda dos técnicos, aos equipamentos e ao
                histórico de manutenção.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* MODAL NOVA / EDITAR OS */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingOrder
                    ? "Editar ordem de serviço"
                    : "Nova ordem de serviço"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingOrder
                    ? "Altere os dados do atendimento."
                    : "Cadastre um novo serviço."}
                </p>
              </div>

              <button
                onClick={() => {
                  clearForm();
                  setShowForm(false);
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={saveOrder}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Cliente *
                  </label>

                  <input
                    value={client}
                    onChange={(event) =>
                      setClient(event.target.value)
                    }
                    placeholder="Ex.: João da Silva"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Equipamento *
                  </label>

                  <input
                    value={equipment}
                    onChange={(event) =>
                      setEquipment(event.target.value)
                    }
                    placeholder="Ex.: LG Dual Inverter"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
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
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Tipo de serviço
                  </label>

                  <select
                    value={serviceType}
                    onChange={(event) =>
                      setServiceType(
                        event.target
                          .value as ServiceOrder["serviceType"]
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  >
                    {serviceTypes.map((item) => (
                      <option key={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Descrição do serviço *
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Descreva o problema ou serviço solicitado..."
                  required
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Data
                  </label>

                  <input
                    value={date}
                    onChange={(event) =>
                      setDate(event.target.value)
                    }
                    placeholder="Ex.: 15/09/2026"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Técnico
                  </label>

                  <input
                    value={technician}
                    onChange={(event) =>
                      setTechnician(event.target.value)
                    }
                    placeholder="Ex.: Carlos"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Valor
                  </label>

                  <input
                    value={value}
                    onChange={(event) =>
                      setValue(event.target.value)
                    }
                    placeholder="Ex.: 250"
                    inputMode="decimal"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target
                        .value as ServiceOrder["status"]
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                >
                  {statuses.map((item) => (
                    <option key={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Observações
                </label>

                <textarea
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  placeholder="Informações adicionais..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    clearForm();
                    setShowForm(false);
                  }}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-white hover:bg-cyan-600"
                >
                  {editingOrder
                    ? "Salvar alterações"
                    : "Salvar OS"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALHES */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <ClipboardList size={23} />
                </div>

                <div>
                  <p className="text-xs font-bold text-cyan-600">
                    OS #{selectedOrder.id}
                  </p>

                  <h2 className="font-bold text-slate-900">
                    {selectedOrder.serviceType}
                  </h2>

                  <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[selectedOrder.status]}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowDetails(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Cliente
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedOrder.client}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Equipamento
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedOrder.equipment}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Cidade
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedOrder.city}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Data
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedOrder.date ||
                      "Não definida"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-xs text-blue-500">
                  Descrição
                </p>

                <p className="mt-1 text-sm font-medium text-blue-800">
                  {selectedOrder.description}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Técnico
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedOrder.technician ||
                      "Não definido"}
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-xs text-emerald-500">
                    Valor
                  </p>

                  <p className="mt-1 text-sm font-semibold text-emerald-700">
                    R${" "}
                    {selectedOrder.value.toLocaleString(
                      "pt-BR",
                      {
                        minimumFractionDigits: 2,
                      }
                    )}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Observações
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {selectedOrder.notes ||
                    "Nenhuma observação."}
                </p>
              </div>
            </div>

            {/* AÇÕES */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => {
                  setShowDetails(false);
                  openEdit(selectedOrder);
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-600"
              >
                <Edit size={16} />
                Editar
              </button>

              <button
                onClick={() =>
                  deleteOrder(selectedOrder.id)
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
                Excluir
              </button>
            </div>

            {/* ALTERAR STATUS */}
            <div className="mt-3">
              <p className="mb-2 text-xs font-medium text-slate-500">
                Alterar status
              </p>

              <div className="flex flex-wrap gap-2">
                {statuses.map((item) => (
                  <button
                    key={item}
                    onClick={() =>
                      changeStatus(
                        selectedOrder,
                        item
                      )
                    }
                    className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                      selectedOrder.status === item
                        ? statusStyles[item]
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INDICADOR */}
      <div className="fixed bottom-4 right-4 hidden items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg sm:flex">
        <CheckCircle2 size={15} />
        Sistema em desenvolvimento
      </div>
    </main>
  );
}
