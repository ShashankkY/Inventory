
    const API_URL = "https://crudcrud.com/api/9d68887f66c84a198a73ac66ba70ad7e/storeitems";

    const itemForm = document.getElementById("item-form");
    const itemList = document.getElementById("itemList");

    window.addEventListener("DOMContentLoaded", loadItems);

    itemForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const item = {
        name: itemForm.itemName.value,
        description: itemForm.description.value,
        price: parseFloat(itemForm.price.value),
        quantity: parseInt(itemForm.quantity.value)
      };

      try {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item)
        });
        itemForm.reset();
        loadItems();
      } catch (err) {
        console.error("Error adding item:", err);
      }
    });

    async function loadItems() {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        itemList.innerHTML = "";
        data.forEach(displayItem);
      } catch (err) {
        console.error("Error loading items:", err);
      }
    }

    function displayItem(item) {
      const div = document.createElement("div");
      div.className = "item";

      const header = document.createElement("div");
      header.className = "item-header";

      const details = document.createElement("div");
      details.className = "item-details";
      details.innerHTML = `
        <div><strong>Item Name:</strong> ${item.name}</div>
        <div><strong>Description:</strong> ${item.description}</div>
        <div><strong>Price:</strong> ₹${item.price}</div>
        <div class="quantity-info">
          <div><strong>Available Quantity:</strong> <span id="qty-${item._id}">${item.quantity}</span></div>
          <div id="status-${item._id}" class="status-message ${item.quantity <= 0 ? 'out-of-stock' : ''}">${item.quantity <= 0 ? "Out of Stock" : ""}</div>
          <div id="cost-${item._id}" class="cost-display"></div>
        </div>
      `;

      const actions = document.createElement("div");
      actions.className = "item-actions";

      // Buy section with preset buttons and custom quantity
      const buySection = document.createElement("div");
      buySection.className = "buy-section";

      // Preset buy buttons
      const buyButtons = document.createElement("div");
      buyButtons.className = "buy-buttons";

      [1, 2, 3].forEach((count) => {
        const btn = document.createElement("button");
        btn.textContent = `Buy ${count}`;
        btn.disabled = item.quantity < count;
        btn.addEventListener("click", () => handleBuy(item, count));
        buyButtons.appendChild(btn);
      });

      // Custom quantity buy
      const customBuy = document.createElement("div");
      customBuy.className = "custom-buy";

      const customInput = document.createElement("input");
      customInput.type = "number";
      customInput.placeholder = "Qty";
      customInput.min = 1;
      customInput.max = item.quantity;

      const customBtn = document.createElement("button");
      customBtn.textContent = "Buy";
      customBtn.addEventListener("click", () => {
        const qty = parseInt(customInput.value);
        if (qty > 0 && qty <= item.quantity) {
          handleBuy(item, qty);
          customInput.value = "";
        } else if (qty > item.quantity) {
          alert(`Only ${item.quantity} items available in stock!`);
        } else {
          alert("Enter a valid quantity to buy.");
        }
      });

      customBuy.appendChild(customInput);
      customBuy.appendChild(customBtn);

      buySection.appendChild(buyButtons);
      buySection.appendChild(customBuy);

      // Restock section
      const restockSection = document.createElement("div");
      restockSection.className = "restock-section";

      const restockInput = document.createElement("input");
      restockInput.type = "number";
      restockInput.placeholder = "Add Qty";
      restockInput.min = 1;

      const restockBtn = document.createElement("button");
      restockBtn.textContent = "Restock";
      restockBtn.addEventListener("click", () => {
        const qtyToAdd = parseInt(restockInput.value);
        if (qtyToAdd > 0) {
          handleRestock(item, qtyToAdd);
          restockInput.value = "";
        } else {
          alert("Enter a valid quantity to add.");
        }
      });

      restockSection.appendChild(restockInput);
      restockSection.appendChild(restockBtn);

      actions.appendChild(buySection);
      actions.appendChild(restockSection);

      header.appendChild(details);
      header.appendChild(actions);
      div.appendChild(header);

      itemList.appendChild(div);
    }

    async function handleBuy(item, count) {
      const newQty = item.quantity - count;

      if (newQty < 0) {
        alert("Not enough stock to buy this quantity!");
        return;
      }

      try {
        await fetch(`${API_URL}/${item._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: item.name,
            description: item.description,
            price: item.price,
            quantity: newQty
          })
        });

        const costElement = document.getElementById(`cost-${item._id}`);
        costElement.textContent = `You bought ${count} for ₹${item.price * count}`;

        loadItems();
      } catch (err) {
        console.error("Error updating item:", err);
      }
    }

    async function handleRestock(item, addedQty) {
      const newQty = item.quantity + addedQty;

      try {
        await fetch(`${API_URL}/${item._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: item.name,
            description: item.description,
            price: item.price,
            quantity: newQty
          })
        });

        loadItems();
      } catch (err) {
        console.error("Error restocking item:", err);
      }
    }
  