const API_URL = "https://script.google.com/macros/s/AKfycbzAlsIR-GEDkCKunpjksQESs-VkDbhzaQl935pOq8GbOi4ELQDwBSy4TetaYd-ZrGJYPQ/exec";
let allContacts = [];

const loadingElement = document.getElementById("loading");
const listElement = document.getElementById("contact-list");
const locationSelect = document.getElementById("location");
const industry1Select = document.getElementById("industry1");
const industry2Select = document.getElementById("industry2");
const loginScreen = document.getElementById("login-screen");
const directoryScreen = document.getElementById("directory-screen");
const resetButton = document.getElementById("reset-button");

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

      // 初次填充下拉選單
      populateSelectOptions(locationSelect, "Location");
      populateSelectOptions(industry1Select, "Industry-1");
      populateSelectOptions(industry2Select, "Industry-2");

      renderContacts(allContacts);
    })
    .catch(err => {
      alert("錯誤：" + err);
      loginScreen.style.display = "flex";
      directoryScreen.style.display = "none";
    });
}

function populateSelectOptions(selectElement, key) {
  selectElement.options.length = 1; // 清除除了第一個 "全部"
  const values = [...new Set(allContacts.map(c => c[key]).filter(Boolean))].sort();
  values.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    selectElement.appendChild(option);
  });
}

function applyFilters() {
  const location = locationSelect.value;
  const industry1 = industry1Select.value;
  const industry2 = industry2Select.value;

  const filtered = allContacts.filter(c =>
    (!location || c["Location"] === location) &&
    (!industry1 || c["Industry-1"] === industry1) &&
    (!industry2 || c["Industry-2"] === industry2)
  );

  renderContacts(filtered);
}

function resetFilters() {
  locationSelect.value = "";
  industry1Select.value = "";
  industry2Select.value = "";

  // 重建三個選單
  populateSelectOptions(locationSelect, "Location");
  populateSelectOptions(industry1Select, "Industry-1");
  populateSelectOptions(industry2Select, "Industry-2");

  renderContacts(allContacts);
}

function updateDependentFilters(changedKey) {
  const currentValues = {
    "Location": locationSelect.value,
    "Industry-1": industry1Select.value,
    "Industry-2": industry2Select.value,
  };

  const filtered = allContacts.filter(c =>
    (!currentValues["Location"] || c["Location"] === currentValues["Location"]) &&
    (!currentValues["Industry-1"] || c["Industry-1"] === currentValues["Industry-1"]) &&
    (!currentValues["Industry-2"] || c["Industry-2"] === currentValues["Industry-2"])
  );

  const otherKeys = ["Location", "Industry-1", "Industry-2"].filter(k => k !== changedKey);
  const selects = {
    "Location": locationSelect,
    "Industry-1": industry1Select,
    "Industry-2": industry2Select,
  };

  otherKeys.forEach(key => {
    const select = selects[key];
    const prevValue = select.value;

    select.options.length = 1;
    const values = [...new Set(filtered.map(c => c[key]).filter(Boolean))].sort();
    values.forEach(v => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      select.appendChild(opt);
    });

    // 如果舊值不在新選項裡，清空
    if (prevValue && !values.includes(prevValue)) {
      select.value = "";
    } else {
      select.value = prevValue;
    }
  });
}

function extractFileId(url) {
  const match = url.match(/id=([^&]+)/) || url.match(/\/file\/d\/([^/]+)\//);
  return match ? match[1] : null;
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
    img.src = "guest.png";

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
      ${linkedin ? `<a href="${linkedin}" target="_blank">LinkedIn</a> ` : ""}
      ${ig ? `IG: ${ig} ` : ""}
      ${line ? `LINE: ${line}` : ""}
    `;

    contactItem.appendChild(img);
    contactItem.appendChild(infoDiv);
    li.appendChild(contactItem);
    listElement.appendChild(li);
  });
}

// 綁定事件
locationSelect.addEventListener("change", () => {
  updateDependentFilters("Location");
  applyFilters();
});

industry1Select.addEventListener("change", () => {
  updateDependentFilters("Industry-1");
  applyFilters();
});

industry2Select.addEventListener("change", () => {
  updateDependentFilters("Industry-2");
  applyFilters();
});

resetButton.addEventListener("click", resetFilters);
