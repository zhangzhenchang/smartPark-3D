import * as THREE from 'three'

/**
 * 通过path构建墙体
 * option =>
 * params height path material expand(是否需要扩展路径)
 * **/
const creatWallByPath = ({
  height = 10,
  path = [],
  material,
  expand = true
}) => {
  let verticesByTwo = null
  // 1.处理路径数据  每两个顶点为为一组
  if (expand) {
    // 1.1向y方向拉伸顶点
    verticesByTwo = path.reduce((arr, [x, y, z]) => {
      return arr.concat([
        [
          [x, y, z],
          [x, y + height, z]
        ]
      ])
    }, [])
  } else {
    // 1.2 已经处理好路径数据
    verticesByTwo = path
  }
  // 2.解析需要渲染的四边形 每4个顶点为一组
  const verticesByFour = verticesByTwo.reduce((arr, item, i) => {
    if (i === verticesByTwo.length - 1) return arr
    return arr.concat([[item, verticesByTwo[i + 1]]])
  }, [])
  // 3.将四边形面转换为需要渲染的三顶点面
  const verticesByThree = verticesByFour.reduce((arr, item) => {
    const [[point1, point2], [point3, point4]] = item
    return arr.concat(
      ...point2,
      ...point1,
      ...point4,
      ...point1,
      ...point3,
      ...point4
    )
  }, [])
  const geometry = new THREE.BufferGeometry()
  // 4. 设置position
  const vertices = new Float32Array(verticesByThree)
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  // 5. 设置uv 6个点为一个周期 [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1]

  // 5.1 以18个顶点为单位分组
  const pointsGroupBy18 = new Array(verticesByThree.length / 3 / 6)
    .fill(0)
    .map((item, i) => {
      return verticesByThree.slice(i * 3 * 6, (i + 1) * 3 * 6)
    })
  // 5.2 按uv周期分组
  const pointsGroupBy63 = pointsGroupBy18.map((item, i) => {
    return new Array(item.length / 3)
      .fill(0)
      .map((it, i) => item.slice(i * 3, (i + 1) * 3))
  })
  // 5.3根据BoundingBox确定uv平铺范围
  geometry.computeBoundingBox()
  const { min, max } = geometry.boundingBox
  const rangeX = max.x - min.x
  const uvs = [].concat(
    ...pointsGroupBy63.map((item) => {
      const point0 = item[0]
      const point5 = item[5]
      const distance =
        new THREE.Vector3(...point0).distanceTo(new THREE.Vector3(...point5)) /
        (rangeX / 10)
      return [0, 1, 0, 0, distance, 1, 0, 0, distance, 0, distance, 1]
    })
  )
  geometry.setAttribute(
    'uv',
    new THREE.BufferAttribute(new Float32Array(uvs), 2)
  )
  const meshMat =
    material ||
    new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      side: THREE.DoubleSide
    })
  return new THREE.Mesh(geometry, meshMat)
}

/**
 * 创建流体墙体材质
 * option =>
 * params bgUrl flowUrl
 * **/
const createFlowWallMat = () => {
  return new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('./back.png', function (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    }),
    transparent: true,
    opacity: 0.3,
    depthWrite: true,
    depthTest: true,
    side: THREE.DoubleSide
  })
}

export { creatWallByPath, createFlowWallMat }
