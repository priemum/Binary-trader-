/**
 * نظام تهيئة المكونات
 * يضمن تهيئة جميع المكونات بالترتيب الصحيح
 */

class ComponentInitializer {
  constructor() {
    this.initializedComponents = {};
    this.initializationOrder = [
      'apiConnector',
      'apiService',
      'chartDataExtractor',
      'mlChartProcessor',
      'chartAnalyzerConnector',
      'backendIntegration'
    ];
  }

  /**
   * تهيئة جميع المكونات
   * @returns {boolean} - نجاح التهيئة
   */
  initializeAllComponents() {
    console.log("بدء تهيئة المكونات...");
    
    try {
      // تهيئة المكونات بالترتيب المحدد
      for (const componentName of this.initializationOrder) {
        this.initializeComponent(componentName);
      }
      
      console.log("تم تهيئة جميع المكونات بنجاح");
      return true;
    } catch (error) {
      console.error("فشل تهيئة المكونات:", error);
      return false;
    }
  }

  /**
   * تهيئة مكون محدد
   * @param {string} componentName - اسم المكون
   * @returns {boolean} - نجاح التهيئة
   */
  initializeComponent(componentName) {
    // التحقق مما إذا كان المكون مهيأ بالفعل
    if (this.initializedComponents[componentName]) {
      return true;
    }
    
    console.log(`تهيئة المكون: ${componentName}`);
    
    try {
      switch (componentName) {
        case 'apiConnector':
          if (!window.apiConnector && typeof ApiConnector !== 'undefined') {
            window.apiConnector = new ApiConnector();
          }
          break;
          
        case 'apiService':
          if (!window.apiService && typeof ApiService !== 'undefined') {
            window.apiService = new ApiService();
          }
          break;
          
        case 'chartDataExtractor':
          if (!window.chartDataExtractor && typeof ChartDataExtractor !== 'undefined') {
            window.chartDataExtractor = new ChartDataExtractor();
          }
          break;
          
        case 'mlChartProcessor':
          if (!window.mlChartProcessor && typeof MLChartProcessor !== 'undefined') {
            window.mlChartProcessor = new MLChartProcessor();
          }
          break;
          
        case 'chartAnalyzerConnector':
          if (!window.chartAnalyzerConnector && typeof ChartAnalyzerConnector !== 'undefined') {
            window.chartAnalyzerConnector = new ChartAnalyzerConnector();
          }
          break;
          
        case 'backendIntegration':
          if (!window.backendIntegration && typeof BackendIntegration !== 'undefined') {
            window.backendIntegration = new BackendIntegration();
          }
          break;
      }
      
      this.initializedComponents[componentName] = true;
      return true;
    } catch (error) {
      console.error(`فشل تهيئة المكون ${componentName}:`, error);
      return false;
    }
  }

  /**
   * التحقق من تهيئة جميع المكونات الأساسية
   * @returns {boolean} - هل تم تهيئة جميع المكونات الأساسية
   */
  areCoreComponentsInitialized() {
    const coreComponents = [
      'apiConnector',
      'apiService',
      'chartAnalyzerConnector'
    ];
    
    return coreComponents.every(component => this.initializedComponents[component]);
  }

  /**
   * إعادة تهيئة المكونات
   * @returns {boolean} - نجاح إعادة التهيئة
   */
  reinitializeComponents() {
    console.log("إعادة تهيئة المكونات...");
    
    // إعادة ضبط حالة التهيئة
    this.initializedComponents = {};
    
    // إعادة تهيئة جميع المكونات
    return this.initializeAllComponents();
  }
}

// إنشاء كائن عالمي لنظام تهيئة المكونات
window.componentInitializer = new ComponentInitializer();

// تنفيذ التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  // انتظار اكتمال تحميل المكونات
  document.addEventListener('componentsLoaded', function() {
    console.log("بدء تهيئة المكونات بعد اكتمال التحميل...");
    window.componentInitializer.initializeAllComponents();
  });
});