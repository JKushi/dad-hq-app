const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxZ_Ia93DBaiPq_Kqiwos6loOWebF_z5JnTJStVjAhTs1q10VP7AA40FD6YKOaXIp8KTg/exec"; 
// Later we will paste your Google Apps Script web app URL here.

const kidMessages = [
  {
    name: "Kid Message 1",
    file: "message1.m4a"
  },
  {
    name: "Kid Message 2",
    file: "message 2.m4a"
  },
  {
    name: "Kid Message 3",
    file: "message 3.m4a"
  },
  {
    name: "Kid Message 4",
    file: "message 4.m4a"
  },
  {
    name: "Kid Message 5",
    file: "message 5.m4a"
  },
  {
    name: "Kid Message 6",
    file: "message6.m4a"
  },
  {
    name: "Kid Message 7",
    file: "message7.m4a"
  },
  {
    name: "Kid Message 8",
    file: "message8.m4a"
  },
  {
    name: "Kid Message 9",
    file: "message9.m4a"
  }
];

let workLogs = JSON.parse(localStorage.getItem("workLogs")) || [];

const workLogForm = document.getElementById("workLogForm");
const saveStatus = document.getElementById("saveStatus");
const searchInput = document.getElementById("searchInput");
const logResults = document.getElementById("logResults");
const pickMeUpBtn = document.getElementById("pickMeUpBtn");
const messageLabel = document.getElementById("messageLabel");

document.getElementById("logDate").valueAsDate = new Date();

workLogForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const log = {
    logId: crypto.randomUUID(),
    date: document.getElementById("logDate").value,
    propertyName: document.getElementById("propertyName").value.trim(),
    workCompleted: document.getElementById("workCompleted").value.trim(),
    issuesFound: document.getElementById("issuesFound").value.trim(),
    materials: document.getElementById("materials").value.trim(),
    followUpNeeded: document.getElementById("followUpNeeded").value,
    hoursWorked: document.getElementById("hoursWorked").value,
    createdAt: new Date().toISOString(),
    isDeleted: "N",
    deletedAt: ""
  };

  workLogs.unshift(log);
  localStorage.setItem("workLogs", JSON.stringify(workLogs));

  saveToGoogleSheet(log);

  saveStatus.textContent = "Saved! Dad’s notes are officially less chaotic.";
  workLogForm.reset();
  document.getElementById("logDate").valueAsDate = new Date();

  displayLogs(workLogs);
});

searchInput.addEventListener("input", function () {
  const searchTerm = searchInput.value.toLowerCase();

  const filteredLogs = workLogs.filter(log => {
  const isActive = log.isDeleted !== "Y";

  return isActive && (
    log.date.toLowerCase().includes(searchTerm) ||
    log.propertyName.toLowerCase().includes(searchTerm) ||
    log.workCompleted.toLowerCase().includes(searchTerm) ||
    log.issuesFound.toLowerCase().includes(searchTerm) ||
    log.materials.toLowerCase().includes(searchTerm) ||
    log.followUpNeeded.toLowerCase().includes(searchTerm)
  );
});

  displayLogs(filteredLogs);
});

pickMeUpBtn.addEventListener("click", function () {
  if (kidMessages.length === 0) {
    messageLabel.textContent = "No kid messages added yet.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * kidMessages.length);
  const selectedMessage = kidMessages[randomIndex];

  const audio = new Audio(selectedMessage.file);
  audio.play();

  messageLabel.textContent = `Playing: ${selectedMessage.name}`;
});

function displayLogs(logs) {
  logResults.innerHTML = "";

  const activeLogs = logs.filter(log => log.isDeleted !== "Y");

  if (activeLogs.length === 0) {
    logResults.innerHTML = "<p class='small-text'>No logs found yet.</p>";
    return;
  }

  activeLogs.forEach(log => {
    const logCard = document.createElement("div");
    logCard.className = "log-card";

    logCard.innerHTML = `
      <h3>${escapeHTML(log.propertyName)}</h3>
      <p><strong>Date:</strong> ${escapeHTML(log.date)}</p>
      <p><strong>Work Completed:</strong> ${escapeHTML(log.workCompleted)}</p>
      <p><strong>Issues Found:</strong> ${escapeHTML(log.issuesFound || "None")}</p>
      <p><strong>Materials:</strong> ${escapeHTML(log.materials || "None")}</p>
      <p><strong>Follow-Up Needed:</strong> ${escapeHTML(log.followUpNeeded)}</p>
      <p><strong>Hours:</strong> ${escapeHTML(log.hoursWorked || "Not entered")}</p>
      <button class="delete-btn" onclick="softDeleteLog('${log.logId}')">Delete</button>
    `;

    logResults.appendChild(logCard);
  });
}
function softDeleteLog(logId) {
  const confirmDelete = confirm("Soft delete this work log? It will be hidden but not permanently removed.");

  if (!confirmDelete) {
    return;
  }

  workLogs = workLogs.map(log => {
    if (log.logId === logId) {
      return {
        ...log,
        isDeleted: "Y",
        deletedAt: new Date().toISOString()
      };
    }

    return log;
  });

  localStorage.setItem("workLogs", JSON.stringify(workLogs));
  displayLogs(workLogs);
}


async function saveToGoogleSheet(log) {
  if (!SCRIPT_URL) {
    console.log("Google Sheets connection not set up yet.");
    return;
  }

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(log)
    });
  } catch (error) {
    console.error("Could not save to Google Sheet:", error);
  }
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

displayLogs(workLogs);
