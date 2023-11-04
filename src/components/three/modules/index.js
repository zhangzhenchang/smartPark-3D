import Viewer from './Viewer' // 场景
import SkyBoxs from './SkyBoxs' // 天空盒
import ModelLoder from './ModelLoder' // 模型加载器
import DsModel from './DsModel' // 模型
import Weather from './Weather' // 天气
import AnimatedTracks from './AnimatedTracks' // 动画轨迹
import Lights from './Lights' // 光源
import MouseEvent from './MouseEvent' // 鼠标事件
import Labels from './Labels' // 标签
import PathLine from './PathLine' // 路径线
import Floors from './Floors' // 楼层
import EffectComposer from './EffectComposer' // 后期处理

const modules = {
  Viewer, // 场景初始化
  SkyBoxs, // 天空盒
  ModelLoder, // 模型加载，现在主要是针对Gltf或者glb
  DsModel, // 模型功能,
  Lights, // 灯光管理
  Weather, // 天气控制
  AnimatedTracks, // 模型动画
  MouseEvent, // 鼠标事件
  Labels, // 场景标签
  PathLine, // 路线标签
  Floors, // 场景地板
  EffectComposer, // 后期处理
}

export default modules
