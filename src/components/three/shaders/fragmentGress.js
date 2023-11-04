export default `
precision lowp float;
varying vec2 vUv;
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;



const float Pi = 3.14159265359;

#define Time iTime
#define Frame iGlobalFrame
#define PixelCount iResolution.xy
#define clamp01(x) clamp(x, 0.0, 1.0)
#define mad(x, a, b) ((x) * (a) + (b))
#define rsqrt(x) inversesqrt(x)

vec3 GammaEncode(vec3 x) {return pow(x, vec3(1.0 / 2.2));}


float SDFtoMask(float sdf)
{
    return sdf / length(vec2(dFdx(sdf), dFdy(sdf))) * 1.2;
}

float Hash(float v)
{
    return fract(sin(v) * 43758.5453);
}

float Hash(vec2 v)
{
    return Hash(v.y + v.x * 12.9898);
}

float Hash(vec3 v)
{
    return Hash(v.y + v.x * 12.9898 + v.z * 33.7311);
}


float Pow2(float v){return v * v;}
float Pow3(float v){return v * v * v;}
float Pow4(float v){return Pow2(Pow2(v));}
float Pow8(float v){return Pow2(Pow4(v));}
float Pow16(float v){return Pow4(Pow4(v));}
float Pow32(float v){return Pow16(Pow2(v));}

float SqrLen(vec2 v){return dot(v, v);}
float SqrLen(vec3 v){return dot(v, v);}
float SqrLen(vec4 v){return dot(v, v);}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//=============================================================================================================================================//
// "Hash without Sine"        | https://www.shadertoy.com/view/4djSRW 
//  Created by David Hoskins  | 
//  used under CC BY-SA 4.0   | https://creativecommons.org/licenses/by-sa/4.0/             
//  reformatted from original |              
//---------------------------------------------------------------------------------------------------------------------------------------------//

// Use this for integer stepped ranges, ie Value-Noise/Perlin noise functions.
#define HASHSCALE1 .1031
#define HASHSCALE3 vec3(.1031, .1030, .0973)
#define HASHSCALE4 vec4(1031, .1030, .0973, .1099)

float Hash11I(float p ){vec3 p3 = fract(vec3(p     ) * HASHSCALE1); p3 += dot(p3, p3.yzx  + 19.19); return fract((p3.x    + p3.y   ) * p3.z   );}
float Hash12I(vec2  p ){vec3 p3 = fract(vec3(p.xyx ) * HASHSCALE1); p3 += dot(p3, p3.yzx  + 19.19); return fract((p3.x    + p3.y   ) * p3.z   );}
float Hash13I(vec3  p3){     p3 = fract(    (p3    ) * HASHSCALE1); p3 += dot(p3, p3.yzx  + 19.19); return fract((p3.x    + p3.y   ) * p3.z   );}
vec2  Hash21I(float p ){vec3 p3 = fract(vec3(p     ) * HASHSCALE3); p3 += dot(p3, p3.yzx  + 19.19); return fract((p3.xx   + p3.yz  ) * p3.zy  );}
vec2  Hash22I(vec2  p ){vec3 p3 = fract(vec3(p.xyx ) * HASHSCALE3); p3 += dot(p3, p3.yzx  + 19.19); return fract((p3.xx   + p3.yz  ) * p3.zy  );}
vec2  Hash23I(vec3  p3){     p3 = fract(    (p3    ) * HASHSCALE3); p3 += dot(p3, p3.yzx  + 19.19); return fract((p3.xx   + p3.yz  ) * p3.zy  );}
vec3  Hash31I(float p ){vec3 p3 = fract(vec3(p     ) * HASHSCALE3); p3 += dot(p3, p3.yzx  + 19.19); return fract((p3.xxy  + p3.yzz ) * p3.zyx );}
vec3  Hash32I(vec2  p ){vec3 p3 = fract(vec3(p.xyx ) * HASHSCALE3); p3 += dot(p3, p3.yxz  + 19.19); return fract((p3.xxy  + p3.yzz ) * p3.zyx );}
vec3  Hash33I(vec3  p3){     p3 = fract(    (p3    ) * HASHSCALE3); p3 += dot(p3, p3.yxz  + 19.19); return fract((p3.xxy  + p3.yxx ) * p3.zyx );}
vec4  Hash41I(float p ){vec4 p4 = fract(vec4(p     ) * HASHSCALE4); p4 += dot(p4, p4.wzxy + 19.19); return fract((p4.xxyz + p4.yzzw) * p4.zywx);}
vec4  Hash42I(vec2  p ){vec4 p4 = fract(vec4(p.xyxy) * HASHSCALE4); p4 += dot(p4, p4.wzxy + 19.19); return fract((p4.xxyz + p4.yzzw) * p4.zywx);}
vec4  Hash43I(vec3  p ){vec4 p4 = fract(vec4(p.xyzx) * HASHSCALE4); p4 += dot(p4, p4.wzxy + 19.19); return fract((p4.xxyz + p4.yzzw) * p4.zywx);}
vec4  Hash44I(vec4  p4){     p4 = fract(    (p4    ) * HASHSCALE4); p4 += dot(p4, p4.wzxy + 19.19); return fract((p4.xxyz + p4.yzzw) * p4.zywx);}

#undef HASHSCALE1
#undef HASHSCALE3
#undef HASHSCALE4

//---------------------------------------------------------------------------------------------------------------------------------------------//

// For smaller input rangers like audio tick or 0-1 UVs use these...
#define HASHSCALE1 443.8975
#define HASHSCALE3 vec3(443.897, 441.423, 437.195)
#define HASHSCALE4 vec4(443.897, 441.423, 437.195, 444.129)

float Hash11F(float p ){vec3 p3 = fract(vec3(p     ) * HASHSCALE1); p3 += dot(p3, p3.yzx  + 19.19); return fract((p3.x    + p3.y   ) * p3.z   );}
float Hash12F(vec2  p ){vec3 p3 = fract(vec3(p.xyx ) * HASHSCALE1); p3 += dot(p3, p3.yzx  + 19.19); return fract((p3.x    + p3.y   ) * p3.z   );}
float Hash13F(vec3  p3){     p3 = fract(    (p3    ) * HASHSCALE1); p3 += dot(p3, p3.yzx  + 19.19); return fract((p3.x    + p3.y   ) * p3.z   );}
vec2  Hash21F(float p ){vec3 p3 = fract(vec3(p     ) * HASHSCALE3); p3 += dot(p3, p3.yzx  + 19.19); return fract((p3.xx   + p3.yz  ) * p3.zy  );}
vec2  Hash22F(vec2  p ){vec3 p3 = fract(vec3(p.xyx ) * HASHSCALE3); p3 += dot(p3, p3.yzx  + 19.19); return fract((p3.xx   + p3.yz  ) * p3.zy  );}
vec2  Hash23F(vec3  p3){     p3 = fract(    (p3    ) * HASHSCALE3); p3 += dot(p3, p3.yzx  + 19.19); return fract((p3.xx   + p3.yz  ) * p3.zy  );}
vec3  Hash31F(float p ){vec3 p3 = fract(vec3(p     ) * HASHSCALE3); p3 += dot(p3, p3.yzx  + 19.19); return fract((p3.xxy  + p3.yzz ) * p3.zyx );}
vec3  Hash32F(vec2  p ){vec3 p3 = fract(vec3(p.xyx ) * HASHSCALE3); p3 += dot(p3, p3.yxz  + 19.19); return fract((p3.xxy  + p3.yzz ) * p3.zyx );}
vec3  Hash33F(vec3  p3){     p3 = fract(    (p3    ) * HASHSCALE3); p3 += dot(p3, p3.yxz  + 19.19); return fract((p3.xxy  + p3.yxx ) * p3.zyx );}
vec4  Hash41F(float p ){vec4 p4 = fract(vec4(p     ) * HASHSCALE4); p4 += dot(p4, p4.wzxy + 19.19); return fract((p4.xxyz + p4.yzzw) * p4.zywx);}
vec4  Hash42F(vec2  p ){vec4 p4 = fract(vec4(p.xyxy) * HASHSCALE4); p4 += dot(p4, p4.wzxy + 19.19); return fract((p4.xxyz + p4.yzzw) * p4.zywx);}
vec4  Hash43F(vec3  p ){vec4 p4 = fract(vec4(p.xyzx) * HASHSCALE4); p4 += dot(p4, p4.wzxy + 19.19); return fract((p4.xxyz + p4.yzzw) * p4.zywx);}
vec4  Hash44F(vec4  p4){     p4 = fract(    (p4    ) * HASHSCALE4); p4 += dot(p4, p4.wzxy + 19.19); return fract((p4.xxyz + p4.yzzw) * p4.zywx);}

#undef HASHSCALE1
#undef HASHSCALE3
#undef HASHSCALE4

//=============================================================================================================================================//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/*
float PowL_Exp(float x, const float f)
{
    const float d = 1.0 / (exp2(f) - 1.0);
    
    return mad(exp2(x * f), d, -d);
}
*/

float EvalIntensityCurve(vec2 id, float time)
{
    time += Hash(id.yx * 1.733);
    //time += Hash12I(id.yx);

    float iTime = floor(time);
    float fTime = fract(time);

    float h = Hash(vec3(id, iTime));
    //float h = Hash13I(vec3(id, iTime));

    //if(h < 0.9) h = 0.0;
    //h = fract(id.x*0.23+id.y*0.1+iTime*0.09);
    h *= h;
    h *= h;

    float falloff = 1.0 - Pow2(fTime * 2.0 - 1.0);

/*
    falloff = Pow32(falloff);
    /*/
    {
        const float f = 100.0;
        const float d = 1.0 / (exp2(f) - 1.0);

        falloff = mad(exp2(falloff * f), d, -d);
    }
    //*/

    //falloff = exp2(falloff * 100.1) - 1.0;
    //falloff /= exp2(1.0 * 100.1) - 1.0;

    return h * falloff*1.0;
}

float GlowKern1(float x, float s)
{
    float rx = sqrt(x);

    return (exp(-s * rx) * s) / (2.0 * rx);
}

float GlowKern2(float x, float s)
{
    float rx = sqrt(x);

    return s / (2.0 * Pow2(1.0 + s * rx) * rx);
}

float GlowKern3(float x, float s)
{
    return s / Pow3(1.0 + s * x);
}

float GlowKern4(float x, float c)
{
    return c * rsqrt(x * Pow3(x + c)) * 0.5;
}

float CurveU(float x, float u)
{
    return (u - u * x) / (u + x);
}

float EvalGlow3(vec2 uv, vec2 off, float time)
{
    vec2 iUV = floor(uv) + off;
    vec2 fUV = fract(uv) - off;

    vec2 fUV2 = fUV * 2.0 - 1.0;

    float dist2 = SqrLen(fUV2);

    float l = length(fUV2);
    l = max(0.0, l - 0.7);
    float glow = 0.0;
    //glow = GlowKern1(l, 2.5);
    //glow = GlowKern2(l, 4.0);
    glow = GlowKern3(l, 1.2);
    //glow = GlowKern4(l, 0.4);
    //glow = CurveU(l * 0.25, 0.04);

    glow = clamp01(glow);

    glow *= clamp01(1.0 - Pow2(l*0.25));// window

    return EvalIntensityCurve(iUV.xy, time) * glow;
}


float PlotDot(vec2 sp, vec2 dp, float dr)
{
    float v = length(sp - dp);

    float d = v - dr;
    //return d < 0.0 ? 1.0 : 0.0;
    d /= length(vec2(dFdx(v), dFdy(v)));
    //d += 0.5;
    d = clamp01(1.0 - d * 1.2);

    return d;
}

float EvalGlyph(vec2 uv, vec2 off, float time)
{
    vec2 iUV = floor(uv) + off;
    vec2 fUV = fract(uv) - off;

    vec2 fUV2 = fUV * 2.0 - 1.0;

    float distToCenter = length(fUV2);

    float gMask = distToCenter - 0.75;
    gMask = SDFtoMask(gMask);
    gMask = clamp01(1.0 - gMask);

    gMask = PlotDot(fUV2, vec2(0.0), 0.75);

    return EvalIntensityCurve(iUV.xy, time) * gMask;
}


vec3 EvalTile(vec2 uv, vec2 off, float time)
{
    vec2 iUV = floor(uv) + off;
    vec2 fUV = fract(uv) - off;

    vec3 blue1 = vec3(0.02, 0.1, 1.0);

    float nTime = time*50.0;
    float iTime = floor(nTime);
    float fTime = fract(nTime);

    float n0 = Hash(vec3(uv, iTime));
    float n1 = Hash(vec3(uv, iTime + 1.0));

    //n0 = n1 = 1.0;

    float glyph = EvalGlyph(uv, off, time);

    float glow = 0.0;

    for(float i = -2.0; i <= 2.0; ++i)
    for(float j = -2.0; j <= 2.0; ++j)
    {
        glow += EvalGlow3(uv, off + vec2(i, j), time);
    }


    return vec3(mix(glow, glyph, 0.94)).xxx * blue1 * 32.0;
}

void main()
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = vUv/iResolution.xy;

    // Time varying pixel color
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));

    // Output to screen
    gl_FragColor = vec4(col,1.0);
    gl_FragColor.rgb *= gl_FragColor.a;
}
`
