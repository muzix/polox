[![Codeship Status for muzix/polox](https://app.codeship.com/projects/ddee42b0-7166-0135-25d4-0a9c8bd2473c/status?branch=develop)](https://app.codeship.com/projects/243378)

## Roadmap & Command List

### 1. Account management
- [x] !register --exchange <BITTREX|POLONIEX> --key "apikey" --secret "apisecret": Register api-key for trading command
- [x] !account: Show all registered exchange accounts with api key information.
- [x] !setting set activeExchange <BITTREX|POLONIEX>: Tell bot which exchange will be used for all trading command
- [x] !setting show: Show all user's settings

### 2. Public information
- [x] !markets: Show Bittrex markets sorted by 24h Volume
- [x] !ticker \<market\>: Show Bid/Ask of specified coin
- [ ] !sharekeo --market \<market\> --enter \<enterRate\> --profit \<profitRate\> --loss \<lossRate\> --duration \<duration>: Chia sẻ kèo với Trader, gồm thông tin coin, giá enter, giá exit, thời gian hiệu lực của kèo.
- [ ] !showkeo: Danh sách kèo
- [ ] !theokeo \<keoid\> \<btcQuantity\>: Theo kèo với số lượng btc tùy ý

Kèo sẽ được lưu cùng với thông tin user share kèo.

Kèo sẽ được monitoring 24/24 từ lúc tạo kèo cho tới khi hết thời gian hiệu lực của kèo để kiểm tra kèo có chuẩn không. Nếu kèo chuẩn thì cộng 1 điểm `Research`, nếu kèo hụt thì trừ 1 điểm `Research`.

Người theo kèo nếu exit thành công thì cộng 1 điểm `Fame` cho người share kèo. Đồng thời người theo kèo được cộng 1 điểm `Follow`

Kèo sẽ có 2 loại:
- Kèo lướt: Cần tham số market, enter, profit, loss, duration (Mặc định là 24h)
- Kèo ôm: Cần tham số market, enter, profit (Không có cutloss tức là kèo ôm)

### 3. Trading
- [x] !balances: Show all wallet and balances
- [x] !buy --market \<market\> --rate \<rate\> --quantity \<quantity\> --btc \<btcQuantity\>
- [x] !sell --market \<market\> --rate \<rate\> --quantity \<quantity\> --btc \<btcQuantity\>
- [ ] !autobuy --market \<market\> --enter \<enterRate\> --profit \<takeProfitRate\> --loss \<cutLossRate\> --quantity \<quantity\> --btc \<btcQuantity\> : Mua thấp bán cao, ezzz!
- [ ] !autosell --market \<market\> --enter \<enterRate\> --profit \<takeProfitRate\> --loss \<cutLossRate\> --quantity \<quantity\> --btc \<btcQuantity\>: Bán cao mua thấp, ezzz!
- [ ] !automarginbuy --market \<market\> --enter \<enterRate\> --profit \<takeProfitRate\> --loss \<cutLossRate\> --quantity \<quantity\> --btc \<btcQuantity\>: Vào long tự động theo dõi
- [ ] !automarginsell --market \<market\> --enter \<enterRate\> --profit \<takeProfitRate\> --loss \<cutLossRate\> --quantity \<quantity\> --btc \<btcQuantity\>: Vào short tự động theo dõi
- [ ] !marginbuy --market \<market\> --rate \<rate\> --quantity \<quantity\> --btc \<btcQuantity\>: Vào long margin bên Polo
- [ ] !marginsell --market \<market\> --rate \<rate\> --quantity \<quantity\> --btc \<btcQuantity\>: Vào short margin bên Polo
- [ ] !order <command>
  + [ ] !order current: Danh sách Order đang mở.
  + [ ] !order history --limit <limit>: Danh sách Order tất tần tật. Limit default = 10.
  + [ ] !order show <orderId>: Show thông tin chi tiết một Order.
  + [x] !order cancel <orderId>: Cancel một Order.
  + [ ] !order clear: Cancel tất cả Order.
