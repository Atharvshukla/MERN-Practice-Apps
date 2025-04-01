const fieldTypeSelect = document.getElementById("field-type");
const fieldLabelInput = document.getElementById("field-label");
const addFieldButton = document.getElementById("add-field");
const dynamicForm = document.getElementById("dynamic-form");
const jsonOutput = document.getElementById("json-output");
const submitFormButton = document.getElementById("submit-form");

let formStructure = [];

// Add field dynamically
addFieldButton.addEventListener("click", () => {
  const fieldType = fieldTypeSelect.value;
  const fieldLabel = fieldLabelInput.value.trim();

  if (!fieldLabel) {
    alert("Please enter a field label.");
    return;
  }

  const field = { type: fieldType, label: fieldLabel };

  if (fieldType === "dropdown") {
    field.options = prompt("Enter dropdown options separated by commas:").split(",");
  }

  formStructure.push(field);
  updateFormPreview();
  updateJsonPreview();
  fieldLabelInput.value = "";
});

// Update form preview
function updateFormPreview() {
  dynamicForm.innerHTML = "";

  formStructure.forEach((field, index) => {
    const fieldWrapper = document.createElement("div");

    const label = document.createElement("label");
    label.textContent = field.label;

    let input;
    if (field.type === "text") {
      input = document.createElement("input");
      input.type = "text";
      input.required = true;
    } else if (field.type === "dropdown") {
      input = document.createElement("select");
      field.options.forEach(option => {
        const opt = document.createElement("option");
        opt.value = option;
        opt.textContent = option;
        input.appendChild(opt);
      });
    } else if (field.type === "checkbox") {
      input = document.createElement("input");
      input.type = "checkbox";
    }

    fieldWrapper.appendChild(label);
    fieldWrapper.appendChild(input);
    dynamicForm.appendChild(fieldWrapper);
  });
}

// Update JSON preview
function updateJsonPreview() {
  jsonOutput.textContent = JSON.stringify(formStructure, null, 2);
}

// Validate and submit form
submitFormButton.addEventListener("click", (e) => {
  e.preventDefault();

  const inputs = dynamicForm.querySelectorAll("input, select");
  let valid = true;

  inputs.forEach(input => {
    if (input.type === "text" && !input.value) {
      valid = false;
      alert("Please fill out all text fields.");
    }
  });

  if (valid) {
    alert("Form submitted successfully!");
  }
});
