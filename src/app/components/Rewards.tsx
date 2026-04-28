import { Gift, Award, TrendingUp, MapPin, Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export default function Rewards() {
  const [currentPoints, setCurrentPoints] = useState<number | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  useEffect(() => {
    fetchPoints();
    // Simulate checking if already checked in today
    const lastCheckIn = localStorage.getItem('lastCheckInDate');
    if (lastCheckIn === new Date().toDateString()) {
      setCheckedIn(true);
    }
  }, []);

  const fetchPoints = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6935bede/points`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentPoints(data.points || 0);
      }
    } catch (error) {
      console.error("Failed to fetch points:", error);
      setCurrentPoints(0);
    }
  };

  const handleCheckIn = async () => {
    if (checkedIn) return;
    setIsCheckingIn(true);
    
    // Simulate network delay for check in
    setTimeout(async () => {
      const newPoints = (currentPoints || 0) + 10;
      
      try {
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6935bede/points`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}` 
          },
          body: JSON.stringify({ points: newPoints })
        });
        
        setCurrentPoints(newPoints);
        setCheckedIn(true);
        localStorage.setItem('lastCheckInDate', new Date().toDateString());
      } catch (error) {
        console.error("Failed to update points:", error);
      } finally {
        setIsCheckingIn(false);
      }
    }, 1000);
  };

  const earningWays = [
    { 
      name: 'Gym Check-in', 
      points: 10, 
      desc: 'Check in to any local or well-known gym (once per day).', 
      icon: MapPin, 
      color: 'text-purple-600 dark:text-purple-400', 
      bg: 'bg-purple-100 dark:bg-zinc-800' 
    },
    { 
      name: 'Consistent Week', 
      points: 50, 
      desc: 'Hit the gym at least 3 times in a single week.', 
      icon: TrendingUp, 
      color: 'text-orange-600 dark:text-orange-400', 
      bg: 'bg-orange-100 dark:bg-zinc-800' 
    },
  ];

  const rewards = [
    {
      id: 1,
      name: '$10 Amazon Gift Card',
      category: 'Gift Card',
      cost: 5000,
      image: 'https://images.unsplash.com/photo-1591270551371-3401a1a9382f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbWF6b24lMjBnaWZ0JTIwYm94fGVufDF8fHx8MTc3NDM2MTk1M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 2,
      name: 'Nike Store $25 Credit',
      category: 'Apparel',
      cost: 12500,
      image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWtlJTIwc2hvZXN8ZW58MXx8fHwxNzc0MzYxOTUzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 3,
      name: 'Sweetgreen Free Salad',
      category: 'Food',
      cost: 4000,
      image: 'https://images.unsplash.com/photo-1571780752627-1052116323d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxhZCUyMGx1bmNoJTIwYm94fGVufDF8fHx8MTc3NDM2MTk1N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 4,
      name: 'Premium Gym Towel',
      category: 'Gear',
      cost: 2500,
      image: 'https://images.unsplash.com/photo-1638183130424-873c491cca1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjB0b3dlbHxlbnwxfHx8fDE3NzQzNjE5NTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 5,
      name: 'Stainless Steel Water Bottle',
      category: 'Gear',
      cost: 6000,
      image: 'https://images.unsplash.com/photo-1623684194967-48075185a58c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXVzYWJsZSUyMHdhdGVyJTIwYm90dGxlfGVufDF8fHx8MTc3NDMzOTY5OXww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 6,
      name: '$50 Lululemon Gift Card',
      category: 'Apparel',
      cost: 25000,
      image: 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdWx1bGVtb24lMjBjbG90aGVzfGVufDF8fHx8MTc3NDM5NjA5NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: 7,
      name: '1-Month Premium Membership',
      category: 'Membership',
      cost: 15000,
      image: 'https://images.unsplash.com/photo-1612073584622-335da5fadd8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjBtZW1iZXJzaGlwJTIwY2FyZHxlbnwxfHx8fDE3NzQzOTYwOTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: 8,
      name: '1-Hour Personal Training',
      category: 'Training',
      cost: 20000,
      image: 'https://images.unsplash.com/photo-1745329532608-bbda3b742e00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb25hbCUyMHRyYWluZXIlMjBneW18ZW58MXx8fHwxNzc0MzE1MDkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: 9,
      name: 'IronCore Protein Shaker',
      category: 'Gear',
      cost: 3000,
      image: 'https://images.unsplash.com/photo-1678875526436-fa7137a01413?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm90ZWluJTIwc2hha2VyJTIwYm90dGxlfGVufDF8fHx8MTc3NDM2NTA0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: 10,
      name: 'Percussion Massage Gun',
      category: 'Recovery',
      cost: 35000,
      image: 'https://images.unsplash.com/photo-1700882304335-34d47c682a4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXNzYWdlJTIwZ3VuJTIwcmVjb3Zlcnl8ZW58MXx8fHwxNzc0Mzk2MDk1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: 11,
      name: 'Organic Protein Powder Tub',
      category: 'Nutrition',
      cost: 10000,
      image: 'https://images.unsplash.com/photo-1693996045899-7cf0ac0229c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm90ZWluJTIwcG93ZGVyJTIwdHVifGVufDF8fHx8MTc3NDI5MTI5OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto dark:bg-black min-h-screen">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Gift className="w-8 h-8 text-blue-500" />
            Rewards Shop
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Earn points by going to the gym and redeem them for amazing prizes.</p>
        </div>
        
        <div className="bg-blue-600 dark:bg-zinc-900 rounded-xl p-4 text-white shadow-lg flex items-center gap-4 min-w-[240px]">
          <div className="bg-white dark:bg-zinc-800 p-3 rounded-full">
            <Award className="w-8 h-8 text-yellow-300 dark:text-yellow-500" />
          </div>
          <div>
            <p className="text-blue-100 dark:text-zinc-400 text-sm font-medium uppercase tracking-wider">Your Balance</p>
            {currentPoints === null ? (
              <Loader2 className="w-6 h-6 animate-spin mt-1" />
            ) : (
              <p className="text-3xl font-bold tracking-tight">{currentPoints.toLocaleString()} <span className="text-xl font-medium text-blue-200 dark:text-zinc-500">PTS</span></p>
            )}
          </div>
        </div>
      </header>

      {/* How to earn section */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-500" />
          How to Earn Points
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {earningWays.map((way, idx) => {
            const Icon = way.icon;
            const isCheckIn = way.name === 'Gym Check-in';
            return (
              <div key={idx} className="bg-white dark:bg-black rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${way.bg}`}>
                    <Icon className={`w-6 h-6 ${way.color}`} />
                  </div>
                  <div className="bg-green-100 dark:bg-zinc-800 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    +{way.points} PTS
                  </div>
                </div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">{way.name}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 flex-grow">{way.desc}</p>
                
                {isCheckIn && (
                  <button 
                    onClick={handleCheckIn}
                    disabled={checkedIn || isCheckingIn || currentPoints === null}
                    className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-100 disabled:dark:bg-zinc-800 disabled:text-zinc-400 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isCheckingIn ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Verifying Location...</>
                    ) : checkedIn ? (
                      <><CheckCircle2 className="w-4 h-4" /> Checked In Today</>
                    ) : (
                      <><MapPin className="w-4 h-4" /> Check In Now</>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Rewards Grid */}
      <section>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
          <Gift className="w-6 h-6 text-pink-500" />
          Available Rewards
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rewards.map((reward) => {
            const canAfford = (currentPoints || 0) >= reward.cost;
            return (
              <div key={reward.id} className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={reward.image} 
                    alt={reward.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white dark:bg-black px-2.5 py-1 rounded-full text-xs font-semibold text-zinc-800 dark:text-zinc-200 tracking-wide uppercase shadow-sm">
                    {reward.category}
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-1">{reward.name}</h3>
                  <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 mb-4">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">{reward.cost.toLocaleString()} PTS</span>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    {canAfford ? (
                      <button className="w-full py-2.5 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                        Redeem Now
                      </button>
                    ) : (
                      <div className="w-full py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-xl font-medium flex items-center justify-center gap-2">
                        <span>Need {(reward.cost - (currentPoints || 0)).toLocaleString()} more</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}