var argv = require('yargs').argv;
var fs = require('fs');
var axios = require('axios');
var d3 = require('d3');
var jsdom = require('jsdom');

var blocksize = 15;
var color = d3.scaleOrdinal(d3.schemeCategory10);

const { JSDOM } = jsdom;
const hDOM = new JSDOM('<!DOCTYPE html><html><body></body></html>');

module.exports = function( mapoffset, outputLocation ){
	if(!mapoffset) mapoffset = 5;
	if(!outputLocation) outputLocation = 'decentraland-map.svg';

	var mapoffsetrequest = '-'+mapoffset+',-'+mapoffset+'/'+mapoffset+','+mapoffset;
	var width = ((mapoffset*blocksize) * 2)+blocksize;
	var height = ((mapoffset*blocksize) * 2)+blocksize;

	let body = d3.select(hDOM.window.document).select('body');
	let svg = body.append('div').attr('class', 'container')
		.append("svg")
		.attr("width", width+1)
		.attr("height", height+1);

	svg.append("rect")
			.attr("width", "100%")
			.attr("height", "100%")
			.attr("fill", "white")
	svgContainer = svg.append("g").attr("transform", "translate(" + -(blocksize/2) + "," + -(blocksize/2) + ")");

	axios.get('https://api.auction.decentraland.org/api/parcelState/range/'+mapoffsetrequest)
		.then((res) => {
			let landdata = res.data.data;
			svgContainer.selectAll("rect")
				.data(landdata)
				.enter()
				.append("rect")
				.attr("x", function(d){
					return (d.x*blocksize)+(width/2)+1;
				})
				.attr("y", function(d){
					return ((d.y*-1)*blocksize)+(height/2)+1;
				})
				.attr("height", blocksize-1)
				.attr("width", blocksize-1)
				.attr("fill", function(d) {return d.projectId !== null ? '#BFBFBF' : color(d.amount/100) ;})
				;

			fs.writeFileSync(outputLocation, body.select('.container').html());
		}
	);
}

if (require.main === module) {
    module.exports(argv.size, argv.filename);
}
