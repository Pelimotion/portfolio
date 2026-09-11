precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uDepth; // 0.0 (superfície) a 1.0 (abismo)

uniform vec3 uDepthAbyss;
uniform vec3 uDepthMid;
uniform vec3 uLightCaustic;

varying vec2 vUv;

// Simulação de refração de onda e convergência cáustica
float waveCaustic(vec2 p, float time) {
  vec2 v = p;
  float c = 0.0;
  float inten = 0.005;

  for (int n = 0; n < 4; n++) {
    float t = time * (1.0 - (3.5 / float(n + 1)));
    vec2 i = v + vec2(
      cos(t - v.x) + sin(t + v.y),
      sin(t - v.y) + cos(t + v.x)
    );
    // Perturbação da superfície e traçado de convergência
    c += 1.0 / length(vec2(
      v.x / (sin(i.x + t) / inten),
      v.y / (cos(i.y + t) / inten)
    ));
  }

  c /= 4.0;
  c = 1.17 - pow(c, 1.4);
  return clamp(pow(abs(c), 8.0), 0.0, 2.5);
}

void main() {
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 uv = (vUv - 0.5) * aspect;

  // Interação do cursor como gota/perturbação na superfície invisível
  vec2 mouseNorm = (uMouse - 0.5) * aspect;
  float mouseDist = length(uv - mouseNorm);
  vec2 mouseOffset = (uv - mouseNorm) * exp(-mouseDist * 3.5) * 0.15;

  // Coordenadas perturbadas
  vec2 p = (uv + mouseOffset) * (3.5 + uDepth * 1.5);
  
  float speed = uTime * 0.18;
  float caustic1 = waveCaustic(p, speed);
  float caustic2 = waveCaustic(p * 1.4 + vec2(1.7, 2.3), speed * 1.15);
  float causticPattern = mix(caustic1, caustic2, 0.5);

  // Atenuação física por profundidade (Beer-Lambert law)
  // Quanto mais fundo, mais a cáustica perde intensidade e se difunde
  float depthAtten = exp(-uDepth * 2.8);
  float causticIntensity = causticPattern * depthAtten * 0.65;

  // Cor de fundo interpolada entre a camada intermediária e o abismo
  vec3 bgColor = mix(uDepthMid * 0.45, uDepthAbyss, clamp(uDepth * 1.4, 0.0, 1.0));

  // Aplicação da assinatura luminosa cáustica (nunca água literal, apenas os fótons refratados)
  vec3 finalColor = bgColor + uLightCaustic * causticIntensity;

  // Vinheta sutil e acabamento orgânico
  float vignette = smoothstep(1.4, 0.3, length(uv));
  finalColor *= vignette;

  gl_FragColor = vec4(finalColor, 1.0);
}
