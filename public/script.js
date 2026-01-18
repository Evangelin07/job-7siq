document.getElementById("applicationForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const formElement = this;
  const formData = new FormData(formElement);

  // Helper to build arrays of rows and skip empty ones
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
    // ✅ Only keep rows where at least one field is filled
    return Object.values(obj).filter(row =>
      Object.values(row).some(val => val && val.length > 0)
    );
  }

    function buildObject(prefix) {
    const obj = {};
    for (const [key, value] of formData.entries()) {
      if (key.startsWith(prefix)) {
        const match = key.match(/\[(\w+)\]/);
        if (match && value.trim()) obj[match[1]] = value.trim();
      }
    }
    return obj;
  }


  // Personal info
  const fullName = formData.get("fullName")?.trim();
  const phone = formData.get("phone")?.trim();
  const email = formData.get("email")?.trim();
  const position = formData.get("position")?.trim();
  const dateOfApplication = formData.get("dateOfApplication")?.trim();
  const employmentType = formData.get("employmentType")?.trim();
  const maritalStatus = formData.get("maritalStatus")?.trim();
  const address = formData.get("address")?.trim();
  const dob = formData.get("dob")?.trim();
  const aadhar = formData.get("aadhar")?.trim();

    if (!fullName || !phone || !email || !position ||
    !dateOfApplication ||
    !employmentType ||
    !maritalStatus ||
    !address ||
    !dob ||
    !aadhar ) {
    alert("Please fill all required fields ❗");
    return;
  }
  if (!/^[0-9]{10}$/.test(phone)) {
    alert("Phone number must be 10 digits ❗");
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    alert("Enter a valid email address ❗");
    return;
  }
  
  if (!/^[0-9]{12}$/.test(aadhar)) {
    alert("Aadhar must be 12 digits ❗");
    return;
  }
  if (!employmentType.length) {
    alert("Please select Employment Type ❗");
    return;
  }
  formData.set("employmentType", JSON.stringify(employmentType));

  // Photo validation
  const photoFile = formData.get("photo");
  if (!photoFile || photoFile.size === 0) {
    alert("Please upload photo ❗");
    return;
  }

/* =========================
     BUILD ARRAYS & OBJECTS
  ========================== */

  const education = buildArray("education");
  const employment = buildArray("employment");
  const skills = buildArray("skills");
  const family = buildArray("family");
  const emergency = buildArray("emergency");

  const bank = buildObject("bank[");
  const joining = buildObject("joining[");
  const company = buildObject("company[");

  // Set JSON values
  formData.set("education", JSON.stringify(education));
  formData.set("employment", JSON.stringify(employment));
  formData.set("skills", JSON.stringify(skills));
  formData.set("family", JSON.stringify(family));
  formData.set("emergency", JSON.stringify(emergency));
  formData.set("bank", JSON.stringify(bank));
  formData.set("joining", JSON.stringify(joining));
  formData.set("company", JSON.stringify(company));

   /* =========================
     REMOVE RAW DUPLICATE FIELDS
  ========================== */

  [
    "education",
    "employment",
    "skills",
    "family",
    "emergency",
    "bank",
    "joining",
    "company"
  ].forEach(prefix => {
    for (const key of [...formData.keys()]) {
      if (key.startsWith(prefix + "[")) {
        formData.delete(key);
      }
    }
  });

  /* =========================
     DEBUG (OPTIONAL)
  ========================== */
  console.log("Sending data to backend:");
  for (let pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }

  
  try {
    // ✅ Send FormData directly, do NOT set Content-Type
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

