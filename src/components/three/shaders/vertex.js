export default `
precision lowp float;
varying vec2 vUv;
varying vec3 iPosition;
void main()
{
    vUv = uv;
    iPosition = position;
    vec4 modelMatrix = vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * modelMatrix;
}
`
