"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  RefreshCw,
  Wrench,
  CalendarDays,
  User,
  MapPin,
  ClipboardList,
} from "lucide-react";
import { createClient } from "../../lib/supabase/client";

type StatusManutencao =
  | "Concluída"
  | "Em andamento"
  | "Cancelada"
  | "Pendente";

type Historico = {
  id: string;
  data: string;
  cliente_id: string | null;
  cliente_nome: string;
  cidade: string;
  equipamento: string;
  serie: string | null;
  tecnico: string;
  tipo: string;
  status: StatusManutencao;
  problema: string;
  servico: string;
  pecas: string | null;
  observacoes: string | null;
  valor: number;
  proxima_manutencao: string | null;
  created_at?: string;
  updated_at?: string;
};

type Cliente = {
  id: string;
  nome: string;
  cidade: string | null;
};

type FormHistorico = {
  data: string;
  cliente_id: string;
  cliente_nome: string;
  cidade: string;
  equipamento: string;
  serie: string;
  tecnico: string;
  tipo: string;
  status: StatusManutencao;
  problema: string;
  servico: string;
  pecas: string;
  observacoes: string;
  valor: string;
  proxima_manutencao: string;
};

const formularioInicial: FormHistorico = {
  data: new Date().toISOString().split("T")[0],
  cliente_id: "",
  cliente_nome: "",
  cidade: "",
  equipamento: "",
  serie: "",
  tecnico: "",
  tipo: "Manutenção preventiva",
  status: "Concluída",
  problema: "",
  servico: "",
  pecas: "",
  observacoes: "",
  valor: "0",
  proxima_manutencao: "",
};

const tiposServico = [
  "Manutenção preventiva",
  "Manutenção corretiva",
  "Instalação",
  "Higienização",
  "Visita técnica",
];

const tecnicosPadrao = [
  "Nando",
  "Técnico 2",
  "Técnico 3",
];

export default function HistoricoManutencaoPage() {
  const supabase = createClient();

  const [historicos, setHistoricos] = useState<Historico[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroTipo, setFiltroTipo] = useState("Todos");

  const [modalAberto, setModalAberto] = useState(false);
  const [historicoEditando, setHistoricoEditando] =
    useState<Historico | null>(null);

  const [form, setForm] =
    useState<FormHistorico>(formularioInicial);

  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setCarregando(true);

      const [historicoResult, clientesResult] =
        await Promise.all([
          supabase
            .from("historico_manutencao")
            .select("*")
            .order("data", { ascending: false }),

          supabase
            .from("clientes")
            .select("id, nome, cidade")
            .order("nome", { ascending: true }),
        ]);

      if (historicoResult.error) {
        console.error(historicoResult.error);
        mostrarMensagem(
          "Erro ao carregar o histórico de manutenção."
        );
        return;
      }

      if (clientesResult.error) {
        console.error(clientesResult.error);
      }

      setHistoricos(
        (historicoResult.data || []) as Historico[]
      );

      setClientes(
        (clientesResult.data || []) as Cliente[]
      );
    } catch (error) {
      console.error(error);
      mostrarMensagem("Erro ao carregar os dados.");
    } finally {
      setCarregando(false);
    }
  }

  function mostrarMensagem(texto: string) {
    setMensagem(texto);

    setTimeout(() => {
      setMensagem("");
    }, 3500);
  }

  function alterarCampo(
    campo: keyof FormHistorico,
    valor: string
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function abrirNovo() {
    setHistoricoEditando(null);
    setForm({
      ...formularioInicial,
      data: new Date().toISOString().split("T")[0],
    });
    setModalAberto(true);
  }

  function abrirEditar(item: Historico) {
    setHistoricoEditando(item);

    setForm({
      data: item.data || "",
      cliente_id: item.cliente_id || "",
      cliente_nome: item.cliente_nome || "",
      cidade: item.cidade || "",
      equipamento: item.equipamento || "",
      serie: item.serie || "",
      tecnico: item.tecnico || "",
      tipo: item.tipo || "Manutenção preventiva",
      status: item.status || "Concluída",
      problema: item.problema || "",
      servico: item.servico || "",
      pecas: item.pecas || "",
      observacoes: item.observacoes || "",
      valor: String(item.valor ?? 0),
      proxima_manutencao:
        item.proxima_manutencao || "",
    });

    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) return;

    setModalAberto(false);
    setHistoricoEditando(null);
    setForm(formularioInicial);
  }

  function selecionarCliente(clienteId: string) {
    const cliente = clientes.find(
      (item) => item.id === clienteId
    );

    if (!cliente) {
      setForm((anterior) => ({
        ...anterior,
        cliente_id: "",
        cliente_nome: "",
        cidade: "",
      }));

      return;
    }

    setForm((anterior) => ({
      ...anterior,
      cliente_id: cliente.id,
      cliente_nome: cliente.nome,
      cidade: cliente.cidade || "",
    }));
  }

  async function salvarHistorico() {
    if (!form.cliente_nome.trim()) {
      mostrarMensagem("Informe o cliente.");
      return;
    }

    if (!form.equipamento.trim()) {
      mostrarMensagem("Informe o equipamento.");
      return;
    }

    if (!form.tecnico.trim()) {
      mostrarMensagem("Informe o técnico.");
      return;
    }

    if (!form.servico.trim()) {
      mostrarMensagem("Informe o serviço realizado.");
      return;
    }

    const valor = Number(
      form.valor.replace(",", ".")
    );

    if (Number.isNaN(valor) || valor < 0) {
      mostrarMensagem("Informe um valor válido.");
      return;
    }

    try {
      setSalvando(true);

      const dados = {
        data: form.data,
        cliente_id: form.cliente_id || null,
        cliente_nome: form.cliente_nome.trim(),
        cidade: form.cidade.trim(),
        equipamento: form.equipamento.trim(),
        serie: form.serie.trim() || null,
        tecnico: form.tecnico.trim(),
        tipo: form.tipo,
        status: form.status,
        problema: form.problema.trim(),
        servico: form.servico.trim(),
        pecas: form.pecas.trim() || null,
        observacoes:
          form.observacoes.trim() || null,
        valor,
        proxima_manutencao:
          form.proxima_manutencao || null,
      };

      if (historicoEditando) {
        const { data, error } = await supabase
          .from("historico_manutencao")
          .update(dados)
          .eq("id", historicoEditando.id)
          .select()
          .single();

        if (error) {
          console.error(error);
          mostrarMensagem(
            "Erro ao atualizar o histórico."
          );
          return;
        }

        setHistoricos((anteriores) =>
          anteriores.map((item) =>
            item.id === historicoEditando.id
              ? (data as Historico)
              : item
          )
        );

        mostrarMensagem(
          "Histórico atualizado com sucesso."
        );
      } else {
        const { data, error } = await supabase
          .from("historico_manutencao")
          .insert(dados)
          .select()
          .single();

        if (error) {
          console.error(error);
          mostrarMensagem(
            "Erro ao salvar o histórico."
          );
          return;
        }

        setHistoricos((anteriores) =>
          [data as Historico, ...anteriores].sort(
            (a, b) =>
              new Date(b.data).getTime() -
              new Date(a.data).getTime()
          )
        );

        mostrarMensagem(
          "Manutenção registrada com sucesso."
        );
      }

      fecharModal();
    } catch (error) {
      console.error(error);
      mostrarMensagem("Erro ao salvar o histórico.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirHistorico(item: Historico) {
    const confirmar = window.confirm(
      `Deseja realmente excluir o registro de "${item.cliente_nome}"?`
    );

    if (!confirmar) return;

    try {
      const { error } = await supabase
        .from("historico_manutencao")
        .delete()
        .eq("id", item.id);

      if (error) {
        console.error(error);
        mostrarMensagem(
          "Erro ao excluir o registro."
        );
        return;
      }

      setHistoricos((anteriores) =>
        anteriores.filter(
          (registro) => registro.id !== item.id
        )
      );

      mostrarMensagem(
        "Registro excluído com sucesso."
      );
    } catch (error) {
      console.error(error);
      mostrarMensagem("Erro ao excluir o registro.");
    }
  }

  const historicosFiltrados = useMemo(() => {
    const texto = busca.trim().toLowerCase();

    return historicos.filter((item) => {
      const correspondeBusca =
        !texto ||
        item.cliente_nome
          .toLowerCase()
          .includes(texto) ||
        item.cidade
          .toLowerCase()
          .includes(texto) ||
        item.equipamento
          .toLowerCase()
          .includes(texto) ||
        item.tecnico
          .toLowerCase()
          .includes(texto) ||
        item.servico
          .toLowerCase()
          .includes(texto);

      const correspondeStatus =
        filtroStatus === "Todos" ||
        item.status === filtroStatus;

      const correspondeTipo =
        filtroTipo === "Todos" ||
        item.tipo === filtroTipo;

      return (
        correspondeBusca &&
        correspondeStatus &&
        correspondeTipo
      );
    });
  }, [
    historicos,
    busca,
    filtroStatus,
    filtroTipo,
  ]);

  const totalRegistros = historicos.length;

  const concluidas = historicos.filter(
    (item) => item.status === "Concluída"
  ).length;

  const andamento = historicos.filter(
    (item) => item.status === "Em andamento"
  ).length;

  const valorTotal = historicos.reduce(
    (total, item) =>
      total + Number(item.valor || 0),
    0
  );

  function formatarData(data: string) {
    if (!data) return "-";

    const partes = data.split("-");

    if (partes.length !== 3) {
      return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  function formatarMoeda(valor: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  }

  function classeStatus(status: StatusManutencao) {
    if (status === "Concluída") {
      return "bg-green-500/10 text-green-400 border-green-500/20";
    }

    if (status === "Em andamento") {
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }

    if (status === "Cancelada") {
      return "bg-red-500/10 text-red-400 border-red-500/20";
    }

    return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* CABEÇALHO */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-600 p-3">
                <Wrench size={25} />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  Histórico de Manutenção
                </h1>

                <p className="text-sm text-slate-400">
                  Histórico dos serviços realizados
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={carregarDados}
              disabled={carregando}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium transition hover:bg-slate-800 disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={
                  carregando
                    ? "animate-spin"
                    : ""
                }
              />
              Atualizar
            </button>

            <button
              onClick={abrirNovo}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold transition hover:bg-blue-700"
            >
              <Plus size={18} />
              Novo registro
            </button>
          </div>
        </div>

        {/* MENSAGEM */}
        {mensagem && (
          <div className="mb-5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
            {mensagem}
          </div>
        )}

        {/* CARDS */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Total de registros
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalRegistros}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Serviços registrados
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Concluídas
            </p>

            <p className="mt-2 text-3xl font-bold text-green-400">
              {concluidas}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Serviços finalizados
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Em andamento
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-400">
              {andamento}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Serviços em execução
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Valor dos serviços
            </p>

            <p className="mt-2 text-2xl font-bold">
              {formatarMoeda(valorTotal)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Total registrado
            </p>
          </div>
        </div>

        {/* FILTROS */}
        <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={busca}
                onChange={(e) =>
                  setBusca(e.target.value)
                }
                placeholder="Pesquisar cliente, equipamento, técnico..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>

            <select
              value={filtroStatus}
              onChange={(e) =>
                setFiltroStatus(e.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              <option value="Todos">
                Todos os status
              </option>
              <option value="Concluída">
                Concluída
              </option>
              <option value="Em andamento">
                Em andamento
              </option>
              <option value="Pendente">
                Pendente
              </option>
              <option value="Cancelada">
                Cancelada
              </option>
            </select>

            <select
              value={filtroTipo}
              onChange={(e) =>
                setFiltroTipo(e.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              <option value="Todos">
                Todos os serviços
              </option>

              {tiposServico.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LISTA */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="font-semibold">
              Registros de manutenção
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {historicosFiltrados.length} registro(s)
              encontrado(s)
            </p>
          </div>

          {carregando ? (
            <div className="flex items-center justify-center p-12 text-slate-400">
              <RefreshCw
                size={20}
                className="mr-2 animate-spin"
              />
              Carregando histórico...
            </div>
          ) : historicosFiltrados.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardList
                size={45}
                className="mx-auto mb-3 text-slate-700"
              />

              <p className="font-medium text-slate-300">
                Nenhum registro encontrado
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Registre uma manutenção para começar.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-4">
                        Data
                      </th>

                      <th className="px-5 py-4">
                        Cliente
                      </th>

                      <th className="px-5 py-4">
                        Equipamento
                      </th>

                      <th className="px-5 py-4">
                        Serviço
                      </th>

                      <th className="px-5 py-4">
                        Técnico
                      </th>

                      <th className="px-5 py-4">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right">
                        Valor
                      </th>

                      <th className="px-5 py-4 text-right">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {historicosFiltrados.map(
                      (item) => (
                        <tr
                          key={item.id}
                          className="border-b border-slate-800/70 transition hover:bg-slate-800/30"
                        >
                          <td className="px-5 py-4 text-sm text-slate-300">
                            {formatarData(item.data)}
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-medium">
                              {item.cliente_nome}
                            </div>

                            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                              <MapPin size={12} />
                              {item.cidade || "-"}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-sm font-medium">
                              {item.equipamento}
                            </div>

                            {item.serie && (
                              <div className="mt-1 text-xs text-slate-500">
                                Série: {item.serie}
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-sm text-slate-300">
                              {item.tipo}
                            </div>

                            <div className="mt-1 max-w-xs truncate text-xs text-slate-500">
                              {item.servico}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-300">
                            {item.tecnico}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${classeStatus(
                                item.status
                              )}`}
                            >
                              {item.status}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right text-sm font-medium">
                            {formatarMoeda(
                              Number(item.valor)
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() =>
                                  abrirEditar(item)
                                }
                                title="Editar"
                                className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400 transition hover:bg-blue-500/20"
                              >
                                <Pencil size={17} />
                              </button>

                              <button
                                onClick={() =>
                                  excluirHistorico(item)
                                }
                                title="Excluir"
                                className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/20"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}
              <div className="divide-y divide-slate-800 md:hidden">
                {historicosFiltrados.map(
                  (item) => (
                    <div
                      key={item.id}
                      className="p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">
                            {item.cliente_nome}
                          </h3>

                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            <MapPin size={12} />
                            {item.cidade || "-"}
                          </p>
                        </div>

                        <span
                          className={`rounded-full border px-2 py-1 text-xs ${classeStatus(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="mt-4 rounded-xl bg-slate-950 p-3">
                        <div className="flex items-center gap-2">
                          <Wrench
                            size={16}
                            className="text-blue-400"
                          />

                          <span className="font-medium">
                            {item.equipamento}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-400">
                          {item.tipo}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {item.servico}
                        </p>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-slate-950 p-3">
                          <p className="text-xs text-slate-500">
                            Data
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {formatarData(item.data)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-950 p-3">
                          <p className="text-xs text-slate-500">
                            Valor
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {formatarMoeda(
                              Number(item.valor)
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                        <User size={13} />
                        Técnico: {item.tecnico}
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() =>
                            abrirEditar(item)
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-sm text-blue-400"
                        >
                          <Pencil size={17} />
                          Editar
                        </button>

                        <button
                          onClick={() =>
                            excluirHistorico(item)
                          }
                          className="flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-red-400"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <div>
                <h2 className="text-lg font-bold">
                  {historicoEditando
                    ? "Editar manutenção"
                    : "Novo registro de manutenção"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Registre todos os detalhes do serviço.
                </p>
              </div>

              <button
                onClick={fecharModal}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2">
              {/* DATA */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Data *
                </label>

                <input
                  type="date"
                  value={form.data}
                  onChange={(e) =>
                    alterarCampo(
                      "data",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              {/* CLIENTE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Cliente *
                </label>

                <select
                  value={form.cliente_id}
                  onChange={(e) =>
                    selecionarCliente(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                >
                  <option value="">
                    Selecionar cliente
                  </option>

                  {clientes.map((cliente) => (
                    <option
                      key={cliente.id}
                      value={cliente.id}
                    >
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* CLIENTE MANUAL */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Nome do cliente
                </label>

                <input
                  value={form.cliente_nome}
                  onChange={(e) =>
                    alterarCampo(
                      "cliente_nome",
                      e.target.value
                    )
                  }
                  placeholder="Nome do cliente"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              {/* CIDADE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Cidade
                </label>

                <input
                  value={form.cidade}
                  onChange={(e) =>
                    alterarCampo(
                      "cidade",
                      e.target.value
                    )
                  }
                  placeholder="Cidade"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              {/* EQUIPAMENTO */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Equipamento *
                </label>

                <input
                  value={form.equipamento}
                  onChange={(e) =>
                    alterarCampo(
                      "equipamento",
                      e.target.value
                    )
                  }
                  placeholder="Ex.: Split Fujitsu 12.000 BTUs"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              {/* SÉRIE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Número de série
                </label>

                <input
                  value={form.serie}
                  onChange={(e) =>
                    alterarCampo(
                      "serie",
                      e.target.value
                    )
                  }
                  placeholder="Número de série"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              {/* TIPO */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Tipo de serviço
                </label>

                <select
                  value={form.tipo}
                  onChange={(e) =>
                    alterarCampo(
                      "tipo",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                >
                  {tiposServico.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              {/* STATUS */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Status
                </label>

                <select
                  value={form.status}
                  onChange={(e) =>
                    alterarCampo(
                      "status",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                >
                  <option value="Concluída">
                    Concluída
                  </option>

                  <option value="Em andamento">
                    Em andamento
                  </option>

                  <option value="Pendente">
                    Pendente
                  </option>

                  <option value="Cancelada">
                    Cancelada
                  </option>
                </select>
              </div>

              {/* TÉCNICO */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Técnico *
                </label>

                <input
                  list="tecnicos"
                  value={form.tecnico}
                  onChange={(e) =>
                    alterarCampo(
                      "tecnico",
                      e.target.value
                    )
                  }
                  placeholder="Nome do técnico"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />

                <datalist id="tecnicos">
                  {tecnicosPadrao.map(
                    (tecnico) => (
                      <option
                        key={tecnico}
                        value={tecnico}
                      />
                    )
                  )}
                </datalist>
              </div>

              {/* VALOR */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Valor
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.valor}
                  onChange={(e) =>
                    alterarCampo(
                      "valor",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              {/* PRÓXIMA MANUTENÇÃO */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Próxima manutenção
                </label>

                <input
                  type="date"
                  value={form.proxima_manutencao}
                  onChange={(e) =>
                    alterarCampo(
                      "proxima_manutencao",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              {/* PROBLEMA */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Problema relatado
                </label>

                <textarea
                  value={form.problema}
                  onChange={(e) =>
                    alterarCampo(
                      "problema",
                      e.target.value
                    )
                  }
                  rows={3}
                  placeholder="Descreva o problema relatado pelo cliente..."
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              {/* SERVIÇO */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Serviço realizado *
                </label>

                <textarea
                  value={form.servico}
                  onChange={(e) =>
                    alterarCampo(
                      "servico",
                      e.target.value
                    )
                  }
                  rows={3}
                  placeholder="Descreva o serviço realizado..."
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              {/* PEÇAS */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Peças utilizadas
                </label>

                <textarea
                  value={form.pecas}
                  onChange={(e) =>
                    alterarCampo(
                      "pecas",
                      e.target.value
                    )
                  }
                  rows={2}
                  placeholder="Ex.: Capacitor 35+5 µF, fita isolante..."
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              {/* OBSERVAÇÕES */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Observações
                </label>

                <textarea
                  value={form.observacoes}
                  onChange={(e) =>
                    alterarCampo(
                      "observacoes",
                      e.target.value
                    )
                  }
                  rows={3}
                  placeholder="Observações adicionais..."
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* RODAPÉ */}
            <div className="flex justify-end gap-3 border-t border-slate-800 p-5">
              <button
                onClick={fecharModal}
                disabled={salvando}
                className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                onClick={salvarHistorico}
                disabled={salvando}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-700 disabled:opacity-50"
              >
                {salvando ? (
                  <RefreshCw
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={18} />
                )}

                {salvando
                  ? "Salvando..."
                  : "Salvar registro"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
