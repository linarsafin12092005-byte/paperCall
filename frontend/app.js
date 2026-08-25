const API_URL = "/api/calls";

const form = document.getElementById("call-form");
const callsContainer = document.getElementById("calls");

async function loadCalls() {
    callsContainer.innerHTML = "Загрузка...";

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Не удалось загрузить звонки");
        }

        const calls = await response.json();

        if (calls.length === 0) {
            callsContainer.innerHTML = "<p>Звонков пока нет.</p>";
            return;
        }

        callsContainer.innerHTML = calls.map(call => `
            <div class="call-item">
                <div>
                    <strong>${call.phone}</strong>
                    <p>Оператор: ${call.operator || "Не назначен"}</p>
                    <p>Статус: ${call.status}</p>
                </div>

                <div class="actions">
                    <button onclick="editCall(${call.id})">
                        Изменить
                    </button>

                    <button onclick="deleteCall(${call.id})">
                        Удалить
                    </button>
                </div>
            </div>
        `).join("");

    } catch (error) {
        callsContainer.innerHTML =
            `<p>Ошибка загрузки: ${error.message}</p>`;
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const phone = document.getElementById("phone").value;
    const operator = document.getElementById("operator").value;
    const status = document.getElementById("status").value;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                phone,
                operator,
                status
            })
        });

        if (!response.ok) {
            throw new Error("Не удалось создать звонок");
        }

        form.reset();
        await loadCalls();

    } catch (error) {
        alert(error.message);
    }
});

async function deleteCall(id) {
    const confirmed = confirm("Удалить этот звонок?");

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Не удалось удалить звонок");
        }

        await loadCalls();

    } catch (error) {
        alert(error.message);
    }
}

async function editCall(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
            throw new Error("Звонок не найден");
        }

        const call = await response.json();

        const phone = prompt("Номер телефона:", call.phone);

        if (phone === null) {
            return;
        }

        const operator = prompt("Оператор:", call.operator || "");

        if (operator === null) {
            return;
        }

        const status = prompt(
            "Статус: NEW, IN_PROGRESS, COMPLETED, FAILED",
            call.status
        );

        if (status === null) {
            return;
        }

        const updateResponse = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                phone,
                operator,
                status
            })
        });

        if (!updateResponse.ok) {
            throw new Error("Не удалось обновить звонок");
        }

        await loadCalls();

    } catch (error) {
        alert(error.message);
    }
}

loadCalls();
