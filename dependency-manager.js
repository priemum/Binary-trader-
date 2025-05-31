/**
 * مدير التبعيات
 * يدير العلاقات بين المكونات ويضمن تهيئتها بالترتيب الصحيح
 */

class DependencyManager {
  constructor() {
    // تعريف تبعيات المكونات
    this.dependencies = {
      'apiService': ['apiConnector'],
      'chartAnalyzerConnector': ['apiConnector', 'apiService'],
      'backendIntegration': ['chartAnalyzerConnector'],
      'main': ['chartAnalyzerConnector', 'chartDataExtractor', 'mlChartProcessor']
    };
    
    // حالة تهيئة المكونات
    this.initializedComponents = {};
  }

  /**
   * تهيئة مكون مع تبعياته
   * @param {string} componentName - اسم المكون
   * @returns {boolean} - نجاح التهيئة
   */
  initializeWithDependencies(componentName) {
    console.log(`تهيئة المكون مع تبعياته: ${componentName}`);
    
    // التحقق مما إذا كان المكون مهيأ بالفعل
    if (this.initializedComponents[componentName]) {
      return true;
    }
    
    // تهيئة التبعيات أولاً
    const dependencies = this.dependencies[componentName] || [];
    for (const dependency of dependencies) {
      const success = this.initializeWithDependencies(dependency);
      if (!success) {
        console.error(`فشل تهيئة التبعية ${dependency} للمكون ${componentName}`);
        return false;
      }
    }
    
    // تهيئة المكون نفسه
    const success = this.initializeComponent(componentName);
    if (success) {
      this.initializedComponents[componentName] = true;
    }
    
    return success;
  }

  /**
   * تهيئة مكون محدد
   * @param {string} componentName - اسم المكون
   * @returns {boolean} - نجاح التهيئة
   */
  initializeComponent(componentName) {
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
          
        case 'main':
          // المكون الرئيسي لا يحتاج إلى تهيئة خاصة
          break;
          
        default:
          // محاولة تهيئة المكون باستخدام الاسم
          const className = componentName.charAt(0).toUpperCase() + componentName.slice(1);
          if (window[className] && typeof window[className] === 'function') {
            window[componentName.toLowerCase()] = new window[className]();
          }
          break;
      }
      
      return true;
    } catch (error) {
      console.error(`فشل تهيئة المكون ${componentName}:`, error);
      return false;
    }
  }

  /**
   * تهيئة جميع المكونات
   * @returns {boolean} - نجاح التهيئة
   */
  initializeAllComponents() {
    console.log("تهيئة جميع المكونات...");
    
    try {
      // تهيئة المكونات الأساسية مع تبعياتها
      const coreComponents = [
        'apiConnector',
        'apiService',
        'chartDataExtractor',
        'mlChartProcessor',
        'chartAnalyzerConnector',
        'backendIntegration',
        'main'
      ];
      
      for (const component of coreComponents) {
        this.initializeWithDependencies(component);
      }
      
      console.log("تم تهيئة جميع المكونات بنجاح");
      return true;
    } catch (error) {
      console.error("فشل تهيئة المكونات:", error);
      return false;
    }
  }

  /**
   * التحقق من تهيئة مكون محدد
   * @param {string} componentName - اسم المكون
   * @returns {boolean} - هل المكون مهيأ
   */
  isComponentInitialized(componentName) {
    return this.initializedComponents[componentName] === true;
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
    
    return coreComponents.every(component => this.isComponentInitialized(component));
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

// إنشاء كائن عالمي لمدير التبعيات
window.dependencyManager = new DependencyManager();

// تنفيذ التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  // انتظار اكتمال تحميل المكونات
  document.addEventListener('componentsLoaded', function() {
    console.log("بدء تهيئة المكونات مع التبعيات بعد اكتمال التحميل...");
    window.dependencyManager.initializeAllComponents();
  });
});