// ===== LOGIN PAGE =====
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    if (email) {
      localStorage.setItem("userEmail", email);
      window.location.href = "role.html";
    }
  });
}

// ===== ROLE SELECTION =====
function selectRole(role) {
  localStorage.setItem("userRole", role);
  window.location.href = "dashboard.html";
}

// ===== UPLOAD PAGE =====
const uploadMaterialBtn = document.getElementById("uploadMaterialBtn");
const uploadVideoBtn = document.getElementById("uploadVideoBtn");
const uploadForm = document.getElementById("uploadForm");
const uploadMessage = document.getElementById("uploadMessage");

if (uploadMaterialBtn) {
  uploadMaterialBtn.addEventListener("click", () => {
    uploadForm.classList.remove("hidden");
    uploadMessage.textContent = "";
  });
}

if (uploadVideoBtn) {
  uploadVideoBtn.addEventListener("click", () => {
    alert("Video upload feature coming soon!");
  });
}

if (uploadForm) {
  uploadForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fileInput = document.getElementById("fileInput");
    const fileTitle = document.getElementById("fileTitle").value.trim();

    if (fileInput.files.length === 0) {
      uploadMessage.textContent = "⚠ Please select a file.";
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
      const fileData = {
        title: fileTitle,
        name: file.name,
        type: file.type,
        content: event.target.result,
      };

      const existingFiles = JSON.parse(localStorage.getItem("uploadedFiles")) || [];
      existingFiles.push(fileData);
      localStorage.setItem("uploadedFiles", JSON.stringify(existingFiles));

      uploadMessage.textContent = "✅ File uploaded successfully!";
      uploadMessage.style.color = "green";
      uploadForm.reset();
      uploadForm.classList.add("hidden");
    };

    reader.readAsDataURL(file);
  });
}

// ===== SEARCH PAGE =====
function searchFile() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const resultContainer = document.getElementById("resultContainer");
  resultContainer.innerHTML = "";

  const files = JSON.parse(localStorage.getItem("uploadedFiles")) || [];
  const matchedFiles = files.filter((file) => file.title.toLowerCase().includes(query));

  if (matchedFiles.length === 0) {
    resultContainer.innerHTML = "<p>No files found.</p>";
    return;
  }

  matchedFiles.forEach((file) => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <h3>${file.title}</h3>
      <p>${file.name}</p>
      <a href="${file.content}" target="_blank" class="primary-btn">📖 View (Read Only)</a>
    `;

    resultContainer.appendChild(card);
  });
}