document.getElementById("applicationForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(this);

  const fullName = formData.get("fullName")?.trim();
  const phone = formData.get("phone")?.trim();
  const email = formData.get("email")?.trim();

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
    const res = await fetch("https://job-form-l557.onrender.com/submit", {
  method: "POST",
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify(formData)
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
    this.reset();

  } catch (err) {
    console.error("❌ Fetch error:", err);
    alert("Backend not reachable ❌ (Check server)");
  }
});
