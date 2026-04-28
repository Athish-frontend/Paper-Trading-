import os
import json
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import requests
from pydantic import BaseModel, EmailStr
from typing import List, Dict, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import asyncio

load_dotenv()
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FINNHUB_BASE_URL = "https://finnhub.io/api/v1"

client = AsyncIOMotorClient(MONGO_URL)
db = client.paper_trading
users_col = db.users
trades_col = db.trades
portfolio_history_col = db.portfolio_history

async def record_portfolio_snapshot(email: str):
    user = await users_col.find_one({"email": email})
    if not user: return

    total_market_value = 0
    portfolio = user.get("portfolio", {})
    for symbol, data in portfolio.items():
        total_market_value += (data['qty'] * data['avg_price'])

    total_value = user.get("cash", 0) + total_market_value
    snapshot = {
        "user_email": email,
        "total_value": round(total_value, 2),
        "timestamp": datetime.utcnow()
    }
    await portfolio_history_col.insert_one(snapshot)

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class OrderRequest(BaseModel):
    symbol: str
    quantity: int
    price: float
    user_email: str 

@app.get("/")
async def root():
    return {"message": "Paper Trading API v3 (MongoDB) is active"}

@app.post("/api/auth/register")
async def register(user: UserRegister):
    existing = await users_col.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "username": user.username,
        "email": user.email,
        "password": user.password, 
        "cash": 100000.0,
        "portfolio": {}, 
        "created_at": datetime.utcnow()
    }
    await users_col.insert_one(user_doc)
    return {"message": "User registered successfully"}

@app.post("/api/auth/login")
async def login(user: UserLogin):
    user_doc = await users_col.find_one({"email": user.email, "password": user.password})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "message": "Login successful",
        "user": {
            "username": user_doc["username"],
            "email": user_doc["email"]
        }
    }

@app.get("/api/stock/search")
async def search_stock(q: str):
    if not FINNHUB_API_KEY or FINNHUB_API_KEY == "your_actual_api_key_here":
        return {"result": [{"description": "Apple Inc.", "displaySymbol": "AAPL", "symbol": "AAPL", "type": "Common Stock"}]}

    try:
        url = f"{FINNHUB_BASE_URL}/search"
        params = {"q": q, "token": FINNHUB_API_KEY}
        response = requests.get(url, params=params)
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stock/{symbol}")
async def get_stock_price(symbol: str):
    if not FINNHUB_API_KEY or FINNHUB_API_KEY == "your_actual_api_key_here":
        import random
        price = random.uniform(150, 200)
        return {
            "symbol": symbol.upper(),
            "price": round(price, 2),
            "change": round(random.uniform(-5, 5), 2),
            "changePercent": round(random.uniform(-3, 3), 2),
            "description": f"{symbol.upper()} Corp."
        }

    try:
        quote_url = f"{FINNHUB_BASE_URL}/quote"
        params = {"symbol": symbol.upper(), "token": FINNHUB_API_KEY}
        quote_res = requests.get(quote_url, params=params).json()

        profile_url = f"{FINNHUB_BASE_URL}/stock/profile2"
        params_profile = {"symbol": symbol.upper(), "token": FINNHUB_API_KEY}
        profile_res = requests.get(profile_url, params=params_profile).json()

        if quote_res.get('c') == 0:
            raise HTTPException(status_code=404, detail="Symbol not found")

        return {
            "symbol": symbol.upper(),
            "price": quote_res['c'],
            "change": quote_res['d'],
            "changePercent": quote_res['dp'],
            "description": profile_res.get('name', f"{symbol.upper()} Corp"),
            "logo": profile_res.get('logo')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/portfolio")
async def get_portfolio(email: str):
    user = await users_col.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    total_market_value = 0
    holdings = []

    portfolio = user.get("portfolio", {})
    for symbol, data in portfolio.items():
        qty = data['qty']
        avg_price = data['avg_price']
        holdings.append({
            "ticker": symbol,
            "qty": qty,
            "purchasePrice": avg_price,
            "currentPrice": avg_price 
        })
        total_market_value += (qty * avg_price)

    return {
        "cash": round(user.get("cash", 0), 2),
        "portfolioValue": round(total_market_value, 2),
        "totalAccountValue": round(user.get("cash", 0) + total_market_value, 2),
        "holdings": holdings
    }

@app.get("/api/user/trades")
async def get_trades(email: str):
    cursor = trades_col.find({"user_email": email}).sort("timestamp", -1)
    trades = await cursor.to_list(length=100)
    for t in trades:
        t["_id"] = str(t["_id"])
        if isinstance(t["timestamp"], datetime):
            t["timestamp"] = t["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
    return trades

@app.get("/api/user/portfolio/history")
async def get_portfolio_history(email: str):
    cursor = portfolio_history_col.find({"user_email": email}).sort("timestamp", 1)
    history = await cursor.to_list(length=100)

    formatted = []
    for h in history:
        formatted.append({
            "time": h["timestamp"].strftime("%m/%d"),
            "value": h["total_value"]
        })

    if not formatted:
        user = await users_col.find_one({"email": email})
        cash = user.get("cash", 100000.0) if user else 100000.0
        formatted = [
            {"time": "04/21", "value": cash - 500},
            {"time": "04/22", "value": cash - 200},
            {"time": "04/23", "value": cash + 300},
            {"time": "04/24", "value": cash + 100},
            {"time": "04/25", "value": cash + 400},
            {"time": "04/26", "value": cash + 200},
            {"time": "Today", "value": cash}
        ]
    return formatted

@app.post("/api/trade/buy")
async def buy_stock(order: OrderRequest):
    user = await users_col.find_one({"email": order.user_email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    total_cost = order.quantity * order.price
    if total_cost > user["cash"]:
        raise HTTPException(status_code=400, detail="Insufficient funds")

    new_cash = user["cash"] - total_cost
    portfolio = user.get("portfolio", {})

    if order.symbol in portfolio:
        existing = portfolio[order.symbol]
        new_qty = existing['qty'] + order.quantity
        new_avg = ((existing['qty'] * existing['avg_price']) + total_cost) / new_qty
        portfolio[order.symbol] = {"qty": new_qty, "avg_price": round(new_avg, 2)}
    else:
        portfolio[order.symbol] = {"qty": order.quantity, "avg_price": order.price}

    await users_col.update_one(
        {"email": order.user_email},
        {"$set": {"cash": new_cash, "portfolio": portfolio}}
    )

    trade_doc = {
        "user_email": order.user_email,
        "symbol": order.symbol,
        "quantity": order.quantity,
        "price": order.price,
        "type": "BUY",
        "status": "FILLED",
        "total": round(total_cost, 2),
        "timestamp": datetime.utcnow()
    }
    await trades_col.insert_one(trade_doc)
    await record_portfolio_snapshot(order.user_email)

    return {"message": f"Successfully bought {order.quantity} shares of {order.symbol}", "cash": new_cash}

@app.post("/api/trade/sell")
async def sell_stock(order: OrderRequest):
    user = await users_col.find_one({"email": order.user_email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    portfolio = user.get("portfolio", {})
    if order.symbol not in portfolio or portfolio[order.symbol]['qty'] < order.quantity:
        raise HTTPException(status_code=400, detail="Insufficient shares")

    total_credit = order.quantity * order.price
    new_cash = user["cash"] + total_credit

    portfolio[order.symbol]['qty'] -= order.quantity
    if portfolio[order.symbol]['qty'] == 0:
        del portfolio[order.symbol]

    await users_col.update_one(
        {"email": order.user_email},
        {"$set": {"cash": new_cash, "portfolio": portfolio}}
    )

    trade_doc = {
        "user_email": order.user_email,
        "symbol": order.symbol,
        "quantity": order.quantity,
        "price": order.price,
        "type": "SELL",
        "status": "FILLED",
        "total": round(total_credit, 2),
        "timestamp": datetime.utcnow()
    }
    await trades_col.insert_one(trade_doc)
    await record_portfolio_snapshot(order.user_email)

    return {"message": f"Successfully sold {order.quantity} shares of {order.symbol}", "cash": new_cash}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)