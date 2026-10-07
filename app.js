// ═══════════════════════════════════════════════════════════
// CATÁLOGOS
// ═══════════════════════════════════════════════════════════
const OS_CATALOG = {
  pami:       { nombre: "INSTITUTO NACIONAL DE SERVICIOS SOCIALES PARA JUBILADOS Y PENSIONADOS", rnos: "500807" },
  osprera:    { nombre: "OBRA SOCIAL DEL PERSONAL RURAL Y ESTIBADORES DE LA REP. ARG.",           rnos: "119302" },
  camioneros: { nombre: "CAMIONEROS",                                                              rnos: "" },
  osecac:     { nombre: "OBRA SOCIAL DE LOS EMPLEADOS DE COMERCIO Y ACTIVIDADES CIVILES",          rnos: "126205" },
  ospecon:    { nombre: "OBRA SOCIAL DEL PERSONAL DE LA CONSTRUCCIÓN",                             rnos: "105408" },
  osdop:      { nombre: "OBRA SOCIAL DE DOCENTES PARTICULARES",                                    rnos: "106302" },
  osfe:       { nombre: "OBRA SOCIAL FERROVIARIA",                                                 rnos: "001300" },
  ospavial:   { nombre: "OBRA SOCIAL PARA EL PERSONAL DE LA ACTIVIDAD VIAL",                       rnos: "122302" },
  usuomra:    { nombre: "OBRA SOCIAL DE LA UNIÓN OBRERA METALÚRGICA DE LA REP. ARG.",              rnos: "112103" },
  iapos:      { nombre: "INSTITUTO AUTÁRQUICO PROVINCIAL DE OBRA SOCIAL",                          rnos: "" }
};

const HPGD_CATALOG = {
  "1.01":   "CONSULTA MEDICA GENERAL",
  "1.01.1": "CONSULTA EN CAPAS",
  "1.02":   "CONSULTA MEDICA ESPECIALIZADA",
  "1.03":   "HASTA 3 PRACTICAS",
  "1.04":   "ATENCION EN GUARDIA",
  "1.05":   "ECO, RADIO, TOMO",
  "1.05.1": "ERGOMETRIA",
  "1.05.2": "MAMOGRAFIA, SENOGRAFIA",
  "1.06":   "ECOGRAFIA",
  "1.07":   "ATENCION DE URGENCIA EN GUARDIA",
  "2.01":   "HEMOGRAMA COMPLETO",
  "3.05":   "RADIOGRAFIA DE TORAX",
  "4.01":   "INTERNACION",
  "4.10":   "ECOGRAFIA ABDOMINAL"
};

let currentRecordId = null;
let recordsHistory = [];
let selectedIds = new Set();   // IDs seleccionados en el historial

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
function $(id) { return document.getElementById(id); }

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = (value == null ? '' : String(value));
}

function setCheck(id, marked) {
  const el = $(id);
  if (el) el.textContent = marked ? 'X' : '';
}

function formatDate(isoStr) {
  if (!isoStr) return '--/--/----';
  const p = String(isoStr).split('-');
  if (p.length !== 3) return '--/--/----';
  return p[2] + '/' + p[1] + '/' + p[0];
}

function escapeHTML(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function calcularEdad(fechaNacISO, fechaRefISO) {
  if (!fechaNacISO) return '';
  const nac = new Date(fechaNacISO + 'T00:00:00');
  if (isNaN(nac.getTime())) return '';
  const ref = fechaRefISO ? new Date(fechaRefISO + 'T00:00:00') : new Date();
  if (isNaN(ref.getTime())) return '';
  let edad = ref.getFullYear() - nac.getFullYear();
  const m = ref.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < nac.getDate())) edad--;
  return edad >= 0 ? edad : '';
}

// ═══════════════════════════════════════════════════════════
// UPDATE SHEET
// ═══════════════════════════════════════════════════════════
function updateSheet() {
  setText('doc-nombre', $('inp-nombre').value);
  setText('doc-dni', $('inp-dni').value);
  setText('doc-edad', $('inp-edad').value);
  setText('doc-carnet', $('inp-carnet').value);

  setText('doc-refe', $('inp-refe').value);
  setText('doc-fecha', formatDate($('inp-fecha').value));
  setText('doc-fecha-atencion', 'FECHA: ' + formatDate($('inp-fecha').value));

  setText('doc-os-nombre', $('inp-os-nombre').value);
  setText('doc-os-rnos', $('inp-os-rnos').value);
  setText('doc-os-emision', formatDate($('inp-os-emision').value));
  setText('doc-os-venc', formatDate($('inp-os-venc').value));

  setText('doc-codigo-hpgd', $('inp-codigo-hpgd').value);
  setText('doc-cie10', $('inp-cie10').value);
  setText('doc-especialidad', $('inp-especialidad').value);

  setText('doc-recibo-tipo', $('inp-recibo-tipo').value);
  setText('doc-recibo-mes', $('inp-recibo-mes').value);
  setText('doc-recibo-anio', $('inp-recibo-anio').value);

  const tipoBen = $('inp-tipo-ben').value;
  setCheck('box-titular', tipoBen === 'Titular');
  setCheck('box-notitular', tipoBen === 'No Titular');
  setCheck('box-adherente', tipoBen === 'Adherente');

  const parentesco = $('inp-parentesco').value;
  setCheck('box-conyug', parentesco === 'Cónyug.');
  setCheck('box-hijo', parentesco === 'Hijo');
  setCheck('box-otro', parentesco === 'Otro');

  const sexo = $('inp-sexo').value;
  setCheck('box-masc', sexo === 'MASC.');
  setCheck('box-fem', sexo === 'FEM.');

  setCheck('box-consulta', $('chk-consulta').checked);
  setCheck('box-practica', $('chk-practica').checked);
  setCheck('box-internacion', $('chk-internacion').checked);
}

// ═══════════════════════════════════════════════════════════
// FECHA NACIMIENTO → EDAD
// ═══════════════════════════════════════════════════════════
function onFechaNacChange() {
  const nac = $('inp-fecha-nac').value;
  if (nac) {
    const edad = calcularEdad(nac, $('inp-fecha').value);
    if (edad !== '') $('inp-edad').value = edad;
  }
  updateSheet();
}

// ═══════════════════════════════════════════════════════════
// FECHA ATENCIÓN → RECIBO ANTERIOR
// ═══════════════════════════════════════════════════════════
function onFechaChange() {
  const fechaStr = $('inp-fecha').value;
  if (fechaStr) {
    const parts = fechaStr.split('-').map(Number);
    const y = parts[0], m = parts[1];
    let mesAnt = m - 1, anioAnt = y;
    if (mesAnt === 0) { mesAnt = 12; anioAnt = y - 1; }
    $('inp-recibo-mes').value = mesAnt;
    $('inp-recibo-anio').value = anioAnt;
    if (!$('inp-recibo-tipo').value) $('inp-recibo-tipo').value = 'de Sueldo';
  }
  if ($('inp-fecha-nac').value) {
    const edad = calcularEdad($('inp-fecha-nac').value, fechaStr);
    if (edad !== '') $('inp-edad').value = edad;
  }
  updateSheet();
}

// ═══════════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════════
function switchTab(tab) {
  const formTab = $('tab-content-form');
  const historyTab = $('tab-content-history');
  const btnForm = $('tab-btn-form');
  const btnHistory = $('tab-btn-history');
  if (tab === 'form') {
    formTab.classList.remove('hidden');
    historyTab.classList.add('hidden');
    btnForm.className = "pb-3 text-xs font-semibold border-b-2 border-slate-800 text-slate-800 flex items-center gap-2";
    btnHistory.className = "pb-3 text-xs font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700 flex items-center gap-2";
  } else {
    formTab.classList.add('hidden');
    historyTab.classList.remove('hidden');
    btnHistory.className = "pb-3 text-xs font-semibold border-b-2 border-slate-800 text-slate-800 flex items-center gap-2";
    btnForm.className = "pb-3 text-xs font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700 flex items-center gap-2";
    renderHistoryList();
  }
}

// ═══════════════════════════════════════════════════════════
// CATÁLOGOS RÁPIDOS
// ═══════════════════════════════════════════════════════════
function applyOSPreset() {
  const val = $('inp-os-preset').value;
  if (val && OS_CATALOG[val]) {
    $('inp-os-nombre').value = OS_CATALOG[val].nombre;
    $('inp-os-rnos').value = OS_CATALOG[val].rnos;
    updateSheet();
  }
}

function applyHpgdPreset() {
  const val = $('inp-hpgd-preset').value;
  if (val && HPGD_CATALOG[val]) {
    $('inp-codigo-hpgd').value = val;
    $('inp-especialidad').value = HPGD_CATALOG[val];
    updateSheet();
  }
}

// ═══════════════════════════════════════════════════════════
// RESET / NUEVO
// ═══════════════════════════════════════════════════════════
function resetForm() {
  currentRecordId = null;
  ['inp-nombre','inp-dni','inp-edad','inp-fecha-nac','inp-carnet',
   'inp-tipo-ben','inp-parentesco','inp-sexo',
   'inp-os-preset','inp-os-nombre','inp-os-rnos','inp-os-emision','inp-os-venc',
   'inp-fecha','inp-refe',
   'inp-hpgd-preset','inp-codigo-hpgd','inp-cie10','inp-especialidad',
   'inp-recibo-tipo','inp-recibo-mes','inp-recibo-anio'
  ].forEach(id => { if ($(id)) $(id).value = ''; });
  ['chk-consulta','chk-practica','chk-internacion'].forEach(id => { if ($(id)) $(id).checked = false; });
  updateSheet();
}

function createNewSheet() {
  resetForm();
  switchTab('form');
}

// ═══════════════════════════════════════════════════════════
// LOCAL STORAGE
// ═══════════════════════════════════════════════════════════
function getFormData() {
  return {
    id: currentRecordId || Date.now().toString(),
    createdAt: new Date().toISOString(),
    nombre: $('inp-nombre').value,
    dni: $('inp-dni').value,
    edad: $('inp-edad').value,
    fechaNac: $('inp-fecha-nac').value,
    carnet: $('inp-carnet').value,
    tipoBen: $('inp-tipo-ben').value,
    parentesco: $('inp-parentesco').value,
    sexo: $('inp-sexo').value,
    osNombre: $('inp-os-nombre').value,
    osRnos: $('inp-os-rnos').value,
    osEmision: $('inp-os-emision').value,
    osVenc: $('inp-os-venc').value,
    fecha: $('inp-fecha').value,
    refe: $('inp-refe').value,
    chkConsulta: $('chk-consulta').checked,
    chkPractica: $('chk-practica').checked,
    chkInternacion: $('chk-internacion').checked,
    codigoHpgd: $('inp-codigo-hpgd').value,
    cie10: $('inp-cie10').value,
    especialidad: $('inp-especialidad').value,
    reciboTipo: $('inp-recibo-tipo').value,
    reciboMes: $('inp-recibo-mes').value,
    reciboAnio: $('inp-recibo-anio').value
  };
}

function saveCurrentSheet() {
  const data = getFormData();
  const idx = recordsHistory.findIndex(r => r.id === data.id);
  if (idx >= 0) recordsHistory[idx] = data;
  else { recordsHistory.unshift(data); currentRecordId = data.id; }
  localStorage.setItem('anexo_ii_records', JSON.stringify(recordsHistory));
  alert('Planilla guardada exitosamente.');
}

function loadSavedHistory() {
  const raw = localStorage.getItem('anexo_ii_records');
  if (raw) { try { recordsHistory = JSON.parse(raw); } catch (e) { recordsHistory = []; } }
}

function loadRecordIntoForm(id) {
  const r = recordsHistory.find(x => x.id === id);
  if (!r) return;
  currentRecordId = r.id;
  $('inp-nombre').value = r.nombre || '';
  $('inp-dni').value = r.dni || '';
  $('inp-edad').value = r.edad || '';
  $('inp-fecha-nac').value = r.fechaNac || '';
  $('inp-carnet').value = r.carnet || '';
  $('inp-tipo-ben').value = r.tipoBen || '';
  $('inp-parentesco').value = r.parentesco || '';
  $('inp-sexo').value = r.sexo || '';
  $('inp-os-nombre').value = r.osNombre || '';
  $('inp-os-rnos').value = r.osRnos || '';
  $('inp-os-emision').value = r.osEmision || '';
  $('inp-os-venc').value = r.osVenc || '';
  $('inp-fecha').value = r.fecha || '';
  $('inp-refe').value = r.refe || '';
  $('chk-consulta').checked = !!r.chkConsulta;
  $('chk-practica').checked = !!r.chkPractica;
  $('chk-internacion').checked = !!r.chkInternacion;
  $('inp-codigo-hpgd').value = r.codigoHpgd || '';
  $('inp-cie10').value = r.cie10 || '';
  $('inp-especialidad').value = r.especialidad || '';
  $('inp-recibo-tipo').value = r.reciboTipo || '';
  $('inp-recibo-mes').value = r.reciboMes || '';
  $('inp-recibo-anio').value = r.reciboAnio || '';
  updateSheet();
  switchTab('form');
}

function deleteRecord(id, event) {
  if (event) event.stopPropagation();
  if (confirm('¿Eliminar esta planilla guardada?')) {
    recordsHistory = recordsHistory.filter(r => r.id !== id);
    selectedIds.delete(id);
    localStorage.setItem('anexo_ii_records', JSON.stringify(recordsHistory));
    renderHistoryList();
  }
}

// ═══════════════════════════════════════════════════════════
// SELECCIÓN MÚLTIPLE EN EL HISTORIAL
// ═══════════════════════════════════════════════════════════
function toggleSelect(id, checked) {
  if (checked) selectedIds.add(id);
  else selectedIds.delete(id);
  updateHistoryActions();
}

function toggleSelectAll(checked) {
  if (checked) {
    recordsHistory.forEach(r => selectedIds.add(r.id));
  } else {
    selectedIds.clear();
  }
  renderHistoryList();
}

function updateHistoryActions() {
  const count = selectedIds.size;
  const countEl = $('history-selected-count');
  if (countEl) countEl.textContent = `${count} seleccionado${count === 1 ? '' : 's'}`;

  const btnDel = $('btn-delete-selected');
  if (btnDel) btnDel.disabled = count === 0;

  const chkAll = $('chk-select-all');
  if (chkAll) {
    chkAll.checked = recordsHistory.length > 0 && count === recordsHistory.length;
    chkAll.indeterminate = count > 0 && count < recordsHistory.length;
  }
}

function borrarSeleccionados() {
  if (selectedIds.size === 0) return;
  if (!confirm(`¿Eliminar ${selectedIds.size} planilla(s) seleccionada(s)?`)) return;
  recordsHistory = recordsHistory.filter(r => !selectedIds.has(r.id));
  selectedIds.clear();
  localStorage.setItem('anexo_ii_records', JSON.stringify(recordsHistory));
  renderHistoryList();
}

function borrarTodos() {
  if (recordsHistory.length === 0) {
    alert('No hay planillas para eliminar.');
    return;
  }
  if (!confirm(`¿Eliminar TODAS las planillas (${recordsHistory.length})? Esta acción no se puede deshacer.`)) return;
  recordsHistory = [];
  selectedIds.clear();
  localStorage.setItem('anexo_ii_records', JSON.stringify(recordsHistory));
  renderHistoryList();
}

// ═══════════════════════════════════════════════════════════
// HISTORIAL
// ═══════════════════════════════════════════════════════════
function renderHistoryList() {
  const container = $('history-list');
  const term = ($('inp-search').value || '').toLowerCase();
  const filtered = recordsHistory.filter(r => {
    const n = (r.nombre || '').toLowerCase();
    const d = (r.dni || '').toLowerCase();
    const o = (r.osNombre || '').toLowerCase();
    return n.includes(term) || d.includes(term) || o.includes(term);
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="text-center py-8 text-slate-400 text-xs">No se encontraron registros guardados.</div>`;
    updateHistoryActions();
    return;
  }

  container.innerHTML = filtered.map(item => {
    const isSelected = selectedIds.has(item.id);
    return `
    <div class="p-3 border ${isSelected ? 'border-slate-800 bg-slate-100' : 'border-slate-200 bg-slate-50/50'} rounded-lg hover:border-slate-400 hover:shadow-sm transition flex justify-between items-center group">
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleSelect('${item.id}', this.checked)"
               class="rounded border-slate-300 text-slate-800 focus:ring-slate-800 flex-shrink-0 cursor-pointer"
               onclick="event.stopPropagation()">
        <div class="flex-1 min-w-0 cursor-pointer" onclick="loadRecordIntoForm('${item.id}')">
          <div class="text-xs font-bold text-slate-800 uppercase truncate">${escapeHTML(item.nombre || 'Sin Nombre')}</div>
          <div class="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
            <span>DNI: ${escapeHTML(item.dni || '-')}</span>
            <span>•</span>
            <span>Fecha: ${escapeHTML(item.fecha || '-')}</span>
          </div>
          <div class="text-[10px] text-slate-400 mt-0.5 truncate">${escapeHTML(item.osNombre || 'Sin OS')}</div>
        </div>
      </div>
      <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 flex-shrink-0">
        <button onclick="guardarPDFGuardada('${item.id}', event)" title="Guardar como PDF"
                class="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition">
          <i class="fa-solid fa-file-pdf text-xs"></i>
        </button>
        <button onclick="deleteRecord('${item.id}', event)" title="Eliminar"
                class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition">
          <i class="fa-solid fa-trash-can text-xs"></i>
        </button>
      </div>
    </div>
  `;
  }).join('');

  updateHistoryActions();
}

function exportDataJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(recordsHistory, null, 2));
  const a = document.createElement('a');
  a.setAttribute("href", dataStr);
  a.setAttribute("download", `Anexo_II_Backup_${new Date().toISOString().split('T')[0]}.json`);
  a.click();
}

function importDataJSON(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (Array.isArray(parsed)) {
        recordsHistory = parsed;
        selectedIds.clear();
        localStorage.setItem('anexo_ii_records', JSON.stringify(recordsHistory));
        renderHistoryList();
        alert('Datos importados correctamente.');
      }
    } catch (err) { alert('Error al leer archivo JSON.'); }
  };
  if (event.target.files[0]) reader.readAsText(event.target.files[0]);
}

// ═══════════════════════════════════════════════════════════
// NOMBRE DEL PDF
// ═══════════════════════════════════════════════════════════
function generarNombrePDF(data) {
  if (!data || typeof data !== 'object') return 'ANEXO_II';

  let os = '';
  if (data.obraSocialId && OS_CATALOG[data.obraSocialId]) {
    os = data.obraSocialId.toUpperCase();
  } else if (data.osNombre) {
    os = String(data.osNombre)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9\s]/gi, '')
      .trim().split(/\s+/)[0].toUpperCase();
  }

  let dia = '', mes = '', anio = '';
  if (data.fecha) {
    const p = String(data.fecha).split('-');
    if (p.length === 3) { anio = p[0]; mes = p[1]; dia = p[2]; }
  }

  const partes = ['ANEXO'];
  if (os) partes.push(os);
  if (dia) partes.push(dia);
  if (mes) partes.push(mes);
  if (anio) partes.push(anio);
  if (data.dni) partes.push(String(data.dni).replace(/\D/g, ''));

  return partes.join('_') || 'ANEXO_II';
}

// ═══════════════════════════════════════════════════════════
// MENÚ DESPLEGABLE
// ═══════════════════════════════════════════════════════════
function togglePrintMenu(e) {
  if (e) e.stopPropagation();
  const menu = $('print-menu');
  if (menu) menu.classList.toggle('hidden');
}

document.addEventListener('click', function (e) {
  const wrapper = $('print-menu-wrapper');
  const menu = $('print-menu');
  if (!menu || menu.classList.contains('hidden')) return;
  if (wrapper && !wrapper.contains(e.target)) menu.classList.add('hidden');
});

// ═══════════════════════════════════════════════════════════
// OVERLAY DE PROGRESO
// ═══════════════════════════════════════════════════════════
function showOverlay(texto, sub) {
  const ov = $('pdf-overlay');
  if (!ov) return;
  $('pdf-overlay-text').textContent = texto || 'Generando PDF...';
  $('pdf-overlay-sub').textContent = sub || '';
  ov.classList.remove('hidden');
}

function hideOverlay() {
  const ov = $('pdf-overlay');
  if (ov) ov.classList.add('hidden');
}

// ═══════════════════════════════════════════════════════════
// GENERAR PDF DESDE UN ELEMENTO DEL DOM
// ═══════════════════════════════════════════════════════════
async function generarPDFDesdeElemento(elemento, nombreArchivo) {
  const { jsPDF } = window.jspdf;

  const canvas = await html2canvas(elemento, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: elemento.scrollWidth,
    windowHeight: elemento.scrollHeight
  });

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  if (imgHeight <= pageHeight) {
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
  } else {
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
  }

  pdf.save(nombreArchivo + '.pdf');
}

// ═══════════════════════════════════════════════════════════
// GUARDAR PDF ACTUAL
// ═══════════════════════════════════════════════════════════
async function guardarPDFActual() {
  const menu = $('print-menu');
  if (menu) menu.classList.add('hidden');

  const data = getFormData();
  const nombre = generarNombrePDF({
    obraSocialId: $('inp-os-preset').value || '',
    osNombre: data.osNombre,
    fecha: data.fecha,
    dni: data.dni
  });

  showOverlay('Generando PDF...', nombre + '.pdf');

  try {
    await generarPDFDesdeElemento($('printable-area'), nombre);
  } catch (err) {
    console.error(err);
    alert('Error al generar el PDF: ' + err.message);
  } finally {
    hideOverlay();
  }
}

// ═══════════════════════════════════════════════════════════
// GUARDAR TODAS EN PDF
// ═══════════════════════════════════════════════════════════
async function guardarPDFTodas() {
  const menu = $('print-menu');
  if (menu) menu.classList.add('hidden');

  if (recordsHistory.length === 0) {
    alert('No hay planillas guardadas para exportar. Guardá al menos una.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const cont = $('pdf-render-container');
  cont.innerHTML = '';

  const hoy = new Date();
  const dd = String(hoy.getDate()).padStart(2, '0');
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const yyyy = hoy.getFullYear();
  const nombreArchivo = `ANEXO_TODAS_${dd}_${mm}_${yyyy}`;

  showOverlay('Generando PDF...', `0 / ${recordsHistory.length} planillas`);

  try {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const pageWidth = 210;
    const pageHeight = 297;

    for (let i = 0; i < recordsHistory.length; i++) {
      const subEl = $('pdf-overlay-sub');
      if (subEl) subEl.textContent = `${i + 1} / ${recordsHistory.length} planillas`;

      const wrapper = document.createElement('div');
      wrapper.style.width = '210mm';
      wrapper.style.background = '#ffffff';
      wrapper.innerHTML = hojaHTML(recordsHistory[i].datos);
      cont.appendChild(wrapper);

      await new Promise(r => setTimeout(r, 80));

      const canvas = await html2canvas(wrapper, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));

      cont.innerHTML = '';
    }

    pdf.save(nombreArchivo + '.pdf');
  } catch (err) {
    console.error(err);
    alert('Error al generar el PDF: ' + err.message);
  } finally {
    hideOverlay();
    cont.innerHTML = '';
  }
}

// ═══════════════════════════════════════════════════════════
// GUARDAR PDF DE UNA PLANILLA GUARDADA
// ═══════════════════════════════════════════════════════════
async function guardarPDFGuardada(id, event) {
  if (event) { event.stopPropagation(); event.preventDefault(); }

  const item = recordsHistory.find(x => x.id === id);
  if (!item) {
    alert('No se encontró la planilla.');
    return;
  }

  const cont = $('pdf-render-container');
  if (!cont) {
    alert('No se encontró el contenedor de renderizado.');
    return;
  }

  cont.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.style.width = '210mm';
  wrapper.style.background = '#ffffff';
  wrapper.innerHTML = hojaHTML(item.datos);
  cont.appendChild(wrapper);

  // Esperar a que se rendericen las imágenes
  await new Promise(r => setTimeout(r, 150));

  const nombre = generarNombrePDF(item.datos);
  showOverlay('Generando PDF...', nombre + '.pdf');

  try {
    await generarPDFDesdeElemento(wrapper, nombre);
  } catch (err) {
    console.error(err);
    alert('Error al generar el PDF: ' + err.message);
  } finally {
    hideOverlay();
    cont.innerHTML = '';
  }
}

// ═══════════════════════════════════════════════════════════
// HTML DE UNA HOJA A PARTIR DE UN OBJETO DE DATOS
// ═══════════════════════════════════════════════════════════
function hojaHTML(d) {
  // Guardas contra undefined
  d = d || {};
  const os = Object.values(OS_CATALOG).find(o => o.nombre === d.osNombre) || { nombre: d.osNombre || '', rnos: d.osRnos || '' };

  const chk = (cond) => cond ? 'X' : '';
  const fmt = (iso) => {
    if (!iso) return '--/--/----';
    const p = String(iso).split('-');
    if (p.length !== 3) return '--/--/----';
    return p[2] + '/' + p[1] + '/' + p[0];
  };

  return `
  <div class="hoja-a4" style="margin-bottom: 0;">
    <div class="flex justify-between items-start border-b-2 border-slate-900 pb-2">
      <div>
        <span class="text-[10px] font-black tracking-widest text-slate-500 uppercase block">ANEXO II</span>
        <h2 class="text-sm font-extrabold text-slate-900 tracking-tight leading-snug">COMPROBANTE DE ATENCIÓN DE BENEFICIARIOS Y OBRAS SOCIALES</h2>
      </div>
      <div class="text-right flex flex-col items-end">
        <img src="santa fe.webp" alt="Santa Fe" class="w-14 h-auto mb-0.5">
        <span class="text-[9px] uppercase font-bold text-slate-700 tracking-wide">Hospital San Cristóbal</span>
      </div>
    </div>

    <div class="grid grid-cols-12 border border-slate-900 border-t-0 text-[10px] mt-2">
      <div class="col-span-8 border-r border-slate-900">
        <div class="p-2 border-b border-slate-900">
          <span class="text-[8px] font-bold uppercase text-slate-500 block">HOSPITAL</span>
        </div>
        <div class="p-2 flex items-center justify-center">
          <span class="font-bold text-sm text-slate-900">San Cristóbal "Julio César Villanueva"</span>
        </div>
      </div>
      <div class="col-span-4 flex flex-col bg-slate-50 print-bg-slate">
        <div class="p-1.5 text-center border-b border-slate-900">
          <span class="text-[8px] font-bold text-slate-600 uppercase">CODIGO HPGD </span>
          <span class="font-mono font-bold text-slate-900">21.32.0557</span>
        </div>
        <div class="p-1.5 text-center border-b border-slate-900">
          <span class="text-[8px] font-bold text-slate-600 uppercase block">REFES</span>
          <span class="font-mono font-bold text-slate-900 text-[10px]">10820912184192</span>
        </div>
        <div class="p-1.5 flex flex-col justify-center flex-grow">
          <div class="flex justify-between items-center text-[9px]">
            <span class="font-bold text-slate-600 uppercase">FECHA:</span>
            <span class="font-mono font-bold text-slate-900">${fmt(d.fecha)}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="border border-slate-900 border-t-0 text-[10px] flex flex-col mt-2 flex-grow">
      <div class="bg-slate-100 print-bg-slate p-1 text-center font-bold text-[9px] tracking-wider uppercase border-b border-slate-900">
        DATOS DEL BENEFICIARIO
      </div>
      <div class="grid grid-cols-12 flex-grow">
        <div class="col-span-8 p-2 border-r border-slate-900 flex flex-col justify-center">
          <span class="text-[8px] font-bold text-slate-500 uppercase block">APELLIDO Y NOMBRE</span>
          <span class="font-bold text-sm text-slate-900 uppercase tracking-wide mt-1">${escapeHTML(d.nombre || '')}</span>
        </div>
        <div class="col-span-4 p-2 flex flex-col justify-center">
          <span class="text-[8px] font-bold text-slate-500 uppercase block">N° DE DOCUMENTO:</span>
          <span class="font-mono font-bold text-sm text-slate-900 mt-1">${escapeHTML(d.dni || '')}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-12 border border-slate-900 border-t-0 text-[9px] mt-2 flex-grow">
      <div class="col-span-4 border-r border-slate-900 p-2 flex flex-col justify-center">
        <span class="font-bold uppercase text-slate-600 block mb-1.5">TIPO DE BENEFICIARIO</span>
        <div class="flex justify-between items-center px-0.5">
          <label class="flex items-center space-x-1"><span class="check-box w-4 h-4 border border-slate-900">${chk(d.tipoBen === 'Titular')}</span><span>Titular</span></label>
          <label class="flex items-center space-x-1"><span class="check-box w-4 h-4 border border-slate-900">${chk(d.tipoBen === 'No Titular')}</span><span>No Titular</span></label>
          <label class="flex items-center space-x-1"><span class="check-box w-4 h-4 border border-slate-900">${chk(d.tipoBen === 'Adherente')}</span><span>Adhere.</span></label>
        </div>
      </div>
      <div class="col-span-4 border-r border-slate-900 p-2 flex flex-col justify-center">
        <span class="font-bold uppercase text-slate-600 block mb-1.5">PARENTESCO</span>
        <div class="flex justify-between items-center px-0.5">
          <label class="flex items-center space-x-1"><span class="check-box w-4 h-4 border border-slate-900">${chk(d.parentesco === 'Cónyug.')}</span><span>Cónyug.</span></label>
          <label class="flex items-center space-x-1"><span class="check-box w-4 h-4 border border-slate-900">${chk(d.parentesco === 'Hijo')}</span><span>Hijo</span></label>
          <label class="flex items-center space-x-1"><span class="check-box w-4 h-4 border border-slate-900">${chk(d.parentesco === 'Otro')}</span><span>Otro</span></label>
        </div>
      </div>
      <div class="col-span-2 border-r border-slate-900 p-2 flex flex-col justify-center">
        <span class="font-bold uppercase text-slate-600 block mb-1.5">SEXO</span>
        <div class="flex justify-around items-center">
          <label class="flex items-center space-x-0.5"><span class="check-box w-4 h-4 border border-slate-900">${chk(d.sexo === 'MASC.')}</span><span>M.</span></label>
          <label class="flex items-center space-x-0.5"><span class="check-box w-4 h-4 border border-slate-900">${chk(d.sexo === 'FEM.')}</span><span>F.</span></label>
        </div>
      </div>
      <div class="col-span-2 p-2 text-center flex flex-col justify-center">
        <span class="font-bold uppercase text-slate-600 block mb-1.5">EDAD</span>
        <span class="font-mono font-bold text-sm text-slate-900">${escapeHTML(d.edad || '')}</span>
      </div>
    </div>

    <div class="border border-slate-900 border-t-0 text-[10px] mt-2 flex-grow flex flex-col">
      <div class="bg-slate-100 print-bg-slate p-1 text-center font-bold text-[9px] tracking-wider uppercase border-b border-slate-900 flex justify-between px-3">
        <span>TIPO DE ATENCIÓN Y PRESTACIÓN HPGD</span>
        <span class="font-mono">FECHA: ${fmt(d.fecha)}</span>
      </div>
      <div class="grid grid-cols-12 divide-x divide-slate-900 flex-grow">
        <div class="col-span-4 p-2 flex flex-col justify-center gap-2 bg-slate-50/50">
          <div class="flex items-center justify-between"><span class="text-[10px] font-semibold text-slate-700">• CONSULTA</span><span class="check-box w-4 h-4 border border-slate-900 text-[11px]">${chk(d.chkConsulta)}</span></div>
          <div class="flex items-center justify-between"><span class="text-[10px] font-semibold text-slate-700">• PRÁCTICA</span><span class="check-box w-4 h-4 border border-slate-900 text-[11px]">${chk(d.chkPractica)}</span></div>
          <div class="flex items-center justify-between"><span class="text-[10px] font-semibold text-slate-700">• INTERNACIÓN</span><span class="check-box w-4 h-4 border border-slate-900 text-[11px]">${chk(d.chkInternacion)}</span></div>
        </div>
        <div class="col-span-8 divide-y divide-slate-900">
          <div class="p-2 flex justify-between items-center"><span class="text-[9px] font-bold text-slate-500 uppercase">ESPECIALIDAD:</span><span class="font-bold text-slate-900 uppercase">${escapeHTML(d.especialidad || '')}</span></div>
          <div class="p-2 flex justify-between items-center"><span class="text-[9px] font-bold text-slate-500 uppercase">CÓDIGO n. HPGD:</span><span class="font-mono font-bold text-slate-900">${escapeHTML(d.codigoHpgd || '')}</span></div>
          <div class="p-2 flex justify-between items-center"><span class="text-[9px] font-bold text-slate-500 uppercase">DIAGNÓSTICO CIE 10:</span><span class="font-mono font-bold text-slate-900">${escapeHTML(d.cie10 || '')}</span></div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-12 border border-slate-900 border-t-0 text-[10px] mt-2 flex-grow">
      <div class="col-span-7 p-2 border-r border-slate-900 flex flex-col justify-between">
        <span class="text-[9px] font-bold uppercase text-slate-500">CERTIFICACIÓN MÉDICA</span>
        <div class="text-center my-auto opacity-30 italic text-[10px] text-slate-400">[ Firma del Médico y Sello con N° de Matrícula ]</div>
        <div class="border-t border-dashed border-slate-400 pt-0.5 text-center text-[8px] text-slate-600">Firma del Médico y Sello con N° de Matrícula</div>
      </div>
      <div class="col-span-5 flex flex-col">
        <div class="grid grid-cols-3 border-b border-slate-900 bg-slate-100 print-bg-slate">
          <div class="p-1 text-center font-bold text-[8px] tracking-wider uppercase border-r border-slate-900 col-span-1 flex items-center justify-center">Último Recibo</div>
          <div class="p-1 text-center font-bold text-[9px] tracking-wider uppercase border-r border-slate-900">MES</div>
          <div class="p-1 text-center font-bold text-[9px] tracking-wider uppercase">AÑO</div>
        </div>
        <div class="grid grid-cols-3 flex-grow">
          <div class="p-1 text-center text-[9px] border-r border-slate-900 flex items-center justify-center">de Sueldo</div>
          <div class="p-1 text-center border-r border-slate-900 flex items-center justify-center"><span class="font-mono font-bold text-sm text-slate-900">${escapeHTML(d.reciboMes || '')}</span></div>
          <div class="p-1 text-center flex items-center justify-center"><span class="font-mono font-bold text-sm text-slate-900">${escapeHTML(d.reciboAnio || '')}</span></div>
        </div>
      </div>
    </div>

    <div class="border border-slate-900 border-t-0 text-[10px] mt-2 flex-grow flex flex-col">
      <div class="grid grid-cols-12 border-b border-slate-900 flex-grow">
        <div class="col-span-9 p-2 border-r border-slate-900 flex flex-col justify-center">
          <span class="text-[8px] font-bold text-slate-500 uppercase block">DATOS DE LA OBRA SOCIAL: Nombre Completo</span>
          <span class="font-bold text-slate-900 uppercase mt-0.5">${escapeHTML(os.nombre || '')}</span>
        </div>
        <div class="col-span-3 p-2 bg-slate-50 print-bg-slate flex flex-col justify-center">
          <span class="text-[8px] font-bold text-slate-500 uppercase block">RNOS</span>
          <span class="font-mono font-bold text-slate-900 text-xs mt-0.5">${escapeHTML(os.rnos || d.osRnos || '')}</span>
        </div>
      </div>
      <div class="grid grid-cols-3 divide-x divide-slate-900 text-center text-[9px] flex-grow">
        <div class="p-2 flex flex-col justify-center"><span class="text-[7px] font-bold text-slate-500 uppercase block">N° DE CARNET</span><span class="font-mono font-bold text-slate-900 mt-0.5">${escapeHTML(d.carnet || '')}</span></div>
        <div class="p-2 flex flex-col justify-center"><span class="text-[7px] font-bold text-slate-500 uppercase block">FECHA DE EMISIÓN</span><span class="font-mono font-bold text-slate-900 mt-0.5">${fmt(d.osEmision)}</span></div>
        <div class="p-2 flex flex-col justify-center"><span class="text-[7px] font-bold text-slate-500 uppercase block">VENCIMIENTO</span><span class="font-mono font-bold text-slate-900 mt-0.5">${fmt(d.osVenc)}</span></div>
      </div>
    </div>

    <div class="border border-slate-900 border-t-0 grid grid-cols-3 divide-x divide-slate-900 text-[8px] mt-2 flex-grow">
      <div class="p-2 flex flex-col justify-between text-center"><span class="font-bold text-slate-700 uppercase">FIRMA RESPONSABLE</span><div class="border-t border-slate-400 mt-auto pt-1 text-slate-400">Firma y Sello</div></div>
      <div class="p-2 flex flex-col justify-between text-center"><span class="font-bold text-slate-700 uppercase">ACLARACIÓN</span><div class="border-t border-slate-400 mt-auto pt-1 text-slate-400">Aclaración de Firma</div></div>
      <div class="p-2 flex flex-col justify-between text-center"><span class="font-bold text-slate-700 uppercase">BENEFICIARIO</span><div class="border-t border-slate-400 mt-auto pt-1 text-slate-400">Firma del Beneficiario</div></div>
    </div>

    <div class="pt-2 mt-2 text-[7px] text-slate-400 border-t border-slate-200 flex justify-between">
      <span>Documento Oficial HPGD - Hospital San Cristóbal "Julio César Villanueva"</span>
      <span>Anexo II - Comprobante Original</span>
    </div>
  </div>
  `;
}

// ═══════════════════════════════════════════════════════════
// BIND DE EVENTOS
// ═══════════════════════════════════════════════════════════
function bindFormEvents() {
  document.querySelectorAll('input[type="text"], input[type="number"], input[type="date"]').forEach(el => {
    if (!el.id || !el.id.startsWith('inp-')) return;
    el.addEventListener('input', () => {
      if (el.id === 'inp-fecha') onFechaChange();
      else if (el.id === 'inp-fecha-nac') onFechaNacChange();
      else updateSheet();
    });
    if (el.type === 'date') {
      el.addEventListener('change', () => {
        if (el.id === 'inp-fecha') onFechaChange();
        else if (el.id === 'inp-fecha-nac') onFechaNacChange();
        else updateSheet();
      });
    }
  });

  document.querySelectorAll('select').forEach(el => {
    if (!el.id) return;
    el.addEventListener('change', () => {
      if (el.id === 'inp-os-preset') applyOSPreset();
      else if (el.id === 'inp-hpgd-preset') applyHpgdPreset();
      else if (el.id.startsWith('inp-')) updateSheet();
    });
  });

  document.querySelectorAll('input[type="checkbox"]').forEach(el => {
    if (!el.id || !el.id.startsWith('chk-')) return;
    el.addEventListener('change', updateSheet);
  });
}

// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
  loadSavedHistory();
  bindFormEvents();
  updateSheet();
  console.log('✅ Anexo II listo. jsPDF + html2canvas:', !!(window.jspdf && window.html2canvas));
});
