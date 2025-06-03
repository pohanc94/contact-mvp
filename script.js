const API_URL = "https://script.google.com/macros/s/AKfycbxZDo6ten58nPhw2kFbtkItzDJaEDzlgSuVxilqxmrdiGKIQUAq3KNYJKqaJMAvy0RcDA/exec";
let allContacts = [];

const loadingElement = document.getElementById("loading");
const listElement = document.getElementById("contact-list");
const regionSelect = document.getElementById("region");
const loginScreen = document.getElementById("login-screen");
const directoryScreen = document.getElementById("directory-screen");

function onGoogleSignIn(response) {
  const idToken = response.credential;

  // 切換畫面
  loginScreen.style.display = "none";
  directoryScreen.style.display = "block";
  loadingElement.style.display = "block";
  listElement.innerHTML = "";

  fetch(`${API_URL}?idToken=${idToken}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert("無權限：" + data.error);
        // 回到登入畫面
        loginScreen.style.display = "flex";
        directoryScreen.style.display = "none";
        return;
      }

      allContacts = data;
      populateRegionOptions();
      renderContacts(allContacts);
    })
    .catch(err => {
      alert("錯誤：" + err);
      // 發生錯誤也回登入畫面
      loginScreen.style.display = "flex";
      directoryScreen.style.display = "none";
    });
}

function populateRegionOptions() {
  const uniqueRegions = [...new Set(allContacts.map(c => c["地區"]))].sort();
  uniqueRegions.forEach(region => {
    const option = document.createElement("option");
    option.value = region;
    option.textContent = region;
    regionSelect.appendChild(option);
  });
}

function renderContacts(list) {
  loadingElement.style.display = "none";
  listElement.innerHTML = "";

  list.forEach(contact => {
    const imgIndex = Math.floor(Math.random() * 100);
    const imgGender = Math.random() < 0.5 ? "men" : "women";
    const imgUrl = `https://randomuser.me/api/portraits/${imgGender}/${imgIndex}.jpg`;

    const li = document.createElement("li");
    li.innerHTML = `
      <div class="contact-item">
        <img src="${imgUrl}" alt="Avatar" class="avatar" />
        <div>
          <strong>${contact["姓名"]}</strong><br>
          ${contact["電話"]}<br>
          <a href="mailto:${contact["Email"]}">${contact["Email"]}</a><br>
          <em>${contact["地區"]}</em>
        </div>
      </div>`;
    listElement.appendChild(li);
  });
}

regionSelect.addEventListener("change", (e) => {
  const region = e.target.value;
  const filtered = region ? allContacts.filter(c => c["地區"] === region) : allContacts;
  renderContacts(filtered);
});