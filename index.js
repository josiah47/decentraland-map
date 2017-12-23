var blocksize = 14;
var mapoffset = 150;
var dateformat = "YYYY-MM-DD HH";
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
var hourtext = document.createElement("div");
hourtext.innerHTML = 'Hello';
container.appendChild( hourtext );

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

function createGeometryLand(amount) {
	var squareShape = new THREE.Shape();

	let shapesize = blocksize+2;
	squareShape.moveTo( 0, 0 );
	squareShape.lineTo( 0, shapesize );
	squareShape.lineTo( shapesize, shapesize );
	squareShape.lineTo( shapesize, 0 );
	squareShape.lineTo( 0, 0 );

	var extrudeSettings = {
		amount: amount,
		bevelEnabled: false
	};
	var geometry = new THREE.ExtrudeGeometry( squareShape, extrudeSettings );
	return geometry;
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
	var bufferGeometry = new THREE.BufferGeometry();

	// per instance data
	var positions = [];
	var normals = [];
	var colors = [];

	var vector = new THREE.Vector3();
	let dataarray = Object.keys(data);
	// ~console.log(dataarray.length);
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

			var geometry;
			if (zStart+zHeight > 0.5) {
				// ~return;
				geometry = createGeometryBid(zHeight);
			} else {
				// ~return;
				geometry = createGeometryLand(zHeight);
			}
			geometry.translate( vector.x, vector.y, vector.z );

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
	bufferGeometry.computeBoundingSphere();

	var material = new THREE.MeshPhongMaterial( {
		specular: 0xBFBFBF, shininess: 5,
		vertexColors: THREE.VertexColors
	} );

	var mesh = new THREE.Mesh( bufferGeometry, material );
	scene.add( mesh );

	render();
}

render();

axios.get('./mapclean.json')
	.then((res) => {
		showLandData(res.data);

		animate();

		axios.get('./landbids.json')
			.then((res) => {
				let keys = Object.keys(res.data);
				keys.sort(function (a,b) {
					return moment(a+':00').isAfter(moment(b+':00'));
				});
				let nextdate = moment(keys[0]+':00'); // Get first date in sort keys
				// ~let nextdate = moment('2017-12-22 04:00:00'); // Get first date in sort keys
				let minutetimediff = moment(keys[keys.length-1]+':00').diff(moment(nextdate), 'minutes');

				let tweenstarted = false;

				let timediff = minutetimediff;

				var cameraTarget = new THREE.Vector3(250, -3500, 1000);
				var tween = new TWEEN.Tween(cameraPos)
					.to(cameraTarget, timediff*100)
					.easing(TWEEN.Easing.Sinusoidal.InOut)
				.onUpdate(function () {
					camera.position.set(this.x, this.y, this.z);
					camera.lookAt(new THREE.Vector3(0, 0, 0));
				})
				.onComplete(function () {
					camera.lookAt(new THREE.Vector3(0, 0, 0));
				});

				if (!tweenstarted) {
					tween.start();
					tweenstarted =true;
				}

				let currentminute = 0;
				var timedelay = 1;
				var timerLand = setInterval(function() {
					let datedata = res.data[nextdate.format("YYYY-MM-DD HH:mm")];
					if (datedata) {
						showLandData(datedata);
					}

					if (nextdate.isSameOrAfter(moment())) {
						console.log('exit');
						controls.enable = true; // Enable controls after rendering
						stopped = true;
						clearInterval(timerLand);
					}

					hourtext.innerHTML = nextdate.format("dddd, MMMM Do YYYY HH:mm");
					nextdate.add(1, 'm');

					currentminute = currentminute*timedelay;
				}, timedelay);
		});
});
