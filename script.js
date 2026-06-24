const MANAGER_PASSWORD = "sg2026";
const SALES_TOKEN_DISCOUNT_PERCENT = 15;
const TUNING_MARKUP_PERCENT = 20;
const TOKEN_TUNING_DISCOUNT_PERCENT = 5;
const PARTNERS_STORAGE_KEY = "saintgarage-partners-v1";

const defaultPartners = [
  { id: "beach-bar", name: "Beach Bar", token: "B7M2", uses: 0 },
  { id: "saint-burguer", name: "Saint Burguer", token: "S4G9", uses: 0 },
  { id: "gauderio-parrilla", name: "Gauderio Parrilla", token: "G3P8", uses: 0 },
  { id: "policia-civil", name: "Polícia Civil", token: "P6C1", uses: 0 },
  { id: "hospital", name: "Hospital", token: "H5P7", uses: 0 },
  { id: "171", name: "171", token: "L2N5", uses: 0 },
  { id: "marcone", name: "Marcone", token: "J8N4", uses: 0 }
];

const saleProducts = [
  { name: "Reparo", price: 500 },
  { name: "Kit Reparo", price: 1500, multiple: true, maxQuantity: 4 },
  { name: "Pneu", price: 500, multiple: true, maxQuantity: 6 },
  { name: "Chave Inglesa", price: 2000 },
  { name: "Elevador Hidráulico", price: 1500 },
  { name: "Baú de Teto Carbon", price: 40000 },
  { name: "Baú de Teto Colorido", price: 50000 },
  { name: "Rack de bicicleta", price: 60000 }
];

const state = new Map();
let partners = loadPartners();
let activePartnerId = null;

const categoriesElement = document.getElementById("categorias");
const totalElement = document.getElementById("valorTotal");
const resetButton = document.getElementById("resetar");
const tuningInput = document.getElementById("tunagemCustomizacao");
const tokenInput = document.getElementById("tokenParceiro");
const tokenStatus = document.getElementById("tokenStatus");
const manageButton = document.getElementById("gerenciar");
const manageModal = document.getElementById("gerenciarModal");
const closeManageButton = document.getElementById("fecharGerenciar");
const tokenList = document.getElementById("listaTokens");
const newPartnerInput = document.getElementById("novoEstabelecimento");
const newTokenInput = document.getElementById("novoToken");
const addTokenButton = document.getElementById("adicionarToken");
const manageFeedback = document.getElementById("gerenciarFeedback");

function loadPartners() {
  const savedPartners = localStorage.getItem(PARTNERS_STORAGE_KEY);

  if (!savedPartners) {
    const initialPartners = defaultPartners.map((partner) => ({ ...partner }));
    localStorage.setItem(PARTNERS_STORAGE_KEY, JSON.stringify(initialPartners));
    return initialPartners;
  }

  try {
    const parsedPartners = JSON.parse(savedPartners);
    if (!Array.isArray(parsedPartners) || parsedPartners.length === 0) {
      const initialPartners = defaultPartners.map((partner) => ({ ...partner }));
      localStorage.setItem(PARTNERS_STORAGE_KEY, JSON.stringify(initialPartners));
      return initialPartners;
    }

    defaultPartners.forEach((defaultPartner) => {
      const alreadyExists = parsedPartners.some((partner) => partner.id === defaultPartner.id);
      if (!alreadyExists) {
        parsedPartners.push({ ...defaultPartner });
      }
    });

    localStorage.setItem(PARTNERS_STORAGE_KEY, JSON.stringify(parsedPartners));
    return parsedPartners;
  } catch {
    const initialPartners = defaultPartners.map((partner) => ({ ...partner }));
    localStorage.setItem(PARTNERS_STORAGE_KEY, JSON.stringify(initialPartners));
    return initialPartners;
  }
}

function savePartners() {
  localStorage.setItem(PARTNERS_STORAGE_KEY, JSON.stringify(partners));
}

function money(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function normalizeToken(token) {
  return token.trim().toLowerCase();
}

function productId(productName) {
  return productName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-");
}

function renderSales() {
  categoriesElement.innerHTML = "";
  state.clear();

  const card = document.createElement("article");
  card.className = "categoria venda-centralizada";

  const title = document.createElement("h2");
  title.textContent = "Venda";
  card.appendChild(title);

  saleProducts.forEach((product) => {
    const id = productId(product.name);
    state.set(id, { checked: false, quantity: 0, product });
    card.appendChild(makeProductRow(id, product));
  });

  categoriesElement.appendChild(card);
}

function makeProductRow(id, product) {
  const row = document.createElement("div");
  row.className = "produto";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = id;
  checkbox.addEventListener("change", () => {
    const item = state.get(id);
    item.checked = checkbox.checked;

    if (product.multiple && checkbox.checked && item.quantity === 0) {
      item.quantity = 1;
    }

    if (product.multiple && !checkbox.checked) {
      item.quantity = 0;
    }

    updateQuantity(row, item.quantity);
    updateTotal();
  });

  const label = document.createElement("label");
  label.className = "produto-info";
  label.htmlFor = id;

  const name = document.createElement("span");
  name.className = "produto-nome";
  name.textContent = product.name;

  const price = document.createElement("span");
  price.className = "produto-preco";
  price.textContent = money(product.price);

  label.append(name, price);

  const quantity = document.createElement("div");
  quantity.className = product.multiple ? "quantidade" : "quantidade vazio";

  const minus = makeIconButton("Diminuir quantidade", "assets/menos32.png");
  const amount = document.createElement("span");
  amount.textContent = "0";
  const plus = makeIconButton("Aumentar quantidade", "assets/mais32.png");

  minus.addEventListener("click", () => changeQuantity(id, row, checkbox, -1));
  plus.addEventListener("click", () => changeQuantity(id, row, checkbox, 1));

  quantity.append(minus, amount, plus);
  row.append(checkbox, label, quantity);

  return row;
}

function makeIconButton(label, imagePath) {
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", label);
  button.title = label;

  const image = document.createElement("img");
  image.src = imagePath;
  image.alt = "";

  button.appendChild(image);
  return button;
}

function changeQuantity(id, row, checkbox, direction) {
  const item = state.get(id);
  const maxQuantity = item.product.maxQuantity || Infinity;

  item.quantity = Math.min(maxQuantity, Math.max(0, item.quantity + direction));
  item.checked = item.quantity > 0;
  checkbox.checked = item.checked;

  updateQuantity(row, item.quantity);
  updateTotal();
}

function updateQuantity(row, quantity) {
  const amount = row.querySelector(".quantidade span");
  if (amount) {
    amount.textContent = String(quantity);
  }
}

function findPartnerByToken(token) {
  const normalizedToken = normalizeToken(token);
  return partners.find((partner) => normalizeToken(partner.token) === normalizedToken);
}

function getActivePartner() {
  return partners.find((partner) => partner.id === activePartnerId) || null;
}

function handleTokenInput() {
  const token = tokenInput.value.trim();

  if (!token) {
    activePartnerId = null;
    tokenStatus.textContent = "Sem token aplicado";
    tokenStatus.className = "";
    updateTotal();
    return;
  }

  const partner = findPartnerByToken(token);

  if (!partner) {
    activePartnerId = null;
    tokenStatus.textContent = "Token inválido";
    tokenStatus.className = "token-invalido";
    updateTotal();
    return;
  }

  if (activePartnerId !== partner.id) {
    partner.uses += 1;
    savePartners();
    renderPartnerManager();
  }

  activePartnerId = partner.id;
  tokenStatus.textContent = partner.name;
  tokenStatus.className = "token-valido";
  updateTotal();
}

function updateTotal() {
  const activePartner = getActivePartner();
  let salesTotal = 0;

  state.forEach((item) => {
    if (!item.checked) {
      return;
    }

    const quantity = item.product.multiple ? item.quantity : 1;
    salesTotal += item.product.price * quantity;
  });

  if (activePartner) {
    salesTotal *= 1 - SALES_TOKEN_DISCOUNT_PERCENT / 100;
  }

  const tuningValue = Number(tuningInput.value) || 0;
  const tuningWithMarkup = tuningValue * (1 + TUNING_MARKUP_PERCENT / 100);
  const tuningTotal = activePartner
    ? tuningWithMarkup * (1 - TOKEN_TUNING_DISCOUNT_PERCENT / 100)
    : tuningWithMarkup;

  totalElement.textContent = money(salesTotal + tuningTotal);
}

function resetCalculator() {
  state.forEach((item) => {
    item.checked = false;
    item.quantity = 0;
  });

  document.querySelectorAll('.produto input[type="checkbox"]').forEach((checkbox) => {
    checkbox.checked = false;
  });

  document.querySelectorAll(".quantidade span").forEach((amount) => {
    amount.textContent = "0";
  });

  activePartnerId = null;
  tokenInput.value = "";
  tokenStatus.textContent = "Sem token aplicado";
  tokenStatus.className = "";
  tuningInput.value = "";
  updateTotal();
}

function openManager() {
  const password = prompt("Digite a senha para gerenciar:");

  if (password !== MANAGER_PASSWORD) {
    alert("Senha incorreta.");
    return;
  }

  renderPartnerManager();
  manageFeedback.textContent = "";
  manageModal.hidden = false;
}

function closeManager() {
  manageModal.hidden = true;
}

function renderPartnerManager() {
  tokenList.innerHTML = "";

  if (partners.length === 0) {
    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = 4;
    emptyCell.textContent = "Nenhum estabelecimento cadastrado.";
    emptyCell.className = "tabela-vazia";
    emptyRow.appendChild(emptyCell);
    tokenList.appendChild(emptyRow);
    return;
  }

  partners.forEach((partner) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = partner.name;

    const usesCell = document.createElement("td");
    usesCell.textContent = String(partner.uses || 0);

    const tokenCell = document.createElement("td");
    const tokenField = document.createElement("input");
    tokenField.type = "text";
    tokenField.value = partner.token;
    tokenCell.appendChild(tokenField);

    const actionCell = document.createElement("td");
    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.className = "botao-secundario";
    saveButton.textContent = "SALVAR";
    saveButton.addEventListener("click", () => {
      updatePartnerToken(partner.id, tokenField.value);
    });
    actionCell.appendChild(saveButton);

    row.append(nameCell, usesCell, tokenCell, actionCell);
    tokenList.appendChild(row);
  });
}

function updatePartnerToken(partnerId, token) {
  const partner = partners.find((item) => item.id === partnerId);
  const cleanToken = token.trim();

  if (!partner || !cleanToken) {
    manageFeedback.textContent = "Preencha um token válido.";
    return;
  }

  const tokenAlreadyExists = partners.some((item) => {
    return item.id !== partnerId && normalizeToken(item.token) === normalizeToken(cleanToken);
  });

  if (tokenAlreadyExists) {
    manageFeedback.textContent = "Esse token já está sendo usado.";
    return;
  }

  partner.token = cleanToken;
  savePartners();
  manageFeedback.textContent = "Token atualizado.";
  handleTokenInput();
  renderPartnerManager();
}

function addPartner() {
  const name = newPartnerInput.value.trim();
  const token = newTokenInput.value.trim();

  if (!name || !token) {
    manageFeedback.textContent = "Preencha o nome e o token.";
    return;
  }

  if (partners.some((partner) => normalizeToken(partner.token) === normalizeToken(token))) {
    manageFeedback.textContent = "Esse token já está sendo usado.";
    return;
  }

  partners.push({
    id: `partner-${Date.now()}`,
    name,
    token,
    uses: 0
  });

  newPartnerInput.value = "";
  newTokenInput.value = "";
  savePartners();
  renderPartnerManager();
  manageFeedback.textContent = "Estabelecimento adicionado.";
}

resetButton.addEventListener("click", resetCalculator);
tuningInput.addEventListener("input", updateTotal);
tokenInput.addEventListener("input", handleTokenInput);
manageButton.addEventListener("click", openManager);
closeManageButton.addEventListener("click", closeManager);
addTokenButton.addEventListener("click", addPartner);
manageModal.addEventListener("click", (event) => {
  if (event.target === manageModal) {
    closeManager();
  }
});

renderSales();
updateTotal();
