/**
 * نظام تحميل المكونات
 * يضمن تحميل جميع ملفات JavaScript بالترتيب الصحيح
 */

class ComponentLoader {
  constructor() {
    this.loadedComponents = {};
    this.componentDependencies = {
      'api-connector.js': [],
      'api-service.js': ['api-connector.js'],
      'chart-data-extractor.js': [],
      'ml-chart-processor.js': [],
      'chart-analyzer-connector.js': ['api-connector.js', 'api-service.js'],
      'color-preserving-analyzer.js': [],
      'advanced-indicators-extended.js': [],
      'elliott-wave-analyzer.js': [],
      'advanced-chart-indicators.js': [],
      'fallback-analyzer.js': [],
      'debug-helper.js': [],
      'backend-integration.js': [],
      'chart-analyzer.js': [],
      'integrated-analyzer.js': ['chart-analyzer.js'],
      'pattern-recognition.js': [],
      'support-resistance-analyzer.js': [],
      'main.js': ['chart-analyzer-connector.js', 'chart-data-extractor.js', 'ml-chart-processor.js']
    };
  }

  /**
   * تحميل جميع المكونات
   * @returns {Promise<boolean>} - نجاح التحميل
   */
  async loadAllComponents() {
    console.log("بدء تحميل المكونات...");
    
    try {
      // تحميل المكونات الأساسية أولاً
      const coreComponents = [
        'api-connector.js',
        'api-service.js',
        'chart-data-extractor.js',
        'ml-chart-processor.js',
        'chart-analyzer-connector.js'
      ];
      
      for (const component of coreComponents) {
        await this.loadComponent(component);
      }
      
      // تحميل المكونات المتقدمة
      const advancedComponents = [
        'color-preserving-analyzer.js',
        'advanced-indicators-extended.js',
        'elliott-wave-analyzer.js',
        'advanced-chart-indicators.js',
        'fallback-analyzer.js',
        'debug-helper.js'
      ];
      
      for (const component of advancedComponents) {
        await this.loadComponent(component);
      }
      
      // تحميل مكونات الواجهة الخلفية
      const backendComponents = [
        'backend-integration.js',
        'chart-analyzer.js',
        'integrated-analyzer.js',
        'pattern-recognition.js',
        'support-resistance-analyzer.js'
      ];
      
      for (const component of backendComponents) {
        await this.loadComponent(component);
      }
      
      // تحميل الملف الرئيسي في النهاية
      await this.loadComponent('main.js');
      
      console.log("تم تحميل جميع المكونات بنجاح");
      return true;
    } catch (error) {
      console.error("فشل تحميل المكونات:", error);
      return false;
    }
  }

  /**
   * تحميل مكون محدد
   * @param {string} componentName - اسم المكون
   * @returns {Promise<boolean>} - نجاح التحميل
   */
  async loadComponent(componentName) {
    // التحقق مما إذا كان المكون محملاً بالفعل
    if (this.loadedComponents[componentName]) {
      return true;
    }
    
    // تحميل التبعيات أولاً
    const dependencies = this.componentDependencies[componentName] || [];
    for (const dependency of dependencies) {
      await this.loadComponent(dependency);
    }
    
    // تحديد مسار الملف
    let path = componentName;
    if (componentName.startsWith('api-') || 
        componentName === 'chart-data-extractor.js' || 
        componentName === 'ml-chart-processor.js' || 
        componentName === 'chart-analyzer-connector.js') {
      path = 'js/' + componentName;
    }
    
    // تحميل الملف
    return new Promise((resolve, reject) => {
      console.log(`تحميل المكون: ${componentName}`);
      
      const script = document.createElement('script');
      script.src = path;
      
      script.onload = () => {
        console.log(`تم تحميل المكون: ${componentName}`);
        this.loadedComponents[componentName] = true;
        resolve(true);
      };
      
      script.onerror = (error) => {
        console.error(`فشل تحميل المكون: ${componentName}`, error);
        reject(error);
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * التحقق من تحميل جميع المكونات
   * @returns {boolean} - هل تم تحميل جميع المكونات
   */
  areAllComponentsLoaded() {
    const requiredComponents = [
      'api-connector.js',
      'api-service.js',
      'chart-data-extractor.js',
      'ml-chart-processor.js',
      'chart-analyzer-connector.js',
      'main.js'
    ];
    
    return requiredComponents.every(component => this.loadedComponents[component]);
  }

  /**
   * تهيئة المكونات بعد التحميل
   */
  initializeComponents() {
    console.log("تهيئة المكونات...");
    
    // التحقق من وجود المكونات الأساسية
    if (!window.apiConnector) {
      console.log("إنشاء apiConnector...");
      window.apiConnector = new ApiConnector();
    }
    
    if (!window.apiService) {
      console.log("إنشاء apiService...");
      window.apiService = new ApiService();
    }
    
    if (!window.chartDataExtractor) {
      console.log("إنشاء chartDataExtractor...");
      window.chartDataExtractor = new ChartDataExtractor();
    }
    
    if (!window.mlChartProcessor) {
      console.log("إنشاء mlChartProcessor...");
      window.mlChartProcessor = new MLChartProcessor();
    }
    
    if (!window.chartAnalyzerConnector) {
      console.log("إنشاء chartAnalyzerConnector...");
      window.chartAnalyzerConnector = new ChartAnalyzerConnector();
    }
    
    console.log("تم تهيئة المكونات بنجاح");
  }
}

// إنشاء كائن عالمي لنظام تحميل المكونات
window.componentLoader = new ComponentLoader();

// تنفيذ التحميل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async function() {
  console.log("بدء تحميل المكونات...");
  
  try {
    // تحميل جميع المكونات
    await window.componentLoader.loadAllComponents();
    
    // تهيئة المكونات
    window.componentLoader.initializeComponents();
    
    console.log("تم تحميل وتهيئة جميع المكونات بنجاح");
    
    // إطلاق حدث اكتمال التحميل
    const event = new CustomEvent('componentsLoaded');
    document.dispatchEvent(event);
  } catch (error) {
    console.error("فشل تحميل المكونات:", error);
  }
});