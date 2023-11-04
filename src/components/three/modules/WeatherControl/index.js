import * as THREE from 'three'

export default class WeatherControl {
  skybox = ['daytime', 'dusk', 'night']

  constructor (_viewer) {
    this.viewer = _viewer
  }

  addSun (brightness = 1, x = 200, y = 200, z = 200) {
    this.dirLight = new THREE.DirectionalLight(0xffffff, brightness)
    this.dirLight.intensity = 4
    this.dirLight.position.set(x, y, z)
    this.dirLight.castShadow = true
    this.dirLight.shadow.mapSize.width = 5120
    this.dirLight.shadow.mapSize.height = 5120
    const d = 500
    this.dirLight.shadow.camera.left = -d
    this.dirLight.shadow.camera.right = d
    this.dirLight.shadow.camera.top = d
    this.dirLight.shadow.camera.bottom = -d
    this.dirLight.shadow.camera.near = 1
    this.dirLight.shadow.camera.far = 3500
    this.viewer.scene.add(this.dirLight)
  }

  /**
   * 设置太阳的位置
   * @param position 坐标【3，3，3】
   */
  setSunPosition (position) {
    this.dirLight.position.set(position[0], position[1], position[2])
  }

  /**
   * 添加默认天空盒
   * @param index
   */
  addDefaltSkybox (index = 0) {
    const path = `/resources/skybox/${this.skybox[index]}/` // 设置路径
    const format = '.jpg' // 设定格式
    this.addSkybox(path, format)
  }

  /**
   * 添加天空盒
   * @param path 天空盒地址
   * @param format 图片后缀名
   */
  addSkybox (path, format = '.jpg') {
    const loaderbox = new THREE.CubeTextureLoader()
    const cubeTexture = loaderbox.load([
      path + 'posX' + format,
      path + 'negX' + format,
      path + 'posY' + format,
      path + 'negY' + format,
      path + 'posZ' + format,
      path + 'negZ' + format
    ])
    // 需要把色彩空间编码改一下，原因我上一篇说过的
    cubeTexture.encoding = THREE.sRGBEncoding
    this.viewer.scene.background = cubeTexture
  }
}
