import {
    Cache,
    WebGLRenderer,
    ACESFilmicToneMapping,
    PCFSoftShadowMap,
    sRGBEncoding,
    PerspectiveCamera,
    Scene,
    Color, AxesHelper
} from 'three'
// 二维标签渲染器
import {CSS2DRenderer} from 'three/examples/jsm/renderers/CSS2DRenderer'
import {CSS3DRenderer} from 'three/examples/jsm/renderers/CSS3DRenderer'

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import MouseEvent from '../MouseEvent'
import SkyBoxs from '../SkyBoxs'
import Lights from '../Lights'

export default class Viewer {
    /**
     * 构造函数
     * @param id 场景窗体div
     */
    constructor(id) {
        Cache.enabled = true // 开启缓存
        this.id = id
        this.renderer = undefined
        this.scene = undefined
        this.camera = undefined
        this.controls = undefined
        this.statsControls = undefined
        this.animateEventList = []
        this._initViewer()
    }

    /**
     * 添加坐标轴
     */
    addAxis() {
        const axis = new AxesHelper(1000)
        this.scene.add(axis)
    }

    /**
     * 添加状态监测
     */
    addStats() {
        if (!this.statsControls) this.statsControls = new Stats()
        this.statsControls.dom.style.position = 'absolute'
        this.viewerDom.appendChild(this.statsControls.dom)
        // 添加到动画
        this.statsUpdateObject = {
            fun: this._statsUpdate,
            content: this.statsControls
        }
        this.addAnimate(this.statsUpdateObject)
    }

    /**
     * 移除状态检测
     */
    removeStats() {
        if (this.statsControls) this.viewerDom.removeChild(this.statsControls.dom)
        // 添加到动画
        this.statsUpdateObject = {
            fun: this._statsUpdate,
            content: this.statsControls
        }
        this.removeAnimate(this.statsUpdateObject)
    }

    beforeDestroy() {
        this.scene.traverse((child) => {
            if (child.material) {
                child.material.dispose()
            }
            if (child.geometry) {
                child.geometry.dispose()
            }
            child = null
        })
        this.renderer.forceContextLoss()
        this.renderer.dispose()
        this.scene.clear()
    }

    /**
     * 添加全局的动画事件
     * @param animate 函数加参数对象
     * 传入对象 = {
            fun: 函数名称,
            content: 函数参数
        }
     */
    addAnimate(animate) {
        this.animateEventList.push(animate)
    }

    /**
     * 移除全局的动画事件
     * @param animate 函数加参数对象
     * 传入对象 = {
            fun: 函数名称,
            content: 函数参数
        }
     */
    removeAnimate(animate) {
        this.animateEventList.map((val, i) => {
            if (val === animate) this.animateEventList.splice(i, 1)
        })
    }

    /**
     * 开启鼠标事件
     * @param mouseType
     * @param isSelect
     * @param callback
     */
    startSelectEvent(mouseType, isSelect, callback) {
        if (!this.mouseEvent) this.mouseEvent = new MouseEvent(this, isSelect, callback, mouseType)
        this.mouseEvent.startSelect()
    }

    /**
     * 关闭鼠标事件
     */
    stopSelectEvent() {
        if (this.mouseEvent) {
            this.mouseEvent.stopSelect()
        }
    }

    /**
     * 设置背景颜色
     * @param color rgb(4,4,4)
     */
    setBackground(color = 'rgb(4,4,4)') {
        this.scene.background = new Color(color)
    }

    /**
     * 状态更新
     * @param statsControls
     */
    _statsUpdate(statsControls) {
        statsControls.update()
    }

    _initViewer() {
        this._initRenderer()
        // 渲染相机
        this._initCamera()
        // 渲染场景
        this._initScene()
        // 控制器
        this._initControl()
        // 天空盒
        this._initSkybox()
        // 环境光
        this._initLight()
        // 全局调试器
        const that = this

        function animate() {
            requestAnimationFrame(animate)
            that._undateDom()
            that._readerDom()
            // 全局的公共动画函数，添加函数可同步执行
            that.animateEventList.forEach(event => {
                event.fun && event.content && event.fun(event.content)
            })
        }

        animate()
    }

    /**
     * 创建初始化场景界面
     */
    _initRenderer() {
        // 获取画布dom
        this.viewerDom = document.getElementById(this.id)
        // 初始化渲染器
        this.renderer = new WebGLRenderer({
            logarithmicDepthBuffer: true,
            antialias: true, // true/false表示是否开启反锯齿
            alpha: true, // true/false 表示是否可以设置背景色透明
            precision: 'highp', // highp/mediump/lowp 表示着色精度选择
            premultipliedAlpha: true, // true/false 表示是否可以设置像素深度（用来度量图像的分辨率）
            // preserveDrawingBuffer: false, // true/false 表示是否保存绘图缓冲
            // physicallyCorrectLights: true, // true/false 表示是否开启物理光照
        })
        this.renderer.clearDepth();
        // this.renderer.domElement.style.zIndex = 1
        // 默认情况下，js的光强数值不真实。为了使得光强更趋于真实值，应该把渲染器的physicallyCorrectLights属性设为true
        // this.renderer.physicallyCorrectLights = true
        // this.renderer.toneMapping = ACESFilmicToneMapping // 尽管我们的贴图不是HDR，但使用tone mapping可以塑造更真实的效果。
        // this.renderer.toneMappingExposure = 4 // tone mapping的曝光度
        this.renderer.shadowMap.enabled = true // 场景中的阴影自动更新
        // this.renderer.shadowMap.type = PCFSoftShadowMap // 设置渲染器开启阴影贴图，并将类型设为PCFSoftShadowMap
        this.renderer.outputEncoding = sRGBEncoding// 这下我们可以看到更亮的材质，同时这也影响到环境贴图。
        this.viewerDom.appendChild(this.renderer.domElement)// 一个canvas，渲染器在其上绘制输出。
        // 网页标签
        this.labelRenderer = new CSS2DRenderer()
        this.labelRenderer.domElement.style.zIndex = 2
        this.labelRenderer.domElement.style.position = 'absolute'
        this.labelRenderer.domElement.style.top = '0px'
        this.labelRenderer.domElement.style.left = '0px'
        this.labelRenderer.domElement.style.pointerEvents = 'none'// 避免HTML标签遮挡三维场景的鼠标事件
        this.viewerDom.appendChild(this.labelRenderer.domElement)
        // 三维标签
        this.css3DRenderer = new CSS3DRenderer()
        this.css3DRenderer.domElement.style.zIndex = 0
        this.css3DRenderer.domElement.style.position = 'absolute'
        this.css3DRenderer.domElement.style.top = '0px'
        this.css3DRenderer.domElement.style.left = '0px'
        this.css3DRenderer.domElement.style.pointerEvents = 'none'// 避免HTML标签遮挡三维场景的鼠标事件
        this.viewerDom.appendChild(this.css3DRenderer.domElement)
    }

    _initCamera() {
        // 渲染相机
        this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500000)
        this.camera.position.set(50, 0, 50)
        this.camera.lookAt(0, 0, 0)
    }

    _initScene() {
        // 渲染场景
        this.scene = new Scene()
        this.css3dScene = new Scene()
        this.scene.background = new Color('rgb(5,24,38)')
    }

    _initControl(option) {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.enableDamping = false
        this.controls.screenSpacePanning = false // 定义平移时如何平移相机的位置 控制不上下移动
    }

    // 更新dom大小
    _undateDom() {
        const that = this
        that.controls.update()
        // 更新参数
        that.camera.aspect = that.viewerDom.clientWidth / that.viewerDom.clientHeight // 摄像机视锥体的长宽比，通常是使用画布的宽/画布的高
        that.camera.updateProjectionMatrix() // 更新摄像机投影矩阵。在任何参数被改变以后必须被调用,来使得这些改变生效
        that.renderer.setSize(that.viewerDom.clientWidth, that.viewerDom.clientHeight)
        that.renderer.setPixelRatio(window.devicePixelRatio) // 设置设备像素比
        that.labelRenderer.setSize(that.viewerDom.clientWidth, that.viewerDom.clientHeight)
        that.css3DRenderer.setSize(that.viewerDom.clientWidth, that.viewerDom.clientHeight)
    }

    // 渲染dom
    _readerDom() {
        this.renderer.render(this.scene, this.camera)
        this.labelRenderer.render(this.scene, this.camera)
        this.css3DRenderer.render(this.css3dScene, this.camera)
    }

    // 添加skybox
    _initSkybox() {
        if (!this.skyboxs) this.skyboxs = new SkyBoxs(this)
        this.skyboxs.addSkybox()
    }

    // 灯光处理
    _initLight() {
        if (!this.lights) this.lights = new Lights(this)
    }
}
