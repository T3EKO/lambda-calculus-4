import * as Expressions from "./expressions.mjs";


function fn(v, b) {
    return new Expressions.Abstraction(v, b);
}

function appl(a, b) {
    return new Expressions.Application(a, b);
}



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

function PACK_PAIR() {
    return fn(0, fn(1, fn(2, appl(appl(2, 0), 1))));
}

function EXTRACT_FIRST() {
    const expr = fn(0, appl(0, TRUE()));
    expr.refactor();
    return expr;
}

function EXTRACT_SECOND() {
    const expr = fn(0, appl(0, FALSE()));
    expr.refactor();
    return expr;
}

function STACK() { // empty stack
    const expr = fn(0, fn(1, fn(2, TRUE())));
    expr.refactor();
    return expr;
}

function PUSH() { // takes in the stack and some item => returns the stack with the additional item on top
    const expr = fn(0, fn(1,
        fn(2, appl(appl(2, 1), 0))
    ));
    expr.refactor();
    return expr;
}

function PEEK() { // takes in the stack => returns the top value of the stack
    const expr = fn(0,
        appl(0, TRUE())
    );
    expr.refactor();
    return expr;
}

function POP() { // takes in the stack => returns the stack but with the top value removed
    const expr = fn(0,
        appl(0, FALSE())
    );
    expr.refactor();
    return expr;
}

function IS_EMPTY() { // takes in the stack => returns false if the value at the top of the stack is a number, returns true if the stack is empty
    const expr = fn(0,
        appl(appl(appl(0, TRUE()), fn(1, FALSE())), FALSE())
    );
    expr.refactor();
    return expr;
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

function SUCC() {
    const expr = N_ABSTRACTIONS(3,
        new Expressions.Application(
            1,
            new Expressions.Application(
                new Expressions.Application(
                    0,
                    1
                ),
                2
            )
        )
    );
    return expr;
}

function PRED() {
    // fn(0, fn(1, fn(2, appl(appl(appl(0, fn(3, fn(4, appl(4, appl(3, 1))))), fn(3, 2)), fn(3, 3)))))
    const expr = N_ABSTRACTIONS(3,
        new Expressions.Application(
            new Expressions.Application(
                new Expressions.Application(
                    0,
                    new Expressions.Abstraction(3,
                        new Expressions.Abstraction(4,
                            new Expressions.Application(
                                4,
                                new Expressions.Application(
                                    3,
                                    1
                                )
                            )
                        )
                    )
                ),
                new Expressions.Abstraction(3,
                    2
                )
            ),
            new Expressions.Abstraction(3,
                3
            )
        )
    );
    return expr;
}

function PLUS() {
    return N_ABSTRACTIONS(4,
        new Expressions.Application(
            new Expressions.Application(
                0,
                2
            ),
            new Expressions.Application(
                new Expressions.Application(
                    1,
                    2
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

function IS_ZERO() {
    const expr = new Expressions.Abstraction(0,
        new Expressions.Application(
            new Expressions.Application(
                0,
                new Expressions.Abstraction(1, FALSE())
            ),
            TRUE()
        )
    );
    expr.refactor();
    return expr;
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

function RECURSIVE_TEST1() {
    // essentially
    // takes in 2 arguments (ignoring the recursive call)
    // first argument is n, second is x
    // if n == 0, return x
    // otherwise, return f(n - 1, x + 1)
    // so with n = 2 and x = 4, the function should reduce to 6, and it will apply the successor function to x 2 (n) times
    const expr = appl(THETA_COMBINATOR(), fn(0, fn(1, fn(2, appl(appl(appl(IS_ZERO(), 1), 2), appl(appl(0, appl(PRED(), 1)), appl(SUCC(), 2)))))));
    expr.refactor();
    return expr;
}

function RECURSIVE_TEST2() {
    // takes 1 argument, if n == 0 return 0, otherwise return f(n - 1)
    const expr = appl(THETA_COMBINATOR(), fn(0, fn(1,
        appl(
            appl(
                appl(
                    IS_ZERO(),
                    1
                ),
                CHURCH_NUMERAL(0)
            ),
            appl(
                0,
                appl(
                    PRED(),
                    1
                )
            )
        )
    )));
    expr.refactor();
    return expr;
}

function ACKERMAN() {
    const expr = appl(THETA_COMBINATOR(), fn(0, fn(1, fn(2, // 0: recursive call, 1: m, 2: n
        appl(
            appl(
                appl(
                    IS_ZERO(),
                    1
                ),
                appl(
                    SUCC(),
                    2
                )
            ),
            appl(
                appl(
                    appl(
                        IS_ZERO(),
                        2
                    ),
                    appl(
                        appl(
                            0,
                            appl(
                                PRED(),
                                1
                            )
                        ),
                        CHURCH_NUMERAL(1)
                    )
                ),
                appl(
                    appl(
                        0,
                        appl(
                            PRED(),
                            1
                        )
                    ),
                    appl(
                        appl(
                            0,
                            1
                        ),
                        appl(
                            PRED(),
                            2
                        )
                    )
                )
            )
        )
    ))));
    expr.refactor();
    return expr;
}

function STACK_BASED_ACKERMAN() {
    const expr = appl(THETA_COMBINATOR(), fn(0, fn(1, // 0 is recursive call, 1 is stack
        appl(
            appl(
                appl(
                    fn(2, fn(3, fn(4, // 2 is top of stack (n), 3 is item below top of stack (m), 4 is stack with first 2 items popped
                        appl(
                            appl(
                                appl( // check if m == 0
                                    IS_ZERO(),
                                    3
                                ),
                                appl( // if m == 0,
                                    appl(
                                        appl( // check if stack is empty
                                            IS_EMPTY(),
                                            4
                                        ),
                                        appl( // if stack is empty, return n + 1
                                            SUCC(),
                                            2
                                        )
                                    ),
                                    appl( // if stack is not empty, push n + 1 to the stack and loop
                                        0,
                                        appl(
                                            appl(
                                                PUSH(),
                                                4
                                            ),
                                            appl(
                                                SUCC(),
                                                2
                                            )
                                        )
                                    )
                                )
                            ),
                            appl( // if m != 0,
                                appl(
                                    appl( // check if n == 0
                                        IS_ZERO(),
                                        2
                                    ),
                                    appl( // if n == 0, push m - 1, 1 to the stack and loop
                                        0,
                                        appl(
                                            appl(
                                                PUSH(),
                                                appl(
                                                    appl(
                                                        PUSH(),
                                                        4
                                                    ),
                                                    appl(
                                                        PRED(),
                                                        3
                                                    )
                                                )
                                            ),
                                            CHURCH_NUMERAL(1)
                                        )
                                    )
                                ),
                                appl( // if n != 0, push m - 1, m, n - 1 to the stack and loop
                                    0,
                                    appl(
                                        appl(
                                            PUSH(),
                                            appl(
                                                appl(
                                                    PUSH(),
                                                    appl(
                                                        appl(
                                                            PUSH(),
                                                            4
                                                        ),
                                                        appl(
                                                            PRED(),
                                                            3
                                                        )
                                                    )
                                                ),
                                                3
                                            )
                                        ),
                                        appl(
                                            PRED(),
                                            2
                                        )
                                    )
                                )
                            )
                        )
                    ))),
                    appl(PEEK(), 1)
                ),
                appl(PEEK(), appl(POP(), 1))
            ),
            appl(POP(), appl(POP(), 1))
        )
    )));
    expr.refactor();
    return expr;
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
    PACK_PAIR, EXTRACT_FIRST, EXTRACT_SECOND,
    STACK, PUSH, PEEK, POP, IS_EMPTY,
    CHURCH_NUMERAL,
    SUCC, PRED,
    PLUS, TIMES, EXP,
    IS_ZERO,

    ABB,
    BAA,
    THETA_COMBINATOR,

    RECURSIVE_TEST1,
    RECURSIVE_TEST2,

    ACKERMAN,
    STACK_BASED_ACKERMAN,

    RANDOM_ASS_EXPRESSION
};