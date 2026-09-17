"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Snowflake,
  FileText,
  ClipboardList,
  CalendarDays,
  Wallet,
  RefreshCw,
  BarChart3,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

type Relatorio = {
  titulo: string;
  descricao: string;
  tabela: string;
  icone: React.ReactNode;
  cor: string;
};

type Dados = {
  clientes: any[];
  equipamentos: any[];
  orcamentos: any[];
  ordens: any[];
  financeiro: any[];
  agenda: any[];
};

export default function RelatoriosPage() {
  const [dados, setDados] = useState<Dados>({
    clientes: [],
    equipamentos: [],
    orcamentos: [],
    ordens: [],
    financeiro: [],
    agenda: [],
  });

  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState("");

  async function carregarDados() {
    try {
      setErro("");

      const consultas = await Promise.all([
        fetch("/api/clientes"),
        fetch("/api/equipamentos"),
        fetch("/api/orcamentos"),
        fetch("/api/ordens-servico"),
        fetch("/api/financeiro"),
        fetch("/api/agenda"),
      ]);

      const nomes = [
        "clientes",
        "equipamentos",
        "orcamentos",
        "ordens",
        "financeiro",
        "agenda",
      ];

      const resultados: any[] = [];

      for (let i = 0; i < consultas.length; i++) {
        const resposta = consultas[i];

        if (!resposta.ok) {
          resultados.push([]);
          continue;
        }

        try {
          const json = await resposta.json();

          if (Array.isArray(json)) {
            resultados.push(json);
          } else if (Array.isArray(json.data)) {
            resultados.push(json.data);
          } else if (Array.isArray(json.items)) {
            resultados.push(json.items);
          } else if (Array.isArray(json[nomes[i]])) {
            resultados.push(json[nomes[i]]);
          } else {
            resultados.push([]);
          }
        } catch {
          resultados.push([]);
        }
      }

      setDados({
        clientes: resultados[0] || [],
        equipamentos: resultados[1] || [],
        orcamentos: resultados[2] || [],
        ordens: resultados[3] || [],
        financeiro: resultados[4] || [],
        agenda: resultados[5] || [],
      });
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar os dados dos relatórios.");
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function atualizar() {
    setAtualizando(true);
    carregarDados();
  }

  function contarPorStatus(lista: any[], status: string[]) {
    return lista.filter((item) => {
      const valor = String(
        item.status ||
          item.situacao ||
          item.estado ||
          ""
      ).toLowerCase();

      return status.some((s) => valor.includes(s.toLowerCase()));
    }).length;
  }

  function valorFinanceiro() {
    return dados.financeiro.reduce((total, item) => {
      const valor =
        Number(item.valor) ||
        Number(item.valor_total) ||
        Number(item.valorTotal) ||
        0;

      return total + valor;
    }, 0);
  }

  function moeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const relatorios: Relatorio[] = [
    {
      titulo: "Clientes",
      descricao: "Quantidade e cadastro dos clientes.",
      tabela: "clientes",
      icone: <Users size={24} />,
      cor: "blue",
    },
    {
      titulo: "Equipamentos",
      descricao: "Equipamentos cadastrados no sistema.",
      tabela: "equipamentos",
      icone: <Snowflake size={24} />,
      cor: "cyan",
    },
    {
      titulo: "Orçamentos",
      descricao: "Resumo dos orçamentos cadastrados.",
      tabela: "orcamentos",
      icone: <FileText size={24} />,
      cor: "purple",
    },
    {
      titulo: "Ordens de Serviço",
      descricao: "Serviços e atendimentos registrados.",
      tabela: "ordens",
      icone: <ClipboardList size={24} />,
      cor: "orange",
    },
    {
      titulo: "Financeiro",
      descricao: "Lançamentos e movimentações financeiras.",
      tabela: "financeiro",
      icone: <Wallet size={24} />,
      cor: "green",
    },
    {
      titulo: "Agenda",
      descricao: "Agendamentos e compromissos.",
      tabela: "agenda",
      icone: <CalendarDays size={24} />,
      cor: "pink",
    },
  ];

  function quantidade(tabela: string) {
    return dados[tabela as keyof Dados]?.length || 0;
  }

  function visualizar(tabela: string) {
    const lista = dados[tabela as keyof Dados];

    if (!lista || lista.length === 0) {
      alert("Não existem dados cadastrados para este relatório.");
      return;
    }

    alert(
      `Relatório de ${tabela.replace(
        "-",
        " "
      )}\n\nTotal de registros: ${lista.length}`
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* CABEÇALHO */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-600 p-3">
                <BarChart3 size={26} />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  Relatórios
                </h1>

                <p className="text-sm text-slate-400">
                  Visão geral dos dados do ClimaPro
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={atualizar}
            disabled={atualizando}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium transition hover:bg-blue-500 disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={atualizando ? "animate-spin" : ""}
            />

            {atualizando ? "Atualizando..." : "Atualizar dados"}
          </button>
        </div>

        {/* ERRO */}
        {erro && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {erro}
          </div>
        )}

        {/* RESUMO */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <Users className="mb-3 text-blue-400" size={22} />
            <p className="text-sm text-slate-400">Clientes</p>
            <p className="mt-1 text-2xl font-bold">
              {carregando ? "..." : dados.clientes.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <Snowflake className="mb-3 text-cyan-400" size={22} />
            <p className="text-sm text-slate-400">Equipamentos</p>
            <p className="mt-1 text-2xl font-bold">
              {carregando ? "..." : dados.equipamentos.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <FileText className="mb-3 text-purple-400" size={22} />
            <p className="text-sm text-slate-400">Orçamentos</p>
            <p className="mt-1 text-2xl font-bold">
              {carregando ? "..." : dados.orcamentos.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <ClipboardList className="mb-3 text-orange-400" size={22} />
            <p className="text-sm text-slate-400">Ordens</p>
            <p className="mt-1 text-2xl font-bold">
              {carregando ? "..." : dados.ordens.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <CalendarDays className="mb-3 text-pink-400" size={22} />
            <p className="text-sm text-slate-400">Agenda</p>
            <p className="mt-1 text-2xl font-bold">
              {carregando ? "..." : dados.agenda.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <Wallet className="mb-3 text-green-400" size={22} />
            <p className="text-sm text-slate-400">Financeiro</p>
            <p className="mt-1 text-lg font-bold">
              {carregando ? "..." : moeda(valorFinanceiro())}
            </p>
          </div>
        </div>

        {/* RELATÓRIOS */}
        <div>
          <h2 className="mb-4 text-xl font-bold">
            Relatórios disponíveis
          </h2>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {relatorios.map((relatorio) => (
              <div
                key={relatorio.tabela}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-xl bg-slate-800 p-3">
                    {relatorio.icone}
                  </div>

                  <span className="rounded-full bg-slate-800 px-3 py-1 text-sm font-semibold">
                    {carregando
                      ? "..."
                      : quantidade(relatorio.tabela)}
                  </span>
                </div>

                <h3 className="text-lg font-bold">
                  {relatorio.titulo}
                </h3>

                <p className="mt-1 min-h-[42px] text-sm text-slate-400">
                  {relatorio.descricao}
                </p>

                <button
                  onClick={() =>
                    visualizar(relatorio.tabela)
                  }
                  className="mt-5 w-full rounded-xl bg-slate-800 px-4 py-3 font-medium transition hover:bg-slate-700"
                >
                  Visualizar relatório
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* INDICADORES */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold">
            Indicadores
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2
                  size={20}
                  className="text-green-400"
                />

                <span className="font-semibold">
                  Concluídos
                </span>
              </div>

              <p className="text-3xl font-bold">
                {contarPorStatus(
                  dados.ordens,
                  ["conclu", "finalizado"]
                )}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Ordens concluídas
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Clock3
                  size={20}
                  className="text-yellow-400"
                />

                <span className="font-semibold">
                  Em andamento
                </span>
              </div>

              <p className="text-3xl font-bold">
                {contarPorStatus(
                  dados.ordens,
                  ["andamento", "atendimento", "agendado"]
                )}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Serviços em andamento
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="mb-3 flex items-center gap-2">
                <XCircle
                  size={20}
                  className="text-red-400"
                />

                <span className="font-semibold">
                  Cancelados
                </span>
              </div>

              <p className="text-3xl font-bold">
                {contarPorStatus(
                  dados.ordens,
                  ["cancel"]
                )}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Ordens canceladas
              </p>
            </div>
          </div>
        </div>

        {/* RODAPÉ */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center text-sm text-slate-500">
          ClimaPro • Relatórios integrados ao sistema
        </div>
      </div>
    </div>
  );
}
