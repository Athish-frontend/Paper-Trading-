import React, { useState } from "react";
import "./Research.css";

export default function Research() {
  const [symbol, setSymbol] = useState("NVDA");

  const stock = {
    name: "NVIDIA CORPORATION",
    price: 208.27,
    change: "+8.63 (+4.32%)",
    market: "Nasdaq Stock Market",
    eps: 4.93,
    marketCap: "5.06T",
    pe: 40.73,
    high: 210.95,
    low: 199.81,
  };

  return (
    <div className="research-page">

      {}
      <div className="search-box">
        <label>Symbol</label>
        <div className="search-input">
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Search symbol..."
          />
          <span>🔍</span>
        </div>
      </div>

      {}
      <div className="research-card">

        {}
        <div className="stock-info">

          <h1>{symbol}</h1>
          <p className="company">{stock.name}</p>
          <p className="market">{stock.market}</p>

          <div className="price">
            ₹{stock.price} <span className="green">{stock.change}</span>
          </div>

          {}
          <div className="fundamentals">
            <div>
              <span>EPS</span>
              <p>{stock.eps}</p>
            </div>
            <div>
              <span>Market Cap</span>
              <p>{stock.marketCap}</p>
            </div>
            <div>
              <span>P/E</span>
              <p>{stock.pe}</p>
            </div>
          </div>

          {}
          <div className="stats">
            <div>
              <span>Day High</span>
              <p>{stock.high}</p>
            </div>
            <div>
              <span>Day Low</span>
              <p>{stock.low}</p>
            </div>
          </div>

          {}
          <div className="actions">
            <button className="trade-btn">TRADE {symbol}</button>
            <button className="info-btn">MORE INFO</button>
          </div>

        </div>

        {}
        <div className="chart-box">
          <div className="chart-placeholder">
            📈 Chart will go here
          </div>
        </div>

      </div>
    </div>
  );
}