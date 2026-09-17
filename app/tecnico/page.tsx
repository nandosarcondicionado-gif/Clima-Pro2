"use client";

import { useEffect, useMemo, useState } from "react";
import {
CalendarDays,
Clock,
MapPin,
User,
Wrench,
CheckCircle2,
PlayCircle,
XCircle,
RefreshCw,
LogOut,
} from "lucide-react";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";

type Agendamento = {
id: string;
cliente_id: string | null;
cliente_nome: string;
cidade: string;
servico: string;
tecnico: string;
data: string;
horario: string;
status: string;
};

const statusDisponiveis = [
"Agendado",
"Confirmado",
"Em atendimento",
"Concluído",
"Cancelado",
];

export default function TecnicoPage() {
const supabase = createClient();
const router = useRouter();

const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
const [carregando, setCarregando] = useState(true);
const [tecnicoAtual, setTecnicoAtual] = useState("Nando");
const [erro, setErro] = useState("");

useEffect(() => {
carregarDados();
}, []);

async function carregarDados() {
setCarregando(true);
setErro("");

const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  router.push("/login");
  return;
}

const { data: funcionario, error: funcionarioError } = await supabase
  .from("funcionarios")
  .select("nome")
  .eq("id", user.id)
  .maybeSingle();

if (!funcionarioError && funcionario?.nome) {
  setTecnicoAtual(funcionario.nome);
}

const { data, error } = await supabase
  .from("agenda")
  .select(
    "id, cliente_id, cliente_nome, cidade, servico, tecnico, data, horario, status"
  )
  .order("data", { ascending: true })
  .order("horario", { ascending: true });

if (error) {
  console.error(error);
  setErro("Não foi possível carregar os serviços.");
  setCarregando(false);
  return;
}

setAgendamentos((data ?? []) as Agendamento[]);
setCarregando(false);

}

const meusServicos = useMemo(() => {
return agendamentos.filter((item) => {
if (!item.tecnico) return false;

  if (item.tecnico.toLowerCase() === "todos") {
    return true;
  }

  return (
    item.tecnico.toLowerCase() === tecnicoAtual.toLowerCase()
  );
});

}, [agendamentos, tecnicoAtual]);

const servicosHoje = useMemo(() => {
const hoje = new Date().toISOString().split("T")[0];

return meusServicos.filter((item) => item.data === hoje);

}, [meusServicos]);

const pendentes = meusServicos.filter(
(item) =>
item.status === "Agendado" ||
item.status === "Confirmado"
).length;

const emAtendimento = meusServicos.filter(
(item) => item.status === "Em atendimento"
).length;

const concluidos = meusServicos.filter(
(item) => item.status === "Concluído"
).length;

async function alterarStatus(id: string, status: string) {
const { error } = await supabase
.from("agenda")
.update({ status })
.eq("id", id);

if (error) {
  console.error(error);
  setErro("Não foi possível atualizar o status.");
  return;
}

setAgendamentos((atual) =>
  atual.map((item) =>
    item.id === id ? { ...item, status } : item
  )
);

}

async function sair() {
await supabase.auth.signOut();
router.push("/login");
}

function formatarData(data: string) {
if (!data) return "-";

const [ano, mes, dia] = data.split("-");

if (!ano || !mes || !dia) return data;

return `${dia}/${mes}/${ano}`;

}

function classeStatus(status: string) {
if (status === "Concluído") {
return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
}

if (status === "Em atendimento") {
  return "border-blue-500/30 bg-blue-500/10 text-blue-300";
}

if (status === "Cancelado") {
  return "border-red-500/30 bg-red-500/10 text-red-300";
}

if (status === "Confirmado") {
  return "border-purple-500/30 bg-purple-500/10 text-purple-300";
}

return "border-amber-500/30 bg-amber-500/10 text-amber-300";

}

if (carregando) {
return (
<div className="min-h-screen bg-slate-950 text-white p-6">
<div className="flex items-center gap-3">
<RefreshCw
size={20}
className="animate-spin"
/>
<span>Carregando painel do técnico...</span>
</div>
</div>
);
}

return (
<div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6">
<div className="mx-auto max-w-6xl space-y-6">

    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-slate-400">
          Painel do técnico
        </p>

        <h1 className="mt-1 text-2xl sm:text-3xl font-bold">
          Olá, {tecnicoAtual} 👋
        </h1>

        <p className="mt-1 text-slate-400">
          Aqui estão seus serviços da agenda.
        </p>
      </div>

      <button
        onClick={sair}
        className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800"
      >
        <LogOut size={18} />
        Sair
      </button>
    </div>

    {erro && (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        {erro}
      </div>
    )}

    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
            <CalendarDays size={20} />
          </div>

          <div>
            <p className="text-xs text-slate-400">
              Hoje
            </p>
            <p className="text-2xl font-bold">
              {servicosHoje.length}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-500/10 p-2 text-amber-400">
            <Clock size={20} />
          </div>

          <div>
            <p className="text-xs text-slate-400">
              Pendentes
            </p>
            <p className="text-2xl font-bold">
              {pendentes}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-purple-500/10 p-2 text-purple-400">
            <PlayCircle size={20} />
          </div>

          <div>
            <p className="text-xs text-slate-400">
              Em atendimento
            </p>
            <p className="text-2xl font-bold">
              {emAtendimento}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <p className="text-xs text-slate-400">
              Concluídos
            </p>
            <p className="text-2xl font-bold">
              {concluidos}
            </p>
          </div>
        </div>
      </div>

    </div>

    <div className="rounded-2xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
            <Wrench size={22} />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              Meus serviços
            </h2>

            <p className="text-sm text-slate-400">
              Serviços vinculados ao técnico {tecnicoAtual}.
            </p>
          </div>
        </div>
      </div>

      {meusServicos.length === 0 ? (
        <div className="p-10 text-center">
          <CalendarDays
            size={40}
            className="mx-auto mb-3 text-slate-600"
          />

          <p className="font-medium text-slate-300">
            Nenhum serviço encontrado
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Quando houver um serviço atribuído a você na Agenda,
            ele aparecerá aqui.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800">
          {meusServicos.map((servico) => (
            <div
              key={servico.id}
              className="p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div className="min-w-0 flex-1">

                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      {servico.cliente_nome}
                    </h3>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${classeStatus(
                        servico.status
                      )}`}
                    >
                      {servico.status}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-400 sm:grid-cols-2">

                    <div className="flex items-center gap-2">
                      <Wrench
                        size={16}
                        className="text-slate-500"
                      />
                      <span>{servico.servico}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CalendarDays
                        size={16}
                        className="text-slate-500"
                      />
                      <span>
                        {formatarData(servico.data)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock
                        size={16}
                        className="text-slate-500"
                      />
                      <span>
                        {servico.horario || "Horário não informado"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin
                        size={16}
                        className="text-slate-500"
                      />
                      <span>{servico.cidade}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User
                        size={16}
                        className="text-slate-500"
                      />
                      <span>
                        Técnico: {servico.tecnico || "Não informado"}
                      </span>
                    </div>

                  </div>
                </div>

                <div className="flex flex-wrap gap-2">

                  {servico.status !== "Em atendimento" &&
                    servico.status !== "Concluído" &&
                    servico.status !== "Cancelado" && (
                      <button
                        onClick={() =>
                          alterarStatus(
                            servico.id,
                            "Em atendimento"
                          )
                        }
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-500"
                      >
                        <PlayCircle size={17} />
                        Iniciar
                      </button>
                    )}

                  {servico.status === "Em atendimento" && (
                    <button
                      onClick={() =>
                        alterarStatus(
                          servico.id,
                          "Concluído"
                        )
                      }
                      className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold hover:bg-emerald-500"
                    >
                      <CheckCircle2 size={17} />
                      Concluir
                    </button>
                  )}

                  {servico.status !== "Concluído" &&
                    servico.status !== "Cancelado" && (
                      <button
                        onClick={() =>
                          alterarStatus(
                            servico.id,
                            "Cancelado"
                          )
                        }
                        className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/20"
                      >
                        <XCircle size={17} />
                        Cancelar
                      </button>
                    )}

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="flex justify-end">
      <button
        onClick={carregarDados}
        className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800"
      >
        <RefreshCw size={17} />
        Atualizar agenda
      </button>
    </div>

  </div>
</div>

);
}
