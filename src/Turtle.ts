import {vec3, quat} from 'gl-matrix';

export default class Turtle {

    position: vec3;
    orientation: vec3;
    right: vec3;
    step: number;
    depth: number;

    constructor(pos: vec3, orient: vec3, right: vec3, step: number, depth: number) {
        this.position = vec3.clone(pos);
        this.orientation = vec3.clone(orient);
        this.right = vec3.clone(right);
        this.step = step;
        this.depth = depth;
    }

    static clone(inputTurtle: Turtle) {
        let copyTurtle = new Turtle(inputTurtle.position,
                                 inputTurtle.orientation,
                                 inputTurtle.right,
                                 inputTurtle.step,
                                 inputTurtle.depth);
        return copyTurtle;
    }

    moveForward(length: number) {
        let displacement = vec3.fromValues( this.orientation[0] * length,
                                    this.orientation[1] * length,
                                    this.orientation[2] * length );
        vec3.add(this.position, this.position, displacement);
        this.step += 1;
    }

    rotateRight(angle: number) {
        angle = angle * Math.PI / 180;
        let rotX: quat = quat.create();
        quat.setAxisAngle(rotX, this.right, angle);
        vec3.transformQuat(this.orientation, this.orientation, rotX);
        //also have to rotate "upTemp" by rotX
    }

    rotateUp(angle: number) {
        angle = angle * Math.PI / 180;
        let rotY: quat = quat.create();
        quat.setAxisAngle(rotY, this.orientation, angle);
        vec3.transformQuat(this.right, this.right, rotY);
        //also have to rotate "upTemp" by rotY
    }

    //Z rotation kind of
    // rotateUpTemp(ang: number) {
    //     ang = ang * Math.PI / 180;
    //     let rotZ: quat = quat.create();
    //     //upTemp would START as (0, 0, 1)
    //     quat.setAxisAngle(rotZ, this.upTemp, ang);
    //     vec3.transformQuat(this.orientation, this.orientation, rotZ);
        //rotate other two by rotZ
    // }
    //treat orientation (current rotateUp) as rotateForward for the ORIENTATION
    //add a Z rotation which woudl be rotateUp (localY)

    //TODO: look at rotateByLocal in the miniminecraft 

    //im adding more transformations
      //rotateX aka rotateRight
  rotateX(angle: number) {
    let radians = angle * Math.PI / 180; 
    let x = this.orientation[0];
    let y = this.orientation[1]; 
    let z = this.orientation[2]; 

    let newY = y * Math.cos(radians) - z * Math.sin(radians); 
    let newZ = y * Math.sin(radians) + z * Math.cos(radians); 
    
    let newOrient = vec3.fromValues(x, newY, newZ); 
    this.orientation = newOrient; 
}

//rotateY aka rotateUp
rotateY(angle: number) {
  let radians = angle * Math.PI / 180; 
  let x = this.orientation[0];
  let y = this.orientation[1]; 
  let z = this.orientation[2]; 

  let newX = z * Math.sin(radians) + x * Math.cos(radians); 
  let newZ = z * Math.cos(radians) - x * Math.sin(radians);

  let newOrient = vec3.fromValues(newX, y, newZ); 
  this.orientation = newOrient; 
}

 
//rotateZ aka rotateForward
rotateZ(angle: number) {
  let radians = angle * Math.PI / 180; 
  let x = this.orientation[0];
  let y = this.orientation[1]; 
  let z = this.orientation[2]; 
  let newX = x * Math.cos(radians) - y * Math.sin(radians); 
  let newY = x * Math.sin(radians) + y * Math.cos(radians); 

  let newOrient = vec3.fromValues(newX, newY, z); 
  this.orientation = newOrient; 
}
}