import { NextResponse } from "next/server";
import { createClient as createServerClient } from "../../../../lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

const allowedRoles = [
  "administrador",
  "gerente",
  "atendente",
  "tecnico",
  "financeiro",
] as const;

const allowedStatuses = ["ativo", "inativo"] as const;

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
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
      adminProfile?.funcao !== "administrador" ||
      adminProfile?.status !== "ativo"
    ) {
      return NextResponse.json(
        { error: "Acesso negado." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

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

    // =========================================================
    // ATIVAR / DESATIVAR FUNCIONÁRIO
    // =========================================================

    if (body.status !== undefined) {
      const status = String(body.status).trim().toLowerCase();

      if (
        !allowedStatuses.includes(
          status as (typeof allowedStatuses)[number]
        )
      ) {
        return NextResponse.json(
          { error: "Status inválido." },
          { status: 400 }
        );
      }

      // Impede o administrador de desativar a própria conta.
      if (id === user.id && status === "inativo") {
        return NextResponse.json(
          {
            error:
              "Você não pode desativar sua própria conta de administrador.",
          },
          { status: 400 }
        );
      }

      const { data: updatedEmployee, error: statusError } =
        await adminSupabase
          .from("funcionarios")
          .update({
            status,
          })
          .eq("id", id)
          .select(
            "id, nome, email, telefone, cidade, funcao, status, created_at"
          )
          .single();

      if (statusError || !updatedEmployee) {
        return NextResponse.json(
          { error: "Não foi possível alterar o status do funcionário." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        employee: updatedEmployee,
      });
    }

    // =========================================================
    // EDITAR FUNCIONÁRIO
    // =========================================================

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const city = String(body.city ?? "").trim();
    const role = String(body.role ?? "").trim().toLowerCase();

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "Nome, e-mail e função são obrigatórios." },
        { status: 400 }
      );
    }

    if (!allowedRoles.includes(role as (typeof allowedRoles)[number])) {
      return NextResponse.json(
        { error: "Função inválida." },
        { status: 400 }
      );
    }

    const { data: existingEmployee, error: employeeError } =
      await adminSupabase
        .from("funcionarios")
        .select("id, email")
        .eq("id", id)
        .single();

    if (employeeError || !existingEmployee) {
      return NextResponse.json(
        { error: "Funcionário não encontrado." },
        { status: 404 }
      );
    }

    // Atualiza a conta de autenticação.
    const { error: authError } =
      await adminSupabase.auth.admin.updateUserById(id, {
        email,
        user_metadata: {
          name,
        },
      });

    if (authError) {
      return NextResponse.json(
        { error: "Não foi possível atualizar a conta de acesso." },
        { status: 400 }
      );
    }

    // Atualiza os dados do funcionário no banco.
    const { data: updatedEmployee, error: updateError } =
      await adminSupabase
        .from("funcionarios")
        .update({
          nome: name,
          email,
          telefone: phone,
          cidade: city,
          funcao: role,
        })
        .eq("id", id)
        .select(
          "id, nome, email, telefone, cidade, funcao, status, created_at"
        )
        .single();

    if (updateError || !updatedEmployee) {
      return NextResponse.json(
        { error: "Não foi possível atualizar o funcionário." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      employee: updatedEmployee,
    });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
