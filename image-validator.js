/**
 * مدقق الصور
 * يتحقق من صحة الصور ويضمن أنها مناسبة للتحليل
 */

class ImageValidator {
  /**
   * التحقق من صحة ملف الصورة
   * @param {File|Blob} imageFile - ملف الصورة
   * @returns {Promise<Object>} - نتيجة التحقق
   */
  static async validateImage(imageFile) {
    try {
      // التحقق من وجود الملف
      if (!imageFile) {
        return {
          valid: false,
          error: "لم يتم تحديد ملف الصورة"
        };
      }
      
      // التحقق من نوع الملف
      if (!(imageFile instanceof File || imageFile instanceof Blob)) {
        return {
          valid: false,
          error: "نوع الملف غير صالح"
        };
      }
      
      // التحقق من امتداد الملف
      if (!imageFile.type.startsWith('image/')) {
        return {
          valid: false,
          error: "الملف ليس صورة"
        };
      }
      
      // التحقق من حجم الملف (أقل من 10 ميجابايت)
      if (imageFile.size > 10 * 1024 * 1024) {
        return {
          valid: false,
          error: "حجم الصورة كبير جدًا (الحد الأقصى 10 ميجابايت)"
        };
      }
      
      // التحقق من إمكانية تحميل الصورة
      const imageLoadResult = await this.checkImageLoading(imageFile);
      if (!imageLoadResult.success) {
        return {
          valid: false,
          error: imageLoadResult.error
        };
      }
      
      // التحقق من أبعاد الصورة
      if (imageLoadResult.width < 200 || imageLoadResult.height < 200) {
        return {
          valid: false,
          error: "أبعاد الصورة صغيرة جدًا (الحد الأدنى 200×200)"
        };
      }
      
      // التحقق من نسبة العرض إلى الارتفاع
      const aspectRatio = imageLoadResult.width / imageLoadResult.height;
      if (aspectRatio < 0.5 || aspectRatio > 2) {
        return {
          valid: false,
          error: "نسبة العرض إلى الارتفاع غير مناسبة"
        };
      }
      
      // التحقق من محتوى الصورة
      const contentCheckResult = await this.checkImageContent(imageLoadResult.image);
      if (!contentCheckResult.valid) {
        return {
          valid: false,
          error: contentCheckResult.error
        };
      }
      
      return {
        valid: true,
        dimensions: {
          width: imageLoadResult.width,
          height: imageLoadResult.height
        },
        aspectRatio: aspectRatio
      };
    } catch (error) {
      console.error("خطأ في التحقق من الصورة:", error);
      return {
        valid: false,
        error: "حدث خطأ أثناء التحقق من الصورة"
      };
    }
  }
  
  /**
   * التحقق من إمكانية تحميل الصورة
   * @param {File|Blob} imageFile - ملف الصورة
   * @returns {Promise<Object>} - نتيجة التحقق
   */
  static checkImageLoading(imageFile) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const img = new Image();
        
        img.onload = function() {
          resolve({
            success: true,
            width: img.width,
            height: img.height,
            image: img
          });
        };
        
        img.onerror = function() {
          resolve({
            success: false,
            error: "فشل تحميل الصورة"
          });
        };
        
        img.src = e.target.result;
      };
      
      reader.onerror = function() {
        resolve({
          success: false,
          error: "فشل قراءة ملف الصورة"
        });
      };
      
      reader.readAsDataURL(imageFile);
    });
  }
  
  /**
   * التحقق من محتوى الصورة
   * @param {HTMLImageElement} image - عنصر الصورة
   * @returns {Promise<Object>} - نتيجة التحقق
   */
  static async checkImageContent(image) {
    try {
      // إنشاء canvas لتحليل الصورة
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // تحديد أبعاد canvas
      canvas.width = image.width;
      canvas.height = image.height;
      
      // رسم الصورة على canvas
      ctx.drawImage(image, 0, 0);
      
      // الحصول على بيانات الصورة
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // التحقق من وجود بيانات كافية
      if (data.length < 1000) {
        return {
          valid: false,
          error: "الصورة لا تحتوي على بيانات كافية"
        };
      }
      
      // التحقق من التباين (للتأكد من أنها ليست صورة فارغة)
      const contrastResult = this.checkImageContrast(data);
      if (!contrastResult.valid) {
        return contrastResult;
      }
      
      // التحقق من وجود ألوان متنوعة (للتأكد من أنها صورة شارت)
      const colorResult = this.checkImageColors(data);
      if (!colorResult.valid) {
        return colorResult;
      }
      
      return {
        valid: true
      };
    } catch (error) {
      console.error("خطأ في التحقق من محتوى الصورة:", error);
      return {
        valid: false,
        error: "حدث خطأ أثناء التحقق من محتوى الصورة"
      };
    }
  }
  
  /**
   * التحقق من تباين الصورة
   * @param {Uint8ClampedArray} data - بيانات الصورة
   * @returns {Object} - نتيجة التحقق
   */
  static checkImageContrast(data) {
    let minBrightness = 255;
    let maxBrightness = 0;
    
    // فحص عينة من البكسلات
    const step = Math.max(1, Math.floor(data.length / 4 / 1000));
    
    for (let i = 0; i < data.length; i += 4 * step) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // حساب السطوع
      const brightness = (r + g + b) / 3;
      
      minBrightness = Math.min(minBrightness, brightness);
      maxBrightness = Math.max(maxBrightness, brightness);
    }
    
    // حساب التباين
    const contrast = maxBrightness - minBrightness;
    
    // التحقق من وجود تباين كافٍ
    if (contrast < 30) {
      return {
        valid: false,
        error: "تباين الصورة منخفض جدًا"
      };
    }
    
    return {
      valid: true,
      contrast: contrast
    };
  }
  
  /**
   * التحقق من ألوان الصورة
   * @param {Uint8ClampedArray} data - بيانات الصورة
   * @returns {Object} - نتيجة التحقق
   */
  static checkImageColors(data) {
    const colorCounts = {
      red: 0,
      green: 0,
      blue: 0,
      white: 0,
      black: 0,
      gray: 0
    };
    
    // فحص عينة من البكسلات
    const step = Math.max(1, Math.floor(data.length / 4 / 1000));
    
    for (let i = 0; i < data.length; i += 4 * step) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // تصنيف اللون
      if (r > 200 && g < 100 && b < 100) {
        colorCounts.red++;
      } else if (r < 100 && g > 200 && b < 100) {
        colorCounts.green++;
      } else if (r < 100 && g < 100 && b > 200) {
        colorCounts.blue++;
      } else if (r > 200 && g > 200 && b > 200) {
        colorCounts.white++;
      } else if (r < 50 && g < 50 && b < 50) {
        colorCounts.black++;
      } else if (Math.abs(r - g) < 30 && Math.abs(r - b) < 30 && Math.abs(g - b) < 30) {
        colorCounts.gray++;
      }
    }
    
    // التحقق من وجود ألوان متنوعة
    const totalColorCount = Object.values(colorCounts).reduce((sum, count) => sum + count, 0);
    
    // التحقق من وجود اللونين الأحمر والأخضر (للشموع)
    if (colorCounts.red < totalColorCount * 0.05 && colorCounts.green < totalColorCount * 0.05) {
      return {
        valid: false,
        error: "الصورة لا تحتوي على ألوان الشموع المتوقعة"
      };
    }
    
    return {
      valid: true,
      colorDistribution: colorCounts
    };
  }
  
  /**
   * إصلاح الصورة إذا كانت تحتوي على مشاكل بسيطة
   * @param {File|Blob} imageFile - ملف الصورة
   * @returns {Promise<Object>} - نتيجة الإصلاح
   */
  static async fixImage(imageFile) {
    try {
      // التحقق من الصورة أولاً
      const validationResult = await this.validateImage(imageFile);
      
      // إذا كانت الصورة صالحة، إرجاعها كما هي
      if (validationResult.valid) {
        return {
          success: true,
          fixed: false,
          imageFile: imageFile
        };
      }
      
      // محاولة تحميل الصورة
      const imageLoadResult = await this.checkImageLoading(imageFile);
      if (!imageLoadResult.success) {
        return {
          success: false,
          error: imageLoadResult.error
        };
      }
      
      // إنشاء canvas لإصلاح الصورة
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // تحديد أبعاد canvas
      canvas.width = Math.max(imageLoadResult.width, 800);
      canvas.height = Math.max(imageLoadResult.height, 600);
      
      // رسم الصورة على canvas
      ctx.drawImage(imageLoadResult.image, 0, 0, canvas.width, canvas.height);
      
      // تحسين التباين
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      this.enhanceContrast(imageData.data);
      ctx.putImageData(imageData, 0, 0);
      
      // تحويل canvas إلى blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.9);
      });
      
      return {
        success: true,
        fixed: true,
        imageFile: blob
      };
    } catch (error) {
      console.error("خطأ في إصلاح الصورة:", error);
      return {
        success: false,
        error: "حدث خطأ أثناء إصلاح الصورة"
      };
    }
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

// إضافة مدقق الصور للنافذة
window.ImageValidator = ImageValidator;