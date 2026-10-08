/**
 * Cuentas Claras - Calculadora del Punto de Equilibrio
 * Lógica matemática, validaciones rigurosas y visualización Pérdidas -> Equilibrio -> Beneficio.
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-equilibrio');
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
    const warningBox = document.getElementById('alerta-margen-negativo');
    if (warningBox) warningBox.style.display = 'none';
  }

  function calcularPuntoEquilibrio() {
    limpiarErrores();

    const valCostesFijos = parsearNumero(document.getElementById('costes-fijos').value);
    const valPrecioVenta = parsearNumero(document.getElementById('precio-venta').value);
    const valCosteVariable = parsearNumero(document.getElementById('coste-variable').value);
    const valBeneficioObjetivo = parsearNumero(document.getElementById('beneficio-objetivo').value);

    // Si todo está vacío
    if (isNaN(valCostesFijos) && isNaN(valPrecioVenta) && isNaN(valCosteVariable)) {
      emptyState.style.display = 'block';
      resultsContent.classList.remove('visible');
      return;
    }

    let valido = true;

    if (isNaN(valCostesFijos) || valCostesFijos < 0) {
      mostrarError('costes-fijos', 'Introduce los costes fijos mensuales (0 o superior).');
      valido = false;
    }

    if (isNaN(valPrecioVenta) || valPrecioVenta <= 0) {
      mostrarError('precio-venta', 'El precio de venta debe ser superior a 0.');
      valido = false;
    }

    if (isNaN(valCosteVariable) || valCosteVariable < 0) {
      mostrarError('coste-variable', 'El coste variable por unidad debe ser 0 o superior.');
      valido = false;
    }

    if (!isNaN(valBeneficioObjetivo) && valBeneficioObjetivo < 0) {
      mostrarError('beneficio-objetivo', 'El beneficio objetivo no puede ser negativo.');
      valido = false;
    }

    if (!valido) {
      emptyState.style.display = 'block';
      resultsContent.classList.remove('visible');
      return;
    }

    // Comprobar margen de contribución
    const margenContribucion = valPrecioVenta - valCosteVariable;

    if (margenContribucion <= 0) {
      const alerta = document.getElementById('alerta-margen-negativo');
      if (alerta) {
        alerta.innerHTML = `
          <strong>Atención:</strong> El precio de venta (${formatearMoneda(valPrecioVenta)}) es menor o igual al coste variable (${formatearMoneda(valCosteVariable)}). Cada unidad vendida genera pérdidas o no aporta nada a cubrir los costes fijos. Necesitas subir el precio o reducir el coste variable para alcanzar el punto de equilibrio.
        `;
        alerta.style.display = 'block';
      }
      mostrarError('precio-venta', 'El precio debe ser superior al coste variable.');
      emptyState.style.display = 'block';
      resultsContent.classList.remove('visible');
      return;
    }

    // Cálculos principales
    const unidadesEquilibrioExactas = valCostesFijos / margenContribucion;
    const unidadesEquilibrioRedondeadas = Math.ceil(unidadesEquilibrioExactas);
    const ingresosEquilibrio = unidadesEquilibrioRedondeadas * valPrecioVenta;
    const porcentajeMargenContribucion = (margenContribucion / valPrecioVenta) * 100;

    // Con beneficio objetivo (si aplica)
    const tieneBeneficioObjetivo = !isNaN(valBeneficioObjetivo) && valBeneficioObjetivo > 0;
    let unidadesConBeneficio = 0;
    let ingresosConBeneficio = 0;

    if (tieneBeneficioObjetivo) {
      unidadesConBeneficio = Math.ceil((valCostesFijos + valBeneficioObjetivo) / margenContribucion);
      ingresosConBeneficio = unidadesConBeneficio * valPrecioVenta;
    }

    // Actualizar interfaz
    emptyState.style.display = 'none';
    resultsContent.classList.add('visible');

    document.getElementById('res-unidades-equilibrio').textContent = formatearNumero(unidadesEquilibrioRedondeadas) + ' uds';
    document.getElementById('res-ingresos-equilibrio').textContent = formatearMoneda(ingresosEquilibrio);
    document.getElementById('res-margen-contribucion').textContent = formatearMoneda(margenContribucion);
    document.getElementById('res-pct-contribucion').textContent = formatearPorcentaje(porcentajeMargenContribucion);

    // Box beneficio objetivo
    const boxBeneficio = document.getElementById('res-box-beneficio-objetivo');
    if (tieneBeneficioObjetivo) {
      boxBeneficio.innerHTML = `
        Para ganar <strong>${formatearMoneda(valBeneficioObjetivo)}/mes</strong> limpios, necesitas vender <strong>${formatearNumero(unidadesConBeneficio)} unidades</strong> (unos <strong>${formatearMoneda(ingresosConBeneficio)}</strong> de facturación).
      `;
      boxBeneficio.style.display = 'block';
    } else {
      boxBeneficio.style.display = 'none';
    }

    // Construir tabla de escenarios adaptativos
    // Generamos 4 o 5 puntos clave: 50% de equilibrio, 80%, 100% (equilibrio), 150%, 200%
    const baseU = unidadesEquilibrioRedondeadas;
    const factores = [0.5, 0.75, 1.0, 1.3, 1.6];
    const tbody = document.getElementById('tabla-escenarios-equilibrio');
    tbody.innerHTML = '';

    factores.forEach(f => {
      const u = Math.max(1, Math.round(baseU * f));
      const ing = u * valPrecioVenta;
      const costesTotales = valCostesFijos + (u * valCosteVariable);
      const resultadoNeto = ing - costesTotales;
      const tr = document.createElement('tr');

      if (f === 1.0) {
        tr.classList.add('highlighted');
      }

      let textoEstado = '';
      if (resultadoNeto < -0.01) {
        textoEstado = `<span style="color: var(--danger); font-weight: 600;">-${formatearMoneda(Math.abs(resultadoNeto))}</span>`;
      } else if (Math.abs(resultadoNeto) <= 0.01) {
        textoEstado = `<strong>0,00 € (Equilibrio)</strong>`;
      } else {
        textoEstado = `<span style="color: var(--success); font-weight: 600;">+${formatearMoneda(resultadoNeto)}</span>`;
      }

      tr.innerHTML = `
        <td>${formatearNumero(u)} uds</td>
        <td>${formatearMoneda(ing)}</td>
        <td>${textoEstado}</td>
      `;
      tbody.appendChild(tr);
    });

    // Actualizar resumen para compartir
    ultimoResumenCompartir = `Punto de Equilibrio - Cuentas Claras:\n` +
      `• Unidades necesarias: ${formatearNumero(unidadesEquilibrioRedondeadas)} uds/mes\n` +
      `• Facturación mínima mensual: ${formatearMoneda(ingresosEquilibrio)}\n` +
      `• Margen por unidad: ${formatearMoneda(margenContribucion)} (${formatearPorcentaje(porcentajeMargenContribucion)})` +
      (tieneBeneficioObjetivo ? `\n• Meta con beneficio (${formatearMoneda(valBeneficioObjetivo)}): ${formatearNumero(unidadesConBeneficio)} uds` : '');
  }

  form.addEventListener('input', calcularPuntoEquilibrio);

  btnReset?.addEventListener('click', () => {
    form.reset();
    limpiarErrores();
    emptyState.style.display = 'block';
    resultsContent.classList.remove('visible');
  });

  btnCompartir?.addEventListener('click', () => {
    compartirResultado({
      titulo: 'Punto de Equilibrio — Cuentas Claras',
      texto: ultimoResumenCompartir
    });
  });
});
