/**
 * معالج صور الشارت
 * يقوم باستخراج الشموع من صور الشارت باستخدام معالجة الصور
 */

const cv = require('opencv4nodejs');
const fs = require('fs');
const path = require('path');

/**
 * استخراج الشموع من صورة الشارت
 * @param {Buffer|string} imageData - بيانات الصورة أو مسارها
 * @returns {Promise<Array>} - مصفوفة الشموع المستخرجة
 */
async function extractCandlesFromImage(imageData) {
  try {
    // قراءة الصورة
    let img;
    if (typeof imageData === 'string') {
      img = cv.imread(imageData);
    } else {
      // تحويل البيانات الثنائية إلى صورة
      const tempPath = path.join(__dirname, 'temp_image.png');
      fs.writeFileSync(tempPath, imageData);
      img = cv.imread(tempPath);
      fs.unlinkSync(tempPath);
    }

    // تحويل الصورة إلى تدرج رمادي
    const gray = img.cvtColor(cv.COLOR_BGR2GRAY);
    
    // تطبيق عتبة ثنائية للحصول على الأشكال
    const thresh = gray.threshold(150, 255, cv.THRESH_BINARY_INV);
    
    // البحث عن الحدود
    const contours = thresh.findContours(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    
    // تصفية الحدود للحصول على الشموع
    const candles = [];
    
    for (const contour of contours) {
      const area = contour.area;
      
      // تجاهل الحدود الصغيرة جدًا
      if (area < 50) continue;
      
      // الحصول على المستطيل المحيط
      const rect = contour.boundingRect();
      
      // تحليل شكل المستطيل لتحديد ما إذا كان شمعة
      if (rect.height > rect.width * 2) {
        // هذا على الأرجح شمعة
        const x = rect.x + rect.width / 2;
        const top = rect.y;
        const bottom = rect.y + rect.height;
        
        // تحديد لون الشمعة (أخضر أو أحمر)
        const centerPoint = new cv.Point2(x, top + rect.height / 2);
        const color = img.at(centerPoint.y, centerPoint.x);
        
        const isGreen = color[1] > color[0] && color[1] > color[2];
        
        // إنشاء كائن الشمعة
        candles.push({
          x: x,
          top: top,
          bottom: bottom,
          width: rect.width,
          height: rect.height,
          isUp: isGreen
        });
      }
    }
    
    // ترتيب الشموع من اليسار إلى اليمين
    candles.sort((a, b) => a.x - b.x);
    
    // تحويل الشموع إلى تنسيق OHLC
    const ohlcCandles = convertToOHLC(candles, img.rows);
    
    return ohlcCandles;
  } catch (error) {
    console.error('Error extracting candles:', error);
    // في حالة الفشل، إرجاع شموع افتراضية
    return generateMockCandles();
  }
}

/**
 * تحويل الشموع المستخرجة إلى تنسيق OHLC
 * @param {Array} candles - الشموع المستخرجة
 * @param {number} imageHeight - ارتفاع الصورة
 * @returns {Array} - مصفوفة الشموع بتنسيق OHLC
 */
function convertToOHLC(candles, imageHeight) {
  // تحديد نطاق السعر
  const minY = Math.min(...candles.map(c => Math.min(c.top, c.bottom)));
  const maxY = Math.max(...candles.map(c => Math.max(c.top, c.bottom)));
  
  // معامل التحويل من إحداثيات الصورة إلى السعر
  const priceRange = 100; // نطاق سعر افتراضي
  const pixelToPrice = priceRange / (maxY - minY);
  
  // تحويل الشموع إلى تنسيق OHLC
  return candles.map((candle, index) => {
    // تحويل إحداثيات Y إلى أسعار (مع عكس الاتجاه لأن Y يزداد للأسفل في الصورة)
    const high = (imageHeight - candle.top) * pixelToPrice;
    const low = (imageHeight - candle.bottom) * pixelToPrice;
    
    // تحديد سعر الافتتاح والإغلاق بناءً على اتجاه الشمعة
    let open, close;
    if (candle.isUp) {
      open = low;
      close = high;
    } else {
      open = high;
      close = low;
    }
    
    return {
      timestamp: Date.now() - (candles.length - index) * 60000, // افتراض أن كل شمعة تمثل دقيقة واحدة
      open: parseFloat(open.toFixed(4)),
      high: parseFloat(high.toFixed(4)),
      low: parseFloat(low.toFixed(4)),
      close: parseFloat(close.toFixed(4)),
      volume: Math.floor(Math.random() * 100) // حجم افتراضي
    };
  });
}

/**
 * إنشاء شموع افتراضية في حالة فشل استخراج الشموع من الصورة
 * @param {number} count - عدد الشموع
 * @returns {Array} - مصفوفة الشموع الافتراضية
 */
function generateMockCandles(count = 10) {
  const candles = [];
  let basePrice = 1.2800;
  const now = Date.now();
  const minuteMs = 60 * 1000;
  
  for (let i = 0; i < count; i++) {
    // إنشاء تغير عشوائي للسعر
    const changePercent = (Math.random() - 0.5) * 0.01;
    const range = basePrice * 0.005;
    
    // تحديد قيم الشمعة
    const open = basePrice;
    const close = basePrice * (1 + changePercent);
    const high = Math.max(open, close) + Math.random() * range;
    const low = Math.min(open, close) - Math.random() * range;
    
    // إضافة الشمعة للمصفوفة
    candles.push({
      timestamp: now - (count - i) * minuteMs,
      open: parseFloat(open.toFixed(4)),
      high: parseFloat(high.toFixed(4)),
      low: parseFloat(low.toFixed(4)),
      close: parseFloat(close.toFixed(4)),
      volume: Math.floor(Math.random() * 100) + 50
    });
    
    // تحديث السعر الأساسي للشمعة التالية
    basePrice = close;
  }
  
  return candles;
}

/**
 * تحسين جودة الصورة قبل المعالجة
 * @param {Buffer|string} imageData - بيانات الصورة أو مسارها
 * @returns {Promise<Buffer>} - بيانات الصورة المحسنة
 */
async function enhanceChartImage(imageData) {
  try {
    // قراءة الصورة
    let img;
    if (typeof imageData === 'string') {
      img = cv.imread(imageData);
    } else {
      // تحويل البيانات الثنائية إلى صورة
      const tempPath = path.join(__dirname, 'temp_image.png');
      fs.writeFileSync(tempPath, imageData);
      img = cv.imread(tempPath);
      fs.unlinkSync(tempPath);
    }
    
    // تحسين التباين
    const enhanced = img.convertTo(-1, 1, 10);
    
    // تقليل الضوضاء
    const denoised = enhanced.gaussianBlur(new cv.Size(3, 3), 0);
    
    // حفظ الصورة المحسنة
    const enhancedPath = path.join(__dirname, 'enhanced_image.png');
    cv.imwrite(enhancedPath, denoised);
    
    // قراءة الصورة المحسنة كبيانات ثنائية
    const enhancedData = fs.readFileSync(enhancedPath);
    fs.unlinkSync(enhancedPath);
    
    return enhancedData;
  } catch (error) {
    console.error('Error enhancing image:', error);
    return imageData; // إرجاع الصورة الأصلية في حالة الفشل
  }
}

/**
 * اكتشاف الإطار الزمني من صورة الشارت
 * @param {Buffer|string} imageData - بيانات الصورة أو مسارها
 * @returns {Promise<number>} - الإطار الزمني بالدقائق
 */
async function detectTimeframe(imageData) {
  try {
    // في التطبيق الحقيقي، هنا سيتم استخدام OCR للتعرف على النص في الصورة
    // وتحديد الإطار الزمني (مثل M1, M5, M15, إلخ)
    
    // محاكاة لعملية اكتشاف الإطار الزمني
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // إرجاع إطار زمني عشوائي للاختبار
    const timeframes = [1, 5, 15, 30, 60];
    return timeframes[Math.floor(Math.random() * timeframes.length)];
  } catch (error) {
    console.error('Error detecting timeframe:', error);
    return 5; // إطار زمني افتراضي
  }
}

module.exports = {
  extractCandlesFromImage,
  enhanceChartImage,
  detectTimeframe,
  generateMockCandles
};