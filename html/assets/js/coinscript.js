/*************************** VARIABLES **************************/
/*						  										*/
/****************************************************************/
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

// X-AXIS
const dates = [];

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

function get_coininfo() {

	// DISPLAY THE COIN NAME AS A SUBHEADER
	var coinName = getQueryVariable("coinName");
	if (coinName != false) { document.getElementById("coinName").innerHTML = coinName; }

	// GET THE COIN ID
	var coinid = getQueryVariable("coinID");
	if (coinid != false) {

		$(".faveCoinBtn").attr('id', coinid);

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

		console.log("Hello");
		create_mrkdata_graph();
		create_volume_graph();
		create_kpi();
		checkIndicatorsPerDay();
	}
}

/************************ DISPLAY COIN KPI **********************/

function create_kpi() {

	// FOR EACH KPI
	$.each(kpiData, function (resIndex, eachData) {

		/***** CREATE KPI CONTAINER *****/
		// CREATE KPI DIV
		var kpi = $("<div></div>");
		kpi.addClass("kpi");

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
	// GET THE CHART DIV
	var ctx_mrkdata = $("#marketData");

	// CREATE DATA FOR THE GRAPH
	const graphData = {

		// SET X AXIS
		labels: dates,
		// SET THE DATA
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

				// SET THE Y AXIS
				data: moving_average_prices,
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

				// SET THE Y AXIS
				data: coinPrice,
				label: "Coin Prices"
			}]
	}

	// CREATE THE CONFIG FOR OPTION
	const config = {

		/*********************** STYLING ********************/
		plugins: {
			// REMOVE LEGEND
			legend: {
				display: true,
			},
			title: {
				display: true,
				text: "Price History",

				color: colors.fontColor,
				padding: 50,

				font: {
					family: "'Major Mono Display', monospace",
					size: 20
				}
			}
		},

		/************************* AXIS *********************/
		scales: {
			// MAKE X AXIS ONLY SHOW THE YEAR

			x: {
				title: {
					display: true,
					text: "Price Date",
					color: colors.fontColor,
					padding: 20,

					font: {
						family: "'Cutive Mono', monospace",
						size: 15,
						weight: 500
					}
				},
				type: 'time',
				time: {
					unit: 'year'
				},
				ticks: {
					color: colors.tickColor,
					padding: 10,

					font: {
						family: "'Cutive Mono', monospace",
						size: 15,
						weight: 500
					}
				},
				grid: {
					borderColor: colors.gridColor,
					color: colors.gridColor,
					z: -1
				},
			},
			y: {
				title: {
					display: true,
					text: "Coin Price",
					color: colors.fontColor,
					padding: 20,

					font: {
						family: "'Cutive Mono', monospace",
						size: 15,
						weight: 500
					}
				},
				ticks: {
					color: colors.tickColor,
					padding: 10,

					font: {
						family: "'Cutive Mono', monospace",
						size: 15,
						weight: 500
					}
				},
				grid: {
					borderColor: colors.gridColor,
					color: colors.gridColor,
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
	// GET THE CHART DIV
	var ctx_mrkdata = $("#volumeData");

	// CREATE DATA FOR THE GRAPH
	const graphData = {

		// SET X AXIS
		labels: dates,
		// SET THE DATA
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

				// SET THE Y AXIS
				data: moving_average_volume,
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
				z: -2,

				// SET THE Y AXIS
				data: volumes,
				label: "Volume"
			}]
	}

	// CREATE THE CONFIG FOR OPTION
	const config = {

		/*********************** STYLING ********************/
		plugins: {
			// REMOVE LEGEND
			legend: {
				display: true,
			},
			title: {
				display: true,
				text: "Volume History",

				color: colors.fontColor,
				padding: 50,

				font: {
					family: "'Major Mono Display', monospace",
					size: 20
				}
			}
		},

		/************************* AXIS *********************/
		scales: {
			// MAKE X AXIS ONLY SHOW THE YEAR
			x: {
				title: {
					display: true,
					text: "Order Date",

					color: colors.fontColor,
					padding: 20,

					font: {
						family: "'Cutive Mono', monospace",
						size: 15,
						weight: 500
					}
				},
				type: 'time',
				time: {
					unit: 'year'
				},
				ticks: {
					color: colors.tickColor,
					padding: 10,

					font: {
						family: "'Cutive Mono', monospace",
						size: 15,
						weight: 500
					}
				},
				grid: {
					borderColor: colors.gridColor,
					color: colors.gridColor,
					z: -1
				},
			},
			y: {
				title: {
					display: true,
					text: "Number of Orders",
					color: colors.fontColor,
					padding: 20,

					font: {
						family: "'Cutive Mono', monospace",
						size: 15,
						weight: 500
					}
				},
				ticks: {
					color: colors.tickColor,
					padding: 10,

					font: {
						family: "'Cutive Mono', monospace",
						size: 15,
						weight: 500
					}
				},
				grid: {
					borderColor: colors.gridColor,
					color: colors.gridColor,
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
	// GET THE CHART DIV
	var ctx_mrkdata = $("#indicatorData");

	// CREATE DATA FOR THE GRAPH
	const graphData = {

		// SET X AXIS
		labels: dates,
		// SET THE DATA
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

				// SET THE Y AXIS
				data: moving_average_prices,
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

				// SET THE Y AXIS
				data: coinPrice,
				label: "Coin Prices"
			}]
	}

	// CREATE THE CONFIG FOR OPTION
	const config = {

		/*********************** STYLING ********************/
		plugins: {
			// REMOVE LEGEND
			legend: {
				display: true,
			},
			title: {
				display: true,
				text: "Price History",

				color: colors.fontColor,
				padding: 50,

				font: {
					family: "'Major Mono Display', monospace",
					size: 20
				}
			}
		},

		/************************* AXIS *********************/
		scales: {
			// MAKE X AXIS ONLY SHOW THE YEAR

			x: {
				title: {
					display: true,
					text: "Price Date",
					color: colors.fontColor,
					padding: 20,

					font: {
						family: "'Cutive Mono', monospace",
						size: 15,
						weight: 500
					}
				},
				type: 'time',
				time: {
					unit: 'year'
				},
				ticks: {
					color: colors.tickColor,
					padding: 10,

					font: {
						family: "'Cutive Mono', monospace",
						size: 15,
						weight: 500
					}
				},
				grid: {
					borderColor: colors.gridColor,
					color: colors.gridColor,
					z: -1
				},
			},
			y: {
				title: {
					display: true,
					text: "Coin Price",
					color: colors.fontColor,
					padding: 20,

					font: {
						family: "'Cutive Mono', monospace",
						size: 15,
						weight: 500
					}
				},
				ticks: {
					color: colors.tickColor,
					padding: 10,

					font: {
						family: "'Cutive Mono', monospace",
						size: 15,
						weight: 500
					}
				},
				grid: {
					borderColor: colors.gridColor,
					color: colors.gridColor,
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
		if (i < range - 1) { moving_average[i] = 0; }
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

	let indicator_sum = 0;

	// Threshold Price
	const threshold_price = 50;

	// Threshold Volume
	const threshold_volume = 50;


	// Threshold for price Drop in Stop Loss Hunt
	const thresholdPriceDrop = -10;

	// Threshold for price increase in Stop Loss Hunt
	const thresholdPriceIncrease = 10;

	//Price change for stop loss hunt
	let priceChange;
	
	// Check indicators per day
	for (let i = 0; i < marketData.length; i++) {

		indicator_sum = 0;

		if (checkPricePercentChange(coinPrice[i], moving_average_prices[i]) >= threshold_price) {
			indicator_sum++;
		}

		if (checkVolumePercentChange(volumes[i], moving_average_volume[i]) >= threshold_volume) {
			indicator_sum++;
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
	moving_average_volume = simple_moving_average(dataType.VOLUME, 50);
}

function store_coin_kpi(response) {

	// GET VARIABLES
	var dollar = "0";
	var cent = "0";
	var date = "";
	var coinCurrency = "";

	if (response[0].all_time_high_dollar != null) {
		dollar = response[0].all_time_high_dollar;
	}

	if (response[0].all_time_high_cent != null) {
		cent = response[0].all_time_high_cent.substring(0, 3);
	}

	if (response[0].all_time_high_currency != null) {
		coinCurrency = response[0].all_time_high_currency.toUpperCase();
	}

	// CREATE ALL-TIME-HIGH KPI ELEMENTS
	let alltime_data = {

		title: "All-Time High",
		price: "$" + dollar + "." + cent,
		date: "March 25, 1997",
		currency: coinCurrency
	}

	// GET VARIABLES
	var dollar = "0";
	var cent = "0";
	var date = "";
	var coinCurrency = "";

	if (response[0].year_high_dollar != null) {
		dollar = response[0].year_high_dollar;
	}

	if (response[0].year_high_cent != null) {
		cent = response[0].year_high_cent.substring(0, 3);
	}

	if (response[0].year_high_currency != null) {
		coinCurrency = response[0].year_high_currency.toUpperCase();
	}

	// CREATE YEAR-HIGH KPI ELEMENTS
	let yeartime_data = {

		title: "Year High",
		price: "$" + dollar + "." + cent,
		date: "March 25, 1997",
		currency: coinCurrency
	}

	// PUSH TO KPI ARRAY
	kpiData.push(alltime_data);
	kpiData.push(yeartime_data);
}