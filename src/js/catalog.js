// ==============================================================================
// CATÁLOGO DE PRODUCTOS: BÚSQUEDA, FILTROS Y RENDERIZADO
// ==============================================================================

import { CONFIG } from './config.js';
import { getSupabase, isSupabaseConfigured } from './supabaseClient.js';
import { formatCurrency, debounce, showToast } from './utils.js';
import { initProductModal, openProductModal } from './productModal.js';

let allProducts = [];
let allCategories = [];
let activeCategory = 'all';
let activeSearch = '';
let activeSize = 'all';
let activeMaxPrice = null;

export async function initCatalog() {
  initProductModal();
  setupEventListeners();

  await loadCategoriesAndProducts();
}

/**
 * Carga categorías y productos desde Supabase o desde datos de demostración
 */
async function loadCategoriesAndProducts() {
  const loadingIndicator = document.getElementById('catalog-loading');
  const productsGrid = document.getElementById('products-grid');

  if (loadingIndicator) loadingIndicator.classList.remove('hidden');

  const supabase = getSupabase();

  try {
    if (supabase && isSupabaseConfigured()) {
      // 1. Obtener Categorías
      const { data: catData, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (catErr) throw catErr;
      allCategories = catData || [];

      // 2. Obtener Productos con sus Variantes
      const { data: prodData, error: prodErr } = await supabase
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
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (prodErr) throw prodErr;
      allProducts = prodData || [];
    } else {
      // Usar datos demo
      allCategories = CONFIG.MOCK_DATA.categories;
      allProducts = CONFIG.MOCK_DATA.products;
      showDemoBanner();
    }
  } catch (error) {
    console.error('Error cargando catálogo desde Supabase:', error);
    showToast('Error conectando a la base de datos. Cargando catálogo demo.', 'warning');
    allCategories = CONFIG.MOCK_DATA.categories;
    allProducts = CONFIG.MOCK_DATA.products;
    showDemoBanner();
  } finally {
    if (loadingIndicator) loadingIndicator.classList.add('hidden');
    window.__CATALOG_PRODUCTS__ = allProducts;
    renderCategoriesNav();
    populateSizeFilter();
    applyFiltersAndRender();

    // Comprobar si hay un producto en el hash de la URL (#prod-xxx)
    if (window.location.hash.startsWith('#prod-')) {
      const prodId = window.location.hash.replace('#prod-', '');
      const matched = allProducts.find(p => String(p.id) === prodId);
      if (matched) openProductModal(matched);
    }
  }
}

function showDemoBanner() {
  const banner = document.getElementById('demo-mode-badge');
  if (banner) {
    banner.classList.remove('hidden');
  }
}

/**
 * Renderiza los botones de categorías (Pills)
 */
function renderCategoriesNav() {
  const navContainer = document.getElementById('category-pills');
  if (!navContainer) return;

  navContainer.innerHTML = `
    <button data-cat="all" class="category-btn whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${activeCategory === 'all'
      ? 'bg-black text-white shadow-md'
      : 'bg-white text-zinc-600 hover:text-black border border-zinc-300'
    }">
      Todos
    </button>
  `;

  allCategories.forEach((cat) => {
    const btn = document.createElement('button');
    btn.dataset.cat = cat.id;
    btn.className = `category-btn whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${activeCategory === cat.id
        ? 'bg-black text-white shadow-md'
        : 'bg-white text-zinc-600 hover:text-black border border-zinc-300'
      }`;
    btn.textContent = cat.name;

    btn.addEventListener('click', () => {
      activeCategory = cat.id;
      renderCategoriesNav();
      applyFiltersAndRender();
    });

    navContainer.appendChild(btn);
  });

  const allBtn = navContainer.querySelector('button[data-cat="all"]');
  if (allBtn) {
    allBtn.addEventListener('click', () => {
      activeCategory = 'all';
      renderCategoriesNav();
      applyFiltersAndRender();
    });
  }
}

/**
 * Llena el dropdown/filtro de talles únicos encontrados en los productos
 */
function populateSizeFilter() {
  const sizeSelect = document.getElementById('filter-size-select');
  if (!sizeSelect) return;

  const sizesSet = new Set();
  allProducts.forEach(p => {
    (p.product_variants || []).forEach(v => {
      if (v.size) sizesSet.add(v.size);
    });
  });

  const sortedSizes = Array.from(sizesSet).sort((a, b) => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  sizeSelect.innerHTML = '<option value="all">Todos los talles</option>';
  sortedSizes.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = `Talle ${s}`;
    sizeSelect.appendChild(opt);
  });
}

/**
 * Configura los event listeners para búsqueda, filtros y ordenamiento
 */
function setupEventListeners() {
  // Buscador con debounce
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      activeSearch = e.target.value.trim().toLowerCase();
      applyFiltersAndRender();
    }, 250));
  }

  // Filtro por talle
  const sizeSelect = document.getElementById('filter-size-select');
  if (sizeSelect) {
    sizeSelect.addEventListener('change', (e) => {
      activeSize = e.target.value;
      applyFiltersAndRender();
    });
  }

  // Filtro por precio máximo
  const priceRange = document.getElementById('filter-price-range');
  const priceDisplay = document.getElementById('filter-price-display');
  if (priceRange && priceDisplay) {
    priceRange.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      activeMaxPrice = val;
      priceDisplay.textContent = formatCurrency(val);
      applyFiltersAndRender();
    });
  }

  // Botón para resetear filtros
  const resetBtn = document.getElementById('reset-filters-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      activeCategory = 'all';
      activeSearch = '';
      activeSize = 'all';
      activeMaxPrice = null;

      if (searchInput) searchInput.value = '';
      if (sizeSelect) sizeSelect.value = 'all';
      if (priceRange) {
        priceRange.value = priceRange.max;
        if (priceDisplay) priceDisplay.textContent = 'Sin límite';
      }

      renderCategoriesNav();
      applyFiltersAndRender();
    });
  }
}

/**
 * Filtra los productos según los criterios y renderiza la grilla
 */
function applyFiltersAndRender() {
  let filtered = allProducts.filter((product) => {
    // 1. Filtro por categoría
    if (activeCategory !== 'all' && product.category_id !== activeCategory) {
      return false;
    }

    // 2. Filtro por búsqueda de texto (título y descripción)
    if (activeSearch) {
      const titleMatch = product.title.toLowerCase().includes(activeSearch);
      const descMatch = (product.description || '').toLowerCase().includes(activeSearch);
      if (!titleMatch && !descMatch) return false;
    }

    // 3. Filtro por talle (debe tener stock > 0 en ese talle si se selecciona uno específico)
    if (activeSize !== 'all') {
      const hasSizeWithStock = (product.product_variants || []).some(
        v => v.size === activeSize && v.stock > 0
      );
      if (!hasSizeWithStock) return false;
    }

    // 4. Filtro por precio máximo
    if (activeMaxPrice !== null && Number(product.price) > activeMaxPrice) {
      return false;
    }

    return true;
  });

  renderProductsGrid(filtered);
}

/**
 * Renderiza las tarjetas de producto en el DOM
 */
function renderProductsGrid(products) {
  const grid = document.getElementById('products-grid');
  const emptyState = document.getElementById('catalog-empty-state');
  const countBadge = document.getElementById('products-count');

  if (countBadge) {
    countBadge.textContent = `${products.length} producto${products.length === 1 ? '' : 's'}`;
  }

  if (!products || products.length === 0) {
    if (grid) grid.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  grid.innerHTML = '';

  products.forEach((product) => {
    const card = createProductCard(product);
    grid.appendChild(card);
  });
}

/**
 * Crea el elemento HTML de una tarjeta de producto
 */
function createProductCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card group relative bg-white border border-zinc-200 shadow-sm rounded-3xl overflow-hidden flex flex-col cursor-pointer';

  // Calcular stock total
  const variants = product.product_variants || [];
  const totalStock = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
  const isOutOfStock = totalStock <= 0;

  // Imagen principal
  const coverImage = (product.image_urls && product.image_urls.length > 0)
    ? product.image_urls[0]
    : 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80';

  // Talles disponibles para el preview
  const availableSizes = variants
    .filter(v => v.stock > 0)
    .map(v => v.size);

  const categoryName = (allCategories.find(c => c.id === product.category_id) || {}).name || 'Exclusivo';

  card.innerHTML = `
    <!-- Imagen del Producto con Overlay de Stock -->
    <div class="relative aspect-square w-full overflow-hidden bg-white">
      <img
        src="${coverImage}"
        alt="${product.title}"
        loading="lazy"
        class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
      />

      <!-- Badge de Estado de Stock -->
      <div class="absolute top-2 sm:top-3.5 left-2 sm:left-3.5">
        ${isOutOfStock
      ? `<span class="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-white text-zinc-500 border border-zinc-200 shadow-sm backdrop-blur-md">
                Agotado
              </span>`
      : totalStock <= 3
        ? `<span class="badge-low-stock inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-white text-black border border-zinc-200 shadow-sm backdrop-blur-md">
                <span class="w-1.5 h-1.5 rounded-full bg-black"></span>
                Últimos
              </span>`
        : `<span class="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-white text-black border border-zinc-200 shadow-sm backdrop-blur-md">
                <span class="w-1.5 h-1.5 rounded-full bg-black"></span>
                En Stock
              </span>`
    }
      </div>

      <!-- Badge de Categoría -->
      <div class="absolute top-2 sm:top-3.5 right-2 sm:right-3.5 hidden sm:block">
        <span class="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white text-zinc-600 border border-zinc-200 shadow-sm backdrop-blur-md">
          ${categoryName}
        </span>
      </div>
    </div>

    <!-- Contenido e Info (CORRECCIÓN: Padding más chico en móviles p-3) -->
    <div class="p-3 sm:p-5 flex flex-col flex-grow justify-between">
      <div>
        <h3 class="font-bold text-black text-sm sm:text-base leading-snug group-hover:text-zinc-600 transition-colors line-clamp-2">
          ${product.title}
        </h3>
        
        <!-- Preview de Talles disponibles (Oculto en móviles muy chicos, visible en SM) -->
        <div class="mt-2.5 hidden sm:flex items-center gap-1.5 flex-wrap">
          ${availableSizes.length > 0
      ? availableSizes.slice(0, 4).map(s => `
                  <span class="px-2 py-0.5 rounded-md bg-white text-black text-[11px] font-medium border border-zinc-300">
                    ${s}
                  </span>
                `).join('') + (availableSizes.length > 4 ? `<span class="text-[11px] text-zinc-500 font-medium">+${availableSizes.length - 4}</span>` : '')
      : `<span class="text-xs text-zinc-500">Sin talles en stock</span>`
    }
        </div>
      </div>

      <!-- Precio y Botón Ver -->
      <div class="mt-3 sm:mt-5 pt-3 sm:pt-3.5 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span class="text-[10px] sm:text-[11px] text-zinc-500 uppercase tracking-wider block">Precio</span>
          <span class="text-base sm:text-lg font-extrabold text-black font-display">
            ${formatCurrency(product.price)}
          </span>
        </div>

        <button 
          type="button"
          class="w-full sm:w-auto justify-center px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all group-hover:shadow-md group-hover:shadow-black/10">
          <span>Ver</span>
          <svg class="w-3 h-3 sm:w-3.5 sm:h-3.5 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  `;

  card.addEventListener('click', () => {
    openProductModal(product);
  });

  return card;
}