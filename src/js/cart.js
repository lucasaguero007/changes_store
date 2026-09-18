// ==============================================================================
// GESTIÓN DEL CARRITO DE COMPRAS LATERAL (DRAWER) Y CHECKOUT WHATSAPP
// ==============================================================================

import { CONFIG } from './config.js';
import { formatCurrency, showToast } from './utils.js';

const STORAGE_KEY = 'changes_cart_v1';
let cartItems = [];

/**
 * Inicializa el carrito: carga datos de localStorage y vincula eventos de la UI.
 */
export function initCart() {
  loadCartFromStorage();
  setupCartEventListeners();
  renderCart();
}

/**
 * Carga los ítems guardados en localStorage.
 */
function loadCartFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    cartItems = data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al cargar el carrito de localStorage:', error);
    cartItems = [];
  }
}

/**
 * Guarda los ítems en localStorage.
 */
function saveCartToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  } catch (error) {
    console.error('Error al guardar el carrito en localStorage:', error);
  }
}

/**
 * Configura los eventos para abrir/cerrar el drawer y realizar acciones.
 */
function setupCartEventListeners() {
  const cartBtn = document.getElementById('cart-btn-header');
  const cartBtnMobile = document.getElementById('cart-btn-mobile');
  const closeBtn = document.getElementById('cart-close-btn');
  const overlay = document.getElementById('cart-overlay');
  const clearBtn = document.getElementById('cart-clear-btn');
  const checkoutBtn = document.getElementById('cart-checkout-btn');

  if (cartBtn) {
    cartBtn.addEventListener('click', openCart);
  }
  if (cartBtnMobile) {
    cartBtnMobile.addEventListener('click', openCart);
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', closeCart);
  }
  if (overlay) {
    overlay.addEventListener('click', closeCart);
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (cartItems.length === 0) return;
      clearCart();
      showToast('Carrito vaciado', 'info');
    });
  }
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', checkoutWhatsApp);
  }

  // Cerrar con la tecla ESC
  document.addEventListener('keydown', (e) => {
    const drawer = document.getElementById('cart-drawer');
    if (e.key === 'Escape' && drawer && !drawer.classList.contains('translate-x-full')) {
      closeCart();
    }
  });
}

/**
 * Abre el panel lateral del carrito.
 */
export function openCart() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (!drawer || !overlay) return;

  overlay.classList.remove('hidden');
  setTimeout(() => {
    overlay.classList.remove('opacity-0');
    drawer.classList.remove('translate-x-full');
  }, 10);

  document.body.style.overflow = 'hidden';
}

/**
 * Cierra el panel lateral del carrito.
 */
export function closeCart() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (!drawer || !overlay) return;

  drawer.classList.add('translate-x-full');
  overlay.classList.add('opacity-0');

  setTimeout(() => {
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  }, 300);
}

/**
 * Agrega un producto con su variante al carrito.
 */
export function addToCart(product, variant, quantity = 1) {
  if (!product) return;

  const variantId = variant ? variant.id : 'default';
  const size = variant ? variant.size : 'Único';
  const color = (variant && variant.color && variant.color !== 'Único') ? variant.color : '';
  const maxStock = variant ? Number(variant.stock) : 99;
  const image = (product.image_urls && product.image_urls.length > 0)
    ? product.image_urls[0]
    : 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80';

  const existingIndex = cartItems.findIndex(
    item => item.productId === product.id && item.variantId === variantId
  );

  if (existingIndex > -1) {
    const currentQty = cartItems[existingIndex].quantity;
    if (maxStock > 0 && currentQty + quantity > maxStock) {
      showToast(`Stock máximo alcanzado (${maxStock} disponible)`, 'warning');
      cartItems[existingIndex].quantity = maxStock;
    } else {
      cartItems[existingIndex].quantity += quantity;
      showToast(`¡Cantidad actualizada en el carrito! (${cartItems[existingIndex].quantity} u.)`, 'success');
    }
  } else {
    cartItems.push({
      productId: product.id,
      variantId: variantId,
      title: product.title,
      price: Number(product.price),
      size: size,
      color: color,
      image: image,
      stock: maxStock,
      quantity: Math.min(quantity, maxStock > 0 ? maxStock : 1)
    });
    showToast(`¡${product.title} (Talle ${size}) agregado al carrito!`, 'success');
  }

  saveCartToStorage();
  renderCart();
}

/**
 * Actualiza la cantidad de un ítem en el carrito.
 */
export function updateItemQuantity(productId, variantId, change) {
  const item = cartItems.find(i => i.productId === productId && i.variantId === variantId);
  if (!item) return;

  const newQty = item.quantity + change;

  if (newQty <= 0) {
    removeFromCart(productId, variantId);
    return;
  }

  if (item.stock > 0 && newQty > item.stock) {
    showToast(`Stock disponible máximo: ${item.stock} unidades`, 'warning');
    item.quantity = item.stock;
  } else {
    item.quantity = newQty;
  }

  saveCartToStorage();
  renderCart();
}

/**
 * Elimina un producto del carrito.
 */
export function removeFromCart(productId, variantId) {
  cartItems = cartItems.filter(i => !(i.productId === productId && i.variantId === variantId));
  saveCartToStorage();
  renderCart();
  showToast('Producto eliminado del carrito', 'info');
}

/**
 * Vacía completamente el carrito.
 */
export function clearCart() {
  cartItems = [];
  saveCartToStorage();
  renderCart();
}

/**
 * Obtiene el total de ítems en el carrito.
 */
export function getCartTotalCount() {
  return cartItems.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Obtiene el precio total acumulado del carrito.
 */
export function getCartTotalPrice() {
  return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

/**
 * Renderiza la vista del carrito y actualiza badges.
 */
export function renderCart() {
  const container = document.getElementById('cart-items-container');
  const emptyState = document.getElementById('cart-empty-state');
  const badge = document.getElementById('cart-badge-count');
  const badgeMobile = document.getElementById('cart-badge-count-mobile');
  const totalDisplay = document.getElementById('cart-total-price');
  const subtotalDisplay = document.getElementById('cart-subtotal-price');
  const checkoutBtn = document.getElementById('cart-checkout-btn');
  const itemCountHeader = document.getElementById('cart-header-items-count');

  const totalCount = getCartTotalCount();
  const totalPrice = getCartTotalPrice();

  // Actualizar badges contadores
  [badge, badgeMobile].forEach(b => {
    if (b) {
      b.textContent = totalCount;
      if (totalCount > 0) {
        b.classList.remove('hidden');
      } else {
        b.classList.add('hidden');
      }
    }
  });

  if (itemCountHeader) {
    itemCountHeader.textContent = `${totalCount} producto${totalCount === 1 ? '' : 's'}`;
  }

  if (totalDisplay) {
    totalDisplay.textContent = formatCurrency(totalPrice);
  }
  if (subtotalDisplay) {
    subtotalDisplay.textContent = formatCurrency(totalPrice);
  }

  // Estado del botón de Checkout
  if (checkoutBtn) {
    if (cartItems.length === 0) {
      checkoutBtn.disabled = true;
      checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      checkoutBtn.disabled = false;
      checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }

  if (!container) return;

  if (cartItems.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  container.innerHTML = cartItems.map(item => `
    <div class="flex items-center gap-4 py-4 border-b border-zinc-100 last:border-0 group">
      <!-- Imagen -->
      <div class="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 flex-shrink-0 relative">
        <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">
      </div>

      <!-- Detalles del Producto -->
      <div class="flex-grow min-w-0">
        <div class="flex items-start justify-between gap-2">
          <h4 class="font-bold text-sm text-black line-clamp-1">${item.title}</h4>
          <button 
            data-action="remove" 
            data-prod-id="${item.productId}" 
            data-var-id="${item.variantId}"
            class="text-zinc-400 hover:text-red-600 transition-colors p-1 -mr-1"
            title="Eliminar producto"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div class="mt-1 flex items-center gap-2 text-xs text-zinc-500">
          <span class="font-medium bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md border border-zinc-200">
            Talle: ${item.size}
          </span>
          ${item.color ? `<span class="text-zinc-400">• ${item.color}</span>` : ''}
        </div>

        <div class="mt-3 flex items-center justify-between">
          <!-- Controles de Cantidad (+ / -) -->
          <div class="flex items-center border border-zinc-200 rounded-xl bg-zinc-50 p-0.5">
            <button 
              data-action="decrease" 
              data-prod-id="${item.productId}" 
              data-var-id="${item.variantId}"
              class="w-7 h-7 rounded-lg bg-white shadow-xs text-black font-bold flex items-center justify-center hover:bg-zinc-200 transition-colors active:scale-95"
            >
              -
            </button>
            <span class="w-8 text-center text-xs font-bold text-black">${item.quantity}</span>
            <button 
              data-action="increase" 
              data-prod-id="${item.productId}" 
              data-var-id="${item.variantId}"
              class="w-7 h-7 rounded-lg bg-white shadow-xs text-black font-bold flex items-center justify-center hover:bg-zinc-200 transition-colors active:scale-95"
            >
              +
            </button>
          </div>

          <!-- Precio calculado por ítem -->
          <span class="font-extrabold text-sm text-black font-display">
            ${formatCurrency(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  `).join('');

  // Event delegation para botones dentro del container del carrito
  container.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const button = e.currentTarget;
      const action = button.dataset.action;
      const prodId = button.dataset.prodId;
      const varId = button.dataset.varId;

      if (action === 'increase') {
        updateItemQuantity(prodId, varId, 1);
      } else if (action === 'decrease') {
        updateItemQuantity(prodId, varId, -1);
      } else if (action === 'remove') {
        removeFromCart(prodId, varId);
      }
    });
  });
}

/**
 * Empaqueta todos los productos del carrito y genera un mensaje limpio para WhatsApp.
 */
export function checkoutWhatsApp() {
  if (cartItems.length === 0) {
    showToast('El carrito está vacío', 'warning');
    return;
  }

  const phone = CONFIG.WHATSAPP_PHONE.replace(/[^0-9]/g, '');
  const total = getCartTotalPrice();

  let itemsListText = cartItems.map((item, index) => {
    const detail = item.color ? ` (Talle: ${item.size}, Color: ${item.color})` : ` (Talle: ${item.size})`;
    return `${index + 1}. *${item.title}*${detail}\n   • Cantidad: ${item.quantity} u.\n   • Subtotal: ${formatCurrency(item.price * item.quantity)}`;
  }).join('\n\n');

  const message = 
`¡Hola *${CONFIG.STORE_NAME}*! 👋 Quisiera realizar la compra del siguiente pedido desde su web:

🛍️ *DETALLE DEL PEDIDO:*
${itemsListText}

----------------------------------
💰 *TOTAL A PAGAR:* ${formatCurrency(total)}
----------------------------------

¿Tienen stock disponible para coordinar el pago y el envío / retiro en local? ¡Muchas gracias!`;

  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');
  showToast('¡Abriendo WhatsApp con tu pedido!', 'success');
}
