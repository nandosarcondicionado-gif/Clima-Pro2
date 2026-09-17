import { NextResponse } from "next/server";
import { createClient as createServerClient } from "../../../../../lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

const allowedModules = [
  "dashboard",
  "clientes",
  "equipamentos",
  "orcamentos",
  "ordens-servico",
  "agenda",
  "contratos",
  "financeiro",
  "estoque",
  "relatorios",
  "tecnicos",
  "tecnico",
  "area-cliente",
  "configuracoes",
] as const;

type PermissionInput = {
  modulo: string;
  visualizar?: boolean;
  criar?: boolean;
  editar?: boolean;
  excluir?: boolean;
};

async function checkAdmin() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      authorized: false,
      status: 401,
      error: "Não autenticado.",
    };
  }

  const { data: funcionario, error } = await supabase
    .from("funcionarios")
    .select("funcao, status")
    .eq("id", user.id)
    .single();

  if (
    error ||
    !funcionario ||
    String(funcionario.funcao || "").toLowerCase() !== "administrador" ||
    String(funcionario.status || "").toLowerCase() !== "ativo"
  ) {
    return {
      authorized: false,
      status: 403,
      error: "Acesso negado.",
    };
  }

  return {
    authorized: true,
    user,
  };
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const adminCheck = await checkAdmin();

    if (!adminCheck.authorized) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { id } = await context.params;

    const adminSupabase = getAdminClient();

    const { data: permissions, error } = await adminSupabase
      .from("permissoes_funcionarios")
      .select(
        "id, funcionario_id, modulo, visualizar, criar, editar, excluir"
      )
      .eq("funcionario_id", id)
      .order("modulo", {
        ascending: true,
      });

    if (error) {
      return NextResponse.json(
        {
          error: "Não foi possível carregar as permissões.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      permissions: permissions ?? [],
    });
  } catch {
    return NextResponse.json(
      {
        error: "Erro interno do servidor.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const adminCheck = await checkAdmin();

    if (!adminCheck.authorized) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { id } = await context.params;

    if (adminCheck.user && id === adminCheck.user.id) {
      return NextResponse.json(
        {
          error:
            "As permissões do administrador principal não podem ser alteradas por esta tela.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (!Array.isArray(body.permissions)) {
      return NextResponse.json(
        {
          error: "O campo permissions deve ser uma lista.",
        },
        { status: 400 }
      );
    }

    const permissions = body.permissions as PermissionInput[];

    const uniqueModules = new Set<string>();

    for (const permission of permissions) {
      const modulo = String(permission.modulo ?? "")
        .trim()
        .toLowerCase();

      if (!allowedModules.includes(modulo as (typeof allowedModules)[number])) {
        return NextResponse.json(
          {
            error: `Módulo inválido: ${modulo}`,
          },
          { status: 400 }
        );
      }

      if (uniqueModules.has(modulo)) {
        return NextResponse.json(
          {
            error: `O módulo ${modulo} foi enviado mais de uma vez.`,
          },
          { status: 400 }
        );
      }

      uniqueModules.add(modulo);
    }

    const adminSupabase = getAdminClient();

    const { data: funcionario, error: funcionarioError } =
      await adminSupabase
        .from("funcionarios")
        .select("id, funcao, status")
        .eq("id", id)
        .single();

    if (funcionarioError || !funcionario) {
      return NextResponse.json(
        {
          error: "Funcionário não encontrado.",
        },
        { status: 404 }
      );
    }

    const { error: deleteError } = await adminSupabase
      .from("permissoes_funcionarios")
      .delete()
      .eq("funcionario_id", id);

    if (deleteError) {
      return NextResponse.json(
        {
          error: "Não foi possível atualizar as permissões.",
        },
        { status: 500 }
      );
    }

    const rows = permissions
      .filter(
        (permission) =>
          permission.visualizar === true ||
          permission.criar === true ||
          permission.editar === true ||
          permission.excluir === true
      )
      .map((permission) => ({
        funcionario_id: id,
        modulo: String(permission.modulo)
          .trim()
          .toLowerCase(),
        visualizar: permission.visualizar === true,
        criar: permission.criar === true,
        editar: permission.editar === true,
        excluir: permission.excluir === true,
      }));

    if (rows.length > 0) {
      const { error: insertError } = await adminSupabase
        .from("permissoes_funcionarios")
        .insert(rows);

      if (insertError) {
        return NextResponse.json(
          {
            error:
              "As permissões foram removidas, mas não foi possível salvar as novas permissões.",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      permissions: rows,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Erro interno do servidor.",
      },
      { status: 500 }
    );
  }
}
