from ..core.schemas import MarketForecast

def forecast_action(prices: list[float]) -> MarketForecast:
    if len(prices) < 3:
        return MarketForecast(action="HOLD", explanation="Not enough data", prices=prices)
    sma3 = sum(prices[-3:])/3
    last = prices[-1]
    if last > sma3*1.03:
        return MarketForecast(action="SELL 30%", explanation="Price spike", prices=prices)
    return MarketForecast(action="HOLD", explanation="Stable prices", prices=prices)
