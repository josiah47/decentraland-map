var blocksize = 14;
var mapoffset = 150;
var renderingtimeframe = 'minute'; // hour || minute
var landdata;
var width = (mapoffset*blocksize) * 2 + blocksize;
var height = (mapoffset*blocksize) * 2 + blocksize;
var d3color20 = d3.scaleOrdinal(d3.schemeCategory20);
var d3color20b = d3.scaleOrdinal(d3.schemeCategory20b);
var d3color20c = d3.scaleOrdinal(d3.schemeCategory20c);

var renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
window.addEventListener( 'resize', onWindowResize, false );

var container = document.createElement( 'div' );
document.body.appendChild( container );
var headerbar = document.createElement("div");
var hourtext = document.createElement("div");
hourtext.setAttribute('style','float: right;');
hourtext.innerHTML = 'Hello';

var btn = document.createElement("BUTTON");        // Create a <button> element
var t = document.createTextNode("Manual Control");       // Create a text node
btn.appendChild(t);                                // Append the text to <button>
btn.onclick = function() { cancelTween(); };

var headerbuttons = document.createElement("div");
headerbuttons.setAttribute('style','float: left;');
headerbuttons.appendChild(btn);
headerbar.appendChild(headerbuttons);
headerbar.appendChild( hourtext );
container.appendChild( headerbar );

container.appendChild( renderer.domElement );

var scene = new THREE.Scene();
scene.background = new THREE.Color( 0xE4EEF1 );

var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 100000);
var cameraPos = new THREE.Vector3(-2000, 2000, 200);
camera.position.set( cameraPos );
camera.up = new THREE.Vector3(0,0,1);
camera.lookAt(new THREE.Vector3(0,0,0));

var controls = new THREE.TrackballControls( camera );
controls.zoomSpeed = 0.5;
controls.panSpeed = 0.2;
controls.enable = false; // enabled after rendering of data

var light = new THREE.PointLight( 0x5A5757 );
light.position.set( 1000, 1000, 6000 );
scene.add( light );
var light = new THREE.PointLight( 0x5A5757 );
light.position.set( -1000, -1000, -6000 );
scene.add( light );

scene.add( new THREE.AmbientLight( 0x989898 ) );

renderer.setClearColor( 0xE4EEF1, 1);

var tween;
function cancelTween() {
	if (controls.enable === true) {
		tween.start();
	} else {
		console.log('cancel');
		tween.stop();
		controls.enable = true;
	}
}
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

var ordinal = 0;
function animate() {
	TWEEN.update();

	requestAnimationFrame(animate);
	render();
	controls.update();
}
function render() {
	renderer.render( scene, camera );
}

function createGeometryBid(amount) {
	var shape = new THREE.Shape();
	let shapesize = blocksize-2;
	shape.moveTo( 1, 2);
	shape.lineTo( 1, shapesize );
	shape.lineTo( 2, shapesize+1 );
	shape.lineTo( shapesize, shapesize+1 );
	shape.lineTo( shapesize+1, shapesize );
	shape.lineTo( shapesize+1, 2 );
	shape.lineTo( shapesize, 1 );
	shape.lineTo( 2, 1 );
	shape.lineTo( 1, 2 );

	var extrudeSettings = {
		amount: amount,
		bevelEnabled: false,
		bevelThickness: 1,
		bevelSize: 1,
		bevelSegments: 1
	};
	var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
	return geometry;
}

var landdatamap = new Map();

function showLandData(data) {
	var landboxbuffer = new THREE.BoxBufferGeometry( blocksize+2, blocksize+2, 0.5 );
	var reslandboxbuffer = new THREE.BoxBufferGeometry( blocksize+2, blocksize+2, 0.1 );

	var landboxinstance = new THREE.InstancedBufferGeometry();
	landboxinstance.index = landboxbuffer.index;
	landboxinstance.attributes.position = landboxbuffer.attributes.position;
	landboxinstance.attributes.uv = landboxbuffer.attributes.uv;

	var reslandboxinstance = new THREE.InstancedBufferGeometry();
	reslandboxinstance.index = reslandboxbuffer.index;
	reslandboxinstance.attributes.position = reslandboxbuffer.attributes.position;
	reslandboxinstance.attributes.uv = reslandboxbuffer.attributes.uv;

	// per instance data
	var landoffsets = [];
	var reslandoffsets = [];
	var reslandcolors = [];
	var landcolors = [];

	var vector = new THREE.Vector3();
	let dataarray = Object.keys(data);
	dataarray.forEach( function (landid) {
		let land = data[landid];
		land.bids.forEach(function (bid,index) {
			let zStart = 0;
			if (landdatamap.has(landid)) {
				zStart = landdatamap.get(landid);
			}

			let zHeight = bid.amount/1000;
			landdatamap.set(landid, zStart+zHeight);

			// Move reserved land down below available land
			if (zStart+zHeight < 0.5) {
				zStart-=zHeight;
			}

			let colorhex;
			if (!bid.amount || bid.amount === null || zHeight === 0.1) {
				colorhex = '#676767';
			} else if (zHeight === 0.5) {
				colorhex = '#6D4E00';
			}
			var color = new THREE.Color( colorhex );

			// positions
			x = (land.x * (blocksize+1))+(blocksize/2);
			y = (land.y * (blocksize+1))+(blocksize/2);
			z = zStart;
			vector.set( x, y, z, 0 );

			if (zHeight === 0.1) {
				reslandoffsets.push( vector.x, vector.y,  vector.z );
				reslandcolors.push( color.r, color.g, color.b, 1.0 );
			} else {
				landoffsets.push(  vector.x, vector.y, vector.z );
				landcolors.push( color.r, color.g, color.b, 1.0 );
			}
		});
	});

	landboxinstance.addAttribute( 'offset', new THREE.InstancedBufferAttribute( new Float32Array( landoffsets ), 3 ) );
	landboxinstance.addAttribute( 'color', new THREE.InstancedBufferAttribute( new Float32Array( landcolors ), 4 ) );

	reslandboxinstance.addAttribute( 'offset', new THREE.InstancedBufferAttribute( new Float32Array( reslandoffsets ), 3 ) );
	reslandboxinstance.addAttribute( 'color', new THREE.InstancedBufferAttribute( new Float32Array( reslandcolors ), 4 ) );

	var material = new THREE.RawShaderMaterial( {
		uniforms: {
			time: { value: 1.0 }
		},
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent
	} );

	var landmesh = new THREE.Mesh( landboxinstance, material );
	var reslandmesh = new THREE.Mesh( reslandboxinstance, material );
	scene.add( landmesh );
	scene.add( reslandmesh );

	render();
}

function showBidData(data) {
	var bufferGeometry = new THREE.BufferGeometry();

	// per instance data
	var positions = [];
	var normals = [];
	var colors = [];

	var vector = new THREE.Vector3();
	let dataarray = Object.keys(data);
	dataarray.forEach( function (landid) {
		let land = data[landid];
		// ~land.sort(function (a,b) { return a.amount-b.amount;});
		land.bids.forEach(function (bid,index) {
			let zStart = 0;
			if (landdatamap.has(landid)) {
				zStart = landdatamap.get(landid);
			}

			let zHeight = bid.amount/1000;
			landdatamap.set(landid, zStart+zHeight);

			// Move reserved land down below available land
			if (zStart+zHeight < 0.5) {
				zStart-=zHeight;
			}

			// positions
			x = (land.x * (blocksize+1));
			y = (land.y * (blocksize+1));
			z = zStart;
			vector.set( x, y, z, 0 );

			let colorhex;
			if (!bid.amount || bid.amount === null || zHeight === 0.1) {
				colorhex = '#676767';
			} else if (zHeight === 0.5) {
				colorhex = '#6D4E00';
			} else if (zStart+zHeight >= 60) {
				// ~colorhex = d3color20(zStart+zHeight);
				colorhex = '#FF4726';
			} else if (zStart+zHeight >= 40) {
				// ~colorhex = d3color20b(zStart+zHeight);
				colorhex = '#FF846E';
			} else if (zStart+zHeight >= 0.5) {
				colorhex = d3color20c(zStart+zHeight);
			} else {
				colorhex = '#BFBFBF';
			}

			var color = new THREE.Color( colorhex );

			var geometry = createGeometryBid(zHeight);
			geometry.translate( vector.x, vector.y, vector.z );

			geometry.faces.forEach( function ( face, index ) {
				positions.push( geometry.vertices[ face.a ].x );
				positions.push( geometry.vertices[ face.a ].y );
				positions.push( geometry.vertices[ face.a ].z );
				positions.push( geometry.vertices[ face.b ].x );
				positions.push( geometry.vertices[ face.b ].y );
				positions.push( geometry.vertices[ face.b ].z );
				positions.push( geometry.vertices[ face.c ].x );
				positions.push( geometry.vertices[ face.c ].y );
				positions.push( geometry.vertices[ face.c ].z );
				normals.push( face.normal.x );
				normals.push( face.normal.y );
				normals.push( face.normal.z );
				normals.push( face.normal.x );
				normals.push( face.normal.y );
				normals.push( face.normal.z );
				normals.push( face.normal.x );
				normals.push( face.normal.y );
				normals.push( face.normal.z );
				colors.push( color.r );
				colors.push( color.g );
				colors.push( color.b );
				colors.push( color.r );
				colors.push( color.g );
				colors.push( color.b );
				colors.push( color.r );
				colors.push( color.g );
				colors.push( color.b );
			} );
		});
	});

	bufferGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
	bufferGeometry.addAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
	bufferGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

	var material = new THREE.MeshPhongMaterial( {
		specular: 0xBFBFBF, shininess: 5,
		vertexColors: THREE.VertexColors
	} );

	var mesh = new THREE.Mesh( bufferGeometry, material );
	scene.add( mesh );

	render();
}

render();

console.time('loadmapclean');
axios.get('./mapclean.json')
	.then((res) => {
		console.timeEnd('loadmapclean');

		console.time('showmapdata');
		showLandData(res.data);
		console.timeEnd('showmapdata');

		animate();

		console.time('loadlandbids');
		axios.get('./landbids.json')
			.then((res) => {
				console.timeEnd('loadlandbids');

				let hourminuteprefix = ':00:00';
				let dateformat = "YYYY-MM-DD HH";
				if (renderingtimeframe === 'minute') {
					hourminuteprefix = ':00';
					dateformat = "YYYY-MM-DD HH:mm";
				}

				console.time('sort');
				let keys = Object.keys(res.data);
				keys.sort(function (a,b) {
					return moment(a+ hourminuteprefix).isAfter(moment(b+ hourminuteprefix));
				});
				console.timeEnd('sort');
				let nextdate = moment(keys[0]+ hourminuteprefix); // Get first date in sort keys
				// ~let nextdate = moment('2017-12-23 04:00:00');
				let minutetimediff = moment(keys[keys.length-1]+ hourminuteprefix).diff(moment(nextdate), renderingtimeframe);

				if (controls.enable === true) {
					minutetimediff = 1000;
				}
				var cameraTarget = new THREE.Vector3(250, -3500, 1000);
				tween = new TWEEN.Tween(cameraPos)
					.to(cameraTarget, minutetimediff * 10)
					.easing(TWEEN.Easing.Sinusoidal.InOut)
				.onUpdate(function () {
					camera.position.set(this.x, this.y, this.z);
					camera.lookAt(new THREE.Vector3(0, 0, 0));
				})
				.onComplete(function () {
					camera.lookAt(new THREE.Vector3(0, 0, 0));
				});
				tween.start();

				var timedelay = 10;
				var timerLand = setInterval(function() {
					let datedata = res.data[nextdate.format(dateformat)];
					if (datedata) {
						showBidData(datedata);
					}

					if (nextdate.isSameOrAfter(moment())) {
						console.log('exit');
						controls.enable = true; // Enable controls after rendering
						clearInterval(timerLand);
					}

					hourtext.innerHTML = nextdate.format("dddd, MMMM Do YYYY HH:mm");
					nextdate.add(10, renderingtimeframe);
				}, timedelay);
		});
});
