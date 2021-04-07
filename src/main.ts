import {vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import LSystem from './LSystem';

function hex2vec4(col: string) {
  let hexCol = parseInt(col.slice(1), 16);
  let r = (hexCol >> 16) & 255;
  let g = (hexCol >> 8) & 255;
  let b = hexCol & 255;
  return vec4.fromValues(r / 255.0, g / 255.0, b / 255.0, 1);
}

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  iterations: 6,
  leaf_density: 0.5,
  branch_angle: 60,
  leaves_color: '#107027',
  branch_color: '#7d5757',
  thick_branch: false, 
  leaf_type: 1,
  shader_type: 1, 

  get LeafColor() { return hex2vec4(this.leaves_color); },
  get BranchColor() { return hex2vec4(this.branch_color); },
};

let screenQuad: ScreenQuad;
let time: number = 0.0;
let lsystem: LSystem;
let numIterations: number = controls.iterations;
let square: Square;

let leafType1: string = "./obj/leaf.obj"; 
let leafType2: string = "./obj/rose.obj"; 
let leafType3: string = "./obj/star.obj"; 

function loadScene() {
  screenQuad = new ScreenQuad();
  screenQuad.create();
  square = new Square();
  square.create();
  let offsetsArray = [];
  let colorsArray = [];
  let n: number = 100.0;
  for(let i = 0; i < n; i++) {
    for(let j = 0; j < n; j++) {
      offsetsArray.push(i);
      offsetsArray.push(j);
      offsetsArray.push(0);

      colorsArray.push(i / n);
      colorsArray.push(j / n);
      colorsArray.push(1.0);
      colorsArray.push(1.0); // Alpha channel
    }
  }
  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  square.setInstanceVBOs(offsets, colors);
  square.setNumInstances(n * n); // grid of "particles"

  lsystem = new LSystem('./obj/cylinderTest.obj', leafType1);
  lsystem.branchCol = controls.BranchColor;
  lsystem.leafCol = controls.LeafColor;
  lsystem.leafDensity = controls.leaf_density;
  lsystem.branchAngle = controls.branch_angle;
  lsystem.processLsystem(controls.iterations);

}

function main() {
  // Initial display for framerate
  const stats = Stats(); 
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, "iterations", 0, 8).step(1);
  gui.add(controls, "leaf_density", 0, 1);
  gui.add(controls, "branch_angle", 0, 180);
  gui.addColor(controls, "leaves_color");
  gui.addColor(controls, "branch_color");
  gui.add(controls, "thick_branch"); 
  gui.add(controls, "leaf_type", {Leaf: 1, Roses: 2, Stars: 3}); 
  gui.add(controls, "shader_type", {Lambert: 1, Flat: 2}); 
  console.log("leaftype", controls.leaf_type); 

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(15, 15, -100), vec3.fromValues(0, 50, 0));
  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    //added
  const instancedMatShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-mat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-mat-frag.glsl')),
  ]);

  //lambert
  const instancedLambertShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-lambert-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

//this function redraws the lsystem 
function redrawLsystem(thick: boolean) {
  let leafString = ""; 
  if (controls.leaf_type == 1) {
    leafString = leafType1; 
  } else if (controls.leaf_type == 2) {
    leafString = leafType2; 
  } else {
    leafString = leafType3; 
  }
  lsystem = new LSystem('./obj/cylinderTest.obj', leafString);
  lsystem.setThick(thick); 
  lsystem.branchCol = controls.BranchColor;
  lsystem.leafCol = controls.LeafColor;
  lsystem.leafDensity = controls.leaf_density;
  lsystem.branchAngle = controls.branch_angle;
  lsystem.processLsystem(controls.iterations);
}


  // This function will be called every frame 
  function tick() {
    camera.update();
    stats.begin();
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();

    if(numIterations != controls.iterations) {1
      numIterations = controls.iterations;
      redrawLsystem(controls.thick_branch); 
    }

    if(lsystem.branchAngle != controls.branch_angle) {
      lsystem.branchAngle = controls.branch_angle;
      redrawLsystem(controls.thick_branch); 
    }

    if(!vec4.equals(lsystem.branchCol, controls.BranchColor) ||
       !vec4.equals(lsystem.leafCol, controls.LeafColor))
    {
      lsystem.branchCol = controls.BranchColor;
      lsystem.leafCol = controls.LeafColor;
      lsystem.render();
    }

    //density of leaves 
    if(lsystem.leafDensity != controls.leaf_density) {
      lsystem.leafDensity = controls.leaf_density;
      redrawLsystem(controls.thick_branch); 
      
    }

    //thickness of branch 
    if (controls.thick_branch != lsystem.getThick()) {
      redrawLsystem(controls.thick_branch); 
    }

    //leaftype
    if (controls.leaf_type != lsystem.leafType) {
      lsystem.leafType = controls.leaf_type;

      if (controls.leaf_type == 1) {
        lsystem.leafObj = leafType1; 
        lsystem.render(); 

      } else if (controls.leaf_type == 2) {
        lsystem.leafObj = leafType2; 
        lsystem.render(); 
      } else {
        lsystem.leafObj = leafType3; 
        lsystem.render(); 
      }
      
    }

    renderer.render(camera, flat, [screenQuad]);

    //based on the shader type we should update the render 
    if (controls.shader_type == 1) {
      //1 --> lambert 
      renderer.render(camera, instancedLambertShader, [lsystem.branchesGeom, lsystem.leafGeom]); //my test tree
    } else if (controls.shader_type == 2) {
      //2 --> flat 
      renderer.render(camera, instancedMatShader, [lsystem.branchesGeom, lsystem.leafGeom]); //my test tree
    } else {
      //default to lambert
      renderer.render(camera, instancedLambertShader, [lsystem.branchesGeom, lsystem.leafGeom]); //my test tree
    }


    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
   // bg.render();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
