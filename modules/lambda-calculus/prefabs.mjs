import * as Expressions from "./expressions.mjs";

function IDENTITY() {
    return Expressions.Abstraction.IDENTITY();
}

function N_ABSTRACTIONS(n, body) {
    let expr = body;
    for(let i = 0;i < n;i++) {
        expr = new Expressions.Abstraction(n - 1 - i, expr);
    }
    return expr;
}

function TRUE() { // takes 2 arguments and returns the first (argument 0)
    return N_ABSTRACTIONS(2, 0);
}

function FALSE() { // takes 2 arguments and returns the second (argument 1);
    return N_ABSTRACTIONS(2, 1);
}

function CHURCH_NUMERAL(num) {
    if(num < 0) {
        throw new RangeError(`Church numerals must be >0 (entered ${num})`);
    }
    let numeral = 1;
    for(let i = 0;i < num;i++) {
        numeral = new Expressions.Application(0, numeral);
    }
    return N_ABSTRACTIONS(2, numeral);
}

function PLUS() {
    return N_ABSTRACTIONS(4,
        new Expressions.Application(
            new Expressions.Application(
                0, 2
            ),
            new Expressions.Application(
                new Expressions.Application(
                    1, 2
                ),
                3
            )
        )
    );
}

function TIMES() {
    return N_ABSTRACTIONS(3,
        new Expressions.Application(
            1,
            new Expressions.Application(
                0, 2
            )
        )
    );
}

function EXP() {
    return N_ABSTRACTIONS(2,
        new Expressions.Application(
            1,
            0
        )
    );
}

function ABB() {
    return N_ABSTRACTIONS(2,
        new Expressions.Application(
            new Expressions.Application(
                0, 1
            ),
            1
        )
    );
}

function BAA() {
    return N_ABSTRACTIONS(2,
        new Expressions.Application(
            new Expressions.Application(
                1, 0
            ),
            0
        )
    );
}


function THETA_COMBINATOR() {
    return new Expressions.Application(
        N_ABSTRACTIONS(2,
            new Expressions.Application(1, new Expressions.Application(new Expressions.Application(0, 0), 1))
        ),
        N_ABSTRACTIONS(2,
            new Expressions.Application(1, new Expressions.Application(new Expressions.Application(0, 0), 1))
        )
    );
}



function RANDOM_ASS_EXPRESSION(maxHeight, variableCount = 0, applicationProbability = 0.5) {
    if(variableCount === 0 && maxHeight <= 1) {
        return new Expressions.Abstraction(0, 0);
    }

    if(maxHeight <= 0) {
        return Math.floor(Math.random() * variableCount);
    }
    
    if(Math.random() < applicationProbability) {
        return new Expressions.Application(RANDOM_ASS_EXPRESSION(maxHeight - (Math.floor(Math.random() * 2) + 1), variableCount, applicationProbability), RANDOM_ASS_EXPRESSION(maxHeight - (Math.floor(Math.random() * 2) + 1), variableCount, applicationProbability));
    }
    return new Expressions.Abstraction(variableCount, RANDOM_ASS_EXPRESSION(maxHeight - 1, variableCount + 1, applicationProbability));
}






export {
    IDENTITY,
    N_ABSTRACTIONS,

    TRUE, FALSE,
    CHURCH_NUMERAL,
    PLUS, TIMES, EXP,

    ABB,
    BAA,
    THETA_COMBINATOR,

    RANDOM_ASS_EXPRESSION
};