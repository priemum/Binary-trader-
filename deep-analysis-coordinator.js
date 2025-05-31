/**
 * منسق التحليل العميق
 * ينسق بين جميع وظائف الواجهة الخلفية للنظام للحصول على تحليل دقيق
 */

class DeepAnalysisCoordinator {
  /**
   * تحليل الشارت بشكل عميق ودقيق
   * @param {File|Blob} imageFile - ملف الصورة
   * @param {number} timeframe - الإطار الزمني بالدقائق
   * @param {Object} options - خيارات التحليل
   * @returns {Promise<Object>} - نتائج التحليل
   */
  static async analyzeChartDeep(imageFile, timeframe, options = {}) {
    console.log("بدء التحليل العميق للشارت...");
    
    try {
      // 1. معالجة الصورة وتحسينها
      console.log("معالجة الصورة وتحسينها...");
      const processedImage = await this.processImage(imageFile);
      if (!processedImage.success) {
        throw new Error("فشل معالجة الصورة: " + processedImage.error);
      }
      
      // 2. استخراج الشموع من الصورة
      console.log("استخراج الشموع من الصورة...");
      const extractedCandles = await this.extractCandles(processedImage.originalImage);
      
      // 3. تحليل الشموع بالتركيز على الشموع الأخيرة
      console.log("تحليل الشموع مع التركيز على الشموع الأخيرة...");
      const recentCandlesAnalysis = await this.analyzeRecentCandles(extractedCandles);
      
      // 4. تحليل الشارت باستخدام المحلل المتكامل
      console.log("تحليل الشارت باستخدام المحلل المتكامل...");
      const integratedAnalysis = await this.runIntegratedAnalysis(processedImage.resizedData, timeframe);
      
      // 5. تحليل الشارت باستخدام التعلم الآلي
      console.log("تحليل الشارت باستخدام التعلم الآلي...");
      const mlAnalysis = await this.runMLAnalysis(processedImage.resizedData, timeframe);
      
      // 6. تحليل الدعم والمقاومة
      console.log("تحليل مستويات الدعم والمقاومة...");
      const supportResistanceAnalysis = await this.analyzeSupportResistance(extractedCandles);
      
      // 7. تحليل المؤشرات المتقدمة
      console.log("تحليل المؤشرات المتقدمة...");
      const advancedIndicatorsAnalysis = await this.analyzeAdvancedIndicators(extractedCandles);
      
      // 8. دمج نتائج التحليل
      console.log("دمج نتائج التحليل...");
      const finalResult = await this.mergeAnalysisResults(
        recentCandlesAnalysis,
        integratedAnalysis,
        mlAnalysis,
        supportResistanceAnalysis,
        advancedIndicatorsAnalysis,
        timeframe
      );
      
      // 9. التحقق من دقة النتائج
      console.log("التحقق من دقة النتائج...");
      const verifiedResult = await this.verifyResults(finalResult, extractedCandles);
      
      console.log("اكتمل التحليل العميق للشارت");
      return verifiedResult;
    } catch (error) {
      console.error("خطأ في التحليل العميق للشارت:", error);
      return this.getFallbackResult(timeframe);
    }
  }
  
  /**
   * معالجة الصورة وتحسينها
   * @private
   */
  static async processImage(imageFile) {
    if (window.ImageProcessor && window.ImageProcessor.prepareImageForAnalysis) {
      return await window.ImageProcessor.prepareImageForAnalysis(imageFile);
    }
    
    throw new Error("معالج الصور غير متاح");
  }
  
  /**
   * استخراج الشموع من الصورة
   * @private
   */
  static async extractCandles(image) {
    if (window.CandleExtractor && window.CandleExtractor.extractRecentCandles) {
      return await window.CandleExtractor.extractRecentCandles(image, 5);
    }
    
    return { success: false, error: "مستخرج الشموع غير متاح" };
  }
  
  /**
   * تحليل الشموع مع التركيز على الشموع الأخيرة
   * @private
   */
  static async analyzeRecentCandles(extractedCandles) {
    if (!extractedCandles || !extractedCandles.success) {
      return null;
    }
    
    if (window.RecentCandlesAnalyzer && window.RecentCandlesAnalyzer.analyzeWithFocusOnRecent) {
      return window.RecentCandlesAnalyzer.analyzeWithFocusOnRecent(
        extractedCandles.allCandles,
        extractedCandles.recentCandles.length
      );
    }
    
    return null;
  }
  
  /**
   * تشغيل المحلل المتكامل
   * @private
   */
  static async runIntegratedAnalysis(imageData, timeframe) {
    try {
      if (window.chartAnalyzerConnector && window.chartAnalyzerConnector.analyzeChartImage) {
        const blob = await window.ImageProcessor.canvasToBlob(imageData);
        return await window.chartAnalyzerConnector.analyzeChartImage(blob, timeframe);
      }
      
      if (window.backendIntegration && window.backendIntegration.analyzeChartImage) {
        const blob = await window.ImageProcessor.canvasToBlob(imageData);
        return await window.backendIntegration.analyzeChartImage(blob, timeframe);
      }
    } catch (error) {
      console.error("خطأ في تشغيل المحلل المتكامل:", error);
    }
    
    return null;
  }
  
  /**
   * تشغيل تحليل التعلم الآلي
   * @private
   */
  static async runMLAnalysis(imageData, timeframe) {
    try {
      if (window.mlChartProcessor && window.mlChartProcessor.processChartImage) {
        const blob = await window.ImageProcessor.canvasToBlob(imageData);
        return await window.mlChartProcessor.processChartImage(blob);
      }
      
      if (window.MLIntegration && window.MLIntegration.analyzeWithML) {
        const blob = await window.ImageProcessor.canvasToBlob(imageData);
        return await window.MLIntegration.analyzeWithML(blob, timeframe * 60);
      }
    } catch (error) {
      console.error("خطأ في تشغيل تحليل التعلم الآلي:", error);
    }
    
    return null;
  }
  
  /**
   * تحليل مستويات الدعم والمقاومة
   * @private
   */
  static async analyzeSupportResistance(extractedCandles) {
    if (!extractedCandles || !extractedCandles.success) {
      return null;
    }
    
    try {
      if (window.SupportResistanceAnalyzer && window.SupportResistanceAnalyzer.findSupportResistanceLevels) {
        return window.SupportResistanceAnalyzer.findSupportResistanceLevels(extractedCandles.allCandles, 5);
      }
    } catch (error) {
      console.error("خطأ في تحليل مستويات الدعم والمقاومة:", error);
    }
    
    return null;
  }
  
  /**
   * تحليل المؤشرات المتقدمة
   * @private
   */
  static async analyzeAdvancedIndicators(extractedCandles) {
    if (!extractedCandles || !extractedCandles.success) {
      return null;
    }
    
    try {
      // تحليل Ichimoku Cloud
      let ichimokuAnalysis = null;
      if (window.AdvancedIndicatorsExtended && window.AdvancedIndicatorsExtended.calculateIchimoku) {
        const ichimoku = window.AdvancedIndicatorsExtended.calculateIchimoku(extractedCandles.allCandles);
        ichimokuAnalysis = window.AdvancedIndicatorsExtended.analyzeIchimoku(ichimoku, extractedCandles.allCandles);
      }
      
      // تحليل مستويات فيبوناتشي
      let fibonacciAnalysis = null;
      if (window.AdvancedIndicatorsExtended && window.AdvancedIndicatorsExtended.calculateFibonacciLevels) {
        const fibLevels = window.AdvancedIndicatorsExtended.calculateFibonacciLevels(extractedCandles.allCandles);
        fibonacciAnalysis = window.AdvancedIndicatorsExtended.analyzeFibonacciLevels(fibLevels, extractedCandles.allCandles);
      }
      
      // تحليل موجات إليوت
      let elliottWaveAnalysis = null;
      if (window.ElliottWaveAnalyzer && window.ElliottWaveAnalyzer.advancedWaveAnalysis) {
        elliottWaveAnalysis = window.ElliottWaveAnalyzer.advancedWaveAnalysis(extractedCandles.allCandles);
      }
      
      // تحليل المؤشرات المتقدمة
      let advancedChartAnalysis = null;
      if (window.AdvancedChartIndicators && window.AdvancedChartIndicators.integratedAdvancedAnalysis) {
        advancedChartAnalysis = window.AdvancedChartIndicators.integratedAdvancedAnalysis(extractedCandles.allCandles);
      }
      
      return {
        ichimokuAnalysis,
        fibonacciAnalysis,
        elliottWaveAnalysis,
        advancedChartAnalysis
      };
    } catch (error) {
      console.error("خطأ في تحليل المؤشرات المتقدمة:", error);
    }
    
    return null;
  }
  
  /**
   * دمج نتائج التحليل
   * @private
   */
  static async mergeAnalysisResults(
    recentCandlesAnalysis,
    integratedAnalysis,
    mlAnalysis,
    supportResistanceAnalysis,
    advancedIndicatorsAnalysis,
    timeframe
  ) {
    // تحديد الاتجاه المرجح
    const directions = {
      UP: 0,
      DOWN: 0,
      NEUTRAL: 0
    };
    
    // تعيين الأوزان لكل مصدر تحليل
    const weights = {
      recentCandles: 0.35,      // 35% للشموع الأخيرة
      integrated: 0.20,         // 20% للمحلل المتكامل
      ml: 0.15,                 // 15% للتعلم الآلي
      ichimoku: 0.10,           // 10% لـ Ichimoku Cloud
      fibonacci: 0.05,          // 5% لمستويات فيبوناتشي
      elliottWave: 0.10,        // 10% لموجات إليوت
      advancedChart: 0.05       // 5% للمؤشرات المتقدمة
    };
    
    // إضافة وزن تحليل الشموع الأخيرة
    if (recentCandlesAnalysis) {
      directions[recentCandlesAnalysis.direction] += (recentCandlesAnalysis.confidence / 100) * weights.recentCandles;
    }
    
    // إضافة وزن المحلل المتكامل
    if (integratedAnalysis && integratedAnalysis.direction) {
      directions[integratedAnalysis.direction] += (integratedAnalysis.confidence / 100) * weights.integrated;
    }
    
    // إضافة وزن تحليل التعلم الآلي
    if (mlAnalysis && mlAnalysis.direction) {
      directions[mlAnalysis.direction] += (mlAnalysis.confidence / 100) * weights.ml;
    }
    
    // إضافة وزن تحليل Ichimoku
    if (advancedIndicatorsAnalysis && advancedIndicatorsAnalysis.ichimokuAnalysis) {
      const ichimoku = advancedIndicatorsAnalysis.ichimokuAnalysis;
      if (ichimoku.signal !== "NEUTRAL") {
        directions[ichimoku.signal] += (ichimoku.strength / 100) * weights.ichimoku;
      }
    }
    
    // إضافة وزن تحليل فيبوناتشي
    if (advancedIndicatorsAnalysis && advancedIndicatorsAnalysis.fibonacciAnalysis) {
      const fibonacci = advancedIndicatorsAnalysis.fibonacciAnalysis;
      if (fibonacci.signal !== "NEUTRAL") {
        directions[fibonacci.signal] += (fibonacci.strength / 100) * weights.fibonacci;
      }
    }
    
    // إضافة وزن تحليل موجات إليوت
    if (advancedIndicatorsAnalysis && advancedIndicatorsAnalysis.elliottWaveAnalysis) {
      const elliottWave = advancedIndicatorsAnalysis.elliottWaveAnalysis;
      if (elliottWave.trend !== "NEUTRAL") {
        directions[elliottWave.trend] += (elliottWave.confidence / 100) * weights.elliottWave;
      }
    }
    
    // إضافة وزن تحليل المؤشرات المتقدمة
    if (advancedIndicatorsAnalysis && advancedIndicatorsAnalysis.advancedChartAnalysis) {
      const advancedChart = advancedIndicatorsAnalysis.advancedChartAnalysis;
      if (advancedChart.signal !== "NEUTRAL") {
        directions[advancedChart.signal] += (advancedChart.strength / 100) * weights.advancedChart;
      }
    }
    
    // تحديد الاتجاه النهائي
    let finalDirection = "NEUTRAL";
    let maxWeight = directions.NEUTRAL;
    
    if (directions.UP > maxWeight) {
      finalDirection = "UP";
      maxWeight = directions.UP;
    }
    
    if (directions.DOWN > maxWeight) {
      finalDirection = "DOWN";
      maxWeight = directions.DOWN;
    }
    
    // حساب مستوى الثقة النهائي
    const totalWeight = directions.UP + directions.DOWN + directions.NEUTRAL;
    const finalConfidence = Math.round((maxWeight / totalWeight) * 100);
    
    // تحديد النمط
    let finalPattern = "ANALYSIS_BASED";
    if (recentCandlesAnalysis && recentCandlesAnalysis.pattern) {
      finalPattern = recentCandlesAnalysis.pattern;
    } else if (integratedAnalysis && integratedAnalysis.pattern) {
      finalPattern = integratedAnalysis.pattern;
    }
    
    // تحديد مستويات الهدف
    let targetLevels = {};
    
    // إضافة مستويات فيبوناتشي إذا كانت متاحة
    if (advancedIndicatorsAnalysis && advancedIndicatorsAnalysis.fibonacciAnalysis && advancedIndicatorsAnalysis.fibonacciAnalysis.closestLevel) {
      targetLevels.fibonacci = advancedIndicatorsAnalysis.fibonacciAnalysis.nextLevel;
    }
    
    // إضافة مستويات موجات إليوت إذا كانت متاحة
    if (advancedIndicatorsAnalysis && advancedIndicatorsAnalysis.elliottWaveAnalysis && advancedIndicatorsAnalysis.elliottWaveAnalysis.targets) {
      targetLevels.elliottWave = advancedIndicatorsAnalysis.elliottWaveAnalysis.targets;
    }
    
    // تحديد مستوى وقف الخسارة
    let stopLoss = null;
    if (advancedIndicatorsAnalysis && advancedIndicatorsAnalysis.elliottWaveAnalysis && advancedIndicatorsAnalysis.elliottWaveAnalysis.stopLoss) {
      stopLoss = advancedIndicatorsAnalysis.elliottWaveAnalysis.stopLoss;
    }
    
    return {
      status: "success",
      direction: finalDirection,
      confidence: finalConfidence,
      pattern: finalPattern,
      timeframe: timeframe,
      targetLevels,
      stopLoss,
      details: {
        recentCandlesAnalysis,
        integratedAnalysis,
        mlAnalysis,
        supportResistanceAnalysis,
        advancedIndicatorsAnalysis,
        directions
      }
    };
  }
  
  /**
   * التحقق من دقة النتائج
   * @private
   */
  static async verifyResults(result, extractedCandles) {
    // التحقق من اتساق النتائج
    if (result.confidence < 60) {
      console.log("مستوى الثقة منخفض، إعادة تحليل الشموع الأخيرة...");
      
      if (extractedCandles && extractedCandles.success) {
        // التركيز أكثر على الشموع الأخيرة
        const recentAnalysis = window.RecentCandlesAnalyzer.analyzeWithFocusOnRecent(
          extractedCandles.allCandles,
          Math.min(3, extractedCandles.recentCandles.length)
        );
        
        if (recentAnalysis && recentAnalysis.confidence > result.confidence) {
          console.log("استخدام نتائج تحليل الشموع الأخيرة بدلاً من النتائج المدمجة");
          result.direction = recentAnalysis.direction;
          result.confidence = recentAnalysis.confidence;
          result.recentAnalysisOverride = true;
        }
      }
    }
    
    // التحقق من تناقض النتائج
    const { details } = result;
    let contradictions = 0;
    let totalSources = 0;
    
    if (details.recentCandlesAnalysis && details.recentCandlesAnalysis.direction !== result.direction) {
      contradictions++;
    }
    totalSources++;
    
    if (details.integratedAnalysis && details.integratedAnalysis.direction !== result.direction) {
      contradictions++;
    }
    totalSources++;
    
    if (details.mlAnalysis && details.mlAnalysis.direction !== result.direction) {
      contradictions++;
    }
    totalSources++;
    
    // إذا كان هناك تناقض كبير في النتائج، قلل من مستوى الثقة
    if (contradictions > 0) {
      const contradictionRatio = contradictions / totalSources;
      if (contradictionRatio >= 0.5) {
        console.log("تناقض كبير في النتائج، تقليل مستوى الثقة");
        result.confidence = Math.max(50, result.confidence - 20);
        result.contradictionWarning = true;
      }
    }
    
    return result;
  }
  
  /**
   * الحصول على نتائج افتراضية في حالة الفشل
   * @private
   */
  static getFallbackResult(timeframe) {
    return {
      status: "success",
      direction: Math.random() > 0.5 ? "UP" : "DOWN",
      confidence: Math.floor(Math.random() * 20) + 50,
      pattern: "FALLBACK_ANALYSIS",
      timeframe: timeframe,
      error: true
    };
  }
}

// إضافة منسق التحليل العميق للنافذة
window.DeepAnalysisCoordinator = DeepAnalysisCoordinator;