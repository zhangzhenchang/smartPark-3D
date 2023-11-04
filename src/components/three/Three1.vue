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
  </div>

</template>

<script>
import modules from "./modules/index.js";
import * as dat from 'dat.gui';
import * as THREE from "three";
import gsap from "gsap";
// const gui = new dat.GUI();
export default {
  name: "Three",
  mounted() {
    this.init();
  },
  destroyed() {
    console.log(1111333)
  },
  methods: {
    init() {
      let jindu_text_con = document.getElementById('jindu-text-con');
      let jindu_text = document.getElementById('jindu-text');
      let jindu = document.getElementById('jindu');

      let model
      let viewer = new modules.Viewer('viewer-container') //初始化场景
      viewer.addAxis()
      let labels = new modules.Labels(viewer) //初始化场景
      let skyBoxs = new modules.SkyBoxs(viewer)//添加天空盒和雾化效果
      skyBoxs.addSkybox(2)
      viewer.camera.position.set(17, 10, 46) //设置相机位置
      let lights = new modules.Lights(viewer)
      let ambientLight = lights.addAmbientLight()
      ambientLight.setOption({color: 0xffffff, intensity: 1})
      let directionalLight = lights.addDirectionalLight([100, 100, -10], {
        color: 'rgb(253,253,253)',
        intensity: 3,
        castShadow: true,
      })
      let modeloader = new modules.ModelLoder(viewer)
      let Mesh26
      let isopen = false
      let tiemen = {}
      modeloader.loadModelToScene('city-v1.glb', _model => {
        model = _model
        model.openCastShadow()
        model.openReceiveShadow()
        model.forEach(item => {
          item.castShadow = true
          item.receiveShadow = true
          item.frustumCulled = false
          item.material.emissiveMap = item.material.map
          item.material.emissiveColor = item.material.color
        })
        model.object.children.forEach((item, index) => {
          if (item.name === 'Mesh26') {
            //平移
            Mesh26 = item
            gsap.to(Mesh26.scale, {
              x: Mesh26.scale.x / 8,
              duration: 5,
              ease: "power1.inOut",
              onComplete: () => {
                makeCurve()
                isopen = true
              }
            });
          }
          if (item.name.indexOf('Plane') > -1) {
            if (item.isMesh && item.material.name === '草地') {

            }
          }
        })
        tiemen = tiemen = {
          fun: moveOnCurve,
          content: che
        }
        viewer.addAnimate(tiemen)
        this.cityv1 = _model.object.clone()
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

      //视频纹理
      let video = document.getElementById('videoContainer');
      video.src = "bi.mp4"; // 设置视频地址
      video.autoplay = "autoplay"; //要设置播放
      video.loop = "loop"; //要设置循环播放
      video.muted = "muted"; //要设置静音
      let texture = new THREE.VideoTexture(video)

      //实验楼
      modeloader.loadModelToScene('75.gltf', _model => {
        _model.openCastShadow()
        _model.openReceiveShadow()
        _model.object.rotateY(Math.PI / 2)
        _model.object.position.set(-17, 0, 5)
        _model.object.scale.set(0.7, 0.7, 0.7)
        _model.object.name = '实验楼'
        this.gltf75 = _model.object.clone()
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
      //广告牌
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

      let che, cheLable
      modeloader.loadModelToScene('car13.gltf', _model => {
        che = _model
        _model.openCastShadow()
        _model.openReceiveShadow()
        _model.object.position.set(11.5, 0, 18)
        _model.object.scale.set(1, 1, 1)
        _model.object.name = '运输车'
        let boxx = _model.getBox()
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
        this.tree_animate = _model.object.clone()
      })

      modeloader.loadModelToScene('zuo.glb', _model => {
        this.office = _model
        this.office.openCastShadow()
        this.office.openReceiveShadow()
        //旋转360度
        this.office.object.rotation.y = Math.PI
        this.office.object.position.set(16, 0, -5)
        this.office.object.scale.set(0.2, 0.2, 0.2)
        this.office.object.name = '办公大厅'
        this.office.object.children.forEach(item => {
          item.name = item.name.replace('zuo', '')
          if (item.name == 'ding') {
            item.name = 6
          }
          item.name--
        })
        this.office.object.children.sort((a, b) => a.name - b.name).forEach(v => {
          v.name = 'zuo' + v.name
        })
        this.office.forEach(child => {
          if (child.isMesh) {
            child.frustumCulled = false
            child.material.emissive = child.material.color;
            child.material.emissiveMap = child.material.map;
            child.material.emissiveIntensity = 1.2
            child.material.envmap = viewer.scene.background
          }
        })
        this.oldOffice = this.office.object.clone()
        let box = this.office.getBox()
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
            let box = _model.getBox()
            const point = curve.getPointAt(progress); //获取样条曲线指定点坐标
            const pointBox = curve.getPointAt(progress + velocity); //获取样条曲线指定点坐标

            if (point && pointBox) {
              che.position.set(point.x, point.y, point.z);
              che.lookAt(pointBox.x, pointBox.y, pointBox.z);//因为这个模型加载进来默认面部是正对Z轴负方向的，所以直接lookAt会导致出现倒着跑的现象，这里用重新设置朝向的方法来解决。
              // model40.position.set(point.x, point.y, point.z);
              // viewer.controls.target.set(pointBox.x, pointBox.y, pointBox.z);
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
              this.modelMoveName = item
              if (this.modelSelectName == this.modelMoveName) return
              this.office.object.getObjectByName(item).traverse(function (child) {
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
              if (!this.isModelSelectName) {
                let oldmodel = this.oldOffice.getObjectByName(item)
                this.office.object.getObjectByName(item).traverse(function (child) {
                  if (child.isMesh) {
                    child.material = oldmodel.getObjectByName(child.name).material
                  }
                })
              } else {
                this.office.object.getObjectByName(item).traverse(function (child) {
                  if (child.isMesh && child.parent.name != this.modelSelectName) {
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

      let sceneList = ['cityv1', '树', '实验楼']
      viewer.renderer.domElement.addEventListener('click', (e) => {
        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2()
        mouse.x = (e.offsetX / viewer.renderer.domElement.clientWidth) * 2 - 1
        mouse.y = -(e.offsetY / viewer.renderer.domElement.clientHeight) * 2 + 1
        raycaster.setFromCamera(mouse, viewer.camera)
        const intersects = raycaster.intersectObject(viewer.scene, true)
        if (intersects.length > 0 && intersects[0] && this.modelMoveName) {
          let model = intersects[0].object.parent
          if (model.name.includes('zuo')) {
            if (!this.isModelSelectName) {
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
                  this.isModelSelectName = true
                },
              });
            }
            selectOffice(model)
          }
          // if (!model.name.includes('zuo')) {
          //   if (!this.isModelSelectName) {
          //     let oldmodel = this.oldOffice.getObjectByName(this.modelMoveName)
          //     this.office.object.getObjectByName(this.modelMoveName).traverse(function (child) {
          //       if (child.isMesh) {
          //         child.material = oldmodel.getObjectByName(child.name).material
          //       }
          //     })
          //   }
          // }
        }
      })

      const selectOffice = (model) => {
        this.modelSelectName = model.name
        let oldmodel = this.oldOffice.getObjectByName(this.modelSelectName)
        let modelSelectIndex = modelSelect.findIndex(v => v == this.modelSelectName)
        this.office.object.children.forEach((child, index) => {
          child.children.forEach((Mesh) => {
            if (child.name === this.modelSelectName) {
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
                y: this.oldOffice.getObjectByName(child.name).position.y,
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

<style>
.scene {
  width: 100%;
  height: 100%;
}

.label {
  padding: 20px;
  background: rgba(18, 213, 139, 0.54);
  color: aliceblue;
  border-radius: 5px;
}

/*创建动画*/
@keyframes myfirst {
  0% {
    transform: translateX(0px);
  }
  100% {
    transform: translateX(300px);
  }
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
</style>
