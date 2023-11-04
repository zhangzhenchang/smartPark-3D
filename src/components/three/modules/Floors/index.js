import {
    PlaneGeometry,
    GridHelper,
    MeshPhongMaterial,
    Mesh,
    TextureLoader,
    RepeatWrapping
} from 'three'
import {Reflector} from './Reflector.js' // 镜面
import {Water} from 'three/examples/jsm/objects/Water.js'

/**
 * 地板地面类
 */
export default class Floors {
    constructor(_viewer) {
        this.viewer = _viewer
        this.scene = _viewer.scene
    }

    createGrid() {
        const grid = new GridHelper(100, 100, 0xFF4500, 0x444444)
        grid.position.set(0, -0.1, 0)
        this.scene.add(grid)
    }

    createReflector() {
        const geometry = new PlaneGeometry(1000, 1000)
        const groundMirror = new Reflector(geometry, {
            clipBias: 1,
            textureWidth: window.innerWidth * window.devicePixelRatio,
            textureHeight: window.innerHeight * window.devicePixelRatio,
            color: 0xFFFFFF
        })
        groundMirror.rotateX(-Math.PI / 2)
        groundMirror.position.set(0, -0.1, 0)
        this.scene.add(groundMirror)
    }

    createPlane() {
        const waterGeometry = new PlaneGeometry(100, 100)
        // 水平、垂直重复次数*
        const material = new MeshPhongMaterial({
            color: 0x00ff00,
            side: 2,
        })
        const mesh = new Mesh(waterGeometry, material)
        mesh.receiveShadow = true
        mesh.rotation.x = -Math.PI / 2
        mesh.position.y = -0.01
        this.scene.add(mesh)
    }

    createWater(size = [10000, 10000], position = [0, 0, 0], speed = 1) {
        const waterGeometry = new PlaneGeometry(size[0], size[1])
        this.water = new Water(
            waterGeometry, {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new TextureLoader().load('/resources/textures/waternormals.jpg', function (texture) {
                    texture.wrapS = texture.wrapT = RepeatWrapping
                }),
                waterColor: 0x001e0f,
                distortionScale: 3.7
            }
        )
        this.water.rotation.x = -Math.PI / 2
        this.water.position.set(position[0], position[1], position[2])
        this.water.material.uniforms.sunDirection.value.normalize()
        this.scene.add(this.water)
        this.viewer.addAnimate({
            fun: function run(water) {
                water.material.uniforms.time.value += speed / 1000
            },
            content: this.water
        })
    }
}
