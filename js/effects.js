/* ============================================================================
   BitRetro — Retro-Futurism Effects Engine
   T05: Retro-Futurism Visual Effects
   ----------------------------------------------------------------------------
   - WebGL disco-ball background (fullscreen fragment shader): rotating mirror
     ball with sparkling facets, light beams and a starfield. Falls back to a
     CSS disco ball when WebGL is unavailable.
   - Glitch transition fired whenever the live BTC price refreshes.
   - Performance-aware: clamps device-pixel-ratio, pauses when the tab/section
     is hidden, and fully respects prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";

  var prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ */
  /* Glitch transition on price refresh                                  */
  /* ------------------------------------------------------------------ */
  function initGlitchOnRefresh() {
    var price = document.getElementById("btc-price");
    if (!price || prefersReduced || !("MutationObserver" in window)) return;
    var last = price.textContent;
    var clearTimer = null;

    var obs = new MutationObserver(function () {
      var now = price.textContent;
      if (now === last || price.classList.contains("is-loading")) { last = now; return; }
      last = now;
      price.setAttribute("data-glitch", now);
      price.classList.add("fx-glitch");
      if (clearTimer) clearTimeout(clearTimer);
      clearTimer = setTimeout(function () {
        price.classList.remove("fx-glitch");
        price.removeAttribute("data-glitch");
      }, 420);
    });
    obs.observe(price, { childList: true, characterData: true, subtree: true });
  }

  /* ------------------------------------------------------------------ */
  /* WebGL disco-ball background                                          */
  /* ------------------------------------------------------------------ */
  var VERT = [
    "attribute vec2 a_pos;",
    "void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }",
  ].join("\n");

  var FRAG = [
    "precision highp float;",
    "uniform vec2 u_res;",
    "uniform float u_time;",
    "float hash(vec2 p){",
    "  p = fract(p*vec2(123.34, 456.21));",
    "  p += dot(p, p+45.32);",
    "  return fract(p.x*p.y);",
    "}",
    "vec3 palette(float t){",
    "  return vec3(0.5) + vec3(0.5)*cos(6.2831*(vec3(1.0)*t + vec3(0.0,0.33,0.67)));",
    "}",
    "void main(){",
    "  vec2 uv = (gl_FragCoord.xy - 0.5*u_res) / u_res.y;",
    "  vec3 col = vec3(0.02, 0.005, 0.06);",
    "  vec2 g = floor((uv*0.5+0.5) * 220.0);",
    "  float s = hash(g);",
    "  if(s > 0.992){",
    "    float tw = 0.6 + 0.4*sin(u_time*3.0 + s*40.0);",
    "    col += vec3(0.5,0.55,0.7) * tw * (s-0.992)/0.008;",
    "  }",
    "  vec2 c = uv - vec2(0.0, 0.16);",
    "  float R = 0.26;",
    "  float r = length(c);",
    "  col += palette(u_time*0.05) * 0.12 * smoothstep(R*2.6, 0.0, r);",
    "  if(r < R){",
    "    vec2 nxy = c / R;",
    "    float nz = sqrt(max(0.0, 1.0 - dot(nxy, nxy)));",
    "    vec3 n = vec3(nxy, nz);",
    "    float a = u_time*0.5;",
    "    mat2 rot = mat2(cos(a), -sin(a), sin(a), cos(a));",
    "    vec2 xz = rot * n.xz;",
    "    vec3 rn = vec3(xz.x, n.y, xz.y);",
    "    float lon = atan(rn.x, rn.z);",
    "    float lat = asin(clamp(rn.y, -1.0, 1.0));",
    "    vec2 cell = floor(vec2(lon/3.14159 * 16.0, lat/3.14159 * 14.0));",
    "    float facet = hash(cell);",
    "    float spk = hash(cell + floor(u_time*4.0));",
    "    float bright = facet*0.4 + 0.15;",
    "    bright += smoothstep(0.86, 1.0, spk) * 1.4;",
    "    vec3 tint = palette(facet + u_time*0.08);",
    "    vec3 ball = tint * bright;",
    "    ball *= 0.55 + 0.6*nz;",
    "    col = mix(col, ball, smoothstep(R, R-0.004, r));",
    "  }",
    "  vec2 bc = uv - vec2(0.0, 0.16);",
    "  float ang = atan(bc.y, bc.x) + u_time*0.25;",
    "  float beams = pow(0.5 + 0.5*sin(ang*8.0), 8.0);",
    "  float dist = smoothstep(1.2, 0.2, length(bc));",
    "  col += palette(u_time*0.1 + 0.3) * beams * dist * 0.10 * step(R, length(bc));",
    "  col *= 1.0 - 0.25*length(uv);",
    "  gl_FragColor = vec4(col, 1.0);",
    "}",
  ].join("\n");

  function compile(gl, type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn("BitRetro fx shader error:", gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function initWebGL() {
    var canvas = document.getElementById("fx-bg");
    if (!canvas) return;

    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) { document.body.classList.add("no-webgl"); return; }

    var vs = compile(gl, gl.VERTEX_SHADER, VERT);
    var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { document.body.classList.add("no-webgl"); return; }

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      document.body.classList.add("no-webgl");
      return;
    }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, "u_res");
    var uTime = gl.getUniformLocation(prog, "u_time");

    function resize() {
      var small = Math.min(window.innerWidth, window.innerHeight) < 600;
      var dpr = Math.min(window.devicePixelRatio || 1, small ? 1 : 1.5);
      var w = Math.floor(canvas.clientWidth * dpr);
      var h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    var start = performance.now();
    var raf = null;

    function frame(now) {
      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    }

    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }
    function play() { if (!raf && !document.hidden) raf = requestAnimationFrame(frame); }

    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else play();
    });
    canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); stop(); });

    if (prefersReduced) {
      /* Render a single calm frame, then leave it static. */
      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, 8.0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      play();
    }
  }

  function init() {
    initGlitchOnRefresh();
    initWebGL();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
