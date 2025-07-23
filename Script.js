const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

document.addEventListener("DOMContentLoaded", () => {
    const signInBtn = document.getElementById("googleSignInBtn");
  
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("User signed in:", user.displayName);
      
        // Remove the sign-in button if it exists
        if (signInBtn && signInBtn.parentNode) {
          signInBtn.remove();
        }
      
        // Create and insert profile image
        console.log(user.photoURL)
        const profilePic = document.createElement("img");
        profilePic.src = user.photoURL;
        profilePic.alt = user.displayName;
        profilePic.title = user.displayName;
        profilePic.style.width = "32px";
        profilePic.style.height = "32px";
        profilePic.style.borderRadius = "50%";
        profilePic.style.cursor = "pointer";
        profilePic.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
        profilePic.classList.add("googleProfile");
      
        // Insert where the sign-in button used to be
        const authContainer = document.getElementById("authContainer"); // <-- wrap the button in a div with this id
        if (authContainer) {
          authContainer.appendChild(profilePic);
        }
      } else {
        console.log("No user signed in.");
      }
    });
  
    // Sign in on click
    if (signInBtn) {
      signInBtn.addEventListener("click", function () {
        auth
          .signInWithPopup(provider)
          .then((result) => {
            console.log("Signed in as", result.user.displayName);
            // DOM update will happen via onAuthStateChanged
          })
          .catch((error) => {
            console.error("Error during sign-in:", error.message);
          });
      });
    }
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
