import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { User, Mail, Phone, MapPin, Calendar, Award, Settings, CreditCard, Moon, Sun, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

export default function Profile() {
  const [weight, setWeight] = useState("170");
  const [isSaving, setIsSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [planType, setPlanType] = useState<"Monthly" | "Annual">("Monthly");
  const [isTrial, setIsTrial] = useState(true);

  const monthlyPrice = 15;
  const annualPrice = monthlyPrice * 12 * 0.9; // 10% discount

  useEffect(() => {
    // Check initial dark mode state
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    
    const fetchWeight = async () => {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6935bede/weight`, {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.weight) {
            setWeight(data.weight.toString());
          }
        }
      } catch (error) {
        console.error("Failed to fetch weight:", error);
      }
    };
    fetchWeight();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6935bede/weight`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ weight: parseFloat(weight) })
      });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update weight:", error);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      root.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  const endTrial = () => setIsTrial(false);
  const switchPlan = () => setPlanType(planType === "Monthly" ? "Annual" : "Monthly");

  const achievements = [
    { name: "Early Bird", count: 50, icon: "🌅" },
    { name: "Streak Master", count: 30, icon: "🔥" },
    { name: "Calorie Crusher", count: 100, icon: "⚡" },
    { name: "Heavy Lifter", count: 75, icon: "💪" },
    { name: "Cardio King", count: 60, icon: "🏃" },
    { name: "Yoga Master", count: 40, icon: "🧘" },
  ];

  return (
    <div className="p-8 dark:bg-black min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Profile</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 p-6 dark:bg-[#121212] dark:border-zinc-800">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-3xl font-bold mb-4 border border-zinc-200 dark:border-zinc-800">
              JD
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">John Doe</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">john.doe@email.com</p>
            <Badge className="mb-6 bg-black dark:bg-white text-white dark:text-black border border-zinc-200 dark:border-zinc-800">
              {isTrial ? "Free Trial" : `${planType} Plan`}
            </Badge>
            <Button variant="outline" className="w-full dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-800">
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <span className="text-zinc-600 dark:text-zinc-300">Member since January 2024</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Award className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <span className="text-zinc-600 dark:text-zinc-300">{achievements.length} Achievements</span>
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="personal">
            <TabsList className="mb-6 flex-wrap h-auto gap-2 dark:bg-[#121212]">
              <TabsTrigger value="personal" className="dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white dark:text-zinc-400">Personal Info</TabsTrigger>
              <TabsTrigger value="membership" className="dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white dark:text-zinc-400">Membership</TabsTrigger>
              <TabsTrigger value="achievements" className="dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white dark:text-zinc-400">Achievements</TabsTrigger>
              <TabsTrigger value="preferences" className="dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white dark:text-zinc-400">Preferences</TabsTrigger>
              <TabsTrigger value="help" className="dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white dark:text-zinc-400">Help</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card className="p-6 dark:bg-[#121212] dark:border-zinc-800">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-6">Personal Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="dark:text-zinc-300">First Name</Label>
                      <Input id="firstName" defaultValue="John" className="dark:bg-black dark:border-zinc-800 dark:text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="dark:text-zinc-300">Last Name</Label>
                      <Input id="lastName" defaultValue="Doe" className="dark:bg-black dark:border-zinc-800 dark:text-white" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="dark:text-zinc-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      <Input id="email" className="pl-10 dark:bg-black dark:border-zinc-800 dark:text-white" defaultValue="john.doe@email.com" type="email" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="dark:text-zinc-300">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      <Input id="phone" className="pl-10 dark:bg-black dark:border-zinc-800 dark:text-white" defaultValue="+1 (555) 123-4567" type="tel" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="dark:text-zinc-300">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      <Input id="address" className="pl-10 dark:bg-black dark:border-zinc-800 dark:text-white" defaultValue="123 Fitness Street, Gym City, GC 12345" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age" className="dark:text-zinc-300">Age</Label>
                      <Input id="age" defaultValue="28" type="number" className="dark:bg-black dark:border-zinc-800 dark:text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height" className="dark:text-zinc-300">Height (cm)</Label>
                      <Input id="height" defaultValue="180" type="number" className="dark:bg-black dark:border-zinc-800 dark:text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight" className="dark:text-zinc-300">Weight (lbs)</Label>
                      <Input 
                        id="weight" 
                        value={weight} 
                        onChange={(e) => setWeight(e.target.value)}
                        type="number" 
                        className="dark:bg-black dark:border-zinc-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleSave} disabled={isSaving} className="dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="membership">
              <Card className="p-6 dark:bg-[#121212] dark:border-zinc-800">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-6">Membership Details</h3>
                
                {isTrial && (
                  <div className="mb-6 p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-black dark:text-white mt-0.5" />
                    <div>
                      <p className="font-medium text-black dark:text-white mb-1">Free Trial Active</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                        You are currently on a 2-week free trial. You cannot accrue reward points until you upgrade to a paid plan.
                      </p>
                      <Button onClick={endTrial} size="sm" className="bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black border border-zinc-200 dark:border-zinc-800">
                        Upgrade Now to Earn Points
                      </Button>
                    </div>
                  </div>
                )}

                <div className="bg-zinc-900 dark:bg-zinc-100 rounded-lg p-6 text-white dark:text-black mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-zinc-300 dark:text-zinc-700 mb-1">Current Plan</p>
                      <h4 className="text-2xl font-bold">{isTrial ? "Trial" : planType} Plan</h4>
                    </div>
                    <Badge className="bg-white dark:bg-black text-black dark:text-white border border-zinc-700 dark:border-zinc-300">
                      Active
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-zinc-300 dark:text-zinc-700">Pricing</p>
                      <p className="font-semibold">
                        {isTrial ? "$0.00" : planType === "Monthly" ? `$${monthlyPrice}/mo` : `$${annualPrice}/yr (Save 10%)`}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-300 dark:text-zinc-700">Renews On</p>
                      <p className="font-semibold">Next Billing Cycle</p>
                    </div>
                  </div>
                </div>

                {!isTrial && (
                  <div className="mb-6 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white">Switch to {planType === "Monthly" ? "Annual" : "Monthly"} Plan</p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {planType === "Monthly" ? `Save 10% by paying $${annualPrice} once a year.` : `Switch back to paying $${monthlyPrice} per month.`}
                      </p>
                    </div>
                    <Button onClick={switchPlan} variant="outline" className="dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 shrink-0 ml-4">
                      Switch Plan
                    </Button>
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-zinc-900 dark:text-white">Plan Benefits</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>Unlimited access to all gym facilities</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>Free group classes (unlimited)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>Personal training sessions (4 per month)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>Guest passes (2 per month)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>Access to exclusive member events</span>
                    </li>
                  </ul>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="achievements">
              <Card className="p-6 dark:bg-[#121212] dark:border-zinc-800">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-6">Your Achievements</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-center hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors border border-transparent dark:border-zinc-800"
                    >
                      <div className="text-4xl mb-2">{achievement.icon}</div>
                      <h4 className="font-medium text-zinc-900 dark:text-zinc-200 mb-1">{achievement.name}</h4>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Earned {achievement.count} times
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-black dark:text-white mt-0.5" />
                    <div>
                      <p className="font-medium text-black dark:text-white mb-1">Keep Going!</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        You're on track to unlock 3 more achievements this month. 
                        Complete 2 more workouts to earn the "Consistency Champion" badge!
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card className="p-6 dark:bg-[#121212] dark:border-zinc-800">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-6">App Preferences</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                        {isDarkMode ? <Moon className="w-5 h-5 text-zinc-300" /> : <Sun className="w-5 h-5 text-zinc-700" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-zinc-900 dark:text-white">Appearance</h4>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Toggle between light and dark mode</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={toggleTheme}
                      className="min-w-[120px] dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      {isDarkMode ? "Light Mode" : "Dark Mode"}
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="help">
              <Card className="p-6 dark:bg-[#121212] dark:border-zinc-800">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-6">Help & Information</h3>
                <div className="space-y-8">
                  <div>
                    <h4 className="font-medium text-zinc-900 dark:text-white mb-2">About IronCore Fitness</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      IronCore Fitness is your ultimate companion for tracking workouts, monitoring nutrition, and achieving your personal best. Our app is designed with a dynamic dark mode aesthetic and powerful tools to support both beginners and elite athletes in their fitness journey.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-zinc-900 dark:text-white mb-2">The Founder</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Founded by a former competitive powerlifter and fitness enthusiast, IronCore was built out of a personal need for a comprehensive, no-nonsense tracking system. The goal was to create an app that understands the nuances of long-term progression and rewards consistency.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-zinc-900 dark:text-white mb-2">Rewards System & Points</h4>
                    <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                      <p className="leading-relaxed">
                        The IronCore rewards system is designed to incentivize true dedication. The point economy is balanced so that redeeming high-cost reward items requires 4-6 months of consistent training.
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li><strong>Daily Check-in:</strong> Earn points every day through a simple, generic gym check-in.</li>
                        <li><strong>Accrual Pace:</strong> The system is built for the long game—stay consistent to unlock premium rewards.</li>
                        <li><strong>Free Trial Limitations:</strong> During your initial two-week free trial, you <em>cannot</em> accrue reward points. Points will begin accumulating automatically once you transition to a paid monthly or annual membership.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}