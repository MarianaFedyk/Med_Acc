const form = document.getElementById('loginForm');

form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const loginInput = document.getElementById('login');
    const passwordInput = document.getElementById('password');
    const errorBox = document.getElementById('error');

    const login = loginInput.value.trim();
    const password = passwordInput.value.trim();

    errorBox.textContent = "";

    if (!login || !password) {
        errorBox.textContent = "Заповни всі поля";
        return;
    }

    try {
        const res = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', 
            body: JSON.stringify({ login, password })
        });

        const data = await res.json();

        if (!res.ok) {
            errorBox.textContent = data.message || "Помилка входу";
            return;
        }

        localStorage.setItem('isAdmin', data.isAdmin);
        localStorage.setItem('userLogin', data.login);

        window.location.href = 'index.html';

    } catch (err) {
        console.error(err);
        errorBox.textContent = "Сервер недоступний";
    }
});