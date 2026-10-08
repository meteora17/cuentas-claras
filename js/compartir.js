/**
 * Cuentas Claras - Utilidades compartidas
 * Funciones de formato, acordeones accesibles con animación suave y compartir resultados.
 */

// Utilidad para formatear números en euros o moneda genérica sin perder simplicidad
function formatearMoneda(cantidad) {
  if (isNaN(cantidad) || cantidad === null || cantidad === undefined) return '0,00 €';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(cantidad);
}

// Formatear números enteros o decimales limpios
function formatearNumero(numero, decimales = 0) {
  if (isNaN(numero) || numero === null || numero === undefined) return '0';
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales
  }).format(numero);
}

// Formatear porcentajes
function formatearPorcentaje(valor, decimales = 1) {
  if (isNaN(valor) || valor === null || valor === undefined) return '0%';
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimales
  }).format(valor) + '%';
}

// Inicialización de acordeones accesibles con animación suave (200-400ms)
function inicializarAcordeones() {
  const items = document.querySelectorAll('.accordion-item');
  items.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const collapse = item.querySelector('.accordion-collapse');
    if (!trigger || !collapse) return;

    trigger.setAttribute('aria-expanded', 'false');

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      
      // Cerrar otros acordeones si se desea comportamiento exclusivo o permitir múltiples
      // Aquí cerramos suavemente el actual o lo abrimos
      if (isOpen) {
        collapse.style.maxHeight = collapse.scrollHeight + 'px';
        // Forzar reflow para que la animación funcione
        collapse.offsetHeight;
        collapse.style.maxHeight = '0px';
        item.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        collapse.style.maxHeight = collapse.scrollHeight + 'px';
        trigger.setAttribute('aria-expanded', 'true');
        
        // Al terminar la transición, dejar maxHeight en 'none' para contenido responsivo
        const onEnd = () => {
          if (item.classList.contains('open')) {
            collapse.style.maxHeight = 'none';
          }
          collapse.removeEventListener('transitionend', onEnd);
        };
        collapse.addEventListener('transitionend', onEnd);
      }
    });
  });
}

// Toast de notificación accesible
function mostrarToast(mensaje) {
  let toast = document.getElementById('toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notice';
    toast.className = 'toast-notice';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <span>${mensaje}</span>
  `;
  
  toast.classList.add('show');

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// Compartir resultado (Web Share API o copiar al portapapeles)
async function compartirResultado({ titulo, texto, url }) {
  const shareUrl = url || window.location.href;
  const shareData = {
    title: titulo || document.title,
    text: texto || 'He obtenido estos resultados con Cuentas Claras:',
    url: shareUrl
  };

  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Error al compartir con Web Share:', err);
      } else {
        return;
      }
    }
  }

  // Fallback: copiar resumen y enlace al portapapeles
  const textoCopiar = `${shareData.title}\n\n${shareData.text}\n\nPuedes probar la herramienta aquí: ${shareData.url}`;
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(textoCopiar);
      mostrarToast('Resultado copiado al portapapeles');
    } catch (err) {
      mostrarToast('Enlace listo para compartir');
    }
  } else {
    // Fallback tradicional
    const textarea = document.createElement('textarea');
    textarea.value = textoCopiar;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      mostrarToast('Resultado copiado al portapapeles');
    } catch (e) {
      mostrarToast('Copia la URL de tu navegador para compartir');
    }
    document.body.removeChild(textarea);
  }
}

// Inicializar elementos globales al cargar DOM
document.addEventListener('DOMContentLoaded', () => {
  inicializarAcordeones();
});
