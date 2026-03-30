// ===== HELPERS =====
function hashPassword(pass) {
  return btoa(pass); // simple encoding
}


// ================= SIGNUP =================
function signup(email, password) {

  // ✅ validation moved INSIDE function
  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  if (!email.includes("@")) {
    alert("Invalid email");
    return;
  }

  if (password.length < 4) {
    alert("Password too short");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];

  const exists = users.find(u => u.email === email);
  if (exists) {
    alert("User already exists!");
    return;
  }

  users.push({ email, password: hashPassword(password) });
  localStorage.setItem("users", JSON.stringify(users));

  alert("Signup successful!");
  window.location.href = "index.html";
}


// ================= LOGIN =================
function login(email, password) {

  // ✅ validation moved INSIDE function
  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  if (!email.includes("@")) {
    alert("Invalid email");
    return;
  }

  if (password.length < 4) {
    alert("Password too short");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];

  const user = users.find(
    u => u.email === email && u.password === hashPassword(password)
  );

  if (!user) {
    alert("Invalid credentials");
    return;
  }

  localStorage.setItem("loggedInUser", JSON.stringify(user));
  window.location.href = "dashboard.html";
}


// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {

  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      login(email, password);
    });
  }

  const signupBtn = document.getElementById("signupBtn");
  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      signup(email, password);
    });
  }

  const toggle = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  if (toggle && passwordInput) {
    toggle.addEventListener("click", () => {
      passwordInput.type =
        passwordInput.type === "password" ? "text" : "password";
    });
  }

});