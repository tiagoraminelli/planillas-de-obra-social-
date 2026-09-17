// ─── Catálogo de obras sociales ────────────────────────────────
const OBRAS = [
  {
    id: "PAMI",
    nombre:
      "INSTITUTO NACIONAL DE SERVICIOS SOCIALES PARA JUBILADOS Y PENSIONADOS",
    rnos: "500807",
  },
  {
    id: "OSPRERA",
    nombre: "OBRA SOCIAL DEL PERSONAL RURAL Y ESTIBADORES DE LA REP. ARG.",
    rnos: "119302",
  },
  { id: "CAMIONEROS", nombre: "CAMIONEROS", rnos: "" },
  {
    id: "OSECAC",
    nombre: "OBRA SOCIAL DE LOS EMPLEADO DE COMERCIO Y ACTIVIDADES CIVILES",
    rnos: "126205",
  },
  {
    id: "OSPECON",
    nombre: "OBRA SOCIAL DEL PERSONAL DE LA CONSTRUCIÓN",
    rnos: "105408",
  },
  {
    id: "OSDOP",
    nombre: "OBRA SOCIAL DE DOCENTES PARTICULARES",
    rnos: "106302",
  },
  { id: "OSFE", nombre: "OBRA SOCIAL FERROVIARIA", rnos: "001300" },
  {
    id: "OSPAVIAL",
    nombre: "OBRA SOCIAL PARA EL PERSONAL DE LA ACTIVIDAD VIAL",
    rnos: "122302",
  },
  {
    id: "USUOMRA",
    nombre: "OBRA SOCIAL DE LA UNION OBRERA METALURGICA DE LA REP. ARG.",
    rnos: "112103",
  },
  {
    id: "IAPOS",
    nombre: "INSTITUTO AUTARQUICO PROVINCIAL DE OBRA SOCIAL",
    rnos: "",
  },
];

// ─── Nomenclador HPGD ──────────────────────────────────────────
const NOMENCLADOR = [
  { codigo: "1.01", concepto: "CONSULTA MEDICA" },
  { codigo: "1.01.1", concepto: "CONSULTA EN CAPAS" },
  { codigo: "1.04.1", concepto: "CONSULTA Y UNA PRACTICA" },
  { codigo: "1.03", concepto: "HASTA 3 PRACTICAS" },
  { codigo: "1.04", concepto: "ATENCION EN GUARDIA" },
  { codigo: "1.05", concepto: "ECO, RADIO, TOMO" },
  { codigo: "1.05.1", concepto: "ERGOMETRIA" },
  { codigo: "1.05.2", concepto: "MAMOGRAFIA, SENOGRAFIA" },
  { codigo: "1.06", concepto: "ECOGRAFIA" },
  { codigo: "1.07", concepto: "ATENCION DE URGENCIA EN GUARDIA" },
  { codigo: "4.01", concepto: "INTERNACION" },
  { codigo: "40.01", concepto: "LABORATORIO" },
];

const HOSPITAL = {
  nombre: 'San Cristóbal "Julio César Villanueva"',
  numero: "21.32.0557",
  refes: "10820912184192",
};

// Etiquetas legibles para los valores fijos que antes eran checkboxes
const LABELS = {
  tipoBeneficiario: {
    TITULAR: "TITULAR",
    "NO TITULAR": "NO TITULAR",
    ADHERENTE: "ADHERENTE",
  },
  parentesco: {
    CONYUGE: "CÓNYUGE",
    HIJO: "HIJO",
    OTRO: "OTRO",
  },
  sexo: {
    MASC: "MASCULINO",
    FEM: "FEMENINO",
  },
  tipoAtencion: {
    CONSULTA: "CONSULTA",
    PRACTICA: "PRÁCTICA",
    INTERNACION: "INTERNACIÓN",
  },
};

const STORAGE_KEY = "anexo2_planillas";

// ─── Historial ─────────────────────────────────────────────────
let historial = [];
function cargarHistorial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    historial = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(historial)) historial = [];
  } catch {
    historial = [];
  }
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
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function orDash(v) {
  const s = (v ?? "").toString().trim();
  return s === "" ? "—" : esc(s);
}
function pad2(n) {
  return String(n).padStart(2, "0");
}
function fmtFecha(iso) {
  if (!iso) return "";
  const p = iso.split("-");
  if (p.length !== 3) return "";
  return `${pad2(p[2])}/${pad2(p[1])}/${p[0]}`;
}
function fmtFechaDMY(dia, mes, anio) {
  if (!dia || !mes || !anio) return "";
  return `${pad2(dia)}/${pad2(mes)}/${anio}`;
}

// ─── Init selects ──────────────────────────────────────────────
const selectOS = document.getElementById("obraSocial");
const selectHPGD = document.getElementById("codigoHPGD");
const tbodyNom = document.getElementById("tbodyNomenclador");
const fieldOtro = document.getElementById("fieldHPGDotro");
const inputOtro = document.getElementById("codigoHPGDotro");
const inputEspec = document.getElementById("especialidad");

OBRAS.forEach((o) => {
  const opt = document.createElement("option");
  opt.value = o.id;
  opt.textContent = o.id + " — " + o.nombre;
  selectOS.appendChild(opt);
});
selectOS.addEventListener("change", () => {
  const o = OBRAS.find((x) => x.id === selectOS.value);
  document.getElementById("rnos").textContent = o.rnos ? "RNOS " + o.rnos : "";
});
selectOS.dispatchEvent(new Event("change"));

NOMENCLADOR.forEach((n) => {
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
    fieldOtro.classList.remove("hidden");
    inputEspec.value = "";
    inputOtro.focus();
  } else {
    fieldOtro.classList.add("hidden");
    inputOtro.value = "";
    const n = NOMENCLADOR.find((x) => x.codigo === val);
    inputEspec.value = n ? n.concepto : "";
  }
});

function toggleNomenclador() {
  document.getElementById("panelNomenclador").classList.toggle("hidden");
}
function scrollAResumen() {
  document
    .getElementById("panelResumen")
    .scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─── Leer formulario ───────────────────────────────────────────
function leerFormulario() {
  const fecha = document.getElementById("fecha").value;
  let dia = "",
    mes = "",
    anio = "";
  if (fecha) {
    const p = fecha.split("-");
    anio = Number(p[0]);
    mes = Number(p[1]);
    dia = Number(p[2]);
  }

  let codigoHPGD = selectHPGD.value;
  if (codigoHPGD === "__OTRO__") codigoHPGD = inputOtro.value.trim();

  return {
    obraSocialId: selectOS.value,
    nombre: document.getElementById("nombre").value.trim().toUpperCase(),
    dni: document.getElementById("dni").value.trim(),
    tipoBeneficiario: document.getElementById("tipoBeneficiario").value,
    parentesco: document.getElementById("parentesco").value,
    sexo: document.getElementById("sexo").value,
    edad: document.getElementById("edad").value.trim(),
    tipoAtencion: document.getElementById("tipoAtencion").value,
    codigoHPGD,
    especialidad: inputEspec.value.trim().toUpperCase(),
    cie10: document.getElementById("cie10").value.trim().toUpperCase(),
    dia,
    mes,
    anio,
    fechaOriginal: fecha,
    mesRecibo: document.getElementById("mesRecibo").value.trim(),
    anioRecibo: document.getElementById("anioRecibo").value.trim(),
    carnet: document.getElementById("carnet").value.trim(),
    fechaEmision: document.getElementById("fechaEmision").value,
    vencimiento: document.getElementById("vencimiento").value,
  };
}

// ─── Generar ──────────────────────────────────────────────────
function generar(e) {
  e.preventDefault();
  const datos = leerFormulario();
  agregarAlHistorial(datos);

  setTimeout(() => {
    const primera = document.querySelector("#contenedorPlanillas .planilla");
    if (!primera) {
      window.print();
      return;
    }
    document.body.classList.add("print-single");
    document
      .querySelectorAll(".planilla")
      .forEach((p) => p.classList.remove("print-target"));
    primera.classList.add("print-target");
    window.print();
    setTimeout(() => {
      document.body.classList.remove("print-single");
      document
        .querySelectorAll(".planilla")
        .forEach((p) => p.classList.remove("print-target"));
    }, 400);
  }, 150);

  limpiarCamposVariables();
}

function limpiarCamposVariables() {
  [
    "nombre",
    "dni",
    "edad",
    "especialidad",
    "cie10",
    "mesRecibo",
    "anioRecibo",
    "fecha",
    "codigoHPGDotro",
    "carnet",
    "fechaEmision",
    "vencimiento",
  ].forEach((id) => (document.getElementById(id).value = ""));
  [
    "tipoBeneficiario",
    "parentesco",
    "sexo",
    "tipoAtencion",
    "codigoHPGD",
  ].forEach((id) => (document.getElementById(id).value = ""));
  fieldOtro.classList.add("hidden");
}

function vaciarTodo() {
  document.getElementById("form").reset();
  fieldOtro.classList.add("hidden");
  selectOS.dispatchEvent(new Event("change"));
}

// ─── HTML de un campo (etiqueta arriba, valor abajo) ───────────
function campo(lab, val, extraClass) {
  return `
    <div class="anexo-field${extraClass ? " " + extraClass : ""}">
      <span class="lab">${esc(lab)}</span>
      <span class="val">${val}</span>
    </div>`;
}

// ─── HTML de la planilla (diseño tipo comprobante, como el PDF) ─
function htmlPlanilla(d, item) {
  const os = OBRAS.find((o) => o.id === d.obraSocialId) || {
    nombre: "",
    rnos: "",
  };
  const nom = NOMENCLADOR.find((n) => n.codigo === d.codigoHPGD);
  const concepto = nom ? nom.concepto : d.especialidad || "";

  const fechaAtencion = fmtFechaDMY(d.dia, d.mes, d.anio);
  const recibo =
    d.mesRecibo || d.anioRecibo
      ? `Mes ${d.mesRecibo || "—"} · Año ${d.anioRecibo || "—"}`
      : "—";

  return `
  <div class="planilla" data-id="${item ? item.id : ""}">
    ${
      item
        ? `
      <div class="planilla-acciones no-print">
        <button type="button" class="btn ghost" onclick="imprimirPlanilla(${item.id})">Imprimir PDF</button>
        <button type="button" class="btn danger" onclick="eliminarDelHistorial(${item.id})">Eliminar</button>
      </div>`
        : ""
    }

    <div class="anexo">
      <div class="anexo-header">
        <div class="anexo-header-left">
          <img src="santa fe.webp" alt="Santa Fe" class="anexo-logo" />
          <div>
            <h2 class="anexo-hospital">HOSPITAL SAN CRISTÓBAL</h2>
            <p class="anexo-sub">"Julio César Villanueva"</p>
            <p class="anexo-meta">Nº ${esc(HOSPITAL.numero)} · REFES ${esc(HOSPITAL.refes)}</p>
          </div>
        </div>
        <div class="anexo-header-right">
          <h3 class="anexo-titulo">ANEXO II</h3>
          <p class="anexo-sub2">
            Comprobante de atención<br />
            de beneficiarios de obras sociales
          </p>
        </div>
      </div>

      <div class="anexo-fecha-wrap">
        <div class="anexo-fecha-box">Fecha: ${fechaAtencion ? esc(fechaAtencion) : "—"}</div>
      </div>

      <hr class="anexo-hr" />

      <div class="anexo-section">
        <div class="anexo-section-title">DATOS DEL BENEFICIARIO</div>
        <div class="anexo-body">
          <div class="anexo-row cols-2">
            ${campo("APELLIDOS Y NOMBRES", orDash(d.nombre), "big")}
            ${campo("Nº DE DOCUMENTO", orDash(d.dni), "mono")}
          </div>
          <div class="anexo-row cols-4">
            ${campo("TIPO", d.tipoBeneficiario ? esc(LABELS.tipoBeneficiario[d.tipoBeneficiario]) : "—")}
            ${campo("PARENTESCO", d.parentesco ? esc(LABELS.parentesco[d.parentesco]) : "—")}
            ${campo("SEXO", d.sexo ? esc(LABELS.sexo[d.sexo]) : "—")}
            ${campo("EDAD", orDash(d.edad))}
          </div>
        </div>
      </div>

      <div class="anexo-section">
        <div class="anexo-section-title">DATOS DE LA ATENCIÓN</div>
        <div class="anexo-body">
          <div class="anexo-row cols-2">
            ${campo("TIPO DE ATENCIÓN", d.tipoAtencion ? esc(LABELS.tipoAtencion[d.tipoAtencion]) : "—")}
            ${campo("ESPECIALIDAD", orDash(d.especialidad))}
          </div>
          <div class="anexo-row cols-2">
            ${campo("CÓDIGO HPGD", orDash(d.codigoHPGD), "mono")}
            ${campo("CONCEPTO HPGD", concepto ? esc(concepto) : "—", "strong")}
          </div>
          <div class="anexo-row cols-2">
            ${campo("DIAGNÓSTICO CIE-10", orDash(d.cie10), "mono")}
            ${campo("ÚLTIMO RECIBO DE SUELDO", recibo)}
          </div>
        </div>
      </div>

      <div class="anexo-section">
        <div class="anexo-section-title">DATOS DE LA OBRA SOCIAL</div>
        <div class="anexo-body">
          <div class="anexo-row cols-2w">
            ${campo("NOMBRE COMPLETO", os.nombre ? esc(os.nombre) : "—", "strong")}
            ${campo("RNOS", orDash(os.rnos), "mono")}
          </div>
          <div class="anexo-row cols-3">
            ${campo("Nº DE CARNET", orDash(d.carnet))}
            ${campo("FECHA DE EMISIÓN", d.fechaEmision ? esc(fmtFecha(d.fechaEmision)) : "—")}
            ${campo("VENCIMIENTO", d.vencimiento ? esc(fmtFecha(d.vencimiento)) : "—")}
          </div>
        </div>
      </div>

      <div class="anexo-firmas">
        <div class="firma-col">
          <div class="firma-line"></div>
          <span class="firma-title">FIRMA DEL MÉDICO</span>
          <span class="firma-sub">Sello y Nº de matrícula</span>
        </div>
        <div class="firma-col">
          <div class="firma-line"></div>
          <span class="firma-title">RESPONSABLE ADMINISTRATIVO CONTABLE</span>
          <span class="firma-sub">Aclaración</span>
        </div>
        <div class="firma-col">
          <div class="firma-line"></div>
          <span class="firma-title">FIRMA DEL BENEFICIARIO</span>
          <span class="firma-sub">Aclaración</span>
        </div>
      </div>
    </div>
  </div>
  `;
}

// ─── Render ───────────────────────────────────────────────────
function renderPlanillas() {
  const cont = document.getElementById("contenedorPlanillas");
  const empty = document.getElementById("emptyResumen");
  document.getElementById("badgeCantidad").textContent = historial.length;

  if (historial.length === 0) {
    cont.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");
  cont.innerHTML = historial
    .map((item) => htmlPlanilla(item.datos, item))
    .join("");
}

// ─── Imprimir ─────────────────────────────────────────────────
function imprimirPlanilla(id) {
  const el = document.querySelector(`.planilla[data-id="${id}"]`);
  if (!el) return;
  document.body.classList.add("print-single");
  document
    .querySelectorAll(".planilla")
    .forEach((p) => p.classList.remove("print-target"));
  el.classList.add("print-target");
  window.print();
  setTimeout(() => {
    document.body.classList.remove("print-single");
    document
      .querySelectorAll(".planilla")
      .forEach((p) => p.classList.remove("print-target"));
  }, 400);
}

function imprimirTodas() {
  if (historial.length === 0) {
    alert("No hay planillas cargadas para imprimir.");
    return;
  }
  document.body.classList.remove("print-single");
  document
    .querySelectorAll(".planilla")
    .forEach((p) => p.classList.remove("print-target"));
  window.print();
}

// ─── Eliminar / borrar ────────────────────────────────────────
function eliminarDelHistorial(id) {
  if (!confirm("¿Eliminar esta planilla?")) return;
  historial = historial.filter((x) => x.id !== id);
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
  renderPlanillas();
});
