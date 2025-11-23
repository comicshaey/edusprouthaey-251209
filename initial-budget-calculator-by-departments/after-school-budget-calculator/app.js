// /initial-budget-calculator-by-departments/after-school-budget-calculator/app.js

// 간단한 숫자 -> 통화 포맷 헬퍼
function fmtMoney(v) {
  if (isNaN(v) || !isFinite(v)) return "-";
  return v.toLocaleString("ko-KR") + "원";
}

// 소수 둘째 자리까지 고정
function fmtPercent(v) {
  if (isNaN(v) || !isFinite(v)) return "-";
  return v.toFixed(2) + "%";
}

window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("afterSchoolForm");
  const resultBox = document.getElementById("resultBox");
  const resetBtn = document.getElementById("resetBtn");

  if (!form || !resultBox) return;

  resetBtn?.addEventListener("click", () => {
    form.reset();
    resultBox.innerHTML = `<p class="muted">입력값을 초기화했습니다. 다시 값을 넣고 "예산 소요액 계산하기"를 눌러주세요.</p>`;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // 1. 기본 값 읽기
    const programType = document.getElementById("programType").value;
    const teacherType = document.getElementById("teacherType").value;

    const monthStart = Number(document.getElementById("monthStart").value);
    const monthEnd = Number(document.getElementById("monthEnd").value);
    const weeksPerMonth = Number(document.getElementById("weeksPerMonth").value);

    const sessionsPerWeek = Number(document.getElementById("sessionsPerWeek").value);
    const hoursPerSession = Number(document.getElementById("hoursPerSession").value);
    const hourlyRate = Number(document.getElementById("hourlyRate").value);

    const pensionRate = Number(document.getElementById("pensionRate").value || 0);
    const healthRate = Number(document.getElementById("healthRate").value || 0);
    const employmentRate = Number(document.getElementById("employmentRate").value || 0);
    const industryRate = Number(document.getElementById("industryRate").value || 0);
    const insuranceApply = document.getElementById("insuranceApply").value;
    const insuranceAdjust = Number(document.getElementById("insuranceAdjust").value || 0);

    const studentCount = Number(document.getElementById("studentCount").value || 0);
    const materialPerStudent = Number(document.getElementById("materialPerStudent").value || 0);
    const operationRate = Number(document.getElementById("operationRate").value || 0);

    // 2. 기본 검증
    const errors = [];

    if (!programType) errors.push("프로그램 구분을 선택해 주세요.");
    if (!teacherType) errors.push("강사 유형을 선택해 주세요.");

    if (!monthStart || !monthEnd) {
      errors.push("운영 시작월과 종료월을 모두 선택해 주세요.");
    } else if (monthEnd < monthStart) {
      errors.push("종료월이 시작월보다 빠를 수 없습니다.");
    }

    if (!weeksPerMonth || weeksPerMonth <= 0) {
      errors.push("월 기준 운영 주차를 0보다 크게 입력해 주세요.");
    }

    if (!sessionsPerWeek || sessionsPerWeek <= 0) {
      errors.push("주당 회기 수를 0보다 크게 입력해 주세요.");
    }

    if (!hoursPerSession || hoursPerSession <= 0) {
      errors.push("회당 시수를 0보다 크게 입력해 주세요.");
    }

    if (!hourlyRate || hourlyRate <= 0) {
      errors.push("강사 시급(단가)을 0보다 크게 입력해 주세요.");
    }

    if (errors.length > 0) {
      resultBox.innerHTML = `
        <div class="error">
          <p><b>입력값을 다시 확인해 주세요.</b></p>
          <ul>${errors.map(msg => `<li>${msg}</li>`).join("")}</ul>
        </div>
      `;
      return;
    }

    // 3. 운영 개월 수
    const monthCount = (monthEnd - monthStart) + 1;

    // 4. 총 회기 / 총 시수 계산
    //    총 회기 = 월수 × 주차 × 주당 회기수
    const totalSessions = monthCount * weeksPerMonth * sessionsPerWeek;
    const totalHours = totalSessions * hoursPerSession;

    // 5. 강사료 총액
    const teacherCost = totalHours * hourlyRate;

    // 6. 사회보험 요율 합산
    let totalRate = pensionRate + healthRate + employmentRate + industryRate;

    // 적용 범위에 따라 요율 보정
    if (insuranceApply === "none") {
      totalRate = 0;
    } else if (insuranceApply === "partial") {
      // 초단시간 등 부분 적용인 경우 대략 절반만 적용하는 식으로 단순화
      // 실제 업무에서는 여기서 직종·시간수 기준 세부 로직으로 확장 예정
      totalRate = totalRate * 0.5;
    }

    // 보험료 = 강사료 × (요율 합산 / 100)
    let insuranceCost = teacherCost * (totalRate / 100);
    insuranceCost += insuranceAdjust; // 보정값 반영

    // 7. 재료비
    // 재료비 = 학생 수 × 1인당 재료비
    const materialCost = studentCount > 0 && materialPerStudent > 0
      ? studentCount * materialPerStudent
      : 0;

    // 8. 운영비
    // 운영비 = 강사료 × (운영비 비율 / 100)
    const operationCost = operationRate > 0
      ? teacherCost * (operationRate / 100)
      : 0;

    // 9. 총액
    const totalCost = teacherCost + insuranceCost + materialCost + operationCost;

    // 10. 설명용 텍스트 구성
    const programLabelMap = {
      "select-paid": "선택형 교육(유료 방과후)",
      "select-free": "선택형 교육(무료 방과후)",
      "custom-edu": "맞춤형 교육 프로그램",
      "select-care": "선택형 돌봄 프로그램"
    };

    const teacherLabelMap = {
      "custom": "맞춤형 강사",
      "select-paid": "선택형 유료 강사",
      "select-free": "선택형 무료 강사"
    };

    const programLabel = programLabelMap[programType] || programType;
    const teacherLabel = teacherLabelMap[teacherType] || teacherType;

    const lines = [];

    lines.push(`<b>① 기본 정보</b>`);
    lines.push(`· 프로그램 유형: ${programLabel}`);
    lines.push(`· 강사 유형: ${teacherLabel}`);
    lines.push(`· 운영 기간: ${monthStart}월 ~ ${monthEnd}월 (총 ${monthCount}개월, 월 ${weeksPerMonth}주 기준)`);

    lines.push(`<br><b>② 강사료 산출</b>`);
    lines.push(`· 총 회기수 = ${monthCount}개월 × ${weeksPerMonth}주 × 주 ${sessionsPerWeek}회 = <b>${totalSessions.toFixed(1)}회</b>`);
    lines.push(`· 총 시수 = 총 회기수 × 회당 ${hoursPerSession}시간 = <b>${totalHours.toFixed(1)}시간</b>`);
    lines.push(`· 강사료 = 총 시수 × 시급 ${fmtMoney(hourlyRate)} = <b>${fmtMoney(teacherCost)}</b>`);

    lines.push(`<br><b>③ 사회보험 기관부담금</b>`);
    if (insuranceApply === "none") {
      lines.push(`· 사회보험 미적용으로 산정하지 않음.`);
    } else {
      lines.push(`· 적용 요율(대략) = ${fmtPercent(totalRate)} (보정 전)`);
      if (insuranceAdjust !== 0) {
        lines.push(`· 보험료 보정: ${insuranceAdjust >= 0 ? "+" : ""}${fmtMoney(insuranceAdjust)}`);
      }
      lines.push(`· 사회보험 기관부담금(대략) = 강사료 × 요율 = <b>${fmtMoney(insuranceCost)}</b>`);
    }

    lines.push(`<br><b>④ 재료비 · 운영비</b>`);
    if (materialCost > 0) {
      lines.push(`· 재료비 = 학생 ${studentCount}명 × 1인당 ${fmtMoney(materialPerStudent)} = <b>${fmtMoney(materialCost)}</b>`);
    } else {
      lines.push(`· 재료비: 입력값 없음 또는 0원으로 간주.`);
    }

    if (operationCost > 0) {
      lines.push(`· 운영비 = 강사료 × ${fmtPercent(operationRate)} = <b>${fmtMoney(operationCost)}</b>`);
    } else {
      lines.push(`· 운영비: 비율 0%로 산정(미편성).`);
    }

    lines.push(`<br><b>⑤ 총 소요 예산</b>`);
    lines.push(`· 총액 = 강사료 + 사회보험 + 재료비 + 운영비`);
    lines.push(`· 총액 = ${fmtMoney(teacherCost)} + ${fmtMoney(insuranceCost)} + ${fmtMoney(materialCost)} + ${fmtMoney(operationCost)}`);
    lines.push(`<br><b>⇒ 최종 소요예산(편성 권장액): ${fmtMoney(totalCost)}</b>`);

    resultBox.innerHTML = `
      <div>
        <p class="muted">아래 내용을 세출예산요구서 산출식란에 참고하여 기재하면 됩니다.</p>
        <div class="calc-result">
          ${lines.map(l => `<p>${l}</p>`).join("")}
        </div>
      </div>
    `;
  });
});
