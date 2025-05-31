/**
 * خادم الواجهة الخلفية للنظام
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// إعداد الخادم
const app = express();
const port = process.env.PORT || 3000;

// إعداد المخزن المؤقت للصور
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// إعداد الوسائط
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// مسارات واجهة برمجة التطبيقات

// فحص حالة الخادم
app.get('/api/health-check', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// تحليل صورة الشارت
app.post('/api/analyze-chart', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'لم يتم تحميل أي صورة' });
    }
    
    // استخراج الإطار الزمني من الطلب إذا كان متاحًا
    const timeframe = req.body.timeframe ? parseInt(req.body.timeframe) : 5;
    
    // محاكاة لعملية التحليل
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // إنشاء بيانات تجريبية للتحليل
    const basePrice = 1.2800;
    const trend = Math.random() > 0.5 ? "UP" : "DOWN";
    
    const result = {
      status: "success",
      marketTrend: {
        trend: trend,
        strength: Math.floor(Math.random() * 30) + 65,
        description: trend === "UP" ? "اتجاه صاعد قوي" : "اتجاه هابط قوي"
      },
      supportResistance: {
        resistance: [
          { price: basePrice * 1.01, strength: 3 },
          { price: basePrice * 1.02, strength: 2 },
          { price: basePrice * 1.03, strength: 4 }
        ],
        support: [
          { price: basePrice * 0.99, strength: 3 },
          { price: basePrice * 0.98, strength: 2 },
          { price: basePrice * 0.97, strength: 4 }
        ]
      },
      candleAnalysis: {
        pattern: "BULLISH_ENGULFING",
        direction: trend,
        confidence: Math.floor(Math.random() * 30) + 65,
        recommendedDuration: timeframe * 3 * 60,
        open: basePrice,
        close: trend === "UP" ? basePrice * 1.005 : basePrice * 0.995,
        high: trend === "UP" ? basePrice * 1.01 : basePrice * 1.002,
        low: trend === "UP" ? basePrice * 0.998 : basePrice * 0.99,
        indicators: {
          rsi: trend === "UP" ? 65 : 35,
          macd: trend === "UP" ? 0.5 : -0.5,
          bollingerPosition: trend === "UP" ? 0.7 : 0.3,
          mfi: trend === "UP" ? 60 : 40,
          sma5: trend === "UP" ? basePrice * 0.995 : basePrice * 1.005,
          sma10: trend === "UP" ? basePrice * 0.99 : basePrice * 1.01
        }
      },
      breakoutAnalysis: {
        breakout: trend === "UP" ? "RESISTANCE" : "SUPPORT",
        probability: Math.floor(Math.random() * 30) + 65,
        target: trend === "UP" ? basePrice * 1.01 : basePrice * 0.99,
        level: trend === "UP" ? basePrice * 1.01 : basePrice * 0.99,
        recommendation: trend === "UP" ? "شراء" : "بيع",
        recommendationStrength: Math.floor(Math.random() * 30) + 65
      },
      entryExitPoints: {
        entryPoint: basePrice,
        targetPoint: trend === "UP" ? basePrice * 1.01 : basePrice * 0.99,
        stopLoss: trend === "UP" ? basePrice * 0.99 : basePrice * 1.01,
        riskRewardRatio: 2.4,
        timeframe: timeframe * 3 * 60
      }
    };
    
    // حذف الصورة بعد التحليل
    fs.unlinkSync(req.file.path);
    
    // إضافة معلومات إضافية للاستجابة
    const response = {
      ...result,
      processingTime: new Date().toISOString(),
      imageProcessed: true,
      timeframe: timeframe
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error processing chart image:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// تشغيل الخادم
app.listen(port, () => {
  console.log(`الخادم يعمل على المنفذ ${port}`);
});