import DrawingRule from "./DrawingRule";
import Mesh from './geometry/Mesh';
import {readTextFile} from './globals';
import { vec4 } from "gl-matrix";
import ExpansionRule from "./ExpansionRules"



export default class LSystem {
    branchesGeom: Mesh;
    branchesObj: string;
    leafGeom: Mesh;
    leafObj: string;
    grammar: string = 'AB'; 
    expRules: ExpansionRule = new ExpansionRule();
    drawRules: DrawingRule = new DrawingRule(0);

    leafCol: vec4 = vec4.create();
    branchCol: vec4 = vec4.create();
    leafDensity: number = 0;
    branchAngle: number = 0;

    leafType: number = 1; //stores the previous leafType

    constructor(branchObj: string, leafObj: string) {
        this.branchesObj = branchObj;
        this.leafObj = leafObj;
    }

    setWacky(val: boolean) {
        this.expRules.treeWacky = val; 
    }

    getWacky() {
        return this.expRules.treeWacky; 
    }

    setThick(val: boolean) {
        this.drawRules.thick = val; 
    }

    getThick() {
        return this.drawRules.thick; 
    } 

        //this... does not work 
    reprocessLSystem(iterations: number) {
        //reset the drawing rules and the string and everything 
        let thickCopy = this.getThick(); 
        let grammarCopy = this.grammar; 
        this.drawRules = new DrawingRule(0);
        this.setThick(thickCopy); 
        this.grammar = grammarCopy; 
        this.processLsystem(iterations); 
    }

    processLsystem(iterations: number) {
        for (let i = 0; i < iterations; i++) {
            //expand string here
            let tempStr: string = '';
            for (let j = 0; j < this.grammar.length; j++) {
                let currSymbol = this.grammar.charAt(j); 
                tempStr = tempStr.concat(this.expRules.expand(currSymbol)); 
            }
            this.grammar = tempStr; 

        }

        let finalGrammar: string = this.grammar; 
        this.drawRules.iteration = iterations; 
        this.drawRules.setAngle(this.branchAngle);
        this.drawRules.leavesThreshold = this.leafDensity;
        //then iterate through each drawing rule and perform the rule 
        for (let i = 0; i < finalGrammar.length; i++) {
            this.drawRules.getRule(finalGrammar.charAt(i)); 
        }

        this.render();
    }


    render() {
        //call everything which must be rendered 
        this.renderBranches(); //added
        this.renderLeaves(); 


    }

    renderBranches() {

        this.branchesGeom = new Mesh(readTextFile(this.branchesObj));
        this.branchesGeom.destory();
        this.branchesGeom.create();

        //do NumInstances
        let branchMatNum = this.drawRules.branchesMat.length; //number of instances of branches 
        this.branchesGeom.setNumInstances(branchMatNum); //set num instances

           //do InstancedMatrices
           let floatNum = branchMatNum * 16; 
           let branchArr: Float32Array = new Float32Array(floatNum); //allocate 16 * numMat spaces 
           for (let i = 0; i < branchMatNum; i++) {                  //copy every matrix into the branchArr (flattened)
               let currMat: Float32Array = this.drawRules.branchesMat[i]; 
               //CURRMAT LENGTH SHOULD BE 16
               for (let j = 0; j < 16; j++) {
                   branchArr[(i * 16) + j] = currMat[j]; 
               }
               //console.log(currMat); 
           }

            //do Colors
        //should be four entries for each instance 
        let branchColorArr: Float32Array = new Float32Array(branchMatNum * 4); //each instance has 4 channels: rgb and alpha 
        for (let i = 0; i < branchMatNum; i++) {
            let j = i * 4; 
            branchColorArr[j] = this.branchCol[0]; 
            branchColorArr[j + 1] = this.branchCol[1]; 
            branchColorArr[j + 2] = this.branchCol[2]; 
            branchColorArr[j + 3] = this.branchCol[3]; 
        }
        this.branchesGeom.setInstanceVBOs(branchArr, branchColorArr); //set the instanced VBOs 

    }

    renderLeaves() {
        this.leafGeom = new Mesh(readTextFile(this.leafObj));
        this.leafGeom.destory();
        this.leafGeom.create();

        //do NumInstances
        let leafMatNum = this.drawRules.leavesMat.length; //number of instances of branches 
        this.leafGeom.setNumInstances(leafMatNum); //set num instances

           //do InstancedMatrices
           let floatNum = leafMatNum * 16; 
           let leafArray: Float32Array = new Float32Array(floatNum); //allocate 16 * numMat spaces 
           for (let i = 0; i < leafMatNum; i++) {                  //copy every matrix into the branchArr (flattened)
               let currMat: Float32Array = this.drawRules.leavesMat[i]; 
               //CURRMAT LENGTH SHOULD BE 16
               for (let j = 0; j < 16; j++) {
                leafArray[(i * 16) + j] = currMat[j]; 
               }
           }

            //do Colors
        //should be four entries for each instance 
        let leafColorArr: Float32Array = new Float32Array(leafMatNum * 4); //each instance has 4 channels: rgb and alpha 
        for (let i = 0; i < leafMatNum; i++) {
            let j = i * 4; 
            leafColorArr[j] = this.leafCol[0]; 
            leafColorArr[j + 1] = this.leafCol[1]; 
            leafColorArr[j + 2] = this.leafCol[2]; 
            leafColorArr[j + 3] = this.leafCol[3]; 
        }
        this.leafGeom.setInstanceVBOs(leafArray, leafColorArr); //set the instanced VBOs 

    }
};