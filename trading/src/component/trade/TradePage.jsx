import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  Search,
  ArrowRight,
  Info,
  ChevronDown,
  ShieldCheck,
  Zap
} from "lucide-react";

import TradingViewChart from "./TradingViewChart";

export default function TradePage({ user }) {
  const [action, setAction] = useState("BUY");
  const [orderType, setOrderType] = useState("MARKET");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [symbol, setSymbol] = useState("");
  const [stockData, setStockData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("STOCKS");
  const [tradeHistory, setTradeHistory] = useState([]);

  // eslint-disable-next-line react-hooks/purity
  const optionsData = useMemo(() => [
    { s: -10, itm: true }, { s: -5, itm: true }, { s: 0, itm: false },
    { s: 5, itm: false }, { s: 10, itm: false }, { s: 15, itm: false }
  ].map(row => ({
    ...row,
    callLast: (5 - row.s * 0.4 + Math.random()).toFixed(2),
    callChg: (Math.random() * 2 - 1).toFixed(2),
    callChgColor: Math.random() > 0.5 ? 'text-emerald-600' : 'text-red-600',
    callVol: Math.floor(Math.random() * 5000).toLocaleString(),
    callOI: Math.floor(Math.random() * 2000).toLocaleString(),
    putLast: (5 + row.s * 0.4 + Math.random()).toFixed(2),
    putChg: (Math.random() * 2 - 1).toFixed(2),
    putChgColor: Math.random() > 0.5 ? 'text-emerald-600' : 'text-red-600',
    putVol: Math.floor(Math.random() * 5000).toLocaleString(),
    putOI: Math.floor(Math.random() * 2000).toLocaleString(),
  })), [stockData]);

  const fetchTradeHistory = async () => {
    if (!user?.email) return;
    try {
      const response = await fetch(`http://localhost:8000/api/user/trades?email=${user.email}`);
      const data = await response.json();
      setTradeHistory(data.reverse());
    } catch (err) {
      console.error("Failed to fetch trades:", err);
    }
  };

  const fetchStockPrice = async (ticker) => {
    if (!ticker) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/api/stock/${ticker}`);
      if (!response.ok) throw new Error("Stock not found");
      const data = await response.json();
      setStockData(data);
      if (orderType === "MARKET") {
        setPrice(data.price.toString());
      }
    } catch (err) {
      setError(err.message);
      setStockData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const [account, setAccount] = useState({
    totalAccountValue: 100000.0,
    buyingPower: 100000.0,
    cash: 100000.0,
  });

  const fetchAccountData = async () => {
    if (!user?.email) return;
    try {
      const response = await fetch(`http://localhost:8000/api/user/portfolio?email=${user.email}`);
      const data = await response.json();
      setAccount({
        totalAccountValue: data.totalAccountValue,
        buyingPower: data.cash, // Buying power is cash in this simple sim
        cash: data.cash
      });
    } catch (err) {
      console.error("Failed to fetch account:", err);
    }
  };

  useEffect(() => {
    fetchAccountData();
    if (activeSubTab === "STATUS") fetchTradeHistory();
  }, [activeSubTab, user]);

  const executeTrade = async () => {
    if (!symbol || !quantity || !price || !user?.email) {
      setError("Please fill in all fields and search for a valid symbol");
      return;
    }

    setIsLoading(true);
    setError(null);
    const endpoint = action === "BUY" ? "buy" : "sell";

    try {
      const response = await fetch(`http://localhost:8000/api/trade/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: symbol,
          quantity: parseInt(quantity),
          price: parseFloat(price),
          user_email: user.email
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Trade failed");

      alert(data.message); // Simple notification for now
      setQuantity("");
      setSymbol("");
      setStockData(null);
      setPrice("");
      fetchAccountData();
      if (activeSubTab === "STATUS") fetchTradeHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestions = async (q) => {
    if (q.length < 1) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`http://localhost:8000/api/stock/search?q=${q}`);
      const data = await response.json();
      setSuggestions(data.result || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleSymbolChange = (e) => {
    const val = e.target.value.toUpperCase();
    setSymbol(val);
    fetchSuggestions(val);
  };

  const selectSuggestion = (s) => {
    setSymbol(s.symbol);
    setSuggestions([]);
    setShowSuggestions(false);
    fetchStockPrice(s.symbol);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      fetchStockPrice(symbol);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div>
          <h2 className="text-3xl font-light tracking-tight text-slate-900 mb-1">Trade Assets</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Zap size={14} className="text-amber-500" /> Execute orders in real-time
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {[
            { label: "Buying Power", val: `$${account.buyingPower.toLocaleString()}`, color: "text-blue-600" },
            { label: "Cash Available", val: `$${account.cash.toLocaleString()}`, color: "text-slate-700" }
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-slate-200 py-3 px-6 rounded-2xl shadow-sm min-w-[160px]">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className={`text-sm font-bold ${stat.color}`}>{stat.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SUB-MENUBAR */}
      <div className="flex gap-8 border-b border-slate-200 mb-8 pb-1">
        {[
          { id: "STOCKS", label: "Stocks" },
          { id: "OPTIONS", label: "Options" },
          { id: "RESEARCH", label: "Research" },
          { id: "STATUS", label: "Order Status" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveSubTab(tab.id);
              if (tab.id === "STATUS") fetchTradeHistory();
            }}
            className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all relative ${activeSubTab === tab.id ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              }`}
          >
            {tab.label}
            {activeSubTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 animate-in fade-in slide-in-from-left-2 duration-300"></div>
            )}
          </button>
        ))}
      </div>

      {activeSubTab === "STOCKS" ? (
        <div className="grid grid-cols-12 gap-8">
          {/* LEFT PANEL: ORDER FORM */}
          <div className="col-span-12 lg:col-span-7 space-y-8">
            <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                  <TrendingUp size={20} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Order Entry</h3>
              </div>

              <div className="space-y-6">
                {/* SYMBOL SEARCH */}
                <div className="relative group">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Stock Symbol</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <input
                      value={symbol}
                      onChange={handleSymbolChange}
                      onKeyDown={handleKeyDown}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      placeholder="Type symbol & press Enter (e.g. AAPL)"
                      className={`w-full bg-slate-50 border ${error ? 'border-red-300' : 'border-slate-200'} rounded-2xl py-4 pl-12 pr-6 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all`}
                    />

                    {/* SEARCH SUGGESTIONS DROPDOWN */}
                    {showSuggestions && suggestions.length > 0 && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowSuggestions(false)}></div>
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                          {suggestions.map((s, i) => (
                            <div
                              key={i}
                              onClick={() => selectSuggestion(s)}
                              className="px-6 py-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 flex justify-between items-center group"
                            >
                              <div>
                                <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{s.symbol}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate max-w-[200px]">{s.description}</p>
                              </div>
                              <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md">{s.type}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {isLoading && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  {error && <p className="text-[10px] text-red-500 font-bold mt-2 ml-2 uppercase tracking-wide">Error: {error}</p>}
                  {stockData && !error && (
                    <div className="mt-2 ml-2 space-y-1">
                      <p className="text-[11px] text-slate-800 font-bold uppercase tracking-wide">
                        {stockData.description}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide">
                        Live Price: ${stockData.price} | {stockData.changePercent}%
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ACTION TOGGLE */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Action</label>
                    <div className="flex bg-slate-50 border border-slate-200 p-1 rounded-2xl h-[56px]">
                      <button
                        onClick={() => setAction("BUY")}
                        className={`flex-1 rounded-xl text-xs font-bold transition-all ${action === "BUY" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        BUY
                      </button>
                      <button
                        onClick={() => setAction("SELL")}
                        className={`flex-1 rounded-xl text-xs font-bold transition-all ${action === "SELL" ? "bg-red-600 text-white shadow-md shadow-red-600/20" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        SELL
                      </button>
                    </div>
                  </div>

                  {/* ORDER TYPE */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Order Type</label>
                    <div className="flex bg-slate-50 border border-slate-200 p-1 rounded-2xl h-[56px]">
                      <button
                        onClick={() => setOrderType("MARKET")}
                        className={`flex-1 rounded-xl text-xs font-bold transition-all ${orderType === "MARKET" ? "bg-slate-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        Market
                      </button>
                      <button
                        onClick={() => setOrderType("LIMIT")}
                        className={`flex-1 rounded-xl text-xs font-bold transition-all ${orderType === "LIMIT" ? "bg-slate-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        Limit
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* QUANTITY */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Quantity (Shares)</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all h-[56px]"
                    />
                  </div>

                  {/* LIMIT PRICE */}
                  {orderType === "LIMIT" && (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Limit Price ($)</label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all h-[56px]"
                      />
                    </div>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-4 pt-6">
                  <button
                    onClick={() => { setQuantity(""); setPrice(""); setSymbol(""); }}
                    className="px-8 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-all overflow-hidden relative group"
                  >
                    <span className="relative z-10">Clear Form</span>
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </button>
                  <button
                    onClick={executeTrade}
                    disabled={isLoading || !stockData}
                    className="flex-grow py-4 bg-blue-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-slate-300 disabled:shadow-none transition-all"
                  >
                    {isLoading ? "Processing..." : `Execute ${action} Order`} <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </section>

            {/* HELP CARD */}
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex gap-5 items-start shadow-sm">
              <Info className="text-blue-500 shrink-0 mt-1" size={20} />
              <div>
                <h4 className="text-sm font-bold text-blue-600 mb-1">Trading Discipline</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Market orders are executed at the next available price. Limit orders give you control over the execution price but are not guaranteed to fill.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: SUMMARY & DATA */}
          <div className="col-span-12 lg:col-span-5 space-y-8">
            <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none" />

              <h3 className="text-lg font-medium text-slate-900 mb-8">Order Summary</h3>

              {symbol && quantity ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-inner">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-2xl font-bold text-slate-900 tracking-tighter">{symbol}</span>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors ${action === "BUY" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
                        {action}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-bold uppercase tracking-wider">Quantity</span>
                        <span className="text-slate-900 font-bold">{quantity} Shares</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-bold uppercase tracking-wider">Order Type</span>
                        <span className="text-slate-900 font-bold">{orderType}</span>
                      </div>
                      {orderType === "LIMIT" && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400 font-bold uppercase tracking-wider">Limit Price</span>
                          <span className="text-slate-900 font-bold">${parseFloat(price).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Est. Total</span>
                        <span className="text-xl font-bold text-blue-600 tracking-tight">
                          {quantity && price ? `$${(parseFloat(quantity) * parseFloat(price)).toLocaleString()}` : "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2">
                    <ShieldCheck size={14} className="text-blue-600" /> Secure simulation transaction
                  </div>
                </div>
              ) : (
                <div className="min-h-[220px] flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center border border-dashed border-slate-200">
                    <ChevronDown className="text-slate-300 animate-bounce" size={24} />
                  </div>
                  <p className="text-slate-400 text-sm font-medium">Enter stock symbol and quantity<br />to generate order summary</p>
                </div>
              )}
            </section>

            {/* WATCHLIST PREVIEW (Mini) */}
            <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Market Favorites</h3>
              <div className="space-y-4">
                {[
                  { s: "TSLA", n: "Tesla Motors", p: "175.43", c: "+2.34%", up: true },
                  { s: "AAPL", n: "Apple Inc.", p: "189.12", c: "-0.12%", up: false },
                  { s: "MSFT", n: "Microsoft Corp.", p: "421.90", c: "+1.05%", up: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-slate-50 transition-colors border border-slate-100 hover:border-slate-200 shadow-sm cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-[10px] text-slate-600 border border-slate-200">
                        {item.s[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.s}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.n}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">${item.p}</p>
                      <p className={`text-[10px] font-bold ${item.up ? "text-emerald-600" : "text-red-600"}`}>{item.c}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : activeSubTab === "RESEARCH" ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          <section className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -mr-32 -mt-32" />

            <div className="grid grid-cols-12 gap-12">
              {/* LEFT: INFO & STATS */}
              <div className="col-span-12 lg:col-span-7 space-y-10">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 block">Asset Research</label>
                  <div className="relative group max-w-md">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input
                      value={symbol}
                      onChange={handleSymbolChange}
                      onKeyDown={handleKeyDown}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      placeholder="Enter symbol (e.g. NVDA)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 pl-14 pr-8 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                    />

                    {/* RECOMMENDATIONS */}
                    {showSuggestions && suggestions.length > 0 && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowSuggestions(false)}></div>
                        <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-200 rounded-3xl shadow-2xl z-20 overflow-hidden max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                          {suggestions.map((s, i) => (
                            <div
                              key={i}
                              onClick={() => selectSuggestion(s)}
                              className="px-8 py-5 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 flex justify-between items-center group"
                            >
                              <div>
                                <p className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{s.symbol}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate max-w-[250px]">{s.description}</p>
                              </div>
                              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg">{s.type}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {stockData ? (
                  <div className="animate-in fade-in duration-1000 space-y-10">
                    <div className="flex items-start gap-8">
                      {stockData.logo ? (
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center border border-slate-100 shadow-md p-3">
                          <img src={stockData.logo} alt="logo" className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl flex items-center justify-center text-white font-bold text-3xl shadow-xl">
                          {stockData.symbol[0]}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-5xl font-bold text-slate-900 tracking-tighter">{stockData.symbol}</h3>
                          <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-3 py-1.5 rounded-xl border border-emerald-100 uppercase tracking-widest">
                            Nasdaq Stock Market
                          </span>
                        </div>
                        <p className="text-lg text-slate-400 font-medium tracking-tight">{stockData.description}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-6 mb-2">
                        <span className="text-6xl font-bold text-slate-900 tracking-tighter">${stockData.price}</span>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${stockData.change >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                          <TrendingUp size={18} className={stockData.change < 0 ? "rotate-180" : ""} />
                          <span className="text-xl font-bold">
                            {stockData.change >= 0 ? "+" : ""}{stockData.change} ({stockData.changePercent}%)
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] ml-1">Real-time data • Market Open</p>
                    </div>

                    <div className="grid grid-cols-5 gap-8 py-10 border-y border-slate-100">
                      {[
                        { label: "Earnings", val: "May 21" },
                        { label: "EPS", val: "4.93" },
                        { label: "Market Cap", val: "5.06 T" },
                        { label: "Div Yield", val: "0.02%" },
                        { label: "P/E Ratio", val: "40.73" }
                      ].map((stat, i) => (
                        <div key={i}>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                          <p className="text-lg font-bold text-slate-900">{stat.val}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-x-16 gap-y-8">
                      {[
                        { label: "Volume (current)", val: "214.134m" },
                        { label: "52 Week High ($)", val: "212.19" },
                        { label: "Day's High ($)", val: "210.95" },
                        { label: "Bid/Ask price ($)", val: "208.15 / 208.19" },
                        { label: "Day's Low ($)", val: "199.81" },
                        { label: "52 Week Low ($)", val: "104.08" }
                      ].map((stat, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-4">
                          <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">{stat.label}</p>
                          <p className="text-sm font-bold text-slate-500 tracking-tight">{stat.val}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-6 pt-6">
                      <button
                        onClick={() => setActiveSubTab("STOCKS")}
                        className="flex-1 py-5 border-2 border-blue-600 rounded-2xl text-xs font-bold uppercase tracking-[0.3em] text-blue-600 hover:bg-blue-50 transition-all hover:shadow-lg hover:shadow-blue-600/10 active:scale-95"
                      >
                        Trade {stockData.symbol}
                      </button>
                      <button className="flex-1 py-5 bg-blue-600 rounded-2xl text-xs font-bold uppercase tracking-[0.3em] text-white shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-95">
                        More Info
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-32 text-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm mx-auto mb-8">
                      <Search className="text-blue-200" size={40} />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-900 mb-3">Market Research</h4>
                    <p className="text-slate-400 max-w-xs mx-auto">Analyze detailed financial metrics and interactive charts for any asset.</p>
                  </div>
                )}
              </div>

              {/* RIGHT: CHART */}
              <div className="col-span-12 lg:col-span-5 min-h-[600px] bg-slate-50 rounded-[3rem] border border-slate-100 overflow-hidden relative shadow-inner">
                {stockData ? (
                  <div className="h-full animate-in zoom-in-95 duration-1000">
                    <TradingViewChart symbol={stockData.symbol} />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <TrendingUp size={300} />
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      ) : activeSubTab === "STATUS" ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                <TrendingUp size={20} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Order Status</h3>
            </div>

            {tradeHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="pb-4 px-2">Symbol</th>
                      <th className="pb-4 px-2">Type</th>
                      <th className="pb-4 px-2">Quantity</th>
                      <th className="pb-4 px-2">Price</th>
                      <th className="pb-4 px-2">Total</th>
                      <th className="pb-4 px-2">Status</th>
                      <th className="pb-4 px-2">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {tradeHistory.map((trade, i) => (
                      <tr key={i} className="text-xs hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-2 font-bold text-slate-900">{trade.symbol}</td>
                        <td className="py-4 px-2">
                          <span className={`px-2 py-1 rounded-md font-bold text-[10px] ${trade.type === 'BUY' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {trade.type}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-slate-600">{trade.quantity}</td>
                        <td className="py-4 px-2 text-slate-600">${trade.price.toFixed(2)}</td>
                        <td className="py-4 px-2 font-medium text-slate-900">${trade.total.toLocaleString()}</td>
                        <td className="py-4 px-2">
                          <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                            {trade.status}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-slate-400">{trade.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center border border-dashed border-slate-200 mx-auto mb-4">
                  <TrendingUp className="text-slate-300" size={24} />
                </div>
                <p className="text-slate-400 text-sm font-medium">No orders found yet.<br />Your trade history will appear here.</p>
              </div>
            )}
          </section>
        </div>
      ) : activeSubTab === "OPTIONS" ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          {/* SEARCH & CHART SECTION */}
          <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="grid grid-cols-12 gap-8">
              {/* LEFT: INFO & SEARCH */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Symbol Search</label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <input
                      value={symbol}
                      onChange={handleSymbolChange}
                      onKeyDown={handleKeyDown}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      placeholder="Search (e.g. NVDA)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all"
                    />

                    {/* SEARCH SUGGESTIONS DROPDOWN */}
                    {showSuggestions && suggestions.length > 0 && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowSuggestions(false)}></div>
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                          {suggestions.map((s, i) => (
                            <div
                              key={i}
                              onClick={() => selectSuggestion(s)}
                              className="px-6 py-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 flex justify-between items-center group"
                            >
                              <div>
                                <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{s.symbol}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate max-w-[200px]">{s.description}</p>
                              </div>
                              <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md">{s.type}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {stockData ? (
                  <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="flex items-center gap-4 mb-6">
                      {stockData.logo ? (
                        <img src={stockData.logo} alt="logo" className="w-12 h-12 rounded-xl object-contain border border-slate-100" />
                      ) : (
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                          {stockData.symbol[0]}
                        </div>
                      )}
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 leading-none mb-1">{stockData.symbol}</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">{stockData.description}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Price</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-slate-900 tracking-tighter">${stockData.price}</span>
                          <span className={`text-xs font-bold ${stockData.change >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {stockData.change >= 0 ? "+" : ""}{stockData.change} ({stockData.changePercent}%)
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Day High</p>
                          <p className="text-sm font-bold text-slate-900">${(stockData.price * 1.02).toFixed(2)}</p>
                        </div>
                        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Day Low</p>
                          <p className="text-sm font-bold text-slate-900">${(stockData.price * 0.98).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                    <TrendingUp className="mx-auto text-slate-200 mb-2" size={32} />
                    <p className="text-xs text-slate-400 font-medium">Search for a symbol to<br />view options analysis</p>
                  </div>
                )}
              </div>

              {/* RIGHT: CHART */}
              <div className="col-span-12 lg:col-span-8 min-h-[400px] bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden relative">
                {stockData ? (
                  <TradingViewChart symbol={stockData.symbol} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-slate-400 text-sm font-medium">Select a stock to load interactive chart</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* OPTIONS CHAIN SECTION */}
          {stockData && (
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
                  Options Chain <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wider">Experimental</span>
                </h3>
                <div className="flex gap-2">
                  <select className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-100">
                    <option>May 15, 2026</option>
                    <option>Jun 19, 2026</option>
                    <option>Sep 18, 2026</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80">
                      <th colSpan="6" className="py-2 text-center text-[10px] font-bold text-blue-600 uppercase tracking-widest border-r border-slate-100">Calls</th>
                      <th className="py-2 text-center text-[10px] font-bold text-slate-900 uppercase tracking-widest bg-slate-100/50">Strike</th>
                      <th colSpan="6" className="py-2 text-center text-[10px] font-bold text-red-600 uppercase tracking-widest border-l border-slate-100">Puts</th>
                    </tr>
                    <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter border-b border-slate-100">
                      <th className="py-3 px-2">Last</th>
                      <th className="py-3 px-2">Chg</th>
                      <th className="py-3 px-2">Bid</th>
                      <th className="py-3 px-2">Ask</th>
                      <th className="py-3 px-2">Vol</th>
                      <th className="py-3 px-2 border-r border-slate-100">OI</th>
                      <th className="py-3 px-4 text-center bg-slate-50">Price</th>
                      <th className="py-3 px-2 border-l border-slate-100">Last</th>
                      <th className="py-3 px-2">Chg</th>
                      <th className="py-3 px-2">Bid</th>
                      <th className="py-3 px-2">Ask</th>
                      <th className="py-3 px-2">Vol</th>
                      <th className="py-3 px-2">OI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {optionsData.map((row, i) => {
                      const strikePrice = Math.round((stockData?.price || 0) + row.s);
                      const isCallITM = row.s <= 0;
                      const isPutITM = row.s >= 0;
                      
                      return (
                        <tr key={i} className="text-[11px] hover:bg-slate-50/50 transition-colors">
                          <td className={`py-4 px-2 font-bold ${isCallITM ? 'bg-blue-50/30' : ''}`}>{ row.callLast }</td>
                          <td className={`py-4 px-2 font-medium ${isCallITM ? 'bg-blue-50/30' : ''} ${row.callChgColor}`}>{row.callChg}</td>
                          <td className={`py-4 px-2 ${isCallITM ? 'bg-blue-50/30' : ''}`}>{ (4.8 - row.s * 0.4).toFixed(2) }</td>
                          <td className={`py-4 px-2 ${isCallITM ? 'bg-blue-50/30' : ''}`}>{ (5.2 - row.s * 0.4).toFixed(2) }</td>
                          <td className={`py-4 px-2 text-slate-400 ${isCallITM ? 'bg-blue-50/30' : ''}`}>{ row.callVol }</td>
                          <td className={`py-4 px-2 text-slate-400 border-r border-slate-100 ${isCallITM ? 'bg-blue-50/30' : ''}`}>{ row.callOI }</td>
                          
                          <td className="py-4 px-4 text-center font-bold text-slate-900 bg-slate-50/50 border-x border-slate-100">{strikePrice.toFixed(2)}</td>
                          
                          <td className={`py-4 px-2 font-bold border-l border-slate-100 ${isPutITM ? 'bg-red-50/30' : ''}`}>{ row.putLast }</td>
                          <td className={`py-4 px-2 font-medium ${isPutITM ? 'bg-red-50/30' : ''} ${row.putChgColor}`}>{row.putChg}</td>
                          <td className={`py-4 px-2 ${isPutITM ? 'bg-red-50/30' : ''}`}>{ (4.8 + row.s * 0.4).toFixed(2) }</td>
                          <td className={`py-4 px-2 ${isPutITM ? 'bg-red-50/30' : ''}`}>{ (5.2 + row.s * 0.4).toFixed(2) }</td>
                          <td className={`py-4 px-2 text-slate-400 ${isPutITM ? 'bg-red-50/30' : ''}`}>{ row.putVol }</td>
                          <td className={`py-4 px-2 text-slate-400 ${isPutITM ? 'bg-red-50/30' : ''}`}>{ row.putOI }</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      ) : null}
    </div>
  );
}