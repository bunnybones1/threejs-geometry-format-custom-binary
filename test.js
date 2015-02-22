var loadAndRunScripts = require('loadandrunscripts');
function onReady() {
	console.log(console);
	var View = require('threejs-managed-view').View;

	var view = new View();

	var decoder = require('./');

	var xhr = require('xhr');

	var params = {
		url: 'assets/teapot.b3d.dflr',
		responseType: 'arraybuffer'
	}

	view.camera.position.y *= .3;
	view.camera.lookAt(new THREE.Vector3());

	var light = new THREE.PointLight();
	light.position.copy(view.camera.position);
	view.scene.add(light);
	var spin = new THREE.Object3D();
	view.scene.add(spin);
	xhr(params, function(err, response){
		// console.log(response);
		var geometry = decoder(response.body, true);
		var material = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			vertexColors: THREE.VertexColors
		});
		var mesh = new THREE.Mesh(geometry, material);
		// mesh.rotation.x = Math.PI * -.5;
		mesh.scale.set(0.01, 0.01, 0.01);
		spin.add(mesh);
	});

	view.renderManager.onEnterFrame.add(function(){
		spin.rotation.y += .01;
	})

}

loadAndRunScripts([
	'bower_components/three.js/three.js'
	],
	onReady
);