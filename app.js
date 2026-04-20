const correctAnswers = [
  "B", "C", "E", "E", "B", "E", "D", "E", "A", "C",
  "B", "C", "D", "E", "C", "E", "E", "B", "E", "E",
  "C", "C", "E", "A", "E", "E", "E", "B", "A", "C"
];

const gradeTable = {
  0: 1.0, 1: 1.2, 2: 1.3, 3: 1.5, 4: 1.7, 5: 1.8,
  6: 2.0, 7: 2.2, 8: 2.3, 9: 2.5, 10: 2.7, 11: 2.8,
  12: 3.0, 13: 3.2, 14: 3.3, 15: 3.5, 16: 3.7, 17: 3.8,
  18: 4.0, 19: 4.3, 20: 4.5, 21: 4.8, 22: 5.0, 23: 5.3,
  24: 5.5, 25: 5.8, 26: 6.0, 27: 6.3, 28: 6.5, 29: 6.8, 30: 7.0
};

const STORAGE_KEY = "corrector_pruebas_ucn_registros";

let currentStudent = "";
let currentQuestion = 1;
let currentAnswers = Array(correctAnswers.length).fill("");
let currentEditId = null;

const stepStudent = document.getElementById("stepStudent");
const stepQuestion = document.getElementById("stepQuestion");
const stepResult = document.getElementById("stepResult");
const studentNameInput = document.getElementById("studentName");
const answerInput = document.getElementById("answerInput");
const questionPrompt = document.getElementById("questionPrompt");
const selectedAnswerText = document.getElementById("selectedAnswerText");
const progressBadge = document.getElementById("progressBadge");
const resultBox = document.getElementById("resultBox");
const recordsTableBody = document.getElementById("recordsTableBody");
const countBadge = document.getElementById("countBadge");
const avgGrade = document.getElementById("avgGrade");
const maxGrade = document.getElementById("maxGrade");
const minGrade = document.getElementById("minGrade");

const answerButtons = [...document.querySelectorAll(".answer-btn")];

document.getElementById("startBtn").addEventListener("click", startCorrection);
document.getElementById("nextBtn").addEventListener("click", nextQuestion);
document.getElementById("prevBtn").addEventListener("click", previousQuestion);
document.getElementById("newStudentBtn").addEventListener("click", resetCurrentFlow);
document.getElementById("viewRecordsBtn").addEventListener("click", () => {
  document.querySelector(".table-wrap").scrollIntoView({ behavior: "smooth" });
});
document.getElementById("exportBtn").addEventListener("click", exportToExcel);
document.getElementById("resetAllBtn").addEventListener("click", resetAllRecords);

answerButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentAnswers[currentQuestion - 1] = btn.dataset.answer;
    updateQuestionUI();
    answerInput.focus();
  });
});

document.addEventListener("keydown", (event) => {
  if (!stepQuestion.classList.contains("active")) return;

  const key = event.key.toUpperCase();
  if (["A", "B", "C", "D", "E"].includes(key)) {
    currentAnswers[currentQuestion - 1] = key;
    updateQuestionUI();
    event.preventDefault();
    return;
  }

  if (key === "ENTER") {
    if (document.activeElement === answerInput) {
      const valid = commitInputAnswer();
      if (!valid) return;
    }
    nextQuestion();
    event.preventDefault();
  }
});

answerInput.addEventListener("input", () => {
  answerInput.value = answerInput.value.toUpperCase().replace(/[^A-E]/g, "");
});

answerInput.addEventListener("blur", commitInputAnswer);

function commitInputAnswer() {
  const value = answerInput.value.trim().toUpperCase();
  if (!value) return false;
  if (!["A", "B", "C", "D", "E"].includes(value)) {
    alert("Ingrese solo una alternativa válida de A a E.");
    answerInput.value = "";
    answerInput.focus();
    return false;
  }
  currentAnswers[currentQuestion - 1] = value;
  updateQuestionUI();
  return true;
}

function showStep(step) {
  [stepStudent, stepQuestion, stepResult].forEach((el) => el.classList.remove("active"));
  step.classList.add("active");
}

function startCorrection() {
  const name = studentNameInput.value.trim();
  if (!name) {
    alert("Por favor, ingresa el nombre del alumno.");
    studentNameInput.focus();
    return;
  }
  currentStudent = name;
  currentQuestion = 1;
  currentAnswers = Array(correctAnswers.length).fill("");
  showStep(stepQuestion);
  updateQuestionUI();
  answerInput.focus();
}

function updateQuestionUI() {
  const editMode = currentEditId !== null ? " (editar registro)" : "";
  questionPrompt.textContent = `Inserte respuesta de la pregunta #${currentQuestion} de ${currentStudent}${editMode}`;
  progressBadge.textContent = `Paso ${currentQuestion + 1} de 31`;

  const currentValue = currentAnswers[currentQuestion - 1];
  selectedAnswerText.textContent = `Respuesta seleccionada: ${currentValue || "—"}`;
  answerInput.value = currentValue || "";

  answerButtons.forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.answer === currentValue);
  });
}

function nextQuestion() {
  if (!currentAnswers[currentQuestion - 1]) {
    alert(`Debes ingresar la respuesta de la pregunta #${currentQuestion}.`);
    return;
  }

  if (currentQuestion < correctAnswers.length) {
    currentQuestion += 1;
    updateQuestionUI();
    return;
  }

  finalizeStudent();
}

function previousQuestion() {
  if (currentQuestion > 1) {
    currentQuestion -= 1;
    updateQuestionUI();
  }
}

function finalizeStudent() {
  const mistakes = [];
  let score = 0;

  currentAnswers.forEach((answer, index) => {
    const correct = correctAnswers[index];
    if (answer === correct) {
      score += 1;
    } else {
      mistakes.push({
        pregunta: index + 1,
        marcada: answer,
        correcta: correct
      });
    }
  });

  const grade = gradeTable[score];
  const record = {
    id: currentEditId !== null ? currentEditId : Date.now(),
    alumno: currentStudent,
    puntaje: score,
    nota: grade,
    errores: mistakes.length,
    detalleErrores: mistakes,
    respuestasAlumno: [...currentAnswers],
    fecha: new Date().toLocaleString("es-CL")
  };

  saveRecord(record);
  renderResult(record);
  renderRecords();
  showStep(stepResult);
  progressBadge.textContent = "Resultado final";
}

function renderResult(record) {
  const mistakesHtml = record.detalleErrores.length
    ? `<ul class="error-list">${record.detalleErrores
        .map((e) => `<li>Pregunta ${e.pregunta}: marcó <strong>${e.marcada}</strong> y la correcta era <strong>${e.correcta}</strong>.</li>`)
        .join("")}</ul>`
    : `<p class="good"><strong>No tuvo errores.</strong></p>`;

  resultBox.innerHTML = `
    <div class="result-summary">
      <h3>Resultado de ${escapeHtml(record.alumno)}</h3>
      <div class="kpi-row">
        <div class="kpi"><strong>Puntaje:</strong> ${record.puntaje}/30</div>
        <div class="kpi"><strong>Nota:</strong> ${record.nota.toFixed(1)}</div>
        <div class="kpi"><strong>Errores:</strong> ${record.errores}</div>
      </div>
      <div>
        <strong>Detalle:</strong>
        ${mistakesHtml}
      </div>
    </div>
  `;
}

function getRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveRecord(record) {
  const records = getRecords();
  if (currentEditId !== null) {
    const index = records.findIndex((r) => r.id === currentEditId);
    if (index !== -1) {
      records[index] = record;
    } else {
      records.push(record);
    }
  } else {
    records.push(record);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  currentEditId = null;
}

function renderRecords() {
  const records = getRecords();
  countBadge.textContent = `${records.length} alumno${records.length === 1 ? "" : "s"}`;

  if (!records.length) {
    recordsTableBody.innerHTML = `<tr><td colspan="6" class="empty">Aún no hay alumnos corregidos.</td></tr>`;
    avgGrade.textContent = "—";
    maxGrade.textContent = "—";
    minGrade.textContent = "—";
    return;
  }

  const avg = records.reduce((acc, r) => acc + r.nota, 0) / records.length;
  const max = Math.max(...records.map((r) => r.nota));
  const min = Math.min(...records.map((r) => r.nota));

  avgGrade.textContent = avg.toFixed(1);
  maxGrade.textContent = max.toFixed(1);
  minGrade.textContent = min.toFixed(1);

  recordsTableBody.innerHTML = records
    .map((r, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${escapeHtml(r.alumno)}</td>
        <td>${r.puntaje}/30</td>
        <td>${r.nota.toFixed(1)}</td>
        <td class="${r.errores ? "bad" : "good"}">${r.errores}</td>
        <td>
          <button type="button" class="btn btn-secondary edit-record-btn" data-id="${r.id}">Editar</button>
        </td>
      </tr>
    `)
    .join("");

  recordsTableBody.querySelectorAll(".edit-record-btn").forEach((btn) => {
    btn.addEventListener("click", () => editRecord(Number(btn.dataset.id)));
  });
}

function exportToExcel() {
  const records = getRecords();
  if (!records.length) {
    alert("No hay registros para exportar.");
    return;
  }

  const summaryData = records.map((r, idx) => ({
    N: idx + 1,
    Alumno: r.alumno,
    Puntaje: r.puntaje,
    Nota: r.nota,
    Errores: r.errores,
    Fecha: r.fecha
  }));

  const detailData = [];
  records.forEach((r) => {
    if (!r.detalleErrores.length) {
      detailData.push({
        Alumno: r.alumno,
        Puntaje: r.puntaje,
        Nota: r.nota,
        Pregunta: "Sin errores",
        Marcada: "—",
        Correcta: "—",
        Fecha: r.fecha
      });
      return;
    }

    r.detalleErrores.forEach((e) => {
      detailData.push({
        Alumno: r.alumno,
        Puntaje: r.puntaje,
        Nota: r.nota,
        Pregunta: e.pregunta,
        Marcada: e.marcada,
        Correcta: e.correcta,
        Fecha: r.fecha
      });
    });
  });

  const answerData = [];
  records.forEach((r) => {
    r.respuestasAlumno.forEach((resp, idx) => {
      const respuesta = resp || "—";
      const esCorrecta = respuesta === correctAnswers[idx];
      answerData.push({
        Alumno: r.alumno,
        Puntaje: r.puntaje,
        Nota: r.nota,
        Fecha: r.fecha,
        Pregunta: idx + 1,
        Respuesta: respuesta,
        Correcta: correctAnswers[idx],
        "Respuesta correcta": esCorrecta ? "Si" : "No"
      });
    });
  });

  const wb = XLSX.utils.book_new();
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  const wsDetail = XLSX.utils.json_to_sheet(detailData);
  const wsAnswers = XLSX.utils.json_to_sheet(answerData);

  XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen");
  XLSX.utils.book_append_sheet(wb, wsDetail, "Detalle errores");
  XLSX.utils.book_append_sheet(wb, wsAnswers, "Respuestas completas");

  XLSX.writeFile(wb, "resultados_prueba_IDS.xlsx");
}

function resetCurrentFlow() {
  currentEditId = null;
  currentStudent = "";
  currentQuestion = 1;
  currentAnswers = Array(correctAnswers.length).fill("");
  studentNameInput.value = "";
  answerInput.value = "";
  progressBadge.textContent = "Paso 1 de 31";
  showStep(stepStudent);
}

function editRecord(id) {
  const record = getRecords().find((r) => r.id === id);
  if (!record) {
    alert("No se encontró el registro para editar.");
    return;
  }

  currentEditId = id;
  currentStudent = record.alumno;
  currentAnswers = [...record.respuestasAlumno];
  currentQuestion = 1;
  showStep(stepQuestion);
  updateQuestionUI();
  answerInput.focus();
}

function resetAllRecords() {
  const ok = confirm("¿Seguro que quieres borrar todos los registros guardados en este navegador?");
  if (!ok) return;
  localStorage.removeItem(STORAGE_KEY);
  renderRecords();
  resetCurrentFlow();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

renderRecords();
showStep(stepStudent);
