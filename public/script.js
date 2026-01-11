document.getElementById("applicationForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const formElement = this;
  const formData = new FormData(formElement);

  // Build arrays from input names like education[0][degree]
  function buildObject(prefix) {
    const obj = {};
    for (const [key, value] of formData.entries()) {
      if (key.startsWith(prefix + "[")) {
        const match = key.match(/\[(\d+)\]\[(.+)\]/);
        if (match) {
          const index = match[1];
          const field = match[2];
          if (!obj[index]) obj[index] = {};
          obj[index][field] = value.trim();
        }
      }
    }
    return Object.values(obj);
  }

  // Build main objects/arrays
  const education = buildObject("education");
  const employment = buildObject("employment");
  const skills = buildObject("skills");
  const family = buildObject("family");
  const emergency = buildObject("emergency");

  const joining = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("joining[")) {
      const field = key.match(/\[(\w+)\]/)[1];
      joining[field] = value.trim();
    }
  }

  const company = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("company[")) {
      const field = key.match(/\[(\w+)\]/)[1];
      company[field] = value.trim();
    }
  }

  // Basic fields
  const fullName = formData.get("fullName")?.trim();
  const phone = formData.get("phone")?.trim();
  const email = formData.get("email")?.trim();
  const position = formData.get("position")?.trim();
  const dateOfApplication = formData.get("dateOfApplication")?.trim();
  const employmentType = formData.getAll("employmentType"); // multiple checkboxes
  const maritalStatus = formData.get("maritalStatus")?.trim();
  const address = formData.get("address")?.trim();
  const dob = formData.get("dob")?.trim();
  const aadhar = formData.get("aadhar")?.trim();

  // Validation
  if (!fullName || !phone || !email) {
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

  try {
    // Send as FormData (to include photo)
    const sendData = new FormData();
    sendData.append("fullName", fullName);
    sendData.append("phone", phone);
    sendData.append("email", email);
    sendData.append("position", position);
    sendData.append("dateOfApplication", dateOfApplication);
    employmentType.forEach(type => sendData.append("employmentType", type));
    sendData.append("maritalStatus", maritalStatus);
    sendData.append("address", address);
    sendData.append("dob", dob);
    sendData.append("aadhar", aadhar);

    sendData.append("education", JSON.stringify(education));
    sendData.append("employment", JSON.stringify(employment));
    sendData.append("skills", JSON.stringify(skills));
    sendData.append("family", JSON.stringify(family));
    sendData.append("emergency", JSON.stringify(emergency));
    sendData.append("joining", JSON.stringify(joining));
    sendData.append("company", JSON.stringify(company));

    // Append photo if exists
    const photoInput = formElement.querySelector('input[name="photo"]');
    if (photoInput && photoInput.files.length > 0) {
      sendData.append("photo", photoInput.files[0]);
    }

    const res = await fetch("https://job-7siq.onrender.com/generate-pdf", {
      method: "POST",
      body: sendData
    });

    if (!res.ok) {
      alert("PDF generation failed ❌");
      return;
    }

    // Download PDF
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
    alert("Backend not reachable ❌");
  }
});
