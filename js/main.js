var filteredDataset;
var dataset = [];
var name;
var allLegislators;



// Thank you for the snippet MREDKJ! http://www.mredkj.com/javascript/nfbasic.html
function addCommas(nStr)
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function getCongressMemberData(name){

	d3.csv('../assets/legislators.csv', function(error, data) {
		if (error){
			console.log(error);
		} else {
			console.log("[getCongressMemberData] name: " + name);
			allLegislators = data;

			var nameArray = name.split(' ');
			var firstName = nameArray[0];
			var lastName = nameArray[1];

			var legislator = _.where(allLegislators, {firstname: firstName, lastname: lastName})
			console.log(legislator);

			$('#legislatorPhoto').html('<img src="../img/100x125/' + legislator[0].bioguide_id + '.jpg" />');
			$('#legislatorName').text(name);
			$('#legislatorState').text(legislator[0].state);
			$('#legislatorChamber').text(legislator[0].title);
		}
	});
	
}

///////////////////////////////////////////////////////////////
// var catOrderObject = {};
// catOrderObject.catOrder = [];
// catOrderObject.catCode = [];

// function processCRPCategories() {
// 	d3.csv('../assets/CRP_Categories.csv', function(error, data) {
// 		if (error) {
// 			console.log(error);
// 		} else {
// 			// console.log(data);
// 			for(var i = 0; i < data.length; i++) {
// 				catOrderObject.catOrder.push({
// 					id: data[i]["Catorder"],
// 					option: data[i]["Catcode"]
// 				});
// 			}
// 				console.log(catOrderObject.catCode);
// 				console.log(catOrderObject.catOrder);
// 		}
// 	});
// }
///////////////////////////////////////////////////////////////



function drawGraphic(dataset){

	var w = $("#svg").width();		// This gets the width set by css. This will make the graphic repsonsive in the future.
	var h = $("#svg").height();		// same
	var padding = w/10;
	// var svgTextSize = ...;

	// Sets the scale of the graphic, using sqrt() to show more detail with the smaller values, and less detail with the larger values, making the data-heavy portion of the graphic more legible:
	var xScale = d3.scale.sqrt()
		.exponent(0.4)
		.domain([0, d3.max(dataset, function(d){ return d[1]; })])
		.range([padding, w - padding * 2])
		.clamp(true);

	var yScale = d3.scale.sqrt()
		.exponent(0.8)
		.domain([
			d3.min(dataset, function(d){ return d[0];}),
			d3.max(dataset, function(d){ return d[0];})
		])
		.range([h - padding, padding]);

	// Size of circles:
	var rScaleX = d3.scale.linear()
		.domain([0, d3.max(dataset, function(d) { return d[1]; })])
		.range([3, 20]);

	var rScaleY = d3.scale.linear()
		.domain([-30, d3.max(dataset, function(d) { return d[0]; })])
		.range([-5, 5]);

	// This is used for getting a more appropriate scale for the circle size based on contribution per vote ratio:
	var scaleY = d3.scale.linear()
		.domain([0, d3.max(dataset, function(d) { return d[0]; })])
		.range([0, 1])
		.clamp(true);


	// draws the svg area where the graphic is drawn:
	var svg = d3.select("#svg")
		.append("svg")
		.attr("width", w)
		.attr("height", h);

	// draws the axes of the graphic:
	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom")
		.ticks(5);

	var yAxis = d3.svg.axis()
		.scale(yScale)
		.orient("left")
		.ticks(10);

	var votesPerDollar;

	svg.selectAll("circle")
		.data(dataset)
		.enter()
		.append("circle")
		.attr({
			cx: function(d) {
				return xScale(d[1]);},
			cy: function(d) {
				return yScale(d[0]);},
			r: function(d){

				votesPerDollar = rScaleX(d[1]/scaleY(d[0]));

				if (isNaN(votesPerDollar) || Number.isNaN(votesPerDollar) || votesPerDollar === Infinity || votesPerDollar === -Infinity){
					return 4;
				} else if (votesPerDollar < 0){
					console.log("[circle:radius] Votes Per Dollar: " + votesPerDollar);
					return Math.abs(votesPerDollar);
				} else {
					return votesPerDollar;
				}
			},
			fill: function(d) {

				votesPerDollar = rScaleX(d[1]/scaleY(d[0]));

				if (isNaN(votesPerDollar) || Number.isNaN(votesPerDollar) || votesPerDollar === Infinity || votesPerDollar === -Infinity){
					return "rgba(" + 4 + ", 0, 0, 0.2)";  //Gives a default value for buggy 'votePerDollar' math.
				} else if (votesPerDollar < 0){
					console.log("[circle:fill] Votes Per Dollar: " + votesPerDollar);
					return Math.abs(votesPerDollar);	// If the result of 'votesPerDollar' is negative, return a positive num
				} else {
					return "rgba(" + Math.floor(votesPerDollar * 3.5) + ", 0, 0, 0.2)";
				}
			}
		})

		.on("mouseover", function(d){
			var xPosition = parseFloat(d3.select(this).attr("cx")) + padding*2.5;
			var yPosition = parseFloat(d3.select(this).attr("cy")) + padding/2;

			d3.select(this)
				.attr("fill", "rgba(200, 20, 20, 0.7)");
			d3.select("#tooltip")
				.style("left", xPosition + "px")
				.style("top", yPosition - padding/4 + "px")
				.select("#value1")
				.text(d[0]);
			d3.select("#tooltip")
				.select("#value2")
				.text(addCommas(d[1]));
			d3.select("#tooltip")
				.select("#value3")
				.text( function(){
					var ratio = d[1]/d[0];
					if (ratio === Infinity){ // Resolves the divide by zero issue with 'ratio'
						return 0;
					} else {
					return addCommas(Math.floor(ratio));
					}
				});
			d3.select("#tooltip")
				.select("#value4")
				.text(d[2]);
			d3.select("#tooltip").classed("hidden", false);
		})
		.on("mouseout", function(){
			d3.select("#tooltip").classed("hidden", true);

			d3.select(this)
				.attr("fill", function(d) {
				votesPerDollar = rScaleX(d[1]/scaleY(d[0]));

				if (isNaN(votesPerDollar) || Number.isNaN(votesPerDollar) || votesPerDollar === Infinity || votesPerDollar === -Infinity){
					return "rgba(" + 4 + ", 0, 0, 0.2)"; //Gives a default value for buggy 'votePerDollar' math.
				} else if (votesPerDollar < 0){
					console.log("[circle:mouseout] Votes Per Dollar: " + votesPerDollar);
					return Math.abs(votesPerDollar);	// If the result of 'votesPerDollar' is negative, return a positive num
				} else {
					return "rgba(" + Math.floor(votesPerDollar * 3.5) + ", 0, 0, 0.2)";
				}
			});
		});

	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (h - padding) + ")")
		.call(xAxis);

	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + padding + ", 0)")
		.call(yAxis);

}

//////////////////////////////////////////////////////////////////////
// Look into using underscore to tally up the number of issues voted on to create the adjusted value of potency for contributions per votes.



// variable for setting the string to be searched for in _.where. This is how the full list of legislators can be accessed:
// var selectedName = "John Boehner (R)";
var selectedName = "John Boehner (R)";
var issuesCount;


d3.csv('../assets/money-votes_All.csv', function(error, data) {
	if (error) {
		console.log(error);
	} else {
		// Logs the data as it came in:
		// console.log(data);


	filteredDataset = _.where(data, {person: selectedName});
	console.log(filteredDataset);

	// issuesCount = _.where(filteredDataset, {});
	var votesCount = [];
	var contributionsCount = [];

	name = filteredDataset[0].person.replace(/\([RD]\)/g, '').trim();

	for (var i = 0; i < filteredDataset.length; i++) {
		var tempVotes = parseInt(filteredDataset[i].votes);
		var tempMoney = parseInt(filteredDataset[i].money.replace(/[\$,]/g, ''));
		var tempCategory = filteredDataset[i]["industry name"];

		if (isNaN(tempVotes) || Number.isNaN(tempVotes) || isNaN(tempMoney) || Number.isNaN(tempMoney) ){
			console.log("Error found at entry " + i + ": " + tempVotes + ", " + tempMoney);
		} else {
			votesCount.push(Math.abs(tempVotes));
			contributionsCount.push(tempMoney);
			dataset.push([tempVotes, tempMoney, tempCategory]);
		}
	}
	// Logs the data as it was processed:
	// console.log(dataset);
	$('#totalVotes').text(addCommas(votesCount.sum()));
	$('#totalContributions').text(addCommas(contributionsCount.sum()));
	// Calls the function that gets info about the member of Congress:
	getCongressMemberData(name);

	// processCRPCategories();
	// Calls the function that visualizes the processed data:
	drawGraphic(dataset);
	
	}
});















