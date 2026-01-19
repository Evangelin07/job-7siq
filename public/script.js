document.getElementById("applicationForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const formElement = this;
  const formData = new FormData(formElement);

  // 🔍 Validate ALL personal fields
  const personalFields = {
    fullName: formData.get("fullName")?.trim(),
    phone: formData.get("phone")?.trim(),
    email: formData.get("email")?.trim(),
    position: formData.get("position")?.trim(),
    dateOfApplication: formData.get("dateOfApplication")?.trim(),
    maritalStatus: formData.get("maritalStatus")?.trim(),
    address: formData.get("address")?.trim(),
    dob: formData.get("dob")?.trim(),
    aadhar: formData.get("aadhar")?.trim()
  };

  for (const [key, value] of Object.entries(personalFields)) {
    if (!value) {
      alert(`Please fill the ${key} field ❗`);
      formElement.querySelector(`[name="${key}"]`)?.reportValidity();
      return;
    }
  }

  // 🔍 Extra checks for phone & email
  if (!/^[0-9]{10}$/.test(personalFields.phone)) {
    alert("Phone number must be 10 digits ❗");
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(personalFields.email)) {
    alert("Enter a valid email address ❗");
    return;
  }

  // 🔍 Validate table rows (education, employment, skills, family, emergency)
  function validateTableRow(prefix, fieldsPerRow) {
    const rows = {};
    document.querySelectorAll(`[name^="${prefix}["]`).forEach(input => {
      const match = input.name.match(/\[(\d+)\]\[(\w+)\]/);
      if (!match) return;
      const index = match[1];
      if (!rows[index]) rows[index] = [];
      rows[index].push(input);
    });

    for (const rowInputs of Object.values(rows)) {
      const filled = rowInputs.filter(i => i.value.trim() !== "");
      if (filled.length > 0 && filled.length < fieldsPerRow) {
        rowInputs.forEach(i => i.setAttribute("required", "required"));
        rowInputs.find(i => !i.value.trim()).reportValidity();
        return false;
      }
      if (filled.length === 0) {
        rowInputs.forEach(i => i.removeAttribute("required"));
      }
    }
    return true;
  }

  if (
    !validateTableRow("education", 5) ||
    !validateTableRow("employment", 4) ||
    !validateTableRow("skills", 4) ||
    !validateTableRow("family", 3) ||
    !validateTableRow("emergency", 5)
  ) {
    alert("Please complete all required rows ❗");
    return;
  }

  // ✅ Build arrays/objects
  function buildArray(prefix) {
    const obj = {};
    for (const [key, value] of formData.entries()) {
      if (key.startsWith(prefix)) {
        const match = key.match(/\[(\d+)\]\[(\w+)\]/);
        if (match) {
          const index = match[1];
          const field = match[2];
          if (!obj[index]) obj[index] = {};
          obj[index][field] = value.trim();
        }
      }
    }
    return Object.values(obj).filter(row =>
      Object.values(row).some(val => val && val.length > 0)
    );
  }

  function buildObject(prefix) {
    const obj = {};
    for (const [key, value] of formData.entries()) {
      if (key.startsWith(prefix)) {
        const match = key.match(/\[(.+?)\]/);
        if (match && value.trim()) obj[match[1]] = value.trim();
      }
    }
    return obj;
  }

  const educationArr = buildArray("education");
  const employmentArr = buildArray("employment");
  const skillsArr = buildArray("skills");
  const familyArr = buildArray("family");
  const emergencyArr = buildArray("emergency");

  const bankObj = buildObject("bank[");
  const joiningObj = buildObject("joining[");
  const companyObj = buildObject("company[");

  // Clean raw keys
  function cleanFormData(prefix) {
    for (const key of Array.from(formData.keys())) {
      if (key.startsWith(prefix)) formData.delete(key);
    }
  }
  ["education", "employment", "skills", "family", "emergency"].forEach(cleanFormData);
  ["bank[", "joining[", "company["].forEach(cleanFormData);

  // Set JSON strings
  formData.set("education", JSON.stringify(educationArr));
  formData.set("employment", JSON.stringify(employmentArr));
  formData.set("skills", JSON.stringify(skillsArr));
  formData.set("family", JSON.stringify(familyArr));
  formData.set("emergency", JSON.stringify(emergencyArr));

  formData.set("bank", JSON.stringify(bankObj));
  formData.set("joining", JSON.stringify(joiningObj));
  formData.set("company", JSON.stringify(companyObj));

  console.log("FormData preview:");
  for (const [key, value] of formData.entries()) {
    console.log(key, value);
  }

  try {
    const res = await fetch("https://job-7siq.onrender.com/generate-pdf", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      alert("PDF generation failed ❌");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Application_Form.pdf";
    a.click();
    window.URL.revokeObjectURL(url);

    alert("PDF downloaded successfully ✅");
    formElement.reset();
  } catch (err) {
    console.error("❌ Fetch error:", err);
    alert("Network error. Please try again.");
  }
});

// ✅ Photo preview
document.getElementById("photoInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please upload an image file only ❗");
    e.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = function () {
    const img = document.getElementById("photoPreview");
    img.src = reader.result;
    img.style.display = "block";
  };
  reader.readAsDataURL(file);
});