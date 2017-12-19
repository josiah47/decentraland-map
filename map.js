var argv = require('yargs').argv;
var fs = require('fs');
var axios = require('axios');
var d3 = require('d3');
var jsdom = require('jsdom');

var parcelUtils = require('./parcelUtils');

var blocksize = 15;
var color = d3.scaleOrdinal(d3.schemeCategory10);

const { JSDOM } = jsdom;
const hDOM = new JSDOM('<!DOCTYPE html><html><body></body></html>');

function render_svg_map(input) {
	let landdata = input.data;
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
		.attr("fill", function(d) {return d.projectId !== null ? '#BFBFBF' : parcelUtils.getColorByAmount(d.amount, 50000) ;})
		;

	return body.select('.container').html();
}

module.exports = function( mapoffset, outputLocation, inputData ){
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

	if(inputData) {
		fs.writeFileSync(outputLocation, render_svg_map(inputData.data));
	} else {
		axios.get('https://api.auction.decentraland.org/api/parcelState/range/'+mapoffsetrequest)
			.then((res) => {
				fs.writeFileSync(outputLocation, render_svg_map(res.data));
			}
		);
	}
}

if (require.main === module) {
		module.exports(argv.size, argv.filename);
}
