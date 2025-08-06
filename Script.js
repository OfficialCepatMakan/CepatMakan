const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
const menuBtn = document.getElementById("menu-button");
const sidePanel = document.getElementById("side-panel");
const menuSection = document.getElementById("menu-section");
const cartSection = document.getElementById("cart-section");
const menuBtn2 = document.getElementById("btn-menu");
const orderBtn = document.getElementById("btn-order")
const cartBtn = document.getElementById("btn-cart");
const orderSection = document.getElementById("orders-section")
let user = 

function fetchAndRenderOrders() {
  const ordersRef = db.ref('Orders');
  const ordersList = document.getElementById('orders-list');
  ordersList.innerHTML = ''; // clear existing orders

  ordersRef.once('value', (snapshot) => {
    if (!snapshot.exists()) {
      ordersList.innerHTML = '<p>No orders found.</p>';
      return;
    }

    snapshot.forEach((childSnapshot) => {
      const order = childSnapshot.val();

      const orderDiv = document.createElement('div');
      orderDiv.className = 'order-item'; // you can style this in CSS

      let itemsHTML = '';
      order.items.forEach((item) => {
        itemsHTML += `
          <p>
            ${item.name} x${item.quantity} — Rp${(item.price * item.quantity).toLocaleString()}
          </p>`;
      });

      orderDiv.innerHTML = `
        <h4>${order.name} (${order.grade}-${order.class})</h4>
        <p><strong>Payment:</strong> ${order.paymentMethod}</p>
        <p><strong>Items:</strong>${itemsHTML}</p>
        <p><strong>Total:</strong> Rp${order.total.toLocaleString()}</p>
      `;

      ordersList.appendChild(orderDiv);
    });
  });
}


const sections = {
  home: document.getElementById("home-section"),
  cart: document.getElementById("cart-section"),
  orders: document.getElementById("orders-section")
};

menuBtn.addEventListener("click", () => {
  sidePanel.classList.toggle("show");
});

function hideAllSections() {
  for (let key in sections) {
    sections[key].style.display = "none";
  }
}

sidePanel.querySelectorAll(".nav-buttons button").forEach(btn => {
  btn.addEventListener("click", () => {
    const section = btn.getAttribute("data-section");
    hideAllSections();
    sections[section].style.display = "block";
    sidePanel.classList.remove("show");
  });
});

document.addEventListener("DOMContentLoaded", () => {
    const authContainer = document.getElementById("authContainer");
    document.getElementById('order-btn').addEventListener('click', function () {
      if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
      }
  
      SendOrder(cart);
        });

    menuBtn2.addEventListener("click", () => {
        menuSection.style.display = "grid";
        cartSection.style.display = "none";
        orderSection.style.display = "none";
      });
      cartBtn.addEventListener("click", () => {
        menuSection.style.display = "none";
        cartSection.style.display = "block";
        orderSection.style.display = "none";
      });
      orderBtn.addEventListener("click", () => {
        orderSection.style.display = "block";
        fetchAndRenderOrders();
        menuSection.style.display = "none";
        cartSection.style.display = "none";
      });
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("User signed in:", user.displayName);

        // Clear container first
        authContainer.innerHTML = "";

        // Create profile pic element
        const profilePic = document.createElement("img");
        profilePic.src = user.photoURL || "https://via.placeholder.com/32";
        profilePic.alt = user.displayName;
        profilePic.title = user.displayName;
        profilePic.style.width = "32px";
        profilePic.style.height = "32px";
        profilePic.style.borderRadius = "50%";
        profilePic.style.objectFit = "cover";
        profilePic.style.cursor = "pointer";
        profilePic.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
        profilePic.classList.add("googleProfile");

        authContainer.appendChild(profilePic);

      } else {
        // User not signed in — restore the button
        authContainer.innerHTML = `
          <button class="googleSignInBtn" id="googleSignInBtn">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
            Sign in with Google
          </button>
        `;

        // Re-attach event listener on the new button
        const signInBtn = document.getElementById("googleSignInBtn");
        signInBtn.addEventListener("click", () => {
          auth.signInWithPopup(provider)
            .then((result) => {
              console.log("Signed in as", result.user.displayName);
              user = result.user.displayName
            })
            .catch((error) => {
              console.error("Error during sign-in:", error.message);
            });
        });
      }
    });
  });  
  
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
  function updateCartDisplay() {
    const cartCount = document.querySelector('.cart-count');
    const cartItemsContainer = document.querySelector('.cart-items');
    const emptyCartMessage = document.querySelector('.empty-cart');
    const totalPriceElement = document.querySelector('.total-section .total-price');

    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
      cartItemsContainer.style.display = 'none';
      emptyCartMessage.style.display = 'block';
      cartCount.textContent = '0';
      document.getElementById("order-btn").disabled = true;
      if (totalPriceElement) totalPriceElement.textContent = 'Rp 0';
      return;
    } else {
      document.getElementById("order-btn").disabled = false;
    }

    emptyCartMessage.style.display = 'none';
    cartItemsContainer.style.display = 'block';

    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach((item) => {
      totalItems += item.quantity;
      totalPrice += item.price * item.quantity;

      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';

      cartItem.innerHTML = `
        <div class="item-info">
          <h4>${item.name}</h4>
          <p>Rp ${item.price.toLocaleString('id-ID')} × ${item.quantity}</p>
        </div>
        <div class="item-controls">
          <button class="qty-btn minus">−</button>
          <span>${item.quantity}</span>
          <button class="qty-btn plus">+</button>
        </div>
        <span>Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</span>
      `;

      const minusBtn = cartItem.querySelector('.qty-btn.minus');
      const plusBtn = cartItem.querySelector('.qty-btn.plus');

      minusBtn.addEventListener('click', () => {
        item.quantity--;
        if (item.quantity <= 0) {
          cart = cart.filter(i => i.key !== item.key);
        }
        updateCartDisplay();
      });

      plusBtn.addEventListener('click', () => {
        item.quantity++;
        updateCartDisplay();
      });

      cartItemsContainer.appendChild(cartItem);
    });

    cartCount.textContent = totalItems;

    // ✅ Update total price in .total-section
    if (totalPriceElement) {
      totalPriceElement.textContent = `Rp ${totalPrice.toLocaleString('id-ID')}`;
    }
  }

  function SendOrder(cart) {
    const grade = document.getElementById('grade').value || '';
    const className = document.getElementById('class').value || '';
    const paymentMethod = document.getElementById('paymentmethod').value || '';
    const name = document.getElementById('name').value || '';
  
    // Validation (use OR `||` instead of AND `&&` to catch any empty field)
    if (
      grade.trim() === '' ||
      className.trim() === '' ||
      paymentMethod.trim() === '' ||
      name.trim() === ''
    ) {
      alert("Please fill all fields");
      return;
    }
  
    const ordersRef = db.ref('Orders');
  
    const orderData = {
      name: name,
      grade: grade,
      class: className,
      paymentMethod: paymentMethod,
      items: cart,
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      mail: user.email,
      timestamp: new Date().toISOString()
      
    };
  
    ordersRef.push(orderData)
      .then(() => {
        console.log('Order saved successfully.');
        alert("Order submitted!");
      
        // 🔁 Clear the cart array (in-place)
        cart.length = 0;
      
        // 🔄 Update UI
        updateCartDisplay();
      })
      .catch((error) => {
        console.error('Error saving order:', error);
        alert('Something went wrong, order not sent!');
      });
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

      updateCartDisplay();
    });
  }






