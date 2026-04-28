import { importedProducts } from './products.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

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

let currentUserEmail = "";
let currentLang = 'fr';
let currentCurrency = 'XOF';
let searchQuery = '';
let isLoginMode = true;

const exchangeRates = { XOF: 1, MRU: 0.068 }; 
const currencySymbols = { XOF: 'FCFA', MRU: 'UM' };
const translations = { ar: { buyBtn: "شراء الآن" }, en: { buyBtn: "Buy Now" }, fr: { buyBtn: "Acheter" } };

const productsGrid = document.querySelector('.products-grid');
const authSection = document.getElementById('authSection');
const storeSection = document.getElementById('storeSection');

// --- دالة تكبير الصور (التي طلبتها) ---
window.openImage = (src) => {
    const overlay = document.getElementById('imageOverlay');
    const fullImg = document.getElementById('fullImage');
    if(overlay && fullImg) {
        fullImg.src = src;
        overlay.style.display = 'flex';
    }
};

// --- محرك الدخول والخروج ---
onAuthStateChanged(auth, (user) => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (user) {
        currentUserEmail = user.email;
        authSection.style.display = 'none';
        storeSection.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'block'; 
        renderProducts();
    } else {
        authSection.style.display = 'flex';
        storeSection.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none'; 
    }
});

// --- وظيفة زر تسجيل الخروج النهائية ---
window.addEventListener('load', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            signOut(auth).then(() => {
                alert("À bientôt !");
                window.location.reload(); 
            }).catch(err => console.error(err));
        };
    }
});

function renderProducts() {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';
    const symbol = currencySymbols[currentCurrency];
    const t = translations[currentLang];

    const filtered = importedProducts.filter(p => p.name.fr.toLowerCase().includes(searchQuery.toLowerCase()));

    filtered.forEach(p => {
        let price = currentCurrency === 'XOF' ? Math.round(p.originalPriceCFA) : Math.round(p.originalPriceCFA * 0.068);

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image" style="background-image: url('${p.image}'); cursor: zoom-in;" onclick="openImage('${p.image}')"></div>
            <div class="product-info">
                <h3 class="p-name" data-fr="${p.name.fr}">${p.name.fr}</h3>
                <p class="price">${price.toLocaleString()} ${symbol}</p>
                <button class="buy-btn">${t.buyBtn}</button>
            </div>`;
        productsGrid.appendChild(card);
    });
    attachBuyEvents();
}

// أضف هنا باقي دوال Firebase (signIn/signUp) التي كانت لديك..