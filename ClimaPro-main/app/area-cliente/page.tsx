"use client";

import {
  CalendarDays,
  FileText,
  History,
  Package,
  User,
  Wrench,
} from "lucide-react";

export default function AreaClientePage() {
  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">

        <header className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-cyan-500/10 p-4">
              <User className="h-8 w-8 text-cyan-400" />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Bem-vindo
              </p>

              <h1 className="text-2xl font-bold">
                João da Silva
              </h1>

              <p className="text-sm text-slate-400">
                Cliente residencial
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {[
            {
              title: "Meus equipamentos",
              text: "Consulte seus aparelhos cadastrados.",
              icon: Package,
            },
            {
              title: "Próximos serviços",
              text: "Veja seus próximos atendimentos.",
              icon: CalendarDays,
            },
            {
              title: "Orçamentos",
              text: "Consulte seus orçamentos.",
              icon: FileText,
            },
            {
              title: "Histórico",
              text: "Veja serviços realizados.",
              icon: History,
            },
            {
              title: "Manutenções",
              text: "Histórico de manutenção.",
              icon: Wrench,
            },
            {
              title: "Contratos",
              text: "Consulte seus contratos.",
              icon: FileText,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.title}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left transition hover:border-cyan-500"
              >
                <Icon className="mb-5 h-7 w-7 text-cyan-400" />

                <h2 className="font-bold">
                  {item.title}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  {item.text}
                </p>
              </button>
            );
          })}

        </div>
      </div>
    </main>
  );
}
