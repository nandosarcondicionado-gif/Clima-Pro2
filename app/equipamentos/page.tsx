"use client";

import {
  Building2,
  CalendarDays,
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
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Client = {
  id: string;
  nome: string;
  cidade: string;
};

type Equipment = {
  id: string;
  cliente_id: string;
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
  id: string;
  equipamento_id: string;
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

function formatDate(date: string | null) {
  if (!date) return "Não informado";

  const parts = date.split("-");

  if (parts.length !== 3) return date;

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatMoney(value: string) {
  const number = Number(value || 0);

  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function EquipamentosPage() {
  const supabase = createClient();

  const [clients, setClients] = useState<Client[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  // EQUIPAMENTO
  const [clientId, setClientId] = useState("");
  const [location, setLocation] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [btu, setBtu] = useState("12.000");
  const [type, setType] = useState("Split Inverter");
  const [serial, setSerial] = useState("");
  const [status, setStatus] =
    useState<Equipment["status"]>("Ativo");

  // MANUTENÇÃO
  const [maintenanceDate, setMaintenanceDate] = useState("");
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

  async function loadData() {
    setLoading(true);

    const [clientsResult, equipmentResult, maintenanceResult] =
      await Promise.all([
        supabase
          .from("clientes")
          .select("id,nome,cidade")
          .order("nome"),

        supabase
          .from("equipamentos")
          .select(`
            id,
            cliente_id,
            ambiente,
            marca,
            modelo,
            btu,
            tipo,
            numero_serie,
            ultima_manutencao,
            proxima_manutencao,
            status,
            clientes (
              nome,
              cidade
            )
          `)
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("manutencoes_equipamentos")
          .select("*")
          .order("data", {
            ascending: false,
          }),
      ]);

    if (clientsResult.error) {
      console.error(clientsResult.error);
    }

    if (equipmentResult.error) {
      console.error(equipmentResult.error);
      alert(
        "Erro ao carregar os equipamentos: " +
          equipmentResult.error.message
      );
    }

    if (maintenanceResult.error) {
      console.error(maintenanceResult.error);
    }

    setClients(
      (clientsResult.data || []) as Client[]
    );

    const mappedEquipment: Equipment[] =
      (equipmentResult.data || []).map(
        (item: any) => ({
          id: item.id,
          cliente_id: item.cliente_id,
          client: item.clientes?.nome || "Cliente não encontrado",
          city: item.clientes?.cidade || "",
          location: item.ambiente || "",
          brand: item.marca || "",
          model: item.modelo || "",
          btu: item.btu || "",
          type: item.tipo || "",
          serial: item.numero_serie || "Não informado",
          lastService: formatDate(
            item.ultima_manutencao
          ),
          nextService: formatDate(
            item.proxima_manutencao
          ),
          status: item.status,
        })
      );

    setEquipment(mappedEquipment);

    const mappedMaintenance: Maintenance[] =
      (maintenanceResult.data || []).map(
        (item: any) => ({
          id: item.id,
          equipamento_id: item.equipamento_id,
          date: formatDate(item.data),
          type: item.tipo,
          technician: item.tecnico,
          problem:
            item.problema || "Não informado",
          service: item.servico,
          parts: item.pecas || "Nenhuma",
          value: formatMoney(item.valor),
          observations:
            item.observacoes ||
            "Nenhuma observação.",
          status: item.status,
        })
      );

    setMaintenance(mappedMaintenance);

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function clearEquipmentForm() {
    setClientId("");
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
    clearEquipmentForm();
    setShowForm(true);
  }

  function openEdit(item: Equipment) {
    setEditingEquipment(item);

    setClientId(item.cliente_id);
    setLocation(item.location);
    setBrand(item.brand);
    setModel(item.model);
    setBtu(item.btu);
    setType(item.type);
    setSerial(
      item.serial === "Não informado"
        ? ""
        : item.serial
    );
    setStatus(item.status);

    setShowForm(true);
  }

  function openDetails(item: Equipment) {
    setSelectedEquipment(item);
    setShowDetails(true);
  }

  async function saveEquipment(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !clientId ||
      !brand.trim() ||
      !model.trim()
    ) {
      alert(
        "Selecione um cliente e informe marca e modelo."
      );
      return;
    }

    setSaving(true);

    const data = {
      cliente_id: clientId,
      ambiente: location.trim() || null,
      marca: brand.trim(),
      modelo: model.trim(),
      btu,
      tipo: type,
      numero_serie: serial.trim() || null,
      status,
    };

    if (editingEquipment) {
      const { error } = await supabase
        .from("equipamentos")
        .update(data)
        .eq("id", editingEquipment.id);

      if (error) {
        alert(
          "Erro ao atualizar equipamento: " +
            error.message
        );
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("equipamentos")
        .insert(data);

      if (error) {
        alert(
          "Erro ao cadastrar equipamento: " +
            error.message
        );
        setSaving(false);
        return;
      }
    }

    await loadData();

    clearEquipmentForm();
    setShowForm(false);
    setSaving(false);
  }

  async function deleteEquipment(id: string) {
    const item = equipment.find(
      (equipmentItem) =>
        equipmentItem.id === id
    );

    if (!item) return;

    const confirmed = window.confirm(
      `Deseja realmente excluir o equipamento ${item.brand} ${item.model}?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("equipamentos")
      .delete()
      .eq("id", id);

    if (error) {
      alert(
        "Erro ao excluir equipamento: " +
          error.message
      );
      return;
    }

    if (selectedEquipment?.id === id) {
      setSelectedEquipment(null);
      setShowDetails(false);
    }

    await loadData();
  }

  async function toggleStatus(item: Equipment) {
    const newStatus: Equipment["status"] =
      item.status === "Ativo"
        ? "Manutenção"
        : "Ativo";

    const { error } = await supabase
      .from("equipamentos")
      .update({
        status: newStatus,
      })
      .eq("id", item.id);

    if (error) {
      alert(
        "Erro ao alterar status: " +
          error.message
      );
      return;
    }

    await loadData();

    const updated = {
      ...item,
      status: newStatus,
    };

    setSelectedEquipment(updated);
  }

  function openMaintenanceForm(item: Equipment) {
    setMaintenanceEquipment(item);

    setMaintenanceDate("");
    setMaintenanceType(
      "Manutenção preventiva"
    );
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

  async function saveMaintenance(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !maintenanceEquipment ||
      !maintenanceDate ||
      !maintenanceTechnician.trim() ||
      !maintenanceService.trim()
    ) {
      alert(
        "Preencha a data, técnico e serviço realizado."
      );
      return;
    }

    setSaving(true);

    const valueNumber = Number(
      maintenanceValue
        .replace("R$", "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim()
    );

    const { error } = await supabase
      .from("manutencoes_equipamentos")
      .insert({
        equipamento_id:
          maintenanceEquipment.id,
        data: maintenanceDate,
        tipo: maintenanceType,
        tecnico:
          maintenanceTechnician.trim(),
        problema:
          maintenanceProblem.trim() ||
          null,
        servico:
          maintenanceService.trim(),
        pecas:
          maintenanceParts.trim() ||
          null,
        valor: isNaN(valueNumber)
          ? 0
          : valueNumber,
        observacoes:
          maintenanceObservations.trim() ||
          null,
        status: maintenanceStatus,
      });

    if (error) {
      alert(
        "Erro ao salvar manutenção: " +
          error.message
      );
      setSaving(false);
      return;
    }

    if (maintenanceStatus === "Concluída") {
      await supabase
        .from("equipamentos")
        .update({
          ultima_manutencao:
            maintenanceDate,
        })
        .eq(
          "id",
          maintenanceEquipment.id
        );
    }

    await loadData();

    closeMaintenanceForm();
    setSaving(false);
  }

  const filteredEquipment =
    equipment.filter((item) => {
      const term = search
        .toLowerCase()
        .trim();

      if (!term) return true;

      return (
        item.client
          .toLowerCase()
          .includes(term) ||
        item.city
          .toLowerCase()
          .includes(term) ||
        item.brand
          .toLowerCase()
          .includes(term) ||
        item.model
          .toLowerCase()
          .includes(term) ||
        item.serial
          .toLowerCase()
          .includes(term) ||
        item.location
          .toLowerCase()
          .includes(term) ||
        item.type
          .toLowerCase()
          .includes(term)
      );
    });

  const selectedMaintenance =
    selectedEquipment
      ? maintenance.filter(
          (item) =>
            item.equipamento_id ===
            selectedEquipment.id
        )
      : [];

  return (
    <main className="min-h-screen bg-slate-50">
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
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-600"
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
                  (item) =>
                    item.status === "Ativo"
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
                    item.status ===
                    "Manutenção"
                ).length
              }
            </p>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4">
            <div className="relative">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Buscar cliente, marca, modelo, série ou ambiente..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-cyan-400 focus:bg-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Carregando equipamentos...
            </div>
          ) : filteredEquipment.length ===
            0 ? (
            <div className="p-10 text-center">
              <Snowflake
                size={36}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 font-semibold text-slate-700">
                Nenhum equipamento encontrado
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Cadastre o primeiro equipamento.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredEquipment.map(
                (item) => (
                  <div
                    key={item.id}
                    className="p-5 hover:bg-slate-50"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <button
                        onClick={() =>
                          openDetails(item)
                        }
                        className="flex items-start gap-4 text-left"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                          <Snowflake
                            size={22}
                          />
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
                              <Building2
                                size={14}
                              />
                              {item.location ||
                                "Local não informado"}
                            </span>

                            <span>
                              {item.btu} BTUs •{" "}
                              {item.type}
                            </span>
                          </div>

                          <p className="mt-2 text-xs text-slate-400">
                            Nº de série:{" "}
                            {item.serial}
                          </p>
                        </div>
                      </button>

                      <div className="flex flex-wrap items-center gap-3">
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
                          className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:text-cyan-600"
                        >
                          <Edit size={16} />
                          Editar
                        </button>

                        <button
                          onClick={() =>
                            deleteEquipment(
                              item.id
                            )
                          }
                          className="rounded-xl border border-slate-200 p-3 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2
                            size={17}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50 p-5">
          <div className="flex gap-3">
            <Wrench
              className="mt-0.5 text-cyan-600"
              size={20}
            />

            <div>
              <h3 className="font-semibold text-cyan-900">
                Controle de manutenção
              </h3>

              <p className="mt-1 text-sm text-cyan-800">
                Os equipamentos e seus históricos
                de manutenção agora são salvos
                diretamente no Supabase.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* NOVO / EDITAR EQUIPAMENTO */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4">
          <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingEquipment
                    ? "Editar equipamento"
                    : "Novo equipamento"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Cadastre o aparelho do cliente.
                </p>
              </div>

              <button
                onClick={() => {
                  clearEquipmentForm();
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

                <select
                  value={clientId}
                  onChange={(event) =>
                    setClientId(
                      event.target.value
                    )
                  }
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-cyan-400"
                >
                  <option value="">
                    Selecione o cliente
                  </option>

                  {clients.map((client) => (
                    <option
                      key={client.id}
                      value={client.id}
                    >
                      {client.nome}
                      {client.cidade
                        ? ` — ${client.cidade}`
                        : ""}
                    </option>
                  ))}
                </select>

                {clients.length === 0 && (
                  <p className="mt-2 text-xs text-red-500">
                    Cadastre um cliente primeiro
                    no módulo Clientes.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Ambiente
                </label>

                <input
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value
                    )
                  }
                  placeholder="Ex.: Sala, quarto, recepção..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Marca *
                  </label>

                  <input
                    value={brand}
                    onChange={(event) =>
                      setBrand(
                        event.target.value
                      )
                    }
                    placeholder="Ex.: Samsung"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Modelo *
                  </label>

                  <input
                    value={model}
                    onChange={(event) =>
                      setModel(
                        event.target.value
                      )
                    }
                    placeholder="Ex.: WindFree"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400"
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
                      setBtu(
                        event.target.value
                      )
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
                      setType(
                        event.target.value
                      )
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
                        event.target.value as Equipment["status"]
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
                    setSerial(
                      event.target.value
                    )
                  }
                  placeholder="Ex.: ABC123456"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    clearEquipmentForm();
                    setShowForm(false);
                  }}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {saving
                    ? "Salvando..."
                    : editingEquipment
                    ? "Salvar alterações"
                    : "Salvar equipamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETALHES */}
      {showDetails && selectedEquipment && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4">
          <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-cyan-50 p-3 text-cyan-600">
                  <Snowflake size={22} />
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

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Cliente
                </p>

                <p className="mt-1 font-semibold">
                  {selectedEquipment.client}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Cidade
                </p>

                <p className="mt-1 font-semibold">
                  {selectedEquipment.city}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Ambiente
                </p>

                <p className="mt-1 font-semibold">
                  {selectedEquipment.location ||
                    "Não informado"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Tipo
                </p>

                <p className="mt-1 font-semibold">
                  {selectedEquipment.type}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Capacidade
                </p>

                <p className="mt-1 font-semibold">
                  {selectedEquipment.btu} BTUs
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Número de série
                </p>

                <p className="mt-1 font-semibold">
                  {selectedEquipment.serial}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-xs text-blue-500">
                  Última manutenção
                </p>

                <p className="mt-1 font-semibold text-blue-700">
                  {selectedEquipment.lastService}
                </p>
              </div>

              <div className="rounded-xl bg-cyan-50 p-4">
                <p className="text-xs text-cyan-500">
                  Próxima manutenção
                </p>

                <p className="mt-1 font-semibold text-cyan-700">
                  {selectedEquipment.nextService}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200">
              <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-cyan-50 p-2 text-cyan-600">
                    <History size={19} />
                  </div>

                  <div>
                    <h3 className="font-bold">
                      Histórico de manutenção
                    </h3>

                    <p className="text-xs text-slate-500">
                      {selectedMaintenance.length}{" "}
                      registro(s)
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    openMaintenanceForm(
                      selectedEquipment
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-3 py-2 text-xs font-semibold text-white"
                >
                  <Plus size={15} />
                  Nova manutenção
                </button>
              </div>

              {selectedMaintenance.length ===
              0 ? (
                <div className="p-8 text-center">
                  <History
                    size={30}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-2 text-sm text-slate-500">
                    Nenhuma manutenção registrada.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {selectedMaintenance.map(
                    (item) => (
                      <div
                        key={item.id}
                        className="p-4"
                      >
                        <div className="flex gap-3">
                          <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                            <Wrench
                              size={16}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-semibold">
                                {item.type}
                              </h4>

                              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
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

                              <p className="mt-1 text-xs leading-5">
                                {item.service}
                              </p>
                            </div>

                            {item.problem !==
                              "Não informado" && (
                              <div className="mt-2 rounded-xl bg-red-50 p-3">
                                <p className="text-[11px] font-semibold text-red-600">
                                  Problema encontrado
                                </p>

                                <p className="mt-1 text-xs text-red-800">
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

                                <p className="mt-1 text-xs text-blue-800">
                                  {item.observations}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <button
                onClick={() => {
                  setShowDetails(false);
                  openEdit(
                    selectedEquipment
                  );
                }}
                className="rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white"
              >
                Editar
              </button>

              <button
                onClick={() =>
                  toggleStatus(
                    selectedEquipment
                  )
                }
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
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
                className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600"
              >
                <Trash2 size={16} />
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOVA MANUTENÇÃO */}
      {showMaintenanceForm &&
        maintenanceEquipment && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4">
            <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    Nova manutenção
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {maintenanceEquipment.brand}{" "}
                    {maintenanceEquipment.model}
                  </p>

                  <p className="text-xs text-slate-400">
                    Cliente:{" "}
                    {maintenanceEquipment.client}
                  </p>
                </div>

                <button
                  onClick={
                    closeMaintenanceForm
                  }
                  className="rounded-lg p-2 text-slate-400"
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
                    <label className="mb-1.5 block text-sm font-medium">
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
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Tipo
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
                  <label className="mb-1.5 block text-sm font-medium">
                    Técnico responsável *
                  </label>

                  <input
                    value={maintenanceTechnician}
                    onChange={(event) =>
                      setMaintenanceTechnician(
                        event.target.value
                      )
                    }
                    required
                    placeholder="Nome do técnico"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Problema encontrado
                  </label>

                  <textarea
                    value={maintenanceProblem}
                    onChange={(event) =>
                      setMaintenanceProblem(
                        event.target.value
                      )
                    }
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Serviço realizado *
                  </label>

                  <textarea
                    value={maintenanceService}
                    onChange={(event) =>
                      setMaintenanceService(
                        event.target.value
                      )
                    }
                    required
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Peças utilizadas
                    </label>

                    <input
                      value={maintenanceParts}
                      onChange={(event) =>
                        setMaintenanceParts(
                          event.target.value
                        )
                      }
                      placeholder="Ex.: Capacitor"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Valor
                    </label>

                    <input
                      value={maintenanceValue}
                      onChange={(event) =>
                        setMaintenanceValue(
                          event.target.value
                        )
                      }
                      placeholder="Ex.: 250,00"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
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
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Status
                  </label>

                  <select
                    value={maintenanceStatus}
                    onChange={(event) =>
                      setMaintenanceStatus(
                        event.target.value as Maintenance["status"]
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
                  </select>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={
                      closeMaintenanceForm
                    }
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-semibold"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-white disabled:opacity-50"
                  >
                    {saving
                      ? "Salvando..."
                      : "Salvar manutenção"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </main>
  );
}
