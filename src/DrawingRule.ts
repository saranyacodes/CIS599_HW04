import {vec3, vec4, mat4} from 'gl-matrix';
import Turtle from './Turtle';

function randomRange(a: number, b: number) {
    return a + Math.random() * (b - a);
}

export default class DrawingRule {
    drawingRules: Map<string, any> = new Map();
    turtleStack: Array<Turtle> = new Array();

    iteration: number;
    leavesThreshold: number;

    branchesMat: Array<mat4> = []; //use this
    leavesMat: Array<mat4> = []; 

    thick: boolean = false; 

    constructor(iter: number) {
        let turtle = new Turtle(vec3.fromValues(0, 0, 0), 
                             vec3.fromValues(0, 1, 0), 
                             vec3.fromValues(1, 0, 0),
                             1, 
                             0);
        this.turtleStack.push(turtle);
        this.drawingRules.set('A', this.drawBranch.bind(this, 0.2, 0.5));
        this.drawingRules.set('B', this.drawBranchEndOrLeaf.bind(this)); //make this drawLeaf
        this.drawingRules.set('[', this.push.bind(this));
        this.drawingRules.set(']', this.pop.bind(this));
        this.drawingRules.set('>', this.rotateRight.bind(this, 3, 10));
        this.drawingRules.set('^', this.rotateUp.bind(this, 100, 140));

        this.iteration = iter;
    }

    getRule(phrase: string) {
        let drawFunc = this.drawingRules.get(phrase);
        if (drawFunc) drawFunc();
    }

    rotateRight(a: number, b: number) {
        let turtle = this.turtleStack[this.turtleStack.length - 1];
        turtle.rotateRight(randomRange(a, b));
    }

    rotateUp(a: number, b: number) {
        let turtle = this.turtleStack[this.turtleStack.length - 1];
        turtle.rotateUp(randomRange(a, b));
    }

    push() {
        let turtle = this.turtleStack[this.turtleStack.length - 1];
        let clonedTurtle = Turtle.clone(turtle);
        clonedTurtle.depth += 1;
        this.turtleStack.push(clonedTurtle);
    }

    pop() {
        this.turtleStack.pop();
    }

    drawBranch(a: number, b: number) {
        let turtle = this.turtleStack.pop();
        let forward = vec3.create();
        vec3.cross(forward, turtle.right, turtle.orientation);

        let endBranchTurtle = Turtle.clone(turtle);
        endBranchTurtle.moveForward(randomRange(a, b));
        let branch = vec3.create();
        vec3.subtract(branch, endBranchTurtle.position, turtle.position);
        this.turtleStack.push(endBranchTurtle);

        
        let branchLen = vec3.len(branch);
        let t = 1 - endBranchTurtle.step / (Math.pow(1.72, this.iteration) * 6.65);
        t = Math.max(Math.min(t, 1.0), 0.0);
        let branchScale = (t * t * (3.0 - 2.0 * t)) * 0.18 * this.iteration * this.iteration + 0.2;
        
        //HAVE THIS CODE IF "thin tree" is ticked
        if (!this.thick) {
            let position = vec3.create();
            let s =  1 / Math.pow(1.2, this.iteration);
            branchLen = branchLen * s;
            branchScale = branchScale * s;
            vec3.scale(position, turtle.position, s);
            //END 
        }

        //create translate mat4-- should be position of currTurtle above
        let T = mat4.create(); 
        mat4.fromTranslation(T, turtle.position); 

        //create rotation matrix
        //equation for angle of rotation --> acos(dot(v1, v2)) in which v1 is y axis (0, 1, 0) and v2 is normalize(endpos - startpos)
        let v1 = vec3.fromValues(0, 1, 0);  
        let B = vec3.create(); 
        vec3.subtract(B, endBranchTurtle.position, turtle.position); //get the vector for the branch AFTER moving the turtle 
        vec3.normalize(B, B); //normalize b and put it back in b
        let angle = Math.acos(vec3.dot(v1, B)); //should I make this into radians? 
       // let radians = angle * Math.PI / 180.0; 

        let R = mat4.create(); 
        let axis = vec3.create(); 
        vec3.cross(axis, v1, B); //the axis of rotation is v1 cross b 
        vec3.normalize(axis, axis); 
        mat4.fromRotation(R, angle, axis); 

        //create scale matrix 
        //should be created from vec3(radius, length, radius) 
        //radius can get smaller depending on the depth
        //length is the length of the branch 
        vec3.subtract(B, endBranchTurtle.position, turtle.position);
        let length = vec3.len(B); 
        let scaleVec = vec3.fromValues(branchScale, length, branchScale); 

        let S = mat4.create(); 
        mat4.fromScaling(S, scaleVec); 

        //now multiply in the T R S order 
        //as in M = (T * (R * S))
        //remember: matrix multiplication is from RIGHT <-- LEFT 
        let M = mat4.create(); 
        mat4.multiply(M, R, S); //M = r * s
        mat4.multiply(M, T, M); //M = t * M = t * r * s

        //push back into the branches matrix 
        this.branchesMat.push(M); 


    }

    drawLeaf() {
        //use same code as above
        //replace default length with actual size of the mesh (hardcoded to the leaf size)
        //make obj file align with the y axis 
        let turtle = this.turtleStack[this.turtleStack.length - 1];
         turtle.rotateUp(randomRange(-180, 180));

        //create translate mat4-- should be position of currTurtle above
        let T = mat4.create(); 
        mat4.fromTranslation(T, turtle.position); 

        //create rotation mat4
        //leaf length 
        let leafLength = 1.0; 
        let endpos = vec3.create(); //move along the orient of the amount leafLength 
        let disp = vec3.fromValues( turtle.orientation[0] * leafLength,
            turtle.orientation[1] * leafLength,
            turtle.orientation[2] * leafLength );
        vec3.add(endpos, turtle.position, disp);

        let v1 = vec3.fromValues(0, 1, 0);  
        let B = vec3.create(); 
        vec3.subtract(B, endpos, turtle.position); //get the vector for the branch AFTER moving the turtle 
        vec3.normalize(B, B); //normalize b and put it back in b
        let angle = Math.acos(vec3.dot(v1, B)); //should I make this into radians? 

        let R = mat4.create(); 
        let axis = vec3.create(); 
        vec3.cross(axis, v1, B); //the axis of rotation is v1 cross b 
        vec3.normalize(axis, axis); 
        mat4.fromRotation(R, angle, axis); 

        //create scale matrix 
        let leafScale = 1.0; 
        let scaleVec = vec3.fromValues(leafScale, leafLength, leafLength);

        let S = mat4.create(); 
        mat4.fromScaling(S, scaleVec); 

        //now multiply in the T R S order 
        //as in M = (T * (R * S))
        //remember: matrix multiplication is from RIGHT <-- LEFT 
        let M = mat4.create(); 
        mat4.multiply(M, R, S); //M = r * s
        mat4.multiply(M, T, M); //M = t * M = t * r * s

        this.leavesMat.push(M); 


    }

    drawBranchEnd() {
        let turtle = this.turtleStack[this.turtleStack.length - 1];
        let adding = randomRange(-3, 3);
        let depthLength = 0.5 / Math.exp(turtle.depth / 5);
        let rand = Math.random(); 
        let numSegments = rand * 5 + 20;
        for (let i = 0; i < numSegments; i++) {
            this.drawBranch(depthLength * (1 - i / numSegments), depthLength * (1 - i / numSegments));
            // this.rotateUp(adding, adding);
            // if (rand > 0.5) {
            //     this.rotateRight(10, 15);
            // }
           
        }
    }

    drawBranchEndOrLeaf() {
        let rand = Math.random();
        if (rand < this.leavesThreshold) this.drawLeaf(); //CAN REPLACE 0.5 with a number to create spirals 
        else this.drawBranchEnd();
    }

    drawAngle(a: number, b: number) {
        let angle = randomRange(a, b);
        let numSegments = 10;
        for(let i = 0; i < numSegments; i++) {
            this.rotateRight(angle / numSegments, angle / numSegments);
            this.drawBranch(0.4, 0.7);
        }
    }


    setAngle(angle: number) {
        this.drawingRules.set('+', this.drawAngle.bind(this, 0.6 * angle, angle));
    }
};