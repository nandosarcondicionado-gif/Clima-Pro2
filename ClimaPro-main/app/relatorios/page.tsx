"use client";

import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  Download,
  FileText,
  Users,
  Wrench,
} from "lucide-react";

const reports = [
  {
    title: "Clientes",
    description: "Lista e resumo dos clientes cadastrados.",
    icon: Users,
  },
  {
    title: "Equipamentos",
    description: "Equipamentos e situação de manutenção.",
    icon: Wrench,
  },
  {
    title: "Ordens de serviço",
    description: "Serviços realizados, pendentes e concluídos.",
    icon: ClipboardList,
  },
  {
    title: "Financeiro",
    description: "Entradas, saídas e saldo financeiro.",
    icon: BarChart3,
  },
  {
    title: "Agenda",
    description: "Serviços programados e atendimentos.",
    icon: CalendarDays,
  },
  {
    title: "Orçamentos",
    description: "Orçamentos emitidos e seus status.",
    icon: FileText,
  },
];

export default function RelatoriosPage() {
  function generate(name: string) {
    alert(
      `Relatório de ${name} preparado. A exportação PDF/Excel será conectada na integração final.`
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">

        <header className="mb-8">
          <h1 className="text-3xl font-bold">
            Relatórios
          </h1>
          <p className="mt-1 text-slate-400">
            Indicadores e relatórios do ClimaPro
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {reports.map((report) => {
            const Icon = report.icon;

            return (
              <div
                key={report.title}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
              >
                <div className="mb-5 rounded-xl bg-cyan-500/10 p-3 w-fit">
                  <Icon className="h-6 w-6 text-cyan-400" />
                </div>

                <h2 className="font-bold">
                  {report.title}
                </h2>

                <p className="mt-2 min-h-10 text-sm text-slate-400">
                  {report.description}
                </p>

                <button
                  onClick={() => generate(report.title)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 py-3 hover:bg-slate-800"
                >
                  <Download className="h-4 w-4" />
                  Gerar relatório
                </button>
              </div>
            );
          })}

        </div>
      </div>
    </main>
  );
}
