// ==============================================================================
// MODAL DE PREGUNTAS FRECUENTES (FAQ) Y ACORDEÓN INTERACTIVO
// ==============================================================================

export function initFaqModal() {
  const modal = document.getElementById('faq-modal');
  const closeBtn = document.getElementById('faq-close-btn');

  // Event Listeners para abrir el modal desde los botones/links del footer o header
  document.querySelectorAll('.faq-open-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openFaqModal();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeFaqModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeFaqModal();
      }
    });
  }

  // Tecla ESC para cerrar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      closeFaqModal();
    }
  });

  // Inicializar lógica de acordeón dentro del modal
  setupAccordion();
}

export function openFaqModal() {
  const modal = document.getElementById('faq-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

export function closeFaqModal() {
  const modal = document.getElementById('faq-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

/**
 * Agrega funcionalidad interactiva a las preguntas del acordeón.
 */
function setupAccordion() {
  const accordionButtons = document.querySelectorAll('.faq-accordion-btn');

  accordionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      const icon = btn.querySelector('.faq-chevron-icon');
      const isExpanded = !content.classList.contains('hidden');

      // (Opcional) Cerrar los otros ítems para comportamiento de acordeón único
      accordionButtons.forEach(otherBtn => {
        if (otherBtn !== btn) {
          const otherContent = otherBtn.nextElementSibling;
          const otherIcon = otherBtn.querySelector('.faq-chevron-icon');
          if (otherContent) otherContent.classList.add('hidden');
          if (otherIcon) otherIcon.classList.remove('rotate-180');
        }
      });

      // Alternar estado actual
      if (isExpanded) {
        content.classList.add('hidden');
        if (icon) icon.classList.remove('rotate-180');
      } else {
        content.classList.remove('hidden');
        if (icon) icon.classList.add('rotate-180');
      }
    });
  });
}
