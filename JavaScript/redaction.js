const searchBtn = document.querySelector('.search button');
const searchInput = document.querySelector('.inputMed');
const saveBtn = document.querySelector('.save');
const deleteBtn = document.querySelector('.delete');

let currentMedicine = null;


searchBtn?.addEventListener('click', async () => {
    const name = searchInput.value.trim();
    if (!name) return;

    try {
        const res = await fetch('http://localhost:3000/medicines');
        const medicines = await res.json();

        const medicine = medicines.find(m =>
            m.trade_name?.toLowerCase().trim() === name.toLowerCase().trim()
        );

        if (!medicine) {
            alert("Не знайдено");
            return;
        }

        currentMedicine = medicine; 
        fillForm(medicine);

    } catch (err) {
        console.error(err);
        alert("Помилка сервера");
    }
});

function fillForm(m) {
    document.getElementById('categorySelect').value = String(m.category_id);
    document.getElementById('active_substances').value = m.active_substances || "";
    document.getElementById('form').value = m.form || "";
    document.getElementById('dosage').value = m.dosage || "";
    document.getElementById('pack_quantity').value = m.pack_quantity || "";
    document.getElementById('stock_quantity').value = m.stock_quantity || "";
    document.getElementById('trade_name').value = m.trade_name || "";
    document.getElementById('price').value = m.price || "";
    document.getElementById('indications').value = m.indications || "";

    updatePhotoBlock(m.image);
}


saveBtn?.addEventListener('click', async () => {
    if (!currentMedicine) {
        alert("Спочатку знайди товар");
        return;
    }

    try {
        const updated = getFormData();

        const res = await fetch(`http://localhost:3000/medicine/${currentMedicine.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(updated)
        });

        const result = await res.json();
        alert(result.message);

    } catch (err) {
        console.error(err);
        alert("Помилка при збереженні");
    }
});


deleteBtn?.addEventListener('click', async () => {
    if (!currentMedicine) {
        alert("Спочатку знайди товар");
        return;
    }

    try {
        const res = await fetch(`http://localhost:3000/medicine/${currentMedicine.id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const result = await res.json();
        alert(result.message);

        currentMedicine = null;
        resetForm();

    } catch (err) {
        console.error(err);
        alert("Помилка при видаленні");
    }
});


function getFormData() {
    return {
        image: document.getElementById('preview')?.src || "",
        category_id: Number(document.getElementById('categorySelect').value) || 0,
        active_substances: document.getElementById('active_substances').value,
        form: document.getElementById('form').value,
        dosage: document.getElementById('dosage').value,
        pack_quantity: document.getElementById('pack_quantity').value,
        stock_quantity: document.getElementById('stock_quantity').value,
        trade_name: document.getElementById('trade_name').value,
        price: Number(document.getElementById('price').value) || 0,
        indications: document.getElementById('indications').value
    };
}


document.addEventListener("DOMContentLoaded", () => {
    const elements = {
        photoBlock: document.getElementById('photoBlock'),
        popup: document.getElementById('popup'),
        closeBtn: document.getElementById('closePopup'),
        saveBtn: document.getElementById('saveImg'),
        imgInput: document.getElementById('imgInput'),
        preview: document.getElementById('preview'),
        text: document.querySelector('#photoBlock span'),
        addBtn: document.querySelector('.add'),
        categorySelect: document.getElementById('categorySelect')
    };

    initPopup(elements);
    initImagePreview(elements);
    loadCategories(elements.categorySelect);
    initAddMedicine(elements);
});


function updatePhotoBlock(imageUrl) {
    const preview = document.getElementById('preview');
    const text = document.querySelector('#photoBlock span');

    if (!imageUrl) return resetImage(preview, text);

    preview.src = imageUrl;
    preview.style.display = 'block';
    if (text) text.style.display = 'none';
}

function initPopup({ photoBlock, popup, closeBtn, saveBtn, imgInput }) {
    photoBlock?.addEventListener('click', () => popup?.classList.add('active'));
    closeBtn?.addEventListener('click', () => popup?.classList.remove('active'));

    saveBtn?.addEventListener('click', () => {
        const url = imgInput.value.trim();
        if (!url) return;

        updatePhotoBlock(url);
        popup.classList.remove('active');
    });
}

function initImagePreview({ preview, text }) {
    if (!preview) return;

    preview.onerror = () => {
    if (preview.src) {
        resetImage(preview, text);
    }
};
}

function resetImage(preview, text) {
    preview.src = "";
    preview.style.display = "none";
    if (text) text.style.display = "block";
}


async function loadCategories(select) {
    try {
        const res = await fetch('http://localhost:3000/categories');
        const categories = await res.json();

        select.innerHTML = '<option value="">Оберіть категорію</option>';

        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = String(cat.id);
            option.textContent = cat.name;
            select.appendChild(option);
        });

    } catch (err) {
        console.error(err);
    }
}


function initAddMedicine({ addBtn, preview, text }) {
    addBtn?.addEventListener('click', async () => {
        const medicineData = getFormData();

        try {
            const res = await fetch('http://localhost:3000/add-medicine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(medicineData)
            });

            const result = await res.json();

            if (res.ok) {
                alert('Успішно додано!');
                resetForm();
                resetImage(preview, text);
            } else {
                alert(result.message);
            }

        } catch (error) {
            console.error(error);
            alert('Сервер недоступний');
        }
    });
}


function resetForm() {
    document.querySelectorAll('input').forEach(i => i.value = '');
    document.getElementById("indications").value = '';

    const preview = document.getElementById('preview');
    const text = document.querySelector('#photoBlock span');
    resetImage(preview, text);
}