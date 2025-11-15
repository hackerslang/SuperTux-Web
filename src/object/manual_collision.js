function intersectsAABB(rectA, velA, rectB, velB, dt) {
    // Calculate relative velocity
    const vx = velA.x - velB.x;
    const vy = velA.y - velB.y;

    // Calculate entry and exit distances for both axes
    let xEntry, yEntry, xExit, yExit;

    if (vx > 0) {
        xEntry = rectB.x - (rectA.x + rectA.width);
        xExit = (rectB.x + rectB.width) - rectA.x;
    } else {
        xEntry = (rectB.x + rectB.width) - rectA.x;
        xExit = rectB.x - (rectA.x + rectA.width);
    }

    if (vy > 0) {
        yEntry = rectB.y - (rectA.y + rectA.height);
        yExit = (rectB.y + rectB.height) - rectA.y;
    } else {
        yEntry = (rectB.y + rectB.height) - rectA.y;
        yExit = rectB.y - (rectA.y + rectA.height);
    }

    // Calculate entry and exit times
    const xEntryTime = vx === 0 ? -Infinity : xEntry / vx;
    const xExitTime = vx === 0 ? Infinity : xExit / vx;
    const yEntryTime = vy === 0 ? -Infinity : yEntry / vy;
    const yExitTime = vy === 0 ? Infinity : yExit / vy;

    // Find the earliest/latest times
    const entryTime = Math.max(xEntryTime, yEntryTime);
    const exitTime = Math.min(xExitTime, yExitTime);

    // No collision if conditions not met
    if (entryTime > exitTime || xEntryTime < 0 && yEntryTime < 0 || xEntryTime > dt || yEntryTime > dt) {
        return { collided: false, time: 1, normal: { x: 0, y: 0 } };
    }

    // Collision normal
    let normal = { x: 0, y: 0 };
    if (xEntryTime > yEntryTime) {
        normal.x = vx < 0 ? 1 : -1;
    } else {
        normal.y = vy < 0 ? 1 : -1;
    }

    return { collided: true, time: entryTime, normal };
}