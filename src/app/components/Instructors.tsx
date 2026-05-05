import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MapPin, Navigation, Star, ArrowLeft, CheckCircle2, Clock, Calendar, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";

const CERT_DESCRIPTIONS: Record<string, string> = {
  'RYT-500':         'Registered Yoga Teacher (500-hour) — advanced Yoga Alliance credential requiring 500+ documented training hours.',
  'RYT-200':         'Registered Yoga Teacher (200-hour) — foundational Yoga Alliance credential for yoga instructors.',
  'YTT-Bikram':      'Bikram Yoga Teacher Training — certified to teach the 26-posture hot yoga sequence in a heated room.',
  'NASM-CPT':        'National Academy of Sports Medicine Certified Personal Trainer — one of the most recognized personal training credentials in the US.',
  'NASM-PES':        'NASM Performance Enhancement Specialist — focuses on sport-specific training and optimizing athletic performance.',
  'ACSM-CPT':        'American College of Sports Medicine Certified Personal Trainer — science-backed fitness professional credential.',
  'ACSM-EP':         'ACSM Exercise Physiologist — specializes in clinical and performance exercise science and testing.',
  'ACE-CPT':         'American Council on Exercise Certified Personal Trainer — widely recognized fitness professional certification.',
  'ACE-GFI':         'American Council on Exercise Group Fitness Instructor — certified to design and lead group exercise classes.',
  'NSCA-CSCS':       'National Strength & Conditioning Association Certified Strength & Conditioning Specialist — elite credential for performance and sport coaching.',
  'USAW-L1':         'USA Weightlifting Level 1 Coach — certified to teach Olympic weightlifting technique (snatch, clean & jerk).',
  'USAPL Coach':     'USA Powerlifting certified coach — national governing body credential for competitive powerlifting instruction.',
  'USA Boxing':      'USA Boxing certified coach — official national governing body coaching license for the sport of boxing.',
  'CF-L2':           'CrossFit Level 2 Trainer — advanced CrossFit certification covering program design and movement refinement.',
  'Balanced Body':   'Balanced Body Pilates instructor certification — one of the world\'s leading Pilates education programs.',
  'Spinning® Cert':  'Official Spinning® instructor license by Mad Dogg Athletics — certified to teach indoor cycling classes.',
  'Zumba® Cert':     'Official Zumba® instructor license — certified to teach the branded Latin dance fitness program.',
  'Barre Cert':      'Barre fitness instructor certification — specializes in ballet-inspired low-impact strength and toning.',
  'AEA Cert':        'Aquatic Exercise Association certification — qualified to design and teach water-based fitness programs.',
  'CPR/AED':         'Cardiopulmonary Resuscitation & Automated External Defibrillator certified — emergency cardiac response readiness.',
  'RKC-L2':          'Russian Kettlebell Challenge Level 2 (StrongFirst) — advanced kettlebell coaching and programming certification.',
  'FMS Cert':        'Functional Movement Screen certification — trained to assess movement patterns and identify injury risk factors.',
  'C-IAYT':          'Certified International Association of Yoga Therapists — clinical yoga specialist for therapeutic and rehabilitative applications.',
  'USAT-L1':         'USA Triathlon Level 1 Coach — certified to coach athletes across swimming, cycling, and running for triathlon.',
  'Latin Dance Cert':'Latin dance instructor certification — qualified to teach salsa, merengue, bachata, and related styles.',
  'Aerial Arts Cert':'Aerial arts instructor certification — qualified to teach aerial silks, lyra hoop, and suspension-based movement.',
  'Gymnastics Basics':'Foundational gymnastics certification — covers body control, floor skills, and fundamental movement patterns.',
};

const SCHEDULE_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SCHEDULE_TIMES = ['6:00 AM', '7:30 AM', '9:00 AM', '10:30 AM', '12:00 PM', '4:30 PM', '6:00 PM', '7:30 PM'];
const SLOT_DURATIONS = ['45 min', '60 min', '75 min'];

interface ScheduleSlot { time: string; duration: string; spotsLeft: number; }

function generateSchedule(id: number): { day: string; slots: ScheduleSlot[] }[] {
  const result: { day: string; slots: ScheduleSlot[] }[] = [];
  for (let d = 0; d < SCHEDULE_DAYS.length; d++) {
    if ((id + d * 3) % 4 === 0) continue;
    const slots: ScheduleSlot[] = [];
    const t1 = (id * 2 + d * 3) % SCHEDULE_TIMES.length;
    slots.push({
      time: SCHEDULE_TIMES[t1],
      duration: SLOT_DURATIONS[(id + d) % SLOT_DURATIONS.length],
      spotsLeft: ((id * 3 + d * 7) % 10) + 2,
    });
    if ((id + d) % 3 !== 0) {
      const t2 = (t1 + 3) % SCHEDULE_TIMES.length;
      if (t2 !== t1) {
        slots.push({
          time: SCHEDULE_TIMES[t2],
          duration: SLOT_DURATIONS[(id * 2 + d) % SLOT_DURATIONS.length],
          spotsLeft: ((id * 5 + d * 3) % 8) + 1,
        });
      }
      slots.sort((a, b) => SCHEDULE_TIMES.indexOf(a.time) - SCHEDULE_TIMES.indexOf(b.time));
    }
    result.push({ day: SCHEDULE_DAYS[d], slots });
  }
  return result;
}

export default function Instructors() {
  const [searchParams] = useSearchParams();
  const bookedClassName = searchParams.get("className");
  const bookedClassType = searchParams.get("classType");
  const isBookingFlow = !!searchParams.get("classId");

  const [userLocation, setUserLocation] = useState<{ city: string; state: string } | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [bookedInstructor, setBookedInstructor] = useState<number | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<number | null>(null);
  const [lastViewedInstructor, setLastViewedInstructor] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setUserLocation({ city: "Austin", state: "TX" });
      setIsLocating(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Scroll back to the instructor card when returning from schedule view
  useEffect(() => {
    if (selectedInstructor === null && lastViewedInstructor !== null) {
      setTimeout(() => {
        const el = document.querySelector(`[data-instructor-id="${lastViewedInstructor}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  }, [selectedInstructor]);

  const instructors = [
    {
      id: 1,
      name: "Sarah Johnson",
      specialty: "Power Yoga",
      rating: 4.9,
      reviews: 128,
      location: "Studio A, Downtown",
      distance: 1.2,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      bio: "10+ years of Vinyasa and Power Yoga experience helping students find their inner strength.",
      certifications: ["RYT-500", "NASM-CPT"],
    },
    {
      id: 2,
      name: "Mike Chen",
      specialty: "HIIT & Cardio",
      rating: 4.8,
      reviews: 95,
      location: "Main Gym, South Congress",
      distance: 1.5,
      image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      bio: "High-energy coach focused on pushing your cardiovascular limits with intelligent programming.",
      certifications: ["ACSM-CPT", "ACE-GFI"],
    },
    {
      id: 3,
      name: "Emma Wilson",
      specialty: "Spin & Cycling",
      rating: 5.0,
      reviews: 210,
      location: "Cycling Studio, Downtown",
      distance: 0.8,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      bio: "Music-driven rhythm riding instructor. Get ready to sweat to the beat every single session.",
      certifications: ["Spinning® Cert", "ACE-CPT"],
    },
    {
      id: 4,
      name: "Alex Martinez",
      specialty: "Strength Training",
      rating: 4.7,
      reviews: 84,
      location: "Weight Room, East Austin",
      distance: 2.1,
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      bio: "Former powerlifter dedicated to perfecting your lifting form and building serious strength.",
      certifications: ["NSCA-CSCS", "USAW-L1"],
    },
    {
      id: 5,
      name: "Lisa Anderson",
      specialty: "Pilates Core",
      rating: 4.9,
      reviews: 156,
      location: "Studio B, Westlake",
      distance: 3.4,
      image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      bio: "Specializes in reformer and mat Pilates for deep core strengthening and injury prevention.",
      certifications: ["Balanced Body", "NASM-CPT"],
    },
    {
      id: 6,
      name: "James Torres",
      specialty: "Boxing Fitness",
      rating: 4.8,
      reviews: 112,
      location: "Studio C, Domain",
      distance: 4.8,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      bio: "Golden gloves champion bringing authentic boxing drills and technique to group fitness.",
      certifications: ["USA Boxing", "NASM-CPT"],
    },
    {
      id: 7,
      name: "David Kim",
      specialty: "CrossFit",
      rating: 4.6,
      reviews: 78,
      location: "Crossfit Box, North Austin",
      distance: 8.0,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      bio: "CrossFit Level 2 Certified Coach. Let's scale your WODs to perfection and beyond.",
      certifications: ["CF-L2", "ACSM-EP"],
    },
    {
      id: 8,
      name: "Rachel Green",
      specialty: "Zumba & Dance",
      rating: 4.9,
      reviews: 302,
      location: "Dance Studio, South Austin",
      distance: 4.5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      bio: "Dance like nobody's watching. Fun, energetic, and completely beginner-friendly every time!",
      certifications: ["Zumba® Cert", "ACE-GFI"],
    },
    {
      id: 9,
      name: "Kevin O'Brien",
      specialty: "Powerlifting",
      rating: 4.9,
      reviews: 64,
      location: "Iron Room, Round Rock",
      distance: 18.4,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      bio: "Elite powerlifter with 3 national titles, aiming to add serious weight to your total.",
      certifications: ["USAPL Coach", "NSCA-CSCS"],
    },
    {
      id: 10,
      name: "Nina Patel",
      specialty: "Barre",
      rating: 4.8,
      reviews: 145,
      location: "Studio D, Cedar Park",
      distance: 22.1,
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      bio: "Micro-movements for major burns. Former classical ballet dancer turned fitness pro.",
      certifications: ["NASM-CPT", "Barre Cert"],
    },
    {
      id: 11,
      name: "Chris Evans",
      specialty: "Aquatics",
      rating: 4.7,
      reviews: 50,
      location: "Pool Area, Central",
      distance: 2.5,
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      bio: "Low impact, high resistance water aerobics for all fitness levels and ages.",
      certifications: ["AEA Cert", "CPR/AED"],
    },
    {
      id: 12,
      name: "Maria Garcia",
      specialty: "Dance Fitness",
      rating: 4.8,
      reviews: 198,
      location: "Main Gym, South Congress",
      distance: 1.5,
      image: "https://images.unsplash.com/photo-1614034234573-cdb2c21bccd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      bio: "Explosive mix of hip-hop, salsa, and reggaeton choreography. No dance experience needed.",
      certifications: ["ACE-GFI", "Zumba® Cert"],
    },
    {
      id: 13,
      name: "Jordan Hayes",
      specialty: "Kettlebell & Functional",
      rating: 4.8,
      reviews: 91,
      location: "Functional Fitness Hub, Mueller",
      distance: 3.1,
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      bio: "RKC certified kettlebell coach building bulletproof bodies through movement quality.",
      certifications: ["RKC-L2", "FMS Cert"],
    },
    {
      id: 14,
      name: "Priya Singh",
      specialty: "Hot Yoga & Flexibility",
      rating: 5.0,
      reviews: 177,
      location: "Bikram Studio, Hyde Park",
      distance: 2.8,
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      bio: "Certified Bikram and Yin yoga instructor. Transform your body and calm your mind.",
      certifications: ["RYT-200", "YTT-Bikram"],
    },
    {
      id: 15,
      name: "Tyler Brooks",
      specialty: "Calisthenics",
      rating: 4.7,
      reviews: 68,
      location: "Outdoor Park, Zilker",
      distance: 5.2,
      image: "https://images.unsplash.com/photo-1546961342-ea5f62d5a27b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      bio: "Street workout specialist who will take you from zero to muscle-up in 12 weeks.",
      certifications: ["NASM-CPT", "Gymnastics Basics"],
    },
    {
      id: 16,
      name: "Sophia Reeves",
      specialty: "Aerial & Flexibility",
      rating: 4.9,
      reviews: 114,
      location: "Aerial Arts Studio, East Austin",
      distance: 6.3,
      image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      bio: "Former circus performer helping athletes unlock full-body strength through aerial movement.",
      certifications: ["NASM-CPT", "Aerial Arts Cert"],
    },
    {
      id: 17,
      name: "Marcus Washington",
      specialty: "Athletic Conditioning",
      rating: 4.8,
      reviews: 87,
      location: "Sport Performance Center, North Austin",
      distance: 9.7,
      image: "https://images.unsplash.com/photo-1615109398623-88346a601842?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      bio: "D1 basketball trainer bringing pro-level speed, agility, and conditioning to everyday athletes.",
      certifications: ["NSCA-CSCS", "NASM-PES"],
    },
    {
      id: 18,
      name: "Carmen Diaz",
      specialty: "Latin Dance & Salsa",
      rating: 4.9,
      reviews: 239,
      location: "La Danza Studio, East 6th",
      distance: 2.0,
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      bio: "Professional salsa dancer and choreographer. Burn calories while learning to move with confidence.",
      certifications: ["ACE-GFI", "Latin Dance Cert"],
    },
    {
      id: 19,
      name: "Ethan Park",
      specialty: "Triathlon & Endurance",
      rating: 4.6,
      reviews: 55,
      location: "Endurance Lab, Barton Springs",
      distance: 3.9,
      image: "https://images.unsplash.com/photo-1522556189639-b150ed9c4330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      bio: "Ironman finisher coaching swim-bike-run athletes and weekend warriors to crush their PRs.",
      certifications: ["USAT-L1", "NSCA-CSCS"],
    },
    {
      id: 20,
      name: "Olivia Fletcher",
      specialty: "Mindfulness & Recovery",
      rating: 4.8,
      reviews: 143,
      location: "Wellness Center, West Campus",
      distance: 1.9,
      image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      bio: "Yoga therapist and meditation teacher specializing in stress recovery and mobility restoration.",
      certifications: ["C-IAYT", "RYT-500"],
    },
  ];

  const sortedInstructors = [...instructors].sort((a, b) => a.distance - b.distance);

  // ── Schedule view ────────────────────────────────────────
  if (selectedInstructor !== null) {
    const instructor = instructors.find(i => i.id === selectedInstructor)!;
    const schedule = generateSchedule(instructor.id);
    return (
      <div className="p-8 dark:bg-black min-h-screen">
        <div className="mb-8">
          <button
            onClick={() => setSelectedInstructor(null)}
            className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Instructors
          </button>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">
            {instructor.name}'s Schedule
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">{instructor.specialty} · {instructor.location}</p>
        </div>

        {/* Instructor profile card */}
        <div className="mb-8 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-6 shadow-sm">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-zinc-100 dark:border-zinc-800 shadow-md flex-shrink-0">
            <img src={instructor.image} alt={instructor.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{instructor.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">{instructor.rating}</span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">({instructor.reviews} reviews)</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {instructor.certifications.map(cert => (
                  <span key={cert} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full">
                    {cert}
                    {CERT_DESCRIPTIONS[cert] && (
                      <span className="relative group">
                        <Info className="w-3 h-3 text-zinc-400 cursor-help" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-52 bg-zinc-900 dark:bg-zinc-700 text-white text-xs rounded-lg px-3 py-2 shadow-xl pointer-events-none leading-relaxed">
                          {CERT_DESCRIPTIONS[cert]}
                          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-700" />
                        </span>
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 italic">"{instructor.bio}"</p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>{instructor.location} · {instructor.distance} mi away</span>
            </div>
          </div>
        </div>

        {/* Weekly schedule */}
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Weekly Schedule</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {schedule.map(({ day, slots }) => (
            <div key={day} className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-800 uppercase tracking-wide">
                {day}
              </h3>
              <div className="space-y-2.5">
                {slots.map((slot, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{slot.time}</p>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 pl-5">{instructor.specialty} · {slot.duration}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className={`text-xs font-semibold ${slot.spotsLeft <= 3 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {slot.spotsLeft} spots
                      </p>
                      <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium mt-0.5">
                        Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 dark:bg-black min-h-screen">
      <div className="mb-8">
        <Link
          to="/classes"
          className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Classes
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
          Expert Instructors
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Discover top-tier coaches in your area
        </p>
      </div>

      {/* Booking banner — only when coming from Book Class */}
      {isBookingFlow && (
        <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">
              Booking:{" "}
              <span className="font-bold">{bookedClassName}</span>
              {bookedClassType && (
                <Badge className="ml-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-0 text-xs">
                  {bookedClassType}
                </Badge>
              )}
            </p>
            <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-0.5">
              Choose an instructor below to complete your booking
            </p>
          </div>
        </div>
      )}

      {/* Booked confirmation */}
      {bookedInstructor !== null && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
              You're booked with{" "}
              <span className="font-bold">
                {instructors.find((i) => i.id === bookedInstructor)?.name}
              </span>{" "}
              for <span className="font-bold">{bookedClassName}</span>!
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
              A confirmation has been sent. See you in class!
            </p>
          </div>
        </div>
      )}

      {/* Location Banner */}
      <div className="mb-8 p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-black dark:text-white">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-black dark:text-white">
              Location Match
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {isLocating
                ? "Detecting location..."
                : `${sortedInstructors.length} instructors sorted by distance to ${userLocation?.city}, ${userLocation?.state}`}
            </p>
          </div>
        </div>
      </div>

      {/* Instructors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedInstructors.map((instructor) => {
          const isBooked = bookedInstructor === instructor.id;
          return (
            <Card
              key={instructor.id}
              data-instructor-id={instructor.id}
              className={`overflow-hidden hover:shadow-lg transition-all dark:bg-[#121212] dark:border-zinc-800 flex flex-col ${
                isBooked
                  ? "ring-2 ring-emerald-500 dark:ring-emerald-600 border-emerald-300 dark:border-emerald-700"
                  : ""
              }`}
            >
              <div className="p-6 flex flex-col items-center text-center flex-grow">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-zinc-950 shadow-lg">
                    <img
                      src={instructor.image}
                      alt={instructor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <Badge className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-2 border-white dark:border-zinc-950 shadow-sm whitespace-nowrap px-3 py-0.5 font-medium text-xs">
                      {instructor.specialty}
                    </Badge>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-2">
                  {instructor.name}
                </h3>

                <div className="flex items-center gap-1 mt-1 mb-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    {instructor.rating}
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    ({instructor.reviews})
                  </span>
                </div>

                <div className="flex flex-wrap justify-center gap-1 mb-3">
                  {instructor.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full"
                    >
                      {cert}
                      {CERT_DESCRIPTIONS[cert] && (
                        <span className="relative group">
                          <Info className="w-3 h-3 text-zinc-400 cursor-help" />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-52 bg-zinc-900 dark:bg-zinc-700 text-white text-xs rounded-lg px-3 py-2 shadow-xl pointer-events-none leading-relaxed">
                            {CERT_DESCRIPTIONS[cert]}
                            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-700" />
                          </span>
                        </span>
                      )}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 line-clamp-3">
                  "{instructor.bio}"
                </p>

                <div className="mt-auto w-full pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{instructor.location}</span>
                    </div>
                    <span className="font-medium px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md flex-shrink-0">
                      {instructor.distance} mi
                    </span>
                  </div>

                  {isBookingFlow ? (
                    isBooked ? (
                      <Button
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                        disabled
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Booked!
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={() => setBookedInstructor(instructor.id)}
                      >
                        Book with {instructor.name.split(" ")[0]}
                      </Button>
                    )
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      onClick={() => { setLastViewedInstructor(instructor.id); setSelectedInstructor(instructor.id); }}
                    >
                      View Schedule
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
