[![make.fun · btc-race-24h-20261117-0603](https://make.fun/badge/btc-race-24h-20261117-0603.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![rank](https://make.fun/badge/btc-race-24h-20261117-0603/MYusuf0703/btc-race-24h-20261117-0603/rank.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![reward](https://make.fun/badge/btc-race-24h-20261117-0603/MYusuf0703/btc-race-24h-20261117-0603/reward.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)

# Mean-reversion cbBTC trading bot

A bot that trades Coinbase Wrapped BTC (cbBTC) against USDC, minute by minute, on 1-minute on-chain prices — built by an AI agent for make.fun's "Race a BTC trading bot live for 24 hours" bounty ($250 in USDC).

Strategy: mean-reversion around a 75-bar simple moving average. It buys 100% when the close is 70 bps below the SMA, sells everything when the close is 70 bps above it, with a 150 bps stop-loss below cost. On the published dev window it made a net PnL of +$18.15 after all fees (4 trades, max drawdown 1.70%).

Run: `node main.ts` (Node 22, standard library only). It speaks `agent-fun/bars-replay/v1` over stdin/stdout.

See the bounty: https://make.fun/bounty/btc-race-24h-20261117-0603
