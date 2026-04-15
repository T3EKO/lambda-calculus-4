import * as Expressions from "./expressions.mjs";


function isRedex(expression) {
    return expression instanceof Expressions.Application && expression.applicator instanceof Expressions.Abstraction;
}

function betaReduceRedex(redex = new Expressions.Application()) {
    let reduct = redex.applicator.body.clone();
    const binding = redex.applicator.binding;
    if(reduct instanceof Expressions.Reference) {
        if(reduct.variable === binding) {
            reduct = redex.applicee.clone();
        }
        return reduct;
    }
    reduct.replaceReference(binding, redex.applicee);
    return reduct;
}

function findRedexNormal(expression) {
    if(expression instanceof Expressions.Reference) {
        // no redex if expression is a reference
        return null;
    }
    if(expression instanceof Expressions.Abstraction) {
        // abstractions aren't redexes so check the body
        return findRedexNormal(expression.body);
    }

    // expression must be an application which is a valid candidate for a redex
    if(isRedex(expression)) return expression;
    // normal strategy finds the leftmost one first
    const applicatorRedex = findRedexNormal(expression.applicator);
    if(applicatorRedex) {
        return applicatorRedex;
    }
    // if there is no redex in the applicator we need to check the other branch
    return findRedexNormal(expression.applicee);
    // if there is no redex in the other branch there is no redex at all (we've looked in every place already)
}

function findRedexPathNormal(expression) {
    if(expression instanceof Expressions.Reference) {
        return null;
    }
    if(expression instanceof Expressions.Abstraction) {
        const subPath = findRedexPathNormal(expression.body);
        if(!(subPath instanceof Array)) {
            return null;
        }
        subPath.unshift(0);
        return subPath;
    }

    if(isRedex(expression)) {
        return [];
    }

    const applicatorPath = findRedexPathNormal(expression.applicator);
    if(applicatorPath instanceof Array) {
        applicatorPath.unshift(0);
        return applicatorPath;
    }

    const appliceePath = findRedexPathNormal(expression.applicee);
    if(appliceePath instanceof Array) {
        appliceePath.unshift(1);
        return appliceePath;
    }
    return null;
}

function betaReduceAndRefactorNormal(expression) {
    const redexPath = findRedexPathNormal(expression);
    return betaReduceAndRefactorWithRedexPath(expression, redexPath);
}

function betaReduceAndRefactorWithRedexPath(expression, redexPath) {
    if(!(redexPath instanceof Array)) {
        return expression;
    }
    if(redexPath.length === 0) {
        const res = betaReduceRedex(expression);
        res.refactor();
        return res;
    }
    const redex = expression.getExpression(redexPath);
    const reduct = betaReduceRedex(redex);
    const res = expression.clone();
    res.setExpression(redexPath, reduct);
    res.refactor();
    return res;
}


export {
    isRedex,
    betaReduceRedex,
    findRedexNormal,
    findRedexPathNormal,
    betaReduceAndRefactorWithRedexPath,
    betaReduceAndRefactorNormal
};