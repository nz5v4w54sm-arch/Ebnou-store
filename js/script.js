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

// --- إعدادات المتجر ---
let currentUserEmail = "";
let currentLang = 'fr';
let currentCurrency = 'XOF';
let searchQuery = '';
let isLoginMode = true; 

const exchangeRates = { XOF: 1, MRU: 0.068 }; 
const currencySymbols = { XOF: 'FCFA', MRU: 'UM' };
const translations = { ar: { buyBtn: "شراء الآن" }, en: { buyBtn: "Buy Now" }, fr: { buyBtn: "Acheter" } };

// --- تعريف العناصر ---
const productsGrid = document.querySelector('.products-grid');
const authSection = document.getElementById('authSection');
const storeSection = document.getElementById('storeSection');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
const mainBtn = document.getElementById('mainBtn');
const authForm = document.getElementById('authForm');

// --- 1. محرك التبديل بين الدخول والتسجيل ---
if (loginTab && signupTab) {
    signupTab.onclick = () => {
        isLoginMode = false;
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        confirmPasswordGroup.style.display = 'block';
        mainBtn.innerText = "S'inscrire";
    };

    loginTab.onclick = () => {
        isLoginMode = true;
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        confirmPasswordGroup.style.display = 'none';
        mainBtn.innerText = "Se Connecter";
    };
}

// --- 2. محرك التنفيذ (هذا ما كان ينقصك ليعمل الزر) ---
authForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;

    try {
        if (isLoginMode) {
            // عملية تسجيل الدخول
            await signInWithEmailAndPassword(auth, email, password);
            alert("Bienvenue ! تم الدخول بنجاح");
        } else {
            // عملية إنشاء حساب جديد
            const confirmPass = document.getElementById('authConfirmPassword').value;
            if (password !== confirmPass) {
                alert("كلمات المرور غير متطابقة !");
                return;
            }
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Compte créé ! تم إنشاء الحساب بنجاح");
        }
    } catch (error) {
        alert("خطأ: " + error.message);
    }
};

// --- 3. التعامل مع حالة المستخدم وزر الخروج ---
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

// تفعيل زر الخروج
window.addEventListener('load', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            signOut(auth).then(() => window.location.reload());
        };
    }
});

// --- 4. عرض المنتجات وتكبير الصور ---
window.openImage = (src) => {
    const overlay = document.getElementById('imageOverlay');
    const fullImg = document.getElementById('fullImage');
    fullImg.src = src;
    overlay.style.display = 'flex';
};

function renderProducts() {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';
    const symbol = currencySymbols[currentCurrency];
    const t = translations[currentLang];

    const filtered = importedProducts.filter(p => p.name.fr.toLowerCase().includes(searchQuery.toLowerCase()));

    filtered.forEach(p => {
        let finalPrice = currentCurrency === 'XOF' ? Math.round(p.originalPriceCFA) : Math.round(p.originalPriceCFA * 0.068);

        productsGrid.innerHTML += `
            <div class="product-card">
                <div class="product-image" style="background-image: url('${p.image}'); cursor: zoom-in;" onclick="openImage('${p.image}')"></div>
                <div class="product-info">
                    <h3 class="p-name" data-fr="${p.name.fr}">${p.name.fr}</h3>
                    <p class="price">${finalPrice.toLocaleString()} ${symbol}</p>
                    <button class="buy-btn">${t.buyBtn}</button>
                </div>
            </div>`;
    });
    attachBuyEvents();
}

// أضف هنا دوال attachBuyEvents و confirmOrderBtn التي كانت في ملفك الأصلي...