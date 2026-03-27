let stored = JSON.parse(localStorage.getItem("bookings")) || {};

let allBookings;

if (typeof stored !== "object" || stored === null) {
  console.warn("Invalid bookings format. Resetting...");
  stored = {};
  localStorage.setItem("bookings", JSON.stringify(stored));
}

// 🔥 HANDLE OLD FORMAT (array → object)
if (Array.isArray(stored)) {
  allBookings = {};

  stored.forEach(b => {
    if (!allBookings[b.user]) {
      allBookings[b.user] = [];
    }
    allBookings[b.user].push(b);
  });

  // Save corrected format
  localStorage.setItem("bookings", JSON.stringify(allBookings));
} else {
  allBookings = stored;
}

let userData = JSON.parse(localStorage.getItem("loggedInUser"));

// 🔒 STRICT PROTECTION (FIXED)
if (!userData || !userData.email) {
  window.location.href = "index.html";
}

let currentUser = userData.email;

// 👤 Per-user bookings
let bookings = allBookings[currentUser] || [];

let totalRooms = 5;
let myChart = null;

// ================= BOOK =================
function book() {
  if (bookings.length >= totalRooms) {
    alert("No rooms available!");
    return;
  }

  const input = document.getElementById("resource");
  const value = input.value.trim();

  if (!value) {
  alert("Enter a resource name");
  return;
}

  const booking = {
    name: value,
    user: currentUser,
    time: new Date().toLocaleString()
  };

  bookings.push(booking);

  // 🔥 SAVE PER USER
  allBookings[currentUser] = bookings;
  localStorage.setItem("bookings", JSON.stringify(allBookings));

  input.value = "";
  render();
}

// ================= DELETE =================
function deleteBooking(index) {
  bookings.splice(index, 1);

  allBookings[currentUser] = bookings;
  localStorage.setItem("bookings", JSON.stringify(allBookings));

  render();
}

// ================= RENDER =================
function render() {
  const userList = document.getElementById("user-list");
  const allList = document.getElementById("all-list");
  const total = document.getElementById("total");
  const usage = document.getElementById("usage");
  const available = document.getElementById("available");
  const welcome = document.getElementById("welcomeUser");

  userList.innerHTML = "";
  allList.innerHTML = "";

welcome.innerText = "👋 Hello, " + currentUser;

  // ✅ EMPTY STATE
  if (bookings.length === 0) {
    userList.innerHTML = "<p style='color:#94a3b8'>No bookings yet</p>";
  }

  bookings.forEach((b, index) => {
    let text = `
      <div>
        <strong>${b.name}</strong><br>
        <span class="booking-info">${b.user} • ${b.time}</span>
      </div>
      <button class="delete-btn" onclick="deleteBooking(${index})">Delete</button>
    `;

    let li1 = document.createElement("li");
    li1.innerHTML = text;
    userList.appendChild(li1);

    let li2 = document.createElement("li");
    li2.innerHTML = text;
    allList.appendChild(li2);
  });

  let usedRooms = bookings.length;
  if (usedRooms > totalRooms) usedRooms = totalRooms;

  let availableRooms = totalRooms - usedRooms;

  let usagePercent = Math.round((usedRooms / totalRooms) * 100);
  if (usagePercent > 100) usagePercent = 100;

  total.innerText = bookings.length;
  available.innerText = availableRooms;
  usage.innerText = usagePercent + "%";

  // 🔍 DEBUG (optional)
  // console.log("Current User:", currentUser);
  // console.log("All Bookings:", allBookings);
  // console.log("User Bookings:", bookings);

  updateChart();
}

// ================= CHART =================
function updateChart() {
  const ctx = document.getElementById("chart");

  let countMap = {};

  Object.values(allBookings).flat().forEach(b => {
  countMap[b.name] = (countMap[b.name] || 0) + 1;
});

  let labels = Object.keys(countMap);
  let data = Object.values(countMap);

  // ✅ FIX: Handle empty chart
  if (labels.length === 0) {
    labels = ["No Data"];
    data = [0];
  }

  if (myChart) {
    myChart.destroy();
  }

  myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Bookings per Resource",
        data: data
      }]
    },
    options: {
  responsive: true,
  interaction: {
  mode: 'index',
  intersect: false
},
  plugins: {
    legend: {
      labels: {
        color: "#cbd5f5"
      }
    }
  },
  scales: {
    x: {
      ticks: {
        color: "#94a3b8"
      },
      grid: {
        display: false
      }
    },
    y: {
      ticks: {
        color: "#94a3b8"
      },
      grid: {
        color: "rgba(255,255,255,0.05)"
      }
    }
  }
}
  });
}

// ================= NAV =================
function showSection(section, element) {
  document.getElementById("dashboard-section").style.display = "none";
  document.getElementById("bookings-section").style.display = "none";
  document.getElementById("settings-section").style.display = "none";

  document.getElementById(section + "-section").style.display = "block";

  document.querySelectorAll(".sidebar li").forEach(i => i.classList.remove("active"));
  element.classList.add("active");
}

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}

render();

// ================= SETTINGS =================

function checkStrength() {
  const pass = document.getElementById("newPassword").value;
  const text = document.getElementById("strengthText");

  if (pass.length < 6) {
    text.innerText = "Weak password";
    text.className = "strength-text strength-weak";
  } else if (pass.length < 10) {
    text.innerText = "Medium strength";
    text.className = "strength-text strength-medium";
  } else {
    text.innerText = "Strong password";
    text.className = "strength-text strength-strong";
  }
}

// Show email
document.getElementById("userEmail").innerText = currentUser;

// Change password
function changePassword() {
  const newPass = document.getElementById("newPassword").value;
  if (newPass.length < 6) {
  alert("Password must be at least 6 characters");
  return;
}

  const confirmPass = document.getElementById("confirmPassword").value;

if (!newPass || !confirmPass) {
  alert("Fill all fields");
  return;
}

if (newPass !== confirmPass) {
  alert("Passwords do not match");
  return;
}

if (newPass.length < 6) {
  alert("Password must be at least 6 characters");
  return;
}

  let users = JSON.parse(localStorage.getItem("users")) || [];

  users = users.map(u => {
    if (u.email === currentUser) {
      return { ...u, password: newPass };
    }
    return u;
  });
localStorage.setItem("users", JSON.stringify(users));

const msg = document.getElementById("passwordMsg");
msg.innerText = "Password updated successfully!";
msg.style.display = "block";

setTimeout(() => {
  msg.style.display = "none";
}, 2000);

document.getElementById("newPassword").value = "";
}

// Clear bookings
function clearBookings() {
  if (!confirm("Delete all your bookings?")) return;

  bookings = [];
  allBookings[currentUser] = bookings;
  localStorage.setItem("bookings", JSON.stringify(allBookings));

  render();
}