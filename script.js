const API_URL = "https://script.google.com/macros/s/AKfycbxZDo6ten58nPhw2kFbtkItzDJaEDzlgSuVxilqxmrdiGKIQUAq3KNYJKqaJMAvy0RcDA/exec";

async function loadContacts(region = "") {
  const res = await fetch(`${API_URL}?region=${encodeURIComponent(region)}`);
  const data = await res.json();
  const list = document.getElementById("contact-list");
  list.innerHTML = "";
  data.forEach(contact => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${contact["姓名"]}</strong><br>${contact["電話"]}<br><a href="mailto:${contact["Email"]}">${contact["Email"]}</a><br><em>${contact["地區"]}</em>`;
    list.appendChild(li);
  });
}

document.getElementById("region").addEventListener("change", (e) => {
  loadContacts(e.target.value);
});

loadContacts();
