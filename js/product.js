
// --- Firebase config ---
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
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- Save product to Firebase ---
async function saveProductToFirebase(product) {
  try {
    const docRef = db.collection("products").doc(product.id.toString());
    const docSnap = await docRef.get();

    if (!docSnap.exists) { // Save only if not already in Firebase
      await docRef.set({
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        unit: product.unit || "Unit",
        image: product.image,
        rating: product.rating || 0,
        discount: product.discount || null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log("Product saved to Firebase:", product.name);
    }
  } catch (err) {
    console.error("Error saving product:", err);
  }
}

// --- Load products ---
function loadProducts() {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const grid = document.getElementById("productsGridAll");
  if (!grid) return;

  grid.innerHTML = "";

  products.forEach(product => {
    grid.insertAdjacentHTML("beforeend", createProductHTML(product));
  });

  attachQuantityEvents();
  attachAddToCartEvents();

  // --- Save all products to Firebase after rendering ---
  products.forEach(product => saveProductToFirebase(product));
}

// Run when page loads
window.addEventListener("DOMContentLoaded", loadProducts);

