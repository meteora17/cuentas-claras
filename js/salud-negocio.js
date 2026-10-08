/**
 * Cuentas Claras - Diagnóstico de Salud del Negocio
 * Evaluación interactiva de 18 preguntas en 6 áreas clave.
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-diagnostico');
  const resultsView = document.getElementById('assessment-results');
  const progressBar = document.getElementById('assessment-progress-fill');
  const progressText = document.getElementById('assessment-progress-text');
  const btnFinalizar = document.getElementById('btn-finalizar-diagnostico');
  const btnReiniciar = document.getElementById('btn-reiniciar');
  const btnCompartir = document.getElementById('btn-compartir');

  const TOTAL_PREGUNTAS = 18;

  // Definición de las 6 áreas y contenidos de recomendación
  const areasInfo = {
    finanzas: {
      nombre: 'Finanzas',
      descripcionCorta: 'Control de costes, márgenes y umbrales de seguridad.',
      queSignifica: 'Refleja si operas con números claros o si tomas decisiones de precios e inversiones a ciegas.',
      porQueImporta: 'Sin saber tus costes reales ni tu margen por venta, es muy fácil trabajar mucho y encontrarte sin liquidez a final de mes.',
      primerPaso: 'Calcula tu punto de equilibrio y revisa si tus precios actuales cubren todos tus gastos fijos y tu sueldo.',
      enlaces: [
        { texto: 'Mi precio ideal', url: 'calculadora-precios.html' },
        { texto: 'Punto de equilibrio', url: 'punto-equilibrio.html' }
      ]
    },
    cliente: {
      nombre: 'Cliente',
      descripcionCorta: 'Definición de cliente ideal y propuesta de valor.',
      queSignifica: 'Indica si tienes claridad sobre a quién te diriges o si intentas venderle a todo el mundo sin un mensaje específico.',
      porQueImporta: 'Cuando tu cliente ideal está difuso, el marketing resulta caro e ineficaz y la venta se vuelve una batalla por precio.',
      primerPaso: 'Habla con tus 3 mejores clientes actuales y pregúntales exactamente qué problema les resolviste y por qué te eligieron a ti.',
      enlaces: []
    },
    captacion: {
      nombre: 'Captación',
      descripcionCorta: 'Canales predecibles para atraer nuevas oportunidades.',
      queSignifica: 'Mide tu capacidad de generar contactos de forma recurrente sin depender únicamente de la suerte o conocidos.',
      porQueImporta: 'Depender exclusivamente de recomendaciones funciona al principio, pero deja tu negocio indefenso ante periodos de sequía.',
      primerPaso: 'Identifica de dónde han venido tus últimos 10 clientes y comprueba qué canal tiene más sentido reforzar este mes.',
      enlaces: [
        { texto: 'Coste de adquisición y valor del cliente', url: 'coste-adquisicion-valor-cliente.html' }
      ]
    },
    presencia: {
      nombre: 'Presencia online',
      descripcionCorta: 'Claridad en la web, mensaje directo y facilidad de contacto.',
      queSignifica: 'Evalúa si tu carta de presentación digital transmite confianza inmediata o genera dudas en quien te busca.',
      porQueImporta: 'La mayoría de compradores contrastan en internet antes de decidirse; una presencia confusa o desactualizada frena decisiones de compra.',
      primerPaso: 'Revisa tu web o perfil principal con ojos de cliente: ¿queda claro en los primeros 5 segundos qué problema resuelves y cómo contratarte?',
      enlaces: []
    },
    ventas: {
      nombre: 'Ventas',
      descripcionCorta: 'Seguimiento de interesados y conversión comercial.',
      queSignifica: 'Mide la constancia para cerrar tratos y no dejar prospectos olvidados por falta de seguimiento sistemático.',
      porQueImporta: 'Gran parte de las ventas en pequeños negocios se pierden simplemente porque nadie volvió a contactar a quien pidió presupuesto.',
      primerPaso: 'Crea una lista sencilla de las últimas 5 propuestas que enviaste y escribe hoy mismo un mensaje de seguimiento cercano a cada una.',
      enlaces: [
        { texto: 'Coste de adquisición y valor del cliente', url: 'coste-adquisicion-valor-cliente.html' }
      ]
    },
    ejecucion: {
      nombre: 'Ejecución',
      descripcionCorta: 'Gestión del tiempo, prioridades y foco semanal.',
      queSignifica: 'Indica si dominas tu agenda o si las urgencias del día a día te impiden terminar proyectos estratégicos importantes.',
      porQueImporta: 'Un negocio no crece apagando fuegos constantemente; necesita bloques semanales dedicados a mejorar los procesos y la oferta.',
      primerPaso: 'Reserva cada lunes una hora fija protegida en tu calendario para revisar tus números y definir las 2 tareas más importantes de la semana.',
      enlaces: []
    }
  };

  let ultimoResumenCompartir = '';

  // Actualizar estado visual de selecciones y barra de progreso
  function actualizarProgreso() {
    const radios = form.querySelectorAll('input[type="radio"]:checked');
    const contestadas = radios.length;
    const porcentaje = Math.round((contestadas / TOTAL_PREGUNTAS) * 100);

    progressBar.style.width = `${porcentaje}%`;
    progressText.textContent = `${contestadas} de ${TOTAL_PREGUNTAS} preguntas respondidas`;

    // Resaltar etiqueta seleccionada visualmente
    form.querySelectorAll('.option-label').forEach(label => {
      const radio = label.querySelector('input[type="radio"]');
      if (radio && radio.checked) {
        label.classList.add('selected');
      } else {
        label.classList.remove('selected');
      }
    });

    if (contestadas === TOTAL_PREGUNTAS) {
      btnFinalizar.removeAttribute('disabled');
      btnFinalizar.classList.remove('btn-secondary');
      btnFinalizar.classList.add('btn-primary');
    } else {
      btnFinalizar.setAttribute('disabled', 'true');
      btnFinalizar.classList.remove('btn-primary');
      btnFinalizar.classList.add('btn-secondary');
    }
  }

  form.addEventListener('change', actualizarProgreso);

  // Calcular resultado del diagnóstico
  function calcularDiagnostico() {
    const respuestas = {};
    const radios = form.querySelectorAll('input[type="radio"]:checked');

    if (radios.length < TOTAL_PREGUNTAS) {
      alert(`Por favor responde a todas las preguntas (${radios.length}/${TOTAL_PREGUNTAS} contestadas) para ver tu diagnóstico completo.`);
      return;
    }

    const puntuacionesArea = {
      finanzas: 0,
      cliente: 0,
      captacion: 0,
      presencia: 0,
      ventas: 0,
      ejecucion: 0
    };

    radios.forEach(r => {
      const valor = parseInt(r.value, 10);
      const area = r.getAttribute('data-area');
      if (puntuacionesArea.hasOwnProperty(area)) {
        puntuacionesArea[area] += valor;
      }
    });

    // Cada área tiene 3 preguntas con valores 0, 1 o 2 (máximo 6 puntos por área)
    // Puntuación por área en porcentaje (0-100): (puntos / 6) * 100
    const areasPorcentaje = {};
    let totalPuntos = 0;
    Object.keys(puntuacionesArea).forEach(area => {
      totalPuntos += puntuacionesArea[area];
      areasPorcentaje[area] = Math.round((puntuacionesArea[area] / 6) * 100);
    });

    // Puntuación global (0-100) sobre 36 puntos posibles
    const puntuacionGlobal = Math.round((totalPuntos / 36) * 100);

    // Interpretación global
    let interpretacionTexto = '';
    let badgeClase = '';
    let badgeLabel = '';

    if (puntuacionGlobal < 40) {
      badgeLabel = 'Necesita atención inmediata';
      badgeClase = 'ratio-badge danger';
      interpretacionTexto = 'Tu negocio opera con mucha incertidumbre en sus pilares básicos. Poner orden en las finanzas y definir a tu cliente prioritario te quitará una gran carga de estrés.';
    } else if (puntuacionGlobal < 60) {
      badgeLabel = 'Hay bastante margen de mejora';
      badgeClase = 'ratio-badge warning';
      interpretacionTexto = 'Tienes piezas funcionando, pero la falta de sistematización o control de costes te frena. Pequeños ajustes en tus prioridades darán resultados rápidos.';
    } else if (puntuacionGlobal < 80) {
      badgeLabel = 'Buena base';
      badgeClase = 'ratio-badge success';
      interpretacionTexto = 'Tienes los fundamentos esenciales bajo control. Enfocándote en afinar los canales que menos dominas consolidarás un negocio muy sólido.';
    } else {
      badgeLabel = 'Negocio bien estructurado';
      badgeClase = 'ratio-badge success';
      interpretacionTexto = 'Cuentas con procesos claros, buen control de números y claridad estratégica. Tu reto principal es mantener el foco y evitar complejidades innecesarias.';
    }

    // Actualizar visualización global
    document.getElementById('res-score-number').textContent = `${puntuacionGlobal}/100`;
    const scoreBadge = document.getElementById('res-score-badge');
    scoreBadge.className = badgeClase;
    scoreBadge.textContent = badgeLabel;
    document.getElementById('res-score-desc').textContent = interpretacionTexto;

    // Pintar barras de las 6 áreas
    const gridAreas = document.getElementById('res-areas-grid');
    gridAreas.innerHTML = '';
    Object.keys(areasInfo).forEach(key => {
      const info = areasInfo[key];
      const pts = areasPorcentaje[key];
      const el = document.createElement('div');
      el.className = 'area-score-item';
      el.innerHTML = `
        <div class="area-score-header">
          <span class="area-name">${info.nombre}</span>
          <span class="area-pts">${pts}/100</span>
        </div>
        <div class="area-mini-bar" role="progressbar" aria-valuenow="${pts}" aria-valuemin="0" aria-valuemax="100">
          <div class="area-mini-bar-fill" style="width: ${pts}%;"></div>
        </div>
      `;
      gridAreas.appendChild(el);
    });

    // Identificar las 3 áreas con menor puntuación
    const areasOrdenadas = Object.keys(areasPorcentaje).sort((a, b) => areasPorcentaje[a] - areasPorcentaje[b]);
    const top3Prioridades = areasOrdenadas.slice(0, 3);

    const listPrioridades = document.getElementById('res-priorities-list');
    listPrioridades.innerHTML = '';

    top3Prioridades.forEach(areaKey => {
      const info = areasInfo[areaKey];
      const pts = areasPorcentaje[areaKey];
      const card = document.createElement('article');
      card.className = 'priority-card';

      let enlacesHtml = '';
      if (info.enlaces && info.enlaces.length > 0) {
        enlacesHtml = `
          <div style="margin-top: 0.75rem; display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;">
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-subtle);">Herramientas recomendadas:</span>
            ${info.enlaces.map(l => `<a href="${l.url}" class="btn btn-secondary btn-sm" style="padding: 0.3rem 0.65rem; font-size: 0.8rem;">${l.texto} &rarr;</a>`).join('')}
          </div>
        `;
      }

      card.innerHTML = `
        <div class="priority-card-header">
          <h4 class="priority-card-title">${info.nombre}</h4>
          <span class="priority-card-score">${pts}/100</span>
        </div>
        <div class="priority-card-body">
          <p><strong>Qué significa:</strong> ${info.queSignifica}</p>
          <p style="margin-top: 0.4rem;"><strong>Por qué importa:</strong> ${info.porQueImporta}</p>
        </div>
        <div class="priority-card-step">
          <strong>Primer paso recomendado:</strong>
          <span>${info.primerPaso}</span>
        </div>
        ${enlacesHtml}
      `;
      listPrioridades.appendChild(card);
    });

    // Ocultar formulario, mostrar resultados con scroll suave
    form.style.display = 'none';
    document.querySelector('.assessment-progress-wrapper').style.display = 'none';
    resultsView.classList.add('visible');
    resultsView.scrollIntoView({ behavior: 'smooth' });

    // Preparar texto para compartir
    ultimoResumenCompartir = `Diagnóstico de Salud del Negocio - Cuentas Claras:\n` +
      `• Puntuación general: ${puntuacionGlobal}/100 (${badgeLabel})\n` +
      `• Áreas prioritarias de mejora: ${top3Prioridades.map(k => `${areasInfo[k].nombre} (${areasPorcentaje[k]}/100)`).join(', ')}`;
  }

  btnFinalizar.addEventListener('click', calcularDiagnostico);

  btnReiniciar?.addEventListener('click', () => {
    form.reset();
    form.style.display = 'block';
    document.querySelector('.assessment-progress-wrapper').style.display = 'block';
    resultsView.classList.remove('visible');
    actualizarProgreso();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  btnCompartir?.addEventListener('click', () => {
    compartirResultado({
      titulo: 'Diagnóstico de Salud del Negocio — Cuentas Claras',
      texto: ultimoResumenCompartir
    });
  });

  actualizarProgreso();
});
