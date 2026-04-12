import * as Expressions from "../expressions.mjs";
import * as BetaReduction from "../beta-reduction.mjs";
import * as StaticRender from "./static.mjs";
import * as Mathc from "../../ulilities/mathc.mjs";


class StaticSubReference extends Expressions.Reference {
    width = 1;
    height = 0;

    constructor(variable) {
        super(variable);
    }

    isDynamic() {
        return false;
    }

    getWidthAfter(binding, argument) {
        return this.getWidth();
    }

    getHeightAfter(binding, argument) {
        return this.getHeight();
    }

    getCachedWidthAfter() {
        return this.width;
    }

    getCachedHeightAfter() {
        return this.height;
    }

    getWidthAtTime(_t) {
        return this.width;
    }

    getHeightAtTime(_t) {
        return this.height;
    }

    getApplicationBarHeightAtTimeAt(_t, _idx, heightLastApplicationBar) {
        return heightLastApplicationBar - 1;
    }

    computeAndCacheSize(binding, argument) {
        this.width = this.getWidth();
        this.height = this.getHeight();
    }
}

class DynamicSubReference extends Expressions.Reference {
    widthBefore = 1;
    heightBefore = 0;

    widthAfter;
    heightAfter;

    constructor(variable) {
        super(variable);
    }

    isDynamic() {
        return true;
    }

    getWidthAfter(binding, argument) {
        if(this.variable === binding) {
            return argument.getWidth();
        }
        return this.getWidth();
    }

    getHeightAfter(binding, argument) {
        if(this.variable === binding) {
            return argument.getHeight();
        }
        return this.getHeight();
    }

    getCachedWidthAfter() {
        return this.widthAfter;
    }

    getCachedHeightAfter() {
        return this.heightAfter;
    }

    getWidthAtTime(t) {
        const tClamped = Mathc.clamp(t, 0, 1);
        return Mathc.lerp(this.widthBefore, this.widthAfter, tClamped);
    }

    getHeightAtTime(t) {
        const tClamped = Mathc.clamp(t, 0, 1);
        return Mathc.lerp(this.heightBefore, this.heightAfter, tClamped);
    }

    getApplicationBarHeightAtTimeAt(_t, _idx, heightLastApplicationBar) {
        return heightLastApplicationBar - 1;
    }

    computeAndCacheSize(binding, argument) {
        this.widthBefore = this.getWidth();
        this.heightBefore = this.getHeight();

        this.widthAfter = this.getWidthAfter(binding, argument);
        this.heightAfter = this.getHeightAfter(binding, argument);
    }
}

class StaticSubAbstraction extends Expressions.Abstraction {
    width;
    height;

    constructor(binding, body) {
        super(binding, body);
    }

    isDynamic() {
        return false;
    }

    getWidthAfter(binding, argument) {
        return this.getWidth();
    }

    getHeightAfter(binding, argument) {
        return this.getHeight();
    }

    getCachedWidthAfter() {
        return this.width;
    }

    getCachedHeightAfter() {
        return this.height;
    }

    getWidthAtTime(_t) {
        return this.width;
    }

    getHeightAtTime(_t) {
        return this.height;
    }

    getApplicationBarHeightAtTimeAt(_t, idx, heightLastApplicationBar) {
        const widthSelf = this.width;
        if(widthSelf === 1 && !heightLastApplicationBar) {
            return 0;
        }
        return this.body.getApplicationBarHeightAtTimeAt(_t, idx, heightLastApplicationBar - 1);
    }

    computeAndCacheSize(binding, argument) {
        this.body.computeAndCacheSize(binding, argument);

        this.width = this.getWidth();
        this.height = this.getHeight();
    }
}

class DynamicSubAbstraction extends Expressions.Abstraction {
    widthBefore;
    heightBefore;

    widthAfter;
    heightAfter;

    constructor(binding, body) {
        super(binding, body);
    }

    isDynamic() {
        return true;
    }

    getWidthAfter(binding, argument) {
        return this.body.getWidthAfter(binding, argument);
    }

    getHeightAfter(binding, argument) {
        return this.body.getHeightAfter(binding, argument) + 1;
    }

    getCachedWidthAfter() {
        return this.widthAfter;
    }

    getCachedHeightAfter() {
        return this.heightAfter;
    }

    computeWidthAfterFromCached() {
        return this.body.getCachedWidthAfter();
    }

    computeHeightAfterFromCached() {
        return this.body.getCachedHeightAfter() + 1;
    }

    getWidthAtTime(t) {
        const tClamped = Mathc.clamp(t, 0, 1);
        return Mathc.lerp(this.widthBefore, this.widthAfter, tClamped);
    }

    getHeightAtTime(t) {
        const tClamped = Mathc.clamp(t, 0, 1);
        return Mathc.lerp(this.heightBefore, this.heightAfter, tClamped);
    }

    getApplicationBarHeightAtTimeAt(t, idx, heightLastApplicationBar) {
        const widthSelf = this.getWidthAtTime(t);
        if(widthSelf === 1 && !heightLastApplicationBar) {
            return 0;
        }
        return this.body.getApplicationBarHeightAtTimeAt(t, idx, heightLastApplicationBar - 1);
    }

    computeAndCacheSize(binding, argument) {
        this.body.computeAndCacheSize(binding, argument);

        this.widthBefore = this.getWidth();
        this.heightBefore = this.getHeight();

        this.widthAfter = this.computeWidthAfterFromCached();
        this.heightAfter = this.computeHeightAfterFromCached();
    }
}

class StaticSubApplication extends Expressions.Application {
    width;
    height;

    constructor(applicator, applicee) {
        super(applicator, applicee);
    }

    isDynamic() {
        return false;
    }

    getWidthAfter(binding, argument) {
        return this.getWidth();
    }

    getHeightAfter(binding, argument) {
        return this.getHeight();
    }

    getCachedWidthAfter() {
        return this.width;
    }

    getCachedHeightAfter() {
        return this.height;
    }

    getWidthAtTime(_t) {
        return this.width;
    }

    getHeightAtTime(_t) {
        return this.height;
    }

    getApplicationBarHeightAtTimeAt(_t, idx, _heightLastApplicationBar) {
        const heightSelf = this.height;

        const widthApplicator = this.applicator.width;
        if(idx < widthApplicator) {
            return this.applicator.getApplicationBarHeightAtTimeAt(_t, idx, heightSelf);
        }
        return this.applicee.getApplicationBarHeightAtTimeAt(_t, idx - widthApplicator, heightSelf);
    }

    computeAndCacheSize(binding, argument) {
        this.applicator.computeAndCacheSize(binding, argument);
        this.applicee.computeAndCacheSize(binding, argument);

        this.width = this.applicator.width + this.applicee.width;
        this.height = Math.max(this.applicator.height, this.applicee.height) + 1;
    }
}

class DynamicSubApplication extends Expressions.Application {
    widthBefore;
    heightBefore;

    widthAfter;
    heightAfter;

    constructor(applicator, applicee) {
        super(applicator, applicee);
    }

    isDynamic() {
        return true;
    }

    getWidthAfter(binding, argument) {
        return this.applicator.getWidthAfter(binding, argument) + this.applicee.getWidthAfter(binding, argument);
    }

    getHeightAfter(binding, argument) {
        return Math.max(this.applicator.getHeightAfter(binding, argument), this.applicee.getHeightAfter(binding, argument)) + 1;
    }

    getCachedWidthAfter() {
        return this.widthAfter;
    }

    getCachedHeightAfter() {
        return this.heightAfter;
    }

    computeWidthAfterFromCached() {
        return this.applicator.getCachedWidthAfter() + this.applicee.getCachedWidthAfter();
    }

    computeHeightAfterFromCached() {
        return Math.max(this.applicator.getCachedHeightAfter(), this.applicee.getCachedHeightAfter()) + 1;
    }

    getWidthAtTime(t) {
        const tClamped = Mathc.clamp(t, 0, 1);
        return Mathc.lerp(this.widthBefore, this.widthAfter, tClamped);
    }

    getHeightAtTime(t) {
        const tClamped = Mathc.clamp(t, 0, 1);
        return Mathc.lerp(this.heightBefore, this.heightAfter, tClamped);
    }

    getApplicationBarHeightAtTimeAt(t, idx, _heightLastApplicationBar) {
        const heightSelf = this.getHeightAtTime(t);

        const widthApplicator = this.applicator.getWidth();
        if(idx < widthApplicator) {
            return this.applicator.getApplicationBarHeightAtTimeAt(t, idx, heightSelf);
        }
        return this.applicee.getApplicationBarHeightAtTimeAt(t, idx - widthApplicator, heightSelf);
    }

    computeAndCacheSize(binding, argument) {
        this.applicator.computeAndCacheSize(binding, argument);
        this.applicee.computeAndCacheSize(binding, argument);

        this.widthBefore = this.getWidth();
        this.heightBefore = this.getHeight();

        this.widthAfter = this.computeWidthAfterFromCached();
        this.heightAfter = this.computeHeightAfterFromCached();
    }
}

class RedexAnimWrapper {
    body;
    binding;
    argument;

    widthBefore;
    widthAfter;
    heightBefore;
    heightAfter;

    argumentStartPos;
    argumentDestinations;
    argumentDestinationApplicationBarHeights;
    widthArgument;

    constructor(body, binding, argument) {
        this.body = body;
        this.binding = binding;
        this.argument = argument;
    }

    computeAndCacheValues() {
        this.computeAndCacheSizes();

        {
            const argumentStartPos = new Vec2d(this.body.getWidth(), 0);
            this.argumentStartPos = argumentStartPos;
        }

        this.widthArgument = this.argument.getWidth();

        this.computeAndCacheArgumentDestinations();

        this.widthBefore = this.body.getWidthAtTime(0) + this.widthArgument;
        this.heightBefore = Math.max(this.body.getHeightAtTime(0) + 1, this.argument.getHeight()) + 1;
        
        this.widthAfter = this.body.getWidthAtTime(1);
        this.heightAfter = this.body.getHeightAtTime(1);
    }

    computeAndCacheArgumentDestinations() {
        const widthArgument = this.argument.getWidth();

        const references = this.body.getReferences();
        const boundIndices = references.map((_, i) => i).filter(e => references[e] === this.binding);
        const countAbstractionBars = boundIndices.map(e => this.body.getAbstractionBarCountAt(e));
        const argumentXPoses = boundIndices.map((e, i) => e + i * (widthArgument - 1));
        const argumentDestinations = argumentXPoses.map((e, i) => new Vec2d(e, countAbstractionBars[i]));

        const heightApplicationBars = boundIndices.map(e => this.body.getApplicationBarHeightAtTimeAt(1, e, null));

        this.argumentDestinations = argumentDestinations;
        this.argumentDestinationApplicationBarHeights = heightApplicationBars;
    }

    computeAndCacheSizes() {
        this.body.computeAndCacheSize(this.binding, this.argument);
    }

    getWidthAtTime(t) {
        return Mathc.lerp(this.widthBefore, this.widthAfter, t);
    }

    getHeightAtTime(t) {
        return Mathc.lerp(this.heightBefore, this.heightAfter, t);
    }
}

function parseRedex(redex) {
    if(!BetaReduction.isRedex(redex)) return null;
    const abstraction = redex.applicator;
    const binding = abstraction.binding;
    const argument = redex.applicee;

    const parsedBody = parseRedexSubExpression(abstraction.body, binding);

    const animWrapper = new RedexAnimWrapper(parsedBody, binding, argument);

    return animWrapper;
}

function parseRedexSubExpression(rsexpr, binding) {
    if(rsexpr instanceof Expressions.Reference) {
        return parseRedexSubReference(rsexpr, binding);
    }
    if(rsexpr instanceof Expressions.Abstraction) {
        return parseRedexSubAbstraction(rsexpr, binding);
    }
    if(rsexpr instanceof Expressions.Application) {
        return parseRedexSubApplication(rsexpr, binding);
    }
}

function parseRedexSubReference(rsref, binding) {
    if(rsref.variable === binding) {
        return new DynamicSubReference(rsref.variable);
    }
    return new StaticSubReference(rsref.variable);
}

function parseRedexSubAbstraction(rsabs, binding) {
    const parsedBody = parseRedexSubExpression(rsabs.body, binding);
    if(parsedBody.isDynamic()) {
        return new DynamicSubAbstraction(rsabs.binding, parsedBody);
    }
    return new StaticSubAbstraction(rsabs.binding, parsedBody);
}

function parseRedexSubApplication(rsappl, binding) {
    const parsedApplicator = parseRedexSubExpression(rsappl.applicator, binding);
    const parsedApplicee = parseRedexSubExpression(rsappl.applicee, binding);

    if(parsedApplicator.isDynamic() || parsedApplicee.isDynamic()) {
        return new DynamicSubApplication(parsedApplicator, parsedApplicee);
    }
    return new StaticSubApplication(parsedApplicator, parsedApplicee);
}


function drawRedexAtTime(ctx, transCtx, animWrapper, time, offset = new Vec2d(0, 0), tileSize = 16, color = "#ffffff", parentHeight = null) {
    const tClamped = Mathc.clamp(time, 0, 1);
    transCtx.fillStyle = color;

    // precompute some values
    const parentHeightBefore = Math.max(animWrapper.body.getHeightAtTime(0) + 1, animWrapper.argument.getHeight()) + 1;
    const parentHeightAfter = animWrapper.body.getHeightAtTime(1) + 1;

    // draw bits that should become transparent
    // abstraction bar
    // find the references that touch the bar
    const references = animWrapper.body.getReferences();
    const boundIndices = references.map((e, i) => i).filter(e => references[e] === animWrapper.binding);
    // find how tall the reference bars should be
    const heightApplicationBars = boundIndices.map(e => animWrapper.body.getApplicationBarHeightAtTimeAt(0, e));
    const countAbstractionBars = boundIndices.map(e => animWrapper.body.getAbstractionBarCountAt(e) + 1);
    const distanceTotals = heightApplicationBars.map((e, i) => e + countAbstractionBars[i]);
    // draw the bar itself
    transCtx.fillRect(0, 0, tileSize * (StaticRender.CELL_WIDTH * animWrapper.body.getWidthAtTime(0) - 1), tileSize * (1));
    // draw the reference bars
    for(let i = 0;i < boundIndices.length;i++) {
        const referenceIndex = boundIndices[i];
        const distanceToApplicationBar = distanceTotals[i];

        transCtx.fillRect(tileSize * (StaticRender.CELL_WIDTH * referenceIndex + 1), 0, tileSize, tileSize * (StaticRender.CELL_HEIGHT * distanceToApplicationBar + 1));
    }

    // application bar
    const widthBody = animWrapper.body.getWidthAtTime(0);
    const height = parentHeightBefore;
    const heightNubbin = parentHeight === null ? 1 : (parentHeight - height);
    // draw bar
    transCtx.fillRect(tileSize, tileSize * (StaticRender.CELL_HEIGHT * (height - 1)), tileSize * (StaticRender.CELL_WIDTH * widthBody + 1), tileSize);
    transCtx.fillRect(tileSize, tileSize * (StaticRender.CELL_HEIGHT * (height - 1)), tileSize, tileSize * (StaticRender.CELL_HEIGHT * heightNubbin + 1));

    // draw argument if no arguments are substituted
    if(animWrapper.argumentDestinations.length === 0) {
        const argumentPos = animWrapper.argumentStartPos.clone();
        argumentPos.mulMut(new Vec2d(StaticRender.CELL_WIDTH, StaticRender.CELL_HEIGHT));

        const parentHeight = parentHeightBefore;

        StaticRender.drawExpression(transCtx, animWrapper.argument, offset.add(argumentPos.scale(tileSize)), tileSize, color, parentHeight);
    }

    // draw the transparent stuff onto the normal canvas
    ctx.globalAlpha = 1 - tClamped;
    ctx.drawImage(transCtx.canvas, ...offset);
    ctx.globalAlpha = 1;

    // draw the body
    drawRedexSubExpressionAtTime(ctx, animWrapper, animWrapper.body, tClamped, offset.add(new Vec2d(0, (1 - tClamped) * tileSize * StaticRender.CELL_HEIGHT)), tileSize, color, Mathc.lerp(parentHeightBefore, parentHeightAfter, tClamped));

    // draw the arguments
    for(let i = 0;i < animWrapper.argumentDestinations.length;i++) {
        // position of the argument in its path
        const cArgumentPos = animWrapper.argumentStartPos.lerpTowards(animWrapper.argumentDestinations[i], tClamped);
        cArgumentPos.mulMut(new Vec2d(StaticRender.CELL_WIDTH, StaticRender.CELL_HEIGHT));

        const parentHeightAfter = animWrapper.argumentDestinationApplicationBarHeights[i] + 1;
        const parentHeight = Mathc.lerp(parentHeightBefore, parentHeightAfter, tClamped);

        StaticRender.drawExpression(ctx, animWrapper.argument, offset.add(cArgumentPos.scale(tileSize)), tileSize, color, parentHeight);
    }
}

function drawRedexSubExpressionAtTime(ctx, animWrapper, rsexpr, time, offset = new Vec2d(0, 0), tileSize = 16, color = "#ffffff", parentHeight = null) {
    if(!rsexpr.isDynamic()) {
        StaticRender.drawExpression(ctx, rsexpr, offset, tileSize, color, parentHeight);
        return;
    }

    if(rsexpr instanceof DynamicSubAbstraction) {
        drawRedexSubAbstractionAtTime(ctx, animWrapper, rsexpr, time, offset, tileSize, color, parentHeight);
        return;
    }
    if(rsexpr instanceof DynamicSubApplication) {
        drawRedexSubApplicationAtTime(ctx, animWrapper, rsexpr, time, offset, tileSize, color, parentHeight);
    }
}

function drawRedexSubAbstractionAtTime(ctx, animWrapper, rsabs, time, offset = new Vec2d(0, 0), tileSize = 16, color = "#ffffff", parentHeight = null) {
    const childColor = StaticRender.colorMap.has(color) ? StaticRender.colorMap.get(color) : color;
    ctx.fillStyle = color;

    const width = rsabs.getWidthAtTime(time);

    // find references
    const references = rsabs.getReferences();
    const boundIndices = references.map((e, i) => i).filter(e => references[e] === rsabs.binding);
    // find the height for each reference bar to reach the application bar
    const heightApplicationBars = boundIndices.map(e => rsabs.getApplicationBarHeightAtTimeAt(time, e, parentHeight));
    const countAbstractionBars = boundIndices.map(e => rsabs.getAbstractionBarCountAt(e));
    const distanceTotals = heightApplicationBars.map((e, i) => e + countAbstractionBars[i]);

    // draw each of the reference bars
    for(let i = 0;i < boundIndices.length;i++) {
        const referenceIndex = boundIndices[i];
        const referencesBefore = references.slice(0, referenceIndex);
        const referenceWidths = referencesBefore.map(e => {
            if(e !== animWrapper.binding) {
                return 1;
            }
            return Mathc.lerp(1, animWrapper.widthArgument, time);
        });
        const referencePos = referenceWidths.length > 0 ? referenceWidths.reduce((a, b) => a + b) : 0;
        const distanceToApplicationBar = distanceTotals[i];

        ctx.fillRect(...(offset.add(new Vec2d(tileSize * (1 + StaticRender.CELL_WIDTH * referencePos), 0))), ...new Vec2d(tileSize * (1), tileSize * (1 + StaticRender.CELL_HEIGHT * distanceToApplicationBar)));
    }

    // draw body
    drawRedexSubExpressionAtTime(ctx, animWrapper, rsabs.body, time, offset.add(new Vec2d(0, tileSize * StaticRender.CELL_HEIGHT)), tileSize, childColor, parentHeight ? parentHeight - 1 : parentHeight);

    ctx.fillStyle = color;

    // draw abstraction bar
    ctx.fillRect(...offset, ...new Vec2d(tileSize * (StaticRender.CELL_WIDTH * width - 1), tileSize));
}

function drawRedexSubApplicationAtTime(ctx, animWrapper, rsappl, time, offset = new Vec2d(0, 0), tileSize = 16, color = "#ffffff", parentHeight = null) {
    const childColor = StaticRender.colorMap.has(color) ? StaticRender.colorMap.get(color) : color;

    const height = rsappl.getHeightAtTime(time);
    const heightNubbin = parentHeight === null ? 1 : (parentHeight - height);
    const widthApplicator = rsappl.applicator.getWidthAtTime(time);

    // draw children
    drawRedexSubExpressionAtTime(ctx, animWrapper, rsappl.applicator, time, offset, tileSize, childColor, height);
    drawRedexSubExpressionAtTime(ctx, animWrapper, rsappl.applicee, time, offset.add(new Vec2d((widthApplicator * StaticRender.CELL_WIDTH) * tileSize, 0)), tileSize, childColor, height);

    ctx.fillStyle = color;

    // draw the application bar
    ctx.fillRect(...(offset.add(new Vec2d(tileSize * (1), tileSize * (StaticRender.CELL_HEIGHT * (height - 1))))), ...new Vec2d(tileSize * (StaticRender.CELL_WIDTH * widthApplicator + 1), tileSize * (1)));
    ctx.fillRect(...(offset.add(new Vec2d(tileSize * (1), tileSize * (StaticRender.CELL_HEIGHT * (height - 1))))), ...new Vec2d(tileSize * (1), tileSize * (StaticRender.CELL_HEIGHT * heightNubbin + 1)));
}

export {
    parseRedex,
    drawRedexAtTime
};