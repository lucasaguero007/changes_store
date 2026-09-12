// ==============================================================================
// GESTIÓN DE PRODUCTOS: CRUD COMPLETO Y SUBIDA A SUPABASE STORAGE
// ==============================================================================

import { getSupabase } from './supabaseClient.js';
import { formatCurrency, showToast } from './utils.js';

let adminProductsList = [];
let adminCategoriesList = [];
let editingProductId = null;
let uploadedImageUrls = [];

export async function initAdminProducts() {
  setupProductModalEvents();
  await loadAdminCategories();
  await loadAdminProducts();
}

/**
 * Carga las categorías disponibles para el selector del formulario
 */
export async function loadAdminCategories() {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (error) throw error;

    adminCategoriesList = data || [];
    const select = document.getElementById('prod-form-category');
    if (select) {
      select.innerHTML = '<option value="">Selecciona una categoría...</option>';
      adminCategoriesList.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        select.appendChild(opt);
      });
    }
  } catch (err) {
    console.error('Error cargando categorías para admin:', err);
  }
}

/**
 * Carga todos los productos (activos y borradores) con sus variantes
 */
export async function loadAdminProducts() {
  const supabase = getSupabase();
  const tableBody = document.getElementById('admin-products-table-body');
  const loading = document.getElementById('admin-products-loading');

  if (!supabase || !tableBody) return;
  if (loading) loading.classList.remove('hidden');

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        title,
        description,
        price,
        category_id,
        image_urls,
        status,
        created_at,
        product_variants (
          id,
          size,
          color,
          stock
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    adminProductsList = data || [];
    renderAdminProductsTable(adminProductsList);
  } catch (err) {
    console.error('Error cargando productos en admin:', err);
    showToast('Error al cargar la lista de productos', 'error');
  } finally {
    if (loading) loading.classList.add('hidden');
  }
}

/**
 * Renderiza la tabla de productos en el dashboard
 */
function renderAdminProductsTable(products) {
  const tableBody = document.getElementById('admin-products-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  if (products.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-12 text-center text-zinc-500">
          No hay productos registrados aún. ¡Crea el primero usando el botón superior!
        </td>
      </tr>
    `;
    return;
  }

  products.forEach(p => {
    const variants = p.product_variants || [];
    const totalStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    const categoryName = (adminCategoriesList.find(c => c.id === p.category_id) || {}).name || 'Sin categoría';
    const mainImg = (p.image_urls && p.image_urls.length > 0)
      ? p.image_urls[0]
      : 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=200&q=80';

    const tr = document.createElement('tr');
    tr.className = 'border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors';
    tr.innerHTML = `
      <!-- Imagen y Título -->
      <td class="px-6 py-4 flex items-center gap-3">
        <img src="${mainImg}" alt="${p.title}" class="w-12 h-12 object-cover rounded-xl border border-zinc-700/60 flex-shrink-0">
        <div>
          <span class="font-bold text-zinc-100 text-sm block">${p.title}</span>
          <span class="text-xs text-zinc-400 font-medium">${categoryName}</span>
        </div>
      </td>

      <!-- Precio -->
      <td class="px-6 py-4 text-zinc-200 font-semibold text-sm">
        ${formatCurrency(p.price)}
      </td>

      <!-- Variantes / Talles -->
      <td class="px-6 py-4">
        <div class="flex items-center gap-1.5 flex-wrap">
          ${
            variants.length > 0
              ? variants.map(v => `
                  <span class="px-2 py-0.5 rounded text-[11px] font-medium ${
                    v.stock > 0 ? 'bg-zinc-800 text-zinc-300' : 'bg-rose-500/10 text-rose-400 line-through'
                  }">
                    ${v.size}: ${v.stock}
                  </span>
                `).join('')
              : '<span class="text-xs text-zinc-500">Sin variantes</span>'
          }
        </div>
      </td>

      <!-- Stock Total -->
      <td class="px-6 py-4">
        ${
          totalStock <= 0
            ? '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">Sin Stock</span>'
            : totalStock <= 3
            ? `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">Bajo (${totalStock})</span>`
            : `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-white text-black border border-zinc-300">${totalStock} unid.</span>`
        }
      </td>

      <!-- Estado (Activo / Borrador) -->
      <td class="px-6 py-4">
        <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${
          p.status === 'active'
            ? 'bg-white text-black'
            : 'bg-zinc-800 text-zinc-400'
        }">
          ${p.status === 'active' ? 'Activo' : 'Borrador'}
        </span>
      </td>

      <!-- Acciones -->
      <td class="px-6 py-4 text-right">
        <div class="flex items-center justify-end gap-2">
          <button data-action="edit" data-id="${p.id}" class="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors" title="Editar producto">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button data-action="delete" data-id="${p.id}" class="p-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 transition-colors" title="Eliminar producto">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </td>
    `;

    // Eventos de botones
    tr.querySelector('button[data-action="edit"]').addEventListener('click', () => openEditProductModal(p));
    tr.querySelector('button[data-action="delete"]').addEventListener('click', () => deleteProduct(p.id, p.title));

    tableBody.appendChild(tr);
  });
}

/**
 * Configura los eventos del modal de creación/edición de producto
 */
function setupProductModalEvents() {
  const newBtn = document.getElementById('admin-new-product-btn');
  const modal = document.getElementById('admin-product-modal');
  const closeBtn = document.getElementById('admin-modal-close-btn');
  const form = document.getElementById('admin-product-form');
  const addVariantBtn = document.getElementById('add-variant-row-btn');
  const imageFileInput = document.getElementById('prod-form-image-file');

  if (newBtn) {
    newBtn.addEventListener('click', () => openCreateProductModal());
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeAdminProductModal());
  }

  if (addVariantBtn) {
    addVariantBtn.addEventListener('click', () => addVariantRow());
  }

  if (imageFileInput) {
    imageFileInput.addEventListener('change', handleImageUpload);
  }

  if (form) {
    form.addEventListener('submit', handleSaveProduct);
  }

  // Buscador de productos en la tabla
  const searchInput = document.getElementById('admin-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = adminProductsList.filter(p => 
        p.title.toLowerCase().includes(q) || 
        (p.description || '').toLowerCase().includes(q)
      );
      renderAdminProductsTable(filtered);
    });
  }
}

export function openCreateProductModal() {
  editingProductId = null;
  uploadedImageUrls = [];
  document.getElementById('admin-modal-title').textContent = 'Crear Nuevo Producto';
  
  // Limpiar campos
  document.getElementById('prod-form-id').value = '';
  document.getElementById('prod-form-title').value = '';
  document.getElementById('prod-form-description').value = '';
  document.getElementById('prod-form-price').value = '';
  document.getElementById('prod-form-category').value = '';
  document.getElementById('prod-form-status').value = 'active';
  document.getElementById('uploaded-images-preview').innerHTML = '';
  document.getElementById('admin-variants-rows').innerHTML = '';

  // Agregar 2 filas de variantes por defecto (ej: talles de zapatillas o ropa)
  addVariantRow('39', 'Blanco', 2);
  addVariantRow('40', 'Blanco', 4);

  const modal = document.getElementById('admin-product-modal');
  if (modal) modal.classList.remove('hidden');
}

export function openEditProductModal(product) {
  editingProductId = product.id;
  uploadedImageUrls = [...(product.image_urls || [])];
  document.getElementById('admin-modal-title').textContent = 'Editar Producto';

  document.getElementById('prod-form-id').value = product.id;
  document.getElementById('prod-form-title').value = product.title;
  document.getElementById('prod-form-description').value = product.description || '';
  document.getElementById('prod-form-price').value = product.price;
  document.getElementById('prod-form-category').value = product.category_id || '';
  document.getElementById('prod-form-status').value = product.status;

  renderUploadedImagesPreview();

  // Cargar variantes existentes
  const container = document.getElementById('admin-variants-rows');
  container.innerHTML = '';
  const variants = product.product_variants || [];
  if (variants.length > 0) {
    variants.forEach(v => addVariantRow(v.size, v.color, v.stock, v.id));
  } else {
    addVariantRow('Único', 'Único', 1);
  }

  const modal = document.getElementById('admin-product-modal');
  if (modal) modal.classList.remove('hidden');
}

export function closeAdminProductModal() {
  const modal = document.getElementById('admin-product-modal');
  if (modal) modal.classList.add('hidden');
  editingProductId = null;
  uploadedImageUrls = [];
}

/**
 * Añade una fila de variante (Talle, Color, Stock) al formulario
 */
function addVariantRow(size = '', color = 'Único', stock = 1, variantId = '') {
  const container = document.getElementById('admin-variants-rows');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'flex items-center gap-2 mb-2 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 variant-row';
  row.dataset.variantId = variantId;

  row.innerHTML = `
    <div class="flex-1">
      <input type="text" placeholder="Talle (ej: 40 o M)" value="${size}" class="variant-size w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white" required />
    </div>
    <div class="flex-1">
      <input type="text" placeholder="Color (ej: Negro)" value="${color}" class="variant-color w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white" />
    </div>
    <div class="w-24">
      <input type="number" min="0" placeholder="Stock" value="${stock}" class="variant-stock w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white" required />
    </div>
    <button type="button" class="remove-variant-btn p-2 text-zinc-500 hover:text-rose-400 transition-colors">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
  `;

  row.querySelector('.remove-variant-btn').addEventListener('click', () => {
    row.remove();
  });

  container.appendChild(row);
}

/**
 * Sube una imagen a Supabase Storage bucket 'product-images'
 */
async function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const supabase = getSupabase();
  if (!supabase) return;

  const progressSpan = document.getElementById('image-upload-progress');
  if (progressSpan) progressSpan.textContent = 'Subiendo imagen a Supabase Storage...';

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    // Subir archivo al bucket
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    uploadedImageUrls.push(publicUrl);
    renderUploadedImagesPreview();
    showToast('Imagen subida con éxito', 'success');
  } catch (err) {
    console.error('Error subiendo imagen:', err);
    showToast('Error al subir imagen: ' + (err.message || 'Verifica permisos de Storage'), 'error');
  } finally {
    if (progressSpan) progressSpan.textContent = '';
    e.target.value = '';
  }
}

function renderUploadedImagesPreview() {
  const preview = document.getElementById('uploaded-images-preview');
  if (!preview) return;

  preview.innerHTML = '';
  uploadedImageUrls.forEach((url, idx) => {
    const item = document.createElement('div');
    item.className = 'relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-700 flex-shrink-0 group';
    item.innerHTML = `
      <img src="${url}" class="w-full h-full object-cover">
      <button type="button" class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition-opacity">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    `;
    item.querySelector('button').addEventListener('click', () => {
      uploadedImageUrls.splice(idx, 1);
      renderUploadedImagesPreview();
    });
    preview.appendChild(item);
  });
}

/**
 * Guarda el producto (Insert o Update) y sus variantes
 */
async function handleSaveProduct(e) {
  e.preventDefault();
  const supabase = getSupabase();
  if (!supabase) return;

  const saveBtn = document.getElementById('admin-save-product-btn');

  const title = document.getElementById('prod-form-title').value.trim();
  const description = document.getElementById('prod-form-description').value.trim();
  const price = parseFloat(document.getElementById('prod-form-price').value);
  const category_id = document.getElementById('prod-form-category').value || null;
  const status = document.getElementById('prod-form-status').value;

  // Extraer variantes del formulario
  const variantRows = document.querySelectorAll('.variant-row');
  const variants = [];
  variantRows.forEach(r => {
    const size = r.querySelector('.variant-size').value.trim();
    const color = r.querySelector('.variant-color').value.trim() || 'Único';
    const stock = parseInt(r.querySelector('.variant-stock').value, 10) || 0;
    const variantId = r.dataset.variantId || null;

    if (size) {
      variants.push({ id: variantId, size, color, stock });
    }
  });

  if (variants.length === 0) {
    showToast('Debes agregar al menos una variante de talle con stock', 'warning');
    return;
  }

  try {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Guardando...';

    const productPayload = {
      title,
      description,
      price,
      category_id,
      image_urls: uploadedImageUrls,
      status
    };

    let productId = editingProductId;

    if (productId) {
      // UPDATE
      const { error: updateErr } = await supabase
        .from('products')
        .update(productPayload)
        .eq('id', productId);
      if (updateErr) throw updateErr;
    } else {
      // INSERT
      const { data: newProd, error: insertErr } = await supabase
        .from('products')
        .insert([productPayload])
        .select()
        .single();
      if (insertErr) throw insertErr;
      productId = newProd.id;
    }

    // Guardar / Actualizar Variantes
    // Para simplificar y sincronizar perfectamente: eliminar variantes previas y re-insertar
    await supabase.from('product_variants').delete().eq('product_id', productId);

    const variantsPayload = variants.map(v => ({
      product_id: productId,
      size: v.size,
      color: v.color,
      stock: v.stock
    }));

    const { error: varErr } = await supabase
      .from('product_variants')
      .insert(variantsPayload);

    if (varErr) throw varErr;

    showToast('¡Producto guardado exitosamente!', 'success');
    closeAdminProductModal();
    await loadAdminProducts();
  } catch (err) {
    console.error('Error guardando producto:', err);
    showToast('Error al guardar: ' + (err.message || 'Verifica la consola'), 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Guardar Producto';
  }
}

/**
 * Elimina un producto de la base de datos
 */
async function deleteProduct(id, title) {
  if (!confirm(`¿Estás seguro de que deseas eliminar "${title}"? Esta acción no se puede deshacer.`)) {
    return;
  }

  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    showToast(`"${title}" ha sido eliminado`, 'info');
    await loadAdminProducts();
  } catch (err) {
    console.error('Error eliminando producto:', err);
    showToast('Error al eliminar producto: ' + err.message, 'error');
  }
}
