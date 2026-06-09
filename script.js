const PARTNER_DISCOUNT_PERCENT = 0;

const categories = [
  {
    name: "Venda",
    products: [
      { name: "Kit Reparo Avançado", price: 750, multiple: true },
      { name: "Pneus", price: 300, multiple: true },
      { name: "Chave Inglesa", price: 1200, multiple: true },
      { name: "Elevador Hidráulico", price: 3000, multiple: true },
      { name: "Rastreador", price: 15000, multiple: true }
    ]
  },
  {
    name: "Parte Interna",
    products: [
      { name: "Volante", price: 1000, multiple: false },
      { name: "Banco", price: 1000, multiple: false },
      { name: "Chassis", price: 1500, multiple: false }
    ]
  },
  {
    name: "Parte Externa",
    products: [
      { name: "Roda", price: 2000, multiple: false },
      { name: "Insulfilm Escuro", price: 8000, multiple: false },
      { name: "Placa", price: 2500, multiple: false },
      { name: "Aerofólio", price: 4000, multiple: false },
      { name: "Para-choque Dianteiro", price: 3500, multiple: false },
      { name: "Para-choque Traseiro", price: 3500, multiple: false },
      { name: "Saias Laterais", price: 3200, multiple: false },
      { name: "Escapamento", price: 3200, multiple: false },
      { name: "Grelha", price: 1500, multiple: false },
      { name: "Capô", price: 3000, multiple: false },
      { name: "Paralamas", price: 2500, multiple: false },
      { name: "Teto", price: 2500, multiple: false }
    ]
  },
  {
    name: "Pinturas e Decals",
    products: [
      { name: "RGB", price: 3000, multiple: false },
      { name: "Básica", price: 1500, multiple: false },
      { name: "Fosca", price: 4000, multiple: false },
      { name: "Metálica", price: 4800, multiple: false },
      { name: "Croma", price: 8200, multiple: false },
      { name: "Camaleao", price: 7200, multiple: false },
      { name: "Pérola", price: 750, multiple: false },
      { name: "Cor das Rodas", price: 3500, multiple: false },
      { name: "Fumaça do Pneu", price: 5800, multiple: false }
    ]
  },
  {
    name: "Iluminação",
    products: [
      { name: "Neon", price: 12500, multiple: false },
      { name: "Xenon", price: 15000, multiple: false },
      { name: "Luz RGB", price: 1500, multiple: false }
    ]
  }
];

const state = new Map();
const categoriesElement = document.getElementById("categorias");
const totalElement = document.getElementById("valorTotal");
const partnerCheckbox = document.getElementById("vendaParceria");
const resetButton = document.getElementById("resetar");

function money(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function productId(categoryName, productName) {
  return `${categoryName}-${productName}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function render() {
  categoriesElement.innerHTML = "";

  categories.forEach((category) => {
    const card = document.createElement("article");
    card.className = "categoria";

    const title = document.createElement("h2");
    title.textContent = category.name;
    card.appendChild(title);

    category.products.forEach((product) => {
      const id = productId(category.name, product.name);
      state.set(id, { checked: false, quantity: 0, product });

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
      card.appendChild(row);
    });

    categoriesElement.appendChild(card);
  });
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

  item.quantity = Math.max(0, item.quantity + direction);
  item.checked = item.quantity > 0;
  checkbox.checked = item.checked;

  updateQuantity(row, item.quantity);
  updateTotal();
}

function updateQuantity(row, quantity) {
  const amount = row.querySelector(".quantidade span");
  amount.textContent = String(quantity);
}

function updateTotal() {
  let total = 0;

  state.forEach((item) => {
    if (!item.checked) {
      return;
    }

    const quantity = item.product.multiple ? item.quantity : 1;
    total += item.product.price * quantity;
  });

  if (partnerCheckbox.checked) {
    total -= total * (PARTNER_DISCOUNT_PERCENT / 100);
  }

  totalElement.textContent = money(total);
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

  partnerCheckbox.checked = false;
  updateTotal();
}

partnerCheckbox.addEventListener("change", updateTotal);
resetButton.addEventListener("click", resetCalculator);

render();
updateTotal();
