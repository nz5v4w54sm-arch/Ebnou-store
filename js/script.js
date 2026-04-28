import { importedProducts } from './products.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

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

// --- إعدادات المتجر ---
let currentUserEmail = "";
let currentLang = 'fr';
let currentCurrency = 'XOF';
let searchQuery = '';
let isLoginMode = true; // متغير التحكم في وضع الدخول/التسجيل

const exchangeRates = { XOF: 1, MRU: 0.068 }; 
const currencySymbols = { XOF: 'FCFA', MRU: 'UM' };

const translations = {
    ar: { buyBtn: "شراء الآن", dir: "rtl" },
    en: { buyBtn: "Buy Now", dir: "ltr" },
    fr: { buyBtn: "Acheter", dir: "ltr" }
};

// --- تعريف عناصر واجهة المستخدم ---
const productsGrid = document.querySelector('.products-grid');
const authSection = document.getElementById('authSection');
const storeSection = document.getElementById('storeSection');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
const mainBtn = document.getElementById('mainBtn');

// --- 🛑 محرك التبديل (هذا الجزء الذي كان ينقصك) 🛑 ---
if (loginTab && signupTab) {
    signupTab.onclick = () => {
        isLoginMode = false;
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        confirmPasswordGroup.style.display = 'block';
        mainBtn.innerText = "Créer un compte";
    };

    loginTab.onclick = () => {
        isLoginMode = true;
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        confirmPasswordGroup.style.display = 'none';
        mainBtn.innerText = "Se Connecter";
    };
}

// --- التعامل مع حالة المستخدم (Firebase) ---
onAuthStateChanged(auth, (user) => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (user) {
        currentUserEmail = user.email;
        authSection.style.display = 'none';
        storeSection.style.display = 'block';
        // إظهار الزر عند الدخول
        if (logoutBtn) logoutBtn.style.display = 'block'; 
        renderProducts();
    } else {
        authSection.style.display = 'flex';
        storeSection.style.display = 'none';
        // إخفاء الزر عند الخروج
        if (logoutBtn) logoutBtn.style.display = 'none'; 
    }
});

// --- عرض المنتجات ---
function renderProducts() {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';
    const symbol = currencySymbols[currentCurrency];
    const t = translations[currentLang];

    const filtered = importedProducts.filter(p => {
        return p.name && p.name.fr && p.name.fr.toLowerCase().includes(searchQuery.toLowerCase());
    });

    filtered.forEach(p => {
        const basePrice = p.originalPriceCFA;
        let finalPrice = currentCurrency === 'XOF' ? Math.round(basePrice) : Math.round(basePrice * 0.068);

        productsGrid.innerHTML += `
            <div class="product-card">
                <div class="product-image" style="background-image: url('${p.image}');"></div>
                <div class="product-info">
                    <h3 class="p-name" data-fr="${p.name.fr}">${p.name.fr}</h3>
                    <p class="price">${finalPrice.toLocaleString()} ${symbol}</p>
                    <button class="buy-btn">${t.buyBtn}</button>
                </div>
            </div>`;
    });
    attachBuyEvents();
}

// --- أحداث الشراء والواتساب ---
let selectedProduct = ""; let selectedPrice = "";
function attachBuyEvents() {
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            selectedPrice = e.target.previousElementSibling.innerText;
            selectedProduct = e.target.parentElement.querySelector('.p-name').getAttribute('data-fr');
            document.getElementById('checkoutProductName').innerText = selectedProduct;
            document.getElementById('checkoutTotal').innerText = selectedPrice;
            document.getElementById('checkoutModal').style.display = 'flex';
        });
    });
}

document.getElementById('confirmOrderBtn')?.addEventListener('click', () => {
    const address = document.getElementById('shippingAddress').value;
    const country = "Sénégal 🇸🇳";
    if (address === "") { alert("Veuillez entrer votre adresse"); return; }

    const message = `Order Details:\n- User: ${currentUserEmail}\n- Product: ${selectedProduct}\n- Price: ${selectedPrice}\n- Country: ${country}\n- Address: ${address}`;
    window.open(`https://wa.me/22227070586?text=${encodeURIComponent(message)}`, '_blank');
});

// --- مستمعات الأحداث ---
document.getElementById('currencySelect')?.addEventListener('change', (e) => { currentCurrency = e.target.value; renderProducts(); });
document.getElementById('searchInput')?.addEventListener('input', (e) => { searchQuery = e.target.value; renderProducts(); });
document.getElementById('closeCheckout')?.addEventListener('click', () => { document.getElementById('checkoutModal').style.display = 'none'; });
// كود المالك لإدارة الخروج
window.addEventListener('load', () => {
    // نبحث عن كل أزرار الخروج (لو وجد أكثر من واحد بالخطأ)
    const logoutButtons = document.querySelectorAll('[id="logoutBtn"]');
    
    logoutButtons.forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault(); // منع أي تصرف غريب للمتصفح
            signOut(auth).then(() => {
                alert("تم تسجيل الخروج بنجاح - À bientôt !");
                window.location.reload(); 
            }).catch((error) => console.error("Erreur:", error));
        };
    });
});