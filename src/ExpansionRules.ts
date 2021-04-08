//these are the rules that map string --> string 
//so they can be used to expand strings 

export default class ExpansionRules {
    expansionRulesMap: Map<string, any> = new Map();

    //booleans for tree grammar modification 
    treeWacky: boolean = false; 
    denseTreeTops: boolean = false; 

    constructor() {
        this.expansionRulesMap.set('A', this.A);
        this.expansionRulesMap.set('B', this.B);
        this.treeWacky = false; 
        this.denseTreeTops = false; 
    }

    setTreeWacky(b: boolean) {
        this.treeWacky = b;
    }

    setDenseTreeTops(b: boolean) {
        this.denseTreeTops = b; 
    }

    A() {
        let rand = Math.random();
        //console.log(this);
        let s = 'AA';
        if (this.treeWacky) {
            s = 'A<A';
        } 
        if (rand < 0.43) return s; //expands in the z axis if 'tree wacky' is selected 
        else return 'A^>A';
    }

    B() { 
        let rand = Math.random(); 
        let s = '[^+AB][+AB][^^+AB]';
        if (this.denseTreeTops) {
            s = '[^+AB][+AB][^^+AB][^AB]';
        } 
        if (rand < 0.35) return '[AB][^+AB]'
        else return s; //make this string: '[^+AB][+AB][^^+AB][^AB]' if DENSE TREE TOPS is checked! 
    }

    expand(phrase: string) {
        let expansionFunction = this.expansionRulesMap.get(phrase);
        if (expansionFunction) {
            return expansionFunction.call(this); //need a reference to 'this' so this doesn't crash! 
        } else {
            return phrase; 
        }
    }

}