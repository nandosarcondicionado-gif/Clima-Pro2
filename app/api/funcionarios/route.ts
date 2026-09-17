import { NextResponse } from "next/server";
import { createClient as createServerClient } from "../../../lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

const allowedRoles = [
  "administrador",
  "gerente",
  "atendente",
  "tecnico",
  "financeiro",
] as const;
export async function GET() {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const { data: adminProfile, error: profileError } =
      await supabase
        .from("funcionarios")
        .select("funcao, status")
        .eq("id", user.id)
        .single();

    if (
      profileError ||
      String(adminProfile?.funcao || "").toLowerCase() !== "administrador" ||
      String(adminProfile?.status || "").toLowerCase() !== "ativo"
    ) {
      return NextResponse.json(
        { error: "Acesso negado." },
        { status: 403 }
      );
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: employees, error } = await adminSupabase
      .from("funcionarios")
      .select(
        "id, nome, email, funcao, status, created_at"
      )
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      return NextResponse.json(
        {
          error:
            "Não foi possível carregar os funcionários.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      employees: employees ?? [],
    });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const { data: adminProfile, error: profileError } =
      await supabase
        .from("funcionarios")
        .select("funcao, status")
        .eq("id", user.id)
        .single();

    if (
      profileError ||
      String(adminProfile?.funcao || "").toLowerCase() !== "administrador" ||
      String(adminProfile?.status || "").toLowerCase() !== "ativo"
    ) {
      return NextResponse.json(
        { error: "Acesso negado." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const role = String(body.role ?? "").trim().toLowerCase();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Nome, e-mail, senha e função são obrigatórios." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    if (!allowedRoles.includes(role as (typeof allowedRoles)[number])) {
      return NextResponse.json(
        { error: "Função inválida." },
        { status: 400 }
      );
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: authData, error: authError } =
      await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
        },
      });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Não foi possível criar o usuário." },
        { status: 400 }
      );
    }

    const { error: employeeError } = await adminSupabase
      .from("funcionarios")
      .insert({
        id: authData.user.id,
        nome: name,
        email,
        funcao: role,
        status: "ativo",
      });

    if (employeeError) {
      await adminSupabase.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json(
        {
          error:
            "A conta foi criada, mas não foi possível criar o perfil do funcionário.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        employee: {
          id: authData.user.id,
          nome: name,
          email,
          funcao: role,
          status: "ativo",
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
