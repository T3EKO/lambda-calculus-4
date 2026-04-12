import * as Expressions from "./expressions.mjs";

const TOKEN_CHARS = {
    whitespace: " \n\t",
    lambda: "λ\\",
    dot: ".",
    openScope: "(",
    closeScope: ")",
    variable: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
};


function tokenizeInputStr(str = "") {
    const tokenList = [];

    let cToken = null;

    for(let i = 0;i < str.length;i++) {
        const cchar = str.charAt(i);
        if(cToken !== null) {
            const variableIdx = TOKEN_CHARS.variable.indexOf(cchar);
            if(variableIdx >= 0) {
                if(cToken.type !== "variable") {
                    tokenList.push(cToken);
                    cToken = {
                        type: "variable",
                        data: cchar
                    };
                    continue;
                }
                cToken.data += cchar;
                continue;
            }
            tokenList.push(cToken);
        }
        if(TOKEN_CHARS.whitespace.indexOf(cchar) >= 0) {
            cToken = null;
        }
        if(TOKEN_CHARS.lambda.indexOf(cchar) >= 0) {
            cToken = {
                type: "lambda"
            };
        }
        if(TOKEN_CHARS.dot.indexOf(cchar) >= 0) {
            cToken = {
                type: "dot"
            };
        }
        if(TOKEN_CHARS.openScope.indexOf(cchar) >= 0) {
            cToken = {
                type: "openScope"
            };
        }
        if(TOKEN_CHARS.closeScope.indexOf(cchar) >= 0) {
            cToken = {
                type: "closeScope"
            };
        }
    }

    if(cToken !== null) {
        tokenList.push(cToken);
    }

    return tokenList;
}

function validateTokenList(tokenList) {
    for(let i = 0;i < tokenList.length;i++) {
        switch(tokenList[i].type) {
        case "lambda":
            if(i >= tokenList.length - 2) {
                throw new SyntaxError(`at token ${i}: lambda should be followed by variable and then dot (instead is the ${i === tokenList.length - 2 ? "second-to-" : ""}last token in the list)`)
            }
            if(tokenList[i + 1].type !== "variable") {
                throw new SyntaxError(`at token ${i}: lambda should be followed by variable (instead followed by "${tokenList[i + 1].type}")`);
            }
            if(tokenList[i + 2].type !== "dot") {
                throw new SyntaxError(`at token ${i}: lambda should be followed by variable and then a dot (instead followed by "variable" and then "${tokenList[i + 2].type}")`);
            }
            break;
        case "dot":
            if(i <= 1) {
                throw new SyntaxError(`at token ${i}: dot should be preceeded by variable with lambda before (instead is the ${i === 0 ? "first" : "second"} token in the list)`);
            }
            if(tokenList[i - 1].type !== "variable") {
                throw new SyntaxError(`at token ${i}: dot should be preceeded by a variable (instead preceeded by "${tokenList[i - 1].type}")`)
            }
            if(tokenList[i - 2].type !== "lambda") {
                throw new SyntaxError(`at token ${i}: dot should be preceeded by variable with lambda before (instead preceeded by "variable" with "${tokenList[i - 2].type}" before)`);
            }
        }
    }
}

export {
    tokenizeInputStr,
    validateTokenList
};