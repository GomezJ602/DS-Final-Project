import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Apple, Flame, Utensils, Droplets, Info, ScanBarcode, Loader2,
  Search, Plus, ChevronLeft, ChevronRight, Camera, Keyboard, X,
  CalendarDays, CheckCircle2, ChefHat, Trash2, Star,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import {
  format, addDays, addWeeks, addMonths,
  startOfWeek, startOfMonth, isSameDay, isSameMonth,
} from 'date-fns';
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const CALORIE_GOAL = 2500;

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  macros: { protein: number; carbs: number; fats: number };
  time?: string;
}

interface CustomFood {
  id: string;
  name: string;
  brand?: string;
  servingSize: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  notes?: string;
  createdAt: string;
}

const EMPTY_FORM = {
  name: '', brand: '', servingSize: '100g',
  calories: '', protein: '', carbs: '', fats: '',
  fiber: '', sugar: '', sodium: '', notes: '',
};

interface ScannedProduct {
  name: string;
  upc: string;
  calories: number;
  macros: { protein: number; carbs: number; fats: number };
  servingSize: string;
  brand?: string;
  image?: string;
}

const MOCK_FOOD_DB = [
  { name: "Banana", calories: 105, macros: { protein: 1, carbs: 27, fats: 0 } },
  { name: "Chicken Breast (100g)", calories: 165, macros: { protein: 31, carbs: 0, fats: 3 } },
  { name: "Brown Rice (1 cup)", calories: 216, macros: { protein: 5, carbs: 45, fats: 2 } },
  { name: "Broccoli (1 cup)", calories: 55, macros: { protein: 4, carbs: 11, fats: 0 } },
  { name: "Egg (Large)", calories: 72, macros: { protein: 6, carbs: 0, fats: 5 } },
  { name: "Whey Protein Scoop", calories: 120, macros: { protein: 24, carbs: 3, fats: 1 } },
  { name: "Olive Oil (1 tbsp)", calories: 119, macros: { protein: 0, carbs: 0, fats: 14 } },
  { name: "Avocado", calories: 234, macros: { protein: 3, carbs: 12, fats: 21 } },
  { name: "Oatmeal (1 cup)", calories: 158, macros: { protein: 6, carbs: 27, fats: 3 } },
  { name: "Almonds (1 oz)", calories: 164, macros: { protein: 6, carbs: 6, fats: 14 } },
  { name: "Greek Yogurt (1 cup)", calories: 100, macros: { protein: 17, carbs: 6, fats: 0 } },
  { name: "Salmon (100g)", calories: 208, macros: { protein: 20, carbs: 0, fats: 13 } },
];

const FOOD_RECOMMENDATIONS = [
  {
    name: "Grilled Chicken Salad", type: "High Protein", calories: 350,
    macros: { protein: 42, carbs: 12, fats: 8 },
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxhZCUyMGJvd2x8ZW58MXx8fHwxNzc0Mjc0NzA1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "A perfect blend of greens and lean protein to aid muscle recovery.",
  },
  {
    name: "Quinoa Bowl with Veggies", type: "Complex Carbs", calories: 420,
    macros: { protein: 15, carbs: 68, fats: 10 },
    image: "https://images.unsplash.com/photo-1610533514079-58a2c1436725?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbWVhbCUyMGNvb2tpbmd8ZW58MXx8fHwxNzc0Mjk2MDM1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Sustained energy release for your intense workout sessions.",
  },
  {
    name: "Salmon with Asparagus", type: "Healthy Fats", calories: 480,
    macros: { protein: 38, carbs: 8, fats: 32 },
    image: "https://images.unsplash.com/photo-1765128331807-4a6cf08d5e5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwYnJlYXN0JTIwZ3JpbGx8ZW58MXx8fHwxNzc0Mjk2MDM1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Rich in Omega-3s for joint health and inflammation reduction.",
  },
];

function dateKey(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

export default function NutritionGoals() {
  const today = new Date();

  // ── Date navigation ──────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(today);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showMonthCalendar, setShowMonthCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  // ── Food logs (date-keyed localStorage) ──────────────
  const [dayLogs, setDayLogs] = useState<Record<string, FoodItem[]>>({});

  // ── Hydration ─────────────────────────────────────────
  const [glasses, setGlasses] = useState(0);

  // ── Search ────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // ── Scanner ───────────────────────────────────────────
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanPhase, setScanPhase] = useState<'camera' | 'searching' | 'result' | 'manual' | 'error' | 'not-found' | 'add-product'>('camera');
  const [scanResult, setScanResult] = useState<ScannedProduct | null>(null);
  const [scanError, setScanError] = useState('');
  const [manualUPC, setManualUPC] = useState('');
  const [hasBarcodeDetector, setHasBarcodeDetector] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [cameraOn, setCameraOn] = useState(false);

  // ── UPC local database ────────────────────────────────
  const [upcCache, setUpcCache] = useState<Record<string, ScannedProduct>>({});
  const [notFoundUPC, setNotFoundUPC] = useState('');
  const [newProductForm, setNewProductForm] = useState({
    name: '', brand: '', servingSize: '1 serving',
    calories: '', protein: '', carbs: '', fats: '',
  });
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // ── Custom foods ─────────────────────────────────────
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [createFoodOpen, setCreateFoodOpen] = useState(false);
  const [isSavingFood, setIsSavingFood] = useState(false);
  const [foodForm, setFoodForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const scanningRef = useRef(false);
  const zxingControlsRef = useRef<IScannerControls | null>(null);

  // ── Effects ───────────────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ironcore_nutrition_v2');
      if (stored) setDayLogs(JSON.parse(stored));
    } catch (e) {}
    try {
      const cached = localStorage.getItem('ironcore_upc_cache');
      if (cached) setUpcCache(JSON.parse(cached));
    } catch (e) {}
    // Native BarcodeDetector isn't available on some platforms (notably Chrome on Windows).
    // We use a ZXing fallback, so scanning can still work.
    setHasBarcodeDetector(true);
    loadCustomFoods();
    fetch('http://localhost:8080/api/upc/all')
      .then(r => r.json())
      .then((products: ScannedProduct[]) => {
        if (Array.isArray(products)) {
          setUpcCache(prev => {
            const merged = { ...prev };
            products.forEach((p: ScannedProduct) => { if (p.upc) merged[p.upc] = p; });
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const hydration = JSON.parse(localStorage.getItem('ironcore_hydration') || '{}');
      setGlasses(hydration[dateKey(selectedDate)] || 0);
    } catch (e) {}
  }, [selectedDate]);

  // Auto-start camera when modal opens; cleanup when it closes
  useEffect(() => {
    if (!scannerOpen) {
      stopCamera();
      setScanPhase('camera');
      setScanResult(null);
      setScanError('');
      setManualUPC('');
      setCameraPermission('unknown');
      setCameraOn(false);
    } else {
      const timer = setTimeout(() => startScanner(), 150);
      return () => clearTimeout(timer);
    }
  }, [scannerOpen]);

  // ── Scanner functions ─────────────────────────────────
  async function startScanner() {
    try {
      setScanError('');
      if (!window.isSecureContext) {
        setScanError('Camera requires a secure context. Open the app at http://localhost:5173 (not your IP address).');
        setScanPhase('manual');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        // On desktop webcams, strict facingMode can fail. Keep it as "ideal".
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setCameraPermission('granted');
      streamRef.current = stream;
      setCameraOn(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      if ('BarcodeDetector' in window) {
        detectorRef.current = new (window as any).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'],
        });
        scanningRef.current = true;
        scanTick();
      } else {
        // Fallback scanner for platforms without BarcodeDetector (e.g. Chrome on Windows).
        scanningRef.current = true;
        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromVideoElement(videoRef.current!, (result, err) => {
          if (result && scanningRef.current) {
            const text = result.getText();
            // Stop scanning ASAP; lookup + UI work happens after.
            try { zxingControlsRef.current?.stop(); } catch {}
            zxingControlsRef.current = null;
            stopCamera();
            void lookupUPC(text);
            return;
          }
          // Ignore NotFound-style errors; scanner runs continuously.
          void err;
        });
        zxingControlsRef.current = controls;
      }
    } catch (e: any) {
      setCameraOn(false);
      if (e.name === 'NotAllowedError') {
        setCameraPermission('denied');
      }
      const msg = e?.message ? ` (${e.message})` : '';
      setScanError(`Camera error: ${e?.name || 'UnknownError'}${msg}`);
      setScanPhase('manual');
    }
  }

  function stopCamera() {
    scanningRef.current = false;
    cancelAnimationFrame(animFrameRef.current);
    try { zxingControlsRef.current?.stop(); } catch {}
    zxingControlsRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  }

  async function scanTick() {
    if (!scanningRef.current || !videoRef.current || !detectorRef.current) return;
    if (videoRef.current.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(scanTick);
      return;
    }
    try {
      const barcodes = await detectorRef.current.detect(videoRef.current);
      if (barcodes.length > 0 && scanningRef.current) {
        stopCamera();
        await lookupUPC(barcodes[0].rawValue);
        return;
      }
    } catch (e) {}
    if (scanningRef.current) {
      animFrameRef.current = requestAnimationFrame(scanTick);
    }
  }

  async function lookupUPC(upc: string) {
    setScanPhase('searching');

    // 1. Check local cache
    if (upcCache[upc]) {
      setScanResult(upcCache[upc]);
      setScanPhase('result');
      return;
    }

    // 2. Check Java backend
    try {
      const backendRes = await fetch(`http://localhost:8080/api/upc/lookup?upc=${encodeURIComponent(upc)}`);
      if (backendRes.ok) {
        const product: ScannedProduct = await backendRes.json();
        if (product && product.name) {
          const newCache = { ...upcCache, [upc]: product };
          setUpcCache(newCache);
          localStorage.setItem('ironcore_upc_cache', JSON.stringify(newCache));
          setScanResult(product);
          setScanPhase('result');
          return;
        }
      }
    } catch (e) {}

    // 3. Check OpenFoodFacts (3M+ real products)
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${upc}.json`);
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const p = data.product;
        const n = p.nutriments || {};
        let factor = 1;
        if (p.serving_size) {
          const m = (p.serving_size as string).match(/(\d+(?:\.\d+)?)\s*g/);
          if (m) factor = parseFloat(m[1]) / 100;
        }
        const product: ScannedProduct = {
          name: p.product_name_en || p.product_name || `Product (${upc})`,
          upc,
          calories: Math.round((n['energy-kcal_100g'] || n['energy-kcal'] || 0) * factor),
          macros: {
            protein: Math.round((n['proteins_100g'] || 0) * factor),
            carbs: Math.round((n['carbohydrates_100g'] || 0) * factor),
            fats: Math.round((n['fat_100g'] || 0) * factor),
          },
          servingSize: p.serving_size || '100g',
          brand: p.brands,
          image: p.image_front_small_url,
        };
        const newCache = { ...upcCache, [upc]: product };
        setUpcCache(newCache);
        localStorage.setItem('ironcore_upc_cache', JSON.stringify(newCache));
        try {
          await fetch('http://localhost:8080/api/upc/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
          });
        } catch (e) {}
        setScanResult(product);
        setScanPhase('result');
        return;
      }
    } catch (e) {}

    // 4. Not found anywhere — prompt user to add
    setNotFoundUPC(upc);
    setScanPhase('not-found');
  }

  async function saveNewProduct() {
    if (!newProductForm.name.trim() || !newProductForm.calories) return;
    setIsSavingProduct(true);
    const product: ScannedProduct = {
      upc: notFoundUPC,
      name: newProductForm.name.trim(),
      brand: newProductForm.brand.trim() || undefined,
      servingSize: newProductForm.servingSize.trim() || '1 serving',
      calories: Number(newProductForm.calories) || 0,
      macros: {
        protein: Number(newProductForm.protein) || 0,
        carbs: Number(newProductForm.carbs) || 0,
        fats: Number(newProductForm.fats) || 0,
      },
    };
    try {
      await fetch('http://localhost:8080/api/upc/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
    } catch (e) {}
    const newCache = { ...upcCache, [notFoundUPC]: product };
    setUpcCache(newCache);
    localStorage.setItem('ironcore_upc_cache', JSON.stringify(newCache));
    setScanResult(product);
    setScanPhase('result');
    setIsSavingProduct(false);
    setNewProductForm({ name: '', brand: '', servingSize: '1 serving', calories: '', protein: '', carbs: '', fats: '' });
  }

  // ── Food log functions ────────────────────────────────
  function addFoodToLog(food: { name: string; calories: number; macros: { protein: number; carbs: number; fats: number } }) {
    const key = dateKey(selectedDate);
    const newItem: FoodItem = {
      id: crypto.randomUUID(),
      name: food.name,
      calories: food.calories,
      macros: food.macros,
      time: format(new Date(), 'HH:mm'),
    };
    setDayLogs(prev => {
      const updated = { ...prev, [key]: [...(prev[key] || []), newItem] };
      localStorage.setItem('ironcore_nutrition_v2', JSON.stringify(updated));
      return updated;
    });
  }

  async function saveUPCScanToDb(scan: ScannedProduct) {
    // Best-effort only; the app should still work if Supabase is not configured.
    try {
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6935bede/upc-scans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          upc: scan.upc,
          name: scan.name,
        }),
      });
    } catch (e) {
      // Intentionally ignore: this is a project feature and should not block UX.
    }
  }

  function removeFoodFromLog(itemId: string) {
    const key = dateKey(selectedDate);
    setDayLogs(prev => {
      const updated = { ...prev, [key]: (prev[key] || []).filter(i => i.id !== itemId) };
      localStorage.setItem('ironcore_nutrition_v2', JSON.stringify(updated));
      return updated;
    });
  }

  async function confirmAddScanned() {
    if (scanResult) {
      await saveUPCScanToDb(scanResult);
      addFoodToLog(scanResult);
      setScannerOpen(false);
    }
  }

  function clickGlass(idx: number) {
    const newVal = idx + 1 === glasses ? idx : idx + 1;
    setGlasses(newVal);
    const hydration = JSON.parse(localStorage.getItem('ironcore_hydration') || '{}');
    hydration[dateKey(selectedDate)] = newVal;
    localStorage.setItem('ironcore_hydration', JSON.stringify(hydration));
  }

  // ── Custom food functions ─────────────────────────────
  async function loadCustomFoods() {
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6935bede/custom-foods`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setCustomFoods(data.foods || []);
      }
    } catch (e) {
      console.error('Failed to load custom foods:', e);
    }
  }

  function setField(key: keyof typeof EMPTY_FORM, value: string) {
    setFoodForm(prev => ({ ...prev, [key]: value }));
  }

  async function saveCustomFood() {
    if (!foodForm.name.trim()) { setFormError('Food name is required.'); return; }
    if (!foodForm.calories || isNaN(Number(foodForm.calories))) { setFormError('A valid calorie count is required.'); return; }
    setFormError('');
    setIsSavingFood(true);
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6935bede/custom-foods`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
          body: JSON.stringify({
            name: foodForm.name.trim(),
            brand: foodForm.brand.trim(),
            servingSize: foodForm.servingSize.trim() || '100g',
            calories: Number(foodForm.calories),
            macros: {
              protein: Number(foodForm.protein) || 0,
              carbs: Number(foodForm.carbs) || 0,
              fats: Number(foodForm.fats) || 0,
              fiber: Number(foodForm.fiber) || 0,
              sugar: Number(foodForm.sugar) || 0,
              sodium: Number(foodForm.sodium) || 0,
            },
            notes: foodForm.notes.trim(),
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setCustomFoods(data.foods || []);
        setCreateFoodOpen(false);
        setFoodForm(EMPTY_FORM);
      } else {
        setFormError('Failed to save. Please try again.');
      }
    } catch (e) {
      setFormError('Network error. Check your connection.');
    } finally {
      setIsSavingFood(false);
    }
  }

  async function deleteCustomFood(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6935bede/custom-foods/${id}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setCustomFoods(data.foods || []);
      }
    } catch (e) {
      console.error('Failed to delete custom food:', e);
    } finally {
      setDeletingId(null);
    }
  }

  // ── Calendar helpers ──────────────────────────────────
  const weekStart = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const calGridStart = startOfWeek(startOfMonth(calendarMonth), { weekStartsOn: 1 });
  const monthGridDays = Array.from({ length: 42 }, (_, i) => addDays(calGridStart, i));

  function getDayCals(d: Date) {
    return (dayLogs[dateKey(d)] || []).reduce((sum, i) => sum + i.calories, 0);
  }

  function calDotColor(cals: number) {
    if (cals === 0) return '';
    if (cals < 1500) return 'bg-green-400';
    if (cals <= CALORIE_GOAL) return 'bg-blue-400';
    return 'bg-orange-400';
  }

  // ── Selected day computed values ──────────────────────
  const selectedItems = dayLogs[dateKey(selectedDate)] || [];
  const totalCals = selectedItems.reduce((s, i) => s + i.calories, 0);
  const totalProtein = selectedItems.reduce((s, i) => s + (i.macros?.protein || 0), 0);
  const totalCarbs = selectedItems.reduce((s, i) => s + (i.macros?.carbs || 0), 0);
  const totalFats = selectedItems.reduce((s, i) => s + (i.macros?.fats || 0), 0);

  const caloriesData = [
    { name: 'Consumed', value: totalCals },
    { name: 'Remaining', value: Math.max(0, CALORIE_GOAL - totalCals) },
  ];

  const macros = [
    { name: 'Protein', current: totalProtein, target: 160, unit: 'g', color: 'bg-blue-500' },
    { name: 'Carbs', current: totalCarbs, target: 250, unit: 'g', color: 'bg-indigo-500' },
    { name: 'Fats', current: totalFats, target: 70, unit: 'g', color: 'bg-violet-500' },
  ];

  const filteredBuiltIn = MOCK_FOOD_DB.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCustom = customFoods.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.brand || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSelectedToday = isSameDay(selectedDate, today);
  const isSelectedFuture = selectedDate > today;

  const selectedDayLabel = isSelectedToday
    ? "Today's Log"
    : isSelectedFuture
    ? `Planned: ${format(selectedDate, 'EEE, MMM d')}`
    : `Log: ${format(selectedDate, 'EEE, MMM d')}`;

  return (
    <div className="p-8 max-w-7xl mx-auto dark:bg-black min-h-screen">

      {/* ── HEADER ──────────────────────────── */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Nutrition Goals</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Track your daily intake and plan your meals.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-72 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search foods..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-950 dark:text-white text-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            />
            {isSearchFocused && searchQuery && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl overflow-hidden z-50 max-h-72 overflow-y-auto">
                {filteredCustom.length === 0 && filteredBuiltIn.length === 0 && (
                  <div className="px-4 py-3 text-zinc-500 dark:text-zinc-400 text-sm">No results found.</div>
                )}
                {filteredCustom.length > 0 && (
                  <>
                    <div className="px-4 py-1.5 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">My Foods</span>
                    </div>
                    {filteredCustom.map(food => (
                      <div
                        key={food.id}
                        className="px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                        onClick={() => { addFoodToLog({ name: food.name, calories: food.calories, macros: { protein: food.macros.protein, carbs: food.macros.carbs, fats: food.macros.fats } }); setSearchQuery(''); }}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-zinc-900 dark:text-zinc-200 text-sm">{food.name}</p>
                            <Star className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{food.calories} kcal &bull; {food.servingSize}{food.brand ? ` · ${food.brand}` : ''}</p>
                        </div>
                        <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      </div>
                    ))}
                  </>
                )}
                {filteredBuiltIn.length > 0 && (
                  <>
                    {filteredCustom.length > 0 && (
                      <div className="px-4 py-1.5 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Library</span>
                      </div>
                    )}
                    {filteredBuiltIn.map(food => (
                      <div
                        key={food.name}
                        className="px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                        onClick={() => { addFoodToLog(food); setSearchQuery(''); }}
                      >
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-200 text-sm">{food.name}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{food.calories} kcal</p>
                        </div>
                        <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => setScannerOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm whitespace-nowrap"
          >
            <ScanBarcode className="w-4 h-4" />Scan UPC
          </button>
          <button
            onClick={() => { setFoodForm(EMPTY_FORM); setFormError(''); setCreateFoodOpen(true); }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm whitespace-nowrap"
          >
            <ChefHat className="w-4 h-4" />Create Food
          </button>
        </div>
      </header>

      {/* ── CALENDAR ────────────────────────── */}
      <div className="mb-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        {/* Week navigation header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-zinc-900 dark:text-white text-sm">
              {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <ChevronLeft className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            </button>
            <button
              onClick={() => { setWeekOffset(0); setSelectedDate(today); }}
              className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline px-2 py-1"
            >
              Today
            </button>
            <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <ChevronRight className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            </button>
            <button
              onClick={() => setShowMonthCalendar(m => !m)}
              className="ml-2 text-xs border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:border-zinc-400 transition-colors"
            >
              {showMonthCalendar ? 'Week view' : 'Month view'}
            </button>
          </div>
        </div>

        {/* Week strip */}
        {!showMonthCalendar && (
          <div className="grid grid-cols-7 gap-1.5">
            {weekDays.map(day => {
              const cals = getDayCals(day);
              const isSelected = isSameDay(day, selectedDate);
              const isTod = isSameDay(day, today);
              return (
                <button
                  key={dateKey(day)}
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-center py-3 px-1 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md'
                      : isTod
                      ? 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-transparent'
                  }`}
                >
                  <span className={`text-xs font-medium ${isSelected ? 'text-blue-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                    {format(day, 'EEE')}
                  </span>
                  <span className={`text-base font-bold mt-0.5 ${
                    isSelected ? 'text-white' : isTod ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-800 dark:text-zinc-200'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {cals > 0 ? (
                    <span className={`text-xs mt-1 font-medium tabular-nums ${isSelected ? 'text-blue-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                      {cals}
                    </span>
                  ) : (
                    <span className="text-xs mt-1 text-zinc-300 dark:text-zinc-700">—</span>
                  )}
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white/50' : calDotColor(cals)}`} />
                </button>
              );
            })}
          </div>
        )}

        {/* Month calendar */}
        {showMonthCalendar && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setCalendarMonth(m => addMonths(m, -1))} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <ChevronLeft className="w-4 h-4 text-zinc-500" />
              </button>
              <span className="text-sm font-semibold dark:text-white">{format(calendarMonth, 'MMMM yyyy')}</span>
              <button onClick={() => setCalendarMonth(m => addMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div key={i} className="text-xs font-medium text-zinc-400 dark:text-zinc-500 py-1">{d}</div>
              ))}
              {monthGridDays.map(day => {
                const cals = getDayCals(day);
                const inMonth = isSameMonth(day, calendarMonth);
                const isSelected = isSameDay(day, selectedDate);
                const isTod = isSameDay(day, today);
                return (
                  <button
                    key={dateKey(day)}
                    onClick={() => {
                      setSelectedDate(day);
                      if (!isSameMonth(day, calendarMonth)) {
                        setCalendarMonth(new Date(day.getFullYear(), day.getMonth(), 1));
                      }
                      setShowMonthCalendar(false);
                    }}
                    className={`flex flex-col items-center py-1.5 rounded-lg text-xs transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : isTod
                        ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold'
                        : inMonth
                        ? 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        : 'text-zinc-300 dark:text-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <span>{format(day, 'd')}</span>
                    {cals > 0 && inMonth && (
                      <div className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? 'bg-white/70' : calDotColor(cals)}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── SELECTED DAY LOG ────────────────── */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-white flex items-center gap-2">
            <Utensils className="w-5 h-5 text-indigo-500" />
            {selectedDayLabel}
          </h2>
          <button
            onClick={() => setScannerOpen(true)}
            className="text-xs flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            <ScanBarcode className="w-3.5 h-3.5" />Scan barcode
          </button>
        </div>

        {selectedItems.length > 0 ? (
          <div className="space-y-2">
            {selectedItems.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-200 text-sm">{item.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {item.macros?.protein || 0}g P &bull; {item.macros?.carbs || 0}g C &bull; {item.macros?.fats || 0}g F
                    {item.time && <span className="ml-2">&bull; {item.time}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-zinc-900 dark:text-white text-sm">{item.calories} kcal</span>
                  <button
                    onClick={() => removeFoodFromLog(item.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Total</span>
              <span className="font-bold text-zinc-900 dark:text-white text-sm">{totalCals} / {CALORIE_GOAL} kcal</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="font-medium">{isSelectedFuture ? 'Plan your meals for this day.' : 'No food logged yet.'}</p>
            <p className="text-sm mt-1">Use the search bar or scan a barcode to add items.</p>
          </div>
        )}
      </div>

      {/* ── STATS: CALORIES + MACROS ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Calorie donut */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-white self-start w-full mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />Daily Calories
          </h2>
          <div className="h-44 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={caloriesData} cx="50%" cy="50%" innerRadius={56} outerRadius={72} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                  {caloriesData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#3b82f6' : 'var(--pie-bg, #e4e4e7)'} className="dark:[--pie-bg:#27272a]" />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} kcal`, '']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">{totalCals}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-medium">/ {CALORIE_GOAL} kcal</span>
            </div>
          </div>
          <div className="flex w-full justify-between mt-3 text-sm">
            <div className="text-center">
              <p className="text-zinc-500 dark:text-zinc-400 text-xs">Consumed</p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-200">{totalCals}</p>
            </div>
            <div className="text-center">
              <p className="text-zinc-500 dark:text-zinc-400 text-xs">Remaining</p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-200">{Math.max(0, CALORIE_GOAL - totalCals)}</p>
            </div>
          </div>
        </div>

        {/* Macros */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-white mb-6 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-blue-500" />Macronutrients
          </h2>
          <div className="space-y-5">
            {macros.map(macro => (
              <div key={macro.name}>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300 text-sm">{macro.name}</span>
                  <span className="text-sm">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-200">{macro.current}</span>
                    <span className="text-zinc-500 dark:text-zinc-400"> / {macro.target}{macro.unit}</span>
                  </span>
                </div>
                <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${macro.color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(100, (macro.current / macro.target) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {totalProtein < 80
                ? "You're low on protein today. Try adding chicken breast or a protein shake."
                : totalCals > CALORIE_GOAL
                ? `You're ${totalCals - CALORIE_GOAL} kcal over your daily goal.`
                : "Great balance! Keep it up for the rest of the day."}
            </p>
          </div>
        </div>
      </div>

      {/* ── HYDRATION ───────────────────────── */}
      <div className="mb-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/30 rounded-full flex items-center justify-center border border-blue-200 dark:border-blue-800">
            <Droplets className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-white">Hydration</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {glasses} / 8 glasses &bull; ~{(glasses * 0.25).toFixed(2)}L / 2.0L
            </p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: 8 }, (_, i) => (
            <button
              key={i}
              onClick={() => clickGlass(i)}
              title={`${i + 1} glass${i !== 0 ? 'es' : ''}`}
              className={`w-7 h-9 rounded-md transition-all border ${
                i < glasses
                  ? 'bg-blue-400 border-blue-500 hover:bg-blue-500'
                  : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── RECOMMENDED MEALS ───────────────── */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
          <Apple className="w-6 h-6 text-green-500" />Recommended Meals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FOOD_RECOMMENDATIONS.map((food, idx) => (
            <div key={idx} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
              <div className="h-44 overflow-hidden relative">
                <img src={food.image} alt={food.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-full text-xs font-semibold text-black dark:text-white flex items-center gap-1">
                  <Flame className="w-3 h-3" />{food.calories} kcal
                </div>
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold tracking-wider uppercase bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md inline-block mb-2 text-zinc-700 dark:text-zinc-300">
                  {food.type}
                </span>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">{food.name}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2">{food.description}</p>
                <button
                  onClick={() => addFoodToLog(food)}
                  className="w-full py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Add to {isSelectedToday ? "Today's" : format(selectedDate, 'MMM d')} Log
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MY CUSTOM FOODS ─────────────────── */}
      {customFoods.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-emerald-500" />My Custom Foods
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customFoods.map(food => (
              <div key={food.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h3 className="font-bold text-zinc-900 dark:text-white text-base truncate">{food.name}</h3>
                      <Star className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500 flex-shrink-0" />
                    </div>
                    {food.brand && <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wide">{food.brand}</p>}
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Per {food.servingSize}</p>
                  </div>
                  <button
                    onClick={() => deleteCustomFood(food.id)}
                    disabled={deletingId === food.id}
                    className="ml-2 p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex-shrink-0 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {/* Macro pills */}
                <div className="grid grid-cols-4 gap-1.5 mb-4">
                  {[
                    { label: 'Cal', value: food.calories, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/20' },
                    { label: 'Pro', value: `${food.macros.protein}g`, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
                    { label: 'Carb', value: `${food.macros.carbs}g`, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
                    { label: 'Fat', value: `${food.macros.fats}g`, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/20' },
                  ].map(n => (
                    <div key={n.label} className={`${n.bg} rounded-lg p-2 text-center`}>
                      <p className={`text-sm font-bold ${n.color}`}>{n.value}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{n.label}</p>
                    </div>
                  ))}
                </div>
                {/* Extended nutrition */}
                {(food.macros.fiber || food.macros.sugar || food.macros.sodium) ? (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {food.macros.fiber ? <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">Fiber {food.macros.fiber}g</span> : null}
                    {food.macros.sugar ? <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">Sugar {food.macros.sugar}g</span> : null}
                    {food.macros.sodium ? <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">Sodium {food.macros.sodium}mg</span> : null}
                  </div>
                ) : null}
                {food.notes && <p className="text-xs text-zinc-500 dark:text-zinc-400 italic mb-4 line-clamp-2">{food.notes}</p>}
                <button
                  onClick={() => addFoodToLog({ name: food.name, calories: food.calories, macros: { protein: food.macros.protein, carbs: food.macros.carbs, fats: food.macros.fats } })}
                  className="w-full py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-600 dark:hover:bg-emerald-600 hover:text-white text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Add to {isSelectedToday ? "Today's" : format(selectedDate, 'MMM d')} Log
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CREATE FOOD MODAL ────────────────── */}
      {createFoodOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                  <ChefHat className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Create Custom Food</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Saved to your database</p>
                </div>
              </div>
              <button onClick={() => setCreateFoodOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable form body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-red-600 dark:text-red-400">
                  {formError}
                </div>
              )}

              {/* Identity */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Identity</h4>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Food Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Homemade Protein Bar"
                    value={foodForm.name}
                    onChange={e => setField('name', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Brand / Source</label>
                    <input
                      type="text"
                      placeholder="e.g. Homemade"
                      value={foodForm.brand}
                      onChange={e => setField('brand', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Serving Size</label>
                    <input
                      type="text"
                      placeholder="e.g. 100g, 1 cup"
                      value={foodForm.servingSize}
                      onChange={e => setField('servingSize', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Core nutrition */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Core Nutrition</h4>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Calories (kcal) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 250"
                    value={foodForm.calories}
                    onChange={e => setField('calories', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'protein' as const, label: 'Protein (g)', placeholder: '0' },
                    { key: 'carbs' as const, label: 'Carbs (g)', placeholder: '0' },
                    { key: 'fats' as const, label: 'Fat (g)', placeholder: '0' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{f.label}</label>
                      <input
                        type="number"
                        min="0"
                        placeholder={f.placeholder}
                        value={foodForm[f.key]}
                        onChange={e => setField(f.key, e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Extended nutrition */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Extended Nutrition (optional)</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'fiber' as const, label: 'Fiber (g)' },
                    { key: 'sugar' as const, label: 'Sugar (g)' },
                    { key: 'sodium' as const, label: 'Sodium (mg)' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{f.label}</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={foodForm[f.key]}
                        onChange={e => setField(f.key, e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Notes (optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Recipe notes, preparation method..."
                  value={foodForm.notes}
                  onChange={e => setField('notes', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-zinc-100 dark:border-zinc-800 flex-shrink-0">
              <button
                onClick={() => setCreateFoodOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveCustomFood}
                disabled={isSavingFood || !foodForm.name || !foodForm.calories}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isSavingFood ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" />Save to Database</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SCANNER MODAL ───────────────────── */}
      {scannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6">
              {/* Modal header */}
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {scanPhase === 'result' ? 'Product Found'
                    : scanPhase === 'searching' ? 'Looking Up...'
                    : scanPhase === 'not-found' ? 'Product Not Found'
                    : scanPhase === 'add-product' ? 'Add New Product'
                    : 'Scan Barcode'}
                </h3>
                <button onClick={() => setScannerOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

                {/* Live camera feed */}
                {(scanPhase === 'camera' || scanPhase === 'searching') && hasBarcodeDetector && (
                  <div className="relative rounded-xl overflow-hidden bg-black mb-4" style={{ aspectRatio: '4/3' }}>
                    <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                    {!cameraOn && scanPhase === 'camera' && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <p className="text-white text-sm font-medium">Starting camera...</p>
                      </div>
                    )}
                    {/* Viewfinder */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative w-56 h-36">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-sm" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-sm" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-sm" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-sm" />
                      {scanPhase === 'camera' && (
                        <div className="absolute w-full h-0.5 bg-blue-400 shadow-[0_0_8px_2px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite]" style={{ top: 0 }} />
                      )}
                    </div>
                  </div>
                  {/* Searching overlay */}
                  {scanPhase === 'searching' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
                        <p className="text-white text-sm font-medium">Looking up product...</p>
                      </div>
                  </div>
                )}

                {scanPhase === 'camera' && hasBarcodeDetector && !cameraOn && cameraPermission !== 'denied' && (
                  <button
                    onClick={startScanner}
                    className="w-full mb-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />Retry camera
                  </button>
                )}
                </div>
              )}

              {/* Camera instruction */}
              {scanPhase === 'camera' && hasBarcodeDetector && cameraPermission !== 'denied' && (
                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                  Hold a barcode steady in front of your camera
                </p>
              )}

              {/* Browser not supported */}
              {scanPhase === 'camera' && !hasBarcodeDetector && (
                <div className="text-center py-6 mb-4">
                  <Camera className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                  <p className="font-medium text-zinc-700 dark:text-zinc-300 mb-1">Camera scanning not supported</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Use Chrome or Edge for camera scanning, or enter the barcode number below.
                  </p>
                </div>
              )}

              {/* Camera permission denied */}
              {cameraPermission === 'denied' && scanPhase === 'manual' && (
                <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl text-sm text-amber-700 dark:text-amber-400">
                  Camera access was denied. Allow camera access in your browser settings, or enter the barcode below.
                </div>
              )}

              {/* Manual UPC entry */}
              {(scanPhase === 'camera' && !hasBarcodeDetector) || scanPhase === 'manual' || scanPhase === 'error' ? (
                <div className="mb-4">
                    {scanError && (scanPhase === 'manual' || scanPhase === 'error') && (
                    <div className="mb-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-red-600 dark:text-red-400">
                      {scanError}
                    </div>
                    )}
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
                    Enter UPC / barcode number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualUPC}
                      onChange={e => setManualUPC(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={e => e.key === 'Enter' && manualUPC.length >= 8 && lookupUPC(manualUPC)}
                      placeholder="e.g. 012345678905"
                      className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => manualUPC.length >= 8 && lookupUPC(manualUPC)}
                      disabled={manualUPC.length < 8}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      Look Up
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Switch to manual link */}
              {scanPhase === 'camera' && hasBarcodeDetector && cameraPermission !== 'denied' && (
                <button
                  onClick={() => { stopCamera(); setScanPhase('manual'); }}
                  className="w-full text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 flex items-center justify-center gap-1.5 mt-1 transition-colors"
                >
                  <Keyboard className="w-3.5 h-3.5" />Enter barcode manually instead
                </button>
              )}

              {/* Result card */}
              {scanPhase === 'result' && scanResult && (
                <div>
                  <div className="flex items-start gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-4">
                    {scanResult.image && (
                      <img
                        src={scanResult.image}
                        alt={scanResult.name}
                        className="w-16 h-16 object-contain rounded-lg bg-white p-1 border border-zinc-200 dark:border-zinc-700 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      {scanResult.brand && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-medium mb-0.5">{scanResult.brand}</p>
                      )}
                      <h4 className="font-bold text-zinc-900 dark:text-white text-base">{scanResult.name}</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Serving: {scanResult.servingSize}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-5">
                    {[
                      { label: 'Calories', value: scanResult.calories, unit: 'kcal', color: 'text-orange-500' },
                      { label: 'Protein', value: scanResult.macros.protein, unit: 'g', color: 'text-blue-500' },
                      { label: 'Carbs', value: scanResult.macros.carbs, unit: 'g', color: 'text-indigo-500' },
                      { label: 'Fats', value: scanResult.macros.fats, unit: 'g', color: 'text-violet-500' },
                    ].map(n => (
                      <div key={n.label} className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center">
                        <p className={`text-lg font-bold ${n.color}`}>{n.value}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{n.unit}</p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">{n.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setScanResult(null);
                        setScanPhase('camera');
                        if (hasBarcodeDetector) startScanner();
                      }}
                      className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-medium transition-colors"
                    >
                      Scan Again
                    </button>
                    <button
                      onClick={confirmAddScanned}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />Add to Log
                    </button>
                  </div>
                </div>
              )}

              {/* Not-found phase */}
              {scanPhase === 'not-found' && (
                <div>
                  <div className="text-center py-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mx-auto mb-3 border border-amber-200 dark:border-amber-800">
                      <ScanBarcode className="w-7 h-7 text-amber-500" />
                    </div>
                    <h4 className="font-bold text-zinc-900 dark:text-white text-base mb-1">Product Not in Database</h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      No match for barcode <span className="font-mono text-zinc-700 dark:text-zinc-300">{notFoundUPC}</span>.
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Would you like to add it?</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setScanPhase('camera'); setTimeout(() => startScanner(), 50); }}
                      className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-medium transition-colors"
                    >
                      Scan Again
                    </button>
                    <button
                      onClick={() => {
                        setNewProductForm({ name: '', brand: '', servingSize: '1 serving', calories: '', protein: '', carbs: '', fats: '' });
                        setScanPhase('add-product');
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />Add Product
                    </button>
                  </div>
                </div>
              )}

              {/* Add-product phase */}
              {scanPhase === 'add-product' && (
                <div>
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 rounded-xl">
                    <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                      UPC: <span className="font-mono">{notFoundUPC}</span>
                    </p>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Lay's Classic Chips"
                        value={newProductForm.name}
                        onChange={e => setNewProductForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Brand</label>
                        <input
                          type="text"
                          placeholder="e.g. Frito-Lay"
                          value={newProductForm.brand}
                          onChange={e => setNewProductForm(prev => ({ ...prev, brand: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Serving Size</label>
                        <input
                          type="text"
                          placeholder="e.g. 1 oz (28g)"
                          value={newProductForm.servingSize}
                          onChange={e => setNewProductForm(prev => ({ ...prev, servingSize: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Calories (kcal) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 150"
                        value={newProductForm.calories}
                        onChange={e => setNewProductForm(prev => ({ ...prev, calories: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {([
                        { key: 'protein', label: 'Protein (g)' },
                        { key: 'carbs', label: 'Carbs (g)' },
                        { key: 'fats', label: 'Fat (g)' },
                      ] as const).map(f => (
                        <div key={f.key}>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{f.label}</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={newProductForm[f.key]}
                            onChange={e => setNewProductForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                            className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setScanPhase('not-found')}
                      className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-medium transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={saveNewProduct}
                      disabled={isSavingProduct || !newProductForm.name.trim() || !newProductForm.calories}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {isSavingProduct ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                      ) : (
                        <><CheckCircle2 className="w-4 h-4" />Save & Add to Log</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0%, 100% { top: 8%; }
          50% { top: 82%; }
        }
      `}</style>
    </div>
  );
}
