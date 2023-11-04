import {
  PathGeometry,
  PathPointList
} from './three.path.module.js'
import * as THREE from 'three'

/**
 * 物体插值运动函数
 */
export default class PathLine {
  /**
   * 构建模型动画函数
   * @param _model
   * @param _firstPosition
   */
  constructor (_model, _viewer, _showLine, _callback, _rotationY = Math.PI / 2) {
    this.position = _model.position
    this.model = _model
    this.rotationY = _rotationY
    this.tweenList = []
    this.positionList = [new THREE.Vector3(this.position.x, 1, this.position.z)]
    this.callback = _callback
    this.isStart = false
    this.listID = false
    this.line = ''
    this.geometry = {}
    this.viewer = _viewer
    this.lableBoxPre = null
  }

  setProgress (value = 1) {
    this.geometry.update(this.pathPointList, {
      width: 0.2,
      progress: value / 100 // 设置不闭合
    }, position => {
      // 计算模型角度
      const zValue = position[2] - this.model.position.z
      const xValue = position[0] - this.model.position.x
      const angle = Math.atan2(zValue, xValue)
      this.model.rotation.y = this.rotationY - angle
      this.model.position.set(position[0], position[1], position[2])
    })
  }

  loadRoad (positions) {
    // 添加路径
    const up = new THREE.Vector3(0, 1, 0)
    this.pathPointList = new PathPointList()
    this.pathPointList.set(positions, 0.1, 10, up, false)
    this.geometry = new PathGeometry()// 物体的结构
    this.geometry.update(this.pathPointList, {
      width: 0.2,
      progress: 0 // 设置不闭合
    })
    this.material = new THREE.MeshPhongMaterial({ //  Phong网格材质
      // 颜色贴图
      map: new THREE.TextureLoader().load('/back.png', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      }),
      depthWrite: false,
      transparent: true,
      opacity: 0.9,
      color: 0xff0000,
      side: THREE.FrontSide
    })
    // 网格
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.viewer.scene.add(this.mesh)// 网格添加到场景里面
    this.callback && this.callback(this.mesh)
    return this.mesh
  }
}
