/*************************** VARIABLES **************************/
/*						  										*/
/****************************************************************/
/******************************* VAR ****************************/
var coinName = "";
var coinid = "";
// 0 = FALSE; 1 = TRUE
var isPumped = 0;
var isWatchlisted = false;

var watchlistedIcon = "fas fa-bookmark";
var faveBtnClass = "faveCoinBtn";

var notWatchlistedIcon = "far fa-bookmark";
var unfaveBtnClass = "unfaveCoinBtn";

/****************************** DATA ****************************/
const marketData = [];
const kpiData = [];

/***************************** GRAPH ****************************/
// Y-AXIS
const coinPrice = [];
var moving_average_prices = [];

const volumes = [];
var moving_average_volume = [];

var manipulated_sum = [];
var indicatorCount = 0;

// X-AXIS
const dates = [];

/**************************** OBJECTS ***************************/
const dataType = {
	VOLUME: "volume",
	PRICE: "price",
	MARKET_CAP: "market cap"
}

const colors = {
	lineColor_main: "#75586C",
	lineColor_second: "#FFFFFF",
	gridColor: "#3c3c3c",
	fontColor: "#75586C",
	tickColor: "#626262"
}

/******************* FOR DISPLAYING COIN INFO *******************/
/*						  										*/
/****************************************************************/
/*********************** DISPLAY COIN NAME **********************/

function get_coin_data() {
	
	// DISPLAY THE COIN NAME AS A SUBHEADER
	coinName = getQueryVariable("coinName");
	if (coinName != false) { 
		document.getElementById("coinName").innerHTML = coinName; 
	}

	// GET THE COIN ID
	coinid = getQueryVariable("coinID");
	if (coinid != false) {

		// CHECK IF WACTHLISTED IS SAVE
		if (sessionStorage.getItem('watchlist') == null) {

			get_watchlist();
		} 

		// GET WATCHLISTED
		var list_of_fave = JSON.parse(sessionStorage.getItem('watchlist'));

		// FOREACH WACTHLISTED COIN
		$.each(list_of_fave, function(_, eachCoin) {
			
			if (coinid == eachCoin.coinID) {
				isWatchlisted = true;
				return;
			}
		});

		// SET BUTTON CONFIGURATION
		$(".watchlistBtn").attr('id', coinid);

		// IF COIN IS WATCHLISTED
		if (isWatchlisted) {

			$(".watchlistBtn").addClass(faveBtnClass);
			$("#watchlistedIcon").addClass(watchlistedIcon);
		} else {

			$(".watchlistBtn").addClass(unfaveBtnClass);
			$("#watchlistedIcon").addClass(notWatchlistedIcon);
		}

		get_coininfo();
	}
}

function get_coininfo() {

	// GET MARKET DATA OF THE COIN AND STORE IT IN AN ARRAY
	const mrkdata_request = {
		url: 'https://mkuvib9bgi.execute-api.ap-southeast-2.amazonaws.com/pumped-backend-api/market-data',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		type: "GET",
		dataType: "json",
		data: { coinID: coinid }
	};

	get_coin(mrkdata_request, false, store_coin_marketdata);

	const kpi_request = {
		url: 'https://mkuvib9bgi.execute-api.ap-southeast-2.amazonaws.com/pumped-backend-api/coin',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		type: "GET",
		dataType: "json",
		data: { coinID: coinid }
	};

	get_coin(kpi_request, false, store_coin_kpi);

	create_mrkdata_graph();
	create_volume_graph();
	create_kpi();
	checkIndicatorsPerDay();
	create_indicator_graph();
}

/************************ DISPLAY COIN KPI **********************/
function create_kpi() {

	/* FOR PUMPED KPI */
	// IF isPumped IS TRUE
	if (isPumped == 1) {
		$(".secondSubHeading").show();
	} else {
		$(".secondSubHeading").hide();
	}

	/* FOR EACH KPI */
	$.each(kpiData, function (resIndex, eachData) {

		/***** CREATE KPI CONTAINER *****/
		// CREATE KPI DIV
		var kpi = $("<div></div>");
		kpi.addClass("kpi");
		kpi.attr("id", eachData.title.replace(/\s+/g, ''));

		/***** CREATE KPI ELEMENTS *****/
		// KPI TITLE
		var kpiTitle = $("<p></p>");
		kpiTitle.addClass("kpiTitle");
		// KPI PRICE
		var kpiPrice = $("<p></p>");
		kpiPrice.addClass("kpiPrice");

		// KPI SUBINFO DIV
		var kpiSubinfo = $("<div></div>");
		kpiSubinfo.addClass("kpiSubinfo");

		// KPI PRICE
		var kpiDate = $("<p></p>");
		kpiDate.addClass("kpiDate");
		// KPI PRICE
		var kpiCurrency = $("<p></p>");
		kpiCurrency.addClass("kpiCurrency");

		/***** APPEND KPI ELEMENTS *****/
		kpiSubinfo.append(kpiDate);
		kpiSubinfo.append(kpiCurrency);

		kpi.append(kpiTitle);
		kpi.append(kpiPrice);
		kpi.append(kpiSubinfo);

		/***** CREATE KPIS *****/
		kpiTitle.html(eachData.title);
		kpiPrice.html(eachData.price);
		kpiDate.html(eachData.date);
		kpiCurrency.html(eachData.currency);
		$("#coinKpiContent").append(kpi);
	});
}

/******************** DISPLAY MARKET DATA GRAPH *****************/
function create_mrkdata_graph() {

	/******************** CREATE THE VARIABLES ******************/
	/* GET THE CHART DIV */
	var ctx_mrkdata = $("#marketData");

	/* CREATE DATA FOR THE GRAPH */
	const graphData = {

		// SET X AXIS
		labels: dates,

		// SET Y-AXIS
		datasets: [

			// FOR moving_average_prices
			{
				/******************** STYLING LINE ******************/
				/* COLOURS */
				backgroundColor: colors.lineColor_second,
				borderColor: colors.lineColor_second,
				/* FONTS */

				/* STYLE */
				borderWidth: 1,
				fill: false,
				lineTension: 0,
				pointRadius: 0,

				/* SET THE Y AXIS */
				// DATA
				data: moving_average_prices,
				// LEGEND NAME
				label: "Moving Average Prices"
			},

			// FOR COIN PRICE
			{

				/******************** STYLING LINE ******************/
				/* COLOURS */
				backgroundColor: colors.lineColor_main,
				borderColor: colors.lineColor_main,
				/* FONTS */

				/* STYLE */
				borderWidth: 2.5,
				fill: false,
				lineTension: 0,
				pointRadius: 0,

				/* SET THE Y AXIS */
				// DATA
				data: coinPrice,
				// LEGEND NAME
				label: "Coin Prices"
			}]
	}

	/* CREATE THE CONFIGURATION AND STYLING - FOR OPTION */
	const config = {

		// EXTRA COMPONENTS CONFIGURATION AND STYLE
		plugins: {

			// REMOVE/ADD LEGEND
			legend: { display: true, },

			// TITLE OF THE GRAPH
			title: {

				/* DISPLAY */
				display: true,
				text: "Price History",
				/* COLOURS */
				color: colors.fontColor,
				/* STYLE */
				padding: 50,
				/* FONT */
				font: {
					family: "'Major Mono Display', monospace",
					size: 20
				}
			}
		},

		// AXIS CONFIGURATION AND STYLE
		scales: {

			/* X-AXIS */
			x: {

				// X-AXIS TITLE
				title: {

					/* DISPLAY */
					display: true,
					text: "Price Date",
					/* COLOURS */
					color: colors.fontColor,
					/* STYLE */
					padding: 20,
					/* FONT */
					font: {
						family: "'Cutive Mono', monospace",
						size: 15,
						weight: 500
					}
				},

				// MAKE X AXIS ONLY SHOW THE YEAR
				type: 'time',
				time: {
					unit: 'year'
				},

				// X-AXIS DATA
				ticks: {

					/* COLOURS */
					color: colors.tickColor,
					/* STYLE */
					padding: 10,
					/* FONT */
					font: {
						family: "'Cutive Mono', monospace",
						size: 15,
						weight: 500
					}
				},

				// X-AXIS GRID LINES
				grid: {

					/* COLOURS */
					borderColor: colors.gridColor,
					color: colors.gridColor,
					/* STYLE */
					z: -1
				},
			},

			/* Y-AXIS */
			y: {

				// Y-AXIS TITLE
				title: {

					/* DISPLAY */
					display: true,
					text: "Coin Price",
					/* COLOURS */
					color: colors.fontColor,
					/* STYLE */
					padding: 20,
					/* FONT */
					font: {
						family: "'Cutive Mono', monospace",
						size: 15,
						weight: 500
					}
				},

				// Y-AXIS DATA
				ticks: {

					/* COLOURS */
					color: colors.tickColor,
					/* STYLE */
					padding: 10,
					/* FONT */
					font: {
						family: "'Cutive Mono', monospace",
						size: 15,
						weight: 500
					}
				},

				// Y-AXIS GRID LINES
				grid: {

					/* COLOURS */
					borderColor: colors.gridColor,
					color: colors.gridColor,
					/* STYLE */
					z: -1
				}
			}
		}
	}

	/********************** CREATE THE GRAPH ********************/
	var marketDataGraph = new Chart(ctx_mrkdata, {

		type: "line",
		data: graphData,
		options: config
	});
}

/*********************** DISPLAY VOLUME GRAPH *******************/
function create_volume_graph() {

	/******************** CREATE THE VARIABLES ******************/
	/* GET THE CHART DIV */
	var ctx_mrkdata = $("#volumeData");

	/* CREATE DATA FOR THE GRAPH */
	const graphData = {

		// SET X AXIS
		labels: dates,

		// SET Y-AXIS
		datasets: [

			// FOR moving_average_volume
			{
				/******************** STYLING LINE ******************/
				/* COLOURS */
				backgroundColor: colors.lineColor_second,
				borderColor: colors.lineColor_second,
				/* FONTS */

				/* STYLE */
				borderWidth: 1,
				fill: false,
				lineTension: 0,
				pointRadius: 0,

				/* SET THE Y AXIS */
				// DATA
				data: moving_average_volume,
				// LEGEND NAME
				label: "Moving Average Volume"
			},

			// FOR VOLUME
			{

				/******************** STYLING LINE ******************/
				/* COLOURS */
				backgroundColor: colors.lineColor_main,
				borderColor: colors.lineColor_main,
				/* FONTS */

				/* STYLE */
				borderWidth: 1,
				fill: true,
				lineTension: 0,
				pointRadius: 0,

				/* SET THE Y AXIS */
				// DATA
				data: volumes,
				// LEGEND NAME
				label: "Volume"
			}]
	}

	/* CREATE THE CONFIGURATION AND STYLING - FOR OPTION */
	const config = {
		
		// EXTRA COMPONENTS CONFIGURATION AND STYLE
		plugins: {

			// REMOVE/ADD LEGEND
			legend: { display: true, },

			// TITLE OF THE GRAPH
			title: {

				/* DISPLAY */
				display: true,
				text: "Volume History",
				/* COLOURS */
				color: colors.fontColor,
				/* STYLE */
				padding: 50,
				/* FONT */
				font: {
					family: "'Major Mono Display', monospace",
					size: 20
				}
			}
		},

		// AXIS CONFIGURATION AND STYLE
		scales: {

			/* X-AXIS */
			x: {

				// X-AXIS TITLE
				title: {

					/* DISPLAY */
					display: true,
					text: "Order Date",
					/* COLOURS */
					color: colors.fontColor,
					/* STYLE */
					padding: 20,
					/* FONT */
					font: {
						family: "'Cutive Mono', monospace",
						size: 15,
						weight: 500
					}
				},

				// MAKE X AXIS ONLY SHOW THE YEAR
				type: 'time',
				time: {
					unit: 'year'
				},

				// X-AXIS DATA
				ticks: {

					/* COLOURS */
					color: colors.tickColor,
					/* STYLE */
					padding: 10,
					/* FONT */
					font: {
						family: "'Cutive Mono', monospace",
						size: 15,
						weight: 500
					}
				},

				// X-AXIS GRID LINES
				grid: {
					
					/* COLOURS */
					borderColor: colors.gridColor,
					color: colors.gridColor,
					/* STYLE */
					z: -1
				},
			},

			/* Y-AXIS */
			y: {

				// Y-AXIS TITLE
				title: {

					/* DISPLAY */
					display: true,
					text: "Number of Orders",
					/* COLOURS */
					color: colors.fontColor,
					/* STYLE */
					padding: 20,
					/* FONT */
					font: {
						family: "'Cutive Mono', monospace",
						size: 15,
						weight: 500
					}
				},

				// Y-AXIS DATA
				ticks: {

					/* COLOURS */
					color: colors.tickColor,
					/* STYLE */
					padding: 10,
					/* FONT */
					font: {
						family: "'Cutive Mono', monospace",
						size: 15,
						weight: 500
					}
				},

				// Y-AXIS GRID LINES
				grid: {

					/* COLOURS */
					borderColor: colors.gridColor,
					color: colors.gridColor,
					/* STYLE */
					z: -1
				}
			}
		}
	}

	/********************** CREATE THE GRAPH ********************/
	var marketDataGraph = new Chart(ctx_mrkdata, {

		type: "line",
		data: graphData,
		options: config
	});
}

/*********************** DISPLAY INDICATOR GRAPH *******************/
function create_indicator_graph() {

	/******************** CREATE THE VARIABLES ******************/
	var yearUnit = 'year';
	var startDate = dates[0];
	var endDate = dates[dates.length-1];
	console.log(startDate);
	console.log(endDate);
	var timeDiff = (endDate - startDate);
	console.log(timeDiff);
	var timeYear = timeDiff / 31556926;
	console.log(timeYear);
	var remYear = timeDiff % 31556926;
	console.log(remYear);


	/* GET THE CHART DIV */
	var ctx_mrkdata = $("#indicatorData");

	/* CREATE DATA FOR THE GRAPH */
	const graphData = {

		// SET X-AXIS
		labels: dates,

		// SET Y-AXIS
		datasets: [

			// FOR MANIPULATED SUM
			{
				/******************** STYLING LINE ******************/
				/* COLOURS */
				backgroundColor: colors.lineColor_main,
				borderColor: colors.lineColor_main,
				/* FONTS */

				/* STYLE */
				borderWidth: 2.5,
				fill: false,
				lineTension: 0,
				pointRadius: 0,

				/* SET THE Y AXIS */
				// DATA
				data: manipulated_sum
			}]
	}

	/* CREATE THE CONFIGURATION AND STYLING - FOR OPTION */
	const config = {

		// EXTRA COMPONENTS CONFIGURATION AND STYLE
		plugins: {

			// REMOVE/ADD LEGEND
			legend: { display: false, },

			// TITLE OF THE GRAPH
			title: {

				/* DISPLAY */
				display: true,
				text: "Manipulation Indicator",
				/* COLOURS */
				color: colors.fontColor,
				/* STYLE */
				padding: 50,
				/* FONT */
				font: {
					family: "'Major Mono Display', monospace",
					size: 20
				}
			}
		},

		// AXIS CONFIGURATION AND STYLE
		scales: {

			/* X-AXIS */
			x: {

				// X-AXIS TITLE
				title: {

					/* DISPLAY */
					display: true,
					text: "Date",
					/* COLOURS */
					color: colors.fontColor,
					/* STYLE */
					padding: 20,
					/* FONT */
					font: {
						family: "'Cutive Mono', monospace",
						size: 15,
						weight: 500
					}
				},

				// MAKE X AXIS ONLY SHOW THE YEAR
				type: 'time',
				time: {
					unit: yearUnit
				},

				// X-AXIS DATA
				ticks: {

					/* COLOURS */
					color: colors.tickColor,
					/* STYLE */
					padding: 10,
					/* FONT */
					font: {
						family: "'Cutive Mono', monospace",
						size: 15,
						weight: 500
					},
					source: 'auto'
				},

				// X-AXIS GRID LINES
				grid: {

					/* COLOURS */
					borderColor: colors.gridColor,
					color: colors.gridColor,
					/* STYLE */
					z: -1
				},
			},

			/* Y-AXIS */
			y: {

				// Y-AXIS TITLE
				title: {

					/* DISPLAY */
					display: true,
					text: "Manipulation Severity",
					/* COLOURS */
					color: colors.fontColor,
					/* STYLE */
					padding: 20,
					/* FONT */
					font: {
						family: "'Cutive Mono', monospace",
						size: 15,
						weight: 500
					}
				},

				max: indicatorCount,

				// Y-AXIS DATA
				ticks: {

					/* COLOURS */
					color: colors.tickColor,
					/* STYLE */
					padding: 10,
					/* FONT */
					font: {
						family: "'Cutive Mono', monospace",
						size: 15,
						weight: 500
					},

					callback: function(indicatorValue) {

						var yData = [];
						if ((indicatorValue%1) == 0) { yData.push(indicatorValue); }
						return yData;
					}
				},

				// Y-AXIS GRID LINES
				grid: {

					/* COLOURS */
					borderColor: colors.gridColor,
					color: colors.gridColor,
					/* STYLE */
					z: -1
				}
			}
		}
	}

	/********************** CREATE THE GRAPH ********************/
	var marketDataGraph = new Chart(ctx_mrkdata, {

		type: "line",
		data: graphData,
		options: config
	});
}

/**************************** Indicators ************************/
/*						  										*/
/****************************************************************/
function simple_moving_average(datatype, range) {

	let moving_average = [];

	// FOR EACH MARKET DATA
	for (let i = 0; i < marketData.length; i++) {
		if (i < range - 1) {
			let sum = 0;
			for (let j = 0; j <= i; j++) {

				if (datatype == dataType.PRICE) { 
					sum += parseFloat(marketData[j].amount); 
				}
				else if (datatype == dataType.VOLUME) { 
					sum += parseFloat(marketData[j].volume); 
				}
			}

			moving_average[i] = sum / (i + 1);
		}
		else {

			let sum = 0;
			for (let j = i - range + 1; j <= i; j++) {

				if (datatype == dataType.PRICE) { sum += parseFloat(marketData[j].amount); }
				else if (datatype == dataType.VOLUME) { sum += parseFloat(marketData[j].volume); }
			}

			moving_average[i] = sum / range;
		}
	}

	return moving_average;
}


function checkIndicatorsPerDay() {
	var moving_avg_price_50 = simple_moving_average(dataType.PRICE, 50);
	var moving_avg_vol_50 = simple_moving_average(dataType.VOLUME, 50);
	var moving_avg_price_100 = simple_moving_average(dataType.PRICE, 100);
	var moving_avg_vol_100 = simple_moving_average(dataType.VOLUME, 100);
	indicatorCount = 9;

	let indicator_sum = 0;

	// Threshold Price
	const threshold_price = 25;

	// Threshold Volume
	const threshold_volume = 50;


	// Threshold for price Drop in Stop Loss Hunt
	const thresholdPriceDrop = -15;

	// Threshold for price increase in Stop Loss Hunt
	const thresholdPriceIncrease = 10;

	//Price change for stop loss hunt
	let priceChange;
	
	// Check indicators per day
	for (let i = 0; i < marketData.length; i++) {

		indicator_sum = 0;

		//Check against 25 day moving average for a large movement
		//Check against 25 day moving average price.
		var price_25_change = checkPricePercentChange(coinPrice[i], moving_average_prices[i]);
		indicator_sum += checkPercentChange(price_25_change, threshold_price);

		//Check against 25 day moving average volume.
		var volume_25_change = checkVolumePercentChange(volumes[i], moving_average_volume[i]);
		indicator_sum += checkPercentChange(volume_25_change, threshold_volume);

		//Check against 50 day moving average
		//Price 50 day average check.
		var price_50_change = checkPricePercentChange(coinPrice[i], moving_avg_price_50[i]);
		indicator_sum += checkPercentChange(price_50_change, 75);

		//Volume 50 day average check
		var volume_50_change = checkVolumePercentChange(volumes[i], moving_avg_vol_50[i])
		indicator_sum += checkPercentChange(volume_50_change, 100);

		//Check against 100 day moving average
		//Price 100 day average check
		var price_100_change = checkPricePercentChange(coinPrice[i], moving_avg_price_100[i]);
		indicator_sum += checkPercentChange(price_100_change, 100);

		//Volume 100 day avearge check
		var volume_100_change = checkVolumePercentChange(volumes[i], moving_avg_vol_100[i]);
		indicator_sum += checkPercentChange(volume_100_change, 125)

		
		//Raw percentage price change
		if (i + 1 < marketData.length) {
			var raw_price_change = checkPricePercentChange(coinPrice[i + 1], coinPrice[i])
			indicator_sum += checkPercentChange(raw_price_change, 20)
		}

		//Raw percentage volume change
		if (i + 1 < marketData.length) {
			var raw_vol_change = checkPricePercentChange(volumes[i + 1], volumes[i])
			indicator_sum += checkPercentChange(raw_vol_change, 30)
		}

		//Check stop loss hunt
		if ((i + 2 < marketData.length)) {

			priceChange = checkPricePercentChange(coinPrice[i + 1], coinPrice[i]);

			if (priceChange <= thresholdPriceDrop && checkPricePercentChange(coinPrice[i + 2], coinPrice[i + 1]) >= thresholdPriceIncrease) {
				indicator_sum++;

			}
		}

		manipulated_sum[i] = indicator_sum;
	}
}

//Checks if a percent change has moved in any direction above the threshold.
function checkPercentChange(percentChange, threshold){
	if (Math.abs(percentChange) >= threshold){
		return 1;
	}
	else {
		return 0;
	}
}

function checkPricePercentChange(price, moving_average) {

	//Checking each of hte indicators
	current_price = parseFloat(price);
	current_ma_price = parseFloat(moving_average);

	let difference = current_price - current_ma_price;
	let price_percentage = (difference / current_ma_price) * 100;

	return price_percentage;
}

function checkVolumePercentChange(volume, moving_average) {

	//Checking each of hte indicators
	current_volume = parseFloat(volume);
	current_ma_volume = parseFloat(moving_average);

	let difference = current_volume - current_ma_volume;
	let volume_percentage = (difference / current_ma_volume) * 100;

	return volume_percentage;

}


/**************************** FUNCTIONS *************************/
/*						  										*/
/****************************************************************/
// GET DATA FROM WINDOW.LOCATION
function getQueryVariable(variable) {

	// GET ALL THE DATA IN THE WINDOW.LOCATION
	var query = window.location.search.substring(1);
	var variables = query.split("&");

	// CHECK IF ITS THE VARIABLE
	for (var i = 0; i < variables.length; i++) {

		var pair = variables[i].split("=");

		if (pair[0] == variable) { return decodeURI(pair[1]); }
	}

	return false;
}

function store_coin_marketdata(response) {

	// FOR EACH MARKET DATA
	$.each(response, function (resIndex, eachData) {
		let data = {

			amount: eachData.dollar_price + "." + eachData.cent_price,
			date: new Date(eachData.data_date),
			marketCap: eachData.marketcap,
			volume: eachData.volume
		};

		marketData.push(data);
	});

	/******************** CREATE THE VARIABLES ******************/
	// SORT THE MARKET DATA BY DATE
	marketData.sort((a, b) => {
		return a.date - b.date;
	});

	// GET ALL THE VALUE FOR X AND Y AXIS
	$.each(marketData, function (resIndex, eachData) {

		dates.push(eachData.date);
		coinPrice.push(eachData.amount);
		volumes.push(eachData.volume);
	});

	// PROCESS INDICATORS
	moving_average_prices = simple_moving_average(dataType.PRICE, 25);
	moving_average_volume = simple_moving_average(dataType.VOLUME, 25);
}

function store_coin_kpi(response) {

	/************************** PUMPED KPI **********************/
	if (response[0].pumped != null) {
		isPumped = response[0].pumped;
	}

	/********************** ALL TIME HIGH KPI *******************/
	// GET VARIABLES
	var dollar = "0";
	var cent = "0";
	var date = "";
	var coinCurrency = "";

	// DATES
	var coinDate= "";
	var day = "";
	var month = "";
	var year = "";

	if (response[0].all_time_high_dollar != null) {
		dollar = response[0].all_time_high_dollar;
	}

	if (response[0].all_time_high_cent != null) {
		var pos = 0;
		for (var i = 0; i < response[0].all_time_high_cent.length; i++){
			if (response[0].all_time_high_cent.charAt(i) != "0"){
				if (i < 3){
					pos = 3;
					break;
				}else{
					pos = i + 1;
					break;
				}
			}
		}
		cent = response[0].all_time_high_cent.substring(0, pos);
	}

	if (response[0].all_time_high_date != null) {
		coinDate = new Date(response[0].all_time_high_date);
		day = coinDate.getUTCDate();
		month = get_month(coinDate.getUTCMonth());
		year = coinDate.getUTCFullYear();

		date = day + " " + month + " " + year;
	}

	if (response[0].all_time_high_currency != null) {
		coinCurrency = response[0].all_time_high_currency.toUpperCase();
	}

	// CREATE ALL-TIME-HIGH KPI ELEMENTS
	let alltime_data = {

		title: "All-Time High",
		price: "$" + dollar + "." + cent,
		date: date,
		currency: coinCurrency
	}

	/************************ YEAR HIGH KPI *********************/
	// GET VARIABLES
	var dollar = "0";
	var cent = "0";
	var date = "";
	var coinCurrency = "";

	// DATES
	var coinDate= "";
	var day = "";
	var month = "";
	var year = "";

	if (response[0].year_high_dollar != null) {
		dollar = response[0].year_high_dollar;
	}

	if (response[0].year_high_cent != null) {
		var pos = 0;
		for (var i = 0; i < response[0].year_high_cent.length; i++){
			if (response[0].year_high_cent.charAt(i) != "0"){
				if (i < 3){
					pos = 3;
					break;
				}else{
					pos = i + 1;
					break;
				}
			}
		}

		cent = response[0].year_high_cent.substring(0, pos);
	}

	if (response[0].year_high_date != null) {
		coinDate = new Date(response[0].year_high_date);
		day = coinDate.getUTCDate();
		month = get_month(coinDate.getUTCMonth());
		year = coinDate.getUTCFullYear();

		date = day + " " + month + " " + year;
	}

	if (response[0].year_high_currency != null) {
		coinCurrency = response[0].year_high_currency.toUpperCase();
	}

	// CREATE YEAR-HIGH KPI ELEMENTS
	let yeartime_data = {

		title: "Year High",
		price: "$" + dollar + "." + cent,
		date: date,
		currency: coinCurrency
	}

	/********************** CURRENT PRICE KPI *******************/
	// GET VARIABLES
	var dollar = "0";
	var cent = "0";
	var date = "";
	var coinCurrency = "";

	// DATES
	var coinDate= "";
	var day = "";
	var month = "";
	var year = "";

	if (response[0].current_price_dollar != null) {
		dollar = response[0].current_price_dollar;
	}

	if (response[0].current_price_cent != null) {
		var pos = 0;
		for (var i = 0; i < response[0].current_price_cent.length; i++){
			if (response[0].current_price_cent.charAt(i) != "0"){
				if (i < 3){
					pos = 3;
					break;
				}else{
					pos = i + 1;
					break;
				}
			}
		}
		cent = response[0].current_price_cent.substring(0, pos);
	}

	if (response[0].year_high_date != null) {
		// coinDate = new Date(response[0].year_high_date);
		// day = coinDate.getUTCDate();
		// month = get_month(coinDate.getUTCMonth());
		// year = coinDate.getUTCFullYear();

		// date = day + " " + month + " " + year;
	}

	if (response[0].year_high_currency != null) {
		coinCurrency = response[0].year_high_currency.toUpperCase();
	}

	// CREATE YEAR-HIGH KPI ELEMENTS
	let currprice_data = {

		title: "Current Price",
		price: "$" + dollar + "." + cent,
		date: date,
		currency: coinCurrency
	}

	// PUSH TO KPI ARRAY
	kpiData.push(alltime_data);
	kpiData.push(yeartime_data);
	kpiData.push(currprice_data);
}

function get_month(monthNumber) {

	switch (monthNumber) {
		case 0:
			return "Jan";
		case 1:
			return "Feb";
		case 2:
			return "Mar";
		case 3:
			return "Apr";
		case 4:
			return "May";
		case 5:
			return "June";
		case 6:
			return "July";
		case 7:
			return "Aug";
		case 8:
			return "Sept";
		case 9:
			return "Oct";
		case 10:
			return "Nov";
		case 11:
			return "Dec";
	}
}

// function store_watchlist(response) {
	
// 	sessionStorage.setItem("watchlist", JSON.stringify(JSON.parse(response.body)));
// }