/**
 * Sfondo animato "giardino" (WebGL2, un solo fragment shader, nessuna libreria).
 *
 * Fotografie reali (prato fiorito + cirri, CC0 — vedi notes/CREDITI-IMMAGINI.md) lavorate dallo shader:
 *  - cielo: gradiente azzurro con un velo rosa all'orizzonte; due strati di cirri (mappe di densità) che
 *    derivano lentamente a velocità diverse, ricolorati: nuclei bianchi, bordi sfumati di rosa;
 *  - prato: la foto è piegata dal vento (raffiche di rumore + onda lenta, più forte vicino alla camera),
 *    ombre di nuvole che passano sull'erba, foschia atmosferica verso l'orizzonte;
 *  - scena `e` (0 → 1): la camera scende nel prato; l'orizzonte esce dallo schermo, l'erba si ingrandisce,
 *    si sfoca leggermente e si scurisce come "sottofondo" per le card.
 */
export type GardenOptions = {
  meadowUrl: string;
  cloudAUrl: string;
  cloudBUrl: string;
  /** valore di scena 0..1 (già con easing), letto a ogni frame */
  getScene: () => number;
  reduced: boolean;
};

const VERT = `#version 300 es
in vec2 aPos; out vec2 vUv;
void main(){ vUv = aPos*.5+.5; gl_Position = vec4(aPos,0.,1.); }`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform vec2 uRes, uMeadowSize;
uniform float uTime, uE, uMotion;
uniform sampler2D uMeadow, uCA, uCB;

float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float a=.5,s=0.; for(int i=0;i<4;i++){ s+=a*vn(p); p=p*2.03+17.1; a*=.5; } return s; }
vec2 mir(vec2 u){ return 1.-abs(mod(u,2.)-1.); }

void main(){
  float asp = uRes.x/uRes.y;
  vec2 P = vec2((vUv.x-.5)*asp, vUv.y);
  float e = uE, t = uTime*uMotion;
  float H  = mix(.43, 1.45, e);          // orizzonte (altezza schermo)
  float Hg = mix(.52, 1.50, e);          // altezza del prato (tutta la foto)

  /* ---------- cielo */
  float yS = P.y - H;
  vec3 zen = vec3(.27,.56,.90), hor = vec3(.80,.89,.95);
  float g = clamp(yS/1.05, 0., 1.);
  vec3 sky = mix(hor, zen, pow(g, .72));
  sky = mix(sky, vec3(.99,.80,.85), .34*exp(-max(yS,0.)*3.6));      // velo rosa
  sky = mix(sky, vec3(1.,.93,.88), .10*exp(-length(P-vec2(.55*asp,H+.38))*2.2)); // chiarore del sole
  float sc = mix(1.25, .75, smoothstep(0., .9, yS));
  float ma = texture(uCA, mir(vec2(P.x*.19*sc + t*.0042 + .2, yS*.29*sc + .10))).r;
  float mb = texture(uCB, mir(vec2(P.x*.13*sc - t*.0026 + .55, yS*.26*sc + .08))).r;
  float cm = max(smoothstep(.30,.92,ma)*.66, smoothstep(.36,.94,mb)*.46);
  float core = smoothstep(.55,1., max(ma,mb));
  vec3 pink = vec3(1.,.84,.89);
  vec3 ccol = mix(pink*.97, vec3(1.), core);
  ccol = mix(ccol, pink, .30*exp(-max(yS,0.)*2.0));
  cm *= smoothstep(-.01,.16,yS);
  sky = mix(sky, ccol, cm);

  /* ---------- prato */
  vec3 col = sky;
  float v = (H - P.y)/Hg;
  if(v > 0.){
    float texAsp = uMeadowSize.x/uMeadowSize.y;
    float Wm = max(asp*1.05, Hg*texAsp*.95);
    float pan = sin(t*.045)*.03;
    float u = .5 + (P.x + pan)/Wm;
    float gust = fbm(vec2(P.x*.8 - t*.20, v*.9 + t*.05));
    float sway = sin(P.x*3.1 + t*1.35 + gust*6.) + .6*sin(P.x*7.3 - t*2.1 + gust*9.);
    float amp = .0050*(.25 + .75*smoothstep(0.,1.,v))*mix(1.,.85,e);
    vec2 uv = vec2(u, v);
    uv.x += ((gust-.5)*2.*amp*1.5 + sway*amp*.5)/Wm;
    uv.y += (sin(P.x*5.+t*1.7+gust*4.)*amp*.2)/Hg;
    float bias = mix(0., .6, smoothstep(.1,1.,e));
    vec3 gr = texture(uMeadow, clamp(vec2(uv.x, 1.-uv.y), vec2(.001), vec2(.999)), bias).rgb;
    // luce e ombra: nuvole che passano sul prato + respiro della luce
    float cs = fbm(vec2(P.x*.55 - t*.024, v*.8 + t*.012) + 3.);
    gr *= mix(1., .80, smoothstep(.48,.78,cs));
    gr *= 1. + (gust-.5)*.14;
    // foschia atmosferica verso l'orizzonte
    float hz = pow(clamp(1.-v*2.0,0.,1.),1.5)*(1.-e*.9);
    gr = mix(gr, hor*.97, hz*.75);
    float a = smoothstep(0., .07, v);
    col = mix(sky, gr, a);
  }
  /* ---------- grading */
  float luma = dot(col, vec3(.299,.587,.114));
  col = mix(col, vec3(luma), .14*e);
  col *= mix(1., .86, e);
  vec2 q = vUv-.5;
  col *= 1. - .20*dot(q,q)*1.6;
  o = vec4(col, 1.);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
  return s;
}
function loadTexture(gl: WebGL2RenderingContext, unit: number, url: string, mip: boolean): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      if (mip) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
      else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      resolve({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function createGarden(canvas: HTMLCanvasElement, opts: GardenOptions): { destroy: () => void; ready: Promise<void> } {
  const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "high-performance" });
  if (!gl) return { destroy() {}, ready: Promise.reject(new Error("webgl2")) };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? "link");
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n: string) => gl.getUniformLocation(prog, n);
  const uRes = U("uRes"), uTime = U("uTime"), uE = U("uE"), uMotion = U("uMotion"), uMS = U("uMeadowSize");
  gl.uniform1i(U("uMeadow"), 0);
  gl.uniform1i(U("uCA"), 1);
  gl.uniform1i(U("uCB"), 2);
  gl.uniform1f(uMotion, opts.reduced ? 0 : 1);

  let alive = true, loaded = false, raf = 0, lastE = -1;
  const start = performance.now();
  const dprCap = Math.min(window.devicePixelRatio || 1, window.innerWidth < 800 ? 1.25 : 1.5);
  const resize = () => {
    const w = Math.max(2, Math.round(canvas.clientWidth * dprCap));
    const h = Math.max(2, Math.round(canvas.clientHeight * dprCap));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); lastE = -1; }
  };
  const draw = (now: number) => {
    resize();
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, (now - start) / 1000);
    gl.uniform1f(uE, opts.getScene());
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const frame = (now: number) => {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    if (!loaded || document.hidden) return;
    const e = opts.getScene();
    if (opts.reduced && Math.abs(e - lastE) < 0.0005) return; // movimento ridotto: solo quando cambia la scena
    lastE = e;
    draw(now);
  };
  const m = loadTexture(gl, 0, opts.meadowUrl, true);
  const ready = Promise.all([m, loadTexture(gl, 1, opts.cloudAUrl, false), loadTexture(gl, 2, opts.cloudBUrl, false)]).then(async ([ms]) => {
    gl.uniform2f(uMS, ms.w, ms.h);
    loaded = true;
  });
  raf = requestAnimationFrame(frame);
  const onResize = () => { lastE = -1; };
  window.addEventListener("resize", onResize);
  return {
    ready,
    destroy() { alive = false; cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); gl.getExtension("WEBGL_lose_context")?.loseContext(); },
  };
}
