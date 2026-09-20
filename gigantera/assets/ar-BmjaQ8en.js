import{D as e,E as t,I as n,J as r,M as i,O as a,R as o,U as s,W as c,X as l,Z as u,a as d,c as f,f as p,g as m,i as h,k as g,n as _,r as v,s as y,t as b,y as x}from"./meshopt_decoder.module-BRCnBxle.js";var S=`gigantera_espinhaco_ar_authorized`,C=new Set([`ESPINHACO`,`ESPINHAÇO`,`GIGANTERA`,`PELIMOTION`,`2026`,`ARTEVIVA`]),w=class{authorized=!1;constructor(){this.checkInitialAccess()}checkInitialAccess(){if(sessionStorage.getItem(S)===`true`){this.authorized=!0;return}let e=new URLSearchParams(window.location.search),t=(e.get(`key`)||e.get(`access`)||e.get(`token`)||``).trim().toUpperCase();t&&C.has(t)&&this.grantAccess()}isAuthorized(){return this.authorized}validatePasscode(e){let t=e.trim().toUpperCase();return C.has(t)?(this.grantAccess(),!0):!1}grantAccess(){this.authorized=!0;try{sessionStorage.setItem(S,`true`)}catch{}}revokeAccess(){this.authorized=!1;try{sessionStorage.removeItem(S)}catch{}}},T=new u(0,0,1),E=new m,D=new o,O=new o(-Math.sqrt(.5),0,0,Math.sqrt(.5));function k(e,n,r,i=0){let a=t.degToRad(e),s=t.degToRad(n),c=t.degToRad(r),l=t.degToRad(i),u=new o;return E.set(s,a,-c,`YXZ`),u.setFromEuler(E),u.multiply(O),u.multiply(D.setFromAxisAngle(T,-l)),u}var A=class{videoEl;visionCanvas;visionCtx=null;stream=null;wakeLock=null;currentQuaternion=new o;targetQuaternion=new o;lockQuaternion=new o;isAnchored=!1;gyroSupported=!1;rawOrientation={alpha:0,beta:90,gamma:0};smoothedConfidence=.1;constructor(e,t){this.videoEl=e,this.visionCanvas=t,this.visionCanvas.width=128,this.visionCanvas.height=128,this.visionCtx=this.visionCanvas.getContext(`2d`,{willReadFrequently:!0})}async startMedia(){try{this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:`environment`},width:{ideal:1920},height:{ideal:1080}},audio:!0})}catch(e){console.warn(`[CameraManager] Falha na captura unificada, recorrendo a vídeo:`,e);try{this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:`environment`}},audio:!1})}catch{this.stream=await navigator.mediaDevices.getUserMedia({video:!0,audio:!1})}}return this.videoEl.srcObject=this.stream,await this.videoEl.play(),this.requestWakeLock(),this.stream}async initGyro(){try{if(typeof DeviceOrientationEvent<`u`&&typeof DeviceOrientationEvent.requestPermission==`function`){if(await DeviceOrientationEvent.requestPermission()===`granted`)return this.bindGyroEvents(),!0}else if(typeof window<`u`&&`ondeviceorientation`in window)return this.bindGyroEvents(),!0}catch(e){console.warn(`[CameraManager] Erro ao registrar giroscópio:`,e)}return!1}bindGyroEvents(){let e=e=>{if(e.beta===null||e.gamma===null)return;this.rawOrientation.alpha=e.alpha??0,this.rawOrientation.beta=e.beta,this.rawOrientation.gamma=e.gamma,this.gyroSupported=!0;let t=screen.orientation&&screen.orientation.angle||window.orientation||0,n=k(this.rawOrientation.alpha,this.rawOrientation.beta,this.rawOrientation.gamma,t);this.targetQuaternion.copy(n),this.currentQuaternion.lengthSq()<.1&&this.currentQuaternion.copy(n)};window.addEventListener(`deviceorientation`,e,{passive:!0}),window.addEventListener(`deviceorientationabsolute`,e,{passive:!0})}updateOrientation(){this.gyroSupported&&this.currentQuaternion.slerp(this.targetQuaternion,.35)}lockSpatialAnchor(){return this.updateOrientation(),this.lockQuaternion.copy(this.currentQuaternion),this.isAnchored=!0,console.log(`[CameraManager] Âncora AR travada com quatérnion:`,this.lockQuaternion),this.lockQuaternion}resetSpatialAnchor(){this.isAnchored=!1}analyzeProjectionBeam(){if(!this.visionCtx||this.videoEl.readyState<2)return{confidence:0,isDetected:!1};let e=this.videoEl.videoWidth,t=this.videoEl.videoHeight;if(e===0||t===0)return{confidence:0,isDetected:!1};this.visionCtx.drawImage(this.videoEl,0,0,128,128);let n=this.visionCtx.getImageData(0,0,128,128).data,r=0,i=0,a=0,o=0,s=255,c=0,l=0;for(let e=0;e<128;e+=2)for(let t=0;t<128;t+=2){let u=(e*128+t)*4,d=.2126*n[u]+.7152*n[u+1]+.0722*n[u+2];t>=38&&t<=90&&e>=16&&e<=112?(r+=d,i+=d*d,a++,d>o&&(o=d),d<s&&(s=d)):(t<24||t>104||e<12||e>116)&&(c+=d,l++)}if(a===0||l===0)return{confidence:0,isDetected:!1};let u=r/a,d=i/a-u*u,f=Math.sqrt(Math.max(d,0)),p=c/l,m=o-s,h=u/(p+8),g=0;h>1.2&&(g+=Math.min((h-1.2)*.8,.45)),f>22&&(g+=Math.min((f-22)/45,.35)),m>70&&(g+=Math.min((m-70)/120,.2)),this.smoothedConfidence+=(g-this.smoothedConfidence)*.25;let _=Math.min(Math.max(this.smoothedConfidence,0),1);return{confidence:_,isDetected:_>=.7}}async requestWakeLock(){try{`wakeLock`in navigator&&(this.wakeLock=await navigator.wakeLock.request(`screen`))}catch{}}stop(){this.stream&&=(this.stream.getTracks().forEach(e=>e.stop()),null),this.wakeLock&&=(this.wakeLock.release().catch(()=>{}),null)}},j=class{ctx=null;analyser=null;dataArray=new Uint8Array(256);lastVolume=0;isMicActive=!1;silentFrames=0;sensitivityGain=3;metrics={bass:0,mid:0,treble:0,volume:0,decibels:-50,isTransient:!1,frequencyData:new Uint8Array(256)};async initFromStream(e,t){try{let n=window.AudioContext||window.webkitAudioContext;this.ctx=t||new n,this.ctx.state===`suspended`&&await this.ctx.resume();let r=e.getAudioTracks();if(r.length>0&&r[0].enabled){let e=new MediaStream([r[0]]),t=this.ctx.createMediaStreamSource(e),n=this.ctx.createGain();n.gain.value=this.sensitivityGain,this.analyser=this.ctx.createAnalyser(),this.analyser.fftSize=512,this.analyser.smoothingTimeConstant=.7,t.connect(n),n.connect(this.analyser),this.dataArray=new Uint8Array(this.analyser.frequencyBinCount),this.metrics.frequencyData=this.dataArray,this.isMicActive=!0,console.log(`[AudioReactor] ✓ Microfone conectado via MediaStream isolado com ganho 3.0x`)}else console.warn(`[AudioReactor] Faixa de áudio indisponível, ativando ressonância orgânica`)}catch(e){console.warn(`[AudioReactor] Erro ao instanciar microfone, usando simulação acústica:`,e)}}update(e=0){let t=e||performance.now()*.001;if(this.analyser&&this.isMicActive){this.analyser.getByteFrequencyData(this.dataArray);let e=this.analyser.frequencyBinCount,n=0,r=Math.min(12,e);for(let e=1;e<r;e++)n+=this.dataArray[e];let i=Math.min(n/(r-1)/255*1.6,1),a=0,o=Math.min(45,e);for(let e=r;e<o;e++)a+=this.dataArray[e];let s=Math.min(a/(o-r)/255*1.5,1),c=0,l=Math.min(128,e);for(let e=o;e<l;e++)c+=this.dataArray[e];let u=Math.min(c/(l-o)/255*1.4,1),d=0;for(let t=0;t<e;t++)d+=this.dataArray[t];let f=Math.min(d/e/255*1.5,1);f<.02?this.silentFrames++:this.silentFrames=0;let p=i,m=s,h=u,g=f;if(this.silentFrames>30){let e=(Math.sin(t*1.8)*.5+.5)*.14;p=Math.max(i,e*1.2),m=Math.max(s,e*.8),h=Math.max(u,e*.5),g=Math.max(f,e);for(let n=0;n<16;n++){let r=(Math.sin(t*3.5+n*.4)*.5+.5)*60*e;this.dataArray[n*4]<r&&(this.dataArray[n*4]=Math.floor(r))}}let _=g-this.lastVolume>.12;this.lastVolume=g,this.metrics.bass+=(p-this.metrics.bass)*.32,this.metrics.mid+=(m-this.metrics.mid)*.3,this.metrics.treble+=(h-this.metrics.treble)*.35,this.metrics.volume+=(g-this.metrics.volume)*.3,this.metrics.decibels=-55+this.metrics.volume*50,this.metrics.isTransient=_}else{let e=.15+(Math.sin(t*2.2)*.5+.5)*.18+(Math.sin(t*6.5)>.7?.25:0),n=.12+(Math.cos(t*1.9)*.5+.5)*.15,r=.1+(Math.sin(t*4.2)*.5+.5)*.12,i=(e+n+r)/3;this.metrics.bass=e,this.metrics.mid=n,this.metrics.treble=r,this.metrics.volume=i,this.metrics.decibels=-45+i*38,this.metrics.isTransient=Math.sin(t*3.8)>.88;for(let e=0;e<this.dataArray.length;e++){let n=Math.sin(t*3.5+e*.18)*.5+.5;this.dataArray[e]=Math.floor(n*120*i)}}}stop(){this.ctx&&this.ctx.state!==`closed`&&this.ctx.close().catch(()=>{})}},M=new r,N=new u,P=new l,F=new l,I=new l,L=class{constructor(e){this.geometry=e.geometry,this.randomFunction=Math.random,this.indexAttribute=this.geometry.index,this.positionAttribute=this.geometry.getAttribute(`position`),this.normalAttribute=this.geometry.getAttribute(`normal`),this.colorAttribute=this.geometry.getAttribute(`color`),this.uvAttribute=this.geometry.getAttribute(`uv`),this.weightAttribute=null,this.distribution=null}setWeightAttribute(e){return this.weightAttribute=e?this.geometry.getAttribute(e):null,this}build(){let e=this.indexAttribute,t=this.positionAttribute,n=this.weightAttribute,r=e?e.count/3:t.count/3,i=new Float32Array(r);for(let a=0;a<r;a++){let r=1,o=3*a,s=3*a+1,c=3*a+2;e&&(o=e.getX(o),s=e.getX(s),c=e.getX(c)),n&&(r=n.getX(o)+n.getX(s)+n.getX(c)),M.a.fromBufferAttribute(t,o),M.b.fromBufferAttribute(t,s),M.c.fromBufferAttribute(t,c),r*=M.getArea(),i[a]=r}let a=new Float32Array(r),o=0;for(let e=0;e<r;e++)o+=i[e],a[e]=o;return this.distribution=a,this}setRandomGenerator(e){return this.randomFunction=e,this}sample(e,t,n,r){let i=this._sampleFaceIndex();return this._sampleFace(i,e,t,n,r)}_sampleFaceIndex(){let e=this.distribution[this.distribution.length-1];return this._binarySearch(this.randomFunction()*e)}_binarySearch(e){let t=this.distribution,n=0,r=t.length-1,i=-1;for(;n<=r;){let a=Math.ceil((n+r)/2);if(a===0||t[a-1]<=e&&t[a]>e){i=a;break}e<t[a]?r=a-1:n=a+1}return i}_sampleFace(e,t,n,r,i){let a=this.randomFunction(),o=this.randomFunction();a+o>1&&(a=1-a,o=1-o);let s=this.indexAttribute,c=e*3,l=e*3+1,u=e*3+2;return s&&(c=s.getX(c),l=s.getX(l),u=s.getX(u)),M.a.fromBufferAttribute(this.positionAttribute,c),M.b.fromBufferAttribute(this.positionAttribute,l),M.c.fromBufferAttribute(this.positionAttribute,u),t.set(0,0,0).addScaledVector(M.a,a).addScaledVector(M.b,o).addScaledVector(M.c,1-(a+o)),n!==void 0&&(this.normalAttribute===void 0?M.getNormal(n):(M.a.fromBufferAttribute(this.normalAttribute,c),M.b.fromBufferAttribute(this.normalAttribute,l),M.c.fromBufferAttribute(this.normalAttribute,u),n.set(0,0,0).addScaledVector(M.a,a).addScaledVector(M.b,o).addScaledVector(M.c,1-(a+o)).normalize())),r!==void 0&&this.colorAttribute!==void 0&&(M.a.fromBufferAttribute(this.colorAttribute,c),M.b.fromBufferAttribute(this.colorAttribute,l),M.c.fromBufferAttribute(this.colorAttribute,u),N.set(0,0,0).addScaledVector(M.a,a).addScaledVector(M.b,o).addScaledVector(M.c,1-(a+o)),r.r=N.x,r.g=N.y,r.b=N.z),i!==void 0&&this.uvAttribute!==void 0&&(P.fromBufferAttribute(this.uvAttribute,c),F.fromBufferAttribute(this.uvAttribute,l),I.fromBufferAttribute(this.uvAttribute,u),i.set(0,0).addScaledVector(P,a).addScaledVector(F,o).addScaledVector(I,1-(a+o))),this}},R=5e4;async function z(e){let t=null,n=`/gigantera/`,r=n.endsWith(`/`)?n:n+`/`;try{e?.(.2,`Carregando malha ultra-leve de partículas…`);let n=`${r}models/espinhaco_points.bin`,i=await fetch(n);if(i.ok){let n=await i.arrayBuffer();t=new Float32Array(n),console.log(`[PointsLoader] ✓ Buffer binário carregado: ${t.length/3} partículas`),e?.(.8,`Preparando plano de projeção 2D…`)}}catch(e){console.warn(`[PointsLoader] Buffer binário indisponível, recorrendo ao GLB:`,e)}t||=(e?.(.3,`Acessando modelo 3D GLB…`),await B(`${r}models/espinhaco.glb`,R,e));let i=t.length/3,a=new Float32Array(i*3);for(let e=0;e<i;e++){let t=e*3,n=Math.sqrt(Math.random()),r=Math.random()*Math.PI*2,i=Math.cos(r)*n,o=Math.sin(r)*n;a[t]=i*.425,a[t+1]=o*.75,a[t+2]=(Math.random()-.5)*.05}return e?.(1,`Pronto para rastreamento!`),{spinePositions:t,wallPositions:a,pointCount:i}}async function B(t,n,r){let i=new _;i.setMeshoptDecoder(b);let o=await new Promise((e,n)=>{i.load(t,t=>e(t),void 0,n)});r?.(.6,`Extraindo geometria das vértebras…`);let s=[];if(o.scene.traverse(e=>{let t=e;if(t.isMesh&&t.geometry){let e=t.geometry.clone();e.applyMatrix4(t.matrixWorld),s.push(new a(e,new g))}}),s.length===0)throw Error(`Nenhuma malha 3D encontrada no modelo GLB`);let c=s[0],l=new d().setFromBufferAttribute(c.geometry.attributes.position),f=new u;l.getSize(f);let p=new u;l.getCenter(p);let m=1.45/Math.max(f.x,f.y,f.z);c.geometry.applyMatrix4(new e().makeTranslation(-p.x,-p.y,-p.z)),c.geometry.applyMatrix4(new e().makeRotationZ(Math.PI/2)),c.geometry.applyMatrix4(new e().makeScale(-m,m,m)),r?.(.85,`Amostrando superfície orgânica…`);let h=new L(c).build(),v=new Float32Array(n*3),y=new u;for(let e=0;e<n;e++)h.sample(y),v[e*3]=y.x,v[e*3+1]=y.y,v[e*3+2]=y.z;return s.forEach(e=>{e.geometry.dispose(),e.material.dispose()}),v}var V=[{id:`abissal`,name:`ABISSAL`,primary:new p(58879),secondary:new p(14218495),accent:new p(65459)},{id:`titanio`,name:`TITÂNIO`,primary:new p(15791868),secondary:new p(10470888),accent:new p(16777215)},{id:`magma`,name:`MAGMA`,primary:new p(16743168),secondary:new p(16769126),accent:new p(16724804)},{id:`espectral`,name:`ESPECTRAL`,primary:new p(12078591),secondary:new p(65484),accent:new p(6220500)}],H=class{group;points;geometry;material;burstProgress=0;targetBurstProgress=0;currentPrimary=new p(58879);currentSecondary=new p(14218495);activeBiomeIndex=0;userOffset=new u(0,0,0);userScale=1;userRotation=new m(0,0,0);constructor(e,t){this.group=new x,e.add(this.group),this.buildGeometry(t),this.buildMaterial(),this.points=new n(this.geometry,this.material),this.group.add(this.points),this.group.position.set(0,0,-3),this.group.quaternion.identity()}buildGeometry(e){this.geometry=new f;let t=e.pointCount,n=new Float32Array(t*3);for(let r=0;r<t*3;r++)n[r]=e.wallPositions[r];this.geometry.setAttribute(`position`,new y(n,3)),this.geometry.setAttribute(`aPosWall`,new y(e.wallPositions,3)),this.geometry.setAttribute(`aPosSpine`,new y(e.spinePositions,3));let r=new Float32Array(t);for(let e=0;e<t;e++)r[e]=e/t;this.geometry.setAttribute(`aIndex`,new y(r,1));let i=new Float32Array(t*3);for(let e=0;e<t*3;e++)i[e]=Math.random();this.geometry.setAttribute(`aRandom`,new y(i,3))}buildMaterial(){this.material=new c({uniforms:{uTime:{value:0},uBurstProgress:{value:0},uBass:{value:0},uMid:{value:0},uTreble:{value:0},uTransient:{value:0},uColorPrimary:{value:this.currentPrimary},uColorSecondary:{value:this.currentSecondary},uPixelRatio:{value:Math.min(window.devicePixelRatio||1,2)}},vertexShader:`
        attribute vec3 aPosWall;
        attribute vec3 aPosSpine;
        attribute float aIndex;
        attribute vec3 aRandom;

        uniform float uTime;
        uniform float uBurstProgress;
        uniform float uBass;
        uniform float uMid;
        uniform float uTreble;
        uniform float uTransient;
        uniform vec3  uColorPrimary;
        uniform vec3  uColorSecondary;
        uniform float uPixelRatio;

        varying vec3  vColor;
        varying float vAlpha;

        void main() {
          float t = smoothstep(0.0, 1.0, uBurstProgress);
          vec3 basePos = mix(aPosWall, aPosSpine, t);

          // O SALTO: impulso que ejeta as partículas para fora da parede (+Z em direção à câmera)
          float leapArc = sin(t * 3.14159265);
          float settleZ = t * 0.55;
          float forwardBurst = leapArc * (1.1 + aRandom.z * 0.5);
          basePos.z += settleZ + forwardBurst;

          // REATIVIDADE A GRAVES: respiração volumétrica e expansão das vértebras
          float ribExpansion = 1.0 + (uBass * 0.20 * t);
          basePos.x *= ribExpansion;
          basePos.y *= 1.0 + (uBass * 0.12 * t);
          basePos.z += uBass * 0.30 * t;

          // REATIVIDADE A MÉDIOS: onda cinética que viaja pela coluna vertebral
          float spineWave = sin(uTime * 3.8 + aIndex * 14.0) * (uMid * 0.16 + 0.02) * t;
          basePos.x += spineWave;
          basePos.y += cos(uTime * 3.2 + aIndex * 10.0) * (uMid * 0.10) * t;

          // REATIVIDADE A AGUDOS E PICOS (TRANSIENTES):
          if (uTransient > 0.05) {
            vec3 scatter = (aRandom - 0.5) * uTransient * 0.35;
            basePos += scatter;
          }

          // Turbulência sutil das partículas na parede antes do salto
          if (uBurstProgress < 0.3) {
            basePos.x += sin(uTime * 2.5 + aRandom.x * 24.0) * 0.015;
            basePos.y += cos(uTime * 2.0 + aRandom.y * 24.0) * 0.015;
          }

          vec4 mvPosition = modelViewMatrix * vec4(basePos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // Tamanho das partículas
          float baseSize = mix(2.0, 3.6, aRandom.x);
          float soundSparkle = 1.0 + (uTreble * 1.5) + (uBass * 0.7);
          gl_PointSize = clamp((baseSize * soundSparkle * uPixelRatio) / -mvPosition.z, 1.5, 11.0);

          // Gradiente bioluminescente ao longo das vértebras
          float colorBlend = aIndex + (sin(uTime * 1.8 + aIndex * 5.0) * 0.18 * uMid);
          vec3 particleColor = mix(uColorPrimary, uColorSecondary, clamp(colorBlend, 0.0, 1.0));

          // Realce de cintilação branca nos corpúsculos periféricos
          if (aRandom.y > 0.70) {
            particleColor = mix(particleColor, vec3(1.0), uTreble * 0.75);
          }

          vColor = particleColor;
          vAlpha = mix(0.40, 0.90, t);
        }
      `,fragmentShader:`
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float distSq = dot(coord, coord);
          if (distSq > 0.25) discard;

          // Decaimento suave com núcleo brilhante
          float glow = 1.0 - (distSq * 4.0);
          glow = pow(glow, 1.6);
          vec3 finalColor = mix(vColor, vec3(1.0), pow(glow, 4.0) * 0.85);

          gl_FragColor = vec4(finalColor, vAlpha * glow);
        }
      `,transparent:!0,depthWrite:!1,blending:2})}anchorToWorld(e,t){this.group.position.copy(e),this.group.quaternion.copy(t),this.targetBurstProgress=1}triggerBurst(){this.targetBurstProgress=1}resetToWall(){this.targetBurstProgress=0,this.burstProgress=0,this.group.position.set(0,0,-3),this.group.quaternion.identity(),this.userOffset.set(0,0,0),this.userRotation.set(0,0,0),this.userScale=1,this.points.position.set(0,0,0),this.points.rotation.set(0,0,0),this.points.scale.set(1,1,1)}setBiome(e){this.activeBiomeIndex=e%V.length}update(e,t){let n=this.targetBurstProgress>this.burstProgress?.04:.08;this.burstProgress+=(this.targetBurstProgress-this.burstProgress)*n;let r=V[this.activeBiomeIndex];this.currentPrimary.lerp(r.primary,.08),this.currentSecondary.lerp(r.secondary,.08);let i=this.material.uniforms;i.uTime.value=e,i.uBurstProgress.value=this.burstProgress,i.uBass.value=t.bass,i.uMid.value=t.mid,i.uTreble.value=t.treble,i.uTransient.value=+!!t.isTransient,i.uColorPrimary.value=this.currentPrimary,i.uColorSecondary.value=this.currentSecondary,this.points.position.copy(this.userOffset),this.points.rotation.copy(this.userRotation),this.points.scale.set(this.userScale,this.userScale,this.userScale)}dispose(){this.geometry.dispose(),this.material.dispose()}},U=class{container;canvas;callbacks;lockOverlay;permOverlay;reticleEl;statusChip;statusText;audioValEl;audioBars=[];biomeBtns=[];btnLockProj;isLocked=!1;touchStartDist=0;lastTouchX=0;lastTouchY=0;isTouching=!1;constructor(e,t,n){this.container=e,this.canvas=t,this.callbacks=n,this.render(),this.bindGestures()}render(){let e=`/gigantera/`,t=e.endsWith(`/`)?e:e+`/`;this.container.innerHTML=`
      <!-- TOP BAR -->
      <header class="hud-top-bar ar-interactive">
        <div class="hud-title-badge">
          <span class="hud-tag">GIGANTERA AR</span>
          <span class="hud-subtag">ESPINHAÇO</span>
        </div>

        <div class="hud-status-chip" id="hud-status-chip">
          <span class="hud-status-dot"></span>
          <span id="hud-status-text">BUSCANDO PROJEÇÃO</span>
        </div>

        <button class="hud-action-btn" id="btn-recalibrate" title="Recalibrar Alvo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
          RESET
        </button>
      </header>

      <!-- RETÍCULO CENTRAL DE MIRA NA PAREDE (9:16 VERTICAL) -->
      <div class="hud-target-reticle" id="hud-reticle">
        <div class="reticle-frame">
          <img
            src="${t}ar/projection_target.jpg"
            id="reticle-ghost-img"
            class="reticle-ghost-img"
            alt="Silhueta de alinhamento"
          />
          <div class="reticle-corner tl"></div>
          <div class="reticle-corner tr"></div>
          <div class="reticle-corner bl"></div>
          <div class="reticle-corner br"></div>
          <div class="reticle-scan-line"></div>
        </div>

        <div class="reticle-center-cross"></div>

        <div class="reticle-prompt-box">
          <div class="reticle-prompt-title">ENQUADRE A PROJEÇÃO (9:16)</div>
          <div class="reticle-prompt-desc">Alinhe a câmera com a videoarte projetada na parede</div>
        </div>

        <button class="btn-lock-projection ar-interactive" id="btn-lock-projection">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 14 14"/>
          </svg>
          TRAVAR NA PROJEÇÃO
        </button>
      </div>

      <!-- PAINEL DE ÁUDIO & BIOMAS -->
      <footer class="hud-bottom-dock ar-interactive">
        <div class="hud-audio-panel">
          <div class="audio-meter-info">
            <span class="audio-meter-label">MICROFONE // RESSONÂNCIA</span>
            <span class="audio-meter-val" id="hud-audio-val">-60 dB · CALMO</span>
          </div>

          <div class="audio-bars-container" id="hud-audio-bars">
            ${Array.from({length:16}).map(()=>`<div class="audio-bar"></div>`).join(``)}
          </div>
        </div>

        <div class="biome-selector-bar">
          ${V.map((e,t)=>`
            <button class="biome-btn ${t===0?`active`:``}" data-idx="${t}">
              <span class="biome-dot" style="background: #${e.primary.getHexString()}"></span>
              ${e.name}
            </button>
          `).join(``)}
        </div>

        <div class="hud-hint-bar">
          <span>Arraste para girar</span>
          <span>•</span>
          <span>Pinça para zoom</span>
          <span>•</span>
          <span>O som distorce o fóssil</span>
        </div>
      </footer>

      <!-- TELA DE BLOQUEIO / ACESSO RESTRITO -->
      <div class="ar-modal-overlay" id="modal-lock">
        <div class="lock-card">
          <div class="lock-badge">ACESSO RESTRITO</div>
          <h1 class="lock-title">ESPINHAÇO AR</h1>
          <p class="lock-desc">
            Instalação imersiva de realidade aumentada para projeção em parede.
            Digite sua senha de acesso ou utilize o link individual de convidado.
          </p>

          <div class="lock-input-group">
            <input
              type="text"
              id="input-passcode"
              class="lock-input"
              placeholder="CÓDIGO / PIN"
              maxlength="16"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="characters"
              spellcheck="false"
            />
            <div class="lock-error-msg" id="lock-error"></div>
          </div>

          <button class="btn-primary-action" id="btn-unlock">
            LIBERAR ACESSO
          </button>
        </div>
      </div>

      <!-- TELA PRE-FLIGHT (PERMISSÕES DE SENSORES) -->
      <div class="ar-modal-overlay hidden" id="modal-perm">
        <div class="perm-card">
          <div class="lock-badge">CONEXÃO SENSORIAL</div>
          <h2 class="lock-title">PREPARAR AMBIENTE</h2>
          <p class="lock-desc">
            Para que o Espinhaço salte da parede e ressoe com o espaço, precisamos do acesso aos sensores do seu celular:
          </p>

          <div class="perm-list">
            <div class="perm-item">
              <span class="perm-icon">📷</span>
              <div>
                <div class="perm-text-title">CÂMERA TRASEIRA</div>
                <div class="perm-text-sub">Para enquadrar a projeção na parede</div>
              </div>
            </div>

            <div class="perm-item">
              <span class="perm-icon">🎙️</span>
              <div>
                <div class="perm-text-title">MICROFONE</div>
                <div class="perm-text-sub">Para o fóssil vibrar com o som ambiente</div>
              </div>
            </div>

            <div class="perm-item">
              <span class="perm-icon">🧭</span>
              <div>
                <div class="perm-text-title">GIROSCÓPIO</div>
                <div class="perm-text-sub">Para profundidade espacial 3D realista</div>
              </div>
            </div>
          </div>

          <button class="btn-primary-action" id="btn-start-exp">
            INICIAR EXPERIÊNCIA
          </button>
        </div>
      </div>
    `,this.lockOverlay=document.getElementById(`modal-lock`),this.permOverlay=document.getElementById(`modal-perm`),this.reticleEl=document.getElementById(`hud-reticle`),this.statusChip=document.getElementById(`hud-status-chip`),this.statusText=document.getElementById(`hud-status-text`),this.audioValEl=document.getElementById(`hud-audio-val`),this.audioBars=Array.from(document.querySelectorAll(`.audio-bar`)),this.btnLockProj=document.getElementById(`btn-lock-projection`),this.bindEvents()}bindEvents(){let e=document.getElementById(`input-passcode`),t=document.getElementById(`btn-unlock`),n=document.getElementById(`lock-error`),r=()=>{let t=e.value;this.callbacks.onUnlockAttempt(t)?(this.hideLockScreen(),this.showPermScreen()):(e.classList.add(`error`),n.textContent=`CÓDIGO INVÁLIDO. TENTE "ESPINHACO"`,setTimeout(()=>e.classList.remove(`error`),600))};t.addEventListener(`click`,r),e.addEventListener(`keydown`,e=>{e.key===`Enter`&&r()});let i=document.getElementById(`btn-start-exp`);i.addEventListener(`click`,async()=>{i.textContent=`CONECTANDO SENSORES…`;try{await this.callbacks.onStartExperience(),this.hidePermScreen()}catch(e){console.error(e),i.textContent=`TENTAR NOVAMENTE`}}),this.btnLockProj.addEventListener(`click`,()=>{this.triggerHaptic(),this.callbacks.onLockProjection()}),document.getElementById(`btn-recalibrate`).addEventListener(`click`,()=>{this.callbacks.onResetAnchor(),this.unlockProjection()}),this.biomeBtns=Array.from(document.querySelectorAll(`.biome-btn`)),this.biomeBtns.forEach(e=>{e.addEventListener(`click`,()=>{let t=parseInt(e.dataset.idx||`0`,10);this.biomeBtns.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),this.callbacks.onSelectBiome(t)})})}showLockScreen(){this.lockOverlay.classList.remove(`hidden`)}hideLockScreen(){this.lockOverlay.classList.add(`hidden`)}showPermScreen(){this.permOverlay.classList.remove(`hidden`)}hidePermScreen(){this.permOverlay.classList.add(`hidden`)}lockProjection(){this.isLocked=!0,this.reticleEl.classList.add(`hidden`),this.statusChip.classList.add(`locked`),this.statusText.textContent=`PROJEÇÃO ANCORADA`,this.triggerHaptic()}unlockProjection(){this.isLocked=!1,this.reticleEl.classList.remove(`hidden`),this.statusChip.classList.remove(`locked`),this.statusText.textContent=`BUSCANDO PROJEÇÃO`}updateOpticalStatus(e,t=!1){this.isLocked||(e>=.7||t?(this.statusText.textContent=`PROJEÇÃO ENQUADRADA (${Math.round(e*100)}%)`,this.statusChip.classList.add(`detected`),this.btnLockProj.classList.add(`ready`),this.btnLockProj.innerHTML=`
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 14 14"/>
        </svg>
        ● TRAVAR NA PROJEÇÃO
      `):e>=.35?(this.statusText.textContent=`LOCALIZANDO (${Math.round(e*100)}%)`,this.statusChip.classList.remove(`detected`),this.btnLockProj.classList.remove(`ready`),this.btnLockProj.innerHTML=`
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 14 14"/>
        </svg>
        TRAVAR NA PROJEÇÃO
      `):(this.statusText.textContent=`ALINHE COM A PROJEÇÃO`,this.statusChip.classList.remove(`detected`),this.btnLockProj.classList.remove(`ready`),this.btnLockProj.innerHTML=`
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 14 14"/>
        </svg>
        TRAVAR NA PROJEÇÃO
      `))}updateAudioDisplay(e){let t=Math.round(e.decibels),n=`CALMO`;e.bass>.45?n=`GRAVES FORTES`:e.volume>.35&&(n=`RESSONÂNCIA ALTA`),this.audioValEl.textContent=`${t} dB · ${n}`;let r=e.frequencyData,i=Math.floor(r.length/this.audioBars.length);for(let e=0;e<this.audioBars.length;e++){let t=r[e*i]/255,n=Math.max(t*24,3);this.audioBars[e].style.height=`${n}px`}}triggerHaptic(){try{typeof navigator<`u`&&`vibrate`in navigator&&navigator.vibrate([40,60,40])}catch{}}bindGestures(){this.canvas.addEventListener(`touchstart`,e=>{if(e.touches.length===1)this.isTouching=!0,this.lastTouchX=e.touches[0].clientX,this.lastTouchY=e.touches[0].clientY;else if(e.touches.length===2){let t=e.touches[0].clientX-e.touches[1].clientX,n=e.touches[0].clientY-e.touches[1].clientY;this.touchStartDist=Math.hypot(t,n)}},{passive:!0}),this.canvas.addEventListener(`touchmove`,e=>{if(e.touches.length===1&&this.isTouching){let t=e.touches[0].clientX-this.lastTouchX,n=e.touches[0].clientY-this.lastTouchY;this.lastTouchX=e.touches[0].clientX,this.lastTouchY=e.touches[0].clientY,this.callbacks.onTouchRotate(t*.008,n*.008)}else if(e.touches.length===2){let t=e.touches[0].clientX-e.touches[1].clientX,n=e.touches[0].clientY-e.touches[1].clientY,r=Math.hypot(t,n);if(this.touchStartDist>0){let e=r/this.touchStartDist;this.callbacks.onTouchZoom(e),this.touchStartDist=r}}},{passive:!0}),this.canvas.addEventListener(`touchend`,()=>{this.isTouching=!1,this.touchStartDist=0},{passive:!0})}},W=class{auth;camera;audio;ui;particleSystem;renderer;scene;threeCamera;isRunning=!1;startTime=0;frameCount=0;constructor(){this.auth=new w,this.init()}async init(){let e=document.getElementById(`camera-feed`),t=document.getElementById(`ar-canvas`),n=document.getElementById(`vision-canvas`),r=document.getElementById(`ar-hud`);this.initThree(t),this.camera=new A(e,n),this.audio=new j,this.ui=new U(r,t,{onUnlockAttempt:e=>this.auth.validatePasscode(e),onStartExperience:async()=>this.startExperience(),onLockProjection:()=>this.lockProjection(),onResetAnchor:()=>this.resetAnchor(),onSelectBiome:e=>this.particleSystem?.setBiome(e),onTouchRotate:(e,t)=>{this.particleSystem&&(this.particleSystem.userRotation.y+=e*1.5,this.particleSystem.userRotation.x+=t*1.5)},onTouchZoom:e=>{this.particleSystem&&(this.particleSystem.userScale=Math.min(Math.max(this.particleSystem.userScale*e,.4),2.5))}}),this.auth.isAuthorized()?(this.ui.hideLockScreen(),this.ui.showPermScreen()):this.ui.showLockScreen(),this.preloadParticles(),window.addEventListener(`resize`,()=>this.onResize())}initThree(e){this.renderer=new v({canvas:e,alpha:!0,antialias:!0,powerPreference:`high-performance`}),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),this.scene=new s,this.threeCamera=new i(60,window.innerWidth/window.innerHeight,.1,100),this.threeCamera.position.set(0,0,0);let t=new h(16777215,1);this.scene.add(t)}async preloadParticles(){try{let e=await z();this.particleSystem=new H(this.scene,e),console.log(`[EspinhacoAR] ✓ Partículas calibradas e carregadas`)}catch(e){console.error(`[EspinhacoAR] Erro ao carregar partículas:`,e)}}async startExperience(){let e=new(window.AudioContext||window.webkitAudioContext);e.state===`suspended`&&await e.resume();let t=await this.camera.startMedia();await this.camera.initGyro(),await this.audio.initFromStream(t,e),this.isRunning||(this.isRunning=!0,this.startTime=performance.now()*.001,this.animate())}lockProjection(){if(!this.particleSystem)return;let e=this.camera.lockSpatialAnchor(),t=new u(0,0,-1).applyQuaternion(e).clone().multiplyScalar(3);this.particleSystem.anchorToWorld(t,e),this.ui.lockProjection(),console.log(`[EspinhacoAR] ✓ Projeção ancorada na parede em:`,t)}resetAnchor(){this.camera.resetSpatialAnchor(),this.particleSystem&&this.particleSystem.resetToWall(),this.threeCamera.quaternion.identity()}animate(){if(!this.isRunning)return;requestAnimationFrame(()=>this.animate()),this.frameCount++;let e=performance.now()*.001-this.startTime;if(this.audio.update(e),this.camera.updateOrientation(),this.camera.isAnchored&&this.camera.gyroSupported?this.threeCamera.quaternion.copy(this.camera.currentQuaternion):this.threeCamera.quaternion.identity(),this.frameCount%10==0){let e=this.camera.analyzeProjectionBeam();this.ui.updateOpticalStatus(e.confidence,e.isDetected)}this.particleSystem&&this.particleSystem.update(e,this.audio.metrics),this.renderer.render(this.scene,this.threeCamera),this.ui.updateAudioDisplay(this.audio.metrics)}onResize(){let e=window.innerWidth,t=window.innerHeight;this.threeCamera.aspect=e/t,this.threeCamera.updateProjectionMatrix(),this.renderer.setSize(e,t)}};document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,()=>new W):new W;