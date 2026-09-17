"use client";

import { useState } from "react";
import {
  CalendarDays,
  FileText,
  History,
  Package,
  User,
  Wrench,
  X,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock3,
} from "lucide-react";

type Secao =
  | "equipamentos"
  | "servicos"
  | "orcamentos"
  | "historico"
  | "manutencoes"
  | "contratos"
  | null;

const secoes = [
  {
    id: "equipamentos" as Secao,
    title: "Meus equipamentos",
    text: "Consulte seus aparelhos cadastrados.",
    icon: Package,
  },
  {
    id: "servicos" as Secao,
    title: "Próximos serviços",
    text: "Veja seus próximos atendimentos.",
    icon: CalendarDays,
  },
  {
    id: "orcamentos" as Secao,
    title: "Orçamentos",
    text: "Consulte seus orçamentos.",
    icon: FileText,
  },
  {
    id: "historico" as Secao,
    title: "Histórico",
    text: "Veja serviços realizados.",
    icon: History,
  },
  {
    id: "manutencoes" as Secao,
    title: "Manutenções",
    text: "Consulte o histórico de manutenção.",
    icon: Wrench,
  },
  {
    id: "contratos" as Secao,
    title: "Contratos",
    text: "Consulte seus contratos.",
    icon: FileText,
  },
];

export default function AreaClientePage() {
  const [secaoAberta, setSecaoAberta] = useState<Secao>(null);

  function tituloSecao(secao: Secao) {
    return (
      secoes.find((item) => item.id === secao)?.title ||
      "Área do cliente"
    );
  }

  function renderConteudo() {
    switch (secaoAberta) {
      case "equipamentos":
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-cyan-500/10 p-3">
                  <Package className="h-6 w-6 text-cyan-400" />
                </div>

                <div className="flex-1">
                  <h3 className="font-bold">
                    Equipamentos cadastrados
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Seus equipamentos aparecerão aqui quando
                    estiverem vinculados ao seu cadastro.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center">
              <Package className="mx-auto mb-3 h-10 w-10 text-slate-600" />

              <p className="font-medium text-slate-300">
                Nenhum equipamento disponível
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Entre em contato com a Nando&apos;s
                Ar-Condicionado para cadastrar seu equipamento.
              </p>
            </div>
          </div>
        );

      case "servicos":
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-blue-500/10 p-3">
                  <CalendarDays className="h-6 w-6 text-blue-400" />
                </div>

                <div>
                  <h3 className="font-bold">
                    Próximos atendimentos
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Os serviços agendados para você aparecerão
                    nesta área.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center">
              <CalendarDays className="mx-auto mb-3 h-10 w-10 text-slate-600" />

              <p className="font-medium text-slate-300">
                Nenhum serviço agendado
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Quando houver um atendimento agendado, ele
                aparecerá aqui.
              </p>
            </div>
          </div>
        );

      case "orcamentos":
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-purple-500/10 p-3">
                  <FileText className="h-6 w-6 text-purple-400" />
                </div>

                <div>
                  <h3 className="font-bold">
                    Seus orçamentos
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Consulte os orçamentos preparados para você.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-slate-600" />

              <p className="font-medium text-slate-300">
                Nenhum orçamento disponível
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Seus novos orçamentos aparecerão nesta área.
              </p>
            </div>
          </div>
        );

      case "historico":
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-green-500/10 p-3">
                  <History className="h-6 w-6 text-green-400" />
                </div>

                <div>
                  <h3 className="font-bold">
                    Histórico de serviços
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Consulte os atendimentos realizados pela
                    Nando&apos;s Ar-Condicionado.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center">
              <History className="mx-auto mb-3 h-10 w-10 text-slate-600" />

              <p className="font-medium text-slate-300">
                Nenhum serviço realizado
              </p>

              <p className="mt-1 text-sm text-slate-500">
                O histórico ficará disponível após os
                atendimentos.
              </p>
            </div>
          </div>
        );

      case "manutencoes":
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-orange-500/10 p-3">
                  <Wrench className="h-6 w-6 text-orange-400" />
                </div>

                <div>
                  <h3 className="font-bold">
                    Manutenções
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Acompanhe as manutenções realizadas em seus
                    equipamentos.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center">
              <Wrench className="mx-auto mb-3 h-10 w-10 text-slate-600" />

              <p className="font-medium text-slate-300">
                Nenhuma manutenção registrada
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Os registros de manutenção aparecerão aqui.
              </p>
            </div>
          </div>
        );

      case "contratos":
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-cyan-500/10 p-3">
                  <FileText className="h-6 w-6 text-cyan-400" />
                </div>

                <div>
                  <h3 className="font-bold">
                    Seus contratos
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Consulte contratos e serviços contratados.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-slate-600" />

              <p className="font-medium text-slate-300">
                Nenhum contrato disponível
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Seus contratos aparecerão nesta área quando
                estiverem vinculados ao seu cadastro.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* CABEÇALHO */}
        <header className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-cyan-500/10 p-4">
                <User className="h-8 w-8 text-cyan-400" />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Bem-vindo à
                </p>

                <h1 className="text-2xl font-bold">
                  Área do Cliente
                </h1>

                <p className="text-sm text-slate-400">
                  Nando&apos;s Ar-Condicionado
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
              <p className="text-xs text-slate-500">
                Status da conta
              </p>

              <div className="mt-1 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />

                <span className="text-sm font-medium text-green-400">
                  Área disponível
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* CARDS */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {secoes.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.title}
                type="button"
                onClick={() => setSecaoAberta(item.id)}
                className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left transition hover:-translate-y-1 hover:border-cyan-500 hover:bg-slate-900/80"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="rounded-xl bg-cyan-500/10 p-3">
                    <Icon className="h-7 w-7 text-cyan-400" />
                  </div>

                  <ChevronRight className="h-5 w-5 text-slate-600 transition group-hover:translate-x-1 group-hover:text-cyan-400" />
                </div>

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

        {/* INFORMAÇÕES DE CONTATO */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-5 text-lg font-bold">
            Precisa de atendimento?
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl bg-slate-950 p-4">
              <Phone className="h-5 w-5 text-cyan-400" />

              <div>
                <p className="text-xs text-slate-500">
                  Atendimento
                </p>

                <p className="text-sm font-medium">
                  WhatsApp
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-950 p-4">
              <Mail className="h-5 w-5 text-cyan-400" />

              <div>
                <p className="text-xs text-slate-500">
                  E-mail
                </p>

                <p className="break-all text-sm font-medium">
                  nandosarcondicionado@gmail.com
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-950 p-4">
              <MapPin className="h-5 w-5 text-cyan-400" />

              <div>
                <p className="text-xs text-slate-500">
                  Atendimento
                </p>

                <p className="text-sm font-medium">
                  Jaú e região
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MODAL / DETALHES */}
        {secaoAberta && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
              <div className="sticky top-0 flex items-center justify-between border-b border-slate-800 bg-slate-900 p-5">
                <div>
                  <p className="text-xs text-slate-500">
                    Área do cliente
                  </p>

                  <h2 className="text-xl font-bold">
                    {tituloSecao(secaoAberta)}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSecaoAberta(null)}
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                  aria-label="Fechar"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-5">
                {renderConteudo()}
              </div>

              <div className="border-t border-slate-800 p-5">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock3 className="h-4 w-4" />

                  <span>
                    Os dados serão vinculados ao cadastro do
                    cliente na próxima etapa.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
