"use client";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Edit,
  Eye,
  FileText,
  Plus,
  Search,
  Snowflake,
  Trash2,
  User,
  Wrench,
  X,
  DollarSign,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";

type MaintenanceStatus =
  | "Concluída"
  | "Em andamento"
  | "Cancelada";

type Maintenance = {
  id: number;
  date: string;
  client: string;
  city: string;
  equipment: string;
  serial: string;
  technician: string;
  type: string;
  status: MaintenanceStatus;
  problem: string;
  service: string;
  parts: string;
  observations: string;
  value: string;
  nextMaintenance: string;
};

const initialMaintenance: Maintenance[] = [
  {
    id: 1,
    date: "10/08/2026",
    client: "João da Silva",
    city: "Araraquara",
    equipment: "LG Dual Inverter 12.000 BTUs",
    serial: "LG123456",
    technician: "Carlos",
    type: "Manutenção preventiva",
    status: "Concluída",
    problem: "Equipamento apresentando redução no fluxo de ar.",
    service:
      "Limpeza completa, higienização da evaporadora e condensadora, verificação elétrica e teste de funcionamento.",
    parts: "Nenhuma peça substituída.",
    observations:
      "Equipamento funcionando normalmente após a manutenção.",
    value: "180,00",
    nextMaintenance: "10/11/2026",
  },
  {
    id: 2,
    date: "05/07/2026",
    client: "João da Silva",
    city: "Araraquara",
    equipment: "Samsung WindFree 18.000 BTUs",
    serial: "SM789456",
    technician: "Marcos",
    type: "Manutenção preventiva",
    status: "Concluída",
    problem: "Manutenção preventiva programada.",
    service:
      "Limpeza, higienização, inspeção dos filtros e teste de rendimento.",
    parts: "Filtro higienizado.",
    observations: "Sem anormalidades.",
    value: "220,00",
    nextMaintenance: "05/10/2026",
  },
  {
    id: 3,
    date: "15/06/2026",
    client: "Clínica Saúde",
    city: "Araraquara",
    equipment: "Daikin EcoSwing 24.000 BTUs",
    serial: "DK456789",
    technician: "Carlos",
    type: "Manutenção corretiva",
    status: "Concluída",
    problem: "Equipamento não estava refrigerando corretamente.",
    service:
      "Diagnóstico do sistema, limpeza e correção do problema de funcionamento.",
    parts: "Capacitor substituído.",
    observations:
      "Após o reparo, equipamento voltou a operar normalmente.",
    value: "480,00",
    nextMaintenance: "15/09/2026",
  },
];

export default function HistoricoManutencaoPage() {
  const [maintenance, setMaintenance] =
    useState<Maintenance[]>(initialMaintenance);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"Todos" | MaintenanceStatus>("Todos");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [editingMaintenance, setEditingMaintenance] =
    useState<Maintenance | null>(null);

  const [selectedMaintenance, setSelectedMaintenance] =
    useState<Maintenance | null>(null);

  const [date, setDate] = useState("");
  const [client, setClient] = useState("");
  const [city, setCity] = useState("Araraquara");
  const [equipment, setEquipment] = useState("");
  const [serial, setSerial] = useState("");
  const [technician, setTechnician] = useState("");
  const [type, setType] = useState(
    "Manutenção preventiva"
  );
  const [status, setStatus] =
    useState<MaintenanceStatus>("Concluída");
  const [problem, setProblem] = useState("");
  const [service, setService] = useState("");
  const [parts, setParts] = useState("");
  const [observations, setObservations] = useState("");
  const [value, setValue] = useState("");
  const [nextMaintenance, setNextMaintenance] =
    useState("");

  const filteredMaintenance = maintenance.filter((item) => {
    const term = search.toLowerCase().trim();

    const matchesSearch =
      item.client.toLowerCase().includes(term) ||
      item.city.toLowerCase().includes(term) ||
      item.equipment.toLowerCase().includes(term) ||
      item.serial.toLowerCase().includes(term) ||
      item.technician.toLowerCase().includes(term) ||
      item.type.toLowerCase().includes(term) ||
      item.problem.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === "Todos" ||
      item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  function clearForm() {
    setDate("");
    setClient("");
    setCity("Araraquara");
    setEquipment("");
    setSerial("");
    setTechnician("");
    setType("Manutenção preventiva");
    setStatus("Concluída");
    setProblem("");
    setService("");
    setParts("");
    setObservations("");
    setValue("");
    setNextMaintenance("");
    setEditingMaintenance(null);
  }

  function openNewMaintenance() {
    clearForm();
    setShowForm(true);
  }

  function openEdit(item: Maintenance) {
    setEditingMaintenance(item);

    setDate(item.date);
    setClient(item.client);
    setCity(item.city);
    setEquipment(item.equipment);
    setSerial(item.serial);
    setTechnician(item.technician);
    setType(item.type);
    setStatus(item.status);
    setProblem(item.problem);
    setService(item.service);
    setParts(item.parts);
    setObservations(item.observations);
    setValue(item.value);
    setNextMaintenance(item.nextMaintenance);

    setShowForm(true);
  }

  function openDetails(item: Maintenance) {
    setSelectedMaintenance(item);
    setShowDetails(true);
  }

  function saveMaintenance(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !date.trim() ||
      !client.trim() ||
      !equipment.trim() ||
      !technician.trim() ||
      !problem.trim() ||
      !service.trim()
    ) {
      return;
    }

    if (editingMaintenance) {
      setMaintenance((current) =>
        current.map((item) =>
          item.id === editingMaintenance.id
            ? {
                ...item,
                date: date.trim(),
                client: client.trim(),
                city,
                equipment: equipment.trim(),
                serial:
                  serial.trim() || "Não informado",
                technician: technician.trim(),
                type,
                status,
                problem: problem.trim(),
                service: service.trim(),
                parts:
                  parts.trim() ||
                  "Nenhuma peça substituída.",
                observations:
                  observations.trim() ||
                  "Sem observações.",
                value: value.trim() || "0,00",
                nextMaintenance:
                  nextMaintenance.trim() ||
                  "A definir",
              }
            : item
        )
      );
    } else {
      const newMaintenance: Maintenance = {
        id: Date.now(),
        date: date.trim(),
        client: client.trim(),
        city,
        equipment: equipment.trim(),
        serial:
          serial.trim() || "Não informado",
        technician: technician.trim(),
        type,
        status,
        problem: problem.trim(),
        service: service.trim(),
        parts:
          parts.trim() ||
          "Nenhuma peça substituída.",
        observations:
          observations.trim() ||
          "Sem observações.",
        value: value.trim() || "0,00",
        nextMaintenance:
          nextMaintenance.trim() || "A definir",
      };

      setMaintenance((current) => [
        newMaintenance,
        ...current,
      ]);
    }

    clearForm();
    setShowForm(false);
  }

  function deleteMaintenance(id: number) {
    const item = maintenance.find(
      (maintenanceItem) =>
        maintenanceItem.id === id
    );

    if (!item) {
      return;
    }

    const confirmed = window.confirm(
      `Deseja realmente excluir o registro de manutenção de ${item.client}?`
    );

    if (!confirmed) {
      return;
    }

    setMaintenance((current) =>
      current.filter(
        (maintenanceItem) =>
          maintenanceItem.id !== id
      )
    );

    if (selectedMaintenance?.id === id) {
      setSelectedMaintenance(null);
      setShowDetails(false);
    }
  }

  const totalMaintenance = maintenance.length;

  const completedMaintenance =
    maintenance.filter(
      (item) => item.status === "Concluída"
    ).length;

  const inProgressMaintenance =
    maintenance.filter(
      (item) => item.status === "Em andamento"
    ).length;

  const totalValue = maintenance.reduce(
    (total, item) => {
      const number = Number(
        item.value
          .replace(/\./g, "")
          .replace(",", ".")
      );

      return total + (isNaN(number) ? 0 : number);
    },
    0
  );

  const formattedTotalValue =
    totalValue.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  function statusClass(
    itemStatus: MaintenanceStatus
  ) {
    if (itemStatus === "Concluída") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (itemStatus === "Em andamento") {
      return "bg-blue-50 text-blue-700";
    }

    return "bg-red-50 text-red-700";
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* CABEÇALHO */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500 p-3 text-white">
              <Wrench size={22} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Histórico de manutenção
              </h1>

              <p className="text-sm text-slate-500">
                Registro dos serviços realizados nos equipamentos
              </p>
            </div>
          </div>

          <button
            onClick={openNewMaintenance}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-600"
          >
            <Plus size={18} />

            <span className="hidden sm:inline">
              Nova manutenção
            </span>

            <span className="sm:hidden">
              Nova
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
            Histórico de manutenção
          </span>
        </div>

        {/* RESUMO */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Total de serviços
              </p>

              <div className="rounded-lg bg-cyan-50 p-2 text-cyan-600">
                <ClipboardList size={18} />
              </div>
            </div>

            <p className="mt-3 text-2xl font-bold text-slate-900">
              {totalMaintenance}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Concluídas
              </p>

              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <CheckCircle2 size={18} />
              </div>
            </div>

            <p className="mt-3 text-2xl font-bold text-emerald-600">
              {completedMaintenance}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Em andamento
              </p>

              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <Wrench size={18} />
              </div>
            </div>

            <p className="mt-3 text-2xl font-bold text-blue-600">
              {inProgressMaintenance}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Valor registrado
              </p>

              <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                <DollarSign size={18} />
              </div>
            </div>

            <p className="mt-3 text-2xl font-bold text-slate-900">
              R$ {formattedTotalValue}
            </p>
          </div>
        </section>

        {/* BUSCA E FILTROS */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                  placeholder="Buscar cliente, equipamento, técnico ou problema..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as
                      | "Todos"
                      | MaintenanceStatus
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-cyan-400"
              >
                <option value="Todos">
                  Todos os status
                </option>

                <option value="Concluída">
                  Concluídas
                </option>

                <option value="Em andamento">
                  Em andamento
                </option>

                <option value="Cancelada">
                  Canceladas
                </option>
              </select>
            </div>
          </div>

          {/* LISTA */}
          <div className="divide-y divide-slate-100">
            {filteredMaintenance.length === 0 ? (
              <div className="p-10 text-center">
                <Wrench
                  size={36}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 font-medium text-slate-700">
                  Nenhuma manutenção encontrada
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Tente outra busca ou cadastre uma nova manutenção.
                </p>
              </div>
            ) : (
              filteredMaintenance.map((item) => (
                <div
                  key={item.id}
                  className="p-5 transition hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    {/* INFORMAÇÕES */}
                    <button
                      onClick={() => openDetails(item)}
                      className="flex items-start gap-4 text-left"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                        <Snowflake size={22} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">
                            {item.equipment}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <div className="mt-2 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                          <span className="flex items-center gap-1">
                            <User size={14} />

                            {item.client}
                          </span>

                          <span className="flex items-center gap-1">
                            <MapPin size={14} />

                            {item.city}
                          </span>

                          <span className="flex items-center gap-1">
                            <CalendarDays size={14} />

                            {item.date}
                          </span>

                          <span className="flex items-center gap-1">
                            <Wrench size={14} />

                            Técnico: {item.technician}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-slate-400">
                          {item.type} • Série: {item.serial}
                        </p>

                        <p className="mt-2 max-w-2xl text-sm text-slate-600">
                          {item.problem}
                        </p>
                      </div>
                    </button>

                    {/* AÇÕES */}
                    <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        <p className="text-[11px] text-slate-400">
                          Valor
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          R$ {item.value}
                        </p>
                      </div>

                      <button
                        onClick={() => openDetails(item)}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-cyan-600"
                      >
                        <Eye size={16} />

                        Ver
                      </button>

                      <button
                        onClick={() => openEdit(item)}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-cyan-600"
                      >
                        <Edit size={16} />

                        Editar
                      </button>

                      <button
                        onClick={() =>
                          deleteMaintenance(item.id)
                        }
                        className="rounded-xl border border-slate-200 p-3 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        title="Excluir manutenção"
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
              className="mt-0.5 shrink-0 text-cyan-600"
              size={20}
            />

            <div>
              <h3 className="font-semibold text-cyan-900">
                Histórico preparado para as próximas etapas
              </h3>

              <p className="mt-1 text-sm text-cyan-800">
                Depois vamos ligar este histórico às ordens de
                serviço, equipamentos, clientes, técnicos e ao
                banco de dados do Supabase.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* MODAL NOVA / EDITAR MANUTENÇÃO */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingMaintenance
                    ? "Editar manutenção"
                    : "Nova manutenção"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Registre todos os detalhes do atendimento.
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
              onSubmit={saveMaintenance}
              className="space-y-5"
            >
              {/* DADOS PRINCIPAIS */}
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
                  Dados do atendimento
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Data *
                    </label>

                    <input
                      value={date}
                      onChange={(event) =>
                        setDate(event.target.value)
                      }
                      placeholder="Ex.: 20/08/2026"
                      required
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Técnico *
                    </label>

                    <input
                      value={technician}
                      onChange={(event) =>
                        setTechnician(event.target.value)
                      }
                      placeholder="Ex.: Carlos"
                      required
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>
                </div>
              </div>

              {/* CLIENTE E EQUIPAMENTO */}
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
                  Cliente e equipamento
                </h3>

                <div className="space-y-4">
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
                        <option>
                          Américo Brasiliense
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Número de série
                      </label>

                      <input
                        value={serial}
                        onChange={(event) =>
                          setSerial(event.target.value)
                        }
                        placeholder="Ex.: LG123456"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                      />
                    </div>
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
                      placeholder="Ex.: LG Dual Inverter 12.000 BTUs"
                      required
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>
                </div>
              </div>

              {/* TIPO E STATUS */}
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
                  Classificação
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Tipo de manutenção
                    </label>

                    <select
                      value={type}
                      onChange={(event) =>
                        setType(event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    >
                      <option>
                        Manutenção preventiva
                      </option>

                      <option>
                        Manutenção corretiva
                      </option>

                      <option>
                        Higienização
                      </option>

                      <option>
                        Instalação
                      </option>

                      <option>
                        Avaliação técnica
                      </option>
                    </select>
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
                            .value as MaintenanceStatus
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    >
                      <option>
                        Concluída
                      </option>

                      <option>
                        Em andamento
                      </option>

                      <option>
                        Cancelada
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* PROBLEMA */}
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <AlertTriangle size={16} />
                  Problema encontrado *
                </label>

                <textarea
                  value={problem}
                  onChange={(event) =>
                    setProblem(event.target.value)
                  }
                  placeholder="Descreva o problema encontrado no equipamento..."
                  required
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              {/* SERVIÇO */}
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Wrench size={16} />
                  Serviço realizado *
                </label>

                <textarea
                  value={service}
                  onChange={(event) =>
                    setService(event.target.value)
                  }
                  placeholder="Descreva tudo que foi realizado pelo técnico..."
                  required
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              {/* PEÇAS */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Peças utilizadas
                </label>

                <textarea
                  value={parts}
                  onChange={(event) =>
                    setParts(event.target.value)
                  }
                  placeholder="Ex.: Capacitor 35uF, filtro, parafusos..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              {/* OBSERVAÇÕES */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Observações
                </label>

                <textarea
                  value={observations}
                  onChange={(event) =>
                    setObservations(event.target.value)
                  }
                  placeholder="Outras informações importantes..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              {/* FINANCEIRO E PRÓXIMA MANUTENÇÃO */}
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
                  Financeiro e próxima manutenção
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Valor do serviço
                    </label>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                        R$
                      </span>

                      <input
                        value={value}
                        onChange={(event) =>
                          setValue(event.target.value)
                        }
                        placeholder="Ex.: 180,00"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 pl-11 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Próxima manutenção
                    </label>

                    <input
                      value={nextMaintenance}
                      onChange={(event) =>
                        setNextMaintenance(
                          event.target.value
                        )
                      }
                      placeholder="Ex.: 20/11/2026"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>
                </div>
              </div>

              {/* BOTÕES */}
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
                  {editingMaintenance
                    ? "Salvar alterações"
                    : "Salvar manutenção"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALHES */}
      {showDetails && selectedMaintenance && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <Wrench size={23} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Histórico da manutenção
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedMaintenance.equipment}
                  </p>

                  <span
                    className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                      selectedMaintenance.status
                    )}`}
                  >
                    {selectedMaintenance.status}
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  setShowDetails(false)
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Cliente
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedMaintenance.client}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Cidade
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedMaintenance.city}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Data
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedMaintenance.date}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Técnico
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedMaintenance.technician}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs text-slate-400">
                  Equipamento
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedMaintenance.equipment}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Série: {selectedMaintenance.serial}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-xs font-semibold text-amber-600">
                  Problema encontrado
                </p>

                <p className="mt-2 text-sm leading-6 text-amber-900">
                  {selectedMaintenance.problem}
                </p>
              </div>

              <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-4">
                <p className="text-xs font-semibold text-cyan-600">
                  Serviço realizado
                </p>

                <p className="mt-2 text-sm leading-6 text-cyan-900">
                  {selectedMaintenance.service}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Peças utilizadas
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {selectedMaintenance.parts}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Observações
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {selectedMaintenance.observations}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-xs text-emerald-600">
                  Valor do serviço
                </p>

                <p className="mt-1 text-lg font-bold text-emerald-700">
                  R$ {selectedMaintenance.value}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-xs text-blue-600">
                  Próxima manutenção
                </p>

                <p className="mt-1 text-lg font-bold text-blue-700">
                  {selectedMaintenance.nextMaintenance}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <button
                onClick={() => {
                  setShowDetails(false);
                  openEdit(selectedMaintenance);
                }}
                className="rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-600"
              >
                Editar
              </button>

              <button
                onClick={() =>
                  setShowDetails(false)
                }
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Fechar
              </button>

              <button
                onClick={() =>
                  deleteMaintenance(
                    selectedMaintenance.id
                  )
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />

                Excluir
              </button>
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
