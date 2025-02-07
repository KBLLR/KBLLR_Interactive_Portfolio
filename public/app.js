console.clear()
import * as THREE from 'three'
import gsap from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Pane } from 'tweakpane'
//===================================================
// ✧ CUSTOM CURSOR
//===================================================

//===================================================
// ✧ CANVAS ✧ SCENES ✧ CONSTANTS
//===================================================

const canvas = document.querySelector("canvas")

const scene = new THREE.Scene()

const sizes = { width: window.innerWidth, height: window.innerHeight }

const canvas_width = sizes.width

const canvas_height = sizes.height

const aspect = sizes.width / sizes.height


//===================================================
// EQUIRECTANGULAR HDR
//===================================================

const textureLoader = new THREE.TextureLoader()
const textureLoad = new RGBELoader()

const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
  '/img/level-4/px.png',
  '/img/level-4/nx.png',
  '/img/level-4/py.png',
  '/img/level-4/ny.png',
  '/img/level-4/pz.png',
  '/img/level-4/nz.png',
]);
scene.background = texture;

//===================================================
// SCENE FOG & BACKGROUND
//===================================================

scene.fog = new THREE.Fog(0xffffff, 0.1, 6)

//scene.fog = new THREE.FogExp2( 0xffffff, 1.5 )

// scene.background = new THREE.Color(0xffffff)


//===================================================
// ✧ CAMERA  
//===================================================

const camera = new THREE.PerspectiveCamera(45, aspect, 0.001, 20000)

camera.position.x = 0
camera.position.y = 24
camera.position.z = 0
camera.lookAt(new THREE.Vector3(0, 0, 0))

scene.add(camera)

//===================================================
// ✧ ORBIT CONTROLS 
//===================================================


const cameraControls = new OrbitControls(camera, canvas)
cameraControls.enabled = true
cameraControls.enableDamping = true
cameraControls.dampingFactor = 0.08
cameraControls.autoRotate = false
cameraControls.enableZoom = true
cameraControls.autoRotateSpeed = 2
cameraControls.zoomSpeed = 1.5
cameraControls.panSpeed = 1
cameraControls.minDistance = 0.02
cameraControls.maxDistance = 14
cameraControls.minPolarAngle = 0
cameraControls.maxPolarAngle = Math.PI / 2.1

//===================================================
// CATMULLROM

let u = 0.2 //-- range[0, 1]
let t

const curve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-5, 0, 5),
  new THREE.Vector3(-2.5, 2.5, 2.5),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(2.5, -2.5, 2.5),
  new THREE.Vector3(5, 0, 5)
], true, "catmullrom", 3.2)

const point = curve.getPoint(0.0) //-- range[0, 1]
const points = curve.getPoints(10)
const getPAt = curve.getPointAt(u)
const gPoints = new THREE.BufferGeometry().setFromPoints(points)

const mPoints = new THREE.LineBasicMaterial({ color: 0xff0000 })

// Create the final object to add to the scene
const curveObject = new THREE.Line(gPoints, mPoints)
// scene.add( curveObject )

//===================================================
// GYROSCOPE

// const gyro = new Gyroscope()
// gyro.add(camera)


//===================================================
//-- ORTHOGRAPHIC CAMERA

// let orthoCamera {
//   const left = -5
//   const right = 5
//   const top = 5
//   const bottom = -5
//   const near = 0.5
//   const far = 500

//   orthoCamera = new THREE.OrthographicCamera(left, right, top, bottom, near, far)
//   orthoCamera.position.z = -1
//   orthoCamera.lookAt(new THREE.Vector3(0, 0, 0))
// }


//===================================================
// ✧ RENDERER  
//===================================================

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  powerPreference: "high-performance",
  antialias: true,
  stencil: true,
  depth: true,
})

renderer.setSize(sizes.width, sizes.height)
renderer.setClearColor(0x000000, 1)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
renderer.shadowMap.enabled = true
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.9

// document.body.appendChild(renderer.domElement)

//===================================================
// ✧ FX 

// const anaglyphFX = new AnaglyphEffect( renderer, sizes.width, sizes.height  )


//===================================================
// ✧ LIGHTS 
//===================================================


const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.61)
hemiLight.position.set(0, 0, 0)
scene.add(hemiLight)

const light = new THREE.DirectionalLight(0xffffff, 1.25)
light.position.set(20, 2, 2)

light.castShadow = true
light.shadow.mapSize.width = 1024
light.shadow.mapSize.height = 1024

// light.shadow.camera.near = 1
// light.shadow.camera.far = 12

// light.shadow.camera.left = - 10
// light.shadow.camera.right = 10
// light.shadow.camera.top = 0
// light.shadow.camera.bottom = 0

// gyro.add(light, light.target)

scene.add(light)


//===================================================
// ✧ GROUND 
//===================================================

const gGeometry = new THREE.PlaneGeometry(3, 3, 100, 100)

const gMaterial = new THREE.MeshPhysicalMaterial({

  map: textureLoader.load("/img/level-4/nx.png"),
  color: new THREE.Color('0x808080'),
  emissive: new THREE.Color('0x000'),
  emissiveIntensity: 1,
  transmission: 1,
  transparent: true,
  opacity: 1,
  ior: 1.9,
  emissiveMap: textureLoader.load('/img/terrazzo/Terrazzo_2K_Emission.png'),
  roughnessMap: textureLoader.load("/img/level-4/nx.png"),
  roughness: 3.2,
  metalnessMap: textureLoader.load("/img/level-4/nx.png"),
  metalness: 0.2,
  normalMap: textureLoader.load("/img/level-4/nx.png"),
  normalScale: new THREE.Vector2(3, 3),
  fog: false
})


const ground = new THREE.Mesh(gGeometry, gMaterial)
ground.rotation.x = -Math.PI / 2

ground.receiveShadow = true

scene.add(ground)

//===================================================
// ✧ GRID HELPER 
//===================================================
//
const gridHelper = new THREE.GridHelper(40, 400)
gridHelper.position.y = 0.001
scene.add(gridHelper)
//

//===================================================
// PLAYER CONFIGURATION
//===================================================
//     
const configPlayer = {
  baseUrl: 'models/innerKid/',
  body: 'innerKid.fbx',
  skins: [],
  animations: {
    move: 'run',
    idle: 'stand',
    jump: 'jump',
    attack: 'attack',
    crouchMove: 'cwalk',
    crouchIdle: 'cstand',
    crouchAttach: 'crattack'
  },
  walkSpeed: 350,
  crouchSpeed: 175
}
//
//
//===================================================
// EVENTS
//===================================================
//
//
window.addEventListener('resize', () => {

  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  renderer.setSize(sizes.width, sizes.height)
  // anaglyphFX.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
//
//

//===================================================
// TIMELINES
//===================================================

const tl = gsap.timeline()
const duration = 4
const ease = 'linear'
let animationIsFinished = false


function cameraAnimation() {

  if (!animationIsFinished) {
    animationIsFinished = true

    tl.to(camera.position, {
      x: 7,
      y: 7,
      z: 7,
      duration,
      ease
    })

      .to(camera.position, {
        x: 1,
        y: 0,
        z: 1,
        duration,
        ease,
        onUpdate: function () {
          camera.lookAt(0, 0, 0)
        }
      },)

      .to(camera.position, {
        x: 0.03,
        y: 0.05,
        z: 0.03,
        duration,
        ease,
        onUpdate: function () {
          camera.lookAt(0, 0, 0)
        }
      })

      .to(camera.position, {
        x: 1,
        y: 1,
        z: 1,
        duration: 10,
        ease,
      })
  }
}

// window.addEventListener('mousedown', cameraAnimation)
window.addEventListener('DOMContentLoaded', cameraAnimation)

cameraControls.addEventListener('start', () => console.log("Controls start event"))
cameraControls.addEventListener('end', () => console.log("Controls end event"))
//
let mouseX, mouseY
//
if (window.DeviceOrientationEvent) {
  window.addEventListener('deviceorientation', function (eventData) {

    const tiltX = Math.round(eventData.gamma * 2);
    const tiltY = Math.round(eventData.beta * 2);

    deviceOrientationHandler(tiltX, tiltY);

  }, false);
}
//
function deviceOrientationHandler(tiltX, tiltY) {

  mouseX = tiltX;
  mouseY = tiltY;
}
//
//
//===================================================
// TWEAKPANE CHARACTER ACTIONS
//===================================================
const pane = new Pane({ title: "Animations", container: document.getElementById('p--chActions'), expanded: false })
pane.addButton({ title: 'Offended Iddle' })
pane.addButton({ title: 'Neutral Iddle' })
pane.addButton({ title: 'Happy Iddle' })
pane.addButton({ title: 'Walking' })
pane.addButton({ title: 'Standard Walking' })
pane.addButton({ title: 'Running ' })
pane.addButton({ title: 'Running 2' })
pane.addButton({ title: 'Default' })
//===================================================
// Inner_KID 👦🏽    
//===================================================

const gltfLoader = new GLTFLoader()


let allies

let allie_1, allie_2, allie_3, allie_4, allie_5, allie_6

gltfLoader.load('/gltf/theAllies/THE_ALLIES.glb', (gltf) => {

  allies = gltf.scene
  allies.scale.set(0.25, 0.25, 0.25)
  allies.position.set(0, 0, 0)

  console.log(allies.children)

  allie_1 = allies.children[0]
  allie_2 = allies.children[1]
  allie_3 = allies.children[2]
  allie_4 = allies.children[3]
  allie_5 = allies.children[4]
  allie_6 = allies.children[5]

  allie_1.position.set(0, 0, 0)
  allie_1.scale.set(1.5, 1.5, 1.5)

  allie_2.position.set(0, 0, 0)
  allie_2.scale.set(0.025, 0.025, 0.025)


  allie_3.position.set(0, 0, -0.1)
  allie_3.scale.set(0.025, 0.025, 0.025)

  allie_4.position.set(0, 0, -0.05)
  allie_4.scale.set(0.025, 0.025, 0.025)

  allie_5.position.set(0, 0, 0.1)
  allie_5.scale.set(0.025, 0.025, 0.025)

  allie_6.position.set(0, 0, 0.05)
  allie_6.scale.set(0.025, 0.025, 0.025)

  allies.traverse(function (child) {
    if (
      child instanceof THREE.Mesh) {
      child.castShadow = true;
    }
  })

  scene.add(allies)

  const mixer = new THREE.AnimationMixer(allies)
  const action = mixer.clipAction(gltf.animations[0])
  action.play()

  const action1 = mixer.clipAction(gltf.animations[1])
  action1.play()

  const action2 = mixer.clipAction(gltf.animations[2])
  action2.play()

  const action3 = mixer.clipAction(gltf.animations[3])
  action3.play()

  const action4 = mixer.clipAction(gltf.animations[4])
  action4.play()

  const action5 = mixer.clipAction(gltf.animations[5])
  action5.play()

})

// gyro.add(allies)


////////////////////////////////////////////////////////////////////
// ✧ CONTROLLER DRAG CHARACTER
///////////////


const dragSphereGeo = new THREE.SphereGeometry()

const materials = [
  new THREE.MeshPhongMaterial({ color: 0xff0000, transparent: true }),
  new THREE.MeshPhongMaterial({ color: 0x00ff00, transparent: true }),
  new THREE.MeshPhongMaterial({ color: 0x0000ff, transparent: true })
]

const dragSpheres = [
  new THREE.Mesh(dragSphereGeo, materials[0]),
  new THREE.Mesh(dragSphereGeo, materials[1]),
  new THREE.Mesh(dragSphereGeo, materials[2])
]
dragSpheres[0].position.x = -2
dragSpheres[1].position.x = 0
dragSpheres[2].position.x = 2
dragSpheres.forEach((s) => scene.add(s))


const dragcontrols = new THREE.dragControls(dragSpheres, camera, renderer.domElement)
dragcontrols.addEventListener('dragstart', function (event) {
  event.object.materials.opacity = 0.33
})

dragcontrols.addEventListener('dragend', function (event) {
  event.object.materials.opacity = 1
})


////////////////////////////////////////////////////////////////////
// ✧ CONTROLLER CHARACTER TRANSFORM
///////////////

const transformControls = new TransformControls(camera, renderer.domElement)
transformControls.enabled
transformControls.attach(dragSphereGeo)
transformControls.setMode('rotate')
scene.add(transformControls)

window.addEventListener('keydown', function (event) {
  switch (event.code) {
    case 'KeyG':
      transformControls.setMode('translate')
      break
    case 'KeyR':
      transformControls.setMode('rotate')
      break
    case 'KeyT':
      transformControls.setMode('scale')
      break
  }
})


////////////////////////////////////////////////////////////////////
// ✧ STATS
///////////////

const stats = new Stats()
document.body.appendChild(stats.dom)


// -- RENDERING

const clock = new THREE.Clock()
let previousTime = 0

function animate() {

  requestAnimationFrame(animate)

  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  cameraControls.update()

  if (mixer) { mixer.update(deltaTime) }

  renderer.render(scene, camera)

  stats.update()

}

function render() {

  renderer.render(scene, camera)

}

// -- Ω
animate()

//===================================================
// ✧ REFFERENCE LINKS
//===================================================
//-[i]-> https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline
//-[i]-> https://en.wikipedia.org/wiki/KISS_principle
//-[i]-> https://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html
//-[i]-> https://en.wikipedia.org/wiki/Transformation_matrix
//-[i]-> http://learnwebgl.brown37.net/09_lights/lights_attenuation.html
//-[i]-> https://iquilezles.org/articles/
//-[i]-> https://www.donmccurdy.com/2020/06/17/color-management-in-threejs/
//-[i]-> https://themetalmuncher.github.io/fov-calc/
//-[i]-> https://sbcode.net/threejs/gltf-animations-drag/
//-[i]-> http://www.rastertek.com/tutgl40.html
//-[i]-> https://openbase.com/js/vr-ui  
//-[i]-> https://github.com/ocornut/imgui/wiki/Software-using-dear-imgui#applications-engines-and-others
//-[i]-> https://www.youtube.com/playlist?list=PLE211C8C41F1AFBAB [RIGGING CHARACTERS IN BLENDER PLAYLIST]
