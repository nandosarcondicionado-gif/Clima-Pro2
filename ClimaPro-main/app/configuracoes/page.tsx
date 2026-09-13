"use client";

import { useState } from "react";
import {
  Bell,
  Building2,
  Lock,
  Save,
  Settings,
  User,
} from "lucide-react";

export default function ConfiguracoesPage() {
  const [company, setCompany] = useState({
    name: "ClimaPro",
    phone: "",
    email: "",
    city: "",
    address: "",
  });

  const [notifications, setNotifications] = useState(true);

  function save() {
    alert("Configurações salvas.");
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">

        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-500/10 p-3">
              <Settings className="h-7 w-7 text-cyan-400" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Configurações
              </h1>
              <p className="text-slate-400">
                Configure sua empresa e seu sistema
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-5">

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-5 flex items-center gap-3">
              <Building2 className="text-cyan-400" />
              <h2 className="font-bold">Empresa</h2>
            </div>

            <div className="grid gap-3 md:grid-cols-2">

              {[
                ["name", "Nome da empresa"],
                ["phone", "Telefone"],
                ["email", "E-mail"],
                ["city", "Cidade"],
                ["address", "Endereço"],
              ].map(([key, placeholder]) => (
                <input
                  key={key}
                  placeholder={placeholder}
                  value={company[key as keyof typeof company]}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      [key]: e.target.value,
                    })
                  }
                  className="rounded-xl border border-slate-700 bg-slate-950 p-3 outline-none focus:border-cyan-500"
                />
              ))}

            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-5 flex items-center gap-3">
              <User className="text-cyan-400" />
              <h2 className="font-bold">Perfil</h2>
            </div>

            <p className="text-sm text-slate-400">
              Usuário atual
            </p>

            <p className="mt-1 font-semibold">
              Administrador
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-5 flex items-center gap-3">
              <Bell className="text-cyan-400" />
              <h2 className="font-bold">Notificações</h2>
            </div>

            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-300">
                Receber notificações do sistema
              </span>

              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) =>
                  setNotifications(e.target.checked)
                }
                className="h-5 w-5"
              />
            </label>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-5 flex items-center gap-3">
              <Lock className="text-cyan-400" />
              <h2 className="font-bold">Segurança</h2>
            </div>

            <button className="rounded-xl border border-slate-700 px-4 py-3 hover:bg-slate-800">
              Alterar senha
            </button>
          </section>

          <button
            onClick={save}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950"
          >
            <Save className="h-5 w-5" />
            Salvar configurações
          </button>

        </div>
      </div>
    </main>
  );
}
