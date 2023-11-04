import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
// import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer'
import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh.js'
import { InteractiveGroup } from 'three/examples/jsm/interactive/InteractiveGroup.js'

import * as THREE from 'three'

export default class Labels {
  constructor (_viewer) {
    this.viewer = _viewer
    this.group = new InteractiveGroup(this.viewer.renderer, this.viewer.camera)
    this.viewer.scene.add(this.group)
  }

  createLabelPlane (obj, poi = { x: 0, y: 0, z: 0 }) {
    const waterGeometry = new THREE.PlaneGeometry(4, 2)
    // 水平、垂直重复次数*
    const material = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load('./label.png', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        // uv两个方向纹理重复数量
        texture.repeat.set(1, 1)
      }),
      transparent: true,
      depthTest: true,
      depthWrite: false, // 无法被选择，鼠标穿透
      opacity: 0.8,
      side: THREE.DoubleSide
    })
    const mesh = new THREE.Mesh(waterGeometry, material)
    mesh.position.set(poi.x + 60, poi.y, poi.z)
    this.viewer.scene.add(mesh)
    return mesh
  }

  /**
   * 添加3d 标签
   * @param position 位置
   * @param html html内容
   */
  addCss2dLabel (position = { x: 0, y: 0, z: 0 }, html = '') {
    const div = document.createElement('div')
    div.style.position = 'absolute'
    div.innerHTML = html
    this.label = new CSS2DObject(div)
    this.label.position.set(position.x, position.y, position.z)
    this.viewer.scene.add(this.label)
    return this.label
  }

  addSpriteLabel (labelWidth, size, name) {
    const canvas = this.makeLabelCanvas(labelWidth, size, name)
    const texture = new THREE.CanvasTexture(canvas)
    // because our canvas is likely not a power of 2
    // in both dimensions set the filtering appropriately.
    texture.minFilter = THREE.LinearFilter
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    const labelMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true
    })
    const label = new THREE.Sprite(labelMaterial)
    label.position.set(0, 50, 0)
    this.viewer.scene.add(label)
    return label
  }

  makeLabelCanvas (baseWidth, size, name) {
    const borderSize = 2
    const ctx = document.createElement('canvas').getContext('2d')
    const font = `${size}px bold sans-serif`
    ctx.font = font
    // measure how long the name will be
    const textWidth = ctx.measureText(name).width

    const doubleBorderSize = borderSize * 2
    const width = baseWidth + doubleBorderSize
    const height = size + doubleBorderSize
    ctx.canvas.width = width
    ctx.canvas.height = height

    // need to set font again after resizing canvas
    ctx.font = font
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'

    ctx.fillStyle = 'blue'
    ctx.fillRect(0, 0, width, height)

    // scale to fit but don't stretch
    const scaleFactor = Math.min(1, baseWidth / textWidth)
    ctx.translate(width / 2, height / 2)
    ctx.scale(scaleFactor, 1)
    ctx.fillStyle = 'white'
    ctx.fillText(name, 0, 0)

    return ctx.canvas
  }

  ///
  // Creates plane mesh
  //
  ///
  createPlane (w, h, position, rotation) {
    var material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      opacity: 0.0,
      side: THREE.DoubleSide
    })

    var geometry = new THREE.PlaneGeometry(w, h)

    var mesh = new THREE.Mesh(geometry, material)

    mesh.position.x = position.x
    mesh.position.y = position.y
    mesh.position.z = position.z

    mesh.rotation.x = rotation.x
    mesh.rotation.y = rotation.y
    mesh.rotation.z = rotation.z

    return mesh
  }

  ///
  // Creates CSS object
  //
  ///

  createCssObject (div, position) {
    // const div = document.createElement('div')
    // div.innerText = '王锐' +
    //   '傻逼' + '<div>sdasda</div>>'
    // div.style.color = 'red'
    // div.style.fontSize = '30px'
    // div.style.position = 'absolute'
    // div.style.top = '400px'
    // div.style.left = '400px'
    // div.style.zIndex = '9'
    // document.body.appendChild(div)
    // const iframe = document.createElement('iframe')
    // console.log(iframe)
    // iframe.src = 'https://blog.csdn.net/weixin_32566515/article/details/111903198'
    // iframe.style.width = w + 'px'
    // iframe.style.height = h + 'px'
    // iframe.style.border = '0px'
    // iframe.style.zIndex = '999'
    // iframe.style.position = 'absolute'
    // iframe.style.top = '0px'
    // iframe.style.left = '0px'
    // div.appendChild(iframe)

    // console.log(this.viewer.statsControls.domElement)
    const cssObject = new HTMLMesh(div)
    cssObject.position.x = position.x
    cssObject.position.y = position.y
    cssObject.position.z = position.z
    this.group.add(cssObject)
  }

  ///
  // Creates 3d webpage object
  //
  ///

  create3dPage (w, h, position, rotation, url) {
    // const plane = this.createPlane(
    //   w, h,
    //   position,
    //   rotation)
    //
    // this.viewer.scene.add(plane)

    this.createCssObject(
      w, h,
      position,
      rotation,
      url)

    // this.viewer.css3dScene.add(cssObject)
  }

  ///
  // Creates material with random color
  //
  ///

  createColoredMaterial () {
    var material = new THREE.MeshBasicMaterial({
      color: Math.floor(Math.random() * 16777215),
      shading: THREE.FlatShading,
      side: THREE.DoubleSide
    })

    return material
  }

  ///
  // Creates 3D geometry to place in the scene
  //
  ///

  create3dGeometry () {
    var mesh1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0, 200, 300, 20, 4),
      this.createColoredMaterial())

    mesh1.position.x = 0
    mesh1.position.y = -300
    mesh1.position.z = 400

    this.viewer.scene.add(mesh1)

    var mesh2 = new THREE.Mesh(
      new THREE.BoxGeometry(200, 200, 200),
      this.createColoredMaterial())

    mesh2.position.x = -300
    mesh2.position.y = -300
    mesh2.position.z = 400

    this.viewer.scene.add(mesh2)

    var mesh3 = new THREE.Mesh(
      new THREE.SphereGeometry(100, 128, 128),
      this.createColoredMaterial())

    mesh3.position.x = 500
    mesh3.position.y = -300
    mesh3.position.z = 400

    this.viewer.scene.add(mesh3)
  }

  /**
   * 移除标签
   */
  removeLight () {
    this.viewer.scene.remove(this.label)
  }
}
