// /initial-budget-calculator-by-departments/school-cafeteria-budget-calculator/app.js

// 숫자를 통화 형식으로
function cafFmtMoney(v) {
  if (isNaN(v) || !isFinite(v)) return "-";
  return v.toLocaleString("ko-KR") + "원";
}

window.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#itemTable tbody");
  const addRowBtn = document.getElementById("addRowBtn");
  const clearRowsBtn = document.getElementById("clearRowsBtn");
  const summaryBox = document.getElementById("summaryBox");
  const makeNoteBtn = document.getElementById("makeNoteBtn");
  const noteBox = document.getElementById("noteBox");

  if (!tableBody) return;

  // 기본 카테고리 목록
  const CATEGORY_OPTIONS = [
    { value: "위생소독", label: "위생·소독" },
    { value: "조리도구", label: "조리도구·소모품" },
    { value: "기구수선", label: "기구 교체·수선" },
    { value: "기타", label: "기타" }
  ];

  // 행 생성 함수
  function createRow(defaultCategory = "위생소독") {
    const tr = document.createElement("tr");

    const categoryTd = document.createElement("td");
    const select = document.createElement("select");
    select.className = "caf-input caf-category";
    CATEGORY_OPTIONS.forEach(opt => {
      const o = document.createElement("option");
      o.value = opt.value;
      o.textContent = opt.label;
      if (opt.value === defaultCategory) o.selected = true;
      select.appendChild(o);
    });
    categoryTd.appendChild(select);

    const nameTd = document.createElement("td");
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "예: 위생복, 위생장갑, 소독제 등";
    nameInput.className = "caf-input caf-name";
    nameTd.appendChild(nameInput);

    const unitTd = document.createElement("td");
    const unitInput = document.createElement("input");
    unitInput.type = "number";
    unitInput.min = "0";
    unitInput.step = "100";
    unitInput.className = "caf-input caf-unit";
    unitInput.placeholder = "단가";
    unitTd.appendChild(unitInput);

    const qtyTd = document.createElement("td");
    const qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.min = "0";
    qtyInput.step = "1";
    qtyInput.className = "caf-input caf-qty";
    qtyInput.placeholder = "수량";
    qtyTd.appendChild(qtyInput);

    const amountTd = document.createElement("td");
    amountTd.className = "caf-amount";
    amountTd.textContent = "-";

    const noteTd = document.createElement("td");
    const noteInput = document.createElement("input");
    noteInput.type = "text";
    noteInput.className = "caf-input caf-note";
    noteInput.placeholder = "비고";
    noteTd.appendChild(noteInput);

    const delTd = document.createElement("td");
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.textContent = "X";
    delBtn.className = "btn-ghost-small";
    delTd.appendChild(delBtn);

    tr.appendChild(categoryTd);
    tr.appendChild(nameTd);
    tr.appendChild(unitTd);
    tr.appendChild(qtyTd);
    tr.appendChild(amountTd);
    tr.appendChild(noteTd);
    tr.appendChild(delTd);

    // 이벤트 연결
    unitInput.addEventListener("input", updateAll);
    qtyInput.addEventListener("input", updateAll);
    select.addEventListener("change", updateAll);
    delBtn.addEventListener("click", () => {
      tr.remove();
      updateAll();
    });

    return tr;
  }

  // 요약/합계 다시 계산
  function updateAll() {
    const rows = tableBody.querySelectorAll("tr");

    // 카테고리별 합계 저장용
    const categorySum = {};
    const categoryLabelMap = {};
    CATEGORY_OPTIONS.forEach(opt => {
      categorySum[opt.value] = 0;
      categoryLabelMap[opt.value] = opt.label;
    });

    let grandTotal = 0;

    rows.forEach(tr => {
      const category = tr.querySelector(".caf-category")?.value || "기타";
      const unitVal = Number(tr.querySelector(".caf-unit")?.value || 0);
      const qtyVal = Number(tr.querySelector(".caf-qty")?.value || 0);
      const amount = unitVal * qtyVal;

      const amountTd = tr.querySelector(".caf-amount");
      if (amount > 0) {
        amountTd.textContent = cafFmtMoney(amount);
      } else {
        amountTd.textContent = "-";
      }

      if (!isNaN(amount) && amount > 0) {
        if (categorySum[category] == null) categorySum[category] = 0;
        categorySum[category] += amount;
        grandTotal += amount;
      }
    });

    // summaryBox 내용 갱신
    const lines = [];
    lines.push(`<p><b>카테고리별 소계</b></p>`);

    CATEGORY_OPTIONS.forEach(opt => {
      const sum = categorySum[opt.value];
      if (sum > 0) {
        lines.push(`<p>· ${opt.label}: <b>${cafFmtMoney(sum)}</b></p>`);
      } else {
        lines.push(`<p>· ${opt.label}: 0원</p>`);
      }
    });

    lines.push(`<hr>`);
    lines.push(`<p><b>총 소요 예산(비식품, 급식실 운영 관련)</b> = <b>${cafFmtMoney(grandTotal)}</b></p>`);

    summaryBox.innerHTML = lines.join("");
  }

  // 설명문 생성
  function makeNote() {
    const year = document.getElementById("year")?.value || "";
    const writer = document.getElementById("writer")?.value || "";

    const rows = tableBody.querySelectorAll("tr");
    const categorySum = {};
    const detailItems = [];

    CATEGORY_OPTIONS.forEach(opt => {
      categorySum[opt.value] = 0;
    });

    let grandTotal = 0;

    rows.forEach(tr => {
      const category = tr.querySelector(".caf-category")?.value || "기타";
      const name = (tr.querySelector(".caf-name")?.value || "").trim();
      const unitVal = Number(tr.querySelector(".caf-unit")?.value || 0);
      const qtyVal = Number(tr.querySelector(".caf-qty")?.value || 0);
      const note = (tr.querySelector(".caf-note")?.value || "").trim();
      const amount = unitVal * qtyVal;

      if (!name || amount <= 0) return;

      if (categorySum[category] == null) categorySum[category] = 0;
      categorySum[category] += amount;
      grandTotal += amount;

      detailItems.push({
        category,
        name,
        unitVal,
        qtyVal,
        amount,
        note
      });
    });

    if (detailItems.length === 0) {
      noteBox.innerHTML = `<p class="muted">입력된 항목이 없어 설명문을 생성할 수 없습니다. 표에 항목을 추가해 주세요.</p>`;
      return;
    }

    // 카테고리별 요약 문장
    const catLines = [];
    CATEGORY_OPTIONS.forEach(opt => {
      const sum = categorySum[opt.value];
      if (sum > 0) {
        catLines.push(`${opt.label} ${cafFmtMoney(sum)}`);
      }
    });

    const catSummaryText = catLines.join(", ");

    // 디테일 리스트: 항목 3~4개 정도까지는 그냥 다 보여줘도 됨
    const detailLines = detailItems.map(item => {
      const catLabel = CATEGORY_OPTIONS.find(o => o.value === item.category)?.label || item.category;
      const notePart = item.note ? `, 비고: ${item.note}` : "";
      return `- [${catLabel}] ${item.name}: 단가 ${cafFmtMoney(item.unitVal)} × ${item.qtyVal} = ${cafFmtMoney(item.amount)}${notePart}`;
    });

    const writerText = writer ? `(${writer} 작성)` : "";

    const html = `
      <p>
        ${year || ""}학년도 학교급식 운영을 위하여, 위생·소독·조리도구·기구수선 등 비식품 항목으로
        총 <b>${cafFmtMoney(grandTotal)}</b>을 편성하고자 합니다.${writerText}
      </p>
      <p>
        카테고리별 소요액은 다음과 같습니다.<br>
        ${catSummaryText || "※ 카테고리별 합계 없음"}
      </p>
      <p>
        세부 산출 내역은 아래와 같으며, 필요 시 첨부표로 제출합니다.
      </p>
      <div style="margin-top:8px;">
        ${detailLines.map(l => `<p>${l}</p>`).join("")}
      </div>
      <p class="muted" style="margin-top:8px;">
        ※ 위 금액은 연간 급식 운영계획 및 위생·안전 관리 계획에 따른 최소 소요액을 기준으로 산정한 것입니다.
      </p>
    `;

    noteBox.innerHTML = html;
  }

  // 초기 행 몇 개 깔아두기
  function initRows() {
    tableBody.innerHTML = "";
    tableBody.appendChild(createRow("위생소독"));
    tableBody.appendChild(createRow("조리도구"));
    tableBody.appendChild(createRow("기구수선"));
    updateAll();
  }

  addRowBtn?.addEventListener("click", () => {
    tableBody.appendChild(createRow());
    updateAll();
  });

  clearRowsBtn?.addEventListener("click", () => {
    if (!confirm("모든 행을 삭제하시겠습니까?")) return;
    initRows();
  });

  makeNoteBtn?.addEventListener("click", makeNote);

  // 최초 초기화
  initRows();
});
