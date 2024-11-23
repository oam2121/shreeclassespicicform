// Prevent duplicate form submissions
let isSubmitting = false;

// Show payment details based on the selected option
function showPaymentDetails() {
  const paymentOption = document.getElementById("paymentOption").value;
  const cashDetails = document.getElementById("cashDetails");
  const upiDetails = document.getElementById("upiDetails");
  const packageSelected = document.getElementById("package").value;

  let amount = 0;
  if (packageSelected.includes("Relax Package (Adult)")) amount = 999;
  else if (packageSelected.includes("Relax Package (Kid)")) amount = 799;
  else if (packageSelected.includes("Delight Package (Adult)")) amount = 1799;
  else if (packageSelected.includes("Delight Package (Kid)")) amount = 1599;

  if (paymentOption === "Cash") {
    cashDetails.style.display = "block";
    upiDetails.style.display = "none";
  } else if (paymentOption === "UPI") {
    cashDetails.style.display = "none";
    upiDetails.style.display = "block";
    document.getElementById("amountToPay").innerText = `Amount: ₹${amount}`;
  } else {
    cashDetails.style.display = "none";
    upiDetails.style.display = "none";
  }
}

// Handle form submission
document.getElementById("multiStepForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Prevent multiple submissions
  if (isSubmitting) {
    alert("The form is already being submitted. Please wait.");
    return;
  }

  const submitButton = document.querySelector(".submit-button");
  submitButton.disabled = true; // Disable the submit button
  isSubmitting = true;

  const formData = new FormData(e.target);
  const formObject = {};
  formData.forEach((value, key) => (formObject[key] = value));

  // Add validation for Payment Status
  const paymentStatus = document.getElementById("paymentStatus").value;
  if (!paymentStatus) {
    alert("Please select a payment status before submitting.");
    submitButton.disabled = false; // Re-enable the button if validation fails
    isSubmitting = false;
    return;
  }

  const googleAppsScriptURL =
    "https://script.google.com/macros/s/AKfycbzTUuavwBcL5r1CCL9CN6fTtIZy4M6kz55aCn9nJc5uHbz7S81KSHAGHpwjeM0q0pfK_w/exec";

  try {
    const response = await fetch(googleAppsScriptURL, {
      method: "POST",
      body: new URLSearchParams(formObject),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (response.ok) {
      // Proceed to thank you section
      document.querySelectorAll(".form-section").forEach((section) => {
        section.style.display = "none";
      });
      document.getElementById("thankYouSection").style.display = "block";

      // Enable "Download PDF" button if Payment Status is "Paid"
      if (paymentStatus === "Paid") {
        document.getElementById("downloadPdfButton").disabled = false;
        document.getElementById("downloadPdfButton").style.backgroundColor = "#28a745"; // Green
        document.getElementById("downloadPdfButton").style.cursor = "pointer";
      } else {
        document.getElementById("downloadPdfButton").disabled = true;
        document.getElementById("downloadPdfButton").style.backgroundColor = "#ccc"; // Gray
        document.getElementById("downloadPdfButton").style.cursor = "not-allowed";
      }
    } else {
      alert("There was an issue submitting the form. Please try again.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while submitting the form.");
  } finally {
    isSubmitting = false; // Reset the submitting flag
    submitButton.disabled = false; // Re-enable the button for future submissions
  }
});

// Navigation logic for moving to the next section
function nextSection(section) {
  document.querySelector(".form-section.active").classList.remove("active");
  const next = document.getElementById(`section${section}`);
  next.classList.add("active");
}

// Navigation logic for moving to the previous section
function prevSection(section) {
  document.querySelector(".form-section.active").classList.remove("active");
  const prev = document.getElementById(`section${section}`);
  prev.classList.add("active");
}

// Generate a PDF of the form
function generatePDF() {
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  const name = document.getElementById("name").value || "N/A";
  const studentClass = document.getElementById("class").value || "N/A";
  const age = document.getElementById("age").value || "N/A";
  const guardian = document.getElementById("guardian").value || "N/A";
  const contact1 = document.getElementById("contact").value || "N/A";
  const contact2 = document.getElementById("contact2").value || "N/A";
  const email = document.getElementById("email").value || "N/A";
  const selectedPackage = document.getElementById("package").value || "N/A";
  const paymentMethod = document.getElementById("paymentOption").value || "N/A";
  const paymentStatus = document.getElementById("paymentStatus").value || "N/A";

  // Add form details to PDF
  doc.text("Shree Classes Picnic Registration Form", 10, 10);
  doc.autoTable({
    startY: 20,
    head: [["Field", "Details"]],
    body: [
      ["Name", name],
      ["Class/Grade", studentClass],
      ["Age", age],
      ["Parent/Guardian Name", guardian],
      ["Contact Number 1", contact1],
      ["Contact Number 2", contact2],
      ["Email ID", email],
      ["Selected Package", selectedPackage],
      ["Payment Method", paymentMethod],
      ["Payment Status", paymentStatus],
    ],
  });

  doc.save(`${name}_picnic_registration.pdf`);
}
