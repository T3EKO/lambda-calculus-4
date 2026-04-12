

class Expression {

    clone() {
        return new Expression();
    }

    getExpression(path = []) { return null; }

    setExpression(path = [], expression = new Expression()) { }

    refactor(newBindings = new Map()) { }

    replaceReference(binding = -1, expression = new Expression()) { }

    getWidth() {
        return 0;
    }

    getHeight() {
        return 0;
    }

    toLambdaString() {
        return "";
    }

    static sanitizeLambdaInput(input) {
        if(typeof input === "number") {
            return new Reference(input);
        }
        return input;
    }
}

class Reference extends Expression {
    variable; // the id of the bound variable that is being referenced

    constructor(variable = -1) {
        super();
        this.variable = variable;
    }

    clone() {
        return new Reference(this.variable);
    }

    getExpression(path = []) {
        if(path.length > 0) {
            return null;
        }
        return this;
    }

    setExpression(path = [], expression = new Expression()) {
        return false;
    }

    refactor(newBindings = new Map(), variableCount = 0) {
        // check if the referenced variable was rebound
        if(newBindings.has(this.variable)) {
            // rebind this reference
            this.variable = newBindings.get(this.variable);
        }
    }

    getWidth() {
        return 1;
    }

    getHeight() {
        return 0;
    }

    getReferences() {
        return [ this.variable ];
    }

    getReferenceAt(_idx) {
        return this.variable;
    }

    getApplicationBarHeightAt(_idx, heightLastApplicationBar) {
        return heightLastApplicationBar - 1;
    }

    getAbstractionBarCountAt(_idx) {
        return 0;
    }

    toLambdaString() {
        return `${this.variable}`;
    }
}

class Abstraction extends Expression {
    binding; // the variable "bound by the lambda"
    body; // body of the abstraction

    static IDENTITY() {
        return new Abstraction(0, new Reference(0));
    }

    constructor(binding = -1, body = new Expression()) {
        super();
        this.binding = binding;
        this.body = Expression.sanitizeLambdaInput(body);
    }

    clone() {
        return new Abstraction(this.binding, this.body.clone());
    }

    getExpression(path = []) {
        if(path.length === 0) {
            return this;
        }
        return this.body.getExpression(path.slice(1));
    }

    setExpression(path = [], expression = new Expression()) {
        if(path.length === 0) {
            return false;
        }
        if(path.length === 1) {
            this.body = expression;
            return true;
        }
        return this.body.setExpression(path.slice(1), expression);
    }

    refactor(newBindings = new Map(), variableCount = 0) {
        // remember the old and new bound variables
        const oldBinding = this.binding;
        const newBinding = variableCount;
        // if the bound variable previously existed, remember what it was rebound to
        const oldRebindingExists = newBindings.has(oldBinding);
        const oldRebinding = newBindings.get(oldBinding);
        // add the new binding to the map
        newBindings.set(oldBinding, newBinding);
        // rebind this abstraction
        this.binding = newBinding;

        // refactor the abstraction body
        this.body.refactor(newBindings, variableCount + 1);

        // remove this abstractions rebinding:
        // everything within the body of this abstraction has already been refactored,
        // and this abstraction is not reachable by any other parts of the expression.
        // if a variable with the same name was previously rebound, replace the old rebinding instead.
        if(oldRebindingExists) {
            newBindings.set(oldBinding, oldRebinding);
            return;
        }
        newBindings.delete(oldBinding);
    }

    replaceReference(binding = -1, expression = new Expression()) {
        if(binding === this.binding) {
            return;
        }
        if(this.body instanceof Reference) {
            if(this.body.variable === binding) {
                this.body = expression.clone();
            }
            return;
        }
        this.body.replaceReference(binding, expression);
    }

    getWidth() {
        return this.body.getWidth();
    }

    getHeight() {
        return this.body.getHeight() + 1;
    }

    getReferences() {
        return this.body.getReferences();
    }

    getReferenceAt(idx) {
        return this.body.getReferenceAt(idx);
    }

    getApplicationBarHeightAt(idx, heightLastApplicationBar) {
        const widthSelf = this.getWidth();
        if(widthSelf === 1 && !heightLastApplicationBar) {
            return 0;
        }
        return this.body.getApplicationBarHeightAt(idx, heightLastApplicationBar - 1);
    }

    getAbstractionBarCountAt(idx) {
        return this.body.getAbstractionBarCountAt(idx) + 1;
    }

    toLambdaString() {
        return `(λ${this.binding}.${this.body.toLambdaString()})`;
    }
}

class Application extends Expression {
    applicator; // some (hypothetical) abstraction
    applicee; // the expression to substitute into the abstraction

    constructor(applicator = new Abstraction(), applicee = new Expression) {
        super();
        this.applicator = Expression.sanitizeLambdaInput(applicator);
        this.applicee = Expression.sanitizeLambdaInput(applicee);
    }

    clone() {
        return new Application(this.applicator.clone(), this.applicee.clone());
    }

    getExpression(path = []) {
        if(path.length === 0) {
            return this;
        }
        if(path[0] <= 0) {
            return this.applicator.getExpression(path.slice(1));
        }
        return this.applicee.getExpression(path.slice(1));
    }

    setExpression(path = [], expression = new Expression()) {
        if(path.length === 0) {
            return false;
        }
        if(path.length > 1) {
            if(path[0] <= 0) {
                return this.applicator.setExpression(path.slice(1), expression);
            }
            return this.applicee.setExpression(path.slice(1), expression);
        }
        if(path[0] <= 0) {
            this.applicator = expression;
            return true;
        }
        this.applicee = expression;
        return true;
    }

    refactor(newBindings = new Map(), variableCount = 0) {
        // refactor both children
        this.applicator.refactor(newBindings, variableCount);
        this.applicee.refactor(newBindings, variableCount);
    }

    replaceReference(binding = -1, expression = new Expression()) {
        if(this.applicator instanceof Reference) {
            if(this.applicator.variable === binding) {
                this.applicator = expression.clone();
            }
        } else {
            this.applicator.replaceReference(binding, expression);
        }

        if(this.applicee instanceof Reference) {
            if(this.applicee.variable === binding) {
                this.applicee = expression.clone();
            }
        } else {
            this.applicee.replaceReference(binding, expression);
        }
    }

    getWidth() {
        return this.applicator.getWidth() + this.applicee.getWidth();
    }

    getHeight() {
        return Math.max(this.applicator.getHeight(), this.applicee.getHeight()) + 1;
    }

    getReferences() {
        return this.applicator.getReferences().concat(this.applicee.getReferences());
    }

    getReferenceAt(idx) {
        const widthApplicator = this.applicator.getWidth();
        if(idx < widthApplicator) {
            return this.applicator.getReferenceAt(idx);
        }
        return this.applicee.getReferenceAt(idx - widthApplicator);
    }

    getApplicationBarHeightAt(idx, _heightLastApplicationBar) {
        const heightSelf = this.getHeight();

        const widthApplicator = this.applicator.getWidth();
        if(idx < widthApplicator) {
            return this.applicator.getApplicationBarHeightAt(idx, heightSelf);
        }
        return this.applicee.getApplicationBarHeightAt(idx - widthApplicator, heightSelf);
    }

    getAbstractionBarCountAt(idx) {
        const widthApplicator = this.applicator.getWidth();
        if(idx < widthApplicator) {
            return this.applicator.getAbstractionBarCountAt(idx);
        }
        return this.applicee.getAbstractionBarCountAt(idx - widthApplicator);
    }

    toLambdaString() {
        return `(${this.applicator.toLambdaString()} ${this.applicee.toLambdaString()})`;
    }
}

export {
    Reference, Abstraction, Application
};