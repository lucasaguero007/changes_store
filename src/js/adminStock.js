// ==============================================================================
// GESTIÓN RÁPIDA DE STOCK Y TALLES (+ / - UNIDADES SIN RECARGAR)
// ==============================================================================

import { getSupabase } from './supabaseClient.js';
import { showToast } from './utils.js';

let stockProductsList = [];

export async function initAdminStock() {
  setupStockEvents();
  await loadStockManagerData();
}

/**
 * Carga los productos y sus variantes para el gestor rápido de stock
 */
export async function loadStockManagerData() {
  const supabase = getSupabase();
  const container = document.getElementById('quick-stock-container');
  const loading = document.getElementById('quick-stock-loading');

  if (!supabase || !container) return;
  if (loading) loading.classList.remove('hidden');

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        title,
        price,
        image_urls,
        product_variants (
          id,
          size,
          color,
          stock
        )
      `)
      .order('title');

    if (error) throw error;
    stockProductsList = data || [];
    renderStockManager(stockProductsList);
  } catch (err) {
    console.error('Error cargando stock:', err);
    showToast('Error al cargar inventario', 'error');
  } finally {
    if (loading) loading.classList.add('hidden');
  }
}

/**
 * Renderiza los paneles de stock rápido agrupados por producto
 */
function renderStockManager(products) {
  const container = document.getElementById('quick-stock-container');
  if (!container) return;

  container.innerHTML = '';

  if (products.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center text-zinc-500 bg-zinc-900/40 rounded-2xl border border-zinc-800">
        No hay productos registrados con variantes para gestionar stock.
      </div>
    `;
    return;
  }

  products.forEach(p => {
    const variants = p.product_variants || [];
    const mainImg = (p.image_urls && p.image_urls.length > 0)
      ? p.image_urls[0]
      : 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=150&q=80';

    const card = document.createElement('div');
    card.className = 'bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 transition-all';

    card.innerHTML = `
      <!-- Cabecera del producto -->
      <div class="flex items-center gap-4 pb-4 border-b border-zinc-800/60">
        <img src="${mainImg}" alt="${p.title}" class="w-12 h-12 rounded-xl object-cover border border-zinc-700/50">
        <div>
          <h4 class="font-bold text-zinc-100 text-sm md:text-base leading-snug">${p.title}</h4>
          <span class="text-xs text-zinc-400">Variantes registradas: ${variants.length}</span>
        </div>
      </div>

      <!-- Grilla de Variantes / Talles con botones rápidos -->
      <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        ${
          variants.length > 0
            ? variants.map(v => `
                <div class="flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 border ${
                  v.stock === 0 ? 'border-rose-500/30 bg-rose-950/10' : 'border-zinc-800'
                }" id="variant-card-${v.id}">
                  <div>
                    <div class="flex items-center gap-1.5">
                      <span class="font-bold text-sm text-zinc-100">Talle ${v.size}</span>
                      ${v.color && v.color !== 'Único' ? `<span class="text-[10px] text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-800">${v.color}</span>` : ''}
                    </div>
                    <span class="text-xs font-semibold ${v.stock === 0 ? 'text-zinc-500 font-bold' : v.stock <= 2 ? 'text-amber-400' : 'text-black'} stock-label-${v.id}">
                      ${v.stock === 0 ? 'Agotado' : `${v.stock} disponibles`}
                    </span>
                  </div>

                  <!-- Botones +/- -->
                  <div class="flex items-center gap-1">
                    <button 
                      type="button" 
                      data-action="decrement" 
                      data-id="${v.id}" 
                      class="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 font-bold flex items-center justify-center transition-all ${v.stock <= 0 ? 'opacity-40 cursor-not-allowed' : ''}">
                      -
                    </button>

                    <span class="w-8 text-center text-sm font-bold text-zinc-100 stock-val-${v.id}">
                      ${v.stock}
                    </span>

                    <button 
                      type="button" 
                      data-action="increment" 
                      data-id="${v.id}" 
                      class="w-8 h-8 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-300 text-black font-bold flex items-center justify-center active:scale-95 transition-all">
                      +
                    </button>
                  </div>
                </div>
              `).join('')
            : '<span class="text-xs text-zinc-500 col-span-3 py-2">Sin variantes configuradas. Edita el producto para agregarlas.</span>'
        }
      </div>
    `;

    // Asociar eventos a los botones de incremento y decremento
    variants.forEach(v => {
      const decBtn = card.querySelector(`button[data-action="decrement"][data-id="${v.id}"]`);
      const incBtn = card.querySelector(`button[data-action="increment"][data-id="${v.id}"]`);

      if (decBtn) {
        decBtn.addEventListener('click', () => updateVariantStockQuick(v, -1));
      }
      if (incBtn) {
        incBtn.addEventListener('click', () => updateVariantStockQuick(v, 1));
      }
    });

    container.appendChild(card);
  });
}

/**
 * Actualiza el stock de una variante en 1 clic
 */
async function updateVariantStockQuick(variant, delta) {
  const newStock = Math.max(0, variant.stock + delta);
  if (newStock === variant.stock) return;

  const supabase = getSupabase();
  if (!supabase) return;

  // Actualización optimista en el DOM
  const oldStock = variant.stock;
  variant.stock = newStock;
  updateVariantDom(variant);

  try {
    const { error } = await supabase
      .from('product_variants')
      .update({ stock: newStock })
      .eq('id', variant.id);

    if (error) throw error;

    showToast(`Talle ${variant.size}: stock actualizado a ${newStock}`, 'success');
  } catch (err) {
    console.error('Error actualizando stock rápido:', err);
    // Rollback optimista
    variant.stock = oldStock;
    updateVariantDom(variant);
    showToast('Error al actualizar stock: ' + err.message, 'error');
  }
}

function updateVariantDom(variant) {
  const card = document.getElementById(`variant-card-${variant.id}`);
  const valSpan = document.querySelector(`.stock-val-${variant.id}`);
  const labelSpan = document.querySelector(`.stock-label-${variant.id}`);
  const decBtn = card ? card.querySelector(`button[data-action="decrement"]`) : null;

  if (valSpan) valSpan.textContent = variant.stock;

  if (labelSpan) {
    if (variant.stock === 0) {
      labelSpan.className = 'text-xs font-bold text-rose-400';
      labelSpan.textContent = 'Agotado';
    } else if (variant.stock <= 2) {
      labelSpan.className = 'text-xs font-semibold text-amber-400';
      labelSpan.textContent = `${variant.stock} disponibles`;
    } else {
      labelSpan.className = 'text-xs font-semibold text-black';
      labelSpan.textContent = `${variant.stock} disponibles`;
    }
  }

  if (card) {
    if (variant.stock === 0) {
      card.className = 'flex items-center justify-between p-3 rounded-xl bg-rose-950/10 border border-rose-500/30';
    } else {
      card.className = 'flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 border border-zinc-800';
    }
  }

  if (decBtn) {
    if (variant.stock <= 0) {
      decBtn.classList.add('opacity-40', 'cursor-not-allowed');
    } else {
      decBtn.classList.remove('opacity-40', 'cursor-not-allowed');
    }
  }
}

function setupStockEvents() {
  const searchInput = document.getElementById('stock-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = stockProductsList.filter(p => 
        p.title.toLowerCase().includes(q) ||
        (p.product_variants || []).some(v => v.size.toLowerCase().includes(q))
      );
      renderStockManager(filtered);
    });
  }
}
