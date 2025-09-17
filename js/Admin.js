
  // Firebase Config
  const firebaseConfig = {
    apiKey: "AIzaSyDWH3LoCvRmTUMthsUsIA0MBiqZ4NmFyco",
    authDomain: "ecome-72c36.firebaseapp.com",
    projectId: "ecome-72c36",
    storageBucket: "ecome-72c36.firebasestorage.app",
    messagingSenderId: "880319220349",
    appId: "1:880319220349:web:4af4666ec90587a23dbf14",
    measurementId: "G-PCHS3RPXD4"
  };

  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  const grid = document.getElementById("adminProductsGrid");
  const form = document.getElementById("addProductForm");

  // Load Products
  function loadProducts() {
    db.collection("products").get().then(snapshot => {
      grid.innerHTML = "";
      snapshot.forEach(doc => {
        const product = doc.data();
        const id = doc.id;

        grid.innerHTML += `
          <div class="col mb-4">
            <div class="product-item border p-3">
              ${product.discount ? `<span class="badge bg-success">-${product.discount}%</span>` : ""}
              <img src="${product.image}" class="tab-image mb-2">
              <h5>${product.name}</h5>
              <p>Category: ${product.category}</p>
              <p>Price: $${product.price}</p>
              <p>Qty: ${product.quantity} | Rating: ${product.rating}</p>
              <button onclick="editProduct('${id}')" class="btn btn-warning btn-sm">Edit</button>
              <button onclick="deleteProduct('${id}')" class="btn btn-danger btn-sm">Delete</button>
            </div>
          </div>
        `;
      });
    });
  }

  // Add Product
  form.addEventListener("submit", e => {
    e.preventDefault();

    db.collection("products").add({
      name: document.getElementById("productName").value,
      category: document.getElementById("productCategory").value,
      price: parseFloat(document.getElementById("productPrice").value),
      quantity: parseFloat(document.getElementById("productQuantity").value),
      rating: parseFloat(document.getElementById("productRating").value),
      image: document.getElementById("productImage").value,
      discount: parseFloat(document.getElementById("productDiscount").value) || 0
    }).then(() => {
      form.reset();
      loadProducts();
    });
  });

  // Delete Product
  function deleteProduct(id) {
    if(confirm("Are you sure you want to delete this product?")) {
      db.collection("products").doc(id).delete().then(() => {
        loadProducts();
      });
    }
  }

  // Edit Product
  function editProduct(id) {
    db.collection("products").doc(id).get().then(doc => {
      const product = doc.data();
      // Pre-fill form for editing
      document.getElementById("productName").value = product.name;
      document.getElementById("productCategory").value = product.category;
      document.getElementById("productPrice").value = product.price;
      document.getElementById("productQuantity").value = product.quantity;
      document.getElementById("productRating").value = product.rating;
      document.getElementById("productImage").value = product.image;
      document.getElementById("productDiscount").value = product.discount;

      // Change form submit to update
      form.onsubmit = e => {
        e.preventDefault();
        db.collection("products").doc(id).update({
          name: document.getElementById("productName").value,
          category: document.getElementById("productCategory").value,
          price: parseFloat(document.getElementById("productPrice").value),
          quantity: parseFloat(document.getElementById("productQuantity").value),
          rating: parseFloat(document.getElementById("productRating").value),
          image: document.getElementById("productImage").value,
          discount: parseFloat(document.getElementById("productDiscount").value) || 0
        }).then(() => {
          form.reset();
          form.onsubmit = addProductSubmit; // Restore original submit
          loadProducts();
        });
      };
    });
  }

  // Original add product submit function
  function addProductSubmit(e) {
    e.preventDefault();
    db.collection("products").add({
      name: document.getElementById("productName").value,
      category: document.getElementById("productCategory").value,
      price: parseFloat(document.getElementById("productPrice").value),
      quantity: parseFloat(document.getElementById("productQuantity").value),
      rating: parseFloat(document.getElementById("productRating").value),
      image: document.getElementById("productImage").value,
      discount: parseFloat(document.getElementById("productDiscount").value) || 0
    }).then(() => {
      form.reset();
      loadProducts();
    });
  }

  form.onsubmit = addProductSubmit;

  // Load products on page load
  window.onload = loadProducts;
