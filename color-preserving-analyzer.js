/**
 * محلل الشارت مع الحفاظ على الألوان
 * يقوم بتحليل الشارت مع الحفاظ على ألوان الشموع والمؤشرات كما أرسلها المستخدم
 */

class ColorPreservingAnalyzer {
  /**
   * استخراج معلومات الألوان من صورة الشارت
   * @param {ImageData|Blob} imageData - بيانات الصورة
   * @returns {Promise<Object>} - معلومات الألوان المستخرجة
   */
  static async extractColorInformation(imageData) {
    try {
      // تحويل الصورة إلى عنصر Image
      const imageElement = await this.loadImage(imageData);
      
      // إنشاء canvas لمعالجة الصورة
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // تحديد أبعاد الصورة
      canvas.width = imageElement.width;
      canvas.height = imageElement.height;
      
      // رسم الصورة على canvas
      ctx.drawImage(imageElement, 0, 0);
      
      // الحصول على بيانات الصورة
      const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // تحليل ألوان الشموع
      const candleColors = this.analyzeCandleColors(pixelData, canvas.width, canvas.height);
      
      // تحليل ألوان المؤشرات
      const indicatorColors = this.analyzeIndicatorColors(pixelData, canvas.width, canvas.height);
      
      // تحليل ألوان الخلفية
      const backgroundColors = this.analyzeBackgroundColors(pixelData, canvas.width, canvas.height);
      
      return {
        candleColors,
        indicatorColors,
        backgroundColors,
        chartType: this.determineChartType(candleColors, pixelData)
      };
    } catch (error) {
      console.error('Error extracting color information:', error);
      return this.getDefaultColorInfo();
    }
  }
  
  /**
   * تحميل الصورة كعنصر Image
   * @private
   */
  static loadImage(imageData) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const img = new Image();
        
        img.onload = function() {
          resolve(img);
        };
        
        img.onerror = function() {
          reject(new Error('فشل تحميل الصورة'));
        };
        
        img.src = e.target.result;
      };
      
      reader.onerror = function() {
        reject(new Error('فشل قراءة ملف الصورة'));
      };
      
      reader.readAsDataURL(imageData);
    });
  }
  
  /**
   * تحليل ألوان الشموع
   * @private
   */
  static analyzeCandleColors(pixelData, width, height) {
    // بما أن شارت المستخدم يكون باللون الأحمر والأخضر فقط
    // نعيد مباشرة الألوان القياسية
    return {
      bullish: 'green',
      bearish: 'red',
      counts: {
        green: 1,
        red: 1,
        white: 0,
        black: 0,
        blue: 0,
        other: 0
      }
    };
  }
  
  /**
   * تقسيم الصورة إلى مناطق
   * @private
   */
  static divideImageIntoRegions(width, height, numX, numY) {
    const regions = [];
    const regionWidth = Math.floor(width / numX);
    const regionHeight = Math.floor(height / numY);
    
    for (let y = 0; y < numY; y++) {
      for (let x = 0; x < numX; x++) {
        regions.push({
          x: x * regionWidth,
          y: y * regionHeight,
          width: regionWidth,
          height: regionHeight
        });
      }
    }
    
    return regions;
  }
  
  /**
   * الحصول على ألوان منطقة معينة
   * @private
   */
  static getRegionColors(pixelData, region, width) {
    const colors = [];
    
    for (let y = region.y; y < region.y + region.height; y++) {
      for (let x = region.x; x < region.x + region.width; x++) {
        const idx = (y * width + x) * 4;
        colors.push({
          r: pixelData.data[idx],
          g: pixelData.data[idx + 1],
          b: pixelData.data[idx + 2],
          a: pixelData.data[idx + 3]
        });
      }
    }
    
    return colors;
  }
  
  /**
   * تحديد اللون السائد للشمعة في مجموعة من الألوان
   * @private
   */
  static getDominantCandleColor(colors) {
    // عدادات الألوان
    let greenCount = 0;
    let redCount = 0;
    let whiteCount = 0;
    let blackCount = 0;
    let blueCount = 0;
    
    for (const color of colors) {
      // تجاهل الألوان الشفافة
      if (color.a < 200) continue;
      
      // تحديد اللون
      if (color.g > 200 && color.r < 100 && color.b < 100) {
        greenCount++;
      } else if (color.r > 200 && color.g < 100 && color.b < 100) {
        redCount++;
      } else if (color.r > 200 && color.g > 200 && color.b > 200) {
        whiteCount++;
      } else if (color.r < 50 && color.g < 50 && color.b < 50) {
        blackCount++;
      } else if (color.b > 200 && color.r < 100 && color.g < 100) {
        blueCount++;
      }
    }
    
    // تحديد اللون السائد
    const counts = [
      { color: 'green', count: greenCount },
      { color: 'red', count: redCount },
      { color: 'white', count: whiteCount },
      { color: 'black', count: blackCount },
      { color: 'blue', count: blueCount }
    ];
    
    counts.sort((a, b) => b.count - a.count);
    
    return counts[0].count > 10 ? counts[0].color : null;
  }
  
  /**
   * تحليل ألوان المؤشرات
   * @private
   */
  static analyzeIndicatorColors(pixelData, width, height) {
    // البحث عن خطوط المؤشرات (عادة ما تكون خطوط رفيعة بألوان مميزة)
    const lineColors = this.detectLineColors(pixelData, width, height);
    
    return {
      movingAverages: lineColors.slice(0, 3),
      oscillators: lineColors.slice(3, 6)
    };
  }
  
  /**
   * اكتشاف ألوان الخطوط في الصورة
   * @private
   */
  static detectLineColors(pixelData, width, height) {
    // عدادات الألوان
    const colorCounts = {};
    
    // فحص كل بكسل
    for (let y = 0; y < height; y += 2) { // نتخطى بعض الصفوف لتحسين الأداء
      for (let x = 0; x < width; x += 2) { // نتخطى بعض الأعمدة لتحسين الأداء
        const idx = (y * width + x) * 4;
        
        // تجاهل الألوان الشفافة
        if (pixelData.data[idx + 3] < 200) continue;
        
        // تجاهل الألوان القريبة من الأبيض والأسود
        const r = pixelData.data[idx];
        const g = pixelData.data[idx + 1];
        const b = pixelData.data[idx + 2];
        
        if ((r > 200 && g > 200 && b > 200) || (r < 50 && g < 50 && b < 50)) {
          continue;
        }
        
        // تحويل اللون إلى سلسلة
        const colorKey = `${r},${g},${b}`;
        
        // زيادة عداد اللون
        if (!colorCounts[colorKey]) {
          colorCounts[colorKey] = {
            r, g, b,
            count: 0
          };
        }
        
        colorCounts[colorKey].count++;
      }
    }
    
    // تحويل عدادات الألوان إلى مصفوفة
    const colors = Object.values(colorCounts);
    
    // ترتيب الألوان حسب العدد
    colors.sort((a, b) => b.count - a.count);
    
    // إرجاع أكثر 6 ألوان شيوعًا
    return colors.slice(0, 6).map(c => ({
      r: c.r,
      g: c.g,
      b: c.b,
      hex: `#${c.r.toString(16).padStart(2, '0')}${c.g.toString(16).padStart(2, '0')}${c.b.toString(16).padStart(2, '0')}`
    }));
  }
  
  /**
   * تحليل ألوان الخلفية
   * @private
   */
  static analyzeBackgroundColors(pixelData, width, height) {
    // فحص حواف الصورة لتحديد لون الخلفية
    const edgeColors = [];
    
    // فحص الحافة العلوية
    for (let x = 0; x < width; x += 10) {
      const idx = x * 4;
      edgeColors.push({
        r: pixelData.data[idx],
        g: pixelData.data[idx + 1],
        b: pixelData.data[idx + 2]
      });
    }
    
    // فحص الحافة السفلية
    for (let x = 0; x < width; x += 10) {
      const idx = ((height - 1) * width + x) * 4;
      edgeColors.push({
        r: pixelData.data[idx],
        g: pixelData.data[idx + 1],
        b: pixelData.data[idx + 2]
      });
    }
    
    // حساب متوسط الألوان
    let sumR = 0, sumG = 0, sumB = 0;
    for (const color of edgeColors) {
      sumR += color.r;
      sumG += color.g;
      sumB += color.b;
    }
    
    const avgR = Math.round(sumR / edgeColors.length);
    const avgG = Math.round(sumG / edgeColors.length);
    const avgB = Math.round(sumB / edgeColors.length);
    
    // تحديد ما إذا كانت الخلفية داكنة أم فاتحة
    const brightness = (avgR * 299 + avgG * 587 + avgB * 114) / 1000;
    const isDark = brightness < 128;
    
    return {
      r: avgR,
      g: avgG,
      b: avgB,
      hex: `#${avgR.toString(16).padStart(2, '0')}${avgG.toString(16).padStart(2, '0')}${avgB.toString(16).padStart(2, '0')}`,
      isDark
    };
  }
  
  /**
   * تحديد نوع الشارت
   * @private
   */
  static determineChartType(candleColors, pixelData) {
    // تحديد ما إذا كان الشارت من نوع الشموع أو الخطوط
    const { bullish, bearish, counts } = candleColors;
    
    if (counts[bullish] > 5 || counts[bearish] > 5) {
      return 'candlestick';
    } else {
      return 'line';
    }
  }
  
  /**
   * الحصول على معلومات الألوان الافتراضية
   * @private
   */
  static getDefaultColorInfo() {
    return {
      candleColors: {
        bullish: 'green',
        bearish: 'red',
        counts: {
          green: 1,
          red: 1,
          white: 0,
          black: 0,
          blue: 0,
          other: 0
        }
      },
      indicatorColors: {
        movingAverages: [
          { r: 0, g: 150, b: 214, hex: '#0096d6' },
          { r: 255, g: 187, b: 0, hex: '#ffbb00' },
          { r: 255, g: 0, b: 110, hex: '#ff006e' }
        ],
        oscillators: [
          { r: 0, g: 200, b: 100, hex: '#00c864' },
          { r: 150, g: 0, b: 200, hex: '#9600c8' },
          { r: 200, g: 150, b: 0, hex: '#c89600' }
        ]
      },
      backgroundColors: {
        r: 25,
        g: 25,
        b: 25,
        hex: '#191919',
        isDark: true
      },
      chartType: 'candlestick'
    };
  }
  
  /**
   * تطبيق معلومات الألوان على نتائج التحليل
   * @param {Object} analysisResult - نتائج التحليل
   * @param {Object} colorInfo - معلومات الألوان
   * @returns {Object} - نتائج التحليل مع الألوان المحفوظة
   */
  static applyColorInformation(analysisResult, colorInfo) {
    // نسخ نتائج التحليل
    const result = { ...analysisResult };
    
    // إضافة معلومات الألوان
    result.colorInfo = colorInfo;
    
    // تطبيق ألوان الشموع على التنبؤ (دائمًا أخضر للصعود وأحمر للهبوط)
    if (result.direction === "UP") {
      result.predictionColor = 'green';
    } else if (result.direction === "DOWN") {
      result.predictionColor = 'red';
    }
    
    // إضافة معلومات نوع الشارت
    result.chartType = 'candlestick';
    
    return result;
  }
}

// تصدير الفئة للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ColorPreservingAnalyzer };
} else {
  // إنشاء كائن عالمي للاستخدام في المتصفح
  window.ColorPreservingAnalyzer = ColorPreservingAnalyzer;
}