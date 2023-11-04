export default `
precision lowp float;
varying vec2 vUv;
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D tDiffuse;
varying vec3 iPosition;

void main(){
            vec4 texel = texture2D(tDiffuse, vUv);
            float x = iPosition.x;
            float lighty = x*1.2 + iTime;
            float alpha = abs(iPosition.y - iTime);
            if(alpha < 0.1){
                float a = 1.0 -  alpha / 0.1;
                float enda = smoothstep(0.0,1.0,a) + 0.3;
                gl_FragColor = texel * enda;
            }else{
                gl_FragColor = texel;
            }
 
 
        }
`
