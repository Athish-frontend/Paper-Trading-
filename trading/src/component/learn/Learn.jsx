import React, { useState } from "react";
import { 
  Play, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  ChevronRight,
  MonitorPlay
} from "lucide-react";

const videos = [
  {
    title: "How To Buy A Stock",
    duration: "1:02",
    thumbnail: "https://img.youtube.com/vi/3GwjfUFyY6M/0.jpg",
    url: "https://www.youtube.com/embed/3GwjfUFyY6M",
    category: "Getting Started"
  },
  {
    title: "Live Trading Nifty and Stocks",
    duration: "Live",
    thumbnail: "https://img.youtube.com/vi/gLbWVJ7MX9A/0.jpg",
    url: "https://www.youtube.com/embed/gLbWVJ7MX9A",
    category: "Live Trading"
  },
  {
    title: "Markets Brace for Busy Week (Bloomberg)",
    duration: "12:45",
    thumbnail: "https://img.youtube.com/vi/0WE1zDTp9bw/0.jpg",
    url: "https://www.youtube.com/embed/0WE1zDTp9bw",
    category: "Market Analysis"
  },
  {
    title: "Share Market Open LIVE | Top Stocks",
    duration: "Live",
    thumbnail: "https://img.youtube.com/vi/IHNcglSBm3Y/0.jpg",
    url: "https://www.youtube.com/embed/IHNcglSBm3Y",
    category: "Live Trading"
  },
  {
    title: "Market Opening LIVE | Nifty Analysis",
    duration: "Live",
    thumbnail: "https://img.youtube.com/vi/VVfUw-0DHRI/0.jpg",
    url: "https://www.youtube.com/embed/VVfUw-0DHRI",
    category: "Live Trading"
  },
  {
    title: "How To Do Stock Research",
    duration: "2:15",
    thumbnail: "https://img.youtube.com/vi/tgbNymZ7vqY/0.jpg",
    url: "https://www.youtube.com/embed/tgbNymZ7vqY",
    category: "Stock Research"
  },
  {
    title: "How To Buy A Call Option",
    duration: "1:44",
    thumbnail: "https://img.youtube.com/vi/kXYiU_JCYtU/0.jpg",
    url: "https://www.youtube.com/embed/kXYiU_JCYtU",
    category: "Stock Trading Basics"
  },
  {
    title: "How To Join A Game",
    duration: "1:01",
    thumbnail: "https://img.youtube.com/vi/e-ORhEE9VVg/0.jpg",
    url: "https://www.youtube.com/embed/e-ORhEE9VVg",
    category: "Introduction to Stocks"
  },
  {
    title: "How To Buy Cryptocurrency",
    duration: "1:12",
    thumbnail: "https://img.youtube.com/vi/l482T0yNkeo/0.jpg",
    url: "https://www.youtube.com/embed/l482T0yNkeo",
    category: "Managing a Portfolio"
  },
];

export default function Learn() {
  const [selectedVideo, setSelectedVideo] = useState(videos[0]);
  const [activeCategory, setActiveCategory] = useState("Getting Started Guide");

  const categories = [
    "Getting Started Guide",
    "Live Trading",
    "Market Analysis",
    "Introduction to Stocks",
    "Stock Trading Basics",
    "Managing a Portfolio",
    "Stock Research"
  ];

  const filteredVideos = videos.filter(v => 
    v.category === activeCategory || 
    (activeCategory === "Getting Started Guide" && v.category === "Getting Started")
  );

  React.useEffect(() => {
    if (filteredVideos.length > 0 && !filteredVideos.includes(selectedVideo)) {
      setSelectedVideo(filteredVideos[0]);
    }
  }, [activeCategory, filteredVideos, selectedVideo]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div>
          <h2 className="text-3xl font-light tracking-tight text-slate-900 mb-1">Learning Center</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <BookOpen size={14} className="text-blue-500" /> Master the market with video guides
          </p>
        </div>
      </div>

      {}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap shadow-sm border ${
              activeCategory === cat 
                ? "bg-blue-600 text-white border-blue-600 shadow-blue-600/20" 
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <section className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm transition-all group">
            <div className="aspect-video w-full bg-slate-900 relative">
               <iframe
                src={`${selectedVideo.url}?autoplay=1&mute=1`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>

            <div className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                  {selectedVideo.category}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <Clock size={12} /> {selectedVideo.duration} mins
                </span>
              </div>

              <h3 className="text-2xl font-light text-slate-900 tracking-tight mb-4">{selectedVideo.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-2xl font-medium">
                Learn the essential steps to master {selectedVideo.title.toLowerCase()}. This guide covers everything from account setup to executing your first trade with confidence.
              </p>

              <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Course Progress</p>
                    <p className="text-xs font-bold text-slate-700">Mark as completed</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 text-blue-600 font-bold text-xs hover:text-blue-700 transition-colors">
                  Next Lesson <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </section>
        </div>

        {}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm h-full">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <MonitorPlay size={16} className="text-blue-500" /> Lesson Playlist
            </h4>

            <div className="space-y-4">
              {filteredVideos.length > 0 ? (
                filteredVideos.map((video, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedVideo(video)}
                    className={`group flex gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${
                      selectedVideo.title === video.title 
                        ? "bg-slate-50 border-slate-200 ring-1 ring-blue-500/10 shadow-inner" 
                        : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-100"
                    }`}
                  >
                    <div className="w-24 h-16 shrink-0 rounded-xl overflow-hidden relative shadow-sm border border-slate-200">
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={16} className="text-white fill-white" />
                      </div>
                    </div>

                    <div className="flex flex-col justify-center">
                      <p className={`text-xs font-bold leading-tight mb-1 transition-colors ${
                        selectedVideo.title === video.title ? "text-blue-600" : "text-slate-700 group-hover:text-slate-900"
                      }`}>
                        {video.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                        <Clock size={10} /> {video.duration}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <p className="text-xs text-slate-400 font-medium">No lessons found in this category yet.</p>
                </div>
              )}
            </div>

            <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
              <h5 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">Pro Tip</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                Take notes while watching tutorials. Successful traders constantly review fundamentals before taking on new strategies.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}