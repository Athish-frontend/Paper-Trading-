import React from 'react';
import {
  LineChart,
  TrendingUp,
  Info,
  User,
  ArrowDownRight,
  Clock
} from 'lucide-react';

import TradePage from '../trade/TradePage';
import Learn from '../learn/Learn';

/**
 * Home Page Component
 * Replicates the Investopedia Simulator Dashboard layout.
 * Best used with Tailwind CSS configured in your project.
 */
const Home = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = React.useState('portfolio');
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [portfolioData, setPortfolioData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPortfolio = async () => {
      if (!user?.email) return;
      try {
        const response = await fetch(`http://localhost:8000/api/user/portfolio?email=${user.email}`);
        const data = await response.json();
        setPortfolioData(data);
      } catch (err) {
        console.error("Failed to fetch portfolio:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const holdings = portfolioData?.holdings || [];
  const stats = [
    { label: "Account Value", val: `$${portfolioData?.totalAccountValue?.toLocaleString() || '0'}` },
    { label: "Buying Power", val: `$${portfolioData?.cash?.toLocaleString() || '0'}` },
    { label: "Annual Return", val: "+14.2%" },
    { label: "Day Gain", val: "+$1,240.00", up: true },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500/10">
      {/* Subtle Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/50 rounded-full blur-[120px]" />
      </div>

      {/* 1. Header Navigation */}
      <nav className="relative z-20 bg-white/80 backdrop-blur-xl px-8 py-4 flex items-center justify-between border-b border-slate-200 sticky top-0 shadow-sm">
        <div className="flex items-center gap-12">
          <div className="text-xl font-bold tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
              <TrendingUp size={18} className="text-white" />
            </div>
            <span className="text-slate-900">
              PAPER <span className="font-light text-slate-400">Trading</span>
            </span>
          </div>
          <div className="hidden lg:flex gap-10 text-[11px] font-bold uppercase tracking-widest text-slate-500">
            <span
              onClick={() => setActiveTab('portfolio')}
              className={`pb-5 translate-y-[2px] cursor-pointer transition-all duration-300 ${activeTab === 'portfolio' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-slate-900'}`}
            >
              Portfolio
            </span>
            <span
              onClick={() => setActiveTab('trade')}
              className={`pb-5 translate-y-[2px] cursor-pointer transition-all duration-300 ${activeTab === 'trade' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-slate-900'}`}
            >
              Trade
            </span>
            <span
              onClick={() => setActiveTab('learn')}
              className={`pb-5 translate-y-[2px] cursor-pointer transition-all duration-300 ${activeTab === 'learn' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-slate-900'}`}
            >
              Learn
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button className="px-5 py-1.5 text-[10px] font-bold bg-white text-blue-600 rounded-lg shadow-sm transition-all border border-slate-200">STOCKS</button>
            <button className="px-5 py-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-all">CRYPTO</button>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50 transition-all text-slate-500 hover:text-blue-600 shadow-sm relative overflow-hidden"
            >
              <User size={20} />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowUserMenu(false)}
                ></div>
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-40 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Trader'}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <i className="fas fa-sign-out-alt"></i> Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 p-8 max-w-[1700px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        {activeTab === 'portfolio' ? (
          <div className="grid grid-cols-12 gap-8">

            {/* Left Column: Stats */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <header className="flex justify-between items-center mb-8">
                  <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Account Liquidity</h2>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Live connection" />
                </header>
                <div className="mb-8">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">
                    Account Value <Info size={12} className="text-slate-300" />
                  </p>
                  <div className="text-5xl font-extralight tracking-tight text-slate-900">$100,046.<span className="text-slate-400 text-3xl font-light">01</span></div>
                </div>
                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                  {[
                    { label: "Today's Change", val: "+$0.00", sub: "(0.00%)", color: "text-emerald-600" },
                    { label: "Annual Return", val: "0.34%", sub: "↑", color: "text-emerald-600" },
                    { label: "Buying Power", val: "$99,920.73", color: "text-slate-700" },
                    { label: "Cash on Hand", val: "$99,795.45", color: "text-slate-700" },
                  ].map((stat, i) => (
                    <div key={i}>
                      <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">{stat.label}</p>
                      <div className={`${stat.color} font-semibold flex items-baseline gap-1.5`}>
                        {stat.val} {stat.sub && <span className="text-[10px] font-normal opacity-70">{stat.sub}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Tournament Standings</h2>
                <div className="mb-8 pb-8 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Current Global Rank</p>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-bold text-slate-900 tracking-tighter">990,668</span>
                    <div className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded flex items-center gap-1">
                      <ArrowDownRight size={12} /> 12
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">Out of 2,803,700 active traders</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Current Leader</p>
                  <p className="text-blue-600 text-sm font-bold hover:text-blue-700 transition-colors cursor-pointer">economistascalzo99</p>
                  <p className="text-xl font-light mt-1.5 text-slate-800">$161.79 <span className="text-xs text-slate-400">Trillion</span></p>
                </div>
              </section>
            </div>

            {/* Right Column: Chart */}
            <div className="col-span-12 lg:col-span-8">
              <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-full flex flex-col">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Portfolio Growth</h2>
                  <div className="flex bg-slate-100 p-1 rounded-xl gap-2 border border-slate-200">
                    {["1W", "1M", "3M", "6M", "1Y"].map((t) => (
                      <button key={t} className={`px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all ${t === '1W' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-grow flex items-center justify-center border border-dashed border-slate-200 rounded-3xl bg-slate-50/50 m-2 relative group overflow-hidden">
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[50px] pointer-events-none" />
                  <div className="text-center px-12 relative z-10 transition-transform duration-500 group-hover:scale-105">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100">
                      <LineChart className="text-blue-500" size={32} />
                    </div>
                    <h3 className="text-slate-900 font-medium mb-2">Analyzing Market History...</h3>
                    <p className="text-slate-500 text-xs leading-relaxed max-w-[280px]">Your personalized performance visualizations will generate here as the market closes.</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-100 px-2">
                  <button className="bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all px-8 py-3.5 text-[10px] font-bold rounded-xl uppercase flex items-center gap-2.5 shadow-lg shadow-blue-600/10 text-white">
                    <TrendingUp size={16} /> Technical Report
                  </button>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-3 text-[10px] font-bold text-slate-400 cursor-pointer uppercase hover:text-slate-600 transition-colors">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      Compare S&P 500
                    </label>
                  </div>
                </div>
              </section>
            </div>

            {/* Full Width Bottom: Holdings */}
            <div className="col-span-12">
              <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <header className="flex bg-slate-50/50 border-b border-slate-200">
                  {["Stocks & ETFs", "Options", "Shorts"].map((tab) => (
                    <button key={tab} className={`px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${tab === 'Stocks & ETFs' ? 'text-blue-600 border-blue-600 bg-white' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
                      {tab}
                    </button>
                  ))}
                  <div className="ml-auto flex items-center px-10 text-[10px] font-bold text-amber-600 gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <Clock size={14} className="opacity-70" />
                    MARKET CLOSED <span className="text-slate-400 font-normal ml-1">Opens in 12h 45m</span>
                  </div>
                </header>

                <div className="p-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-12 pb-12 border-b border-slate-100">
                    {[
                      { label: "Total Assets", val: "$250.56", sub: "1.0 Shares" },
                      { label: "Today's Return", val: "+$0.00", sub: "(0.00%)", color: "text-slate-900" },
                      { label: "Unrealized P&L", val: "+$46.01", sub: "+22.49% ↑", color: "text-emerald-600" },
                    ].map((sum, i) => (
                      <div key={i} className="group">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 group-hover:text-slate-500 transition-colors">{sum.label}</p>
                        <div className={`text-3xl font-light ${sum.color || 'text-slate-900'} flex items-baseline gap-2.5`}>
                          {sum.val} <span className="text-xs font-normal opacity-40">{sum.sub}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] border-b border-slate-100">
                          <th className="pb-6 w-[120px]">Asset</th>
                          <th className="pb-6">Description</th>
                          <th className="pb-6 text-right">Price</th>
                          <th className="pb-6 text-right">Change</th>
                          <th className="pb-6 text-right">Cost Basis</th>
                          <th className="pb-6 text-center">Qty</th>
                          <th className="pb-6 text-right">Market Value</th>
                          <th className="pb-6 text-right">Open Profit</th>
                          <th className="pb-6 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {holdings.map((stock, i) => (
                          <tr key={i} className="group hover:bg-slate-50 transition-colors relative">
                            <td className="py-7">
                              <div className="text-blue-600 font-extrabold text-sm tracking-tight cursor-pointer hover:underline underline-offset-4 decoration-2">
                                {stock.symbol}
                              </div>
                            </td>
                            <td className="py-7 text-slate-500 font-medium text-xs">{stock.description}</td>
                            <td className="py-7 text-right font-semibold text-slate-900 text-xs tracking-tight">${stock.currentPrice}</td>
                            <td className="py-7 text-right text-emerald-600 font-bold italic text-xs">
                              +${stock.todaysChange} <br />
                              <span className="text-[10px] font-normal opacity-60 tracking-normal">({stock.changePercent}%)</span>
                            </td>
                            <td className="py-7 text-right text-slate-500 font-medium text-xs">${stock.purchasePrice}</td>
                            <td className="py-7 text-center font-bold text-slate-900 text-xs">{stock.qty}</td>
                            <td className="py-7 text-right font-semibold text-slate-900 text-xs">${stock.totalValue}</td>
                            <td className="py-7 text-right text-emerald-600 font-bold italic text-xs">
                              +${stock.totalGain} <br />
                              <span className="text-[10px] font-normal opacity-60 tracking-normal">({stock.gainPercent}%) ↑</span>
                            </td>
                            <td className="py-7 text-center">
                              <div className="flex items-center justify-center gap-3">
                                <button className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                                  <TrendingUp size={14} />
                                </button>
                                <button className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm">
                                  <ArrowDownRight size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <footer className="mt-12 flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-2">
                      <Info size={14} className="text-blue-500" /> Use simulator to practice advanced trading strategies risk-free.
                    </p>
                    <button className="bg-white hover:bg-slate-50 transition-all px-8 py-3 rounded-xl text-[10px] font-bold uppercase flex items-center gap-2.5 shadow-sm border border-slate-200 tracking-widest text-slate-600">
                      <User size={16} /> Transaction Ledger
                    </button>
                  </footer>
                </div>
              </section>
            </div>
          </div>
        ) : activeTab === 'trade' ? (
          <TradePage user={user} />
        ) : (
          <Learn />
        )}
      </main>
    </div>
  );
};

export default Home;