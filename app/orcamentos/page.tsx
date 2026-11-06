
  async function generateServiceOrder(budget: Budget) {
    if (budget.status !== "Aprovado") {
      alert("O orçamento precisa estar aprovado para gerar uma OS.");
      return;
    }

    if (!budget.clientId) {
      alert("Este orçamento não possui cliente vinculado.");
      return;
    }

    const confirmed = window.confirm(
      `Gerar Ordem de Serviço para ${budget.client}?\n\n` +
        `Orçamento: ${budget.number}\n` +
        `Serviços: ${budget.service}\n` +
        `Subtotal: ${money(budget.subtotal)}\n` +
        `Desconto (${budget.discountPercent}%): -${money(budget.discountValue)}\n` +
        `Serviços com desconto: ${money(budget.finalValue)}\n` +
        `Materiais: ${money(budget.materialsValue)}\n` +
        `Total geral: ${money(budget.totalValue)}`
    );

    if (!confirmed) return;

    setGeneratingOrderId(budget.id);

    try {
      const {
        data: existingOrders,
        error: existingError,
      } = await supabase
        .from("ordens_servico")
        .select("id, numero, observacoes")
        .eq("cliente_id", budget.clientId);

      if (existingError) throw existingError;

      const alreadyGenerated = (existingOrders ?? []).some(
        (order) =>
          String(order.observacoes ?? "").includes(budget.number)
      );

      if (alreadyGenerated) {
        alert("A Ordem de Serviço deste orçamento já foi gerada.");
        return;
      }

      const number = await generateOrderNumber();

      const serviceLines = budget.items
        .filter((item) => item.description.trim())
        .map(
          (item) =>
            `${item.quantity}x ${item.description} - ${money(itemTotal(item))}`
        );

      const descriptionLines = [
        "SERVIÇOS CONTRATADOS",
        ...(
          serviceLines.length > 0
            ? serviceLines
            : [budget.service || "Serviço não informado"]
        ),
        "",
        "RESUMO FINANCEIRO",
        `Subtotal dos serviços: ${money(budget.subtotal)}`,
        `Desconto aplicado (${Number(budget.discountPercent).toFixed(2)}%): -${money(budget.discountValue)}`,
        `VALOR DOS SERVIÇOS COM DESCONTO: ${money(budget.finalValue)}`,
      ];

      if (budget.materialsValue > 0) {
        descriptionLines.push(
          `Materiais: ${money(budget.materialsValue)}`
        );
      }

      descriptionLines.push(
        `TOTAL GERAL DO ORÇAMENTO: ${money(budget.totalValue)}`
      );

      const serviceType = getServiceType(budget.service);

      const observations =
        `Gerada automaticamente a partir do orçamento ${budget.number}.\n` +
        `Subtotal dos serviços: ${money(budget.subtotal)}.\n` +
        `Desconto aplicado: ${Number(budget.discountPercent).toFixed(2)}% (${money(budget.discountValue)}).\n` +
        `Serviços com desconto: ${money(budget.finalValue)}.\n` +
        `Materiais previstos: ${money(budget.materialsValue)}.\n` +
        `Total geral do orçamento: ${money(budget.totalValue)}.`;

      const { error } = await supabase
        .from("ordens_servico")
        .insert({
          numero: number,
          cliente_id: budget.clientId,
          cliente_nome: budget.client,
          equipamento: budget.equipment || "Não informado",
          cidade: budget.city,
          tipo_servico: serviceType,
          descricao: descriptionLines.join("\n"),
          data: new Date().toISOString().slice(0, 10),
          tecnico: null,

          // Mantém o valor dos serviços após o desconto.
          valor: budget.finalValue,

          status: "Aberta",
          observacoes,
        });

      if (error) throw error;

      alert(`OS ${number} criada com sucesso!`);

      window.location.href = "/ordens-servico";
    } catch (error) {
      console.error(error);
      alert("Não foi possível gerar a Ordem de Serviço.");
    } finally {
      setGeneratingOrderId(null);
    }
  }
