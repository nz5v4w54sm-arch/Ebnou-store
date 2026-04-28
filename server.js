const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

// 1. الخانة التي يجب أن تغيرها:
// استبدل النص الموجود بين علامتي التنصيص بالمفتاح الحقيقي الذي ستحصل عليه من AliExpress مستقبلاً
const ALIEXPRESS_API_KEY = 'اكتب_المفتاح_السري_هنا_عندما_تحصل_عليه'; 

// إخبار الخادم بعرض ملفات الواجهة من مجلد public
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/products', async (req, res) => {
    try {
        // ملاحظة: هذا الرابط هو مثال تقريبي، لأن رابط AliExpress الفعلي يتطلب إعدادات حساب حقيقية
        // في الوقت الحالي، سنستخدم بيانات وهمية للتجربة فقط حتى لا يتوقف الكود عن العمل
        
        /* // الكود الفعلي الذي سيعمل عندما تمتلك حساباً ومفتاحاً:
        const response = await axios.get('https://api.aliexpress.com/v1/products', {
            headers: { 'Authorization': `Bearer ${ALIEXPRESS_API_KEY}` }
        });
        let products = response.data.items;
        */

        // بيانات تجريبية مؤقتة (لكي تتمكن من تشغيل الموقع الآن ورؤيته بعينك)
        let products = [
            { id: 1, name: "ساعة ذكية رياضية", originalPrice: 50.00, image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500" },
            { id: 2, name: "سماعات بلوتوث", originalPrice: 30.00, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500" }
        ];

        // 2. الخانة التي يجب أن تغيرها إذا أردت تغيير نسبة الربح:
        // حالياً هي 0.20 أي 20%. يمكنك تغييرها إلى 0.30 (لـ 30%) أو غيرها.
        const markupPercentage = 0.30;

        let productsWithMarkup = products.map(product => {
            let markup = product.originalPrice * markupPercentage;
            return {
                id: product.id,
                name: product.name,
                image: product.image,
                finalPrice: (product.originalPrice + markup).toFixed(2)
            };
        });

        res.json(productsWithMarkup);

    } catch (error) {
        console.error("حدث خطأ:", error);
        res.status(500).send('خطأ في جلب المنتجات');
    }
});

app.listen(3000, () => {
    console.log('الخادم يعمل بنجاح على الرابط: http://localhost:3000');
});