const API_URL = "https://script.google.com/macros/s/AKfycbzAlsIR-GEDkCKunpjksQESs-VkDbhzaQl935pOq8GbOi4ELQDwBSy4TetaYd-ZrGJYPQ/exec";
let allContacts = [];

const loadingElement = document.getElementById("loading");
const listElement = document.getElementById("contact-list");
const regionSelect = document.getElementById("region");
const loginScreen = document.getElementById("login-screen");
const directoryScreen = document.getElementById("directory-screen");

function onGoogleSignIn(response) {
  const idToken = response.credential;
  loginScreen.style.display = "none";
  directoryScreen.style.display = "block";
  loadingElement.style.display = "block";
  listElement.innerHTML = "";

  fetch(`${API_URL}?idToken=${idToken}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert("無權限：" + data.error);
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
      loginScreen.style.display = "flex";
      directoryScreen.style.display = "none";
    });
}

function extractFileId(url) {
  const match = url.match(/id=([^&]+)/) || url.match(/\/file\/d\/([^/]+)\//);
  return match ? match[1] : null;
}

function populateRegionOptions() {
  const uniqueRegions = [...new Set(allContacts.map(c => c["地區/Chapter"]))].sort();
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
    const name = contact["中文姓名"] || `${contact["First Name (Preferred)"]} ${contact["Last Name"]}`;
    const fileId = extractFileId(contact["大頭貼上傳 / Upload Picture"]);
    const region = contact["地區/Chapter"];
    const company = contact["公司名稱 / Company Name"];
    const position = contact["職位 / Position"];
    const industry = contact["行業 / Industry"];
    const intro = contact["職業介紹(簡短一句)"];
    const phone = contact["電話 / Mobile Phone"];
    const motto = contact["個人標語 / Person Motto\nex. 做自己的太陽，無需借誰的光"];
    const linkedin = contact["LinkedIn (link)"];
    const ig = contact["Instagram"];
    const line = contact["LINE ID"];

    const li = document.createElement("li");
    const contactItem = document.createElement("div");
    contactItem.className = "contact-item";

    const img = document.createElement("img");
    img.alt = "Avatar";
    img.className = "avatar";
    img.src = "guest.png"; // 預設圖片

    if (fileId) {
      fetch(`${API_URL}?fileId=${fileId}`)
        .then(res => res.json())
        .then(data => {
          if (data.base64 && data.mime) {
            img.src = `data:${data.mime};base64,${data.base64}`;
          }
        })
        .catch(() => {
          img.src = "guest.png";
        });
    }

    const infoDiv = document.createElement("div");
    infoDiv.innerHTML = `
      <strong>${name}</strong><br>
      ${position || ""} ‧ ${company || ""} ‧ ${industry || ""}<br>
      ${phone ? `☎ ${phone}<br>` : ""}
      ${region ? `<em>${region}</em><br>` : ""}
      ${intro ? `<i>${intro}</i><br>` : ""}
      ${motto ? `<q>${motto}</q><br>` : ""}
      ${linkedin ? `<a href=\"${linkedin}\" target=\"_blank\">LinkedIn</a> ` : ""}
      ${ig ? `IG: ${ig} ` : ""}
      ${line ? `LINE: ${line}` : ""}
    `;

    contactItem.appendChild(img);
    contactItem.appendChild(infoDiv);
    li.appendChild(contactItem);
    listElement.appendChild(li);
  });
}

regionSelect.addEventListener("change", (e) => {
  const region = e.target.value;
  const filtered = region ? allContacts.filter(c => c["地區/Chapter"] === region) : allContacts;
  renderContacts(filtered);
});