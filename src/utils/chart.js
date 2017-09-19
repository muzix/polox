function chart(d3, techan, jsonArray, marketName) {
  var margin = {top: 20, right: 80, bottom: 30, left: 5},
      width = 960 - margin.left - margin.right,
      height = 250 - margin.top - margin.bottom;

  var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S");

  var x = techan.scale.financetime()
    .range([0, width]);

  var y = d3.scaleLinear()
    .range([height, 0]);

  var candlestick = techan.plot.candlestick()
    .xScale(x)
    .yScale(y);

  var accessor = candlestick.accessor();

  var xAxis = d3.axisBottom(x);

  var yAxis = d3.axisRight(y);

  var closeAnnotation = techan.plot.axisannotation()
            .axis(yAxis)
            .orient('right')
            .accessor(candlestick.accessor())
            .format(d3.format(',.8f'))
            .translate([x(1), 0]);

  var data = jsonArray.map(function (d) {
    return {
      date: parseDate(d.T),
      open: +d.O,
      high: +d.H,
      low: +d.L,
      close: +d.C,
      volume: +d.V
    };
  }).sort(function (a, b) {
    return d3.ascending(a.date, b.date);
  });

  return function(g) {
    var svg = g.append("svg")
        .attr("version", "1.1")
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append('text')
            .attr("class", "symbol")
            .attr("x", 20)
            .text(marketName.toUpperCase());

    x.domain(data.map(accessor.d));
    y.domain(techan.scale.plot.ohlc(data, accessor).domain());

    injectCss(svg);

    svg.append("g")
      .datum(data)
      .attr("class", "candlestick")
      .call(candlestick);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width + ",0)")
        .call(yAxis)
        .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -12)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .style("fill", "#000")
            .text(marketName.split('-')[0].toUpperCase());

    svg.append("g")
            .attr("class", "close annotation up")
            .datum([data[data.length-1]]).call(closeAnnotation);
  }
}

function advanceChart(d3, techan, jsonArray, marketName) {
  var dim = {
      width: 960, height: 500,
      margin: { top: 20, right: 80, bottom: 30, left: 80 },
      ohlc: { height: 305 },
      indicator: { height: 65, padding: 5 }
    };
    dim.plot = {
      width: dim.width - dim.margin.left - dim.margin.right,
      height: dim.height - dim.margin.top - dim.margin.bottom
    };
    dim.indicator.top = dim.ohlc.height+dim.indicator.padding;
    dim.indicator.bottom = dim.indicator.top+dim.indicator.height+dim.indicator.padding;

  var indicatorTop = d3.scaleLinear()
            .range([dim.indicator.top, dim.indicator.bottom]);

  // var margin = {top: 20, right: 20, bottom: 30, left: 50},
  //     width = 960 - margin.left - margin.right,
  //     height = 250 - margin.top - margin.bottom;

  var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S");

  var x = techan.scale.financetime()
            .range([0, dim.plot.width]);

  var y = d3.scaleLinear()
            .range([dim.ohlc.height, 0]);

  var candlestick = techan.plot.candlestick()
    .xScale(x)
    .yScale(y);

  var yPercent = y.copy();   // Same as y at this stage, will get a different domain later

  var percentAxis = d3.axisLeft(yPercent)
            .tickFormat(d3.format('+.1%'));

  var yInit, yPercentInit, zoomableInit;

  var yVolume = d3.scaleLinear()
          .range([y(0), y(0.2)]);

  var accessor = candlestick.accessor();

  var volume = techan.plot.volume()
            .accessor(candlestick.accessor())   // Set the accessor to a ohlc accessor so we get highlighted bars
            .xScale(x)
            .yScale(yVolume);

  var volumeAxis = d3.axisRight(yVolume)
            .ticks(3)
            .tickFormat(d3.format(",.3s"));

  var xAxis = d3.axisBottom(x);

  var yAxis = d3.axisRight(y);

  var macdScale = d3.scaleLinear()
            .range([indicatorTop(0)+dim.indicator.height, indicatorTop(0)]);

  var macd = techan.plot.macd()
            .xScale(x)
            .yScale(macdScale);

  var macdAxis = d3.axisRight(macdScale)
            .ticks(3);
            // .tickFormat(d3.format(",.3s"));

  var macdAxisLeft = d3.axisLeft(macdScale)
            .ticks(3);

  var rsiScale = macdScale.copy()
            .range([indicatorTop(1)+dim.indicator.height, indicatorTop(1)]);

  var rsi = techan.plot.rsi()
            .xScale(x)
            .yScale(rsiScale);

  var rsiAxis = d3.axisRight(rsiScale)
            .ticks(3);

  var rsiAxisLeft = d3.axisLeft(rsiScale)
            .ticks(3);

  var sma0 = techan.plot.sma()
          .xScale(x)
          .yScale(y);

  var sma1 = techan.plot.sma()
          .xScale(x)
          .yScale(y);

  var ema2 = techan.plot.ema()
          .xScale(x)
          .yScale(y);

  var closeAnnotation = techan.plot.axisannotation()
            .axis(yAxis)
            .orient('right')
            .accessor(candlestick.accessor())
            .format(d3.format(',.8f'))
            .translate([x(1), 0]);

  var rsiCloseAnnotation = techan.plot.axisannotation()
            .axis(rsiAxis)
            .orient('right')
            .accessor(rsi.accessor())
            .format(d3.format(',.2f'))
            .translate([x(1), 0]);

  var accessor = candlestick.accessor(),
      indicatorPreRoll = 33;  // Don't show where indicators don't have data

  var data = jsonArray.map(function (d) {
    return {
      date: parseDate(d.T),
      open: +d.O,
      high: +d.H,
      low: +d.L,
      close: +d.C,
      volume: +d.V
    };
  }).sort(function (a, b) {
    return d3.ascending(accessor.d(a), accessor.d(b));
  });

  // x.domain(techan.scale.plot.time(data).domain());
  // y.domain(techan.scale.plot.ohlc(data.slice(indicatorPreRoll)).domain());

  return function(g) {
    x.domain(data.map(accessor.d));
    y.domain(techan.scale.plot.ohlc(data, accessor).domain());
    yPercent.domain(techan.scale.plot.percent(y, accessor(data[indicatorPreRoll])).domain());
    yVolume.domain(techan.scale.plot.volume(data).domain());

    var svg = g.append("svg")
        .attr("version", "1.1")
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("width", dim.width)
        .attr("height", dim.height);

    injectCss(svg);

    var defs = svg.append("defs");

    defs.append("clipPath")
            .attr("id", "ohlcClip")
        .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", dim.plot.width)
            .attr("height", dim.ohlc.height);

    defs.selectAll("indicatorClip").data([0, 1])
        .enter()
            .append("clipPath")
            .attr("id", function(d, i) { return "indicatorClip-" + i; })
        .append("rect")
            .attr("x", 0)
            .attr("y", function(d, i) { return indicatorTop(i); })
            .attr("width", dim.plot.width)
            .attr("height", dim.indicator.height);

    svg = svg.append("g")
            .attr("transform", "translate(" + dim.margin.left + "," + dim.margin.top + ")");

    svg.append('text')
            .attr("class", "symbol")
            .attr("x", 20)
            .text(marketName.toUpperCase());

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + dim.plot.height + ")");
      // .call(xAxis);

    var ohlcSelection = svg.append("g")
            .attr("class", "ohlc")
            .attr("transform", "translate(0,0)");

    ohlcSelection.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + dim.plot.width + ",0)")
            .call(yAxis)
        .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -12)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .style("fill", "#000")
            .text(marketName.split('-')[0].toUpperCase());

    ohlcSelection.append("g")
            .attr("class", "close annotation up")
            .datum([data[data.length-1]]).call(closeAnnotation);

    ohlcSelection.append("g")
            .attr("class", "volume")
            .attr("clip-path", "url(#ohlcClip)");

    ohlcSelection.append("g")
            .attr("class", "candlestick")
            .attr("clip-path", "url(#ohlcClip)");

    ohlcSelection.append("g")
            .attr("class", "indicator sma ma-0")
            .attr("clip-path", "url(#ohlcClip)");

    ohlcSelection.append("g")
            .attr("class", "indicator sma ma-1")
            .attr("clip-path", "url(#ohlcClip)");

    ohlcSelection.append("g")
            .attr("class", "indicator ema ma-2")
            .attr("clip-path", "url(#ohlcClip)");

    ohlcSelection.append("g")
            .attr("class", "percent axis");

    ohlcSelection.append("g")
            .attr("class", "volume axis");

    svg.select("g.candlestick").datum(data).call(candlestick);
    svg.select("g.volume").datum(data).call(volume);

    svg.select("g.x.axis").call(xAxis);
    // svg.select("g.ohlc .axis").call(yAxis);
    svg.select("g.volume.axis").call(volumeAxis);
    svg.select("g.percent.axis").call(percentAxis);

    svg.select("g.sma.ma-0").datum(techan.indicator.sma().period(10)(data)).call(sma0);
    svg.select("g.sma.ma-1").datum(techan.indicator.sma().period(20)(data)).call(sma1);
    svg.select("g.ema.ma-2").datum(techan.indicator.ema().period(50)(data)).call(ema2);

    // svg.append("g")
    //   .datum(data)
    //   .attr("class", "candlestick")
    //   .call(candlestick);

    // svg.append("g")
    //     .attr("class", "y axis")
    //     .call(yAxis)
    //   .append("text")
    //     .attr("transform", "rotate(-90)")
    //     .attr("y", 6)
    //     .attr("dy", ".71em")
    //     .style("text-anchor", "end")
    //     .style("fill", "#000")
    //     .text("Price ($)");

    var indicatorSelection = svg.selectAll("svg > g.indicator").data(["macd"]).enter()
             .append("g")
                .attr("class", function(d) { return d + " indicator"; });

    var macdData = techan.indicator.macd()(data);
        macdScale.domain(techan.scale.plot.macd(macdData).domain());

    indicatorSelection.append("g")
            .attr("class", "indicator-plot")
            .attr("clip-path", function(d, i) { return "url(#indicatorClip-" + i + ")"; })
            .datum(macdData)
            .call(macd);

    indicatorSelection.append("g")
            .attr("class", "axis right")
            .attr("transform", "translate(" + dim.plot.width + ",0)")
            .call(macdAxis);

    indicatorSelection.append("g")
            .attr("class", "axis left")
            .attr("transform", "translate(" + 0 + ",0)")
            .call(macdAxisLeft)
    // svg.select("g.macd .axis.right").call(macdAxis);

    indicatorSelection = svg.selectAll("svg > g.indicator").data(["rsi"]).enter()
             .append("g")
                .attr("class", function(d) { return d + " indicator"; });

    var rsiData = techan.indicator.rsi()(data);
        rsiScale.domain(techan.scale.plot.rsi(rsiData).domain());

    indicatorSelection.append("g")
            .attr("class", "indicator-plot")
            // .attr("clip-path", function(d, i) { return "url(#indicatorClip-" + i + ")"; })
            .datum(rsiData)
            .call(rsi)

    indicatorSelection.append("g")
            .attr("class", "axis right")
            .attr("transform", "translate(" + dim.plot.width + ",0)")
            .call(rsiAxis);

    indicatorSelection.append("g")
            .attr("class", "rsi close annotation up")
            .datum([rsiData[rsiData.length-1]]).call(rsiCloseAnnotation);

    indicatorSelection.append("g")
            .attr("class", "axis left")
            .attr("transform", "translate(" + 0 + ",0)")
            .call(rsiAxisLeft)

  }
}

function injectCss(svg) {
  var cssText = `svg {
        font: 10px sans-serif;
        background-color: #fff;
    }

    body {
        font: 10px sans-serif;
    }

    text {
        fill: #000;
    }

    text.symbol {
        fill: #BBBBBB;
    }

    path {
        fill: none;
        stroke-width: 1;
    }

    path.candle {
        stroke: #000000;
    }

    path.candle.body {
        stroke-width: 0;
    }

    path.candle.up {
        fill: #00AA00;
        stroke: #00AA00;
    }

    path.candle.down {
        fill: #FF0000;
        stroke: #FF0000;
    }

    .close.annotation.up path {
        fill: #00AA00;
    }

    path.volume {
        fill: #DDDDDD;
    }

    .indicator-plot path.line {
        fill: none;
        stroke-width: 1;
    }

    .ma-0 path.line {
        stroke: #1f77b4;
    }

    .ma-1 path.line {
        stroke: #aec7e8;
    }

    .ma-2 path.line {
        stroke: #ff7f0e;
    }

    button {
        position: absolute;
        right: 110px;
        top: 25px;
    }

    path.macd {
        stroke: #0000AA;
    }

    path.signal {
        stroke: #FF9999;
    }

    path.zero {
        stroke: #BBBBBB;
        stroke-dasharray: 0;
        stroke-opacity: 0.5;
    }

    path.difference {
        fill: #BBBBBB;
        opacity: 0.5;
    }

    path.rsi {
        stroke: #000000;
    }

    path.overbought, path.oversold {
        stroke: #FF9999;
        stroke-dasharray: 5, 5;
    }

    path.middle, path.zero {
        stroke: #BBBBBB;
        stroke-dasharray: 5, 5;
    }

    .analysis path, .analysis circle {
        stroke: blue;
        stroke-width: 0.8;
    }

    .trendline circle {
        stroke-width: 0;
        display: none;
    }

    .mouseover .trendline path {
        stroke-width: 1.2;
    }

    .mouseover .trendline circle {
        stroke-width: 1;
        display: inline;
    }

    .dragging .trendline path, .dragging .trendline circle {
        stroke: darkblue;
    }

    .interaction path, .interaction circle {
        pointer-events: all;
    }

    .interaction .body {
        cursor: move;
    }

    .trendlines .interaction .start, .trendlines .interaction .end {
        cursor: nwse-resize;
    }

    .supstance path {
        stroke-dasharray: 2, 2;
    }

    .supstances .interaction path {
        pointer-events: all;
        cursor: ns-resize;
    }

    .mouseover .supstance path {
        stroke-width: 1.5;
    }

    .dragging .supstance path {
        stroke: darkblue;
    }

    .crosshair {
        cursor: crosshair;
    }

    .crosshair path.wire {
        stroke: #DDDDDD;
        stroke-dasharray: 1, 1;
    }

    .crosshair .axisannotation path {
        fill: #DDDDDD;
    }

    .tradearrow path.tradearrow {
        stroke: none;
    }

    .tradearrow path.buy {
        fill: #0000FF;
    }

    .tradearrow path.sell {
        fill: #9900FF;
    }

    .tradearrow path.highlight {
        fill: none;
        stroke-width: 2;
    }

    .tradearrow path.highlight.buy {
        stroke: #0000FF;
    }

    .tradearrow path.highlight.sell {
        stroke: #9900FF;
    }
    `;
    svg.append("style").text(cssText)
}

// If we're in node
if(typeof module === 'object') {
  // Expose the chart
  module.exports = {
    chart,
    advanceChart
  };
}
