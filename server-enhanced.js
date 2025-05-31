/**
 * خادم الويب المحسن للواجهة الخلفية للنظام
 * يوفر واجهة برمجة تطبيقات RESTful للتفاعل مع محلل الشارت المحسن
 */

// استيراد المكتبات المطلوبة
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// استيراد واجهة برمجة التطبيقات المحسنة
const enhancedApi = require('./backend-enhanced-api');

// إنشاء تطبيق Express
const app = express();
const port = process.env.PORT || 3001;

// إعداد CORS
app.use(cors());

// إعداد معالجة البيانات JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// إعداد تخزين الملفات المرفوعة
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB كحد أقصى
  fileFilter: (req, file, cb) => {
    // قبول صور فقط
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('يجب رفع ملف صورة فقط'));
    }
  }
});

// تعريف المسارات

/**
 * مسار الصفحة الرئيسية
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * مسار تحليل صورة الشارت
 * POST /api/analyze-chart
 */
app.post('/api/analyze-chart', upload.single('chartImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'لم يتم رفع صورة' });
    }
    
    // قراءة الصورة المرفوعة
    const imageData = fs.readFileSync(req.file.path);
    
    // تحليل الصورة باستخدام المحلل المحسن
    const analysis = await enhancedApi.analyzeUserChartImage(imageData);
    
    // إرجاع نتائج التحليل
    res.json(analysis);
  } catch (error) {
    console.error('خطأ في تحليل الصورة:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'حدث خطأ أثناء تحليل الصورة',
      details: error.message
    });
  }
});

/**
 * مسار تحليل الشارت مع توصيات التداول
 * POST /api/analyze-with-recommendations
 */
app.post('/api/analyze-with-recommendations', upload.single('chartImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'لم يتم رفع صورة' });
    }
    
    // قراءة الصورة المرفوعة
    const imageData = fs.readFileSync(req.file.path);
    
    // تحليل الصورة مع توصيات التداول
    const analysis = await enhancedApi.analyzeChartWithTradingRecommendations(imageData);
    
    // إرجاع نتائج التحليل
    res.json(analysis);
  } catch (error) {
    console.error('خطأ في تحليل الصورة:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'حدث خطأ أثناء تحليل الصورة',
      details: error.message
    });
  }
});

/**
 * مسار تسجيل نتيجة تنبؤ
 * POST /api/record-result
 */
app.post('/api/record-result', (req, res) => {
  try {
    const { predictionIndex, actualDirection } = req.body;
    
    if (predictionIndex === undefined || !actualDirection) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'البيانات المطلوبة غير مكتملة'
      });
    }
    
    // تسجيل النتيجة
    const result = enhancedApi.recordResult(predictionIndex, actualDirection);
    
    // إرجاع نتائج التقييم
    res.json(result);
  } catch (error) {
    console.error('خطأ في تسجيل النتيجة:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'حدث خطأ أثناء تسجيل النتيجة',
      details: error.message
    });
  }
});

/**
 * مسار الحصول على مقاييس الأداء
 * GET /api/performance-metrics
 */
app.get('/api/performance-metrics', (req, res) => {
  try {
    // الحصول على مقاييس الأداء
    const metrics = enhancedApi.getPerformanceMetrics();
    
    // إرجاع مقاييس الأداء
    res.json(metrics);
  } catch (error) {
    console.error('خطأ في الحصول على مقاييس الأداء:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'حدث خطأ أثناء الحصول على مقاييس الأداء',
      details: error.message
    });
  }
});

/**
 * مسار تعديل أوزان الثقة
 * POST /api/adjust-weights
 */
app.post('/api/adjust-weights', (req, res) => {
  try {
    const { weights } = req.body;
    
    if (!weights) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'لم يتم توفير أوزان الثقة'
      });
    }
    
    // تعديل أوزان الثقة
    const result = enhancedApi.adjustConfidenceWeights(weights);
    
    // إرجاع نتيجة العملية
    res.json(result);
  } catch (error) {
    console.error('خطأ في تعديل أوزان الثقة:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'حدث خطأ أثناء تعديل أوزان الثقة',
      details: error.message
    });
  }
});

/**
 * تعريف مسار للملفات الثابتة
 */
app.use(express.static(path.join(__dirname)));

/**
 * معالجة الأخطاء
 */
app.use((err, req, res, next) => {
  console.error('خطأ في الخادم:', err);
  res.status(500).json({ 
    status: 'error', 
    message: 'حدث خطأ في الخادم',
    details: err.message
  });
});

/**
 * بدء تشغيل الخادم
 */
app.listen(port, () => {
  console.log(`الخادم يعمل على المنفذ ${port}`);
  console.log(`يمكنك الوصول إلى التطبيق من خلال: http://localhost:${port}`);
});