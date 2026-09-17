"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AppointmentStatus =
  | "Agendado"
  | "Confirmado"
  | "Em atendimento"
  | "Concluído"
  | "Cancelado";

type Appointment = {
  id: string;
  cliente_id: string | null;
  cliente_nome: string;
  cidade: string;
  servico: string;
  tecnico: string;
  data: string;
  horario: string;
  status: AppointmentStatus;
  created_at?: string;
  updated_at?: string;
};

type Client = {
  id: string;
  nome: string;
  cidade: string;
};

const STATUS: AppointmentStatus[] = [
  "Agendado",
  "Confirmado",
  "Em atendimento",
  "Concluído",
  "Cancelado",
];

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateBR(dateString: string) {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-");

  if (!year || !month || !day) return dateString;

  return `${day}/${month}/${year}`;
}

function getInitialDate() {
  const today = new Date();
  return formatDate(today);
}

function statusClass(status: AppointmentStatus) {
  switch (status) {
    case "Agendado":
      return "bg-blue-100 text-blue-700";

    case "Confirmado":
      return "bg-green-100 text-green-700";

    case "Em atendimento":
      return "bg-yellow-100 text-yellow-700";

    case "Concluído":
      return "bg-emerald-100 text-emerald-700";

    case "Cancelado":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function AgendaPage() {
  const supabase = createClient();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [date, setDate] = useState(getInitialDate());

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    AppointmentStatus | "Todos"
  >("Todos");

  const [showModal, setShowModal] = useState(false);

  const [selectedClientId, setSelectedClientId] = useState("");
  const [city, setCity] = useState("");
  const [service, setService] = useState("");
  const [technician, setTechnician] = useState("");
  const [time, setTime] = useState("08:00");

  async function loadData() {
    setLoading(true);

    const [appointmentsResult, clientsResult] = await Promise.all([
      supabase
        .from("agenda")
        .select("*")
        .order("data", { ascending: true })
        .order("horario", { ascending: true }),

      supabase
        .from("clientes")
        .select("id,nome,cidade")
        .eq("ativo", true)
        .order("nome", { ascending: true }),
    ]);

    if (appointmentsResult.error) {
      console.error(appointmentsResult.error);
      alert("Não foi possível carregar a agenda.");
    } else {
      setAppointments(
        (appointmentsResult.data || []) as Appointment[]
      );
    }

    if (clientsResult.error) {
      console.error(clientsResult.error);
    } else {
      setClients((clientsResult.data || []) as Client[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function openNewAppointment() {
    setSelectedClientId("");
    setCity("");
    setService("");
    setTechnician("");
    setTime("08:00");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;
    setShowModal(false);
  }

  function handleClientChange(clientId: string) {
    setSelectedClientId(clientId);

    const client = clients.find((item) => item.id === clientId);

    if (client) {
      setCity(client.cidade || "");
    } else {
      setCity("");
    }
  }

  async function saveAppointment() {
    if (!selectedClientId) {
      alert("Selecione um cliente.");
      return;
    }

    if (!service.trim()) {
      alert("Informe o serviço.");
      return;
    }

    if (!technician.trim()) {
      alert("Informe o técnico.");
      return;
    }

    if (!time) {
      alert("Informe o horário.");
      return;
    }

    const selectedClient = clients.find(
      (client) => client.id === selectedClientId
    );

    if (!selectedClient) {
      alert("Cliente não encontrado.");
      return;
    }

    setSaving(true);

    const insertResult = await supabase
      .from("agenda")
      .insert({
        cliente_id: selectedClient.id,
        cliente_nome: selectedClient.nome,
        cidade: city || selectedClient.cidade || "",
        servico: service.trim(),
        tecnico: technician.trim(),
        data: date,
        horario: time,
        status: "Agendado",
      })
      .select()
      .single();

    const insertedAppointment = insertResult.data;
    const insertError = insertResult.error;

    if (insertError) {
      console.error(insertError);
      alert("Não foi possível salvar o atendimento.");
      setSaving(false);
      return;
    }

    if (!insertedAppointment) {
      alert("O atendimento foi enviado, mas não retornou os dados.");
      setSaving(false);
      return;
    }

    setAppointments((current) => [
      ...current,
      insertedAppointment as Appointment,
    ]);

    setShowModal(false);
    setSaving(false);
  }

  async function updateStatus(
    appointment: Appointment,
    newStatus: AppointmentStatus
  ) {
    const { error } = await supabase
      .from("agenda")
      .update({
        status: newStatus,
      })
      .eq("id", appointment.id);

    if (error) {
      console.error(error);
      alert("Não foi possível atualizar o status.");
      return;
    }

    setAppointments((current) =>
      current.map((item) =>
        item.id === appointment.id
          ? { ...item, status: newStatus }
          : item
      )
    );
  }

  async function deleteAppointment(appointment: Appointment) {
    const confirmed = window.confirm(
      `Excluir o atendimento de ${appointment.cliente_nome}?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("agenda")
      .delete()
      .eq("id", appointment.id);

    if (error) {
      console.error(error);
      alert("Não foi possível excluir o atendimento.");
      return;
    }

    setAppointments((current) =>
      current.filter((item) => item.id !== appointment.id)
    );
  }

  function changeDate(days: number) {
    const current = new Date(`${date}T12:00:00`);
    current.setDate(current.getDate() + days);
    setDate(formatDate(current));
  }

  function goToday() {
    setDate(getInitialDate());
  }

  const dailyAppointments = useMemo(() => {
    return appointments
      .filter((appointment) => appointment.data === date)
      .filter((appointment) => {
        if (statusFilter === "Todos") return true;
        return appointment.status === statusFilter;
      })
      .filter((appointment) => {
        const term = search.trim().toLowerCase();

        if (!term) return true;

        return (
          appointment.cliente_nome.toLowerCase().includes(term) ||
          appointment.cidade.toLowerCase().includes(term) ||
          appointment.servico.toLowerCase().includes(term) ||
          appointment.tecnico.toLowerCase().includes(term)
        );
      })
      .sort((a, b) =>
        a.horario.localeCompare(b.horario)
      );
  }, [appointments, date, search, statusFilter]);

  const totalDay = appointments.filter(
    (appointment) => appointment.data === date
  ).length;

  const confirmedDay = appointments.filter(
    (appointment) =>
      appointment.data === date &&
      appointment.status === "Confirmado"
  ).length;

  const completedDay = appointments.filter(
    (appointment) =>
      appointment.data === date &&
      appointment.status === "Concluído"
  ).length;

  const cancelledDay = appointments.filter(
    (appointment) =>
      appointment.data === date &&
      appointment.status === "Cancelado"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* CABEÇALHO */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-600 p-3 text-white">
                <CalendarDays size={24} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Agenda
                </h1>

                <p className="text-sm text-gray-500">
                  Controle seus atendimentos e visitas técnicas
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openNewAppointment}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={20} />
            Novo atendimento
          </button>
        </div>

        {/* CONTROLES DE DATA */}
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeDate(-1)}
                className="rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={goToday}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Hoje
              </button>

              <button
                onClick={() => changeDate(1)}
                className="rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-50"
              >
                <ChevronRight size={20} />
              </button>

              <div className="ml-2 flex items-center gap-2">
                <CalendarDays size={18} className="text-blue-600" />

                <span className="font-semibold text-gray-900">
                  {formatDateBR(date)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar atendimento..."
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 sm:w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as AppointmentStatus | "Todos"
                  )
                }
                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="Todos">Todos os status</option>

                {STATUS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* RESUMO */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">
              Atendimentos
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {totalDay}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">
              Confirmados
            </p>

            <p className="mt-1 text-2xl font-bold text-green-600">
              {confirmedDay}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">
              Concluídos
            </p>

            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {completedDay}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">
              Cancelados
            </p>

            <p className="mt-1 text-2xl font-bold text-red-600">
              {cancelledDay}
            </p>
          </div>
        </div>

        {/* LISTA */}
        <div className="rounded-2xl bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <h2 className="text-lg font-bold text-gray-900">
              Atendimentos do dia
            </h2>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Carregando agenda...
            </div>
          ) : dailyAppointments.length === 0 ? (
            <div className="p-10 text-center">
              <CalendarDays
                size={42}
                className="mx-auto mb-3 text-gray-300"
              />

              <p className="font-semibold text-gray-700">
                Nenhum atendimento encontrado
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Não há atendimentos para esta data.
              </p>

              <button
                onClick={openNewAppointment}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus size={18} />
                Agendar atendimento
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {dailyAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-5 transition hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Clock size={24} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-gray-900">
                            {appointment.horario.slice(0, 5)}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                              appointment.status
                            )}`}
                          >
                            {appointment.status}
                          </span>
                        </div>

                        <p className="mt-1 flex items-center gap-1 font-semibold text-gray-800">
                          <User size={15} />
                          {appointment.cliente_nome}
                        </p>

                        <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {appointment.cidade}
                          </span>

                          <span>
                            Serviço:{" "}
                            <strong className="text-gray-700">
                              {appointment.servico}
                            </strong>
                          </span>

                          <span>
                            Técnico:{" "}
                            <strong className="text-gray-700">
                              {appointment.tecnico}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={appointment.status}
                        onChange={(event) =>
                          updateStatus(
                            appointment,
                            event.target.value as AppointmentStatus
                          )
                        }
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                      >
                        {STATUS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() =>
                          deleteAppointment(appointment)
                        }
                        className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL NOVO ATENDIMENTO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Novo atendimento
                </h2>

                <p className="text-sm text-gray-500">
                  Agendar atendimento para {formatDateBR(date)}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Cliente
                </label>

                <select
                  value={selectedClientId}
                  onChange={(event) =>
                    handleClientChange(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">
                    Selecione o cliente
                  </option>

                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Cidade
                </label>

                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="Cidade"
                  className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Serviço
                </label>

                <input
                  value={service}
                  onChange={(event) => setService(event.target.value)}
                  placeholder="Ex.: Instalação, manutenção..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Técnico
                  </label>

                  <input
                    value={technician}
                    onChange={(event) =>
                      setTechnician(event.target.value)
                    }
                    placeholder="Nome do técnico"
                    className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Horário
                  </label>

                  <input
                    type="time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 p-5 sm:flex-row sm:justify-end">
              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg border border-gray-200 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                onClick={saveAppointment}
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Salvar atendimento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
