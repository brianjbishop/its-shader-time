precision mediump float;

uniform sampler2D uTerrainMap;

varying vec2 vUv;
varying vec3 vNormal;
varying float vOffset;

void main()
{
    vec4 texCol = texture2D(uTerrainMap, vUv);
    vec3 normCol = vNormal * 0.5 + 0.5; // shifts from -1 <> 1 to 0 <> 1
    // gl_FragColor = vec4(texCol);
    gl_FragColor = vec4(normCol,1.0);

    //gl_FragColor = vec4(mix(normCol, texCol.rgb, vOffset), 1.0);
    // gl_FragColor = vec4(vec3(vOffset), 1.0);
}