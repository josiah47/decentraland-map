var argv = require('yargs').argv;
var fs = require('fs');
var axios = require('axios');

var mapoffset = 150;
var mapoffsetrequest = '-'+mapoffset+',-'+mapoffset+'/'+mapoffset+','+mapoffset;

function remove_bids(input) {
	var land = {};
	for (let i=0; i < input.length; i++) {
		let landid = input[i].id;

		if (! land[landid]) {
			land[landid] = {
				x: input[i].x,
				y: input[i].y,
				bids: []
			};
		}

		land[landid].bids.push({
			'amount': input[i].projectId !== null ? 100 : 500
		});
	}

	// ~console.log(JSON.stringify(land));
	return JSON.stringify(land);
}

module.exports = function( outputLocation ){
	if(!outputLocation) outputLocation = 'mapclean.json';

	axios.get('https://api.auction.decentraland.org/api/parcelState/range/'+mapoffsetrequest)
		.then((res) => {
			fs.writeFileSync(outputLocation, remove_bids(res.data.data));
		}
	);

	// ~fs.readFile('map.json', 'utf8', function (err,data) {
	  // ~if (err) {
		 // ~return console.log(err);
	  // ~}
		// ~fs.writeFileSync(outputLocation, remove_bids(JSON.parse(data)));
	// ~});
};

if (require.main === module) {
	module.exports(argv.size, argv.filename);
}
