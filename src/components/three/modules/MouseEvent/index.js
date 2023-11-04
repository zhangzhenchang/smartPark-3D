import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'

export default class MouseEvent {
  constructor (_viewer, _isSelect, _callback, _type = 'click') {
    this.viewer = _viewer
    this.isSelect = _isSelect
    this.callback = _callback
    this.type = _type
    this.composer = new EffectComposer(this.viewer.renderer)
    return this
  }

  animate (composer) {
    composer.render()
  }

  startSelect (isSelect = true) {
    // 开始绑定点击事件
    this.stopSelect()
    this.bingEvent = this._event.bind(this, this) // 会是一个新的函数，第一个this与第二个this不一样
    this.viewer.renderer.domElement.addEventListener(this.type, this.bingEvent)
  }

  /**
   * 关闭鼠标事件
   */
  stopSelect () {
    this.viewer.renderer.domElement.removeEventListener(this.type, this.bingEvent)// 第一个this与第二个this不一样
  }

  _event (that, e) {
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    mouse.x = (e.offsetX / that.viewer.renderer.domElement.clientWidth) * 2 - 1
    mouse.y = -(e.offsetY / that.viewer.renderer.domElement.clientHeight) * 2 + 1
    raycaster.setFromCamera(mouse, that.viewer.camera)
    const intersects = raycaster.intersectObject(that.viewer.scene, true)
    if (intersects.length > 0 && intersects[0]) {
      intersects[0] && that.callback(intersects[0].object, intersects[0].point)
    }
  }
}
