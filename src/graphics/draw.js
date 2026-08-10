// Purely stateless 2D Canvas drawing functions

import { canvasPalette } from '../models/palette.js';

// 1. Draw Sky Backdrop and Sun/Moon
export function drawBackdrop(ctx, width, height, colors, sunPos, moonPos, celestial) {
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  const colorsLen = colors.length;
  for (let i = 0; i < colorsLen; i++) {
    grad.addColorStop(i / (colorsLen - 1), colors[i]);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Draw Sun
  if (sunPos && celestial.sunSize > 0) {
    ctx.save();
    const sunGlow = ctx.createRadialGradient(
      sunPos.x, sunPos.y, 0,
      sunPos.x, sunPos.y, celestial.sunGlow
    );
    sunGlow.addColorStop(0, celestial.sunColor);
    sunGlow.addColorStop(0.2, celestial.sunColor);
    sunGlow.addColorStop(1, canvasPalette.celestial.sunGlowTransparent);
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunPos.x, sunPos.y, celestial.sunGlow, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = celestial.sunColor;
    ctx.beginPath();
    ctx.arc(sunPos.x, sunPos.y, celestial.sunSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Draw Moon
  if (moonPos && celestial.moonSize > 0) {
    ctx.save();
    const moonGlow = ctx.createRadialGradient(
      moonPos.x, moonPos.y, 0,
      moonPos.x, moonPos.y, celestial.moonGlow
    );
    moonGlow.addColorStop(0, celestial.moonColor);
    moonGlow.addColorStop(0.3, celestial.moonColor);
    moonGlow.addColorStop(1, canvasPalette.celestial.moonGlowTransparent);
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonPos.x, moonPos.y, celestial.moonGlow, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = celestial.moonColor;
    ctx.beginPath();
    ctx.arc(moonPos.x, moonPos.y, celestial.moonSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = canvasPalette.celestial.moonCutout;
    ctx.beginPath();
    ctx.arc(moonPos.x - celestial.moonSize * 0.4, moonPos.y - celestial.moonSize * 0.2, celestial.moonSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// 2. Draw Stars (Supports contiguous pool iteration)
export function drawStars(ctx, stars, activeCount = stars.length, nightWeight = 1.0) {
  ctx.save();
  for (let i = 0; i < activeCount; i++) {
    const star = stars[i];
    if (star.type && star.type !== 'star') continue;

    ctx.fillStyle = star.color;
    ctx.globalAlpha = star.alpha * nightWeight;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// 3. Draw Clouds (Supports contiguous pool iteration and inline illumination)
export function drawClouds(ctx, clouds, activeCount = clouds.length, lightState = null, lightingService = null) {
  ctx.save();
  for (let i = 0; i < activeCount; i++) {
    const cloud = clouds[i];
    if (cloud.type && cloud.type !== 'cloud') continue;

    const fillColor = (lightingService && lightState) 
      ? lightingService.illuminate(cloud.color, lightState, 0.6)
      : cloud.color;

    ctx.fillStyle = fillColor;
    ctx.globalAlpha = cloud.opacity;
    
    ctx.beginPath();
    const x = cloud.x;
    const y = cloud.y;
    const w = cloud.size;
    const h = w * 0.4;
    
    ctx.arc(x, y, h * 0.6, 0, Math.PI * 2);
    ctx.arc(x + w * 0.25, y - h * 0.15, h * 0.75, 0, Math.PI * 2);
    ctx.arc(x + w * 0.55, y - h * 0.2, h * 0.9, 0, Math.PI * 2);
    ctx.arc(x + w * 0.85, y - h * 0.05, h * 0.7, 0, Math.PI * 2);
    ctx.arc(x + w * 1.1, y, h * 0.5, 0, Math.PI * 2);
    
    ctx.rect(x, y - h * 0.1, w * 1.1, h * 0.6);
    ctx.fill();
  }
  ctx.restore();
}

// 4. Draw Procedural Heightmap (Terrain)
export function drawHeightmap(ctx, points, width, height, fillColor, shadowColor, lightState, isLit) {
  const len = points.length;
  if (len < 2) return;

  ctx.save();

  ctx.beginPath();
  ctx.moveTo(points[0].x, height);
  for (let i = 0; i < len; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.lineTo(points[len - 1].x, height);
  ctx.closePath();
  
  ctx.fillStyle = fillColor;
  ctx.fill();

  if (isLit && shadowColor) {
    ctx.fillStyle = shadowColor;
    ctx.globalAlpha = 0.15 * (1.0 - lightState.intensity * 0.5);

    let inShadow = false;
    let shadowStartIdx = 0;

    for (let i = 1; i < len; i++) {
      const dy = points[i].y - points[i - 1].y;
      
      if (dy > 0.05) {
        if (!inShadow) {
          inShadow = true;
          shadowStartIdx = i - 1;
        }
      } else if (dy < -0.05 || i === len - 1) {
        if (inShadow) {
          ctx.beginPath();
          ctx.moveTo(points[shadowStartIdx].x, points[shadowStartIdx].y);
          for (let j = shadowStartIdx; j <= i; j++) {
            ctx.lineTo(points[j].x, points[j].y);
          }
          ctx.lineTo(points[i].x, height);
          ctx.lineTo(points[shadowStartIdx].x, height);
          ctx.closePath();
          ctx.fill();
          
          inShadow = false;
        }
      }
    }
  }

  if (isLit && lightState.rimFactor > 0) {
    ctx.strokeStyle = lightState.rimLight;
    ctx.lineWidth = 2.0;
    ctx.globalAlpha = lightState.rimFactor * 0.8;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < len; i++) {
      const dy = points[i].y - points[i - 1].y;
      if (dy < -0.05) {
        ctx.lineTo(points[i].x, points[i].y);
      } else {
        ctx.moveTo(points[i].x, points[i].y);
      }
    }
    ctx.stroke();
  }

  ctx.restore();
}

// 5. Draw Swaying Pine Trees (Optimized: receives color palette directly)
export function drawPineTrees(ctx, trees, heightmapLookup, globalWindAngle, colorPalette) {
  ctx.save();
  const len = trees.length;
  for (let i = 0; i < len; i++) {
    const tree = trees[i];
    const x = tree.x;
    const y = heightmapLookup ? heightmapLookup(x) : tree.y;
    const h = tree.height;
    const w = h * tree.widthFactor;
    
    ctx.save();
    ctx.translate(x, y);
    
    const swayAngle = globalWindAngle * tree.swayScale;
    ctx.transform(1, 0, Math.sin(swayAngle), 1, 0, 0);

    // Draw trunk
    ctx.fillStyle = canvasPalette.vegetation.treeTrunk;
    ctx.fillRect(-w * 0.08, -h * 0.15, w * 0.16, h * 0.15);

    // Draw branch layers
    ctx.fillStyle = colorPalette[tree.colorIndex];
    const layers = tree.branchLayers;
    for (let j = 0; j < layers; j++) {
      const ratio = j / (layers - 1);
      const layerH = h * 0.9 * (1.0 - ratio * 0.7);
      const layerW = w * (1.0 - ratio * 0.8);
      const layerY = -h * 0.1 - (h * 0.8 * (j / layers));

      ctx.beginPath();
      ctx.moveTo(0, layerY - layerH);
      ctx.lineTo(layerW * 0.5, layerY);
      ctx.lineTo(-layerW * 0.5, layerY);
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.restore();
  }
  ctx.restore();
}

// 6. Draw Swaying Grass Blades and Flowers (Optimized: receives color palettes directly)
export function drawGrassMeadow(ctx, blades, heightmapLookup, getWindDisplacement, colorPalette, flowerColorPalette) {
  ctx.save();
  const len = blades.length;
  for (let i = 0; i < len; i++) {
    const blade = blades[i];
    const x = blade.x;
    const y = heightmapLookup ? heightmapLookup(x) : blade.y;
    const h = blade.height;
    
    const windAngle = getWindDisplacement ? getWindDisplacement(x) : 0;
    const sway = windAngle * blade.swayScale;

    ctx.beginPath();
    ctx.moveTo(x, y);
    
    const cpX = x + sway * h * 0.45;
    const cpY = y - h * 0.5;
    const tipX = x + sway * h;
    const tipY = y - h;

    ctx.quadraticCurveTo(cpX, cpY, tipX, tipY);
    ctx.quadraticCurveTo(cpX + blade.thickness * 0.5, cpY, x + blade.thickness, y);
    
    ctx.fillStyle = colorPalette[blade.colorIndex];
    ctx.fill();

    if (blade.isFlower && flowerColorPalette) {
      ctx.fillStyle = flowerColorPalette[blade.flowerColorIndex];
      ctx.beginPath();
      ctx.arc(tipX, tipY, blade.flowerSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = canvasPalette.vegetation.flowerCenter;
      ctx.beginPath();
      ctx.arc(tipX, tipY, blade.flowerSize * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// 7. Draw Weather (Rain/Snow) (Supports contiguous pool iteration)
export function drawWeather(ctx, particles, type, activeCount = particles.length) {
  ctx.save();
  if (type === 'rain') {
    for (let i = 0; i < activeCount; i++) {
      const p = particles[i];
      if (p.type && p.type !== 'rain') continue;

      ctx.strokeStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.lineWidth = p.thickness;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.vx * 0.04, p.y + p.vy * 0.04);
      ctx.stroke();
    }
  } else if (type === 'snow') {
    for (let i = 0; i < activeCount; i++) {
      const p = particles[i];
      if (p.type && p.type !== 'snow') continue;

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.beginPath();
      ctx.arc(p.x + Math.sin(p.wobble) * p.wobbleRange, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// 8. Draw Falling Leaves (Supports contiguous pool iteration and inline illumination)
export function drawLeaves(ctx, leaves, activeCount = leaves.length, lightState = null, lightingService = null) {
  ctx.save();
  for (let i = 0; i < activeCount; i++) {
    const leaf = leaves[i];
    if (leaf.type && leaf.type !== 'leaf') continue;

    const fillColor = (lightingService && lightState)
      ? lightingService.illuminate(leaf.color, lightState, 0.45)
      : leaf.color;

    ctx.fillStyle = fillColor;
    ctx.save();
    ctx.translate(leaf.x, leaf.y);
    ctx.rotate(leaf.angle + Math.sin(leaf.wobble) * 0.4);
    
    ctx.beginPath();
    ctx.ellipse(0, 0, leaf.size * 1.3, leaf.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  ctx.restore();
}

// 9. Draw Flying Birds (Supports contiguous pool iteration)
export function drawBirds(ctx, birds, activeCount = birds.length) {
  ctx.save();
  for (let i = 0; i < activeCount; i++) {
    const bird = birds[i];
    if (bird.type && bird.type !== 'bird') continue;

    ctx.fillStyle = bird.color;
    ctx.globalAlpha = bird.opacity;
    
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.scale(bird.vx > 0 ? 1 : -1, 1);

    ctx.beginPath();
    ctx.moveTo(-bird.size * 0.5, 0);
    
    const wingY = bird.wingPosition * bird.size * 0.6;
    
    ctx.quadraticCurveTo(0, -bird.size * 0.2, bird.size * 0.5, 0);
    ctx.quadraticCurveTo(bird.size * 0.1, wingY, -bird.size * 0.5, 0);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }
  ctx.restore();
}

// 10. Draw Aurora Ribbons (flowing translucent bands, additive glow blend)
export function drawAurora(ctx, ribbons, width, intensity) {
  if (intensity <= 0.01 || !ribbons || ribbons.length === 0) return;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  const segments = 28;
  const stepX = width / segments;
  const len = ribbons.length;

  for (let r = 0; r < len; r++) {
    const band = ribbons[r];

    const waveY = (x) =>
      band.baseY +
      Math.sin(x * band.frequency + band.phase) * band.amplitude +
      Math.sin(x * band.frequency * 2.3 + band.phase * 1.7) * band.amplitude * 0.3;

    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const x = i * stepX;
      const y = waveY(x);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let i = segments; i >= 0; i--) {
      const x = i * stepX;
      ctx.lineTo(x, waveY(x) + band.thickness);
    }
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, band.baseY - band.amplitude, 0, band.baseY + band.thickness + band.amplitude);
    grad.addColorStop(0, canvasPalette.phenomena.transparent);
    grad.addColorStop(0.5, band.color);
    grad.addColorStop(1, canvasPalette.phenomena.transparent);

    ctx.fillStyle = grad;
    ctx.globalAlpha = intensity * band.opacity;
    ctx.fill();
  }

  ctx.restore();
}

// 11. Draw Meteors (fast bright streaks with a fading tail)
export function drawMeteors(ctx, particles, activeCount = particles.length) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  for (let i = 0; i < activeCount; i++) {
    const p = particles[i];
    if (p.type && p.type !== 'meteor') continue;

    const tailX = p.x - p.vx * 0.14;
    const tailY = p.y - p.vy * 0.14;

    const grad = ctx.createLinearGradient(p.x, p.y, tailX, tailY);
    grad.addColorStop(0, p.color);
    grad.addColorStop(0.35, p.color);
    grad.addColorStop(1, canvasPalette.celestial.meteorTailTransparent);

    ctx.strokeStyle = grad;
    ctx.lineWidth = p.size;
    ctx.lineCap = 'round';
    ctx.globalAlpha = p.opacity;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();

    ctx.fillStyle = canvasPalette.celestial.white;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 0.65, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// 12. Draw Deer Silhouettes (Grazing, Walking, Standing)
export function drawDeerSilhouette(ctx, x, y, size, facingRight, state, stateTime, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facingRight ? 1 : -1, 1);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  const s = size / 24;

  ctx.beginPath();
  ctx.ellipse(0, -10 * s, 10 * s, 5.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  let headX = 11 * s;
  let headY = -18 * s;
  let headAngle = -0.3;

  if (state === 'grazing') {
    const eatCycle = Math.sin(stateTime * Math.PI * 2) * 0.5 + 0.5;
    headX = (9 + eatCycle * 3) * s;
    headY = (-4 + eatCycle * 2) * s;
    headAngle = 0.5;
  } else if (state === 'walking') {
    const bob = Math.sin(stateTime * 7) * 1.2 * s;
    headY += bob;
  }

  ctx.beginPath();
  ctx.moveTo(6 * s, -12 * s);
  ctx.quadraticCurveTo(7 * s, -17 * s, headX, headY);
  ctx.lineTo(headX + 1.5 * s, headY + 1.5 * s);
  ctx.quadraticCurveTo(5 * s, -7 * s, -2 * s, -9 * s);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(headX + 2.2 * s, headY - 1 * s, 3.8 * s, 1.8 * s, headAngle, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(headX, headY - 3 * s, 1.8 * s, 0.7 * s, headAngle - 0.5, 0, Math.PI * 2);
  ctx.fill();

  if (size > 22) {
    ctx.lineWidth = 1.1 * s;
    ctx.lineCap = 'round';
    ctx.beginPath();

    const antX = headX + 0.5 * s;
    const antY = headY - 2.5 * s;

    ctx.moveTo(antX, antY);
    ctx.quadraticCurveTo(antX + 2 * s, antY - 7 * s, antX + 4 * s, antY - 11 * s);
    
    ctx.moveTo(antX + 1 * s, antY - 4 * s);
    ctx.lineTo(antX - 1 * s, antY - 8 * s);
    ctx.moveTo(antX + 2.5 * s, antY - 7.5 * s);
    ctx.lineTo(antX + 1 * s, antY - 12 * s);

    ctx.stroke();
  }

  ctx.lineWidth = 1.4 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();

  let leg1Offset = 0;
  let leg2Offset = 0;

  if (state === 'walking') {
    leg1Offset = Math.sin(stateTime * 7) * 0.45;
    leg2Offset = -Math.sin(stateTime * 7) * 0.45;
  }

  ctx.moveTo(5 * s, -8 * s);
  ctx.lineTo(5 * s + Math.sin(leg1Offset) * 8 * s, 0);

  ctx.moveTo(7 * s, -8 * s);
  ctx.lineTo(7 * s + Math.sin(leg2Offset) * 8 * s, 0);

  ctx.moveTo(-6 * s, -8 * s);
  ctx.lineTo(-6 * s + Math.sin(leg2Offset) * 8 * s, 0);

  ctx.moveTo(-8 * s, -8 * s);
  ctx.lineTo(-8 * s + Math.sin(leg1Offset) * 8 * s, 0);

  ctx.stroke();
  ctx.restore();
}

// 13. Draw UFO saucers (music-only apocalypse)
export function drawUfos(ctx, particles, activeCount = particles.length) {
  ctx.save();
  for (let i = 0; i < activeCount; i++) {
    const p = particles[i];
    if (p.type !== 'ufo') continue;

    const bob = Math.sin(p.wobble) * 4;
    ctx.globalAlpha = p.opacity;
    ctx.translate(p.x, p.y + bob);

    // Beam
    const beam = ctx.createLinearGradient(0, 0, 0, p.size * 2.2);
    beam.addColorStop(0, canvasPalette.phenomena.ufoBeam);
    beam.addColorStop(1, canvasPalette.phenomena.ufoBeamTransparent);
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(-p.size * 0.25, 0);
    ctx.lineTo(p.size * 0.25, 0);
    ctx.lineTo(p.size * 0.7, p.size * 2.2);
    ctx.lineTo(-p.size * 0.7, p.size * 2.2);
    ctx.closePath();
    ctx.fill();

    // Hull
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 0.55, p.size * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = canvasPalette.phenomena.ufoDome;
    ctx.beginPath();
    ctx.ellipse(0, -p.size * 0.08, p.size * 0.22, p.size * 0.14, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    // Lights
    ctx.fillStyle = canvasPalette.phenomena.dangerGlow;
    for (let L = -2; L <= 2; L++) {
      ctx.beginPath();
      ctx.arc(L * p.size * 0.16, p.size * 0.04, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  ctx.restore();
}

// 14. Draw lumbering monster silhouettes (music-only apocalypse)
export function drawMonsters(ctx, particles, activeCount = particles.length) {
  ctx.save();
  for (let i = 0; i < activeCount; i++) {
    const p = particles[i];
    if (p.type !== 'monster') continue;

    const s = p.size / 40;
    const stomp = Math.sin(p.wobble) * 3 * s;
    ctx.globalAlpha = p.opacity;
    ctx.translate(p.x, p.y);
    ctx.scale(p.facing >= 0 ? 1 : -1, 1);
    ctx.fillStyle = p.color;

    // Body
    ctx.beginPath();
    ctx.ellipse(0, -22 * s + stomp, 16 * s, 14 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head / horns
    ctx.beginPath();
    ctx.ellipse(14 * s, -34 * s + stomp, 9 * s, 7 * s, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(10 * s, -40 * s + stomp);
    ctx.lineTo(6 * s, -54 * s + stomp);
    ctx.lineTo(14 * s, -42 * s + stomp);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(18 * s, -40 * s + stomp);
    ctx.lineTo(22 * s, -56 * s + stomp);
    ctx.lineTo(20 * s, -40 * s + stomp);
    ctx.closePath();
    ctx.fill();

    // Legs
    ctx.fillRect(-12 * s, -10 * s + stomp, 6 * s, 12 * s);
    ctx.fillRect(4 * s, -10 * s - stomp, 6 * s, 12 * s);

    // Eye glow
    ctx.fillStyle = canvasPalette.phenomena.dangerGlow;
    ctx.beginPath();
    ctx.arc(18 * s, -34 * s + stomp, 2.5 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  ctx.restore();
}
