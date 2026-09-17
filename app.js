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

// ─── Nomenclador HPGD ──────────────────────────────────────────
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

// ─── Historial (localStorage) ──────────────────────────────────
let historial = [];

function cargarHistorial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    historial = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(historial)) historial = [];
  } catch { historial = []; }
}
function guardarHistorial() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(historial));
}
function agregarAlHistorial(datos) {
  historial.unshift({ id: Date.now(), datos });
  guardarHistorial();
  renderPlanillas();
}

// ─── Utilidades ────────────────────────────────────────────────
function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
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

// ─── Init ──────────────────────────────────────────────────────
const selectOS = document.getElementById("obraSocial");
OBRAS.forEach(o => {
  const opt = document.createElement("option");
  opt.value = o.id;
  opt.textContent = o.id + " — " + o.nombre;
  selectOS.appendChild(opt);
});
selectOS.addEventListener("change", () => {
  const o = OBRAS.find(x => x.id === selectOS.value);
  document.getElementById("rnos").textContent = o.rnos ? "RNOS: " + o.rnos : "";
});
selectOS.dispatchEvent(new Event("change"));

// Nomenclador (select + tabla + opción "Otro")
const selectHPGD     = document.getElementById("codigoHPGD");
const tbodyNom       = document.getElementById("tbodyNomenclador");
const fieldHPGDotro  = document.getElementById("fieldHPGDotro");
const inputHPGDotro  = document.getElementById("codigoHPGDotro");

NOMENCLADOR.forEach(n => {
  const opt = document.createElement("option");
  opt.value = n.codigo;
  opt.textContent = n.codigo + " — " + n.concepto;
  selectHPGD.appendChild(opt);

  const tr = document.createElement("tr");
  tr.innerHTML = `<td>${n.codigo}</td><td>${n.concepto}</td>`;
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
    document.getElementById("conceptoHPGD").textContent = "";
    inputHPGDotro.focus();
  } else {
    fieldHPGDotro.classList.add("hidden");
    inputHPGDotro.value = "";
    const n = NOMENCLADOR.find(x => x.codigo === val);
    document.getElementById("conceptoHPGD").textContent = n ? n.concepto : "";
  }
});

function toggleNomenclador() {
  document.getElementById("panelNomenclador").classList.toggle("hidden");
}
function scrollAResumen() {
  document.getElementById("panelResumen").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─── Leer formulario ───────────────────────────────────────────
function leerFormulario() {
  const fecha = document.getElementById("fecha").value;
  let dia = "", mes = "", anio = "";
  if (fecha) { const p = fecha.split("-"); anio = Number(p[0]); mes = Number(p[1]); dia = Number(p[2]); }

  let codigoHPGD = selectHPGD.value;
  if (codigoHPGD === "__OTRO__") codigoHPGD = inputHPGDotro.value.trim();

  return {
    obraSocialId:     selectOS.value,
    nombre:           document.getElementById("nombre").value.trim().toUpperCase(),
    dni:              document.getElementById("dni").value.trim(),
    tipoBeneficiario: document.getElementById("tipoBeneficiario").value,
    parentesco:       document.getElementById("parentesco").value,
    sexo:             document.getElementById("sexo").value,
    edad:             document.getElementById("edad").value.trim(),
    tipoAtencion:     document.getElementById("tipoAtencion").value,
    codigoHPGD,
    especialidad:     document.getElementById("especialidad").value.trim().toUpperCase(),
    cie10:            document.getElementById("cie10").value.trim().toUpperCase(),
    dia, mes, anio,
    fechaOriginal:    fecha,
    mesRecibo:        document.getElementById("mesRecibo").value.trim(),
    anioRecibo:       document.getElementById("anioRecibo").value.trim()
  };
}

// ─── Generar (guardar + imprimir) ─────────────────────────────
function generar(e) {
  e.preventDefault();
  const datos = leerFormulario();
  agregarAlHistorial(datos);

  // Imprimir solo la planilla recién generada
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
  ["nombre","dni","edad","especialidad","cie10","mesRecibo","anioRecibo","fecha","codigoHPGDotro"]
    .forEach(id => document.getElementById(id).value = "");
  ["tipoBeneficiario","parentesco","sexo","tipoAtencion","codigoHPGD"]
    .forEach(id => document.getElementById(id).value = "");
  fieldHPGDotro.classList.add("hidden");
  document.getElementById("conceptoHPGD").textContent = "";
}

function vaciarTodo() {
  document.getElementById("form").reset();
  fieldHPGDotro.classList.add("hidden");
  document.getElementById("conceptoHPGD").textContent = "";
  selectOS.dispatchEvent(new Event("change"));
}

// ─── Render de la planilla (HTML idéntico al Anexo II) ────────
function htmlPlanilla(d, item) {
  const os = OBRAS.find(o => o.id === d.obraSocialId);
  const concepto = conceptoHPGD(d);

  return `
  <div class="planilla" data-id="${item ? item.id : ""}">
    ${item ? `
      <div class="planilla-acciones no-print">
        <button type="button" onclick="imprimirPlanilla(${item.id})">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Imprimir PDF
        </button>
        <button type="button" class="danger" onclick="eliminarDelHistorial(${item.id})">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          Eliminar
        </button>
      </div>` : ""}

    <table class="tabla-anexo">
      <!-- Col widths: 12 columnas -->
      <colgroup>
        <col style="width:16%"><col style="width:9%"><col style="width:8%">
        <col style="width:9%"><col style="width:7%"><col style="width:7%">
        <col style="width:7%"><col style="width:7%"><col style="width:7%">
        <col style="width:8%"><col style="width:8%"><col style="width:7%">
      </colgroup>

      <!-- TÍTULO -->
      <tr><td class="titulo-anexo" colspan="12">ANEXO II</td></tr>
      <tr><td colspan="12" class="sin-borde" style="height:6px"></td></tr>

      <!-- COMPROBANTE / FECHA -->
      <tr>
        <td class="label" colspan="8">COMPROBANTE DE ATENCION</td>
        <td class="label centro" colspan="2">FECHA</td>
        <td class="valor centro">${esc(d.dia || "")}</td>
        <td class="valor centro">${esc(d.mes || "")}</td>
      </tr>
      <tr>
        <td class="label" colspan="8">DE BENEDICIARIOS DE OBRAS SOCIALES</td>
        <td colspan="2" class="sin-borde"></td>
        <td colspan="2" class="valor centro">${esc(d.anio || "")}</td>
      </tr>

      <!-- HOSPITAL -->
      <tr>
        <td class="label" colspan="6">HOSPITAL</td>
        <td class="label" colspan="3">Nº ${esc(HOSPITAL.numero)}</td>
        <td class="label" colspan="3" class="valor centro">REFES</td>
      </tr>
      <tr>
        <td class="valor-grande centro" colspan="6">${esc(HOSPITAL.nombre)}</td>
        <td class="valor centro" colspan="3">${esc(HOSPITAL.numero)}</td>
        <td class="valor centro" colspan="3">${esc(HOSPITAL.refes)}</td>
      </tr>

      <!-- DATOS DEL BENEFICIARIO -->
      <tr><td class="seccion" colspan="12">DATOS DEL BENEFICIARIO</td></tr>
      <tr>
        <td class="label" colspan="6">APELLIDOS Y NOMBRES</td>
        <td class="label" colspan="3">Nº De Documento</td>
        <td colspan="3" class="sin-borde"></td>
      </tr>
      <tr>
        <td class="valor-grande centro" colspan="6">${esc(d.nombre || "")}</td>
        <td class="valor centro" colspan="3">${esc(d.dni || "")}</td>
        <td colspan="3" class="sin-borde"></td>
      </tr>

      <!-- TIPO BENEFICIARIO / PARENTESCO / SEXO / EDAD -->
      <tr>
        <td class="label" colspan="3">TIPO DE BENEFICIARIO</td>
        <td class="label" colspan="3">PARENTESCO</td>
        <td class="label" colspan="3">SEXO</td>
        <td class="label" colspan="3">EDAD</td>
      </tr>
      <tr>
        <td class="label centro chico">TITULAR</td>
        <td class="label centro chico">NO TITULAR</td>
        <td class="label centro chico">ADHERE.</td>
        <td class="label centro chico">CONYUG.</td>
        <td class="label centro chico">HIJO</td>
        <td class="label centro chico">OTRO</td>
        <td class="label centro chico">MASC</td>
        <td class="label centro chico">FEM</td>
        <td class="valor centro" colspan="1" rowspan="2">${esc(d.edad || "")}</td>
        <td colspan="3" class="sin-borde" rowspan="2"></td>
      </tr>
      <tr>
        <td class="valor centro">${X(d.tipoBeneficiario === "TITULAR")}</td>
        <td class="valor centro">${X(d.tipoBeneficiario === "NO TITULAR")}</td>
        <td class="valor centro">${X(d.tipoBeneficiario === "ADHERENTE")}</td>
        <td class="valor centro">${X(d.parentesco === "CONYUGE")}</td>
        <td class="valor centro">${X(d.parentesco === "HIJO")}</td>
        <td class="valor centro">${X(d.parentesco === "OTRO")}</td>
        <td class="valor centro">${X(d.sexo === "MASC")}</td>
        <td class="valor centro">${X(d.sexo === "FEM")}</td>
      </tr>

      <!-- TIPO DE ATENCION -->
      <tr><td class="seccion" colspan="12">TIPO DE ATENCION</td></tr>
      <tr>
        <td class="label centro" colspan="3">CONSULTA</td>
        <td class="label centro" colspan="3">ESPECIALIDAD</td>
        <td class="valor centro" colspan="6">${esc(d.especialidad || "")}</td>
      </tr>
      <tr>
        <td class="valor centro" colspan="3">${X(d.tipoAtencion === "CONSULTA")}</td>
        <td class="label centro" colspan="3">PRÁCTICA</td>
        <td class="valor centro" colspan="6">${X(d.tipoAtencion === "PRACTICA")}</td>
      </tr>
      <tr>
        <td class="label centro" colspan="3">INTERNAC.</td>
        <td class="label centro" colspan="3">DIAGNOSTICO CIE 10</td>
        <td class="valor centro" colspan="3">${esc(d.cie10 || "")}</td>
        <td class="label centro" colspan="2">OTROS</td>
        <td class="valor centro">${X(d.tipoAtencion === "INTERNACION")}</td>
      </tr>
      <tr>
        <td colspan="3" class="sin-borde"></td>
        <td class="label centro" colspan="3">CODIGO n. HPGD</td>
        <td class="valor centro" colspan="3">${esc(d.codigoHPGD || "")}</td>
        <td class="valor centro chico" colspan="3">${esc(concepto)}</td>
      </tr>

      <!-- FIRMA MEDICO / RECIBO -->
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

      <!-- OBRA SOCIAL -->
      <tr>
        <td class="label" colspan="8">DATOS DE LA OBRA SOCIAL: Nombre Completo</td>
        <td class="label centro" colspan="4">RNOS</td>
      </tr>
      <tr>
        <td class="valor centro" colspan="8">${esc(os.nombre)}</td>
        <td class="valor centro" colspan="4">${esc(os.rnos || "")}</td>
      </tr>

      <!-- CARNET -->
      <tr>
        <td class="label" colspan="4">Nº de Carnet de Obra Social</td>
        <td class="label" colspan="4">Fecha de Emisión</td>
        <td class="label" colspan="4">Vencimiento</td>
      </tr>
      <tr>
        <td colspan="4" class="valor">&nbsp;</td>
        <td colspan="4" class="valor">&nbsp;</td>
        <td colspan="4" class="valor">&nbsp;</td>
      </tr>

      <!-- FIRMAS -->
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

// ─── Render del contenedor ─────────────────────────────────────
function renderPlanillas() {
  const cont  = document.getElementById("contenedorPlanillas");
  const empty = document.getElementById("emptyResumen");
  document.getElementById("badgeCantidad").textContent = historial.length;

  if (historial.length === 0) {
    cont.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");
  cont.innerHTML = historial.map(item => htmlPlanilla(item.datos, item)).join("");
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
  if (historial.length === 0) {
    alert("No hay planillas cargadas para imprimir.");
    return;
  }
  document.body.classList.remove("print-single");
  document.querySelectorAll(".planilla").forEach(p => p.classList.remove("print-target"));
  window.print();
}

// ─── Eliminar / borrar ────────────────────────────────────────
function eliminarDelHistorial(id) {
  if (!confirm("¿Eliminar esta planilla?")) return;
  historial = historial.filter(x => x.id !== id);
  guardarHistorial();
  renderPlanillas();
}

function borrarHistorial() {
  if (historial.length === 0) return;
  if (!confirm(`¿Borrar TODAS las planillas (${historial.length})? Esta acción no se puede deshacer.`)) return;
  historial = [];
  guardarHistorial();
  renderPlanillas();
}

// ─── Init ─────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  cargarHistorial();
  renderPlanillas();
});