import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import * as dat from 'lil-gui'
import vertex from './shaders/vertex.glsl'
import fragment from './shaders/fragment.glsl'



/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const debug = {}


/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const flagTexture = textureLoader.load('/textures/matcaps/cycles-bubble-2.png')
//const cubeTextureLoader = new THREE.CubeTextureLoader()


debug.StartColor = '#14213d'
debug.EndColor = '#000000'

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.SphereGeometry(1, 32, 32)

// Material
const material = new THREE.RawShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: {
        refractionRatio: {value: 1.02},
        FresnelBias: {value: 0.1},
        FresnelPower: {value: 2},
        FresnelScale: {value: 1},
        uTime: {value: 0},
        uFrequency: {value: new THREE.Vector3(5, 10, 15)},
        tCube: {value: null},
        uStartColor: {value: new THREE.Color(debug.StartColor)},
        uEndColor: {value: new THREE.Color(debug.EndColor)}
    }
})
gui
    .addColor(debug, 'StartColor')
    .onChange(() => {
        material.uniforms.uStartColor.value.set(debug.StartColor)
    })

// Mesh
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

/*const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.jpg',
    '/textures/environmentMaps/0/nx.jpg',
    '/textures/environmentMaps/0/py.jpg',
    '/textures/environmentMaps/0/ny.jpg',
    '/textures/environmentMaps/0/pz.jpg',
    '/textures/environmentMaps/0/nz.jpg'
])
*/

//environmentMap.format = THREE.RGBAFormat;
//const uniforms = THREE.UniformsUtils.clone(material.uniforms)
//scene.background = environmentMap
//uniforms['tCube'].value = environmentMap


const count = geometry.attributes.position.count
const randoms = new Float32Array(count)
for(let i = 0; i < count; i++)
{
    randoms[i] = Math.random()
}
geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}


window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener('mousemove', (event) => {
    cursor.x =  event.clientX / sizes.width - 0.5
    cursor.y =  - (event.clientY / sizes.height - 0.5)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0.25, -0.25, 5)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))



/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //time
    material.uniforms.uTime.value = elapsedTime

    camera.position.y = - scrollY / sizes.height * 2

    const parallaxX = cursor.x
    const parallaxY = cursor.y
    camera.position.x = parallaxX
    camera.position.y = parallaxY

    mesh.rotation.y -= Math.sin(0.1)  * 0.01 

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()