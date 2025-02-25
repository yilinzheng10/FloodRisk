// NOTE: Ensure that your image files are accessible by running a local server 
// (e.g., via Live Server in VSCode) or hosting them online.

let caseStudyImage;  // Global variable for the case study image.
let insuranceImage;  // Global variable for the insurance image.

function preload() {
  // Verify that the file paths are correct.
  caseStudyImage = loadImage("images/dataConcept logic.png");
  insuranceImage = loadImage("images/insurance.png");
}

let interactiveElements = [];
let modalOpen = false;
let modalText = "";
let modalW = 400, modalH = 500;
let modalScroll = 0;
let modalMaxScroll = 0;
let panX = 0, panY = 0;
let lastMouseX = 0, lastMouseY = 0;

const branchColors = {
  policyBox: "#b3cde0",       // muted bluish
  newsBox: "#ccebc5",         // muted greenish
  floodDataBox: "#decbe4",    // muted purple-ish
  impactDataBox: "#fed9a6",   // muted peachy
  userPerceptionsBox: "#ffffcc" // muted yellowish
};

function setup() {
  // Create a full-page canvas fixed in the viewport.
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.style('position', 'fixed');
  cnv.style('top', '50%');
  cnv.style('left', '50%');
  cnv.style('transform', 'translate(-50%, -50%)');
  textFont('monospace');
  textAlign(CENTER, CENTER);
  // Make document scrollable for fade‑in effects.
  document.body.style.height = "2500px";

  // Define interactive elements with detailed modal content and methodology.

  // Core element (Level 0)
  interactiveElements.push({
    id: "centerEllipseGroup",
    type: "ellipse",
    cx: 450,
    cy: 300,
    rx: 150,
    ry: 60,
    text: ["RISK PERCEPTION &", "SYSTEMIC VULNERABILITY"],
    displayLevel: 0,
    modalContent: "Context & Methodology:\nClimate change is increasing the frequency and intensity of extreme weather events, placing flood-prone communities at heightened risk. This central node serves as the hub of our analysis, integrating data from multiple sources to map systemic vulnerability. Our methodology combines historical data, climate modeling, and socio-economic analysis to highlight key areas of risk and guide adaptive strategies."
  });

  // Primary Groups (Level 1)
  interactiveElements.push({
    id: "policyBox",
    type: "rect",
    x: 200,
    y: 270,
    w: 80,
    h: 50,
    text: ["Policy"],
    parents: ["centerEllipseGroup"],
    displayLevel: 1,
    modalContent: "Policy Realities & Methodology:\nFloodplain definitions and mitigation incentives often do not reflect projected climate impacts or local vulnerabilities. Our analysis leverages historical FEMA maps and current climate models to identify policy gaps and recommend adaptive measures for future risk management."
  });
  interactiveElements.push({
    id: "newsBox",
    type: "rect",
    x: 400,
    y: 150,
    w: 100,
    h: 30,
    text: ["News + Media"],
    parents: ["centerEllipseGroup"],
    displayLevel: 1,
    modalContent: "News + Media Analysis & Methodology:\nThis section aggregates current events and media reports on flood incidents and disaster responses. We analyze the frequency, tone, and impact of media coverage to assess public awareness and governmental responses to flood risks."
  });
  interactiveElements.push({
    id: "floodDataBox",
    type: "rect",
    x: 620,
    y: 250,
    w: 170,
    h: 40,
    text: ["Flood losses data"],
    parents: ["centerEllipseGroup"],
    displayLevel: 1,
    modalContent: "Flood Losses Data & Methodology:\nDetailed records of flood damages, including economic losses and recovery expenditures, are compiled from NOAA, FEMA, and insurance claims. This quantitative analysis provides insight into cost escalation and supports risk forecasting."
  });
  interactiveElements.push({
    id: "impactDataBox",
    type: "rect",
    x: 620,
    y: 300,
    w: 170,
    h: 40,
    text: ["Scale of Impact data"],
    parents: ["centerEllipseGroup"],
    displayLevel: 1,
    modalContent: "Scale of Impact Data & Methodology:\nThis node examines the broader societal impact of flood events by integrating demographic data, property value assessments, and damage reports. Our multi-dimensional approach helps reveal patterns in community resilience and vulnerability."
  });
  interactiveElements.push({
    id: "userPerceptionsBox",
    type: "rect",
    x: 450,
    y: 380,
    w: 150,
    h: 40,
    text: ["User Perceptions"],
    parents: ["centerEllipseGroup"],
    displayLevel: 1,
    modalContent: "User Perceptions & Methodology:\nThis area captures insights into how homebuyers and residents perceive flood risk. Through surveys, focus groups, and statistical analysis, I explore the relationship between risk awareness, property investment decisions, and demographic factors."
  });

  // Secondary Groups (Level 2)
  interactiveElements.push({
    id: "policyParenBox",
    type: "rect",
    x: 100,
    y: 330,
    w: 80,
    h: 30,
    text: ["Insurance"],
    textSize: 10,
    parents: ["policyBox"],
    displayLevel: 2,
    hoverOnly: true,
    hoverImage: insuranceImage,
    modalContent: "Insurance Industry Response & Methodology:\nThis sub-node examines how insurance companies adapt to increasing flood risks. We analyze trends in premium adjustments, coverage limitations, and industry reports to understand the financial implications of flood-related disasters."
  });
  interactiveElements.push({
    id: "newsParenBox",
    type: "rect",
    x: 400,
    y: 100,
    w: 100,
    h: 30,
    text: ["LA wild fire"],
    textSize: 10,
    parents: ["newsBox"],
    displayLevel: 2,
    modalContent: "LA Wild Fire Case Study & Methodology:\nUsing the LA wild fire as a contextual benchmark, I compare media coverage and public response to similar catastrophic events. This analysis helps illuminate the interplay between disaster events and risk perception."
  });
  interactiveElements.push({
    id: "2024disasterBox",
    type: "rect",
    x: 550,
    y: 100,
    w: 150,
    h: 40,
    text: ["2024 Billion Dollar \nDisaster"],
    textSize: 10,
    parents: ["newsBox"],
    displayLevel: 2,
    link: "https://www.ncei.noaa.gov/access/billions/",
    modalContent: "2024 Billion Dollar Disaster:\nThis node highlights significant financial losses from recent extreme weather events. Methodologically, I benchmark economic impacts using NOAA data to forecast potential future costs in disaster scenarios."
  });
  interactiveElements.push({
    id: "mediationBox",
    type: "rect",
    x: 260,
    y: 460,
    w: 250,
    h: 40,
    text: ["Community flood mediation efforts"],
    textSize: 10,
    parents: ["userPerceptionsBox"],
    displayLevel: 2,
    modalContent: "Community Flood Mediation Efforts & Methodology:\nFocusing on local initiatives, this section documents mediation efforts that help resolve flood-related conflicts and enhance community resilience. Our approach includes qualitative case studies and interviews with community leaders."
  });
  interactiveElements.push({
    id: "coastalBox",
    type: "rect",
    x: 530,
    y: 460,
    w: 150,
    h: 50,
    text: ["Coastal/Flood Plain", "Residents"],
    textSize: 10,
    textOffsets: [-7, 8],
    parents: ["userPerceptionsBox"],
    displayLevel: 2,
    modalContent: "Coastal/Flood Plain Residents & Methodology:\nThis node addresses the challenges faced by residents in high-risk coastal and floodplain areas. Our analysis combines demographic data with economic studies to highlight patterns of displacement and adaptive strategies."
  });
  interactiveElements.push({
    id: "surveyBox",
    type: "rect",
    x: 700,
    y: 460,
    w: 200,
    h: 60,
    text: ["User Perceptions Data: \n Flood Risk and \n Home Buying Decisions Survey"],
    textSize: 10,
    textOffsets: [-7, 8],
    parents: ["userPerceptionsBox"],
    displayLevel: 2,
    modalContent: "User Perceptions Survey & Methodology:\nThis comprehensive survey captures home buying decisions in relation to flood risk. Combining quantitative and qualitative data, our methodology analyzes awareness levels, behavioral responses, and socio-economic factors influencing purchase decisions. <br> Click to access <a href='https://docs.google.com/forms/d/1BMZ8usdyfMfWD83nz8HtWS4Tc8a4-OgF3gCUTJTyzd8/edit#responses'>Survey result data</a>."
  });
  interactiveElements.push({
    id: "caseStudyBox",
    type: "rect",
    x: 820,
    y: 270,
    w: 150,
    h: 40,
    text: ["Case Study City: NYC"],
    parents: ["floodDataBox", "impactDataBox"],
    textSize: 10,
    displayLevel: 2,
    onClick: true,
    link: "dataExplorer.html",
    modalContent: "NYC Case Study & Methodology:\nNew York City is used as a case study to illustrate urban flood risk and mitigation strategies. Our methodology integrates historical flood data, infrastructure evaluations, and policy reviews to develop comprehensive urban risk assessments."
  });

  // Tertiary Group (Level 3)
  interactiveElements.push({
    id: "gentrificationBox",
    type: "rect",
    x: 820,
    y: 220,
    w: 150,
    h: 40,
    text: ["Climate", "Gentrification"],
    parents: ["caseStudyBox"],
    displayLevel: 3,
    link: "https://yilinzheng10.github.io/MAPBOX-Storytelling/",
    modalContent: "Climate & Gentrification Analysis:\nThis node explores the intersection of environmental risk and urban gentrification. Our approach combines environmental risk assessments with socio-economic data to evaluate displacement trends and emerging high-risk investment zones."
  });
  interactiveElements.push({
    id: "displacementBox",
    type: "rect",
    x: 820,
    y: 320,
    w: 100,
    h: 40,
    text: ["Displacement", "Data"],
    parents: ["caseStudyBox"],
    displayLevel: 3,
    modalContent: "Displacement Data & Methodology:\nFocusing on the long-term impacts of recurring flood events, this node uses census data, migration reports, and property loss statistics to assess community displacement and its socio-economic consequences."
  });
  interactiveElements.push({
    id: "laInsuranceBox",
    type: "rect",
    x: 140,
    y: 125,
    w: 150,
    h: 40,
    text: ["LA wild fire \n to Insurance Industry"],
    textSize: 10,
    parents: ["newsParenBox", "policyParenBox"],
    displayLevel: 3,
    link: "https://hbr.org/2025/01/the-la-fires-could-change-the-insurance-industry",
    modalContent: "LA Wild Fire Impact on Insurance:\nAnalyzing the ripple effects of the LA wild fire on the insurance industry, this section examines premium adjustments, risk recalibration, and market responses post-disaster."
  });

  // Get the modal DOM element.
  modalDiv = document.getElementById('modal-content');
  // Setup menu event listeners for zooming.
  setupMenu();
}

function draw() {
  background(0);
  push();
    translate(panX, panY);
    textSize(12);
    textAlign(LEFT, TOP);
    fill(255);
    text("Drag to pan.\nScroll down to reveal more.\nHover or click shapes for details.", 20, 20);
  pop();

  // Determine current display layer based on scroll.
  let currentLayer = (window.scrollY < 100) ? 0 :
                     (window.scrollY < 300) ? 1 :
                     (window.scrollY < 500) ? 2 : 3;

  // Update modal position.
  let modalX = (width - modalW) / 2;
  let modalY = (height - modalH) / 2;

  // Draw connection lines.
  for (let elem of interactiveElements) {
    if (elem.parents) {
      for (let parentId of elem.parents) {
        let parentElem = getShapeById(parentId);
        if (parentElem) {
          let centerChild = getCenter(elem);
          let centerParent = getCenter(parentElem);
          let ptChild = getBoundaryPoint(elem, centerParent.x, centerParent.y);
          let ptParent = getBoundaryPoint(parentElem, centerChild.x, centerChild.y);
          let opParent = getOpacityForLevel(parentElem.displayLevel);
          let opChild = getOpacityForLevel(elem.displayLevel);
          let lineOp = min(opParent, opChild);
          stroke(255, lineOp);
          strokeWeight(1);
          line(ptParent.x, ptParent.y, ptChild.x, ptChild.y);
        }
      }
    }
  }

  // Draw interactive elements.
  for (let elem of interactiveElements) {
    let op = getOpacityForLevel(elem.displayLevel);
    if (op <= 0) continue;

    let baseScale = 1 - (elem.displayLevel * 0.1);
    let scaleFactor = baseScale;
    let isNewest = (elem.displayLevel === currentLayer);
    if (isNewest) {
      scaleFactor *= 1.2;
    }

    let baseCol = getElementColor(elem);
    let isHover = false;
    if (elem.type === "rect") {
      if (mouseX >= elem.x && mouseX <= elem.x + elem.w &&
          mouseY >= elem.y && mouseY <= elem.y + elem.h) {
        isHover = true;
      }
    } else if (elem.type === "ellipse") {
      let dx = mouseX - elem.cx;
      let dy = mouseY - elem.cy;
      if ((dx * dx) / (elem.rx * elem.rx) + (dy * dy) / (elem.ry * elem.ry) <= 1) {
        isHover = true;
      }
    }
    let drawCol = isHover ? color("lightblue") : baseCol;
    drawCol.setAlpha(op);

    push();
      let center;
      if (elem.type === "rect") {
        center = { x: elem.x + elem.w/2, y: elem.y + elem.h/2 };
      } else if (elem.type === "ellipse") {
        center = { x: elem.cx, y: elem.cy };
      }
      translate(center.x, center.y);
      scale(scaleFactor);
      if (isNewest) {
        stroke(color("#d99b9b"));
        strokeWeight(3);
      } else {
        stroke(255, op);
        strokeWeight(1);
      }
      noFill();
      if (elem.type === "rect") {
        rectMode(CENTER);
        rect(0, 0, elem.w, elem.h);
      } else if (elem.type === "ellipse") {
        ellipse(0, 0, elem.rx * 2, elem.ry * 2);
      }
    pop();

    // Draw text labels.
    push();
      textAlign(CENTER, CENTER);
      textSize((elem.textSize ? elem.textSize : 12) * scaleFactor);
      fill(255, op);
      if (elem.type === "rect") {
        let cx = elem.x + elem.w/2;
        let cy = elem.y + elem.h/2;
        if (Array.isArray(elem.text)) {
          if (elem.text.length === 1) {
            text(elem.text[0], cx, cy);
          } else {
            text(elem.text[0], cx, cy - 7 * scaleFactor);
            text(elem.text[1], cx, cy + 7 * scaleFactor);
          }
        } else {
          text(elem.text, cx, cy);
        }
      } else if (elem.type === "ellipse") {
        if (Array.isArray(elem.text)) {
          if (elem.text.length === 1) {
            text(elem.text[0], elem.cx, elem.cy);
          } else {
            text(elem.text[0], elem.cx, elem.cy - 7 * scaleFactor);
            text(elem.text[1], elem.cx, elem.cy + 7 * scaleFactor);
          }
        } else {
          text(elem.text, elem.cx, elem.cy);
        }
      }
    pop();
  }

  // Optional hover image effects.
  let csElem = getShapeById("caseStudyBox");
  if (csElem && csElem.hoverOnly && csElem.hoverImage) {
    if (mouseX >= csElem.x && mouseX <= csElem.x + csElem.w &&
        mouseY >= csElem.y && mouseY <= csElem.y + csElem.h) {
      let imgWidth = 1000;
      let imgHeight = 800;
      let imgX = (width - imgWidth) / 2;
      let imgY = (height - imgHeight) / 2;
      image(csElem.hoverImage, imgX, imgY, imgWidth, imgHeight);
    }
  }
  let insuranceElem = getShapeById("policyParenBox");
  if (insuranceElem && insuranceElem.hoverOnly && insuranceElem.hoverImage) {
    if (mouseX >= insuranceElem.x && mouseX <= insuranceElem.x + insuranceElem.w &&
        mouseY >= insuranceElem.y && mouseY <= insuranceElem.y + insuranceElem.h) {
      let imgWidth = 500;
      let imgHeight = 520;
      let imgX = (width - imgWidth) / 2;
      let imgY = (height - imgHeight) / 2;
      image(insuranceElem.hoverImage, imgX, imgY, imgWidth, imgHeight);
    }
  }

  // Fade in a dashed ellipse and animate a red circle after scrolling.
  let fadeThreshold = 700;
  let fadeRange = 200;
  let fadeFactor = constrain((window.scrollY - fadeThreshold) / fadeRange, 0, 1);
  if (fadeFactor > 0) {
    let ellipseCX = 450, ellipseCY = 300, ellipseRX = 220, ellipseRY = 100;
    push();
      stroke(200, 255 * fadeFactor);
      strokeWeight(1);
      noFill();
      drawDashedEllipse(ellipseCX, ellipseCY, ellipseRX, ellipseRY, 10, 5, 300);
    pop();
    let angle = (frameCount % 360) * (PI / 180);
    let redX = ellipseCX + ellipseRX * cos(angle);
    let redY = ellipseCY + ellipseRY * sin(angle);
    let mutedHighlight = color("#d99b9b");
    mutedHighlight.setAlpha(127 * fadeFactor);
    noStroke();
    fill(mutedHighlight);
    ellipse(redX, redY, 10, 10);
    push();
      let labelColor = color("#d99b9b");
      labelColor.setAlpha(255 * fadeFactor);
      textSize(10);
      fill(labelColor);
      textAlign(CENTER, BOTTOM);
      text("User Analyzes Cost-Benefit", width / 2, height - 10);
    pop();
  }

  // Update modal overlay position and content.
  if (modalOpen) {
    modalDiv.style.left = modalX + 'px';
    modalDiv.style.top = modalY + 'px';
    modalDiv.style.width = (modalW - 40) + 'px';
    modalDiv.style.height = (modalH - 40) + 'px';
    modalDiv.style.display = 'block';
    if (typeof modalText === 'string') {
      modalDiv.innerHTML = modalText.replace(/\n/g, '<br>');
      const links = modalDiv.getElementsByTagName('a');
      for (let link of links) {
        link.style.color = '#0066cc';
        link.style.textDecoration = 'none';
        link.style.borderBottom = '1px solid #0066cc';
        link.style.paddingBottom = '1px';
      }
      const italics = modalDiv.getElementsByTagName('i');
      for (let italic of italics) {
        italic.style.color = '#000';
      }
    }
  } else {
    modalDiv.style.display = 'none';
  }
}

// Draw dashed ellipse helper function.
function drawDashedEllipse(cx, cy, rx, ry, dashLength, gapLength, resolution) {
  let points = [];
  let dt = TWO_PI / resolution;
  for (let t = 0; t <= TWO_PI; t += dt) {
    let x = cx + rx * cos(t);
    let y = cy + ry * sin(t);
    points.push(createVector(x, y));
  }
  points.push(points[0].copy());
  let period = dashLength + gapLength;
  let acc = 0;
  for (let i = 0; i < points.length - 1; i++) {
    let A = points[i];
    let B = points[i+1];
    let segLen = p5.Vector.dist(A, B);
    let steps = ceil(segLen / 2);
    for (let j = 0; j < steps; j++) {
      let t0 = j / steps;
      let t1 = (j + 1) / steps;
      let pA = p5.Vector.lerp(A, B, t0);
      let pB = p5.Vector.lerp(A, B, t1);
      let pieceLen = p5.Vector.dist(pA, pB);
      let posInCycle = acc % period;
      if (posInCycle < dashLength) {
        line(pA.x, pA.y, pB.x, pB.y);
      }
      acc += pieceLen;
    }
  }
}

// Mouse press handling.
function mousePressed() {
  lastMouseX = mouseX;
  lastMouseY = mouseY;
  if (modalOpen) {
    // Close modal if clicking outside of it.
    let modalX = (width - modalW) / 2;
    let modalY = (height - modalH) / 2;
    if (mouseX < modalX || mouseX > modalX + modalW ||
        mouseY < modalY || mouseY > modalY + modalH) {
      modalOpen = false;
      return;
    }
  } else {
    // Check if any interactive element was clicked.
    for (let elem of interactiveElements) {
      if (elem.hoverOnly) continue;
      let hit = false;
      if (elem.type === "rect") {
        if (mouseX >= elem.x && mouseX <= elem.x + elem.w &&
            mouseY >= elem.y && mouseY <= elem.y + elem.h) {
          hit = true;
        }
      } else if (elem.type === "ellipse") {
        let dx = mouseX - elem.cx;
        let dy = mouseY - elem.cy;
        if ((dx * dx) / (elem.rx * elem.rx) + (dy * dy) / (elem.ry * elem.ry) <= 1) {
          hit = true;
        }
      }
      if (hit) {
        if (elem.link) {
          window.open(elem.link, "_blank");
          return;
        }
        modalScroll = 0;
        modalText = elem.modalContent ? elem.modalContent : "Clicked on: " + elem.id;
        modalOpen = true;
        return;
      }
    }
  }
}

// Resize canvas on window change.
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Handle mouse wheel events for modal scrolling.
function mouseWheel(event) {
  if (modalOpen) {
    modalScroll += event.delta;
    modalScroll = constrain(modalScroll, 0, modalMaxScroll);
    return false;
  }
}

// Helper: get shape by id.
function getShapeById(id) {
  for (let elem of interactiveElements) {
    if (elem.id === id) return elem;
  }
  return null;
}

// Helper: get center of a shape.
function getCenter(shape) {
  if (shape.type === "rect") {
    return { x: shape.x + shape.w / 2, y: shape.y + shape.h / 2 };
  } else if (shape.type === "ellipse") {
    return { x: shape.cx, y: shape.cy };
  }
}

// Helper: get boundary point for connections.
function getBoundaryPoint(shape, targetX, targetY) {
  let center = getCenter(shape);
  let dx = targetX - center.x;
  let dy = targetY - center.y;
  if (shape.type === "rect") {
    let hw = shape.w / 2, hh = shape.h / 2;
    if (dx === 0 && dy === 0) return center;
    let scaleX = hw / abs(dx);
    let scaleY = hh / abs(dy);
    let scale = min(scaleX, scaleY);
    return { x: center.x + dx * scale, y: center.y + dy * scale };
  } else if (shape.type === "ellipse") {
    let rx = shape.rx, ry = shape.ry;
    let denom = sqrt((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry));
    if (denom === 0) return center;
    let t = 1 / denom;
    return { x: center.x + dx * t, y: center.y + dy * t };
  }
}

// Helper: determine opacity based on display level and scroll.
function getOpacityForLevel(level) {
  let s = window.scrollY || 0;
  if (level === 0) {
    return 255;
  } else if (level === 1) {
    return constrain(map(s, 100, 300, 0, 255), 0, 255);
  } else if (level === 2) {
    return constrain(map(s, 300, 500, 0, 255), 0, 255);
  } else if (level === 3) {
    return constrain(map(s, 500, 700, 0, 255), 0, 255);
  }
  return 255;
}

// Helper: lighten a color.
function lightenCol(col, amt) {
  let h = hue(col);
  let s = saturation(col);
  let b = brightness(col);
  b = constrain(b + amt, 0, 100);
  return color(h, s, b);
}

// Helper: get element's branch color.
function getElementColor(elem) {
  function getRootParent(el) {
    if (!el.parents || el.parents.length === 0) return el;
    let parent = getShapeById(el.parents[0]);
    if (!parent || !parent.parents || parent.parents.length === 0) return parent || el;
    return getRootParent(parent);
  }
  let root = getRootParent(elem);
  if (branchColors.hasOwnProperty(root.id)) {
    return color(branchColors[root.id]);
  }
  return color(255);
}

// Pan the view when dragging.
function mouseDragged() {
  let dx = mouseX - lastMouseX;
  let dy = mouseY - lastMouseY;
  panX += dx;
  panY += dy;
  lastMouseX = mouseX;
  lastMouseY = mouseY;
}

// Zoom to a specific group when clicking a menu item.
function zoomToGroup(targetId) {
  let target = getShapeById(targetId);
  if (target) {
    let center = getCenter(target);
    panX = width / 2 - center.x;
    panY = height / 2 - center.y;
  }
}

// Setup menu click events.
function setupMenu() {
  let links = document.querySelectorAll("#menu a");
  links.forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      let targetId = this.getAttribute("data-target");
      zoomToGroup(targetId);
    });
  });
}
