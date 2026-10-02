// ─── Catálogo de obras sociales ────────────────────────────────
const OBRAS = [
  { id: "PAMI",       nombre: "INSTITUTO NACIONAL DE SERVICIOS SOCIALES PARA JUBILADOS Y PENSIONADOS", rnos: "500807" },
  { id: "OSPRERA",    nombre: "OBRA SOCIAL DEL PERSONAL RURAL Y ESTIBADORES DE LA REP. ARG.",          rnos: "119302" },
  { id: "CAMIONEROS", nombre: "CAMIONEROS",                                                            rnos: "" },
  { id: "OSECAC",     nombre: "OBRA SOCIAL DE LOS EMPLEADO DE COMERCIO Y ACTIVIDADES CIVILES",         rnos: "126205" },
  { id: "OSPECON",    nombre: "OBRA SOCIAL DEL PERSONAL DE LA CONSTRUCIÓN",                            rnos: "105408" },
  { id: "OSDOP",      nombre: "OBRA SOCIAL DE DOCENTES PARTICULARES",                                  rnos: "106302" },
  { id: "OSFE",       nombre: "OBRA SOCIAL FERROVIARIA",                                               rnos: "001300" },
  { id: "OSPAVIAL",   nombre: "OBRA SOCIAL PARA EL PERSONAL DE LA ACTIVIDAD VIAL",                     rnos: "122302" },
  { id: "USUOMRA",    nombre: "OBRA SOCIAL DE LA UNION OBRERA METALURGICA DE LA REP. ARG.",            rnos: "112103" },
  { id: "IAPOS",      nombre: "INSTITUTO AUTARQUICO PROVINCIAL DE OBRA SOCIAL",                        rnos: "" }
];

const NOMENCLADOR = [
  { codigo: "1.01",   concepto: "CONSULTA MEDICA" },
  { codigo: "1.01.1", concepto: "CONSULTA EN CAPAS" },
  { codigo: "10",     concepto: "CONSULTA Y UNA PRACTICA" },
  { codigo: "1.03",   concepto: "HASTA 3 PRACTICAS" },
  { codigo: "1.04",   concepto: "ATENCION EN GUARDIA" },
  { codigo: "1.05",   concepto: "ECO, RADIO, TOMO" },
  { codigo: "1.05.1", concepto: "ERGOMETRIA" },
  { codigo: "1.05.2", concepto: "MAMOGRAFIA, SENOGRAFIA" },
  { codigo: "1.06",   concepto: "ECOGRAFIA" },
  { codigo: "1.07",   concepto: "ATENCION DE URGENCIA EN GUARDIA" },
  { codigo: "4.01",   concepto: "INTERNACION" }
];

const HOSPITAL = {
  nombre: 'San Cristóbal "Julio César Villanueva"',
  numero: "21.32.0557",
  refes:  "10820912184192"
};

const STORAGE_KEY = "anexo2_planillas";

let historial = [];
let filtro = "";
let editandoId = null;

function cargarHistorial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    historial = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(historial)) historial = [];
  } catch { historial = []; }
}
function guardarHistorial() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(historial)); }
  catch { alert("No se pudo guardar en el navegador."); }
}
function agregarAlHistorial(datos) {
  historial.unshift({ id: Date.now(), datos });
  guardarHistorial();
  renderPlanillas();
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function X(v) { return v ? "X" : ""; }
function fechaTxt(d) {
  if (d.fechaOriginal) return d.fechaOriginal.split("-").reverse().join("/");
  if (d.dia) return `${d.dia}/${d.mes}/${d.anio}`;
  return "—";
}
function conceptoHPGD(d) {
  const nom = NOMENCLADOR.find(n => n.codigo === d.codigoHPGD);
  return nom ? nom.concepto : "";
}
function $(id) { return document.getElementById(id); }

// ─── Obra social ───────────────────────────────────────────────
const selectOS = $("obraSocial");
OBRAS.forEach(o => {
  const opt = document.createElement("option");
  opt.value = o.id;
  opt.textContent = o.id + " — " + o.nombre;
  selectOS.appendChild(opt);
});
selectOS.addEventListener("change", () => {
  const o = OBRAS.find(x => x.id === selectOS.value);
  $("rnos").textContent = o.rnos ? "RNOS: " + o.rnos : "";
});
selectOS.dispatchEvent(new Event("change"));

// ─── Nomenclador ───────────────────────────────────────────────
const selectHPGD     = $("codigoHPGD");
const tbodyNom       = $("tbodyNomenclador");
const fieldHPGDotro  = $("fieldHPGDotro");
const inputHPGDotro  = $("codigoHPGDotro");

NOMENCLADOR.forEach(n => {
  const opt = document.createElement("option");
  opt.value = n.codigo;
  opt.textContent = n.codigo + " — " + n.concepto;
  selectHPGD.appendChild(opt);
  const tr = document.createElement("tr");
  tr.className = "text-gray-700";
  tr.innerHTML = `<td class="px-5 py-2 font-mono text-xs text-gray-500">${n.codigo}</td><td class="px-5 py-2">${n.concepto}</td>`;
  tbodyNom.appendChild(tr);
});

const optOtro = document.createElement("option");
optOtro.value = "__OTRO__";
optOtro.textContent = "Otro (escribir)...";
selectHPGD.appendChild(optOtro);

selectHPGD.addEventListener("change", () => {
  const val = selectHPGD.value;
  if (val === "__OTRO__") {
    fieldHPGDotro.classList.remove("hidden");
    $("especialidad").value = "";
    inputHPGDotro.focus();
  } else {
    fieldHPGDotro.classList.add("hidden");
    inputHPGDotro.value = "";
    const n = NOMENCLADOR.find(x => x.codigo === val);
    $("especialidad").value = n ? n.concepto : "";
  }
});

// ─── Fecha por defecto ─────────────────────────────────────────
const inputFecha = $("fecha");
inputFecha.valueAsDate = new Date();
inputFecha.addEventListener("change", () => {
  if (!inputFecha.value) return;
  const [y, m] = inputFecha.value.split("-");
  if (!$("mesRecibo").value)  $("mesRecibo").value  = String(Number(m));
  if (!$("anioRecibo").value) $("anioRecibo").value = String(Number(y) % 100);
});

function toggleNomenclador() { $("panelNomenclador").classList.toggle("hidden"); }
function scrollAResumen() { $("panelResumen").scrollIntoView({ behavior: "smooth", block: "start" }); }

// ─── Leer formulario ───────────────────────────────────────────
function leerFormulario() {
  const fecha = inputFecha.value;
  let dia = "", mes = "", anio = "";
  if (fecha) { const p = fecha.split("-"); anio = Number(p[0]); mes = Number(p[1]); dia = Number(p[2]); }
  let codigoHPGD = selectHPGD.value;
  if (codigoHPGD === "__OTRO__") codigoHPGD = inputHPGDotro.value.trim();
  return {
    obraSocialId:     selectOS.value,
    nombre:           $("nombre").value.trim().toUpperCase(),
    dni:              $("dni").value.trim(),
    tipoBeneficiario: $("tipoBeneficiario").value,
    parentesco:       $("parentesco").value,
    sexo:             $("sexo").value,
    edad:             $("edad").value.trim(),
    tipoAtencion:     $("tipoAtencion").value,
    codigoHPGD,
    especialidad:     $("especialidad").value.trim().toUpperCase(),
    cie10:            $("cie10").value.trim().toUpperCase(),
    dia, mes, anio,
    fechaOriginal:    fecha,
    mesRecibo:        $("mesRecibo").value.trim(),
    anioRecibo:       $("anioRecibo").value.trim()
  };
}

// ─── Generar / Actualizar ─────────────────────────────────────
function generar(e) {
  e.preventDefault();
  const datos = leerFormulario();

  if (editandoId) {
    const item = historial.find(x => x.id === editandoId);
    if (item) { item.datos = datos; guardarHistorial(); renderPlanillas(); }
    salirDeEdicion();
    limpiarCamposVariables();
    scrollAResumen();
    return;
  }

  agregarAlHistorial(datos);
  setTimeout(() => {
    const primera = document.querySelector("#contenedorPlanillas .planilla");
    if (!primera) return;
    document.body.classList.add("print-single");
    document.querySelectorAll(".planilla").forEach(p => p.classList.remove("print-target"));
    primera.classList.add("print-target");
    window.print();
    setTimeout(() => {
      document.body.classList.remove("print-single");
      document.querySelectorAll(".planilla").forEach(p => p.classList.remove("print-target"));
    }, 300);
  }, 100);
  limpiarCamposVariables();
}

function limpiarCamposVariables() {
  ["nombre","dni","edad","especialidad","cie10","mesRecibo","anioRecibo","codigoHPGDotro"]
    .forEach(id => $(id).value = "");
  ["tipoBeneficiario","parentesco","sexo","tipoAtencion","codigoHPGD"]
    .forEach(id => $(id).value = "");
  fieldHPGDotro.classList.add("hidden");
  inputFecha.valueAsDate = new Date();
  const hoy = new Date();
  $("mesRecibo").value  = String(hoy.getMonth() + 1);
  $("anioRecibo").value = String(hoy.getFullYear() % 100);
}

function vaciarTodo() {
  $("form").reset();
  fieldHPGDotro.classList.add("hidden");
  selectOS.dispatchEvent(new Event("change"));
  salirDeEdicion();
}

// ─── Edición ──────────────────────────────────────────────────
function editarPlanilla(id) {
  const item = historial.find(x => x.id === id);
  if (!item) return;
  const d = item.datos;

  selectOS.value = d.obraSocialId || OBRAS[0].id;
  selectOS.dispatchEvent(new Event("change"));
  $("nombre").value           = d.nombre || "";
  $("dni").value              = d.dni || "";
  $("tipoBeneficiario").value = d.tipoBeneficiario || "";
  $("parentesco").value       = d.parentesco || "";
  $("sexo").value             = d.sexo || "";
  $("edad").value             = d.edad || "";
  $("tipoAtencion").value     = d.tipoAtencion || "";
  $("especialidad").value     = d.especialidad || "";
  $("cie10").value            = d.cie10 || "";
  inputFecha.value            = d.fechaOriginal || "";
  $("mesRecibo").value        = d.mesRecibo || "";
  $("anioRecibo").value       = d.anioRecibo || "";

  if (d.codigoHPGD && NOMENCLADOR.some(n => n.codigo === d.codigoHPGD)) {
    selectHPGD.value = d.codigoHPGD;
    fieldHPGDotro.classList.add("hidden");
    inputHPGDotro.value = "";
  } else if (d.codigoHPGD) {
    selectHPGD.value = "__OTRO__";
    fieldHPGDotro.classList.remove("hidden");
    inputHPGDotro.value = d.codigoHPGD;
  } else {
    selectHPGD.value = "";
    fieldHPGDotro.classList.add("hidden");
    inputHPGDotro.value = "";
  }

  editandoId = id;
  updateEditUI();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function salirDeEdicion() { editandoId = null; updateEditUI(); }
function updateEditUI() {
  const activo = editandoId !== null;
  $("btnGuardarTxt").textContent = activo ? "Actualizar planilla" : "Guardar y generar PDF";
  $("btnCancelarEdicion").classList.toggle("hidden", !activo);
}
function duplicarPlanilla(id) {
  const idx = historial.findIndex(x => x.id === id);
  if (idx === -1) return;
  const copia = JSON.parse(JSON.stringify(historial[idx].datos));
  historial.splice(idx + 1, 0, { id: Date.now(), datos: copia });
  guardarHistorial();
  renderPlanillas();
}

function htmlPlanilla(d, item) {
  const os = OBRAS.find(o => o.id === d.obraSocialId);
  const concepto = conceptoHPGD(d);

  return `
  <div class="planilla px-6 py-8 border-t border-gray-100" data-id="${item ? item.id : ""}">
    ${item ? `
      <div class="planilla-acciones no-print flex justify-end gap-1 flex-wrap mb-5">
        <button type="button" onclick="editarPlanilla(${item.id})" class="px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">Editar</button>
        <button type="button" onclick="duplicarPlanilla(${item.id})" class="px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">Duplicar</button>
        <button type="button" onclick="imprimirPlanilla(${item.id})" class="px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">Imprimir PDF</button>
        <button type="button" class="danger px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 rounded" onclick="eliminarDelHistorial(${item.id})">Eliminar</button>
      </div>` : ""}

    <table class="tabla-anexo mx-auto max-w-[780px]">
      <colgroup>
        <col style="width:13%"><col style="width:9%"><col style="width:9%">
        <col style="width:9%"><col style="width:8%"><col style="width:8%">
        <col style="width:9%"><col style="width:9%"><col style="width:9%">
        <col style="width:8%"><col style="width:5%"><col style="width:4%">
      </colgroup>

      <tr><td class="titulo-anexo" colspan="12">Anexo II</td></tr>

      <!-- Fila 1: Comprobante | FECHA -->
      <tr>
        <td class="label" colspan="8">COMPROBANTE DE ATENCION</td>
        <td class="label centro" colspan="4">FECHA</td>
      </tr>
      <tr>
        <td class="label" colspan="8">DE BENEFICIARIOS DE OBRAS SOCIALES</td>
        <td class="valor centro">${esc(d.dia || "")}</td>
        <td class="valor centro">${esc(d.mes || "")}</td>
        <td class="valor centro" colspan="2">${esc(d.anio || "")}</td>
      </tr>

      <!-- Fila 3-4: Hospital + Nº + REFES -->
      <tr>
        <td class="label" colspan="8">HOSPITAL</td>
        <td class="label centro" colspan="4">Nº ${esc(HOSPITAL.numero)}</td>
      </tr>
      <tr>
        <td class="valor-grande centro" colspan="8">${esc(HOSPITAL.nombre)}</td>
        <td class="label centro" colspan="2">REFES</td>
        <td class="valor centro" colspan="2">${esc(HOSPITAL.refes)}</td>
      </tr>

      <!-- Fila 5: DATOS DEL BENEFICIARIO -->
      <tr><td class="seccion" colspan="12">DATOS DEL BENEFICIARIO</td></tr>

      <!-- Fila 6-7: Apellidos | Documento -->
      <tr>
        <td class="label" colspan="8">APELLIDOS Y NOMBRES</td>
        <td class="label centro" colspan="4">Nº De Documento</td>
      </tr>
      <tr>
        <td class="valor-grande centro" colspan="8">${esc(d.nombre || "")}</td>
        <td class="valor centro" colspan="4">${esc(d.dni || "")}</td>
      </tr>

      <!-- Fila 8: Tipo | Parentesco | Sexo | Edad -->
      <tr>
        <td class="label centro" colspan="3">TIPO DE BENEFICIARIO</td>
        <td class="label centro" colspan="4">PARENTESCO</td>
        <td class="label centro" colspan="2">SEXO</td>
        <td class="label centro" colspan="3">EDAD</td>
      </tr>
      <tr>
        <td class="label centro chico">TITULAR</td>
        <td class="label centro chico">NO TITULAR</td>
        <td class="label centro chico">ADHERE.</td>
        <td class="label centro chico">CONYUG.</td>
        <td class="label centro chico">HIJO</td>
        <td class="label centro chico">OTRO</td>
        <td class="label centro chico"></td>
        <td class="label centro chico">MASC</td>
        <td class="label centro chico">FEM</td>
        <td class="label centro chico"></td>
        <td class="label centro chico" colspan="2"></td>
      </tr>
      <tr>
        <td class="valor centro">${X(d.tipoBeneficiario === "TITULAR")}</td>
        <td class="valor centro">${X(d.tipoBeneficiario === "NO TITULAR")}</td>
        <td class="valor centro">${X(d.tipoBeneficiario === "ADHERENTE")}</td>
        <td class="valor centro">${X(d.parentesco === "CONYUGE")}</td>
        <td class="valor centro">${X(d.parentesco === "HIJO")}</td>
        <td class="valor centro">${X(d.parentesco === "OTRO")}</td>
        <td class="valor centro"></td>
        <td class="valor centro">${X(d.sexo === "MASC")}</td>
        <td class="valor centro">${X(d.sexo === "FEM")}</td>
        <td class="valor centro"></td>
        <td class="valor centro" colspan="2">${esc(d.edad || "")}</td>
      </tr>

      <!-- Fila 11: TIPO DE ATENCION -->
      <tr><td class="seccion" colspan="12">TIPO DE ATENCION</td></tr>

      <!-- Fila 12: Consulta | Especialidad -->
      <tr>
        <td class="label" colspan="3">CONSULTA</td>
        <td class="valor centro">${X(d.tipoAtencion === "CONSULTA")}</td>
        <td class="label centro" colspan="3">ESPECIALIDAD</td>
        <td class="valor centro" colspan="5">${esc(d.especialidad || "")}</td>
      </tr>

      <!-- Fila 13: Práctica | Código HPGD -->
      <tr>
        <td class="label" colspan="3">PRÁCTICA</td>
        <td class="valor centro">${X(d.tipoAtencion === "PRACTICA")}</td>
        <td class="label centro" colspan="3">CODIGO n. HPGD</td>
        <td class="valor centro" colspan="2">${esc(d.codigoHPGD || "")}</td>
        <td class="valor centro chico" colspan="3">${esc(concepto)}</td>
      </tr>

      <!-- Fila 14: Internac | CIE-10 | Otros -->
      <tr>
        <td class="label" colspan="3">INTERNAC.</td>
        <td class="valor centro">${X(d.tipoAtencion === "INTERNACION")}</td>
        <td class="label centro" colspan="3">DIAGNOSTICO CIE 10</td>
        <td class="valor centro" colspan="2">${esc(d.cie10 || "")}</td>
        <td class="label centro" colspan="2">OTROS</td>
        <td class="valor centro"></td>
      </tr>

      <!-- Fila 15: Firma médico + Último recibo -->
      <tr>
        <td class="firma" colspan="8" rowspan="2">Firma del Médico y Sello con Nº de Matrícula</td>
        <td class="label centro" colspan="2">Ultimo Recibo</td>
        <td class="label centro">MES</td>
        <td class="label centro">AÑO</td>
      </tr>
      <tr>
        <td class="label centro chico" colspan="2">de Sueldo</td>
        <td class="valor centro">${esc(d.mesRecibo || "")}</td>
        <td class="valor centro">${esc(d.anioRecibo || "")}</td>
      </tr>

      <!-- Fila 17: Obra social -->
      <tr>
        <td class="label" colspan="8">DATOS DE LA OBRA SOCIAL: Nombre Completo</td>
        <td class="label centro" colspan="4">RNOS</td>
      </tr>
      <tr>
        <td class="valor centro" colspan="8">${esc(os.nombre)}</td>
        <td class="valor centro" colspan="4">${esc(os.rnos || "")}</td>
      </tr>

      <!-- Fila 19: Carnet / Emisión / Vencimiento -->
      <tr>
        <td class="label" colspan="4">Nº de Carnet de Obra Social</td>
        <td class="label" colspan="4">Fecha de Emisión</td>
        <td class="label" colspan="4">Vencimiento</td>
      </tr>
      <tr>
        <td class="valor centro" colspan="4">&nbsp;</td>
        <td class="valor centro" colspan="4">&nbsp;</td>
        <td class="valor centro" colspan="4">&nbsp;</td>
      </tr>

      <!-- Fila 21-22: Firmas -->
      <tr>
        <td class="firma" colspan="4">FIRMA RESPONSABLE</td>
        <td class="firma" colspan="4">ACLARACIÓN</td>
        <td class="firma" colspan="4">BENEFICIARIO</td>
      </tr>
      <tr>
        <td class="label centro chico" colspan="4">ADMINISTRATIVO CONTABLE</td>
        <td colspan="4" class="sin-borde"></td>
        <td colspan="4" class="sin-borde"></td>
      </tr>
    </table>
  </div>
  `;
}

// ─── Render ────────────────────────────────────────────────────
function itemMatches(item) {
  if (!filtro) return true;
  const d = item.datos;
  const os = OBRAS.find(o => o.id === d.obraSocialId);
  const texto = [
    d.nombre, d.dni, d.cie10, d.especialidad, d.codigoHPGD,
    os && os.id, os && os.nombre, fechaTxt(d)
  ].filter(Boolean).join(" ").toLowerCase();
  return texto.includes(filtro);
}

function renderPlanillas() {
  const cont  = $("contenedorPlanillas");
  const empty = $("emptyResumen");
  const info  = $("resumenInfo");

  const filtrados = historial.filter(itemMatches);
  $("badgeCantidad").textContent = historial.length;
  info.textContent = (filtro && historial.length)
    ? `${filtrados.length} de ${historial.length} planillas`
    : "";

  if (historial.length === 0) {
    cont.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");
  cont.innerHTML = filtrados.map(item => htmlPlanilla(item.datos, item)).join("");
}

function setFiltro(valor) {
  filtro = valor.trim().toLowerCase();
  renderPlanillas();
}

// ─── Imprimir ─────────────────────────────────────────────────
function imprimirPlanilla(id) {
  const el = document.querySelector(`.planilla[data-id="${id}"]`);
  if (!el) return;
  document.body.classList.add("print-single");
  document.querySelectorAll(".planilla").forEach(p => p.classList.remove("print-target"));
  el.classList.add("print-target");
  window.print();
  setTimeout(() => {
    document.body.classList.remove("print-single");
    document.querySelectorAll(".planilla").forEach(p => p.classList.remove("print-target"));
  }, 300);
}
function imprimirTodas() {
  if (historial.length === 0) { alert("No hay planillas cargadas para imprimir."); return; }
  document.body.classList.remove("print-single");
  document.querySelectorAll(".planilla").forEach(p => p.classList.remove("print-target"));
  window.print();
}

// ─── Exportar / Importar ──────────────────────────────────────
function exportarJSON() {
  if (historial.length === 0) { alert("No hay planillas para exportar."); return; }
  const payload = { app: "anexo2_planillas", exportado: new Date().toISOString(), planillas: historial };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `anexo2_planillas_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}
function importarJSON(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const arr = Array.isArray(data) ? data : data.planillas;
      if (!Array.isArray(arr)) throw new Error("formato");
      let agregadas = 0;
      arr.forEach((x, i) => {
        if (x && x.datos && typeof x.datos === "object") {
          historial.unshift({ id: Date.now() + i, datos: x.datos });
          agregadas++;
        }
      });
      guardarHistorial();
      renderPlanillas();
      alert(agregadas ? `Se importaron ${agregadas} planillas.` : "El archivo no contenía planillas válidas.");
    } catch {
      alert("Archivo inválido.");
    }
    input.value = "";
  };
  reader.readAsText(file);
}

// ─── Eliminar / borrar ────────────────────────────────────────
function eliminarDelHistorial(id) {
  if (!confirm("¿Eliminar esta planilla?")) return;
  if (editandoId === id) salirDeEdicion();
  historial = historial.filter(x => x.id !== id);
  guardarHistorial();
  renderPlanillas();
}
function borrarHistorial() {
  if (historial.length === 0) return;
  if (!confirm(`¿Borrar TODAS las planillas (${historial.length})?`)) return;
  historial = [];
  guardarHistorial();
  renderPlanillas();
}

// ─── Init ─────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  cargarHistorial();
  const hoy = new Date();
  $("mesRecibo").value  = String(hoy.getMonth() + 1);
  $("anioRecibo").value = String(hoy.getFullYear() % 100);
  renderPlanillas();
});