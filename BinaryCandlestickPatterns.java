/**
 * أنماط الشموع اليابانية المحسنة لمنصات الخيارات الثنائية
 */
public class BinaryCandlestickPatterns {

    /**
     * فئة تمثل الشمعة اليابانية مع خصائص إضافية للخيارات الثنائية
     */
    public static class BinaryCandle {
        private double open;
        private double close;
        private double high;
        private double low;
        private long volume;
        private long timestamp;
        private int timeframe; // بالثواني (60، 300، 900، إلخ)

        public BinaryCandle(double open, double close, double high, double low, long volume, long timestamp, int timeframe) {
            this.open = open;
            this.close = close;
            this.high = high;
            this.low = low;
            this.volume = volume;
            this.timestamp = timestamp;
            this.timeframe = timeframe;
        }

        public double getOpen() { return open; }
        public double getClose() { return close; }
        public double getHigh() { return high; }
        public double getLow() { return low; }
        public long getVolume() { return volume; }
        public long getTimestamp() { return timestamp; }
        public int getTimeframe() { return timeframe; }

        public double getBodyLength() { return Math.abs(close - open); }
        public double getUpperShadow() { return isGreen() ? high - close : high - open; }
        public double getLowerShadow() { return isGreen() ? open - low : close - low; }
        public double getTotalLength() { return high - low; }
        
        public boolean isGreen() { return close > open; }
        public boolean isRed() { return open > close; }
        
        // تحسين دقة تحديد الدوجي للخيارات الثنائية
        public boolean isDoji() {
            double bodyToTotalRatio = getBodyLength() / getTotalLength();
            return bodyToTotalRatio <= 0.03; // أكثر دقة للخيارات الثنائية
        }
        
        // حساب قوة الشمعة (مفيد للخيارات الثنائية)
        public double getCandleStrength() {
            double bodyToTotalRatio = getBodyLength() / getTotalLength();
            double volumeFactor = Math.log10(volume) / 5; // تطبيع الحجم
            return bodyToTotalRatio * (isGreen() ? 1 : -1) * (1 + volumeFactor);
        }
    }

    /**
     * محلل أنماط الشموع المحسن للخيارات الثنائية
     */
    public static class BinaryPatternRecognizer {
        
        // معاملات تحسين للخيارات الثنائية
        private static final double DOJI_THRESHOLD = 0.03;
        private static final double SHADOW_RATIO = 2.0;
        private static final double ENGULFING_STRENGTH = 1.2;
        
        /**
         * تقييم قوة النمط (0-100)
         * قيمة أعلى = إشارة أقوى
         */
        public static double getPatternStrength(String patternName, BinaryCandle[] candles) {
            switch (patternName) {
                case "DOJI": return dojiStrength(candles[candles.length-1]);
                case "HAMMER": return hammerStrength(candles[candles.length-1]);
                case "ENGULFING": return engulfingStrength(candles[candles.length-1], candles[candles.length-2]);
                case "MORNING_STAR": return morningStarStrength(
                    candles[candles.length-3], candles[candles.length-2], candles[candles.length-1]);
                case "EVENING_STAR": return eveningStarStrength(
                    candles[candles.length-3], candles[candles.length-2], candles[candles.length-1]);
                default: return 0;
            }
        }
        
        /**
         * تحديد اتجاه الإشارة (UP/DOWN/NEUTRAL)
         */
        public static String getSignalDirection(String patternName, BinaryCandle[] candles) {
            switch (patternName) {
                case "DOJI": return "NEUTRAL";
                case "HAMMER": return isDowntrend(candles) ? "UP" : "NEUTRAL";
                case "SHOOTING_STAR": return isUptrend(candles) ? "DOWN" : "NEUTRAL";
                case "BULLISH_ENGULFING": return "UP";
                case "BEARISH_ENGULFING": return "DOWN";
                case "MORNING_STAR": return "UP";
                case "EVENING_STAR": return "DOWN";
                default: return "NEUTRAL";
            }
        }
        
        /**
         * تحديد الإطار الزمني المناسب للنمط
         * يعيد الإطار الزمني الأمثل بالثواني (60, 300, 900, إلخ)
         */
        public static int getOptimalTimeframe(String patternName) {
            switch (patternName) {
                case "DOJI": return 60; // مناسب للإطارات القصيرة
                case "HAMMER": return 300; // مناسب للإطارات المتوسطة
                case "ENGULFING": return 300; // مناسب للإطارات المتوسطة
                case "MORNING_STAR": return 900; // مناسب للإطارات الطويلة
                case "EVENING_STAR": return 900; // مناسب للإطارات الطويلة
                default: return 300;
            }
        }
        
        /**
         * تحديد المدة المثالية للصفقة بناءً على النمط (بالثواني)
         */
        public static int getOptimalTradeDuration(String patternName, int timeframe) {
            switch (patternName) {
                case "DOJI": return timeframe * 2;
                case "HAMMER": return timeframe * 3;
                case "ENGULFING": return timeframe * 3;
                case "MORNING_STAR": return timeframe * 4;
                case "EVENING_STAR": return timeframe * 4;
                default: return timeframe * 3;
            }
        }
        
        /**
         * التعرف على نمط الدوجي مع تقييم قوته
         */
        public static boolean isDoji(BinaryCandle candle) {
            return candle.isDoji();
        }
        
        private static double dojiStrength(BinaryCandle candle) {
            double bodyToTotalRatio = candle.getBodyLength() / candle.getTotalLength();
            return Math.max(0, 100 * (DOJI_THRESHOLD - bodyToTotalRatio) / DOJI_THRESHOLD);
        }
        
        /**
         * التعرف على نمط المطرقة مع تقييم قوته
         */
        public static boolean isHammer(BinaryCandle candle) {
            double bodySize = candle.getBodyLength();
            double lowerShadow = candle.getLowerShadow();
            double upperShadow = candle.getUpperShadow();
            
            return lowerShadow >= SHADOW_RATIO * bodySize && 
                   upperShadow <= 0.1 * bodySize &&
                   bodySize > 0;
        }
        
        private static double hammerStrength(BinaryCandle candle) {
            if (!isHammer(candle)) return 0;
            
            double bodySize = candle.getBodyLength();
            double lowerShadow = candle.getLowerShadow();
            double shadowToBodyRatio = lowerShadow / bodySize;
            
            return Math.min(100, 50 + (shadowToBodyRatio - SHADOW_RATIO) * 10);
        }
        
        /**
         * التعرف على نمط البلع الصاعد مع تقييم قوته
         */
        public static boolean isBullishEngulfing(BinaryCandle current, BinaryCandle previous) {
            return previous.isRed() && 
                   current.isGreen() && 
                   current.getOpen() <= previous.getClose() && 
                   current.getClose() >= previous.getOpen();
        }
        
        /**
         * التعرف على نمط البلع الهابط مع تقييم قوته
         */
        public static boolean isBearishEngulfing(BinaryCandle current, BinaryCandle previous) {
            return previous.isGreen() && 
                   current.isRed() && 
                   current.getOpen() >= previous.getClose() && 
                   current.getClose() <= previous.getOpen();
        }
        
        private static double engulfingStrength(BinaryCandle current, BinaryCandle previous) {
            boolean isBullish = isBullishEngulfing(current, previous);
            boolean isBearish = isBearishEngulfing(current, previous);
            
            if (!isBullish && !isBearish) return 0;
            
            double currentBodySize = current.getBodyLength();
            double previousBodySize = previous.getBodyLength();
            double sizeRatio = currentBodySize / previousBodySize;
            
            return Math.min(100, 60 + (sizeRatio - ENGULFING_STRENGTH) * 20);
        }
        
        /**
         * التعرف على نمط نجمة الصباح مع تقييم قوته
         */
        public static boolean isMorningStar(BinaryCandle c1, BinaryCandle c2, BinaryCandle c3) {
            return c1.isRed() && 
                   c2.getBodyLength() < c1.getBodyLength() * 0.3 && 
                   c3.isGreen() && 
                   c3.getClose() > (c1.getOpen() + c1.getClose()) / 2;
        }
        
        private static double morningStarStrength(BinaryCandle c1, BinaryCandle c2, BinaryCandle c3) {
            if (!isMorningStar(c1, c2, c3)) return 0;
            
            double c1BodySize = c1.getBodyLength();
            double c3BodySize = c3.getBodyLength();
            double c2BodySize = c2.getBodyLength();
            
            double gapSize = Math.min(
                Math.abs(c1.getLow() - c2.getHigh()),
                Math.abs(c2.getLow() - c3.getHigh())
            );
            
            double bodyRatio = c3BodySize / c1BodySize;
            double smallBodyFactor = 1 - (c2BodySize / c1BodySize);
            
            return Math.min(100, 70 + bodyRatio * 10 + smallBodyFactor * 10 + gapSize * 10);
        }
        
        /**
         * التعرف على نمط نجمة المساء مع تقييم قوته
         */
        public static boolean isEveningStar(BinaryCandle c1, BinaryCandle c2, BinaryCandle c3) {
            return c1.isGreen() && 
                   c2.getBodyLength() < c1.getBodyLength() * 0.3 && 
                   c3.isRed() && 
                   c3.getClose() < (c1.getOpen() + c1.getClose()) / 2;
        }
        
        private static double eveningStarStrength(BinaryCandle c1, BinaryCandle c2, BinaryCandle c3) {
            if (!isEveningStar(c1, c2, c3)) return 0;
            
            double c1BodySize = c1.getBodyLength();
            double c3BodySize = c3.getBodyLength();
            double c2BodySize = c2.getBodyLength();
            
            double gapSize = Math.min(
                Math.abs(c1.getHigh() - c2.getLow()),
                Math.abs(c2.getHigh() - c3.getLow())
            );
            
            double bodyRatio = c3BodySize / c1BodySize;
            double smallBodyFactor = 1 - (c2BodySize / c1BodySize);
            
            return Math.min(100, 70 + bodyRatio * 10 + smallBodyFactor * 10 + gapSize * 10);
        }
        
        /**
         * تحديد ما إذا كان هناك اتجاه صاعد
         */
        public static boolean isUptrend(BinaryCandle[] candles) {
            if (candles.length < 5) return false;
            
            // استخدام المتوسط المتحرك البسيط لتحديد الاتجاه
            double[] sma = calculateSMA(candles, 5);
            return sma[sma.length-1] > sma[sma.length-3];
        }
        
        /**
         * تحديد ما إذا كان هناك اتجاه هابط
         */
        public static boolean isDowntrend(BinaryCandle[] candles) {
            if (candles.length < 5) return false;
            
            // استخدام المتوسط المتحرك البسيط لتحديد الاتجاه
            double[] sma = calculateSMA(candles, 5);
            return sma[sma.length-1] < sma[sma.length-3];
        }
        
        /**
         * حساب المتوسط المتحرك البسيط
         */
        private static double[] calculateSMA(BinaryCandle[] candles, int period) {
            double[] sma = new double[candles.length];
            
            for (int i = 0; i < candles.length; i++) {
                if (i < period - 1) {
                    sma[i] = 0;
                    continue;
                }
                
                double sum = 0;
                for (int j = 0; j < period; j++) {
                    sum += candles[i - j].getClose();
                }
                sma[i] = sum / period;
            }
            
            return sma;
        }
    }
    
    /**
     * فئة لتوليد إشارات التداول للخيارات الثنائية
     */
    public static class BinarySignalGenerator {
        
        /**
         * توليد إشارة تداول بناءً على أنماط الشموع
         * @return كائن يمثل إشارة التداول
         */
        public static BinarySignal generateSignal(BinaryCandle[] candles) {
            if (candles.length < 5) return null;
            
            BinaryCandle current = candles[candles.length-1];
            BinaryCandle previous = candles[candles.length-2];
            BinaryCandle beforePrevious = candles[candles.length-3];
            
            // فحص الأنماط بترتيب الأولوية
            if (BinaryPatternRecognizer.isMorningStar(beforePrevious, previous, current)) {
                double strength = BinaryPatternRecognizer.getPatternStrength("MORNING_STAR", candles);
                int duration = BinaryPatternRecognizer.getOptimalTradeDuration("MORNING_STAR", current.getTimeframe());
                return new BinarySignal("MORNING_STAR", "UP", strength, duration, current.getTimestamp());
            }
            
            if (BinaryPatternRecognizer.isEveningStar(beforePrevious, previous, current)) {
                double strength = BinaryPatternRecognizer.getPatternStrength("EVENING_STAR", candles);
                int duration = BinaryPatternRecognizer.getOptimalTradeDuration("EVENING_STAR", current.getTimeframe());
                return new BinarySignal("EVENING_STAR", "DOWN", strength, duration, current.getTimestamp());
            }
            
            if (BinaryPatternRecognizer.isBullishEngulfing(current, previous)) {
                double strength = BinaryPatternRecognizer.getPatternStrength("ENGULFING", candles);
                int duration = BinaryPatternRecognizer.getOptimalTradeDuration("ENGULFING", current.getTimeframe());
                return new BinarySignal("BULLISH_ENGULFING", "UP", strength, duration, current.getTimestamp());
            }
            
            if (BinaryPatternRecognizer.isBearishEngulfing(current, previous)) {
                double strength = BinaryPatternRecognizer.getPatternStrength("ENGULFING", candles);
                int duration = BinaryPatternRecognizer.getOptimalTradeDuration("ENGULFING", current.getTimeframe());
                return new BinarySignal("BEARISH_ENGULFING", "DOWN", strength, duration, current.getTimestamp());
            }
            
            if (BinaryPatternRecognizer.isHammer(current) && BinaryPatternRecognizer.isDowntrend(candles)) {
                double strength = BinaryPatternRecognizer.getPatternStrength("HAMMER", candles);
                int duration = BinaryPatternRecognizer.getOptimalTradeDuration("HAMMER", current.getTimeframe());
                return new BinarySignal("HAMMER", "UP", strength, duration, current.getTimestamp());
            }
            
            return null; // لا توجد إشارة قوية
        }
    }
    
    /**
     * فئة تمثل إشارة تداول للخيارات الثنائية
     */
    public static class BinarySignal {
        private String patternName;
        private String direction; // UP, DOWN, NEUTRAL
        private double strength; // 0-100
        private int recommendedDuration; // بالثواني
        private long timestamp;
        
        public BinarySignal(String patternName, String direction, double strength, 
                           int recommendedDuration, long timestamp) {
            this.patternName = patternName;
            this.direction = direction;
            this.strength = strength;
            this.recommendedDuration = recommendedDuration;
            this.timestamp = timestamp;
        }
        
        public String getPatternName() { return patternName; }
        public String getDirection() { return direction; }
        public double getStrength() { return strength; }
        public int getRecommendedDuration() { return recommendedDuration; }
        public long getTimestamp() { return timestamp; }
        
        @Override
        public String toString() {
            return String.format("Signal: %s, Direction: %s, Strength: %.1f%%, Duration: %ds", 
                               patternName, direction, strength, recommendedDuration);
        }
    }
    
    /**
     * مثال على استخدام المكتبة
     */
    public static void main(String[] args) {
        // إنشاء بيانات الشموع للاختبار
        BinaryCandle[] candles = new BinaryCandle[5];
        
        // شموع في اتجاه هابط ثم نمط انعكاسي (مطرقة)
        candles[0] = new BinaryCandle(110, 105, 112, 104, 1000, System.currentTimeMillis() - 4*60000, 60);
        candles[1] = new BinaryCandle(105, 102, 106, 101, 1200, System.currentTimeMillis() - 3*60000, 60);
        candles[2] = new BinaryCandle(102, 98, 103, 97, 1300, System.currentTimeMillis() - 2*60000, 60);
        candles[3] = new BinaryCandle(98, 95, 99, 94, 1500, System.currentTimeMillis() - 60000, 60);
        candles[4] = new BinaryCandle(94, 96, 96, 90, 2000, System.currentTimeMillis(), 60); // مطرقة
        
        // توليد إشارة
        BinarySignal signal = BinarySignalGenerator.generateSignal(candles);
        
        if (signal != null) {
            System.out.println("تم اكتشاف إشارة:");
            System.out.println(signal);
            System.out.println("قوة الإشارة: " + signal.getStrength() + "%");
            System.out.println("المدة المقترحة: " + signal.getRecommendedDuration() + " ثانية");
        } else {
            System.out.println("لا توجد إشارة قوية في الوقت الحالي");
        }
    }
}