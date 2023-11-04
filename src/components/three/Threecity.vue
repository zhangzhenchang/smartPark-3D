<template>
  <div class="scene">
    <div id="jindu-text-con">
      正在加载模型请稍等：<span id="jindu-text"></span>
      <div class="jindu-con">
        <div id="jindu"></div>
      </div>
    </div>
    <video id="videoContainer" style="position:absolute;top:0px;left:0px;z-index:100;visibility: hidden"></video>
    <div class="scene" id="viewer-container"></div>
    <div class="panel">
      <div class="main">
        <li class="tools-li" @click="resetScene">
          <p class="tools-name">场景重置</p>
        </li>
        <li class="tools-li" @click="autoRotateClick">
          <p class="tools-name">{{ !autoRotate ? '自动旋转' : '停止选择' }}</p>
        </li>
        <li class="tools-li" @click="billboardView">
          <p class="tools-name">视频视角</p>
        </li>
        <li class="tools-li" @click="driverView">
          <p class="tools-name">司机视角</p>
        </li>
      </div>
    </div>
  </div>

</template>

<script>
import modules from "./modules/index.js";
import * as THREE from "three";
import gsap from "gsap";

let viewer = null
let office = null
let oldOffice = {}
let gltf75 = {}
let tree_animate = null
let cityv1 = null
let modelSelectName = null
let modelMoveName = null
let isModelSelectName = false
let che, cheLable
// const gui = new dat.GUI();
export default {
  name: "Three",
  data() {
    return {
      autoRotate: false,
      isDriver: false,
    }
  },
  mounted() {

    //判断是否网址

    this.init();
  },
  destroyed() {
    console.log(1111333)
  },
  methods: {
    //司机视角
    driverView() {
      this.isDriver = !this.isDriver
    },
    //切换广告牌视角
    billboardView() {
      this.isDriver = false
      gsap.to(viewer.camera.position, {
        x: 4,
        y: 20,
        z: 5,
        duration: 2,
        ease: "power1.inOut",
        onComplete: () => {
        },
      });
      gsap.to(viewer.controls.target, {
        x: 4,
        y: 20,
        z: -15,
        duration: 2,
        ease: "power1.inOut",
        onComplete: () => {
        },
      });
    },
    autoRotateClick() {
      viewer.controls.autoRotate = !viewer.controls.autoRotate
      this.autoRotate = viewer.controls.autoRotate
    },
    resetScene() {
      gsap.to(viewer.camera.position, {
        x: 17,
        y: 10,
        z: 52,
        duration: 2,
        ease: "Bounce.inOut",
      });
      gsap.to(viewer.controls.target, {
        x: 0,
        y: 0,
        z: 0,
        duration: 2,
        ease: "power1.inOut",
        onComplete: () => {
        },
      });
      gsap.to(viewer.scene.children.find(o => o.name == '人').rotation, {
        y: 0,
        duration: 2,
        ease: "power1.inOut",
      });
      this.isDriver = false
      cheLable.visible = true
      viewer.scene.children[viewer.scene.children.findIndex(o => o.name == '快递车')].visible = true
      viewer.scene.children[viewer.scene.children.findIndex(o => o.name == '树')].visible = true
      viewer.scene.children[viewer.scene.children.findIndex(o => o.name == 'cityv1')].visible = true
      viewer.scene.children[viewer.scene.children.findIndex(o => o.name == '实验楼')] = gltf75.clone()
      viewer.scene.children[viewer.scene.children.findIndex(o => o.name == '办公大厅')] = office.object = oldOffice.clone()
      modelSelectName = null
      modelMoveName = null
      isModelSelectName = false
    },
    init() {
      let that = this
      let jindu_text_con = document.getElementById('jindu-text-con');
      let jindu_text = document.getElementById('jindu-text');
      let jindu = document.getElementById('jindu');

      viewer = new modules.Viewer('viewer-container') //初始化场景
      // viewer.addAxis()
      let labels = new modules.Labels(viewer) //初始化场景
      let skyBoxs = new modules.SkyBoxs(viewer)//添加天空盒和雾化效果
      // let EffectComposer = new modules.EffectComposer(viewer)//添加天空盒和雾化效果
      skyBoxs.addSkybox(2)
      viewer.camera.position.set(17, 10, 52) //设置相机位置
      //限制controls的上下角度范围
      viewer.controls.maxPolarAngle = Math.PI / 2.1;
      let lights = new modules.Lights(viewer)
      let ambientLight = lights.addAmbientLight()
      ambientLight.setOption({color: 0xffffff, intensity: 1})
      lights.addDirectionalLight([100, 100, -10], {
        color: 'rgb(253,253,253)',
        intensity: 3,
        castShadow: true,
      })
      let modeloader = new modules.ModelLoder(viewer)
      //添加视频纹理
      let video = document.getElementById('videoContainer');
      video.src = "bi.mp4"; // 设置视频地址
      video.autoplay = "autoplay"; //要设置播放
      video.loop = "loop"; //要设置循环播放
      video.muted = "muted"; //要设置静音
      let texture = new THREE.VideoTexture(video)

      //停车场栅栏
      let Mesh26
      let isopen = false
      let tiemen = {}
      modeloader.loadModelToScene('city-v1.glb', _model => {
        _model.object.name = 'cityv1'
        _model.openCastShadow()
        _model.openReceiveShadow()
        _model.object.children.forEach((item, index) => {
          if (item.name === 'Mesh26') {
            //平移
            Mesh26 = item
            gsap.to(item.scale, {
              x: item.scale.x / 8,
              duration: 5,
              ease: "power1.inOut",
              onComplete: () => {
                makeCurve()
                isopen = true
              }
            });
          }
        })
        tiemen = tiemen = {
          fun: moveOnCurve,
          content: che
        }
        viewer.addAnimate(tiemen)
        cityv1 = _model.object.clone()
      }, (progress) => {
        progress = Math.floor(progress * 100)
        jindu_text.innerText = progress + '%';
        jindu.style.width = progress + '%'
        if (progress === 100) {
          jindu_text_con.style.display = 'none'
        }
      }, (error) => {
        console.log(error)
      })

      modeloader.loadModelToScene('zuo.glb', _model => {
        office = _model
        office.openCastShadow()
        office.openReceiveShadow()
        //旋转360度
        office.object.rotation.y = Math.PI
        office.object.position.set(16, 0, -5)
        office.object.scale.set(0.2, 0.2, 0.2)
        office.object.name = '办公大厅'
        office.object.children.forEach(item => {
          item.name = item.name.replace('zuo', '')
          if (item.name == 'ding') {
            item.name = 6
          }
          item.name--
        })
        office.object.children.sort((a, b) => a.name - b.name).forEach(v => {
          v.name = 'zuo' + v.name
        })
        office.forEach(child => {
          if (child.isMesh) {
            child.frustumCulled = false
            child.material.emissive = child.material.color;
            child.material.emissiveMap = child.material.map;
            child.material.emissiveIntensity = 1.2
            child.material.envmap = viewer.scene.background
          }
        })
        oldOffice = office.object.clone()
        let box = office.getBox()
        labels.addCss2dLabel({
          x: box.max.x / 2,
          y: box.max.y,
          z: box.max.z
        }, `<span class="label">${_model.object.name}</span>`)
        gsap.to(labels.label.position, {
          y: box.max.y + 2,
          repeat: -1,
          yoyo: true,
          duration: 2,
          ease: "Bounce.inOut",
        });
      })

      modeloader.loadModelToScene('75.gltf', _model => {
        _model.openCastShadow()
        _model.openReceiveShadow()
        _model.object.rotateY(Math.PI / 2)
        _model.object.position.set(-17, 0, 5)
        _model.object.scale.set(0.7, 0.7, 0.7)
        _model.object.name = '实验楼'
        gltf75 = _model.object.clone()
        let box = _model.getBox()
        labels.addCss2dLabel({
          x: box.max.x,
          y: box.max.y,
          z: box.max.z
        }, `<span class="label">${_model.object.name}</span>`)
        gsap.to(labels.label.position, {
          y: box.max.y + 2,
          repeat: -1,
          yoyo: true,
          duration: 2,
          ease: "Bounce.inOut",
        });
      })

      modeloader.loadModelToScene('billboard_-_lowpoly.glb', _model => {
        _model.openCastShadow()
        _model.object.position.set(4, -20, -35)
        _model.object.rotateY(-Math.PI / 2)
        _model.object.scale.set(2.7, 2.7, 2.7)
        _model.object.name = '广告牌'
        let Object_6 = _model.object.getObjectByName('Object_6')
        Object_6.material = new THREE.MeshBasicMaterial({
          map: texture, // 设置纹理贴图
          side: THREE.DoubleSide,
          transparent: true,
        }); //材质对象Material
        let box = _model.getBox()
        modeloader.loadModelToScene('drone/wrj.glb', res => {
          res.openCastShadow()
          res.object.position.set(16, 12, 5)
          res.object.scale.set(0.3, 0.3, 0.3)
          res.object.name = '无人机'
          res.startAnima(0)
          gsap.to(res.object.position, {
            x: _model.object.position.x,
            y: box.max.y,
            z: _model.object.position.z,
            repeat: -1,
            yoyo: true,
            duration: 13,
            ease: "Expo.inOut",
          })
        })
      })

      modeloader.loadModelToScene('car13.gltf', _model => {
        che = _model
        _model.openCastShadow()
        _model.openReceiveShadow()
        _model.object.position.set(11.5, 0, 18)
        _model.object.scale.set(1, 1, 1)
        _model.object.name = '快递车'
        let boxx = _model.getBox()
        // let center = boxx.getCenter(new THREE.Vector3())
        // // //相机跟随
        // viewer.camera.position.set(center.x, center.y, center.z)
        // viewer.camera.lookAt(center)
        cheLable = labels.addCss2dLabel({
          x: boxx.max.x,
          y: boxx.max.y + 2,
          z: boxx.max.z
        }, `<span class="label">${_model.object.name}</span>`)
      })

      modeloader.loadModelToScene('ren.glb', _model => {
        _model.openCastShadow()
        _model.object.position.set(13, 0, 15)
        _model.object.name = '人'
        _model.startAnima(1)
        _model.cloneModel([25, 0, 29]).startAnima()
      })

      modeloader.loadModelToScene('tree_animate/scene.gltf', _model => {
        _model.openCastShadow()
        _model.object.position.set(8, 0, 26)
        _model.object.scale.set(0.08, 0.08, 0.08)
        _model.object.name = '树'
        _model.startAnima()
        tree_animate = _model.object.clone()
      })

      let curve = null;

      function makeCurve() {
        //Create a closed wavey loop
        curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(11.5, 0, 18),
          new THREE.Vector3(11.5, 0, 34),
          new THREE.Vector3(35, 0, 34),
          new THREE.Vector3(35, 0, 31),
          new THREE.Vector3(11.5, 0, 31),
        ]);
        curve.curveType = "catmullrom";
        curve.closed = true;//设置是否闭环
        curve.tension = 0; //设置线的张力，0为无弧度折线

        // 为曲线添加材质在场景中显示出来，不显示也不会影响运动轨迹，相当于一个Helper
        const points = curve.getPoints(0.1);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: 0xff0000,
        });

        // Create the final object to add to the scene
        const curveObject = new THREE.Line(geometry, material);
        curveObject.position.y = -1;
        viewer.scene.add(curveObject)
      }


      let progress = 0; // 物体运动时在运动路径的初始位置，范围0~1
      const velocity = 0.001; // 影响运动速率的一个值，范围0~1，需要和渲染频率结合计算才能得到真正的速率
      // 物体沿线移动方法
      function moveOnCurve(_model) {
        if (curve == null || che == null) {
        } else {
          if (progress <= 1 - velocity) {
            let che = _model.object
            let boxx = _model.getBox()
            cheLable.position.set(boxx.max.x, boxx.max.y + 2, boxx.max.z)
            if (che.position.z.toFixed(2) >= 28.00 && che.position.z.toFixed(2) <= 28.10) {
              if (isopen) {
                gsap.to(Mesh26.scale, {
                  x: Mesh26.scale.x * 8,
                  duration: 5,
                  ease: "power1.inOut",
                  onComplete: () => {
                    isopen = false
                  },
                });
              } else {
                gsap.to(Mesh26.scale, {
                  x: Mesh26.scale.x / 8,
                  duration: 5,
                  ease: "power1.inOut",
                  onComplete: () => {
                    isopen = true
                    viewer.addAnimate(tiemen)
                  },
                  onStart: () => {
                    viewer.removeAnimate(tiemen)
                  },
                });
              }
            }
            const point = curve.getPointAt(progress); //获取样条曲线指定点坐标
            const pointBox = curve.getPointAt(progress + velocity); //获取样条曲线指定点坐标

            if (point && pointBox) {
              che.position.set(point.x, point.y, point.z);
              che.lookAt(pointBox.x, pointBox.y, pointBox.z);//因为这个模型加载进来默认面部是正对Z轴负方向的，所以直接lookAt会导致出现倒着跑的现象，这里用重新设置朝向的方法来解决。
              let center = _model.getBox().getCenter(new THREE.Vector3())
              // viewer.camera.position.copy(pointBox)
              // viewer.camera.lookAt(point)
              // viewer.controls.target.set(pointBox.x, center.y, pointBox.z+10)
              if (that.isDriver) {
                viewer.camera.position.set(point.x, point.y + 2, point.z)
                viewer.camera.lookAt(pointBox.x, pointBox.y + 2, pointBox.z)
                viewer.controls.position0.set(point.x, point.y + 2, point.z) //非必要，场景有控件时才加上
                viewer.controls.target.set(pointBox.x, pointBox.y + 2, pointBox.z) //非必要，场景有控件时才加上
              }
              let targetPos = pointBox   //目标位置点
              let offsetAngle = 22 //目标移动时的朝向偏移

              // //以下代码在多段路径时可重复执行
              let mtx = new THREE.Matrix4()  //创建一个4维矩阵
              // .lookAt ( eye : Vector3, target : Vector3, up : Vector3 ) : this,构造一个旋转矩阵，从eye 指向 target，由向量 up 定向。
              mtx.lookAt(che.position, targetPos, che.up) //设置朝向
              mtx.multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, offsetAngle, 0)))
              let toRot = new THREE.Quaternion().setFromRotationMatrix(mtx)  //计算出需要进行旋转的四元数值
              che.quaternion.slerp(toRot, 0.2)
            }
            progress += velocity;
          } else {
            progress = 0;
          }
        }
      }

      let modelSelect = ['zuo0', 'zuo1', 'zuo2', 'zuo3', 'zuo4', 'zuo5']
      viewer.startSelectEvent('mousemove', false, (model) => {
        if (model.parent && model.parent.parent && model.parent.parent.name == '办公大厅') {
          modelSelect.forEach((item) => {
            if (item == model.parent.name) {
              modelMoveName = item
              if (modelSelectName == modelMoveName) return
              office.object.getObjectByName(item).traverse(function (child) {
                if (child.isMesh) {
                  child.material = new THREE.MeshPhongMaterial({
                    color: 'yellow',
                    transparent: true,
                    opacity: 0.8,
                    emissive: child.material.color,
                    emissiveMap: child.material.map,
                    emissiveIntensity: 3
                  })
                }
              })
            } else {
              if (!isModelSelectName) {
                let oldmodel = oldOffice.getObjectByName(item)
                office.object.getObjectByName(item).traverse(function (child) {
                  if (child.isMesh) {
                    child.material = oldmodel.getObjectByName(child.name).material
                  }
                })
              } else {
                office.object.getObjectByName(item).traverse(function (child) {
                  if (child.isMesh && child.parent.name != modelSelectName) {
                    child.material = new THREE.MeshPhongMaterial({
                      color: new THREE.Color('#123ca8'),
                      transparent: true,
                      opacity: 0.5,
                      emissiveMap: child.material.map,
                    })
                  }
                })
              }
            }
          })
        }
      })

      let sceneList = ['实验楼']
      viewer.renderer.domElement.addEventListener('click', (e) => {
        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2()
        mouse.x = (e.offsetX / viewer.renderer.domElement.clientWidth) * 2 - 1
        mouse.y = -(e.offsetY / viewer.renderer.domElement.clientHeight) * 2 + 1
        raycaster.setFromCamera(mouse, viewer.camera)
        const intersects = raycaster.intersectObject(viewer.scene, true)
        if (intersects.length > 0 && intersects[0] && modelMoveName) {
          let model = intersects[0].object.parent
          if (model.name.includes('zuo')) {
            if (!isModelSelectName) {
              cheLable.visible = false
              viewer.scene.children[viewer.scene.children.findIndex(o => o.name == '快递车')].visible = false
              viewer.scene.children[viewer.scene.children.findIndex(o => o.name == 'cityv1')].visible = false
              viewer.scene.children[viewer.scene.children.findIndex(o => o.name == '树')].visible = false
              sceneList.forEach(item => {
                viewer.scene.children.find(o => o.name == item).traverse((child) => {
                  child.material = new THREE.MeshPhongMaterial({
                    color: new THREE.Color('rgba(7,32,96,0.76)'),
                    transparent: true,
                    opacity: 0.1,
                    wireframe: true,
                    depthWrite: true, // 无法被选择，鼠标穿透
                  })
                })
              })
              gsap.to(viewer.scene.children.find(o => o.name == '人').rotation, {
                y: Math.PI,
                duration: 2,
                ease: "power1.inOut",
                onComplete: () => {
                  isModelSelectName = true
                },
              });
            }
            selectOffice(model)
          }
          if (!model.name.includes('zuo')) {
            if (!isModelSelectName) {
              let oldmodel = oldOffice.getObjectByName(modelMoveName)
              office.object.getObjectByName(modelMoveName).traverse(function (child) {
                if (child.isMesh) {
                  child.material = oldmodel.getObjectByName(child.name).material
                }
              })
            }
          }
        }
      })

      const selectOffice = (model) => {
        modelSelectName = model.name
        let oldmodel = oldOffice.getObjectByName(modelSelectName)
        let modelSelectIndex = modelSelect.findIndex(v => v == modelSelectName)
        office.object.children.forEach((child, index) => {
          child.children.forEach((Mesh) => {
            if (child.name === modelSelectName) {
              child.children.forEach(Mesh => {
                Mesh.material = oldmodel.getObjectByName(Mesh.name).material
              })
            } else {
              Mesh.material = new THREE.MeshPhongMaterial({
                color: new THREE.Color('#123ca8'),
                transparent: true,
                opacity: 0.5,
                emissiveMap: Mesh.material.map,
              })
            }
          })
          if (!model.userData.position && index > modelSelectIndex) {
            gsap.to(child.position, {
              y: !child.userData.position ? child.position.y + 25 : child.position.y,
              duration: 2,
              ease: "power1.inOut",
              onComplete: () => {
                child.userData.position = true
              },
            });
          }
          if (model.userData.position && index <= modelSelectIndex) {
            if (child.userData.position) {
              gsap.to(child.position, {
                y: oldOffice.getObjectByName(child.name).position.y,
                duration: 2,
                ease: "power1.inOut",
                onComplete: () => {
                  child.userData.position = false
                },
              });
            }
          }
        })
        gsap.to(viewer.controls.target, {
          x: 12,
          y: 0,
          z: -5,
          duration: 2,
          ease: "power1.inOut",
          onComplete: () => {
          },
        });
        gsap.to(viewer.camera.position, {
          x: 12,
          y: 18,
          z: 38,
          duration: 2,
          ease: "power1.inOut",
          onComplete: () => {
          },
        });
      }
    },
  },
}
</script>

<style lang="scss">
//定义全局颜色
$color: #123ca8;
.scene {
  width: 100%;
  height: 100%;


  .label {
    padding: 20px;
    background: $color;
    color: aliceblue;
    border-radius: 5px;
    cursor: pointer;
  }

  .jindu-con {
    width: 300px;
    height: 10px;
    border-radius: 50px;
    background-color: white;
    margin-top: 10px;
    overflow: hidden;
  }

  #jindu {
    height: inherit;
    background-color: #007bff;
    width: 0;
  }

  #jindu-text-con {
    width: 300px;
    position: absolute;
    left: 0;
    right: 0;
    margin: 0 auto;
    top: 15%;
    text-align: center;
    background-color: rgba(255, 255, 255, .5);
    padding: 10px;
  }

  .panel {
    margin: 0 auto;
    padding: 0;
    box-sizing: border-box;
    bottom: 10px;
    position: absolute;
    opacity: 0.8;
    width: 100%;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .main {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      border-radius: 4px;
      opacity: 0.96;
      border: 1px solid #14171c;
      background: linear-gradient(0deg, #1e202a 0%, #0d1013 100%);
      box-shadow: 0px 2px 21px 0px rgba(33, 34, 39, 0.55);

      li {
        padding: 5px 10px;
        box-sizing: border-box;
        list-style: none;
        cursor: pointer;
        border: 1px solid #313642;
        border-radius: 2px;
        float: left;
        margin: 5px;
        position: relative;
        width: 70px;

        p {
          list-style: none;
          cursor: pointer;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          height: 20px;
          text-align: center;
          font-size: 12px;
          font-weight: 400;
          color: #fbfbfb;
          display: block;
        }
      }
    }
  }
}
</style>
