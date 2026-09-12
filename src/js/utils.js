// ==============================================================================
// UTILIDADES: FORMATEADORES, TOASTS Y GENERADOR DE WHATSAPP
// ==============================================================================

import { CONFIG } from './config.js';

/**
 * Formatea un número a moneda local (ej: $ 120.000)
 */
export function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return `${CONFIG.CURRENCY_SYMBOL} ${num.toLocaleString(CONFIG.CURRENCY_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
}

/**
 * Genera el enlace de WhatsApp pre-formateado para encargar un producto
 */
export function generateWhatsAppLink({ product, variant }) {
  const phone = CONFIG.WHATSAPP_PHONE.replace(/[^0-9]/g, '');
  const productUrl = `${window.location.origin}${window.location.pathname}#prod-${product.id}`;

  const message = 
`¡Hola *${CONFIG.STORE_NAME}*! 👋 Vengo de su catálogo web y quiero consultar por este producto:

👟 *Producto:* ${product.title}
📏 *Talle:* ${variant.size}
🎨 *Color:* ${variant.color || 'Único'}
💰 *Precio:* ${formatCurrency(product.price)}
🔗 *Enlace:* ${productUrl}

¿Tienen disponibilidad para coordinar el pago y la entrega/envío? ¡Muchas gracias!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Muestra una notificación flotante (toast) moderna
 */
export function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const borderColors = {
    success: 'border-zinc-300 bg-white text-black',
    error: 'border-rose-500/40 bg-white text-rose-600',
    warning: 'border-amber-500/40 bg-white text-amber-600',
    info: 'border-zinc-300 bg-white text-zinc-600'
  };

  const icons = {
    success: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
    error: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>',
    warning: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
    info: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
  };

  toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl text-sm font-medium animate-fade-in ${borderColors[type] || borderColors.info}`;
  toast.innerHTML = `
    ${icons[type] || icons.info}
    <span class="text-black">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2', 'transition-all', 'duration-300');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Función debounce para demorar ejecuciones rápidas (ej: inputs de búsqueda)
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
