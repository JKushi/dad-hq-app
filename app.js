const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzzitpd6nxKjuKHb8ptxLx7bIDzHyZljaXZMr_YGPfRF3OtBQ87tIIavRcyCRo35wqKjw/exec";

let familyImages = [];

const kidMessages = [
  {
    name: "Kid Message 1",
    file: "message1.mp3"
  },
  {
    name: "Kid Message 2",
    file: "message2.mp3"
  },
  {
    name: "Kid Message 3",
    file: "message3.mp3"
  },
  {
    name: "Kid Message 4",
    file: "message4.mp3"
  },
  {
    name: "Kid Message 5",
    file: "message5.mp3"
  },
  {
    name: "Kid Message 6",
    file: "message6.mp3"
  },
  {
    name: "Kid Message 7",
    file: "message7.mp3"
  },
  {
    name: "Kid Message 8",
    file: "message8.mp3"
  },
  {
    name: "Kid Message 9",
    file: "message9.mp3"
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

async function loadFamilyImages() {
  if (!SCRIPT_URL) {
    return;
  }

  try {
    const response = await fetch(SCRIPT_URL);

    familyImages = await response.json();

    console.log("Loaded family images:", familyImages);
  } catch (error) {
    console.error("Could not load family images:", error);
  }
}

function showRandomFamilyImage() {
  const familyImage = document.getElementById("familyImage");

  if (!familyImage) {
    console.error("familyImage element missing");
    return;
  }

  if (!familyImages || familyImages.length === 0) {
    messageLabel.textContent = "No family images found.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * familyImages.length);

  const selectedImage = familyImages[randomIndex];

  familyImage.src = selectedImage.url;

  familyImage.style.display = "block";

  console.log("Showing image:", selectedImage.url);
}

pickMeUpBtn.addEventListener("click", async function () {

  if (kidMessages.length === 0) {
    messageLabel.textContent = "No kid messages added yet.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * kidMessages.length);

  const selectedMessage = kidMessages[randomIndex];

  console.log("Attempting to play:", selectedMessage.file);

  const audio = new Audio(encodeURI(selectedMessage.file));

  audio.addEventListener("error", function () {
    console.error("Audio failed:", selectedMessage.file);

    messageLabel.textContent =
      `Could not play ${selectedMessage.file}`;
  });

  try {

    await audio.play();

    messageLabel.textContent =
      `Playing: ${selectedMessage.name}`;

  } catch (error) {

    console.error(error);

    messageLabel.textContent =
      `Audio blocked or missing: ${selectedMessage.file}`;
  }

  showRandomFamilyImage();
});

function displayLogs(logs) {

  logResults.innerHTML = "";

  const activeLogs = logs.filter(log => log.isDeleted !== "Y");

  if (activeLogs.length === 0) {
    logResults.innerHTML =
      "<p class='small-text'>No logs found yet.</p>";

    return;
  }

  activeLogs.forEach(log => {

    const logCard = document.createElement("div");

    logCard.className = "log-card";

    logCard.innerHTML = `
      <h3>${escapeHTML(log.propertyName)}</h3>

      <p><strong>Date:</strong>
      ${escapeHTML(log.date)}</p>

      <p><strong>Work Completed:</strong>
      ${escapeHTML(log.workCompleted)}</p>

      <p><strong>Issues Found:</strong>
      ${escapeHTML(log.issuesFound || "None")}</p>

      <p><strong>Materials:</strong>
      ${escapeHTML(log.materials || "None")}</p>

      <p><strong>Follow-Up Needed:</strong>
      ${escapeHTML(log.followUpNeeded)}</p>

      <p><strong>Hours:</strong>
      ${escapeHTML(log.hoursWorked || "Not entered")}</p>

      <button class="delete-btn"
      onclick="softDeleteLog('${log.logId}')">
      Delete
      </button>
    `;

    logResults.appendChild(logCard);
  });
}

function softDeleteLog(logId) {

  const confirmDelete = confirm(
    "Soft delete this work log?"
  );

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

  localStorage.setItem(
    "workLogs",
    JSON.stringify(workLogs)
  );

  displayLogs(workLogs);
}

async function saveToGoogleSheet(log) {

  if (!SCRIPT_URL) {
    console.log("Google Sheets connection not set up.");
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

    console.error(
      "Could not save to Google Sheet:",
      error
    );
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

loadFamilyImages();

displayLogs(workLogs);
