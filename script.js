document.addEventListener("DOMContentLoaded", function () {
    loadTasks();
    displayTasks(); // Ensure tasks are visible on reload
});

// Store tasks by day
let tasks = {};

// 🟢 Add Task to a Day
function addTask() {
    let subject = document.getElementById("subject").value.trim();
    let description = document.getElementById("description").value.trim();
    let day = document.getElementById("day").value;
    let priority = document.getElementById("priority").value;

    if (!subject || !description) {
        alert("Please enter subject and description.");
        return;
    }

    if (!tasks[day]) {
        tasks[day] = [];
    }
    tasks[day].push({ subject, description, priority });

    saveTasks();
    displayTasks(); // Refresh UI

    document.getElementById("subject").value = "";
    document.getElementById("description").value = "";
}

// 🟢 Display Tasks on Planner UI
function displayTasks() {
    let days = document.querySelectorAll(".day");
    days.forEach(dayDiv => {
        let day = dayDiv.getAttribute("data-day");
        let taskCount = tasks[day] ? tasks[day].length : 0;
        let taskButton = dayDiv.querySelector(".view-tasks-btn");

        if (taskButton) {
            taskButton.innerText = `📋 View Tasks (${taskCount})`;
        }
    });
}

// 🟢 Show Tasks When Clicking "View Tasks"
function viewTasks(day) {
    let modal = document.getElementById("viewTaskModal");
    let modalTitle = document.getElementById("viewModalTitle");
    let taskList = document.getElementById("taskList");

    modalTitle.innerText = `📋 Tasks for ${day}`;
    taskList.innerHTML = "";

    if (tasks[day] && tasks[day].length > 0) {
        tasks[day].forEach((task, index) => {
            let li = document.createElement("li");
            li.innerHTML = `
                <strong>${task.subject}</strong> - ${task.description}
                <button onclick="editTask('${day}', ${index}')">✏️</button>
                <button onclick="deleteTask('${day}', ${index}')">❌</button>
            `;
            taskList.appendChild(li);
        });
    } else {
        taskList.innerHTML = "<p>No tasks added.</p>";
    }

    modal.style.display = "flex";
}

// 🟢 Edit Task Function
function editTask(day, index) {
    let task = tasks[day][index];

    let newTitle = prompt("Edit Task Title:", task.subject);
    let newDesc = prompt("Edit Task Description:", task.description);

    if (newTitle && newDesc) {
        tasks[day][index].subject = newTitle;
        tasks[day][index].description = newDesc;
        saveTasks();
        viewTasks(day);
        displayTasks();
    }
}

// 🟢 Delete Task
function deleteTask(day, index) {
    tasks[day].splice(index, 1);
    saveTasks();
    viewTasks(day);
    displayTasks();
}

// 🟢 Close Task Modal
function closeTaskModal() {
    let modal = document.getElementById("viewTaskModal");
    modal.style.display = "none";
}

// 🟢 Save Tasks to Local Storage
function saveTasks() {
    localStorage.setItem("studyTasks", JSON.stringify(tasks));
}

// 🟢 Load Tasks from Local Storage
function loadTasks() {
    let storedData = localStorage.getItem("studyTasks");
    if (storedData) {
        tasks = JSON.parse(storedData);
    }
}

// 🟢 Export to PDF
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("📚 Study Planner Tasks", 10, 15);

    // Get tasks from localStorage
    let storedTasks = localStorage.getItem("studyTasks");
    if (!storedTasks || storedTasks === "{}") {
        alert("No tasks to export!");
        return;
    }

    let tasks = JSON.parse(storedTasks);
    let y = 30; // Starting Y position for text

    doc.setFontSize(12);
    Object.keys(tasks).forEach((day, dayIndex) => {
        if (y > 270) {  // Prevents overflow
            doc.addPage();
            y = 30;
        }

        doc.setFont("helvetica", "bold");
        doc.text(`📅 ${day}`, 10, y);
        y += 7;
        doc.setFont("helvetica", "normal");

        tasks[day].forEach((task, index) => {
            if (y > 270) {
                doc.addPage();
                y = 30;
            }

            doc.text(`${index + 1}. 📖 ${task.subject} - ${task.description}`, 10, y);
            doc.text(`⚡ Priority: ${task.priority}`, 10, y + 7);
            y += 15;
        });

        y += 10;
    });

    // Ensure the PDF file downloads
    doc.save("Study_Planner_Tasks.pdf");
}