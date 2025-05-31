/**
 * ملف التحميل المسبق
 * يقوم بتحميل المكونات الأساسية قبل تحميل الصفحة
 */

// تحديد المكونات الأساسية التي يجب تحميلها مسبقًا
const coreComponents = [
  'js/api-connector.js',
  'js/api-service.js',
  'js/chart-data-extractor.js',
  'js/ml-chart-processor.js',
  'js/chart-analyzer-connector.js'
];

// تحميل المكونات الأساسية
function preloadCoreComponents() {
  console.log('تحميل المكونات الأساسية مسبقًا...');
  
  coreComponents.forEach(component => {
    const script = document.createElement('script');
    script.src = component;
    script.async = false; // ضمان التحميل بالترتيب
    
    // إضافة معلمات لمنع التخزين المؤقت
    script.src = `${component}?v=${new Date().getTime()}`;
    
    document.head.appendChild(script);
    console.log(`تم طلب تحميل: ${component}`);
  });
}

// تنفيذ التحميل المسبق
preloadCoreComponents();

// التحقق من اكتمال التحميل
function checkComponentsLoaded() {
  const requiredComponents = [
    'apiConnector',
    'apiService',
    'chartAnalyzerConnector'
  ];
  
  const allLoaded = requiredComponents.every(component => window[component] !== undefined);
  
  if (allLoaded) {
    console.log('تم تحميل جميع المكونات الأساسية بنجاح');
    
    // إطلاق حدث اكتمال التحميل المسبق
    const event = new CustomEvent('preloadComplete');
    document.dispatchEvent(event);
  } else {
    console.log('جاري انتظار تحميل المكونات...');
    setTimeout(checkComponentsLoaded, 100);
  }
}

// بدء التحقق بعد فترة قصيرة
setTimeout(checkComponentsLoaded, 500);