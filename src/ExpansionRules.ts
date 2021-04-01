//these are the rules that map string --> string 
//so they can be used to expand strings 

export default class ExpansionRules {
    expansionRulesMap: Map<string, any> = new Map();

    constructor() {
        this.expansionRulesMap.set('A', this.A);
        this.expansionRulesMap.set('B', this.B);
    }

    A() {
        let rand = Math.random();
        if (rand < 0.43) return 'AA';
        else return 'A^>A';
    }

    B() { 
        let rand = Math.random(); 
        if (rand < 0.35) return '[AB][^+AB]'
        else return '[^+AB][+AB][^^+AB]';
    }

    expand(phrase: string) {
        let expansionFunction = this.expansionRulesMap.get(phrase);
        return expansionFunction ? expansionFunction() : phrase;
    }

}