const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwK08hGnIQXWmwvIQQXX4WRCBla9m8_bWdYKkSAg8AtMTvqN9d9qO4H20HAONyss91T/exec";

const familyImages = [
  "assets/images/2BDVMC2X-102372.jpg",
  "assets/images/2BDVMC2X-102378.jpg",
  "assets/images/2QP4FYWZ-102372.jpg",
  "assets/images/2QP4FYWZ-102378.jpg",
  "assets/images/2QQYRQ86-102365.jpg"
];

const kidMessages = [
  {
    name: "Message 1",
    file: "assets/audio/message1.mp3"
  },
  {
    name: "Message 2",
    file: "assets/audio/message2.mp3"
  },
  {
    name: "Message 3",
    file: "assets/audio/message3.mp3"
  },
  {
    name: "Message 4",
    file: "assets/audio/message4.mp3"
  },
  {
    name: "Message 5",
    file: "assets/audio/message5.mp3"
  },
  {
    name: "Message 6",
    file: "assets/audio/message6.mp3"
  },
  {
    name: "Message 7",
    file: "assets/audio/message7.mp3"
  },
  {
    name: "Message 8",
    file: "assets/audio/message8.mp3"
  },
  {
    name: "Message 9",
    file: "assets/audio/message9.mp3"
  }
];
let workLogs = JSON.parse(localStorage.getItem("workLogs")) || [];

const workLogForm = document.getElementById("workLogForm");
const saveStatus = document.getElementById("saveStatus");
const searchInput = document.getElementById("searchInput");
const logResults = document.getElementById("logResults");
const pickMeUpBtn = document.getElementById("pickMeUpBtn");
const messageLabel = document.getElementById("messageLabel");
const logDate = document.getElementById("logDate");

if (logDate) {
  logDate.valueAsDate = new Date();
}

async function loadPickMeUpContent() {
  try {
    const response = await fetch(SCRIPT_URL);
    const data = await response.json();

    familyImages = data.images || [];
    kidMessages = data.audio || [];

    console.log("Loaded images:", familyImages);
    console.log("Loaded audio:", kidMessages);
  } catch (error) {
    console.error("Could not load Pick-Me-Up content:", error);

    if (messageLabel) {
      messageLabel.textContent =
        "Could not load family photos or audio.";
    }
  }
}

function showRandomFamilyImage() {
  const familyImage = document.getElementById("familyImage");

  if (!familyImage || !familyImages.length) {
    return;
  }

  const randomIndex =
    Math.floor(Math.random() * familyImages.length);

  familyImage.src =
    familyImages[randomIndex].url;

  familyImage.style.display =
    "block";
}

function playDriveAudio(selectedMessage) {
  let audioFrame =
    document.getElementById("driveAudioPlayer");

  if (!audioFrame) {
    audioFrame =
      document.createElement("iframe");

    audioFrame.id =
      "driveAudioPlayer";

    audioFrame.style.width =
      "1px";

    audioFrame.style.height =
      "1px";

    audioFrame.style.opacity =
      "0";

    audioFrame.style.position =
      "absolute";

    audioFrame.style.left =
      "-9999px";

    audioFrame.setAttribute(
      "allow",
      "autoplay"
    );

    document.body.appendChild(audioFrame);
  }

  if (!selectedMessage.previewUrl) {
    if (messageLabel) {
      messageLabel.textContent =
        "Audio preview link is missing. Redeploy Apps Script.";
    }

    return;
  }

  audioFrame.src =
    selectedMessage.previewUrl;
}

if (pickMeUpBtn) {
pickMeUpBtn.addEventListener("click", function () {

  const familyImage =
    document.getElementById("familyImage");

  const randomImage =
    familyImages[
      Math.floor(Math.random() * familyImages.length)
    ];

  familyImage.src = randomImage;

  familyImage.style.display = "block";

  const selectedMessage =
    kidMessages[
      Math.floor(Math.random() * kidMessages.length)
    ];

  const audio =
    new Audio(selectedMessage.file);

  audio.play();

  messageLabel.textContent =
    `Playing: ${selectedMessage.name}`;
});
}

function updateDashboard() {
  const activeLogs =
    workLogs.filter(log => log.isDeleted !== "Y");

  const uniqueProperties =
    [
      ...new Set(
        activeLogs
          .map(log => log.propertyName)
          .filter(Boolean)
      )
    ];

  const totalHours =
    activeLogs.reduce((sum, log) => {
      return sum + Number(log.hoursWorked || 0);
    }, 0);

  const followUps =
    activeLogs.filter(
      log => log.followUpNeeded === "Yes"
    );

  setText("propertyCount", uniqueProperties.length);
  setText("hoursCount", totalHours.toFixed(1));
  setText("followUpCount", followUps.length);
  setText("todayLogs", activeLogs.length + " Logs");
  setText("openFollowUps", followUps.length + " Open");
  setText("activeProperties", uniqueProperties.length + " Properties");
  setText("weeklyHours", totalHours.toFixed(1) + " Hours");
}

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

function scrollToLogForm() {
  const logFormSection =
    document.getElementById("logFormSection");

  if (logFormSection) {
    logFormSection.scrollIntoView({
      behavior: "smooth"
    });
  }
}

function startVoiceLog() {
  alert("Future Feature: Voice-to-log AI processing.");
}

function brainDump() {
  const note =
    prompt("Quick brain dump — what’s on your mind?");

  if (!note) {
    return;
  }

  const brainDumpEntry = {
    entryId: crypto.randomUUID(),
    dateCreated: new Date().toISOString(),
    rawThought: note,
    processed: "N",
    aiActioned: "N"
  };

  localStorage.setItem(
    "latestBrainDump",
    JSON.stringify(brainDumpEntry)
  );

  alert("Brain dump captured. Future AI processing coming soon.");
}

function continuePreviousWork() {
  const latest =
    workLogs.find(log => log.isDeleted !== "Y");

  if (!latest) {
    alert("No previous work logs yet.");
    return;
  }

  setValue("propertyName", latest.propertyName || "");
  setValue("issuesFound", latest.issuesFound || "");
  setValue("materials", latest.materials || "");

  scrollToLogForm();
}

function setValue(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.value = value;
  }
}

if (workLogForm) {
  workLogForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const log = {
      logId: crypto.randomUUID(),
      date: getValue("logDate"),
      propertyName: getValue("propertyName").trim(),
      workCompleted: getValue("workCompleted").trim(),
      issuesFound: getValue("issuesFound").trim(),
      materials: getValue("materials").trim(),
      followUpNeeded: getValue("followUpNeeded"),
      hoursWorked: getValue("hoursWorked"),
      createdAt: new Date().toISOString(),
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

    if (saveStatus) {
      saveStatus.textContent = "Saved successfully.";
    }

    workLogForm.reset();

    const logDateAfterReset =
      document.getElementById("logDate");

    if (logDateAfterReset) {
      logDateAfterReset.valueAsDate = new Date();
    }
  });
}

function getValue(id) {
  const element = document.getElementById(id);

  return element ? element.value : "";
}

if (searchInput) {
  searchInput.addEventListener("input", function () {
    const searchTerm =
      searchInput.value.toLowerCase();

    const filteredLogs =
      workLogs.filter(log => {
        const isActive =
          log.isDeleted !== "Y";

        return isActive && (
          String(log.date || "")
            .toLowerCase()
            .includes(searchTerm) ||
          String(log.propertyName || "")
            .toLowerCase()
            .includes(searchTerm) ||
          String(log.workCompleted || "")
            .toLowerCase()
            .includes(searchTerm) ||
          String(log.issuesFound || "")
            .toLowerCase()
            .includes(searchTerm) ||
          String(log.materials || "")
            .toLowerCase()
            .includes(searchTerm)
        );
      });

    displayLogs(filteredLogs);
  });
}

function displayLogs(logs) {
  if (!logResults) {
    return;
  }

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

    logCard.className =
      "log-card";

    logCard.innerHTML = `
      <h3>${escapeHTML(log.propertyName)}</h3>
      <p><strong>Date:</strong> ${escapeHTML(log.date)}</p>
      <p><strong>Work:</strong> ${escapeHTML(log.workCompleted)}</p>
      <p><strong>Issues:</strong> ${escapeHTML(log.issuesFound || "None")}</p>
      <p><strong>Materials:</strong> ${escapeHTML(log.materials || "None")}</p>
      <p><strong>Follow-Up Needed:</strong> ${escapeHTML(log.followUpNeeded || "No")}</p>
      <p><strong>Hours:</strong> ${escapeHTML(log.hoursWorked || "0")}</p>
      <button class="delete-btn" onclick="softDeleteLog('${log.logId}')">
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

  workLogs =
    workLogs.map(log => {
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
    console.error("Could not save log:", error);
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
