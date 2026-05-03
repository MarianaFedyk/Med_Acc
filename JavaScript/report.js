document.addEventListener("DOMContentLoaded", () => {
    loadReport();
});

async function loadReport() {
    try {
        const res = await fetch('http://localhost:3000/report-data', {
            credentials: 'include'
        });

        const data = await res.json();

        renderCategories(data.report);
        renderStats(data.report, data.maxCategoryValue);
        document.getElementById('totalMedicines').textContent = `Всього - ${data.totalAllMedicines}`;
        document.getElementById('maxValueText').textContent = `${data.maxCategoryValue}`;

    } catch (err) {
        console.error('Помилка завантаження звіту:', err);
    }
}

function renderCategories(report) {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = '';

    report.forEach((category, index) => {
        let medicinesHTML = '';

        category.medicines.forEach((med, medIndex) => {
            medicinesHTML += `<p>${medIndex + 1}. ${med.name} - ${med.quantity}</p>`;
        });

        categoryList.innerHTML += `
            <div class="category-item">
                <div class="category-name" onclick="toggleMedicines(${index})">
                    ${index + 1}. ${category.categoryName} - ${category.totalQuantity}
                    <span class="arrow">▼</span>
                </div>

                <div class="medicine-list" id="medicineList${index}">
                    ${medicinesHTML}
                </div>
            </div>
        `;
    });
}

function toggleMedicines(index) {
    const block = document.getElementById(`medicineList${index}`);

    if (block.classList.contains('open')) {
        block.classList.remove('open');
    } else {
        block.classList.add('open');
    }
}

function renderStats(report, maxValue) {
    const chartBars = document.getElementById('chartBars');
    chartBars.innerHTML = '';

    report.forEach((category, index) => {
        const widthPercent = (category.totalQuantity / maxValue) * 100;

        chartBars.innerHTML += `
            <div class="bar-line">
                <div class="bar" style="width:${widthPercent}%"></div>
                <span>K${index + 1}</span>
            </div>
        `;
    });
}