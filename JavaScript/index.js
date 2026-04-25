document.addEventListener("DOMContentLoaded", () => {
    initUser();
    updateClock();
    setInterval(updateClock, 1000);
});


async function initUser() {
    try {
        const res = await fetch('http://localhost:3000/me', {
            credentials: 'include'
        });

        const data = await res.json();

        if (data.isAuth) {
            const userIcon = document.getElementById('userIcon');
            if (userIcon) {
                userIcon.src = 'data/user.png';
            }
        }

        if (!data.isAdmin) {
            hideAdminBlocks();
        }

    } catch (err) {
        console.error('Помилка авторизації:', err);
        hideAdminBlocks(); 
    }
}

function hideAdminBlocks() {
    const redaction = document.querySelector('.block-redaction');
    const report = document.querySelector('.block-report');
    const lastActions = document.querySelector('.block-LastActions');

    if (redaction) redaction.style.display = 'none';
    if (report) report.style.display = 'none';
    if (lastActions) lastActions.style.display = 'none';
}


function updateClock() {
    const now = new Date();

    const time = now.toLocaleTimeString('uk-UA', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const year = now.getFullYear();

    const clockElement = document.getElementById('real-time-clock');

    if (clockElement) {
        clockElement.innerHTML = `${time} &nbsp; ${year}`;
    }
}