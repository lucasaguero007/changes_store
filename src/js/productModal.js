// ==============================================================================
// MODAL DE DETALLE DE PRODUCTO Y ACCIÓN DE COMPRA POR WHATSAPP
// ==============================================================================

import { formatCurrency, generateWhatsAppLink, showToast } from './utils.js';

let currentProduct = null;
let selectedVariant = null;

export function initProductModal() {
  const modal = document.getElementById('product-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!modal) return;

  // Cerrar al pulsar el botón de cerrar
  if (closeBtn) {
    closeBtn.addEventListener('click', closeProductModal);
  }

  // Cerrar al hacer clic en el backdrop oscuro
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeProductModal();
    }
  });

  // Cerrar con la tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeProductModal();
    }
  });

  // Listener para hash en la URL (ej: #prod-uuid)
  window.addEventListener('hashchange', checkUrlHashForProduct);
}

export function openProductModal(product) {
  currentProduct = product;
  selectedVariant = null; // CORRECCIÓN: Resetea el talle al abrir un producto nuevo

  const modal = document.getElementById('product-modal');
  if (!modal) return;

  // 1. Configurar Galería de Imágenes
  const mainImage = document.getElementById('modal-main-image');
  const thumbsContainer = document.getElementById('modal-thumbnails');
  const images = (product.image_urls && product.image_urls.length > 0)
    ? product.image_urls
    : ['https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80'];

  mainImage.src = images[0];
  mainImage.alt = product.title;

  thumbsContainer.innerHTML = '';
  if (images.length > 1) {
    thumbsContainer.classList.remove('hidden');
    images.forEach((imgUrl, index) => {
      const thumb = document.createElement('button');
      thumb.className = `w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${index === 0 ? 'border-black scale-105' : 'border-zinc-300 opacity-70 hover:opacity-100'
        }`;
      thumb.innerHTML = `<img src="${imgUrl}" alt="${product.title}" class="w-full h-full object-cover">`;
      thumb.addEventListener('click', () => {
        mainImage.src = imgUrl;
        thumbsContainer.querySelectorAll('button').forEach(b => {
          b.className = 'w-16 h-16 rounded-lg overflow-hidden border-2 border-zinc-300 opacity-70 hover:opacity-100 flex-shrink-0';
        });
        thumb.className = 'w-16 h-16 rounded-lg overflow-hidden border-2 border-black scale-105 flex-shrink-0';
      });
      thumbsContainer.appendChild(thumb);
    });
  } else {
    thumbsContainer.classList.add('hidden');
  }

  // 2. Información del Producto
  document.getElementById('modal-title').textContent = product.title;
  document.getElementById('modal-price').textContent = formatCurrency(product.price);
  document.getElementById('modal-description').textContent = product.description || 'Sin descripción detallada.';

  // 3. Renderizar Variantes (Talles y Colores)
  const variants = product.product_variants || [];
  renderSizeSelectors(variants);

  // 4. Mostrar el modal
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden'; // Evitar scroll del fondo

  // Actualizar hash sin provocar salto
  history.replaceState(null, null, `#prod-${product.id}`);
}

export function closeProductModal() {
  const modal = document.getElementById('product-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  document.body.style.overflow = '';
  currentProduct = null;
  selectedVariant = null;

  // Limpiar hash
  if (window.location.hash.startsWith('#prod-')) {
    history.replaceState(null, null, window.location.pathname + window.location.search);
  }
}

function renderSizeSelectors(variants) {
  const sizesContainer = document.getElementById('modal-sizes-container');
  const stockInfo = document.getElementById('modal-stock-info');
  const buyBtn = document.getElementById('modal-buy-whatsapp-btn');

  sizesContainer.innerHTML = '';

  if (!variants || variants.length === 0) {
    selectedVariant = null;
    sizesContainer.innerHTML = '<span class="text-zinc-500 text-sm">Talle único o consultar por WhatsApp.</span>';
    stockInfo.innerHTML = '<span class="text-black font-semibold text-xs">● Disponible para encargo</span>';
    updateBuyButton(true, { size: 'Único', color: 'Estándar', stock: 1 });
    return;
  }

  // CORRECCIÓN: Solo preseleccionar el primer talle si no hay uno ya seleccionado
  if (!selectedVariant) {
    const firstWithStock = variants.find(v => v.stock > 0);
    selectedVariant = firstWithStock || variants[0];
  }

  variants.forEach((v) => {
    const isOutOfStock = v.stock <= 0;
    const isSelected = selectedVariant && selectedVariant.id === v.id;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.variantId = v.id;

    let classes = 'px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 relative ';

    if (isOutOfStock) {
      classes += 'border-zinc-200 bg-zinc-100 text-zinc-400 line-through cursor-not-allowed opacity-60';
    } else if (isSelected) {
      classes += 'border-black bg-black text-white ring-2 ring-black/30';
    } else {
      classes += 'border-zinc-300 bg-white text-black hover:border-black hover:bg-zinc-50';
    }

    btn.className = classes;
    btn.innerHTML = `
      <span>${v.size}</span>
      ${v.color && v.color !== 'Único' ? `<span class="text-[10px] block font-normal opacity-75">${v.color}</span>` : ''}
    `;

    if (!isOutOfStock) {
      btn.addEventListener('click', () => {
        selectedVariant = v;
        renderSizeSelectors(variants);
      });
    }

    sizesContainer.appendChild(btn);
  });

  updateStockFeedbackAndButton();
}

function updateStockFeedbackAndButton() {
  const stockInfo = document.getElementById('modal-stock-info');
  const buyBtn = document.getElementById('modal-buy-whatsapp-btn');

  if (!selectedVariant) {
    stockInfo.innerHTML = '<span class="text-zinc-500 text-sm">Selecciona un talle para ver disponibilidad</span>';
    updateBuyButton(false);
    return;
  }

  if (selectedVariant.stock <= 0) {
    stockInfo.innerHTML = `
      <div class="flex items-center gap-2 text-zinc-500 text-sm font-medium">
        <span class="w-2.5 h-2.5 rounded-full bg-zinc-300"></span>
        <span>Agotado en talle ${selectedVariant.size}. ¡Consulta por WhatsApp si ingresa pronto!</span>
      </div>
    `;
    updateBuyButton(false);
  } else if (selectedVariant.stock <= 2) {
    stockInfo.innerHTML = `
      <div class="flex items-center gap-2 text-black text-sm font-medium">
        <span class="w-2.5 h-2.5 rounded-full bg-black animate-ping"></span>
        <span>¡Últimas ${selectedVariant.stock} unidades en talle ${selectedVariant.size}!</span>
      </div>
    `;
    updateBuyButton(true, selectedVariant);
  } else {
    stockInfo.innerHTML = `
      <div class="flex items-center gap-2 text-black text-sm font-medium">
        <span class="w-2.5 h-2.5 rounded-full bg-black"></span>
        <span>Stock disponible (${selectedVariant.stock} unidades en talle ${selectedVariant.size})</span>
      </div>
    `;
    updateBuyButton(true, selectedVariant);
  }
}

function updateBuyButton(isEnabled, variant = null) {
  const buyBtn = document.getElementById('modal-buy-whatsapp-btn');
  if (!buyBtn) return;

  // Clonar para limpiar event listeners previos
  const newBuyBtn = buyBtn.cloneNode(true);
  buyBtn.parentNode.replaceChild(newBuyBtn, buyBtn);

  if (isEnabled && variant) {
    newBuyBtn.disabled = false;
    newBuyBtn.className = 'w-full py-4 px-6 rounded-2xl bg-black hover:bg-zinc-800 text-white font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-black/10 active:scale-95 transition-all cursor-pointer';
    newBuyBtn.innerHTML = `
      <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.053-2.126-.537-1.428-.59-2.348-2.04-2.42-2.137-.071-.097-.571-.762-.571-1.455 0-.693.364-1.034.494-1.175.13-.141.286-.176.381-.176.095 0 .19.002.274.006.088.004.205-.034.322.247.12.288.409 1.001.445 1.074.036.073.06.158.012.253-.047.096-.072.155-.143.238-.071.083-.15.186-.214.25-.072.072-.147.151-.063.295.084.144.372.613.799.993.549.489 1.011.641 1.155.713.143.072.227.06.311-.036.084-.096.357-.417.452-.56.096-.144.191-.12.322-.072.131.048.835.394.978.465.143.071.238.107.274.167.036.06.036.345-.108.75zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.444 5.176L2 22l4.981-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.637 0-3.153-.497-4.417-1.353l-.317-.215-2.949.771.787-2.87-.234-.333A7.954 7.954 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
      </svg>
      <span>Comprar por WhatsApp</span>
    `;

    newBuyBtn.addEventListener('click', () => {
      const url = generateWhatsAppLink({
        product: currentProduct,
        variant: variant
      });
      window.open(url, '_blank');
      showToast('¡Abriendo WhatsApp para coordinar tu pedido!', 'success');
    });
  } else {
    newBuyBtn.disabled = true;
    newBuyBtn.className = 'w-full py-4 px-6 rounded-2xl bg-zinc-200 text-zinc-500 font-semibold text-base flex items-center justify-center gap-2 cursor-not-allowed opacity-60';
    newBuyBtn.innerHTML = `
      <span>Selecciona un talle disponible</span>
    `;
  }
}

function checkUrlHashForProduct() {
  const hash = window.location.hash;
  if (hash.startsWith('#prod-')) {
    const prodId = hash.replace('#prod-', '');
    if (window.__CATALOG_PRODUCTS__) {
      const prod = window.__CATALOG_PRODUCTS__.find(p => String(p.id) === prodId);
      if (prod) openProductModal(prod);
    }
  }
}