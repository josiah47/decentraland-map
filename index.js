var size = 50;
var blocksize = 15;
var mapoffset = 150;
var mapoffsetrequest = '-'+mapoffset+',-'+mapoffset+'/'+mapoffset+','+mapoffset;
var width = (mapoffset*blocksize) * 2 + blocksize;
var height = (mapoffset*blocksize) * 2 + blocksize;
var landdata;
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

axios.get('https://api.auction.decentraland.org/api/parcelState/range/'+mapoffsetrequest)
	.then((res) => {
		landdata = res.data.data;
		console.log(landdata);
		zoomLayer.selectAll("rect")
		.data(landdata)
		.enter()
		.append("rect")
		.attr("x", function(d){
			return (d.x*blocksize)+(width/2)+1;
		})
		.attr("y", function(d){
			return ((d.y*-1)*blocksize)+(height/2)+1;
		})
		.attr("height", blocksize)
		.attr("width", blocksize)
		.attr("fill", function(d) {return d.projectId !== null ? '#BFBFBF' : color(d.amount/100) ;})
		.on("click", function(d) { console.log(d);})
		.on("mouseover", function(d) {
			div.transition().duration(100).style("opacity", 0.8);
			div.html(d.id + "<br/>" + (d.projectId !== null ? 'Non biddable' : 'Amount:'+d.amount)).style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY - 27) + "px");
		})
		.on("mouseout", function(d) {
			div.transition()
			.duration(400)
			.style("opacity", 0);
		})
		;
	}
);

d3.select("#generate")
   .on("click", writeDownloadLink);

function writeDownloadLink(){
	var html = d3.select("svg")
		.attr("title", "decentraland-map")
		.attr("version", 1.1)
		.attr("xmlns", "http://www.w3.org/2000/svg")
		.node().parentNode.innerHTML;

	var blob = new Blob([html], {type: "image/svg+xml"});
   var url = window.URL.createObjectURL(blob);

	var a = document.createElement("a");
	document.body.appendChild(a);
	a.style = "display: none";
	a.href = url;
	a.download = "decentraland-map.svg";
	a.click();
	window.URL.revokeObjectURL(url);
}
