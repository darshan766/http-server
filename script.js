const userForm = document.getElementById("userForm");
const usernameInput = document.getElementById("username");
const useremailInput = document.getElementById("useremail");
const userList = document.getElementById("userList");

// ✅ Create a new message element
const message = document.createElement("p");
message.id = "feedback";
message.style.color = "green";
message.style.marginTop = "1rem";
message.style.display = "none"; // hidden by default
userForm.appendChild(message);

async function fetchUsers() {
  try {
    const res = await fetch("/users");
    const users = await res.json();

    userList.innerHTML = "";
    users.forEach(user => {
      const card = document.createElement("div");
      card.className = "user-card";
      card.innerHTML = `
        <strong>${user.name}</strong>
        <span>${user.email}</span>
      `;
      userList.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

userForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = usernameInput.value.trim();
  const email = useremailInput.value.trim();
  if (!name || !email) return;

  try {
    const res = await fetch("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email })
    });

    if (res.ok) {
      usernameInput.value = "";
      useremailInput.value = "";

      // ✅ Show success message
      message.textContent = "✅ Registered successfully!";
      message.style.display = "block";

      // Hide the message after 3 seconds
      setTimeout(() => {
        message.style.display = "none";
      }, 3000);

      fetchUsers();
    } else {
      message.textContent = "❌ Registration failed.";
      message.style.color = "red";
      message.style.display = "block";
    }
  } catch (err) {
    console.error("Error during registration:", err);
    message.textContent = "❌ An error occurred.";
    message.style.color = "red";
    message.style.display = "block";
  }
});

fetchUsers();
