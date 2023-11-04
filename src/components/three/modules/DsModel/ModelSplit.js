import {
  Vector3,
  Box3,
  Mesh
} from 'three'

/**
 * 使用方法：
 * 1、调用setSplitModel函数将要拆分的模型传入预处理
 * 然后两种控制爆炸方式
 * （1）实时更新
 *      调用startSplit()/quitSplit()函数开始爆炸/恢复
 *      需要在three的animate函数中调用update函数
 * （2）滑动条
 *      调用setValue函数把滑动条的值传入。
 */
export default class ModelSplit {
  constructor () {
    this.meshList = []
    this.running = false
    this.targetSplitValue = 0
    this.currentSplitValue = 0
    this.offset = 1

    this.splitScale = 5 // 影响拆分距离，就是mesh的包围盒中心与爆炸中心的距离的倍率
    this.splitSpeed = 100// 影响拆分速度，反比例

    this.mode = 2
    // eslint-disable-next-line eqeqeq
    if (this.mode == 2) {
      this.splitScale = 0.3 // 影响拆分距离，就是mesh的包围盒中心与爆炸中心的距离的倍率
      this.splitSpeed = 50// 影响拆分速度，反比例
    }
  }

  setSplitModel (model) {
    if (!model || model instanceof Mesh) {
      console.warn('只能处理Scene、Object3D、Group')
      return
    }
    this.quit()
    this.meshList = []

    // 计算模型整体包围盒中心作为爆炸中心
    model.updateMatrixWorld()
    var box = new Box3().expandByObject(model)
    var maxLength = box.max.clone().distanceTo(box.min)
    var center
    // eslint-disable-next-line eqeqeq
    if (this.mode == 1) {
      center = box.getCenter(new Vector3())
    } else { // 爆炸中心由子mesh的包围盒中心决定
      center = new Vector3()
      var subBox
      var subCenter
      var count = 0
      model.traverse(node => {
        // eslint-disable-next-line eqeqeq
        if (node.type == 'Mesh') {
          // 分别计算每个mesh的包围盒中心，其与爆炸中心连线作为爆炸方向
          subBox = new Box3().expandByObject(node)
          subCenter = subBox.getCenter(new Vector3())
          center = center.clone().add(subCenter)
          count++
        }
      })
      center = center.clone().multiplyScalar(1 / count)
    }

    model.traverse(node => {
      // eslint-disable-next-line eqeqeq
      if (node.type == 'Mesh') {
        // 分别计算每个mesh的包围盒中心，其与爆炸中心连线作为爆炸方向
        const subBox = new Box3().expandByObject(node)
        const meshCenter = subBox.getCenter(new Vector3())
        node._splitSrcPos = node.getWorldPosition(new Vector3())

        let subSpeed
        // eslint-disable-next-line eqeqeq
        if (this.mode == 1) {
          subSpeed = {
            x: (meshCenter.x - center.x) * this.splitScale / this.splitSpeed,
            y: (meshCenter.y - center.y) * this.splitScale / this.splitSpeed,
            z: (meshCenter.z - center.z) * this.splitScale / this.splitSpeed
          }
        } else {
          const targetPos = meshCenter.clone().add(meshCenter.clone().sub(center).normalize().multiplyScalar(maxLength))
          // 这里计算各个轴向分速度，这样可以使用滑动条控制进度
          subSpeed = {
            x: (targetPos.x - center.x) * this.splitScale / this.splitSpeed,
            y: (targetPos.y - center.y) * this.splitScale / this.splitSpeed,
            z: (targetPos.z - center.z) * this.splitScale / this.splitSpeed
            // x:(meshCenter.x-center.x) * this.splitScale / this.splitSpeed,
            // y:(meshCenter.y-center.y) * this.splitScale / this.splitSpeed,
            // z:(meshCenter.z-center.z) * this.splitScale / this.splitSpeed,
          }
        }

        node._splitSpeed = subSpeed
        this.meshList.push(node)
      }
    })
    this.currentSplitValue = 0
    this.targetSplitValue = 0
    this.running = false
  }

  /**
   * 开始爆炸
   */
  startSplit () {
    this.targetSplitValue = this.splitSpeed
    this.currentSplitValue = 0
    this.offset = 1
    this.running = true
    this.isQuit = false
  }

  /**
   * 开始反向爆炸（还原）
   */
  quitSplit () {
    this.targetSplitValue = 0
    this.currentSplitValue = this.splitSpeed
    this.offset = -1
    this.running = true
    this.isQuit = true
  }

  /**
   * 退出拆分时还原
   */
  quit () {
    // eslint-disable-next-line eqeqeq
    if (this.currentSplitValue != 0 && this.meshList.length > 0) {
      for (var i = 0; i < this.meshList.length; i++) {
        const node = this.meshList[i]
        node.position.copy(node._splitSrcPos)
      }
      this.currentSplitValue = 0
      this.targetSplitValue = 0
    }
  }

  /**
   * 如果用滑动条控制时将滑动条的值传入这个函数
   * @param {*} value [0,1]的值，表示爆炸进度
   */
  setValue (value) {
    if (value < 0) value = 0
    if (value > 1) value = 1
    this.currentSplitValue = value * this.splitSpeed
    for (var i = 0; i < this.meshList.length; i++) {
      const node = this.meshList[i]
      const x = node._splitSpeed.x * this.currentSplitValue + node._splitSrcPos.x
      const y = node._splitSpeed.y * this.currentSplitValue + node._splitSrcPos.y
      const z = node._splitSpeed.z * this.currentSplitValue + node._splitSrcPos.z
      node.parent.updateMatrixWorld()
      const invMat = node.parent.matrixWorld.clone().invert()
      const pos = new Vector3(x, y, z).applyMatrix4(invMat)
      node.position.copy(pos)
    }
  }

  /**
   * 更新
   * @returns
   */
  update () {
    if (this.running && this.meshList.length > 0) {
      // eslint-disable-next-line eqeqeq
      if (this.currentSplitValue != this.targetSplitValue) {
        this.currentSplitValue += this.offset
      }

      for (var i = 0; i < this.meshList.length; i++) {
        const node = this.meshList[i]
        const x = node._splitSpeed.x * this.currentSplitValue + node._splitSrcPos.x
        const y = node._splitSpeed.y * this.currentSplitValue + node._splitSrcPos.y
        const z = node._splitSpeed.z * this.currentSplitValue + node._splitSrcPos.z
        node.parent.updateMatrixWorld()
        const invMat = node.parent.matrixWorld.clone().invert()
        const pos = new Vector3(x, y, z).applyMatrix4(invMat)
        node.position.copy(pos)
      }

      // eslint-disable-next-line eqeqeq
      if (this.currentSplitValue == this.targetSplitValue) {
        this.running = false

        // eslint-disable-next-line eqeqeq
        if (this.isQuit == true) {
          this.quit()
          this.isQuit = false
        }
      }
    }
  }
}
