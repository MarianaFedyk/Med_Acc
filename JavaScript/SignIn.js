const form = document.getElementById("registerForm");

form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const loginInput = document.getElementById("login");
    const passwordInput = document.getElementById("password");

    const login = loginInput.value.trim();
    const password = passwordInput.value.trim();

    if (!login || !password) {
        alert("Заповни всі поля");
        return;
    }

    try {
        const res = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include", 
            body: JSON.stringify({ login, password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Помилка реєстрації");
            return;
        }

        alert(data.message);

        loginInput.value = "";
        passwordInput.value = "";

    } catch (err) {
        console.error(err);
        alert("Сервер недоступний");
    }
});