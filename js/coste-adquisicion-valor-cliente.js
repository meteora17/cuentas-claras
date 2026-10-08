/**
 * Cuentas Claras - Calculadora de Coste de Adquisición y Valor del Cliente
 * Cálculo de coste de captación, vida media, valor de cliente (LTV/CAC) y tiempo de recuperación.
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-cac-ltv');
  const emptyState = document.getElementById('results-empty');
  const resultsContent = document.getElementById('results-content');
  const btnCompartir = document.getElementById('btn-compartir');
  const btnReset = document.getElementById('btn-reset');

  let ultimoResumenCompartir = '';

  function parsearNumero(valor) {
    if (valor === undefined || valor === null || valor.trim() === '') return NaN;
    const limpio = valor.replace(/\s/g, '').replace(',', '.');
    return parseFloat(limpio);
  }

  function mostrarError(campoId, mensaje) {
    const input = document.getElementById(campoId);
    const errorEl = document.getElementById(`err-${campoId}`);
    if (input) input.classList.add('is-invalid');
    if (errorEl) {
      errorEl.textContent = mensaje;
      errorEl.classList.add('visible');
    }
  }

  function limpiarErrores() {
    document.querySelectorAll('.form-input').forEach(input => input.classList.remove('is-invalid'));
    document.querySelectorAll('.field-error').forEach(err => {
      err.textContent = '';
      err.classList.remove('visible');
    });
  }

  function calcularCacLtv() {
    limpiarErrores();

    const valGastoCaptacion = parsearNumero(document.getElementById('gasto-captacion').value);
    const valNuevosClientes = parsearNumero(document.getElementById('nuevos-clientes').value);
    const valIngresoMedio = parsearNumero(document.getElementById('ingreso-medio').value);
    const valMargenBruto = parsearNumero(document.getElementById('margen-bruto').value);
    const valTasaAbandono = parsearNumero(document.getElementById('tasa-abandono').value);

    // Si todo está vacío
    if (isNaN(valGastoCaptacion) && isNaN(valNuevosClientes) && isNaN(valIngresoMedio) && isNaN(valMargenBruto) && isNaN(valTasaAbandono)) {
      emptyState.style.display = 'block';
      resultsContent.classList.remove('visible');
      return;
    }

    let valido = true;

    if (isNaN(valGastoCaptacion) || valGastoCaptacion < 0) {
      mostrarError('gasto-captacion', 'Introduce el gasto mensual en captación (0 o superior).');
      valido = false;
    }

    if (isNaN(valNuevosClientes) || valNuevosClientes <= 0) {
      mostrarError('nuevos-clientes', 'El número de clientes nuevos debe ser mayor que 0.');
      valido = false;
    }

    if (isNaN(valIngresoMedio) || valIngresoMedio <= 0) {
      mostrarError('ingreso-medio', 'El ingreso medio por cliente debe ser mayor que 0.');
      valido = false;
    }

    if (isNaN(valMargenBruto) || valMargenBruto <= 0 || valMargenBruto > 100) {
      mostrarError('margen-bruto', 'El margen bruto debe estar entre 1% y 100%.');
      valido = false;
    }

    if (isNaN(valTasaAbandono) || valTasaAbandono <= 0 || valTasaAbandono > 100) {
      mostrarError('tasa-abandono', 'La tasa de abandono mensual debe ser mayor que 0% y hasta 100% (ejemplo: 5%).');
      valido = false;
    }

    if (!valido) {
      emptyState.style.display = 'block';
      resultsContent.classList.remove('visible');
      return;
    }

    // Cálculos
    // 1. Coste de Adquisición de Cliente (CAC)
    const costeAdquisicion = valGastoCaptacion / valNuevosClientes;

    // 2. Vida estimada del cliente (en meses): 1 / (tasa_abandono / 100)
    const vidaEstimadaMeses = 1 / (valTasaAbandono / 100);

    // 3. Beneficio bruto mensual por cliente
    const beneficioBrutoMes = valIngresoMedio * (valMargenBruto / 100);

    // 4. Valor estimado de un cliente a lo largo de su vida (LTV)
    const valorEstimadoCliente = beneficioBrutoMes * vidaEstimadaMeses;

    // 5. Relación valor del cliente / coste de adquisición (Ratio)
    // Evitar división por cero si el gasto de captación fuera 0
    let ratioValorCoste = 0;
    if (costeAdquisicion > 0) {
      ratioValorCoste = valorEstimadoCliente / costeAdquisicion;
    } else {
      ratioValorCoste = 999; // Captación orgánica / coste cero
    }

    // 6. Tiempo de recuperación del coste de adquisición (Payback en meses)
    let tiempoRecuperacionMeses = 0;
    if (beneficioBrutoMes > 0) {
      tiempoRecuperacionMeses = costeAdquisicion / beneficioBrutoMes;
    }

    // Actualizar interfaz
    emptyState.style.display = 'none';
    resultsContent.classList.add('visible');

    document.getElementById('res-coste-adquisicion').textContent = formatearMoneda(costeAdquisicion);
    document.getElementById('res-valor-cliente').textContent = formatearMoneda(valorEstimadoCliente);
    document.getElementById('res-vida-meses').textContent = formatearNumero(vidaEstimadaMeses, 1) + ' meses';
    
    if (costeAdquisicion > 0) {
      document.getElementById('res-ratio-valor-coste').textContent = formatearNumero(ratioValorCoste, 1) + 'x';
    } else {
      document.getElementById('res-ratio-valor-coste').textContent = 'Captación sin coste';
    }

    if (costeAdquisicion === 0) {
      document.getElementById('res-tiempo-recuperacion').textContent = 'Inmediato (0 meses)';
    } else {
      document.getElementById('res-tiempo-recuperacion').textContent = formatearNumero(tiempoRecuperacionMeses, 1) + ' meses';
    }

    // Interpretación de la relación
    const badgeEl = document.getElementById('res-ratio-badge');
    const badgeDescEl = document.getElementById('res-ratio-desc');

    if (costeAdquisicion === 0) {
      badgeEl.className = 'ratio-badge success';
      badgeEl.textContent = 'Captación orgánica sin inversión de pago';
      badgeDescEl.textContent = 'Consigues clientes sin inversión publicitaria directa. Es una posición excelente, aunque conveniente medir el tiempo que inviertes en captar.';
    } else if (ratioValorCoste < 1.0) {
      badgeEl.className = 'ratio-badge danger';
      badgeEl.textContent = 'Problemático (menor a 1x)';
      badgeDescEl.textContent = 'Te cuesta más conseguir un cliente que todo el beneficio que te deja durante su tiempo contigo. Estás perdiendo dinero con cada nuevo cliente.';
    } else if (ratioValorCoste >= 1.0 && ratioValorCoste < 2.0) {
      badgeEl.className = 'ratio-badge warning';
      badgeEl.textContent = 'Débil (entre 1x y 2x)';
      badgeDescEl.textContent = 'Apenas recuperas la inversión. Cualquier pequeño desvío en costes o abandono pondrá en riesgo la rentabilidad de tu captación.';
    } else if (ratioValorCoste >= 2.0 && ratioValorCoste < 3.0) {
      badgeEl.className = 'ratio-badge warning';
      badgeEl.textContent = 'Necesita atención (entre 2x y 3x)';
      badgeDescEl.textContent = 'El modelo se sostiene pero con poco margen de error. Hay oportunidad de mejorar reteniendo más tiempo al cliente o afinando los costes de los anuncios.';
    } else if (ratioValorCoste >= 3.0 && ratioValorCoste <= 5.0) {
      badgeEl.className = 'ratio-badge success';
      badgeEl.textContent = 'Generalmente saludable (entre 3x y 5x)';
      badgeDescEl.textContent = 'Tu captación es equilibrada y sostenible. Generas suficiente valor por cliente para financiar tu crecimiento con seguridad.';
    } else {
      badgeEl.className = 'ratio-badge success';
      badgeEl.textContent = 'Fuerte (mayor a 5x)';
      badgeDescEl.textContent = 'Tu negocio genera mucho más valor del que inviertes en captar. Tienes margen para acelerar tu captación, aunque conviene revisar que las hipótesis de abandono no sean demasiado optimistas.';
    }

    // Texto de compartir
    ultimoResumenCompartir = `Coste de Adquisición y Valor del Cliente - Cuentas Claras:\n` +
      `• Coste de conseguir un cliente: ${formatearMoneda(costeAdquisicion)}\n` +
      `• Valor estimado de un cliente: ${formatearMoneda(valorEstimadoCliente)}\n` +
      `• Relación valor/coste: ${costeAdquisicion > 0 ? formatearNumero(ratioValorCoste, 1) + 'x' : 'Orgánico'}\n` +
      `• Tiempo de recuperación: ${formatearNumero(tiempoRecuperacionMeses, 1)} meses`;
  }

  form.addEventListener('input', calcularCacLtv);

  btnReset?.addEventListener('click', () => {
    form.reset();
    limpiarErrores();
    emptyState.style.display = 'block';
    resultsContent.classList.remove('visible');
  });

  btnCompartir?.addEventListener('click', () => {
    compartirResultado({
      titulo: 'Coste y Valor del Cliente — Cuentas Claras',
      texto: ultimoResumenCompartir
    });
  });
});
