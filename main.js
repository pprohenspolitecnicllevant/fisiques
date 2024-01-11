import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import CANNON from "cannon"
import "./style.css"

const scene = new THREE.Scene()

const fov = 60
const aspect = window.innerWidth / window.innerHeight
const near = 0.1
const far = 1000

const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
camera.position.set(0, 3, 5)
camera.lookAt(new THREE.Vector3(0, 0, 0))

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

// Elements visuals///
let plane
let cube1
let cube2
let sphere
/////////////////////

// Elements físics /////
let world
let sphereBody
let planeBody
let cube1Body
let cube2Body
///////////////////////

elements()

fisiques()

const clock = new THREE.Clock()
let oldElapsedTime = 0
let resetTimer = 0
AnimationLoop()
function AnimationLoop() {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - oldElapsedTime
  oldElapsedTime = elapsedTime

  // Update physics
  world.step(1 / 60, deltaTime, 3)
  
  sphere.position.copy(sphereBody.position)

  resetTimer += deltaTime
  if (resetTimer >= 4) {
    sphereBody.position.set(0, 3, 0)
    resetTimer = 0
  } 

  ////

  renderer.render(scene, camera)
  requestAnimationFrame(AnimationLoop)
}

function fisiques() {
  world = new CANNON.World()
  world.gravity.set(0, -9.81, 0)

  const sphereShape = new CANNON.Sphere(0.7)
  sphereBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape: sphereShape,
  })
  world.addBody(sphereBody)

  const cubeShape = new CANNON.Box(new CANNON.Vec3(.5,.5,.5))
  cube1Body = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(-2, -0.5, 0),
    shape: cubeShape,
  })
  world.addBody(cube1Body)

  cube2Body = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(1, 0, 0),
    shape: cubeShape,
  })
  world.addBody(cube2Body)

  const planeShape = new CANNON.Plane()
  planeBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, -1.75, 0),
    shape: planeShape
  })
  planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5)
  world.addBody(planeBody)

}

function elements() {
  //controls
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  // plane
  const planeGeometry = new THREE.PlaneGeometry(100, 100)
  plane = new THREE.Mesh(
    planeGeometry,
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  )
  plane.rotateX(-Math.PI / 2)
  plane.position.y = -1.75
  plane.receiveShadow = true
  scene.add(plane)

  const cubeGeo = new THREE.BoxGeometry(1, 1, 1)
  const cubeMatBasic = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  cube1 = new THREE.Mesh(cubeGeo, cubeMatBasic)
  cube1.castShadow = true
  cube1.position.set(-2, -0.5, 0)
  scene.add(cube1)

  const cubeMatStandard = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
  cube2 = new THREE.Mesh(cubeGeo, cubeMatStandard)
  cube2.position.set(1, 0, 0)
  cube2.castShadow = true
  scene.add(cube2)

  const sphereGeo = new THREE.SphereGeometry(0.7)
  const sphereMat = new THREE.MeshStandardMaterial({ color: 0xffa500 })
  sphere = new THREE.Mesh(sphereGeo, sphereMat)
  sphere.position.set(0, 3, 0)
  sphere.castShadow = true
  scene.add(sphere)

  // llum direccional
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(1, 1, 1)
  directionalLight.castShadow = true
  scene.add(directionalLight)

  // llum d'ambient
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.05) // soft white light
  scene.add(ambientLight)
}

// event javascript per redimensionar de forma responsive
window.addEventListener("resize", () => {
  //actualitzem tamany del renderer, de l'aspect ratio de la càmera, i
  //la matriu de projecció.
  //finalment limitem el pixel ratio a 2 per temes de rendiment
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
