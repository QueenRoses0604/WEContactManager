const STORAGE_KEY = "pinkRolodexContacts";

const form = document.querySelector("#contactForm");
const educationLevel = document.querySelector("#educationLevel");
const collegeYear = document.querySelector("#collegeYear");
const course = document.querySelector("#course");
const yearGroup = document.querySelector("#yearGroup");
const courseGroup = document.querySelector("#courseGroup");
const contactsList = document.querySelector("#contactsList");
const searchInput = document.querySelector("#searchInput");
const exportButton = document.querySelector("#exportButton");

let contacts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

function saveContacts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

function toggleCollegeFields() {
  const isCollege = educationLevel.value === "College";
  yearGroup.classList.toggle("hidden", !isCollege);
  courseGroup.classList.toggle("hidden", !isCollege);
  collegeYear.required = isCollege;
  course.required = isCollege;

  if (!isCollege) {
    collegeYear.value = "";
    course.value = "";
  }
}

function getFilteredContacts() {
  const term = searchInput.value.trim().toLowerCase();

  if (!term) {
    return contacts;
  }

  return contacts.filter((contact) => {
    return Object.values(contact).some((value) =>
      String(value).toLowerCase().includes(term)
    );
  });
}

function renderContacts() {
  const visibleContacts = getFilteredContacts();

  if (!visibleContacts.length) {
    contactsList.innerHTML = `
      <div class="empty-state">
        <div>&hearts;</div>
        <p>No contacts found.</p>
      </div>
    `;
    return;
  }

  contactsList.innerHTML = visibleContacts
    .map((contact) => {
      const schoolDetails = contact.educationLevel === "College"
        ? `${contact.collegeYear} - ${contact.course}`
        : "High School";

      return `
        <article class="contact-card">
          <div>
            <h3>${contact.firstName} ${contact.middleInitial ? contact.middleInitial + ". " : ""}${contact.lastName}</h3>
            <p>${contact.phone}</p>
            <p>${contact.email}</p>
            <p>Birthday: ${contact.birthday}</p>
            <p>${schoolDetails}</p>
          </div>
          <button class="delete-button" type="button" data-id="${contact.id}" aria-label="Delete ${contact.firstName}">&times;</button>
        </article>
      `;
    })
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function exportToExcel() {
  if (!contacts.length) {
    alert("Add at least one contact before exporting.");
    return;
  }

  const rows = contacts.map((contact) => `
    <tr>
      <td>${escapeHtml(contact.firstName)}</td>
      <td>${escapeHtml(contact.middleInitial)}</td>
      <td>${escapeHtml(contact.lastName)}</td>
      <td>${escapeHtml(contact.phone)}</td>
      <td>${escapeHtml(contact.email)}</td>
      <td>${escapeHtml(contact.birthday)}</td>
      <td>${escapeHtml(contact.educationLevel)}</td>
      <td>${escapeHtml(contact.collegeYear || "")}</td>
      <td>${escapeHtml(contact.course || "")}</td>
    </tr>
  `);

  const table = `
    <html>
      <head><meta charset="UTF-8"></head>
      <body>
        <table border="1">
          <thead>
            <tr>
              <th>First Name</th>
              <th>M.I.</th>
              <th>Last Name</th>
              <th>Phone</th>
              <th>Institutional Email</th>
              <th>Birthday</th>
              <th>Education Level</th>
              <th>College Year</th>
              <th>Course</th>
            </tr>
          </thead>
          <tbody>${rows.join("")}</tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([table], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "contacts.xls";
  link.click();
  URL.revokeObjectURL(url);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const contact = {
    id: crypto.randomUUID(),
    firstName: document.querySelector("#firstName").value.trim(),
    lastName: document.querySelector("#lastName").value.trim(),
    middleInitial: document.querySelector("#middleInitial").value.trim().toUpperCase(),
    phone: document.querySelector("#phone").value.trim(),
    email: document.querySelector("#email").value.trim(),
    birthday: document.querySelector("#birthday").value,
    educationLevel: educationLevel.value,
    collegeYear: collegeYear.value,
    course: course.value.trim()
  };

  contacts.unshift(contact);
  saveContacts();
  form.reset();
  toggleCollegeFields();
  renderContacts();
});

contactsList.addEventListener("click", (event) => {
  const button = event.target.closest(".delete-button");

  if (!button) {
    return;
  }

  contacts = contacts.filter((contact) => contact.id !== button.dataset.id);
  saveContacts();
  renderContacts();
});

educationLevel.addEventListener("change", toggleCollegeFields);
searchInput.addEventListener("input", renderContacts);
exportButton.addEventListener("click", exportToExcel);

toggleCollegeFields();
renderContacts();
