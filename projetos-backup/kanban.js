/*
 * RESPONSABILIDADE: kanban.js
 * - initKanban(columnNodeList, table)
 *     → inicializa Sortable.js em cada coluna
 *     → ao soltar em outra coluna: DOM otimista → update no banco → reverter em erro
 *
 * Depende de: Sortable (CDN), db (app.js), showError (app.js)
 */

/**
 * Inicializa drag & drop em todas as colunas do kanban.
 *
 * @param {NodeList|Element[]} columns - elementos .column-cards
 * @param {string}             table   - nome da tabela no Supabase ('projects' ou 'scenes')
 */
function initKanban(columns, table) {
  columns.forEach(col => {
    Sortable.create(col, {
      group:     'kanban-' + table,   // mesmo group = troca entre colunas
      animation: 150,
      ghostClass:  'card-ghost',
      chosenClass: 'card-chosen',
      dragClass:   'card-dragging',

      onEnd: (evt) => handleDrop(evt, table),
    });
  });
}

/**
 * Trata o evento de soltar um card em uma coluna.
 * Faz update otimista no DOM e reverte em caso de erro no banco.
 *
 * @param {SortableEvent} evt
 * @param {string}        table
 */
async function handleDrop(evt, table) {
  const card      = evt.item;
  const toCol     = evt.to;
  const fromCol   = evt.from;
  const newStatus = toCol.dataset.status;
  const oldStatus = fromCol.dataset.status;

  // Sem mudança de coluna → nada a fazer
  if (newStatus === oldStatus) return;

  const id = card.dataset.id;
  if (!id) return;

  // ── Update no banco ──────────────────────────────────────────────────────
  try {
    const { error } = await db
      .from(table)
      .update({ status: newStatus })
      .eq('id', id);

    if (error) throw error;
  } catch (err) {
    // ── Reverter DOM ───────────────────────────────────────────────────────
    revertCard(card, fromCol, evt.oldIndex);
    showError('Erro ao mover card: ' + err.message);
  }
}

/**
 * Devolve o card para a coluna e posição originais.
 *
 * @param {Element} card
 * @param {Element} originalCol
 * @param {number}  originalIndex
 */
function revertCard(card, originalCol, originalIndex) {
  const sibling = originalCol.children[originalIndex] || null;
  originalCol.insertBefore(card, sibling);
}
