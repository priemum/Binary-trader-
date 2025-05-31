/**
 * خادم الواجهة الخلفية للنظام مع دعم التعلم الآلي
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// استيراد واجهة برمجة التطبيقات مع دعم التعلم الآلي
const api = require('./backend-api-ml');

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
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// مسارات واجهة برمجة التطبيقات

// تحليل صورة الشارت باستخدام التعلم الآلي
app.post('/api/analyze-chart-ml', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'لم يتم تحميل أي صورة' });
    }
    
    const imageData = fs.readFileSync(req.file.path);
    const analysis = await api.analyzeChartImage(imageData);
    
    // حذف الصورة بعد التحليل
    fs.unlinkSync(req.file.path);
    
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// تحليل الشموع باستخدام التعلم الآلي
app.post('/api/analyze-candles-ml', async (req, res) => {
  try {
    const { candles, timeframe } = req.body;
    
    if (!candles || !Array.isArray(candles) || candles.length === 0) {
      return res.status(400).json({ status: 'error', message: 'بيانات الشموع غير صالحة' });
    }
    
    const analysis = await api.analyzeCandles(candles, timeframe || 60);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// تسجيل نتيجة التنبؤ
app.post('/api/record-result', async (req, res) => {
  try {
    const { predictionIndex, actualDirection } = req.body;
    
    if (predictionIndex === undefined || !actualDirection) {
      return res.status(400).json({ status: 'error', message: 'بيانات غير صالحة' });
    }
    
    const result = api.recordResult(predictionIndex, actualDirection);
    res.json(result);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// الحصول على مقاييس الأداء
app.get('/api/performance-metrics', (req, res) => {
  try {
    const metrics = api.getPerformanceMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// تعديل أوزان الثقة
app.post('/api/adjust-confidence-weights', (req, res) => {
  try {
    const { weights } = req.body;
    
    if (!weights) {
      return res.status(400).json({ status: 'error', message: 'لم يتم توفير أوزان' });
    }
    
    const result = api.adjustConfidenceWeights(weights);
    res.json(result);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// تصدير بيانات التقييم
app.get('/api/export-evaluation', (req, res) => {
  try {
    const data = api.exportEvaluationData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// استيراد بيانات التقييم
app.post('/api/import-evaluation', (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({ status: 'error', message: 'لم يتم توفير بيانات' });
    }
    
    const result = api.importEvaluationData(data);
    res.json(result);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// تشغيل الخادم
app.listen(port, () => {
  console.log(`الخادم يعمل على المنفذ ${port} مع دعم التعلم الآلي`);
});