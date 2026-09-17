"use client";

import { useEffect, useState } from "react";
import {
Save,
Building2,
Phone,
Mail,
MapPin,
Bell,
RefreshCw,
} from "lucide-react";
import { createClient } from "../../lib/supabase/client";

type Configuracao = {
id: string;
nome_empresa: string;
telefone: string;
email: string;
cidade: string;
endereco: string;
notificacoes: boolean;
logo_url: string | null;
};

const configuracaoInicial: Configuracao = {
id: "",
nome_empresa: "Nando's Ar-Condicionado",
telefone: "",
email: "",
cidade: "",
endereco: "",
notificacoes: true,
logo_url: null,
};

export default function ConfiguracoesPage() {
const supabase = createClient();

const [config, setConfig] = useState<Configuracao>(configuracaoInicial);
const [carregando, setCarregando] = useState(true);
const [salvando, setSalvando] = useState(false);
const [mensagem, setMensagem] = useState("");

useEffect(() => {
carregarConfiguracoes();
}, []);

async function carregarConfiguracoes() {
setCarregando(true);
setMensagem("");

const { data, error } = await supabase
  .from("configuracoes_empresa")
  .select("*")
  .limit(1)
  .maybeSingle();

if (error) {
  console.error(error);
  setMensagem("Não foi possível carregar as configurações.");
  setCarregando(false);
  return;
}

if (data) {
  setConfig({
    id: data.id,
    nome_empresa: data.nome_empresa ?? "",
    telefone: data.telefone ?? "",
    email: data.email ?? "",
    cidade: data.cidade ?? "",
    endereco: data.endereco ?? "",
    notificacoes: data.notificacoes ?? true,
    logo_url: data.logo_url ?? null,
  });
}

setCarregando(false);

}

function alterarCampo(
campo: keyof Configuracao,
valor: string | boolean | null
) {
setConfig((atual) => ({
...atual,
[campo]: valor,
}));
}

async function salvarConfiguracoes() {
setSalvando(true);
setMensagem("");

const dados = {
  nome_empresa: config.nome_empresa.trim(),
  telefone: config.telefone.trim(),
  email: config.email.trim(),
  cidade: config.cidade.trim(),
  endereco: config.endereco.trim(),
  notificacoes: config.notificacoes,
  logo_url: config.logo_url,
};

let error;

if (config.id) {
  const resultado = await supabase
    .from("configuracoes_empresa")
    .update(dados)
    .eq("id", config.id);

  error = resultado.error;
} else {
  const resultado = await supabase
    .from("configuracoes_empresa")
    .insert(dados)
    .select()
    .single();

  error = resultado.error;

  if (!error && resultado.data) {
    setConfig((atual) => ({
      ...atual,
      id: resultado.data.id,
    }));
  }
}

if (error) {
  console.error(error);
  setMensagem("Erro ao salvar as configurações.");
  setSalvando(false);
  return;
}

setMensagem("Configurações salvas com sucesso!");
setSalvando(false);

}

if (carregando) {
return (
<div className="min-h-screen bg-slate-950 text-white p-6">
<div className="flex items-center gap-3">
<RefreshCw className="animate-spin" size={20} />
<span>Carregando configurações...</span>
</div>
</div>
);
}

return (
<div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6">
<div className="mx-auto max-w-5xl space-y-6">
<div>
<h1 className="text-2xl sm:text-3xl font-bold">
Configurações
</h1>
<p className="text-slate-400 mt-1">
Configure os dados da sua empresa e as preferências do sistema.
</p>
</div>

    {mensagem && (
      <div
        className={`rounded-xl border px-4 py-3 text-sm ${
          mensagem.includes("sucesso")
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            : "border-red-500/30 bg-red-500/10 text-red-300"
        }`}
      >
        {mensagem}
      </div>
    )}

    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
          <Building2 size={22} />
        </div>

        <div>
          <h2 className="text-lg font-semibold">
            Dados da empresa
          </h2>
          <p className="text-sm text-slate-400">
            Essas informações poderão ser utilizadas nos documentos do ClimaPro.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Nome da empresa
          </label>

          <div className="relative">
            <Building2
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={config.nome_empresa}
              onChange={(e) =>
                alterarCampo("nome_empresa", e.target.value)
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-white outline-none focus:border-blue-500"
              placeholder="Nome da empresa"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Telefone / WhatsApp
          </label>

          <div className="relative">
            <Phone
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={config.telefone}
              onChange={(e) =>
                alterarCampo("telefone", e.target.value)
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-white outline-none focus:border-blue-500"
              placeholder="(14) 99999-9999"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">
            E-mail
          </label>

          <div className="relative">
            <Mail
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="email"
              value={config.email}
              onChange={(e) =>
                alterarCampo("email", e.target.value)
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-white outline-none focus:border-blue-500"
              placeholder="empresa@email.com"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Cidade
          </label>

          <div className="relative">
            <MapPin
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={config.cidade}
              onChange={(e) =>
                alterarCampo("cidade", e.target.value)
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-white outline-none focus:border-blue-500"
              placeholder="Jaú - SP"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm text-slate-300">
            Endereço
          </label>

          <input
            value={config.endereco}
            onChange={(e) =>
              alterarCampo("endereco", e.target.value)
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            placeholder="Rua, número, bairro..."
          />
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400">
          <Bell size={22} />
        </div>

        <div>
          <h2 className="text-lg font-semibold">
            Notificações
          </h2>
          <p className="text-sm text-slate-400">
            Controle as notificações do sistema.
          </p>
        </div>
      </div>

      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <div>
          <p className="font-medium text-white">
            Ativar notificações
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Permitir que o ClimaPro utilize as notificações do sistema.
          </p>
        </div>

        <input
          type="checkbox"
          checked={config.notificacoes}
          onChange={(e) =>
            alterarCampo("notificacoes", e.target.checked)
          }
          className="h-5 w-5 accent-blue-600"
        />
      </label>
    </div>

    <div className="flex justify-end pb-6">
      <button
        onClick={salvarConfiguracoes}
        disabled={salvando}
        className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {salvando ? (
          <>
            <RefreshCw size={18} className="animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save size={18} />
            Salvar configurações
          </>
        )}
      </button>
    </div>
  </div>
</div>

);
}
