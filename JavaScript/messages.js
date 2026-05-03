document.addEventListener("DOMContentLoaded", () => {
    initUser();
    loadMessages();
});

async function initUser() {
    try {
        const res = await fetch('http://localhost:3000/me', {
            credentials: 'include'
        });

        const data = await res.json();

        if (!data.isAuth || !data.isAdmin) {
            alert('Доступ заборонено');
            window.location.href = 'index.html';
            return;
        }

        const userIcon = document.getElementById('userIcon');
        if (userIcon) {
            userIcon.src = 'data/user.png';
        }

    } catch (err) {
        alert('Помилка авторизації');
        window.location.href = 'index.html';
    }
}

async function loadMessages() {
    try {
        const res = await fetch('http://localhost:3000/get-messages', {
            credentials: 'include'
        });

        const messages = await res.json();

        renderMessages(messages);

    } catch (err) {
        console.error('Помилка завантаження повідомлень:', err);
    }
}

function renderMessages(messages) {
    const messagesList = document.getElementById('messagesList');
    messagesList.innerHTML = '';

    messages.forEach(msg => {
        messagesList.innerHTML += `
            <div class="message-row">
                <div class="message-cell">${msg.email}</div>
                <div class="message-cell">${msg.user_login}</div>
                <div class="message-cell message-preview" onclick="openPopup(\`${msg.message.replace(/`/g, "'")}\`)">
                    ${msg.message}
                </div>
            </div>
        `;
    });
}

function openPopup(fullMessage) {
    document.getElementById('popupText').textContent = fullMessage;
    document.getElementById('popupOverlay').style.display = 'flex';
}

function closePopup() {
    document.getElementById('popupOverlay').style.display = 'none';
}