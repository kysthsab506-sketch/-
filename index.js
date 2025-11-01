// index.js
import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

const app = express();
app.use(bodyParser.json());

// ⚙️ إعدادات يمكن تعديلها لاحقًا من موقعك
let SETTINGS = {
  prefix: '.', // النقطة
  botName: 'ساتو بوت',
  developerName: 'المطور',
  adminName: 'المشرف',
};

// 🔐 توكن صفحة الفيسبوك
const PAGE_ACCESS_TOKEN = 'ضع_التوكن_الخاص_بصفحتك_هنا';

// ✅ تحقق Webhook
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = 'كلمة_تحقق_خاصة_بك';

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ تم التحقق من Webhook بنجاح');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// 📩 استقبال الرسائل
app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      const event = entry.messaging[0];
      if (event.message && event.message.text) {
        handleMessage(event.sender.id, event.message.text.trim());
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// 🧠 منطق الأوامر
async function handleMessage(sender_psid, messageText) {
  const text = messageText.toLowerCase();
  const prefix = SETTINGS.prefix;
  let response;

  // 🔹 أوامر عامة
  if (text === `${prefix}اوامر`) {
    response = {
      text: `🎮 قائمة الأوامر:

🧾 الأوامر العامة:
${prefix}عمل - ربح مال عشوائي 💰
${prefix}رصيد - عرض رصيدك 💳
${prefix}تحويل - تحويل الأموال 🔁
${prefix}معلومات - عرض معلوماتك 🧾

🤝 أوامر التفاعل:
${prefix}زوجني - زواج عشوائي 💍
${prefix}سجن - سجن عضو 🎯
${prefix}صفع - صفع عضو 👋
${prefix}صور [كلمة] - جلب صور 🖼️

🧠 ملاحظات:
• يمكنك تعديل الإعدادات من الموقع.
• المصمم: ${SETTINGS.developerName}
• المشرف: ${SETTINGS.adminName}`
    };
  }

  else if (text.startsWith(`${prefix}سلام`)) {
    response = { text: 'وعليكم السلام ورحمة الله 😊' };
  }

  else if (text.startsWith(`${prefix}عمل`)) {
    const amount = Math.floor(Math.random() * 400) + 100;
    const jobs = ['مبرمج', 'طبيب', 'مهندس', 'تاجر', 'راقصة', 'شرطي'];
    const job = jobs[Math.floor(Math.random() * jobs.length)];
    response = { text: `💼 مبروك! عملت كـ ${job} وربحت ${amount} ريال 💰` };
  }

  else if (text.startsWith(`${prefix}رصيد`)) {
    response = { text: `💳 رصيدك الحالي هو ${Math.floor(Math.random() * 5000)} ريال 💰` };
  }

  else if (text.startsWith(`${prefix}تحويل`)) {
    response = { text: `🔁 ميزة التحويل قيد التطوير من طرف ${SETTINGS.developerName}، ترقبها قريبًا.` };
  }

  else if (text.startsWith(`${prefix}معلومات`)) {
    response = {
      text: `🧾 معلوماتك:
• ID المستخدم: ${sender_psid}
• الحالة: نشط ✅
• الدور: عضو 👤`
    };
  }

  // 🔹 أوامر التفاعل
  else if (text.startsWith(`${prefix}زوجني`)) {
    response = { text: `💍 تم اختيار شريك حياتك عشوائيًا! مبروك 🎉` };
  }

  else if (text.startsWith(`${prefix}سجن`)) {
    response = { text: `🚓 تم سجن الشخص المطلوب. العدالة أخذت مجراها ⚖️` };
  }

  else if (text.startsWith(`${prefix}صفع`)) {
    response = { text: `👋 تمت الصفعة بنجاح! نرجو أن تكون خفيفة 😆` };
  }

  else if (text.startsWith(`${prefix}صور`)) {
    const query = text.replace(`${prefix}صور`, '').trim();
    if (!query) {
      response = { text: '📸 اكتب الكلمة بعد الأمر مثل: .صور قطة 🐱' };
    } else {
      response = { text: `🔍 جاري جلب صور لـ "${query}"... (ميزة الصور سيتم تفعيلها لاحقًا)` };
    }
  }

  else {
    response = { text: `🤖 لم أفهم الأمر "${messageText}". اكتب ${prefix}اوامر لرؤية جميع الأوامر.` };
  }

  // إرسال الرد
  await sendMessage(sender_psid, response);
}

// 📤 إرسال الرسائل عبر Graph API
async function sendMessage(sender_psid, response) {
  try {
    await fetch(`https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: sender_psid },
        message: response,
      }),
    });
  } catch (err) {
    console.error('خطأ أثناء إرسال الرسالة:', err);
  }
}

// 🚀 تشغيل الخادم
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ الخادم يعمل على المنفذ ${PORT}`));
