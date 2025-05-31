/**
 * محلل صور الشارت باستخدام OpenCV للرؤية الحاسوبية
 * يتضمن تحويل الألوان إلى صيغة HSV للتعرف على الشموع
 */

// متغير عام لمكتبة OpenCV
let cv = null;

/**
 * تهيئة مكتبة OpenCV
 * @returns {Promise} وعد يتم حله عند تحميل المكتبة
 */
function initOpenCV() {
  return new Promise((resolve, reject) => {
    if (window.cv) {
      cv = window.cv;
      resolve(cv);
      return;
    }

    // إضافة سكريبت OpenCV إلى الصفحة
    const script = document.createElement('script');
    script.setAttribute('async', '');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', 'https://docs.opencv.org/4.5.5/opencv.js');
    
    script.onload = () => {
      cv = window.cv;
      resolve(cv);
    };
    
    script.onerror = () => {
      reject(new Error('فشل تحميل مكتبة OpenCV'));
    };
    
    document.body.appendChild(script);
  });
}

/**
 * فئة تمثل شمعة يابانية
 */
class Candle {
  constructor(open, close, high, low, timestamp = Date.now()) {
    this.open = open;
    this.close = close;
    this.high = high;
    this.low = low;
    this.timestamp = timestamp;
  }

  isGreen() {
    return this.close > this.open;
  }

  isRed() {
    return this.open > this.close;
  }
}

/**
 * محلل صور الشارت باستخدام OpenCV
 */
class OpenCVChartAnalyzer {
  /**
   * تحويل الصورة إلى صيغة HSV واستخراج الشموع
   * @param {HTMLImageElement|ImageData} imageElement - عنصر الصورة أو بيانات الصورة
   * @returns {Promise<Object>} - نتائج التحليل
   */
  static async analyzeChartImage(imageElement) {
    try {
      // التأكد من تهيئة OpenCV
      if (!cv) {
        await initOpenCV();
      }

      // تحويل الصورة إلى مصفوفة OpenCV
      const imgElement = imageElement instanceof HTMLImageElement ? 
        imageElement : await this.createImageElement(imageElement);
      
      const src = cv.imread(imgElement);
      
      // تحويل الصورة إلى صيغة HSV
      const hsv = new cv.Mat();
      cv.cvtColor(src, hsv, cv.COLOR_RGB2HSV);
      
      // استخراج القنوات المختلفة
      const channels = new cv.MatVector();
      cv.split(hsv, channels);
      
      // استخدام قناة الإشباع للكشف عن الشموع
      const saturation = channels.get(1);
      
      // تطبيق عتبة ثنائية للكشف عن المناطق ذات الإشباع العالي (الشموع)
      const threshold = new cv.Mat();
      cv.threshold(saturation, threshold, 50, 255, cv.THRESH_BINARY);
      
      // البحث عن الحدود
      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();
      cv.findContours(threshold, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
      
      // تحليل الحدود لاستخراج الشموع
      const candles = this.extractCandlesFromContours(contours, src);
      
      // تحرير الذاكرة
      src.delete();
      hsv.delete();
      channels.delete();
      saturation.delete();
      threshold.delete();
      contours.delete();
      hierarchy.delete();
      
      return {
        candles: candles,
        timeframe: this.detectTimeframe(imageElement)
      };
    } catch (error) {
      console.error('خطأ في تحليل الصورة:', error);
      throw error;
    }
  }
  
  /**
   * إنشاء عنصر صورة من بيانات الصورة
   * @param {Blob|File|ImageData} imageData - بيانات الصورة
   * @returns {Promise<HTMLImageElement>} - عنصر الصورة
   */
  static createImageElement(imageData) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('فشل تحميل الصورة'));
      
      if (imageData instanceof Blob || imageData instanceof File) {
        img.src = URL.createObjectURL(imageData);
      } else {
        reject(new Error('نوع بيانات الصورة غير مدعوم'));
      }
    });
  }
  
  /**
   * استخراج الشموع من الحدود المكتشفة
   * @param {cv.MatVector} contours - حدود الشموع
   * @param {cv.Mat} originalImage - الصورة الأصلية
   * @returns {Array<Candle>} - مصفوفة من الشموع
   */
  static extractCandlesFromContours(contours, originalImage) {
    const candles = [];
    const imageHeight = originalImage.rows;
    const priceRange = 100; // نطاق السعر الافتراضي
    
    // فرز الحدود من اليسار إلى اليمين (حسب الزمن)
    const sortedContours = [];
    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);
      const rect = cv.boundingRect(contour);
      
      // تجاهل الحدود الصغيرة جدًا
      if (rect.width < 3 || rect.height < 5) continue;
      
      sortedContours.push({
        contour: contour,
        rect: rect,
        x: rect.x
      });
    }
    
    // فرز حسب الموقع الأفقي
    sortedContours.sort((a, b) => a.x - b.x);
    
    // استخراج الشموع
    for (const item of sortedContours) {
      const rect = item.rect;
      
      // تحويل الإحداثيات إلى قيم سعرية
      const high = priceRange - (rect.y / imageHeight * priceRange);
      const low = priceRange - ((rect.y + rect.height) / imageHeight * priceRange);
      
      // تحديد ما إذا كانت الشمعة خضراء أو حمراء
      const roi = originalImage.roi(rect);
      const isGreen = this.detectCandleColor(roi);
      
      // تحديد سعر الفتح والإغلاق بناءً على اللون
      let open, close;
      if (isGreen) {
        open = low;
        close = high;
      } else {
        open = high;
        close = low;
      }
      
      candles.push(new Candle(open, close, high, low));
      
      roi.delete();
    }
    
    return candles;
  }
  
  /**
   * تحديد لون الشمعة (أخضر أو أحمر)
   * @param {cv.Mat} roi - منطقة الاهتمام (الشمعة)
   * @returns {boolean} - true إذا كانت الشمعة خضراء، false إذا كانت حمراء
   */
  static detectCandleColor(roi) {
    // تحويل إلى HSV
    const hsv = new cv.Mat();
    cv.cvtColor(roi, hsv, cv.COLOR_RGB2HSV);
    
    // حساب متوسط قيمة اللون
    const mean = cv.mean(hsv);
    
    // تحرير الذاكرة
    hsv.delete();
    
    // تحديد اللون بناءً على قيمة اللون (Hue)
    // القيم الخضراء تكون عادة بين 60-180
    // القيم الحمراء تكون عادة بين 0-30 أو 330-360
    const hue = mean[0];
    return (hue > 60 && hue < 180);
  }
  
  /**
   * تحديد الإطار الزمني من صورة الشارت
   * @param {HTMLImageElement} imageElement - عنصر الصورة
   * @returns {number} - الإطار الزمني بالثواني
   */
  static detectTimeframe(imageElement) {
    // في التطبيق الحقيقي، يمكن استخدام OCR للتعرف على النص في الصورة
    // هنا نستخدم قيمة افتراضية
    return 300; // 5 دقائق
  }
}

/**
 * تحليل صورة الشارت وتوقع الشمعة القادمة
 * @param {Blob|File|HTMLImageElement} imageData - بيانات الصورة
 * @returns {Promise<Object>} - نتائج التحليل والتوقع
 */
async function analyzeChartWithOpenCV(imageData) {
  try {
    // تهيئة OpenCV
    await initOpenCV();
    
    // تحليل الصورة
    const analysisResult = await OpenCVChartAnalyzer.analyzeChartImage(imageData);
    
    // التنبؤ بالشمعة القادمة (يمكن استخدام الكود السابق للتنبؤ)
    const prediction = predictNextCandle(analysisResult.candles);
    
    return {
      candles: analysisResult.candles,
      timeframe: analysisResult.timeframe,
      prediction: prediction
    };
  } catch (error) {
    console.error('خطأ في تحليل الصورة:', error);
    throw error;
  }
}

/**
 * التنبؤ بالشمعة القادمة (نسخة مبسطة)
 * @param {Array<Candle>} candles - الشموع المستخرجة
 * @returns {Object} - توقع الشمعة القادمة
 */
function predictNextCandle(candles) {
  if (candles.length < 2) {
    return {
      direction: "NEUTRAL",
      confidence: 50,
      pattern: "INSUFFICIENT_DATA"
    };
  }
  
  const lastCandle = candles[candles.length - 1];
  const isUptrend = candles[candles.length - 1].close > candles[0].close;
  
  return {
    open: lastCandle.close,
    close: isUptrend ? lastCandle.close * 1.01 : lastCandle.close * 0.99,
    high: isUptrend ? lastCandle.close * 1.015 : lastCandle.close * 1.005,
    low: isUptrend ? lastCandle.close * 0.995 : lastCandle.close * 0.985,
    direction: isUptrend ? "UP" : "DOWN",
    confidence: 65,
    pattern: isUptrend ? "UPTREND_CONTINUATION" : "DOWNTREND_CONTINUATION"
  };
}

// تصدير الدوال والفئات
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initOpenCV,
    Candle,
    OpenCVChartAnalyzer,
    analyzeChartWithOpenCV
  };
}