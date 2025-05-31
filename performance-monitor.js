/**
 * مراقب الأداء
 * يراقب استهلاك الموارد ويحسن أداء التطبيق
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      memory: [],
      cpu: [],
      executionTime: {}
    };
    
    this.thresholds = {
      memory: 50 * 1024 * 1024, // 50 ميجابايت
      executionTime: 1000 // 1 ثانية
    };
    
    this.optimizations = {
      imageProcessingApplied: false,
      analysisOptimized: false,
      cacheEnabled: false
    };
  }
  
  /**
   * بدء مراقبة الأداء
   */
  startMonitoring() {
    console.log("بدء مراقبة الأداء...");
    
    // مراقبة استهلاك الذاكرة
    this.memoryInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 5000);
    
    // مراقبة أداء وحدة المعالجة المركزية
    this.cpuInterval = setInterval(() => {
      this.checkCPUUsage();
    }, 5000);
  }
  
  /**
   * إيقاف مراقبة الأداء
   */
  stopMonitoring() {
    clearInterval(this.memoryInterval);
    clearInterval(this.cpuInterval);
  }
  
  /**
   * التحقق من استهلاك الذاكرة
   * @private
   */
  checkMemoryUsage() {
    // في المتصفح، يمكننا استخدام performance.memory إذا كان متاحًا
    if (window.performance && window.performance.memory) {
      const memory = window.performance.memory;
      
      this.metrics.memory.push({
        timestamp: Date.now(),
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize
      });
      
      // الاحتفاظ بآخر 10 قياسات فقط
      if (this.metrics.memory.length > 10) {
        this.metrics.memory.shift();
      }
      
      // التحقق من تجاوز الحد الأقصى
      if (memory.usedJSHeapSize > this.thresholds.memory && !this.optimizations.imageProcessingApplied) {
        console.warn("تجاوز استهلاك الذاكرة الحد الأقصى، تطبيق تحسينات...");
        this.applyMemoryOptimizations();
      }
    }
  }
  
  /**
   * التحقق من استهلاك وحدة المعالجة المركزية
   * @private
   */
  checkCPUUsage() {
    // في المتصفح، لا يمكننا قياس استهلاك وحدة المعالجة المركزية مباشرة
    // لكن يمكننا قياس وقت التنفيذ للعمليات الرئيسية
  }
  
  /**
   * قياس وقت تنفيذ دالة
   * @param {string} name - اسم الدالة
   * @param {Function} func - الدالة المراد قياس وقت تنفيذها
   * @param {Array} args - وسائط الدالة
   * @returns {any} - نتيجة تنفيذ الدالة
   */
  measureExecutionTime(name, func, args) {
    const start = performance.now();
    
    try {
      const result = func.apply(null, args);
      const end = performance.now();
      const executionTime = end - start;
      
      // تسجيل وقت التنفيذ
      if (!this.metrics.executionTime[name]) {
        this.metrics.executionTime[name] = [];
      }
      
      this.metrics.executionTime[name].push({
        timestamp: Date.now(),
        executionTime
      });
      
      // الاحتفاظ بآخر 10 قياسات فقط
      if (this.metrics.executionTime[name].length > 10) {
        this.metrics.executionTime[name].shift();
      }
      
      // التحقق من تجاوز الحد الأقصى
      if (executionTime > this.thresholds.executionTime && !this.optimizations.analysisOptimized) {
        console.warn(`تجاوز وقت تنفيذ ${name} الحد الأقصى، تطبيق تحسينات...`);
        this.applyCPUOptimizations(name);
      }
      
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`خطأ في تنفيذ ${name}:`, error);
      throw error;
    }
  }
  
  /**
   * قياس وقت تنفيذ دالة غير متزامنة
   * @param {string} name - اسم الدالة
   * @param {Function} asyncFunc - الدالة غير المتزامنة المراد قياس وقت تنفيذها
   * @param {Array} args - وسائط الدالة
   * @returns {Promise<any>} - نتيجة تنفيذ الدالة
   */
  async measureAsyncExecutionTime(name, asyncFunc, args) {
    const start = performance.now();
    
    try {
      const result = await asyncFunc.apply(null, args);
      const end = performance.now();
      const executionTime = end - start;
      
      // تسجيل وقت التنفيذ
      if (!this.metrics.executionTime[name]) {
        this.metrics.executionTime[name] = [];
      }
      
      this.metrics.executionTime[name].push({
        timestamp: Date.now(),
        executionTime
      });
      
      // الاحتفاظ بآخر 10 قياسات فقط
      if (this.metrics.executionTime[name].length > 10) {
        this.metrics.executionTime[name].shift();
      }
      
      // التحقق من تجاوز الحد الأقصى
      if (executionTime > this.thresholds.executionTime && !this.optimizations.analysisOptimized) {
        console.warn(`تجاوز وقت تنفيذ ${name} الحد الأقصى، تطبيق تحسينات...`);
        this.applyCPUOptimizations(name);
      }
      
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`خطأ في تنفيذ ${name}:`, error);
      throw error;
    }
  }
  
  /**
   * تطبيق تحسينات الذاكرة
   * @private
   */
  applyMemoryOptimizations() {
    console.log("تطبيق تحسينات الذاكرة...");
    
    // تحسين معالجة الصور
    if (window.ImageProcessor) {
      // تقليل حجم الصور المعالجة
      const originalPrepareImageForAnalysis = window.ImageProcessor.prepareImageForAnalysis;
      window.ImageProcessor.prepareImageForAnalysis = async function(imageFile) {
        const result = await originalPrepareImageForAnalysis.call(this, imageFile);
        
        if (result.success) {
          // تقليل حجم الصورة المعالجة
          const canvas = result.resizedData.canvas;
          const ctx = result.resizedData.ctx;
          
          // تقليل الحجم إلى النصف إذا كان كبيرًا
          if (canvas.width > 400 || canvas.height > 400) {
            const newWidth = Math.min(400, canvas.width / 2);
            const newHeight = Math.min(400, canvas.height / 2);
            
            const newCanvas = document.createElement('canvas');
            const newCtx = newCanvas.getContext('2d');
            
            newCanvas.width = newWidth;
            newCanvas.height = newHeight;
            
            newCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
            
            result.resizedData = {
              canvas: newCanvas,
              ctx: newCtx,
              imageData: newCtx.getImageData(0, 0, newWidth, newHeight),
              width: newWidth,
              height: newHeight
            };
          }
        }
        
        return result;
      };
    }
    
    // تنظيف الذاكرة
    this.cleanupMemory();
    
    this.optimizations.imageProcessingApplied = true;
  }
  
  /**
   * تطبيق تحسينات وحدة المعالجة المركزية
   * @param {string} functionName - اسم الدالة المراد تحسينها
   * @private
   */
  applyCPUOptimizations(functionName) {
    console.log(`تطبيق تحسينات وحدة المعالجة المركزية لـ ${functionName}...`);
    
    // تحسين تحليل الشارت
    if (functionName === "analyzeChartImage" && window.chartAnalyzerConnector) {
      // تطبيق التخزين المؤقت
      if (!this.optimizations.cacheEnabled) {
        window.chartAnalyzerConnector.analyzeChartImage = window.ErrorHandler.optimizeAsyncResourceUsage(
          window.chartAnalyzerConnector.analyzeChartImage.bind(window.chartAnalyzerConnector)
        );
        
        this.optimizations.cacheEnabled = true;
      }
    }
    
    // تحسين استخراج الشموع
    if (functionName === "extractCandles" && window.CandleExtractor) {
      window.CandleExtractor.extractCandles = window.ErrorHandler.optimizeAsyncResourceUsage(
        window.CandleExtractor.extractCandles.bind(window.CandleExtractor)
      );
    }
    
    this.optimizations.analysisOptimized = true;
  }
  
  /**
   * تنظيف الذاكرة
   * @private
   */
  cleanupMemory() {
    // إزالة البيانات المؤقتة
    if (window.chartAnalyzerConnector && window.chartAnalyzerConnector._tempData) {
      delete window.chartAnalyzerConnector._tempData;
    }
    
    // إجبار جامع القمامة على العمل (غير مضمون)
    if (window.gc) {
      window.gc();
    }
  }
  
  /**
   * الحصول على تقرير الأداء
   * @returns {Object} - تقرير الأداء
   */
  getPerformanceReport() {
    // حساب متوسط استهلاك الذاكرة
    let avgMemoryUsage = 0;
    if (this.metrics.memory.length > 0) {
      avgMemoryUsage = this.metrics.memory.reduce((sum, m) => sum + m.usedJSHeapSize, 0) / this.metrics.memory.length;
    }
    
    // حساب متوسط وقت التنفيذ لكل دالة
    const avgExecutionTime = {};
    for (const [name, times] of Object.entries(this.metrics.executionTime)) {
      if (times.length > 0) {
        avgExecutionTime[name] = times.reduce((sum, t) => sum + t.executionTime, 0) / times.length;
      }
    }
    
    return {
      memory: {
        average: avgMemoryUsage,
        latest: this.metrics.memory.length > 0 ? this.metrics.memory[this.metrics.memory.length - 1].usedJSHeapSize : 0,
        threshold: this.thresholds.memory
      },
      executionTime: {
        average: avgExecutionTime,
        threshold: this.thresholds.executionTime
      },
      optimizations: this.optimizations
    };
  }
}

// إنشاء كائن عالمي لمراقب الأداء
window.performanceMonitor = new PerformanceMonitor();

// بدء مراقبة الأداء عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  window.performanceMonitor.startMonitoring();
});