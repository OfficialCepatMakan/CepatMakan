  // Reference to menu items in Realtime DB
  const mainCourseRef = db.ref('menu/main_course');
    let cart = []
  
    function changeQty(i,delta){
      cart[i].qty += delta;
      if(cart[i].qty<1) cart.splice(i,1);
      renderCart();
    }
  
    mainCourseRef.once('value', (snapshot) => {
    const items = snapshot.val();
    const menuGrid = document.querySelector('.menu-grid');
    let count = 0;
    
    menuGrid.innerHTML = ''; // Clear existing items
    
    for (let key in items) {
      const item = items[key];
      const menuItem = createMenuItem(key, item);
      menuGrid.appendChild(menuItem);
      count++;
    }
  
    document.querySelector('.item-count').textContent = `${count} items`;
  });

  function createMenuItem(key, item) {
    const menuItem = document.createElement('div');
    menuItem.className = 'menu-item';

    menuItem.innerHTML = `
      <div class="item-image"><img src="${item.image}"></img></div>
      <div class="item-content">
        <div class="item-header">
          <h4 class="item-name">${item.name}</h4>
          <span class="item-price">Rp ${item.price.toLocaleString('id-ID')}</span>
        </div>
        <p class="item-description">${item.description}</p>
        <div class="item-actions">
          <div class="quantity-controls">
            <button class="qty-btn" disabled>−</button>
            <span>0</span>
            <button class="qty-btn">+</button>
          </div>
          <button class="add-btn">Add to Cart</button>
        </div>
      </div>
    `;

    setupQuantityLogic(menuItem, key, item);
    return menuItem;
  }

  function setupQuantityLogic(menuItem, key, item) {
    const qtyBtns = menuItem.querySelectorAll('.qty-btn');
    const qtyDisplay = menuItem.querySelector('.quantity-controls span');
    const addToCartBtn = menuItem.querySelector('.add-btn');

    let quantity = 0;

    qtyBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.textContent === '+') {
          quantity++;
        } else if (btn.textContent === '−' && quantity > 0) {
          quantity--;
        }

        qtyDisplay.textContent = quantity;
        qtyBtns[0].disabled = quantity === 0;
      });
    });

    addToCartBtn.addEventListener('click', () => {
      if (quantity === 0) return;

      const existing = cart.find(c => c.key === key);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({
          key: key,
          name: item.name,
          price: item.price,
          quantity: quantity
        });
      }

      // Reset
      quantity = 0;
      qtyDisplay.textContent = '0';
      qtyBtns[0].disabled = true;

      console.log('Cart:', cart);
    });
  }
