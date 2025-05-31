/**
 * مدير توافق الإصدارات
 * يضمن توافق الإصدارات المختلفة من المكتبات المستخدمة
 */

class VersionCompatibility {
  constructor() {
    // إصدارات المكتبات المدعومة
    this.supportedVersions = {
      'chart-analyzer': ['1.0', '1.1', '1.2'],
      'ml-integration': ['1.0', '1.1'],
      'pattern-recognition': ['1.0', '1.1', '1.2', '1.3']
    };
    
    // واجهات التوافق
    this.compatibilityInterfaces = {};
    
    // تهيئة واجهات التوافق
    this.initCompatibilityInterfaces();
  }
  
  /**
   * تهيئة واجهات التوافق
   * @private
   */
  initCompatibilityInterfaces() {
    // واجهة توافق محلل الشارت
    this.compatibilityInterfaces['chart-analyzer'] = {
      // تحويل من الإصدار 1.0 إلى 1.2
      '1.0_to_1.2': (module) => {
        if (!module) return null;
        
        const compatibleModule = { ...module };
        
        // تحويل الدوال
        if (typeof compatibleModule.analyze === 'function' && !compatibleModule.analyzeChart) {
          compatibleModule.analyzeChart = compatibleModule.analyze;
        }
        
        // تحويل المعلمات
        if (typeof compatibleModule.analyzeChart === 'function') {
          const originalAnalyzeChart = compatibleModule.analyzeChart;
          compatibleModule.analyzeChart = function(imageData, options = {}) {
            // في الإصدار 1.0، كانت المعلمة الثانية هي الإطار الزمني
            if (typeof options === 'number') {
              return originalAnalyzeChart.call(this, imageData, { timeframe: options });
            }
            return originalAnalyzeChart.call(this, imageData, options);
          };
        }
        
        return compatibleModule;
      },
      
      // تحويل من الإصدار 1.1 إلى 1.2
      '1.1_to_1.2': (module) => {
        if (!module) return null;
        
        const compatibleModule = { ...module };
        
        // تحويل هيكل النتائج
        if (typeof compatibleModule.analyzeChart === 'function') {
          const originalAnalyzeChart = compatibleModule.analyzeChart;
          compatibleModule.analyzeChart = async function(imageData, options = {}) {
            const result = await originalAnalyzeChart.call(this, imageData, options);
            
            // في الإصدار 1.1، كانت النتائج في حقل 'result'
            if (result && result.result && !result.direction) {
              result.direction = result.result.direction;
              result.confidence = result.result.confidence;
              result.pattern = result.result.pattern;
              delete result.result;
            }
            
            return result;
          };
        }
        
        return compatibleModule;
      }
    };
    
    // واجهة توافق تكامل التعلم الآلي
    this.compatibilityInterfaces['ml-integration'] = {
      // تحويل من الإصدار 1.0 إلى 1.1
      '1.0_to_1.1': (module) => {
        if (!module) return null;
        
        const compatibleModule = { ...module };
        
        // تحويل الدوال
        if (typeof compatibleModule.predict === 'function' && !compatibleModule.analyzeWithML) {
          compatibleModule.analyzeWithML = compatibleModule.predict;
        }
        
        return compatibleModule;
      }
    };
  }
  
  /**
   * تطبيق توافق الإصدارات على وحدة
   * @param {string} moduleName - اسم الوحدة
   * @param {Object} module - الوحدة
   * @param {string} currentVersion - الإصدار الحالي
   * @param {string} targetVersion - الإصدار المستهدف
   * @returns {Object} - الوحدة المتوافقة
   */
  applyCompatibility(moduleName, module, currentVersion, targetVersion) {
    if (!module) return null;
    
    // التحقق من دعم الإصدارات
    if (!this.supportedVersions[moduleName] || 
        !this.supportedVersions[moduleName].includes(currentVersion) || 
        !this.supportedVersions[moduleName].includes(targetVersion)) {
      console.warn(`الإصدار ${currentVersion} أو ${targetVersion} من ${moduleName} غير مدعوم`);
      return module;
    }
    
    // التحقق من وجود واجهة توافق
    if (!this.compatibilityInterfaces[moduleName]) {
      console.warn(`لا توجد واجهة توافق لـ ${moduleName}`);
      return module;
    }
    
    // إذا كان الإصدار الحالي هو نفس الإصدار المستهدف
    if (currentVersion === targetVersion) {
      return module;
    }
    
    // تحديد مسار التحويل
    const conversionPath = this.findConversionPath(moduleName, currentVersion, targetVersion);
    if (!conversionPath) {
      console.warn(`لا يمكن تحويل ${moduleName} من الإصدار ${currentVersion} إلى ${targetVersion}`);
      return module;
    }
    
    // تطبيق التحويلات
    let compatibleModule = module;
    for (const conversion of conversionPath) {
      const converter = this.compatibilityInterfaces[moduleName][conversion];
      if (converter) {
        compatibleModule = converter(compatibleModule);
      }
    }
    
    return compatibleModule;
  }
  
  /**
   * إيجاد مسار التحويل بين إصدارين
   * @private
   */
  findConversionPath(moduleName, currentVersion, targetVersion) {
    // التحويل المباشر
    const directConversion = `${currentVersion}_to_${targetVersion}`;
    if (this.compatibilityInterfaces[moduleName][directConversion]) {
      return [directConversion];
    }
    
    // التحويل غير المباشر
    const versions = this.supportedVersions[moduleName];
    const currentIndex = versions.indexOf(currentVersion);
    const targetIndex = versions.indexOf(targetVersion);
    
    if (currentIndex < 0 || targetIndex < 0) {
      return null;
    }
    
    const path = [];
    
    if (currentIndex < targetIndex) {
      // التحويل إلى إصدار أحدث
      for (let i = currentIndex; i < targetIndex; i++) {
        const conversion = `${versions[i]}_to_${versions[i+1]}`;
        if (!this.compatibilityInterfaces[moduleName][conversion]) {
          return null;
        }
        path.push(conversion);
      }
    } else {
      // التحويل إلى إصدار أقدم
      for (let i = currentIndex; i > targetIndex; i--) {
        const conversion = `${versions[i]}_to_${versions[i-1]}`;
        if (!this.compatibilityInterfaces[moduleName][conversion]) {
          return null;
        }
        path.push(conversion);
      }
    }
    
    return path;
  }
  
  /**
   * تطبيق توافق الإصدارات على جميع الوحدات
   */
  applyGlobalCompatibility() {
    console.log("تطبيق توافق الإصدارات على جميع الوحدات...");
    
    // تطبيق توافق الإصدارات على محلل الشارت
    if (window.ChartImageAnalyzer) {
      window.ChartImageAnalyzer = this.applyCompatibility(
        'chart-analyzer',
        window.ChartImageAnalyzer,
        '1.0', // الإصدار الحالي
        '1.2'  // الإصدار المستهدف
      );
    }
    
    // تطبيق توافق الإصدارات على تكامل التعلم الآلي
    if (window.MLIntegration) {
      window.MLIntegration = this.applyCompatibility(
        'ml-integration',
        window.MLIntegration,
        '1.0', // الإصدار الحالي
        '1.1'  // الإصدار المستهدف
      );
    }
    
    console.log("تم تطبيق توافق الإصدارات بنجاح");
  }
  
  /**
   * التحقق من توافق الإصدارات
   * @returns {boolean} - هل الإصدارات متوافقة
   */
  checkVersionCompatibility() {
    let compatible = true;
    
    // التحقق من توافق محلل الشارت
    if (window.ChartImageAnalyzer) {
      if (!window.ChartImageAnalyzer.analyzeChart) {
        console.warn("محلل الشارت غير متوافق: دالة analyzeChart غير موجودة");
        compatible = false;
      }
    }
    
    // التحقق من توافق تكامل التعلم الآلي
    if (window.MLIntegration) {
      if (!window.MLIntegration.analyzeWithML) {
        console.warn("تكامل التعلم الآلي غير متوافق: دالة analyzeWithML غير موجودة");
        compatible = false;
      }
    }
    
    return compatible;
  }
}

// إنشاء كائن عالمي لمدير توافق الإصدارات
window.versionCompatibility = new VersionCompatibility();

// تطبيق توافق الإصدارات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  window.versionCompatibility.applyGlobalCompatibility();
});