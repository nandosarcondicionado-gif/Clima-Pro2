"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock,
  LogOut,
  MapPin,
  Play,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

const services = [
  {
    id: 1,
    time: "08:00",
    client: "João da Silva",
    city: "Araraquara",
    service: "Higienização de 2 aparelhos",
    status: "Confirmado",
  },
  {
    id: 2,
    time: "13:30",
    client: "Clínica Saúde",
    city: "Araraquara",
    service: "Manutenção preventiva",
    status: "Agendado",
  },
  {
    id: 3,
    time: "16:00",
    client: "Empresa ABC Ltda.",
    city: "São Carlos",
    service: "Instalação de Split",
    status: "Agendado",
  },
];

export default function TecnicoPage() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">

        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-500/10 p-3">
              <Wrench className="h-7 w-7 text-cyan-400" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Área do Técnico
              </h1>

              <p className="text-slate-400">
                Serviços e agenda do técnico
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-semibold text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </header>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <CalendarDays className="mb-3 text-cyan-400" />

            <p className="text-sm text-slate-400">
              Hoje
            </p>

            <p className="text-3xl font-bold">
              3
            </p>

            <p className="text-xs text-slate-500">
              serviços
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <Clock className="mb-3 text-yellow-400" />

            <p className="text-sm text-slate-400">
              Pendentes
            </p>

            <p className="text-3xl font-bold">
              2
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <CheckCircle2 className="mb-3 text-emerald-400" />

            <p className="text-sm text-slate-400">
              Concluídos
            </p>

            <p className="text-3xl font-bold">
              1
            </p>
          </div>

        </div>

        <div className="space-y-4">

          {services.map((service) => (
            <div
              key={service.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div className="flex gap-4">

                  <div className="rounded-xl bg-slate-950 px-4 py-3 text-lg font-bold">
                    {service.time}
                  </div>

                  <div>
                    <h2 className="font-bold">
                      {service.client}
                    </h2>

                    <p className="mt-1 text-sm text-cyan-400">
                      {service.service}
                    </p>

                    <p className="mt-2 flex items-center gap-1 text-sm text-slate-400">
                      <MapPin className="h-4 w-4" />
                      {service.city}
                    </p>
                  </div>

                </div>

                <div className="flex gap-2">

                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 font-bold text-slate-950"
                  >
                    <Play className="h-4 w-4" />
                    Iniciar
                  </button>

                  <button
                    type="button"
                    className="rounded-xl border border-slate-700 px-4 py-3"
                  >
                    Detalhes
                  </button>

                </div>

              </div>
            </div>
          ))}

        </div>

      </div>
    </main>
  );
}
