import * as THREE from 'three'

/**
 * 场景天空盒
 */
export default class SkyBoxs {
  skybox = ['daytime', 'dusk', 'night']
  constructor (_viewer) {
    this.viewer = _viewer
  }

  /**
   * 添加雾效果
   */
  addFog (color = 'rgb(9,9,9)', near = 0.01, far = 50) {
    this.viewer.scene.fog = new THREE.Fog(new THREE.Color(color), near, far)
  }

  /**
   * 移除雾效果
   */
  removeFog () {
    this.viewer.scene.fog = null
  }

  /**
   * 添加默认天空盒
   * @param index
   */
  addSkybox (index = 0) {
    const path = `resources/skybox/${this.skybox[index]}/` // 设置路径
    const format = '.jpg' // 设定格式
    this.setSkybox(path, format)
  }

  /**
   * 自定义添加天空盒
   * @param path 天空盒地址
   * @param format 图片后缀名
   */
  setSkybox (path, format = '.jpg') {
    const loaderbox = new THREE.CubeTextureLoader()
    const cubeTexture = loaderbox.load([
      path + 'posx' + format,
      path + 'negx' + format,
      path + 'posy' + format,
      path + 'negy' + format,
      path + 'posz' + format,
      path + 'negz' + format
    ])
    // 需要把色彩空间编码改一下，原因我上一篇说过的
    cubeTexture.encoding = THREE.sRGBEncoding
    this.viewer.scene.background = cubeTexture
  }
}
