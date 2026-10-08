/**
 * Cuentas Claras - Calculadora de Precios
 * Lógica para cálculo de precios en Producto y Servicio con validaciones completas.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Selector de pestañas
  const tabProducto = document.getElementById('tab-producto');
  const tabServicio = document.getElementById('tab-servicio');
  const formProducto = document.getElementById('form-producto');
  const formServicio = document.getElementById('form-servicio');

  // Paneles de resultados
  const emptyState = document.getElementById('results-empty');
  const resultsContent = document.getElementById('results-content');
  const resultsProducto = document.getElementById('results-producto');
  const resultsServicio = document.getElementById('results-servicio');
  const btnCompartir = document.getElementById('btn-compartir');

  let modoActivo = 'producto'; // 'producto' o 'servicio'
  let ultimoResumenCompartir = '';

  // Manejo de cambio de pestaña
  tabProducto.addEventListener('click', () => {
    modoActivo = 'producto';
    tabProducto.classList.add('active');
    tabProducto.setAttribute('aria-selected', 'true');
    tabServicio.classList.remove('active');
    tabServicio.setAttribute('aria-selected', 'false');
    formProducto.style.display = 'block';
    formServicio.style.display = 'none';
    limpiarErrores();
    calcularProducto();
  });

  tabServicio.addEventListener('click', () => {
    modoActivo = 'servicio';
    tabServicio.classList.add('active');
    tabServicio.setAttribute('aria-selected', 'true');
    tabProducto.classList.remove('active');
    tabProducto.setAttribute('aria-selected', 'false');
    formServicio.style.display = 'block';
    formProducto.style.display = 'none';
    limpiarErrores();
    calcularServicio();
  });

  // Funciones de validación
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

  function parsearNumero(valor) {
    if (valor === undefined || valor === null || valor.trim() === '') return NaN;
    const limpio = valor.replace(/\s/g, '').replace(',', '.');
    return parseFloat(limpio);
  }

  // CÁLCULO DE PRODUCTO
  function calcularProducto() {
    limpiarErrores();

    const valCosteVar = parsearNumero(document.getElementById('prod-coste-variable').value);
    const valCostesFijos = parsearNumero(document.getElementById('prod-costes-fijos').value);
    const valVentasPrev = parsearNumero(document.getElementById('prod-ventas-previstas').value);
    const valMargen = parsearNumero(document.getElementById('prod-margen-deseado').value);
    const valPrecioActual = parsearNumero(document.getElementById('prod-precio-actual').value);

    // Si los campos obligatorios están en blanco al inicio
    if (isNaN(valCosteVar) && isNaN(valCostesFijos) && isNaN(valVentasPrev) && isNaN(valMargen)) {
      emptyState.style.display = 'block';
      resultsContent.classList.remove('visible');
      return;
    }

    let valido = true;

    if (isNaN(valCosteVar) || valCosteVar < 0) {
      mostrarError('prod-coste-variable', 'Introduce un coste variable válido (0 o mayor).');
      valido = false;
    }

    if (isNaN(valCostesFijos) || valCostesFijos < 0) {
      mostrarError('prod-costes-fijos', 'Introduce los costes fijos mensuales (0 o mayor).');
      valido = false;
    }

    if (isNaN(valVentasPrev) || valVentasPrev <= 0) {
      mostrarError('prod-ventas-previstas', 'Las ventas previstas deben ser mayores a 0 unidades.');
      valido = false;
    }

    if (isNaN(valMargen) || valMargen < 0 || valMargen >= 100) {
      mostrarError('prod-margen-deseado', 'El margen deseado debe estar entre 0% y 99%.');
      valido = false;
    }

    if (!isNaN(valPrecioActual) && valPrecioActual < 0) {
      mostrarError('prod-precio-actual', 'El precio actual no puede ser un número negativo.');
      valido = false;
    }

    if (!valido) {
      emptyState.style.display = 'block';
      resultsContent.classList.remove('visible');
      return;
    }

    // Cálculos
    const costeFijoPorUnidad = valCostesFijos / valVentasPrev;
    const costeTotalPorUnidad = valCosteVar + costeFijoPorUnidad;
    const margenDecimal = valMargen / 100;
    const precioRecomendado = costeTotalPorUnidad / (1 - margenDecimal);
    const beneficioPorUnidad = precioRecomendado - costeTotalPorUnidad;
    const beneficioMensualEstimado = beneficioPorUnidad * valVentasPrev;

    // Mostrar resultados
    emptyState.style.display = 'none';
    resultsContent.classList.add('visible');
    resultsProducto.style.display = 'block';
    resultsServicio.style.display = 'none';

    document.getElementById('prod-res-precio-rec').textContent = formatearMoneda(precioRecomendado);
    document.getElementById('prod-res-coste-total').textContent = formatearMoneda(costeTotalPorUnidad);
    document.getElementById('prod-res-coste-fijo-u').textContent = formatearMoneda(costeFijoPorUnidad);
    document.getElementById('prod-res-beneficio-u').textContent = formatearMoneda(beneficioPorUnidad);
    document.getElementById('prod-res-beneficio-mes').textContent = formatearMoneda(beneficioMensualEstimado);

    // Comparativa precio actual
    const comparativaBox = document.getElementById('prod-res-comparativa');
    if (!isNaN(valPrecioActual) && valPrecioActual > 0) {
      const dif = valPrecioActual - precioRecomendado;
      const margenActualReal = ((valPrecioActual - costeTotalPorUnidad) / valPrecioActual) * 100;
      let textoComp = `Tu precio actual de <strong>${formatearMoneda(valPrecioActual)}</strong> te deja un margen estimado del <strong>${formatearPorcentaje(margenActualReal)}</strong>. `;
      if (dif < 0) {
        textoComp += `Está ${formatearMoneda(Math.abs(dif))} por debajo del precio recomendado para tu objetivo de margen.`;
      } else {
        textoComp += `Supera en ${formatearMoneda(dif)} el precio recomendado.`;
      }
      comparativaBox.innerHTML = textoComp;
      comparativaBox.style.display = 'block';
    } else {
      comparativaBox.style.display = 'none';
    }

    // Escenarios de margen
    const margenes = [30, 40, 50, 60];
    const tbody = document.getElementById('prod-tabla-escenarios');
    tbody.innerHTML = '';
    margenes.forEach(m => {
      const p = costeTotalPorUnidad / (1 - (m / 100));
      const benU = p - costeTotalPorUnidad;
      const benMes = benU * valVentasPrev;
      const tr = document.createElement('tr');
      if (Math.abs(m - valMargen) < 0.5) tr.classList.add('highlighted');
      tr.innerHTML = `
        <td>${m}%</td>
        <td><strong>${formatearMoneda(p)}</strong></td>
        <td>${formatearMoneda(benU)}</td>
        <td>${formatearMoneda(benMes)}</td>
      `;
      tbody.appendChild(tr);
    });

    ultimoResumenCompartir = `Mi precio ideal (Producto) - Cuentas Claras:\n` +
      `• Coste total por unidad: ${formatearMoneda(costeTotalPorUnidad)}\n` +
      `• Precio recomendado (${valMargen}% margen): ${formatearMoneda(precioRecomendado)}\n` +
      `• Beneficio mensual estimado: ${formatearMoneda(beneficioMensualEstimado)}`;
  }

  // CÁLCULO DE SERVICIO
  function calcularServicio() {
    limpiarErrores();

    const valObjIngresos = parsearNumero(document.getElementById('serv-ingresos-objetivo').value);
    const valGastosNegocio = parsearNumero(document.getElementById('serv-gastos-negocio').value);
    const valHorasDisp = parsearNumero(document.getElementById('serv-horas-disponibles').value);
    const valPctFacturable = parsearNumero(document.getElementById('serv-pct-facturable').value);
    const valMargen = parsearNumero(document.getElementById('serv-margen-deseado').value);
    const valPrecioActual = parsearNumero(document.getElementById('serv-precio-actual').value);

    if (isNaN(valObjIngresos) && isNaN(valGastosNegocio) && isNaN(valHorasDisp) && isNaN(valPctFacturable)) {
      emptyState.style.display = 'block';
      resultsContent.classList.remove('visible');
      return;
    }

    let valido = true;

    if (isNaN(valObjIngresos) || valObjIngresos < 0) {
      mostrarError('serv-ingresos-objetivo', 'Introduce tu objetivo mensual de ingresos (0 o mayor).');
      valido = false;
    }

    if (isNaN(valGastosNegocio) || valGastosNegocio < 0) {
      mostrarError('serv-gastos-negocio', 'Introduce los gastos mensuales del negocio (0 o mayor).');
      valido = false;
    }

    if (isNaN(valHorasDisp) || valHorasDisp <= 0) {
      mostrarError('serv-horas-disponibles', 'Las horas disponibles deben ser mayores a 0.');
      valido = false;
    }

    if (isNaN(valPctFacturable) || valPctFacturable <= 0 || valPctFacturable > 100) {
      mostrarError('serv-pct-facturable', 'El porcentaje facturable debe ser entre 1% y 100% (habitual: 50% - 70%).');
      valido = false;
    }

    if (isNaN(valMargen) || valMargen < 0 || valMargen >= 100) {
      mostrarError('serv-margen-deseado', 'El margen deseado debe estar entre 0% y 99%.');
      valido = false;
    }

    if (!isNaN(valPrecioActual) && valPrecioActual < 0) {
      mostrarError('serv-precio-actual', 'El precio/hora actual no puede ser negativo.');
      valido = false;
    }

    if (!valido) {
      emptyState.style.display = 'block';
      resultsContent.classList.remove('visible');
      return;
    }

    // Cálculos servicio
    const horasFacturables = valHorasDisp * (valPctFacturable / 100);
    const totalNecesarioBase = valObjIngresos + valGastosNegocio;
    const costeHoraBase = totalNecesarioBase / horasFacturables;
    const costeMinimoGastos = valGastosNegocio / horasFacturables; // Coste mínimo solo gastos negocio
    const precioHoraRecomendado = costeHoraBase / (1 - (valMargen / 100));
    
    // Escenario precio superior (+15 puntos porcentuales de margen o 20% más)
    const margenSuperior = Math.min(valMargen + 15, 85);
    const precioHoraSuperior = costeHoraBase / (1 - (margenSuperior / 100));

    const facturacionMensualRecomendada = precioHoraRecomendado * horasFacturables;

    // Mostrar
    emptyState.style.display = 'none';
    resultsContent.classList.add('visible');
    resultsProducto.style.display = 'none';
    resultsServicio.style.display = 'block';

    document.getElementById('serv-res-precio-rec').textContent = formatearMoneda(precioHoraRecomendado) + '/h';
    document.getElementById('serv-res-coste-base').textContent = formatearMoneda(costeHoraBase) + '/h';
    document.getElementById('serv-res-horas-fact').textContent = formatearNumero(horasFacturables, 1) + ' h';
    document.getElementById('serv-res-precio-sup').textContent = formatearMoneda(precioHoraSuperior) + '/h';
    document.getElementById('serv-res-ingresos-rec').textContent = formatearMoneda(facturacionMensualRecomendada);

    // Comparativa precio hora actual
    const compServBox = document.getElementById('serv-res-comparativa');
    if (!isNaN(valPrecioActual) && valPrecioActual > 0) {
      const facturacionActual = valPrecioActual * horasFacturables;
      const diferenciaMensual = facturacionActual - facturacionMensualRecomendada;
      let texto = `Con tu tarifa actual de <strong>${formatearMoneda(valPrecioActual)}/h</strong>, facturarías unos <strong>${formatearMoneda(facturacionActual)}/mes</strong> (cubriendo gastos y quedándote con unos ${formatearMoneda(Math.max(0, facturacionActual - valGastosNegocio))}). `;
      if (diferenciaMensual < 0) {
        texto += `Para alcanzar tu objetivo y margen necesitarías ingresar ${formatearMoneda(Math.abs(diferenciaMensual))} más al mes.`;
      } else {
        texto += `Superas tu objetivo mensual en ${formatearMoneda(diferenciaMensual)}.`;
      }
      compServBox.innerHTML = texto;
      compServBox.style.display = 'block';
    } else {
      compServBox.style.display = 'none';
    }

    ultimoResumenCompartir = `Mi precio ideal (Servicio) - Cuentas Claras:\n` +
      `• Horas facturables estimadas: ${formatearNumero(horasFacturables, 1)} h/mes\n` +
      `• Tarifa/hora recomendada: ${formatearMoneda(precioHoraRecomendado)}/h\n` +
      `• Facturación mensual proyectada: ${formatearMoneda(facturacionMensualRecomendada)}`;
  }

  // Manejo de botones de márgenes preajustados (Low cost, Estándar, Premium, Manual)
  const presetBtns = document.querySelectorAll('.preset-pill-btn');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const val = btn.getAttribute('data-value');
      const targetInput = document.getElementById(targetId);
      if (!targetInput) return;

      const parentGroup = btn.closest('.margin-presets');
      if (parentGroup) {
        parentGroup.querySelectorAll('.preset-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }

      if (val === 'manual') {
        targetInput.focus();
        targetInput.select();
      } else {
        targetInput.value = val;
        if (targetId.startsWith('prod')) {
          calcularProducto();
        } else {
          calcularServicio();
        }
      }
    });
  });

  // Al escribir manualmente en el input de margen, sincronizar pastillas
  function sincronizarPastillasMargen(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const parentGroup = input.closest('.form-group')?.querySelector('.margin-presets');
    if (!parentGroup) return;

    const currentVal = input.value.trim();
    const matchingBtn = parentGroup.querySelector(`.preset-pill-btn[data-value="${currentVal}"]`);
    parentGroup.querySelectorAll('.preset-pill-btn').forEach(b => b.classList.remove('active'));

    if (matchingBtn) {
      matchingBtn.classList.add('active');
    } else {
      const manualBtn = parentGroup.querySelector('.preset-pill-btn[data-value="manual"]');
      if (manualBtn) manualBtn.classList.add('active');
    }
  }

  document.getElementById('prod-margen-deseado')?.addEventListener('input', () => sincronizarPastillasMargen('prod-margen-deseado'));
  document.getElementById('serv-margen-deseado')?.addEventListener('input', () => sincronizarPastillasMargen('serv-margen-deseado'));

  // Escuchar inputs en tiempo real
  formProducto.addEventListener('input', calcularProducto);
  formServicio.addEventListener('input', calcularServicio);

  document.getElementById('btn-reset-producto')?.addEventListener('click', () => {
    formProducto.reset();
    limpiarErrores();
    // Restablecer botón estándar activo
    const presets = formProducto.querySelector('.margin-presets');
    if (presets) {
      presets.querySelectorAll('.preset-pill-btn').forEach(b => b.classList.remove('active'));
      presets.querySelector('.preset-pill-btn[data-value="40"]')?.classList.add('active');
    }
    emptyState.style.display = 'block';
    resultsContent.classList.remove('visible');
  });

  document.getElementById('btn-reset-servicio')?.addEventListener('click', () => {
    formServicio.reset();
    limpiarErrores();
    const presets = formServicio.querySelector('.margin-presets');
    if (presets) {
      presets.querySelectorAll('.preset-pill-btn').forEach(b => b.classList.remove('active'));
      presets.querySelector('.preset-pill-btn[data-value="25"]')?.classList.add('active');
    }
    emptyState.style.display = 'block';
    resultsContent.classList.remove('visible');
  });

  // Botón compartir
  btnCompartir?.addEventListener('click', () => {
    compartirResultado({
      titulo: 'Mi precio ideal — Cuentas Claras',
      texto: ultimoResumenCompartir
    });
  });
});
