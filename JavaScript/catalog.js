const range = document.getElementById('priceRange');
const minPrice = document.getElementById('minPrice');
const productsContainer = document.getElementById('products');
const searchInput = document.getElementById('searchInput');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const categoriesContainer = document.getElementById('categories');
const maxPriceSpan = document.querySelector('.price-range span:last-child');

let visibleCount = 8;
const STEP = 4;

let allMedicines = [];
let activeCategory = null;
let filteredMedicines = [];

async function loadCategories() {
    try {
        const res = await fetch('http://localhost:3000/categories');
        const categories = await res.json();

        categoriesContainer.innerHTML = '';

        categories.forEach(cat => {
            const button = document.createElement('button');

            button.textContent = `+${cat.name}`;
            button.dataset.id = cat.id;

            categoriesContainer.appendChild(button);
        });

    } catch (err) {
        console.error('Помилка категорій:', err);
    }
}

categoriesContainer.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') return;

    const id = Number(e.target.dataset.id);

    document.querySelectorAll('.categories button').forEach(btn => {
        btn.classList.remove('active');
    });

    if (activeCategory === id) {
        activeCategory = null;
    } else {
        activeCategory = id;
        e.target.classList.add('active');
    }

    visibleCount = 8;
    applyFilters();
});

range.addEventListener('input', function () {
    minPrice.textContent = range.value;

    const value = (this.value - this.min) / (this.max - this.min) * 100;
    this.style.background = `linear-gradient(to right, #5BBCD9 ${value}%, #d9d9d9 ${value}%)`;

    applyFilters();
});

function renderProducts(items) {
    productsContainer.innerHTML = '';

    if (!items.length) {
        productsContainer.innerHTML = `<p>Нічого не знайдено</p>`;
        loadMoreBtn.style.display = "none";
        return;
    }

    const visibleItems = items.slice(0, visibleCount);

    visibleItems.forEach(medicine => {
        const card = document.createElement('div');
        card.classList.add('product');

        card.innerHTML = `
            <img src="${medicine.image}" alt="">
            <h3>${medicine.trade_name}</h3>
            <p>${medicine.price} грн</p>
        `;

        productsContainer.appendChild(card);
    });

    loadMoreBtn.style.display =
        visibleCount >= items.length ? "none" : "block";
}

loadMoreBtn.addEventListener('click', () => {
    visibleCount += STEP;
    renderProducts(filteredMedicines);
});


searchInput.addEventListener('input', () => {
    visibleCount = 8;
    applyFilters();
});

function applyFilters() {
    const maxPrice = Number(range.value);
    const searchValue = searchInput.value.toLowerCase().trim();

    filteredMedicines = allMedicines.filter(item => {
        const name = String(item.trade_name || "").toLowerCase();

        const matchesPrice = Number(item.price) <= maxPrice;
        const matchesSearch = name.includes(searchValue);

        return matchesPrice && matchesSearch;
    });

    if (activeCategory !== null) {
        filteredMedicines = filteredMedicines.filter(item =>
            Number(item.category_id) === activeCategory
        );
    }

    renderProducts(filteredMedicines);
}

async function loadMedicines() {
    try {
        const res = await fetch('http://localhost:3000/medicines');
        allMedicines = await res.json();

        if (!allMedicines.length) return;

        const maxPriceValue = Math.max(
            ...allMedicines.map(item => Number(item.price) || 0)
        );

        range.max = maxPriceValue;
        maxPriceSpan.textContent = maxPriceValue;

        range.value = maxPriceValue;
        minPrice.textContent = range.value;

        applyFilters();

    } catch (err) {
        console.error('Помилка товарів:', err);
    }
}

async function checkAuth() {
    try {
        const res = await fetch('http://localhost:3000/me', {
            credentials: 'include'
        });

        const data = await res.json();

        if (data.isAuth) {
            document.getElementById('userIcon').src = 'data/user.png';
        }

    } catch (err) {
        console.error('Auth error:', err);
    }
}

loadCategories();
loadMedicines();
checkAuth();