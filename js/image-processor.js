/**
 * معالج صور الشارت
 * يقوم بتحسين وتحليل صور الشارت
 */

class ImageProcessor {
  /**
   * تحضير الصورة للتحليل
   * @param {File|Blob} imageFile - ملف الصورة
   * @returns {Promise<Object>} - نتيجة المعالجة
   */
  static async prepareImageForAnalysis(imageFile) {
    try {
      // التحقق من صحة الصورة باستخدام ImageValidator
      if (window.ImageValidator) {
        const validationResult = await window.ImageValidator.validateImage(imageFile);
        if (!validationResult.valid) {
          return {
            success: false,
            error: validationResult.error
          };
        }
      }
      
      // تحويل الصورة إلى صيغة مناسبة للتحليل
      const imageData = await this.convertImageToDataUrl(imageFile);
      
      return {
        success: true,
        imageData: imageData
      };
    } catch (error) {
      console.error("خطأ في تحضير الصورة للتحليل:", error);
      return {
        success: false,
        error: error.message || "حدث خطأ أثناء تحضير الصورة للتحليل"
      };
    }
  }
  
  /**
   * تحويل الصورة إلى صيغة Data URL
   * @param {File|Blob} imageFile - ملف الصورة
   * @returns {Promise<string>} - صيغة Data URL للصورة
   */
  static convertImageToDataUrl(imageFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        resolve(e.target.result);
      };
      
      reader.onerror = function(error) {
        reject(error);
      };
      
      reader.readAsDataURL(imageFile);
    });
  }
  
  /**
   * تحسين جودة الصورة
   * @param {string} imageDataUrl - صيغة Data URL للصورة
   * @returns {Promise<string>} - صيغة Data URL للصورة المحسنة
   */
  static async enhanceImage(imageDataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = function() {
        try {
          // إنشاء canvas لتحسين الصورة
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // تحديد أبعاد canvas
          canvas.width = img.width;
          canvas.height = img.height;
          
          // رسم الصورة على canvas
          ctx.drawImage(img, 0, 0);
          
          // تحسين التباين
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          ImageProcessor.enhanceContrast(imageData.data);
          ctx.putImageData(imageData, 0, 0);
          
          // تحويل canvas إلى Data URL
          const enhancedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
          resolve(enhancedDataUrl);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = function() {
        reject(new Error("فشل تحميل الصورة"));
      };
      
      img.src = imageDataUrl;
    });
  }
  
  /**
   * تحسين تباين الصورة
   * @param {Uint8ClampedArray} data - بيانات الصورة
   */
  static enhanceContrast(data) {
    // حساب الحد الأدنى والأقصى للسطوع
    let minBrightness = 255;
    let maxBrightness = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const brightness = (r + g + b) / 3;
      
      minBrightness = Math.min(minBrightness, brightness);
      maxBrightness = Math.max(maxBrightness, brightness);
    }
    
    // حساب معامل التباين
    const range = maxBrightness - minBrightness;
    if (range < 1) return;
    
    const factor = 255 / range;
    
    // تطبيق التباين
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, (data[i] - minBrightness) * factor));
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - minBrightness) * factor));
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - minBrightness) * factor));
    }
  }
}

// إضافة معالج الصور للنافذة
window.ImageProcessor = ImageProcessor;