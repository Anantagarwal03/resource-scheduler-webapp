// ===== STATE =====
let stored = JSON.parse(localStorage.getItem("bookings")) || {};
let allBookings;

if (typeof stored !== "object" || stored === null) {
  stored = {};
  localStorage.setItem("bookings", JSON.stringify(stored));
}

// Convert old format (array → object)
if (Array.isArray(stored)) {
  allBookings = {};
  stored.forEach(b => {
    if (!allBookings[b.user]) {
      allBookings[b.user] = [];
    }
    allBookings[b.user].push(b);
  });
  localStorage.setItem("bookings", JSON.stringify(allBookings));
} else {
  allBookings = stored;
}

let userData = JSON.parse(localStorage.getItem("loggedInUser"));

if (!userData || !userData.email) {
  window.location.href = "index.html";
}

let currentUser = userData.email;
let bookings = allBookings[currentUser] || [];

let totalRooms = 5;
let myChart = null;


// ===== ACTIONS =====

// BOOK
function book() {
  const btn = document.getElementById("bookBtn");

  let totalUsed = Object.values(allBookings).flat().length;

  if (totalUsed >= totalRooms) {
    alert("No rooms available!");
    return;
  }

  const input = document.getElementById("resource");
  const value = input.value.trim();

  if (value.length < 2) {
    alert("Enter valid resource");
    return;
  }

  // UX feedback
  btn.innerText = "Booking...";
  btn.disabled = true;

  setTimeout(() => {
    const booking = {
      name: value,
      user: currentUser,
      time: new Date().toLocaleString()
    };

    bookings.push(booking);
    allBookings[currentUser] = bookings;

    localStorage.setItem("bookings", JSON.stringify(allBookings));

    input.value = "";

    btn.innerText = "Book";
    btn.disabled = false;

    render();
  }, 300);
}


// DELETE
function deleteBooking(index) {
  if (!confirm("Delete this booking?")) return;

  if (index < 0 || index >= bookings.length) return;

  bookings.splice(index, 1);

  allBookings[currentUser] = bookings;
  localStorage.setItem("bookings", JSON.stringify(allBookings));

  render();
}


// ===== RENDER =====
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

  // USER BOOKINGS
  if (bookings.length === 0) {
    userList.innerHTML = "<p style='color:#94a3b8'>No bookings yet</p>";
  }

  bookings.forEach((b, index) => {
    let li = document.createElement("li");

    li.innerHTML = `
      <div>
        <strong>${b.name}</strong><br>
        <span class="booking-info">${b.user} • ${b.time}</span>
      </div>
      <button class="delete-btn">Delete</button>
    `;

    // attach delete event (no inline JS)
    li.querySelector("button").addEventListener("click", () => {
      deleteBooking(index);
    });

    userList.appendChild(li);
  });

  // ALL BOOKINGS
  Object.values(allBookings).flat().forEach((b) => {
    let li = document.createElement("li");

    li.innerHTML = `
      <div>
        <strong>${b.name}</strong><br>
        <span class="booking-info">${b.user} • ${b.time}</span>
      </div>
    `;

    allList.appendChild(li);
  });

  // STATS (GLOBAL, not per-user)
  let totalUsed = Object.values(allBookings).flat().length;
  let availableRooms = totalRooms - totalUsed;
  if (availableRooms < 0) availableRooms = 0;

  let usagePercent = Math.round((totalUsed / totalRooms) * 100);
  if (usagePercent > 100) usagePercent = 100;

  total.innerText = totalUsed;
  available.innerText = availableRooms;
  usage.innerText = usagePercent + "%";

  updateChart();
}


// CHART
function updateChart() {
  const ctx = document.getElementById("chart");

  let countMap = {};

  Object.values(allBookings).flat().forEach(b => {
    countMap[b.name] = (countMap[b.name] || 0) + 1;
  });

  let labels = Object.keys(countMap);
  let data = Object.values(countMap);

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
      labels,
      datasets: [{
        label: "Bookings per Resource",
        data,
        backgroundColor: "#22c55e",
        borderRadius: 6
      }]
    }
  });
}


// ===== NAVIGATION =====
function showSection(section, element) {
  document.getElementById("dashboard-section").style.display = "none";
  document.getElementById("bookings-section").style.display = "none";
  document.getElementById("settings-section").style.display = "none";

  document.getElementById(section + "-section").style.display = "block";

  document.querySelectorAll(".sidebar li").forEach(i => i.classList.remove("active"));
  element.classList.add("active");
}


// ===== LOGOUT =====
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}


// ===== SETTINGS =====
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

document.getElementById("userEmail").innerText = currentUser;

function changePassword() {
  const newPass = document.getElementById("newPassword").value;
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


// CLEAR BOOKINGS
function clearBookings() {
  if (!confirm("Delete all your bookings?")) return;

  bookings = [];
  allBookings[currentUser] = bookings;
  localStorage.setItem("bookings", JSON.stringify(allBookings));

  render();
}


// ===== EVENTS =====
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("bookBtn").addEventListener("click", book);

  document.querySelectorAll(".sidebar li").forEach(li => {
    li.addEventListener("click", function () {
      const section = this.id.replace("nav-", "");
      showSection(section, this);
    });
  });

  render();
});