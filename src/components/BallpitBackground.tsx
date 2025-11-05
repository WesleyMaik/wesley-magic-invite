import { useRef, useEffect } from 'react';
import {
  Clock,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  SRGBColorSpace,
  MathUtils,
  Vector2,
  Vector3,
  MeshPhysicalMaterial,
  ShaderChunk,
  Color,
  Object3D,
  InstancedMesh,
  PMREMGenerator,
  SphereGeometry,
  AmbientLight,
  PointLight,
  ACESFilmicToneMapping,
  Raycaster,
  Plane
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// @ts-ignore
class ThreeBase {
  #config;
  canvas: any;
  camera: any;
  cameraMinAspect: any;
  cameraMaxAspect: any;
  cameraFov: any;
  maxPixelRatio: any;
  minPixelRatio: any;
  scene: any;
  renderer: any;
  #postprocessing: any;
  size = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 };
  render = this.#defaultRender;
  onBeforeRender = (time?: any) => {};
  onAfterRender = (time?: any) => {};
  onAfterResize = (size?: any) => {};
  #isVisible = false;
  #isRunning = false;
  isDisposed = false;
  #intersectionObserver: any;
  #resizeObserver: any;
  #resizeTimeout: any;
  #clock = new Clock();
  #time = { elapsed: 0, delta: 0 };
  #rafId: any;
  
  constructor(config: any) {
    this.#config = { ...config };
    this.#initCamera();
    this.#initScene();
    this.#initRenderer();
    this.resize();
    this.#initObservers();
  }
  
  #initCamera() {
    this.camera = new PerspectiveCamera();
    this.cameraFov = this.camera.fov;
  }
  
  #initScene() {
    this.scene = new Scene();
  }
  
  #initRenderer() {
    if (this.#config.canvas) {
      this.canvas = this.#config.canvas;
    } else if (this.#config.id) {
      this.canvas = document.getElementById(this.#config.id);
    } else {
      console.error('Three: Missing canvas or id parameter');
    }
    this.canvas.style.display = 'block';
    const options = {
      canvas: this.canvas,
      powerPreference: 'high-performance',
      ...(this.#config.rendererOptions ?? {})
    };
    this.renderer = new WebGLRenderer(options);
    this.renderer.outputColorSpace = SRGBColorSpace;
  }
  
  #initObservers() {
    if (!(this.#config.size instanceof Object)) {
      window.addEventListener('resize', this.#handleResize.bind(this));
      if (this.#config.size === 'parent' && this.canvas.parentNode) {
        this.#resizeObserver = new ResizeObserver(this.#handleResize.bind(this));
        this.#resizeObserver.observe(this.canvas.parentNode);
      }
    }
    this.#intersectionObserver = new IntersectionObserver(this.#handleIntersection.bind(this), {
      root: null,
      rootMargin: '0px',
      threshold: 0
    });
    this.#intersectionObserver.observe(this.canvas);
    document.addEventListener('visibilitychange', this.#handleVisibility.bind(this));
  }
  
  #removeObservers() {
    window.removeEventListener('resize', this.#handleResize.bind(this));
    this.#resizeObserver?.disconnect();
    this.#intersectionObserver?.disconnect();
    document.removeEventListener('visibilitychange', this.#handleVisibility.bind(this));
  }
  
  #handleIntersection(entries: any) {
    this.#isVisible = entries[0].isIntersecting;
    this.#isVisible ? this.#start() : this.#stop();
  }
  
  #handleVisibility() {
    if (this.#isVisible) {
      document.hidden ? this.#stop() : this.#start();
    }
  }
  
  #handleResize() {
    if (this.#resizeTimeout) clearTimeout(this.#resizeTimeout);
    this.#resizeTimeout = setTimeout(this.resize.bind(this), 100);
  }
  
  resize() {
    let width, height;
    if (this.#config.size instanceof Object) {
      width = this.#config.size.width;
      height = this.#config.size.height;
    } else if (this.#config.size === 'parent' && this.canvas.parentNode) {
      width = this.canvas.parentNode.offsetWidth;
      height = this.canvas.parentNode.offsetHeight;
    } else {
      width = window.innerWidth;
      height = window.innerHeight;
    }
    this.size.width = width;
    this.size.height = height;
    this.size.ratio = width / height;
    this.#updateCamera();
    this.#updateRenderer();
    this.onAfterResize(this.size);
  }
  
  #updateCamera() {
    this.camera.aspect = this.size.width / this.size.height;
    if (this.camera.isPerspectiveCamera && this.cameraFov) {
      if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
        this.#adjustFov(this.cameraMinAspect);
      } else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) {
        this.#adjustFov(this.cameraMaxAspect);
      } else {
        this.camera.fov = this.cameraFov;
      }
    }
    this.camera.updateProjectionMatrix();
    this.updateWorldSize();
  }
  
  #adjustFov(targetAspect: number) {
    const t = Math.tan(MathUtils.degToRad(this.cameraFov / 2)) / (this.camera.aspect / targetAspect);
    this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(t));
  }
  
  updateWorldSize() {
    if (this.camera.isPerspectiveCamera) {
      const fov = (this.camera.fov * Math.PI) / 180;
      this.size.wHeight = 2 * Math.tan(fov / 2) * this.camera.position.length();
      this.size.wWidth = this.size.wHeight * this.camera.aspect;
    } else if (this.camera.isOrthographicCamera) {
      this.size.wHeight = this.camera.top - this.camera.bottom;
      this.size.wWidth = this.camera.right - this.camera.left;
    }
  }
  
  #updateRenderer() {
    this.renderer.setSize(this.size.width, this.size.height);
    this.#postprocessing?.setSize(this.size.width, this.size.height);
    let pixelRatio = window.devicePixelRatio;
    if (this.maxPixelRatio && pixelRatio > this.maxPixelRatio) {
      pixelRatio = this.maxPixelRatio;
    } else if (this.minPixelRatio && pixelRatio < this.minPixelRatio) {
      pixelRatio = this.minPixelRatio;
    }
    this.renderer.setPixelRatio(pixelRatio);
    this.size.pixelRatio = pixelRatio;
  }
  
  get postprocessing() {
    return this.#postprocessing;
  }
  
  set postprocessing(value) {
    this.#postprocessing = value;
    this.render = value.render.bind(value);
  }
  
  #start() {
    if (this.#isRunning) return;
    const animate = () => {
      this.#rafId = requestAnimationFrame(animate);
      this.#time.delta = this.#clock.getDelta();
      this.#time.elapsed += this.#time.delta;
      this.onBeforeRender(this.#time);
      this.render();
      this.onAfterRender(this.#time);
    };
    this.#isRunning = true;
    this.#clock.start();
    animate();
  }
  
  #stop() {
    if (this.#isRunning) {
      cancelAnimationFrame(this.#rafId);
      this.#isRunning = false;
      this.#clock.stop();
    }
  }
  
  #defaultRender() {
    this.renderer.render(this.scene, this.camera);
  }
  
  clear() {
    this.scene.traverse((obj: any) => {
      if (obj.isMesh && typeof obj.material === 'object' && obj.material !== null) {
        Object.keys(obj.material).forEach(key => {
          const value = obj.material[key];
          if (value !== null && typeof value === 'object' && typeof value.dispose === 'function') {
            value.dispose();
          }
        });
        obj.material.dispose();
        obj.geometry.dispose();
      }
    });
    this.scene.clear();
  }
  
  dispose() {
    this.#removeObservers();
    this.#stop();
    this.clear();
    this.#postprocessing?.dispose();
    this.renderer.dispose();
    this.isDisposed = true;
  }
}

const pointerMap = new Map();
const pointerPos = new Vector2();
let listenersAdded = false;

function createPointer(config: any) {
  const pointer = {
    position: new Vector2(),
    nPosition: new Vector2(),
    hover: false,
    touching: false,
    onEnter() {},
    onMove() {},
    onClick() {},
    onLeave() {},
    ...config
  };
  
  if (!pointerMap.has(config.domElement)) {
    pointerMap.set(config.domElement, pointer);
    if (!listenersAdded) {
      document.body.addEventListener('pointermove', handlePointerMove);
      document.body.addEventListener('pointerleave', handlePointerLeave);
      document.body.addEventListener('click', handleClick);
      document.body.addEventListener('touchstart', handleTouchStart, { passive: false });
      document.body.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.body.addEventListener('touchend', handleTouchEnd, { passive: false });
      document.body.addEventListener('touchcancel', handleTouchEnd, { passive: false });
      listenersAdded = true;
    }
  }
  
  pointer.dispose = () => {
    const element = config.domElement;
    pointerMap.delete(element);
    if (pointerMap.size === 0) {
      document.body.removeEventListener('pointermove', handlePointerMove);
      document.body.removeEventListener('pointerleave', handlePointerLeave);
      document.body.removeEventListener('click', handleClick);
      document.body.removeEventListener('touchstart', handleTouchStart);
      document.body.removeEventListener('touchmove', handleTouchMove);
      document.body.removeEventListener('touchend', handleTouchEnd);
      document.body.removeEventListener('touchcancel', handleTouchEnd);
      listenersAdded = false;
    }
  };
  return pointer;
}

function handlePointerMove(e: MouseEvent) {
  pointerPos.x = e.clientX;
  pointerPos.y = e.clientY;
  processInteraction();
}

function processInteraction() {
  for (const [elem, pointer] of pointerMap) {
    const rect = elem.getBoundingClientRect();
    if (isInside(rect)) {
      updatePointerPosition(pointer, rect);
      if (!pointer.hover) {
        pointer.hover = true;
        pointer.onEnter(pointer);
      }
      pointer.onMove(pointer);
    } else if (pointer.hover && !pointer.touching) {
      pointer.hover = false;
      pointer.onLeave(pointer);
    }
  }
}

function handleClick(e: MouseEvent) {
  pointerPos.x = e.clientX;
  pointerPos.y = e.clientY;
  for (const [elem, pointer] of pointerMap) {
    const rect = elem.getBoundingClientRect();
    updatePointerPosition(pointer, rect);
    if (isInside(rect)) pointer.onClick(pointer);
  }
}

function handlePointerLeave() {
  for (const pointer of pointerMap.values()) {
    if (pointer.hover) {
      pointer.hover = false;
      pointer.onLeave(pointer);
    }
  }
}

function handleTouchStart(e: TouchEvent) {
  if (e.touches.length > 0) {
    e.preventDefault();
    pointerPos.x = e.touches[0].clientX;
    pointerPos.y = e.touches[0].clientY;
    for (const [elem, pointer] of pointerMap) {
      const rect = elem.getBoundingClientRect();
      if (isInside(rect)) {
        pointer.touching = true;
        updatePointerPosition(pointer, rect);
        if (!pointer.hover) {
          pointer.hover = true;
          pointer.onEnter(pointer);
        }
        pointer.onMove(pointer);
      }
    }
  }
}

function handleTouchMove(e: TouchEvent) {
  if (e.touches.length > 0) {
    e.preventDefault();
    pointerPos.x = e.touches[0].clientX;
    pointerPos.y = e.touches[0].clientY;
    for (const [elem, pointer] of pointerMap) {
      const rect = elem.getBoundingClientRect();
      updatePointerPosition(pointer, rect);
      if (isInside(rect)) {
        if (!pointer.hover) {
          pointer.hover = true;
          pointer.touching = true;
          pointer.onEnter(pointer);
        }
        pointer.onMove(pointer);
      } else if (pointer.hover && pointer.touching) {
        pointer.onMove(pointer);
      }
    }
  }
}

function handleTouchEnd() {
  for (const [, pointer] of pointerMap) {
    if (pointer.touching) {
      pointer.touching = false;
      if (pointer.hover) {
        pointer.hover = false;
        pointer.onLeave(pointer);
      }
    }
  }
}

function updatePointerPosition(pointer: any, rect: DOMRect) {
  const { position, nPosition } = pointer;
  position.x = pointerPos.x - rect.left;
  position.y = pointerPos.y - rect.top;
  nPosition.x = (position.x / rect.width) * 2 - 1;
  nPosition.y = (-position.y / rect.height) * 2 + 1;
}

function isInside(rect: DOMRect) {
  const { x, y } = pointerPos;
  const { left, top, width, height } = rect;
  return x >= left && x <= left + width && y >= top && y <= top + height;
}

const { randFloat, randFloatSpread } = MathUtils;
const v1 = new Vector3();
const v2 = new Vector3();
const v3 = new Vector3();
const v4 = new Vector3();
const v5 = new Vector3();
const v6 = new Vector3();
const v7 = new Vector3();
const v8 = new Vector3();
const v9 = new Vector3();
const v10 = new Vector3();

class Physics {
  config: any;
  positionData: Float32Array;
  velocityData: Float32Array;
  sizeData: Float32Array;
  center: Vector3;
  
  constructor(config: any) {
    this.config = config;
    this.positionData = new Float32Array(3 * config.count).fill(0);
    this.velocityData = new Float32Array(3 * config.count).fill(0);
    this.sizeData = new Float32Array(config.count).fill(1);
    this.center = new Vector3();
    this.#initPositions();
    this.setSizes();
  }
  
  #initPositions() {
    const { config, positionData } = this;
    this.center.toArray(positionData, 0);
    for (let i = 1; i < config.count; i++) {
      const idx = 3 * i;
      positionData[idx] = randFloatSpread(2 * config.maxX);
      positionData[idx + 1] = randFloatSpread(2 * config.maxY);
      positionData[idx + 2] = randFloatSpread(2 * config.maxZ);
    }
  }
  
  setSizes() {
    const { config, sizeData } = this;
    sizeData[0] = config.size0;
    for (let i = 1; i < config.count; i++) {
      sizeData[i] = randFloat(config.minSize, config.maxSize);
    }
  }
  
  update(time: any) {
    const { config, center, positionData, sizeData, velocityData } = this;
    let startIdx = 0;
    
    if (config.controlSphere0) {
      startIdx = 1;
      v1.fromArray(positionData, 0);
      v1.lerp(center, 0.1).toArray(positionData, 0);
      v4.set(0, 0, 0).toArray(velocityData, 0);
    }
    
    for (let idx = startIdx; idx < config.count; idx++) {
      const base = 3 * idx;
      v2.fromArray(positionData, base);
      v5.fromArray(velocityData, base);
      v5.y -= time.delta * config.gravity * sizeData[idx];
      v5.multiplyScalar(config.friction);
      v5.clampLength(0, config.maxVelocity);
      v2.add(v5);
      v2.toArray(positionData, base);
      v5.toArray(velocityData, base);
    }
    
    for (let idx = startIdx; idx < config.count; idx++) {
      const base = 3 * idx;
      v2.fromArray(positionData, base);
      v5.fromArray(velocityData, base);
      const radius = sizeData[idx];
      
      for (let jdx = idx + 1; jdx < config.count; jdx++) {
        const otherBase = 3 * jdx;
        v3.fromArray(positionData, otherBase);
        v6.fromArray(velocityData, otherBase);
        const otherRadius = sizeData[jdx];
        v7.copy(v3).sub(v2);
        const dist = v7.length();
        const sumRadius = radius + otherRadius;
        
        if (dist < sumRadius) {
          const overlap = sumRadius - dist;
          v8.copy(v7).normalize().multiplyScalar(0.5 * overlap);
          v9.copy(v8).multiplyScalar(Math.max(v5.length(), 1));
          v10.copy(v8).multiplyScalar(Math.max(v6.length(), 1));
          v2.sub(v8);
          v5.sub(v9);
          v2.toArray(positionData, base);
          v5.toArray(velocityData, base);
          v3.add(v8);
          v6.add(v10);
          v3.toArray(positionData, otherBase);
          v6.toArray(velocityData, otherBase);
        }
      }
      
      if (config.controlSphere0) {
        v7.copy(v1).sub(v2);
        const dist = v7.length();
        const sumRadius0 = radius + sizeData[0];
        if (dist < sumRadius0) {
          const diff = sumRadius0 - dist;
          v8.copy(v7.normalize()).multiplyScalar(diff);
          v9.copy(v8).multiplyScalar(Math.max(v5.length(), 2));
          v2.sub(v8);
          v5.sub(v9);
        }
      }
      
      if (Math.abs(v2.x) + radius > config.maxX) {
        v2.x = Math.sign(v2.x) * (config.maxX - radius);
        v5.x = -v5.x * config.wallBounce;
      }
      if (config.gravity === 0) {
        if (Math.abs(v2.y) + radius > config.maxY) {
          v2.y = Math.sign(v2.y) * (config.maxY - radius);
          v5.y = -v5.y * config.wallBounce;
        }
      } else if (v2.y - radius < -config.maxY) {
        v2.y = -config.maxY + radius;
        v5.y = -v5.y * config.wallBounce;
      }
      const maxBoundary = Math.max(config.maxZ, config.maxSize);
      if (Math.abs(v2.z) + radius > maxBoundary) {
        v2.z = Math.sign(v2.z) * (config.maxZ - radius);
        v5.z = -v5.z * config.wallBounce;
      }
      v2.toArray(positionData, base);
      v5.toArray(velocityData, base);
    }
  }
}

class SubsurfaceMaterial extends MeshPhysicalMaterial {
  uniforms: any;
  onBeforeCompile2?: any;
  
  constructor(params: any) {
    super(params);
    this.uniforms = {
      thicknessDistortion: { value: 0.1 },
      thicknessAmbient: { value: 0 },
      thicknessAttenuation: { value: 0.1 },
      thicknessPower: { value: 2 },
      thicknessScale: { value: 10 }
    };
    (this as any).defines.USE_UV = '';
    this.onBeforeCompile = (shader: any) => {
      Object.assign(shader.uniforms, this.uniforms);
      shader.fragmentShader =
        '\n        uniform float thicknessPower;\n        uniform float thicknessScale;\n        uniform float thicknessDistortion;\n        uniform float thicknessAmbient;\n        uniform float thicknessAttenuation;\n      ' +
        shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {',
        '\n        void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {\n          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));\n          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;\n          #ifdef USE_COLOR\n            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;\n          #else\n            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;\n          #endif\n          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;\n        }\n\n        void main() {\n      '
      );
      const lightFragment = ShaderChunk.lights_fragment_begin.replace(
        /RE_Direct\( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight \);/g,
        '\n          RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n          RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);\n        '
      );
      shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_begin>', lightFragment);
      if (this.onBeforeCompile2) this.onBeforeCompile2(shader);
    };
  }
}

const defaultConfig = {
  count: 200,
  colors: [0, 0, 0],
  ambientColor: 16777215,
  ambientIntensity: 1,
  lightIntensity: 200,
  materialParams: {
    metalness: 0.5,
    roughness: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0.15
  },
  minSize: 0.5,
  maxSize: 1,
  size0: 1,
  gravity: 0.5,
  friction: 0.9975,
  wallBounce: 0.95,
  maxVelocity: 0.15,
  maxX: 5,
  maxY: 5,
  maxZ: 2,
  controlSphere0: false,
  followCursor: true
};

const dummy = new Object3D();

class Spheres extends InstancedMesh {
  config: any;
  physics: Physics;
  ambientLight: any;
  light: any;
  
  constructor(renderer: any, params: any = {}) {
    const config = { ...defaultConfig, ...params };
    const envScene = new RoomEnvironment();
    const pmremGenerator = new PMREMGenerator(renderer);
    pmremGenerator.compileCubemapShader();
    const envMap = pmremGenerator.fromScene(envScene as any).texture;
    const geometry = new SphereGeometry();
    const material = new SubsurfaceMaterial({ envMap, ...config.materialParams });
    super(geometry, material, config.count);
    this.config = config;
    this.physics = new Physics(config);
    this.#initLights();
    this.setColors(config.colors);
  }
  
  #initLights() {
    this.ambientLight = new AmbientLight(this.config.ambientColor, this.config.ambientIntensity);
    this.add(this.ambientLight);
    this.light = new PointLight(this.config.colors[0], this.config.lightIntensity);
    this.add(this.light);
  }
  
  setColors(colors: any) {
    if (Array.isArray(colors) && colors.length > 1) {
      const gradient = createGradient(colors);
      for (let idx = 0; idx < this.count; idx++) {
        this.setColorAt(idx, gradient.getColorAt(idx / this.count));
        if (idx === 0) {
          this.light.color.copy(gradient.getColorAt(idx / this.count));
        }
      }
      this.instanceColor!.needsUpdate = true;
    }
  }
  
  update(time: any) {
    this.physics.update(time);
    for (let idx = 0; idx < this.count; idx++) {
      dummy.position.fromArray(this.physics.positionData, 3 * idx);
      if (idx === 0 && this.config.followCursor === false) {
        dummy.scale.setScalar(0);
      } else {
        dummy.scale.setScalar(this.physics.sizeData[idx]);
      }
      dummy.updateMatrix();
      this.setMatrixAt(idx, dummy.matrix);
      if (idx === 0) this.light.position.copy(dummy.position);
    }
    this.instanceMatrix.needsUpdate = true;
  }
}

function createGradient(colors: any) {
  let colorArray: any;
  let colorObjects: Color[];
  
  function setColors(cols: any) {
    colorArray = cols;
    colorObjects = [];
    colorArray.forEach((col: any) => {
      colorObjects.push(new Color(col));
    });
  }
  
  setColors(colors);
  
  return {
    setColors,
    getColorAt: function (ratio: number, out = new Color()) {
      const scaled = Math.max(0, Math.min(1, ratio)) * (colorArray.length - 1);
      const idx = Math.floor(scaled);
      const start = colorObjects[idx];
      if (idx >= colorArray.length - 1) return start.clone();
      const alpha = scaled - idx;
      const end = colorObjects[idx + 1];
      out.r = start.r + alpha * (end.r - start.r);
      out.g = start.g + alpha * (end.g - start.g);
      out.b = start.b + alpha * (end.b - start.b);
      return out;
    }
  };
}

function createBallpit(canvas: HTMLCanvasElement, params: any = {}) {
  const three = new ThreeBase({
    canvas,
    size: 'parent',
    rendererOptions: { antialias: true, alpha: true }
  });
  
  let spheres: any;
  three.renderer.toneMapping = ACESFilmicToneMapping;
  three.camera.position.set(0, 0, 20);
  three.camera.lookAt(0, 0, 0);
  three.cameraMaxAspect = 1.5;
  three.resize();
  initialize(params);
  
  const raycaster = new Raycaster();
  const plane = new Plane(new Vector3(0, 0, 1), 0);
  const raycastPoint = new Vector3();
  let isPaused = false;
  
  canvas.style.touchAction = 'none';
  canvas.style.userSelect = 'none';
  // @ts-ignore
  canvas.style.webkitUserSelect = 'none';
  
  const pointer = createPointer({
    domElement: canvas,
    onMove() {
      raycaster.setFromCamera(pointer.nPosition, three.camera);
      three.camera.getWorldDirection(plane.normal);
      raycaster.ray.intersectPlane(plane, raycastPoint);
      spheres.physics.center.copy(raycastPoint);
      spheres.config.controlSphere0 = true;
    },
    onLeave() {
      spheres.config.controlSphere0 = false;
    }
  });
  
  function initialize(config: any) {
    if (spheres) {
      three.clear();
      three.scene.remove(spheres);
    }
    spheres = new Spheres(three.renderer, config);
    three.scene.add(spheres);
  }
  
  three.onBeforeRender = (time: any) => {
    if (!isPaused) spheres.update(time);
  };
  
  three.onAfterResize = (size: any) => {
    spheres.config.maxX = size.wWidth / 2;
    spheres.config.maxY = size.wHeight / 2;
  };
  
  return {
    three,
    get spheres() {
      return spheres;
    },
    setCount(count: number) {
      initialize({ ...spheres.config, count });
    },
    togglePause() {
      isPaused = !isPaused;
    },
    dispose() {
      pointer.dispose();
      three.dispose();
    }
  };
}

const BallpitBackground = ({ className = '', followCursor = true, ...props }: any) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<any>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    instanceRef.current = createBallpit(canvas, { followCursor, ...props });

    return () => {
      if (instanceRef.current) {
        instanceRef.current.dispose();
      }
    };
  }, [followCursor, props]);

  return (
    <div className="fixed inset-0 -z-10">
      <canvas className={className} ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background pointer-events-none" />
    </div>
  );
};

export default BallpitBackground;
