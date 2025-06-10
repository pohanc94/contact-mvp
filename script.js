const API_URL = "https://script.google.com/macros/s/AKfycbzAlsIR-GEDkCKunpjksQESs-VkDbhzaQl935pOq8GbOi4ELQDwBSy4TetaYd-ZrGJYPQ/exec";
let allContacts = [];

const loadingElement = document.getElementById("loading");
const listElement = document.getElementById("contact-list");
const locationSelect = document.getElementById("location");
const industrySelect = document.getElementById("industry");
const directoryScreen = document.getElementById("directory-screen");
const resetButton = document.getElementById("reset-button");

function onGoogleSignIn(response) {
  const idToken = response.credential;

  // 移除登入畫面以避免空白區域
  const loginScreen = document.getElementById("login-screen");
  if (loginScreen) loginScreen.remove();

  directoryScreen.style.display = "block";
  loadingElement.style.display = "block";
  listElement.innerHTML = "";

  fetch(`${API_URL}?idToken=${idToken}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert("無權限：" + data.error);
        return;
      }
      allContacts = data;

      populateSelectOptions(locationSelect, "Location");
      populateIndustryOptions();

      renderContacts(allContacts);
    })
    .catch(err => {
      alert("錯誤：" + err);
    });
}

function populateSelectOptions(selectElement, key) {
  selectElement.options.length = 1;
  const values = [...new Set(allContacts.map(c => c[key]).filter(Boolean))].sort();
  values.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    selectElement.appendChild(option);
  });
}

function populateIndustryOptions() {
  industrySelect.options.length = 1;
  const values = [
    ...new Set(allContacts.flatMap(c => [c["Industry-1"], c["Industry-2"]]).filter(Boolean))
  ].sort();
  values.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    industrySelect.appendChild(option);
  });
}

function applyFilters() {
  const location = locationSelect.value;
  const industry = industrySelect.value;

  const filtered = allContacts.filter(c =>
    (!location || c["Location"] === location) &&
    (!industry || c["Industry-1"] === industry || c["Industry-2"] === industry)
  );

  renderContacts(filtered);
}

function resetFilters() {
  locationSelect.value = "";
  industrySelect.value = "";
  populateSelectOptions(locationSelect, "Location");
  populateIndustryOptions();
  renderContacts(allContacts);
}

function updateFilterOptions(changedKey) {
  const currentLocation = locationSelect.value;
  const currentIndustry = industrySelect.value;

  const filtered = allContacts.filter(c =>
    (!currentLocation || c["Location"] === currentLocation) &&
    (!currentIndustry || c["Industry-1"] === currentIndustry || c["Industry-2"] === currentIndustry)
  );

  const selects = {
    Location: locationSelect,
    Industry: industrySelect
  };

  const keys = {
    Location: c => c["Location"],
    Industry: c => [c["Industry-1"], c["Industry-2"]]
  };

  for (const key in selects) {
    if (key === changedKey) continue;

    const select = selects[key];
    const prevValue = select.value;

    const values = [...new Set(
      filtered.flatMap(c => {
        const val = keys[key](c);
        return Array.isArray(val) ? val : [val];
      }).filter(Boolean)
    )].sort();

    select.options.length = 1;
    values.forEach(value => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });

    if (prevValue && !values.includes(prevValue)) {
      select.value = "";
    } else {
      select.value = prevValue;
    }
  }
}

function extractFileId(url) {
  const match = url?.match(/id=([^&]+)/) || url?.match(/\/file\/d\/([^/]+)\//);
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
    li.innerHTML = `
      <div class="card mb-3">
        <div class="row g-0">
          <div class="col-auto">
            <img src="guest.png" class="img-fluid rounded-start avatar" alt="Avatar" id="img-${fileId}">
          </div>
          <div class="col">
            <div class="card-body p-2">
              <h5 class="card-title mb-1">${name}</h5>
              <p class="card-text small mb-1">${position || ""} ‧ ${company || ""} ‧ ${industry || ""}</p>
              ${phone ? `<p class="card-text small mb-1">☎ ${phone}</p>` : ""}
              ${region ? `<p class="card-text small text-muted"><em>${region}</em></p>` : ""}
              ${intro ? `<p class="card-text small"><i>${intro}</i></p>` : ""}
              ${motto ? `<p class="card-text small"><q>${motto}</q></p>` : ""}
              ${(linkedin || ig || line) ? `<p class="card-text small">${linkedin ? `<a href='${linkedin}' target='_blank'>LinkedIn</a> ` : ""}${ig ? `IG: ${ig} ` : ""}${line ? `LINE: ${line}` : ""}</p>` : ""}
            </div>
          </div>
        </div>
      </div>`;

    listElement.appendChild(li);

    if (fileId) {
      fetch(`${API_URL}?fileId=${fileId}`)
        .then(res => res.json())
        .then(data => {
          if (data.base64 && data.mime) {
            const imgEl = document.getElementById(`img-${fileId}`);
            if (imgEl) imgEl.src = `data:${data.mime};base64,${data.base64}`;
          }
        });
    }
  });
}

locationSelect.addEventListener("change", () => {
  updateFilterOptions("Location");
  applyFilters();
});

industrySelect.addEventListener("change", () => {
  updateFilterOptions("Industry");
  applyFilters();
});

resetButton.addEventListener("click", resetFilters);
