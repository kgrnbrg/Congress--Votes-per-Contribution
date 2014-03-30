var catOrderObject = {};
catOrderObject.catOrder = [];
catOrderObject.catCode = [];

var array= [];

var counter = 0;

d3.csv('../assets/money-votes_All.csv', function(error, data) {

	if (error) {
		console.log(error);
	} else {
		// console.log(data);

		array = _.filter(data, "John Boehner");

		console.log("process: " + array);

	}
});
