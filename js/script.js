import { importedProducts } from './products.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// إعدادات Firebase (التي أرسلتها)
const firebaseConfig = {
  apiKey: "AIzaSyCI60T3r88_PBhRxc9zV2tCeGC59GbOW4A",
  authDomain: "ebnou-store.firebaseapp.com",
  projectId: "ebnou-store",
  storageBucket: "ebnou-store.firebasestorage.app",
  messagingSenderId: "28443393930",
  appId: "1:28443393930:web:2ba0d8f17fe66d52db9273"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let currentCurrency = 'XOF';
let currentLang = 'fr';
const currencySymbols = { XOF: 'FCFA', MRU: 'UM' };
const translations = { ar: { buyBtn: "شراء الآن" }, en: { buyBtn: "Buy Now" }, fr: { buyBtn: "Acheter" } };

// دالة عرض المنتجات المحسنة (تضمن التوسيط)
function renderProducts() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    productsGrid.innerHTML = '';

    importedProducts.forEach(p => {
        let finalPrice = currentCurrency === 'XOF' ? 
            Math.round(p.originalPriceCFA) : 
            Math.round(p.originalPriceCFA * 0.068);

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image" style="background-image: url('${p.image}');" onclick="openImage('${p.image}')"></div>
            <div class="product-info">
                <h3>${p.name[currentLang] || p.name.fr}</h3>
                <p class="price">${finalPrice.toLocaleString()} ${currencySymbols[currentCurrency]}</p>
                <button class="buy-btn">${translations[currentLang].buyBtn}</button>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

// نافذة تكبير الصور
window.openImage = (src) => {
    const overlay = document.getElementById('imageOverlay');
    document.getElementById('fullImage').src = src;
    overlay.style.display = 'flex';
};

// التحكم في حالة المستخدم (Firebase)
onAuthStateChanged(auth, (user) => {
    const authSection = document.getElementById('authSection');
    const storeSection = document.getElementById('storeSection');
    if (user) {
        authSection.style.display = 'none';
        storeSection.style.display = 'block';
        renderProducts();
    } else {
        authSection.style.display = 'flex';
        storeSection.style.display = 'none';
    }
});

// تفعيل تسجيل الدخول
document.getElementById('authForm').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) { alert("Error: " + error.message); }
};