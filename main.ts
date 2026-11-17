// cbBTC mean-reversion bot for make.fun btc-race-24h-20261117-0603.
//
// Strategy: mean-reversion around a slow simple moving average, trading only
// on large deviations. The dev window is a choppy, range-bound market (2.5%
// high-low range, 1-minute return std ~6 bps) with a small upward drift, and
// a full round trip costs ~26 bps in fees, slippage and impact, so frequent
// trend-chasing loses money (the EMA-crossover baseline loses $106 on the dev
// window with 68 trades). This bot buys only when the price has dipped 70 bps
// below its 75-bar average and sells only when it has rallied 70 bps above
// it, so it trades rarely (4 trades on the dev window) and each trade catches
// a real swing. A 150 bps stop-loss guards the position against a sharp fall.
//
// Dev-window result (kit grade-local, --driver process): net PnL +$18.15,
// 4 trades, max drawdown 1.70% — comfortably above the dev gate (PnL > $0).
// The result is stable across the plateau SMA 60-90 / band 60-75 bps
// (+$15 to +$19), so it is not tuned to a single lucky parameter.
//
// Deterministic: pure function of closes seen so far; no clock, no randomness,
// no network. Standard library only (plus the kit's SDK shim under vendor/).

import { runBars, type BarsState, type Batch, type OrderInput } from './vendor/makefun-bars.ts';

const SYMBOL = 'CBBTC';
const MAX_SLIPPAGE_BPS = 100; // 1% past the close the order was decided on

const SMA_BARS = 75; // slow SMA lookback (bars)
const BUY_BPS = 70; // buy when close is this many bps BELOW the SMA
const SELL_BPS = 70; // sell when close is this many bps ABOVE the SMA
const STOP_BPS = 150; // stop-loss: sell if position value falls this many bps under cost

const closes: number[] = []; // closes seen so far, oldest first

function sma(n: number): number | null {
  if (closes.length < n) return null;
  let s = 0;
  for (let i = closes.length - n; i < closes.length; i++) s += closes[i];
  return s / n;
}

await runBars({
  onBatch(state: BarsState, batch: Batch): OrderInput[] {
    for (const bar of batch.bars) {
      if (bar.symbol === SYMBOL) closes.push(Number(bar.c));
    }
    if (state.warmingUp) return [];

    const avg = sma(SMA_BARS);
    if (avg === null) return [];
    const last = closes[closes.length - 1];
    const held = state.positions.get(SYMBOL);

    if (held !== undefined) {
      const value = state.value(SYMBOL, held.qty);
      const cost = held.cost;
      const stopHit = value * 10000n < cost * BigInt(10000 - STOP_BPS);
      if (last * 10000 > avg * (10000 + SELL_BPS) || stopHit) {
        return [{ side: 'sell', symbol: SYMBOL, qty: held.qty, max_slippage_bps: MAX_SLIPPAGE_BPS }];
      }
      return [];
    }
    if (last * 10000 < avg * (10000 - BUY_BPS)) {
      const room = state.weightRoom(SYMBOL);
      const amount = state.cash < room ? state.cash : room;
      if (amount >= 1000000n) {
        // at least 1 USDC
        return [{ side: 'buy', symbol: SYMBOL, notional_quote_units: amount, max_slippage_bps: MAX_SLIPPAGE_BPS }];
      }
    }
    return [];
  },
});
