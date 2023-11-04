import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import * as THREE from 'three'

/**
 * 物体插值运动函数
 */
export default class AnimatedTracks {
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
    this.positionList = []
    this.callback = _callback
    this.isStart = false
    this.listID = false
    this.line = ''
    this.geometry = new THREE.BufferGeometry()
    this.viewer = _viewer
  }

  /**
   * 对线段进行分割
   * @param p1 点一
   * @param p2 点二
   * @param yu 分割阈值(米)
   */
  spliceLine (p1, p2, yu = 0.5) {
    const positions = []
    const distance = p1.distanceTo(p2)
    const num = distance / yu
    const xValue = (p1.x - p2.x) / num
    const yValue = (p1.y - p2.y) / num
    const zValue = (p1.z - p2.z) / num
    for (let i = 0; i <= num; i++) {
      positions.push([p1.x + i * xValue, p1.y + i * yValue, p1.z + i * zValue])
    }
    return positions
  }

  drawLine ([x, y, z]) {
    if (!this.line) {
      const material = new THREE.LineBasicMaterial({
        color: 0x0000ff
      })
      const points = []
      points.push(this.position)
      points.push(new THREE.Vector3(x, y, z))
      this.geometry = new THREE.BufferGeometry().setFromPoints(points)
      this.line = new THREE.Line(this.geometry, material)
      this.viewer.scene.add(this.line)
    } else {
      this.geometry.vertices.push(this.position, new THREE.Vector3(x, y, z))
    }
  }

  /**
   * 创建轨迹动画插值
   * @param nextPoi 插入下一个点[x,y,z]数组传入
   * @param time 时间（毫秒）
   * @returns {*}
   */
  insertTween (nextPoi, time = 5000) {
    const nextPoiPosition = new THREE.Vector3(nextPoi[0], nextPoi[1], nextPoi[2])
    this.positionList.push(nextPoiPosition)
    const tempTween = this.createTween(this.model, {
      x: nextPoi[0],
      y: nextPoi[1],
      z: nextPoi[2]
    }, time)
    this.tweenList.push(tempTween)
    if (!this.isStart) tempTween.start() // 插入一个执行动画
  }

  createTween (model, nextPoi, time, Easing = TWEEN.Easing.Linear.None) {
    const that = this
    // 初始化tween，设置变化对象
    const tempTween = new TWEEN.Tween(that.position)
    // 设置变化函数
    tempTween.easing(Easing)
    tempTween.to(nextPoi, time)
    // 动画开始前计算角度
    tempTween.onStart(data => {
      const z = nextPoi.z - model.position.z
      const x = nextPoi.x - model.position.x
      const angle = Math.atan2(z, x)
      model.rotation.y = that.rotationY - angle
      // 判断是否启动动画
      that.isStart = true
    })
    tempTween.onComplete(res => {
      this.isStart = false
      that.positionList.forEach((poi, index) => {
        if (JSON.stringify(poi) === JSON.stringify(res)) that.listID = index
      })
      console.log(that.listID) // 输出执行到哪一个tween
      if (that.tweenList[that.listID + 1]) that.tweenList[that.listID + 1].start()
    })
    // 动画开始后计算位置
    tempTween.onUpdate(() => {
      model.position.set(that.position.x, that.position.y, that.position.z)
      that.callback && that.callback(that.position)
    })
    return tempTween
  }
}
