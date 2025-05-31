/**
 * معالجة أحداث اللمس للتطبيق
 */

document.addEventListener('DOMContentLoaded', function() {
  // تحسين استجابة الأزرار للمس
  const allButtons = document.querySelectorAll('button, .btn, .chart-control, .nav-menu a');
  
  allButtons.forEach(button => {
    // إضافة فترة انتظار للمس لتحسين الاستجابة
    button.addEventListener('touchstart', function(e) {
      this.classList.add('touch-active');
    }, { passive: true });
    
    button.addEventListener('touchend', function(e) {
      this.classList.remove('touch-active');
    }, { passive: true });
    
    // منع النقر المزدوج
    button.addEventListener('touchend', function(e) {
      e.preventDefault();
      // تنفيذ النقرة بعد تأخير قصير
      setTimeout(() => {
        this.click();
      }, 10);
    }, { passive: false });
  });
  
  // تحسين التمرير للأجهزة اللمسية
  const scrollableElements = document.querySelectorAll('.scrollable');
  
  scrollableElements.forEach(element => {
    let startY;
    let startX;
    let scrollTop;
    let scrollLeft;
    
    element.addEventListener('touchstart', function(e) {
      startY = e.touches[0].pageY;
      startX = e.touches[0].pageX;
      scrollTop = this.scrollTop;
      scrollLeft = this.scrollLeft;
    }, { passive: true });
    
    element.addEventListener('touchmove', function(e) {
      const y = e.touches[0].pageY;
      const x = e.touches[0].pageX;
      
      // التمرير العمودي
      this.scrollTop = scrollTop + startY - y;
      // التمرير الأفقي
      this.scrollLeft = scrollLeft + startX - x;
    }, { passive: true });
  });
  
  // تحسين التفاعل مع الرسوم البيانية
  const chartContainer = document.getElementById('chart-container');
  
  if (chartContainer) {
    // تمكين التكبير/التصغير باللمس
    let initialDistance = 0;
    let currentScale = 1;
    
    chartContainer.addEventListener('touchstart', function(e) {
      if (e.touches.length === 2) {
        initialDistance = getDistance(e.touches[0], e.touches[1]);
      }
    }, { passive: true });
    
    chartContainer.addEventListener('touchmove', function(e) {
      if (e.touches.length === 2) {
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const newScale = currentScale * (currentDistance / initialDistance);
        
        // تحديد نطاق التكبير/التصغير
        if (newScale > 0.5 && newScale < 3) {
          // تطبيق التكبير/التصغير على الرسم البياني
          applyScale(newScale);
          currentScale = newScale;
        }
        
        initialDistance = currentDistance;
      }
    }, { passive: true });
  }
  
  // دالة لحساب المسافة بين نقطتي لمس
  function getDistance(touch1, touch2) {
    const dx = touch1.pageX - touch2.pageX;
    const dy = touch1.pageY - touch2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  // دالة لتطبيق التكبير/التصغير على الرسم البياني
  function applyScale(scale) {
    // يمكن تنفيذ التكبير/التصغير هنا حسب نوع الرسم البياني المستخدم
    // مثال: إذا كان يستخدم Chart.js
    if (window.chartInstance) {
      // تطبيق التكبير/التصغير على الرسم البياني
    }
  }
});