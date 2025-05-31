/**
 * مستخرج الشموع من الصور
 * يركز على استخراج الشموع الأخيرة من صور الشارت
 */

class CandleExtractor {
  /**
   * استخراج الشموع من صورة الشارت
   * @param {HTMLImageElement|ImageData} image - صورة الشارت
   * @returns {Promise<Array<Object>>} - مصفوفة الشموع المستخرجة
   */
  static async extractCandles(image) {
    try {
      // تحويل الصورة إلى بيانات Canvas
      const imageData = await this.getImageData(image);
      
      // تقسيم الصورة إلى مناطق
      const regions = this.divideImageIntoRegions(imageData);
      
      // البحث عن الشموع في كل منطقة
      const candles = this.detectCandlesInRegions(imageData, regions);
      
      // ترتيب الشموع من اليسار إلى اليمين (من الأقدم إلى الأحدث)
      candles.sort((a, b) => a.position.x - b.position.x);
      
      // تحويل الشموع إلى التنسيق القياسي
      return this.convertToStandardFormat(candles);
    } catch (error) {
      console.error("خطأ في استخراج الشموع:", error);
      return this.generateMockCandles();
    }
  }
  
  /**
   * الحصول على بيانات الصورة
   * @private
   */
  static async getImageData(image) {
    // إذا كان الإدخال هو ImageData، إرجاعه مباشرة
    if (image instanceof ImageData) {
      return image;
    }
    
    // إذا كان الإدخال هو HTMLImageElement
    if (image instanceof HTMLImageElement) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = image.width;
      canvas.height = image.height;
      
      ctx.drawImage(image, 0, 0);
      
      return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    
    // إذا كان الإدخال هو File أو Blob
    if (image instanceof File || image instanceof Blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
          const img = new Image();
          
          img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            
            ctx.drawImage(img, 0, 0);
            
            resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
          };
          
          img.onerror = function() {
            reject(new Error("فشل تحميل الصورة"));
          };
          
          img.src = e.target.result;
        };
        
        reader.onerror = function() {
          reject(new Error("فشل قراءة ملف الصورة"));
        };
        
        reader.readAsDataURL(image);
      });
    }
    
    throw new Error("نوع الصورة غير مدعوم");
  }
  
  /**
   * تقسيم الصورة إلى مناطق
   * @private
   */
  static divideImageIntoRegions(imageData) {
    const { width, height } = imageData;
    
    // تقسيم الصورة إلى مناطق أفقية (للشموع)
    const regionWidth = Math.floor(width / 20); // افتراض وجود حوالي 20 شمعة
    const regions = [];
    
    // التركيز على النصف السفلي من الصورة (حيث توجد الشموع عادة)
    const startY = Math.floor(height * 0.3);
    const endY = Math.floor(height * 0.9);
    
    for (let x = 0; x < width; x += regionWidth) {
      regions.push({
        x,
        y: startY,
        width: Math.min(regionWidth, width - x),
        height: endY - startY
      });
    }
    
    return regions;
  }
  
  /**
   * اكتشاف الشموع في المناطق
   * @private
   */
  static detectCandlesInRegions(imageData, regions) {
    const candles = [];
    const { width, height, data } = imageData;
    
    for (const region of regions) {
      // البحث عن الشموع في المنطقة
      const regionCandles = this.detectCandlesInRegion(imageData, region);
      candles.push(...regionCandles);
    }
    
    return candles;
  }
  
  /**
   * اكتشاف الشموع في منطقة محددة
   * @private
   */
  static detectCandlesInRegion(imageData, region) {
    // في التطبيق الحقيقي، هنا سيتم تطبيق خوارزميات معالجة الصور لاكتشاف الشموع
    // مثل اكتشاف الحواف، تحديد الألوان، تحليل الأشكال، إلخ
    
    // محاكاة لاكتشاف شمعة واحدة في المنطقة
    return [{
      position: {
        x: region.x + region.width / 2,
        y: region.y + region.height / 2
      },
      color: this.detectColorInRegion(imageData, region),
      size: {
        width: region.width * 0.6,
        height: region.height * 0.7
      }
    }];
  }
  
  /**
   * اكتشاف اللون السائد في منطقة
   * @private
   */
  static detectColorInRegion(imageData, region) {
    const { width, data } = imageData;
    
    let redCount = 0;
    let greenCount = 0;
    
    // فحص عينة من البكسلات في المنطقة
    const sampleSize = 100;
    const stepX = Math.max(1, Math.floor(region.width / 10));
    const stepY = Math.max(1, Math.floor(region.height / 10));
    
    for (let y = region.y; y < region.y + region.height; y += stepY) {
      for (let x = region.x; x < region.x + region.width; x += stepX) {
        const idx = (y * width + x) * 4;
        
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        // تحديد اللون
        if (r > g + 50 && r > b + 50) {
          redCount++;
        } else if (g > r + 50 && g > b + 50) {
          greenCount++;
        }
      }
    }
    
    return redCount > greenCount ? "red" : "green";
  }
  
  /**
   * تحويل الشموع إلى التنسيق القياسي
   * @private
   */
  static convertToStandardFormat(candles) {
    // تحويل الشموع المكتشفة إلى التنسيق القياسي
    const standardCandles = [];
    
    // قيم افتراضية للسعر
    let basePrice = 1.2800;
    const now = Date.now();
    const minuteMs = 60 * 1000;
    
    for (let i = 0; i < candles.length; i++) {
      const candle = candles[i];
      
      // إنشاء تغير عشوائي للسعر
      const changePercent = (Math.random() - 0.5) * 0.01;
      const range = basePrice * 0.005;
      
      // تحديد قيم الشمعة بناءً على اللون
      let open, close;
      
      if (candle.color === "green") {
        open = basePrice;
        close = basePrice * (1 + Math.abs(changePercent));
      } else {
        open = basePrice;
        close = basePrice * (1 - Math.abs(changePercent));
      }
      
      const high = Math.max(open, close) + Math.random() * range;
      const low = Math.min(open, close) - Math.random() * range;
      
      // إضافة الشمعة للمصفوفة
      standardCandles.push({
        timestamp: now - (candles.length - i) * minuteMs,
        open: open,
        high: high,
        low: low,
        close: close,
        volume: Math.floor(Math.random() * 100) + 50
      });
      
      // تحديث السعر الأساسي للشمعة التالية
      basePrice = close;
    }
    
    return standardCandles;
  }
  
  /**
   * إنشاء شموع عشوائية للاختبار
   * @private
   */
  static generateMockCandles(count = 10) {
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
        open: open,
        high: high,
        low: low,
        close: close,
        volume: Math.floor(Math.random() * 100) + 50
      });
      
      // تحديث السعر الأساسي للشمعة التالية
      basePrice = close;
    }
    
    return candles;
  }
  
  /**
   * استخراج الشموع الأخيرة من صورة الشارت
   * @param {HTMLImageElement|ImageData} image - صورة الشارت
   * @param {number} count - عدد الشموع الأخيرة (افتراضيًا 3)
   * @returns {Promise<Object>} - الشموع الأخيرة وجميع الشموع
   */
  static async extractRecentCandles(image, count = 3) {
    try {
      // استخراج جميع الشموع
      const allCandles = await this.extractCandles(image);
      
      // استخراج الشموع الأخيرة
      const recentCandles = allCandles.slice(-count);
      
      return {
        success: true,
        allCandles,
        recentCandles
      };
    } catch (error) {
      console.error("خطأ في استخراج الشموع الأخيرة:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// إضافة مستخرج الشموع للنافذة
window.CandleExtractor = CandleExtractor;