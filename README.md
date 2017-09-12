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
- [ ] !sharekeo --market \<market\> --enter \<enterRate\> --exit \<exitRate\> --duration \<duration>: Chia sẻ kèo với Trader, gồm thông tin coin, giá enter, giá exit, thời gian hiệu lực của kèo
- [ ] !showkeo: Danh sách kèo
- [ ] !theokeo \<keoid\> \<btcAmount\>: Theo kèo với số lượng btc tùy ý

Kèo sẽ được lưu cùng với thông tin user share kèo.
Kèo sẽ được monitoring 24/24 từ lúc tạo kèo cho tới khi hết thời gian hiệu lực của kèo để kiểm tra kèo có chuẩn không. Nếu kèo chuẩn thì cộng 1 điểm `Research`, nếu kèo hụt thì trừ 1 điểm `Research`.
Người theo kèo nếu exit thành công thì cộng 1 điểm `Fame` cho người share kèo. Đồng thời người theo kèo được cộng 1 điểm `Follow`

### 3. Trading
- [x] !balances: Show all wallet and balances
- [ ] !buy --market \<market\> --enter \<enterRate\> --profit \<takeProfitRate\> --loss \<cutLossRate\> --btc \<btcAmount\>: Mua thấp bán cao, ezzz!
- [ ] !marginbuyauto --market \<market\> --enter \<enterRate\> --profit \<takeProfitRate\> --loss \<cutLossRate\> --btc \<btcAmount\>: Vào long tự động theo dõi
- [ ] !marginsellauto --market \<market\> --enter \<enterRate\> --profit \<takeProfitRate\> --loss \<cutLossRate\> --btc \<btcAmount\>: Vào short tự động theo dõi
- [ ] !marginbuy --market \<market\> --rate \<rate\> --amount \<amount\>: Vào long margin bên Polo
- [ ] !marginsell --market \<market\> --rate \<rate\> --amount \<amount\>: Vào short margin bên Polo
