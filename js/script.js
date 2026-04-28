import { importedProducts } from './products.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCI60T3r88_PBhRxc9zV2tCeGC59GbOW4A",
  authDomain: "ebnou-store.firebaseapp.com",
  projectId: "ebnou-store",
  storageBucket: "ebnou-store.firebasestorage.app",
  messagingSenderId: "28443393930",
  appId: "1:28443393930:web:2ba0d8f17fe66d52db9273"
};
const rate = 0.075; // <--- غير هذا الرقم هنا فقط
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// المتغيرات الأساسية
let currentCurrency = 'XOF';
let currentLang = 'fr';
let currentMode = 'login';
const currencySymbols = { XOF: 'CFA', MRU: 'MRU' };
const translations = { ar: { buyBtn: "شراء الآن" }, fr: { buyBtn: "Acheter" } };

// --- وظيفة التبديل بين الدخول والإنشاء ---
window.switchAuth = (mode) => {
    window.rate = 0.075; // أو السعر الذي تفضله
    currentMode = mode;
    const nameGroup = document.getElementById('nameGroup');
    const confirmGroup = document.getElementById('confirmPasswordGroup');
    const mainBtn = document.getElementById('mainBtn');
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');

    if (mode === 'signup') {
        nameGroup.style.display = 'block';
        confirmGroup.style.display = 'block';
        mainBtn.innerText = "Créer mon compte";
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
    } else {
        nameGroup.style.display = 'none';
        confirmGroup.style.display = 'none';
        mainBtn.innerText = "Se Connecter";
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
    }
};

// --- عرض المنتجات ---
// --- عرض المنتجات (نسخة مطورة ومرتبطة بالدفع) ---
function renderProducts() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    productsGrid.innerHTML = '';

    importedProducts.forEach(p => {
        // حساب السعر بناءً على العملة المختارة
        let finalPrice = currentCurrency === 'XOF' ? 
            Math.round(p.originalPriceCFA) : 
            Math.round(p.originalPriceCFA * 0.075);

        const card = document.createElement('div');
        card.className = 'product-card';
        
        // ربطنا الزر الآن بدالة openPayment لفتح نافذة الدفع
        card.innerHTML = `
            <div class="product-image" style="background-image: url('${p.image}');" onclick="openImage('${p.image}')"></div>
            <div class="product-info">
                <h3>${p.name[currentLang] || p.name.fr}</h3>
                <p class="price-tag">${finalPrice.toLocaleString()} ${currentCurrency === 'XOF' ? 'FCFA' : 'MRU'}</p>
                <button class="buy-btn" onclick="openPayment('${p.name[currentLang] || p.name.fr}', '${finalPrice.toLocaleString()} ${currentCurrency}')">
                    ${translations[currentLang]?.buyBtn || translations['fr'].buyBtn}
                </button>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

const contactData = {
    whatsapp: "+22227070586",
    wave: "784715094",
    bankily: "27070586"
};

let selectedProduct = "";

window.openPayment = (name, price) => {
    selectedProduct = `${name} (${price})`;
    const modal = document.getElementById('paymentModal');
    if (modal) modal.style.display = 'flex';
};

window.closePayment = () => {
    const modal = document.getElementById('paymentModal');
    if (modal) modal.style.display = 'none';
};

window.showDetails = (method) => {
    const detailsDiv = document.getElementById('paymentDetails');
    const instructions = document.getElementById('paymentInstructions');
    if (detailsDiv) detailsDiv.style.display = 'block';

    if (method === 'wave') {
        instructions.innerHTML = `Envoyez le paiement vers Wave (Sénégal) : <br> <span style="font-size: 1.4rem; color: #00a0ff;">${contactData.wave}</span>`;
    } else {
        instructions.innerHTML = `Envoyez le paiement vers Bankily (Mauritanie) : <br> <span style="font-size: 1.4rem; color: #1d1d1d;">${contactData.bankily}</span>`;
    }
};

window.confirmOrder = () => {
    const address = document.getElementById('deliveryAddress').value;
    if (!address) {
        alert("Veuillez entrer votre adresse de livraison !");
        return;
    }
};
// --- معالجة تسجيل الدخول / إنشاء الحساب ---
document.getElementById('authForm').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;

    if (currentMode === 'signup') {
        const name = document.getElementById('authName').value;
        const confirmPass = document.getElementById('authConfirmPassword').value;

        if (password !== confirmPass) { alert("les mots de passe ne correspondent pas !"); return; }
        
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            alert("Bienvenue " + name);
        } catch (error) { alert(error.message); }
    } else {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) { alert("خطأ: " + error.message); }
    }
};

// --- مراقبة حالة المستخدم ---
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

// --- تغيير العملة ---
document.getElementById('currencySelect').addEventListener('change', (e) => {
    currentCurrency = e.target.value;
    renderProducts();
   });

// --- تسجيل الخروج ---
window.handleSignOut = () => signOut(auth);

// --- تكبير الصور ---
window.openImage = (src) => {
    const overlay = document.getElementById('imageOverlay');
    document.getElementById('fullImage').src = src;
    overlay.style.display = 'flex';
};