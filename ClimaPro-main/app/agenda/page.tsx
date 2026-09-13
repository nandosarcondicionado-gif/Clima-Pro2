"use client";

import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  User,
  Wrench,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type AppointmentStatus =
  | "Agendado"
  | "Confirmado"
  | "Em atendimento"
  | "Concluído"
  | "Cancelado";

type Appointment = {
  id: number;
  client: string;
  city: string;
  service: string;
  technician: string;
  date: string;
  time: string;
  status: AppointmentStatus;
};

const initialAppointments: Appointment[] = [
  {
    id: 1,
    client: "João da Silva",
    city: "Araraquara",
    service: "Higienização de 2 aparelhos",
    technician: "Carlos Técnico",
    date: "2026-09-10",
    time: "08:00",
    status: "Confirmado",
  },
  {
    id: 2,
    client: "Clínica Saúde",
    city: "Araraquara",
    service: "Manutenção preventiva",
    technician: "Marcos Técnico",
    date: "2026-09-10",
    time: "13:30",
    status: "Agendado",
  },
  {
    id: 3,
    client: "Empresa ABC Ltda.",
    city: "São Carlos",
    service: "Instalação de Split",
    technician: "Carlos Técnico",
    date: "2026-09-11",
    time: "09:00",
    status: "Em atendimento",
  },
];

const statusStyles: Record<AppointmentStatus, string> = {
  Agendado: "bg-blue-50 text-blue-700",
  Confirmado: "bg-emerald-50 text-emerald-700",
  "Em atendimento": "bg-amber-50 text-amber-700",
  Concluído: "bg-slate-100 text-slate-600",
  Cancelado: "bg-red-50 text-red-700",
};

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(
    "pt-BR",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
    }
  );
}

function formatShortDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
    }
  );
}

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<
    Appointment[]
  >(initialAppointments);

  const [selectedDate, setSelectedDate] = useState(
    "2026-09-10"
  );

  const [showForm, setShowForm] = useState(false);

  const [client, setClient] = useState("");
  const [city, setCity] = useState("Araraquara");
  const [service, setService] = useState("");
  const [technician, setTechnician] = useState("");
  const [date, setDate] = useState("2026-09-10");
  const [time, setTime] = useState("08:00");

  const selectedAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => appointment.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [appointments, selectedDate]
  );

  const visibleDates = useMemo(() => {
    const base = new Date(`${selectedDate}T12:00:00`);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(base);
      date.setDate(base.getDate() - 3 + index);

      return date.toISOString().split("T")[0];
    });
  }, [selectedDate]);

  function moveDay(days: number) {
    const date = new Date(`${selectedDate}T12:00:00`);
    date.setDate(date.getDate() + days);

    setSelectedDate(date.toISOString().split("T")[0]);
  }

  function addAppointment(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !client.trim() ||
      !service.trim() ||
      !technician.trim() ||
      !date ||
      !time
    ) {
      return;
    }

    const newAppointment: Appointment = {
      id: Date.now(),
      client: client.trim(),
      city,
      service: service.trim(),
      technician: technician.trim(),
      date,
      time,
      status: "Agendado",
    };

    setAppointments((current) => [
      ...current,
      newAppointment,
    ]);

    setSelectedDate(date);

    setClient("");
    setCity("Araraquara");
    setService("");
    setTechnician("");
    setDate("2026-09-10");
    setTime("08:00");
    setShowForm(false);
  }

  function changeStatus(
    id: number,
    status: AppointmentStatus
  ) {
    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === id
          ? { ...appointment, status }
          : appointment
      )
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500 p-3 text-white">
              <CalendarDays size={22} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Agenda
              </h1>

              <p className="text-sm text-slate-500">
                Organize os atendimentos da equipe
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-cyan-600"
          >
            <Plus size={18} />

            <span className="hidden sm:inline">
              Novo atendimento
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
            Agenda
          </span>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-cyan-600">
                Agenda de atendimentos
              </p>

              <h2 className="mt-1 text-xl font-bold capitalize text-slate-900">
                {formatDate(selectedDate)}
              </h2>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => moveDay(-1)}
                className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
              >
                <ChevronLeft size={19} />
              </button>

              <button
                onClick={() => moveDay(1)}
                className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-7 gap-2 overflow-x-auto">
            {visibleDates.map((dateItem) => {
              const dateObject = new Date(
                `${dateItem}T12:00:00`
              );

              const weekday = dateObject.toLocaleDateString(
                "pt-BR",
                {
                  weekday: "short",
                }
              );

              const day = dateObject.getDate();

              const count = appointments.filter(
                (appointment) =>
                  appointment.date === dateItem
              ).length;

              const selected = dateItem === selectedDate;

              return (
                <button
                  key={dateItem}
                  onClick={() => setSelectedDate(dateItem)}
                  className={`min-w-[58px] rounded-xl p-3 text-center transition ${
                    selected
                      ? "bg-cyan-500 text-white shadow-md"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <p className="text-[11px] capitalize">
                    {weekday.replace(".", "")}
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    {day}
                  </p>

                  <p
                    className={`mt-1 text-[10px] ${
                      selected
                        ? "text-cyan-100"
                        : "text-slate-400"
                    }`}
                  >
                    {count} atendimento
                    {count !== 1 ? "s" : ""}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Atendimentos do dia
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    {selectedAppointments.length} atendimento
                    {selectedAppointments.length !== 1
                      ? "s"
                      : ""}{" "}
                    agendado
                    {selectedAppointments.length !== 1
                      ? "s"
                      : ""}
                  </p>
                </div>

                <CalendarDays
                  size={20}
                  className="text-cyan-500"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {selectedAppointments.length === 0 ? (
                <div className="p-10 text-center">
                  <CalendarDays
                    size={36}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 font-medium text-slate-700">
                    Agenda livre
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Não existem atendimentos para esta data.
                  </p>

                  <button
                    onClick={() => {
                      setDate(selectedDate);
                      setShowForm(true);
                    }}
                    className="mt-5 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-600"
                  >
                    Agendar atendimento
                  </button>
                </div>
              ) : (
                selectedAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-5 hover:bg-slate-50"
                  >
                    <div className="flex gap-4">
                      <div className="w-16 shrink-0 text-center">
                        <p className="text-lg font-bold text-cyan-600">
                          {appointment.time}
                        </p>

                        <div className="mx-auto mt-2 h-12 w-0.5 bg-cyan-100" />
                      </div>

                      <div className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-semibold text-slate-900">
                                {appointment.service}
                              </h4>

                              <span
                                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[appointment.status]}`}
                              >
                                {appointment.status}
                              </span>
                            </div>

                            <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                              <span className="flex items-center gap-1.5">
                                <User size={14} />
                                {appointment.client}
                              </span>

                              <span className="flex items-center gap-1.5">
                                <MapPin size={14} />
                                {appointment.city}
                              </span>

                              <span className="flex items-center gap-1.5">
                                <Wrench size={14} />
                                {appointment.technician}
                              </span>

                              <span className="flex items-center gap-1.5">
                                <Clock size={14} />
                                {appointment.time}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {appointment.status ===
                              "Agendado" && (
                              <button
                                onClick={() =>
                                  changeStatus(
                                    appointment.id,
                                    "Confirmado"
                                  )
                                }
                                className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
                              >
                                Confirmar
                              </button>
                            )}

                            {appointment.status ===
                              "Confirmado" && (
                              <button
                                onClick={() =>
                                  changeStatus(
                                    appointment.id,
                                    "Em atendimento"
                                  )
                                }
                                className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600"
                              >
                                Iniciar
                              </button>
                            )}

                            {appointment.status ===
                              "Em atendimento" && (
                              <button
                                onClick={() =>
                                  changeStatus(
                                    appointment.id,
                                    "Concluído"
                                  )
                                }
                                className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
                              >
                                Concluir
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-slate-900">
              Resumo da agenda
            </h3>

            <div className="mt-5 space-y-3">
              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-xs text-blue-600">
                  Agendados
                </p>

                <p className="mt-1 text-2xl font-bold text-blue-700">
                  {
                    appointments.filter(
                      (item) => item.status === "Agendado"
                    ).length
                  }
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-xs text-emerald-600">
                  Confirmados
                </p>

                <p className="mt-1 text-2xl font-bold text-emerald-700">
                  {
                    appointments.filter(
                      (item) => item.status === "Confirmado"
                    ).length
                  }
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-4">
                <p className="text-xs text-amber-600">
                  Em atendimento
                </p>

                <p className="mt-1 text-2xl font-bold text-amber-700">
                  {
                    appointments.filter(
                      (item) =>
                        item.status === "Em atendimento"
                    ).length
                  }
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-xs text-slate-500">
                  Concluídos
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-700">
                  {
                    appointments.filter(
                      (item) => item.status === "Concluído"
                    ).length
                  }
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="text-xs leading-5 text-slate-400">
                Futuramente o técnico terá sua própria agenda
                dentro do aplicativo, sem precisar enxergar os
                atendimentos dos outros funcionários.
              </p>
            </div>
          </aside>
        </section>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Novo atendimento
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Agende um atendimento para sua equipe.
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
              onSubmit={addAppointment}
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
                  Técnico
                </label>

                <input
                  value={technician}
                  onChange={(event) =>
                    setTechnician(event.target.value)
                  }
                  placeholder="Nome do técnico"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Data
                  </label>

                  <input
                    type="date"
                    value={date}
                    onChange={(event) =>
                      setDate(event.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Horário
                  </label>

                  <input
                    type="time"
                    value={time}
                    onChange={(event) =>
                      setTime(event.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>
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
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
