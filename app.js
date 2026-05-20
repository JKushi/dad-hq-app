const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxZ_Ia93DBaiPq_Kqiwos6loOWebF_z5JnTJStVjAhTs1q10VP7AA40FD6YKOaXIp8KTg/exec"; 
// Later we will paste your Google Apps Script web app URL here.

const kidMessages = [
  {
    name: "Message 1",
    file: "audio/message1.mp3"
  },
  {
    name: "Message 2",
    file: "audio/message2.mp3"
  },
  {
    name: "Message 3",
    file: "audio/message3.mp3"
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
    createdAt: new Date().toISOString()
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
    return (
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

  if (logs.length === 0) {
    logResults.innerHTML = "<p class='small-text'>No logs found yet.</p>";
    return;
  }

  logs.forEach(log => {
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
    `;

    logResults.appendChild(logCard);
  });
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
