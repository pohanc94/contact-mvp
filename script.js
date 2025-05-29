const API_URL = "https://script.google.com/macros/s/AKfycbxZDo6ten58nPhw2kFbtkItzDJaEDzlgSuVxilqxmrdiGKIQUAq3KNYJKqaJMAvy0RcDA/exec";
let allContacts = [];

const loadingElement = document.getElementById("loading");
const listElement = document.getElementById("contact-list");

async function fetchAllContacts() {
  loadingElement.style.display = "block";   // 顯示 loading
  listElement.style.display = "none";       // 暫時隱藏清單

  const res = await fetch(API_URL);
  allContacts = await res.json();
  renderContacts(allContacts);

  loadingElement.style.display = "none";    // 隱藏 loading
  listElement.style.display = "block";      // 顯示清單
}

function renderContacts(list) {
  const container = document.getElementById("contact-list");
  container.innerHTML = "";
  list.forEach(contact => {
    const imgIndex = Math.floor(Math.random() * 100);
    const imgGender = Math.random() < 0.5 ? "men" : "women";
    const imgUrl = `https://randomuser.me/api/portraits/${imgGender}/${imgIndex}.jpg`;

    const li = document.createElement("li");
    li.innerHTML = `
      <div class="contact-item">
        <img src="${imgUrl}" alt="Avatar" class="avatar">
        <div>
          <strong>${contact["姓名"]}</strong><br>
          ${contact["電話"]}<br>
          <a href="mailto:${contact["Email"]}">${contact["Email"]}</a><br>
          <em>${contact["地區"]}</em>
        </div>
      </div>`;
    container.appendChild(li);
  });
}

document.getElementById("region").addEventListener("change", (e) => {
  const region = e.target.value;
  const filtered = region ? allContacts.filter(c => c["地區"] === region) : allContacts;
  renderContacts(filtered);
});

fetchAllContacts(); // 初始化
