let isAuthorized = false;

document.addEventListener("DOMContentLoaded", () => {
    initUser();

    const form = document.getElementById('contactForm');
    form.addEventListener('submit', sendMessage);
});

async function initUser() {
    try {
        const res = await fetch('http://localhost:3000/me', {
            credentials: 'include'
        });

        const data = await res.json();

        if (data.isAuth) {
            isAuthorized = true;

            const userIcon = document.getElementById('userIcon');
            if (userIcon) {
                userIcon.src = 'data/user.png';
            }
        }

    } catch (err) {
        console.log('Користувач не авторизований');
    }
}

async function sendMessage(e) {
    e.preventDefault();

    if (!isAuthorized) {
        alert('Щоб надіслати повідомлення, потрібно увійти в акаунт');
        return;
    }

    const email = document.getElementById('emailInput').value.trim();
    const message = document.getElementById('messageInput').value.trim();

    if (!email || !message) {
        alert('Заповніть усі поля');
        return;
    }

    try {
        const res = await fetch('http://localhost:3000/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ email, message })
        });

        const data = await res.json();

        alert(data.message);

        document.getElementById('contactForm').reset();

    } catch (err) {
        alert('Помилка надсилання');
    }
}