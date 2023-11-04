import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';

import * as THREE from 'three'
import {BokehPass} from "three/addons/postprocessing/BokehPass.js";
import {OutlinePass} from "three/examples/jsm/postprocessing/OutlinePass";
import {AfterimagePass} from "three/addons/postprocessing/AfterimagePass.js";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass";
import fragment from "../../shaders/fragment.js";
import vertex from "../../shaders/vertex.js";

export default class SunLensflare {
    /**
     * 太阳炫光
     * @param _viewer 视图
     */
    constructor(_viewer) {
        this.scene = _viewer.scene
        this.camera = _viewer.camera
        this.renderScene = new RenderPass(this.scene, this.camera);

        const unrealBloomPass = new UnrealBloomPass(new THREE.Vector2(_viewer.renderer.domElement.clientWidth, _viewer.renderer.domElement.clientHeight), 0.3, 3, 0.5);
        unrealBloomPass.renderToScreen = true;


        const composer = new EffectComposer(_viewer.renderer);
        composer.addPass(this.renderScene);
        // composer.addPass( unrealBloomPass );
        const colorShader = {
            uniforms: {
                iTime: {value: 0.1},
                iResolution: {
                    value: new THREE.Vector2(_viewer.renderer.domElement.clientWidth, _viewer.renderer.domElement.clientHeight)
                },
                tDiffuse: {value: null},
                color: {value: new THREE.Color('rgba(222,19,19,0.56)')},
            },
            vertexShader: vertex,
            fragmentShader: fragment
        };
        const colorPass = new ShaderPass(colorShader);
        colorPass.renderToScreen = true;
        composer.addPass(colorPass);
        console.log(composer)
        _viewer.addAnimate({
            fun: (composer) => {
                colorPass.uniforms.iTime.value += 0.1;
                composer.render();
            },
            content: composer
        })
    }

    /**
     * 添加炫光
     * @param x
     * @param y
     * @param z
     */
}
