const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwK08hGnIQXWmwvIQQXX4WRCBla9m8_bWdYKkSAg8AtMTvqN9d9qO4H20HAONyss91T/exec";

let familyImages = [];
let kidMessages = [];

let workLogs =
  JSON.parse(localStorage.getItem("workLogs")) || [];

const workLogForm =
  document.getElementById("workLogForm");

const saveStatus =
  document.getElementById("saveStatus");

const searchInput =
  document.getElementById("searchInput");

const logResults =
  document.getElementById("logResults");

const pickMeUpBtn =
  document.getElementById("pickMeUpBtn");

const messageLabel =
  document.getElementById("messageLabel");

async function loadPickMeUpContent() {

  try {

    const response = await fetch(SCRIPT_URL);

    const data = await response.json();

    familyImages = data.images || [];

    kidMessages = data.audio || [];

  } catch (error) {

    console.error(error);
  }
}

function showRandomFamilyImage() {

  const familyImage =
    document.getElementById("familyImage");

  if (!familyImages.length) {
    return;
  }

  const randomIndex =
    Math.floor(Math.random() * familyImages.length);

  familyImage.src =
    familyImages[randomIndex].url;

  familyImage.style.display = "block";
}

pickMeUpBtn.addEventListener(
  "click",
  function () {

    showRandomFamilyImage();

    if (!kidMessages.length) {

      messageLabel.textContent =
        "No kid audio found.";

      return;
    }

    const randomIndex =
      Math.floor(Math.random() * kidMessages.length);

    const selectedMessage =
      kidMessages[randomIndex];

    playDriveAudio(selectedMessage);

    messageLabel.textContent =
      `Playing: ${selectedMessage.name}`;
  }
);

function playDriveAudio(selectedMessage) {

  let audioFrame =
    document.getElementById("driveAudioPlayer");

  if (!audioFrame) {

    audioFrame =
      document.createElement("iframe");

    audioFrame.id =
      "driveAudioPlayer";

    audioFrame.style.display =
      "none";

    document.body.appendChild(audioFrame);
  }

  audioFrame.src =
    selectedMessage.previewUrl;
}

function updateDashboard() {

  const activeLogs =
    workLogs.filter(log => log.isDeleted !== "Y");

  const uniqueProperties =
    [...new Set(activeLogs.map(log => log.propertyName))];

  const totalHours =
    activeLogs.reduce((sum, log) => {
      return sum + Number(log.hoursWorked || 0);
    }, 0);

  const followUps =
    activeLogs.filter(log => log.followUpNeeded === "Yes");

  document.getElementById("propertyCount").textContent =
    uniqueProperties.length;

  document.getElementById("hoursCount").textContent =
    totalHours.toFixed(1);

  document.getElementById("followUpCount").textContent =
    followUps.length;

  document.getElementById("todayLogs").textContent =
    activeLogs.length + " Logs";

  document.getElementById("openFollowUps").textContent =
    followUps.length + " Open";

  document.getElementById("activeProperties").textContent =
    uniqueProperties.length + " Properties";

  document.getElementById("weeklyHours").textContent =
    totalHours.toFixed(1) + " Hours";
}

function scrollToLogForm() {

  document
    .getElementById("logFormSection")
    .scrollIntoView({ behavior: "smooth" });
}

function startVoiceLog() {

  alert(
    "Future Feature: Voice-to-log AI processing."
  );
}

function brainDump() {

  const note = prompt(
    "Quick brain dump — what’s on your mind?"
  );

  if (!note) {
    return;
  }

  alert("Brain dump captured. Future AI processing coming soon.");
}

function continuePreviousWork() {

  if (!workLogs.length) {
    alert("No previous work logs yet.");
    return;
  }

  const latest =
    workLogs.find(log => log.isDeleted !== "Y");

  if (!latest) {
    return;
  }

  document.getElementById("propertyName").value =
    latest.propertyName;

  document.getElementById("issuesFound").value =
    latest.issuesFound;

  document.getElementById("materials").value =
    latest.materials;

  scrollToLogForm();
}

workLogForm.addEventListener(
  "submit",
  function (event) {

    event.preventDefault();

    const log = {

      logId: crypto.randomUUID(),

      date:
        document.getElementById("logDate").value,

      propertyName:
        document
          .getElementById("propertyName")
          .value
          .trim(),

      workCompleted:
        document
          .getElementById("workCompleted")
          .value
          .trim(),

      issuesFound:
        document
          .getElementById("issuesFound")
          .value
          .trim(),

      materials:
        document
          .getElementById("materials")
          .value
          .trim(),

      followUpNeeded:
        document
          .getElementById("followUpNeeded")
          .value,

      hoursWorked:
        document
          .getElementById("hoursWorked")
          .value,

      createdAt:
        new Date().toISOString(),

      isDeleted: "N",

      deletedAt: ""
    };

    workLogs.unshift(log);

    localStorage.setItem(
      "workLogs",
      JSON.stringify(workLogs)
    );

    saveToGoogleSheet(log);

    displayLogs(workLogs);

    updateDashboard();

    saveStatus.textContent =
      "Saved successfully.";

    workLogForm.reset();
  }
);

searchInput.addEventListener(
  "input",
  function () {

    const searchTerm =
      searchInput.value.toLowerCase();

    const filteredLogs =
      workLogs.filter(log => {

        const isActive =
          log.isDeleted !== "Y";

        return isActive && (

          log.date.toLowerCase().includes(searchTerm) ||

          log.propertyName.toLowerCase().includes(searchTerm) ||

          log.workCompleted.toLowerCase().includes(searchTerm) ||

          log.issuesFound.toLowerCase().includes(searchTerm) ||

          log.materials.toLowerCase().includes(searchTerm)
        );
      });

    displayLogs(filteredLogs);
  }
);

function displayLogs(logs) {

  logResults.innerHTML = "";

  const activeLogs =
    logs.filter(log => log.isDeleted !== "Y");

  if (!activeLogs.length) {

    logResults.innerHTML =
      "<p>No logs found.</p>";

    return;
  }

  activeLogs.forEach(log => {

    const logCard =
      document.createElement("div");

    logCard.className = "log-card";

    logCard.innerHTML = `
      <h3>${escapeHTML(log.propertyName)}</h3>

      <p><strong>Date:</strong>
      ${escapeHTML(log.date)}</p>

      <p><strong>Work:</strong>
      ${escapeHTML(log.workCompleted)}</p>

      <p><strong>Issues:</strong>
      ${escapeHTML(log.issuesFound || "None")}</p>

      <p><strong>Materials:</strong>
      ${escapeHTML(log.materials || "None")}</p>

      <p><strong>Hours:</strong>
      ${escapeHTML(log.hoursWorked || "0")}</p>

      <button
        class="delete-btn"
        onclick="softDeleteLog('${log.logId}')"
      >
        Delete
      </button>
    `;

    logResults.appendChild(logCard);
  });
}

function softDeleteLog(logId) {

  const confirmDelete =
    confirm("Soft delete this log?");

  if (!confirmDelete) {
    return;
  }

  workLogs = workLogs.map(log => {

    if (log.logId === logId) {

      return {

        ...log,

        isDeleted: "Y",

        deletedAt:
          new Date().toISOString()
      };
    }

    return log;
  });

  localStorage.setItem(
    "workLogs",
    JSON.stringify(workLogs)
  );

  displayLogs(workLogs);

  updateDashboard();
}

async function saveToGoogleSheet(log) {

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

    console.error(error);
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

loadPickMeUpContent();

updateDashboard();

displayLogs(workLogs);
