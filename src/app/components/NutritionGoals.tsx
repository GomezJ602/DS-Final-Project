import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Apple, Flame, Utensils, Droplets, Info, ScanBarcode, Loader2, Search, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

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

export default function NutritionGoals() {
  const [nutritionData, setNutritionData] = useState<{
    calories: number;
    macros: { protein: number; carbs: number; fats: number };
    items: any[];
  }>({
    calories: 0,
    macros: { protein: 0, carbs: 0, fats: 0 },
    items: []
  });
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    fetchFoodLog();
  }, []);

  const fetchFoodLog = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6935bede/food-log`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` }
      });
      if (response.ok) {
        const data = await response.json();
        const items = data.items || [];
        const computedCalories = items.reduce((sum: number, item: any) => sum + item.calories, 0);
        const computedProtein = items.reduce((sum: number, item: any) => sum + (item.macros?.protein || 0), 0);
        const computedCarbs = items.reduce((sum: number, item: any) => sum + (item.macros?.carbs || 0), 0);
        const computedFats = items.reduce((sum: number, item: any) => sum + (item.macros?.fats || 0), 0);

        setNutritionData({
          calories: computedCalories,
          macros: { protein: computedProtein, carbs: computedCarbs, fats: computedFats },
          items: items
        });
      }
    } catch (error) {
      console.error("Failed to fetch food log:", error);
    }
  };

  const handleScan = () => {
    setIsScanning(true);
    setScanResult(null);
    
    setTimeout(() => {
      const mockScannedItem = {
        name: "Oats Crunch Cereal",
        calories: 150,
        macros: { protein: 4, carbs: 28, fats: 2 }
      };
      setScanResult(mockScannedItem);
      setIsScanning(false);
    }, 2000);
  };

  const confirmAddFood = async (foodToAdd?: any) => {
    const item = foodToAdd || scanResult;
    if (!item) return;
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6935bede/food-log`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}` 
        },
        body: JSON.stringify({
          name: item.name,
          calories: item.calories,
          macros: item.macros || { protein: Math.floor(item.calories * 0.05), carbs: Math.floor(item.calories * 0.1), fats: Math.floor(item.calories * 0.02) }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const items = data.items || [];
        const computedCalories = items.reduce((sum: number, i: any) => sum + i.calories, 0);
        const computedProtein = items.reduce((sum: number, i: any) => sum + (i.macros?.protein || 0), 0);
        const computedCarbs = items.reduce((sum: number, i: any) => sum + (i.macros?.carbs || 0), 0);
        const computedFats = items.reduce((sum: number, i: any) => sum + (i.macros?.fats || 0), 0);

        setNutritionData({
          calories: computedCalories,
          macros: { protein: computedProtein, carbs: computedCarbs, fats: computedFats },
          items: items
        });
        setScanResult(null);
      }
    } catch (error) {
      console.error("Failed to add food:", error);
    }
  };

  const handleRemoveFood = async (id: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6935bede/food-log/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${publicAnonKey}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const items = data.items || [];
        const computedCalories = items.reduce((sum: number, i: any) => sum + i.calories, 0);
        const computedProtein = items.reduce((sum: number, i: any) => sum + (i.macros?.protein || 0), 0);
        const computedCarbs = items.reduce((sum: number, i: any) => sum + (i.macros?.carbs || 0), 0);
        const computedFats = items.reduce((sum: number, i: any) => sum + (i.macros?.fats || 0), 0);

        setNutritionData({
          calories: computedCalories,
          macros: { protein: computedProtein, carbs: computedCarbs, fats: computedFats },
          items: items
        });
      }
    } catch (error) {
      console.error("Failed to remove food:", error);
    }
  };

  const filteredFoods = MOCK_FOOD_DB.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const caloriesData = [
    { name: 'Consumed', value: nutritionData.calories },
    { name: 'Remaining', value: Math.max(0, 2500 - nutritionData.calories) },
  ];
  
  const COLORS = ['#3b82f6', '#e4e4e7'];

  const macros = [
    { name: 'Protein', current: nutritionData.macros.protein, target: 160, unit: 'g', color: 'bg-blue-500' },
    { name: 'Carbs', current: nutritionData.macros.carbs, target: 250, unit: 'g', color: 'bg-indigo-500' },
    { name: 'Fats', current: nutritionData.macros.fats, target: 70, unit: 'g', color: 'bg-violet-500' },
  ];

  const foodRecommendations = [
    {
      name: "Grilled Chicken Salad",
      type: "High Protein",
      calories: 350,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxhZCUyMGJvd2x8ZW58MXx8fHwxNzc0Mjc0NzA1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      description: "A perfect blend of greens and lean protein to aid muscle recovery."
    },
    {
      name: "Quinoa Bowl with Veggies",
      type: "Complex Carbs",
      calories: 420,
      image: "https://images.unsplash.com/photo-1610533514079-58a2c1436725?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbWVhbCUyMGNvb2tpbmd8ZW58MXx8fHwxNzc0Mjk2MDM1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      description: "Sustained energy release for your intense workout sessions."
    },
    {
      name: "Salmon with Asparagus",
      type: "Healthy Fats",
      calories: 480,
      image: "https://images.unsplash.com/photo-1765128331807-4a6cf08d5e5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwYnJlYXN0JTIwZ3JpbGx8ZW58MXx8fHwxNzc0Mjk2MDM1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      description: "Rich in Omega-3s for joint health and inflammation reduction."
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto relative dark:bg-black min-h-screen">
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: 100%; }
        }
      `}</style>
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Nutrition Goals</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Track your daily intake and discover healthy meals.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search foods..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#121212] dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            />
            {isSearchFocused && searchQuery && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl overflow-hidden z-50 max-h-64 overflow-y-auto">
                {filteredFoods.length > 0 ? filteredFoods.map(food => (
                  <div 
                    key={food.name} 
                    className="px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                    onClick={() => {
                      confirmAddFood(food);
                      setSearchQuery("");
                    }}
                  >
                     <div>
                       <p className="font-medium text-zinc-900 dark:text-zinc-200 text-sm">{food.name}</p>
                       <p className="text-xs text-zinc-500 dark:text-zinc-400">{food.calories} kcal</p>
                     </div>
                     <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                )) : (
                  <div className="px-4 py-3 text-zinc-500 dark:text-zinc-400 text-sm">No results found.</div>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={handleScan}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
          >
            <ScanBarcode className="w-5 h-5" />
            Scan UPC
          </button>
        </div>
      </header>

      {/* Scanner UI Overlay */}
      {(isScanning || scanResult) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black p-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Scan Barcode</h3>
                <button 
                  onClick={() => { setIsScanning(false); setScanResult(null); }}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  ✕
                </button>
              </div>

              {isScanning ? (
                <div className="flex flex-col items-center py-12">
                  <div className="relative w-48 h-32 border-2 border-zinc-900 dark:border-white rounded-lg flex items-center justify-center mb-6 overflow-hidden bg-zinc-50 dark:bg-zinc-900">
                    <div className="absolute top-0 w-full h-0.5 bg-black dark:bg-white shadow-md animate-[scan_2s_ease-in-out_infinite]" />
                    <ScanBarcode className="w-16 h-16 text-zinc-300 dark:text-zinc-700" />
                  </div>
                  <Loader2 className="w-6 h-6 text-zinc-900 dark:text-white animate-spin mb-2" />
                  <p className="text-zinc-600 dark:text-zinc-300 font-medium">Scanning UPC code...</p>
                  <p className="text-xs text-zinc-400 mt-2">Align the barcode within the frame</p>
                </div>
              ) : scanResult ? (
                <div className="flex flex-col">
                  <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-white dark:bg-black text-black dark:text-white border border-zinc-300 dark:border-zinc-700 text-xs px-2 py-1 rounded font-bold uppercase">Match Found</span>
                    </div>
                    <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{scanResult.name}</h4>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <div className="bg-white dark:bg-[#1a1a1a] px-3 py-2 rounded-lg border border-zinc-100 dark:border-zinc-800 shadow-sm flex-1">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase mb-1">Calories</p>
                        <p className="text-lg font-bold text-orange-500">{scanResult.calories}</p>
                      </div>
                      <div className="bg-white dark:bg-[#1a1a1a] px-3 py-2 rounded-lg border border-zinc-100 dark:border-zinc-800 shadow-sm flex-1">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase mb-1">Protein</p>
                        <p className="text-lg font-bold text-blue-500">{scanResult.macros.protein}g</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => { setIsScanning(false); setScanResult(null); }}
                      className="flex-1 py-2.5 rounded-xl font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={confirmAddFood}
                      className="flex-1 py-2.5 rounded-xl font-medium bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                    >
                      Add to Log
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Today's Foods List */}
        <div className="bg-white dark:bg-[#121212] rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm lg:col-span-3">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-white mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-indigo-500" />
            Today's Log
          </h2>
          {nutritionData.items && nutritionData.items.length > 0 ? (
            <div className="space-y-3">
              {nutritionData.items.map((item, idx) => (
                <div key={item.id || idx} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-[#1a1a1a] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-200">{item.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {item.macros?.protein || 0}g P • {item.macros?.carbs || 0}g C • {item.macros?.fats || 0}g F
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-black dark:text-white">{item.calories} kcal</span>
                    <button 
                      onClick={() => handleRemoveFood(item.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                      title="Remove Item"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-[#1a1a1a] rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <p>You haven't logged any food yet today.</p>
              <p className="text-sm mt-1">Scan a barcode or add a recommended meal to get started.</p>
            </div>
          )}
        </div>

        {/* Calorie Tracker */}
        <div className="bg-white dark:bg-[#121212] rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center relative">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-white self-start w-full mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Daily Calories
          </h2>
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={caloriesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  {caloriesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : 'var(--pie-bg, #e4e4e7)'} className="dark:[--pie-bg:#27272a]" />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} kcal`, '']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', background: 'var(--tooltip-bg, #fff)' }}
                  wrapperClassName="dark:[--tooltip-bg:#1a1a1a]"
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">{nutritionData.calories}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-medium">/ 2500 kcal</span>
            </div>
          </div>
          <div className="flex w-full justify-between mt-4 text-sm">
            <div className="text-center">
              <p className="text-zinc-500 dark:text-zinc-400">Consumed</p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-200">{nutritionData.calories}</p>
            </div>
            <div className="text-center">
              <p className="text-zinc-500 dark:text-zinc-400">Remaining</p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-200">{Math.max(0, 2500 - nutritionData.calories)}</p>
            </div>
          </div>
        </div>

        {/* Macros */}
        <div className="bg-white dark:bg-[#121212] rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-white mb-6 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-blue-500" />
            Macronutrients
          </h2>
          <div className="space-y-6">
            {macros.map((macro) => (
              <div key={macro.name}>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{macro.name}</span>
                  <span className="text-sm">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-200">{macro.current}</span>
                    <span className="text-zinc-500 dark:text-zinc-400"> / {macro.target}{macro.unit}</span>
                  </span>
                </div>
                <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${macro.color} rounded-full transition-all duration-500`}
                    style={{ width: `${(macro.current / macro.target) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-black dark:text-white shrink-0 mt-0.5" />
            <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
              You're a bit low on protein today! Try adding a chicken breast or a protein shake to your next meal to hit your target.
            </p>
          </div>
        </div>
      </div>

      {/* Water Intake (Bonus) */}
      <div className="mb-8 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-300 dark:border-zinc-700">
            <Droplets className="w-6 h-6 text-black dark:text-white" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-white">Hydration</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">1.5L / 3.0L consumed</p>
          </div>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((glass) => (
            <div 
              key={glass} 
              className={`w-6 h-8 rounded-sm ${glass <= 4 ? 'bg-blue-400' : 'bg-zinc-100 dark:bg-zinc-800'}`}
            />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
          <Apple className="w-6 h-6 text-green-500" />
          Recommended Meals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foodRecommendations.map((food, index) => (
            <div key={index} className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={food.image} 
                  alt={food.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-full text-xs font-semibold text-black dark:text-white flex items-center gap-1">
                  <Flame className="w-3 h-3 text-black dark:text-white" />
                  {food.calories} kcal
                </div>
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold text-black dark:text-white tracking-wider uppercase bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-2 py-1 rounded-md inline-block mb-2">
                  {food.type}
                </span>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">{food.name}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4">{food.description}</p>
                <button 
                  onClick={() => confirmAddFood(food)}
                  className="w-full py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-600 hover:dark:bg-blue-600 hover:text-white text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Add to Tracker
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}