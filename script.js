import { Vec2i, Vec2d } from "./modules/ulilities/vector.mjs";
import * as Mathc from "./modules/ulilities/mathc.mjs";
import * as LambdaExpressions from "./modules/lambda-calculus/expressions.mjs";
import * as LambdaPrefabs from "./modules/lambda-calculus/prefabs.mjs";
import * as Parser from "./modules/lambda-calculus/string-parse.mjs";
import * as BetaReduction from "./modules/lambda-calculus/beta-reduction.mjs";
import * as StaticRender from "./modules/lambda-calculus/rendering/static.mjs";
import * as Canv from "./modules/ulilities/canv.mjs";
import * as AnimRender from "./modules/lambda-calculus/rendering/reduction-anims.mjs";

const DEBUG = true;


const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const transCanvas = document.getElementById("transcanvas");
const transCtx = transCanvas.getContext("2d");

const ppcanvas = document.getElementById("ppcanvas");
const ppctx = ppcanvas.getContext("2d");








if(DEBUG) {
    window.Vec2i = Vec2i;
    window.Vec2d = Vec2d;
    window.Mathc = Mathc;
    window.Parser = Parser;

    window.Canv = Canv;
    window.canvas = canvas;
    window.ctx = ctx;
    window.transCanvas = transCanvas;
    window.transCtx = transCtx;
    window.ppcanvas = ppcanvas;
    window.ppctx = ppctx;

    window.LambdaExpressions = LambdaExpressions;
    window.LambdaPrefabs = LambdaPrefabs;
    window.BetaReduction = BetaReduction;

    window.StaticRender = StaticRender;
    window.AnimRender = AnimRender;
}
