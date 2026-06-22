const PARTNER_DISCOUNT_PERCENT = 15;

const categories = [
  {
    name: "Venda",
    products: [
      { name: "Reparo", price: 500 },
      { name: "Kit Reparo", price: 1500, multiple: true, maxQuantity: 4 },
      { name: "Pneu", price: 500, multiple: true, maxQuantity: 6 },
      { name: "Chave Inglesa", price: 2000 },
      { name: "Elevador Hidráulico", price: 1500 },
      { name: "Baú de Teto Carbon", price: 40000 },
      { name: "Baú de Teto Colorido", price: 50000 },
      { name: "Rack de bicicleta", price: 60000 }
    ]
  },
  {
    name: "Custom",
    products: [
      { name: "Aerofólio", price: 1800 },
      { name: "Para-choque dianteiro", price: 1800 },
      { name: "Para-choque traseiro", price: 1800 },
      { name: "Saias laterais", price: 1800 },
      { name: "Escapamento", price: 1800 },
      { name: "Teto", price: 1800 },
      { name: "Capô", price: 1800 },
      { name: "Grelha", price: 1800 },
      { name: "Paralamas", price: 1800 },
      { name: "Gaiola", price: 1800 },
      { name: "Insufilm", price: 1800 },
      { name: "Buzina", price: 1800 }
    ]
  },
  {
    name: "Roda",
    products: [
      { name: "Roda", price: 1800 },
      { name: "Custom", price: 1800 },
      { name: "Drift", price: 6000 },
      { name: "Fumaça", price: 180 }
    ]
  },
  {
    name: "Pintura",
    products: [
      { name: "Metálico", price: 3000 },
      { name: "Fosco", price: 3480 },
      { name: "Metal", price: 3600 },
      { name: "Cromado", price: 3360 },
      { name: "Adesivo", price: 1800 },
      { name: "Roda", price: 360 }
    ]
  },
  {
    name: "Luzes",
    products: [
      { name: "Neon", price: 1800 },
      { name: "Xenon", price: 1800 }
    ]
  },
  {
    name: "Performance",
    note: "(Número de estágios aplicados)",
    products: [
      { name: "Motor", stages: [24000, 48000, 72000, 96000, 120000] },
      { name: "Freio", stages: [30000, 42000, 54000, 66000] },
      { name: "Transmissão", stages: [24000, 48000, 72000, 96000] },
      { name: "Suspensão", stages: [18000, 30000, 42000, 54000] },
      { name: "Turbo", price: 24000 },
      { name: "Blindagem", stages: [24000, 48000, 72000, 96000, 120000] }
    ]
  }
];

const state = new Map();
const categoriesElement = document.getElementById("categorias");
const totalElement = document.getElementById("valorTotal");
const partnerCheckbox = document.getElementById("vendaParceria");
const resetButton = document.getElementById("resetar");
const tuningInput = document.getElementById("tunagemCustomizacao");

function money(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function productId(categoryName, productName) {
  return `${categoryName}-${productName}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-");
}

function render() {
  categoriesElement.innerHTML = "";
  state.clear();

  const columns = [0, 1, 2].map(() => {
    const column = document.createElement("div");
    column.className = "coluna-categoria";
    categoriesElement.appendChild(column);
    return column;
  });

  const layout = {
    "Venda": 0,
    "Roda": 0,
    "Custom": 1,
    "Luzes": 1,
    "Pintura": 2,
    "Performance": 2
  };

  const orderedCategories = [
    "Venda",
    "Roda",
    "Custom",
    "Luzes",
    "Pintura",
    "Performance"
  ].map((name) => categories.find((category) => category.name === name));

  orderedCategories.forEach((category) => {
    const card = document.createElement("article");
    card.className = "categoria";

    const title = document.createElement("h2");
    title.textContent = category.name;
    card.appendChild(title);

    if (category.note) {
      const note = document.createElement("p");
      note.className = "categoria-nota";
      note.textContent = category.note;
      card.appendChild(note);
    }

    category.products.forEach((product) => {
      const id = productId(category.name, product.name);
      state.set(id, { checked: false, quantity: 0, stage: 0, product });

      if (product.stages) {
        card.appendChild(makeStageRow(id, product));
      } else {
        card.appendChild(makeProductRow(id, product));
      }
    });

    const columnIndex = layout[category.name] || 0;
    columns[columnIndex].appendChild(card);
  });
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

function makeStageRow(id, product) {
  const row = document.createElement("div");
  row.className = "produto produto-estagio";

  const spacer = document.createElement("span");
  spacer.className = "stage-spacer";

  const info = document.createElement("div");
  info.className = "produto-info";

  const name = document.createElement("span");
  name.className = "produto-nome";
  name.textContent = product.name;

  const price = document.createElement("span");
  price.className = "produto-preco stage-price";
  price.textContent = "Nenhum estágio";

  info.append(name, price);

  const controls = document.createElement("div");
  controls.className = "estagios";

  product.stages.forEach((stagePrice, index) => {
    const stageNumber = index + 1;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(stageNumber);
    button.title = `${product.name} estágio ${stageNumber}: ${money(stagePrice)}`;
    button.addEventListener("click", () => selectStage(id, row, stageNumber));
    controls.appendChild(button);
  });

  row.append(spacer, info, controls);

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

function selectStage(id, row, stageNumber) {
  const item = state.get(id);
  item.stage = item.stage === stageNumber ? 0 : stageNumber;
  item.checked = item.stage > 0;

  const buttons = row.querySelectorAll(".estagios button");
  buttons.forEach((button, index) => {
    button.classList.toggle("ativo", index + 1 === item.stage);
  });

  const price = row.querySelector(".stage-price");
  price.textContent = item.stage
    ? money(item.product.stages[item.stage - 1])
    : "Nenhum estágio";

  updateTotal();
}

function updateQuantity(row, quantity) {
  const amount = row.querySelector(".quantidade span");
  if (amount) {
    amount.textContent = String(quantity);
  }
}

function updateTotal() {
  let total = 0;

  state.forEach((item) => {
    if (!item.checked) {
      return;
    }

    if (item.product.stages) {
      total += item.product.stages[item.stage - 1] || 0;
      return;
    }

    const quantity = item.product.multiple ? item.quantity : 1;
    total += item.product.price * quantity;
  });

  const tuningValue = Number(tuningInput.value) || 0;
  total += tuningValue * 1.2;

  if (partnerCheckbox.checked) {
    total -= total * (PARTNER_DISCOUNT_PERCENT / 100);
  }

  totalElement.textContent = money(total);
}

function resetCalculator() {
  state.forEach((item) => {
    item.checked = false;
    item.quantity = 0;
    item.stage = 0;
  });

  document.querySelectorAll('.produto input[type="checkbox"]').forEach((checkbox) => {
    checkbox.checked = false;
  });

  document.querySelectorAll(".quantidade span").forEach((amount) => {
    amount.textContent = "0";
  });

  document.querySelectorAll(".estagios button").forEach((button) => {
    button.classList.remove("ativo");
  });

  document.querySelectorAll(".stage-price").forEach((price) => {
    price.textContent = "Nenhum estágio";
  });

  partnerCheckbox.checked = false;
  tuningInput.value = "";
  updateTotal();
}

partnerCheckbox.addEventListener("change", updateTotal);
resetButton.addEventListener("click", resetCalculator);
tuningInput.addEventListener("input", updateTotal);

render();
updateTotal();
