const apiUrl = "http://localhost:5000/api/expenses";

let expNameEl = document.getElementById("expName");
let enameErrorMsgEl = document.getElementById("enameErrorMsg");
let amountEl = document.getElementById("amount");
let eamountErrorMsgEl = document.getElementById("eamountErrorMsg");
let categoryEl = document.getElementById("category");
let ecatErrorMsgEl = document.getElementById("ecatErrorMsg");
let dateEl = document.getElementById("date");
let edateErrorMsgEl = document.getElementById("edateErrorMsg");
let submitBtnEl = document.getElementById("submitBtn");
let errorMsgEl = document.getElementById("errorMsg");
let myFormEl = document.getElementById("myForm");
let nameListEl = document.getElementById("nameoutputDatabaseList");
let amountListEl = document.getElementById("amountoutputDatabaseList");
let categoryListEl = document.getElementById("categoryoutputDatabaseList");
let dateListEl = document.getElementById("dateoutputDatabaseList");
let actionListEl = document.getElementById("actionoutputDatabaseList");
let totalSpanEl = document.getElementById("totalSpan");
let filterCategorySelect = document.getElementById("categoryFilter");

let entries = [];
let editIndex = null;
let editId = null;

function resetForm() {
    expNameEl.value = "";
    amountEl.value = "";
    categoryEl.selectedIndex = 0;
    dateEl.value = "";
    editIndex = null;
    editId = null;
}

function validateInputs() {
    let valid = true;
    if (expNameEl.value === "") {
        enameErrorMsgEl.style.display = "block";
        valid = false;
    } else {
        enameErrorMsgEl.style.display = "none";
    }

    if (amountEl.value === "") {
        eamountErrorMsgEl.style.display = "block";
        valid = false;
    } else {
        eamountErrorMsgEl.style.display = "none";
    }

    if (categoryEl.value === "" || categoryEl.value === "select") {
        ecatErrorMsgEl.style.display = "block";
        valid = false;
    } else {
        ecatErrorMsgEl.style.display = "none";
    }

    if (dateEl.value === "") {
        edateErrorMsgEl.style.display = "block";
        valid = false;
    } else {
        edateErrorMsgEl.style.display = "none";
    }

    errorMsgEl.style.display = valid ? "none" : "block";
    errorMsgEl.textContent = valid ? "" : "Enter Proper Values!!";
    return valid;
}

function calculateTotal(filteredEntries) {
    const total = filteredEntries.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    totalSpanEl.textContent = total.toFixed(2);
}

function renderData() {
    nameListEl.textContent = "";
    amountListEl.textContent = "";
    categoryListEl.textContent = "";
    dateListEl.textContent = "";
    actionListEl.textContent = "";

    const selectedFilter = filterCategorySelect.value;
    const filtered = selectedFilter === "select"
        ? entries
        : entries.filter(e => e.category.toLowerCase() === selectedFilter.toLowerCase());

    for (let k = 0; k < filtered.length; k++) {
        const entry = filtered[k];

        addListItem(nameListEl, entry.expense_name);
        addListItem(amountListEl, entry.amount);
        addListItem(categoryListEl, entry.category);
        addListItem(dateListEl, entry.date);

        const btnDiv = document.createElement("div");
        btnDiv.className = "p-4 w-[210px] bg-[#faebe8] border border-black text-center";

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "px-4 mr-2 border";
        editBtn.onclick = () => {
            expNameEl.value = entry.expense_name;
            amountEl.value = entry.amount;
            categoryEl.value = entry.category;
            dateEl.value = entry.date;
            editId = entry.id;
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "px-4 border";
        deleteBtn.onclick = () => deleteExpense(entry.id);

        btnDiv.appendChild(editBtn);
        btnDiv.appendChild(deleteBtn);
        actionListEl.appendChild(btnDiv);
    }

    calculateTotal(filtered);
}

function addListItem(container, text) {
    const li = document.createElement("li");
    li.className = "w-[210px] font-bold text-center p-4 bg-[#faebe8] border border-black";
    li.textContent = text;
    const div = document.createElement("div");
    div.appendChild(li);
    container.appendChild(div);
}

async function fetchData() {
    try {
        const res = await fetch(apiUrl);
        entries = await res.json();
        renderData();
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

async function submitEvent(event) {
    event.preventDefault();
    if (!validateInputs()) return;

    const newEntry = {
        expense_name: expNameEl.value,
        amount: amountEl.value,
        category: categoryEl.value,
        date: dateEl.value
    };

    try {
        if (editId !== null) {
            await fetch(`${apiUrl}/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newEntry)
            });
        } else {
            await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newEntry)
            });
        }

        resetForm();
        fetchData();
    } catch (err) {
        console.error("Submit error:", err);
    }
}

async function deleteExpense(id) {
    try {
        await fetch(`${apiUrl}/${id}`, {
            method: "DELETE"
        });
        fetchData();
    } catch (err) {
        console.error("Delete error:", err);
    }
}

myFormEl.addEventListener("submit", submitEvent);
filterCategorySelect.addEventListener("change", renderData);
window.addEventListener("DOMContentLoaded", fetchData);
