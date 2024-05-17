interface ServiceItem {
  description: string;
  total: string;
}

interface ReceiptData {
  receiptDate: string;
  receiptNumber: string;
  payerName: string;
  payerCpfCnpj: string;
  payerPhone: string;
  beneficiaryName: string;
  beneficiaryCpfCnpj: string;
  beneficiaryState: string;
  observations: string;
  serviceItems: ServiceItem[];
}

const elements = {
  receiptOutput: document.getElementById("receiptOutput"),
  generateReceiptBtn: document.getElementById(
    "generateReceipt",
  ) as HTMLButtonElement | null,
  addItemBtn: document.getElementById("addItem"),
  receiptOutputButtons: document.getElementById("receiptOutputButtons"),
  newReceiptBtn: document.getElementById("newReceiptButton"),
  printReceiptBtn: document.getElementById("printReceiptButton"),
  payerCpfCnpjInput: document.getElementById(
    "payerCpfCnpj",
  ) as HTMLInputElement,
  beneficiaryCpfCnpjInput: document.getElementById(
    "beneficiaryCpfCnpj",
  ) as HTMLInputElement,
  payerErrorDisplay: document.getElementById(
    "payerCpfCnpjError",
  ) as HTMLParagraphElement,
  beneficiaryErrorDisplay: document.getElementById(
    "beneficiaryCpfCnpjError",
  ) as HTMLParagraphElement,
  receiptDateInput: document.getElementById("receiptDate") as HTMLInputElement,
  receiptNumberInput: document.getElementById(
    "receiptNumber",
  ) as HTMLInputElement,
  payerNameInput: document.getElementById("payerName") as HTMLInputElement,
  payerPhoneInput: document.getElementById("payerPhone") as HTMLInputElement,
  beneficiaryNameInput: document.getElementById(
    "beneficiaryName",
  ) as HTMLInputElement,
  beneficiaryStateInput: document.getElementById(
    "beneficiaryState",
  ) as HTMLSelectElement,
  observationsInput: document.getElementById(
    "observations",
  ) as HTMLTextAreaElement,
  downloadReceiptBtn: document.getElementById("downloadReceiptButton"),
};

document.addEventListener("DOMContentLoaded", () => {
  initializeForm();
  setupInputFormats();
});

function initializeForm(): void {
  hideErrorMessages();

  if (elements.receiptOutput && elements.receiptOutputButtons) {
    elements.receiptOutput.style.display = "none";
    elements.receiptOutputButtons.style.display = "none";
  }

  if (elements.generateReceiptBtn && elements.generateReceiptBtn.form) {
    elements.generateReceiptBtn.form.addEventListener(
      "submit",
      (event: Event) => {
        event.preventDefault();
        generateReceipt();
      },
    );
  }

  if (elements.addItemBtn) {
    elements.addItemBtn.addEventListener("click", addItem);
  }

  if (elements.newReceiptBtn) {
    elements.newReceiptBtn.addEventListener("click", initializeNewReceipt);
  }

  if (elements.printReceiptBtn) {
    elements.printReceiptBtn.addEventListener("click", printReceipt);
  }

  if (elements.downloadReceiptBtn) {
    elements.downloadReceiptBtn.addEventListener("click", downloadReceipt);
  }
}

function hideErrorMessages() {
  if (elements.payerErrorDisplay) {
    elements.payerErrorDisplay.style.display = "none";
  }

  if (elements.beneficiaryErrorDisplay) {
    elements.beneficiaryErrorDisplay.style.display = "none";
  }
}

function setupInputFormats() {
  setupCpfCnpjValidation(
    elements.payerCpfCnpjInput,
    elements.payerErrorDisplay,
  );
  setupCpfCnpjValidation(
    elements.beneficiaryCpfCnpjInput,
    elements.beneficiaryErrorDisplay,
  );

  elements.payerCpfCnpjInput.maxLength = 18;
  elements.beneficiaryCpfCnpjInput.maxLength = 18;

  elements.receiptNumberInput.addEventListener("input", enforceNumericFormat);
  elements.payerPhoneInput.addEventListener("input", formatPhoneNumber);

  const serviceItemsContainer = document.getElementById("serviceItems");
  if (serviceItemsContainer) {
    serviceItemsContainer.addEventListener("input", (event) => {
      const target = event.target as HTMLInputElement;
      if (target && target.name.startsWith("total")) {
        formatCurrency(event);
      }
    });
  }
}

function setupCpfCnpjValidation(
  input: HTMLInputElement,
  errorDisplay: HTMLParagraphElement,
) {
  input.addEventListener("input", (event: Event) => {
    formatCpfCnpj(event);
    const isValid = validateCpfCnpj(input.value);
    if (input.value.length === 0) {
      errorDisplay.style.display = "none";
    } else if (!isValid) {
      errorDisplay.style.display = "block";
    } else {
      errorDisplay.style.display = "none";
    }
  });
}

function enforceNumericFormat(event: Event) {
  const input = event.target as HTMLInputElement;
  input.value = input.value.replace(/\D/g, "");
}

function formatPhoneNumber(event: Event) {
  const input = event.target as HTMLInputElement;
  const value = input.value.replace(/\D/g, "");
  if (value.length > 0) {
    input.value = value.replace(/^(\d{2})(\d{4,5})(\d{4}).*/, "($1) $2-$3");
  } else {
    input.value = "";
  }
}

function formatCpfCnpj(event: Event) {
  const input = event.target as HTMLInputElement;
  const value = input.value.replace(/\D/g, "");
  if (value.length <= 11) {
    input.value = value
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2");
  } else {
    input.value = value
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
}

function formatCurrency(event: Event) {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/\D/g, "").replace(/^0+/, "");
  if (value.length === 0) {
    input.value = "0,00";
  } else {
    value = parseInt(value, 10).toString();
    input.value = (parseInt(value) / 100).toFixed(2).replace(".", ",");
  }
}

function validateCpfCnpj(value: string): boolean {
  value = value.replace(/\D/g, "");

  if (value.length === 11) {
    return validateCpf(value);
  } else if (value.length === 14) {
    return validateCnpj(value);
  } else {
    return false;
  }

  function validateCpf(cpf: string): boolean {
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let v1 = 0,
      v2 = 0;
    let aux = false;

    for (let i = 1; i < cpf.length; i++) {
      if (cpf[i - 1] !== cpf[i]) {
        aux = true;
        break;
      }
    }

    if (!aux) {
      return false;
    }

    for (let i = 0, p = 10; i < cpf.length - 2; i++, p--) {
      v1 += parseInt(cpf[i]) * p;
    }

    v1 = (v1 * 10) % 11;
    if (v1 === 10) v1 = 0;

    if (v1 !== parseInt(cpf[9])) {
      return false;
    }

    for (let i = 0, p = 11; i < cpf.length - 1; i++, p--) {
      v2 += parseInt(cpf[i]) * p;
    }

    v2 = (v2 * 10) % 11;
    if (v2 === 10) v2 = 0;

    return v2 === parseInt(cpf[10]);
  }

  function validateCnpj(cnpj: string): boolean {
    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    let v1 = 0,
      v2 = 0;
    let aux = false;

    for (let i = 1; i < cnpj.length; i++) {
      if (cnpj[i - 1] !== cnpj[i]) {
        aux = true;
        break;
      }
    }

    if (!aux) {
      return false;
    }

    for (let i = 0, p1 = 5, p2 = 13; i < cnpj.length - 2; i++, p1--, p2--) {
      const digit = parseInt(cnpj[i]);
      if (p1 >= 2) {
        v1 += digit * p1;
      } else {
        v1 += digit * p2;
      }
    }

    v1 = v1 % 11;
    v1 = v1 < 2 ? 0 : 11 - v1;

    if (v1 !== parseInt(cnpj[12])) {
      return false;
    }

    for (let i = 0, p1 = 6, p2 = 14; i < cnpj.length - 1; i++, p1--, p2--) {
      const digit = parseInt(cnpj[i]);
      if (p1 >= 2) {
        v2 += digit * p1;
      } else {
        v2 += digit * p2;
      }
    }

    v2 = v2 % 11;
    v2 = v2 < 2 ? 0 : 11 - v2;

    return v2 === parseInt(cnpj[13]);
  }
}

function displayCompanyLogo() {
  const logoInput = document.getElementById("companyLogo") as HTMLInputElement;
  const logoContainer = document.getElementById("logoContainer");

  if (!logoContainer) {
    console.error("Logo container not found");
    return;
  }

  if (logoInput && logoInput.files && logoInput.files.length > 0) {
    const logoFile = logoInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const result = e.target ? e.target.result : null;
      if (result) {
        logoContainer.innerHTML = `<img src="${result}" alt="Company Logo" style="max-width: 200px; max-height: 100px; display: block;">`;
      } else {
        console.error("Failed to load logo");
      }
    };

    reader.readAsDataURL(logoFile);
  } else {
    logoContainer.innerHTML = "";
  }
}

function addItem() {
  const container = document.getElementById("serviceItems");
  const templateElement = document.getElementById("serviceItemTemplate");

  if (container && templateElement instanceof HTMLTemplateElement) {
    const templateContent = templateElement.content.cloneNode(
      true,
    ) as DocumentFragment;
    const newItem = templateContent.querySelector(
      ".serviceItem",
    ) as HTMLElement | null;

    if (newItem) {
      const index = container.querySelectorAll(".serviceItem").length + 1;

      const descriptionLabel = newItem.querySelector(
        'label[for="description"]',
      );
      const descriptionInput = newItem.querySelector(
        'input[name="description"]',
      ) as HTMLInputElement | null;
      const totalLabel = newItem.querySelector('label[for="total"]');
      const totalInput = newItem.querySelector(
        'input[name="total"]',
      ) as HTMLInputElement | null;
      const removeButton = newItem.querySelector(
        ".removeItemBtn",
      ) as HTMLButtonElement | null;

      if (
        descriptionInput &&
        totalInput &&
        removeButton &&
        descriptionLabel &&
        totalLabel
      ) {
        descriptionInput.id = `description${index}`;
        descriptionInput.name = `description${index}`;
        descriptionLabel.setAttribute("for", `description${index}`);

        totalInput.id = `total${index}`;
        totalInput.name = `total${index}`;
        totalLabel.setAttribute("for", `total${index}`);

        removeButton.onclick = () => removeItem(newItem);

        container.appendChild(newItem);
      }

      setupInputFormats();
    }
  }
}

function removeItem(element: HTMLElement) {
  element.remove();
}

function toggleObservations(observations: string) {
  const observationsElement = document.getElementById("outputObservations");
  const container = document.getElementById("observationsContainer");

  if (observationsElement && container) {
    observationsElement.textContent = observations;
    container.style.display = observations ? "" : "none";
  }
}

function collectFormData(): ReceiptData {
  const serviceItems: ServiceItem[] = collectServiceItems();
  return {
    receiptDate: elements.receiptDateInput.value,
    receiptNumber: elements.receiptNumberInput.value,
    payerName: elements.payerNameInput.value,
    payerCpfCnpj: elements.payerCpfCnpjInput.value,
    payerPhone: elements.payerPhoneInput.value,
    beneficiaryName: elements.beneficiaryNameInput.value,
    beneficiaryCpfCnpj: elements.beneficiaryCpfCnpjInput.value,
    beneficiaryState: elements.beneficiaryStateInput.value,
    observations: elements.observationsInput.value,
    serviceItems: serviceItems,
  };

  function collectServiceItems(): ServiceItem[] {
    const items: ServiceItem[] = [];
    document.querySelectorAll(".serviceItem").forEach((itemElement) => {
      const descriptionInput = itemElement.querySelector(
        '[name^="description"]',
      ) as HTMLInputElement;
      const totalInput = itemElement.querySelector(
        '[name^="total"]',
      ) as HTMLInputElement;
      if (descriptionInput && totalInput && totalInput.value) {
        items.push({
          description: descriptionInput.value,
          total: totalInput.value.replace(",", "."),
        });
      }
    });
    return items;
  }
}

function updateCurrentDateTime() {
  const now = new Date();
  const formattedDateTime = now.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const dateTimeElement = document.getElementById("outputCurrentDate");
  if (dateTimeElement) {
    dateTimeElement.textContent = formattedDateTime;
  }
}

function updateReceiptDisplay(data: ReceiptData) {
  const date = new Date(data.receiptDate);
  date.setDate(date.getDate() + 1);

  setTextContent("outputReceiptDate", date.toLocaleDateString("pt-BR"));
  setTextContent("outputReceiptNumber", data.receiptNumber);
  setTextContent("outputPayerName", data.payerName);
  setTextContent("outputPayerCpfCnpj", data.payerCpfCnpj);
  setTextContent("outputPayerPhone", data.payerPhone);
  setTextContent("outputBeneficiaryName", data.beneficiaryName);
  setTextContent("outputBeneficiaryCpfCnpj", data.beneficiaryCpfCnpj);
  setTextContent("outputBeneficiaryState", data.beneficiaryState);

  updateServiceItemsDisplay(data);

  toggleObservations(data.observations);
}

function setTextContent(elementId: string, text: string) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
  }
}

function updateServiceItemsDisplay(data: ReceiptData) {
  const serviceItemsContainer = document.getElementById("outputServiceItems");
  if (!serviceItemsContainer) {
    return;
  }

  const templateElement = document.getElementById(
    "outputServiceItemTemplate",
  ) as HTMLTemplateElement;
  if (!templateElement) {
    return;
  }

  serviceItemsContainer.innerHTML = "";

  data.serviceItems.forEach((item) => {
    const templateContent = templateElement.content.cloneNode(
      true,
    ) as DocumentFragment;
    const newItem = templateContent.querySelector(".outputServiceItem");

    if (newItem) {
      const descriptionP = newItem.querySelector(
        ".outputItemDescription",
      ) as HTMLParagraphElement;
      const totalP = newItem.querySelector(
        ".outputItemTotal",
      ) as HTMLParagraphElement;

      if (descriptionP && totalP) {
        descriptionP.textContent = item.description;
        totalP.textContent = formatCurrencyValue(parseFloat(item.total));
      }

      serviceItemsContainer.appendChild(newItem);
    }
  });
}

function calculateTotal() {
  let total = 0;
  document.querySelectorAll(".serviceItem").forEach((item) => {
    const totalInput = item.querySelector(
      '[name^="total"]',
    ) as HTMLInputElement;
    if (totalInput) {
      const itemTotal =
        parseFloat(
          totalInput.value.replace(",", ".").replace("R$", "").trim(),
        ) || 0;
      total += itemTotal;
    }
  });

  setTextContent("outputTotal", formatCurrencyValue(total));
}

function formatCurrencyValue(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function generateReceipt() {
  const isValidPayer = validateCpfCnpj(elements.payerCpfCnpjInput.value);
  const isValidBeneficiary = validateCpfCnpj(
    elements.beneficiaryCpfCnpjInput.value,
  );

  if (!isValidPayer || !isValidBeneficiary) {
    alert(
      "Por favor, corrija os CPFs/CNPJs inválidos antes de gerar o recibo.",
    );
    return;
  }

  const data = collectFormData();
  updateReceiptDisplay(data);
  calculateTotal();
  updateCurrentDateTime();
  displayCompanyLogo();
  elements.receiptOutput!.style.display = "block";
  elements.receiptOutputButtons!.style.display = "block";
}

function printReceipt() {
  const receiptElement = elements.receiptOutput;
  if (!receiptElement) {
    console.error("The receipt section was not found!");
    return;
  }

  // Adiciona um delay para garantir que a imagem seja carregada antes da impressão
  setTimeout(() => {
    const receiptContent = receiptElement.innerHTML;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(
        '<html lang="pt-BR"><head><title>Imprimir Recibo</title><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0">',
      );
      printWindow.document.write("<style>");
      printWindow.document.write("</style></head><body>");
      printWindow.document.write(receiptContent);
      printWindow.document.write("</body></html>");
      printWindow.document.close();

      printWindow.onload = function () {
        printWindow.focus();
        printWindow.print();
        printWindow.onafterprint = function () {
          printWindow.close();
        };
      };
    } else {
      console.error("Failed to open the print window.");
    }
  }, 500);
}

function downloadReceipt() {
  const html2pdf = (window as any).html2pdf;

  const receiptElement = elements.receiptOutput;
  if (!receiptElement) {
    console.error("The receipt section was not found!");
    return;
  }

  const options = {
    margin: 1,
    filename: "recibo.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  };

  html2pdf().from(receiptElement).set(options).save();
}

function initializeNewReceipt(): void {
  const form = document.getElementById("receiptForm") as HTMLFormElement | null;
  if (form) {
    form.reset();
    resetServiceItemsToOriginal();
    if (elements.receiptOutput && elements.receiptOutputButtons) {
      elements.receiptOutput.style.display = "none";
      elements.receiptOutputButtons.style.display = "none";
    }
    initializeForm();
  } else {
    console.error("The form was not found!");
  }
}

function resetServiceItemsToOriginal(): void {
  const container = document.getElementById("serviceItems");
  if (!container) {
    console.error("The service items container was not found!");
    return;
  }

  const allItems = container.querySelectorAll(".serviceItem");
  allItems.forEach((item, index) => {
    if (index > 0) {
      item.remove();
    }
  });

  const firstItem = container.querySelector(".serviceItem");
  if (firstItem) {
    const inputs = firstItem.querySelectorAll('input[type="text"]');
    inputs.forEach((input) => {
      if (input instanceof HTMLInputElement) {
        input.value = "";
      }
    });
  } else {
    console.error("No initial service item found!");
  }
}
