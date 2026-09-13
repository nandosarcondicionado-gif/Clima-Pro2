"use client";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Edit,
  History,
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

type Equipment = {
  id: number;
  client: string;
  city: string;
  location: string;
  brand: string;
  model: string;
  btu: string;
  type: string;
  serial: string;
  lastService: string;
  nextService: string;
  status: "Ativo" | "Manutenção";
};

type Maintenance = {
  id: number;
  equipmentId: number;
  date: string;
  type: string;
  technician: string;
  problem: string;
  service: string;
  parts: string;
  value: string;
  observations: string;
  status: "Concluída" | "Em andamento";
};

const initialEquipment: Equipment[] = [
  {
    id: 1,
    client: "João da Silva",
    city: "Araraquara",
    location: "Quarto principal",
    brand: "LG",
    model: "Dual Inverter",
    btu: "12.000",
    type: "Split Inverter",
    serial: "LG123456",
    lastService: "10/08/2026",
    nextService: "10/11/2026",
    status: "Ativo",
  },
  {
    id: 2,
    client: "João da Silva",
    city: "Araraquara",
    location: "Sala",
    brand: "Samsung",
    model: "WindFree",
    btu: "18.000",
    type: "Split Inverter",
    serial: "SM789456",
    lastService: "05/07/2026",
    nextService: "05/10/2026",
    status: "Ativo",
  },
  {
    id: 3,
    client: "Clínica Saúde",
    city: "Araraquara",
    location: "Recepção",
    brand: "Daikin",
    model: "EcoSwing",
    btu: "24.000",
    type: "Split",
    serial: "DK456789",
    lastService: "15/06/2026",
    nextService: "15/09/2026",
    status: "Manutenção",
  },
];

const initialMaintenance: Maintenance[] = [
  {
    id: 1,
    equipmentId: 1,
    date: "10/08/2026",
    type: "Manutenção preventiva",
    technician: "Carlos Técnico",
    problem: "Equipamento apresentando acúmulo de sujeira.",
    service:
      "Limpeza completa, higienização dos filtros e verificação geral.",
    parts: "Nenhuma",
    value: "R$ 180,00",
    observations:
      "Equipamento funcionando normalmente após a manutenção.",
    status: "Concluída",
  },
  {
    id: 2,
    equipmentId: 1,
    date: "10/05/2026",
    type: "Manutenção preventiva",
    technician: "Carlos Técnico",
    problem: "Revisão periódica.",
    service:
      "Limpeza dos filtros, evaporadora e condensadora.",
    parts: "Nenhuma",
    value: "R$ 150,00",
    observations: "Sem problemas encontrados.",
    status: "Concluída",
  },
  {
    id: 3,
    equipmentId: 3,
    date: "15/06/2026",
    type: "Manutenção corretiva",
    technician: "Marcos Técnico",
    problem:
      "Equipamento não estava resfriando adequadamente.",
    service:
      "Verificação do sistema e correção do problema.",
    parts: "Capacitor",
    value: "R$ 320,00",
    observations:
      "Equipamento encaminhado para acompanhamento.",
    status: "Concluída",
  },
];

function formatMaintenanceDate(date: string) {
  if (!date) {
    return "";
  }

  if (date.includes("/")) {
    return date;
  }

  const parts = date.split("-");

  if (parts.length !== 3) {
    return date;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export default function EquipamentosPage() {
  const [equipment, setEquipment] =
    useState<Equipment[]>(initialEquipment);

  const [maintenance, setMaintenance] =
    useState<Maintenance[]>(initialMaintenance);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] =
    useState(false);

  const [editingEquipment, setEditingEquipment] =
    useState<Equipment | null>(null);

  const [selectedEquipment, setSelectedEquipment] =
    useState<Equipment | null>(null);

  const [maintenanceEquipment, setMaintenanceEquipment] =
    useState<Equipment | null>(null);

  // FORMULÁRIO EQUIPAMENTO
  const [client, setClient] = useState("");
  const [city, setCity] = useState("Araraquara");
  const [location, setLocation] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [btu, setBtu] = useState("12.000");
  const [type, setType] = useState("Split Inverter");
  const [serial, setSerial] = useState("");
  const [status, setStatus] =
    useState<Equipment["status"]>("Ativo");

  // FORMULÁRIO MANUTENÇÃO
  const [maintenanceDate, setMaintenanceDate] =
    useState("");

  const [maintenanceType, setMaintenanceType] =
    useState("Manutenção preventiva");

  const [maintenanceTechnician, setMaintenanceTechnician] =
    useState("");

  const [maintenanceProblem, setMaintenanceProblem] =
    useState("");

  const [maintenanceService, setMaintenanceService] =
    useState("");

  const [maintenanceParts, setMaintenanceParts] =
    useState("");

  const [maintenanceValue, setMaintenanceValue] =
    useState("");

  const [maintenanceObservations, setMaintenanceObservations] =
    useState("");

  const [maintenanceStatus, setMaintenanceStatus] =
    useState<Maintenance["status"]>("Concluída");

  const filteredEquipment = equipment.filter((item) => {
    const term = search.toLowerCase().trim();

    return (
      item.client.toLowerCase().includes(term) ||
      item.city.toLowerCase().includes(term) ||
      item.brand.toLowerCase().includes(term) ||
      item.model.toLowerCase().includes(term) ||
      item.serial.toLowerCase().includes(term) ||
      item.location.toLowerCase().includes(term) ||
      item.type.toLowerCase().includes(term)
    );
  });

  function clearForm() {
    setClient("");
    setCity("Araraquara");
    setLocation("");
    setBrand("");
    setModel("");
    setBtu("12.000");
    setType("Split Inverter");
    setSerial("");
    setStatus("Ativo");
    setEditingEquipment(null);
  }

  function openNewEquipment() {
    clearForm();
    setShowForm(true);
  }

  function openEdit(item: Equipment) {
    setEditingEquipment(item);

    setClient(item.client);
    setCity(item.city);
    setLocation(item.location);
    setBrand(item.brand);
    setModel(item.model);
    setBtu(item.btu);
    setType(item.type);
    setSerial(
      item.serial === "Não informado" ? "" : item.serial
    );
    setStatus(item.status);

    setShowForm(true);
  }

  function openDetails(item: Equipment) {
    setSelectedEquipment(item);
    setShowDetails(true);
  }

  function saveEquipment(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !client.trim() ||
      !brand.trim() ||
      !model.trim()
    ) {
      return;
    }

    if (editingEquipment) {
      setEquipment((current) =>
        current.map((item) =>
          item.id === editingEquipment.id
            ? {
                ...item,
                client: client.trim(),
                city,
                location: location.trim(),
                brand: brand.trim(),
                model: model.trim(),
                btu,
                type,
                serial:
                  serial.trim() || "Não informado",
                status,
              }
            : item
        )
      );

      if (selectedEquipment?.id === editingEquipment.id) {
        setSelectedEquipment({
          ...editingEquipment,
          client: client.trim(),
          city,
          location: location.trim(),
          brand: brand.trim(),
          model: model.trim(),
          btu,
          type,
          serial:
            serial.trim() || "Não informado",
          status,
        });
      }
    } else {
      const newEquipment: Equipment = {
        id: Date.now(),
        client: client.trim(),
        city,
        location: location.trim(),
        brand: brand.trim(),
        model: model.trim(),
        btu,
        type,
        serial:
          serial.trim() || "Não informado",
        lastService: "Ainda não realizado",
        nextService: "A definir",
        status,
      };

      setEquipment((current) => [
        newEquipment,
        ...current,
      ]);
    }

    clearForm();
    setShowForm(false);
  }

  function deleteEquipment(id: number) {
    const item = equipment.find(
      (equipmentItem) => equipmentItem.id === id
    );

    if (!item) {
      return;
    }

    const confirmed = window.confirm(
      `Deseja realmente excluir o equipamento ${item.brand} ${item.model}?`
    );

    if (!confirmed) {
      return;
    }

    setEquipment((current) =>
      current.filter(
        (equipmentItem) =>
          equipmentItem.id !== id
      )
    );

    setMaintenance((current) =>
      current.filter(
        (maintenanceItem) =>
          maintenanceItem.equipmentId !== id
      )
    );

    if (selectedEquipment?.id === id) {
      setSelectedEquipment(null);
      setShowDetails(false);
    }
  }

  function toggleStatus(item: Equipment) {
    const newStatus: Equipment["status"] =
      item.status === "Ativo"
        ? "Manutenção"
        : "Ativo";

    setEquipment((current) =>
      current.map((equipmentItem) =>
        equipmentItem.id === item.id
          ? {
              ...equipmentItem,
              status: newStatus,
            }
          : equipmentItem
      )
    );

    if (selectedEquipment?.id === item.id) {
      setSelectedEquipment({
        ...item,
        status: newStatus,
      });
    }
  }

  function openMaintenanceForm(item: Equipment) {
    setMaintenanceEquipment(item);

    setMaintenanceDate("");
    setMaintenanceType("Manutenção preventiva");
    setMaintenanceTechnician("");
    setMaintenanceProblem("");
    setMaintenanceService("");
    setMaintenanceParts("");
    setMaintenanceValue("");
    setMaintenanceObservations("");
    setMaintenanceStatus("Concluída");

    setShowMaintenanceForm(true);
  }

  function closeMaintenanceForm() {
    setShowMaintenanceForm(false);
    setMaintenanceEquipment(null);
  }

  function saveMaintenance(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !maintenanceEquipment ||
      !maintenanceDate ||
      !maintenanceTechnician.trim() ||
      !maintenanceService.trim()
    ) {
      return;
    }

    const formattedDate =
      formatMaintenanceDate(maintenanceDate);

    const newMaintenance: Maintenance = {
      id: Date.now(),
      equipmentId: maintenanceEquipment.id,
      date: formattedDate,
      type: maintenanceType,
      technician: maintenanceTechnician.trim(),
      problem:
        maintenanceProblem.trim() ||
        "Não informado",
      service: maintenanceService.trim(),
      parts:
        maintenanceParts.trim() || "Nenhuma",
      value:
        maintenanceValue.trim() || "R$ 0,00",
      observations:
        maintenanceObservations.trim() ||
        "Nenhuma observação.",
      status: maintenanceStatus,
    };

    setMaintenance((current) => [
      newMaintenance,
      ...current,
    ]);

    if (maintenanceStatus === "Concluída") {
      setEquipment((current) =>
        current.map((item) =>
          item.id === maintenanceEquipment.id
            ? {
                ...item,
                lastService: formattedDate,
              }
            : item
        )
      );

      setSelectedEquipment((current) =>
        current?.id === maintenanceEquipment.id
          ? {
              ...current,
              lastService: formattedDate,
            }
          : current
      );
    }

    closeMaintenanceForm();
  }

  const selectedMaintenance = selectedEquipment
    ? maintenance.filter(
        (item) =>
          item.equipmentId === selectedEquipment.id
      )
    : [];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* CABEÇALHO */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500 p-3 text-white">
              <Snowflake size={22} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Equipamentos
              </h1>

              <p className="text-sm text-slate-500">
                Controle dos aparelhos dos clientes
              </p>
            </div>
          </div>

          <button
            onClick={openNewEquipment}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-600"
          >
            <Plus size={18} />

            <span className="hidden sm:inline">
              Novo equipamento
            </span>

            <span className="sm:hidden">
              Novo
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
            Equipamentos
          </span>
        </div>

        {/* RESUMO */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total de equipamentos
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {equipment.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Equipamentos ativos
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {
                equipment.filter(
                  (item) => item.status === "Ativo"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Em manutenção
            </p>

            <p className="mt-2 text-2xl font-bold text-amber-600">
              {
                equipment.filter(
                  (item) =>
                    item.status === "Manutenção"
                ).length
              }
            </p>
          </div>
        </section>

        {/* BUSCA E LISTA */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                placeholder="Buscar cliente, marca, modelo, série ou ambiente..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredEquipment.length === 0 ? (
              <div className="p-10 text-center">
                <Snowflake
                  size={34}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 font-medium text-slate-700">
                  Nenhum equipamento encontrado
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Tente outra busca.
                </p>
              </div>
            ) : (
              filteredEquipment.map((item) => (
                <div
                  key={item.id}
                  className="p-5 transition hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    {/* INFORMAÇÕES */}
                    <button
                      onClick={() =>
                        openDetails(item)
                      }
                      className="flex items-start gap-4 text-left"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                        <Snowflake size={22} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">
                            {item.brand}{" "}
                            {item.model}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              item.status ===
                              "Ativo"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
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
                            <Building2 size={14} />
                            {item.location ||
                              "Local não informado"}
                          </span>

                          <span>
                            {item.btu} BTUs •{" "}
                            {item.type}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-slate-400">
                          Nº de série: {item.serial}
                        </p>
                      </div>
                    </button>

                    {/* AÇÕES */}
                    <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        <p className="text-[11px] text-slate-400">
                          Próxima manutenção
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {item.nextService}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          openEdit(item)
                        }
                        className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-cyan-600"
                      >
                        <Edit size={16} />
                        Editar
                      </button>

                      <button
                        onClick={() =>
                          deleteEquipment(item.id)
                        }
                        className="rounded-xl border border-slate-200 p-3 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        title="Excluir equipamento"
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
                Controle de manutenção
              </h3>

              <p className="mt-1 text-sm text-cyan-800">
                Os equipamentos agora possuem histórico
                de manutenção. Nas próximas etapas,
                esse histórico será ligado às ordens de
                serviço e ao Supabase.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* MODAL NOVO / EDITAR EQUIPAMENTO */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingEquipment
                    ? "Editar equipamento"
                    : "Novo equipamento"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingEquipment
                    ? "Altere os dados do equipamento."
                    : "Cadastre o aparelho do cliente."}
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
              onSubmit={saveEquipment}
              className="space-y-4"
            >
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-cyan-400"
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
                    Ambiente
                  </label>

                  <input
                    value={location}
                    onChange={(event) =>
                      setLocation(event.target.value)
                    }
                    placeholder="Ex.: Sala"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Marca *
                  </label>

                  <input
                    value={brand}
                    onChange={(event) =>
                      setBrand(event.target.value)
                    }
                    placeholder="Ex.: Daikin"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Modelo *
                  </label>

                  <input
                    value={model}
                    onChange={(event) =>
                      setModel(event.target.value)
                    }
                    placeholder="Ex.: EcoSwing"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Capacidade
                  </label>

                  <select
                    value={btu}
                    onChange={(event) =>
                      setBtu(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  >
                    <option>9.000</option>
                    <option>12.000</option>
                    <option>18.000</option>
                    <option>24.000</option>
                    <option>30.000</option>
                    <option>36.000</option>
                    <option>48.000</option>
                    <option>60.000</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Tipo
                  </label>

                  <select
                    value={type}
                    onChange={(event) =>
                      setType(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  >
                    <option>
                      Split Inverter
                    </option>
                    <option>Split</option>
                    <option>Janela</option>
                    <option>Piso Teto</option>
                    <option>Cassete</option>
                    <option>VRF</option>
                    <option>Chiller</option>
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
                          .value as Equipment["status"]
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  >
                    <option>Ativo</option>
                    <option>Manutenção</option>
                  </select>
                </div>
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
                  placeholder="Ex.: ABC123456"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
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
                  {editingEquipment
                    ? "Salvar alterações"
                    : "Salvar equipamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALHES DO EQUIPAMENTO */}
      {showDetails && selectedEquipment && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <Snowflake size={23} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    {selectedEquipment.brand}{" "}
                    {selectedEquipment.model}
                  </h2>

                  <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                      selectedEquipment.status ===
                      "Ativo"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {selectedEquipment.status}
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

            {/* DADOS DO EQUIPAMENTO */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Cliente
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedEquipment.client}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Cidade
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedEquipment.city}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Ambiente
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedEquipment.location ||
                    "Não informado"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Tipo
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedEquipment.type}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Capacidade
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedEquipment.btu} BTUs
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Número de série
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedEquipment.serial}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-xs text-blue-500">
                  Última manutenção
                </p>

                <p className="mt-1 text-sm font-semibold text-blue-700">
                  {selectedEquipment.lastService}
                </p>
              </div>

              <div className="rounded-xl bg-cyan-50 p-4">
                <p className="text-xs text-cyan-500">
                  Próxima manutenção
                </p>

                <p className="mt-1 text-sm font-semibold text-cyan-700">
                  {selectedEquipment.nextService}
                </p>
              </div>
            </div>

            {/* HISTÓRICO DE MANUTENÇÃO */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white">
              <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-cyan-50 p-2 text-cyan-600">
                    <History size={19} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Histórico de manutenção
                    </h3>

                    <p className="text-xs text-slate-500">
                      {selectedMaintenance.length}{" "}
                      registro(s) encontrado(s)
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    openMaintenanceForm(
                      selectedEquipment
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-600"
                >
                  <Plus size={15} />
                  Nova manutenção
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {selectedMaintenance.length === 0 ? (
                  <div className="p-6 text-center">
                    <History
                      size={30}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-2 text-sm font-medium text-slate-600">
                      Nenhuma manutenção registrada
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Cadastre a primeira manutenção
                      deste equipamento.
                    </p>
                  </div>
                ) : (
                  selectedMaintenance.map(
                    (item) => (
                      <div
                        key={item.id}
                        className="p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1 rounded-lg bg-slate-100 p-2 text-slate-600">
                            <Wrench size={16} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-semibold text-slate-900">
                                {item.type}
                              </h4>

                              <span
                                className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                                  item.status ===
                                  "Concluída"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>

                            <div className="mt-2 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                              <p className="flex items-center gap-1">
                                <CalendarDays
                                  size={13}
                                />
                                {item.date}
                              </p>

                              <p>
                                <strong>
                                  Técnico:
                                </strong>{" "}
                                {item.technician}
                              </p>

                              <p>
                                <strong>
                                  Valor:
                                </strong>{" "}
                                {item.value}
                              </p>

                              <p>
                                <strong>
                                  Peças:
                                </strong>{" "}
                                {item.parts}
                              </p>
                            </div>

                            <div className="mt-3 rounded-xl bg-slate-50 p-3">
                              <p className="text-[11px] font-semibold text-slate-500">
                                Serviço realizado
                              </p>

                              <p className="mt-1 text-xs leading-5 text-slate-700">
                                {item.service}
                              </p>
                            </div>

                            {item.problem !==
                              "Não informado" && (
                              <div className="mt-2 rounded-xl bg-red-50 p-3">
                                <p className="text-[11px] font-semibold text-red-600">
                                  Problema encontrado
                                </p>

                                <p className="mt-1 text-xs leading-5 text-red-800">
                                  {item.problem}
                                </p>
                              </div>
                            )}

                            {item.observations !==
                              "Nenhuma observação." && (
                              <div className="mt-2 rounded-xl bg-blue-50 p-3">
                                <p className="text-[11px] font-semibold text-blue-600">
                                  Observações
                                </p>

                                <p className="mt-1 text-xs leading-5 text-blue-800">
                                  {item.observations}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>

            {/* AÇÕES */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <button
                onClick={() => {
                  setShowDetails(false);
                  openEdit(selectedEquipment);
                }}
                className="rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-600"
              >
                Editar
              </button>

              <button
                onClick={() =>
                  toggleStatus(selectedEquipment)
                }
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {selectedEquipment.status ===
                "Ativo"
                  ? "Enviar manutenção"
                  : "Marcar ativo"}
              </button>

              <button
                onClick={() =>
                  deleteEquipment(
                    selectedEquipment.id
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

      {/* MODAL NOVA MANUTENÇÃO */}
      {showMaintenanceForm &&
        maintenanceEquipment && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4">
            <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ClipboardCheck
                      size={21}
                      className="text-cyan-600"
                    />

                    <h2 className="text-xl font-bold text-slate-900">
                      Nova manutenção
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {maintenanceEquipment.brand}{" "}
                    {maintenanceEquipment.model}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Cliente:{" "}
                    {maintenanceEquipment.client}
                  </p>
                </div>

                <button
                  onClick={
                    closeMaintenanceForm
                  }
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={saveMaintenance}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Data *
                    </label>

                    <input
                      type="date"
                      value={maintenanceDate}
                      onChange={(event) =>
                        setMaintenanceDate(
                          event.target.value
                        )
                      }
                      required
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Tipo de manutenção
                    </label>

                    <select
                      value={maintenanceType}
                      onChange={(event) =>
                        setMaintenanceType(
                          event.target.value
                        )
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
                        Visita técnica
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Técnico responsável *
                  </label>

                  <input
                    value={maintenanceTechnician}
                    onChange={(event) =>
                      setMaintenanceTechnician(
                        event.target.value
                      )
                    }
                    placeholder="Ex.: Carlos Técnico"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Problema encontrado
                  </label>

                  <textarea
                    value={maintenanceProblem}
                    onChange={(event) =>
                      setMaintenanceProblem(
                        event.target.value
                      )
                    }
                    placeholder="Descreva o problema encontrado..."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Serviço realizado *
                  </label>

                  <textarea
                    value={maintenanceService}
                    onChange={(event) =>
                      setMaintenanceService(
                        event.target.value
                      )
                    }
                    placeholder="Descreva o serviço realizado..."
                    rows={3}
                    required
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Peças utilizadas
                    </label>

                    <input
                      value={maintenanceParts}
                      onChange={(event) =>
                        setMaintenanceParts(
                          event.target.value
                        )
                      }
                      placeholder="Ex.: Capacitor, filtro..."
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Valor
                    </label>

                    <input
                      value={maintenanceValue}
                      onChange={(event) =>
                        setMaintenanceValue(
                          event.target.value
                        )
                      }
                      placeholder="Ex.: R$ 250,00"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Status
                  </label>

                  <select
                    value={maintenanceStatus}
                    onChange={(event) =>
                      setMaintenanceStatus(
                        event.target
                          .value as Maintenance["status"]
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  >
                    <option>Concluída</option>
                    <option>Em andamento</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Observações
                  </label>

                  <textarea
                    value={
                      maintenanceObservations
                    }
                    onChange={(event) =>
                      setMaintenanceObservations(
                        event.target.value
                      )
                    }
                    placeholder="Informações adicionais..."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={
                      closeMaintenanceForm
                    }
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-white hover:bg-cyan-600"
                  >
                    Salvar manutenção
                  </button>
                </div>
              </form>
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
