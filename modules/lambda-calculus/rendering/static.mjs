import { Vec2d } from "../../ulilities/vector.mjs";
import * as Expressions from "../expressions.mjs";
import * as Canv from "../../ulilities/canv.mjs";

const CELL_WIDTH = 4;
const CELL_HEIGHT = 2;

const colorMap = new Map([
    [ "#ff3f3f", "#ff7f3f" ],
    [ "#ff7f3f", "#ffbf3f" ],
    [ "#ffbf3f", "#ffff3f" ],
    [ "#ffff3f", "#bfff3f" ],
    [ "#bfff3f", "#7fff3f" ],
    [ "#7fff3f", "#3fff3f" ],
    [ "#3fff3f", "#3fff7f" ],
    [ "#3fff7f", "#3fffbf" ],
    [ "#3fffbf", "#3fffff" ],
    [ "#3fffff", "#3fbfff" ],
    [ "#3fbfff", "#3f7fff" ],
    [ "#3f7fff", "#3f3fff" ],
    [ "#3f3fff", "#7f3fff" ],
    [ "#7f3fff", "#bf3fff" ],
    [ "#bf3fff", "#ff3fff" ],
    [ "#ff3fff", "#ff3fbf" ],
    [ "#ff3fbf", "#ff3f7f" ],
    [ "#ff3f7f", "#ff3f3f" ]
]);

function drawExpression(ctx, expression, offset = new Vec2d(0, 0), tileSize = 16, color = "#ffffff", parentHeight = null) {
    if(expression instanceof Expressions.Abstraction) {
        drawAbstraction(ctx, expression, offset, tileSize, color, parentHeight);
        return;
    }
    if(expression instanceof Expressions.Application) {
        drawApplication(ctx, expression, offset, tileSize, color, parentHeight);
        return;
    }
}

function drawAbstraction(ctx, abstraction, offset, tileSize, color, parentHeight) {
    const childColor = colorMap.has(color) ? colorMap.get(color) : color;

    ctx.fillStyle = color;
    const width = abstraction.getWidth();

    // find references that touch this bar (corosponding to referenced bound by this lambda)
    const references = abstraction.getReferences();
    const boundIndices = references.map((e, i) => e === abstraction.binding ? i : null).filter(e => e !== null);
    // find the height for each reference bar to reach the application bar
    const heightApplicationBars = boundIndices.map(e => abstraction.getApplicationBarHeightAt(e, parentHeight)); // pass in the parent height because the abstraction may have no child applications
    const countAbstractionBars = boundIndices.map(e => abstraction.getAbstractionBarCountAt(e));
    const distanceTotals = heightApplicationBars.map((e, i) => e + countAbstractionBars[i]);

    // draw each of the reference bars
    for(let i = 0;i < boundIndices.length;i++) {
        const referenceIndex = boundIndices[i];
        const distanceToApplicationBar = distanceTotals[i];

        ctx.fillRect(...(offset.add(new Vec2d(tileSize * (1 + CELL_WIDTH * referenceIndex), 0))), ...new Vec2d(tileSize * (1), tileSize * (1 + CELL_HEIGHT * distanceToApplicationBar)));
    }

    // draw the body
    drawExpression(ctx, abstraction.body, offset.add(new Vec2d(0, tileSize * CELL_HEIGHT)), tileSize, childColor, parentHeight ? parentHeight - 1 : parentHeight);

    ctx.fillStyle = color;

    // draw the abstraction bar
    ctx.fillRect(...offset, ...new Vec2d(tileSize * (CELL_WIDTH * width - 1), tileSize));
}

function drawApplication(ctx, application, offset, tileSize, color, parentHeight) {
    const childColor = colorMap.has(color) ? colorMap.get(color) : color;

    const height = application.getHeight();

    const heightNubbin = parentHeight === null ? 1 : (parentHeight - height);

    // application bar only needs to extend 1 cell over the applicee so we use the applicator width
    const widthApplicator = application.applicator.getWidth();

    // draw the applicator + applicee
    drawExpression(ctx, application.applicator, offset, tileSize, childColor, height);
    drawExpression(ctx, application.applicee, offset.add(new Vec2d(tileSize * (CELL_WIDTH * widthApplicator), 0)), tileSize, childColor, height);

    ctx.fillStyle = color;

    // draw the application bar
    ctx.fillRect(...(offset.add(new Vec2d(tileSize * (1), tileSize * (CELL_HEIGHT * (height - 1))))), ...new Vec2d(tileSize * (CELL_WIDTH * widthApplicator + 1), tileSize * (1)));
    ctx.fillRect(...(offset.add(new Vec2d(tileSize * (1), tileSize * (CELL_HEIGHT * (height - 1))))), ...new Vec2d(tileSize * (1), tileSize * (CELL_HEIGHT * heightNubbin + 1)));
}


function drawPPExpression(ppctx, expression, tileSize = 1, color = "#ffffff") {
    const widthPixels = (expression.getWidth() * CELL_WIDTH - 1) * tileSize;
    const heightPixels = (expression.getHeight() * CELL_HEIGHT + 1) * tileSize;
    Canv.resize(ppctx.canvas, widthPixels, heightPixels);
    drawExpression(ppctx, expression, new Vec2d(0, 0), tileSize, color);
}

function drawExpressionFromPP(ctx, ppctx, expression, offset = new Vec2d(0, 0), tileSize = 16, color = "#ffffff") {
    const ppTileSize = Math.floor(tileSize);

    drawPPExpression(ppctx, expression, ppTileSize, color);
    ctx.drawImage(ppctx.canvas, ...offset, (expression.getWidth() * CELL_WIDTH - 1) * tileSize, (expression.getHeight() * CELL_HEIGHT + 1) * tileSize);
}


export {
    colorMap,
    CELL_WIDTH,
    CELL_HEIGHT,
    drawExpression,
    drawPPExpression,
    drawExpressionFromPP
};