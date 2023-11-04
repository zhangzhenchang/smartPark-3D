import * as THREE from 'three'
import {clone} from 'three/examples/jsm/utils/SkeletonUtils.js'
import DsModelSplit from './ModelSplit'

/**
 * 模型对象，带相关函数
 */
export default class DsModel {
    /**
     * 模型对象，带相关函数
     */
    constructor(_model, _viewer) {
        this.model = _model
        this.object = _model.scene || _model // 模型内部的模型对象，不晓得threejs里面要叫scene,跟场景的scene不是一个东西
        this.viewer = _viewer
        this.clock = new THREE.Clock()
        this.animaIndex = -1 // 模型动画
    }

    /**
     * 获取模型大小和位置
     */
    getBox() {
        this.object.updateMatrixWorld()
        const box = new THREE.Box3().setFromObject(this.object)
        return box
    }

    /**
     * 设置模型到原点位置
     */
    setCenter() {
        this.object.updateMatrixWorld()
        // 获得包围盒得min和max
        const box = new THREE.Box3().setFromObject(this.object)
        const center = box.getCenter(new THREE.Vector3())
        this.object.position.x += this.object.position.x - center.x
        this.object.position.y += this.object.position.y - center.y
        this.object.position.z += this.object.position.z - center.z
    }

    /**
     * 设置模型比例
     * @param x 可以只填写一个参数
     * @param y 纵轴缩放
     * @param z 横轴缩放
     */
    setScalc(x, y, z) {
        this.object.scale.set(x, y || x, z || x)
    }

    /**
     * 求模型的长宽高
     */
    getLength() {
        const box = new THREE.Box3();
        box.setFromObject(this.object);
        const size = box.getSize(new THREE.Vector3())
        return size
    }

    /**
     * 设置模型缩放
     * @param x x横轴旋转
     * @param y 纵轴旋转
     * @param z z横轴旋转
     */
    setRotation(x, y, z) {
        if (x) this.object.rotation.x = x
        if (y) this.object.rotation.y = y
        if (z) this.object.rotation.z = z
    }

    /**
     * 设置模型位置
     * @param x x坐标
     * @param y y坐标
     * @param z z坐标
     * @param isRotation 是否根据传入坐标进行模型旋转
     */
    setPosition([x, y, z], isRotation = false) {
        if (isRotation) {
            const zValue = z - this.model.position.z
            const xValue = x - this.model.position.x
            const angle = Math.atan2(zValue, xValue)
            this.object.rotation.y = this.rotationY - angle
        }
        this.object.position.set(x, y, z)
    }

    /**
     * 克隆模型
     * @param x
     * @param y
     * @param z
     * @returns {*}
     */
    cloneModel([x, y, z] = [0, 0, 0]) {
        const newScene = {...this.model}
        const newModel = clone(this.object)
        newModel.position.set(x, y, z)
        this.viewer.scene.add(newModel)
        newScene.scene = newModel
        return new DsModel(newScene, this.viewer)
    }

    /**
     * 设置模型动画
     * @param i 选择模型动画进行播放
     */
    startAnima(i = 0) {
        this.animaIndex = i
        if (!this.mixer) this.mixer = new THREE.AnimationMixer(this.object)
        if (this.model.animations.length < 1) return
        this.mixer.clipAction(this.model.animations[i]).play()
        // 传入参数需要将函数与函数参数分开，在运行时填入
        this.animaObject = {
            fun: this._updateAnima,
            content: this
        }
        this.viewer.addAnimate(this.animaObject)
    }

    stopAnima() {
        if (this.model.animations.length < 1) return
        if (!this.mixer || !this.mixer.clipAction) return
        this.mixer.clipAction(this.model.animations[this.animaIndex]).stop()
        if (this.animaObject) this.viewer.removeAnimate(this.animaObject)
    }

    _updateAnima(e) {
        e.mixer.update(e.clock.getDelta())
    }

    /**
     * 开启模型阴影 数组中移除阴影
     */
    openCastShadow(names = []) {
        this.model.scene.traverse(mesh => {
            if (mesh.type === 'Mesh' && names.indexOf(mesh.name) === -1) {
                mesh.frustumCulled = false
                mesh.material.side = THREE.DoubleSide
                mesh.castShadow = true
            }
        })
    }

    /**
     * 接收阴影
     * @param names 数组中的可以接收阴影
     */
    openReceiveShadow(names = []) {
        this.model.scene.traverse(mesh => {
            if (names.length === 0) mesh.receiveShadow = true
            else if (names.indexOf(mesh.name) !== -1) mesh.receiveShadow = true
        })
    }

    /**
     * 获取模型集合
     * @param callback 返回模型集合
     */
    forEach(callback) {
        const temp = []
        this.model.scene.traverse(mesh => {
            if (mesh.isMesh) temp.push(mesh)
        })
        // 避免数据冲突
        temp.forEach(item => {
            callback && callback(item)
        })
    }

    /**
     * 关闭模型阴影
     */
    closeShadow() {
        this.model.scene.traverse(mesh => {
            mesh.castShadow = false
            mesh.receiveShadow = false
        })
    }

    /**
     * 设置模型炫酷 模式
     * @param option 颜色和透明度 颜色需要使用）0x 后面16进制颜色
     */
    setColorCool(color = 'rgb(255,255,255)', opacity = 0.05) {
        const that = this
        if (!this.isSaveMaterial) that.Materials = []
        this.model.scene.traverse(model => {
            if (model.isMesh) {
                if (!this.isSaveMaterial) that.Materials.push(model.material)
                model.material = new THREE.MeshBasicMaterial({
                    side: THREE.DoubleSide,
                    transparent: true,
                    depthTest: false,
                    depthWrite: true, // 无法被选择，鼠标穿透
                    color: new THREE.Color(color),
                    opacity: opacity
                })
            }
        })
        this.isSaveMaterial = true
    }

    /**
     * 设置模型炫酷 模式
     * @param material 模型材质
     */
    setMaterialCool(material = new THREE.MeshBasicMaterial()) {
        const that = this
        if (!this.isSaveMaterial) that.Materials = []
        this.model.scene.traverse(model => {
            if (model.isMesh) {
                if (!this.isSaveMaterial) that.Materials.push(model.material)
                model.material = material
            }
        })
        this.isSaveMaterial = true
    }

    /**
     * 设置模型默认模式
     */
    setCoolDefault() {
        let i = 0
        const that = this
        this.model.scene.traverse(model => {
            if (model.isMesh) {
                model.material = that.Materials[i]
                i++
            }
        })
    }

    /**
     * 设置模型炸开
     */
    startBomb() {
        if (!this.DsModelSplit) {
            this.DsModelSplit = new DsModelSplit()
            this.DsModelSplit.setSplitModel(this.object)
        }
        this.DsModelSplit.startSplit()
        // 传入参数需要将函数与函数参数分开，在运行时填入
        this.splitObject = {
            fun: this._splitUpdate,
            content: this.DsModelSplit
        }
        this.viewer.addAnimate(this.splitObject)
        setTimeout(() => {
            this.viewer.removeAnimate(this.splitObject)
        }, 5000)
    }

    _splitUpdate(DsModelSplit) {
        DsModelSplit.update()
    }

    /**
     * 结束炸开模式
     */
    quitBomb() {
        this.DsModelSplit.quitSplit()
        // 传入参数需要将函数与函数参数分开，在运行时填入
        this.splitObject = {
            fun: this._splitUpdate,
            content: this.DsModelSplit
        }
        this.viewer.addAnimate(this.splitObject)
        setTimeout(() => {
            this.viewer.removeAnimate(this.splitObject)
        }, 5000)
    }

    /**
     * 设置着色器
     */
    setShader(vertexShader = '', fragmentShader = '', uniforms = '') {
        this.model.scene.traverse(mesh => {
            if (mesh.isMesh) {
                mesh.material = new THREE.ShaderMaterial({
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader,
                    uniforms: uniforms,
                    side: THREE.DoubleSide,
                    transparent: true,
                    depthTest: false,
                })
            }
        })
    }
}
