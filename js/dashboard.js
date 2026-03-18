let allBookings = JSON.parse(localStorage.getItem("bookings")) || {};

let userData = JSON.parse(localStorage.getItem("loggedInUser"));

// 🔒 PROTECT DASHBOARD
if (!userData) {
  window.location.href = "index.html";
}

let currentUser = userData ? userData.email : "User";

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

  if (!value) return;

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

  welcome.innerText = "Welcome, " + currentUser;

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

  updateChart();
}

// ================= CHART =================
function updateChart() {
  const ctx = document.getElementById("chart");

  let countMap = {};

  bookings.forEach(b => {
    countMap[b.name] = (countMap[b.name] || 0) + 1;
  });

  let labels = Object.keys(countMap);
  let data = Object.values(countMap);

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
      responsive: true
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