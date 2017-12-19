var size = 50;
var blocksize = 15;
var mapoffset = 150;
var mapoffsetrequest = '-'+mapoffset+',-'+mapoffset+'/'+mapoffset+','+mapoffset;
var width = (mapoffset*blocksize) * 2 + blocksize;
var landdata;
var height = (mapoffset*blocksize) * 2 + blocksize;
var color = d3.scaleOrdinal(d3.schemeCategory10);

var svg = d3.select("#divbody").append("svg")
	.attr("width", width)
   .attr("height", height);

var zoomLayer = svg.append("g");
var zoomed = function() {
  zoomLayer.attr("transform", d3.event.transform);
};
svg.call(d3.zoom()
	.scaleExtent([0.1, 12])
	.on("zoom", zoomed)
);

var div = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

function highlightAddress (id, highlightclass) {
	let addresses = svg.selectAll('#id-'+id);
	addresses.attr("class", ""+ highlightclass);
}

function calculateTotalsForAddress(address) {
	totals = d3.nest()
		.key(function(d) { return d.address === address; })
		.rollup(function(v) {
			return {
				numland: v.length,
				totalbids: d3.sum(v, function(d) { return d.amount; }),
				maxbid: d3.max(v, function(d) { return d.amount; })
			};
		}).object(landdata);
	return totals['true'];
}

axios.get('https://api.auction.decentraland.org/api/parcelState/range/'+mapoffsetrequest)
	.then((res) => {
		landdata = res.data.data;

		zoomLayer.selectAll("rect")
			.data(landdata)
			.enter()
			.append("rect")
			.attr("id", function (d) { return 'id-'+(d.address === null ? d.id : d.address);})
			.attr("x", function(d){
				return (d.x*blocksize)+(width/2)+1;
			})
			.attr("y", function(d){
				return ((d.y*-1)*blocksize)+(height/2)+1;
			})
			.attr("height", blocksize)
			.attr("width", blocksize)
			.attr("fill", function(d) {return d.projectId !== null ? '#BFBFBF' : color(d.amount/100) ;})
			.on("click", function(d) { window.open('https://etherscan.io/address/'+d.address);console.log(d);})
			.on("mouseover", function(d) {
				highlightAddress(d.address,'highlightAddress');
				let totals = calculateTotalsForAddress(d.address);

				div.transition().duration(100).style("opacity", 0.8);
				div.html("Id:"+ d.id
					+ "<br/>" + (d.projectId !== null ? 'Non biddable' : 'Bid:'+d.amount)
					+ "<br/>Total Land:"+ totals.numland
					+ "<br/>Total m&#xb2;:"+ totals.numland*100
					+ "<br/>Total Bid:"+ totals.totalbids
					+ "<br/>Max Bid:"+ totals.maxbid
				).style("left", (d3.event.pageX + 10) + "px").style("top", (d3.event.pageY ) + "px");

			})
			.on("mouseout", function(d) {
				div.transition()
				.duration(400)
				.style("opacity", 0);
				highlightAddress(d.address,'');
			})
			;
	}
);
