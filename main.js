"use strict";
import {toolsToEditPixels,modalAskSave,modalAskDownload,modalInfoIMG,loading,toolsOfCrop,modalEditSizeCrop,toolsOfDraw} from "./Modules/Elements.js";

const $ = selector=>document.querySelector(selector);

const $$ = selector=>document.querySelectorAll(selector);

const $canvas = $("#canvas"),
ctx = $canvas.getContext("2d"),
$checkingColor = $("#checkColor"),
$aplication = $(".aplication"),
$toolsDown = $(".tools_down"),
$toolsUp = $(".tools_up"),
$buttonSave = $("#download");

//ES LLAMADO ACA PARA QUE AL GUARDAR LA PRIMERA CAPA DE EL CANVAS SEA DE ESTE COLOR 
fillCanvas("#ffffff");

//variables globales
let toolSelected = null,
layers = {layer:[getDataOfImgInCanvas()],index:0},
informationIMG = {name:"",type:"",size:"",time:"",imgSize:""},
notShowModalSaveChangeAgain = false,
registrationSetTimeOut = {};

class Pixel {
  constructor(imgOriginal) {
    this.layers = {layers:[[imgOriginal,new Map()]],index:0};
    this.tool = "penzil";
    this.zoom = 10;
    this.color = "#000";
    this.penzil = 1;
    this.eraser = 1;
  }
  get toolName () { return "pixel" }
  static initTool (imgOriginal) {
    return new Pixel (imgOriginal);
  }
}

class Crop {
  constructor (maxW,minW,maxH,minH) {
    this.maxWidth = maxW,
    this.minWidth = minW,
    this.maxHeight = maxH,
    this.minHeight = minH
  }
  get toolName () { return "crop" }
  static initTool (maxWidth,minWidth,maxHeight,minHeight) {
    return new Crop (maxWidth,minWidth,maxHeight,minHeight);
  }
}

class Draw {
  constructor (htmlTools,circle1,circle2,dataIMG,cursor,propsmodalsettingborderround,positioningShapeProps,valuesModalEditShapeText,amountPointsClipPath) {
    this.layer = {layers:[dataIMG],index:0}
    this.htmlChildren = htmlTools;
    this.optionSelected = "brush";
    this.optionCutCircles = {noMove:circle1,move:circle2};
    this.typeSuperpositionDraw = {type:"source-over",name:"Normal"};
    this.cursor = cursor;
    this.valuesSettingRoundBorderSHAPESQUARE = propsmodalsettingborderround;
    this.optionsPositioningSHAPE = positioningShapeProps;
    this.valuesSettingThicknessSHAPELINE = {thicknessPX:40,borderRoundActived:false};
    this.lockRatioShape = false;
    this.variablesOfLockRatio = {};
    this.flipHorizontal = {actived:false,degRotate:0};
    this.flipVertical = {actived:false,degRotate:0};
    this.valuesSettingShapeText = valuesModalEditShapeText;
    this.valuesSettingClipPath = amountPointsClipPath;
  }
  get toolName () { return "draw" }
  static initTool (toolsHTML,c1,c2,dataIMGoriginal,cursor,propsvaluesSettingRoundBorderSHAPESQUARE,positioningShapeProps,valuesModalEditShapeText,valueModalAddedPointsClipPathShape) {
    return new Draw (toolsHTML,c1,c2,dataIMGoriginal,cursor,propsvaluesSettingRoundBorderSHAPESQUARE,positioningShapeProps,valuesModalEditShapeText,valueModalAddedPointsClipPathShape);
  }
}

//RELLENAR CANVAS CON PIXELES DE COLOR BLANCO
function fillCanvas (color) {
  ctx.fillStyle = color;
  ctx.fillRect(0,0,$canvas.width,$canvas.height);
}

function showPixelsInAreaPulsedCanvas () {
  const {zoom,indexPxPulsedY,indexPxPulsedX} = toolSelected;
  
  let {index,layers} = toolSelected.layers;
  
  let imgEditing = layers[index][0]
  
  let maxWidthCanvas = 350,
  widthMaxAccept = 360,
  maxHeightCanvas = 450,
  heightMaxAccept = 455;
  
  let amountPixelsEnterInMaxWidthCanvas = Math.ceil(maxWidthCanvas / zoom),
  amountPixelsEnterInMaxHeightCanvas = Math.ceil(maxHeightCanvas / zoom);
  
  if (amountPixelsEnterInMaxWidthCanvas * zoom > widthMaxAccept) amountPixelsEnterInMaxWidthCanvas -= 1;
  
  if (amountPixelsEnterInMaxHeightCanvas * zoom > heightMaxAccept) amountPixelsEnterInMaxHeightCanvas -= 1
  
  let widthCanvasToApply = zoom * amountPixelsEnterInMaxWidthCanvas,
  heightCanvasToApply = zoom * amountPixelsEnterInMaxHeightCanvas;
  
  $canvas.width = widthCanvasToApply;
  $canvas.height = heightCanvasToApply;
  
  let amountPixelsAcumulateInY = 1,
  amountPixelsAcumulateInX = 1;
  
  let indexInReverseY = indexPxPulsedY - 1,indexInNextY = indexPxPulsedY + 1,
  indexInReverseX = indexPxPulsedX - 1,
  indexInNextX = indexPxPulsedX + 1;
  
  let indexInCenterX = Math.floor(amountPixelsEnterInMaxWidthCanvas / 2)
  ,indexInCenterY = Math.floor(amountPixelsEnterInMaxHeightCanvas / 2);
  
  if (indexPxPulsedX < indexInCenterX) indexInCenterX = indexPxPulsedX;
  else if (imgEditing.width - indexPxPulsedX <= indexInCenterX) {
    let diference = imgEditing.width - indexPxPulsedX;
    
    indexInCenterX = amountPixelsEnterInMaxWidthCanvas - diference;
  }
  
  if (indexPxPulsedY < indexInCenterY) indexInCenterY = indexPxPulsedY;
  else if (imgEditing.height - indexPxPulsedY <= indexInCenterY) {
    let diference = imgEditing.height - indexPxPulsedY;
    
    indexInCenterY = amountPixelsEnterInMaxHeightCanvas - diference;
  }
  
  const getColorPixel = (x,y) => {
    let position = getPositionPixel(x,y,imgEditing);
    
    let red = imgEditing.data[position],
    green = imgEditing.data[position+1],
    blue = imgEditing.data[position+2];
    
    return "#" + hex(red) + hex(green) + hex(blue);
  }
  
  let indexXStart,indexYStart;
  
  const getIndexStartPxToShow = (x,y,indexXInCanvas,indexYInCanvas) => {
    if (indexXInCanvas === 0) indexXStart = x;
    if (indexYInCanvas === 0) indexYStart = y;
  }
  
  const drawPixel = (x,y) => {
    ctx.beginPath();
    ctx.fillStyle = getColorPixel(x,y);
    
    let amountIndexMoveFromCenterX = x - indexPxPulsedX,
    amountIndexMoveFromCenterY = y - indexPxPulsedY;
    
    let xInCanvas = indexInCenterX + amountIndexMoveFromCenterX,
    yInCanvas = indexInCenterY + amountIndexMoveFromCenterY;
    
    ctx.fillRect(xInCanvas * zoom,yInCanvas * zoom,zoom,zoom);
    
    getIndexStartPxToShow(x,y,xInCanvas,yInCanvas);
  }
  
  const travelInYInBothSides = (indexX) => {
    for (;;) {
      let bothSidesInYFinish = 0;
      
      if (indexInReverseY >= 0) {
        drawPixel(indexX,indexInReverseY);
        amountPixelsAcumulateInY += 1;
      }
      else bothSidesInYFinish += 1;
      
      if (amountPixelsAcumulateInY < amountPixelsEnterInMaxHeightCanvas && indexInNextY < imgEditing.height) {
        drawPixel(indexX,indexInNextY);
        amountPixelsAcumulateInY += 1;
      }
      else bothSidesInYFinish += 1;
      
      if (amountPixelsAcumulateInY === amountPixelsEnterInMaxHeightCanvas || bothSidesInYFinish === 2) {
        drawPixel(indexX,indexPxPulsedY);
        indexInReverseY = indexPxPulsedY - 1;
        indexInNextY = indexPxPulsedY + 1;
        amountPixelsAcumulateInY = 1;
        break;
      }
      
      indexInReverseY -= 1;
      indexInNextY += 1;
    }
  }
  
  for (;;) {
    let bothSidesInXFinish = 0;
    
    if (indexInReverseX >= 0) {
      travelInYInBothSides(indexInReverseX)
      amountPixelsAcumulateInX += 1;
    }
    else bothSidesInXFinish += 1;
    
    if (amountPixelsAcumulateInX < amountPixelsEnterInMaxWidthCanvas && indexInNextX < imgEditing.width) {
      travelInYInBothSides(indexInNextX);
      amountPixelsAcumulateInX += 1;
    }
    else bothSidesInXFinish += 1;
    
    if (amountPixelsAcumulateInX === amountPixelsEnterInMaxWidthCanvas || bothSidesInXFinish === 2) {
      travelInYInBothSides(indexPxPulsedX)
      break;
    }
    
    indexInReverseX -= 1;
    indexInNextX += 1;
  }
  
  toolSelected.indexStartPxX = indexXStart;
  toolSelected.indexStartPxY = indexYStart;
}

//ESTA FUNCION SE EJECUTA AL HACER CLICK EN EL CANVAS
function canvasClicked (e) {
  const {offsetX,offsetY} = e;
  
  toolSelected.indexPxPulsedY = offsetY > 0 ? offsetY - 1 : 0;
  
  toolSelected.indexPxPulsedX = offsetX > 0 ? offsetX - 1 : 0;
  
  showPixelsInAreaPulsedCanvas();
  
  $canvas.onclick = null;
  
  $canvas.ontouchstart = touchesCanvasMainOfAplicationInToolPixel;
  $canvas.ontouchmove = touchesCanvasMainOfAplicationInToolPixel;
  $canvas.ontouchend = touchesCanvasMainOfAplicationInToolPixel;
  
  addToolPixel();
}

function hideMarkerIfIsNecesary (markerIsOf) {
  let hideButtonBrush = $(".pixel-tool .size-children #brush-name").classList.contains("hide"),
  hideButtonEraser = $(".pixel-tool .size-children #eraser-name").classList.contains("hide");
  
  if (markerIsOf === "size" && !hideButtonEraser && !hideButtonBrush) $(".pixel-tool .size-children .marker-size").classList.add("hide");
  else if (markerIsOf === "zoom") $(".pixel-tool .zoom-children .marker-zoom").classList.add("hide");
}

function touchesInputSizeToolForPixel (e) {
  const {target,type,touches} = e;
  
  let inputID = target.id;
  
  let $MARKER,measure;
  
  if (inputID === "brush-range" || inputID === "eraser-range") {
    $MARKER =  $(".size-children .marker-size");
    measure = "px";
  }
  else {
    $MARKER = $(".zoom-children .marker-zoom");
    measure = "x";
  }
  
  if (type === "touchstart") e.preventDefault()
  else if (type === "touchend") {
    $MARKER.classList.add("hide");
    return;
  }
  
  const {clientX,clientY} = touches[0];
  
  const {x,y,width} = target.getBoundingClientRect();
  
  const $CONTAINER = $MARKER.parentElement;
  
  const measuresContainer = $CONTAINER.getBoundingClientRect();
  
  let xInInput = clientX - x;
  
  let maxInput = Number(target.max),
  minInput = Number(target.min);
  
  let distanceValues = maxInput - minInput;
  
  let pxForMoveInput = (width / distanceValues);
  
  let positionToMove = Math.floor(xInInput / pxForMoveInput);
  
  let newValueInput = positionToMove + minInput;
  
  let leftMarker = x - measuresContainer.x,
  topMarker = y - measuresContainer.y - 60
  
  leftMarker += (positionToMove * pxForMoveInput) - 22.5;
  
  if (positionToMove >= 0 && positionToMove <= distanceValues) {
    setPropertyElement($MARKER,"left",`${leftMarker}px`);
    setPropertyElement($MARKER,"top",`${topMarker}px`);
    
    target.value = newValueInput;
    
    let valueInString = newValueInput + measure;
    
    $MARKER.innerText = valueInString;
    
    setValuesOfInputInVariablesOfPixel(inputID,newValueInput,valueInString)
  }
  
  $MARKER.classList.remove("hide");
}

function setValuesOfInputInVariablesOfPixel (inputId,value,textOfValueCurrent) {
  if (inputId === "brush-range") toolSelected.penzil = value;
  else if (inputId === "eraser-range") toolSelected.eraser = value;
  else if (inputId === "zoom-range") {
    toolSelected.zoom = value;
    $(".pixel-tool .zoom-children #zoom-amount").innerText = textOfValueCurrent;
    showPixelsInAreaPulsedCanvas();
  }
}

function changeColorPixelPaint ({target}) {
  let newColorPixel = target.value;
  toolSelected.color = newColorPixel;
}

function resizePxInCanvasToolPixel (clientX,clientY) {
  const {clientXLast,clientYLast,zoom,indexPxPulsedX,indexPxPulsedY} = toolSelected;
  
  let {index,layers} = toolSelected.layers;
  
  let imgEditing = layers[index][0]
  
  let amountPxReference = zoom / 2;
  
  let diferenceX = clientXLast - clientX,
  diferenceY = clientYLast - clientY;
  
  let pxMoveInX,
  pxMoveInY;
  
  if (diferenceX > 0) pxMoveInX = Math.ceil(diferenceX / amountPxReference);
  else pxMoveInX = Math.floor(diferenceX / amountPxReference);
  
  if (diferenceY > 0) pxMoveInY = Math.ceil(diferenceY / amountPxReference);
  else pxMoveInY = Math.floor(diferenceY / amountPxReference);
  
  let newIndexForApplyX = indexPxPulsedX,
  newIndexForApplyY = indexPxPulsedY;
  
  if (Math.abs(pxMoveInX) > 1) {
    let indexToApplyX = indexPxPulsedX + pxMoveInX;
    
    newIndexForApplyX = indexToApplyX < imgEditing.width && indexToApplyX >= 0 ? indexToApplyX : indexPxPulsedX;
  }
  
  if (Math.abs(pxMoveInY) > 1) {
    let indexToApplyY = indexPxPulsedY + pxMoveInY;
    
    newIndexForApplyY = indexToApplyY < imgEditing.height && indexToApplyY >= 0 ? indexToApplyY : indexPxPulsedY;
  }
  
  toolSelected.indexPxPulsedX = newIndexForApplyX;
  toolSelected.indexPxPulsedY = newIndexForApplyY;
  
  if (newIndexForApplyX !== indexPxPulsedX || newIndexForApplyY !== indexPxPulsedY) showPixelsInAreaPulsedCanvas();
}

function getIndexPixelPulsedInCanvasMain (clientX,clientY) {
  let {x,y} = $canvas.getBoundingClientRect();
  
  const {zoom} = toolSelected;
  
  let xPulsed = clientX - x,
  yPulsed = clientY - y;
  
  let xIndexPixel = Math.floor(xPulsed / zoom),
  yIndexPixel = Math.floor(yPulsed / zoom);
  
  return {x:xIndexPixel,y:yIndexPixel}
}

function paintNewLayerCurrentInCanvasToolPixel () {
  const {indexStartPxX,indexStartPxY,zoom} = toolSelected;
  
  let {layers,index} = toolSelected.layers;
  
  let dataLayerCurrent = layers[index][0];
  
  let lenghtX = $canvas.width / zoom,
  lenghtY = $canvas.height / zoom;
  
  clearCanvas();
  
  for (let indexY=0;indexY < lenghtY;indexY++) {
    for (let indexX=0;indexX < lenghtX;indexX++) {
      let indexXInData = indexStartPxX + indexX,indexYInData = indexStartPxY + indexY;
      
      let positionPx = getPositionPixel(indexXInData,indexYInData,dataLayerCurrent);
      
      let red = dataLayerCurrent.data[positionPx],
      green = dataLayerCurrent.data[positionPx+1],
      blue = dataLayerCurrent.data[positionPx+2],
      colorInHexadecimal = "#" + hex(red) + hex(green) + hex(blue);
      
      ctx.beginPath();
      ctx.fillStyle = colorInHexadecimal;
      ctx.fillRect(indexX * zoom,indexY * zoom,zoom,zoom);
    }
  }
}

function paintPixelsInCanvasMain (clientX,clientY) {
  const {zoom,color,indexStartPxX,indexStartPxY,penzil} = toolSelected;
  
  let {index,layers} = toolSelected.layers;
  
  let [imgEditing,indexOfPixelsModified] = layers[index];
  
  const {x,y} = getIndexPixelPulsedInCanvasMain(clientX,clientY);
  
  let halfPixelsToPaint = Math.floor(penzil / 2);
  
  let xStart = x - halfPixelsToPaint,
  xEnd = xStart + penzil,
  yStart = y - halfPixelsToPaint,
  yEnd = yStart + penzil;
  
  const setColorPxInDataIMGWithinRange = (indexXInData,indexYInData) => {
    if (indexYInData >= 0 && indexXInData >= 0 && indexXInData < imgEditing.width && indexYInData < imgEditing.height) {
      let positionPx = getPositionPixel(indexXInData,indexYInData,imgEditing);
  
      let {r,g,b} = convertColorToRgb(color);
  
      imgEditing.data[positionPx] = r;
      imgEditing.data[positionPx+1] = g;
      imgEditing.data[positionPx+2] = b;
      
      indexOfPixelsModified.set(`${indexXInData}-${indexYInData}`,true);
    }
  }
  
  for (let yCurrent = yStart;yCurrent < yEnd;yCurrent++) {
    for (let xCurrent = xStart;xCurrent < xEnd;xCurrent++) {
      let indexXInDataIMG = indexStartPxX + xCurrent,indexYInDataIMG = indexStartPxY + yCurrent;
      
      if (x >= 0 && y >= 0 && x < ($canvas.width / zoom) && y < ($canvas.height / zoom)) {
        setColorPxInDataIMGWithinRange(indexXInDataIMG,indexYInDataIMG)
        
        let xPaintPixel = xCurrent * zoom,
        yPaintPixel = yCurrent * zoom;
  
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.fillRect(xPaintPixel,yPaintPixel,zoom,zoom);
      }
    }
  }
}

function eraserPixelsPaintInCanvasMain (clientX,clientY) {
  const {x,y} = getIndexPixelPulsedInCanvasMain(clientX,clientY);
  
  const {zoom,indexStartPxX,indexStartPxY,eraser} = toolSelected;
  
  let {layers,index} = toolSelected.layers;
  
  let originalIMG = layers[0][0],
  [imgEditing,indexOfPixelsModified] = layers[index];
  
  let halfPixelsToEraser = Math.floor(eraser / 2);
  
  let xStart = x - halfPixelsToEraser,
  xEnd = xStart + eraser,
  yStart = y - halfPixelsToEraser,
  yEnd = yStart + eraser;
  
  for (let y = yStart;y < yEnd;y++) {
    for (let x = xStart;x < xEnd;x++) {
      if (x >= 0 && y >= 0 && x < ($canvas.width / zoom) && y < ($canvas.height / zoom)) {
        let indexXInDataIMG = indexStartPxX + x,indexYInDataIMG = indexStartPxY + y;
        
        let positionPx = getPositionPixel(indexXInDataIMG,indexYInDataIMG,originalIMG);
  
        let red = originalIMG.data[positionPx],
        green = originalIMG.data[positionPx+1],
        blue = originalIMG.data[positionPx+2],
        colorInHexadecimal = "#" + hex(red) + hex(green) + hex(blue);
  
        ctx.beginPath();
        ctx.fillStyle = colorInHexadecimal;
        ctx.fillRect(x * zoom,y * zoom,zoom,zoom);
  
        imgEditing.data[positionPx] = red;
        imgEditing.data[positionPx+1] = green;
        imgEditing.data[positionPx+2] = blue;
        
        let key = `${indexXInDataIMG}-${indexYInDataIMG}`;
        
        if (indexOfPixelsModified.has(key)) indexOfPixelsModified.delete(key)
      }
    }
  }
}

function touchesCanvasMainOfAplicationInToolPixel (e) {
  const {touches,changedTouches,type} = e;
  
  const {tool,touchActive,identifierFinger} = toolSelected;
  
  e.preventDefault();
  
  let notShrink = shrinkContainerIfIsNecesary();
  
  if (type === "touchstart" && notShrink) toolSelected.notContinue = true;
  else if (type === "touchstart") toolSelected.notContinue = false;
  
  if ((type === "touchstart" && identifierFinger !== undefined) || (type === "touchmove" && identifierFinger === undefined) || (type === "touchend" && changedTouches[0].identifier !== identifierFinger) || toolSelected.notContinue) return;
  
  if (type === "touchstart" && tool === "resize") {
    let {clientX,clientY} = touches[0];
    
    toolSelected.clientXLast = clientX;
    toolSelected.clientYLast = clientY;
    
    toolSelected.identifierFinger = touches[0].identifier;
    
    return;
  }
  else if (type === "touchstart") {
    let {layers,index} = toolSelected.layers;
    
    const [dataIMGCurrent,indexPxModified] = layers[index];
    
    let copyCurrentIMGData = structuredClone(dataIMGCurrent);
    
    let mapForSaveIndexPxModified = new Map([...indexPxModified]);
    
    let layersToDelete = layers.slice(index + 1,layers.length);
    
    layers = layers.slice(0,index + 1);
    
    let nextIndex = layers.length;
    
    layers.push([copyCurrentIMGData,mapForSaveIndexPxModified]);
    
    toolSelected.layers.index = nextIndex;
    toolSelected.layers.layers = layers;
    toolSelected.identifierFinger = touches[0].identifier;
    
    if (tool === "eraser") {
      toolSelected.sizeBeforePxModified = mapForSaveIndexPxModified.size;
      
      toolSelected.layersDelete = layersToDelete;
    }
  }
  else if (type === "touchend" && tool !== "resize") {
    const {layers,sizeBeforePxModified,layersDelete} = toolSelected;
    
    let {index} = layers;
    
    let indexOfPxModifiedInDataIMG = layers.layers[index][1];
    
    if (tool === "eraser" && indexOfPxModifiedInDataIMG.size === sizeBeforePxModified) {
      layers.layers.pop();
      
      layers.index = layers.layers.length - 1;
      
      layersDelete.forEach(layer=>{
        layers.layers.push(layer);
      })
    }
    
    changeLayerInToolPixel({
      currentTarget:$(".tools_down .container-buttons-change-layer"),
      target:{}
    })
  }
  
  if (type === "touchend") {
    toolSelected.identifierFinger = undefined;
    return;
  }
  
  let clientX,clientY;
  for (let i=0;i<touches.length;i++) {
    let {identifier} = touches[i];
    if (identifier === identifierFinger) {
      clientX = touches[i].clientX;
      clientY = touches[i].clientY;
    }
  }
  
  if (tool === "resize") resizePxInCanvasToolPixel(clientX,clientY)
  else if (tool === "penzil") paintPixelsInCanvasMain(clientX,clientY);
  else if (tool === "eraser") eraserPixelsPaintInCanvasMain(clientX,clientY);
  
  toolSelected.clientXLast = clientX;
  toolSelected.clientYLast = clientY;
}

function changeLayerInToolPixel ({currentTarget,target,type}) {
  let ID = target.id;
  
  let {index,layers} = toolSelected.layers;
  
  if (ID === "before-layer-pixel") index = index - 1 >= 0 ? index - 1 : index;
  else if (ID === "next-layer-pixel") index = index + 1 < layers.length ? index + 1 : index;
  
  let distanceIndexCurrentAndSizeLayers = (layers.length - 1) - index;
  
  const $ICONNEXT = currentTarget.querySelector("#next-layer-pixel img"),
  $ICONBEFORE = currentTarget.querySelector("#before-layer-pixel img");
  
  if (index === 0) $ICONBEFORE.classList.add("opacity-midle");
  else $ICONBEFORE.classList.remove("opacity-midle");
  
  if (distanceIndexCurrentAndSizeLayers === 0) $ICONNEXT.classList.add("opacity-midle");
  else $ICONNEXT.classList.remove("opacity-midle");
  
  toolSelected.layers.index = index;
  
  if (type === "click") paintNewLayerCurrentInCanvasToolPixel();
  
  if (index > 0) disableOrEnableButtonSaveChange("enable");
  else disableOrEnableButtonSaveChange("disabled");
}

//AGREGA LAS HERRAMIENTAS DEL MODO PIXEL
function addToolPixel () {
  const {html,modifierChildren,buttonsForChangeOfLayer} = toolsToEditPixels();
  
  $toolsDown.lastElementChild.classList.add("hide");
  
  $toolsDown.insertAdjacentHTML("beforeend",html);
  $toolsDown.insertAdjacentHTML("afterbegin",modifierChildren);
  $toolsDown.insertAdjacentHTML("beforeend",buttonsForChangeOfLayer);
  
  changePaddingToolDown("3px");
  setPropertyElement($toolsDown,"--gapFlex","3px");
  
  const {tool,penzil,eraser,zoom,color} = toolSelected;
  
  $(`.modifier-children button#${tool}`).classList.add("tool-selected");
  
  const $INPUTCOLOR = $(".pixel-tool #color-pixel");
  
  $INPUTCOLOR.value = color;
  
  $INPUTCOLOR.onchange = changeColorPixelPaint;
  
  $$(".size-children input").forEach(input=>{
    if (input.id === "brush-range") input.value = penzil;
    else input.value = eraser;
    
    input.ontouchstart = touchesInputSizeToolForPixel;
    input.ontouchmove = touchesInputSizeToolForPixel;
    input.ontouchend = touchesInputSizeToolForPixel
  });
  
  const $INPUTZOOM = $(".zoom-children #zoom-range"),
  $ZOOMCURRENT = $(".zoom-children #zoom-amount");
  
  $INPUTZOOM.ontouchstart = touchesInputSizeToolForPixel;
  $INPUTZOOM.ontouchmove = touchesInputSizeToolForPixel;
  $INPUTZOOM.ontouchend = touchesInputSizeToolForPixel;
  
  $INPUTZOOM.value = zoom
  $ZOOMCURRENT.innerText = zoom + "x";
  
  const $CONTAINERBUTTONSFORCHANGEOFLAYER = $(".tools_down .container-buttons-change-layer");
  
  $CONTAINERBUTTONSFORCHANGEOFLAYER.onclick = changeLayerInToolPixel;
  
  changeLayerInToolPixel({
    target:{},
    currentTarget:$CONTAINERBUTTONSFORCHANGEOFLAYER
  })
}

//QUITA O AGREGA EL EVENTO CLICK DEL CANVAS
function addOrRemoveEventElement (type,event,fun,element) {
  element[type](event,fun);
}

//ESPERA A QUE LA TRANSISION TERMINE PARA LUEGO ELIMINARME EL MODAL INDICADO
function removeElementOfDom (modal) {
  modal.remove();
}

//ME DIBUJA EN EL CANVAS LA IMAGEN QUE RECORTAMOS 
function putInCanvasNewImageCut ({width,height,left,top}) {
  const dataImg = getDataOfImgInCanvas();
  
  let sizePixelToApply;
  for (let sizePx=1;;sizePx++) {
    if ((sizePx * width > 350) || (sizePx * height > 450)) {
      sizePixelToApply = sizePx - 1;
      break;
    }
  }
  
  $canvas.width = sizePixelToApply * width;
  $canvas.height = sizePixelToApply * height;
  
  const loadingE = loading(),
  imgE = $(".img");
  
  $(".img .grid").remove();
  $(".img .curtain-crop").remove();
  $(".aplication .info-current-size-crop").remove();
  
  setPropertyElement(imgE,"border","none");
  
  for (let x=left;x <= (left + width) && x < dataImg.width;x++) {
      for (let y=top;y <= (top + height) && y < dataImg.height;y++) {
        let position = getPositionPixel(x,y,dataImg);
      
        let r = dataImg.data[position],
        g = dataImg.data[position + 1],
        b = dataImg.data[position + 2],
        colorHex = "#" + hex(r) + hex(g) + hex(b);
        
        ctx.beginPath();
        ctx.fillStyle = colorHex;
        ctx.fillRect((x - left) * sizePixelToApply,(y - top) * sizePixelToApply,sizePixelToApply,sizePixelToApply);
      }
  }
  
  goHomeAplication();
  saveLayerInLayersMain();
  setPropertyElement(imgE,"border","1px solid #fff");
}

function saveLayerInLayersMain () {
  if (layers.index < layers.layer.length - 1) {
    layers.layer = layers.layer.slice(0,layers.index + 1);
    
    const $buttonNext = $("#next");
    
    const $p = $buttonNext.querySelector("p"),
    $img = $buttonNext.querySelector("img")
    
    $p.innerText = 0;
    
    $p.classList.add("opacity-midle");
    $img.classList.add("opacity-midle");
  }
  
  layers.index = layers.layer.length;
  layers["layer"].push(getDataOfImgInCanvas());
  
  const $buttonBack = $("#back");
  
  const $p = $buttonBack.querySelector("p"),$img = $buttonBack.querySelector("img");
  
  $p.classList.remove("opacity-midle");
  $img.classList.remove("opacity-midle");
  
  $p.innerText = layers.index;

}

function disableOrEnableButtonSaveChange(method) {
  let disableBUTTON,
  METHODCLASSLIST;
  if (method === "enable") {
    disableBUTTON = false;
    METHODCLASSLIST = "remove";
  } else {
    disableBUTTON = true;
    METHODCLASSLIST = "add";
  }
  
  $buttonSave.disabled = disableBUTTON;
  $buttonSave.classList[METHODCLASSLIST]("opacity-midle");
}

//ESCUCHANDO EL EVENTO CLICK DE EL BOTON SAVE 
$buttonSave.addEventListener("click",()=>{
  let nameToolToEdit = toolSelected?.toolName;
  
  if (nameToolToEdit === "pixel") {
    if ($(".pixel-tool")) {
      let notShrink = shrinkContainerIfIsNecesary();
      
      if (notShrink) return;
      else goBackInToolPixel();
    }
    
    goBackInToolPixel("save");
    saveLayerInLayersMain();
    const {index,layer} = layers;
    putImageDataCorrectlyInCanvas(layer[index]);
  }
  else if (nameToolToEdit === "crop") {
    const $CONTAINERMOREASPECTRATIO = $(".crop-tool .container-more-aspect-ratio");
    
    if ($CONTAINERMOREASPECTRATIO.classList.contains("scaleY-1")) {
      $CONTAINERMOREASPECTRATIO.classList.remove("scaleY-1");
      return;
    }
    
    const $containerGrid = $(".img");
    const grid = {
      width:getPropertyValueElement("--sizeX",$containerGrid),
      height:getPropertyValueElement("--sizeY",$containerGrid),
      left:getPropertyValueElement("--left",$containerGrid),
      top:getPropertyValueElement("--top",$containerGrid),
    };
    
    putInCanvasNewImageCut(grid);
  }
  else if (nameToolToEdit === "draw") {
    const {propsContainerAdjustShapes} = toolSelected;
    
    //ESTO QUIERE DECIR QUE ESTAMOS POR AGREGAR A UNA FORMA EN EL CANVAS
    
    if (propsContainerAdjustShapes) {
      drawShapeInCanvas();
      saveLayerInToolDraw();
    }
    
    goHomeAplication("save");
    saveLayerInLayersMain();
    const {index,layer} = layers;
    putImageDataCorrectlyInCanvas(layer[index]);
  }
  else {
    if (!document.body.children["link"]) {
      const link = document.createElement("A");
      link.classList.add("hide");
      link.setAttribute(`id`,`link`);
      
      document.body.appendChild(link);
    }
    
    const htmlModalDownload = modalAskDownload(informationIMG.name);
    insertModalInApp(htmlModalDownload);
    
    const modal = $(".modal-nameIMG");
    
    $(".modal-nameIMG .buttons").onclick = event => {
      const button = event.target.id;
      if (button === "save") {
        const $link = document.body.children["link"];
        
        $link.setAttribute("download",$(".modal-nameIMG .fileName > input").value);
        $link.setAttribute(`href`,`${$canvas.toDataURL()}`)
        $link.click();
      }
      
      if (button !== "") removeElementOfDom(modal);
    }
  }
})

//CONVIERTE EL COLOR HEX A RGB 
function convertColorToRgb (color) {
  $checkingColor.style.setProperty("background-color",color);
  let colorInRgb = getComputedStyle($checkingColor).getPropertyValue("background-color");
    let [r,g,b] = /\(([^]+)\)/.exec(colorInRgb)[1].split(",");
    return {r:Number(r),g:Number(g),b:Number(b)};
}

//NOS PREGUNTA SI QUEREMOS GUARDAR LOS CAMBIOS EN LA IMAGEN
function askSaveBeforeOutToHome (outOrSave,tool) {
  const modalHTML = modalAskSave(tool);
  insertModalInApp(modalHTML);
  
  const modalElement = $(".modalAskSave");
  
  const clickModal = (e) => {
    let button = e.target.id
    if (button === "cancel") {
      removeElementOfDom(modalElement);
      notShowModalSaveChangeAgain = false;
    }
    else if (button === "discard") {
      removeElementOfDom(modalElement);
      goHomeAplication(outOrSave);
    }
    else if (button === "parent") {
      removeElementOfDom(e.target);
    }
  }
  
  modalElement.onclick = clickModal;
  
  modalElement.querySelector("#checkbox").onchange = e => {
    if (e.target.checked) notShowModalSaveChangeAgain = true
    ;else notShowModalSaveChangeAgain = false;
  }
}

//VUELVE ATRAS DEPEMDIENDO DEL LUGAR EN EL QUE NOS ENCONTREMOS EN EL MODO PIXEL
function goBackInToolPixel (outOrSave) {
  if ($(".pixel-tool")) {
    removeToolsPixel();
  }
  else {
    if (!$buttonSave.disabled && outOrSave === "out" && !notShowModalSaveChangeAgain) {
      askSaveBeforeOutToHome("out","Pixel");
    }
    else goHomeAplication(outOrSave);
  }
}

function setInLocalStorageValuesOfToolPixel () {
  const {penzil,zoom,eraser,color} = toolSelected;
  
  localStorage.setItem("zoomOfPixel",zoom)
  localStorage.setItem("colorOfPixel",color)
  localStorage.setItem("penzilOfPixel",penzil)
  localStorage.setItem("eraserOfPixel",eraser);
}

//VOLVEMOS AL INICIO DE LA APLICACION
function goHomeAplication (outOrSave) {
  if (toolSelected.toolName === "pixel") {
    $toolsDown.removeChild($toolsDown.lastElementChild);
    
    $canvas.onclick = null;
    
    let imgDataOriginal = toolSelected.layers.layers[0][0];
    
    if (outOrSave === "out") putImageDataCorrectlyInCanvas(imgDataOriginal);
    
    setInLocalStorageValuesOfToolPixel();
  }
  else if (toolSelected.toolName === "crop") {
    $(".crop-tool").remove();
    if (outOrSave === "out") {
      $(".img .grid").remove();
      $(".img .curtain-crop").remove();
      $(".aplication .info-current-size-crop").remove();
    }
  }
  else if (toolSelected.toolName === "draw") {
    
    closeSettingShapeInCanvas();
    
    $(".draw-tool").remove();
    $(".options-tool-draw")?.remove();
    
    $(".img .mode-of-paint")?.remove();
    
    addOrRemoveEventElement("removeEventListener","touchstart",touchesCanvas,$canvas);
    addOrRemoveEventElement("removeEventListener","touchmove",touchesCanvas,$canvas);
    addOrRemoveEventElement("removeEventListener","touchend",touchesCanvas,$canvas);
    
    removeAndHideCirclesOfLassoTool();
    
    if (outOrSave === "out") putImageDataCorrectlyInCanvas(toolSelected.layer.layers[0]);
    
    setDataCurrentOfDrawInLOCALSTORAGE();
  }
  
  $buttonSave.querySelector("img").src = "./icons-svg/download-svgrepo-com.svg";
  
  hideOrShowButtonOutToMainAplication("hide");
  
  disableOrEnableButtonSaveChange("enable")
  
  changePaddingToolDown("2px 2px 6px 2px");
  hideOrShowTools($toolsDown,"show");
  
  toolSelected = null;
}

function putImageDataCorrectlyInCanvas (DATAIMG) {
  $canvas.width = DATAIMG.width;
  $canvas.height = DATAIMG.height;
  
  putImageData(DATAIMG);
}

function setDataCurrentOfDrawInLOCALSTORAGE () {
  localStorage.setItem("optionsPositioningSHAPE",JSON.stringify(toolSelected.optionsPositioningSHAPE));
  localStorage.setItem("valuesSettingRoundBorderSHAPESQUAREInDRAW",JSON.stringify(toolSelected.valuesSettingRoundBorderSHAPESQUARE));
}

//AGREGA LAS COMAS NECESARIAS DEPENDIENDO DEL VALOR
function addComasSize (size) {
  return size.toString().split("").reverse().map((num,i)=>{
    if ((i % 3) === 0 && i !== 0) {
      return `${num},`
    } else {return num}
  }).reverse().join("");
}

//OBTIENE EL VALOR EN KB O MB O GB DE EL TAMAÑO DE El ARCHIVO
const sizeExtension = ["KB","MB","GB"];

function getSizeCorrect (size,indexExtension = 0) {
  
  if (indexExtension === 0) size /= 1000;
  
  if (size >= 1024) {
    return getSizeCorrect(size / 1024,indexExtension + 1);
  }
  
  return {size,extension:sizeExtension[indexExtension]};
}

//REGISTRA LAS PROPIEDADES DE LA IMAGEN
function setInfoImg (file,{width,height}) {
  let {size,extension} = getSizeCorrect(file.size),
  sizeInKB = addComasSize(file.size);
  
  let time = new Date (file.lastModified);
  
  let timeToString = `${time.toDateString()} ${time.toLocaleTimeString()}`;
  
  informationIMG = {
    name:file.name.split(".")[0],
    type:file.type,
    size:`${size.toFixed(2)} ${extension} / ${sizeInKB}`,
    time:timeToString,
    imgSize:`${width} × ${height}`
  }
}

function showModalFigures (OPTION,SHOWMODALTOEDIT) {
  let modalHTML = toolSelected.htmlChildren.modalFiguresOptionsHTML.modal,
  optionHTML;
  
  if (OPTION === "SHAPE") optionHTML = toolSelected.htmlChildren.modalFiguresOptionsHTML.shape;
  else if (OPTION === "SHADOW") optionHTML = toolSelected.htmlChildren.modalFiguresOptionsHTML.shadow;
  else if (OPTION === "FILL" || OPTION === "OUTLINE") optionHTML = toolSelected.htmlChildren.modalFiguresOptionsHTML.toolsOutlineFill;
  
  $aplication.insertAdjacentHTML("beforeend",modalHTML);
  
  const $containerOption = $(".aplication .figures-modal .container-options"),
  $menuOptions = $(".aplication .figures-modal .options"),
  $OPTIONSELECTED = $menuOptions.querySelector(`#${OPTION.toLowerCase()}`);
  
  $OPTIONSELECTED.classList.add("color-white-low");
  
  let {width,x} = $OPTIONSELECTED.getBoundingClientRect(),
  left = x - $OPTIONSELECTED.parentElement.getBoundingClientRect().x;
  
  setPropertyElement($menuOptions,"--leftScroll",`${left}px`);
  setPropertyElement($menuOptions,"--widthScroll",`${width}px`);
  
  $containerOption.innerHTML = optionHTML;
  
  $containerOption.querySelectorAll("input[type='range']").forEach(input=>{
    input.ontouchstart = touchInputRange
    input.ontouchmove = touchInputRange;
    input.ontouchend = touchInputRange;
  })
  
  const $MODALFIGURES = $(".aplication .figures-modal");
  
  $MODALFIGURES.onclick = clickedModalFigures;
  
  if (!SHOWMODALTOEDIT) getValuesCurrentInModalFigures();
  else {
    $MODALFIGURES.setAttribute("data-superposition",JSON.stringify(toolSelected.lastSuperpositionSelectedInModalFigures));
  }
  
  const {ALLTYPESLINE} = toolSelected.modalFigures;
  
  const {borderRoundActived} = toolSelected.valuesSettingThicknessSHAPELINE;
  
  ALLTYPESLINE.valueCheckboxPrevious = borderRoundActived;
  
  setValuesInOptionSelectedModalFigures(OPTION.toLowerCase());
  
  changeSelectedOfShape();
  changeGradientCONTAINER("FILL");
  changeGradientCONTAINER("OUTLINE");
  
  toolSelected.modalFigures["MARKGLOBAL"] = $(".figures-modal > div > .marker-value");
}

function showOrHideShapeCentral () {
  const {buttonsActived} = toolSelected.modalFigures.FILL;
  
  const ALLSHADOWS = $$(".figures-modal .preview-shape svg .shadow-SVG");
  
  $$(".figures-modal .preview-shape svg .shape-SVG.fill").forEach(($SHAPE,index)=>{
    const $SHADOW = ALLSHADOWS[index];
    
    if (!buttonsActived) {
      $SHAPE.setAttribute("fill","transparent");
      $SHADOW.setAttribute("fill","transparent");
    }
    else {
      const {color} = toolSelected.modalFigures.SHADOW;
    
      $SHAPE.setAttribute("fill","url(#gradientForFill)")
      $SHADOW.setAttribute("fill",color);
    }
  })
}

function adjustInButtonTheShapeOfTypeLineSelect ($SVGCOPY) {
  let widthMax = 105;
  
  const $shapes = [...$SVGCOPY.children];
  
  let deleteShape = false;
  
  if (Number($shapes[0].getAttribute("width")) > widthMax) $shapes[0].setAttribute("width",`${widthMax}`);
  else for (let index=0;index < $shapes.length;index++) {
    const $shape = $shapes[index];
    
    if (deleteShape) {
      $shape.remove();
      continue;
    }
    
    let nodeName = $shape.nodeName;
    
    let widthCurrent;
    
    if (nodeName === "circle") widthCurrent = Number($shape.getAttribute("cx")) + Number($shape.getAttribute("r"))
    else widthCurrent = Number($shape.getAttribute("x")) + Number($shape.getAttribute("width"));
    
    if (widthCurrent > widthMax) {
      $shape.remove();
      deleteShape = true;
    }
  }
  
  const $lastShape = $SVGCOPY.lastElementChild;
  
  let widthForApplySVG;
  
  if ($lastShape.nodeName === "circle") widthForApplySVG = Number($lastShape.getAttribute("cx")) + Number($lastShape.getAttribute("r"));
  else widthForApplySVG = Number($lastShape.getAttribute("x")) + Number($lastShape.getAttribute("width"));
  
  setPropertyElement($SVGCOPY,"width",widthForApplySVG + "px");
}

function clickedModalFigures ({target}) {
  const idNode = target.id;
  let $typesOutline,
  $angleGradient,
  $opacityInput;
  
  const removeModalBlurShapes = () => {
    const $modal = $(".figures-modal > div .modal-blur"),
    {MARKGLOBAL} = toolSelected.modalFigures;
    
    let hideName;
    if ($(".figures-modal .modal-blur .name-hardness.hide")) {
      clearTimeout(toolSelected.modalFigures.idSetTimeOuts["hardnesssetTimeout"]);
      hideName = true;
      MARKGLOBAL.classList.add("opacity-0");
    } else { hideName = false }
    
    if (hideName) {
      MARKGLOBAL.classList.add("hide");
      MARKGLOBAL.classList.remove("opacity-0");
    }
    
    $modal.remove();
  }
  
  if (($typesOutline = $(".figures-modal .footer-container .container-types-line"))?.classList.contains("scaleY-1") && !target.dataset.intominimodal && !target.classList.contains("container-types-line")) {
    $typesOutline.classList.remove("scaleY-1");
    return;
  }
  else if (($angleGradient = $(".figures-modal .center-container .angle-gradient-range"))?.classList.contains("scaleY-1") && !target.dataset.intominimodal && !target.classList.contains("angle-gradient-range")) {
    let $name = $angleGradient.querySelector(".name-gradient"),
    $subtract = $name.nextElementSibling,
    $add = $subtract.nextElementSibling;
    
    if (!$name.classList.contains("hide")) {
      $angleGradient.classList.remove("scaleY-1");
      return;
    }
    
    toolSelected.modalFigures.MARKGLOBAL.classList.add("hide");
    $angleGradient.classList.remove("scaleY-1");
    
    $name = "." + $name.classList[0];
    $subtract = "." + $subtract.classList[0];
    $add = "." + $add.classList[0];
    
    let idTimeOut = $name.split("-")[1] + "setTimeout";
    clearTimeout(toolSelected.modalFigures.idSetTimeOuts[idTimeOut]);
    
    $angleGradient.addEventListener("transitionend",()=>{
      showOrHideButtons($name,$add,$subtract);
    },{once:true});
    return;
  }
  else if (($opacityInput = $(".figures-modal .footer-container .opacity-range-container"))?.classList.contains("scaleY-1") && !target.dataset.intominimodal && !target.classList.contains("opacity-range-container")) {
    let $name = $opacityInput.querySelector(".name-opacity"),
    $subtract = $name.nextElementSibling,
    $add = $subtract.nextElementSibling;
    
    if (!$name.classList.contains("hide")) {
      $opacityInput.classList.remove("scaleY-1");
      return;
    }
    
    toolSelected.modalFigures.MARKGLOBAL.classList.add("hide");
    $opacityInput.classList.remove("scaleY-1");
    
    $name = "." + $name.classList[0];
    $subtract = "." + $subtract.classList[0];
    $add = "." + $add.classList[0];
    
    let idTimeOut = $name.split("-")[1] + "setTimeout";
    clearTimeout(toolSelected.modalFigures.idSetTimeOuts[idTimeOut]);
    
    $opacityInput.addEventListener("transitionend",()=>{
      showOrHideButtons($name,$add,$subtract);
    },{once:true});
    
    return;
  }
  else if (target.classList.contains("modal-blur")) {
    removeModalBlurShapes()
    return;
  }
  
  if (idNode === "shape" || idNode === "fill" || idNode === "outline" || idNode === "shadow") {
    let left = getLeftScroll(target);
    const $menuOption = target.parentElement;
    
    setPropertyElement($menuOption,"--widthScroll",`${target.getBoundingClientRect()["width"]}px`);
    setPropertyElement($menuOption,"--leftScroll",`${left}px`);
    
    if (!target.classList.contains("color-white-low")) {
      $(".aplication .figures-modal .options button.color-white-low").classList.remove("color-white-low");
      target.classList.add("color-white-low");
    }
    
    if (toolSelected.modalFigures.OPTION === "SHADOW" && idNode !== "shadow") {
      toolSelected.modalFigures.MARKGLOBAL.classList.add("hide")
      ;if ($(".figures-modal .tool-shadow .name-distance.hide")) {
        clearTimeout(toolSelected.modalFigures.idSetTimeOuts["distancesetTimeout"]);
        showOrHideButtons(".name-distance",".add-distance",".subtract-distance");
      }
      if ($(".figures-modal .tool-shadow .name-angle.hide")) {
        clearTimeout(toolSelected.modalFigures.idSetTimeOuts["anglesetTimeout"]);
        showOrHideButtons(".name-angle",".add-angle",".subtract-angle");
      }
      if ($(".figures-modal .tool-shadow .name-blur.hide")) {
        clearTimeout(toolSelected.modalFigures.idSetTimeOuts["blursetTimeout"]);
        showOrHideButtons(".name-blur",".add-blur",".subtract-blur");
      }
    }
    else if (toolSelected.modalFigures.OPTION === "OUTLINE" && idNode !== "outline") {
      toolSelected.modalFigures.MARKGLOBAL.classList.add("hide");
      
      if ($(".figures-modal .tool-fill-outline .name-size.hide")) {
        clearTimeout(toolSelected.modalFigures.idSetTimeOuts["sizesetTimeout"]);
        showOrHideButtons(".name-size",".add-size",".subtract-size");
      }
    }
    
    toolSelected.modalFigures.OPTION = idNode.toUpperCase();
  }
  
  const getClientXMarkerDependingValueCurrentInput = (left,value,name)=>{
    let clientX;
    
    if (name.includes("opacity")) clientX = (left + 7) + (value * 0.99);
    else if (name.includes("gradient") || name.includes("angle")) clientX = (left + 7) + (value * 0.70);
    else if (name.includes("distance") || name.includes("size") || name.includes("blur")) clientX = (left + 7) + (value * 2.52);
    else if (name.includes("hardness")) clientX = (left + 7) + (value * 2.47);
    
    return clientX;
  }
  
  if (idNode === "shape" && !$(".figures-modal .container-options > .tool-shapes")) {
    let {shape} = toolSelected.htmlChildren.modalFiguresOptionsHTML;
    
    $(".figures-modal .container-options").innerHTML = shape;
    
    setValuesInOptionSelectedModalFigures(idNode);
  }
  else if (idNode === "fill" || idNode === "outline") {
    let {toolsOutlineFill} = toolSelected.htmlChildren.modalFiguresOptionsHTML
    
    if (!$(".figures-modal .container-options > .tool-fill-outline")) {
      $(".figures-modal .container-options").innerHTML = toolsOutlineFill;
      $$(".figures-modal .container-options input[type='range']").forEach(input=>{
        input.ontouchstart = touchInputRange;
        input.ontouchmove = touchInputRange
        input.ontouchend = touchInputRange;
      })
    }
    
    setValuesInOptionSelectedModalFigures(idNode);
  }
  else if (idNode === "shadow" && !$(".figures-modal .container-options > .tool-shadow")) {
    let {shadow} = toolSelected.htmlChildren.modalFiguresOptionsHTML;
    
    $(".figures-modal .container-options").innerHTML = shadow;
    $$(".figures-modal .container-options input[type='range']").forEach(input=>{
      input.ontouchstart = touchInputRange;
      input.ontouchmove = touchInputRange;
      input.ontouchend = touchInputRange;
    })
    
    setValuesInOptionSelectedModalFigures(idNode);
  }
  else if (idNode === "types-line") {
    $(".figures-modal .footer-container .container-types-line").classList.add("scaleY-1");
  }
  else if (idNode.startsWith("line") && target.dataset.intominimodal) {
    const $PARENT = target.parentElement;
    
    toolSelected.modalFigures.ALLTYPESLINE.typeLineSelectedPrevious = idNode
    
    $PARENT.querySelector("button.tool-selected").classList.remove("tool-selected");
    
    target.classList.add("tool-selected");
    
    const $BTYPESLINE = $(".figures-modal .footer-container #types-line");
    
    const $SVGTYPELINESELECTEDCLONE = target.querySelector("svg").cloneNode(true);
    
    adjustInButtonTheShapeOfTypeLineSelect($SVGTYPELINESELECTEDCLONE);
    
    $BTYPESLINE.innerHTML = "";
    
    $BTYPESLINE.appendChild($SVGTYPELINESELECTEDCLONE);
    
    changeSelectedOfShape();
  }
  else if (idNode === "on-off-buttons") {
    let enableOrDisabled,value;
    if (target.innerText === "On") {
      target.innerText = "Off";
      target.classList.remove("tool-selected");
      enableOrDisabled = "disabled";
      value = false;
    } else {
      target.innerText = "On";
      target.classList.add("tool-selected");
      enableOrDisabled = "enable";
      value = true;
    }
    
    toolSelected.modalFigures["FILL"].buttonsActived = value;
    
    enableOrDisabledButtons(enableOrDisabled,
    [$(".figures-modal .top-container #change-type-colors"),
    $(".figures-modal .top-container #color-top"),
    $(".figures-modal .top-container #color-bottom"),
    $(".figures-modal .top-container #mode-gradient"),
    $(".figures-modal .center-container #angle-gradient"),
    $(".figures-modal .center-container #blur"),
    $(".figures-modal .top-container #degrees-gradient-top"),
    $(".figures-modal .top-container #gradient-white-black"),
     $(".figures-modal .top-container .matchOrinput")
    ]);
    
    showOrHideShapeCentral();
  }
  else if (idNode === "angle-gradient") {
    $(".figures-modal .center-container .angle-gradient-range").classList.add("scaleY-1");
  }
  else if (idNode === "opacity") {
    $(".figures-modal .footer-container .opacity-range-container").classList.add("scaleY-1");
  }
  else if (idNode === "change-type-colors") {
    let typeColors;
    const $containerColorTop = $(".figures-modal .top-container .container-color #color-top"),
    $containerColorBottom = $containerColorTop.nextElementSibling
    ,$buttonMatchOrShowInput = $(".figures-modal .top-container .matchOrinput"),$ICONBUTTONMATCHORINPUT = $buttonMatchOrShowInput.firstElementChild;
    
    target.classList.toggle("tool-selected");
    
    let OPTIONSELECTED = toolSelected.modalFigures["OPTION"];
    
    if (!$containerColorTop.classList.contains("hide")) {
      typeColors = "color-definite";
      
      $containerColorTop.classList.add("hide");
      $containerColorBottom.classList.add("hide");
      
      $containerColorBottom.nextElementSibling.classList.remove("hide");
      
      $buttonMatchOrShowInput.setAttribute("id","show-input-degrees");
      
      $ICONBUTTONMATCHORINPUT.src = "./icons-svg/quarter-circle.svg";
      $ICONBUTTONMATCHORINPUT.alt = "input"
    }
    else {
      typeColors = "color-customizable";
      
      $containerColorTop.classList.remove("hide");
      $containerColorBottom.classList.remove("hide");
      
      $containerColorBottom.nextElementSibling.classList.add("hide");
      $containerColorBottom.nextElementSibling.nextElementSibling.classList.add("hide");
      
      $buttonMatchOrShowInput.setAttribute("id","match-color");
      
      $ICONBUTTONMATCHORINPUT.src = "./icons-svg/equal-svgrepo-com.svg";
      $ICONBUTTONMATCHORINPUT.alt = "match"
      
      $buttonMatchOrShowInput.classList.remove("tool-selected");
      
      toolSelected.modalFigures[OPTIONSELECTED].colorDefiniteInputRangeActived = false;
    }
    
    toolSelected.modalFigures[OPTIONSELECTED].typeColorsGradient = typeColors;
    
    changeGradientCONTAINER(OPTIONSELECTED)
  }
  else if (idNode === "color-top" || idNode === "color-bottom" || idNode === "color-shadow") {
    let $inputColor,
    optionCurrent = toolSelected.modalFigures.OPTION,
    colorCurrent;
    
    if (optionCurrent === "SHADOW") colorCurrent = toolSelected.modalFigures[optionCurrent].color;
    else colorCurrent = toolSelected.modalFigures[optionCurrent][idNode === "color-top" ? "colorTopGradient" : "colorBottomGradient"];
    
    if (!($inputColor = $(".figures-modal > #input-color"))) {
      const HTMLINPUTCOLOR = `<input type="color" id="input-color">`;
      $(".figures-modal").insertAdjacentHTML("beforeend",HTMLINPUTCOLOR);
      
      const $input = $(".figures-modal > #input-color");
      
      $input.value = colorCurrent;
      
      $input.setAttribute("data-idcontainerchangecolor",idNode)
      
      setTimeout(()=>{$input.click()},0);
      
      $input.onchange = changeColorContainer;
    }
    else {
      $inputColor.setAttribute("data-idcontainerchangecolor",idNode);
      $inputColor.value = colorCurrent;
      $inputColor.click();
    }
  }
  else if (idNode === "blur") {
    const HTMLMODALBLUR = toolSelected.htmlChildren.modalFiguresOptionsHTML.hardnessModal,
    {OPTION} = toolSelected.modalFigures;
    
    if (OPTION === "OUTLINE") {
      toolSelected.modalFigures.MARKGLOBAL.classList.add("hide");
      
      if ($(".figures-modal .tool-fill-outline .name-size.hide")) {
        clearTimeout(toolSelected.modalFigures.idSetTimeOuts["sizesetTimeout"]);
        showOrHideButtons(".name-size",".add-size",".subtract-size");
      }
    }
    
    $(".figures-modal > div").insertAdjacentHTML("beforeend",HTMLMODALBLUR);
    
    const $modalHardness = $(".figures-modal > div .modal-blur"),
    $inputHardness = $modalHardness.querySelector("#hardness-range"),
    {hardness} = toolSelected.modalFigures[OPTION];
    
    $inputHardness.value = hardness;
    
    $inputHardness.ontouchstart = touchInputRange;
    $inputHardness.ontouchmove = touchInputRange;
    $inputHardness.ontouchend = touchInputRange;
    
    let blurCircle = 30 - ((30 * hardness) / 100);
    setPropertyElement($modalHardness,"--blurCircle",blurCircle + "px");
  }
  else if (idNode === "cancel-modalHARDNESS" || idNode === "apply-modalHARDNESS") {
    if (idNode.startsWith("apply")) {
      const $inputHardness = $(".figures-modal .modal-blur #hardness-range"),{OPTION} = toolSelected.modalFigures;
    
      toolSelected.modalFigures[OPTION]["hardness"] = $inputHardness.valueAsNumber;
      
      updateHARDNESSSHAPE(OPTION);
    }
    
    removeModalBlurShapes();
  }
  else if (target.parentElement.classList.contains("tool-shapes") || target.parentElement.parentElement.classList.contains("tool-shapes")) {
    $(".figures-modal .tool-shapes button.tool-selected").classList.remove("tool-selected");
    
    let figureId;
    if (target.parentElement.classList.contains("tool-shapes")) {
      target.classList.add("tool-selected");
      figureId = target.id;
    }
    else {
      target.parentElement.classList.add("tool-selected");
      figureId = target.parentElement.id
    }
    
    toolSelected.modalFigures["SHAPE"]["idshape"] = figureId;
    
    changeSelectedOfShape();
  }
  else if (idNode === "match-color") {
    const {OPTION} = toolSelected.modalFigures,
    {colorTopGradient} = toolSelected.modalFigures[OPTION];
    changeColorContainer({target:{dataset:{idcontainerchangecolor:"color-bottom"},value:colorTopGradient}});
  }
  else if (idNode === "show-input-degrees") {
    const INPUTGRADIENT = target.previousElementSibling.lastElementChild,
    {OPTION} = toolSelected.modalFigures;
    let methodInput,methodGradientBW;
    
    if (INPUTGRADIENT.classList.contains("hide")) {
      methodInput = "remove";
      methodGradientBW = "add";
      toolSelected.modalFigures[OPTION].colorDefiniteInputRangeActived = true;
    }
    else {
      methodInput = "add";
      methodGradientBW = "remove";
      toolSelected.modalFigures[OPTION].colorDefiniteInputRangeActived = false;
    }
    
    INPUTGRADIENT.previousElementSibling.classList[methodGradientBW]("hide");
    INPUTGRADIENT.classList[methodInput]("hide");
    
    target.classList[methodGradientBW]("tool-selected");
  }
  else if (idNode === "reset-setting") {
    toolSelected.modalFigures["SHADOW"].blur = 0;
    toolSelected.modalFigures["SHADOW"].distance = 0;
    
    const $inputDistance = $(".figures-modal .tool-shadow #range-distance"),$inputBlur = $(".figures-modal .tool-shadow #range-blur");
    
    $inputDistance.value = 0;
    $inputBlur.value = 0;
    
     const {MARKGLOBAL} = toolSelected.modalFigures;
    
    if (!MARKGLOBAL.innerText.includes("°")) {
      let newClientXMarker = getClientXMarkerDependingValueCurrentInput($inputDistance.getBoundingClientRect().x,0,"distance");
    
      //25 es para ajustar el elemento MARKGLOBAL;
      
      setPropertyElement(MARKGLOBAL,"left",`${newClientXMarker - MARKGLOBAL.parentElement.getBoundingClientRect().x - 25}px`);
      
      MARKGLOBAL.innerText = "0%";
    }
    
    updateSHADOW();
  }
  else if (target.classList[0]?.includes("name-")) {
    const name = "." + target.classList[0],
    subtract = "." + target.nextElementSibling.classList[0],
    add = "." + target.nextElementSibling.nextElementSibling.classList[0],
    $INPUT = target.parentElement.nextElementSibling;
    
    const {left} = $INPUT.getBoundingClientRect(),
    value = $INPUT.valueAsNumber;
    
    let idTimeOut = name.split("-")[1] + "setTimeout";
    
    let clientX = getClientXMarkerDependingValueCurrentInput(left,value,name);
    
    registerTimeOutHideButtons(name,add,subtract,idTimeOut);
    
    showOrHideButtons(name,add,subtract);
    
    touchInputRange({
      target:$INPUT,
      type:"touchstart",
      touches:[{clientX}],
      manual:true,
      preventDefault:()=>{}
    });
  }
  else if (target.classList[0]?.includes("subtract-") || target.classList[0]?.includes("add-")) {
    const $parentButtons = target.parentElement,
    name = "." + $parentButtons.firstElementChild.classList[0],
    subtract = "." + $parentButtons.children[1].classList[0],
    add = "." + $parentButtons.lastElementChild.classList[0],
    $INPUT = $parentButtons.nextElementSibling,
    method = target.className.includes("add") ? "add" : "subtract",
    {MARKGLOBAL} = toolSelected.modalFigures,
    {topMarker} = getTopMarkAndMeasureDependingInput($INPUT);
    
    let idTimeOut = name.split("-")[1] + "setTimeout";
    clearTimeout(toolSelected.modalFigures.idSetTimeOuts[idTimeOut]);
    
    registerTimeOutHideButtons(name,add,subtract,idTimeOut);
    
    $INPUT.value = method === "add" ? $INPUT.valueAsNumber + 1 : $INPUT.valueAsNumber - 1;
    
    const {left} = $INPUT.getBoundingClientRect(),
    value = $INPUT.valueAsNumber;
    
    let clientX = getClientXMarkerDependingValueCurrentInput(left,value,name);
    
    if (topMarker !== getPropertyValueElement("top",MARKGLOBAL)) setPropertyElement(MARKGLOBAL,"top",`${topMarker}px`);
    
    touchInputRange({
      target:$INPUT,
      type:"touchmove",
      touches:[{clientX}],
      manual:true,
      preventDefault:()=>{}
    });
  }
  else if (idNode === "gradient-white-black") {
    const {modalAdjustGradientBlackWhite} = toolSelected.htmlChildren.modalFiguresOptionsHTML,
    {OPTION} = toolSelected.modalFigures,
    {colorsGradientCurrent} = toolSelected.modalFigures[OPTION];
    
    $(".figures-modal > div").insertAdjacentHTML("beforeend",modalAdjustGradientBlackWhite);
    
    toolSelected.modalFigures[OPTION].colorsGradient = structuredClone(colorsGradientCurrent);
    
    showModeSelectedInModalAdjustGradient();
  }
  else if (idNode === "cancel-modal-adjust-gradient-black-white") {
    removeElementOfDom($(".figures-modal .modal-adjust-gradient-black-white"));
  }
  else if (idNode === "apply-modal-adjust-gradient-black-white") {
    const {OPTION} = toolSelected.modalFigures,
    {colorsGradient} = toolSelected.modalFigures[OPTION],
    {MODESELECTED} = toolSelected.modalFigures.MODALADJUSTGRADIENT,
    $gradientBUTTTON = $(".figures-modal .tool-fill-outline .top-container .container-color #gradient-white-black");
    
    toolSelected.modalFigures[OPTION].colorsGradientCurrent = structuredClone(colorsGradient);
    
    let $gradientPreview;
    if (MODESELECTED === "GRADIENT") $gradientPreview = $(".figures-modal .modal-adjust-gradient-black-white main .children-center .preview-gradient");
    else $gradientPreview = $(".figures-modal .modal-adjust-gradient-black-white main .top-container-favorites .current-gradient");
    
    setPropertyElement($gradientBUTTTON,"background-image",getComputedStyle($gradientPreview).getPropertyValue("background-image"));
    
    changeGradientCONTAINER(OPTION);
    
    removeElementOfDom($(".figures-modal .modal-adjust-gradient-black-white"));
  }
  else if (idNode === "button-add-more-colors") {
    const HTMLINPUTCOLOR = `<input type="color" id="inputColor" class="hide">`;
    let $input;
    
    if (!($input = $(".figures-modal .modal-adjust-gradient-black-white > #inputColor"))) {
      $(".figures-modal .modal-adjust-gradient-black-white").insertAdjacentHTML("beforeend",HTMLINPUTCOLOR);
      
      $input = $(".figures-modal .modal-adjust-gradient-black-white > #inputColor");
      setTimeout(()=>{$input.click()},0);
      $input.onchange = changeColorInAddMoreColorsGradient;
    } else $input.click();
  } 
  else if (idNode === "GRADIENT" || idNode === "FAVORITES") {
    const {MODESELECTED} = toolSelected.modalFigures.MODALADJUSTGRADIENT;
    
    if (idNode !== MODESELECTED) {
      toolSelected.modalFigures.MODALADJUSTGRADIENT["MODESELECTED"] = idNode;
      showModeSelectedInModalAdjustGradient();
    }
  }
  else if (idNode === "add-as-favorite") {
    toolSelected.modalFigures.MODALADJUSTGRADIENT.MODESELECTED = "FAVORITES";
    
    const gradientCurrent = getComputedStyle($(".figures-modal .modal-adjust-gradient-black-white main .children-center .preview-gradient")).getPropertyValue("background-image");
    
    showModeSelectedInModalAdjustGradient();
    addGradientInContainerFAVORITES(gradientCurrent);
  }
  else if (target.classList.contains("gradient-favorite") && !target.classList.contains("order-gradient")) {
    if (target.classList.contains("remove")) {
      
      setPropertyElement(target,"transition","opacity 200ms linear");
      setTimeout(()=>{
        target.style.opacity = "0";
      },0);
      
      target.classList.remove("remove");
      
      target.ontransitionend = ()=>{
        target.remove();
      };
      
      const {POSITIONSFAVORITES} = toolSelected.modalFigures.MODALADJUSTGRADIENT
      ,indexGradient = Number(target.dataset.index),
      $containerGrandients = target.parentElement,
      {FAVORITESCOPY} = JSON.parse($containerGrandients.dataset.favoritescopy),
      {array} = JSON.parse($containerGrandients.dataset.arrayindexdelete),
      indexOriginalInFAVORITES = Number(target.dataset.indexinarrayfavorite);
      
      FAVORITESCOPY.splice(indexGradient,1);
      array.push(indexOriginalInFAVORITES);
      
      $containerGrandients.setAttribute("data-favoritescopy",JSON.stringify({FAVORITESCOPY}));
      $containerGrandients.setAttribute("data-arrayindexdelete",JSON.stringify({array}));
      
      ;for (let i = indexGradient + 1;;i++) {
        const indexBack = i - 1,
        {top,left} = POSITIONSFAVORITES[indexBack],
        $gradient = $(`.figures-modal .modal-adjust-gradient-black-white .modal-remove-gradient-favorite .container-gradients .gradient-favorite.remove[data-index='${i}'`);
        
        if (!$gradient) return;
        
        $gradient.setAttribute("data-index",indexBack);
        $gradient.classList.add("transition-left-top");
        
        setTimeout(()=>{
          setPropertyElement($gradient,"left",left + "px");
          setPropertyElement($gradient,"top",top + "px");
        },200);
      }
      return;
    }
    if (target.dataset.inremovegradient) return;
    
    const $showGradientCurrent = $(".figures-modal .modal-adjust-gradient-black-white main .top-container-favorites .current-gradient"),
    indexColorsGradientInFavorites = Number(target.dataset.index),
    {OPTION} = toolSelected.modalFigures,
    {FAVORITES} = toolSelected.modalFigures.MODALADJUSTGRADIENT,
    {gradient} = FAVORITES[indexColorsGradientInFavorites].at(-1),
    lastIndexItem = FAVORITES[indexColorsGradientInFavorites].length - 1;
    
    setPropertyElement($showGradientCurrent,"background-image",gradient);
    
    toolSelected.modalFigures[OPTION].colorsGradient = structuredClone(FAVORITES[indexColorsGradientInFavorites]).slice(0,lastIndexItem);
    
    $showGradientCurrent.setAttribute("data-indexgradientfavoriteselected",indexColorsGradientInFavorites);
  }
  else if (target.classList.contains("position-as-favorite")) {
    const $previewGradient = target.previousElementSibling,
    {FAVORITES,POSITIONSFAVORITES} = toolSelected.modalFigures.MODALADJUSTGRADIENT;
    
    let indexInFAVORITES = $previewGradient.dataset.indexgradientfavoriteselected;
    
    if (indexInFAVORITES) {
      indexInFAVORITES = Number(indexInFAVORITES);
      
      let colorsDelete = FAVORITES.splice(indexInFAVORITES,1);
      FAVORITES.unshift(colorsDelete[0]);
      
      const $gradientSelected = $(`.figures-modal .modal-adjust-gradient-black-white main .center-container-favorites .gradient-favorite[data-index='${indexInFAVORITES}'`),
      {top,left} = POSITIONSFAVORITES[0];
      
      for (let i=indexInFAVORITES - 1;i >= 0;i--) {
        moveGradientsFAVORITESWithTransition(i);
      }
      
      setPropertyElement($gradientSelected,"z-index",FAVORITES.length + 1);
      
      $gradientSelected.classList.add("transition-left-top");
      $gradientSelected.setAttribute("data-index",0);
      $previewGradient.setAttribute("data-indexgradientfavoriteselected",0);
      
      setTimeout(()=>{
      setPropertyElement($gradientSelected,"top",top + "px");
      setPropertyElement($gradientSelected,"left",left + "px");
      },100);
      
      setTimeout(()=>{
        setPropertyElement($gradientSelected,"z-index","1");
      },300);
    }
    else {
      const currentGradient = getComputedStyle($(".figures-modal .modal-adjust-gradient-black-white main .top-container-favorites .current-gradient")).getPropertyValue("background-image");
      addGradientInContainerFAVORITES(currentGradient);
    }
    
  }
  else if (idNode === "delete-gradient-favorites") {
    const {modalRemoveGradientFavorite,gradientFAVORITE} = toolSelected.htmlChildren.modalFiguresOptionsHTML,
    {FAVORITES,POSITIONSFAVORITES} = toolSelected.modalFigures.MODALADJUSTGRADIENT;
    
    $(".figures-modal .modal-adjust-gradient-black-white > div").insertAdjacentHTML("beforeend",modalRemoveGradientFavorite);
    
    const $modalRemoveGradient = $(".figures-modal .modal-adjust-gradient-black-white .modal-remove-gradient-favorite"),
    $containerGrandients = $modalRemoveGradient.querySelector(".container-gradients"),
    FAVORITESCOPY = structuredClone(FAVORITES);
    
    $containerGrandients.setAttribute("data-favoritescopy",JSON.stringify({FAVORITESCOPY}));
    $containerGrandients.setAttribute("data-arrayindexdelete",JSON.stringify({array:[]}));
    
    for (let i=0;i < FAVORITES.length;i++) {
      $containerGrandients.insertAdjacentHTML("beforeend",gradientFAVORITE);
      
      const $gradient = $containerGrandients.lastElementChild,
      {top,left} = POSITIONSFAVORITES[i];
      
      $gradient.classList.add("remove");
      
      $gradient.setAttribute("data-inremovegradient",true);
      $gradient.setAttribute("data-index",i);
      $gradient.setAttribute("data-indexinarrayfavorite",i);
      
      setPropertyElement($gradient,"background-image",FAVORITES[i].at(-1).gradient);
      setPropertyElement($gradient,"top",top + "px");
      setPropertyElement($gradient,"left",left + "px");
    }
    
    if (FAVORITES.length > 0) {
      //EL 42 ES EL ALTO DE UN CONTENEDOR GRADIENT FAVORITE
      let lastGradientFavoriteIndex = FAVORITES.length - 1,
      heightContainerGradientsRemove = POSITIONSFAVORITES[lastGradientFavoriteIndex].top + 42;
    
      setPropertyElement($containerGrandients,"height",heightContainerGradientsRemove + "px");
    }
  }
  else if (idNode === "cancel-remove-gradient") {
    const $modalRemoveGradient = target.parentElement.parentElement.parentElement;
    removeElementOfDom($modalRemoveGradient);
  }
  else if (idNode === "apply-remove-gradient") {
    const $containerGrandients = $(".figures-modal .modal-adjust-gradient-black-white .modal-remove-gradient-favorite .container-gradients"),
    {FAVORITESCOPY} = JSON.parse($containerGrandients.dataset.favoritescopy),
    {array} = JSON.parse($containerGrandients.dataset.arrayindexdelete),
    {POSITIONSFAVORITES} = toolSelected.modalFigures.MODALADJUSTGRADIENT,
    $previewGradientSelected = $(".figures-modal .modal-adjust-gradient-black-white main .top-container-favorites .current-gradient");
    
    let indexRegisterInPreviewGradient = Number($previewGradientSelected.dataset.indexgradientfavoriteselected);
    
    for (let index of array) {
      $(`.figures-modal .modal-adjust-gradient-black-white main .center-container-favorites .gradient-favorite[data-index='${index}']`).remove();
      
      if (indexRegisterInPreviewGradient === index) $previewGradientSelected.removeAttribute("data-indexgradientfavoriteselected");
    }
    
    if (array.length === 0) {
      const $modalRemoveGradient = target.parentElement.parentElement.parentElement;
      removeElementOfDom($modalRemoveGradient);
      return;
    }
    
    const orderAscGradientsInFAVORITES = Array.from($$(".figures-modal .modal-adjust-gradient-black-white main .center-container-favorites .gradient-favorite")).toSorted((a,b)=>{return Number(a.dataset.index) - Number(b.dataset.index)});
    
    orderAscGradientsInFAVORITES.forEach(($gradient,index)=>{
      const {top,left} = POSITIONSFAVORITES[index],
      indexBeforeChange = Number($gradient.dataset.index);
      
      $gradient.classList.remove("transition-left-top");
      
      if (indexRegisterInPreviewGradient === indexBeforeChange) $previewGradientSelected.setAttribute("data-indexgradientfavoriteselected",index);
      
      $gradient.setAttribute("data-index",index);
      
      setPropertyElement($gradient,"left",left + "px");
      setPropertyElement($gradient,"top",top + "px");
    })
    
    toolSelected.modalFigures.MODALADJUSTGRADIENT.FAVORITES = FAVORITESCOPY;
    
    const $modalRemoveGradient = target.parentElement.parentElement.parentElement;
    removeElementOfDom($modalRemoveGradient);
  }
  else if (idNode === "change-order-gradient-favorites") {
    const {modalOrderGradientsFavorites,containerParentOfGradientFavorite} = toolSelected.htmlChildren.modalFiguresOptionsHTML,
    {FAVORITES,POSITIONSFAVORITES} = toolSelected.modalFigures.MODALADJUSTGRADIENT;
    
    $(".figures-modal .modal-adjust-gradient-black-white > div").insertAdjacentHTML("beforeend",modalOrderGradientsFavorites);
    
    const $modalOrderGradients = $(".figures-modal .modal-adjust-gradient-black-white .modal-order-gradient-favorite"),
    $containersGradients = $modalOrderGradients.querySelector(".container-gradients");
    
    FAVORITES.forEach((gradientColors,i)=>{
      $containersGradients.insertAdjacentHTML("beforeend",containerParentOfGradientFavorite);
      
      const $lastContainerGradientFavorite = $containersGradients.lastElementChild;
      
      let {top,left} = POSITIONSFAVORITES[i],
      {gradient} = gradientColors.at(-1),
      indexRow;
      
      if ((i + 1) % 5 === 0) indexRow = ((i + 1) / 5) - 1;
      else indexRow = Math.floor((i + 1) / 5);
      
      top += (52 * indexRow);
      
      $lastContainerGradientFavorite.setAttribute("data-index",i);
      $lastContainerGradientFavorite.setAttribute("data-indexoriginal",i);
      
      setPropertyElement($lastContainerGradientFavorite.firstElementChild,"background-image",gradient);
      
      $lastContainerGradientFavorite.lastElementChild.ontouchstart = touchesButtonOrderGradients;
      $lastContainerGradientFavorite.lastElementChild.ontouchmove = touchesButtonOrderGradients;
      $lastContainerGradientFavorite.lastElementChild.ontouchend = touchesButtonOrderGradients;
      
      setPropertyElement($lastContainerGradientFavorite,"left",left + "px");
      setPropertyElement($lastContainerGradientFavorite,"top",top + "px");
      
      if (i === (FAVORITES.length - 1)) {
        const heightParentGradientFavorite = getPropertyValueElement("height",$lastContainerGradientFavorite);
        
        setPropertyElement($containersGradients,"height",`${heightParentGradientFavorite + top + 5}px`);
      }
    })
  }
  else if (idNode === "cancel-order-gradient") {
    removeElementOfDom($(".figures-modal .modal-adjust-gradient-black-white .modal-order-gradient-favorite"));
  }
  else if (idNode === "apply-order-gradient") {
    const {FAVORITES} = toolSelected.modalFigures.MODALADJUSTGRADIENT,
    NEWORDERFAVORITES = [],
    $containerPreviewGradient = $(".figures-modal .modal-adjust-gradient-black-white main .top-container-favorites .current-gradient"),
    indexGradientCurrentSelected = Number($containerPreviewGradient.dataset.indexgradientfavoriteselected);
    
    for (let i = 0;i < FAVORITES.length;i++) {
      const $containerOfGRADIENT = $(`.figures-modal .modal-adjust-gradient-black-white .modal-order-gradient-favorite .container-parent-gradient[data-index = '${i}']`),
      $gradientInFavorite = $(`.figures-modal .modal-adjust-gradient-black-white main .center-container-favorites .gradient-favorite[data-index = '${i}']`),
      indexORIGINAL = Number($containerOfGRADIENT.dataset.indexoriginal),
      gradient = FAVORITES[indexORIGINAL].at(-1).gradient;
      
      NEWORDERFAVORITES.push(FAVORITES[indexORIGINAL]);
      setPropertyElement($gradientInFavorite,"background-image",gradient);
      
      if (indexGradientCurrentSelected === indexORIGINAL) $containerPreviewGradient.setAttribute("data-indexgradientfavoriteselected",i);
    }
    
    toolSelected.modalFigures.MODALADJUSTGRADIENT.FAVORITES = NEWORDERFAVORITES;
    
    removeElementOfDom($(".figures-modal .modal-adjust-gradient-black-white .modal-order-gradient-favorite"));
  }
  else if (idNode === "superposition-shape") {
    const {superpositionOptionsModal} = toolSelected.htmlChildren,
    $FIGURESMODALDIV = $(".figures-modal > div"),
    HTMLCURTAIN =`<div class="curtain-in-figures-modal"></div>`,
    $FIGURESMODAL = $(".figures-modal"),
    {type} = JSON.parse($FIGURESMODAL.dataset.superposition);
    
    $FIGURESMODALDIV.insertAdjacentHTML("beforeend",HTMLCURTAIN);
    $aplication.insertAdjacentHTML("beforeend",superpositionOptionsModal);
    
    const $modalOptiosSuperposition = $(".aplication .modal-choose-superposition"),
    $curtainInFiguresModal = $(".figures-modal .curtain-in-figures-modal"),
    $containerCircleSelected = $(`.modal-choose-superposition .container-circle[data-value=${type}]`);
    
    setPropertyElement($containerCircleSelected,"--scaleCircle","1");
    setPropertyElement($containerCircleSelected,"--colorBorderContainer","#3097ff");
    
    $modalOptiosSuperposition.onclick = clickedModalSuperposition;
  }
  else if (idNode === "mode-gradient") {
    const {modalTypesGradient} = toolSelected.htmlChildren.modalFiguresOptionsHTML,
    {OPTION} = toolSelected.modalFigures
    ,{indexTypeGradientSelected,colorBottomGradient,colorTopGradient,modeGradient,degreesColorsGradient,valuesOfTypeGradient,colorsGradientCurrent} = toolSelected.modalFigures[OPTION];
   
    $(".figures-modal > div").insertAdjacentHTML("beforeend",modalTypesGradient);
   
    const $MODAL = $(".figures-modal .modal-select-mode-gradient");
    
    if (target.previousElementSibling.id === "match-color") {
      $MODAL.querySelectorAll(".container-gradient").forEach((container,index)=>{
      const {values} = JSON.parse(container.dataset.percentajes);
      
      container.setAttribute("data-index",index);
      
      let gradient = createGradient("linear","to top","#fff","#000",values);
      
      setPropertyElement(container.firstElementChild,"background-image",gradient);
    });
    
      const $containerGradientSelected = $(`.figures-modal .modal-select-mode-gradient .container-gradient[data-index='${indexTypeGradientSelected}']`);
      
      $containerGradientSelected.classList.add('tool-selected');
      
      const $previewGradientSelected = $containerGradientSelected.parentElement.previousElementSibling;
      
      setPropertyElement($previewGradientSelected,"background-image",createGradient(modeGradient,degreesColorsGradient,colorTopGradient,colorBottomGradient,valuesOfTypeGradient));
    } else {
      $MODAL.querySelector(".container-all-types-gradient").remove();
      setPropertyElement($MODAL,"--heightPreviewGradient",200 + "px");
      setPropertyElement($MODAL.querySelector(".preview-gradient-selected"),"background-image",joinColorsGradient([...colorsGradientCurrent],{direction:`${degreesColorsGradient}deg`,modeGradientSelected:modeGradient,deg:degreesColorsGradient}));
      
    }
    
    if (modeGradient === 'linear') $MODAL.querySelector(".options-in-type-gradient .linear-gradient").classList.add('tool-selected');
    else $MODAL.querySelector(".options-in-type-gradient .ellipse-gradient").classList.add('tool-selected');
    
    const $INPUTDEGREES = $MODAL.querySelector(".controls-deg #range-degrees-in-modal-types-gradient");
    
    $INPUTDEGREES.value = degreesColorsGradient;
    
    $INPUTDEGREES.ontouchstart = touchInputRange;
    $INPUTDEGREES.ontouchmove = touchInputRange;
    $INPUTDEGREES.ontouchend = touchInputRange;
  }
  else if (idNode === "type-gradient-definite") {
    const $containerTypeGradient = target,
    {OPTION} = toolSelected.modalFigures,
    {colorBottomGradient,colorTopGradient} = toolSelected.modalFigures[OPTION],
    modeGradientSelected = $(".figures-modal .modal-select-mode-gradient .options-in-type-gradient button.tool-selected").id.split("-").at(-1);
    
    $(".figures-modal .modal-select-mode-gradient .container-gradient.tool-selected").classList.remove('tool-selected');
    
    $containerTypeGradient.classList.add("tool-selected");
    
    let {values} = JSON.parse($containerTypeGradient.dataset.percentajes),
    {index} = $containerTypeGradient.dataset;
    
    index = Number(index);
    
    if (modeGradientSelected === "ellipse" && index >= 5 && index <= 14) {
      let indexBrother = index + 5 <= 14 ? index + 5 : index - 5;
      values = JSON.parse($(`.figures-modal .modal-select-mode-gradient .container-gradient[data-index = '${indexBrother}'`).dataset.percentajes).values;
    }
    
    let degCurrent = $(".figures-modal .modal-select-mode-gradient .controls-deg #range-degrees-in-modal-types-gradient").valueAsNumber,
    gradient = createGradient(modeGradientSelected,degCurrent,colorTopGradient,colorBottomGradient,values);
    
    setPropertyElement($containerTypeGradient.parentElement.previousElementSibling,"background-image",gradient);
  }
  else if (idNode === "apply-modal-type-gradient") {
    const $modalTypesGradient = $(".figures-modal .modal-select-mode-gradient"),
    $containerGradientSelected = $(".figures-modal .modal-select-mode-gradient .container-gradient.tool-selected"),
    $INPUTDEGREES = $modalTypesGradient.querySelector(".controls-deg #range-degrees-in-modal-types-gradient"),
    {OPTION,MARKGLOBAL} = toolSelected.modalFigures,
    newValueDegrees = $INPUTDEGREES.valueAsNumber,
    modeGradientSelected = $(".figures-modal .modal-select-mode-gradient .options-in-type-gradient button.tool-selected").id.split("-").at(-1);
    
    clearTimeout(toolSelected.modalFigures.idSetTimeOuts["deggradientinmodaltypestimeout"]);
    MARKGLOBAL.classList.add('hide');
    
    if ($containerGradientSelected) {
      let indexContainerGradient = Number($containerGradientSelected.dataset.index),{values} = JSON.parse($containerGradientSelected.dataset.percentajes);
      
      indexContainerGradient = Number(indexContainerGradient);
      
      if (modeGradientSelected === "ellipse" && indexContainerGradient >= 5 && indexContainerGradient <= 14) {
        let indexBrother = indexContainerGradient + 5 <= 14 ? indexContainerGradient + 5 : indexContainerGradient - 5;
      
        values = JSON.parse($(`.figures-modal .modal-select-mode-gradient .container-gradient[data-index = '${indexBrother}'`).dataset.percentajes).values;
      }
      
      toolSelected.modalFigures[OPTION].indexTypeGradientSelected = indexContainerGradient;
      toolSelected.modalFigures[OPTION].valuesOfTypeGradient = values;
      
      let gradientSelected = $containerGradientSelected.firstElementChild.style.getPropertyValue("background-image")
    
      setPropertyElement($(".tool-fill-outline .top-container #mode-gradient .gradient-selected"),"background-image",gradientSelected);
    
      toolSelected.modalFigures[OPTION].gradientSelected = gradientSelected;
    }
   
    toolSelected.modalFigures[OPTION].degreesColorsGradient = newValueDegrees;
    toolSelected.modalFigures[OPTION].modeGradient = modeGradientSelected;
    
    $(".figures-modal .tool-fill-outline .center-container .angle-gradient-range #degrees-gradient-center").value = newValueDegrees;
    $(".figures-modal .tool-fill-outline .top-container #degrees-gradient-top").value = newValueDegrees;
    
    changeGradientCONTAINER(OPTION);
    
    removeElementOfDom($modalTypesGradient);
  }
  else if (idNode === "cancel-modal-type-gradient") {
    const $modalTypesGradient = $(".figures-modal .modal-select-mode-gradient"),
    {MARKGLOBAL} = toolSelected.modalFigures
    
    ;removeElementOfDom($modalTypesGradient);
    
    clearTimeout(toolSelected.modalFigures.idSetTimeOuts["deggradientinmodaltypestimeout"]);
    MARKGLOBAL.classList.add('hide');
  }
  else if (idNode === "mode-gradient-linear" || idNode === "mode-gradient-ellipse") {
    $(".figures-modal .modal-select-mode-gradient .options-in-type-gradient button.tool-selected").classList.remove("tool-selected");
    target.classList.add("tool-selected");
    
    changeProperty($(".figures-modal .modal-select-mode-gradient .controls-deg #range-degrees-in-modal-types-gradient"));
  }
  else if (idNode === "less-deg-gradient" || idNode === "sum-deg-gradient") {
    const operation = idNode.split("-")[0],
    {MARKGLOBAL} = toolSelected.modalFigures
    ,$INPUT = target.parentElement.nextElementSibling,
    {topMarker} = getTopMarkAndMeasureDependingInput($INPUT),
    idTextInArray = idNode.split("-");
    
    let idTimeOut = idTextInArray.slice(1,idTextInArray.length).join("") + "inmodaltypestimeout";
    
    clearTimeout(toolSelected.modalFigures.idSetTimeOuts[idTimeOut]);
    
    toolSelected.modalFigures.idSetTimeOuts[idTimeOut] = setTimeout(()=>{
      MARKGLOBAL.classList.add("hide");
    },2000)
    
    $INPUT.value = operation === "sum" ? $INPUT.valueAsNumber + 1 : $INPUT.valueAsNumber - 1;
    
    const {left} = $INPUT.getBoundingClientRect(),
    value = $INPUT.valueAsNumber;
    
    let clientX;
    clientX = (left + 7) + (value * 0.66);
    
    if (topMarker !== getPropertyValueElement("top",MARKGLOBAL)) setPropertyElement(MARKGLOBAL,"top",`${topMarker}px`);
    
    touchInputRange({
      target:$INPUT,
      type:MARKGLOBAL.classList.contains("hide") ? "touchstart" : "touchmove",
      touches:[{clientX}],
      manual:true,
      preventDefault:()=>{}
    });
  }
  else if (idNode === "cancel-modal-figures" || idNode === "apply-modal-figures") {
    if (idNode.startsWith("apply") && !$(".container-tools-adjust-shape")) {
      $toolsDown.querySelector(".draw-tool").classList.add('hide');
      $toolsDown.querySelector(".options-tool-draw")?.classList.add("hide");
      
      $toolsDown.insertAdjacentHTML("beforeend",toolSelected.htmlChildren.toolsAdjustShape);
      
      $toolsDown.querySelector(".container-tools-adjust-shape").onclick = clickedToolsInAdjustShape;
    }
    
    delete toolSelected.modalFigures["MARKGLOBAL"];
    
    toolSelected.modalFigures["FILL"].colorDefiniteInputRangeActived = false;
    toolSelected.modalFigures["OUTLINE"].colorDefiniteInputRangeActived = false;
    
    Object.keys(toolSelected.modalFigures.idSetTimeOuts).forEach(idtimeout=>{clearTimeout(toolSelected.modalFigures.idSetTimeOuts[idtimeout])});
    
    const $MODALFIGURES = $(".aplication .figures-modal");
    
    localStorage.setItem("propertysInModalFiguresToolDraw",JSON.stringify(toolSelected.modalFigures));
    
    if (idNode.startsWith("apply")) {
      let mode = "modify";
      
      if (!$(".aplication .img .container-SHAPES-insert")) {
        const containerSHAPEINSERTHTML = toolSelected.htmlChildren.containerSHAPEINSERT,
        containerAdjustShapesHTML = toolSelected.htmlChildren.containerAdjustShapesInScreen
      
        $aplication.querySelector(".img").insertAdjacentHTML("beforeend",containerSHAPEINSERTHTML);
        $aplication.insertAdjacentHTML("beforeend",containerAdjustShapesHTML);
        
        mode = "insert";
      }
      
      showOrHideLastToolOfDrawSelected("hide");
      
      const $MAINCONTAINERSHAPE = $('.aplication .img .container-SHAPES-insert'),
      $CONTAINERADJUSTSHAPES = $('.aplication #square-adjust-SHAPES'),{idshape} = toolSelected.modalFigures.SHAPE;
      
      const $COPYSVGINPREVIEWSHAPE = $(".figures-modal .preview-shape svg").cloneNode(true),
      $SHAPESTROKE = $(".figures-modal .preview-shape svg .shape-SVG.stroke"),
      $SHAPEFILL = $(".figures-modal .preview-shape svg .shape-SVG.fill"),
      $SHADOWPREVIEWSVG = $(".figures-modal .preview-shape svg .shadow-SVG");
      
      const {
        valueCheckboxPrevious,
        valueInputPrevious,
        typeLineSelectedPrevious
      } = toolSelected.modalFigures.ALLTYPESLINE;
      
      const {ALLTYPESLINE} = toolSelected.modalFigures;
      
      ALLTYPESLINE.valueInput = valueInputPrevious;
      ALLTYPESLINE.typeLineSelected = typeLineSelectedPrevious;
     
      toolSelected.valuesSettingThicknessSHAPELINE.borderRoundActived = valueCheckboxPrevious;
      
      let shapePrevious = $MAINCONTAINERSHAPE.dataset.shapeprevious;
      
      let strokeWidth = Number($SHAPESTROKE.getAttribute("stroke-width") ?? 0);
      
      if ($SHAPEFILL.nodeName === "polygon" || idshape === "arrowIndicator") strokeWidth *= 2;
      
      let {xmovedshadow,ymovedshadow} = $SHAPEFILL.dataset;
      
      [xmovedshadow,ymovedshadow] = [Number(xmovedshadow),Number(ymovedshadow)];
      
      let blurShadow = $SHADOWPREVIEWSVG.style.getPropertyValue("filter");
      
      let blurShape = $SHAPEFILL.style.getPropertyValue("filter");
      
      let blurStroke = $SHAPESTROKE.style.getPropertyValue("filter");
      
      let findAmountPxBlur = /blur\((\d*\.?\d*)px\)/;
      
      let amountPxBlurShadow = Number(findAmountPxBlur.exec(blurShadow)[1]);
      
      let measuresSHAPESVG = $SHAPEFILL.getBoundingClientRect();
      
      let pxAddedForShadow = Math.max(Math.abs(xmovedshadow),Math.abs(ymovedshadow));
      
      const $ALLSHAPESFILL = $COPYSVGINPREVIEWSHAPE.querySelectorAll(".shape-SVG.fill"),
      $ALLSHAPESSTROKE = $COPYSVGINPREVIEWSHAPE.querySelectorAll(".shape-SVG.stroke"),
      $ALLSHADOWS = $COPYSVGINPREVIEWSHAPE.querySelectorAll(".shadow-SVG");
      
      if (idshape === "bubbleMessage") measuresSHAPESVG = {width:120,height:90};
      else if (idshape === "line") {
        let width = toolSelected.propsContainerAdjustShapes?.myLastWidth ?? getSizeBaseOfShape("line").widthOriginalShape;
        
        const {thicknessPX} = toolSelected.valuesSettingThicknessSHAPELINE;
        
        measuresSHAPESVG = {width,height:thicknessPX / 2}
      }
      else if (idshape === "arrowIndicator") {
        let heightArrowInThePreviewShape = 60;
        
        let percentageYShadowInHeightShape = (ymovedshadow * 100) / heightArrowInThePreviewShape,
        percentageXShadowInHeightShape = (xmovedshadow * 100) / heightArrowInThePreviewShape;
        
        if (!toolSelected.propsContainerAdjustShapes) toolSelected.propsContainerAdjustShapes = {};
        
        toolSelected.propsContainerAdjustShapes.percentageXShadowInHeightShape = percentageXShadowInHeightShape;
        toolSelected.propsContainerAdjustShapes.percentageYShadowInHeightShape = percentageYShadowInHeightShape;
      }
      else if (idshape === "text") {
        const $SVGINPREVIEWSHAPE = $(".aplication .figures-modal .preview-shape svg");
        
        const fontSizeCurrentInSVGPreview = Number($SVGINPREVIEWSHAPE.dataset.fontsizetexts);
        
        const {texts,fontFamily} = toolSelected.valuesSettingShapeText;
        
        let fontSizeCurrent = toolSelected.variablesShapeTextTemporal?.fontSize ?? 70,
        distanceBetweenYTexts = toolSelected.variablesShapeTextTemporal?.distanceYBetweenTexts ?? 0;
        
        let linesText = texts.trim() === "" ? ["Text"] : texts.trimEnd().split("\n");
        
        setPropertyElement($SVGINPREVIEWSHAPE,"--fontSizeTexts",`${fontSizeCurrent}px`);
        setPropertyElement($COPYSVGINPREVIEWSHAPE,"--fontSizeTexts",`${fontSizeCurrent}px`);
        
        $SVGINPREVIEWSHAPE.insertAdjacentHTML("beforeend",`<text class="text-for-get-measures visibility-hidden" dx="0" dy="0">Text</text>`);
        
        const $TEXTFORGETMEASURES = $SVGINPREVIEWSHAPE.querySelector(".text-for-get-measures");
        
        setFontFamilyTextSVG($TEXTFORGETMEASURES,fontFamily.type,fontFamily.name);
        
        let measuresOfReferenceText = $TEXTFORGETMEASURES.getBBox();
        
        $TEXTFORGETMEASURES.remove();
        
        const widthTextsAndXText = gitSizeWidthOfTextInSVG(linesText,linesText.length,$SVGINPREVIEWSHAPE,fontFamily.type,fontFamily.name);
        
        setPropertyElement($SVGINPREVIEWSHAPE,"--fontSizeTexts",`${fontSizeCurrentInSVGPreview}px`);
  
        let widthTextMoreLong = Math.max(...widthTextsAndXText.map(({width})=>{return width}));
        
        let amountFontSizeToApplyInFontOfPreviewShape = (fontSizeCurrent / fontSizeCurrentInSVGPreview);
        
        let strokeWidthAdjust = amountFontSizeToApplyInFontOfPreviewShape * strokeWidth,
        xMovedShadowAdjust = amountFontSizeToApplyInFontOfPreviewShape * xmovedshadow,
        yMovedShadowAdjust = amountFontSizeToApplyInFontOfPreviewShape * ymovedshadow;
        
        [xmovedshadow,ymovedshadow] = [xMovedShadowAdjust,yMovedShadowAdjust];
        
        pxAddedForShadow = Math.max(Math.abs(xmovedshadow),Math.abs(ymovedshadow));
        
        strokeWidth = strokeWidthAdjust;
        
        let percentageStrokeWidthInHeightText = (strokeWidth * 100) / measuresOfReferenceText.height,
        percentageXMovedShadowInHeightText = (xmovedshadow * 100) / measuresOfReferenceText.height,
        percentageYMovedShadowInHeightText = (ymovedshadow * 100) / measuresOfReferenceText.height;
        
        let amountLinesText = linesText.length,amountSpaceBetweenTextsY = amountLinesText - 1;
        
        let yCurrent = pxAddedForShadow + (strokeWidth / 2);
        
        let heightForAllTexts = 0;
        
        let measuresTexts = [];
        
        linesText.forEach((text,i)=>{
          text = text.trim();
          
          const {width,x} = widthTextsAndXText[i];
          
          if (text !== "") measuresTexts.push({width,yPosition:yCurrent - measuresOfReferenceText.y,x})
          
          heightForAllTexts = yCurrent + strokeWidth + measuresOfReferenceText.height;
          
          yCurrent += distanceBetweenYTexts + measuresOfReferenceText.height + strokeWidth + (strokeWidth / 2);
        })
        
        measuresSHAPESVG.height = heightForAllTexts - strokeWidth - pxAddedForShadow;
        measuresSHAPESVG.width = widthTextMoreLong;
        
        toolSelected.variablesShapeTextTemporal = {
          fontSize:fontSizeCurrent,
          distanceYBetweenTexts:distanceBetweenYTexts,
          percentageStrokeWidthInHeightText
          ,percentageXMovedShadowInHeightText,
          percentageYMovedShadowInHeightText
        }
        
        toolSelected.valuesToUseInTextsToApply = {
          measuresTexts,
          widthToUseOfTextMoreLong:widthTextMoreLong
        }
      }
      
      let widthShapeWithStrokeWidth = measuresSHAPESVG.width + strokeWidth;
      let heightShapeWithStrokeWidth = measuresSHAPESVG.height + strokeWidth;
      
      let widthThightSVG = widthShapeWithStrokeWidth + (pxAddedForShadow * 2),
      heightThightSVG = heightShapeWithStrokeWidth + (pxAddedForShadow * 2);
      
      if (idshape !== "text") {
        widthThightSVG += (amountPxBlurShadow * 2);
        heightThightSVG += (amountPxBlurShadow * 2);
      }
      
      let atributeToModify,
      valuesPathShape;
      
      if (idshape !== "text" && idshape !== "line") {
        let atributes = getMeasuresOfShapeInSVGContainer(idshape,widthThightSVG,heightThightSVG);
        
        atributeToModify = atributes.atributeToModify;
        valuesPathShape = atributes.valuesPathShape;
      }
      
      const $GRADIENTSVGFORFILL = $COPYSVGINPREVIEWSHAPE.querySelector("#gradientForFill"),
      $GRADIENTSVGFORSTROKE = $COPYSVGINPREVIEWSHAPE.querySelector("#gradientForStroke");
      
      $GRADIENTSVGFORFILL.setAttribute("id","gradientFillIApplyShape");
      $GRADIENTSVGFORSTROKE.setAttribute("id","gradientStrokeInApplyShape")
      
      let fillIsTransparent = $ALLSHAPESFILL[0].getAttribute("fill") === "transparent";
      
      $ALLSHAPESFILL.forEach(($SHAPE,i)=>{
        const $SHAPESTROKE = $ALLSHAPESSTROKE[i];
        
        if (!fillIsTransparent) $SHAPE.setAttribute("fill","url(#gradientFillIApplyShape)");
        
        $SHAPESTROKE.setAttribute("stroke","url(#gradientStrokeInApplyShape)");
        
        if (idshape === "bubbleMessage") {
          let propsCurrent = atributeToModify[i];
          propsCurrent.atributes.forEach((atrname,index)=>{
            let value = propsCurrent.values[index];
            $SHAPE.setAttribute(atrname,value);
            $SHAPESTROKE.setAttribute(atrname,value);
          });
        }
        else if (idshape !== "line" && idshape !== "text") {
          const $SHADOW = $ALLSHADOWS[i];
          atributeToModify.forEach(({atribute,value})=>{
            $SHAPE.setAttribute(atribute,value);
            $SHAPESTROKE.setAttribute(atribute,value);
            $SHADOW.setAttribute(atribute,value);
          })
        }
        else if (idshape === "text") {
          const $SHADOW = $ALLSHADOWS[i];
          
          const {directionOfWrite} = toolSelected.valuesSettingShapeText;
          
          let {
            measuresTexts,
            widthToUseOfTextMoreLong
          } = toolSelected.valuesToUseInTextsToApply;
          
          let dxStart = (widthThightSVG / 2) - (widthToUseOfTextMoreLong / 2);
          
          let dxFromMoveText = getDxTextsDependingOfDirectionWrite(dxStart,widthToUseOfTextMoreLong,directionOfWrite);
          
          let {width,x,yPosition} = measuresTexts[i];
          
          let dx = dxFromMoveText;
          if (directionOfWrite === "middle") dx -= width / 2;
          else if (directionOfWrite === "end") dx -= width;
          
          dx -= x;
          
          [["dx",dx],["dy",yPosition]].forEach(([atrname,value])=>{
            $SHAPE.setAttribute(atrname,value);
            $SHAPESTROKE.setAttribute(atrname,value);
            $SHADOW.setAttribute(atrname,value);
          })
          
          $SHAPE.setAttribute("data-xmovedshadow",xmovedshadow);
          $SHAPE.setAttribute("data-ymovedshadow",ymovedshadow);
          
          $SHAPESTROKE.setAttribute("stroke-width",strokeWidth);
          $SHADOW.setAttribute("stroke-width",strokeWidth);
        }
        else if (idshape === "line" && i === 0) {
          let widthShape = measuresSHAPESVG.width,
          heightShape = measuresSHAPESVG.height,
          x = (widthThightSVG / 2) - (widthShape / 2),
          y = (heightThightSVG / 2) - (heightShape / 2);
          
          ;[["width",widthShape],["height",heightShape],["x",x],["y",y]].forEach(([atr,value])=>{
            $SHAPE.setAttribute(atr,value)
            $SHAPESTROKE.setAttribute(atr,value)
            $ALLSHADOWS[0].setAttribute(atr,value);
          })
        }
        else {
          $SHAPE.remove();
          $SHAPESTROKE.remove();
          $ALLSHADOWS[i].remove();
        }
      })
      
      //POSICIONAMOS EL SHADOW DE LA FIGURA LINE
      
      if (idshape === "line") {
        const $SHAPE = $ALLSHAPESFILL[0],
        $SHADOW = $ALLSHADOWS[0];
        
        const xReference = Number($SHAPE.getAttribute("x")),
        yReference = Number($SHAPE.getAttribute("y"));
        
        $SHADOW.setAttribute("x",xReference + xmovedshadow);
        $SHADOW.setAttribute("y",yReference + ymovedshadow);
        
        $SHAPE.setAttribute("data-indexsize",0);
      }
      
      if (idshape === "arrowIndicator" || idshape === "line") toolSelected.blurPxShadow = amountPxBlurShadow;
      
      //RESETEMOS EL ROTATE PARA PODER AJUSTAR LAS MEDIDAS;
      
      const {lastLocationOriginContainerToUse} = toolSelected;
      
      if (lastLocationOriginContainerToUse) {
        const {originContainerAdjustShapes,originContainerShapes} = getTransformOriginContainerForRotate(shapePrevious,lastLocationOriginContainerToUse);
        
        changeTransformOriginContainers(originContainerAdjustShapes,originContainerShapes);
      }
      
      setPropertyElement($MAINCONTAINERSHAPE,"transform","rotate(0deg)");
      setPropertyElement($CONTAINERADJUSTSHAPES,"transform","rotate(0deg)");
      
      setPropertyElement($MAINCONTAINERSHAPE,"width",widthThightSVG + "px");
      setPropertyElement($MAINCONTAINERSHAPE,"height",heightThightSVG + "px");
      
      const {containerSVG} = $MAINCONTAINERSHAPE.children;
      
      if (containerSVG) containerSVG.remove();
      
      $MAINCONTAINERSHAPE.prepend($COPYSVGINPREVIEWSHAPE);
      
      $COPYSVGINPREVIEWSHAPE.setAttribute("id","containerSVG");
      
      if (mode === "insert") {
        const $containerCanvas = $(".aplication #container-canvas");
        
        let width = getPropertyValueElement("width",$containerCanvas),
        height = getPropertyValueElement("height",$containerCanvas);
        
        let leftContainerShapes = (width / 2) - (widthThightSVG / 2),
        topContainerShapes = (height / 2) - (heightThightSVG / 2);
        
        setPropertyElement($MAINCONTAINERSHAPE,"left",leftContainerShapes + "px");
        setPropertyElement($MAINCONTAINERSHAPE,"top",topContainerShapes + "px");
        
        $CONTAINERADJUSTSHAPES.ontouchstart = touchesSquareAdjustShape;
        $CONTAINERADJUSTSHAPES.ontouchmove = touchesSquareAdjustShape;
        $CONTAINERADJUSTSHAPES.ontouchend = touchesSquareAdjustShape;
      }
      else if ((idshape === "arrowIndicator" || idshape === "line") && (shapePrevious === "line" || shapePrevious === "arrowIndicator")) {
        if (lastLocationOriginContainerToUse === "center") rotateShapeArrowOrLineFromCenter ($CONTAINERADJUSTSHAPES,$MAINCONTAINERSHAPE,0);
        
        const measuresShape = $MAINCONTAINERSHAPE.querySelector("svg .shape-SVG.fill").getBoundingClientRect(),
        {measuresCircleLeft} = getMeasuresCirclesForResizeShape();
        
        //35 es el width de el circulo
        
        let diferenceXForMoveContainer = (measuresCircleLeft.x + (35 / 2)) - measuresShape.x,
        diferenceYForMoveContainer = (measuresCircleLeft.y - measuresShape.y) - ((measuresShape.height / 2) - (35 / 2));
        
        const LEFT = getPropertyValueElement("left",$MAINCONTAINERSHAPE),
        TOP = getPropertyValueElement("top",$MAINCONTAINERSHAPE);
        
        setPropertyElement($MAINCONTAINERSHAPE,"left",LEFT + diferenceXForMoveContainer + "px");
        setPropertyElement($MAINCONTAINERSHAPE,"top",TOP + diferenceYForMoveContainer + "px");
      }
      
      //ACA OBTENEMOS LA POSICION Y TAMAÑO DE SHAPE PARA PODER APLICAR LAS MEDIDAS CORRESPONDIENTES A containerAdjustSHAPES
      
      let measuresShapeToApply;
      if (idshape === "bubbleMessage") {
        measuresShapeToApply = $MAINCONTAINERSHAPE.querySelectorAll(".shape-SVG.fill")[3].getBoundingClientRect();
        
        measuresShapeToApply.width = 120;
        measuresShapeToApply.height = 90;
      }
      else if (idshape === "text") {
        measuresShapeToApply = $MAINCONTAINERSHAPE.getBoundingClientRect();
      }
      else {
        measuresShapeToApply = $MAINCONTAINERSHAPE.querySelector(".shape-SVG.fill").getBoundingClientRect();
      }
      
      let measuresAplication = $aplication.getBoundingClientRect();
      
      let leftContainerAdjustShape = measuresShapeToApply.x - measuresAplication.x,
      topContainerAdjustShape = measuresShapeToApply.y - measuresAplication.y;
      
      let measuresContainerAdjustShape = [
        {nameprop:"width",value:measuresShapeToApply.width},
        {nameprop:"height",value:measuresShapeToApply.height},
        {nameprop:"left",value:leftContainerAdjustShape},
        {nameprop:"top",value:topContainerAdjustShape}
      ];
      
      measuresContainerAdjustShape.forEach(({nameprop,value})=>{
        setPropertyElement($CONTAINERADJUSTSHAPES,nameprop,value + "px");
      });
      
      if (idshape !== "custom-clip-path") {
        $CONTAINERADJUSTSHAPES.classList.remove("visibility-hidden");
        
        Array.from($CONTAINERADJUSTSHAPES.children).forEach($circle=>{
        if ($circle.id !== "center" && (idshape === "line" || idshape === "custom-clip-path" || idshape === "arrowIndicator")) $circle.classList.add("hide");
        else if ($circle.id !== "center") $circle.classList.remove("hide");
        else if ($circle.id === "center" && (idshape === "line" || idshape === "arrowIndicator")) setPropertyElement($circle,"top","-40px");
        else if ($circle.id === "center") setPropertyElement($circle,"top","0px");
      
        if ($circle.id === "center" && (idshape === "line" || idshape === "square" || idshape === "text" || idshape === "arrowIndicator")) $circle.classList.remove("hide");
        else if ($circle.id === "center") $circle.classList.add("hide");
     });
      }
      else $CONTAINERADJUSTSHAPES.classList.add("visibility-hidden");
     
      const positioningCirclesResize = ()=>{
      const {$CIRCLELEFT,$CIRCLERIGHT} = getCirclesForResizeAndRotateContainers();
      
      let widthCircles = 35;
      
      let topCircles = topContainerAdjustShape + (measuresShapeToApply.height / 2) - (widthCircles / 2);
      
      let leftCircleLEFT = leftContainerAdjustShape - (widthCircles / 2),
      leftCircleRIGHT = (leftContainerAdjustShape + measuresShapeToApply.width) - (widthCircles / 2);
      
      setPropertyElement($CIRCLELEFT,"left",leftCircleLEFT + "px");
      setPropertyElement($CIRCLERIGHT,"left",leftCircleRIGHT + "px");
      
      setPropertyElement($CIRCLELEFT,"top",topCircles + "px");
      setPropertyElement($CIRCLERIGHT,"top",topCircles + "px");
      
      return {topCircles,leftCircleRIGHT};
     }
     
     const getValuesToUseOfFiguresWithTwoCirclesForResize = () => {
      let measuresBeforeOfCircles,
      lastDegRotate = 0;
      
      if (shapePrevious === "line" || shapePrevious === "arrowIndicator") {
        lastDegRotate = shapePrevious === "line" ? toolSelected.propsCirclesForMoveShapeLINE.lastDegRotate : toolSelected.propsContainerAdjustShapes.lastDegRotate;
        
        measuresBeforeOfCircles = getMeasuresCirclesForResizeShape();
      }
      
      positioningCirclesResize();
      
      const {measuresCircleRight,measuresCircleLeft} = getMeasuresCirclesForResizeShape();
      
      let sizeBetweenCircles = measuresCircleRight.x - measuresCircleLeft.x;
      
      if (!measuresBeforeOfCircles) {
        let {myLastWidth} = toolSelected.propsContainerAdjustShapes ?? {myLastWidth:sizeBetweenCircles};
        
        measuresBeforeOfCircles = {
          measuresCircleRight:{
            x:measuresCircleLeft.x + myLastWidth,
            y:measuresCircleRight.y
          },measuresCircleLeft};
      }
      
      let diferenceXCircleLeft = measuresCircleLeft.x - measuresBeforeOfCircles.measuresCircleLeft.x,
      diferenceYCircleLeft = measuresCircleLeft.y - measuresBeforeOfCircles.measuresCircleLeft.y;
      
      measuresBeforeOfCircles.measuresCircleRight.x += diferenceXCircleLeft;
      measuresBeforeOfCircles.measuresCircleRight.y += diferenceYCircleLeft;
      
      let pxMoveCircleRightInX = measuresBeforeOfCircles.measuresCircleRight.x - measuresCircleRight.x,
      pxMoveCircleRightInY = measuresBeforeOfCircles.measuresCircleRight.y - measuresCircleRight.y;
      
      return {pxMoveCircleRightInY,pxMoveCircleRightInX,lastDegRotate,sizeBetweenCircles}
     }
     
     const rotateShapeArrowOrLineFromCenterIfIsNecesary = (lastDegRotate) => {
      if (lastLocationOriginContainerToUse === "center") {
        changeTransformOriginContainers("center","center");
        
        getMeasuresOfReferenceForRotateShapeWithTwoCornersInCenter(0);
        
        rotateShapeAt(lastDegRotate);
      }
     }
     
     $MAINCONTAINERSHAPE.setAttribute("data-shapeprevious",idshape);
     $MAINCONTAINERSHAPE.setAttribute("data-shapeadjustment",JSON.stringify(toolSelected.modalFigures));
     
     delete toolSelected.variablesShapeClipPathTemporal;
     
     if (shapePrevious === "custom-clip-path" && idshape !== "custom-clip-path") {
      $MAINCONTAINERSHAPE.querySelectorAll(".circles-custom-clip-path").forEach($CIRCLE=>{$CIRCLE.remove()});
      $MAINCONTAINERSHAPE.querySelector(".circle-setting-shape-clip-path").remove();
     }
     
     if (idshape === "line") {
      let {pxMoveCircleRightInX,pxMoveCircleRightInY,sizeBetweenCircles,lastDegRotate} = getValuesToUseOfFiguresWithTwoCirclesForResize();
      
      toolSelected.propsCirclesForMoveShapeLINE = {
        amountPxForWidthShapes:{
          containerSHAPES:widthThightSVG - sizeBetweenCircles,
          containerAdjustSHAPES:measuresShapeToApply.width - sizeBetweenCircles
        },
        amountPxForHeightSVG:heightThightSVG - measuresShapeToApply.height,
        lastDegRotate:0
      }
      
      toolSelected.propsContainerAdjustShapes = {
        myLastHeight:measuresShapeToApply.height,
        myLastWidth:measuresShapeToApply.width
      }
      
      changeTransformOriginContainers("left top","left top");
      
      const {thicknessPX} = toolSelected.valuesSettingThicknessSHAPELINE;
      
      updateValuesCorrectOfShape(thicknessPX);
      
      const {originContainerShapes,originContainerAdjustShapes} = getTransformOriginContainerForRotate(idshape,"left");
      
      changeTransformOriginContainers(originContainerAdjustShapes,originContainerShapes);
      
      const $CIRCLERIGHT = $aplication.children["circle-right"];
      
      rotateSHAPELINE($CIRCLERIGHT,pxMoveCircleRightInX,pxMoveCircleRightInY);
      
      rotateShapeArrowOrLineFromCenterIfIsNecesary(lastDegRotate);
    }
     else if (idshape === "arrowIndicator") {
      let {pxMoveCircleRightInX,pxMoveCircleRightInY,sizeBetweenCircles,lastDegRotate} = getValuesToUseOfFiguresWithTwoCirclesForResize();
      
      delete toolSelected.propsCirclesForMoveShapeLINE;
      
      const {percentageXShadowInHeightShape,percentageYShadowInHeightShape} = toolSelected.propsContainerAdjustShapes;
      
      toolSelected.propsContainerAdjustShapes = {
        widthSVG:widthThightSVG,
        heightSVG:heightThightSVG,
        amountPxForWidthContainers:{
          containerSHAPES:widthThightSVG - sizeBetweenCircles,
          containerAdjustSHAPES:measuresShapeToApply.width - sizeBetweenCircles
        },
        lastDegRotate:0,
        myLastHeight:measuresShapeToApply.height,
        myLastWidth:measuresShapeToApply.width,
        percentageYShadowInHeightShape,
        percentageXShadowInHeightShape,
        strokeWidth
      }
      
      changeTransformOriginContainers("left top","left top");
      
      const {thickness} = toolSelected.valuesSettingShapeArrowIndicator;
      
      updateValuesCorrectOfShape(thickness,"thickness-range");
      
      const {originContainerShapes,originContainerAdjustShapes} = getTransformOriginContainerForRotate(idshape,"left");
      
      changeTransformOriginContainers(originContainerAdjustShapes,originContainerShapes);
      
      const $CIRCLERIGHT = $aplication.children["circle-right"];
      
      rotateAndResizeShapeArrowIndicator($CIRCLERIGHT,pxMoveCircleRightInX,pxMoveCircleRightInY,true);
      
      rotateShapeArrowOrLineFromCenterIfIsNecesary(lastDegRotate);
     }
     else {
      removeCirclesForResizeAndRotateShape();
      
      delete toolSelected.propsCirclesForMoveShapeLINE;
      
      const {propsContainerAdjustShapes,flipHorizontal,flipVertical} = toolSelected;
      
      let previousDegRotateShape = shapePrevious !== "line" && shapePrevious !== "arrowIndicator" && shapePrevious !== undefined ? propsContainerAdjustShapes.lastDegRotate : 0;
      
      let {myLastWidth,myLastHeight} = propsContainerAdjustShapes ?? {myLastWidth:measuresShapeToApply.width,
        myLastHeight:measuresShapeToApply.height};
      
      if (shapePrevious === "line" || shapePrevious === "arrowIndicator") myLastHeight = myLastWidth;
      
      let pxForWidthShape = measuresShapeToApply.width - widthThightSVG,
      pxForHeightShape = measuresShapeToApply.height - heightThightSVG;
      
      toolSelected.propsContainerAdjustShapes = {
        lastDegRotate:0,
        pxForWidthShape,
        pxForHeightShape,
        widthSVG:widthThightSVG,
        heightSVG:heightThightSVG,
        myLastWidth:measuresShapeToApply.width,
        myLastHeight:measuresShapeToApply.height,
        valuesPathShape
      }
      
      let diferenceWidthShape = myLastWidth - toolSelected.propsContainerAdjustShapes.myLastWidth,
      diferenceHeightShape = myLastHeight - toolSelected.propsContainerAdjustShapes.myLastHeight;
      
      if (idshape === "text" || idshape === "circle") getPercentageInSizeForUseInKeepAspectRatioShape(idshape,widthThightSVG,heightThightSVG);
      
      if (idshape === "text") {
        const $SVG = $MAINCONTAINERSHAPE.querySelector("svg");
        
        setPropertyElement($SVG,"width",widthThightSVG + "px");
        setPropertyElement($SVG,"height",heightThightSVG + "px");
        
        const {propsContainerAdjustShapes} = toolSelected;
        
        propsContainerAdjustShapes.widthStaticSVG = widthThightSVG;
        propsContainerAdjustShapes.heightStaticSVG = heightThightSVG;
      }
      
      if (idshape !== "custom-clip-path") resizeShapes("bottom-right",$MAINCONTAINERSHAPE,diferenceWidthShape,diferenceHeightShape,$CONTAINERADJUSTSHAPES,$CONTAINERADJUSTSHAPES.children["bottom-right"],0,0,true)
      else {
        resizeShapeClipPathToInit(diferenceWidthShape,diferenceHeightShape);
        
        addedCirclesForResizeShapeClipPath();
        
        const $SHAPE = $MAINCONTAINERSHAPE.querySelector("svg .shape-SVG.fill");
      
        $SHAPE.ontouchstart = touchesShapeClipPathForMove;
        $SHAPE.ontouchmove = touchesShapeClipPathForMove;
        $SHAPE.ontouchend = touchesShapeClipPathForMove;
        
        flipSHAPE();
        
        if (flipHorizontal.degRotate === 180) changeOrderCirclesCustomClipPathAndPosition("x");
        
        if (flipVertical.degRotate === 180) changeOrderCirclesCustomClipPathAndPosition("y");
      }
      
      changeTransformOriginContainers("center","center");
      
      toolSelected.lastLocationOriginContainerToUse = "center";
      
      rotateShapeAt(previousDegRotateShape)
    }
    
    updateButtonsRotateSHAPE();
    
    toolSelected.lastSuperpositionSelectedInModalFigures = JSON.parse($MODALFIGURES.dataset.superposition);
    }
    else if ($(".aplication .container-SHAPES-insert")) {
      const {valueInput,typeLineSelected} = toolSelected.modalFigures.ALLTYPESLINE;
      const {ALLTYPESLINE} = toolSelected.modalFigures;
      
      ALLTYPESLINE.valueInputPrevious = valueInput;
      ALLTYPESLINE.typeLineSelectedPrevious = typeLineSelected;
    }
    else {
      const {
        valueCheckboxPrevious,
        valueInputPrevious,
        typeLineSelectedPrevious
      } = toolSelected.modalFigures.ALLTYPESLINE;
      
      const {ALLTYPESLINE} = toolSelected.modalFigures;
      
      ALLTYPESLINE.valueInput = valueInputPrevious;
      ALLTYPESLINE.typeLineSelected = typeLineSelectedPrevious;
     
      toolSelected.valuesSettingThicknessSHAPELINE.borderRoundActived = valueCheckboxPrevious;
    }
    
    removeElementOfDom($MODALFIGURES);
    
    const $CONTAINERSHAPES = $aplication.children["container-canvas"].children["container-SHAPES-INSERT"];
    
    const {valuesModalFiguresBeforeEnterInEdit} = toolSelected.propsContainerAdjustShapes ?? {};
    
    if (valuesModalFiguresBeforeEnterInEdit) {
      toolSelected.modalFigures = valuesModalFiguresBeforeEnterInEdit
      delete toolSelected.propsContainerAdjustShapes.valuesModalFiguresBeforeEnterInEdit;
    }
  }
}

function resizeShapeClipPathToInit (pxAddedInX,pxAddedInY) {
  const {pxForWidthShape,pxForHeightShape,widthSVG,heightSVG} = toolSelected.propsContainerAdjustShapes;
  
  const {
    widthContainerSHAPESAdjust,
    heightContainerSHAPESAdjust
  } = getCorrectSizeContainerShapes(widthSVG,pxAddedInX,heightSVG,pxAddedInY);
  
  let nextWidthShape = widthContainerSHAPESAdjust + pxForWidthShape,
  nextHeightShape = heightContainerSHAPESAdjust + pxForHeightShape;
  
  toolSelected.propsContainerAdjustShapes.myLastWidth = nextWidthShape;
  toolSelected.propsContainerAdjustShapes.myLastHeight = nextHeightShape;
  
  toolSelected.propsContainerAdjustShapes.widthSVG = widthContainerSHAPESAdjust;
  toolSelected.propsContainerAdjustShapes.heightSVG = heightContainerSHAPESAdjust;
  
  toolSelected.modalFigures.SHAPE["custom-clip-path"] = {
    width:nextWidthShape,
    height:nextHeightShape
  }
  
  const $CONTAINERSHAPE = $("#container-canvas .container-SHAPES-insert");
  
  setPropertyElement($CONTAINERSHAPE,"width",`${widthContainerSHAPESAdjust}px`);
  setPropertyElement($CONTAINERSHAPE,"height",`${heightContainerSHAPESAdjust}px`);
  
  let {atributeToModify} = getMeasuresOfShapeInSVGContainer("custom-clip-path",widthContainerSHAPESAdjust,heightContainerSHAPESAdjust);
  
  let {atribute,value} = atributeToModify[0];
  
  const $SHAPEFILL = $CONTAINERSHAPE.querySelector("svg .shape-SVG.fill");
  
  $SHAPEFILL.setAttribute(atribute,value);
}

function touchesShapeClipPathForMove (e) {
  const {clientX,clientY} = e.type !== "touchend" ? e.touches[0] : {};
  
  if (e.type === "touchstart") {
    toolSelected.lastClientXTouchShapeClipPath = clientX;
    toolSelected.lastClientYTouchShapeClipPath = clientY;
    return;
  }
  else if (e.type === "touchend") {
    deletePropsOfvaluesToEnterInRangeBorder();
    deletePropsOfvaluesToEnterInRangeCenterCanvas();
    return
  }
  
  let pxAddedInX = clientX - toolSelected.lastClientXTouchShapeClipPath;
  
  let pxAddedInY = clientY - toolSelected.lastClientYTouchShapeClipPath;
  
  toolSelected.lastClientXTouchShapeClipPath = clientX;
  toolSelected.lastClientYTouchShapeClipPath = clientY;
  
  const {idshape} = toolSelected.modalFigures.SHAPE;
  
  movePositionSHAPE ($aplication.querySelector(".square-of-adjust-SHAPES"),$aplication.querySelector("#container-canvas .container-SHAPES-insert"),pxAddedInX,pxAddedInY,idshape);
}

function removeCirclesForResizeAndRotateShape () {
  $aplication.children["circle-left"]?.remove();
  $aplication.children["circle-right"]?.remove();
}

function getCirclesForResizeAndRotateContainers () {
  let $CIRCLELEFT,
  $CIRCLERIGHT;
  
  if (!$(".aplication .circle-for-move-in-screen")) {
    const HTMLCIRCLELEFT = `<div class="circle-for-move-in-screen" id="circle-left"><span></span></div>`
    ,HTMLCIRCLERIGHT = `<div class="circle-for-move-in-screen" id="circle-right"><span></span></div>`;
    
    $aplication.insertAdjacentHTML("beforeend",HTMLCIRCLELEFT);
    $aplication.insertAdjacentHTML("beforeend",HTMLCIRCLERIGHT);
    
    $CIRCLELEFT = $(".aplication > #circle-left");
    $CIRCLERIGHT = $(".aplication > #circle-right");
    
    [$CIRCLELEFT,$CIRCLERIGHT].forEach($circle=>{
      $circle.ontouchstart = touchesSquareAdjustShape;
      $circle.ontouchmove = touchesSquareAdjustShape;
      $circle.ontouchend = touchesSquareAdjustShape;
    });
  }
  else {
    $CIRCLELEFT = $(".aplication > #circle-left");
    $CIRCLERIGHT = $(".aplication > #circle-right");
  }
  
  return {$CIRCLELEFT,$CIRCLERIGHT}
}

function clickAmountPointsForApplyClipPathShape ({currentTarget}) {
  let {numberpoint} = currentTarget.dataset
  
  let newAmountPointForApply = Number(numberpoint);
  
  toolSelected.valuesSettingClipPath.pointsInBorders = newAmountPointForApply;
  
  let $bottomToSelect;
  
  $(".container-setting-SHAPE .buttons-amount-point-in-clip-path button.selected").classList.remove("selected")
  
  if (newAmountPointForApply > 20) $bottomToSelect = $(".container-setting-SHAPE .buttons-amount-point-in-clip-path #more-amount-points");
  else $bottomToSelect = $(`.container-setting-SHAPE .buttons-amount-point-in-clip-path button[data-numberpoint="${newAmountPointForApply}"]`);
  
  $bottomToSelect.classList.add("selected")
  
  removeElementOfDom($(".curtain-container"));
  
  addedCirclesForResizeShapeClipPath();
  flipSHAPE();
  
  const {flipHorizontal,flipVertical} = toolSelected;
  
  if (flipHorizontal.degRotate === 180) changeOrderCirclesCustomClipPathAndPosition("x");
  
  if (flipVertical.degRotate === 180) changeOrderCirclesCustomClipPathAndPosition("y");
}

function clickToolShapeClipPath ({target,eventcallmanual}) {
  let IDTARGET = target.id;
  
  const {valuesSettingClipPath,flipVertical,flipHorizontal} = toolSelected;
  
  const desactivateOrActivateButtons = (action) => {
    const $CONTAINERNUMBERSPOINT = $(".container-setting-SHAPE .buttons-amount-point-in-clip-path");
    
    [12,16,20,"more-amount-points"].forEach(id=>{
      let $BUTTON,$ICON;
      
      if (!isNaN(id)) $BUTTON = $CONTAINERNUMBERSPOINT.querySelector(`button[data-numberpoint="${id}"]`);
      else {
        $BUTTON = $CONTAINERNUMBERSPOINT.querySelector(`button#${id}`);
        $ICON = $BUTTON.firstElementChild;
      }
      
      if (action === "activate" && !$ICON) {
        $BUTTON.disabled = false;
        $BUTTON.classList.remove("color-disabled");
      }
      else if (!$ICON) {
        $BUTTON.disabled = true;
        $BUTTON.classList.add("color-disabled");
      }
      else if ($ICON && action === "activate") {
        $BUTTON.disabled = false;
        $ICON.classList.remove("opacity-midle")
      }
      else {
        $BUTTON.disabled = true;
        $ICON.classList.add("opacity-midle")
      }
    })
  }
  
  const desactivateOrActivateButtonFour = (action) => {
    const $BUTTONFOUR = $(`.container-setting-SHAPE .buttons-amount-point-in-clip-path button[data-numberpoint="4"]`);
    
    let metod,disabled;
    
    if (action === "activate") {
      metod = "remove";
      disabled = false;
    }
    else {
      metod = "add";
      disabled = true;
    }
    
    $BUTTONFOUR.classList[metod]("color-disabled");
    $BUTTONFOUR.disabled = disabled;
  }
  
  if (target.dataset.numberpoint) valuesSettingClipPath.pointsInBorders = Number(target.dataset.numberpoint);
  else if (IDTARGET === "more-amount-points") {
    if (eventcallmanual) {
      target.classList.add("selected");
      return;
    }
    
    const {superpositionOptionsModal} = toolSelected.htmlChildren;
    
    $aplication.insertAdjacentHTML("beforeend",`<div class="curtain-container">
    ${superpositionOptionsModal} 
    </div>`);
    
    const $CURTAIN = $aplication.querySelector(".curtain-container");
    
    const $MODALCHOOSESUPERPOSITION = $aplication.querySelector(".modal-choose-superposition");
    
    const $CONTAINEROPTIONS = $MODALCHOOSESUPERPOSITION.querySelector(".options");
    
    $CONTAINEROPTIONS.lastElementChild.remove();
    
    const allOptions = $CONTAINEROPTIONS.children;
    
    for (let numberOption = 1;numberOption < 17;numberOption++) {
      const $CONTAINEROPTION = allOptions[numberOption - 1];
      
      let amuntPoints = numberOption * 4;
      
      $CONTAINEROPTION.setAttribute("data-numberpoint",amuntPoints);
      
      $CONTAINEROPTION.lastElementChild.innerText = amuntPoints;
      
      $CONTAINEROPTION.onclick = clickAmountPointsForApplyClipPathShape;
    }
    
    const {pointsInBorders} = toolSelected.valuesSettingClipPath;
    
    const $CIRCLEFORACTIVATE = $CONTAINEROPTIONS.querySelector(`div[data-numberpoint="${pointsInBorders}"] .container-circle`);
    
    setPropertyElement($CIRCLEFORACTIVATE,"--scaleCircle","1");
    setPropertyElement($CIRCLEFORACTIVATE,"--colorBorderContainer","var(--BGbuttonSelected)");
    
    setPropertyElement($MODALCHOOSESUPERPOSITION,"transition","none");
    setPropertyElement($MODALCHOOSESUPERPOSITION,"opacity","1");
    
    $MODALCHOOSESUPERPOSITION.querySelector(".footer button#cancel").onclick = () => {
      removeElementOfDom($CURTAIN)
    }
  }
  else if (IDTARGET === "bezier-cuadratic-in-sides") {
    desactivateOrActivateButtons("desactivate");
    desactivateOrActivateButtonFour("desactivate");
    
    valuesSettingClipPath.strokeType = IDTARGET;
    
    const $SETTINGSHAPE = $(".container-setting-SHAPE");
    
    const $BUTTONSELECTEDBEFORE = $SETTINGSHAPE.querySelector(".buttons-amount-point-in-clip-path button.selected");
    
    let {numberpoint} = $BUTTONSELECTEDBEFORE.dataset;
    
    if (Number(numberpoint) !== 8) {
      $BUTTONSELECTEDBEFORE.classList.remove("selected");
      
      $SETTINGSHAPE.querySelector(`.buttons-amount-point-in-clip-path button[data-numberpoint="8"]`).classList.add("selected");
      
      valuesSettingClipPath.pointsInBorders = 8;
    }
  }
  else if (IDTARGET === "bezier-cuadratic-in-corners") {
    desactivateOrActivateButtons("activate")
    
    valuesSettingClipPath.strokeType = IDTARGET;
    
    const $SETTINGSHAPE = $(".container-setting-SHAPE");
    
    const $BUTTONSELECTEDBEFORE = $SETTINGSHAPE.querySelector(".buttons-amount-point-in-clip-path button.selected");
    
    let {numberpoint} = $BUTTONSELECTEDBEFORE.dataset;
    
    if (Number(numberpoint) === 4) {
      $BUTTONSELECTEDBEFORE.classList.remove("selected");
      
      $SETTINGSHAPE.querySelector(`.buttons-amount-point-in-clip-path button[data-numberpoint="8"]`).classList.add("selected");
      
      valuesSettingClipPath.pointsInBorders = 8;
    }
    
    desactivateOrActivateButtonFour("desactivate");
  }
  else {
    desactivateOrActivateButtons("activate")
    desactivateOrActivateButtonFour("activate");
    
    valuesSettingClipPath.strokeType = IDTARGET;
  }
  
  if (IDTARGET !== "more-amount-points") {
    const $PARENTTARGET = target.parentElement;
    
    $PARENTTARGET.querySelector("button.selected")?.classList.remove("selected");
    
    target.classList.add("selected");
    
    if (!eventcallmanual) {
      addedCirclesForResizeShapeClipPath()
      flipSHAPE();
      
      if (flipHorizontal.degRotate === 180) changeOrderCirclesCustomClipPathAndPosition("x");
      
      if (flipVertical.degRotate === 180) changeOrderCirclesCustomClipPathAndPosition("y");
      
      toolSelected.propsContainerAdjustShapes.strokeTypeBefore = valuesSettingClipPath.strokeType;
    }
  }
}

function addEventTouchForShrinkContainer (workOfContainer) {
  $aplication.setAttribute("data-modalcurrentshape",workOfContainer);
  
  addOrRemoveEventElement("addEventListener","touchstart",shrinkContainerCorrectIfExist,$(".aplication .img .container-SHAPES-insert"));
  
  addOrRemoveEventElement("addEventListener","touchstart",touchAPLICATION,$aplication);
  
  addOrRemoveEventElement("addEventListener","touchstart",shrinkContainerCorrectIfExist,$toolsUp);
}

function showToolsOfSettingOfShapeClipPath ({target}) {
  const {containerSettingSHAPE,htmlSettingShapeClipPath} = toolSelected.htmlChildren;
  
  let $CONTAINERMAINTOOLS = $aplication.querySelector(".container-setting-SHAPE");
  
  shrinkContainerCorrectIfExist();
  
  const {runningshrinkcontainer} = $aplication.dataset;
  
  if (runningshrinkcontainer) return;
  else addEventTouchForShrinkContainer("settingshape");
  
  if (!$CONTAINERMAINTOOLS) {
    $aplication.insertAdjacentHTML("beforeend",containerSettingSHAPE);
    
    $CONTAINERMAINTOOLS = $aplication.querySelector(".container-setting-SHAPE");
  }
  
  const $CONTAINERSHAPES = target.parentElement;
  
  let yHigher = 0;
  
  const getYHigherOfCorners = () => {
    $CONTAINERSHAPES.querySelectorAll(".point-corner").forEach($CORNER=>{
      let {y} = $CORNER.getBoundingClientRect();
      
      if (y > yHigher) yHigher = y;
    })
  }
  
  getYHigherOfCorners()
  
  let yAplication = $aplication.getBoundingClientRect().y;
  
  $CONTAINERMAINTOOLS.innerHTML = htmlSettingShapeClipPath;
  
  const $CONTAINERTYPESOFBORDE = $CONTAINERMAINTOOLS.querySelector(".types-of-borde");
  
  const $CONTAINERAMOUNTPOINTS = $CONTAINERMAINTOOLS.querySelector(".buttons-amount-point-in-clip-path");
  
  const {strokeType,pointsInBorders} = toolSelected.valuesSettingClipPath;
  
  $CONTAINERTYPESOFBORDE.onclick = clickToolShapeClipPath;
  
  $CONTAINERAMOUNTPOINTS.onclick = clickToolShapeClipPath;
  
  clickToolShapeClipPath({target:$CONTAINERAMOUNTPOINTS.querySelector(`button[data-numberpoint="${pointsInBorders}"]`) ?? $CONTAINERAMOUNTPOINTS.querySelector("button#more-amount-points"),eventcallmanual:true});
  
  clickToolShapeClipPath({target:$CONTAINERTYPESOFBORDE.querySelector(`button#${strokeType}`),eventcallmanual:true});
  
  let topForContainer = yHigher - yAplication;
  
  setPropertyElement($CONTAINERMAINTOOLS,"top",`${topForContainer}px`);
  
  setPropertyElement($CONTAINERMAINTOOLS,"width","90%");
  
  setPropertyElement($CONTAINERMAINTOOLS,"--gapColumnContanier","10px");
  
  $CONTAINERMAINTOOLS.removeAttribute("data-shrink");
  
  setTimeout(()=>{
    setPropertyElement($CONTAINERMAINTOOLS,"transform","scaleY(1)");
  },0)
}

function addCircleElementOfClipPathShape (indexToApply) {
  const $CONTAINERSHAPESMAIN = $("#container-canvas .container-SHAPES-insert");
  
  $CONTAINERSHAPESMAIN.insertAdjacentHTML("beforeend",`<div class="circles-custom-clip-path"></div>`);
  
  const $CIRCLEFORMOVE = $CONTAINERSHAPESMAIN.lastElementChild;
  
  $CIRCLEFORMOVE.ontouchstart = moveCirclePointClipPath;
  $CIRCLEFORMOVE.ontouchmove = moveCirclePointClipPath;
  $CIRCLEFORMOVE.ontouchend = moveCirclePointClipPath;
  
  $CIRCLEFORMOVE.setAttribute("data-indexofposition",indexToApply);
  
  return $CIRCLEFORMOVE;
}

function adjustCircleOfClipPathShapeTo ($CIRCLE,x,y) {
  //EL 35 ES EL WIDTH Y HEIGHT DE LOS CIRCULOS
  
  let halfCircle = 35 / 2;
  
  setPropertyElement($CIRCLE,"left",`${x - halfCircle}px`);
  setPropertyElement($CIRCLE,"top",`${y - halfCircle}px`);
}

function addNumberOfSideCircleForCustomClipPathShape ($CIRCLE,side,numberSideBetweenCorners) {
  $CIRCLE.setAttribute("data-sidename",side);
  $CIRCLE.setAttribute("data-sidenamebetweencorners",`${side}-${numberSideBetweenCorners}`);
  }

function getPathValuesWithStrokeSQUARE (divider,distanceBettweenPointsInX,distanceBettweenPointsInY,measuresShape) {
  const {pointsInBorders} = toolSelected.valuesSettingClipPath;
  
  let pathValues = [],
  positionSideBetweenCorners = 1,
  currentBorde;
  
  for (let numberPoint = 0;numberPoint < pointsInBorders;numberPoint++) {
    
    let $CIRCLEFORMOVE = addCircleElementOfClipPathShape(numberPoint);
    
    let positionLast = pathValues.at(-1)?.value;
    
    if (numberPoint === 0) {
      let x = measuresShape.x,
      y = measuresShape.y + measuresShape.height;
      
      pathValues.push({comandPath:"M",value:{x,y}});
      
      currentBorde = "left";
      
      $CIRCLEFORMOVE.setAttribute("data-namecorner","bottom-left");
      
      adjustCircleOfClipPathShapeTo($CIRCLEFORMOVE,x,y);
    }
    else if (numberPoint === divider) {
      let x = measuresShape.x,
      y = measuresShape.y;
      
      pathValues.push({comandPath:"L",value:{x,y}});
      
      $CIRCLEFORMOVE.setAttribute("data-namecorner","top-left");
      
      currentBorde = "top";
      
      adjustCircleOfClipPathShapeTo($CIRCLEFORMOVE,x,y);
      
      positionSideBetweenCorners = 1;
    }
    else if (numberPoint === divider * 2) {
      let x = measuresShape.x + measuresShape.width,
      y = measuresShape.y;
      
      pathValues.push({comandPath:"L",value:{x,y}});
      
      $CIRCLEFORMOVE.setAttribute("data-namecorner","top-right");
      
      positionSideBetweenCorners = (divider + 1) - 2;
      
      currentBorde = "right";
      
      adjustCircleOfClipPathShapeTo($CIRCLEFORMOVE,x,y);
    }
    else if (numberPoint === divider * 3) {
      let x = measuresShape.x + measuresShape.width,
      y = measuresShape.y + measuresShape.height;
      
      pathValues.push({comandPath:"L",value:{x,y}});
      
      $CIRCLEFORMOVE.setAttribute("data-namecorner","bottom-right");
      
      positionSideBetweenCorners = (divider + 1) - 2;
      
      currentBorde = "bottom";
      
      adjustCircleOfClipPathShapeTo($CIRCLEFORMOVE,x,y);
    }
    else if (currentBorde === "left") {
      let x = positionLast.x,
      y = positionLast.y - distanceBettweenPointsInY;
      
      pathValues.push({
        comandPath:"L",
        value:{
          x,y
        }
      })
      
      addNumberOfSideCircleForCustomClipPathShape($CIRCLEFORMOVE,currentBorde,positionSideBetweenCorners);
      
      adjustCircleOfClipPathShapeTo($CIRCLEFORMOVE,x,y);
      
      positionSideBetweenCorners++;
    }
    else if (currentBorde === "top") {
      let x = positionLast.x + distanceBettweenPointsInX,
      y = positionLast.y;
      
      pathValues.push({
        comandPath:"L",
        value:{
          x,y
        }
      })
      
      addNumberOfSideCircleForCustomClipPathShape($CIRCLEFORMOVE,currentBorde,positionSideBetweenCorners);
      
      adjustCircleOfClipPathShapeTo($CIRCLEFORMOVE,x,y);
      
      positionSideBetweenCorners++;
    }
    else if (currentBorde === "right") {
      let x = positionLast.x,
      y = positionLast.y + distanceBettweenPointsInY;
      
      pathValues.push({
        comandPath:"L",
        value:{
          x,y
        }
      })
      
      addNumberOfSideCircleForCustomClipPathShape($CIRCLEFORMOVE,currentBorde,positionSideBetweenCorners);
      
      adjustCircleOfClipPathShapeTo($CIRCLEFORMOVE,x,y);
      
      positionSideBetweenCorners--
    }
    else if (currentBorde === "bottom") {
      let x = positionLast.x - distanceBettweenPointsInX,
      y = positionLast.y;
      
      pathValues.push({
        comandPath:"L",
        value:{
          x,y
        }
      })
      
      addNumberOfSideCircleForCustomClipPathShape($CIRCLEFORMOVE,currentBorde,positionSideBetweenCorners);
      
      adjustCircleOfClipPathShapeTo($CIRCLEFORMOVE,x,y);
      
      positionSideBetweenCorners--;
    }
  }
  
  pathValues.push({
    comandPath:"Z",
    value:""
  })
  
  return pathValues;
}

function getPathValuesWithStrokeBezierCuadraticInSides (divider,distanceBettweenPointsInX,distanceBettweenPointsInY,measuresShape) {
  const {pointsInBorders} = toolSelected.valuesSettingClipPath;
  
  let valuesPath = [],
  currentBorde;
  
  for (let numberPoint = 0;numberPoint < pointsInBorders;numberPoint++) {
    
    let $CIRCLEFORMOVE = addCircleElementOfClipPathShape(numberPoint);
    
    let comand = valuesPath.at(-1),indexLastPoint = valuesPath.length - 1,lastValues = comand?.value,
    lastCommand = comand?.comandPath;
    
    if (numberPoint === 0) {
      let x = measuresShape.x,
      y = measuresShape.y + measuresShape.height;
      
      valuesPath.push({comandPath:"M",value:{x,y}});
      
      currentBorde = "left";
      
      $CIRCLEFORMOVE.setAttribute("data-namecorner","bottom-left");
      
      adjustCircleOfClipPathShapeTo($CIRCLEFORMOVE,x,y);
    }
    else if (numberPoint === divider) {
      let x = measuresShape.x,
      y = measuresShape.y;
      
      if (lastCommand === "Q") {
        lastValues.x = x;
        lastValues.y = y;
        
        $CIRCLEFORMOVE.setAttribute("data-indexofposition",indexLastPoint)
        $CIRCLEFORMOVE.setAttribute("data-measurestomodify","x,y");
      }
      else valuesPath.push({comandPath:"L",value:{x,y}});
      
      $CIRCLEFORMOVE.setAttribute("data-namecorner","top-left");
      
      currentBorde = "top";
      
      adjustCircleOfClipPathShapeTo($CIRCLEFORMOVE,x,y);
    }
    else if (numberPoint === divider * 2) {
      let x = measuresShape.x + measuresShape.width,
      y = measuresShape.y;
      
      if (lastCommand === "Q") {
        lastValues.x = x;
        lastValues.y = y;
        
        $CIRCLEFORMOVE.setAttribute("data-indexofposition",indexLastPoint)
        $CIRCLEFORMOVE.setAttribute("data-measurestomodify","x,y");
      }
      else valuesPath.push({comandPath:"L",value:{x,y}});
      
      $CIRCLEFORMOVE.setAttribute("data-namecorner","top-right");
      
      currentBorde = "right";
      
      adjustCircleOfClipPathShapeTo($CIRCLEFORMOVE,x,y);
    }
    else if (numberPoint === divider * 3) {
      let x = measuresShape.x + measuresShape.width,
      y = measuresShape.y + measuresShape.height;
      
      if (lastCommand === "Q") {
        lastValues.x = x;
        lastValues.y = y;
        
        $CIRCLEFORMOVE.setAttribute("data-indexofposition",indexLastPoint)
        $CIRCLEFORMOVE.setAttribute("data-measurestomodify","x,y");
      }
      else valuesPath.push({comandPath:"L",value:{x,y}});
      
      $CIRCLEFORMOVE.setAttribute("data-namecorner","bottom-right");
      
      currentBorde = "bottom";
      
      adjustCircleOfClipPathShapeTo($CIRCLEFORMOVE,x,y);
    }
    else if (currentBorde === "left") {
      let x1 = lastValues.x,
      y1 = lastValues.y - distanceBettweenPointsInY;
      
      valuesPath.push({
        comandPath:"Q",
        value:{
          x1,y1
        }
      })
      
      addNumberOfSideCircleForCustomClipPathShape($CIRCLEFORMOVE,currentBorde,1);
      
      adjustCircleOfClipPathShapeTo($CIRCLEFORMOVE,x1,y1);
      
      $CIRCLEFORMOVE.setAttribute("data-measurestomodify","x1,y1");
    }
    else if (currentBorde === "top") {
      let x1 = lastValues.x + distanceBettweenPointsInX,
      y1 = lastValues.y;
      
      valuesPath.push({
        comandPath:"Q",
        value:{
          x1,y1
        }
      })
      
      $CIRCLEFORMOVE.setAttribute("data-indexofposition",indexLastPoint + 1);
      
      addNumberOfSideCircleForCustomClipPathShape($CIRCLEFORMOVE,currentBorde,1);
      
      adjustCircleOfClipPathShapeTo($CIRCLEFORMOVE,x1,y1);
      
      $CIRCLEFORMOVE.setAttribute("data-measurestomodify","x1,y1");
    }
    else if (currentBorde === "right") {
      let x1 = lastValues.x,
      y1 = lastValues.y + distanceBettweenPointsInY;
      
      valuesPath.push({
        comandPath:"Q",
        value:{
          x1,y1
        }
      })
      
      $CIRCLEFORMOVE.setAttribute("data-indexofposition",indexLastPoint + 1);
      
      addNumberOfSideCircleForCustomClipPathShape($CIRCLEFORMOVE,currentBorde,1);
      
      adjustCircleOfClipPathShapeTo($CIRCLEFORMOVE,x1,y1);
      
      $CIRCLEFORMOVE.setAttribute("data-measurestomodify","x1,y1");
    }
    else if (currentBorde === "bottom") {
      let x1 = lastValues.x - distanceBettweenPointsInX,
      y1 = lastValues.y,
      {x,y} = valuesPath[0].value;
      
      valuesPath.push({
        comandPath:"Q",
        value:{
          x1,y1,x,y
        }
      })
      
      $CIRCLEFORMOVE.setAttribute("data-indexofposition",indexLastPoint + 1);
      
      addNumberOfSideCircleForCustomClipPathShape($CIRCLEFORMOVE,currentBorde,1);
      
      adjustCircleOfClipPathShapeTo($CIRCLEFORMOVE,x1,y1);
      
      $CIRCLEFORMOVE.setAttribute("data-measurestomodify","x1,y1");
    }
  }
  
  valuesPath.push({
    comandPath:"Z",
    value:""
  })
  
  return valuesPath;
}

function getPathValuesWithStrokeBezierCuadraticInCorners (divider,distanceBettweenPointsInX,distanceBettweenPointsInY,measuresShape) {
  const {pointsInBorders} = toolSelected.valuesSettingClipPath;
  
  let valuesPath = [],
  currentBorde = "left",
  numberSideBetweenCorners = 1;
  
  for (let numberPoint = 1;numberPoint <= pointsInBorders;numberPoint++) {
    let lenghtValuesPath = valuesPath.length;
    
    let $CIRCLEFORMOVE = addCircleElementOfClipPathShape(lenghtValuesPath);
    
    let lastItem = valuesPath.at(-1);
    
    if (numberPoint === pointsInBorders) {
      let x1 = measuresShape.x,
      y1 = measuresShape.y + measuresShape.height,
      {x,y} = valuesPath[0].value;
      
      valuesPath.push({comandPath:"Q",value:{x1,y1,x,y}});
      
      $CIRCLEFORMOVE.setAttribute("data-namecorner","bottom-left");
      
      $CIRCLEFORMOVE.setAttribute("data-measurestomodify","x1,y1");
      
      adjustCircleOfClipPathShapeTo($CIRCLEFORMOVE,x1,y1);
    }
    else if (numberPoint === divider) {
      let x1 = measuresShape.x,
      y1 = measuresShape.y;
      
      valuesPath.push({comandPath:"Q",value:{x1,y1}});
      
      $CIRCLEFORMOVE.setAttribute("data-namecorner","top-left");
      
      $CIRCLEFORMOVE.setAttribute("data-measurestomodify","x1,y1");
      
      currentBorde = "top";
      
      adjustCircleOfClipPathShapeTo($CIRCLEFORMOVE,x1,y1);
      
      numberSideBetweenCorners = 1;
    }
    else if (numberPoint === divider * 2) {
      let x1 = measuresShape.x + measuresShape.width,
      y1 = measuresShape.y;
      
      valuesPath.push({comandPath:"Q",value:{x1,y1}});
      
      $CIRCLEFORMOVE.setAttribute("data-namecorner","top-right");
      $CIRCLEFORMOVE.setAttribute("data-measurestomodify","x1,y1");
      
      currentBorde = "right";
      
      adjustCircleOfClipPathShapeTo($CIRCLEFORMOVE,x1,y1);
      
      numberSideBetweenCorners = divider - 1;
    }
    else if (numberPoint === divider * 3) {
       let x1 = measuresShape.x + measuresShape.width,
      y1 = measuresShape.y + measuresShape.height;
      
      valuesPath.push({comandPath:"Q",value:{x1,y1}});
      
      $CIRCLEFORMOVE.setAttribute("data-namecorner","bottom-right");
      $CIRCLEFORMOVE.setAttribute("data-measurestomodify","x1,y1");
      
      currentBorde = "bottom";
      
      adjustCircleOfClipPathShapeTo($CIRCLEFORMOVE,x1,y1);
      
      numberSideBetweenCorners = divider - 1;
    }
    else if (currentBorde === "left") {
      let x,y,comandPath = "L";
      
      if (!lastItem) {
        x = measuresShape.x;
        y = measuresShape.y + measuresShape.height - distanceBettweenPointsInY;
        comandPath = "M";
      }
      else {
        x = lastItem.value.x;
        y = lastItem.value.y - distanceBettweenPointsInY;
      }
      
      valuesPath.push({
        comandPath,
        value:{
          x,y
        }
      })
      
      addNumberOfSideCircleForCustomClipPathShape($CIRCLEFORMOVE,currentBorde,numberSideBetweenCorners);
      
      adjustCircleOfClipPathShapeTo($CIRCLEFORMOVE,x,y);
      
      numberSideBetweenCorners++
    }
    else if (currentBorde === "top") {
      let x,y;
      if (lastItem.comandPath === "Q" && !("x" in lastItem.value)) {
        x = lastItem
        .value.x1 + distanceBettweenPointsInX;
        y = lastItem.value.y1;
        
        lastItem.value.x = x;
        lastItem.value.y = y;
        
        $CIRCLEFORMOVE.setAttribute("data-measurestomodify","x,y");
        $CIRCLEFORMOVE.setAttribute("data-indexofposition",lenghtValuesPath - 1);
      } else {
        x = lastItem.value.x + distanceBettweenPointsInX;
        y = lastItem.value.y;
        
        valuesPath.push({
        comandPath:"L",
        value:{x,y}
        })
      }
      
      addNumberOfSideCircleForCustomClipPathShape($CIRCLEFORMOVE,currentBorde,numberSideBetweenCorners);
      
      adjustCircleOfClipPathShapeTo($CIRCLEFORMOVE,x,y);
      
      numberSideBetweenCorners++;
    }
    else if (currentBorde === "right") {
      let x,y;
      if (lastItem.comandPath === "Q" && !("x" in lastItem.value)) {
        x = lastItem.value.x1;
        y = lastItem.value.y1 + distanceBettweenPointsInY;
        
        lastItem.value.x = x;
        lastItem.value.y = y;
        
        $CIRCLEFORMOVE.setAttribute("data-measurestomodify","x,y");
        $CIRCLEFORMOVE.setAttribute("data-indexofposition",lenghtValuesPath - 1);
      } else {
        x = lastItem.value.x;
        y = lastItem.value.y + distanceBettweenPointsInY;
        
        valuesPath.push({
        comandPath:"L",
        value:{x,y}
        })
      }
      
      addNumberOfSideCircleForCustomClipPathShape($CIRCLEFORMOVE,currentBorde,numberSideBetweenCorners);
      
      adjustCircleOfClipPathShapeTo($CIRCLEFORMOVE,x,y);
      
      numberSideBetweenCorners--;
    }
    else if (currentBorde === "bottom") {
      let x,y;
      if (lastItem.comandPath === "Q" && !("x" in lastItem.value)) {
        x = lastItem.value.x1 - distanceBettweenPointsInX;
        y = lastItem.value.y1;
        
        lastItem.value.x = x;
        lastItem.value.y = y;
        
        $CIRCLEFORMOVE.setAttribute("data-measurestomodify","x,y");
        $CIRCLEFORMOVE.setAttribute("data-indexofposition",lenghtValuesPath - 1);
      } else {
        x = lastItem.value.x - distanceBettweenPointsInX;
        y = lastItem.value.y;
        
        valuesPath.push({
        comandPath:"L",
        value:{x,y}
        })
      }
      
      addNumberOfSideCircleForCustomClipPathShape($CIRCLEFORMOVE,currentBorde,numberSideBetweenCorners);
      
      adjustCircleOfClipPathShapeTo($CIRCLEFORMOVE,x,y);
      
      numberSideBetweenCorners--;
    }
  }
  
  valuesPath.push({
    comandPath:"Z",
    value:""
  })
  
  return valuesPath;
}

function addedCirclesForResizeShapeClipPath () {
  const $CONTAINERSHAPESMAIN = $aplication.querySelector("#container-canvas #container-SHAPES-INSERT");
  
  let {pointsInBorders,strokeType} = toolSelected.valuesSettingClipPath,
  {strokeTypeBefore} = toolSelected.propsContainerAdjustShapes;
  
  const $SHAPEFILL = $CONTAINERSHAPESMAIN.querySelector("svg .shape-SVG.fill");
  
  let measuresShape = $SHAPEFILL.getBBox();
  
  $CONTAINERSHAPESMAIN.querySelectorAll(".circles-custom-clip-path").forEach($CIRCLE=>{
    $CIRCLE.remove();
  });
  
  if (strokeType === "bezier-cuadratic-in-sides" || strokeTypeBefore === "bezier-cuadratic-in-sides" || strokeType === "bezier-cuadratic-in-corners" || strokeTypeBefore === "bezier-cuadratic-in-corners") {
    let {xmovedshadow,ymovedshadow} = $SHAPEFILL.dataset,
    strokeWidth = $CONTAINERSHAPESMAIN.querySelector("svg .shape-SVG.stroke").getAttribute("stroke-width");
    
    let pxMoveShadowHigher = Math.max(Math.abs(Number(xmovedshadow)),Math.abs(Number(ymovedshadow)));
    
    let widthCorrectSVG = Number(strokeWidth) + (pxMoveShadowHigher * 2) + measuresShape.width,heightCorrectSVG = Number(strokeWidth) + (pxMoveShadowHigher * 2) + measuresShape.height;
    
    const {widthSVG,heightSVG,lastDegRotate} = toolSelected.propsContainerAdjustShapes;
    
    let diferenceX = widthCorrectSVG - widthSVG,diferenceY = heightCorrectSVG - heightSVG;
    
    changeTransformOriginContainers("left top","left top");
    
    let diferenceXForResizeFromCenter = diferenceX / 2,
    diferenceYForResizeFromCenter = diferenceY / 2;
    
    adjustContainerToResize("top-left",lastDegRotate,diferenceYForResizeFromCenter,0,diferenceXForResizeFromCenter,0,heightCorrectSVG,0,widthCorrectSVG,0);
    
    measuresShape.x = (widthCorrectSVG / 2) - (measuresShape.width / 2);
    measuresShape.y = (heightCorrectSVG / 2) - (measuresShape.height / 2);
    
    toolSelected.propsContainerAdjustShapes.widthSVG = widthCorrectSVG
    toolSelected.propsContainerAdjustShapes.heightSVG = heightCorrectSVG;
  }
  
  let $CIRCLEFOROPENSETTINGSHAPE = $CONTAINERSHAPESMAIN.querySelector(".circle-setting-shape-clip-path");
  
  let divider = pointsInBorders / 4;
  
  let distanceBettweenPointsInY = measuresShape.height / divider;
  
  let distanceBettweenPointsInX = measuresShape.width / divider;
  
  let valuesPath;
  if (strokeType === "square") valuesPath = getPathValuesWithStrokeSQUARE(divider,distanceBettweenPointsInX,distanceBettweenPointsInY,measuresShape);
  else if (strokeType === "bezier-cuadratic-in-sides") valuesPath = getPathValuesWithStrokeBezierCuadraticInSides(divider,distanceBettweenPointsInX,distanceBettweenPointsInY,measuresShape);
  else if (strokeType === "bezier-cuadratic-in-corners") valuesPath = getPathValuesWithStrokeBezierCuadraticInCorners(divider,distanceBettweenPointsInX,distanceBettweenPointsInY,measuresShape);
  
  if (!$CIRCLEFOROPENSETTINGSHAPE) {
    $CONTAINERSHAPESMAIN.insertAdjacentHTML("beforeend",`<div class="circle-setting-shape-clip-path"></div>`);
    
    $CONTAINERSHAPESMAIN.querySelector(".circle-setting-shape-clip-path").ontouchstart = showToolsOfSettingOfShapeClipPath;
  }
  
  toolSelected.variablesShapeClipPathTemporal = {
    valuesPathShape:valuesPath
  }
}

function moveCirclePointClipPath (e) {
  const $CIRCLEMOVING = e.target;
  
  if (e.type === "touchstart") shrinkContainerCorrectIfExist();
  
  const {runningshrinkcontainer} = $aplication.dataset;
  
  let cancelExecution = e.currentTarget.dataset.cancelexecution;
  
  if (cancelExecution && e.type === "touchend") {
    e.currentTarget.removeAttribute("data-cancelexecution");
    return;
  }
  
  if (runningshrinkcontainer || cancelExecution) {
    e.currentTarget.setAttribute("data-cancelexecution","true");
    return;
  }
  
  const {clientX,clientY} = e.type !== "touchend" ? e.touches[0] : {};
  
  if (e.type === "touchstart") {
    toolSelected.beforeClientX = clientX;
    toolSelected.beforeClientY = clientY;
    changeTransformOriginContainers("left top","left top");
  }
  
  if (e.type !== "touchmove") return;
  
  let {beforeClientY,beforeClientX} = toolSelected;
  
  let pxMoveInX = clientX - beforeClientX,
  pxMoveInY = clientY - beforeClientY;
  
  toolSelected.beforeClientY = clientY;
  toolSelected.beforeClientX = clientX;
  
  const {indexofposition,measurestomodify} = $CIRCLEMOVING.dataset;
  
  let {lastDegRotate} = toolSelected.propsContainerAdjustShapes;
  
  const $CONTAINERSHAPES = $aplication.querySelector("#container-canvas .container-SHAPES-insert");
  
  const {variablesShapeClipPathTemporal} = toolSelected;
  
  const {valuesPathShape} = variablesShapeClipPathTemporal;
  
  let atrNameInX = "x",
  atrNameInY = "y";
  
  if (measurestomodify) [atrNameInX,atrNameInY] = measurestomodify.split(",");
  
  const position = valuesPathShape[Number(indexofposition)].value;
  
  let x = position[atrNameInX],
  y = position[atrNameInY];
  
  let {diferenceX,diferenceY} = getPxAddedInBothAxisInToResizeShape(lastDegRotate,pxMoveInX,pxMoveInY,"bottom-right",x + pxMoveInX,y + pxMoveInY,x,y);
  
  customClipPathShape(Number(indexofposition),measurestomodify,$CONTAINERSHAPES,diferenceX,diferenceY,x,y,lastDegRotate,$CIRCLEMOVING);
}

function getPercentageInSizeForUseInKeepAspectRatioShape (idshape,widthContainer,heightContainer) {
  if (idshape === "text") {
    const {variablesShapeTextTemporal} = toolSelected;
    
    variablesShapeTextTemporal.lockRatioPercentageHeightInWidth = (heightContainer * 100) / widthContainer;
    variablesShapeTextTemporal.lockRatioPercentageWidthInHeight = (widthContainer * 100) / heightContainer;
  } else {
    toolSelected.variablesOfLockRatio = {
      lockRatioPercentageHeightInWidth:(heightContainer * 100) / widthContainer,
      lockRatioPercentageWidthInHeight:(widthContainer * 100) / heightContainer
    }
  }
}

function adjustWidthContainer (widthOriginalLine,$CONTAINERLINE) {
  const widthContainerSHAPES = getPropertyValueElement("width",$CONTAINERLINE);
  
  const diferenceWidth = widthOriginalLine - widthContainerSHAPES;
  
  setPropertyElement($CONTAINERLINE,"width",`${widthContainerSHAPES + diferenceWidth}px`);
  
  $CONTAINERLINE.querySelectorAll(".shape").forEach($SHAPE=>{
    const width = getPropertyValueElement("width",$SHAPE);
    
    setPropertyElement($SHAPE,"width",`${width + diferenceWidth}px`);
  })
}

function cloneLastContainerLine ($CONTAINERMAIN,leftNewContainer,indexSize) {
  const $SHAPEFILL = $CONTAINERMAIN.querySelector("svg .shape-SVG.fill"),
  $SHAPESTROKE = $CONTAINERMAIN.querySelector("svg .shape-SVG.stroke"),
  $SHADOW = $CONTAINERMAIN.querySelector("svg .shadow-SVG");
  
  const $CONTAINERSVG = $CONTAINERMAIN.querySelector("svg");
  
  const $SHADOWCLONE = $SHADOW.cloneNode(true);
  
  const $SHAPEFILLCLONE = $SHAPEFILL.cloneNode(true);
  
  const $SHAPESTROKECLONE = $SHAPESTROKE.cloneNode(true);
  
  $SHAPEFILLCLONE.setAttribute("x",leftNewContainer);
  $SHAPESTROKECLONE.setAttribute("x",leftNewContainer);
  
  $SHAPEFILLCLONE.setAttribute("data-indexsize",indexSize);
  
  $SHADOWCLONE.setAttribute("x",leftNewContainer + Number($SHAPEFILL.dataset.xmovedshadow));
  
  $CONTAINERSVG.insertBefore($SHADOWCLONE,$SHAPEFILL);
  
  $CONTAINERSVG.insertBefore($SHAPEFILLCLONE,$SHAPESTROKE);
  
  $CONTAINERSVG.appendChild($SHAPESTROKECLONE);
}

function getPercentageNormalizedWidthLine (percentageInput) {
  //200 ES EL MAX VALUE DE EL INPUT RANGE Y EL 80 ES UN VALOR MINIMO RELATIVO NO ABSOLUTO
  let diferenceForMaxPercentage = 200 - 80;
  let percentage = percentageInput / 2;
  
  return (80 + ((percentage * diferenceForMaxPercentage) / 100)) / 2;
}

function addOrRemoveMiniContainerShapeLINEInModalFigures ($CONTAINERMAIN) {
  let {typesLine,typeLineSelectedPrevious,valueInputPrevious,gapBettweenLines} = toolSelected.modalFigures.ALLTYPESLINE;
  
  const {widthOriginalShape,heightOriginalShape} = getSizeBaseOfShape("line");
  
  const widthContainerPreviewShape = getPropertyValueElement("width",$CONTAINERMAIN),
  heightContainerPreviewShape = getPropertyValueElement("height",$CONTAINERMAIN);
  
  const $CONTAINERSVG = $CONTAINERMAIN.querySelector("svg");
  
  let leftFirstRect = (widthContainerPreviewShape / 2) - (widthOriginalShape / 2);
  
  let indexLineInPattern = 0;
  
  const {timesRepeatPx,maxRepeatPattern} = typesLine[typeLineSelectedPrevious];
  
  //40 ES EL VALOR BASE PARA SHAPE
  let thicknessPX = 40;
  
  let percentageNormalized = getPercentageNormalizedWidthLine(valueInputPrevious);
  
  gapBettweenLines = ((percentageNormalized * gapBettweenLines) / 100) * thicknessPX;
  
  let widthAcumulate = 0;
  for (let indexContainer = 1;;indexContainer++) {
    let amountToMultiply = (percentageNormalized * timesRepeatPx[indexLineInPattern]) / 100;
    let widthCorrectContainerLine = amountToMultiply * thicknessPX;
    
    widthAcumulate += widthCorrectContainerLine;
    
    let widthAdjustContainer;
    if (widthAcumulate > widthOriginalShape && (widthAdjustContainer = widthCorrectContainerLine - (widthAcumulate - widthOriginalShape)) > 0) {
      const $LASTRECTSHADOW = $CONTAINERSVG.lastElementChild;
      
      let x = Number($LASTRECTSHADOW.getAttribute("x"));
      let width = Number($LASTRECTSHADOW.getAttribute("width"));
      
      const $SHADOTOSHAPECOPY = $LASTRECTSHADOW.cloneNode(true);
      
      $SHADOTOSHAPECOPY.setAttribute("x",x + width + gapBettweenLines);
      $SHADOTOSHAPECOPY.setAttribute("width",widthAdjustContainer);
      
      $CONTAINERSVG.appendChild($SHADOTOSHAPECOPY);
      break;
    }
    else if (widthAcumulate > widthOriginalShape) break;
    else if (indexContainer === 1) {
      const HTMLRECT = `<rect class="shadow-SVG" x="${leftFirstRect}" y="${(heightContainerPreviewShape / 2) - (heightOriginalShape / 2)}" width="${widthCorrectContainerLine}" height="${heightOriginalShape}"></rect>`;
      
      $CONTAINERSVG.insertAdjacentHTML("beforeend",HTMLRECT);
      
      widthAcumulate += gapBettweenLines
    }
    else {
      const $LASTRECTSHADOW = $CONTAINERSVG.lastElementChild;
      
      let x = Number($LASTRECTSHADOW.getAttribute("x"));
      let width = Number($LASTRECTSHADOW.getAttribute("width"));
      
      const $SHADOTOSHAPECOPY = $LASTRECTSHADOW.cloneNode(true);
      
      $SHADOTOSHAPECOPY.setAttribute("x",x + width + gapBettweenLines);
      $SHADOTOSHAPECOPY.setAttribute("width",widthCorrectContainerLine);
      
      $CONTAINERSVG.appendChild($SHADOTOSHAPECOPY);
      
      widthAcumulate += gapBettweenLines
    }
    
    indexLineInPattern = indexLineInPattern + 1 < maxRepeatPattern ? indexLineInPattern + 1 : 0;
  }
  
  $CONTAINERSVG.querySelectorAll(".shadow-SVG").forEach($RECT=>{
    const $SHAPEFILL = $RECT.cloneNode(true);
    
    $SHAPEFILL.classList.replace("shadow-SVG","shape-SVG");
    
    $SHAPEFILL.classList.add("fill");
    
    $SHAPEFILL.setAttribute("fill","url(#gradientForFill)");
    
    const $SHAPESTROKE = $SHAPEFILL.cloneNode(true);
    
    $SHAPESTROKE.classList.replace("fill","stroke");
    
    $SHAPESTROKE.setAttribute("fill","none");
    
    $SHAPESTROKE.setAttribute("stroke","url(#gradientForStroke)");
    
    $CONTAINERSVG.appendChild($SHAPEFILL)
    $CONTAINERSVG.appendChild($SHAPESTROKE)
  })
}

function addOrRemoveMiniContainerShapeLINE ($CONTAINERMAIN,indexShape) {
  const {typesLine,typeLineSelected,valueInput,gapBettweenLines} = toolSelected.modalFigures.ALLTYPESLINE;
  
  let {thicknessPX} = toolSelected.valuesSettingThicknessSHAPELINE;
  
  //ELIMINAR DE toolSelected
  let {blurPxShadow} = toolSelected;
  
  const $ALLSHAPESFILL = $CONTAINERMAIN.querySelectorAll("svg .shape-SVG.fill"),
  $ALLSHAPESSTROKE = $CONTAINERMAIN.querySelectorAll("svg .shape-SVG.stroke"),
  $ALLSHADOWS = $CONTAINERMAIN.querySelectorAll("svg .shadow-SVG");
  
  const $lastLineFILL = $ALLSHAPESFILL[indexShape],
  $lastLineSTROKE = $ALLSHAPESSTROKE[indexShape],
  $lastShadow = $ALLSHADOWS[indexShape];
  
  const {xmovedshadow,ymovedshadow} = $lastLineFILL.dataset;
  
  let higherPxMovedShadow = Math.max(Math.abs(Number(xmovedshadow)),Math.abs(Number(ymovedshadow)));
  
  const newWidthAdjust = getPropertyValueElement("width",$CONTAINERMAIN) - (higherPxMovedShadow + blurPxShadow);
  
  let leftLastLine = Number($lastLineFILL.getAttribute("x")),
  topLastLine = Number($lastLineFILL.getAttribute("y")),
  sizeRelativeToContainer = newWidthAdjust - leftLastLine;
  
  let strokeWidth = Number($lastLineSTROKE.getAttribute("stroke-width"));
  
  let indexLineInPattern = Number($lastLineFILL.dataset.indexsize);
  
  const {timesRepeatPx,maxRepeatPattern} = typesLine[typeLineSelected];
  
  let percentageNormalized = getPercentageNormalizedWidthLine(valueInput);
  
  let amountToMultiply = (percentageNormalized * timesRepeatPx[indexLineInPattern]) / 100;
  
  const widthOfIndexCurrent = amountToMultiply * thicknessPX;
  
  let widthForAdjustWithBorderRight = sizeRelativeToContainer - (strokeWidth / 2);
  
  let widthForAdjustShape = widthOfIndexCurrent + (strokeWidth / 2)
  
  if (sizeRelativeToContainer <= widthForAdjustShape && (widthForAdjustWithBorderRight > strokeWidth || indexShape === 0)) {
    $lastLineFILL.setAttribute("width",widthForAdjustWithBorderRight);
    $lastLineSTROKE.setAttribute("width",widthForAdjustWithBorderRight);
    $lastShadow.setAttribute("width",widthForAdjustWithBorderRight);
  }
  else if (widthForAdjustWithBorderRight <= strokeWidth) {
    $lastLineFILL.remove();
    $lastLineSTROKE.remove();
    $lastShadow.remove();
    addOrRemoveMiniContainerShapeLINE($CONTAINERMAIN,indexShape - 1);
    return;
  }
  else if (sizeRelativeToContainer > widthForAdjustShape) {
    $lastLineFILL.setAttribute("width",widthOfIndexCurrent);
    $lastLineSTROKE.setAttribute("width",widthOfIndexCurrent);
    $lastShadow.setAttribute("width",widthOfIndexCurrent);
  }
  
  let heightShape = thicknessPX / 2;
  
  $lastLineFILL.setAttribute("height",heightShape);
  $lastLineSTROKE.setAttribute("height",heightShape);
  $lastShadow.setAttribute("height",heightShape);
  
  const widthCurrentLastLine = Number($lastLineFILL.getAttribute("width"));
  
  let gapRelative = newWidthAdjust - (leftLastLine + widthCurrentLastLine);
  
  let gap = ((percentageNormalized * gapBettweenLines) / 100) * thicknessPX;
  
  const insertNewLine = gapRelative >= gap;
  
  let checkNextWidthContainerIndex = indexLineInPattern + 1 < maxRepeatPattern ? indexLineInPattern + 1 : 0;
  
  let widthNextShapeThight = (newWidthAdjust - (leftLastLine + widthCurrentLastLine + gap)) - (strokeWidth / 2);
  
  let nextIndexLine;
  if (insertNewLine && widthNextShapeThight > strokeWidth) nextIndexLine = checkNextWidthContainerIndex;
  
  let $NEXTSHAPE = $ALLSHAPESFILL[indexShape + 1];
  
  if (nextIndexLine >= 0 && !$NEXTSHAPE) {
    let leftNewContainer = leftLastLine + widthCurrentLastLine + gap;
    
    let indexNewContainer = indexShape + 1;
    
    cloneLastContainerLine($CONTAINERMAIN,leftNewContainer,nextIndexLine);
    
    addOrRemoveMiniContainerShapeLINE($CONTAINERMAIN,indexNewContainer);
  }
  else if (nextIndexLine >= 0) {
    const $NEXTSHADOW = $ALLSHADOWS[indexShape + 1];
    
    const $NEXTSHAPESTROKE = $ALLSHAPESSTROKE[indexShape + 1];
    
    let leftForNextShape = leftLastLine + widthCurrentLastLine + gap;
    
    $NEXTSHAPE.setAttribute("x",leftForNextShape);
    $NEXTSHAPESTROKE.setAttribute("x",leftForNextShape);
    $NEXTSHADOW.setAttribute("x",leftForNextShape + Number(xmovedshadow));
    
    addOrRemoveMiniContainerShapeLINE($CONTAINERMAIN,indexShape + 1);
  }
  else if ($NEXTSHAPE) {
    for (let numberContainer = indexShape + 1;;numberContainer++) {
      const $SHAPEFILL = $ALLSHAPESFILL[numberContainer],
      $SHAPESTROKE = $ALLSHAPESSTROKE[numberContainer],
      $SHADOW = $ALLSHADOWS[numberContainer];
      
      if ($SHAPEFILL) {
        $SHAPEFILL.remove();
        $SHADOW.remove();
        $SHAPESTROKE.remove();
      }
      else break;
    }
  }
}

function updateButtonsRotateSHAPE () {
  const {rotationHandle,rotationHandleNinetyDeg} = toolSelected.optionsPositioningSHAPE,
  $CONTAINERROTATESHAPE = $(".aplication > .square-of-adjust-SHAPES .container-button-rotate-SHAPES"),
  $CONTAINERROTATESHAPENINETYDEG = $(".aplication > .square-of-adjust-SHAPES .container-button-rotate-SHAPES .container-button-rotate-ninety-deg");
  
  if (rotationHandle && rotationHandleNinetyDeg) {
    $CONTAINERROTATESHAPE.classList.remove("visibility-hidden");
    $CONTAINERROTATESHAPENINETYDEG.classList.remove("visibility-hidden");
    
    $CONTAINERROTATESHAPE.querySelector(".button-rotate").setAttribute("id","button-rotate");
    $CONTAINERROTATESHAPENINETYDEG.querySelector(".button-rotate").setAttribute("id","button-rotate-ninety-deg");
  }
  else if (!rotationHandle && !rotationHandleNinetyDeg) {
    $CONTAINERROTATESHAPE.classList.add("visibility-hidden");
    $CONTAINERROTATESHAPENINETYDEG.classList.add("visibility-hidden");
  }
  else {
    $CONTAINERROTATESHAPE.classList.remove("visibility-hidden");
    $CONTAINERROTATESHAPENINETYDEG.classList.add("visibility-hidden");
    
    let idName;
    if (rotationHandle) idName = "button-rotate";
    else idName = "button-rotate-ninety-deg";
    
    $CONTAINERROTATESHAPE.querySelector(".button-rotate").setAttribute("id",idName);
  }
}

function touchInputRangeSettingShape (e) {
  const $INPUT = e.target,
  $mark = $aplication.querySelector(".marker-setting-shape");
  
  let idInput = $INPUT.id;
  
  let leftMarker;
  if (e.type !== "touchend") {
    let TOUCH = e.touches[0],
    xApication;
    
    if (e.type === "touchstart") {
      e.preventDefault();
      let measuresAplication = $aplication.getBoundingClientRect(),
      {left,top} = $(".aplication .container-setting-SHAPE").getBoundingClientRect(),
      {x,width} = $INPUT.getBoundingClientRect(),
      inputLEFT = x,
      inputRIGHT = x + width;
      
      $INPUT.setAttribute("data-leftaplication",measuresAplication.left);
      
      $INPUT.setAttribute("data-leftinput",inputLEFT);
      $INPUT.setAttribute("data-rightinput",inputRIGHT);
      
      xApication = measuresAplication.x;
      
      const topMarker = (top - measuresAplication.top) - 60;
      
      setPropertyElement($mark,"top",`${topMarker}px`);
      
      if (e.manual) {
        let symbolMark = getSymbolMeasureSettingSHAPE(idInput);
        
        setPropertyElement($mark,"left",`${(TOUCH.clientX - xApication) - 22.5}px`);
        $mark.innerText = `${$INPUT.valueAsNumber}${symbolMark}`;
        $mark.classList.remove("hide");
      }
    }
    else xApication = Number($INPUT.dataset.leftaplication);
    
    leftMarker = (TOUCH.clientX - xApication) - 22.5;
  }
  else {
    $mark.classList.add("hide");
    $mark.innerText = "";
    
    if ($INPUT.dataset.movefinger) {
      $INPUT.removeAttribute("data-movefinger");
      return;
    }
    
    let {clientX} = e.changedTouches[0],
    {leftinput,rightinput} = $INPUT.dataset
    
    leftinput = Number(leftinput);
    rightinput = Number(rightinput);
    
    let widthAdjust = (rightinput - 11)  - (leftinput + 4),
    xTouch = clientX - (leftinput + 4),
    porcentage = (xTouch * 100) / widthAdjust,
    value = (porcentage * Number($INPUT.max)) / 100;
    
    $INPUT.value = value;
    updateValuesCorrectOfShape($INPUT.valueAsNumber,idInput);
  }
  
  if (e.type === "touchmove") {
    let {clientX} = e.touches[0],
    {leftinput,rightinput} = $INPUT.dataset
    
    leftinput = Number(leftinput);
    rightinput = Number(rightinput);
    
    if (!e.manual) {
      clearTimeout(toolSelected.idtimeoutmarker);
      
      let width = (rightinput - 11)  - (leftinput + 4),
      xTouch = clientX - (leftinput + 4),
      porcentage = (xTouch * 100) / width
      ,maxVALUE = Number($INPUT.max),
      minVALUE = Number($INPUT.min),
      value = ((porcentage * (maxVALUE - minVALUE)) / 100) + minVALUE;
      
      $INPUT.value = value;
      $INPUT.setAttribute("data-movefinger","true");
    }
    
    let value = $INPUT.valueAsNumber;
    
    updateValuesCorrectOfShape(value,idInput);
    
    let symbolMark = getSymbolMeasureSettingSHAPE(idInput);
    
    let lastValueMark = $mark.innerText;
    if (lastValueMark === $INPUT.value + symbolMark) return;
    
    $mark.innerText = $INPUT.value + symbolMark;
    
    if (clientX >= (leftinput + 4) && clientX <= (rightinput - 11)) {
      setPropertyElement($mark,"left",`${leftMarker}px`);
    }
    
    $mark.classList.remove("hide");
  }
}

function getSymbolMeasureSettingSHAPE (typeSettingInput) {
  let symbolMark;
  if (typeSettingInput === "round-border-range" || typeSettingInput === "tail-range") symbolMark = "%";
  else symbolMark = "px";
  
  return symbolMark;
}

function adjustContainerToResize (direction,lastDegRotate,pxAddedInYCShapes,pxAddedInYCAdjustShapes,pxAddedInXCShapes,pxAddedInXCAdjustShapes,newHeightCShapes,newHeightCAdjustShapes,newWidthCShapes,newWidthCAdjustShapes) {
  const $CONTAINERADJUSTSHAPES = $aplication.children["square-adjust-SHAPES"],
  $CONTAINERSHAPESMAIN = $aplication.children["container-canvas"].children["container-SHAPES-INSERT"];
  
  const {x,y} = $CONTAINERSHAPESMAIN.children[direction].getBoundingClientRect(),
  positionCornerTouching = $CONTAINERADJUSTSHAPES.querySelector(`.point-${direction}`).getBoundingClientRect();
  
  let pxAmountToMoveContainers = {
    containerShapes:{
      x:0,
      y:0,
      width:newWidthCShapes,
      height:newHeightCShapes
      },
    containerAdjustShapes:{
      x:0,
      y:0,
      height:newHeightCAdjustShapes,
      width:newWidthCAdjustShapes
    }
  }
  
  if (direction === "top-right" || direction === "top-left") {
    let amountPxForContainerShapes = getAmountPxToMoveContainerForAxisY(lastDegRotate,x,y,pxAddedInYCShapes),amountPxForContainerAdjustShapes = getAmountPxToMoveContainerForAxisY(lastDegRotate,positionCornerTouching.x,positionCornerTouching.y,pxAddedInYCAdjustShapes);
    
    pxAmountToMoveContainers["containerShapes"].x = amountPxForContainerShapes.diferenceXCORNERForAxisY;
    pxAmountToMoveContainers["containerShapes"].y = amountPxForContainerShapes.diferenceYCORNERForAxisY;
    
    pxAmountToMoveContainers["containerAdjustShapes"].x = amountPxForContainerAdjustShapes.diferenceXCORNERForAxisY;
    pxAmountToMoveContainers["containerAdjustShapes"].y = amountPxForContainerAdjustShapes.diferenceYCORNERForAxisY;
  }
  
  if (direction === "top-left" || direction === "bottom-left") {
    let amountPxForContainerShapes = getAmountPxToMoveContainerForAxisX(lastDegRotate,x,y,pxAddedInXCShapes),amountPxForContainerAdjustShapes = getAmountPxToMoveContainerForAxisX(lastDegRotate,positionCornerTouching.x,positionCornerTouching.y,pxAddedInXCAdjustShapes);
    
    pxAmountToMoveContainers["containerShapes"].x += amountPxForContainerShapes.diferenceXCORNERForAxisX;
    pxAmountToMoveContainers["containerShapes"].y += amountPxForContainerShapes.diferenceYCORNERForAxisX;
    
    pxAmountToMoveContainers["containerAdjustShapes"].x += amountPxForContainerAdjustShapes.diferenceXCORNERForAxisX;
    pxAmountToMoveContainers["containerAdjustShapes"].y += amountPxForContainerAdjustShapes.diferenceYCORNERForAxisX;
  }
  
  ;[
    {element:$CONTAINERSHAPESMAIN,keyOfValues:"containerShapes"},
    {element:$CONTAINERADJUSTSHAPES,keyOfValues:"containerAdjustShapes"}
  ].forEach(({element,keyOfValues})=>{
      const LEFT = getPropertyValueElement("left",element),
      TOP = getPropertyValueElement("top",element);
      
      let propertysToChange = pxAmountToMoveContainers[keyOfValues];
      
      setPropertyElement(element,"left",`${LEFT + propertysToChange.x}px`);
      setPropertyElement(element,"top",`${TOP + propertysToChange.y}px`);
      
      setPropertyElement(element,"width",`${propertysToChange.width}px`);
      setPropertyElement(element,"height",`${propertysToChange.height}px`);
    })
}

function updateValuesCorrectOfShape (value,idInput) {
  const $CONTAINERSHAPESINSERT = $(".aplication .img .container-SHAPES-insert"),{idshape} = toolSelected.modalFigures.SHAPE;
  
  if (idshape === "square") {
    toolSelected.valuesSettingRoundBorderSHAPESQUARE.rangeValue = value;
    
    const {widthSVG,heightSVG} = toolSelected.propsContainerAdjustShapes;
    
    const {atributeToModify,valuesPathShape} = getMeasuresOfShapeInSVGContainer (idshape,widthSVG,heightSVG);
    
    toolSelected.propsContainerAdjustShapes.valuesPathShape = valuesPathShape;
    
    const $SHAPEFILL = $CONTAINERSHAPESINSERT.querySelector("svg .shape-SVG.fill"),
    $SHAPESTROKE = $CONTAINERSHAPESINSERT.querySelector("svg .shape-SVG.stroke");
    
    atributeToModify.forEach(({atribute,value})=>{
      $SHAPEFILL.setAttribute(atribute,value);
      $SHAPESTROKE.setAttribute(atribute,value);
    })
    
    updatePositionShadowInSVG();
  }
  else if (idshape === "arrowIndicator") {
    let beforeHeightSVG = toolSelected.propsContainerAdjustShapes.heightSVG,beforeWidthSVG = toolSelected.propsContainerAdjustShapes.widthSVG
    
    if (idInput === "thickness-range") {
      toolSelected.valuesSettingShapeArrowIndicator.thickness = value;
    }
    else toolSelected.valuesSettingShapeArrowIndicator.tail = value;
    
    const {myLastWidth,percentageYShadowInHeightShape,percentageXShadowInHeightShape,strokeWidth} = toolSelected.propsContainerAdjustShapes;
    
    const {thickness} = toolSelected.valuesSettingShapeArrowIndicator;
    
    let {blurPxShadow} = toolSelected;
    
    let widthForInitAspectRatio = (216.67 * thickness) / 100;
    
    let newHeightShape;
    if (myLastWidth <= widthForInitAspectRatio) newHeightShape = (46.16 * myLastWidth) / 100;
    else newHeightShape = thickness;
    
    toolSelected.modalFigures.SHAPE[idshape].height = newHeightShape;
    
    let newXShadowMove = (percentageXShadowInHeightShape * newHeightShape) / 100,
    newYShadowMove = (percentageYShadowInHeightShape * newHeightShape) / 100;
    
    const $SHAPEFILL = $CONTAINERSHAPESINSERT.querySelector("svg .shape-SVG.fill"),
    $SHAPESTROKE = $CONTAINERSHAPESINSERT.querySelector("svg .shape-SVG.stroke")
    
    $SHAPEFILL.setAttribute("data-xmovedshadow",newXShadowMove);
    $SHAPEFILL.setAttribute("data-ymovedshadow",newYShadowMove);
    
    let pxMoveShadowHigher = Math.max(Math.abs(newXShadowMove),Math.abs(newYShadowMove));
    
    let newHeightSVG = newHeightShape + strokeWidth + (pxMoveShadowHigher * 2) + (blurPxShadow * 2),newWidthSVG = myLastWidth + strokeWidth + (pxMoveShadowHigher * 2) + (blurPxShadow * 2);
    
    const {measuresCircleRight,measuresCircleLeft} = getMeasuresCirclesForResizeShape();
    
    let distanceBettweenCircles = getDistanceOfTwoPoints(measuresCircleRight.x,measuresCircleRight.y,measuresCircleLeft.x,measuresCircleLeft.y);
    
    toolSelected.propsContainerAdjustShapes.amountPxForWidthContainers.containerSHAPES = newWidthSVG - distanceBettweenCircles;
    
    toolSelected.propsContainerAdjustShapes.widthSVG = newWidthSVG;
    toolSelected.propsContainerAdjustShapes.heightSVG = newHeightSVG;
    
    const {widthSVG,heightSVG,myLastHeight,lastDegRotate} = toolSelected.propsContainerAdjustShapes;
    
    const {atributeToModify,valuesPathShape} = getMeasuresOfShapeInSVGContainer(idshape,widthSVG,heightSVG);
    
    toolSelected.propsContainerAdjustShapes.valuesPathShape = valuesPathShape;
    
    const atrMod = atributeToModify[0];
    
    $SHAPEFILL.setAttribute(atrMod.atribute,atrMod.value);
    $SHAPESTROKE.setAttribute(atrMod.atribute,atrMod.value);
    
    let newHeightContainerAdjustShapes = newHeightShape < 35 ? 35 : newHeightShape;
    
    let diferenceInHeightSVG = heightSVG - beforeHeightSVG,
    diferenceInWidthSVG = widthSVG - beforeWidthSVG,
    diferenceInHeightContainerAdjust = newHeightContainerAdjustShapes - myLastHeight;
    
    let resizeTheHeight = diferenceInHeightSVG !== 0 || diferenceInHeightContainerAdjust !== 0 || diferenceInWidthSVG !== 0;
    
    if (resizeTheHeight) {
      adjustContainerToResize("top-left",lastDegRotate,diferenceInHeightSVG / 2,diferenceInHeightContainerAdjust / 2,diferenceInWidthSVG / 2,0,heightSVG,newHeightContainerAdjustShapes,widthSVG,myLastWidth);
    }
    
    toolSelected.propsContainerAdjustShapes.myLastHeight = newHeightContainerAdjustShapes;
    
    updatePositionShadowInSVG();
  }
  else {
    const $CONTAINERADJUSTSHAPES = $aplication.children["square-adjust-SHAPES"];
    
    const {lastDegRotate,amountPxForHeightSVG} = toolSelected.propsCirclesForMoveShapeLINE;
    
    const {myLastHeight,myLastWidth} = toolSelected.propsContainerAdjustShapes;
    
    const lastThicknessPx = toolSelected.valuesSettingThicknessSHAPELINE.thicknessPX;
    
    let newHeightShape = value / 2;
    
    toolSelected.valuesSettingThicknessSHAPELINE["thicknessPX"] = value;
    
    addOrRemoveMiniContainerShapeLINE($CONTAINERSHAPESINSERT,0);
    
    const $ALLSHADOWS = $CONTAINERSHAPESINSERT.querySelectorAll("svg .shadow-SVG"),
    $ALLSHAPES = $CONTAINERSHAPESINSERT.querySelectorAll("svg .shape-SVG");
    
    setRounderToShapesLine($ALLSHADOWS,$ALLSHAPES,toolSelected.valuesSettingThicknessSHAPELINE.borderRoundActived);
    
    let lastHeightSVG = (lastThicknessPx / 2) + amountPxForHeightSVG,
    newHeightSVG = (value / 2) + amountPxForHeightSVG;
    
    let diferenceBettweenHeightContainerSVG = newHeightSVG - lastHeightSVG;
    
    if (newHeightShape <= 35) newHeightShape = 35;
    
    let diferenceBettweenHeightContainerAdjustShapes = newHeightShape - myLastHeight;
    
    toolSelected.propsContainerAdjustShapes.myLastHeight = newHeightShape;
    
    const currentWidthContainerShapesMain = getPropertyValueElement("width",$CONTAINERSHAPESINSERT);
    
    adjustContainerToResize("top-right",lastDegRotate,diferenceBettweenHeightContainerSVG / 2,diferenceBettweenHeightContainerAdjustShapes / 2,0,0,newHeightSVG,newHeightShape,currentWidthContainerShapesMain,myLastWidth);
  }
}

function hideElementMarkerSettingShape () {
  const $MARKER = $(".aplication .marker-setting-shape");
  
  if ($MARKER) {
    $MARKER.classList.add("hide");
    $MARKER.innerText = "";
  }
}

function showAndHideButtonsManipulateRangeInput (idContainerButtons) {
  const path = `.aplication .container-setting-SHAPE .buttons#${idContainerButtons}`,
  textRound = `${path} #text-name-button`
  ,subtract = `${path} #subtract`,
  add = `${path} #add`;
  
  showOrHideButtons(textRound,subtract,add)
}

function clickButtonManipulateRangeInput (e) {
  let button = e.target.id;
  
  const idContainerClicked = e.currentTarget.id;
  
  const $INPUTRANGE = e.currentTarget.nextElementSibling,
  IDINPUT = $INPUTRANGE.id;
  
  clearTimeout(toolSelected[`idTimeOut-${idContainerClicked}`]);
  clearTimeout(toolSelected.idtimeoutmarker);
  
  toolSelected[`idTimeOut-${idContainerClicked}`] = setTimeout(()=>{
    showAndHideButtonsManipulateRangeInput(idContainerClicked);
  },2000);
    
  toolSelected.idtimeoutmarker = setTimeout(()=>{
    hideElementMarkerSettingShape();
  },2000);
    
  if (button === "text-name-button") {
    showAndHideButtonsManipulateRangeInput(idContainerClicked);
    
    const {left} = $INPUTRANGE.getBoundingClientRect(),
    value = $INPUTRANGE.valueAsNumber;
    
    let clientX;
    if (IDINPUT === "round-border-range") clientX = (left + 4) + (value * 2.75);
    else if (IDINPUT === "tail-range") clientX = (left + 4) + (value * 2.65);
    else clientX = (left + 4) + (value * 2.20);
    
    touchInputRangeSettingShape({
      target:$INPUTRANGE,
      type:"touchstart",
      touches:[{clientX}],
      manual:true,
      preventDefault:()=>{}
    });
  }
  else if (button === "add" || button === "subtract") {
    $INPUTRANGE.value = button === "add" ? $INPUTRANGE.valueAsNumber + 1 : $INPUTRANGE.valueAsNumber - 1;
    
    const {left} = $INPUTRANGE.getBoundingClientRect(),
    value = $INPUTRANGE.valueAsNumber;
    
    let clientX;
    if (IDINPUT === "round-border-range") clientX = (left + 4) + (value * 2.75);
    else if (IDINPUT === "tail-range") clientX = (left + 4) + (value * 2.65);
    else clientX = (left + 4) + (value * 2.20);
    
    touchInputRangeSettingShape({
      target:$INPUTRANGE,
      type:"touchmove",
      touches:[{clientX}],
      manual:true,
      preventDefault:()=>{}
    });
  }
}

function setLastValuesInSettingBorderRoundShape () {
  const {valuesSettingRoundBorderSHAPESQUARE} = toolSelected;
  
  $$(`.aplication .container-setting-SHAPE .border-option input[type="checkbox"]`).forEach($INPUT=>{
    const direction = $INPUT.id;
    $INPUT.checked = valuesSettingRoundBorderSHAPESQUARE[direction];
  });
  
  $(".aplication .container-setting-SHAPE #round-border-range").value = valuesSettingRoundBorderSHAPESQUARE.rangeValue;
}

function changeBorderRoundShapeSquare (e) {
  const ID = e.target.id;
  const {rangeValue} = toolSelected.valuesSettingRoundBorderSHAPESQUARE;
  
  toolSelected.valuesSettingRoundBorderSHAPESQUARE[ID] = e.target.checked;
  
  updateValuesCorrectOfShape(rangeValue);
}

function initModalSettingSHAPES () {
  const {containerSettingSHAPE} = toolSelected.htmlChildren,
  HTMLMARKER = `<span class="marker-setting-shape hide"></span>`,
  $CONTAINERSHAPESINSERT = $(".aplication .img .container-SHAPES-insert"),
  {idshape} = toolSelected.modalFigures.SHAPE;
  
  let $modalContainerSettingSHAPE = $(".aplication > .container-setting-SHAPE");
  
  const $MARKER = $(".aplication .marker-setting-shape");
  
  if (!$modalContainerSettingSHAPE) {
    $aplication.insertAdjacentHTML("beforeend",containerSettingSHAPE);
    
    $modalContainerSettingSHAPE = $(".aplication > .container-setting-SHAPE");
  }
  
  if (!$MARKER) $aplication.insertAdjacentHTML("beforeend",HTMLMARKER);
  
  let htmlSettingOfShapeSelected;
  if (idshape === "square") htmlSettingOfShapeSelected = toolSelected.htmlChildren.htmlSettingShapeSQUARE;
  else if (idshape === "arrowIndicator") htmlSettingOfShapeSelected = toolSelected.htmlChildren.htmlSettingShapeArrowIndicator;
  else htmlSettingOfShapeSelected = toolSelected.htmlChildren.htmlSettingShapeLINE;
  
  $modalContainerSettingSHAPE.innerHTML = htmlSettingOfShapeSelected;
  
  const $RANGEINPUTS = $modalContainerSettingSHAPE.querySelectorAll(`input[type="range"]`),$CONTAINERBUTTONSMANIPULATERANGE = $modalContainerSettingSHAPE.querySelectorAll(".buttons");
  
  if (idshape === "square") {
    setPropertyElement($modalContainerSettingSHAPE,"--widthButtonsOfRange","70px");
    setPropertyElement($modalContainerSettingSHAPE,"--gapColumnContanier","17px");
    setPropertyElement($modalContainerSettingSHAPE,"--paddingButtonRound","8px 10px");
    
    $modalContainerSettingSHAPE.querySelectorAll(".border-option input").forEach($INPUT=>{
      $INPUT.onchange = changeBorderRoundShapeSquare;
    })
  }
  else if (idshape === "line") {
    setPropertyElement($modalContainerSettingSHAPE,"--widthButtonsOfRange","80px");
    setPropertyElement($modalContainerSettingSHAPE,"--gapColumnContanier","8px");
    
    $modalContainerSettingSHAPE.querySelector("#round-borders-switch").onclick = ({target})=>{
      const {borderRoundActived} = toolSelected.valuesSettingThicknessSHAPELINE;
  
      let activate = borderRoundActived ? false : true;
      
      toolSelected.valuesSettingThicknessSHAPELINE.borderRoundActived = activate;
      
      const $ALLSHADOWS = $CONTAINERSHAPESINSERT.querySelectorAll("svg .shadow-SVG"),$ALLSHAPES = $CONTAINERSHAPESINSERT.querySelectorAll("svg .shape-SVG")
      
      setRounderToShapesLine($ALLSHADOWS,$ALLSHAPES,activate);
      
      target.classList.toggle("selected");
    }
    
    changeTransformOriginContainers("left top","left top");
  }
  else if (idshape === "arrowIndicator") {
    setPropertyElement($modalContainerSettingSHAPE,"--widthButtonsOfRange","80px");
    setPropertyElement($modalContainerSettingSHAPE,"--gapColumnContanier","8px");
    setPropertyElement($modalContainerSettingSHAPE,"--paddingButtonRound","8px 15px");
    
    $modalContainerSettingSHAPE.querySelector("#round-tail").onclick = ({target})=>{
      const {roundTail} = toolSelected.valuesSettingShapeArrowIndicator;
      
      let round = roundTail ? false : true;
      
      toolSelected.valuesSettingShapeArrowIndicator.roundTail = round;
      
      target.classList.toggle("selected")
      
      const {widthSVG,heightSVG} = toolSelected.propsContainerAdjustShapes;
      
      let {atributeToModify,valuesPathShape} = getMeasuresOfShapeInSVGContainer("arrowIndicator",widthSVG,heightSVG);
      
      toolSelected.propsContainerAdjustShapes.valuesPathShape = valuesPathShape;
      
      const $SHAPEFILL = $aplication.querySelector(".container-SHAPES-insert svg .shape-SVG.fill"),
      $SHAPESTROKE = $aplication.querySelector(".container-SHAPES-insert svg .shape-SVG.stroke");
      
      const {atribute,value} = atributeToModify[0];
      
      $SHAPEFILL.setAttribute(atribute,value);
      $SHAPESTROKE.setAttribute(atribute,value);
      
      updatePositionShadowInSVG();
    }
    
    changeTransformOriginContainers("left top","left top");
  }
  
  $RANGEINPUTS.forEach($INPUT=>{
    $INPUT.ontouchstart = touchInputRangeSettingShape;
    $INPUT.ontouchmove = touchInputRangeSettingShape;
    $INPUT.ontouchend = touchInputRangeSettingShape;
  })
  
  $CONTAINERBUTTONSMANIPULATERANGE.forEach($CONTAINER=>{
    $CONTAINER.onclick = clickButtonManipulateRangeInput;
  })
  
  let {y,height} = $CONTAINERSHAPESINSERT.getBoundingClientRect(),
  {top} = $aplication.getBoundingClientRect(),
  topModal = (y - top) + height;
  
  clearTimeout(toolSelected[`idTimeOut-buttons-for-thickness`]);
  clearTimeout(toolSelected[`idTimeOut-buttons-for-tail`]);
  clearTimeout(toolSelected[`idTimeOut-buttons-for-round`]);
  
  setPropertyElement($modalContainerSettingSHAPE,"width","100%");
  
  setPropertyElement($modalContainerSettingSHAPE,"top",`${topModal}px`);
  setPropertyElement($modalContainerSettingSHAPE,"transform","scaleY(1)");
  
  $modalContainerSettingSHAPE.removeAttribute("data-shrink");
  
  if (idshape === "square") setLastValuesInSettingBorderRoundShape();
  else if (idshape === "arrowIndicator") setValuesInSettingToolsShapeArrowIndicator();
  else setValuesInSettingThicknessSHAPELINE();
}

function setValuesInSettingToolsShapeArrowIndicator () {
  const {tail,thickness,roundTail} = toolSelected.valuesSettingShapeArrowIndicator;
  
  if (roundTail) {
    const $BUTTONROUNDTAIL = $(".aplication > .container-setting-SHAPE #round-tail");
    $BUTTONROUNDTAIL.classList.add("selected");
  }
  
  const $INPUTTAIL = $(".aplication > .container-setting-SHAPE #tail-range"),
  $INPUTTHICKNESS = $(".aplication > .container-setting-SHAPE #thickness-range");
  
  $INPUTTAIL.value = tail;
  $INPUTTHICKNESS.value = thickness;
}

function setValuesInSettingThicknessSHAPELINE () {
  const $INPUT = $(".aplication > .container-setting-SHAPE #thickness-range"),
  {thicknessPX,borderRoundActived} = toolSelected.valuesSettingThicknessSHAPELINE;
  
  if (borderRoundActived) {
    const $BUTTONSWITCHBORDERROUND = $(".aplication > .container-setting-SHAPE #round-borders-switch");
    $BUTTONSWITCHBORDERROUND.classList.add("selected");
  }
  
  $INPUT.value = thicknessPX;
}

function shrinkContainer ($CONTAINER,lowerOpacity) {
  setPropertyElement($CONTAINER,"transform","scaleY(0)");
  
  if (lowerOpacity) setPropertyElement($CONTAINER,"opacity","0");
  
  $CONTAINER.setAttribute("data-shrink","true");
}

function touchAPLICATION ({target}) {
  const $settingSHAPEMODAL = $(".aplication > .container-setting-SHAPE"),
  $optionsOfShape = $toolsDown.querySelector(".container-tools-adjust-shape .modal-options-adjust-shape"),
  $containerButtonsMoveShape = $(".container-buttons-move-shape"),
  $containerModifyDegShape = $(".container-modify-deg-shape"),
  {modalcurrentshape} = $aplication.dataset
  
  if (target.classList.contains("aplication") && (($settingSHAPEMODAL && !$settingSHAPEMODAL.dataset.shrink) || ($optionsOfShape && !$optionsOfShape.dataset.shrink) || ($containerButtonsMoveShape && !$containerButtonsMoveShape.dataset.shrink) || ($containerModifyDegShape && !$containerModifyDegShape.dataset.shrink))) {
    addOrRemoveEventElement("removeEventListener","touchstart",touchAPLICATION,$aplication);
    addOrRemoveEventElement("removeEventListener","touchstart",shrinkContainerCorrectIfExist,$toolsUp);
    addOrRemoveEventElement("removeEventListener","touchstart",shrinkContainerCorrectIfExist,$(".aplication .img .container-SHAPES-insert"));
    
    shrinkContainerCorrectIfExist();
  }
  else if (!target.classList.contains("aplication") && (($settingSHAPEMODAL && $settingSHAPEMODAL.dataset.shrink && modalcurrentshape === "settingshape") || ($optionsOfShape && $optionsOfShape.dataset.shrink && modalcurrentshape === "optionsShape") || ($containerButtonsMoveShape && $containerButtonsMoveShape.dataset.shrink && modalcurrentshape === "buttonsMoveShape") || ($containerModifyDegShape && $containerModifyDegShape.dataset.shrink && modalcurrentshape === "toolsModifyDegShape"))) {
    addOrRemoveEventElement("removeEventListener","touchstart",touchAPLICATION,$aplication);
    addOrRemoveEventElement("removeEventListener","touchstart",shrinkContainerCorrectIfExist,$toolsUp);
    addOrRemoveEventElement("removeEventListener","touchstart",shrinkContainerCorrectIfExist,$(".aplication .img .container-SHAPES-insert"));
  }
}

function adjustShapeInEDGECANVASifOptionActived (measuresCONTAINER,velocityX,velocityY,seeBorders,$containerOfReference) {
  const {alignmentGuidesEdge} = toolSelected.optionsPositioningSHAPE
  
  let topTight,leftTight,borderNameX,borderNameY;
  
  if (alignmentGuidesEdge) {
    const {top,left,width,height} = $aplication.querySelector(".img").getBoundingClientRect(),
    nextYContainer = measuresCONTAINER.y + velocityY,
    nextXContainer = measuresCONTAINER.x + velocityX,
    positionBorderBottom = top + height,
    positionBorderRight = left + width,
    rangeInBorders = 7,
    nextPositionBottomContainer = nextYContainer + measuresCONTAINER.height,
    nextPositionRightContainer = nextXContainer + measuresCONTAINER.width;
    
    if (nextYContainer <= top + rangeInBorders && nextYContainer >= top - rangeInBorders && seeBorders.top) {
      const measuresContainer = $containerOfReference.getBoundingClientRect();
      
      topTight = top - measuresContainer.y;
      borderNameY = "top";
    }
    else if (nextYContainer >= positionBorderBottom - rangeInBorders && nextYContainer <= positionBorderBottom + rangeInBorders && seeBorders.top) {
      const yCurrentContainer = $containerOfReference.getBoundingClientRect().y;
      
      topTight = positionBorderBottom - yCurrentContainer;
      
      borderNameY = "bottom";
    }
    
    if (nextPositionBottomContainer >= positionBorderBottom - rangeInBorders && nextPositionBottomContainer <= positionBorderBottom + rangeInBorders && seeBorders.bottom) {
      const measuresCurrentContainer = $containerOfReference.getBoundingClientRect();
      topTight = positionBorderBottom - (measuresCurrentContainer.y + measuresCurrentContainer.height);
      
      borderNameY = "bottom";
    }
    else if (nextPositionBottomContainer >= top - rangeInBorders && nextPositionBottomContainer <= top + rangeInBorders && seeBorders.bottom) {
      const measuresCurrentCONTAINER = $containerOfReference.getBoundingClientRect();
      topTight = top - (measuresCurrentCONTAINER.y + measuresCurrentCONTAINER.height);
      
      borderNameY = "top";
    }
    
    if (nextXContainer <= left + rangeInBorders && nextXContainer >= left - rangeInBorders && seeBorders.left) {
      const measuresCONTAINERADJUSTSHAPES = $containerOfReference.getBoundingClientRect();
      leftTight = left - measuresCONTAINERADJUSTSHAPES.x;
      
      borderNameX = "left";
    }
    else if (nextXContainer >= positionBorderRight - rangeInBorders && nextXContainer <= positionBorderRight + rangeInBorders && seeBorders.left) {
      const xCurrentContainer = $containerOfReference.getBoundingClientRect().x;
      leftTight = positionBorderRight - xCurrentContainer;
      
      borderNameX = "right";
    }
    
    if (nextPositionRightContainer >= positionBorderRight - rangeInBorders && nextPositionRightContainer <= positionBorderRight + rangeInBorders && seeBorders.right) {
      const currentMeasureContainer = $containerOfReference.getBoundingClientRect();
      leftTight = positionBorderRight - (currentMeasureContainer.x + currentMeasureContainer.width);
      
      borderNameX = "right";
    }
    else if (nextPositionRightContainer >= left - rangeInBorders && nextPositionRightContainer <= left + rangeInBorders && seeBorders.right) {
      const measuresCurrent = $containerOfReference.getBoundingClientRect()
      leftTight = left - (measuresCurrent.x + measuresCurrent.width);
      
      borderNameX = "left";
    }
  }
  
  return {topTight,leftTight,borderNameX,borderNameY};
}

function changeBordersContainerCanvasIfRequires (oppositeAxis,value) {
  const $CONTAINERCANVAS = $aplication.children["container-canvas"];
  if (!oppositeAxis) setPropertyElement($CONTAINERCANVAS,"border",value);
}

function setValueBorderSpecificContainerCanvas (border,value) {
  setPropertyElement($aplication.children["container-canvas"],border,value);
}

function modifyNextMovementIfRequired (velocityX,velocityY,$CONTAINERREFERENCE,callLocation,SEEBORDERS) {
  const {alignmentGuidesEdge} = toolSelected.optionsPositioningSHAPE
  ,{measuresYBeforeEnterInRangeBorde,measuresXBeforeEnterInRangeBorde,firstEnteredTheEdgeRange} = toolSelected.propsContainerAdjustShapes
  ,{idshape} = toolSelected.modalFigures.SHAPE,
  {lockRatioShape} = toolSelected,
  {keepAspectRatio} = toolSelected.valuesSettingShapeText;
  
  let keepAspectRatioShapeActived = idshape === "circle" || (lockRatioShape && idshape !== "text" && idshape !== "custom-clip-path") || (keepAspectRatio && idshape === "text");
  
  let x,y,width,height;
  if (alignmentGuidesEdge) {
    const MEASURESCONTAINER = $CONTAINERREFERENCE.getBoundingClientRect();
    x = MEASURESCONTAINER.x;
    y = MEASURESCONTAINER.y;
    width = MEASURESCONTAINER.width;
    height = MEASURESCONTAINER.height;
  }

  if (measuresYBeforeEnterInRangeBorde) {
    if (callLocation === "bottom-right" || callLocation === "bottom-left") {
      height = measuresYBeforeEnterInRangeBorde.height + measuresYBeforeEnterInRangeBorde.velocityMove;
    }
    else if (callLocation === "movingShape" || callLocation === "top-right" || callLocation === "top-left") {
      y = measuresYBeforeEnterInRangeBorde.y + measuresYBeforeEnterInRangeBorde.velocityMove;
    }
    
    measuresYBeforeEnterInRangeBorde.velocityMove += velocityY;
  }
  if (measuresXBeforeEnterInRangeBorde) {
    if (callLocation === "bottom-right" || callLocation === "top-right") width = measuresXBeforeEnterInRangeBorde.width + measuresXBeforeEnterInRangeBorde.velocityMove;
    else if (callLocation === "movingShape" || callLocation === "top-left" || callLocation === "bottom-left") x = measuresXBeforeEnterInRangeBorde.x + measuresXBeforeEnterInRangeBorde.velocityMove;
    
    measuresXBeforeEnterInRangeBorde.velocityMove += velocityX;
  }
  
  const {topTight,leftTight,borderNameX,borderNameY} = adjustShapeInEDGECANVASifOptionActived({x,y,width,height},velocityX,velocityY,SEEBORDERS,$CONTAINERREFERENCE);
  
  let diferenceY,diferenceX;
  if (topTight !== undefined) {
    if (!measuresYBeforeEnterInRangeBorde) {
      let propsWork = {velocityMove:velocityY,pxMoveForBorde:topTight,borderNameY};
      if (callLocation === "top-right" || callLocation === "movingShape" || callLocation === "top-left") propsWork.y = y;
      else if (callLocation === "bottom-right" || callLocation === "bottom-left") propsWork.height = height;
      
      toolSelected.propsContainerAdjustShapes.measuresYBeforeEnterInRangeBorde = propsWork;
      
      if (keepAspectRatioShapeActived && !firstEnteredTheEdgeRange) toolSelected.propsContainerAdjustShapes.firstEnteredTheEdgeRange = "y";
      
      changeBordersContainerCanvasIfRequires(measuresXBeforeEnterInRangeBorde,"1px dashed #fff");
      
      setValueBorderSpecificContainerCanvas(`border-${borderNameY}`,"1px solid #fff");
    }
  }
  else if (measuresYBeforeEnterInRangeBorde) {
    const {velocityMove,pxMoveForBorde,borderNameY} = measuresYBeforeEnterInRangeBorde,
    measureUsed = measuresYBeforeEnterInRangeBorde.y ?? measuresYBeforeEnterInRangeBorde.height;
    
    diferenceY = (measureUsed + velocityMove) - (measureUsed + pxMoveForBorde);
    
    delete toolSelected.propsContainerAdjustShapes.measuresYBeforeEnterInRangeBorde;
    
    setValueBorderSpecificContainerCanvas(`border-${borderNameY}`,"1px dashed #fff");
    
    changeBordersContainerCanvasIfRequires(measuresXBeforeEnterInRangeBorde,"1px solid #fff");
  }
  
  if (leftTight !== undefined) {
    if (!measuresXBeforeEnterInRangeBorde) {
      let propsWork = {velocityMove:velocityX,pxMoveForBorde:leftTight,borderNameX};
      if (callLocation === "movingShape" || callLocation === "top-left" || callLocation === "bottom-left") propsWork.x = x;
      else if (callLocation === "bottom-right" || callLocation === "top-right") propsWork.width = width;
    
      toolSelected.propsContainerAdjustShapes.measuresXBeforeEnterInRangeBorde = propsWork;
      
      if (keepAspectRatioShapeActived && !toolSelected.propsContainerAdjustShapes.firstEnteredTheEdgeRange) toolSelected.propsContainerAdjustShapes.firstEnteredTheEdgeRange = "x";
      
      changeBordersContainerCanvasIfRequires(toolSelected.propsContainerAdjustShapes.measuresYBeforeEnterInRangeBorde,"1px dashed #fff");
      
      setValueBorderSpecificContainerCanvas(`border-${borderNameX}`,"1px solid #fff");
    }
  }
  else if (measuresXBeforeEnterInRangeBorde) {
    const {velocityMove,pxMoveForBorde,borderNameX} = measuresXBeforeEnterInRangeBorde,
    measureUsed = measuresXBeforeEnterInRangeBorde.x ? measuresXBeforeEnterInRangeBorde.x : measuresXBeforeEnterInRangeBorde.width;
    
    diferenceX = (measureUsed + velocityMove) - (measureUsed + pxMoveForBorde);
    
    delete toolSelected.propsContainerAdjustShapes.measuresXBeforeEnterInRangeBorde;
    
    setValueBorderSpecificContainerCanvas(`border-${borderNameX}`,"1px dashed #fff");
    
    changeBordersContainerCanvasIfRequires(toolSelected.propsContainerAdjustShapes.measuresYBeforeEnterInRangeBorde,"1px solid #fff");
  }
  
  if (topTight !== undefined) diferenceY = topTight;
  if (leftTight !== undefined) diferenceX = leftTight;
  
  return {diferenceX,diferenceY};
}

function centerShapeInCanvasIfOptionActived ($CONTAINERADJUSTSHAPES,$CONTAINERCANVAS,diferenceX,diferenceY) {
  const {alignmentGuidesCenter} = toolSelected.optionsPositioningSHAPE
  
  let pxForCenterX,pxForCenterY;
  if (alignmentGuidesCenter) {
    const {xAdjustShapeBeforeEnterRangeCenter,yAdjustShapeBeforeEnterRangeCenter} = toolSelected.propsContainerAdjustShapes;
    
    let measuresContainerADJUSTSHAPEX,
    measuresContainerADJUSTSHAPEY;
    
    if (xAdjustShapeBeforeEnterRangeCenter) {
      const {width} = $CONTAINERADJUSTSHAPES.getBoundingClientRect();
      
      measuresContainerADJUSTSHAPEX = {x:xAdjustShapeBeforeEnterRangeCenter.x,width};
      
      xAdjustShapeBeforeEnterRangeCenter.x += diferenceX;
    } else measuresContainerADJUSTSHAPEX = $CONTAINERADJUSTSHAPES.getBoundingClientRect();
    
    if (yAdjustShapeBeforeEnterRangeCenter) {
      const {height} = $CONTAINERADJUSTSHAPES.getBoundingClientRect();
      
      measuresContainerADJUSTSHAPEY = {y:yAdjustShapeBeforeEnterRangeCenter.y,height};
      
      yAdjustShapeBeforeEnterRangeCenter.y += diferenceY;
    } else measuresContainerADJUSTSHAPEY = $CONTAINERADJUSTSHAPES.getBoundingClientRect();
    
    const measuresContainerCANVAS = $CONTAINERCANVAS.getBoundingClientRect(),
    centerInXContainerCanvas = measuresContainerCANVAS.x + (measuresContainerCANVAS.width / 2),
    centerInYContainerCanvas = measuresContainerCANVAS.y + (measuresContainerCANVAS.height / 2),
    nextXcontainerAdjust = (measuresContainerADJUSTSHAPEX.x + diferenceX),
    middleWidthContainerADJUST = measuresContainerADJUSTSHAPEX.width / 2,
    nextXCenterContainerADJUST = nextXcontainerAdjust + middleWidthContainerADJUST,
    nextYContainerAdjust = measuresContainerADJUSTSHAPEY.y + diferenceY,
    middleHeightContainerADJUST = measuresContainerADJUSTSHAPEY.height / 2,
    nextYCenterContainerADJUST = nextYContainerAdjust + middleHeightContainerADJUST,
    rangeInCenter = 7;
  
    if (nextXCenterContainerADJUST >= centerInXContainerCanvas - rangeInCenter && nextXCenterContainerADJUST <= centerInXContainerCanvas + rangeInCenter) {
      if (!xAdjustShapeBeforeEnterRangeCenter) {
        toolSelected.propsContainerAdjustShapes.xAdjustShapeBeforeEnterRangeCenter = {x:nextXcontainerAdjust}
        pxForCenterX = centerInXContainerCanvas - (measuresContainerADJUSTSHAPEX.x + middleWidthContainerADJUST);
        
        $CONTAINERCANVAS.insertAdjacentHTML("beforeend",`<span class="line-center-canvas-x"></span>`);
      } else {
        pxForCenterX = 0;
      }
    }
    else if (xAdjustShapeBeforeEnterRangeCenter) {
      pxForCenterX = nextXCenterContainerADJUST - centerInXContainerCanvas;
      delete toolSelected.propsContainerAdjustShapes.xAdjustShapeBeforeEnterRangeCenter;
      
      $(".aplication #container-canvas .line-center-canvas-x").remove();
    }
    
    if (nextYCenterContainerADJUST >= centerInYContainerCanvas - rangeInCenter && nextYCenterContainerADJUST <= centerInYContainerCanvas + rangeInCenter) {
      if (!yAdjustShapeBeforeEnterRangeCenter) {
        toolSelected.propsContainerAdjustShapes.yAdjustShapeBeforeEnterRangeCenter = {y:nextYContainerAdjust}
        pxForCenterY = centerInYContainerCanvas - (measuresContainerADJUSTSHAPEY.y + middleHeightContainerADJUST);
        
        $CONTAINERCANVAS.insertAdjacentHTML("beforeend",`<span class="line-center-canvas-y"></span>`);
      } else {
        pxForCenterY = 0;
      }
    }
    else if (yAdjustShapeBeforeEnterRangeCenter) {
      pxForCenterY = nextYCenterContainerADJUST - centerInYContainerCanvas;
      delete toolSelected.propsContainerAdjustShapes.yAdjustShapeBeforeEnterRangeCenter;
      
      $(".aplication #container-canvas .line-center-canvas-y").remove();
    }
  }
  
  return {pxForCenterX,pxForCenterY}
}

function movePositionSHAPE ($CONTAINERADJUSTSHAPES,$CONTAINERSHAPESINSERT,velocityX,velocityY,idshape) {
  let leftCurrentContainerShapes = getPropertyValueElement("left",$CONTAINERSHAPESINSERT),
  topCurrentContainerShapes = getPropertyValueElement("top",$CONTAINERSHAPESINSERT),
  leftCurrentContainerAdjust = getPropertyValueElement("left",$CONTAINERADJUSTSHAPES),
  topCurrentContainerAdjust = getPropertyValueElement("top",$CONTAINERADJUSTSHAPES);
  
  const {typeLineSelected} = toolSelected.modalFigures.ALLTYPESLINE;
  
  let $CONTAINEROFREFERENCEFORCENTER,
  $CONTAINEROFREFERENCEFORBORDER;
  
  if (idshape === "custom-clip-path") {
    const $SHAPEPATH = $CONTAINERSHAPESINSERT.querySelector("svg .shape-SVG.fill");
    
    $CONTAINEROFREFERENCEFORBORDER = $CONTAINERSHAPESINSERT;
    
    $CONTAINEROFREFERENCEFORCENTER = $SHAPEPATH;
  }
  else if (idshape === "arrowIndicator") {
    const $CIRCLERIGHTPOINTCENTRAL = $aplication.children["circle-right"].firstElementChild;
    const $CIRCLELEFTPOINTCENTRAL = $aplication.children["circle-left"].firstElementChild;
    
    const measuresPointLeft = $CIRCLELEFTPOINTCENTRAL.getBoundingClientRect();
    
    const measuresPointRight = $CIRCLERIGHTPOINTCENTRAL.getBoundingClientRect();
    
    let x = measuresPointLeft.x,
    y = measuresPointLeft.y;
    
    let width = measuresPointRight.x - measuresPointLeft.x,
    height = measuresPointRight.y - measuresPointLeft.y;
    
    $CONTAINEROFREFERENCEFORBORDER = {
      getBoundingClientRect:()=>{return {
        x,y,width,height
      }}
    }
    
    $CONTAINEROFREFERENCEFORCENTER = $CONTAINERADJUSTSHAPES;
  }
  else {
    $CONTAINEROFREFERENCEFORBORDER = $CONTAINERADJUSTSHAPES;
    $CONTAINEROFREFERENCEFORCENTER = $CONTAINERADJUSTSHAPES;
  }
  
  let {pxForCenterX,pxForCenterY} = centerShapeInCanvasIfOptionActived($CONTAINEROFREFERENCEFORCENTER,$CONTAINERSHAPESINSERT.parentElement,velocityX,velocityY);
  
  if (pxForCenterX !== undefined) {
    velocityX = pxForCenterX;
  }
  if (pxForCenterY !== undefined) {
    velocityY = pxForCenterY;
  }
  
  const {diferenceX,diferenceY} = modifyNextMovementIfRequired(velocityX,velocityY,$CONTAINEROFREFERENCEFORBORDER,"movingShape",{left:true,right:true,top:true,bottom:true});
  
  if (diferenceX !== undefined) {
    velocityX = diferenceX;
  }
  if (diferenceY !== undefined) {
    velocityY = diferenceY;
  }
  
  let nextLeftContainerShape = leftCurrentContainerShapes + velocityX,
  nextTopContainerShape = topCurrentContainerShapes + velocityY
  ,nextLeftContainerAdjust = leftCurrentContainerAdjust + velocityX,
  nextTopContainerAdjust = topCurrentContainerAdjust + velocityY
  
  setPropertyElement($CONTAINERSHAPESINSERT,"left",`${nextLeftContainerShape}px`);
  setPropertyElement($CONTAINERSHAPESINSERT,"top",`${nextTopContainerShape}px`);
  
  setPropertyElement($CONTAINERADJUSTSHAPES,"left",`${nextLeftContainerAdjust}px`);
  setPropertyElement($CONTAINERADJUSTSHAPES,"top",`${nextTopContainerAdjust}px`);
  
  let pxAddedToX = velocityX;
  let pxAddedToY = velocityY;
  
  return {pxAddedToX,pxAddedToY};
}

function adjustContainerIfMoveToChangeTransformOrigin (beforeX,beforeY,$CONTAINER) {
  let measuresCONTAINER = $CONTAINER.getBoundingClientRect(),
  diferenceXContainer = beforeX - measuresCONTAINER.x,
  diferenceYContainer = beforeY - measuresCONTAINER.y,
  leftPropertyContainer = getPropertyValueElement("left",$CONTAINER),
  topPropertyContainer = getPropertyValueElement("top",$CONTAINER);
  
  setPropertyElement($CONTAINER,"left",`${leftPropertyContainer + diferenceXContainer}px`);
  setPropertyElement($CONTAINER,"top",`${topPropertyContainer + diferenceYContainer}px`);
}

function getTransformOriginContainerForRotate (idshape,location) {
  let originContainerShapes,originContainerAdjustShapes;
  
  if (location === "center") {
    originContainerShapes = "center";
    originContainerAdjustShapes = "center";
  } else if (location === "left") {
    const $FIRSTSHAPE = $aplication.querySelector("#container-canvas .container-SHAPES-insert svg .shape-SVG.fill");
    
    let x = Number($FIRSTSHAPE.getAttribute("x")),
    y = Number($FIRSTSHAPE.getAttribute("y")) + (Number($FIRSTSHAPE.getAttribute("height")) / 2);
    
    if (idshape === "arrowIndicator") {
      const {widthSVG,heightSVG,myLastWidth} = toolSelected.propsContainerAdjustShapes;
      
      x = (widthSVG / 2) - (myLastWidth / 2);
      y = (heightSVG / 2);
    }
    
    originContainerShapes = `${x}px ${y}px`
    originContainerAdjustShapes = "left";
  }
  
  return {originContainerShapes,originContainerAdjustShapes}
}

function clickedModalEditShapeText ({target,currentTarget}) {
  const ID = target.id;
  
  const $CONTAINERINPUTRANGE = $(".modal-edit-shape-text .container-input-range");
  
  const $CONTAINERTYPESDIRECTIONWRITE = $(".modal-edit-shape-text .container-types-align-text");
  
  let buttonForMoveRange = ID === "subtract" || ID === "add";
  
  let $CONTAINERTOSHRINK;
  if ((($CONTAINERTOSHRINK = $CONTAINERINPUTRANGE).classList.contains("scaleY-1") && !buttonForMoveRange && !target.classList.contains("container-input-range")) || (($CONTAINERTOSHRINK = $CONTAINERTYPESDIRECTIONWRITE).classList.contains("scaleY-1") && !target.classList.contains("type-align-text"))){
    clearTimeout(toolSelected.idtimeoutmarkerspacing);
    
    $CONTAINERTOSHRINK.querySelector(".marker-line-spacing")?.classList.add("visibility-hidden");
    
    $CONTAINERTOSHRINK.classList.remove("scaleY-1");
    
    return;
  }
  
  const changeFontText = (operator) => {
    const operatorsAvailables = {
      "+":(indexCurrent)=>{
        let nextIndex;
        if (indexCurrent + 1 <= lastIndexInArrayFonts) nextIndex = indexCurrent + 1;
        else nextIndex = 0;
        
        return nextIndex;
      },
      "-":(indexCurrent)=>{
        let beforeIndex;
        if (indexCurrent - 1 < 0) beforeIndex = lastIndexInArrayFonts;
        else beforeIndex = indexCurrent - 1
        
        return beforeIndex;
      }
    }
    
    const {variablesForChangeFont,valuesSettingShapeTextIntoModal} = toolSelected;
    
    let {allFontsInOption,indexCurrentInArrayFonts,lastIndexInArrayFonts} = variablesForChangeFont;
    
    let newIndex = operatorsAvailables[operator](indexCurrentInArrayFonts);
    
    variablesForChangeFont.indexCurrentInArrayFonts = newIndex;
    
    let {nameFontText,type,name} = allFontsInOption[newIndex];
    
    let {fontFamily} = valuesSettingShapeTextIntoModal;
    
    fontFamily.type = type;
    fontFamily.name = name;
    
    applyFontSelectedInModalEditShapeText(nameFontText);
  }
  
  if (ID === "button-line-spacing") target.nextElementSibling.classList.toggle("scaleY-1");
  else if (ID === "button-types-align-text") {
    const $CONTAINERTYPESDIRECTIONWRITE = target.parentElement.lastElementChild
    
    const {directionOfWrite} = toolSelected.valuesSettingShapeTextIntoModal;
    
    $CONTAINERTYPESDIRECTIONWRITE.querySelector("button.tool-selected")?.classList.remove("tool-selected");
    
    $CONTAINERTYPESDIRECTIONWRITE.querySelector(`button[data-direction="${directionOfWrite}"]`).classList.add("tool-selected");
    
    $CONTAINERTYPESDIRECTIONWRITE.classList.toggle("scaleY-1");
  }
  else if (target.classList.contains("type-align-text")) {
    const {direction} = target.dataset;
    
    toolSelected.valuesSettingShapeTextIntoModal.directionOfWrite = direction;
    
    target.parentElement.classList.remove("scaleY-1");
    
    $(".modal-edit-shape-text #button-types-align-text").innerText = target.innerText;
    
    writeInTextArea({target:$(".modal-edit-shape-text textarea")});
  }
  else if (ID === "apply-setting") {
    const {valuesSettingShapeTextIntoModal,variablesForChangeFont} = toolSelected;
    
    toolSelected.valuesSettingShapeText = structuredClone(valuesSettingShapeTextIntoModal)
    
    applyTextsInSVGInContainerShape();
  }
  else if (buttonForMoveRange) {
    const $INPUTRANGE = $(".modal-edit-shape-text #range-line-spacing");
    
    const $MARKER = $(".modal-edit-shape-text .marker-line-spacing");
    
    $MARKER.classList.remove("visibility-hidden");
    
    let newValueInput = $INPUTRANGE.valueAsNumber;
    
    let {min,max} = $INPUTRANGE;
    
    [min,max] = [Number(min),Number(max)];
    
    if (ID === "add" && newValueInput + 1 <= max) newValueInput += 1;
    else if (ID === "subtract" && newValueInput - 1 >= min) newValueInput -= 1;
    
    let value = newValueInput - min;
    
    let leftInit = $INPUTRANGE.getBoundingClientRect().x;
    
    let clientXManual = leftInit + (value * 2.19);
    
    touchesInputRangeSpacingLineText({
      target:$INPUTRANGE,
      type:"touchmove",
      touches:[{
        clientX:clientXManual
      }]
    })
    
    toolSelected.idtimeoutmarkerspacing = setTimeout(()=>{
      $MARKER.classList.add("visibility-hidden");
    },2000);
  }
  else if (ID === "types-font") {
    let allFontsInCustom = {
      "/**-root-*.-/":{
        allFontsAvailablesID:{},
        favorites:{}
      }
    }
    
    let {htmlFONTSTEXTINCUSTOM,allFontsAvailablesInCUSTOMoption,nameFolderSelectedCurrent} = toolSelected;
    
    if (!allFontsAvailablesInCUSTOMoption) {
      toolSelected.htmlFONTSTEXTINCUSTOM = {};
      toolSelected.allFontsAvailablesInCUSTOMoption = allFontsInCustom;
      toolSelected.nameFolderSelectedCurrent = "/**-root-*.-/";
      toolSelected.fontsAsFavoritesInSYSTEM = {};
    }
    
    const $HEAD = document.head;
    
    Object.values(toolSelected.allFontsAvailablesInCUSTOMoption).forEach(({allFontsAvailablesID})=>{
      Object.entries(allFontsAvailablesID).forEach(([id,valuesOBJ])=>{
        if (!$HEAD.children[id]) addFonFaceStyleInHEAD(id,valuesOBJ.url,valuesOBJ.format);
      })
    })
    
    const {main} = toolSelected.htmlChildren.htmlsModalSelectFont;
    
    $aplication.insertAdjacentHTML("beforeend",main);
    
    const $MODALSELECTFONT = $aplication.querySelector(".modal-all-types-fonts");
    
    if (toolSelected.nameFolderSelectedCurrent !== "/**-root-*.-/") $MODALSELECTFONT.setAttribute("data-namefolderselected",toolSelected.nameFolderSelectedCurrent);
    
    const $INPUTSEARCHFONT = $MODALSELECTFONT.querySelector("#search-font");
    
    $INPUTSEARCHFONT.oninput = searchFont;
    
    $MODALSELECTFONT.onclick = clickModalAllTypesFont;
    
    const $BUTTONSYSTEMFONTS = $MODALSELECTFONT.querySelector(".header #system");
    
    clickModalAllTypesFont({target:$BUTTONSYSTEMFONTS,currentTarget:$MODALSELECTFONT});
  }
  else if (ID === "font-next") {
    changeFontText("+");
  }
  else if (ID === "font-before") {
    changeFontText("-");
  }
  
  if (ID === "cancel-modal" || ID === "apply-setting") {
    removeElementOfDom(currentTarget);
    
    delete toolSelected.idtimeoutmarkerspacing;
    delete toolSelected.valuesSettingShapeTextIntoModal;
  }
}

function searchFont ({target}) {
  let nameFontToSearch = target.value.trim().toLowerCase();
  
  const $CONTAINERFONTS = $aplication.querySelector(".modal-all-types-fonts .container-center-modal .container-fonts");
  
  const $ALLNAMESFONT = $CONTAINERFONTS.querySelectorAll(".container-type-font > p");
  
  let firstFontSelected = false;
  
  $ALLNAMESFONT.forEach(($PARAGRAPH,index)=>{
    $PARAGRAPH.classList.remove("font-selected");
    
    let nameFont = $PARAGRAPH.textContent.toLowerCase();
    
    let fontSimilar;
    
    if ((fontSimilar = nameFont.startsWith(nameFontToSearch) && nameFontToSearch !== "")) $PARAGRAPH.classList.add("font-selected");
    
    if (fontSimilar && !firstFontSelected) {
      firstFontSelected = true;
      $CONTAINERFONTS.scrollTop = 10 + (index * 40);
    }
  })
  
  if (nameFontToSearch === "") selectFontApplyInModalFonts();
}

function addFonFaceStyleInHEAD (idAndNameFamilyFont,url,format) {
  const $HEAD = document.head;
  
  let styleFontToAdded = `<style id="${idAndNameFamilyFont}">
    @font-face {
      font-family:"${idAndNameFamilyFont}";
      src:url("${url}") format("${format}");
      font-weight:normal;
      font-style:normal;
      font-display:swap;
    }
  </style>`;
  
  $HEAD.insertAdjacentHTML("beforeend",styleFontToAdded);
}

function selectFontApplyInModalFonts () {
  const {allFontsInOption,indexCurrentInArrayFonts} = toolSelected.variablesForChangeFont;
  
  const {type,indexfont,name} = allFontsInOption[indexCurrentInArrayFonts];
  
  let $CONTAINERFONT;
  if (type === "className") $CONTAINERFONT = $(`.modal-all-types-fonts .container-fonts .container-type-font[data-option="system"][data-indexfont="${indexfont}"]`);
  else $CONTAINERFONT = $(".modal-all-types-fonts .container-fonts").children[name];
  
  if ($CONTAINERFONT) $CONTAINERFONT.lastElementChild.classList.add("font-selected");
}

function applyFontSelectedInModalEditShapeText (nameFontText) {
  const $MODALEDITSHAPETEXT = $(".modal-edit-shape-text");
  
  const $BUTTONSELECTTYPEFONT = $MODALEDITSHAPETEXT.querySelector(".container-change-font #types-font");
  
  const $TEXTAREA = $MODALEDITSHAPETEXT.querySelector("textarea");
  
  const {fontFamily} = toolSelected.valuesSettingShapeTextIntoModal;
  
  getFontSizeToApplyInSVGsetting();
  
  $BUTTONSELECTTYPEFONT.innerText = nameFontText;
  
  $BUTTONSELECTTYPEFONT.removeAttribute("style");
  
  $BUTTONSELECTTYPEFONT.className = "button-select-font"
  
  setFontFamilyTextSVG($BUTTONSELECTTYPEFONT,fontFamily.type,fontFamily.name);
  
  writeInTextArea({target:$TEXTAREA});
}

function getDefaultFontsTextOfSystemForChange () {
  return {
  inOption:{nameOption:"system"},
  allFontsInOption:[
        {type:"className",
        name:"Bebas-Neue",
        nameFontText:"Bebas Neue",
        indexfont:0},
        {type:"className",
        name:"Caprasimo",
        nameFontText:"Caprasimo",
        indexfont:1},
        {type:"className",
        name:"Edu-NSW-ACT-Hand-Pre",
        nameFontText:"Edu NSW ACT Hand Pre 400",
        indexfont:2},
        {type:"className",
        name:"Edu-NSW-ACT-Hand-Pre weight-500",
        nameFontText:"Edu NSW ACT Hand Pre 500",
        indexfont:3},
        {type:"className",
        name:"Edu-NSW-ACT-Hand-Pre weight-600",
        nameFontText:"Edu NSW ACT Hand Pre 600",
        indexfont:4},
        {type:"className",
        name:"Edu-NSW-ACT-Hand-Pre weight-700",
        nameFontText:"Edu NSW ACT Hand Pre 700",
        indexfont:5},
        {type:"className",
        name:"Kapakana",
        nameFontText:"Kapakana 300",
        indexfont:6},
        {type:"className",
        name:"Kapakana weight-400",
        nameFontText:"Kapakana 400",
        indexfont:7},
        {type:"className",
        name:"LXGW-Marker-Gothic",
        nameFontText:"LXGW Marker Gothic",
        indexfont:8},
        {type:"className",
        name:"Michroma",
        nameFontText:"Michroma",
        indexfont:9},
        {type:"className",
        name:"Poppins",
        nameFontText:"Poppins 400",
        indexfont:10},
        {type:"className",
        name:"Poppins weight-500",
        nameFontText:"Poppins 500",
        indexfont:11},
        {type:"className",
        name:"Poppins weight-600",
        nameFontText:"Poppins 600",
        indexfont:12},
        {type:"className",
        name:"Poppins weight-700",
        nameFontText:"Poppins 700",
        indexfont:13},
        {type:"className",
        name:"Press-Start-2P",
        nameFontText:"Press Start 2P",
        indexfont:14},
        {type:"className",
        name:"Roboto",
        nameFontText:"Roboto 400",
        indexfont:15},
        {type:"className",
        name:"Roboto weight-500",
        nameFontText:"Roboto 500",
        indexfont:16},
        {type:"className",
        name:"Roboto weight-600",
        nameFontText:"Roboto 600",
        indexfont:17},
        {type:"className",
        name:"Roboto weight-700",
        nameFontText:"Roboto 700",
        indexfont:18},
        {type:"className",
        name:"WDXL-Lubrifont-SC",
        nameFontText:"WDXL Lubrifont SC",
        indexfont:19}
        ],
  indexCurrentInArrayFonts:15,
  lastIndexInArrayFonts:19
  }
}

function clickModalAllTypesFont ({target,currentTarget}) {
  let IDTARGET = target.id;
  
  const moveScrollVarAndResize = ($buttonReference) => {
    const $CONTAINERFHATER = $buttonReference.parentElement;
    
    const {width,x} = $buttonReference.getBoundingClientRect();
    
    let newLeftScroll = x - $CONTAINERFHATER.getBoundingClientRect().x;
    
    setPropertyElement($CONTAINERFHATER,"--leftScroll",`${newLeftScroll}px`);
    setPropertyElement($CONTAINERFHATER,"--widthScroll",`${width}px`);
    
    $CONTAINERFHATER.querySelector("button.color-white-low")?.classList.remove("color-white-low");
    
    $buttonReference.classList.add("color-white-low");
    
    const $INPUTSEARCH = currentTarget.querySelector(".footer-tools #search-font");
    
    $INPUTSEARCH.value = "";
  }
  
  const addFontsFavoritesInOptionFAVORITES = () => {
    const {allFontsAvailablesInCUSTOMoption,fontsAsFavoritesInSYSTEM} = toolSelected;
    
    let htmlAllFontsFavorites = "";
    
    Object.values(fontsAsFavoritesInSYSTEM).forEach(htmlFontContainer=>{
      htmlAllFontsFavorites += htmlFontContainer;
    })
    
    Object.values(allFontsAvailablesInCUSTOMoption).forEach(({favorites})=>{
      Object.values(favorites).forEach(htmlFontContainer=>{
         htmlAllFontsFavorites += htmlFontContainer;
      })
    })
    
    const $CONTAINERFORFONTS = currentTarget.querySelector(".container-fonts");
    
    $CONTAINERFORFONTS.innerHTML = htmlAllFontsFavorites;
    
    $CONTAINERFORFONTS.querySelectorAll(".container-type-font > p.font-selected").forEach($P=>{
      $P.classList.remove("font-selected");
    })
    
    selectFontApplyInModalFonts();
    
    orderByAscContainersFont();
  }
  
  const orderByAscContainersFont = () => {
    const $CONTAINERFORFONTS = currentTarget.querySelector(".container-fonts");
    
    let ALLCONTAINERFONTWITHOUTORDER = $CONTAINERFORFONTS.querySelectorAll(".container-type-font");
    
    let amountContainerFonts = ALLCONTAINERFONTWITHOUTORDER.length;
    
    const ALLCONTAINERFONTWITHORDER = Array.from(ALLCONTAINERFONTWITHOUTORDER).toSorted((a,b)=>{
      let nameFontOfa = a.lastElementChild.textContent,
      nameFontOfb = b.lastElementChild.textContent;
      
      return nameFontOfa.localeCompare(nameFontOfb);
    })
    
    let functionNameForMoveFonts = $CONTAINERFORFONTS.moveBefore ? "moveBefore" : "insertBefore";
    
    Array.from(Array(amountContainerFonts).keys()).forEach(index=>{
      const $CONTAINERWITHOUTORDER = ALLCONTAINERFONTWITHOUTORDER[index]
      ,$CONTAINERWITHORDER = ALLCONTAINERFONTWITHORDER[index];
      
      $CONTAINERFORFONTS[functionNameForMoveFonts]($CONTAINERWITHORDER,$CONTAINERWITHOUTORDER);
      
      ALLCONTAINERFONTWITHOUTORDER = $CONTAINERFORFONTS.querySelectorAll(".container-type-font");
    })
  }
  
  const reorderFontsInOptionCUSTOM = () => {
    const {nameFolderSelectedCurrent,allFontsAvailablesInCUSTOMoption} = toolSelected;
    
    const $ALLCONTAINERFONT = currentTarget.querySelectorAll(".container-fonts .container-type-font");
    
    let sizeTotalFontsInBytes = 0;
    
    let newValuesFavorites = {};
    
    let idAllFontsInFolder = {};
    
    $ALLCONTAINERFONT.forEach(($CONTAINERFONT,index)=>{
      let isFavorite = $CONTAINERFONT.querySelector(".star-logo").classList.contains("favorite");
      
      let {sizeinbytes,urlfont,formatfont} = $CONTAINERFONT.dataset;
      
      if (sizeinbytes) sizeTotalFontsInBytes += Number(sizeinbytes);
      
      $CONTAINERFONT.setAttribute("data-indexfont",index);
      
      $CONTAINERFONT.setAttribute("data-namefolderfather",nameFolderSelectedCurrent);
      
      let nameFontText = $CONTAINERFONT.lastElementChild.innerText;
      
      idAllFontsInFolder[$CONTAINERFONT.id] = {
        url:urlfont,
        format:formatfont,
        nameFontText,
      }
      
      if (isFavorite) newValuesFavorites[index] = $CONTAINERFONT.outerHTML;
    })
    
    allFontsAvailablesInCUSTOMoption[nameFolderSelectedCurrent] = {
      allFontsAvailablesID:idAllFontsInFolder,
      favorites:newValuesFavorites
    }
    
    return sizeTotalFontsInBytes;
  }
  
  const showHtmlOfFolderCurrentSelected =  () => {
    const $CONTAINERFORFONTS = currentTarget.querySelector(".container-fonts");
    
    const $TOOLSFORADDEDFONTS = currentTarget.querySelector(".container-tools-add-my-font");
    
    const {htmlFONTSTEXTINCUSTOM,nameFolderSelectedCurrent} = toolSelected;
    
    let htmlToShow = `<p class="show-size-total-of-all-fonts">0 / 0 B</p>`;
    
    if (nameFolderSelectedCurrent in htmlFONTSTEXTINCUSTOM) htmlToShow = htmlFONTSTEXTINCUSTOM[nameFolderSelectedCurrent];
    
    $CONTAINERFORFONTS.innerHTML = htmlToShow;
    
    let fontsFavoritesInFolderCurrent = toolSelected.allFontsAvailablesInCUSTOMoption[nameFolderSelectedCurrent].favorites;
    
    $CONTAINERFORFONTS.querySelectorAll(".container-type-font .star-logo.favorite").forEach($logoStar=>{$logoStar.classList.remove("favorite")});
    
    $CONTAINERFORFONTS.querySelectorAll(".container-type-font > .font-selected").forEach($P=>{
      $P.classList.remove("font-selected");
    })
    
    currentTarget.querySelector(".footer-tools #search-font").value = "";
    
    Object.keys(fontsFavoritesInFolderCurrent).forEach(indexcontainerfont=>{
      const $FONTCONTAINERASFAVORITE = $CONTAINERFORFONTS.querySelector(`.container-type-font[data-indexfont="${indexcontainerfont}"`);
      
      $FONTCONTAINERASFAVORITE.querySelector(".star-logo").classList.add("favorite");
    })
    
    selectFontApplyInModalFonts();
    
    changeStateButtonsCustomOptionText();
  }
  
  const goIntoFolder = (namefolder,originalNameFolder) => {
    toolSelected.nameFolderSelectedCurrent = namefolder;
    
    const $TOOLSFORADDEDFONTS = currentTarget.querySelector(".container-tools-add-my-font");
    
    const $BUTTONGOBACK = $TOOLSFORADDEDFONTS.children["go-back-folder"],
    $BUTTONCREATEFOLDER = $TOOLSFORADDEDFONTS.children["create-folder"],
    $ICONBACK = $BUTTONGOBACK.firstElementChild,
    $ICONCREATEFOLDER = $BUTTONCREATEFOLDER.firstElementChild;
    
    const $PARAGRAPHFORSHOWNAMEFOLDERCURRENT = currentTarget.querySelector(".container-tools-add-my-font .name-folder-current");
    
    if (namefolder === "/**-root-*.-/") {
      $BUTTONGOBACK.setAttribute("disabled","");
      
      $ICONBACK.classList.add("opacity-midle");
      
      $BUTTONCREATEFOLDER.removeAttribute("disabled");
      
      $ICONCREATEFOLDER.classList.remove("opacity-midle")
      
      currentTarget.removeAttribute("data-namefolderselected");
    } else {
      $BUTTONGOBACK.removeAttribute("disabled");
      
      $ICONBACK.classList.remove("opacity-midle");
      
      $BUTTONCREATEFOLDER.setAttribute("disabled","");
      
      $ICONCREATEFOLDER.classList.add("opacity-midle");
    
      currentTarget.setAttribute("data-namefolderselected",originalNameFolder);
    }
    
    $PARAGRAPHFORSHOWNAMEFOLDERCURRENT.textContent = originalNameFolder;
    
    showHtmlOfFolderCurrentSelected();
  }
  
  const getFontsInSelectedOption = ($FONTSELECTEDCONTAINER,OPTIONCURRENT) => {
    const $ALLCONTAINERTYPEFONT = currentTarget.querySelectorAll(".container-fonts .container-type-font");
    
    let indexCurrentInArrayFonts
    ,lastIndexInArrayFonts = $ALLCONTAINERTYPEFONT.length - 1;
    
    let propsOfFontsToUse = [];
    
    $ALLCONTAINERTYPEFONT.forEach(($CONTAINERFONT,index)=>{
      if ($CONTAINERFONT === $FONTSELECTEDCONTAINER) indexCurrentInArrayFonts = index;
      
      propsOfFontsToUse.push(getVariablesToUseOfFontText($CONTAINERFONT));
    })
    
    let VARIABLESFORINDICATEOPTION = {
      nameOption:OPTIONCURRENT
    };
    
    if (OPTIONCURRENT === "custom") {
      const {nameFolderSelectedCurrent} = toolSelected;
      
      VARIABLESFORINDICATEOPTION.folderNameSelected = nameFolderSelectedCurrent;
    }
    
    toolSelected.variablesForChangeFont = {
      inOption:VARIABLESFORINDICATEOPTION,
      allFontsInOption:propsOfFontsToUse,
      indexCurrentInArrayFonts,
      lastIndexInArrayFonts
    }
  }
  
  const getVariablesToUseOfFontText = ($CONTAINERFONT) => {
    let {option,indexfont} = $CONTAINERFONT.dataset;
    
    //EL INDEX SOLO LO USAMOS PARA UNA FUENTE DEFAULT;
    
    indexfont = Number(indexfont);
      
    const $PARAGRAPH = $CONTAINERFONT.lastElementChild;
      
    let type,
    name,
    nameFontText = $PARAGRAPH.innerText;
      
    if (option === "system") {
      type = "className";
      name = ``;
      $PARAGRAPH.classList.forEach(nameClass=>{
        if (nameClass !== "font-selected") name += ` ${nameClass}`;
      })
      name = name.trimStart();
    } else {
      type = "font-face";
      name = $CONTAINERFONT.id;
    }
      
    return {
      type,
      name,
      nameFontText,
      indexfont
    }
  }
  
  const addOrRemoveFontInVariablesForChangeFontOfOptionFAVORITES = (optionOfFont,addToArray,$CONTAINERFONT) => {
    const {allFontsInOption,indexCurrentInArrayFonts} = toolSelected.variablesForChangeFont;
    
    const propsFontCurrentSelected = allFontsInOption[indexCurrentInArrayFonts];
    
    if (addToArray) {
      allFontsInOption.push(getVariablesToUseOfFontText($CONTAINERFONT));
    } else {
      let indexOfFontToRemove;
    
      if (optionOfFont === "custom") {
        let fontFamily = $CONTAINERFONT.id;
        indexOfFontToRemove = allFontsInOption.findIndex(props=>props.name === fontFamily);
      } else {
        indexOfFontToRemove = allFontsInOption.findIndex(props=>props.indexfont === Number($CONTAINERFONT.dataset.indexfont) && props.type === "className");
      }
    
      allFontsInOption.splice(indexOfFontToRemove,1);
    }
    
    allFontsInOption.sort((a,b)=>{
      let nameFontText1 = a.nameFontText,
      nameFontText2 = b.nameFontText;
      
      return nameFontText1.localeCompare(nameFontText2);
    });
    
    let newPositionIndexOfFontCurrent = allFontsInOption.findIndex(props=>props.name === propsFontCurrentSelected.name);
    
    toolSelected.variablesForChangeFont.indexCurrentInArrayFonts = newPositionIndexOfFontCurrent;
    
    toolSelected.variablesForChangeFont.lastIndexInArrayFonts = allFontsInOption.length - 1;
    
    if (newPositionIndexOfFontCurrent === -1) {
      const {type,name} = propsFontCurrentSelected;
      
      if (type === "className") {
        toolSelected.variablesForChangeFont = getDefaultFontsTextOfSystemForChange();
        
        const {allFontsInOption} = toolSelected.variablesForChangeFont;
        
        let indexOfFontSelected = allFontsInOption.findIndex(fontProps=>fontProps.name === name);
        
        toolSelected.variablesForChangeFont.indexCurrentInArrayFonts = indexOfFontSelected;
      }
      else {
        const {namefolderfather} = $CONTAINERFONT.dataset;
        
        const {allFontsAvailablesInCUSTOMoption} = toolSelected;
        
        const {allFontsAvailablesID} = allFontsAvailablesInCUSTOMoption[namefolderfather];
        
        let fontsInFolderCurrent = [];
        
        Object.entries(allFontsAvailablesID).forEach(([nameFontFamily,propsOfFont])=>{
          const {nameFontText} = propsOfFont;
          
          fontsInFolderCurrent.push({
            type:"font-face",
            name:nameFontFamily,
            nameFontText:nameFontText
          });
        })
        
        let allFontsInOptionOrder = fontsInFolderCurrent.toSorted((a,b)=>{return a.nameFontText.localeCompare(b.nameFontText)})
        
        let indexCurrentInArrayFonts = allFontsInOptionOrder.findIndex(propsFont=>propsFont.name === name);
        
        let lastIndexInArrayFonts = allFontsInOptionOrder.length - 1;
        
        toolSelected.variablesForChangeFont = {
          inOption:{nameOption:"custom",folderNameSelected:namefolderfather},
          allFontsInOption:allFontsInOptionOrder,
          indexCurrentInArrayFonts,
          lastIndexInArrayFonts
        }
      }
    }
  }
  
  let option1Pulsed,option2Pulsed;
  
  let OPTIONBEFOREDIFERENT = currentTarget.querySelector(".header button.color-white-low")?.id !== IDTARGET;
  
  if (IDTARGET === "system" && OPTIONBEFOREDIFERENT) {
    const {containerForFonts,fontsDefault} = toolSelected.htmlChildren.htmlsModalSelectFont;
    
    const $CONTAINERCENTERMODAL= currentTarget.querySelector(".container-center-modal");
    
    $CONTAINERCENTERMODAL.innerHTML = containerForFonts;
    
    const $CONTAINERFONTS = $CONTAINERCENTERMODAL.querySelector(".container-fonts");
    
    $CONTAINERFONTS.innerHTML = fontsDefault;
    
    const {fontsAsFavoritesInSYSTEM} = toolSelected;
    
    Object.keys(fontsAsFavoritesInSYSTEM).forEach(indexcontainerfont=>{
      const $FONTCONTAINERASFAVORITE = $CONTAINERFONTS.querySelector(`.container-type-font[data-indexfont="${indexcontainerfont}"`);
      
      $FONTCONTAINERASFAVORITE.querySelector(".star-logo").classList.add("favorite");
    })
    
    moveScrollVarAndResize(target);
    
    selectFontApplyInModalFonts();
  }
  else if (IDTARGET === "custom" && OPTIONBEFOREDIFERENT) {
    const {contaienerToolsAddMyFont,containerForFonts} = toolSelected.htmlChildren.htmlsModalSelectFont;
    
    const $CONTAINERCENTERMODAL= currentTarget.querySelector(".container-center-modal");
    
    $CONTAINERCENTERMODAL.innerHTML = contaienerToolsAddMyFont + containerForFonts;
    
    const $TOOLSFORADDFONTS = currentTarget.querySelector(".container-tools-add-my-font");
    
    const {namefolderselected} = currentTarget.dataset;
    
    if (namefolderselected) {
      const $BUTTONGOBACK = $TOOLSFORADDFONTS.children["go-back-folder"],
      $SHOWNAMEFOLDER = $TOOLSFORADDFONTS.children["name-folder-current"],
      $CREATEFOLDER = $TOOLSFORADDFONTS.children["create-folder"];
      
      $BUTTONGOBACK.removeAttribute("disabled");
      
      $CREATEFOLDER.setAttribute("disabled","");
      
      $SHOWNAMEFOLDER.textContent = namefolderselected;
    }
    
    moveScrollVarAndResize(target);
    
    showHtmlOfFolderCurrentSelected();
  }
  else if (IDTARGET === "favorites" && OPTIONBEFOREDIFERENT) {
    const {containerForFonts} = toolSelected.htmlChildren.htmlsModalSelectFont;
    
    const $CONTAINERCENTERMODAL= currentTarget.querySelector(".container-center-modal");
    
    $CONTAINERCENTERMODAL.innerHTML = containerForFonts;
    
    moveScrollVarAndResize(target);
    
    addFontsFavoritesInOptionFAVORITES();
  }
  else if (target.classList.contains("star-logo") || target.nodeName === "svg-container-for-star-icon") {
    let $CONTAINERFONT,$STAR;
    
    if (target.nodeName === "svg") {
      $CONTAINERFONT = target.parentElement
      $STAR = target.firstElementChild;
    }
    else {
      $CONTAINERFONT = target.parentElement.parentElement;
      $STAR = target;
    }
    
    $STAR.classList.toggle("favorite");
    
    let addToFavorites = $STAR.classList.contains("favorite");
    
    let {option,indexfont,namefolderfather} = $CONTAINERFONT.dataset;
    
    indexfont = Number(indexfont);
    
    let objOfFontsFavorites = {};
    
    if (option === "system") objOfFontsFavorites = toolSelected.fontsAsFavoritesInSYSTEM;
    else objOfFontsFavorites = toolSelected.allFontsAvailablesInCUSTOMoption[namefolderfather].favorites;
    
    if (addToFavorites) objOfFontsFavorites[indexfont] = $CONTAINERFONT.outerHTML;
    else {
      delete objOfFontsFavorites[indexfont]
      
      let optionSelected = currentTarget.querySelector(".header button.color-white-low").id;
      
      if (optionSelected === "favorites") addFontsFavoritesInOptionFAVORITES();
    }
    
    const {inOption} = toolSelected.variablesForChangeFont;
    
    if (inOption.nameOption === "favorites") addOrRemoveFontInVariablesForChangeFontOfOptionFAVORITES(option,addToFavorites,$CONTAINERFONT);
  }
  else if (IDTARGET === "add-my-font-local") {
    const {containerForInsertNewFont} = toolSelected.htmlChildren.htmlsModalSelectFont;
    
    const $CONTAINERFORFONTS = currentTarget.querySelector(".container-fonts");
    
    const inputFileHtml = `<input id="input-file-fonts" type="file" class='hide' accept=".ttf,.otf,.eot">`;
    
    if (!$aplication.children["input-file-fonts"]) $aplication.insertAdjacentHTML("beforeend",inputFileHtml);
    
    const $INPUTFILEFORINSERTFONTS = $aplication.querySelector("#input-file-fonts");
    
    $INPUTFILEFORINSERTFONTS.click();
    
    $INPUTFILEFORINSERTFONTS.onchange = ({target}) => {
      const reader = new FileReader();
      const [file] = target.files;
      
      const mimeTypesFont = [
        'font/ttf',
        'font/otf',
        'font/eot'
      ];
      
      let formatsOfChangeInFontFace = {
        ttf:"truetype",
        otf:"opentype",
        eot:"embedded opentype"
      }
        
      let formatFile = file.name.trim().split(".").at(-1);
      
      if (!(mimeTypesFont.some(typeFont=>typeFont === file.type) || formatsOfChangeInFontFace[formatFile])) return;
      
      reader.readAsDataURL(file);
      
      reader.onload = () => {
        const $headhtml = document.head
        
        const {nameFolderSelectedCurrent} = toolSelected;
        
        let format = file.name.split(".").at(-1);
        
        if (format in formatsOfChangeInFontFace) format = formatsOfChangeInFontFace[format]
        
        let newIdAndNameFamilyFont = `${file.name}-${nameFolderSelectedCurrent}`
        
        const $STYLEFONTEXISTING = $headhtml.children[newIdAndNameFamilyFont]
        
        if ($STYLEFONTEXISTING) {
          $STYLEFONTEXISTING.remove();
          $CONTAINERFORFONTS.children[newIdAndNameFamilyFont]?.remove();
        }
        
        addFonFaceStyleInHEAD (newIdAndNameFamilyFont,reader.result,format);
        
        $CONTAINERFORFONTS.querySelector(".show-size-total-of-all-fonts")?.remove();
        
        $CONTAINERFORFONTS.insertAdjacentHTML("beforeend",containerForInsertNewFont);
        
        const $LASTCONTAINERFONT = $CONTAINERFORFONTS.lastElementChild;
        
        $LASTCONTAINERFONT.setAttribute("id",newIdAndNameFamilyFont);
        
        const $PARAGRAPH = $LASTCONTAINERFONT.lastElementChild;
        
        setPropertyElement($PARAGRAPH,"font-family",`"${newIdAndNameFamilyFont}",sans-serif`);
        
        $PARAGRAPH.textContent = `${file.name.split(".")[0]}`;
        
        $LASTCONTAINERFONT.setAttribute("data-sizeinbytes",file.size);
        
        $LASTCONTAINERFONT.setAttribute("data-urlfont",reader.result);
        $LASTCONTAINERFONT.setAttribute("data-formatfont",format);
        
        orderByAscContainersFont();
        
        let sizeTotalFontsInBytes = reorderFontsInOptionCUSTOM();
        
        let totalSizeFonts = getSizeCorrect(sizeTotalFontsInBytes);
        
        const $ALLFONTSCONTAINER = $CONTAINERFORFONTS.querySelectorAll(".container-type-font");
        
        const amountContainerFonts = $ALLFONTSCONTAINER.length;
        
        $CONTAINERFORFONTS.insertAdjacentHTML("beforeend",`<p class="show-size-total-of-all-fonts">${amountContainerFonts} / ${totalSizeFonts.size} ${totalSizeFonts.extension}</p>`);
        
        setPropertyElement($CONTAINERFORFONTS.lastElementChild,"margin-top","-10px");
        
        const {inOption} = toolSelected.variablesForChangeFont;
        
        if (inOption.nameOption === "custom" && inOption.folderNameSelected === nameFolderSelectedCurrent) {
          let {variablesForChangeFont} = toolSelected;
          
          let newFontsInOptionCustom = [];
          
          let indexOfFontSelected;
          
          $CONTAINERFORFONTS.querySelectorAll(".container-type-font").forEach(($CONTAINERFONT,index)=>{
            if ($CONTAINERFONT.lastElementChild.classList.contains("font-selected")) indexOfFontSelected = index;
            
            newFontsInOptionCustom.push(getVariablesToUseOfFontText($CONTAINERFONT));
          })
          
          variablesForChangeFont.lastIndexInArrayFonts = amountContainerFonts - 1;
          
          variablesForChangeFont.indexCurrentInArrayFonts = indexOfFontSelected;
          
          variablesForChangeFont.allFontsInOption = newFontsInOptionCustom;
        }
        
        toolSelected.htmlFONTSTEXTINCUSTOM[nameFolderSelectedCurrent] = $CONTAINERFORFONTS.innerHTML;
        
        target.remove();
        
        changeStateButtonsCustomOptionText()
      }
    }
  }
  else if (IDTARGET === "remove-fonts-added") {
    const {containerFontsAvaliablesForRemove,containerFontInCustomForDelete} = toolSelected.htmlChildren.htmlsModalSelectFont;
    
    currentTarget.insertAdjacentHTML("beforeend",containerFontsAvaliablesForRemove);
    
    const $CONTAINERFONTSAVALIABLESFORREMOVE = currentTarget.querySelector(".container-fonts-for-remove");
    
    const $CONTAINERFORALLFONTSAVALIABLES = $CONTAINERFONTSAVALIABLESFORREMOVE.querySelector(".container-fonts-avaliables");
    
    toolSelected.fontsToRemove = {};
    
    $CONTAINERFONTSAVALIABLESFORREMOVE.onchange = changeSelectedFontToRemove;
    
    const $ALLCONTAINERFOLDER = currentTarget.querySelectorAll(".container-fonts .container-folder");
    
    const $ALLFONTSINCUSTOM = currentTarget.querySelectorAll(".container-fonts .container-type-font");
    
    Array.from($ALLCONTAINERFOLDER).concat(Array.from($ALLFONTSINCUSTOM)).forEach($CONTAINER=>{
      const fontNameInFamily = $CONTAINER.id,fontName = $CONTAINER.textContent;
      
      $CONTAINERFORALLFONTSAVALIABLES.insertAdjacentHTML("beforeend",containerFontInCustomForDelete);
      
      let $CONTAINERFORSELECTING = $CONTAINERFORALLFONTSAVALIABLES.lastElementChild;
      
      if ($CONTAINER.classList.contains("container-folder")) {
        const $CONTAINERFOLDER = $CONTAINER.cloneNode(true);
        
        $CONTAINERFOLDER.id = "folder-container-for-remove";
        
        $CONTAINERFOLDER.setAttribute("id","container-folder-for-delete");
        
        $CONTAINERFOLDER.children["name-folder"].removeAttribute("id");
        
        const $PARAGRAPH = $CONTAINERFORSELECTING.lastElementChild;
        
        $CONTAINERFORSELECTING.replaceChild($CONTAINERFOLDER,$PARAGRAPH);
        
        const $CHECKBOX = $CONTAINERFORSELECTING.firstElementChild;
        
        $CHECKBOX.classList.add("is-folder")
      }
      else {
        $CONTAINERFORSELECTING.id = fontNameInFamily;
      
        const $PARAGRAPH = $CONTAINERFORSELECTING.lastElementChild;
      
        setPropertyElement($PARAGRAPH,"font-family",`"${fontNameInFamily}",sans-serif`);
      
        $PARAGRAPH.textContent = fontName;
      }
    })
  }
  else if (IDTARGET === "apply-remove-fonts") {
    const {fontsToRemove,nameFolderSelectedCurrent} = toolSelected;
    
    const $head = document.head;
    
    const $CONTAINERFORFONTSINCUSTOM = currentTarget.querySelector(".container-fonts");
    
    let identifierContainers = Object.keys(fontsToRemove);
    
    let {allFontsInOption,indexCurrentInArrayFonts} = toolSelected.variablesForChangeFont;
    
    const {name} = allFontsInOption[indexCurrentInArrayFonts];
    
    let isRemoveFontSelected = false;
    
    let sizeBeforeArrayFonts = allFontsInOption.length;
    
    identifierContainers.forEach(identifier=>{
      let $CONTAINERTOREMOVE = $CONTAINERFORFONTSINCUSTOM.children[identifier];
      
      let indexOfFontInArray;
      //ES POR SI ELIMINAMOS ALGUNA CARPETA
      if (!$CONTAINERTOREMOVE) {
        const {allFontsAvailablesInCUSTOMoption} = toolSelected;
        
        const {allFontsAvailablesID} = allFontsAvailablesInCUSTOMoption[identifier];
        
        Object.keys(allFontsAvailablesID).forEach(idFontText=>{
          if (idFontText === name) isRemoveFontSelected = true;
          
          let indexOfFont = allFontsInOption.findIndex(values=>values.name === idFontText);
          
          if (indexOfFont !== -1) allFontsInOption.splice(indexOfFont,1);
          
          $head.children[idFontText].remove();
        })
        
        delete toolSelected.allFontsAvailablesInCUSTOMoption[identifier];
        
        $CONTAINERTOREMOVE = $CONTAINERFORFONTSINCUSTOM.querySelector(`.container-folder[data-namefolder="${identifier}"]`);
        
        delete toolSelected.htmlFONTSTEXTINCUSTOM[identifier];
      }
      else if ((indexOfFontInArray = allFontsInOption.findIndex(values=>values.name === identifier)) !== -1) {
        if (name === identifier) isRemoveFontSelected = true;
        
        allFontsInOption.splice(indexOfFontInArray,1);
      }
      
      $CONTAINERTOREMOVE.remove();
    })
    
    let sizeAfterArrayFonts = allFontsInOption.length;
    
    let sizeTotalOfFontsInBytes = reorderFontsInOptionCUSTOM();
    
    let sizeAllFonts = getSizeCorrect(sizeTotalOfFontsInBytes);
    
    const $SHOWINFOSIZETEXTS = $CONTAINERFORFONTSINCUSTOM.querySelector(".show-size-total-of-all-fonts");
    
    let allFontsContainerInCustom = $CONTAINERFORFONTSINCUSTOM.querySelectorAll(".container-type-font").length;
    
    let allContainers = $CONTAINERFORFONTSINCUSTOM.children.length - 1;
    
    if (allContainers === 0) setPropertyElement($SHOWINFOSIZETEXTS,"margin-top","10px");
    
    $SHOWINFOSIZETEXTS.textContent = `${allFontsContainerInCustom} / ${sizeAllFonts.size} ${sizeAllFonts.extension}`;
    
    toolSelected.htmlFONTSTEXTINCUSTOM[nameFolderSelectedCurrent] = $CONTAINERFORFONTSINCUSTOM.innerHTML;
    
    if (isRemoveFontSelected) {
      toolSelected.variablesForChangeFont = getDefaultFontsTextOfSystemForChange();
      
      const {fontFamily} = toolSelected.valuesSettingShapeTextIntoModal;
      
      const {indexCurrentInArrayFonts,allFontsInOption} = toolSelected.variablesForChangeFont;
      
      const {type,name,nameFontText} = allFontsInOption[indexCurrentInArrayFonts];
      
      fontFamily.type = type;
      fontFamily.name = name;
      
      applyFontSelectedInModalEditShapeText(nameFontText);
    }
    else if (sizeBeforeArrayFonts !== sizeAfterArrayFonts) {
      let currentIndexFontSelected = allFontsInOption.findIndex(values=>values.name === name);
      
      let lastIndex = sizeAfterArrayFonts - 1;
      
      toolSelected.variablesForChangeFont.indexCurrentInArrayFonts = currentIndexFontSelected;
      
      toolSelected.variablesForChangeFont.lastIndexInArrayFonts = lastIndex;
    }
    
    const $CONTAINERFORREMOVEFONTS = currentTarget.querySelector(".container-fonts-for-remove");
    
    identifierContainers.forEach(idstylefont=>{
      $head.children[idstylefont]?.remove();
    })
    
    $CONTAINERFORREMOVEFONTS.remove();
    
    changeStateButtonsCustomOptionText()
  }
  else if (IDTARGET === "cancel-remove-fonts") removeElementOfDom(currentTarget.querySelector(".container-fonts-for-remove"));
  else if ((option1Pulsed = target.classList.contains("container-font-custom-for-delete")) || (option2Pulsed = target.parentElement.classList.contains("container-font-custom-for-delete") && target.nodeName !== "INPUT")) {
    const $CHECKBOX = option1Pulsed ? target.firstElementChild : target.previousElementSibling;
    
    const {checked} = $CHECKBOX;
    
    $CHECKBOX.checked = checked ? false : true;
    
    changeSelectedFontToRemove({target:$CHECKBOX})
  }
  else if (IDTARGET === "folder-container-for-remove") {
    const $CHECKBOX = target.previousElementSibling;
    
    let {checked} = $CHECKBOX;
    
    $CHECKBOX.checked = checked ? false : true;
    
    changeSelectedFontToRemove({target:$CHECKBOX})
  }
  else if (IDTARGET === "create-folder") {
    const {containerCreateFolder} = toolSelected.htmlChildren.htmlsModalSelectFont;
    
    currentTarget.insertAdjacentHTML("beforeend",containerCreateFolder);
    
    const $CREATEFOLDERCONTAINER = currentTarget.querySelector(".container-create-folder");
  }
  else if (IDTARGET === "apply-create-folder") {
    const $CREATEFOLDER = currentTarget.querySelector(".container-create-folder");
    
    const $INPUT = $CREATEFOLDER.querySelector("input");
    
    const {allFontsAvailablesInCUSTOMoption} = toolSelected;
    
    const $PARENTINPUT = $INPUT.parentElement;
    
    let nameFolder = $INPUT.value.trim();
    
    let option1,option2;
    
    if ((option1 = nameFolder === "") || (option2 = (nameFolder.toLowerCase() in allFontsAvailablesInCUSTOMoption))) {
      let messageInfoError = option1 ?  "!Name Folder Invalid!" : "Folder Exist";
      
      $CREATEFOLDER.querySelector("p").textContent = "ERROR";
      
      const $P = document.createElement("P");
      
      $P.classList.add("message-invalid");
      
      $P.textContent = messageInfoError;
      
      toolSelected.INPUTNAMEFOLDERTOCREATE = $INPUT;
      
      $PARENTINPUT.replaceChild($P,$INPUT);
      
      target.previousElementSibling.classList.add("visibility-hidden");
      
      target.id = "retry-create-folder";
      
      return;
    }
    else {
      const {containerFontCreate} = toolSelected.htmlChildren.htmlsModalSelectFont;
      
      const {nameFolderSelectedCurrent} = toolSelected;
      
      const $CONTAINERFORFONTSINCUSTOM = currentTarget.querySelector(".container-fonts");
      
      $CONTAINERFORFONTSINCUSTOM.insertAdjacentHTML("afterbegin",containerFontCreate);
      
      const $CONTAINERFOLDER = $CONTAINERFORFONTSINCUSTOM.firstElementChild;
      
      const $CONTAINERSHOWINFOSIZE = $CONTAINERFORFONTSINCUSTOM.querySelector(".show-size-total-of-all-fonts");
      
      setPropertyElement($CONTAINERSHOWINFOSIZE,"margin-top","-10px");
      
      $CONTAINERFOLDER.setAttribute("data-namefolder",nameFolder.toLowerCase());
      
      const $PARAGRAPH = $CONTAINERFOLDER.lastElementChild;
      
      $PARAGRAPH.textContent = nameFolder;
      
      toolSelected.htmlFONTSTEXTINCUSTOM[nameFolderSelectedCurrent] = $CONTAINERFORFONTSINCUSTOM.innerHTML;
      
      allFontsAvailablesInCUSTOMoption[nameFolder.toLowerCase()] = {
        allFontsAvailablesID:{},
        favorites:{}
      }
      
      changeStateButtonsCustomOptionText()
    }
    
    removeElementOfDom($CREATEFOLDER);
  }
  else if (IDTARGET === "cancel-create-folder") removeElementOfDom(currentTarget.querySelector(".container-create-folder"));
  else if (IDTARGET === "retry-create-folder") {
    const {INPUTNAMEFOLDERTOCREATE} = toolSelected;
    
    const $MESSAGEINVALID = currentTarget.querySelector(".container-create-folder .message-invalid");
    
    const $TEXTCREATEFOLDER = $MESSAGEINVALID.previousElementSibling;
    
    const $BUTTONCANCEL = currentTarget.querySelector(".container-create-folder .footer #cancel-create-folder");
    
    $MESSAGEINVALID.parentElement.replaceChild(INPUTNAMEFOLDERTOCREATE,$MESSAGEINVALID);
    
    $BUTTONCANCEL.classList.remove("visibility-hidden");
    
    $TEXTCREATEFOLDER.textContent = "Create Folder";
    
    target.id = "apply-create-folder";
    
    delete toolSelected.INPUTNAMEFOLDERTOCREATE;
  }
  else if (IDTARGET === "container-folder") {
    const {namefolder} = target.dataset;
    
    let originalNameFolder = target.children["name-folder"].textContent;
    
    goIntoFolder(namefolder,originalNameFolder);
  }
  else if (IDTARGET === "name-folder" || IDTARGET === "svg-container-for-folder-icon") {
    const {namefolder} = target.parentElement.dataset;
    
    let originalNameFolder = target.textContent;
    
    goIntoFolder(namefolder,originalNameFolder);
  }
  else if (IDTARGET === "go-back-folder") goIntoFolder("/**-root-*.-/","");
  else if (IDTARGET === "reset-input-search") {
    const $INPUTSEARCH = target.previousElementSibling;
    
    $INPUTSEARCH.value = "";
    
    searchFont({
      target:$INPUTSEARCH
    })
    
    currentTarget.querySelector(".container-fonts").scrollTop = 0;
  }
  else if (target.nodeName === "P" && target.parentElement.classList.contains("container-type-font")) {
    const $CONTAINERFONTSELECTED = target.parentElement;
    
    let {fontFamily} = toolSelected.valuesSettingShapeTextIntoModal;
    
    const OPTIONSELECTED = currentTarget.querySelector(".header button.color-white-low").id;
    
    getFontsInSelectedOption($CONTAINERFONTSELECTED,OPTIONSELECTED);
    
    removeElementOfDom(currentTarget);
    
    const {allFontsInOption,indexCurrentInArrayFonts} = toolSelected.variablesForChangeFont;
    
    const {type,name,nameFontText} = allFontsInOption[indexCurrentInArrayFonts];
    
    fontFamily.type = type;
    fontFamily.name = name;
    
    applyFontSelectedInModalEditShapeText(nameFontText);
  }
  else if (IDTARGET === "out-of-modal-main") {
    removeElementOfDom(currentTarget);
  }
}

function changeStateButtonsCustomOptionText () {
  const {nameFolderSelectedCurrent,allFontsAvailablesInCUSTOMoption} = toolSelected;
  
  const $BUTTONBACKICON = $(".modal-all-types-fonts .container-tools-add-my-font #go-back-folder img"),
  $BUTTONCREATEFOLDERICON = $(".modal-all-types-fonts .container-tools-add-my-font #create-folder img"),
  $BUTTONREMOVEFONTICON = $(".modal-all-types-fonts .container-tools-add-my-font #remove-fonts-added img");
  
  if (nameFolderSelectedCurrent !== "/**-root-*.-/") {
    $BUTTONBACKICON.classList.remove("opacity-midle");
    $BUTTONBACKICON.parentElement.disabled = false;
    
    $BUTTONCREATEFOLDERICON.classList.add("opacity-midle");
    $BUTTONCREATEFOLDERICON.parentElement.disabled = true;
  }
  else {
    $BUTTONBACKICON.classList.add("opacity-midle");
    $BUTTONBACKICON.parentElement.disabled = true;
    
    $BUTTONCREATEFOLDERICON.classList.remove("opacity-midle");
    $BUTTONCREATEFOLDERICON.parentElement.disabled = false;
  }
  
  const {allFontsAvailablesID} = allFontsAvailablesInCUSTOMoption[nameFolderSelectedCurrent];
  
  let sizeFolder = Object.keys(allFontsAvailablesID).length,
  amountFolders = Object.keys(allFontsAvailablesInCUSTOMoption).length;
  
  if (sizeFolder > 0 || (nameFolderSelectedCurrent === "/**-root-*.-/" && amountFolders > 1)) {
    $BUTTONREMOVEFONTICON.classList.remove("opacity-midle");
    $BUTTONREMOVEFONTICON.parentElement.disabled = false;
  }
  else {
    $BUTTONREMOVEFONTICON.classList.add("opacity-midle");
    $BUTTONREMOVEFONTICON.parentElement.disabled = true;
  }
}

function changeSelectedFontToRemove ({target}) {
  const id = target.id;
  const {classList} = target;
  
  const {fontsToRemove} = toolSelected;
  
  let {checked} = target;
  
  if (id !== "select-all-fonts-in-remove") {
    let identifierContainer = classList.contains("is-folder") ? target.nextElementSibling.dataset.namefolder : target.parentElement.id
    
    if (checked) fontsToRemove[identifierContainer] = ""
    else delete fontsToRemove[identifierContainer];
    
    return;
  }
  
  let selectedAllFonts = checked;
  
  const $MODALMAIN = $(".modal-all-types-fonts");
  
  const $ALLCHECKBOX = $MODALMAIN.querySelectorAll(".container-fonts-for-remove .container-fonts-avaliables input");
  
  let identifierContainerToRemove = Object.keys(fontsToRemove),
  lenghtInputChecked = identifierContainerToRemove.length;
  
  if (selectedAllFonts && lenghtInputChecked >= 1) {
    selectedAllFonts = false;
    target.checked = false;
  }
  else if (!selectedAllFonts && lenghtInputChecked === 0 && $ALLCHECKBOX.length >= 1) {
    selectedAllFonts = true;
    target.checked = true;
  }
  
  $ALLCHECKBOX.forEach($CHECKBOX=>{
    let identifierContainer = $CHECKBOX.classList.contains("is-folder") ? $CHECKBOX.nextElementSibling.dataset.namefolder : $CHECKBOX.parentElement.id
    
    if (selectedAllFonts) {
      $CHECKBOX.checked = true;
      fontsToRemove[identifierContainer] = "";
    }
    else {
      delete fontsToRemove[identifierContainer];
      $CHECKBOX.checked = false;
    }
  })
}

function changeTransformOriginContainers(newOriginContainerAdjust,newOriginContainerShapes) {
  const $CONTAINERSHAPES = $aplication.querySelector("#container-canvas .container-SHAPES-insert"),
  $CONTAINERADJUSTSHAPES = $aplication.querySelector("#square-adjust-SHAPES");
  
  const {left,top} = $CONTAINERSHAPES.getBoundingClientRect(),
  {x,y} = $CONTAINERADJUSTSHAPES.getBoundingClientRect();
  
  setPropertyElement($CONTAINERADJUSTSHAPES,"transform-origin",newOriginContainerAdjust);
  setPropertyElement($CONTAINERSHAPES,"transform-origin",newOriginContainerShapes);
  
  adjustContainerIfMoveToChangeTransformOrigin(x,y,$CONTAINERADJUSTSHAPES);
  adjustContainerIfMoveToChangeTransformOrigin(left,top,$CONTAINERSHAPES);
}

function getSizeFontShapeTextInModal (linesText) {
  const {percentageLineSpacing} = toolSelected.valuesSettingShapeTextIntoModal;
  
  let sizeFontOfReference;
  if (linesText.length > 1 && linesText.join("\n").trim() !== "") {
    const {fontSizeToApply} = toolSelected.variablesShapeTextTemporal;
    
    sizeFontOfReference = fontSizeToApply;
  }
  else sizeFontOfReference = 70;
  
  let percentageBase = 100;
  let percentageOfFontSize = percentageBase + (percentageBase - percentageLineSpacing);
  
  return (percentageOfFontSize * sizeFontOfReference) / 100;
}

function gitSizeWidthOfTextInSVG (linesText,range,$SVG,typeToAddFont,nameFont) {
  let widthTexts = [];
  
  const {type,name} = toolSelected.valuesSettingShapeText.fontFamily;
  
  $SVG.insertAdjacentHTML("beforeend",`<text class="text-get-long visibility-hidden" dx="0" dy="0"></text>`);
  
  const $textLong = $SVG.querySelector(".text-get-long"); 
  
  setFontFamilyTextSVG($textLong,typeToAddFont,nameFont)
  
  for (let index=0;index < range;index++) {
    let text = linesText[index]?.trim();
    
    if (text === undefined) break;
    
    $textLong.innerHTML = text;
    
    const {width,x} = $textLong.getBBox();
    
    widthTexts.push({x,width});
  }
  
  $textLong.remove();
  
  return widthTexts;
}

function applyTextsInSVGInContainerShape () {
  let {
    percentageLineSpacing,
    keepAspectRatio,
    texts,
    directionOfWrite,
    fontFamily
  } = toolSelected.valuesSettingShapeText;
  
  let {
    percentageStrokeWidthInHeightText,
    percentageXMovedShadowInHeightText,
    percentageYMovedShadowInHeightText
  } = toolSelected.variablesShapeTextTemporal;
  
  const $SVGINCONTAINERSHAPES = $(".container-SHAPES-insert svg"),
  $CONTAINERSHAPESMAIN = $SVGINCONTAINERSHAPES.parentElement,
  $CONTAINERADJUSTSHAPE = $(".aplication .square-of-adjust-SHAPES");
  
  if (texts.trim() === "") texts = "Text";
  
  let linesText = texts.split("\n");
  
  let sizePxFont = getSizeFontShapeTextInModal(linesText);
  
  const $SVG = $(".modal-edit-shape-text svg");
  
  let $CLONESHADOW = $SVGINCONTAINERSHAPES.querySelector(".shadow-SVG").cloneNode(true);
  let $CLONESHAPEFILL = $SVGINCONTAINERSHAPES.querySelector(".shape-SVG.fill").cloneNode(true);
  let $CLONESHAPESTROKE = $SVGINCONTAINERSHAPES.querySelector(".shape-SVG.stroke").cloneNode(true);
  
  $SVG.querySelectorAll("text").forEach($text=>{$text.remove()});
  $SVGINCONTAINERSHAPES.querySelectorAll("text").forEach($text=>{$text.remove()});
  
  setPropertyElement($SVG,"--fontSizeTexts",`${sizePxFont}px`);
  setPropertyElement($SVGINCONTAINERSHAPES,"--fontSizeTexts",`${sizePxFont}px`);
  
  $SVG.insertAdjacentHTML("beforeend",`<text class="text-for-get-measures visibility-hidden" dx="0" dy="0">text</text>`);
  
  const $TEXTFORGETMEASURES = $SVG.querySelector(".text-for-get-measures");
  
  setFontFamilyTextSVG($TEXTFORGETMEASURES,fontFamily.type,fontFamily.name);
  
  let measuresTextOfReference = $TEXTFORGETMEASURES.getBBox();
  
  let strokeWidth = (percentageStrokeWidthInHeightText * measuresTextOfReference.height) / 100,
  xmovedshadow = (percentageXMovedShadowInHeightText * measuresTextOfReference.height) / 100,
  ymovedshadow = (percentageYMovedShadowInHeightText * measuresTextOfReference.height) / 100;
  
  let pxDistanceInBorders = Math.max(Math.abs(xmovedshadow),Math.abs(ymovedshadow));
  
  const widthTextsAndX = gitSizeWidthOfTextInSVG(linesText,linesText.length,$SVG,fontFamily.type,fontFamily.name);
  
  let widthTextLong = Math.max(...widthTextsAndX.map(({width})=>{return width}));
  
  const newWidthSVG = widthTextLong + strokeWidth + (pxDistanceInBorders * 2);
  
  let xInit = (newWidthSVG / 2) - (widthTextLong / 2);
  
  let xInDirectionApply = getDxTextsDependingOfDirectionWrite(xInit,widthTextLong,directionOfWrite);
  
  const heightSVGinModal = getPropertyValueElement("height",$SVG);
  
  let distanceYTexts = heightSVGinModal - (measuresTextOfReference.height * 2);
  
  toolSelected.variablesShapeTextTemporal.fontSize = sizePxFont;
  toolSelected.variablesShapeTextTemporal.distanceYBetweenTexts = distanceYTexts
  
  $CLONESHADOW.setAttribute("stroke-width",strokeWidth);
  $CLONESHAPESTROKE.setAttribute("stroke-width",strokeWidth);
  
  $CLONESHAPEFILL.setAttribute("data-xmovedshadow",xmovedshadow);
  $CLONESHAPEFILL.setAttribute("data-ymovedshadow",ymovedshadow);
  
  $CLONESHADOW.style.removeProperty("font-family");
  $CLONESHAPEFILL.style.removeProperty("font-family");
  $CLONESHAPESTROKE.style.removeProperty("font-family");
  
  let shadowHidden = $CLONESHADOW.classList.contains("visibility-hidden");
  
  let resetClassNameShadow = "shadow-SVG";
  let resetClassNameShapeFill = "shape-SVG fill";
  let resetClassNameShapeSTROKE = "shape-SVG stroke";
  
  if (shadowHidden) resetClassNameShadow += " visibility-hidden";
  
  $CLONESHADOW.className.baseVal = resetClassNameShadow;
  $CLONESHAPEFILL.className.baseVal = resetClassNameShapeFill;
  $CLONESHAPESTROKE.className.baseVal = resetClassNameShapeSTROKE;
  
  setFontFamilyTextSVG($CLONESHADOW,fontFamily.type,fontFamily.name);
  setFontFamilyTextSVG($CLONESHAPEFILL,fontFamily.type,fontFamily.name);
  setFontFamilyTextSVG($CLONESHAPESTROKE,fontFamily.type,fontFamily.name);
  
  let dyText = pxDistanceInBorders + (strokeWidth / 2);
  
  let heightSVGToApply = 0;
  
  linesText.forEach((text,i)=>{
    text = text.trim();
    
    const {width,x} = widthTextsAndX[i];
    
    let dxText = xInDirectionApply;
    if (directionOfWrite === "middle") dxText -= (width / 2);
    else if (directionOfWrite === "end") dxText -= width;
    
    if (text !== "") {
      [["dx",dxText - x],["dy",dyText - measuresTextOfReference.y]].forEach(([atr,value])=>{
        $CLONESHADOW.setAttribute(atr,value)
      })
      
      $CLONESHADOW.innerHTML = text;
      
      $SVGINCONTAINERSHAPES.appendChild($CLONESHADOW);
      
      $CLONESHADOW = $SVGINCONTAINERSHAPES.lastElementChild.cloneNode(true);
      
      heightSVGToApply = dyText + measuresTextOfReference.height + strokeWidth;
    }
    
    dyText += distanceYTexts + strokeWidth + measuresTextOfReference.height + (strokeWidth / 2);
  })
  
  const $SHADOWSTEXT = $SVGINCONTAINERSHAPES.querySelectorAll(".shadow-SVG");
  
  $SHADOWSTEXT.forEach(($SHADOW,index)=>{
    ["dx","dy"].forEach(atr=>{
      let value = $SHADOW.getAttribute(atr)
      $CLONESHAPEFILL.setAttribute(atr,value);
      $CLONESHAPESTROKE.setAttribute(atr,value);
    })
    
    $CLONESHAPEFILL.innerHTML = $SHADOW.innerHTML;
    
    $CLONESHAPESTROKE.innerHTML = $SHADOW.innerHTML;
    
    $SVGINCONTAINERSHAPES.appendChild($CLONESHAPESTROKE);
    
    const $FIRSTSHAPESTROKE = $SVGINCONTAINERSHAPES.querySelector(".shape-SVG.stroke");
    
    $SVGINCONTAINERSHAPES.insertBefore($CLONESHAPEFILL,$FIRSTSHAPESTROKE);
    
    $CLONESHAPEFILL = $SVGINCONTAINERSHAPES.querySelector(".shape-SVG.fill").cloneNode(true);
    $CLONESHAPESTROKE = $FIRSTSHAPESTROKE.cloneNode(true);
  })
  
  const newHeightSVG = heightSVGToApply + pxDistanceInBorders
  
  changeTransformOriginContainers("left top","left top");
  
  const {widthSVG,heightSVG,lastDegRotate} = toolSelected.propsContainerAdjustShapes;
  
  let pxAddedInHeightHalf = (newHeightSVG - heightSVG) / 2,
  pxAddedInWidthHalf = (newWidthSVG - widthSVG) / 2;
  
  adjustContainerToResize("top-left",lastDegRotate,pxAddedInHeightHalf,pxAddedInHeightHalf,pxAddedInWidthHalf,pxAddedInWidthHalf,newHeightSVG,newHeightSVG,newWidthSVG,newWidthSVG);
  
  setPropertyElement($SVGINCONTAINERSHAPES,"width",newWidthSVG + "px");
  setPropertyElement($SVGINCONTAINERSHAPES,"Height",newHeightSVG + "px");
  
  toolSelected.propsContainerAdjustShapes.widthStaticSVG = newWidthSVG;
  toolSelected.propsContainerAdjustShapes.heightStaticSVG = newHeightSVG;
  
  getPercentageInSizeForUseInKeepAspectRatioShape("text",newWidthSVG,newHeightSVG)
  
  let diferenceBettweenWidth = widthSVG - newWidthSVG,
  diferenceBettweenHeight = heightSVG - newHeightSVG;
  
  ["myLastHeight","myLastWidth","widthSVG","heightSVG"].forEach(prop=>{
    let value = prop.includes("Height") || prop.includes("height") ? newHeightSVG : newWidthSVG;
    
    toolSelected.propsContainerAdjustShapes[prop] = value;
  })
  
  resizeShapes ("top-left",$CONTAINERSHAPESMAIN,diferenceBettweenWidth,diferenceBettweenHeight,$CONTAINERADJUSTSHAPE,$CONTAINERADJUSTSHAPE.children["top-left"],0,0,true,true);
  
  rotateShapeAt(lastDegRotate);
}

function getDxTextsDependingOfDirectionWrite (xInit,widthOfReference,directionOfWrite) {
  let dxStart = xInit;
  if (directionOfWrite === "middle") dxStart += (widthOfReference / 2);
  else if (directionOfWrite === "end") dxStart += widthOfReference;
  return dxStart;
}

function writeInTextArea (e) {
  const {directionOfWrite,fontFamily} = toolSelected.valuesSettingShapeTextIntoModal;
  
  let newText = e.target.value;
  
  let linesText = newText.split("\n");
  
  let sizePxFont = getSizeFontShapeTextInModal(linesText);
  
  const $SVG = $(".modal-edit-shape-text svg");
  
  const heightSVG = getPropertyValueElement("height",$SVG);
  
  $SVG.querySelectorAll("text").forEach($text=>{$text.remove()});
  
  setPropertyElement($SVG,"--fontSizeTexts",`${sizePxFont}px`);
  
  $SVG.insertAdjacentHTML("beforeend",`<text class="text-for-get-measures visibility-hidden" dx="0" dy="0">Text</text>`);
  
  const $TEXTFORGETMEASURES = $SVG.querySelector(".text-for-get-measures");
  
  setFontFamilyTextSVG($TEXTFORGETMEASURES,fontFamily.type,fontFamily.name);
  
  let measuresOfReferenceText = $TEXTFORGETMEASURES.getBBox();
  
  const widthTextsAndX = gitSizeWidthOfTextInSVG(linesText,2,$SVG,fontFamily.type,fontFamily.name);
  
  let widthTextsLong = Math.max(...widthTextsAndX.map(({width})=>{return width}));
  
  let xInDirectionApply = getDxTextsDependingOfDirectionWrite(0,widthTextsLong,directionOfWrite);
  
  const [firstLineText,secondLineText] = linesText;
  
  let showOnlyTEXT = (firstLineText.trim() === "" && secondLineText?.trim() === "") || linesText.join("\n").trim() === ""
  
  let showTextWithFontSizeCurrent = secondLineText !== undefined && secondLineText.trim() !== "";
  
  for (let i=0;i < 2;i++) {
    let text = linesText[i].trim();
    
    let onlyTextToShow = showOnlyTEXT ? "Text" : text;
    
    if (showOnlyTEXT || !showTextWithFontSizeCurrent) {
      let newFont = getSizeFontShapeTextInModal([]);
      
      setPropertyElement($SVG,"--fontSizeTexts",`${newFont}px`);
      
      $TEXTFORGETMEASURES.innerHTML = onlyTextToShow;
      
      const {x,height,y} = $TEXTFORGETMEASURES.getBBox();
      
      $SVG.insertAdjacentHTML("beforeend",`<text dx="${0 - x}" dy="${((heightSVG / 2) - (height / 2)) - y}">${onlyTextToShow}</text>`);
      
      break;
    }
    
    let {width,x} = widthTextsAndX[i];
    
    let dxText = xInDirectionApply;
    if (directionOfWrite === "middle") dxText -= (width / 2);
    else if (directionOfWrite === "end") dxText -= width;
    
    if ((i === 0 && text !== "") || i === 1) {
      let dy = i === 0 ? 0 : (heightSVG - measuresOfReferenceText.height)
      
      $SVG.insertAdjacentHTML("beforeend",`<text dx="${dxText - x}" dy="${dy - measuresOfReferenceText.y}">${text}</text>`);
    }
  }
  
  $TEXTFORGETMEASURES.remove();
  
  $SVG.querySelectorAll("text").forEach($TEXT=>{
    setFontFamilyTextSVG($TEXT,fontFamily.type,fontFamily.name);
  })
  
  toolSelected.valuesSettingShapeTextIntoModal.texts = newText;
}

function touchesInputRangeSpacingLineText (e) {
  const $INPUT = e.target;
  
  let clientX = e.type !== "touchend" ? e.touches[0].clientX : e.changedTouches[0].clientX;
  
  const leftSpanMark = (clientX - $INPUT.parentElement.getBoundingClientRect().left) - 23.5
  
  const $SPANMARK = $INPUT.nextElementSibling;
  
  let {left,width} = $INPUT.getBoundingClientRect();
  
  let percentageOfWidth = ((clientX - left) * 100) / width;
  
  let minValueInput = Number($INPUT.min)

  let maxValueInput = Number($INPUT.max)
  
  let newValueRange = minValueInput + ((percentageOfWidth * (maxValueInput - minValueInput)) / 100);
  
  let methodCorrect;
  if (e.type === "touchstart") {
    $SPANMARK.classList.remove("visibility-hidden");
    e.preventDefault();
  }
  else if (e.type === "touchend") {
    $SPANMARK.classList.add("visibility-hidden");
  }
  
  clearTimeout(toolSelected.idtimeoutmarkerspacing);
  
  $INPUT.value = newValueRange;
  
  if (clientX >= left && clientX <= (left + width)) setPropertyElement($SPANMARK,"left",`${leftSpanMark}px`);
  
  let valueInput = $INPUT.valueAsNumber;
  
  $SPANMARK.innerText = `${valueInput}%`
  
  toolSelected.valuesSettingShapeTextIntoModal.percentageLineSpacing = valueInput;
  
  writeInTextArea({target:$(".modal-edit-shape-text textarea")});
}

function getFontSizeToApplyInSVGsetting () {
  const $SVG = $(".modal-edit-shape-text svg");
  
  const {fontFamily} = toolSelected.valuesSettingShapeTextIntoModal;
  
  const heightSVG = getPropertyValueElement("height",$SVG);
  
  setPropertyElement($SVG,"--fontSizeTexts","70px");
  
  $SVG.insertAdjacentHTML("beforeend",`<text class="text-for-get-measures visibility-hidden" dx="0" dy="0">Text</text>`);
  
  const $TEXTFORGETMEASURES = $SVG.querySelector(".text-for-get-measures");
  
  setFontFamilyTextSVG($TEXTFORGETMEASURES,fontFamily.type,fontFamily.name);
  
  const {height} = $TEXTFORGETMEASURES.getBBox();
  
  let heightWithTwoTextInSVG = height * 2,diferenceInHeight = heightSVG - heightWithTwoTextInSVG;
  
  let fontSizeMaxAccept = ((height + (diferenceInHeight / 2)) / height) * 70
  
  let fontSizeToApply = (100 * fontSizeMaxAccept) / 150;
  
  toolSelected.variablesShapeTextTemporal.fontSizeToApply = fontSizeToApply;
  
  $TEXTFORGETMEASURES.remove();
}

function touchesSquareAdjustShape (e) {
  if (e.type === "touchstart") shrinkContainerCorrectIfExist();
  
  const {runningshrinkcontainer} = $aplication.dataset;
  
  let cancelExecution = e.currentTarget.dataset.cancelexecution;
  
  if (cancelExecution && e.type === "touchend") {
    e.currentTarget.removeAttribute("data-cancelexecution");
    return;
  }
  
  cancelExecution = e.currentTarget.dataset.cancelexecution;
  
  if (runningshrinkcontainer || cancelExecution) {
    e.currentTarget.setAttribute("data-cancelexecution","true");
    return;
  }
  
  if (e.type === "touchstart") {
    let {clientX,clientY} = e.touches[0];
    
    const {idshape} = toolSelected.modalFigures.SHAPE;
    
    let circleSettingShapePulsed = e.target.classList.contains("circle-top-center");
    
    e.currentTarget.setAttribute("data-lastclientx",clientX);
    e.currentTarget.setAttribute("data-lastclienty",clientY);
    
    if (e.target.id === "button-rotate" || e.target.id === "button-rotate-ninety-deg" || (e.target.classList.contains("circle") && e.target.id !== "center") || e.target.classList.contains("circle-for-move-in-screen")) {
      let originTransformContainerAdjustShapes,originTransformContainerShapes;
      
      if (e.target.classList.contains("circle")) {
        originTransformContainerShapes = "left top";
        originTransformContainerAdjustShapes = "left top";
      } else {
        const $CONTAINERADJUSTSHAPES = $aplication.children["square-adjust-SHAPES"];
        
        let directionCorrect = e.target.classList.contains("circle-for-move-in-screen") ? "left" : "center";
        
        let transformOriginContainers = getTransformOriginContainerForRotate(idshape,directionCorrect);
        
        originTransformContainerAdjustShapes = transformOriginContainers.originContainerAdjustShapes;
        originTransformContainerShapes = transformOriginContainers.originContainerShapes;
        
        toolSelected.lastLocationOriginContainerToUse = directionCorrect;
      }
      
      changeTransformOriginContainers(originTransformContainerAdjustShapes,originTransformContainerShapes);
    }
    else if (circleSettingShapePulsed && idshape !== "text") {
      addEventTouchForShrinkContainer("settingshape");
      
      initModalSettingSHAPES();
    }
    else if (circleSettingShapePulsed) {
      const {htmlEditShapeText} = toolSelected.htmlChildren;
      
      $aplication.insertAdjacentHTML("beforeend",htmlEditShapeText);
      
      const $MODALEDITTEXT = $(".aplication .modal-edit-shape-text");
      
      const $BUTTONDIRECTIONWRITESELECTED = $MODALEDITTEXT.querySelector(".container-buttons-setting-text #button-types-align-text");
      
      const $CONTAINERALLTYPESDIRECTIONWRITE = $MODALEDITTEXT.querySelector(".container-buttons-setting-text .container-types-align-text");
      
      toolSelected.valuesSettingShapeTextIntoModal = structuredClone(toolSelected.valuesSettingShapeText);
      
      const {
        directionOfWrite,
        keepAspectRatio,
        percentageLineSpacing,
        texts,
        fontFamily
      } = toolSelected.valuesSettingShapeTextIntoModal;
      
      const $CHECKBOX = $MODALEDITTEXT.querySelector(".container-checkbox input");
      
      $CHECKBOX.checked = keepAspectRatio;
      
      $CHECKBOX.onchange = ({target})=>{
        const {checked} = target;
        toolSelected.valuesSettingShapeTextIntoModal.keepAspectRatio = checked;
      }
      
      let typeDirectionWrite = $CONTAINERALLTYPESDIRECTIONWRITE.querySelector(`button[data-direction="${directionOfWrite}"]`).innerText;
      
      $BUTTONDIRECTIONWRITESELECTED.innerText = typeDirectionWrite;
      
      $MODALEDITTEXT.onclick = clickedModalEditShapeText;
      
      const $TEXTAREA = $MODALEDITTEXT.querySelector("textarea");
      
      $TEXTAREA.oninput = writeInTextArea;
      
      const $INPUTRANGE = $MODALEDITTEXT.querySelector(".container-input-range input");
      
      $INPUTRANGE.value = percentageLineSpacing;
      
      $INPUTRANGE.ontouchstart = touchesInputRangeSpacingLineText
      $INPUTRANGE.ontouchmove = touchesInputRangeSpacingLineText
      $INPUTRANGE.ontouchend = touchesInputRangeSpacingLineText
      
      const $BUTTONFONTSELECTEDCURRENT = $MODALEDITTEXT.querySelector(".container-change-font #types-font")
      
      if (!toolSelected.variablesForChangeFont) toolSelected.variablesForChangeFont = getDefaultFontsTextOfSystemForChange();
      
      if (toolSelected.allFontsAvailablesInCUSTOMoption) {
        const {allFontsAvailablesInCUSTOMoption} = toolSelected;
        
        let fontsCustom = toolSelected.variablesForChangeFont.allFontsInOption.filter(props=>props.type === "font-face");
        
        let folders = Object.values(allFontsAvailablesInCUSTOMoption);
        
        const $HEAD = document.head;
        
        for (let index=0;index < folders.length;index++) {
          let folder = folders[index];
          
          let {allFontsAvailablesID} = folder;
          
          let fontsPending = [];
          
          fontsCustom.forEach(propsFont=>{
            if (propsFont.name in allFontsAvailablesID && !$HEAD.children[propsFont.name]) {
              const {url,format} = allFontsAvailablesID[propsFont.name];
              addFonFaceStyleInHEAD(propsFont.name,url,format);
            } 
            else if (!$HEAD.children[propsFont.name]) fontsPending.push(propsFont);
          })
          
          if (fontsPending.length === 0) break;
          else fontsCustom = fontsPending;
        }
      }
      
      setFontFamilyTextSVG($BUTTONFONTSELECTEDCURRENT,fontFamily.type,fontFamily.name);
      
      let {indexCurrentInArrayFonts,allFontsInOption} = toolSelected.variablesForChangeFont;
      
      let {nameFontText} = allFontsInOption[indexCurrentInArrayFonts];
      
      $BUTTONFONTSELECTEDCURRENT.innerText = nameFontText;

      getFontSizeToApplyInSVGsetting();
      
      $TEXTAREA.value = texts;
      
      writeInTextArea({target:$TEXTAREA});
    }
    
    let idELEMENT = e.target.id;
    if (idELEMENT === "button-rotate") {
      let {lastDegRotate} = toolSelected.propsContainerAdjustShapes;
      
      let degToShow = lastDegRotate === 360 ? 0 : lastDegRotate;
      
      updateTextElementOfSizeAndDegSHAPE(`${degToShow.toFixed(1)}°`);
    } else if (idELEMENT !== "center" && e.target.classList.contains("circle")) {
      const {myLastWidth,myLastHeight} = toolSelected.propsContainerAdjustShapes,
      {lockRatioShape,variablesOfLockRatio} = toolSelected,
      {lockRatioPercentageWidthInHeight,lockRatioPercentageHeightInWidth} = variablesOfLockRatio,
      {idshape} = toolSelected.modalFigures.SHAPE,
      {keepAspectRatio} = toolSelected.valuesSettingShapeText;
      
      let widthThight = myLastWidth - 4,
      heightThinght;
      
      if (lockRatioShape && idshape !== "text") heightThinght = (widthThight * lockRatioPercentageHeightInWidth) / 100;
      else if (keepAspectRatio && idshape === "text") {
        const {lockRatioPercentageHeightInWidth} = toolSelected.variablesShapeTextTemporal;
        
        heightThinght = (lockRatioPercentageHeightInWidth * widthThight) / 100
      }
      else heightThinght = myLastHeight - 4
      
      updateTextElementOfSizeAndDegSHAPE(`${widthThight.toFixed(1)} × ${heightThinght.toFixed(1)}`);
    }
  }
  else if (e.type === "touchmove") {
    const $containerSHAPESINSERT = $(".aplication .img .container-SHAPES-insert");
    let {clientX,clientY} = e.touches[0]
    ,lastclientx = Number(e.currentTarget.dataset.lastclientx),
    lastclienty = Number(e.currentTarget.dataset.lastclienty),
    diferenceX = clientX - lastclientx,
    diferenceY = clientY - lastclienty;
    
    if (e.target.id === "square-adjust-SHAPES") {
      const {idshape} = toolSelected.modalFigures.SHAPE;
      
      const direferencesXYModified = movePositionSHAPE(e.currentTarget,$containerSHAPESINSERT,diferenceX,diferenceY,idshape);
      
      moveCirclesForResizeAndRotateContainersIfExist(idshape,direferencesXYModified);
    }
    else if (e.target.id === "button-rotate") rotateSHAPE(e.target,diferenceX,diferenceY);
    else if (e.target.id === "button-rotate-ninety-deg" && !e.target.dataset.fingermove) e.target.setAttribute("data-fingermove","true");
    else if (e.target.classList.contains("circle-for-move-in-screen") || (e.target.classList.contains("circle") && !e.target.classList.contains("circle-top-center"))) {
      let target = e.target,
      {direction} = target.dataset,
      {idshape} = toolSelected.modalFigures.SHAPE;
      
      if (idshape === "line") rotateSHAPELINE(target,diferenceX,diferenceY);
      else if (idshape === "arrowIndicator") rotateAndResizeShapeArrowIndicator(target,diferenceX,diferenceY);
      else {
        const {propsContainerAdjustShapes} = toolSelected;
        
        let CLIENTX,CLIENTY;
        if (propsContainerAdjustShapes.clientX !== undefined) {
          propsContainerAdjustShapes.clientX += diferenceX;
          propsContainerAdjustShapes.clientY += diferenceY;
          
          CLIENTX = propsContainerAdjustShapes.clientX;
          CLIENTY = propsContainerAdjustShapes.clientY;
        }
        else {
          CLIENTX = clientX;
          CLIENTY = clientY;
        }
        
        resizeShapes(direction,$containerSHAPESINSERT,diferenceX,diferenceY,e.currentTarget,target,CLIENTX,CLIENTY);
      }
    }
    
    e.currentTarget.setAttribute("data-lastclientx",clientX);
    e.currentTarget.setAttribute("data-lastclienty",clientY);
  }
  else if (e.type === "touchend") {
    const $element = e.target,
    {direction} = $element.dataset,
    directionORIGINAL = $element.id,
    {pxXYaccumulatedToRotateShape,
    positionCirclePreviousEnterRangeSpecified,firstEnteredTheEdgeRange,
      clientX
    } = toolSelected.propsContainerAdjustShapes;
    
    if (clientX !== undefined) {
      const {propsContainerAdjustShapes} = toolSelected;
      
      delete propsContainerAdjustShapes.clientX;
      delete propsContainerAdjustShapes.clientY;
    }
    
    if (direction !== directionORIGINAL && ($element.classList.contains("circle") && $element.id !== "center")) $element.setAttribute("data-direction",directionORIGINAL);
    
    if ($element.id === "button-rotate-ninety-deg" && !$element.dataset.fingermove) rotateShapeFromNinetyToNinetyDegs();
    else if ($element.id === "button-rotate-ninety-deg") $element.removeAttribute("data-fingermove");
    
    if (pxXYaccumulatedToRotateShape) delete toolSelected.propsContainerAdjustShapes.pxXYaccumulatedToRotateShape;
    
    if (positionCirclePreviousEnterRangeSpecified) delete toolSelected.propsContainerAdjustShapes.positionCirclePreviousEnterRangeSpecified;
    if (firstEnteredTheEdgeRange) delete toolSelected.propsContainerAdjustShapes.firstEnteredTheEdgeRange;
    
    deletePropsOfvaluesToEnterInRangeBorder();
    deletePropsOfvaluesToEnterInRangeCenterCanvas();
    
    $aplication.children["info-deg-and-size-shape"]?.remove();
  }
}

function moveCirclesForResizeAndRotateContainersIfExist (idshape,amountPxToMove) {
  if (idshape === "line" || idshape === "arrowIndicator") {
    const $CIRCLELEFT = $(".aplication > #circle-left"),
    $CIRCLERIGHT = $(".aplication > #circle-right");
    
    const {pxAddedToX,pxAddedToY} = amountPxToMove;
    
    [$CIRCLELEFT,$CIRCLERIGHT].forEach($CIRCLE=>{
      const leftCircle = getPropertyValueElement("left",$CIRCLE),
      topCircle = getPropertyValueElement("top",$CIRCLE);
      
      setPropertyElement($CIRCLE,"left",`${leftCircle + pxAddedToX}px`);
      setPropertyElement($CIRCLE,"top",`${topCircle + pxAddedToY}px`);
    })
  }
}

function rotateAndResizeShapeArrowIndicator ($CIRCLETOUCHING,diferenceX,diferenceY,rotatingAuto) {
  let {
    lastDegRotate,
    amountPxForWidthContainers
  } = toolSelected.propsContainerAdjustShapes;
  
  const $CONTAINERSHAPESMAIN = $aplication.querySelector(".container-SHAPES-insert");
  
  const $SHAPEFILL = $CONTAINERSHAPESMAIN.querySelector("svg .shape-SVG.fill");
  const $SHAPESTROKE = $CONTAINERSHAPESMAIN.querySelector("svg .shape-SVG.stroke");
  
  let {containerSHAPES,containerAdjustSHAPES} = amountPxForWidthContainers;
  
  const {degRotate,newWidthContainerSHAPES} = rotateAndResizeShape($CIRCLETOUCHING,lastDegRotate,diferenceX,diferenceY,containerSHAPES,containerAdjustSHAPES,rotatingAuto)
  
  toolSelected.propsContainerAdjustShapes.lastDegRotate = degRotate;
  
  const newWidthShape = toolSelected.propsContainerAdjustShapes.myLastWidth
  
  toolSelected.modalFigures.SHAPE["arrowIndicator"].width = newWidthShape;
  
  const {thickness} = toolSelected.valuesSettingShapeArrowIndicator;
  
  const {
    heightSVG,
    myLastHeight,
    percentageXShadowInHeightShape,
    percentageYShadowInHeightShape,
    strokeWidth
  } = toolSelected.propsContainerAdjustShapes;
  
  let {blurPxShadow} = toolSelected;
  
  let widthForInitAspectRatio = (216.67 * thickness) / 100;
  
  let newHeightShape;
  
  if (newWidthShape <= widthForInitAspectRatio) {
    newHeightShape = (46.16 * newWidthShape) / 100;
  }
  else {
    newHeightShape = (46.16 * widthForInitAspectRatio) / 100;
  }
  
  let nextXShadow = (percentageXShadowInHeightShape * newHeightShape) / 100,
  nextYShadow = (percentageYShadowInHeightShape * newHeightShape) / 100;
  
  $SHAPEFILL.setAttribute("data-xmovedshadow",nextXShadow);
  $SHAPEFILL.setAttribute("data-ymovedshadow",nextYShadow);
  
  let pxMoveShadowHigher = Math.max(Math.abs(nextXShadow),Math.abs(nextYShadow));
  
  let newHeightSVG = newHeightShape + strokeWidth + (pxMoveShadowHigher * 2) + (blurPxShadow * 2),
  newWidthSVG = newWidthShape + strokeWidth + (pxMoveShadowHigher * 2) + (blurPxShadow * 2);
  
  const {measuresCircleLeft,measuresCircleRight} = getMeasuresCirclesForResizeShape();
  
  let distanceBettweenCircles = getDistanceOfTwoPoints(measuresCircleRight.x,measuresCircleRight.y,measuresCircleLeft.x,measuresCircleLeft.y);
  
  toolSelected.propsContainerAdjustShapes.amountPxForWidthContainers.containerSHAPES = newWidthSVG - distanceBettweenCircles;
  
  let newHeightContainer;
  if (newHeightShape < 35) newHeightContainer = 35;
  else newHeightContainer = newHeightShape;
  
  let diferencesInHeightContainerAdjust = newHeightContainer - myLastHeight,
  diferencesInHeightContainerSVG = newHeightSVG - heightSVG,
  diferencesInWidthContainerSVG = newWidthSVG - newWidthContainerSHAPES;
  
  let resizeTheHeight = diferencesInHeightContainerSVG !== 0 || diferencesInHeightContainerAdjust !== 0 || diferencesInWidthContainerSVG !== 0;
  
  if (resizeTheHeight) {
    let originForResizeAndMoveContainer = "left top";
  
    changeTransformOriginContainers(originForResizeAndMoveContainer,originForResizeAndMoveContainer);
    
    adjustContainerToResize("top-left",degRotate,diferencesInHeightContainerSVG / 2,diferencesInHeightContainerAdjust / 2,diferencesInWidthContainerSVG / 2,0,newHeightSVG,newHeightContainer,newWidthSVG,newWidthShape);
  }
  
  toolSelected.propsContainerAdjustShapes.myLastHeight = newHeightContainer;
  
  toolSelected.propsContainerAdjustShapes.heightSVG = newHeightSVG;
  toolSelected.propsContainerAdjustShapes.widthSVG = newWidthSVG;
  
  toolSelected.modalFigures.SHAPE["arrowIndicator"].height = newHeightShape;
  
  if (resizeTheHeight) {
    const {originContainerShapes,originContainerAdjustShapes} = getTransformOriginContainerForRotate("arrowIndicator","left");
    changeTransformOriginContainers(originContainerAdjustShapes,originContainerShapes);
  }
  
  const {atributeToModify,valuesPathShape} = getMeasuresOfShapeInSVGContainer("arrowIndicator",newWidthSVG,newHeightSVG);
  
  toolSelected.propsContainerAdjustShapes.valuesPathShape = valuesPathShape;
  
  const {atribute,value} = atributeToModify[0];
  
  $SHAPEFILL.setAttribute(atribute,value);
  $SHAPESTROKE.setAttribute(atribute,value)
  
  updatePositionShadowInSVG();
}

function deletePropsOfvaluesToEnterInRangeBorder () {
  const {measuresYBeforeEnterInRangeBorde,measuresXBeforeEnterInRangeBorde} = toolSelected.propsContainerAdjustShapes
  
  if (measuresYBeforeEnterInRangeBorde) {
    delete toolSelected.propsContainerAdjustShapes.measuresYBeforeEnterInRangeBorde
    changeBordersContainerCanvasIfRequires(false,"1px solid #fff");
  }
  if (measuresXBeforeEnterInRangeBorde) {
    delete toolSelected.propsContainerAdjustShapes.measuresXBeforeEnterInRangeBorde
    changeBordersContainerCanvasIfRequires(false,"1px solid #fff");
  }
}

function deletePropsOfvaluesToEnterInRangeCenterCanvas () {
  const {xAdjustShapeBeforeEnterRangeCenter,yAdjustShapeBeforeEnterRangeCenter} = toolSelected.propsContainerAdjustShapes
  
  if (xAdjustShapeBeforeEnterRangeCenter) {
    delete toolSelected.propsContainerAdjustShapes.xAdjustShapeBeforeEnterRangeCenter;
    $(".aplication #container-canvas .line-center-canvas-x").remove();
  }
  if (yAdjustShapeBeforeEnterRangeCenter) {
    delete toolSelected.propsContainerAdjustShapes.yAdjustShapeBeforeEnterRangeCenter;
    $(".aplication #container-canvas .line-center-canvas-y").remove();
  }
}

function rotateShapeFromNinetyToNinetyDegs () {
  const {lastDegRotate} = toolSelected.propsContainerAdjustShapes;
  
  let theRestDivision = (lastDegRotate % 90),nextDeg = lastDegRotate + (90 - theRestDivision);
  
  nextDeg = nextDeg >= 360 ? nextDeg - 360 : nextDeg;
  
  rotateShapeAt(nextDeg)
}

function getDistanceOfTwoPoints (x1,y1,x2,y2) {
  return Math.sqrt(Math.pow(x2 - x1,2) + Math.pow(y2 - y1,2));
}

function getPxToAddedOrSubtractInLeftAndTopShadowDependingDegRotate (degRotate,positionShapes,rotateShapeY,rotateShapeX) {
  let {
    leftOriginalShadow,
    leftOriginalOutline,
    topOriginalShadow,
    topOriginalOutline
  } = positionShapes,
  amountPxInLeft,
  amountPxInTop;
  
  const {idshape} = toolSelected.modalFigures.SHAPE;
  
  let diferenceXShadowAndOutline = leftOriginalShadow - leftOriginalOutline,
  diferenceYShadowAndOutline = topOriginalShadow - topOriginalOutline;
  
  let isShapeText = idshape === "text";
  
  if (degRotate >= 270 && degRotate <= 360) {
    let porcentajePx = ((360 - degRotate) * 100) / 90;
    
    let maxDistanceMoveX = (diferenceXShadowAndOutline + diferenceYShadowAndOutline);
    
    amountPxInLeft = -(porcentajePx * maxDistanceMoveX) / 100
    
    amountPxInTop = (porcentajePx * (diferenceXShadowAndOutline - diferenceYShadowAndOutline)) / 100
    
    if (rotateShapeY === 180 && isShapeText) {
      let diferenceForY = (diferenceYShadowAndOutline - -diferenceXShadowAndOutline);
      
      amountPxInLeft = -(diferenceXShadowAndOutline * 2) + ((porcentajePx * diferenceForY) / 100);
    }
    
    if (rotateShapeX === 180 && isShapeText) {
      let amountPxForSideContrary = -(diferenceYShadowAndOutline * 2);
      
      amountPxInTop = amountPxForSideContrary - ((porcentajePx * (diferenceXShadowAndOutline + -diferenceYShadowAndOutline)) / 100);
    }
  }
  else if (degRotate < 270 && degRotate >= 180) { 
    let porcentajePx = ((270 - degRotate) * 100) / 90;
    let diferencesAddedX = (diferenceXShadowAndOutline + diferenceYShadowAndOutline),
    maxPxTopAdded =  (diferenceXShadowAndOutline - diferenceYShadowAndOutline);
    
    let maxAmountPxMove = ((porcentajePx * (diferencesAddedX - diferenceXShadowAndOutline * 2)) / 100);
    
    amountPxInTop = maxPxTopAdded + -((porcentajePx * ((topOriginalShadow + maxPxTopAdded) - (topOriginalOutline - diferenceYShadowAndOutline))) / 100);
    
    if (rotateShapeY === 180 && isShapeText) {
      let maxMove = -(diferenceXShadowAndOutline * 2) + (diferenceYShadowAndOutline - -diferenceXShadowAndOutline);
      
      amountPxInLeft = maxMove + -((porcentajePx * maxMove) / 100);
    }
    else amountPxInLeft = -diferencesAddedX + maxAmountPxMove;
    
    if (rotateShapeX === 180 && isShapeText) {
      let diferenceForX = diferenceXShadowAndOutline + diferenceYShadowAndOutline;
      
      amountPxInTop = -diferenceForX + ((porcentajePx * diferenceForX) / 100)
    }
    
  } else if (degRotate < 180 && degRotate >= 90) {
    let porcentajePx = ((180 - degRotate) * 100) / 90;
    
    let diferencesAddedX = diferenceXShadowAndOutline * 2,
    diferencesAddedY =  (diferenceYShadowAndOutline * 2);
    
    let amountPxMove = ((porcentajePx * (diferenceXShadowAndOutline + diferenceYShadowAndOutline)) / 100);
    
    if (rotateShapeY === 180 && isShapeText) {
      amountPxInLeft = (porcentajePx * (-diferenceYShadowAndOutline - diferenceXShadowAndOutline)) / 100;
    }
    else amountPxInLeft = -diferencesAddedX +  amountPxMove;
    
    if (rotateShapeX === 180 && isShapeText) {
      amountPxInTop = (porcentajePx * (diferenceXShadowAndOutline + -diferenceYShadowAndOutline)) / 100;
    } else amountPxInTop = -diferencesAddedY + ((porcentajePx * (diferenceYShadowAndOutline - diferenceXShadowAndOutline)) / 100);
  } else if (degRotate < 90 && degRotate >= 0) {
    let porcentajePx = ((90 - degRotate) * 100) / 90;
    
    let diferencesAddedX = diferenceYShadowAndOutline - diferenceXShadowAndOutline,
    diferencesAddedY =  diferenceXShadowAndOutline + diferenceYShadowAndOutline;
    
    let amountPxMove = -((porcentajePx * diferencesAddedX) / 100);
    
    if (rotateShapeY === 180 && isShapeText) {
      let amountPxForDiferenceY = (-diferenceYShadowAndOutline - diferenceXShadowAndOutline);
      
      amountPxInLeft = amountPxForDiferenceY - ((porcentajePx * (amountPxForDiferenceY + (diferenceXShadowAndOutline * 2))) / 100);
    }
    else amountPxInLeft = diferencesAddedX + amountPxMove;
    
    if (rotateShapeX === 180 && isShapeText) {
      let addedInY = diferenceXShadowAndOutline + -diferenceYShadowAndOutline;
      amountPxInTop = addedInY - ((porcentajePx * (diferenceXShadowAndOutline + diferenceYShadowAndOutline)) / 100);
    } else amountPxInTop = -diferencesAddedY + ((porcentajePx * (diferencesAddedY)) / 100);
  }
  
  return {amountPxInTop,amountPxInLeft}
}

function adjustShapeToRotateIfItIsActiveOption (degcurrentshape) {
  const {adjustToSpecifiedDegree} = toolSelected.optionsPositioningSHAPE
  
  if (adjustToSpecifiedDegree) {
    let howNinetyDegEnterInDegCurrent = Math.floor(degcurrentshape / 90),
    theRestDivision = degcurrentshape % 90;
    
    if (theRestDivision <= 4) return (howNinetyDegEnterInDegCurrent * 90);
    else if (theRestDivision >= 86) return (howNinetyDegEnterInDegCurrent * 90) + 90;
  }
}

function rotateSHAPE ($buttonRotate,diferenceX,diferenceY) {
  const {x,y} = $aplication.querySelector("#square-adjust-SHAPES #central-point").getBoundingClientRect(),
  {top,left} = $aplication.querySelector("#square-adjust-SHAPES .point-center-in-button-rotate").getBoundingClientRect(),
  {pxXYaccumulatedToRotateShape} = toolSelected.propsContainerAdjustShapes
  
  let newXPointInCenterButtonRotate = left + diferenceX,
  newYPointInCenterButtonRotate = top + diferenceY,
  distanceBettweenPoints = getDistanceOfTwoPoints(x,y,newXPointInCenterButtonRotate,newYPointInCenterButtonRotate);
  
  if (pxXYaccumulatedToRotateShape) {
    newXPointInCenterButtonRotate += pxXYaccumulatedToRotateShape.X;
    newYPointInCenterButtonRotate += pxXYaccumulatedToRotateShape.Y;
    
    distanceBettweenPoints = getDistanceOfTwoPoints(x,y,newXPointInCenterButtonRotate,newYPointInCenterButtonRotate);
    
    pxXYaccumulatedToRotateShape.Y += diferenceY;
    pxXYaccumulatedToRotateShape.X += diferenceX;
  }
  
  let degRotate,
  circleFILL = Math.PI * 2,
  closestPosition;
  
  for (let radian = 0;radian <= circleFILL;radian+=0.01) {
    let xCircumference = (Math.cos(radian) * distanceBettweenPoints) + x,
    yCircumference = (Math.sin(radian) * distanceBettweenPoints) + y,
    diferenceX = Math.abs(newXPointInCenterButtonRotate - xCircumference),
    diferenceY = Math.abs(newYPointInCenterButtonRotate - yCircumference),
    sumOfTwoAxis = diferenceX + diferenceY;
    
    if (!closestPosition || (sumOfTwoAxis < closestPosition.sumOfTwoAxis)) {
      degRotate = (radian * 180) / Math.PI;
      closestPosition = {sumOfTwoAxis};
    }
  }
  
  let adjustShapeInDeg = adjustShapeToRotateIfItIsActiveOption(degRotate);
  
  if (adjustShapeInDeg >= 0) {
    degRotate = adjustShapeInDeg;
    if (!pxXYaccumulatedToRotateShape) toolSelected.propsContainerAdjustShapes.pxXYaccumulatedToRotateShape = {X:0,Y:0};
  } else if (pxXYaccumulatedToRotateShape) delete toolSelected.propsContainerAdjustShapes.pxXYaccumulatedToRotateShape;
  
  let degToShowInText = degRotate === 360 ? 0 : degRotate;
  
  updateTextElementOfSizeAndDegSHAPE(`${degToShowInText.toFixed(1)}°`);
  
  rotateShapeAt(degRotate);
}

function updateTextElementOfSizeAndDegSHAPE (newValue) {
  const HTMLINFO = `<span class="info-deg-and-size-shape" id="info-deg-and-size-shape">${newValue}</span>`,
  $INFOSHAPE = $aplication.children["info-deg-and-size-shape"];
  
  if (!$INFOSHAPE) $aplication.insertAdjacentHTML("beforeend",HTMLINFO);
  else $INFOSHAPE.innerText = newValue;
}

function rotateAndResizeShape ($circleTouching,lastDegRotate,diferenceX,diferenceY,forWidthContainerShapes,forWidthContainerAdjustShapes,rotatingAuto) {
  const leftCircle = getPropertyValueElement("left",$circleTouching),
  topCircle = getPropertyValueElement("top",$circleTouching),
  $CONTAINERSHAPES = $aplication.children["container-canvas"].children["container-SHAPES-INSERT"]
  ,$CONTAINERADJUSTSHAPES = $aplication.children["square-adjust-SHAPES"],
  DIRECTIONCIRCLE = $circleTouching.id,
  {positionCirclePreviousEnterRangeSpecified} = toolSelected.propsContainerAdjustShapes;
  
  let measureCircleLEFT,measureCircleRIGHT;
  if (positionCirclePreviousEnterRangeSpecified) {
    positionCirclePreviousEnterRangeSpecified.x += diferenceX;
    positionCirclePreviousEnterRangeSpecified.y += diferenceY;
    
    if (DIRECTIONCIRCLE === "circle-right") {
      measureCircleRIGHT = {...positionCirclePreviousEnterRangeSpecified};
      measureCircleLEFT = $aplication.children["circle-left"].getBoundingClientRect();
    } else {
      measureCircleLEFT = {...positionCirclePreviousEnterRangeSpecified};
      measureCircleRIGHT = $aplication.children["circle-right"].getBoundingClientRect();
    }
    
    if (lastDegRotate === 0 || lastDegRotate === 360 || lastDegRotate === 180) diferenceY = 0
    else if (lastDegRotate === 270 || lastDegRotate === 90) diferenceX = 0;
  }
  
  let nextLeftCircle = leftCircle + diferenceX,
  nextTopCircle = topCircle + diferenceY
  
  setPropertyElement($circleTouching,"left",`${nextLeftCircle}px`);
  setPropertyElement($circleTouching,"top",`${nextTopCircle}px`);
  
  const {measuresCircleLeft,measuresCircleRight} = getMeasuresCirclesForResizeShape();
  
  let distanceOriginalBettwenCircles = getDistanceOfTwoPoints(measuresCircleLeft.x,measuresCircleLeft.y,measuresCircleRight.x,measuresCircleRight.y);
  
  if (!measureCircleLEFT) {
    measureCircleLEFT = measuresCircleLeft;
    measureCircleRIGHT = measuresCircleRight;
  }
  
  const measuresShortCircleRIGHT = {x:measureCircleLEFT.x + ((2 * (measureCircleRIGHT.x - measureCircleLEFT.x)) / 100),y:measureCircleLEFT.y + ((2 * (measureCircleRIGHT.y - measureCircleLEFT.y)) / 100)},
  sizeShortBettweenCircles = getDistanceOfTwoPoints(measureCircleLEFT.x,measureCircleLEFT.y,measuresShortCircleRIGHT.x,measuresShortCircleRIGHT.y);
  
  let degRotate,
  circleFILL = Math.PI * 2,
  closestPosition;
  
  for (let radian = 0;radian <= circleFILL;radian+=0.01) {
    let x = (Math.cos(radian) * sizeShortBettweenCircles) + measureCircleLEFT.x,
    y = (Math.sin(radian) * sizeShortBettweenCircles) + measureCircleLEFT.y,
    diferenceX = Math.abs(measuresShortCircleRIGHT.x - x),
    diferenceY = Math.abs(measuresShortCircleRIGHT.y - y),
    sumOfTwoAxis = diferenceX + diferenceY;
    
    if (!closestPosition || (sumOfTwoAxis < closestPosition.sumOfTwoAxis)) {
      degRotate = (radian * 180) / Math.PI;
      closestPosition = {sumOfTwoAxis};
    }
  }
  
  let adjustShapeInDeg = adjustShapeToRotateIfItIsActiveOption(degRotate);
  
  if (adjustShapeInDeg >= 0) {
    degRotate = adjustShapeInDeg;
    if (!positionCirclePreviousEnterRangeSpecified && !rotatingAuto) {
      let cirStaticPosition,
      circleMovePosition,
      degRelative;
    
      if (DIRECTIONCIRCLE === "circle-right") {
        cirStaticPosition = {x:measureCircleLEFT.x,y:measureCircleLEFT.y};
        circleMovePosition = {x:measureCircleRIGHT.x,y:measureCircleRIGHT.y};
        
        degRelative = degRotate;
      }
      else {
        cirStaticPosition = {x:measureCircleRIGHT.x,y:measureCircleRIGHT.y};
        circleMovePosition = {x:measureCircleLEFT.x,y:measureCircleLEFT.y};
        
        degRelative = degRotate + 180 > 360 ? (degRotate + 180) - 360 : degRotate + 180;
      }
    
      let degToRadian = (degRelative * Math.PI) / 180,
      xCircleAfterOfAdjust = (Math.cos(degToRadian) * distanceOriginalBettwenCircles) + cirStaticPosition.x,
      yCircleAfterOfAdjust = (Math.sin(degToRadian) * distanceOriginalBettwenCircles) + cirStaticPosition.y,
      diferenceBettweenYCircleTouch = yCircleAfterOfAdjust - circleMovePosition.y,
      diferenceBettweenXCircleTouch = xCircleAfterOfAdjust - circleMovePosition.x;
      
      setPropertyElement($circleTouching,"top",`${nextTopCircle + diferenceBettweenYCircleTouch}px`);
      setPropertyElement($circleTouching,"left",`${nextLeftCircle + diferenceBettweenXCircleTouch}px`);
      
      diferenceX += diferenceBettweenXCircleTouch;
      diferenceY += diferenceBettweenYCircleTouch;
      
      const {measuresCircleLeft,measuresCircleRight} = getMeasuresCirclesForResizeShape();
      
      distanceOriginalBettwenCircles = getDistanceOfTwoPoints(measuresCircleLeft.x,measuresCircleLeft.y,measuresCircleRight.x,measuresCircleRight.y);
      
      toolSelected.propsContainerAdjustShapes.positionCirclePreviousEnterRangeSpecified = {x:circleMovePosition.x,y:circleMovePosition.y};
    }
  } else if (positionCirclePreviousEnterRangeSpecified) {
    const {x,y} = positionCirclePreviousEnterRangeSpecified,{left,top} = $circleTouching.getBoundingClientRect(),
    diferenceBettweenX = x - left,
    diferenceBettweenY = y - top;
    
    setPropertyElement($circleTouching,"left",`${nextLeftCircle + diferenceBettweenX}px`);
    setPropertyElement($circleTouching,"top",`${nextTopCircle + diferenceBettweenY}px`);
    
    const {measuresCircleLeft,measuresCircleRight} = getMeasuresCirclesForResizeShape();
    
    distanceOriginalBettwenCircles = getDistanceOfTwoPoints(measuresCircleLeft.x,measuresCircleLeft.y,measuresCircleRight.x,measuresCircleRight.y);
    
    diferenceX += diferenceBettweenX;
    diferenceY += diferenceBettweenY;
    
    delete toolSelected.propsContainerAdjustShapes.positionCirclePreviousEnterRangeSpecified;
  }
  
  setPropertyElement($CONTAINERSHAPES,"transform",`rotate(${degRotate}deg)`);
  setPropertyElement($CONTAINERADJUSTSHAPES,"transform",`rotate(${degRotate}deg)`);
  
  let newWidthContainerSHAPES = distanceOriginalBettwenCircles + forWidthContainerShapes,
  newWidthContainerAdjustShapes = distanceOriginalBettwenCircles + forWidthContainerAdjustShapes;
  
  newWidthContainerSHAPES = newWidthContainerSHAPES < 0 ? 0 : newWidthContainerSHAPES;
  newWidthContainerAdjustShapes = newWidthContainerAdjustShapes < 0 ? 0 : newWidthContainerAdjustShapes; 
  
  setPropertyElement($CONTAINERSHAPES,"width",`${newWidthContainerSHAPES}px`);
  
  setPropertyElement($CONTAINERADJUSTSHAPES,"width",`${newWidthContainerAdjustShapes}px`);
  
  toolSelected.propsContainerAdjustShapes.myLastWidth = newWidthContainerAdjustShapes;
  
  if (DIRECTIONCIRCLE === "circle-left") {
    [$CONTAINERSHAPES,$CONTAINERADJUSTSHAPES].forEach($CONTAINER=>{
      let left = getPropertyValueElement("left",$CONTAINER),
      top = getPropertyValueElement("top",$CONTAINER);
    
      setPropertyElement($CONTAINER,"left",`${left + diferenceX}px`);
      setPropertyElement($CONTAINER,"top",`${top + diferenceY}px`);
    });
  }
  
  return {newWidthContainerSHAPES,degRotate};
}

function rotateSHAPELINE ($circleTouching,diferenceX,diferenceY) {
  const {lastDegRotate,amountPxForWidthShapes} = toolSelected.propsCirclesForMoveShapeLINE;
  
  const {containerSHAPES,containerAdjustSHAPES} = amountPxForWidthShapes;
  
  const {degRotate} = rotateAndResizeShape($circleTouching,lastDegRotate,diferenceX,diferenceY,containerSHAPES,containerAdjustSHAPES);
  
  toolSelected.propsCirclesForMoveShapeLINE.lastDegRotate = degRotate;
  
  const $CONTAINERSHAPES = $aplication.children["container-canvas"].children["container-SHAPES-INSERT"];
  
  let indexLastElementLine = $CONTAINERSHAPES.querySelectorAll("svg .shape-SVG.fill").length - 1;
  
  addOrRemoveMiniContainerShapeLINE($CONTAINERSHAPES,indexLastElementLine)
  
  updatePositionShadowInSVG();
}

function getPositionsCircles ($circles) {
  let minX,maxX,minY,maxY;
  $circles.forEach($circle=>{
    let {x,y} = $circle.getBoundingClientRect();
    
    if (minY === undefined) minY = y;
    else if (y < minY) minY = y;
    
    if (maxY === undefined) maxY = y;
    else if (y > maxY) maxY = y;
    
    if (minX === undefined) minX = x;
    else if (x < minX) minX = x;
    
    if (maxX === undefined) maxX = x;
    else if (x > maxX) maxX = x;
  })
  
  return {maxX,minX,maxY,minY};
}

function getDiferenceAndModeOperationSize (currentDegRotate,degLineTopOrBottomWithoutRotatingShape,degLineRightOrLeftWithoutRotatingShape,x,y,clientX,clientY) {
  
  let totalDegRotate = 360 - currentDegRotate,
  diferenceX,diferenceY;
  
  let degFirstPointLineTopOrBottom = degLineTopOrBottomWithoutRotatingShape - totalDegRotate,
  degFirstPointLineRightOrLeft = degLineRightOrLeftWithoutRotatingShape - totalDegRotate,
  degSecondPointLineTopOrBottom,
  degSecondPointLineRightOrLeft;
  
  degFirstPointLineTopOrBottom = degFirstPointLineTopOrBottom < 0 ? 360 + degFirstPointLineTopOrBottom : degFirstPointLineTopOrBottom;
  degFirstPointLineRightOrLeft = degFirstPointLineRightOrLeft < 0 ? 360 + degFirstPointLineRightOrLeft : degFirstPointLineRightOrLeft;
  
  degSecondPointLineTopOrBottom = degFirstPointLineTopOrBottom - 180;
  degSecondPointLineRightOrLeft = degFirstPointLineRightOrLeft - 180;
  
  degSecondPointLineTopOrBottom = degSecondPointLineTopOrBottom < 0 ? 360 + degSecondPointLineTopOrBottom : degSecondPointLineTopOrBottom;
  degSecondPointLineRightOrLeft = degSecondPointLineRightOrLeft < 0 ? 360 + degSecondPointLineRightOrLeft : degSecondPointLineRightOrLeft;
  
  let degMoveFinger = 0,
  circleFILL = Math.PI * 2,
  closestPosition,
  sizeBettweenCenterCircleTouchingAndPositionMoveFinger = getDistanceOfTwoPoints(x,y,clientX,clientY),
  degToRadianFirstPointTopOrBottom = (degFirstPointLineTopOrBottom * Math.PI) / 180,
  degToRadianSecondPointTopOrBottom = (degSecondPointLineTopOrBottom * Math.PI) / 180,
  degToRadianFirstPointRightOrLeft = (degFirstPointLineRightOrLeft * Math.PI) / 180,
  degToRadianSecondPointRightOrLeft = (degSecondPointLineRightOrLeft * Math.PI) / 180,
  xFirstPointTopOrBottom = (Math.cos(degToRadianFirstPointTopOrBottom) * sizeBettweenCenterCircleTouchingAndPositionMoveFinger) + x,
  yFirstPointTopOrBottom = (Math.sin(degToRadianFirstPointTopOrBottom) * sizeBettweenCenterCircleTouchingAndPositionMoveFinger) + y,
  xSecondPointTopOrBottom = (Math.cos(degToRadianSecondPointTopOrBottom) * sizeBettweenCenterCircleTouchingAndPositionMoveFinger) + x,
  ySecondPointTopOrBottom = (Math.sin(degToRadianSecondPointTopOrBottom) * sizeBettweenCenterCircleTouchingAndPositionMoveFinger) + y,
  xFirstPointRightOrLeft = (Math.cos(degToRadianFirstPointRightOrLeft) * sizeBettweenCenterCircleTouchingAndPositionMoveFinger) + x,
  yFirstPointRightOrLeft = (Math.sin(degToRadianFirstPointRightOrLeft) * sizeBettweenCenterCircleTouchingAndPositionMoveFinger) + y,
  xSecondPointRightOrLeft = (Math.cos(degToRadianSecondPointRightOrLeft) * sizeBettweenCenterCircleTouchingAndPositionMoveFinger) + x,
  ySecondPointRightOrLeft = (Math.sin(degToRadianSecondPointRightOrLeft) * sizeBettweenCenterCircleTouchingAndPositionMoveFinger) + y;
  
  for (let rad = 0;rad <= circleFILL;rad+=0.01) {
    let xCircumference = (Math.cos(rad) * sizeBettweenCenterCircleTouchingAndPositionMoveFinger) + x,
    yCircumference = (Math.sin(rad) * sizeBettweenCenterCircleTouchingAndPositionMoveFinger) + y,
    diferenceX = Math.abs(clientX - xCircumference),
    diferenceY = Math.abs(clientY - yCircumference),
    sumOfTwoAxis = diferenceX + diferenceY;
      
    if (!closestPosition || (sumOfTwoAxis < closestPosition.sumOfTwoAxis)) {
      degMoveFinger = (rad * 180) / Math.PI
      closestPosition = {sumOfTwoAxis};
    }
  }
  
  let distanceBetweenFirstPointTopOrBottomAndPositionFinger = getDistanceOfTwoPoints(xFirstPointTopOrBottom,yFirstPointTopOrBottom,clientX,clientY),
  distanceBetweenSecondPointTopOrBottomAndPositionFinger = getDistanceOfTwoPoints(xSecondPointTopOrBottom,ySecondPointTopOrBottom,clientX,clientY),
  distanceBetweenFirstPointRightOrLeftAndPositionFinger = getDistanceOfTwoPoints(xFirstPointRightOrLeft,yFirstPointRightOrLeft,clientX,clientY),
  distanceBetweenSecondPointRightOrLeftAndPositionFinger = getDistanceOfTwoPoints(xSecondPointRightOrLeft,ySecondPointRightOrLeft,clientX,clientY);
  
  if (distanceBetweenFirstPointTopOrBottomAndPositionFinger < distanceBetweenSecondPointTopOrBottomAndPositionFinger) diferenceY = distanceBetweenFirstPointTopOrBottomAndPositionFinger;
  else diferenceY = distanceBetweenSecondPointTopOrBottomAndPositionFinger;
  
  if (distanceBetweenFirstPointRightOrLeftAndPositionFinger < distanceBetweenSecondPointRightOrLeftAndPositionFinger) diferenceX = distanceBetweenFirstPointRightOrLeftAndPositionFinger;
  else diferenceX = distanceBetweenSecondPointRightOrLeftAndPositionFinger;
  
  if (((360 - degMoveFinger) + degFirstPointLineRightOrLeft) < 90 || ((360 - degFirstPointLineRightOrLeft) + degMoveFinger) < 90 || Math.abs(degFirstPointLineRightOrLeft - degMoveFinger) < 90) {
    diferenceY = -diferenceY;
  }
  
  if (((360 - degMoveFinger) + degFirstPointLineTopOrBottom) < 90 || ((360 - degFirstPointLineTopOrBottom) + degMoveFinger) < 90 || Math.abs(degFirstPointLineTopOrBottom - degMoveFinger) < 90) {
    diferenceX = -diferenceX;
  }
  
  return {diferenceX,diferenceY};
}

function getTiltOfLinesContainerDependingDirectionResize(direction) {
  let degLineBottomOrTopFromZero,
  degLineLeftOrRightFromZero;
  
  if (direction === "bottom-right") {
    degLineBottomOrTopFromZero = 180;
    degLineLeftOrRightFromZero = 270;
  } else if (direction === "top-right") {
    degLineBottomOrTopFromZero = 180;
    degLineLeftOrRightFromZero = 90;
  } else if (direction === "top-left") {
    degLineBottomOrTopFromZero = 0;
    degLineLeftOrRightFromZero = 90;
  } else if (direction === "bottom-left") {
    degLineBottomOrTopFromZero = 0;
    degLineLeftOrRightFromZero = 270;
  }
  
  return {degLineLeftOrRightFromZero,degLineBottomOrTopFromZero};
}

function getAmountPxToMoveContainerForAxisY (degRotateShape,xCorner,yCorner,radio) {
  let degRotateLineYFromCorner = degRotateShape - 90,
  degToRadian = (degRotateLineYFromCorner * Math.PI) / 180,
  newPositionCornerForAxisY = getNumberAxisInDeg(xCorner,yCorner,degToRadian,radio);
  
  let diferenceXCORNERForAxisY = newPositionCornerForAxisY.newX - xCorner,
  diferenceYCORNERForAxisY = newPositionCornerForAxisY.newY - yCorner;
  
  return {diferenceXCORNERForAxisY,diferenceYCORNERForAxisY};
}

function getAmountPxToMoveContainerForAxisX (degRotateShape,xCorner,yCorner,radio) {
  let degRotateLineXFromCorner = degRotateShape - 180,
  degToRadian = (degRotateLineXFromCorner * Math.PI) / 180,
  newPositionCorner = getNumberAxisInDeg(xCorner,yCorner,degToRadian,radio);
  
  let diferenceXCORNERForAxisX = newPositionCorner.newX - xCorner,
  diferenceYCORNERForAxisX = newPositionCorner.newY - yCorner;
  
  return {diferenceYCORNERForAxisX,diferenceXCORNERForAxisX}
}

function movePointDependingRotateXAndY (positionPointTouching,xToMove,yToMove,nextXPointMoving,nextYPointMoving,positionCurrentYPointMoving,positionCurrentXPointMoving,pointLessInY,pointMaxInY,pointLessInX,pointMaxInX,yAdded,xAdded,degRotateShapeInY,degRotateShapeInX,halfStrokeWidth,maxPxMovedShadow) {
  let {lastDegRotate} = toolSelected.propsContainerAdjustShapes;
  
  let pxMoveInTopContainerShape = 0,
  pxMoveInLeftContainerShape = 0;
  
  let pxMovePointsInY = 0,
  pxMovePointsInX = 0;
  
  if (degRotateShapeInY === 180) {
    if (positionCurrentYPointMoving < pointMaxInY && nextYPointMoving >= pointMaxInY) {
    let diferenceForOverflow = nextYPointMoving - pointMaxInY;
    
    positionPointTouching[yToMove] = nextYPointMoving;
    
    let amountPxForMoveContainerShapes = getAmountPxToMoveContainerForAxisY(lastDegRotate,positionCurrentXPointMoving,positionCurrentYPointMoving,diferenceForOverflow);
    
    const {diferenceYCORNERForAxisY,diferenceXCORNERForAxisY} = amountPxForMoveContainerShapes;
    
    pxMoveInTopContainerShape = diferenceYCORNERForAxisY;
    
    pxMoveInLeftContainerShape = diferenceXCORNERForAxisY;
    }
    else if (nextYPointMoving >= pointMaxInY) {
    positionPointTouching[yToMove] = nextYPointMoving;
    
    let amountPxForMoveContainerShapes = getAmountPxToMoveContainerForAxisY(lastDegRotate,0,0,-yAdded);
    
    const {diferenceYCORNERForAxisY,diferenceXCORNERForAxisY} = amountPxForMoveContainerShapes;
    
    pxMoveInTopContainerShape = diferenceYCORNERForAxisY;
    
    pxMoveInLeftContainerShape = diferenceXCORNERForAxisY;
    }
    else if (positionCurrentYPointMoving > pointMaxInY && nextYPointMoving < pointMaxInY) {
    let diferenceForPointMax = positionCurrentYPointMoving - pointMaxInY;
    
    positionPointTouching[yToMove] = nextYPointMoving;
    
    let amountPxForMoveContainerShapes = getAmountPxToMoveContainerForAxisY(lastDegRotate,0,0,-diferenceForPointMax);
    
    const {diferenceYCORNERForAxisY,diferenceXCORNERForAxisY} = amountPxForMoveContainerShapes;
    
    pxMoveInTopContainerShape = diferenceYCORNERForAxisY;
    
    pxMoveInLeftContainerShape = diferenceXCORNERForAxisY;
    }
    else if (positionCurrentYPointMoving > pointLessInY && nextYPointMoving <= pointLessInY) {
    let diferenceOfOverflow = pointLessInY - nextYPointMoving;
    
    positionPointTouching[yToMove] = halfStrokeWidth + maxPxMovedShadow;
    
    pxMovePointsInY = diferenceOfOverflow;
    }
    else if (nextYPointMoving <= pointLessInY) {
      positionPointTouching[yToMove] = halfStrokeWidth + maxPxMovedShadow;
      pxMovePointsInY = yAdded;
    }
    else if (positionCurrentYPointMoving < pointLessInY && nextYPointMoving > pointLessInY) {
      let diferenceForLessY = pointLessInY - positionCurrentYPointMoving;
      
      let nextYLess = pointLessInY - diferenceForLessY;
      
      pxMovePointsInY = -diferenceForLessY;
      
      positionPointTouching[yToMove] = nextYLess + (nextYPointMoving - pointLessInY);
    }
    else {
    positionPointTouching[yToMove] = nextYPointMoving;
    }
  }
  else {
    if (positionCurrentYPointMoving > pointLessInY && nextYPointMoving <= pointLessInY) {
    let diferenceOfOverflow = pointLessInY - nextYPointMoving;
    
    positionPointTouching[yToMove] = halfStrokeWidth + maxPxMovedShadow;
    
    let amountPxForMoveContainerShapes = getAmountPxToMoveContainerForAxisY(lastDegRotate,0,0,diferenceOfOverflow);
    
    const {diferenceYCORNERForAxisY,diferenceXCORNERForAxisY} = amountPxForMoveContainerShapes;
    
    pxMoveInTopContainerShape = diferenceYCORNERForAxisY;
    
    pxMoveInLeftContainerShape = diferenceXCORNERForAxisY;
    
    pxMovePointsInY = diferenceOfOverflow;
    }
    else if (nextYPointMoving <= pointLessInY) {
    positionPointTouching[yToMove] = halfStrokeWidth + maxPxMovedShadow;
    
    let amountPxForMoveContainerShapes = getAmountPxToMoveContainerForAxisY(lastDegRotate,0,0,-yAdded);
    
    const {diferenceYCORNERForAxisY,diferenceXCORNERForAxisY} = amountPxForMoveContainerShapes;
    
    pxMoveInTopContainerShape = diferenceYCORNERForAxisY;
    
    pxMoveInLeftContainerShape = diferenceXCORNERForAxisY;
    
    pxMovePointsInY = -yAdded;
    }
    else if (positionCurrentYPointMoving < pointLessInY && nextYPointMoving > pointLessInY) {
    let diferenceForPointLess = pointLessInY - positionCurrentYPointMoving;
    
    let nextYLess = pointLessInY - diferenceForPointLess;
    
    positionPointTouching[yToMove] = nextYLess + (nextYPointMoving - pointLessInY);
    
    let amountPxForMoveContainerShapes = getAmountPxToMoveContainerForAxisY(lastDegRotate,0,0,-diferenceForPointLess);
    
    const {diferenceYCORNERForAxisY,diferenceXCORNERForAxisY} = amountPxForMoveContainerShapes;
    
    pxMoveInTopContainerShape = diferenceYCORNERForAxisY;
    
    pxMoveInLeftContainerShape = diferenceXCORNERForAxisY;
    
    pxMovePointsInY = -diferenceForPointLess;
    }
    else {
      positionPointTouching[yToMove] = nextYPointMoving;
    }
  }
  
  if (degRotateShapeInX === 180) {
    if (positionCurrentXPointMoving < pointMaxInX && nextXPointMoving >= pointMaxInX) {
    let diferenceForOverflow = nextXPointMoving - pointMaxInX;
    
    positionPointTouching[xToMove] = nextXPointMoving;
    
    let amountPxForMoveContainerShapes = getAmountPxToMoveContainerForAxisX(lastDegRotate,0,0,diferenceForOverflow);
    
    const {diferenceYCORNERForAxisX,diferenceXCORNERForAxisX} = amountPxForMoveContainerShapes;
    
    pxMoveInTopContainerShape += diferenceYCORNERForAxisX;
    
    pxMoveInLeftContainerShape += diferenceXCORNERForAxisX;
    }
    else if (nextXPointMoving >= pointMaxInX) {
    positionPointTouching[xToMove] = nextXPointMoving;
    
    let amountPxForMoveContainerShapes = getAmountPxToMoveContainerForAxisX(lastDegRotate,0,0,-xAdded);
    
    const {diferenceYCORNERForAxisX,diferenceXCORNERForAxisX} = amountPxForMoveContainerShapes;
    
    pxMoveInTopContainerShape += diferenceYCORNERForAxisX;
    
    pxMoveInLeftContainerShape += diferenceXCORNERForAxisX;
    }
    else if (positionCurrentXPointMoving > pointMaxInX && nextXPointMoving < pointMaxInX) {
    let diferenceForPointMax = positionCurrentXPointMoving - pointMaxInX;
    
    positionPointTouching[xToMove] = nextXPointMoving;
    
    let amountPxForMoveContainerShapes = getAmountPxToMoveContainerForAxisX(lastDegRotate,0,0,-diferenceForPointMax);
    
    const {diferenceYCORNERForAxisX,diferenceXCORNERForAxisX} = amountPxForMoveContainerShapes;
    
    pxMoveInTopContainerShape += diferenceYCORNERForAxisX;
    
    pxMoveInLeftContainerShape += diferenceXCORNERForAxisX;
    }
    else if (positionCurrentXPointMoving > pointLessInX && nextXPointMoving <= pointLessInX) {
    let diferenceOfOverflow = pointLessInX - nextXPointMoving;
    
    positionPointTouching[xToMove] = halfStrokeWidth + maxPxMovedShadow;
    
    pxMovePointsInX = diferenceOfOverflow;
    }
    else if (nextXPointMoving <= pointLessInX) {
      positionPointTouching[xToMove] = halfStrokeWidth + maxPxMovedShadow;
      pxMovePointsInX = xAdded;
    }
    else if (positionCurrentXPointMoving < pointLessInX && nextXPointMoving > pointLessInX) {
      let diferenceForLessX = pointLessInX - positionCurrentXPointMoving;
      
      let nextXLess = pointLessInX - diferenceForLessX;
      
      pxMovePointsInX = -diferenceForLessX;
      
      positionPointTouching[xToMove] = nextXLess + (nextXPointMoving - pointLessInX);
    }
    else {
    positionPointTouching[xToMove] = nextXPointMoving;
    }
  } else {
    if (positionCurrentXPointMoving > pointLessInX && nextXPointMoving <= pointLessInX) {
    let diferenceOfOverflow = pointLessInX - nextXPointMoving;
    
    positionPointTouching[xToMove] = halfStrokeWidth + maxPxMovedShadow;
    
    let amountPxForMoveContainerShapes = getAmountPxToMoveContainerForAxisX(lastDegRotate,0,0,diferenceOfOverflow);
    
    const {diferenceYCORNERForAxisX,diferenceXCORNERForAxisX} = amountPxForMoveContainerShapes;
    
    pxMoveInTopContainerShape += diferenceYCORNERForAxisX;
    
    pxMoveInLeftContainerShape += diferenceXCORNERForAxisX;
    
    pxMovePointsInX = diferenceOfOverflow;
    }
    else if (nextXPointMoving <= pointLessInX) {
    positionPointTouching[xToMove] = halfStrokeWidth + maxPxMovedShadow;
    
    let amountPxForMoveContainerShapes = getAmountPxToMoveContainerForAxisX(lastDegRotate,0,0,-xAdded);
    
    const {diferenceYCORNERForAxisX,diferenceXCORNERForAxisX} = amountPxForMoveContainerShapes;
    
    pxMoveInTopContainerShape += diferenceYCORNERForAxisX;
    
    pxMoveInLeftContainerShape += diferenceXCORNERForAxisX;
    
    pxMovePointsInX = -xAdded;
    }
    else if (positionCurrentXPointMoving < pointLessInX && nextXPointMoving > pointLessInX) {
    let diferenceForPointLess = pointLessInX - positionCurrentXPointMoving;
    
    let nextXLess = pointLessInX - diferenceForPointLess;
    
    positionPointTouching[xToMove] = nextXLess + (nextXPointMoving - pointLessInX);
    
    let amountPxForMoveContainerShapes = getAmountPxToMoveContainerForAxisX(lastDegRotate,0,0,-diferenceForPointLess);
    
    const {diferenceYCORNERForAxisX,diferenceXCORNERForAxisX} = amountPxForMoveContainerShapes;
    
    pxMoveInTopContainerShape += diferenceYCORNERForAxisX;
    
    pxMoveInLeftContainerShape += diferenceXCORNERForAxisX;
    
    pxMovePointsInX = -diferenceForPointLess;
    }
    else {
      positionPointTouching[xToMove] = nextXPointMoving;
    }
  }
  
  return {
    pxMoveInTopContainerShape,
    pxMoveInLeftContainerShape,
    pxMovePointsInY,
    pxMovePointsInX
  }
}

function customClipPathShape (numberPointMoving,measuresToModify,$containerSHAPES,xAdded,yAdded,xCorner,yCorner,degRotateShape,$CIRCLEMOVING) {
  const {valuesPathShape} = toolSelected.variablesShapeClipPathTemporal;
  
  const {flipVertical,flipHorizontal} = toolSelected;
  
  const $SHAPEFILL = $containerSHAPES.querySelector("svg .shape-SVG.fill");
  
  const $SHAPESTROKE = $containerSHAPES.querySelector("svg .shape-SVG.stroke");
  
  let halfStrokeWidth = Number($SHAPESTROKE.getAttribute("stroke-width")) / 2;
  
  let {xmovedshadow,ymovedshadow} = $SHAPEFILL.dataset;
  
  let maxPxMovedShadow = Math.max(Math.abs(Number(xmovedshadow)),Math.abs(Number(ymovedshadow)));
  
  const positionPointTouching = valuesPathShape[numberPointMoving].value;
  
  let comandPathPointTouching = valuesPathShape[numberPointMoving].comandPath;
  
  let nextXPointMoving,
  nextYPointMoving;
  
  let positionCurrentXPointMoving,
  positionCurrentYPointMoving;
  
  let yContrary,
  xContrary;
  
  let xToMove,
  yToMove;
  
  let normalicePxAdded = (pxAdded,degRotateInAxis) => {
    let pxConvert = pxAdded;
    
    if (degRotateInAxis === 180) pxConvert = -pxAdded;
    
    return pxConvert;
  }
  
  if (comandPathPointTouching === "Q") {
    let [measureX,measureY] = measuresToModify.split(",");
    
    let pxMovePointInY = normalicePxAdded(yAdded,flipVertical.degRotate);
    
    let pxMovePointInX = normalicePxAdded(xAdded,flipHorizontal.degRotate);
    
    nextXPointMoving = positionPointTouching[measureX] + pxMovePointInX;
    
    nextYPointMoving = positionPointTouching[measureY] + pxMovePointInY;
    
    positionCurrentXPointMoving = positionPointTouching[measureX];
    
    positionCurrentYPointMoving = positionPointTouching[measureY];
    
    yContrary = measureY === "y" ? "y1" : "y";
    xContrary = measureX === "x" ? "x1" : "x";
    
    yToMove = measureY;
    xToMove = measureX;
  }
  else {
    let pxMovePointInY = normalicePxAdded(yAdded,flipVertical.degRotate);
    
    let pxMovePointInX = normalicePxAdded(xAdded,flipHorizontal.degRotate);
    
    nextXPointMoving = positionPointTouching.x + pxMovePointInX;
    nextYPointMoving = positionPointTouching.y + pxMovePointInY;
    
    positionCurrentXPointMoving = positionPointTouching.x;
    positionCurrentYPointMoving = positionPointTouching.y;
    
    yToMove = "y";
    xToMove = "x";
  }
  
  let left = getPropertyValueElement("left",$containerSHAPES),
  top = getPropertyValueElement("top",$containerSHAPES),
  height = getPropertyValueElement("height",$containerSHAPES),
  width = getPropertyValueElement("width",$containerSHAPES);
  
  let pointLessInY = Infinity;
  let pointLessInX = Infinity;
  
  let pointMaxInY = 0,
  pointMaxInX = 0;
  
  let measurePreLast = valuesPathShape.at(-2);
  
  let preLastIndex = valuesPathShape.length - 2;
  
  const isLess = (value1,value2) => {
    return value1 < value2;
  }
  
  const isMax = (value1,value2) => {
    return value1 > value2;
  }
  
  const getMeasureOfReference = (comandPath,value,indexDifferentToCircleMoving,positionPoint,typeComparation,axisNameCurve,axisNamePoint,axisContraryNameOfPositionQ,valueOfComparation,typeOfComparation) => {
    let valueOfPositionCurve = value[axisNameCurve];
    
    let valueOfPositionPoint = value[axisNamePoint];
    
    if (positionPoint === preLastIndex && numberPointMoving === 0 && measurePreLast.comandPath === "Q" && typeComparation(valueOfPositionCurve,valueOfComparation)) {
      valueOfComparation = valueOfPositionCurve;
    }
    else if (indexDifferentToCircleMoving && (comandPath === "L" || comandPath === "M") && typeComparation(valueOfPositionPoint,valueOfComparation)) {
      valueOfComparation = valueOfPositionPoint;
    }
    else if (indexDifferentToCircleMoving && comandPath === "Q" && (typeComparation(valueOfPositionCurve,valueOfComparation) || typeComparation(valueOfPositionPoint,valueOfComparation)) && ((numberPointMoving === 0 && positionPoint !== preLastIndex) || numberPointMoving !== 0)) {
      if (typeOfComparation === "getMax" && valueOfPositionCurve > valueOfPositionPoint) {
        valueOfComparation = valueOfPositionCurve;
      } else if (typeOfComparation === "getMax") {
        valueOfComparation = valueOfPositionPoint;
      } else if (typeOfComparation === "getMin" && valueOfPositionCurve < valueOfPositionPoint) {
        valueOfComparation = valueOfPositionCurve;
      }
      else if (typeOfComparation === "getMin") {
        valueOfComparation = valueOfPositionPoint;
      }
    }
    else if (!indexDifferentToCircleMoving && comandPath === "Q" && typeComparation(value[axisContraryNameOfPositionQ],valueOfComparation)) {
      valueOfComparation = value[axisContraryNameOfPositionQ];
    }
    
    return valueOfComparation;
  }
  
  valuesPathShape.forEach(({comandPath,value},positionPoint)=>{
    let indexDifferentToCircleMoving = numberPointMoving !== positionPoint;
    
    if (flipVertical.degRotate === 0) {
      let newPositionLessInY = getMeasureOfReference(comandPath,value,indexDifferentToCircleMoving,positionPoint,isLess,"y1","y",yContrary,pointLessInY,"getMin");
      
      pointLessInY = newPositionLessInY;
    }
    else {
      let positionOfYMax = getMeasureOfReference(comandPath,value,indexDifferentToCircleMoving,positionPoint,isMax,"y1","y",yContrary,pointMaxInY,"getMax");
      
      let positionOfYLess = getMeasureOfReference(comandPath,value,indexDifferentToCircleMoving,positionPoint,isLess,"y1","y",yContrary,pointLessInY,"getMin");
      
      pointMaxInY = positionOfYMax;
      pointLessInY = positionOfYLess;
    }
    
    if (flipHorizontal.degRotate === 0) {
      let newPositionLessInX = getMeasureOfReference(comandPath,value,indexDifferentToCircleMoving,positionPoint,isLess,"x1","x",xContrary,pointLessInX,"getMin");
      
      pointLessInX = newPositionLessInX;
    }
    else {
      let newPositionMaxInX = getMeasureOfReference(comandPath,value,indexDifferentToCircleMoving,positionPoint,isMax,"x1","x",xContrary,pointMaxInX,"getMax");
      
      let newPositionLessInX = getMeasureOfReference(comandPath,value,indexDifferentToCircleMoving,positionPoint,isLess,"x1","x",xContrary,pointLessInX,"getMin");
      
      pointMaxInX = newPositionMaxInX;
      pointLessInX = newPositionLessInX;
    }
  })
  
  let {
    pxMovePointsInX,
    pxMovePointsInY,
    pxMoveInTopContainerShape,
    pxMoveInLeftContainerShape
  } = movePointDependingRotateXAndY(positionPointTouching,xToMove,yToMove,nextXPointMoving,nextYPointMoving,positionCurrentYPointMoving,positionCurrentXPointMoving,pointLessInY,pointMaxInY,pointLessInX,pointMaxInX,yAdded,xAdded,flipVertical.degRotate,flipHorizontal.degRotate,halfStrokeWidth,maxPxMovedShadow);
  
  if (pxMoveInLeftContainerShape !== 0 || pxMoveInTopContainerShape !== 0) {
    setPropertyElement($containerSHAPES,"top",`${top + pxMoveInTopContainerShape}px`);
    setPropertyElement($containerSHAPES,"left",`${left + pxMoveInLeftContainerShape}px`);
  }
  
  if (numberPointMoving === 0 && measurePreLast.comandPath === "Q") {
    let {x,y} = valuesPathShape[0].value;
    
    measurePreLast.value.x = x;
    measurePreLast.value.y = y;
  }
  
  let heightContainer = 0,
  widthContainer = 0;
  
  for (let indexPoint=0;indexPoint < valuesPathShape.length;indexPoint++) {
    let {comandPath,value} = valuesPathShape[indexPoint];
    
    if (comandPathPointTouching === "Q" && indexPoint === numberPointMoving) {
      value[xContrary] += pxMovePointsInX;
      value[yContrary] += pxMovePointsInY;
    }
    else if (indexPoint !== numberPointMoving && (comandPath === "L" || comandPath === "M")) {
      value.x += pxMovePointsInX;
      value.y += pxMovePointsInY;
    }
    else if (indexPoint !== numberPointMoving && comandPath === "Q") {
      value.x1 += pxMovePointsInX;
      value.y1 += pxMovePointsInY;
      
      if ((numberPointMoving === 0 && indexPoint !== preLastIndex) || numberPointMoving !== 0) {
        value.y += pxMovePointsInY;
        value.x += pxMovePointsInX;
      }
    }
    
    if (comandPath === "Q" && (value.x1 > widthContainer || value.x > widthContainer)) {
      widthContainer = Math.max(value.x1,value.x);
    }
    else if ((comandPath === "L" || comandPath === "M") && value.x > widthContainer) widthContainer = value.x;
    
    if (comandPath === "Q" && (value.y1 > heightContainer || value.y > heightContainer)) {
      heightContainer = Math.max(value.y1,value.y);
    }
    else if ((comandPath === "L" || comandPath === "M") && value.y > heightContainer) heightContainer = value.y;
  }
  
  let newWidthContainerSHAPE = widthContainer + halfStrokeWidth + maxPxMovedShadow;
  
  let newHeightContainerSHAPE = heightContainer + halfStrokeWidth + maxPxMovedShadow;
  
  moveCirclesOfCustomClipPathShape(newWidthContainerSHAPE,newHeightContainerSHAPE,flipHorizontal.degRotate,flipVertical.degRotate);
  
  setPropertyElement($containerSHAPES,"width",`${newWidthContainerSHAPE}px`)
  
  setPropertyElement($containerSHAPES,"height",`${newHeightContainerSHAPE}px`);
  
  let {propsContainerAdjustShapes} = toolSelected;
  
  propsContainerAdjustShapes.widthSVG = newWidthContainerSHAPE;
  propsContainerAdjustShapes.heightSVG = newHeightContainerSHAPE;
  
  flipSHAPE();
  
  const measuresOfShape = $SHAPEFILL.getBBox();
  
  propsContainerAdjustShapes.myLastWidth = measuresOfShape.width;
  propsContainerAdjustShapes.myLastHeight = measuresOfShape.height;
}

function moveCirclesOfCustomClipPathShape (widthSVG,heightSVG,rotateShapeX,rotateShapeY) {
  let halfCircle = 35 / 2;
  
  let {valuesPathShape} = toolSelected.variablesShapeClipPathTemporal;
  
  $$("#container-canvas .container-SHAPES-insert .circles-custom-clip-path").forEach($CIRCLE=>{
    let {indexofposition,measurestomodify} = $CIRCLE.dataset;
    
    let pointCircle = valuesPathShape[Number(indexofposition)];
    
    let yOfPointCircle,
    xOfPointCircle;
    
    if (pointCircle.comandPath === "Q") {
      let [typeX,typeY] = measurestomodify.split(",");
      
      yOfPointCircle = pointCircle.value[typeY];
      xOfPointCircle = pointCircle.value[typeX];
    }
    else {
      yOfPointCircle = pointCircle.value.y;
      xOfPointCircle = pointCircle.value.x;
    }
    
    if (rotateShapeY === 180) {
      yOfPointCircle = heightSVG - yOfPointCircle;
    }
    
    if (rotateShapeX === 180) {
      xOfPointCircle = widthSVG - xOfPointCircle;
    }
    
    setPropertyElement($CIRCLE,"top",`${yOfPointCircle - halfCircle}px`);
    setPropertyElement($CIRCLE,"left",`${xOfPointCircle - halfCircle}px`);
  })
}

function getPxAddedInBothAxisInToResizeShape (currentdegrotateshape,diferenceXWithoutRotate,diferenceYWithoutRotate,direction,clientX,clientY,xCorner,yCorner) {
  let diferenceX,diferenceY;
  let degLevel = true;
  if (currentdegrotateshape === 0 || currentdegrotateshape === 360) {
    diferenceX = diferenceXWithoutRotate
    diferenceY = diferenceYWithoutRotate
    
    if (direction === "bottom-left") diferenceX = -diferenceX;
    else if (direction === "top-right") diferenceY = -diferenceY;
    else if (direction === "top-left") {
      diferenceY = -diferenceY
      diferenceX = -diferenceX;
    }
  } else if (currentdegrotateshape === 270) {
    
    diferenceX = diferenceYWithoutRotate
    diferenceY = diferenceXWithoutRotate
    
    if (direction === "bottom-right") diferenceX = -diferenceX;
    else if (direction === "top-right") {
      diferenceY = -diferenceY;
      diferenceX = -diferenceX;
    }
    else if (direction === "top-left") {
      diferenceY = -diferenceY;
    }
  } else if (currentdegrotateshape === 180) {
    diferenceX = diferenceXWithoutRotate
    diferenceY = diferenceYWithoutRotate
    
    if (direction === "bottom-right") {
      diferenceX = -diferenceX;
      diferenceY = -diferenceY;
    }
    else if (direction === "top-right") {
      diferenceX = -diferenceX;
    }
    else if (direction === "bottom-left") {
      diferenceY = -diferenceY;
    }
  } else if (currentdegrotateshape === 90) {
    diferenceX = diferenceYWithoutRotate
    diferenceY = diferenceXWithoutRotate
    
    if (direction === "bottom-right") {
      diferenceY = -diferenceY;
    }
    else if (direction === "top-left") {
      diferenceX = -diferenceX;
    }
    else if (direction === "bottom-left") {
      diferenceY = -diferenceY;
      diferenceX = -diferenceX;
    }
  } else {
    degLevel = false;
  
    let {degLineBottomOrTopFromZero,degLineLeftOrRightFromZero} = getTiltOfLinesContainerDependingDirectionResize(direction);
    
    let diference = getDiferenceAndModeOperationSize(currentdegrotateshape,degLineBottomOrTopFromZero,degLineLeftOrRightFromZero,xCorner,yCorner,clientX,clientY);
  
    diferenceX = diference.diferenceX;
    diferenceY = diference.diferenceY;
  }
  
  return {diferenceX,diferenceY,degLevel};
}

function getCorrectSizeContainerShapes (widthCurrent,pxAddedX,heightCurrent,pxAddedY) {
  let {pxForWidthShape,pxForHeightShape} = toolSelected.propsContainerAdjustShapes
  
  let widthContainerSHAPESAdjust = widthCurrent + pxAddedX,
  heightContainerSHAPESAdjust = heightCurrent + pxAddedY;
  
  let nextWidthShape = widthContainerSHAPESAdjust + pxForWidthShape,
  nextHeightShape = heightContainerSHAPESAdjust + pxForHeightShape;
  
  if (nextWidthShape <= 4) {
    pxAddedX += 4 - nextWidthShape;
    
    widthContainerSHAPESAdjust = widthCurrent + pxAddedX;
  }
  if (nextHeightShape <= 4) {
    pxAddedY += 4 - nextHeightShape;
    
    heightContainerSHAPESAdjust = heightCurrent + pxAddedY;
  }
  
  return {
    pxAddedX,
    pxAddedY,
    widthContainerSHAPESAdjust,
    heightContainerSHAPESAdjust
  }
}

function resizeShapes (direction,$containerSHAPES,diferenceXWithoutRotate,diferenceYWithoutRotate,$squareAdjustShapes,$circleTouching,clientX,clientY,auto,resizeFromCenterShape) {
  let {idshape} = toolSelected.modalFigures.SHAPE,
  {keepAspectRatio} = toolSelected.valuesSettingShapeText,
  {lockRatioShape,flipHorizontal,flipVertical} = toolSelected;
  
  const widthContainerSHAPES = getPropertyValueElement("width",$containerSHAPES),
  heightContainerSHAPES = getPropertyValueElement("height",$containerSHAPES);
  
  const {
    myLastWidth,
    myLastHeight,
    pxForWidthShape,
    pxForHeightShape,
    lastDegRotate
  } = toolSelected.propsContainerAdjustShapes;
  
  const $pointCenterCorner = $squareAdjustShapes.querySelector(`.point-${direction}`),
  positionCornerTouching = $pointCenterCorner.getBoundingClientRect();
  
  let degLevel,diferenceX,diferenceY;
  if (!auto) {
    let valuesToUse = getPxAddedInBothAxisInToResizeShape(lastDegRotate,diferenceXWithoutRotate,diferenceYWithoutRotate,direction,clientX,clientY,positionCornerTouching.x,positionCornerTouching.y);
    
    degLevel = valuesToUse.degLevel;
    diferenceX = valuesToUse.diferenceX;
    diferenceY = valuesToUse.diferenceY;
  }
  else {
    diferenceX = diferenceXWithoutRotate;
    diferenceY = diferenceYWithoutRotate;
  }
  
  const {
    lockRatioPercentageHeightInWidth,
    lockRatioPercentageWidthInHeight
  } = idshape === "text" ? toolSelected.variablesShapeTextTemporal : toolSelected.variablesOfLockRatio;
  
  let keepAspectRatioShape = idshape === "circle" || (lockRatioShape && idshape !== "text" && idshape !== "custom-clip-path") || (keepAspectRatio && idshape === "text");
  
  let directionModifiedPxAdded;
  
  let pxInWidthAddOrSubtract,
  pxInHeightAddOrSubtract;
  
  if (!keepAspectRatioShape) {
    pxInWidthAddOrSubtract = diferenceX;
    pxInHeightAddOrSubtract = diferenceY
  } else {
    let yDiferenceToUse = degLevel && !auto ? diferenceY : 0;
    let pxToAdded = Math.abs(yDiferenceToUse) > Math.abs(diferenceX) ? yDiferenceToUse : diferenceX;
    
    let previousNewWidthContainerShapes = widthContainerSHAPES + pxToAdded;
    
    let minHeightContainerShape = 4 - pxForHeightShape,
    minWidthContainerShape = 4 - pxForWidthShape;
    
    let minWidthAccept = (minHeightContainerShape / lockRatioPercentageHeightInWidth) * 100;
    
    minWidthAccept = minWidthAccept < minWidthContainerShape ? minWidthContainerShape : minWidthAccept;
    
    let newWidthToAply = previousNewWidthContainerShapes < minWidthAccept ? minWidthAccept : previousNewWidthContainerShapes;
    
    let newHeightContainerSHAPESRelativeToWidth = ((lockRatioPercentageHeightInWidth * newWidthToAply) / 100);
    
    pxInHeightAddOrSubtract = newHeightContainerSHAPESRelativeToWidth - heightContainerSHAPES;
    pxInWidthAddOrSubtract = newWidthToAply - widthContainerSHAPES;
  }
  
  if (direction === "bottom-right" && degLevel && !auto) {
    let xAddedOrSubtract,
    yAddedOrSubtract,
    directionRelative,
    SEEBORDERS = {};
    
    if (lastDegRotate === 0 || lastDegRotate === 360) {
      yAddedOrSubtract = pxInHeightAddOrSubtract;
      xAddedOrSubtract = pxInWidthAddOrSubtract;
      directionRelative = "bottom-right"
      SEEBORDERS = {right:true,bottom:true}
    }
    else if (lastDegRotate === 270) {
      yAddedOrSubtract = -pxInWidthAddOrSubtract;
      xAddedOrSubtract = pxInHeightAddOrSubtract;
      directionRelative = "top-right";
      SEEBORDERS = {right:true,top:true}
    }
    else if (lastDegRotate === 180) {
      yAddedOrSubtract = -pxInHeightAddOrSubtract;
      xAddedOrSubtract = -pxInWidthAddOrSubtract;
      directionRelative = "top-left";
      SEEBORDERS = {left:true,top:true}
    }
    else if (lastDegRotate === 90) {
      yAddedOrSubtract = pxInWidthAddOrSubtract;
      xAddedOrSubtract = -pxInHeightAddOrSubtract;
      directionRelative = "bottom-left";
      SEEBORDERS = {left:true,bottom:true};
    }
    
    const diferencesXY = modifyNextMovementIfRequired(xAddedOrSubtract,yAddedOrSubtract,$squareAdjustShapes,directionRelative,SEEBORDERS),
    {
      firstEnteredTheEdgeRange,
      measuresXBeforeEnterInRangeBorde,
      measuresYBeforeEnterInRangeBorde
    } = toolSelected.propsContainerAdjustShapes;
    
    if (diferencesXY.diferenceX !== undefined && ((firstEnteredTheEdgeRange === "x" && keepAspectRatioShape) || firstEnteredTheEdgeRange !== "y")) {
      let directionModified;
      if (lastDegRotate === 270) {
        directionModified = "y";
        pxInHeightAddOrSubtract = diferencesXY.diferenceX;
      }
      else if (lastDegRotate === 180) {
        directionModified = "x";
        pxInWidthAddOrSubtract = -diferencesXY.diferenceX;
      }
      else if (lastDegRotate === 90) {
        directionModified = "y";
        pxInHeightAddOrSubtract = -diferencesXY.diferenceX;
      }
      else {
        directionModified = "x"
        pxInWidthAddOrSubtract = diferencesXY.diferenceX;
      }
    
      directionModifiedPxAdded = directionModified;
    
      if (!measuresXBeforeEnterInRangeBorde && keepAspectRatioShape) delete toolSelected.propsContainerAdjustShapes.firstEnteredTheEdgeRange;
    }
    
    if (diferencesXY.diferenceY !== undefined && ((firstEnteredTheEdgeRange === "y" && keepAspectRatioShape) || firstEnteredTheEdgeRange !== "x")) {
      let directionModified;
      if (lastDegRotate === 270) {
        directionModified = "x";
        pxInWidthAddOrSubtract = -diferencesXY.diferenceY;
      }
      else if (lastDegRotate === 180) {
        directionModified = "y";
        pxInHeightAddOrSubtract = -diferencesXY.diferenceY;
      }
      else if (lastDegRotate === 90) {
        directionModified = "x";
        pxInWidthAddOrSubtract = diferencesXY.diferenceY;
      }
      else {
        directionModified = "y";
        pxInHeightAddOrSubtract = diferencesXY.diferenceY;
      }
    
      directionModifiedPxAdded = directionModified;
    
      if (!measuresYBeforeEnterInRangeBorde && keepAspectRatioShape) delete toolSelected.propsContainerAdjustShapes.firstEnteredTheEdgeRange;
    }
  }
  else if (direction === "bottom-left" && degLevel && !auto) {
    let yAddedOrSubtract,
    xAddedOrSubtract,
    directionRelative,
    SEEBORDERS;
    
    if (lastDegRotate === 0 || lastDegRotate === 360) {
      yAddedOrSubtract = pxInHeightAddOrSubtract;
      xAddedOrSubtract = -pxInWidthAddOrSubtract;
      directionRelative = "bottom-left"
      SEEBORDERS = {left:true,bottom:true};
    }
    else if (lastDegRotate === 270) {
      yAddedOrSubtract = pxInWidthAddOrSubtract;
      xAddedOrSubtract = pxInHeightAddOrSubtract;
      directionRelative = "bottom-right"
      SEEBORDERS = {right:true,bottom:true}
    }
    else if (lastDegRotate === 180) {
      yAddedOrSubtract = -pxInHeightAddOrSubtract;
      xAddedOrSubtract = pxInWidthAddOrSubtract;
      directionRelative = "top-right";
      SEEBORDERS = {top:true,right:true}
    }
    else if (lastDegRotate === 90) {
      yAddedOrSubtract = -pxInWidthAddOrSubtract;
      xAddedOrSubtract = -pxInHeightAddOrSubtract;
      directionRelative = "top-left";
      SEEBORDERS = {left:true,top:true}
    }
    
    const diferencesXY = modifyNextMovementIfRequired(xAddedOrSubtract,yAddedOrSubtract,$squareAdjustShapes,directionRelative,SEEBORDERS),
    {firstEnteredTheEdgeRange,measuresXBeforeEnterInRangeBorde,measuresYBeforeEnterInRangeBorde} = toolSelected.propsContainerAdjustShapes;
    
    if (diferencesXY.diferenceX !== undefined && ((firstEnteredTheEdgeRange === "x" && keepAspectRatioShape) || firstEnteredTheEdgeRange !== "y")) {
      let directionModified;
      if (lastDegRotate === 270) {
        directionModified = "y";
        pxInHeightAddOrSubtract = diferencesXY.diferenceX;
      }
      else if (lastDegRotate === 180) {
        directionModified = "x";
        pxInWidthAddOrSubtract = diferencesXY.diferenceX;
      }
      else if (lastDegRotate === 90) {
        directionModified = "y";
        pxInHeightAddOrSubtract = -diferencesXY.diferenceX;
      }
      else {
        directionModified = "x";
        pxInWidthAddOrSubtract = -diferencesXY.diferenceX;
      }
      
      directionModifiedPxAdded = directionModified;
      
      if (!measuresXBeforeEnterInRangeBorde && keepAspectRatioShape) delete toolSelected.propsContainerAdjustShapes.firstEnteredTheEdgeRange;
      }
    
    if (diferencesXY.diferenceY !== undefined && ((firstEnteredTheEdgeRange === "y" && keepAspectRatioShape) || firstEnteredTheEdgeRange !== "x")) {
      let directionModified;
      if (lastDegRotate === 270) {
        directionModified = "x";
        pxInWidthAddOrSubtract = diferencesXY.diferenceY;
      }
      else if (lastDegRotate === 180) {
        directionModified = "y";
        pxInHeightAddOrSubtract = -diferencesXY.diferenceY;
      }
      else if (lastDegRotate === 90) {
        directionModified = "x";
        pxInWidthAddOrSubtract = -diferencesXY.diferenceY;
      } else {
        directionModified = "y";
        pxInHeightAddOrSubtract = diferencesXY.diferenceY;
      }
      
      directionModifiedPxAdded = directionModified;
      
      if (!measuresYBeforeEnterInRangeBorde && keepAspectRatioShape) delete toolSelected.propsContainerAdjustShapes.firstEnteredTheEdgeRange;
    }
  }
  else if (direction === "top-right" && degLevel && !auto) {
    let yAddedOrSubtract,
    xAddedOrSubtract,
    directionRelative,
    SEEBORDERS;
    
    if (lastDegRotate === 0 || lastDegRotate === 360) {
      yAddedOrSubtract = -pxInHeightAddOrSubtract;
      xAddedOrSubtract = pxInWidthAddOrSubtract;
      directionRelative = "top-right";
      SEEBORDERS = {right:true,top:true};
    }
    else if (lastDegRotate === 270) {
      yAddedOrSubtract = -pxInWidthAddOrSubtract;
      xAddedOrSubtract = -pxInHeightAddOrSubtract;
      directionRelative = "top-left";
      SEEBORDERS = {left:true,top:true}
    }
    else if (lastDegRotate === 180) {
      yAddedOrSubtract = pxInHeightAddOrSubtract;
      xAddedOrSubtract = -pxInWidthAddOrSubtract;
      directionRelative = "bottom-left"
      SEEBORDERS = {left:true,bottom:true};
    }
    else if (lastDegRotate === 90) {
      yAddedOrSubtract = pxInWidthAddOrSubtract;
      xAddedOrSubtract = pxInHeightAddOrSubtract;
      directionRelative = "bottom-right";
      SEEBORDERS = {right:true,bottom:true}
    }
    
    const diferencesXY = modifyNextMovementIfRequired(xAddedOrSubtract,yAddedOrSubtract,$squareAdjustShapes,directionRelative,SEEBORDERS),
    {firstEnteredTheEdgeRange,measuresXBeforeEnterInRangeBorde,measuresYBeforeEnterInRangeBorde} = toolSelected.propsContainerAdjustShapes;
    
    if (diferencesXY.diferenceX !== undefined && ((firstEnteredTheEdgeRange === "x" && keepAspectRatioShape) || firstEnteredTheEdgeRange !== "y")) {
      let directionModified;
      if (lastDegRotate === 270) {
        directionModified = "y";
        pxInHeightAddOrSubtract = -diferencesXY.diferenceX;
      }
      else if (lastDegRotate === 180) {
        directionModified = "x";
        pxInWidthAddOrSubtract = -diferencesXY.diferenceX;
      }
      else if (lastDegRotate === 90) {
        directionModified = "y";
        pxInHeightAddOrSubtract = diferencesXY.diferenceX;
      }
      else {
        directionModified = "x";
        pxInWidthAddOrSubtract = diferencesXY.diferenceX;
      }
      
      directionModifiedPxAdded = directionModified;
      
      if (!measuresXBeforeEnterInRangeBorde && keepAspectRatioShape) delete toolSelected.propsContainerAdjustShapes.firstEnteredTheEdgeRange;
    }
    
    if (diferencesXY.diferenceY !== undefined && ((firstEnteredTheEdgeRange === "y" && keepAspectRatioShape) || firstEnteredTheEdgeRange !== "x")) {
      let directionModified;
      if (lastDegRotate === 270) {
        directionModified = "x";
        pxInWidthAddOrSubtract = -diferencesXY.diferenceY;
      }
      else if (lastDegRotate === 180) {
        directionModified = "y";
        pxInHeightAddOrSubtract = diferencesXY.diferenceY;
      }
      else if (lastDegRotate === 90) {
        directionModified = "x";
        pxInWidthAddOrSubtract = diferencesXY.diferenceY;
      }
      else {
        directionModified = "y";
        pxInHeightAddOrSubtract = -diferencesXY.diferenceY;
      }
      
      directionModifiedPxAdded = directionModified;
      
      if (!measuresYBeforeEnterInRangeBorde && keepAspectRatioShape) delete toolSelected.propsContainerAdjustShapes.firstEnteredTheEdgeRange;
    }
  }
  else if (direction === "top-left" && degLevel && !auto) {
    let yAddedOrSubtract,
    xAddedOrSubtract,
    directionRelative,
    SEEBORDERS;
    
    if (lastDegRotate === 0 || lastDegRotate === 360) {
      yAddedOrSubtract = -pxInHeightAddOrSubtract;
      xAddedOrSubtract = -pxInWidthAddOrSubtract;
      directionRelative = "top-left";
      SEEBORDERS = {top:true,left:true}
    }
    else if (lastDegRotate === 270) {
      yAddedOrSubtract = pxInWidthAddOrSubtract;
      xAddedOrSubtract = -pxInHeightAddOrSubtract;
      directionRelative = "bottom-left"
      SEEBORDERS = {bottom:true,left:true}
    }
    else if (lastDegRotate === 180) {
      yAddedOrSubtract = pxInHeightAddOrSubtract;
      xAddedOrSubtract = pxInWidthAddOrSubtract;
      directionRelative = "bottom-right";
      SEEBORDERS = {bottom:true,right:true}
    }
    else if (lastDegRotate === 90) {
      yAddedOrSubtract = -pxInWidthAddOrSubtract;
      xAddedOrSubtract = pxInHeightAddOrSubtract;
      directionRelative = "top-right";
      SEEBORDERS = {top:true,right:true};
    }
    
    const diferencesXY = modifyNextMovementIfRequired(xAddedOrSubtract,yAddedOrSubtract,$squareAdjustShapes,directionRelative,SEEBORDERS),
    {firstEnteredTheEdgeRange,measuresXBeforeEnterInRangeBorde,measuresYBeforeEnterInRangeBorde} = toolSelected.propsContainerAdjustShapes;
    
    if (diferencesXY.diferenceX !== undefined && ((firstEnteredTheEdgeRange === "x" && keepAspectRatioShape) || firstEnteredTheEdgeRange !== "y")) {
      let directionModified;
      if (lastDegRotate === 270) {
        directionModified = "y";
        pxInHeightAddOrSubtract = -diferencesXY.diferenceX;
      }
      else if (lastDegRotate === 180) {
        directionModified = "x";
        pxInWidthAddOrSubtract = diferencesXY.diferenceX;
      }
      else if (lastDegRotate === 90) {
        directionModified = "y";
        pxInHeightAddOrSubtract = diferencesXY.diferenceX;
      } else {
        directionModified = "x";
        pxInWidthAddOrSubtract = -diferencesXY.diferenceX;
      }
      
      directionModifiedPxAdded = directionModified;
      
      if (!measuresXBeforeEnterInRangeBorde && keepAspectRatioShape) delete toolSelected.propsContainerAdjustShapes.firstEnteredTheEdgeRange;
    }
    
    if (diferencesXY.diferenceY !== undefined && ((firstEnteredTheEdgeRange === "y" && keepAspectRatioShape) || firstEnteredTheEdgeRange !== "x")) {
      let directionModified;
      if (lastDegRotate === 270) {
        directionModified = "x";
        pxInWidthAddOrSubtract = diferencesXY.diferenceY;
      }
      else if (lastDegRotate === 180) {
        directionModified = "y";
        pxInHeightAddOrSubtract = diferencesXY.diferenceY;
      }
      else if (lastDegRotate === 90) {
        directionModified = "x";
        pxInWidthAddOrSubtract = -diferencesXY.diferenceY;
      } else {
        directionModified = "y";
        pxInHeightAddOrSubtract = -diferencesXY.diferenceY;
      }
      
      directionModifiedPxAdded = directionModified;
      
      if (!measuresYBeforeEnterInRangeBorde && keepAspectRatioShape) delete toolSelected.propsContainerAdjustShapes.firstEnteredTheEdgeRange;
    }
  }
  
  if (directionModifiedPxAdded === "x" && keepAspectRatioShape) {
    let previewNewHeightContainer = (lockRatioPercentageHeightInWidth * (widthContainerSHAPES + pxInWidthAddOrSubtract)) / 100;
    
    pxInHeightAddOrSubtract = previewNewHeightContainer - heightContainerSHAPES;
  }
  else if (directionModifiedPxAdded === "y" && keepAspectRatioShape) {
    let previewNewWidthContainer = (lockRatioPercentageWidthInHeight * (heightContainerSHAPES + pxInHeightAddOrSubtract)) / 100;
    
    pxInWidthAddOrSubtract = previewNewWidthContainer - widthContainerSHAPES;
  }
  
  let valuesForResize = getCorrectSizeContainerShapes(widthContainerSHAPES,pxInWidthAddOrSubtract,heightContainerSHAPES,pxInHeightAddOrSubtract);
  
  pxInWidthAddOrSubtract = valuesForResize.pxAddedX;
  
  pxInHeightAddOrSubtract = valuesForResize.pxAddedY;
  
  let nextWidthContainerShapes = valuesForResize.widthContainerSHAPESAdjust,
  nextHeightContainerShapes = valuesForResize.heightContainerSHAPESAdjust;
  
  let nextWidthShape = nextWidthContainerShapes + pxForWidthShape,
  nextHeightShape = nextHeightContainerShapes + pxForHeightShape;
  
  toolSelected.propsContainerAdjustShapes.myLastWidth = nextWidthShape;
  toolSelected.propsContainerAdjustShapes.myLastHeight = nextHeightShape;
  
  toolSelected.propsContainerAdjustShapes.widthSVG = nextWidthContainerShapes;
  toolSelected.propsContainerAdjustShapes.heightSVG = nextHeightContainerShapes;
 
  toolSelected.modalFigures.SHAPE[idshape] = {
    width:nextWidthShape,
    height:nextHeightShape
  }
  
  const getPositionCenterCornerIfIsNecesary = direction => {
    if (!degLevel) {
      let {x,y} = $squareAdjustShapes.querySelector(`.point-${direction}`).getBoundingClientRect();
      
      toolSelected.propsContainerAdjustShapes.clientX = x;
      toolSelected.propsContainerAdjustShapes.clientY = y;
    }
  }
  
  //TAMBIEN NOS REDIMENCIONA EL SHAPE;
  flipSHAPE();
  
  if (idshape === "text") {
    const {widthStaticSVG,heightStaticSVG} = toolSelected.propsContainerAdjustShapes;
    
    let scaleX = nextWidthContainerShapes / widthStaticSVG,
    scaleY = nextHeightContainerShapes / heightStaticSVG;
    
    setPropertyElement($containerSHAPES.querySelector("svg"),"transform",`scale(${scaleX},${scaleY})`);
  }
  
  if (resizeFromCenterShape) {
    pxInHeightAddOrSubtract /= 2;
    pxInWidthAddOrSubtract /= 2;
  }
  
  adjustContainerToResize(direction,lastDegRotate,pxInHeightAddOrSubtract,pxInHeightAddOrSubtract,pxInWidthAddOrSubtract,pxInWidthAddOrSubtract,nextHeightContainerShapes,nextHeightShape,nextWidthContainerShapes,nextWidthShape);
  
  if (!auto) {
    let widthThight = nextWidthShape - 4
    ,heightThight = keepAspectRatioShape ? (widthThight * lockRatioPercentageHeightInWidth) / 100 : nextHeightShape - 4;
    
    updateTextElementOfSizeAndDegSHAPE(`${widthThight.toFixed(1)} × ${heightThight.toFixed(1)}`);
  }
  
  let applyChangeDirectionY = true,
  applyChangeDirectionX = true,
  measuresY = toolSelected.propsContainerAdjustShapes.measuresYBeforeEnterInRangeBorde,
  measuresX = toolSelected.propsContainerAdjustShapes.measuresXBeforeEnterInRangeBorde;
  
  if (measuresY) {
    const {y,height,velocityMove,pxMoveForBorde} = measuresY,
    currentHeight = height + velocityMove
    ,currentY = y + velocityMove,
    directionCorrect = getDirectionCorrectDependingDegRotate(lastDegRotate);
    
    if (currentHeight > 0) {
      if (directionCorrect === "contrary") applyChangeDirectionX = false;
      else applyChangeDirectionY = false
    }
    else if (currentHeight <= 0) {
      if (directionCorrect === "contrary") applyChangeDirectionX = true;
      else applyChangeDirectionY = true;}
    else if (currentY < (y + pxMoveForBorde)) {
      if (directionCorrect === "contrary") applyChangeDirectionX = false;
      else applyChangeDirectionY = false;
    }
    else if (currentY >= (y + pxMoveForBorde)) {
      if (directionCorrect === "contrary") applyChangeDirectionX = true;
      else applyChangeDirectionY = true;
    }
  }
  
  if (measuresX) {
    const {x,width,velocityMove,pxMoveForBorde} = measuresX,
    currentWidth = width + velocityMove
    ,currentX = x + velocityMove,
    directionCorrect = getDirectionCorrectDependingDegRotate(lastDegRotate);
    
    if (currentWidth > 0) {
      if (directionCorrect === "contrary") applyChangeDirectionY = false;
      else applyChangeDirectionX = false;
    } else if (currentWidth <= 0) {
      if (directionCorrect === "contrary") applyChangeDirectionY = true;
      else applyChangeDirectionX = true;
    } else if (currentX < (x + pxMoveForBorde)) {
      if (directionCorrect === "contrary") applyChangeDirectionY = false;
      else applyChangeDirectionX = false;
    }
    else if (currentX >= (x + pxMoveForBorde)) {
      if (directionCorrect === "contrary") applyChangeDirectionY = true;
      else applyChangeDirectionX = true;
    }
  }
  
  //EL NUMERO 4 ES POR EL BORDER DEL ELEMENTO SUMANDO LOS DOS LADOS SQUAREADJUSTSHAPES QUE ESO SERIA EL WIDTH MINIMO DE EL ELEMENTO
  
  let changedDirectionBothAxis = false;
  if (nextWidthShape.toFixed(1) === "4.0" && applyChangeDirectionX && !auto) {
    let newDirectionX;
    
    if (!keepAspectRatioShape) {
      newDirectionX = getDirectionContraryInAxisX(direction);
    } else {
      newDirectionX = getDirectionTouchingContraryBothAxis(direction);
      
      getPositionCenterCornerIfIsNecesary(newDirectionX);
      
      changedDirectionBothAxis = true;
    }
    
    $circleTouching.setAttribute("data-direction",newDirectionX);
    
    if (keepAspectRatioShape) {
      let newDegRotateInBothAxis = flipHorizontal.degRotate === 0 ? 180 : 0;
      flipVertical.degRotate = newDegRotateInBothAxis;
    }
    
    flipSHAPE("horizontal");
    
    deleteMeasuresIfExistInChangeDirection(measuresY,measuresX,lastDegRotate);
  }
  
  if (nextHeightShape.toFixed(1) === "4.0" && !changedDirectionBothAxis && applyChangeDirectionY && !auto) {
    let newDirectionY;
    if (!keepAspectRatioShape) newDirectionY = getDirectionContraryInAxisY(direction);
    else {
      newDirectionY = getDirectionTouchingContraryBothAxis(direction);
      getPositionCenterCornerIfIsNecesary(newDirectionY);
    }
    
    $circleTouching.setAttribute("data-direction",newDirectionY);
    
    let newDegRotateShapeInVertical = flipVertical.degRotate === 0 ? 180 : 0;
    
    if (keepAspectRatioShape) flipHorizontal.degRotate = newDegRotateShapeInVertical;
    
    flipSHAPE("vertical");
    
    deleteMeasuresIfExistInChangeDirection(measuresX,measuresY,lastDegRotate);
  }
}

function setAtributesShapeSelected ($SHAPESFILL,$SHAPESSTROKE,$SHADOWS,atributesToModify) {
  const {idshape} = toolSelected.modalFigures.SHAPE;
  
  if (idshape === "bubbleMessage") {
    $SHAPESFILL.forEach(($SHAPE,index)=>{
      const $SHADOW = $SHADOWS[index];
      const $SHAPESTROKE = $SHAPESSTROKE[index];
      
      const props = atributesToModify[index];
      
      props.atributes.forEach((atrname,i)=>{
        let value = props.values[i];
        $SHAPESTROKE.setAttribute(atrname,value);
        $SHAPE.setAttribute(atrname,value);
        $SHADOW.setAttribute(atrname,value)
      });
    })
  }
  else atributesToModify.forEach(({atribute,value})=>{
    $SHAPESFILL[0].setAttribute(atribute,value);
    $SHAPESSTROKE[0].setAttribute(atribute,value);
    $SHADOWS[0].setAttribute(atribute,value)
  })
}

function getDirectionContraryInAxisX (direction) {
  let newDirectionX;
  if (direction === "bottom-right") newDirectionX = "bottom-left";
  else if (direction === "bottom-left") newDirectionX = "bottom-right";
  else if (direction === "top-right") newDirectionX = "top-left";
  else if (direction === "top-left") newDirectionX = "top-right";
  return newDirectionX;
}

function getDirectionContraryInAxisY (direction) {
  let newDirectionY;
  if (direction === "bottom-right") newDirectionY = "top-right";
  else if (direction === "bottom-left") newDirectionY = "top-left";
  else if (direction === "top-right") newDirectionY = "bottom-right";
  else if (direction === "top-left") newDirectionY = "bottom-left";
  
  return newDirectionY;
}

function getDirectionTouchingContraryBothAxis (direction) {
  let newDirectionY;
  if (direction === "bottom-right") newDirectionY = "top-left";
  else if (direction === "bottom-left") newDirectionY = "top-right";
  else if (direction === "top-right") newDirectionY = "bottom-left";
  else if (direction === "top-left") newDirectionY = "bottom-right";
  
  return newDirectionY;
}

function deleteMeasuresIfExistInChangeDirection (measuresX,measuresY,degRotate) {
  const {measuresYBeforeEnterInRangeBorde,measuresXBeforeEnterInRangeBorde} = toolSelected.propsContainerAdjustShapes
  
  if (measuresYBeforeEnterInRangeBorde && (degRotate === 0 || degRotate === 180 || degRotate === 360)) delete toolSelected.propsContainerAdjustShapes.measuresYBeforeEnterInRangeBorde;
  
  if (measuresXBeforeEnterInRangeBorde && (degRotate === 270 || degRotate === 90)) delete toolSelected.propsContainerAdjustShapes.measuresXBeforeEnterInRangeBorde
}

function getNumberAxisInDeg (x,y,radian,sizeRadio) {
  let newX = (Math.cos(radian) * sizeRadio) + x,
  newY = (Math.sin(radian) * sizeRadio) + y
  
  return {newX,newY};
}

function adjustTopShapeIfIsNecesary (rotateX,idshape,currentdegrotateshape,$shape,$containerSHAPES) {
  if ($shape.id === "shape" && (idshape === "triangle" || idshape === "pentagon")) {
    let {topshapeinrotate,toporiginalshape} = $shape.dataset;
    
    let newTopShapeDependingRotateX = Number(rotateX === 180 ? topshapeinrotate : toporiginalshape);
    
    const topShape = getPropertyValueElement("top",$shape);
    
    setPropertyElement($shape,"top",`${newTopShapeDependingRotateX}px`);
    
    const yDiference = (newTopShapeDependingRotateX - topShape) / 2,
    {x,y} = $containerSHAPES.children["top-right"].getBoundingClientRect();
    
    let degRotateFromCornerTopRight = currentdegrotateshape - 90,
    degToRadian = (degRotateFromCornerTopRight * Math.PI) / 180,
    newPositionCorner = getNumberAxisInDeg(x,y,degToRadian,yDiference),
    diferenceXCORNER = newPositionCorner.newX - x,
    diferenceYCORNER = newPositionCorner.newY - y;
    
    const leftContainerShapes = getPropertyValueElement("left",$containerSHAPES),
    topContainerShapes = getPropertyValueElement("top",$containerSHAPES);
    
    setPropertyElement($containerSHAPES,"top",`${topContainerShapes + diferenceYCORNER}px`);
    setPropertyElement($containerSHAPES,"left",`${leftContainerShapes + diferenceXCORNER}px`);
  }
}

function adjustLeftShapeIfIsNecesary (rotateY,idshape,$shape) {
  if ($shape.id === "shape" && idshape === "middleTrapeze") {
    let {lefttorotatemiddletrapeze,leftoriginalmiddletrapeze} = $shape.dataset;
    
    let leftAdjustShape = Number(rotateY === 180 ? lefttorotatemiddletrapeze : leftoriginalmiddletrapeze);
    
    setPropertyElement($shape,"left",`${leftAdjustShape}px`);
  }
}

function getSizeShapeDependingSizeContainerAdjust (idShape,newWidthSquareAdjustSHAPES,newHeightSquareAdjustSHAPES,$squareAdjustShapes) {
  let newWidthSHAPE,newHeightSHAPE;
  if (idShape === "shape") {
    let {widthinhideshape,heightinhideshape} = $squareAdjustShapes.dataset;
    
    widthinhideshape = Number(widthinhideshape);
    heightinhideshape = Number(heightinhideshape);
    
    newWidthSHAPE = newWidthSquareAdjustSHAPES <= widthinhideshape ? 0 : newWidthSquareAdjustSHAPES - widthinhideshape;
    
    newHeightSHAPE = newHeightSquareAdjustSHAPES <= heightinhideshape ? 0 : newHeightSquareAdjustSHAPES - heightinhideshape;
  } else {
    let {measurepxforwidthoutline,measurepxforheightoutline} = $squareAdjustShapes.dataset;
    
    measurepxforwidthoutline = Number(measurepxforwidthoutline);
    measurepxforheightoutline = Number(measurepxforheightoutline);
    
    newWidthSHAPE = newWidthSquareAdjustSHAPES + measurepxforwidthoutline;
    newHeightSHAPE = newHeightSquareAdjustSHAPES + measurepxforheightoutline;
  }
  return {newWidthSHAPE,newHeightSHAPE}
}

function getDirectionCorrectDependingDegRotate (currentDeg) {
  let direction;
  if (currentDeg === 0 || currentDeg === 360 || currentDeg === 180) direction = "normal";
  else if (currentDeg === 270 || currentDeg === 90) direction = "contrary";
  
  return direction;
}

function adjustContainersInCanvas (X,Y) {
  const $containerSHAPES = $(".aplication .img .container-SHAPES-insert"),
  measuresContainerCanvas = $("#container-canvas").getBoundingClientRect(),
  {idshape} = toolSelected.modalFigures.SHAPE;
  
  let $CONTAINEROFREFERENCE,
  CONTAINERSTOMIDIFIED = [$containerSHAPES]
  ,pxMoveInX,pxMoveInY;
  
  if (idshape === "custom-clip-path") {
    const $PATH = $containerSHAPES.querySelector("svg path");
    
    let {x,y} = $PATH.getBoundingClientRect(),{left,top} = measuresContainerCanvas;
    
    let xShapeInCanvas = x - left,
    yShapeInCanvas = y - top;
    
    pxMoveInX = X - xShapeInCanvas;
    pxMoveInY = Y - yShapeInCanvas;
  }
  else {
    const $CONTAINERADJUSTSHAPE = $(".aplication > .square-of-adjust-SHAPES");
    
    const measuresCONTAINERADJUSTSHAPES = $CONTAINERADJUSTSHAPE.getBoundingClientRect(),
    {x,y} = measuresContainerCanvas,
    {left,top} = $aplication.getBoundingClientRect(),
    leftCurrentContainerAdjustShape = measuresCONTAINERADJUSTSHAPES.x - left,
    topCurrentContainerAdjustShape = measuresCONTAINERADJUSTSHAPES.y - top
    ,diferenceBettweenXAplicationAndXContainer = x - left,
    diferenceBettweenYAplicationAndYContainer = y - top,
    newLeftContainerAdjustShapes = diferenceBettweenXAplicationAndXContainer + X,
    newTopContainerAdjustShapes = diferenceBettweenYAplicationAndYContainer + Y;
  
    pxMoveInX = newLeftContainerAdjustShapes - leftCurrentContainerAdjustShape;
    
    pxMoveInY = newTopContainerAdjustShapes - topCurrentContainerAdjustShape;
    
    CONTAINERSTOMIDIFIED.push($CONTAINERADJUSTSHAPE);
  }
  
  if (idshape === "line" || idshape === "arrowIndicator") {
    const $CIRCLELEFT = $aplication.children["circle-left"],
    $CIRCLERIGHT = $aplication.children["circle-right"];
    
    CONTAINERSTOMIDIFIED.push($CIRCLELEFT);
    CONTAINERSTOMIDIFIED.push($CIRCLERIGHT)
  }
  
  CONTAINERSTOMIDIFIED.forEach($CONTAINER=>{
    let leftContainer = getPropertyValueElement("left",$CONTAINER),
    topContainer = getPropertyValueElement("top",$CONTAINER);
    
    setPropertyElement($CONTAINER,"left",`${leftContainer + pxMoveInX}px`)
    setPropertyElement($CONTAINER,"top",`${topContainer + pxMoveInY}px`)
  })
}

function changePropsStyleLabelInputFocus ($LABEL,color) {
  setPropertyElement($LABEL,"bottom","30px");
  setPropertyElement($LABEL,"font-size","12px");
  setPropertyElement($LABEL,"color",color);
}

function setEventsInputOfFocusAndBlur ($INPUT) {
  $INPUT.onfocus = ({target})=>{
    const $SPAN = target.nextElementSibling
    changePropsStyleLabelInputFocus($SPAN,"#3097ff");
  }
  
  $INPUT.onblur = ({target})=>{
    const $SPAN = target.nextElementSibling
    if ($INPUT.value === "") {
      setPropertyElement($SPAN,"bottom","3px");
      setPropertyElement($SPAN,"font-size","15px");
    }
    setPropertyElement($SPAN,"color","#ffffff70");
  }
}

function applySizeSHAPE (newWidthShape,newHeightShape) {
  //4 EQUIVALE AL MIN SIZE DE EL CONTENEDOR DE REFERENCIA
  
  newWidthShape += 4;
  newHeightShape += 4;
  
  const {lastDegRotate,myLastHeight,myLastWidth,pxForWidthShape,pxForHeightShape,widthSVG,heightSVG} = toolSelected.propsContainerAdjustShapes
  
  let newHeightContainerShape = newHeightShape - pxForHeightShape,
  newWidthContainerShape = newWidthShape - pxForWidthShape;
  
  let diferenceInHeightContainerShapes = newHeightContainerShape - heightSVG,
  diferenceInWidthContainerShapes = newWidthContainerShape - widthSVG;
  
  let diferenceInHeightShape = newHeightShape - myLastHeight,
  diferenceInWidthShape = newWidthShape - myLastWidth;
  
  changeTransformOriginContainers("left top","left top");
  
  const $MAINCONTAINERSHAPE = $(".aplication #container-canvas .container-SHAPES-insert"),
  $CONTAINERADJUSTSHAPES = $(".aplication .square-of-adjust-SHAPES");
  
  resizeShapes("top-left",$MAINCONTAINERSHAPE,diferenceInWidthContainerShapes,diferenceInHeightContainerShapes,$CONTAINERADJUSTSHAPES,$CONTAINERADJUSTSHAPES.children["top-left"],0,0,true,true);
}

function changeValueOfInputContrary (INPUTS,INPUTTARGET) {
  const typeSizeInput = INPUTTARGET.id,
  indexInputContrary = INPUTS.indexOf(INPUTTARGET) === 0 ? 1 : 0,
  $INPUTCONTRARY = INPUTS[indexInputContrary],
  valueInput = INPUTTARGET.valueAsNumber,
  valueInputToString = INPUTTARGET.value,
  {idshape} = toolSelected.modalFigures.SHAPE;
  
  const {lockRatioPercentageWidthInHeight,lockRatioPercentageHeightInWidth} = idshape === "text" ? toolSelected.variablesShapeTextTemporal : toolSelected.variablesOfLockRatio
  
  let percentageCorrect;
  if (typeSizeInput === "width-input") percentageCorrect = lockRatioPercentageHeightInWidth;
  else percentageCorrect = lockRatioPercentageWidthInHeight;
  
  let valueNumberInputContrary = $INPUTCONTRARY.valueAsNumber;
  
  if (isNaN(valueNumberInputContrary)) changePropsStyleLabelInputFocus($INPUTCONTRARY.nextElementSibling,"#ffffff70");
  
  let amountDecimals = valueInputToString.split(".")[1]?.length ?? 0
  
  $INPUTCONTRARY.value = ((percentageCorrect * valueInput) / 100).toFixed(amountDecimals);
}

function clickButtonMovePositionShape ({target}) {
  const {idshape} = toolSelected.modalFigures.SHAPE,
  button = target.id;
  
  if (button === "custom-position") {
    const HTMLFORCUSTOMPOSITION = `<div class="modal-custom-position-shape" id="father-modal">
    <div>
      <div class="header">
        <div class="x-container">
        <input type="number" id="x">
        <span id="label-x">X</span>
        </div>
        <span>×</span>
        <div class="y-container">
        <input type="number" id="y">
        <span id="label-y">Y</span>
        </div>
      </div>
      <div class="footer">
        <button id="cancel">cancel</button>
        <button id="apply">apply</button>
      </div>
      </div>
    </div>`;
    
    $aplication.insertAdjacentHTML("beforeend",HTMLFORCUSTOMPOSITION)
    
    const $MODALCUSTOMPOSITION = $aplication.querySelector(".modal-custom-position-shape");
    
    const measuresContainerCanvas = $aplication.children["container-canvas"].getBoundingClientRect();
   
    let xRelativeToContainerCanvas,
    yRelativeToContainerCanvas;
    
    if (idshape === "custom-clip-path") {
      const $path = $("#container-canvas .container-SHAPES-insert svg path")
      
      let positionPath = $path.getBoundingClientRect();
      
      xRelativeToContainerCanvas = (positionPath.x - measuresContainerCanvas.x).toFixed(1);
      
      yRelativeToContainerCanvas = (positionPath.y - measuresContainerCanvas.y).toFixed();
    }
    else {
      let {left,top} = $aplication.getBoundingClientRect(),
      measuresContainerAdjustShape = $aplication.children["square-adjust-SHAPES"].getBoundingClientRect(),
      xContainerAdjustShapes = measuresContainerAdjustShape.x - left,
      yContainerAdjustShapes = measuresContainerAdjustShape.y - top;
      
      xRelativeToContainerCanvas = (xContainerAdjustShapes - (measuresContainerCanvas.x - left)).toFixed(1);
      yRelativeToContainerCanvas = (yContainerAdjustShapes - (measuresContainerCanvas.y - top)).toFixed(1);
    }
    
    $MODALCUSTOMPOSITION.querySelectorAll("input").forEach($INPUT=>{
      const {id} = $INPUT;
      
      $INPUT.value = id === "x" ? xRelativeToContainerCanvas : yRelativeToContainerCanvas;
      
      setEventsInputOfFocusAndBlur($INPUT);
      
      $INPUT.focus();
      $INPUT.blur();
    })
    
    $MODALCUSTOMPOSITION.onclick = ({target})=>{
      const ID = target.id,
      $INPUTCORRESPONDING = target.previousElementSibling;
      
      if (ID === "apply") {
        const $INPUTFORLEFT = $MODALCUSTOMPOSITION.querySelector("input#x"),
        $INPUTFORTOP = $MODALCUSTOMPOSITION.querySelector("input#y");
        
        let x = isNaN($INPUTFORLEFT.valueAsNumber) ? 0 : $INPUTFORLEFT.valueAsNumber,
        y = isNaN($INPUTFORTOP.valueAsNumber) ? 0 : $INPUTFORTOP.valueAsNumber;
        
        adjustContainersInCanvas(x,y);
      }
      else if ((ID === "label-x" || ID === "label-y") && $INPUTCORRESPONDING.value === "") $INPUTCORRESPONDING.focus();
      
      if (ID === "cancel" || ID === "father-modal" || ID === "apply") removeElementOfDom($MODALCUSTOMPOSITION);
    }
    
    return;
  }
  else if (button === "custom-size") {
    const HTMLEDITSIZESHAPE = `
  <div class="modal-custom-size-shape" id="custom-size-shape">
  <div>
    <div class="header">
    <div>
      <input type="number" id="width-input">
      <span id="label-width">Width</span>
    </div>
    <span>×</span>
    <div>
      <input type="number" id="height-input">
      <span id="label-height">Height</span>
    </div>
    </div>
    <div class="footer">
      <button id="cancel">cancel</button>
      <button id="apply">apply</button>
    </div>
  </div>
  </div>
    `;
    
    $aplication.insertAdjacentHTML("beforeend",HTMLEDITSIZESHAPE);
    
    const $MODALCUSTOMSIZE = $aplication.children["custom-size-shape"],
    $CONTAINERADJUSTSHAPE = $aplication.children["square-adjust-SHAPES"]
    
    const $INPUTS = Array.from($MODALCUSTOMSIZE.querySelectorAll("input"));
    
    const {lockRatioShape} = toolSelected,
    {keepAspectRatio} = toolSelected.valuesSettingShapeText,
    {myLastHeight,myLastWidth} = toolSelected.propsContainerAdjustShapes,
    {lockRatioPercentageHeightInWidth} = toolSelected.variablesOfLockRatio;
    
    let sizeMinSHAPE = 4;
    
    $INPUTS.forEach($INPUT=>{
      let size = ($INPUT.id === "width-input" ? myLastWidth - sizeMinSHAPE : myLastHeight - sizeMinSHAPE).toFixed(1);
      
      if (lockRatioShape && $INPUT.id === "height-input") size = ((lockRatioPercentageHeightInWidth * (myLastWidth - sizeMinSHAPE)) / 100).toFixed(1);
      
      $INPUT.value = size;
      
      setEventsInputOfFocusAndBlur($INPUT);
      
      $INPUT.focus();
      $INPUT.blur();
      
      $INPUT.oninput = ({target})=>{
        if (lockRatioShape || (idshape === "text" && keepAspectRatio)) changeValueOfInputContrary($INPUTS,target);
      }
    });
    
    $MODALCUSTOMSIZE.onclick = ({target})=>{
      const ID = target.id,
      $INPUTCORRESPONDING = target.previousElementSibling;
      
      if (ID === "apply") {
        const $INPUTFORWIDTH = $MODALCUSTOMSIZE.querySelector("input#width-input"),
        $INPUTFORHEIGHT = $MODALCUSTOMSIZE.querySelector("input#height-input"),
        lengthValueHeight = $INPUTFORHEIGHT.value.length,
        lengthValueWidth = $INPUTFORWIDTH.value.length;
        
        const width = isNaN($INPUTFORWIDTH.valueAsNumber) ? 0 : $INPUTFORWIDTH.valueAsNumber,
        height = isNaN($INPUTFORHEIGHT.valueAsNumber) ? 0 : $INPUTFORHEIGHT.valueAsNumber;
        
        applySizeSHAPE(width,height);
      }
      else if ((ID === "label-width" || ID === "label-height") && $INPUTCORRESPONDING.value === "") $INPUTCORRESPONDING.focus();
      
      if (ID === "cancel" || ID === "custom-size-shape" || ID === "apply") removeElementOfDom($MODALCUSTOMSIZE);
    }
    
    return;
  }
  
  const pxVelocity = 2;
  
  const positionCanvas = $aplication.children["container-canvas"].getBoundingClientRect();
  
  let leftContainerReference,
  topContainerReference;
  
  if (idshape === "custom-clip-path") {
    const positionPath = $("#container-canvas .container-SHAPES-insert svg path").getBoundingClientRect();
    
    leftContainerReference = positionPath.x - positionCanvas.x;
    topContainerReference = positionPath.y - positionCanvas.y;
  }
  else {
    let positionContainerAdjustShape = $("#square-adjust-SHAPES").getBoundingClientRect(),
    positionAplication = $aplication.getBoundingClientRect();
    
    leftContainerReference = (positionContainerAdjustShape.x - positionAplication.x) - (positionCanvas.x - positionAplication.x);
    
    topContainerReference = (positionContainerAdjustShape.y - positionAplication.y) - (positionCanvas.y - positionAplication.y);
  }
  
  if (button === "right") leftContainerReference += pxVelocity
  else if (button === "left") leftContainerReference -= pxVelocity
  else if (button === "up") topContainerReference -= pxVelocity;
  else if (button === "down") topContainerReference += pxVelocity;
  
  adjustContainersInCanvas(leftContainerReference,topContainerReference);
}

function closeSettingShapeInCanvas () {
  $toolsDown.querySelector(".container-tools-adjust-shape")?.remove();
  
  $toolsDown.querySelector(".draw-tool").classList.remove("hide");
  $toolsDown.querySelector(".options-tool-draw")?.classList.remove("hide");
  
  $(".aplication > #square-adjust-SHAPES")?.remove();
  $(".aplication .img .container-SHAPES-insert")?.remove();
  $(".aplication > .container-setting-SHAPE")?.remove();
  $("aplication > .marker-setting-shape")?.remove();
  
  $aplication.children["circle-left"]?.remove();
  $aplication.children["circle-right"]?.remove();
  
  $(".container-modify-deg-shape")?.remove();
  $(".container-buttons-move-shape")?.remove();
  
  $aplication.removeAttribute("data-modalcurrentshape");
  $aplication.removeAttribute("data-runningshrinkcontainer");
  
  delete toolSelected.propsContainerAdjustShapes;
  delete toolSelected.propsCirclesForMoveShapeLINE;
  
  delete toolSelected.idtimeoutmarker;
  delete toolSelected.idtimeoutbuttons;
  
  delete toolSelected["idTimeOut-buttons-for-round"];
  delete toolSelected["idTimeOut-buttons-for-thickness"];
  delete toolSelected["idTimeOut-buttons-for-tail"];
  
  delete toolSelected.valuesSettingThicknessSHAPELINE.percentageHeightForDiferenceTopShadow;
  delete toolSelected.valuesSettingThicknessSHAPELINE.percentageHeightForDiferenceLeftShadow
  delete toolSelected.valuesSettingThicknessSHAPELINE.thicknessOUTLINE;
  delete toolSelected.sizeBeforeLockRatioShape;
  delete toolSelected.lastSuperpositionSelectedInModalFigures;
  
  toolSelected.lockRatioShape = false;
  
  toolSelected.flipHorizontal = {actived:false,degRotate:0};
  toolSelected.flipVertical = {actived:false,degRotate:0};
  
  toolSelected.valuesSettingShapeText.texts = "";
  
  delete toolSelected.propsShapeTextInApply
  delete toolSelected.propsShapeTextInModalFigures;
  delete toolSelected.propsCanvasEditShapeText;
  delete toolSelected.valuesSettingShapeTextIntoModal;
  delete toolSelected.pointsClipPath;
  delete toolSelected.widthShapeTextOfReference;
  delete toolSelected.distanceBettweenShapeTexts;
  
  delete toolSelected.valuesToUseInTextsToApply;
  delete toolSelected.variablesShapeTextTemporal;
  delete toolSelected.lastLocationOriginContainerToUse;
  
  delete toolSelected.blurPxShadow;
  delete toolSelected.variablesShapeClipPathTemporal;
}

function getMeasuresOfReferenceForRotateShapeWithTwoCornersInCenter (degRotateShape) {
  const {measuresCircleLeft,measuresCircleRight} = getMeasuresCirclesForResizeShape();
  
  const distanceBettweenCircles = getDistanceOfTwoPoints(
    measuresCircleLeft.x,
    measuresCircleLeft.y,
    measuresCircleRight.x,
    measuresCircleRight.y
  );
  
  let halfDistanceCircle = distanceBettweenCircles / 2,
  degToRadian = (degRotateShape * Math.PI) / 180;
  
  const xCenterShapeLine = (Math.cos(degToRadian) * halfDistanceCircle) + measuresCircleLeft.x,
  yCenterShapeLine = (Math.sin(degToRadian) * halfDistanceCircle) + measuresCircleLeft.y;
  
  const propsCAS = toolSelected.propsContainerAdjustShapes;
  
  propsCAS.halfDistanceOfCircles = halfDistanceCircle;
  propsCAS.axisCenterShape = {
    x:xCenterShapeLine,
    y:yCenterShapeLine
  }
}

function showOrHideLastToolOfDrawSelected (mode) {
  let {optionSelected} = toolSelected;
  
  if (optionSelected === "lasso") {
    const {noMove,move} = toolSelected.optionCutCircles;
    let {lines} = toolSelected.variablesSubtoolLasso;
    
    const changeVisibilityCircles = method => {
      [noMove,move].forEach($circle=>$circle.classList[method]("hide"))
    }
    
    if (mode === "hide") {
      changeVisibilityCircles("add");
      
      const {index,layers} = toolSelected.layer;
      
      clearCanvas();
      
      putImageData(layers[index]);
    }
    else if (lines.length > 0) {
      changeGlobalCompositeOperation("lasso");
      
      ctx.globalAlpha = 1;
      ctx.filter = "none"
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      
      drawLines();
    
      ctx.stroke();
    
      changeVisibilityCircles("remove");
    }
  }
  else if (optionSelected === "brush" || optionSelected === "eraser") {
    let METHODCORRECT = mode === "hide" ? "add" : "remove";
    $(".aplication .img .mode-of-paint")?.classList[METHODCORRECT]("visibility-hidden");
  }
}

function clickedToolsInAdjustShape ({target}) {
  const $settingSHAPEMODAL = $(".aplication > .container-setting-SHAPE"),
  $optionsAdjustShape = $(".tools_down .container-tools-adjust-shape .modal-options-adjust-shape");
    
  if ($settingSHAPEMODAL && !$settingSHAPEMODAL.dataset.shrink) {
    touchAPLICATION({target:{classList:{contains:()=>{return true}}}});
    clearTimeout(toolSelected.idtimeoutmarker);
    hideElementMarkerSettingShape();
    return;
  } else if ($optionsAdjustShape && !$optionsAdjustShape.dataset.shrink && !target.classList.contains("button-in-options") && !target.classList.contains("modal-options-adjust-shape")) {
    touchAPLICATION({target:{classList:{contains:()=>{return true}}}});
    return;
  }
  
  let IDBUTTON = target.id;
  if (IDBUTTON === "close-modal-adjust-shape") {
    closeSettingShapeInCanvas();
    showOrHideLastToolOfDrawSelected("visible");
  }
  else if (IDBUTTON === "edit-values-of-modal-figures") {
    const $CONTAINERSHAPES = $aplication.children["container-canvas"].children["container-SHAPES-INSERT"],{shapeadjustment} = $CONTAINERSHAPES.dataset;
    
    const {borderRoundActived} = toolSelected.valuesSettingThicknessSHAPELINE;
    
    toolSelected.propsContainerAdjustShapes.valuesModalFiguresBeforeEnterInEdit = structuredClone(toolSelected.modalFigures);
    
    toolSelected.modalFigures = JSON.parse(shapeadjustment);
    
    toolSelected.modalFigures.ALLTYPESLINE.typesLine.line1.timesRepeatPx = [Infinity];
    
    //EL TRUE COMO SEGUNDO ARGUMENTO LE DICE A LA FUNCION QUE YA HEMOS OBTENIDO LOS VALORES A MOSTRAR EN EL MODAL PARA QUE NO VUELVA OBTENERLO
    showModalFigures(toolSelected.modalFigures.OPTION,true);
  } 
  else if (IDBUTTON === "options") {
    const {modalOptionsAdjustShape} = toolSelected.htmlChildren,
    {idshape} = toolSelected.modalFigures.SHAPE,
    $CONTAINERTOOLS = target.parentElement;
    
    let $CONTAINEROPTIONS;
    if (!$(".tools_down .container-tools-adjust-shape .modal-options-adjust-shape")) {
      
      $CONTAINERTOOLS.insertAdjacentHTML("beforeend",modalOptionsAdjustShape);
      
      const $OPTIONSADJUSTSHAPE = $CONTAINERTOOLS.querySelector(".modal-options-adjust-shape");
      
      $CONTAINEROPTIONS = $OPTIONSADJUSTSHAPE;
      
      setTimeout(()=>{
      setPropertyElement($OPTIONSADJUSTSHAPE,"transform","scaleY(1)");
      setPropertyElement($OPTIONSADJUSTSHAPE,"opacity","1");
      },0);
    }
    else {
      const $OPTIONSADJUST = $CONTAINERTOOLS.querySelector(".modal-options-adjust-shape");
      
      $CONTAINEROPTIONS = $OPTIONSADJUST;
      
      $OPTIONSADJUST.removeAttribute("data-shrink");
      setPropertyElement($OPTIONSADJUST,"transform","scaleY(1)");
      setPropertyElement($OPTIONSADJUST,"opacity","1");
    }
    
    const {keepAspectRatio} = toolSelected.valuesSettingShapeText,
    {lockRatioShape} = toolSelected;
    
    let buttonKeepAspectRatioSelected;
    if (idshape === "text") buttonKeepAspectRatioSelected = keepAspectRatio;
    else buttonKeepAspectRatioSelected = lockRatioShape;
    
    let disabledBUTTONLOCKRATIO = idshape === "line" || idshape === "circle" || idshape === "custom-clip-path" || idshape === "arrowIndicator" ? true : false
    ,disabledBUTTONFLIPHORIZONTAL = idshape === "line" || idshape === "arrowIndicator" ? true : false,
    disabledBUTTONFLIPVERTICAL = idshape === "line" || idshape === "arrowIndicator" ? true : false;
    
    const $BUTTONLOCKRATIO = $CONTAINEROPTIONS.children["lock-ratio"],
    $BUTTONFLIPHORIZONTAL = $CONTAINEROPTIONS.children["flip-horizontal"],
    $BUTTONFLIPVERTICAL = $CONTAINEROPTIONS.children["flip-vertical"],
    {flipHorizontal,flipVertical} = toolSelected;
    
    $BUTTONLOCKRATIO.disabled = disabledBUTTONLOCKRATIO;
    $BUTTONFLIPHORIZONTAL.disabled = disabledBUTTONFLIPHORIZONTAL;
    $BUTTONFLIPVERTICAL.disabled = disabledBUTTONFLIPVERTICAL;
    
    [{BUTTON:$BUTTONLOCKRATIO,disabled:disabledBUTTONLOCKRATIO,selected:buttonKeepAspectRatioSelected},
    {BUTTON:$BUTTONFLIPHORIZONTAL,disabled:disabledBUTTONFLIPHORIZONTAL,selected:flipHorizontal.actived},
    {BUTTON:$BUTTONFLIPVERTICAL,disabled:disabledBUTTONFLIPVERTICAL,selected:flipVertical.actived}].forEach(({BUTTON,disabled,selected})=>{
      if (disabled) setPropertyElement(BUTTON,"color",`#e7e7e767`);
      else setPropertyElement(BUTTON,"color",`${selected ? "#3097ff" : "#e7e7e7"}`);
    });
    
    addEventTouchForShrinkContainer("optionsShape");
  }
  else if (IDBUTTON === "options-rotate") {
    const {containerOptionsDegShape} = toolSelected.htmlChildren;
    
    touchAPLICATION({target:{classList:{contains:()=>{return true}}}});
    
    $aplication.insertAdjacentHTML("beforeend",containerOptionsDegShape);
    
    const $CONTAINEROPTIONSPOSITIONING = $aplication.querySelector(".container-options-positioning"),
    $INPUTSCHECKBOX = $CONTAINEROPTIONSPOSITIONING.querySelectorAll(`input[type="checkbox"]`);
    
    $INPUTSCHECKBOX.forEach($INPUT=>{
      $INPUT.checked = toolSelected.optionsPositioningSHAPE[$INPUT.id]
    })
    
    $CONTAINEROPTIONSPOSITIONING.onclick = ({target}) => {
      let button = target.id;
      if (button === "apply") {
        $INPUTSCHECKBOX.forEach($INPUT=>{
          const ID = $INPUT.id;
          toolSelected.optionsPositioningSHAPE[ID] = $INPUT.checked;
        })
        updateButtonsRotateSHAPE();
      }
      
      if (button === "apply" || button === "cancel" || button === "container-parent") removeElementOfDom($CONTAINEROPTIONSPOSITIONING);
    }
  }
  else if (IDBUTTON === "modify-position-and-size-shape") {
    const {containerButtonsMoveShape} = toolSelected.htmlChildren,
    {idshape} = toolSelected.modalFigures.SHAPE;
    
    touchAPLICATION({target:{classList:{contains:()=>{return true}}}});
    
    let $CONTAINERBUTTONS;
    if (!($CONTAINERBUTTONS = $(".container-buttons-move-shape"))) {
      $toolsDown.insertAdjacentHTML("beforeend",containerButtonsMoveShape);
      
      $CONTAINERBUTTONS = $(".container-buttons-move-shape");
      
      $CONTAINERBUTTONS.onclick = clickButtonMovePositionShape;
    }
    
    setTimeout(()=>{
    setPropertyElement($CONTAINERBUTTONS,"transform","scaleY(1)");
    setPropertyElement($CONTAINERBUTTONS,"opacity","1");
    },0);
    
    addEventTouchForShrinkContainer("buttonsMoveShape");
    
    $CONTAINERBUTTONS.removeAttribute("data-shrink");
    
    const $BUTTONCUSTOMSIZE = $CONTAINERBUTTONS.children["custom-size"];
    
    const $ICONBUTTON = $BUTTONCUSTOMSIZE.firstElementChild;
    
    if (idshape === "line" || idshape === "custom-clip-path" || idshape === "arrowIndicator" || idshape === "circle") {
      $BUTTONCUSTOMSIZE.setAttribute("disabled","");
      $ICONBUTTON.classList.add("opacity-midle");
    }
    else {
      $BUTTONCUSTOMSIZE.removeAttribute("disabled");
      $ICONBUTTON.classList.remove("opacity-midle");
    }
  }
  else if (IDBUTTON === "angle-shape") {
    const {containerMoveDegShape} = toolSelected.htmlChildren,
    {idshape} = toolSelected.modalFigures.SHAPE;
    
    touchAPLICATION({target:{classList:{contains:()=>{return true}}}});
    
    let $CONTAINERMODIFYDEGSHAPE;
    if (!($CONTAINERMODIFYDEGSHAPE = $(".container-modify-deg-shape"))) {
      
      $toolsDown.insertAdjacentHTML("beforeend",containerMoveDegShape)
      
      $CONTAINERMODIFYDEGSHAPE = $(".container-modify-deg-shape");
      
      const $INPUTRANGEDEG = $CONTAINERMODIFYDEGSHAPE.querySelector(`.footer input[type="range"`);
      
      $INPUTRANGEDEG.ontouchstart = touchesInputRangeDegShape;
      $INPUTRANGEDEG.ontouchmove = touchesInputRangeDegShape;
      $INPUTRANGEDEG.ontouchend = touchesInputRangeDegShape;
      
      $CONTAINERMODIFYDEGSHAPE.onclick = clickButtonInModifyDegShape;
    }
    
    const $INPUTRANGE = $CONTAINERMODIFYDEGSHAPE.querySelector("input");
    
    const $CONTAINERADJUSTSHAPE = $aplication.children["square-adjust-SHAPES"],
    $CONTAINERSHAPES = $(".aplication #container-canvas #container-SHAPES-INSERT");
    
    let degRotateShape = idshape === "line" ? toolSelected.propsCirclesForMoveShapeLINE.lastDegRotate : toolSelected.propsContainerAdjustShapes.lastDegRotate;
    
    if (idshape === "line" || idshape === "arrowIndicator") getMeasuresOfReferenceForRotateShapeWithTwoCornersInCenter(degRotateShape);
    
    degRotateShape = degRotateShape === 360 ? 0 : degRotateShape;
    
    $INPUTRANGE.setAttribute("step","0.1");
    
    $INPUTRANGE.value = degRotateShape.toFixed(1);
    
    updateDegRotateShape($INPUTRANGE);
    
    changeTransformOriginContainers("center","center");
    
    toolSelected.lastLocationOriginContainerToUse = "center";
    
    setTimeout(()=>{
      setPropertyElement($CONTAINERMODIFYDEGSHAPE,"transform","scaleY(1)");
      setPropertyElement($CONTAINERMODIFYDEGSHAPE,"opacity","1");
    },0);
    
    $CONTAINERMODIFYDEGSHAPE.removeAttribute("data-shrink");
    
    addEventTouchForShrinkContainer("toolsModifyDegShape")
    
    const $BUTTONNAMEANGLE = $CONTAINERMODIFYDEGSHAPE.querySelector(".footer .buttons #name-button-angle");
    
    clearTimeout(toolSelected.idtimeoutbuttons);
    
    if ($BUTTONNAMEANGLE.classList.contains("hide")) {
      let pathButtons = `.container-modify-deg-shape .footer .buttons`;
      
      showOrHideButtons(`${pathButtons} #name-button-angle`,`${pathButtons} #subtract-deg-step-int`,`${pathButtons} #add-deg-step-int`);
    }
  }
  else if (IDBUTTON === "lock-ratio") {
    const {keepAspectRatio} = toolSelected.valuesSettingShapeText;
    
    const {idshape} = toolSelected.modalFigures.SHAPE;
    
    const {widthSVG,heightSVG} = toolSelected.propsContainerAdjustShapes;
    
    getPercentageInSizeForUseInKeepAspectRatioShape(idshape,widthSVG,heightSVG);
    
    if (idshape === "text") {
      touchAPLICATION({target:{classList:{contains:()=>{return true}}}});
      toolSelected.valuesSettingShapeText.keepAspectRatio = keepAspectRatio ? false : true;
    }
    else {
      activateOrDesactivateValueInOptionsAdjustShape("lockRatioShape");
    }
  }
  else if (IDBUTTON === "flip-horizontal") {
    activateOrDesactivateValueInOptionsAdjustShape("flipHorizontal");
    
    flipSHAPE("horizontal");
    
    changeOrderCirclesCustomClipPathAndPosition("x");
  }
  else if (IDBUTTON === "flip-vertical") {
    activateOrDesactivateValueInOptionsAdjustShape("flipVertical");
    
    flipSHAPE("vertical");
    
    changeOrderCirclesCustomClipPathAndPosition("y");
  }
  else if (IDBUTTON === "done") {
    drawShapeInCanvas();
    saveLayerInToolDraw();
    updateButtonsBNInToolDraw();
    closeSettingShapeInCanvas();
    showOrHideLastToolOfDrawSelected("visible");
  }
}

function changeOrderCirclesCustomClipPathAndPosition (axis) {
  const {idshape} = toolSelected.modalFigures.SHAPE;
  
  const {widthSVG,heightSVG} = toolSelected.propsContainerAdjustShapes;
  
  const {flipVertical,flipHorizontal} = toolSelected;
  
  if (idshape === "custom-clip-path") {
    changeDirectionOfPointShapeClipPath(axis);
    moveCirclesOfCustomClipPathShape(widthSVG,heightSVG,flipHorizontal.degRotate,flipVertical.degRotate);
  }
}

function changeDirectionOfPointShapeClipPath (axisName) {
  const $CORNERTOPLEFT = $(`#container-canvas .container-SHAPES-insert .circles-custom-clip-path[data-namecorner="top-left"]`);
  
  const $CORNERTOPRIGHT = $(`#container-canvas .container-SHAPES-insert .circles-custom-clip-path[data-namecorner="top-right"]`);
  
  const $CORNERBOTTOMLEFT = $(`#container-canvas .container-SHAPES-insert .circles-custom-clip-path[data-namecorner="bottom-left"]`);
  
  const $CORNERBOTTOMRIGHT = $(`#container-canvas .container-SHAPES-insert .circles-custom-clip-path[data-namecorner="bottom-right"]`);
  
  let dataTopLeft = {
    indexofposition:$CORNERTOPLEFT.dataset.indexofposition,
    measurestomodify:$CORNERTOPLEFT.dataset.measurestomodify
  },dataBottomLeft = {
    indexofposition:$CORNERBOTTOMLEFT.dataset.indexofposition,
    measurestomodify:$CORNERBOTTOMLEFT.dataset.measurestomodify
  },
  dataTopRight = {
    indexofposition:$CORNERTOPRIGHT.dataset.indexofposition,
    measurestomodify:$CORNERTOPRIGHT.dataset.measurestomodify
  },
  dataBottomRight = {
    indexofposition:$CORNERBOTTOMRIGHT.dataset.indexofposition,
    measurestomodify:$CORNERBOTTOMRIGHT.dataset.measurestomodify
  }
  
  const changeAtributeCornersOpposites = ($corner1,$corner2,measurestomodifyCorner1,measurestomodifyCorner2) => {
    if (measurestomodifyCorner2 && measurestomodifyCorner1) {
      $corner1.setAttribute("data-measurestomodify",measurestomodifyCorner2);
      $corner2.setAttribute("data-measurestomodify",measurestomodifyCorner1);
    } else if (measurestomodifyCorner2) {
      $corner1.setAttribute("data-measurestomodify",measurestomodifyCorner2);
      $corner2.removeAttribute("data-measurestomodify");
    }
    else if (measurestomodifyCorner1) {
      $corner2.setAttribute("data-measurestomodify",measurestomodifyCorner1);
      $corner1.removeAttribute("data-measurestomodify");
    }
  }
  
  if (axisName === "y") {
    $CORNERBOTTOMLEFT.setAttribute("data-indexofposition",dataTopLeft.indexofposition);
    $CORNERBOTTOMRIGHT.setAttribute("data-indexofposition",dataTopRight.indexofposition);
    
    $CORNERTOPLEFT.setAttribute("data-indexofposition",dataBottomLeft.indexofposition);
    $CORNERTOPRIGHT.setAttribute("data-indexofposition",dataBottomRight.indexofposition);
    
    changeAtributeCornersOpposites(
      $CORNERTOPLEFT,
      $CORNERBOTTOMLEFT,
      dataTopLeft.measurestomodify,
      dataBottomLeft.measurestomodify
    )
    
    changeAtributeCornersOpposites(
      $CORNERTOPRIGHT,
      $CORNERBOTTOMRIGHT,
      dataTopRight.measurestomodify,
      dataBottomRight.measurestomodify
    )
    
    const $CIRCLESBETWEENCORNERSTOP = $$(`#container-canvas .container-SHAPES-insert .circles-custom-clip-path[data-sidename="top"]`);
    
    $CIRCLESBETWEENCORNERSTOP.forEach($CIRCLE=>{
      let {indexofposition,sidenamebetweencorners,measurestomodify} = $CIRCLE.dataset;
      
      let numberCircle = sidenamebetweencorners.split("-")[1];
      
      const $CIRCLECONTRARY = $(`#container-canvas .container-SHAPES-insert .circles-custom-clip-path[data-sidenamebetweencorners="bottom-${numberCircle}"]`);
      
      changeAtributeCornersOpposites(
        $CIRCLE,
        $CIRCLECONTRARY,
        measurestomodify,
        $CIRCLECONTRARY.dataset.measurestomodify
      )
      
      $CIRCLE.setAttribute("data-indexofposition",$CIRCLECONTRARY.getAttribute("data-indexofposition"));
      
      $CIRCLECONTRARY.setAttribute("data-indexofposition",indexofposition);
    })
  }
  else if (axisName === "x") {
    $CORNERTOPLEFT.setAttribute("data-indexofposition",dataTopRight.indexofposition);
    $CORNERBOTTOMLEFT.setAttribute("data-indexofposition",dataBottomRight.indexofposition);
    
    $CORNERTOPRIGHT.setAttribute("data-indexofposition",dataTopLeft.indexofposition);
    $CORNERBOTTOMRIGHT.setAttribute("data-indexofposition",dataBottomLeft.indexofposition);
    
    changeAtributeCornersOpposites(
      $CORNERTOPLEFT,
      $CORNERTOPRIGHT,
      dataTopLeft.measurestomodify,
      dataTopRight.measurestomodify
    )
    
    changeAtributeCornersOpposites(
      $CORNERBOTTOMLEFT,
      $CORNERBOTTOMRIGHT,
      dataBottomLeft.measurestomodify,
      dataBottomRight.measurestomodify
    )
    
    const $CIRCLESBETWEENCORNERSLEFT = $$(`#container-canvas .container-SHAPES-insert .circles-custom-clip-path[data-sidename="left"]`);
    
    $CIRCLESBETWEENCORNERSLEFT.forEach($CIRCLE=>{
      let {indexofposition,sidenamebetweencorners,measurestomodify} = $CIRCLE.dataset;
      
      let numberCircle = sidenamebetweencorners.split("-")[1];
      
      const $CIRCLECONTRARY = $(`#container-canvas .container-SHAPES-insert .circles-custom-clip-path[data-sidenamebetweencorners="right-${numberCircle}"]`);
      
      
      changeAtributeCornersOpposites(
        $CIRCLE,
        $CIRCLECONTRARY,
        measurestomodify,
        $CIRCLECONTRARY.dataset.measurestomodify
      )
      
      $CIRCLE.setAttribute("data-indexofposition",$CIRCLECONTRARY.getAttribute("data-indexofposition"));
      
      $CIRCLECONTRARY.setAttribute("data-indexofposition",indexofposition);
    })
  }
}

function getPositionPointGradient (radian,xCenter,yCenter,sizeBefore,xMax,xMin,yMax,yMin) {
  sizeBefore += 0.1;
  
  let x = (Math.cos(radian) * sizeBefore) + xCenter,
  y = (Math.sin(radian) * sizeBefore) + yCenter;
  
  if (x >= xMax) {
    let rest = x - xMax;
    return {x,y};
  }
  else if (y >= yMax) {
    let rest = y - yMax;
    return {x,y}
  }
  else if (y <= yMin) {
    let rest = yMin - y;
    return {x,y}
  }
  else if (x <= xMin) {
    let rest = xMin - x;
    return {x,y};
  }
  else return getPositionPointGradient(radian,xCenter,yCenter,sizeBefore,xMax,xMin,yMax,yMin)
}

function drawShapeInCanvas () {
  const {idshape} = toolSelected.modalFigures.SHAPE;
  
  const $CONTAINERSHAPES = $aplication.querySelector("#container-canvas #container-SHAPES-INSERT"),
  $CONTAINERADJUSTSHAPES = $aplication.querySelector("#square-adjust-SHAPES");
  
  const $SVGCONTAINER = $CONTAINERSHAPES.querySelector("svg");
  
  const $SHAPEFILL = $SVGCONTAINER.querySelector(".shape-SVG.fill");
  
  let opacitySHAPES = $SHAPEFILL.style.getPropertyValue("opacity");
  
  let {originContainerShapes} = getTransformOriginContainerForRotate (idshape,toolSelected.lastLocationOriginContainerToUse ?? "center");
  
  const {left,top} = $CONTAINERSHAPES.getBoundingClientRect();
  
  setPropertyElement($CONTAINERSHAPES,"transform-origin",originContainerShapes);
  
  adjustContainerIfMoveToChangeTransformOrigin(left,top,$CONTAINERSHAPES);
  
  let leftContainerShapes = getPropertyValueElement("left",$CONTAINERSHAPES),
  topContainerShapes  = getPropertyValueElement("top",$CONTAINERSHAPES);
  
  let pxOriginForRotateShape;
  if (originContainerShapes !== "center") pxOriginForRotateShape = originContainerShapes.split(" ").map(px=>{
    return Number(px.substring(0,px.length - 2));
  });
  else {
    const widthContainerSHAPES = getPropertyValueElement("width",$CONTAINERSHAPES),
    heightContainerSHAPES = getPropertyValueElement("height",$CONTAINERSHAPES);
    
    pxOriginForRotateShape = [widthContainerSHAPES / 2,heightContainerSHAPES / 2];
  }
  
  const positionOriginTranslate = {
    x:leftContainerShapes + pxOriginForRotateShape[0],
    y:topContainerShapes + pxOriginForRotateShape[1]
  }
  
  const {type} = toolSelected.lastSuperpositionSelectedInModalFigures;
  
  ctx.globalAlpha = opacitySHAPES;
  ctx.globalCompositeOperation = type;
  
  let degRotate = idshape === "line" ? toolSelected.propsCirclesForMoveShapeLINE.lastDegRotate : toolSelected.propsContainerAdjustShapes.lastDegRotate;
  
  let degToRadian = (degRotate * Math.PI) / 180;
  
  const {flipVertical,flipHorizontal} = toolSelected;
  
  let shapeRotatedY = flipVertical.degRotate === 180,
  shapeRotatedX = flipHorizontal.degRotate === 180;
  
  const rotatePoint = (pointX,pointY,cx,cy,angleRotateGradient) => {
    const cos = Math.cos(angleRotateGradient),
    sin = Math.sin(angleRotateGradient);
    
    const x = pointX - cx,
    y = pointY - cy;
    
    const xRotate = x * cos - y * sin,
    yRotate = x * sin + y * cos;
    
    return {x:xRotate + cx,y:yRotate + cy}
  }
  
  const convertGradientSVGinGradientCanvas = ($GRADIENTSVG,leftShape,topShape,widthShape,heightShape) => {
    let typeGradient = $GRADIENTSVG.nodeName;
    
    let gradientForApplyCanvas;
    if (typeGradient === "linearGradient") {
      let x1InSVG = Number($GRADIENTSVG.getAttribute("x1")),
      y1InSVG = Number($GRADIENTSVG.getAttribute("y1")),
      x2InSVG = Number($GRADIENTSVG.getAttribute("x2")),
      y2InSVG = Number($GRADIENTSVG.getAttribute("y2"));
      
      let x1 = leftShape + (x1InSVG * widthShape),
      y1 = topShape + (y1InSVG * heightShape),
      x2 = leftShape + (x2InSVG * widthShape),
      y2 = topShape + (y2InSVG * heightShape);
      
      gradientForApplyCanvas = ctx.createLinearGradient(x1,y1,x2,y2);
    }
    else {
      let radioGradientPercentage = Number($GRADIENTSVG.getAttribute("r").split("%")[0]);
      
      let sizeRadioAsPxInWidth = (radioGradientPercentage * widthShape) / 100;
      
      let xCenterShape = leftShape + (widthShape / 2),
      yCenterShape = topShape + (heightShape / 2);
      
      gradientForApplyCanvas = ctx.createRadialGradient(xCenterShape,yCenterShape,0,xCenterShape,yCenterShape,sizeRadioAsPxInWidth);
    }
    
    Array.from($GRADIENTSVG.children).forEach($STOP=>{
      let offset = Number($STOP.getAttribute("offset").split("%")[0]),color = $STOP.getAttribute("stop-color");
      
      gradientForApplyCanvas.addColorStop(offset / 100,color);
    })
    
    return gradientForApplyCanvas;
  }
  
  const rotateCanvas180DegIfIsNecesary = (widthSVG,heightSVG) => {
    let pxToTranslateInY = 0,
    pxToTranslateInX = 0,
    scaleX = 1,
    scaleY = 1;
    
    if (flipVertical.degRotate === 180) {
      pxToTranslateInY = -heightSVG;
      scaleY = -1;
    }
    
    if (flipHorizontal.degRotate === 180) {
      pxToTranslateInX = -widthSVG;
      scaleX = -1;
    }
    
    ctx.scale(scaleX,scaleY);
    
    ctx.translate(
      pxToTranslateInX,
      pxToTranslateInY
    )
  }
  
  const setStyleStrokeAndFillOfShadowInCanvas = ($SHADOW) => {
    let colorFILL = $SHADOW.getAttribute("fill");
    let colorStroke = $SHADOW.getAttribute("stroke");
    
    ctx.fillStyle = colorFILL;
    ctx.strokeStyle = colorStroke;
  }
  
  const $SHAPESFILL = $SVGCONTAINER.querySelectorAll(".shape-SVG.fill"),
  $SHADOWS = $SVGCONTAINER.querySelectorAll(".shadow-SVG");
  
  const $GRADIENTFORFILL = $SVGCONTAINER.querySelector("#gradientFillIApplyShape");
  
  const $GRADIENTFORSTROKE = $SVGCONTAINER.querySelector("#gradientStrokeInApplyShape");
  
  const $SHAPESTROKE = $SVGCONTAINER.querySelector(".shape-SVG.stroke");
  
  let strokeShapes = Number($SHAPESTROKE.getAttribute("stroke-width")),
  fillShapeVisibility = $SHAPEFILL.getAttribute("fill");
  
  let blurShapeFill = $SHAPEFILL.style.getPropertyValue("filter"),
  blurShapeStroke = $SHAPESTROKE.style.getPropertyValue("filter"),
  blurShadow = $SHADOWS[0].style.getPropertyValue("filter");
  
  if (strokeShapes > 0) ctx.lineWidth = strokeShapes;
  
  ctx.save();
  ctx.translate(positionOriginTranslate.x,positionOriginTranslate.y);
  ctx.rotate(degToRadian);
  ctx.translate(-positionOriginTranslate.x,-positionOriginTranslate.y);
  ctx.translate(leftContainerShapes,topContainerShapes);
  
  let nodeNameShape = $SHAPESFILL[0].nodeName;
  
  if (idshape === "text") {
    const {widthSVG,widthStaticSVG,heightSVG,heightStaticSVG} = toolSelected.propsContainerAdjustShapes;
    
    let scaleX = widthSVG / widthStaticSVG,
    scaleY = heightSVG / heightStaticSVG;
    
    const fontSizeText = getPropertyValueElement("--fontSizeTexts",$SVGCONTAINER);
    
    const {valuesSettingShapeText} = toolSelected;
    
    let {fontFamily} = valuesSettingShapeText;
    
    let weight = "normal",
    nameFont;
    
    if (fontFamily.type === "font-face") nameFont = fontFamily.name;
    else {
      let [fontName,w] = fontFamily.name.split(" ");
      nameFont = fontName.split("-").join(" ");
      
      if (w) weight = w.split("-")[1];
      else if (fontName === "Kapakana") weight = 300;
    }
    
    ctx.textAlign = "start";
    ctx.textBaseline = "bottom";
    ctx.font = `${weight} ${fontSizeText}px "${nameFont}"`;
    
    scaleX = shapeRotatedX ? -scaleX : scaleX;
    scaleY = shapeRotatedY ? -scaleY : scaleY;
    
    ctx.scale(scaleX,scaleY);
    
    ctx.translate(
      scaleX < 0 ? -widthStaticSVG: 0,
      scaleY < 0 ? -heightStaticSVG : 0
    );
    
    let measuresToUseOfTextInCanvas = [];
    
    ctx.globalAlpha = 0;
    
    $SHAPESFILL.forEach(($SHAPE,index)=>{
      let text = $SHAPE.textContent;
      
      let {y,x,width} = $SHAPE.getBBox();
      
      ctx.fillText(text,0,0);
      
      let {
        actualBoundingBoxRight,
        ideographicBaseline,
        fontBoundingBoxAscent,
        fontBoundingBoxDescent} = ctx.measureText(text);
        
      let pxForWidthTextOfSVG = width - actualBoundingBoxRight;
        
      measuresToUseOfTextInCanvas.push({
        x:x + pxForWidthTextOfSVG,
        yFromBottom:y + fontBoundingBoxAscent
      })
    })
    
    clearCanvas();
    
    const {layers,index} = toolSelected.layer;
    
    putImageData(layers[index]);
    
    ctx.globalAlpha = opacitySHAPES;
    
    $SHAPESFILL.forEach(($SHAPE,index)=>{
      const $SHADOW = $SHADOWS[index];
      
      let textWrite = $SHAPE.textContent;
      
      let {height,width,y,x} = $SHAPE.getBBox();
      
      let measureText = measuresToUseOfTextInCanvas[index];
      
      if (!$SHADOW.classList.contains("visibility-hidden")) {
        setStyleStrokeAndFillOfShadowInCanvas($SHADOW);
        
        ctx.filter = blurShadow;
        
        let {xmovedshadow,ymovedshadow} = $SHAPE.dataset;
        
        [xmovedshadow,ymovedshadow] = [Number(xmovedshadow),Number(ymovedshadow)];
        
        let leftOriginalOutline = 0,
        topOriginalOutline = 0,
        leftOriginalShadow = xmovedshadow,
        topOriginalShadow = ymovedshadow;
        
        let {amountPxInTop,amountPxInLeft} = getPxToAddedOrSubtractInLeftAndTopShadowDependingDegRotate(degRotate,{leftOriginalOutline,leftOriginalShadow,topOriginalOutline,topOriginalShadow},flipHorizontal.degRotate,flipVertical.degRotate);
        
        let xShadowToApply = measureText.x + xmovedshadow + amountPxInLeft,
        yShadowToApply = measureText.yFromBottom + ymovedshadow + amountPxInTop;
        
        if (fillShapeVisibility !== "transparent") ctx.fillText(textWrite,xShadowToApply,yShadowToApply);
        
        if (strokeShapes > 0) ctx.strokeText(textWrite,xShadowToApply,yShadowToApply);
      }
      
      if (fillShapeVisibility !== "transparent") {
        ctx.filter = blurShapeFill;
        ctx.fillStyle = convertGradientSVGinGradientCanvas($GRADIENTFORFILL,x,y,width,height);
        ctx.fillText(textWrite,measureText.x,measureText.yFromBottom);
      }
      
      if (strokeShapes > 0) {
        ctx.filter = blurShapeStroke;
        ctx.strokeStyle = convertGradientSVGinGradientCanvas($GRADIENTFORSTROKE,x,y,width,height)
        ctx.strokeText(textWrite,measureText.x,measureText.yFromBottom);
      }
    })
  }
  else if (idshape === "line") {
    $SHAPESFILL.forEach(($SHAPE,index)=>{
      const $SHADOW = $SHADOWS[index];
      
      let xShape = Number($SHAPE.getAttribute("x")),
      yShape = Number($SHAPE.getAttribute("y")),
      widthShape = Number($SHAPE.getAttribute("width")),
      heightShape = Number($SHAPE.getAttribute("height"));
      
      let rBorderX = Number($SHAPE.getAttribute("rx")),rBorderY = Number($SHAPE.getAttribute("ry"));
      
      let measureRoundBorder = {
        x:rBorderX,
        y:rBorderY
      }
      
      if (!$SHADOW.classList.contains("visibility-hidden")) {
        setStyleStrokeAndFillOfShadowInCanvas($SHADOW);
        
        let xShadow = Number($SHADOW.getAttribute("x")),
        yShadow = Number($SHADOW.getAttribute("y"));
        
        ctx.filter = blurShadow;
        
        if (fillShapeVisibility !== "transparent") {
          ctx.beginPath();
          
          let xWithStroke = xShadow - (strokeShapes / 2),
          yWithStroke = yShadow - (strokeShapes / 2);
          
          ctx.roundRect(xWithStroke,yWithStroke,widthShape + strokeShapes,heightShape + strokeShapes,measureRoundBorder);
          
          ctx.fill()
        }
        
        if (strokeShapes > 0 && fillShapeVisibility === "transparent") {
          ctx.beginPath();
          
          ctx.roundRect(xShadow,yShadow,widthShape,heightShape,measureRoundBorder);
          
          ctx.stroke();
        }
      }
      
      ctx.beginPath();
      
      ctx.strokeStyle = convertGradientSVGinGradientCanvas($GRADIENTFORSTROKE,xShape,yShape,widthShape,heightShape);
      
      ctx.fillStyle = convertGradientSVGinGradientCanvas($GRADIENTFORFILL,xShape,yShape,widthShape,heightShape);
      
      if (fillShapeVisibility !== "transparent" || strokeShapes > 0) ctx.roundRect(xShape,yShape,widthShape,heightShape,measureRoundBorder);
      
      ctx.filter = blurShapeFill;
      
      if (fillShapeVisibility !== "transparent") ctx.fill();
      
      ctx.filter = blurShapeStroke;
      
      if (strokeShapes > 0) ctx.stroke();
    })
  }
  else if (idshape === "circle") {
    const $SHAPE = $SHAPESFILL[0];
    const $SHADOW = $SHADOWS[0];
    
    const {widthSVG,heightSVG} = toolSelected.propsContainerAdjustShapes;
    
    let cx = Number($SHAPE.getAttribute("cx")),
    cy = Number($SHAPE.getAttribute("cy")),
    r = Number($SHAPE.getAttribute("r"));
    
    rotateCanvas180DegIfIsNecesary(widthSVG,heightSVG);
    
    if (!$SHADOW.classList.contains("visibility-hidden")) {
      setStyleStrokeAndFillOfShadowInCanvas($SHADOW);
      
      ctx.filter = blurShadow;
      
      let cxShadow = Number($SHADOW.getAttribute("cx")),
      cyShadow = Number($SHADOW.getAttribute("cy"));
      
      if (fillShapeVisibility !== "transparent") {
        ctx.beginPath();
        
        ctx.arc(cxShadow,cyShadow,r + (strokeShapes / 2),0,Math.PI * 2)
      
        ctx.fill();
      }
      
      if (strokeShapes > 0 && fillShapeVisibility === "transparent") {
        ctx.beginPath();
        ctx.arc(cxShadow,cyShadow,r,0,Math.PI * 2);
        ctx.stroke();
      }
    }
    
    ctx.beginPath();
    
    if (fillShapeVisibility !== "transparent" || strokeShapes > 0) {
      let xShape = cx - r,
      yShape = cy - r,
      widthShape = r * 2,
      heightShape = widthShape;
      
      ctx.beginPath();
    
      ctx.fillStyle = convertGradientSVGinGradientCanvas($GRADIENTFORFILL,xShape,yShape,widthShape,heightShape);
      ctx.strokeStyle = convertGradientSVGinGradientCanvas($GRADIENTFORSTROKE,xShape,yShape,widthShape,heightShape);
    
      ctx.arc(cx,cy,r,0,Math.PI * 2);
    }
    
    ctx.filter = blurShapeFill;
    
    if (fillShapeVisibility !== "transparent") ctx.fill();
    
    ctx.filter = blurShapeStroke;
    
    if (strokeShapes > 0) ctx.stroke();
  }
  else if (nodeNameShape === "path") {
    const $SHADOW = $SHADOWS[0];
    const $SHAPE = $SHAPESFILL[0];
    
    const {widthSVG,heightSVG} = toolSelected.propsContainerAdjustShapes;
    
    let {x,y,width,height} = $SHAPE.getBBox();
    
    let dAtributeShape = $SHAPE.getAttribute("d");
    
    rotateCanvas180DegIfIsNecesary(widthSVG,heightSVG);
    
    let pathForShape = new Path2D(dAtributeShape);
    
    if (!$SHADOW.classList.contains("visibility-hidden")) {
      setStyleStrokeAndFillOfShadowInCanvas($SHADOW);
      
      ctx.filter = blurShadow;
      
      let dAtributeShadow = $SHADOW.getAttribute("d"),
      pathForShadow = new Path2D(dAtributeShadow);
      
      if (fillShapeVisibility !== "transparent") {
        ctx.beginPath();
        ctx.fill(pathForShadow);
      }
      
      if (strokeShapes > 0) {
        ctx.beginPath();
        ctx.stroke(pathForShadow);
      }
    }
    
    ctx.filter = blurShapeFill;
    
    if (fillShapeVisibility !== "transparent") {
      let gradientFILL = convertGradientSVGinGradientCanvas($GRADIENTFORFILL,x,y,width,height)
      
      ctx.beginPath();
      
      ctx.fillStyle = gradientFILL;
      
      ctx.fill(pathForShape);
    }
    
    ctx.filter = blurShapeStroke;
    
    if (strokeShapes > 0) {
      ctx.beginPath();
      
      ctx.strokeStyle = convertGradientSVGinGradientCanvas($GRADIENTFORSTROKE,x,y,width,height);
      
      ctx.stroke(pathForShape);
    }
  }
  else if (idshape === "ellipse" || idshape === "bubbleMessage") {
    const {widthSVG,heightSVG} = toolSelected.propsContainerAdjustShapes;
    
    rotateCanvas180DegIfIsNecesary(widthSVG,heightSVG);
    
    for (let index = $SHAPESFILL.length - 1;index >= 0;index--) {
      const $SHADOW = $SHADOWS[index];
      const $SHAPE = $SHAPESFILL[index];
      
      let cx = Number($SHAPE.getAttribute("cx")),
      cy = Number($SHAPE.getAttribute("cy")),
      rx = Number($SHAPE.getAttribute("rx")),
      ry = Number($SHAPE.getAttribute("ry"));
    
      if (!$SHADOW.classList.contains("visibility-hidden")) {
        setStyleStrokeAndFillOfShadowInCanvas($SHADOW);
        
        ctx.filter = blurShadow;
      
        let cxShadow = Number($SHADOW.getAttribute("cx")),
        cyShadow = Number($SHADOW.getAttribute("cy"));
        
        if (fillShapeVisibility !== "transparent") {
          ctx.beginPath();
          
          ctx.ellipse(cxShadow,cyShadow,rx + (strokeShapes / 2),ry + (strokeShapes / 2),0,Math.PI * 2,false);
      
          ctx.fill();
        }
      
        if (strokeShapes > 0 && fillShapeVisibility === "transparent") {
          ctx.beginPath();
          ctx.ellipse(cxShadow,cyShadow,rx,ry,0,Math.PI * 2,false);
          ctx.stroke();
        }
      }
      
      let xShape = cx - rx,
      yShape = cy - ry,
      widthShape = rx * 2,
      heightShape = ry * 2;
      
      if (fillShapeVisibility !== "transparent" || strokeShapes > 0) {
        ctx.beginPath();
        
        ctx.fillStyle = convertGradientSVGinGradientCanvas($GRADIENTFORFILL,xShape,yShape,widthShape,heightShape);
        
        ctx.strokeStyle = convertGradientSVGinGradientCanvas($GRADIENTFORSTROKE,xShape,yShape,widthShape,heightShape);
    
        ctx.ellipse(cx,cy,rx,ry,0,Math.PI * 2,false);
      }
      
      ctx.filter = blurShapeFill;
      
      if (fillShapeVisibility !== "transparent") ctx.fill();
      
      ctx.filter = blurShapeStroke;
      
      if (strokeShapes > 0) ctx.stroke();
    }
  }
  else if (nodeNameShape === "polygon") {
    const $SHAPE = $SHAPESFILL[0];
    const $SHADOW = $SHADOWS[0];
    
    const {x,y,width,height} = $SHAPE.getBBox();
    
    const getPointsLineOfShapeInCanvas = $shape => {
      return $shape.getAttribute("points").split(",").map(points=>{
        let [x,y] = points.split(" ").map(point=>{return Number(point)});
        return {x,y}
      });
    }
    
    const drawPointsLineInCanvas = points => {
      ctx.beginPath();
      points.forEach(({x,y})=>{
        ctx.lineTo(x,y);
      });
      ctx.closePath();
    }
    
    const {widthSVG,heightSVG} = toolSelected.propsContainerAdjustShapes;
    
    rotateCanvas180DegIfIsNecesary(widthSVG,heightSVG);
    
    if (!$SHADOW.classList.contains("visibility-hidden")) {
      setStyleStrokeAndFillOfShadowInCanvas($SHADOW);
      
      ctx.filter = blurShadow;
      
      if (fillShapeVisibility !== "transparent" || strokeShapes > 0) {
        let pointsShadow = getPointsLineOfShapeInCanvas($SHADOW);
      
        drawPointsLineInCanvas(pointsShadow);
      }
      
      if (fillShapeVisibility !== "transparent") ctx.fill();
      
      if (strokeShapes > 0) ctx.stroke();
    }
    
    if (fillShapeVisibility !== "transparent" || strokeShapes > 0) {
      let pointsShapes = getPointsLineOfShapeInCanvas($SHAPE);
    
      ctx.strokeStyle = convertGradientSVGinGradientCanvas($GRADIENTFORSTROKE,x,y,width,height);
      
      ctx.fillStyle = convertGradientSVGinGradientCanvas($GRADIENTFORFILL,x,y,width,height);
    
      drawPointsLineInCanvas(pointsShapes);
    }
    
    ctx.filter = blurShapeFill;
    
    if (fillShapeVisibility !== "transparent") ctx.fill();
    
    ctx.filter = blurShapeStroke;
    
    if (strokeShapes > 0) ctx.stroke();
  }
  
  ctx.restore();
}

function flipSHAPE (direction) {
  const $CONTAINERSHAPES = $aplication.children["container-canvas"].children["container-SHAPES-INSERT"]
  ,$SHAPESFILL = $CONTAINERSHAPES.querySelectorAll(".shape-SVG.fill"),
  $SHAPESSTROKE = $CONTAINERSHAPES.querySelectorAll(".shape-SVG.stroke"),
  $SHADOWS = $CONTAINERSHAPES.querySelectorAll(".shadow-SVG"),
  {idshape} = toolSelected.modalFigures.SHAPE,
  {propsContainerAdjustShapes,flipVertical,flipHorizontal} = toolSelected,
  {widthSVG,heightSVG} = propsContainerAdjustShapes;
  
  let newDegRotateShapeHorizontal = flipHorizontal.degRotate,
  newDegRotateShapeVertical = flipVertical.degRotate;
  
  if (direction === "horizontal") newDegRotateShapeHorizontal = flipHorizontal.degRotate === 0 ? 180 : 0;
  else if (direction === "vertical") newDegRotateShapeVertical = flipVertical.degRotate === 0 ? 180 : 0;
  
  flipHorizontal.degRotate = newDegRotateShapeHorizontal;
  flipVertical.degRotate = newDegRotateShapeVertical;
  
  let widthIndicate = widthSVG,
  heightIndicate = heightSVG;
  
  if (idshape === "text") {
    const {widthStaticSVG,heightStaticSVG} = toolSelected.propsContainerAdjustShapes;
    
    widthIndicate = widthStaticSVG;
    heightIndicate = heightStaticSVG;
  }
  
  $SHAPESFILL.forEach(($SHAPE,i)=>{
    const $SHADOW = $SHADOWS[i];
    const $SHAPESTROKE = $SHAPESSTROKE[i];
    
    let originCenter = `${widthIndicate / 2}px ${heightIndicate / 2}px`;
    
    setPropertyElement($SHAPE,"transform-origin",originCenter);
    setPropertyElement($SHAPESTROKE,"transform-origin",originCenter);
    setPropertyElement($SHADOW,"transform-origin",originCenter);
    
    setPropertyElement($SHAPE,"transform",`rotatex(${newDegRotateShapeVertical}deg) rotatey(${newDegRotateShapeHorizontal}deg)`);
    setPropertyElement($SHAPESTROKE,"transform",`rotatex(${newDegRotateShapeVertical}deg) rotatey(${newDegRotateShapeHorizontal}deg)`);
    setPropertyElement($SHADOW,"transform",`rotatex(${newDegRotateShapeVertical}deg) rotatey(${newDegRotateShapeHorizontal}deg)`);
  });
  
  if (idshape !== "text" && idshape !== "custom-clip-path") {
    const {atributeToModify,valuesPathShape} = getMeasuresOfShapeInSVGContainer(idshape,widthSVG,heightSVG);
  
    setAtributesShapeSelected($SHAPESFILL,$SHAPESSTROKE,$SHADOWS,atributeToModify);
  
    propsContainerAdjustShapes.valuesPathShape = valuesPathShape;
  }
  else if (idshape === "custom-clip-path") {
    let {valuesPathShape} = toolSelected.variablesShapeClipPathTemporal;
    
    let newValuesPath = movePointsOfPathInSVG(0,0,valuesPathShape);
    
    $SHAPESFILL[0].setAttribute("d",newValuesPath);
    $SHAPESSTROKE[0].setAttribute("d",newValuesPath);
  }
  
  updatePositionShadowInSVG();
}

function activateOrDesactivateValueInOptionsAdjustShape (property) {
  touchAPLICATION({target:{classList:{contains:()=>{return true}}}});
  
  if (property.startsWith("flip")) {
    let {actived} = toolSelected[property];
    toolSelected[property].actived = actived ? false : true;
    return;
  }
  
  let currentStatus = toolSelected[property];
  
  toolSelected[property] = currentStatus ? false : true;
}

function getMeasuresCirclesForResizeShape () {
  const $CIRCLELEFT = $aplication.children["circle-left"],
  $CIRCLERIGHT = $aplication.children["circle-right"],
  measuresCircleLeft = $CIRCLELEFT.getBoundingClientRect(),
  measuresCircleRight = $CIRCLERIGHT.getBoundingClientRect();
  
  return {measuresCircleRight,measuresCircleLeft}
}

function clickButtonInModifyDegShape ({target}) {
  const BUTTON = target.id,
  $INPUTRANGE = $(".container-modify-deg-shape .footer input"),
  path = `.container-modify-deg-shape .footer .buttons`;
    
  let name = `${path} #name-button-angle`
  ,add = `${path} #add-deg-step-int`,
  subtract = `${path} #subtract-deg-step-int`;
  
  if (BUTTON === "name-button-angle" || BUTTON === "add-deg-step-int" || BUTTON === "subtract-deg-step-int") {
    clearTimeout(toolSelected.idtimeoutbuttons);
    
    toolSelected.idtimeoutbuttons = setTimeout(()=>{
      showOrHideButtons(name,subtract,add);
    },2000)
  }
  
  let buttonsModifyDegrees = BUTTON.startsWith("add") || BUTTON.startsWith("subtract");
  
  if (buttonsModifyDegrees) {
    
    let valueAsNumberRange = $INPUTRANGE.valueAsNumber;
    
    let step;
    if (BUTTON.endsWith("decimal")) step = 0.1;
    else {
      valueAsNumberRange = Math.round(valueAsNumberRange);
      step = 1;
    }
    
    $INPUTRANGE.setAttribute("step",`${step}`);
    
    $INPUTRANGE.value = BUTTON.startsWith("add") ? valueAsNumberRange + step : valueAsNumberRange - step;
    
    updateDegRotateShape($INPUTRANGE,"applyRotateShape");
  }
  else if (BUTTON === "name-button-angle") showOrHideButtons(name,add,subtract);
}

function touchesInputRangeDegShape (e) {
  const {type,target,changedTouches,touches} = e,
  $INPUT = target;
  
  let clientX;
  if (type === "touchstart") {
    e.preventDefault();
    
    const {left,right} = $INPUT.getBoundingClientRect();
    
    $INPUT.setAttribute("data-left",left)
    $INPUT.setAttribute("data-right",right);
    
    $INPUT.setAttribute("step","1");
    return;
  }
  else if (type === "touchmove") clientX = touches[0].clientX;
  else if (type === "touchend") clientX = changedTouches[0].clientX;
  
  let {left,right} = $INPUT.dataset;
  
  [left,right] = [Number(left),Number(right)];
  
  let widthAdjust = (right - 0)  - (left + 0),
  xTouch = clientX - (left + 0),
  porcentage = (xTouch * 100) / widthAdjust
  ,value = (porcentage * Number($INPUT.max)) / 100;
  
  $INPUT.value = value;
  
  updateDegRotateShape($INPUT,"applyRotateShape");
}

function updateDegRotateShape ($INPUT,MOVEDEG) {
  const $CONTAINERTXTSDEGS = $INPUT.parentElement.previousElementSibling.firstElementChild,
  $TEXTDEGORIGINAL = $CONTAINERTXTSDEGS.children["deg-original"],
  $TEXTDEGCONTRARY = $CONTAINERTXTSDEGS.children["deg-contrary"],
  valueDegAsNumber = $INPUT.valueAsNumber
  
  $TEXTDEGORIGINAL.innerText = `${valueDegAsNumber.toFixed(1)}°`;
  $TEXTDEGCONTRARY.innerText = `-${(360 - valueDegAsNumber).toFixed(1)}°`;
  
  if (MOVEDEG) rotateShapeAt(valueDegAsNumber);
}

function rotateShapeArrowOrLineFromCenter ($CONTAINERADJUSTSHAPES,$CONTAINERSHAPES,degRotate) {
  const {measuresCircleLeft,measuresCircleRight} = getMeasuresCirclesForResizeShape();
  
  const {halfDistanceOfCircles,axisCenterShape} = toolSelected.propsContainerAdjustShapes,
  circleFILL = Math.PI * 2;
  
  let angleContrary = degRotate - 180;
  angleContrary = angleContrary < 0 ? 360 + angleContrary : angleContrary;
  
  let angleContraryToRadian = (angleContrary * Math.PI) / 180,
  degToRadian = (degRotate * Math.PI) / 180
  
  let xMovedCircleRight = (Math.cos(degToRadian) * halfDistanceOfCircles) + axisCenterShape.x,
  yMovedCircleRight = (Math.sin(degToRadian) * halfDistanceOfCircles) + axisCenterShape.y,
  xMovedCircleLeft = (Math.cos(angleContraryToRadian) * halfDistanceOfCircles) + axisCenterShape.x
  ,yMovedCircleLeft = (Math.sin(angleContraryToRadian) * halfDistanceOfCircles) + axisCenterShape.y;
  
  let xDiferenceCircleRight = xMovedCircleRight - measuresCircleRight.x
  ,yDiferenceCircleRight = yMovedCircleRight - measuresCircleRight.y,
  xDiferenceCircleLeft = xMovedCircleLeft - measuresCircleLeft.x,
  yDiferenceCircleLeft = yMovedCircleLeft - measuresCircleLeft.y;
  
  const $CIRCLERIGHT = $aplication.children["circle-right"],
  $CIRCLELEFT = $aplication.children["circle-left"];
  
  [$CIRCLELEFT,$CIRCLERIGHT].forEach($CIRCLE=>{
    const leftCurrentCircle = getPropertyValueElement("left",$CIRCLE),
    topCurrentCircle = getPropertyValueElement("top",$CIRCLE);
    
    let diferenceX,diferenceY;
    if ($CIRCLE.id === "circle-left") {
      diferenceX = xDiferenceCircleLeft;
      diferenceY = yDiferenceCircleLeft;
    } else {
      diferenceX = xDiferenceCircleRight;
      diferenceY = yDiferenceCircleRight;
    }
    
    setPropertyElement($CIRCLE,"left",`${leftCurrentCircle + diferenceX}px`);
    setPropertyElement($CIRCLE,"top",`${topCurrentCircle + diferenceY}px`);
  })
  
  setPropertyElement($CONTAINERADJUSTSHAPES,"transform",`rotate(${degRotate}deg)`);
  setPropertyElement($CONTAINERSHAPES,"transform",`rotate(${degRotate}deg)`)
}

function updatePositionShadowInSVG () {
  const $CONTAINERSHAPES = $aplication.children["container-canvas"].children["container-SHAPES-INSERT"];
  
  const $SHAPES = $CONTAINERSHAPES.querySelectorAll("svg .shape-SVG.fill"),$SHADOWS = $CONTAINERSHAPES.querySelectorAll("svg .shadow-SVG");
  
  const {idshape} = toolSelected.modalFigures.SHAPE;
  
  const {flipHorizontal,flipVertical} = toolSelected;
  
  let {xmovedshadow,ymovedshadow} = $SHAPES[0].dataset;
  
  let {lastDegRotate} = idshape === "line" ? toolSelected.propsCirclesForMoveShapeLINE : toolSelected.propsContainerAdjustShapes
  
  ;[xmovedshadow,ymovedshadow] = [Number(xmovedshadow),Number(ymovedshadow)];
  
  let leftOriginalOutline = 0,
  topOriginalOutline = 0,
  leftOriginalShadow = xmovedshadow,
  topOriginalShadow = ymovedshadow;
  
  let {amountPxInTop,amountPxInLeft} = getPxToAddedOrSubtractInLeftAndTopShadowDependingDegRotate(lastDegRotate,{leftOriginalOutline,leftOriginalShadow,topOriginalOutline,topOriginalShadow},flipHorizontal.degRotate,flipVertical.degRotate);
  
  if (idshape === "bubbleMessage") $SHAPES.forEach(($SHAPE,index)=>{
    const $SHADOW = $SHADOWS[index];
    let xOfReference = Number($SHAPE.getAttribute("cx")),
    yOfReference = Number($SHAPE.getAttribute("cy"));
    
    $SHADOW.setAttribute("cx",xOfReference + xmovedshadow + amountPxInLeft);
    $SHADOW.setAttribute("cy",yOfReference + ymovedshadow + amountPxInTop);
  })
  else if (idshape === "text") $SHAPES.forEach(($SHAPE,index)=>{
    const $SHADOW = $SHADOWS[index];
    
    let xOfReference = Number($SHAPE.getAttribute("dx")),
    yOfReference = Number($SHAPE.getAttribute("dy"));
    
    $SHADOW.setAttribute("dx",xOfReference + xmovedshadow + amountPxInLeft);
    $SHADOW.setAttribute("dy",yOfReference + ymovedshadow + amountPxInTop);
  })
  else if (idshape === "line") $SHAPES.forEach(($SHAPE,index)=>{
    const $SHADOW = $SHADOWS[index];
    
    let xShape = Number($SHAPE.getAttribute("x")),
    yShape = Number($SHAPE.getAttribute("y"));
    
    let newXShadow = xShape + xmovedshadow + amountPxInLeft,
    newYShadow = yShape + ymovedshadow + amountPxInTop;
    
    $SHADOW.setAttribute("x",newXShadow);
    $SHADOW.setAttribute("y",newYShadow);
  })
  else {
    const {valuesPathShape} = toolSelected.variablesShapeClipPathTemporal ?? toolSelected.propsContainerAdjustShapes;
    
    let positionChangeShadow = getPositionShadowSVG(idshape,$SHAPES[0],xmovedshadow + amountPxInLeft,ymovedshadow + amountPxInTop,valuesPathShape);
    
    positionChangeShadow.forEach(({atribute,value})=>{
      $SHADOWS[0].setAttribute(atribute,value);
    })
  }
}

function rotateShapeAt (degRotate) {
  const {idshape} = toolSelected.modalFigures.SHAPE;
  
  const $CONTAINERADJUSTSHAPES = $aplication.children["square-adjust-SHAPES"],
  $CONTAINERSHAPES = $aplication.children["container-canvas"].children["container-SHAPES-INSERT"];
  
  if (idshape === "line" || idshape === "arrowIndicator") {
    let propsIndicate = idshape === "line" ? toolSelected.propsCirclesForMoveShapeLINE : toolSelected.propsContainerAdjustShapes;
    
    propsIndicate.lastDegRotate = degRotate
    
    rotateShapeArrowOrLineFromCenter($CONTAINERADJUSTSHAPES,$CONTAINERSHAPES,degRotate);
    
    updatePositionShadowInSVG();
    
    return;
  }
  
  setPropertyElement($CONTAINERADJUSTSHAPES,"transform",`rotate(${degRotate}deg)`)
  setPropertyElement($CONTAINERSHAPES,"transform",`rotate(${degRotate}deg)`)
  
  toolSelected.propsContainerAdjustShapes.lastDegRotate = degRotate;
  
  updatePositionShadowInSVG();
}

function pushColorsAndPercentageGradient (VALUESGRADIENT,top,bottom,start,end,colorTop,colorBottom) {
  const color = top ? colorTop : colorBottom;
  
  VALUESGRADIENT.push({
  color,
  percetageStart:start
  })
    
  if (end >= 0) VALUESGRADIENT.push({
    color,
    percetageStart:end
  })
}

function createGradient (modeGradient,deg,colorTop,colorBottom,VALUES,OPTION,placeCall) {
  let gradient;
  const {idshape} = toolSelected.modalFigures.SHAPE;
  
  let sizeRadio;
  
  if (modeGradient === "linear") {
    gradient = `linear-gradient(${typeof(deg) !== "number" ? deg : deg + "deg"},`;
  }
  else {
    sizeRadio = 50 - (((deg * 100 / 359) * 25) / 100);
    gradient = `radial-gradient(ellipse ${sizeRadio}% ${sizeRadio}%,`;
  }
  
  if (modeGradient === "ellipse") {
    let lastIndex = VALUES.length - 1;
    for (let i=lastIndex;i >= 0;i--) {
      const {top,bottom} = VALUES[i],
      {start,end} = VALUES[lastIndex - i];
      gradient += `${top ? colorTop : colorBottom} ${start}%`
    
      if (end !== undefined) gradient += ` ${end}%`;
      
      if (i === 0) gradient += ')';
      else gradient += ',';
    }
    return gradient;
  }
  
  VALUES.forEach((value,i)=>{
    const {top,bottom,start,end} = value
    ;gradient += `${top ? colorTop : colorBottom} ${start}%`;
    
    if (end !== undefined) gradient += ` ${end}%`;
      
    if (i === VALUES.length - 1) gradient += ')';
    else gradient += ',';
  });
  
  return gradient;
}

function touchesButtonOrderGradients (e) {
  let $parentButton,
  $buttonPULL;
  
  if (e.target.id === "handle-order-gradient") {
    $parentButton = e.target.parentElement;
    $buttonPULL = e.target;
  } else {
    $parentButton = e.target.parentElement.parentElement;
    $buttonPULL = e.target.parentElement;
  }
  
  const {FAVORITES} = toolSelected.modalFigures.MODALADJUSTGRADIENT;
  
  if (e.type === "touchstart") {
    const HTMLINDICATOR = `<span class="indicator-selected"></span>`;
    let {clientX,clientY} = e.touches[0],
    height = getPropertyValueElement("height",$parentButton),
    width = getPropertyValueElement("width",$parentButton);
    
    $parentButton.insertAdjacentHTML("beforeend",HTMLINDICATOR);
    $parentButton.classList.remove("transition-left-top");
    
    setPropertyElement($parentButton,"z-index",FAVORITES.length + 1);
    setPropertyElement($parentButton.firstElementChild,"z-index","2");
    
    $parentButton.setAttribute("data-height",height);
    $parentButton.setAttribute("data-width",width);
    
    $buttonPULL.setAttribute("data-lastclientposition",JSON.stringify({clientX,clientY}));
  }
  else if (e.type === "touchmove") {
    let lastClientPosition = JSON.parse($buttonPULL.dataset.lastclientposition)
    ,{clientX,clientY} = e.touches[0],
    diferenceX = clientX - lastClientPosition.clientX,
    diferenceY = clientY - lastClientPosition.clientY,
    newTop = getPropertyValueElement("top",$parentButton) + diferenceY
    ,newLeft = getPropertyValueElement("left",$parentButton) + diferenceX;
    
    setPropertyElement($parentButton,"left",newLeft + "px");
    setPropertyElement($parentButton,"top",newTop + "px");
    
    $buttonPULL.setAttribute("data-lastclientposition",JSON.stringify({clientX,clientY}));
    
    if (FAVORITES.length > 0) findNewPositionContainer($parentButton,newLeft,newTop);
  }
  else if (e.type === "touchend") {
    let index = Number($parentButton.dataset.index),
    {top,left} = toolSelected.modalFigures.MODALADJUSTGRADIENT.POSITIONSFAVORITES[index],
    indexRow;
    
    if ((index + 1) % 5 === 0) indexRow = ((index + 1) / 5) - 1;
    else indexRow = Math.floor((index + 1) / 5);
    
    top += (52 * indexRow);
    
    $parentButton.classList.add("transition-left-top");
    
    setPropertyElement($parentButton,"left",left + "px");
    setPropertyElement($parentButton,"top",top + "px");
    
    setTimeout(()=>{
      setPropertyElement($parentButton,"z-index","1");
      $parentButton.querySelector(".indicator-selected")?.remove();
    },200);
    
  }
}

function moveContainersGradientInOrderFAVORITESGRADIENT (i,directionMove) {
  const $gradient = $(`.figures-modal .modal-adjust-gradient-black-white .modal-order-gradient-favorite .container-gradients .container-parent-gradient[data-index='${i}']`),
  {POSITIONSFAVORITES} = toolSelected.modalFigures.MODALADJUSTGRADIENT;
  let indexPos = directionMove === "right" ? i + 1 : i - 1,
  {left,top} = POSITIONSFAVORITES[indexPos],
  indexRow;
  
  if ((indexPos + 1) % 5 === 0) indexRow = ((indexPos + 1) / 5) - 1;
  else indexRow = Math.floor((indexPos + 1) / 5);
  
  top += (52 * indexRow);
  
  if ((indexPos > 0 && indexPos % 5 === 0 && i < indexPos) || ((indexPos + 1) % 5 === 0 && i > indexPos)) { 
    setPropertyElement($gradient,"z-index",indexPos);
    setTimeout(()=>{
      setPropertyElement($gradient,"z-index","1");
    },200);
  }
  
  $gradient.classList.add("transition-left-top");
  $gradient.setAttribute("data-index",indexPos);
  
  setTimeout(()=>{
    setPropertyElement($gradient,"left",left + "px");
    setPropertyElement($gradient,"top",top + "px");
  },0);
}

function findNewPositionContainer ($containerCurrent,leftContainerCurrent,topContainerCurrent) {
  const indexContainerCurrent = Number($containerCurrent.dataset.index),
  allContainersOfGradient = $$(`.figures-modal .modal-adjust-gradient-black-white .modal-order-gradient-favorite .container-gradients .container-parent-gradient`);
  
  let {width,height} = $containerCurrent.dataset,
  {top,left} = toolSelected.modalFigures.MODALADJUSTGRADIENT.POSITIONSFAVORITES[indexContainerCurrent],
  containerGradientCollapse = {diferenceY:0,diferenceX:0},
  indexRow;
  
  if ((indexContainerCurrent + 1) % 5 === 0) indexRow = ((indexContainerCurrent + 1) / 5) - 1;
  else indexRow = Math.floor((indexContainerCurrent + 1) / 5);
  
  top += (52 * indexRow);
  
  [width,height] = [Number(width),Number(height)];
  
  if ((leftContainerCurrent + width) < left || leftContainerCurrent > (left + width) || (topContainerCurrent + height) < top || topContainerCurrent > (top + height)) {
    for (let i = 0;i < allContainersOfGradient.length;i++) {
      const $gradientContainer = $(`.figures-modal .modal-adjust-gradient-black-white .modal-order-gradient-favorite .container-gradients .container-parent-gradient[data-index = '${i}'`),
      topContainer = getPropertyValueElement("top",$gradientContainer),
      leftContainer = getPropertyValueElement("left",$gradientContainer),
      enterInRight = leftContainerCurrent <= (leftContainer + width) && leftContainerCurrent >= leftContainer,
      enterInLeft = (leftContainerCurrent + width) >= leftContainer && leftContainerCurrent <= leftContainer ,
      collapseX = (leftContainerCurrent + width) >= leftContainer && leftContainerCurrent <= (leftContainer + width),
      enterInTop = (topContainerCurrent + height) >= topContainer && topContainerCurrent <= topContainer,
      enterInBottom = topContainerCurrent >= topContainer && topContainerCurrent <= (topContainer + height);
      
      let diferenceYBottom = (topContainer + height) - topContainerCurrent,
      diferenceYTop  = (topContainerCurrent + height) - topContainer,
      diferenceXLeft = (leftContainerCurrent + width) - leftContainer,
      diferenceXRight = (leftContainer + width) - leftContainerCurrent;
      
      if (i !== indexContainerCurrent && enterInBottom && diferenceYBottom >= containerGradientCollapse.diferenceY && enterInRight && diferenceXRight >= containerGradientCollapse.diferenceX) {
        containerGradientCollapse = {index:i,diferenceY:diferenceYBottom,diferenceX:diferenceXRight};
      } 
      else if (i !== indexContainerCurrent && enterInBottom && diferenceYBottom >= containerGradientCollapse.diferenceY && enterInLeft && diferenceXLeft >= containerGradientCollapse.diferenceX) {
        containerGradientCollapse = {index:i,diferenceY:diferenceYBottom,diferenceX:diferenceXLeft};
      }
      else if (i !== indexContainerCurrent && enterInTop && diferenceYTop >= containerGradientCollapse.diferenceY && enterInRight && diferenceXRight >= containerGradientCollapse.diferenceX) {
        containerGradientCollapse = {index:i,diferenceY:diferenceYTop,diferenceX:diferenceXRight};
      }
       else if (i !== indexContainerCurrent && enterInTop && diferenceYTop >= containerGradientCollapse.diferenceY && enterInLeft && diferenceXLeft >= containerGradientCollapse.diferenceX) {
        containerGradientCollapse = {index:i,diferenceY:diferenceYTop,diferenceX:diferenceXLeft};
      }
    }
    
    let {index,diferenceY} = containerGradientCollapse;
    
    if (index !== undefined) {
      let moveToDirection,
      indexCurrent;
        
      if (indexContainerCurrent > index) {
        moveToDirection = "right";
        indexCurrent = indexContainerCurrent - 1;
      } else {
        moveToDirection = "left";
        indexCurrent = indexContainerCurrent + 1;
      }
        
      for (;;) {
        moveContainersGradientInOrderFAVORITESGRADIENT(indexCurrent,moveToDirection);
          
        if (moveToDirection === "right") {
          indexCurrent -= 1;
          if (indexCurrent < index) break;
        } else if (moveToDirection === "left") {
          indexCurrent += 1;
          if (indexCurrent > index) break;
          }
        }
      $containerCurrent.setAttribute("data-index",index);
    }
  }
}

function addGradientInContainerFAVORITES (gradientCurrent) {
  const {FAVORITES,POSITIONSFAVORITES} = toolSelected.modalFigures.MODALADJUSTGRADIENT;
  if (!FAVORITES.some(array=>array.some(prop=>prop.gradient === gradientCurrent)) && FAVORITES.length < 25) {
    const {gradientFAVORITE} = toolSelected.htmlChildren.modalFiguresOptionsHTML,
    $containerCenter = $(".figures-modal .modal-adjust-gradient-black-white main .center-container-favorites"),
    $previewGradientSelected = $containerCenter.previousElementSibling.firstElementChild;
      
    for (let i=FAVORITES.length-1;i>=0;i--) {
      moveGradientsFAVORITESWithTransition(i);
    }
    
    const {OPTION} = toolSelected.modalFigures,
    {colorsGradient} = toolSelected.modalFigures[OPTION];
      
    ;FAVORITES.unshift([...structuredClone(colorsGradient),{gradient:gradientCurrent}]);
      
    $containerCenter.insertAdjacentHTML("beforeend",gradientFAVORITE);
    const $gradientInFavorite = $containerCenter.lastElementChild,
    {top,left} = POSITIONSFAVORITES[0];
      
    $gradientInFavorite.setAttribute("data-index",0);
      
    setPropertyElement($gradientInFavorite,"opacity","0");
    setPropertyElement($gradientInFavorite,"background-image",gradientCurrent);
    setPropertyElement($gradientInFavorite,"top",top + "px");
    setPropertyElement($gradientInFavorite,"left",left + "px");
      
    $gradientInFavorite.classList.add("transition-opacity");
    setTimeout(()=>{
    setPropertyElement($gradientInFavorite,"opacity","1");
    },0);
    
    setTimeout(()=>{
      $gradientInFavorite.classList.remove("transition-opacity");
    },290);
  }
}

function moveGradientsFAVORITESWithTransition (i) {
  const $gradient = $(`.figures-modal .modal-adjust-gradient-black-white main .center-container-favorites .gradient-favorite[data-index='${i}'`),
  {POSITIONSFAVORITES} = toolSelected.modalFigures.MODALADJUSTGRADIENT;

  let indexNext = i + 1,
  {left,top} = POSITIONSFAVORITES[indexNext];
  
  if (indexNext > 0 && indexNext % 5 === 0 && i < indexNext) {
    setPropertyElement($gradient,"z-index",indexNext);
    setTimeout(()=>{
      setPropertyElement($gradient,"z-index","1");
    },200);
  }
  
  $gradient.classList.add("transition-left-top");
  $gradient.setAttribute("data-index",indexNext);
  
  setTimeout(()=>{
    setPropertyElement($gradient,"left",left + "px");
    setPropertyElement($gradient,"top",top + "px");
  },0);
}

function showToolsGRADIENT () {
  const {modalFiguresOptionsHTML} = toolSelected.htmlChildren,
  {indicator} = modalFiguresOptionsHTML,
  {GRADIENT} = modalFiguresOptionsHTML,
  {OPTION} = toolSelected.modalFigures;
  
  const $main = $(".figures-modal .modal-adjust-gradient-black-white main");
  
  const {colorsGradient} = toolSelected.modalFigures[OPTION];
  
  $main.innerHTML = GRADIENT;
    
  const $previewGradient = $(".figures-modal > div .modal-adjust-gradient-black-white main .children-center .preview-gradient"),
  {x,width} = $previewGradient.getBoundingClientRect(),
  $childrenCenter = $(".figures-modal .modal-adjust-gradient-black-white main .children-center"),
  {left} = $childrenCenter.getBoundingClientRect();
    
  let leftStartPreviewGradient = x - left
  ;colorsGradient.forEach((colorGradient,i)=>{
    $childrenCenter.insertAdjacentHTML("beforeend",indicator);
    
    const $lastIndicator = $childrenCenter.lastElementChild,
    $circlePull = $lastIndicator.lastElementChild,
    $line = $lastIndicator.firstElementChild;
      
    $circlePull.setAttribute("data-index",i);
      
    $circlePull.ontouchstart = touchesCircleAdjustGradient;
    $circlePull.ontouchmove = touchesCircleAdjustGradient;
    $circlePull.ontouchend = touchesCircleAdjustGradient;
      
    $circlePull.setAttribute("data-leftpreviewgradient",leftStartPreviewGradient);
    $circlePull.setAttribute("data-widthpreviewgradient",width - 1);
    $circlePull.setAttribute("data-xchildrencenter",left);
      
    let leftIndicator = (leftStartPreviewGradient + ((colorGradient.porcentage * (width - 1)) / 100));
      
    setPropertyElement($lastIndicator,"left",leftIndicator + "px");
  })
    
  let gradient = joinColorsGradient([...colorsGradient],"to right");
  setPropertyElement($previewGradient,"background-image",gradient);
}

function showToolsFAVORITES () {
  const {FAVORITES,gradientFAVORITE} = toolSelected.htmlChildren.modalFiguresOptionsHTML,
  allGradientsFavorites = toolSelected.modalFigures["MODALADJUSTGRADIENT"].FAVORITES;
  
  const $main = $(".figures-modal .modal-adjust-gradient-black-white main"),
  $previewGradient = $main.querySelector(".children-center .preview-gradient");
  
  let gradientCurrent;
  if ($previewGradient) gradientCurrent =  getComputedStyle($previewGradient).getPropertyValue("background-image");
  else {
    const {OPTION} = toolSelected.modalFigures,
    {colorsGradientCurrent} = toolSelected.modalFigures[OPTION];
    
    gradientCurrent = joinColorsGradient([...colorsGradientCurrent],"to right",null,true);
  }
  
  $main.innerHTML = FAVORITES;
  
  const $indicatorsPosition = $$(".figures-modal .modal-adjust-gradient-black-white main .center-container-favorites .indicator-position"),
  $centerContainer = $(".figures-modal .modal-adjust-gradient-black-white main .center-container-favorites"),
  $currentGradient = $main.querySelector(".top-container-favorites .current-gradient"),
  {left,top} = $centerContainer.getBoundingClientRect();
  
  setPropertyElement($currentGradient,"background-image",gradientCurrent);
  
  let POSITIONS = [],
  diferenceY;
  for (let i=0;i < 25;i++) {
    let pos = {};
    if (i >= 0 && i <= 4) {
      const {x,y} = $indicatorsPosition[i].getBoundingClientRect();
      let positionLeft = x - left,
      positionTop = y - top;
      pos = {top:positionTop,left:positionLeft};
    }
    else if (i === 5) {
      const {y} = $indicatorsPosition[i].getBoundingClientRect(),
      positionTop = y - top;
      diferenceY = positionTop - POSITIONS[0].top;
      pos = {top:positionTop,left:POSITIONS[0].left};
    }
    else if (i >= 6 && i <= 9) {
      pos = {top:POSITIONS[5].top,left:POSITIONS[i - 5].left};
    }
    else if (i >= 10 && i <= 14) {
      pos = {top:POSITIONS[9].top + diferenceY,left:POSITIONS[i - 10].left};
    }
    else if (i >= 15 && i <= 19) {
      pos = {top:POSITIONS[14].top + diferenceY,left:POSITIONS[i - 15].left};
    }
    else if (i >= 20 && i <= 24) {
      pos = {top:POSITIONS[19].top + diferenceY,left:POSITIONS[i - 20].left};
    }
    const arrayColors = allGradientsFavorites[i];
    if (arrayColors) {
      $centerContainer.insertAdjacentHTML("beforeend",gradientFAVORITE);
      const $oneGradientFavorite = $centerContainer.lastElementChild;
      
      setPropertyElement($oneGradientFavorite,"top",pos.top + "px");
      setPropertyElement($oneGradientFavorite,"left",pos.left + "px");
      setPropertyElement($oneGradientFavorite,"background-image",arrayColors.at(-1).gradient);
      
      $oneGradientFavorite.setAttribute("data-index",i);
    }
    POSITIONS.push(pos);
  }
  
  toolSelected.modalFigures.MODALADJUSTGRADIENT.POSITIONSFAVORITES = [...POSITIONS];
}

function showModeSelectedInModalAdjustGradient () {
  const {MODESELECTED} = toolSelected.modalFigures["MODALADJUSTGRADIENT"],
  $nav = $(".figures-modal .modal-adjust-gradient-black-white nav");
  
  if (MODESELECTED === "GRADIENT") {
    const {width} = $nav.firstElementChild.firstElementChild.getBoundingClientRect();
    
    $nav.firstElementChild.lastElementChild.classList.remove("color-white-low");
    $nav.firstElementChild.firstElementChild.classList.add("color-white-low");
    
    setPropertyElement($nav,"--leftScroll","0px");
    setPropertyElement($nav,"--widthScroll",width + "px");
    showToolsGRADIENT();
  }
  else {
    const {width} = $nav.firstElementChild.lastElementChild.getBoundingClientRect(),
    widthPreviusBrother = $nav.firstElementChild.firstElementChild.getBoundingClientRect().width;
    
    $nav.firstElementChild.firstElementChild.classList.remove("color-white-low");
    $nav.firstElementChild.lastElementChild.classList.add("color-white-low");
    
    setPropertyElement($nav,"--leftScroll",widthPreviusBrother + "px");
    setPropertyElement($nav,"--widthScroll",width + "px");
    
    showToolsFAVORITES();
  }
}

function changeColorInAddMoreColorsGradient (e) {
  const $childrenCenter = $(".figures-modal .modal-adjust-gradient-black-white main .children-center"),
  $circlePull = $childrenCenter.lastElementChild.lastElementChild,
  {OPTION} = toolSelected.modalFigures,
  {colorsGradient} = toolSelected.modalFigures[OPTION],
  {indicator} = toolSelected.htmlChildren.modalFiguresOptionsHTML;
  
  let {leftpreviewgradient,widthpreviewgradient,xchildrencenter} = $circlePull.dataset;
  
  [leftpreviewgradient,widthpreviewgradient] = [Number(leftpreviewgradient),Number(widthpreviewgradient)];
  
  const colorsGradientOrderAsc = colorsGradient.toSorted((a,b)=>{return a.porcentage - b.porcentage});
  
  let diference,inPorcentage,insertIn;
  for (let index = 0;index < colorsGradientOrderAsc.length;index++) {
    let lastItem = colorsGradientOrderAsc[index - 1],
    currentItem = colorsGradientOrderAsc[index];
    
    if (index === 0) {
      diference = currentItem.porcentage;
      inPorcentage = diference / 2;
      insertIn = 0;
    }
    else if ((currentItem.porcentage -
      lastItem.porcentage) > diference) {
      diference = currentItem.porcentage - lastItem.porcentage;
      inPorcentage = lastItem.porcentage + (diference / 2);
      insertIn = index;
    }
    
    if (index === (colorsGradientOrderAsc.length - 1) && (100 - currentItem.porcentage) > diference) {
      inPorcentage = currentItem.porcentage + (100 - currentItem.porcentage) / 2;
      insertIn = index;
    }
  }
  
  $childrenCenter.insertAdjacentHTML("beforeend",indicator);
  const $circleOfIndicatorJustInsert = $childrenCenter.lastElementChild.lastElementChild;
  
  $circleOfIndicatorJustInsert.setAttribute("data-index",colorsGradient.length);
  $circleOfIndicatorJustInsert.setAttribute("data-leftpreviewgradient",leftpreviewgradient);
  $circleOfIndicatorJustInsert.setAttribute("data-widthpreviewgradient",widthpreviewgradient);
  $circleOfIndicatorJustInsert.setAttribute("data-xchildrencenter",xchildrencenter);
  
 let leftIndicator = leftpreviewgradient + ((inPorcentage * (widthpreviewgradient)) / 100);
  setPropertyElement($circleOfIndicatorJustInsert.parentElement,"left",leftIndicator + "px");
  
  $circleOfIndicatorJustInsert.ontouchstart = touchesCircleAdjustGradient;
  $circleOfIndicatorJustInsert.ontouchmove = touchesCircleAdjustGradient;
  $circleOfIndicatorJustInsert.ontouchend = touchesCircleAdjustGradient
  
  colorsGradient.push({color:e.target.value,porcentage:inPorcentage,originalHeight:0});
  
  if (colorsGradient.length === 15) {
    const $addColor = $(".figures-modal .modal-adjust-gradient-black-white main .children-top #button-add-more-colors");
    
    $addColor.disabled = true;
    $addColor.classList.add("color-disabled");
  }
  
  let gradient = joinColorsGradient([...colorsGradient],"to right");
  
  setPropertyElement(
  $childrenCenter.firstElementChild,
  "background-image",
  gradient);
}

function touchesCircleAdjustGradient (e) {
  if (e.type === "touchstart") {
    const {OPTION} = toolSelected.modalFigures,
    {colorsGradient} = toolSelected.modalFigures[OPTION],
    {index} = e.target.dataset;
    
    let {originalHeight} = colorsGradient[Number(index)],
    {clientY} = e.touches[0];
    
    e.target.setAttribute("data-lastclienty",clientY);
    e.target.setAttribute("data-currentheightline",originalHeight);
  }
  else if (e.type === "touchmove") {
    let {
    leftpreviewgradient,
    widthpreviewgradient,
    xchildrencenter,
    index,
    lastclienty,
    currentheightline
    } = e.target.dataset,
    {OPTION} = toolSelected.modalFigures,
    {colorsGradient} = toolSelected.modalFigures[OPTION],
    {clientX,clientY} = e.touches[0];
    
    [leftpreviewgradient,
    widthpreviewgradient,
    xchildrencenter,
    index,
    lastclienty,
    currentheightline] = [Number(leftpreviewgradient),Number(widthpreviewgradient),Number(xchildrencenter),Number(index),Number(lastclienty),Number(currentheightline)];
    
    let LEFTINDICATOR = clientX - xchildrencenter,
    porcentageGradient = ((LEFTINDICATOR - leftpreviewgradient) * 100) / widthpreviewgradient,
    VELOCITYY = clientY - lastclienty;
    
    if (LEFTINDICATOR < leftpreviewgradient) LEFTINDICATOR = leftpreviewgradient;
    else if (LEFTINDICATOR > (leftpreviewgradient + widthpreviewgradient)) LEFTINDICATOR = leftpreviewgradient + widthpreviewgradient;
    
    setPropertyElement(e.target.parentElement,"left",LEFTINDICATOR + "px");
    
    let maxHeight = 176,
    minHeight = 10;
    if ((currentheightline + VELOCITYY) > maxHeight) currentheightline = maxHeight;
    else if ((currentheightline + VELOCITYY) < 10) currentheightline = minHeight;
    else currentheightline += VELOCITYY;
    
    setPropertyElement(e.target.previousElementSibling,"height",currentheightline + "px");
    
    const $areaRemoveIndicator = e.target.parentElement.parentElement.children[1];
   
    let method;
    if (currentheightline >= 150 && colorsGradient.length > 2) method = "add";
    else method = "remove";
    
    $areaRemoveIndicator.classList[method]("tool-selected");
    
    e.target.setAttribute("data-currentheightline",currentheightline);
    e.target.setAttribute("data-lastclienty",clientY)
    
    if (porcentageGradient > 100) porcentageGradient = 100;
    else if (porcentageGradient < 0) porcentageGradient = 0;
    
    colorsGradient[index].porcentage = porcentageGradient;
    let gradient = joinColorsGradient([...colorsGradient],"to right",index);
    setPropertyElement(e.target.parentElement.parentElement.firstElementChild,"background-image",gradient);
  }
  else if (e.type === "touchend") {
    let {index,currentheightline} = e.target.dataset,
    {OPTION} = toolSelected.modalFigures,
    {colorsGradient} = toolSelected.modalFigures[OPTION];
    
    [currentheightline,index] = [Number(currentheightline),Number(index)];
    
    if (Number(currentheightline) >= 150 && colorsGradient.length > 2) {
      for (let i=index + 1;i<=colorsGradient.length - 1;i++) {
        const $circleIndicator = $(`.figures-modal .modal-adjust-gradient-black-white main .children-center .indicators .circle[data-index='${i}']`);
        
        $circleIndicator.setAttribute("data-index",i - 1);
      }
      colorsGradient.splice(index,1);
      let gradient = joinColorsGradient([
        ...colorsGradient],"to right");
      const $containerCenter = e.target.parentElement.parentElement,
      $previewGradient = $containerCenter.firstElementChild,
      $areaRemoveIndicator = $containerCenter.children[1];
      
      setPropertyElement(
        $previewGradient,
        "background-image",
        gradient 
      );
      
      $areaRemoveIndicator.classList.remove("tool-selected");
      e.target.parentElement.remove();
    }
    else setPropertyElement(e.target.previousElementSibling,"height",colorsGradient[index].originalHeight + "px");
  }
}

function registerTimeOutHideButtons (name,add,subtract,id) {
  toolSelected.modalFigures.idSetTimeOuts[id] = setTimeout(()=>{
    showOrHideButtons(name,add,subtract);
    const allNamesButton = ["gradient","size","opacity","distance","angle","blur"],
    {MARKGLOBAL} = toolSelected.modalFigures;
    
   if (MARKGLOBAL.dataset.touching === "true") return;
   
   for (let name of allNamesButton) {
     if ($(`.figures-modal .name-${name}.hide`)) return;
   }
    
   MARKGLOBAL.classList.add("hide");
  },2000);
}

//El IDTIMEOUT de le objeto modalFigures debe ser eliminado al salir del modal

function showButtonsSubtractAndIncrement ($NAMEBUTTON) {
  
  
  const $BUTTONSUBSTRACT = $NAMEBUTTON.nextElementSibling,
  $BUTTONINCREMENT = $BUTTONSUBSTRACT.nextElementSibling;
  
  $NAMEBUTTON.classList.add("hide");
  $BUTTONSUBSTRACT.classList.remove("hide");
  $BUTTONINCREMENT.classList.remove("hide");
  
  setTimeout(()=>{
    $BUTTONSUBSTRACT.classList.add("hide");
    $BUTTONINCREMENT.classList.add("hide");
    $NAMEBUTTON.classList.remove("hide");
  },2000);
}

function changeProperty ($INPUT) {
  const {id,valueAsNumber} = $INPUT,
  {OPTION} = toolSelected.modalFigures;
  
  if (id === "degrees-gradient-top" || id === "degrees-gradient-center") {
    toolSelected.modalFigures[OPTION]["degreesColorsGradient"] = valueAsNumber;
    changeGradientCONTAINER(OPTION);
  }
  else if (id === "range-size") {
    toolSelected.modalFigures[OPTION]["thickness"] = valueAsNumber;
    updateOUTLINE();
  }
  else if (id === "opacity-range") {
    toolSelected.modalFigures["OPACITY"] = valueAsNumber;
    updateOPACITY();
  }
  else if (OPTION === "SHADOW") {
    const prop = id.split("-")[1];
    toolSelected.modalFigures[OPTION][prop] = valueAsNumber;
    updateSHADOW();
  }
  else if (id === "hardness-range") {
    let hardness = 30 - ((30 * valueAsNumber) / 100);
    setPropertyElement($(".figures-modal .modal-blur"),"--blurCircle",hardness + 'px');
  }
  else if (id === "range-degrees-in-modal-types-gradient") {
    const {OPTION} = toolSelected.modalFigures,
    {colorBottomGradient,colorTopGradient,colorsGradientCurrent} = toolSelected.modalFigures[OPTION],
    modeGradient = $INPUT.parentElement.previousElementSibling.querySelector("button.tool-selected").id.split("-").at(-1);
    
    let $CONTAINERGRADIENTSELECTED,gradient;
    if (($CONTAINERGRADIENTSELECTED = $(".figures-modal .modal-select-mode-gradient .container-gradient.tool-selected"))) {
      let {values} = JSON.parse($CONTAINERGRADIENTSELECTED.dataset.percentajes),
      {index} = $CONTAINERGRADIENTSELECTED.dataset;
    
      index = Number(index);
      
      if (modeGradient === "ellipse" && index >= 5 && index <= 14) {
        let indexBrother = index + 5 <= 14 ? index + 5 : index - 5;
        values = JSON.parse($(`.figures-modal .modal-select-mode-gradient .container-gradient[data-index = '${indexBrother}'`).dataset.percentajes).values;
      }
      
      gradient = createGradient(modeGradient,valueAsNumber,colorTopGradient,colorBottomGradient,values);
    }
    else gradient = joinColorsGradient([...colorsGradientCurrent],{direction:`${valueAsNumber}deg`,modeGradientSelected:modeGradient,deg:valueAsNumber});
    
    setPropertyElement($(".figures-modal .modal-select-mode-gradient .preview-gradient-selected"),"background-image",gradient);
  }
  else if (id === "range-size-line") {
    toolSelected.modalFigures.ALLTYPESLINE.valueInputPrevious = valueAsNumber;
    changeSelectedOfShape();
  }
}

function removeContainersLineExceptFirst () {
  $$(".figures-modal .preview-shape .container-shapes:not(#line-1)").forEach($CONTAINER=>{$CONTAINER.remove()});
}

function movePointsOfPathInSVG (xAmountToMove,yAmountToMove,valuesPathShape) {
  let newValuesPath = valuesPathShape.map(({comandPath,value})=>{
      let valueToReturn;
      
      if (comandPath === "M" || comandPath === "L") {
        valueToReturn = `${comandPath} ${value.x + xAmountToMove} ${value.y + yAmountToMove}`
      }
      else if (comandPath === "A") {
        let stringToArray = value.split(" ");
        let lastIndexValue = stringToArray.length - 1;
        
        let xEndPoint = Number(stringToArray[lastIndexValue - 1]),
        yEndPoint =  Number(stringToArray[lastIndexValue]);
        
        stringToArray[lastIndexValue - 1] = xEndPoint + xAmountToMove
        stringToArray[lastIndexValue] = yEndPoint + yAmountToMove;
        
        stringToArray.unshift(comandPath);
        
        valueToReturn = stringToArray.join(" ");
      }
      else if (comandPath === "H") valueToReturn = `${comandPath} ${value + xAmountToMove}`;
      else if (comandPath === "V") valueToReturn = `${comandPath} ${value + yAmountToMove}`;
      else if (comandPath === "Z") valueToReturn = "Z";
      else if (comandPath === "C") {
        const {x1,y1,x2,y2,x,y} = value;
        valueToReturn = `C ${x1 + xAmountToMove} ${y1 + yAmountToMove} ${x2 + xAmountToMove} ${y2 + yAmountToMove} ${x + xAmountToMove} ${y + yAmountToMove}`;
      }
      else if (comandPath === "Q") {
        let {x1,y1,x,y} = value;
        
        valueToReturn = `Q ${x1 + xAmountToMove} ${y1 + yAmountToMove} ${x + xAmountToMove} ${y + yAmountToMove}`;
      }
      
      return valueToReturn;
    }).join(" ");
  
  return newValuesPath;
}

function getPointsOfPolygonSVG (pointsClipPath,widthOriginalShape,heightOriginalShape,xStart,yStart) {
  return pointsClipPath.map(([xPercentage,yPercentage])=>{
    let x = (xPercentage * widthOriginalShape) / 100;
    let y = (yPercentage * heightOriginalShape) / 100;
    
    return `${xStart + x} ${yStart + y}`
    }).join(",");
}

function setFontFamilyTextSVG ($TEXT,typeForApplyFF,nameFamily) {
  if (typeForApplyFF === "font-face") setPropertyElement($TEXT,"font-family",`"${nameFamily}",sans-serif`);
  else if (typeForApplyFF === "className") {
    nameFamily.split(" ").forEach(className=>{
      if (className !== "font-selected") $TEXT.classList.add(className);
    })
  }
}

function getMeasuresOfShapeInSVGContainer (idshape,widthContainerSVG,heightContainerSVG) {
  let {widthOriginalShape,heightOriginalShape} = getSizeBaseOfShape(idshape);
  
  const pointsClipPath = toolSelected.modalFigures.SHAPE.shapesWithClipPath[idshape];
  
  let atributeToModify,
  valuesPathShape;
  
  if (pointsClipPath) {
    let xStart = (widthContainerSVG / 2) - (widthOriginalShape / 2),
    yStart = (heightContainerSVG / 2) - (heightOriginalShape / 2);
    
    let points = getPointsOfPolygonSVG(pointsClipPath,widthOriginalShape,heightOriginalShape,xStart,yStart);
    
    atributeToModify = [{atribute:"points",value:points}];
  }
  else if (idshape === "arrowIndicator") {
    const {tail,thickness,roundTail} = toolSelected.valuesSettingShapeArrowIndicator;
    
    let leftShapeForCenter = (widthContainerSVG / 2) - (widthOriginalShape / 2),
    topShapeForCenter = (heightContainerSVG / 2) - (heightOriginalShape / 2);
    
    let amountPercentageToWork = (tail * 15) / 100,
    yPercentageFirstPoint = 50 - amountPercentageToWork,
    yPercentageLastPoint = 50 + amountPercentageToWork;
    
    let pointsInSizeAsPercentage = [[0,yPercentageFirstPoint],[80,35],[76,0],[100,50],[76,100],[80,65],[0,yPercentageLastPoint]];
    
    let yEndArc,
    radioYArc = 0;
    
    let xInnerSide = leftShapeForCenter + widthOriginalShape - heightOriginalShape,
    xOutSide = leftShapeForCenter + widthOriginalShape - ((120 * heightOriginalShape) / 100);
    
    valuesPathShape = [];
    
    pointsInSizeAsPercentage.forEach(([px,py],index)=>{
      let x = leftShapeForCenter + ((px * widthOriginalShape) / 100),
      y = topShapeForCenter + ((py * heightOriginalShape) / 100);
      
      let comandName;
      if (index === 0) comandName = "M";
      else comandName = "L";
      
      if (index === 6) radioYArc = (y - valuesPathShape[0].value.y) / 2;
      
      if (index === 1 || index === 5) x = xInnerSide;
      else if (index === 2 || index === 4) x = xOutSide;
      
      valuesPathShape.push({comandPath:comandName,value:{x,y}});
    })
    
    let lastCommand;
    if (roundTail) {
      let xFirstPointOfReference = leftShapeForCenter + radioYArc;
    
      valuesPathShape[0].value.x = xFirstPointOfReference;
      valuesPathShape[6].value.x = xFirstPointOfReference;
      
      lastCommand = {comandPath:"A",value:`${radioYArc} ${radioYArc} 0 0 1 ${xFirstPointOfReference} ${valuesPathShape[0].value.y}`}
    }
    else lastCommand = {comandPath:"Z",value:""}
    
    valuesPathShape.push(lastCommand);
    
  }
  else if (idshape === "circle") {
    let radio = widthOriginalShape / 2;
    let xCenterContainer = (widthContainerSVG / 2)
    let yCenterContainer = (heightContainerSVG / 2);
    
    atributeToModify = [
      {atribute:"cx",value:xCenterContainer},
      {atribute:"cy",value:yCenterContainer},
      {atribute:"r",value:radio}]
  }
  else if (idshape === "ellipse") {
    let radioX = widthOriginalShape / 2;
    let radioY = heightOriginalShape / 2
    
    let xCenter= widthContainerSVG / 2;
    let yCenter = heightContainerSVG / 2
    
    atributeToModify = [
      {atribute:"cx",value:xCenter},
      {atribute:"cy",value:yCenter},
      {atribute:"rx",value:radioX},
      {atribute:"ry",value:radioY}]
  }
  else if (idshape === "ellipseStretched" || idshape === "line") {
    let x = (widthContainerSVG / 2) - (widthOriginalShape / 2),
    y = (heightContainerSVG / 2) - (heightOriginalShape / 2);
    
    atributeToModify = [
      {atribute:"x",value:x},
      {atribute:"y",value:y},
      {atribute:"width",value:widthOriginalShape},
      {atribute:"height",value:heightOriginalShape}];
      
    if (idshape === "ellipseStretched") {
      let rx = (45 * widthOriginalShape) / 100,
      ry = (45 * heightOriginalShape) / 100
      
      ;atributeToModify.push({atribute:"rx",value:rx});
      atributeToModify.push({atribute:"ry",value:ry});
    }
  }
  else if (idshape === "circleOneBorderTip") {
    let xCornerTopLeft = (widthContainerSVG / 2) - (widthOriginalShape / 2),
    yCornerTopLeft = (heightContainerSVG / 2) - (heightOriginalShape / 2);
    
    valuesPathShape = [
      {comandPath:"M",value:{x:xCornerTopLeft,y:yCornerTopLeft}},
      {comandPath:"L",value:{x:xCornerTopLeft,y:yCornerTopLeft + (heightOriginalShape / 2)}},
      {comandPath:"A",value:`${widthOriginalShape / 2} ${heightOriginalShape / 2} 0 1 0 ${xCornerTopLeft + (widthOriginalShape / 2)} ${yCornerTopLeft}`},
      {comandPath:"Z",value:``}
    ];
  }
  else if (idshape === "square") {
    const {topLeft,topRight,bottomLeft,bottomRight,rangeValue} = toolSelected.valuesSettingRoundBorderSHAPESQUARE;
    
    let percentageRoundBorder = rangeValue / 2;
    
    let sizeOfReference = Math.min(widthOriginalShape,heightOriginalShape);
    
    let rounderCorners = (percentageRoundBorder * sizeOfReference) / 100;
    
    let xCornerTopLeft = (widthContainerSVG / 2) - (widthOriginalShape / 2);
    
    let yCornerTopLeft = (heightContainerSVG / 2) - (heightOriginalShape / 2);
    
    let xMove,yMove;
    if (topLeft) {
      xMove = xCornerTopLeft + rounderCorners;
      yMove = yCornerTopLeft;
    }
    else {
      xMove = xCornerTopLeft;
      yMove = yCornerTopLeft;
    }
    
    valuesPathShape = [];
    
    valuesPathShape.push({comandPath:"M",value:{x:xMove,y:yMove}});
    
    if (topLeft) {
      valuesPathShape.push({comandPath:"A",value:`${rounderCorners} ${rounderCorners} 0 0 0 ${xCornerTopLeft} ${yCornerTopLeft + rounderCorners}`});
      
      if (!bottomLeft) valuesPathShape.push({comandPath:"L",value:{x:xCornerTopLeft,y:yCornerTopLeft + heightOriginalShape}});
      else valuesPathShape.push({comandPath:"L",value:{x:xCornerTopLeft,y:yCornerTopLeft + heightOriginalShape - rounderCorners}});
    }
    else {
      let xLine,yLine;
      if (bottomLeft) {
        xLine = xCornerTopLeft;
        yLine = yCornerTopLeft + heightOriginalShape - rounderCorners;
      }
      else {
        xLine = xCornerTopLeft;
        yLine = yCornerTopLeft + heightOriginalShape;
      }
      
      valuesPathShape.push({comandPath:"L",value:{x:xLine,y:yLine}});
    }
    
    if (bottomLeft) {
      valuesPathShape.push({comandPath:"A",value:`${rounderCorners} ${rounderCorners} 0 0 0 ${xCornerTopLeft + rounderCorners} ${yCornerTopLeft + heightOriginalShape}`});
      
      if (!bottomRight) valuesPathShape.push({comandPath:"L",value:{x:xCornerTopLeft + widthOriginalShape,y:yCornerTopLeft + heightOriginalShape}});
      else valuesPathShape.push({comandPath:"L",value:{x:xCornerTopLeft + widthOriginalShape - rounderCorners,y:yCornerTopLeft + heightOriginalShape}});
    }
    else {
      let xLine,yLine;
      if (bottomRight) {
        xLine = xCornerTopLeft + widthOriginalShape - rounderCorners;
        yLine = yCornerTopLeft + heightOriginalShape;
      }
      else {
        xLine = xCornerTopLeft + widthOriginalShape;
        yLine = yCornerTopLeft + heightOriginalShape;
      }
      
      valuesPathShape.push({comandPath:"L",value:{x:xLine,y:yLine}});
    }
    
    if (bottomRight) {
      valuesPathShape.push({comandPath:"A",value:`${rounderCorners} ${rounderCorners} 0 0 0 ${xCornerTopLeft + widthOriginalShape} ${yCornerTopLeft + heightOriginalShape - rounderCorners}`});
      
      if (!topRight) valuesPathShape.push({comandPath:"L",value:{x:xCornerTopLeft + widthOriginalShape,y:yCornerTopLeft}});
      else valuesPathShape.push({comandPath:"L",value:{x:xCornerTopLeft + widthOriginalShape,y:yCornerTopLeft + rounderCorners}});
    }
    else {
      let xLine,yLine;
      if (topRight) {
        xLine = xCornerTopLeft + widthOriginalShape;
        yLine = yCornerTopLeft + rounderCorners;
      }
      else {
        xLine = xCornerTopLeft + widthOriginalShape;
        yLine = yCornerTopLeft
      }
      
      valuesPathShape.push({comandPath:"L",value:{x:xLine,y:yLine}});
    }
    
    if (topRight) {
      valuesPathShape.push({comandPath:"A",value:`${rounderCorners} ${rounderCorners} 0 0 0 ${xCornerTopLeft + widthOriginalShape - rounderCorners} ${yCornerTopLeft}`});
    }
    
    valuesPathShape.push({comandPath:"Z",value:''});
  }
  else if (idshape === "halfCircle") {
    let leftShapeForCenter = (widthContainerSVG / 2) - (widthOriginalShape / 2),
    topShapeForCenter = (heightContainerSVG / 2) - (heightOriginalShape / 2);
    
    valuesPathShape = [
      {comandPath:"M",value:{x:leftShapeForCenter,y:topShapeForCenter + heightOriginalShape}},
      {comandPath:"A",value:`${widthOriginalShape} ${heightOriginalShape / 2} 0 0 0 ${leftShapeForCenter} ${topShapeForCenter}`},
      {comandPath:"Z",value:``}
    ];
  }
  else if (idshape === "text") {
    const $SVGPREVIEW = $(".figures-modal .preview-shape svg");
    
    const {
      fontSize,
      distanceYBetweenTexts
    } = toolSelected.variablesShapeTextTemporal ?? {
      fontSize:70,
      distanceYBetweenTexts:0
    }
    
    const {directionOfWrite,fontFamily,texts} = toolSelected.valuesSettingShapeText;
    
    let textsWithoutSpace = texts.trim();
    let padding = 10;
    
    if (textsWithoutSpace === "") textsWithoutSpace = "Text";
  
    let linesText = textsWithoutSpace.split("\n");
    
    let numberTexts = linesText.length;
    
    let fontSizeApply = numberTexts === 1 ? 70 : fontSize;
    
    setPropertyElement($SVGPREVIEW,"--fontSizeTexts",`${fontSizeApply}px`);
    
    const $HEAD = document.head;
    
    $SVGPREVIEW.insertAdjacentHTML("beforeend",`<text class="text-for-get-measures visibility-hidden" dx="0" dy="0">Text</text>`);
    
    const $TEXTGETMEASURES = $SVGPREVIEW.querySelector(".text-for-get-measures");
    
    setFontFamilyTextSVG($TEXTGETMEASURES,fontFamily.type,fontFamily.name);
    
    let {y,height} = $TEXTGETMEASURES.getBBox();
    
    let xInitTextInSVG = 40;
    
    if (numberTexts === 1) {
      let text = linesText[0];
      
      let yText = heightContainerSVG / 2 - (height / 2);
      
      $TEXTGETMEASURES.innerHTML = text;
      
      let {x} = $TEXTGETMEASURES.getBBox();
      
      $SVGPREVIEW.insertAdjacentHTML("beforeend",`<text class="shadow-SVG" dx="${xInitTextInSVG - x}" dy="${yText - y}">${text}</text>`);
      
      const $TEXTSHADOW = $SVGPREVIEW.querySelector(".shadow-SVG");
      
      setFontFamilyTextSVG($TEXTSHADOW,fontFamily.type,fontFamily.name);
    }
    else {
      let totalOfSpaceBettweenYTexts = numberTexts - 1;
      
      let heightSVGAvaliable = heightContainerSVG - (padding * 2);
      
      let heightOriginalWithAllTextsAndDistacesInY = (height * numberTexts) + (distanceYBetweenTexts * totalOfSpaceBettweenYTexts);
      
      let diferenceBettweenHeightWithValuesOriginalAndHeightAvaliable = heightSVGAvaliable - heightOriginalWithAllTextsAndDistacesInY;
      
      let addOrSubtractHeightTextAndDistanceY = diferenceBettweenHeightWithValuesOriginalAndHeightAvaliable / (numberTexts + totalOfSpaceBettweenYTexts);
      
      let newDistanceYAdjust = distanceYBetweenTexts + addOrSubtractHeightTextAndDistanceY
      
      if (newDistanceYAdjust < 0) {
        let heightWithOnlyHeightTexts = (height * numberTexts);
        
        let diferenceForHeightAvaliable = heightSVGAvaliable - heightWithOnlyHeightTexts;
        
        addOrSubtractHeightTextAndDistanceY = diferenceForHeightAvaliable / numberTexts;
        
        newDistanceYAdjust = 0;
      }
      
      let newHeightTextsAdjust = height + addOrSubtractHeightTextAndDistanceY
      
      if (newHeightTextsAdjust < 4) {
        newHeightTextsAdjust = 4;
        newDistanceYAdjust = (heightSVGAvaliable - (newHeightTextsAdjust * numberTexts)) / totalOfSpaceBettweenYTexts;
      }
      
      let fontSizeAdjustTexts = (newHeightTextsAdjust / height) * fontSizeApply;
      
      fontSizeApply = fontSizeAdjustTexts;
      
      setPropertyElement($SVGPREVIEW,"--fontSizeTexts",`${fontSizeAdjustTexts}px`);
      
      let measuresTextWithNewFont = $TEXTGETMEASURES.getBBox();
      
      let widthTextsAndX = gitSizeWidthOfTextInSVG(linesText,linesText.length,$SVGPREVIEW,fontFamily.type,fontFamily.name);
  
      let widthTextMoreLong = Math.max(...widthTextsAndX.map(({width})=>{return width}));
      
      let xInitTexts = getDxTextsDependingOfDirectionWrite(xInitTextInSVG,widthTextMoreLong,directionOfWrite);
      
      let dyText = padding;
    
      linesText.forEach((text,i)=>{
        let {width,x} = widthTextsAndX[i];
        
        let dxText = xInitTexts;
        
        if (directionOfWrite === "middle") dxText -= (width / 2);
        else if (directionOfWrite === "end") dxText -= width;
        
        if (text !== "") {
          $SVGPREVIEW.insertAdjacentHTML("beforeend",`<text class="shadow-SVG" dx="${dxText - x}" dy="${dyText - measuresTextWithNewFont.y}">${text}</text>`);
          
          setFontFamilyTextSVG($SVGPREVIEW.lastElementChild,fontFamily.type,fontFamily.name);
        }
        
        dyText += newDistanceYAdjust + measuresTextWithNewFont.height;
      })
    }
    
    $TEXTGETMEASURES.remove();
    
    $SVGPREVIEW.setAttribute("data-fontsizetexts",fontSizeApply);
  }
  else if (idshape === "basicCloud") {
    let radioYArc1 = (38.54 * heightOriginalShape) / 100,
    radioXArc1 = (24.82 * widthOriginalShape) / 100
    ,distanceLineHBottom = (54.02 * widthOriginalShape) / 100,
    distanceStartMX = (24.81 * widthOriginalShape) / 100,
    distanceStartMY = (22.93 * heightOriginalShape) / 100,
    distanceXArc2 = (54.02 * widthOriginalShape) / 100,
    distanceYArc2 = (11.34 * heightOriginalShape) / 100,
    radioXArc2 = (21.17 * widthOriginalShape) / 100
    ,radioYArc2 = (32.87 * heightOriginalShape) / 100,
    radioXArc3 = (28.47 * widthOriginalShape) / 100
    ,radioYArc3 = (39.67 * heightOriginalShape) / 100;
    
    let topShapeForCenter = (heightContainerSVG / 2) - (heightOriginalShape / 2),
    leftShapeForCenter = (widthContainerSVG / 2) - (widthOriginalShape / 2);
    
    let MX = leftShapeForCenter + distanceStartMX,
    MY = topShapeForCenter + distanceStartMY;
    
    valuesPathShape = [
      {comandPath:"M",value:{x:MX,y:MY}}
      ,{comandPath:"A",value:`${radioXArc1} ${radioYArc1} 0 0 0 ${MX} ${MY + (radioYArc1 * 2)}`},
      {comandPath:"H",value:MX + distanceLineHBottom},
      {comandPath:"A",value:`${radioXArc2} ${radioYArc2} 0 0 0 ${MX + distanceXArc2} ${MY + distanceYArc2}`},
      {comandPath:"A",value:`${radioXArc3} ${radioYArc3} 0 0 0 ${MX} ${MY}`},
      {comandPath:"Z",value:``}
    ];
  }
  else if (idshape === "cloud") {
    let topShapeForCenter = (heightContainerSVG / 2) - (heightOriginalShape / 2),
    leftShapeForCenter = (widthContainerSVG / 2) - (widthOriginalShape / 2);
    
    let radioXArc1 = (13.43 * widthOriginalShape) / 100,
    startX = leftShapeForCenter + radioXArc1,
    radioYArc1 = (22.84 * heightOriginalShape) / 100,
    startY = (topShapeForCenter + heightOriginalShape) - (radioYArc1 * 2),
    endPointYArc1 = startY + (radioYArc1 * 2),
    radioXArc2 = (8.73 * widthOriginalShape) / 100,
    radioYArc2 = (11.42 * heightOriginalShape) / 100,
    H = ((77.84 * widthOriginalShape) / 100),
    endPointH = startX + H,
    endPointYArc2 = endPointYArc1 - (radioYArc2 * 2),
    radioYArc3 = (11.42 * heightOriginalShape) / 100,
    radioXArc3 = (6.71 * widthOriginalShape) / 100,
    endPointXArc3 = endPointH - ((6.72 * widthOriginalShape) / 100),
    endPointYArc3 = endPointYArc2 - (radioYArc3 * 2),
    radioXArc4 = (28.19 * widthOriginalShape) / 100,
    radioYArc4 = (51.39 * heightOriginalShape) / 100,
    endPointXArc4 = endPointXArc3 - (radioXArc4 * 2),
    subtractPx = (5.70 * heightOriginalShape) / 100,
    endPointYArc4 = endPointYArc3 - subtractPx,
    radioXArc5 = (endPointXArc4 - startX) / 2,
    radioYArc5 = (12.54 * heightOriginalShape) / 100;
    
    valuesPathShape = [
      {comandPath:"M",value:{x:startX,y:startY}},
      {comandPath:"A",value:`${radioXArc1} ${radioYArc1} 0 0 0 ${startX} ${endPointYArc1}`},
      {comandPath:"H",value:endPointH}
      ,{comandPath:"A",value:`${radioXArc2} ${radioYArc2} 0 0 0 ${endPointH} ${endPointYArc2}`},
      {comandPath:"A",value:`${radioXArc3} ${radioYArc3} 0 0 0 ${endPointXArc3} ${endPointYArc3}`}
      ,{comandPath:"A",value:`${radioXArc4} ${radioYArc4} 0 0 0 ${endPointXArc4} ${endPointYArc4}`}
      ,{comandPath:"A",value:`${radioXArc5} ${radioYArc5} 0 0 0 ${startX} ${startY}`},
      {comandPath:"Z",value:``}
    ];
  }
  else if (idshape === "message") {
    let MX = (widthContainerSVG / 2) - (widthOriginalShape / 2),
    MY = ((heightContainerSVG / 2) - (heightOriginalShape / 2));
    
    let radioCornerInX = (7.70 * widthOriginalShape) / 100,
    radioCornerInY = (10.76 * heightOriginalShape) / 100
    ,lineHTop = (84.62 * widthOriginalShape) / 100,
    lineVRight = (53.77 * heightOriginalShape) / 100,
    lineHBottom1 = (53.85 * widthOriginalShape) / 100,
    tipX = (15.39 * widthOriginalShape) / 100,
    tipY = (24.74 * heightOriginalShape) / 100,
    pointXbottom = (13.08 * widthOriginalShape) / 100,
    lineHBottom2 = (30.77 * widthOriginalShape) / 100,
    lineVLeft = (64.52 * heightOriginalShape) / 100,
    xForCornerBL = (38.47 * widthOriginalShape) / 100;
    
    MY += radioCornerInY;
    
    let xEndCornerTL = MX + radioCornerInX,
    yEndCornerTL = MY - radioCornerInY,
    xEndH1 = xEndCornerTL + lineHTop,
    xEndCornerTR = xEndH1 + radioCornerInX,
    yEndV1 = MY + lineVRight,
    yEndCornerBR = yEndV1 + radioCornerInY,
    xEndH2 = xEndH1 - lineHBottom1,
    xCornerBL = xEndH2 - xForCornerBL;
    
    valuesPathShape = [
      {comandPath:"M",value:{x:MX,y:MY}},
      {comandPath:"A",value:`${radioCornerInX} ${radioCornerInY} 0 0 1 ${xEndCornerTL} ${yEndCornerTL}`},
      {comandPath:"H",value:xEndH1},
      {comandPath:"A",value:`${radioCornerInX} ${radioCornerInY} 0 0 1 ${xEndCornerTR} ${MY}`},
      {comandPath:"V",value:yEndV1},
      {comandPath:"A",value:`${radioCornerInX} ${radioCornerInY} 0 0 1 ${xEndH1} ${yEndCornerBR}`},
      {comandPath:"H",value:xEndH2},
      {comandPath:"L",value:{x:xEndH2 - tipX,y:yEndCornerBR + tipY}},
      {comandPath:"L",value:{x:xEndH2 - pointXbottom,y:yEndCornerBR}},
      {comandPath:"H",value:xEndH2 - lineHBottom2},
      {comandPath:"A",value:`${radioCornerInX} ${radioCornerInY} 0 0 1 ${xCornerBL} ${yEndCornerBR - radioCornerInY}`},
      {comandPath:"V",value:yEndCornerBR - lineVLeft}
    ];
  }
  else if (idshape === "heart") { 
    let leftShapeForCenter = (widthContainerSVG / 2) - (widthOriginalShape / 2),
    topShapeForCenter = (heightContainerSVG / 2) - (heightOriginalShape / 2);
    
    let pxAddedYCenterShape = (13.53 * heightOriginalShape) / 100,
    pxX1C = (55.18 * widthOriginalShape) / 100,
    pxX2C = (77.25 * widthOriginalShape) / 100,
    pxY1C = (46.48 * heightOriginalShape) / 100,
    pxY2C = (37.83 * heightOriginalShape) / 100,
    pxYendC = (86.47 * heightOriginalShape) / 100;
    
    let xMiddleOfShapeHeart = leftShapeForCenter + (widthOriginalShape / 2),yStart = topShapeForCenter + pxAddedYCenterShape;
    
    let yPoint1C = yStart - pxY1C;
    let yPoint2C = yStart + pxY2C;
    
    valuesPathShape = [
      {comandPath:"M",value:{x:xMiddleOfShapeHeart,y:yStart}}
      ,{comandPath:"C",value:{
        x1:xMiddleOfShapeHeart - pxX1C,
        y1:yPoint1C,
        x2:xMiddleOfShapeHeart - pxX2C,
        y2:yPoint2C,
        x:xMiddleOfShapeHeart,
        y:yStart + pxYendC
      }}
      ,{comandPath:"C",value:{
        x1:xMiddleOfShapeHeart + pxX2C,
        y1:yPoint2C,
        x2:xMiddleOfShapeHeart + pxX1C,
        y2:yPoint1C,
        x:xMiddleOfShapeHeart,
        y:yStart
      }},
      {comandPath:"Z",value:""}
    ];
  }
  else if (idshape === "shield") {
    let leftStart = (widthContainerSVG / 2) - (widthOriginalShape / 2),
    topStart = (heightContainerSVG / 2) - (heightOriginalShape / 2);
    
    valuesPathShape = [
      {comandPath:"M",value:{x:leftStart,y:topStart + (16.6666667 * heightOriginalShape / 100)}},
      {comandPath:"Q",value:{x1:leftStart + (25 * widthOriginalShape / 100),y1:topStart + (14.4444444 * heightOriginalShape / 100),x:leftStart + (50 * widthOriginalShape / 100),y:topStart}},
      {comandPath:"Q",value:{x1:leftStart + (75 * widthOriginalShape / 100),y1:topStart + (14.4444444 * heightOriginalShape / 100),x:leftStart + widthOriginalShape,y:topStart + (16.6666667 * heightOriginalShape / 100)}},
      {comandPath:"Q",value:{x1:leftStart + widthOriginalShape,y1:topStart + (66.6666667 * heightOriginalShape / 100),x:leftStart + (widthOriginalShape / 2),y:topStart + heightOriginalShape}},
      {comandPath:"Q",value:{x1:leftStart,y1:topStart + (66.6666667 * heightOriginalShape / 100),x:leftStart,y:topStart + (16.6666667 * heightOriginalShape / 100)}},
      {comandPath:"Z",value:""}
    ]
  }
  else if (idshape === "bubbleMessage") {
    let leftShapeForCenter = (widthContainerSVG / 2) - (widthOriginalShape / 2),
    topShapeForCenter = (heightContainerSVG / 2) - (heightOriginalShape / 2);
    
    let radioEllipse1 = {
      x:widthOriginalShape / 2,
      y:(33.33 * heightOriginalShape) / 100
    },
    radioEllipse4 = {
      x:(3.33 * widthOriginalShape) / 100,
      y:(2.23 * heightOriginalShape) / 100
    },
    radioEllipse3 = {
      x:(5 * widthOriginalShape) / 100,
      y:(3.33 * heightOriginalShape) / 100
    },
    radioEllipse2 = {
      x:(6.66 * widthOriginalShape) / 100,
      y:(4.44 * heightOriginalShape) / 100
    }
    
    let gapY = (5.56 * heightOriginalShape) / 100;
    
    //EMPEZANDO DE ARRIBA HACIA ABAJO 1 al 4
    let ellipse1Props = [
      ["cx",leftShapeForCenter + radioEllipse1.x],
      ["cy",topShapeForCenter + radioEllipse1.y],
      ["rx",radioEllipse1.x],
      ["ry",radioEllipse1.y]
    ],
    ellipse4Props = [
      ["cx",leftShapeForCenter + ((15 * widthOriginalShape) / 100)],
      ["cy",topShapeForCenter + heightOriginalShape - radioEllipse4.y],
      ["rx",radioEllipse4.x],
      ["ry",radioEllipse4.y]
    ],
    ellipse3Props = [
      ["cx",ellipse4Props[0][1] + radioEllipse4.x + radioEllipse3.x],
      ["cy",ellipse4Props[1][1] - (radioEllipse4.y + gapY + radioEllipse3.y)],
      ["rx",radioEllipse3.x],
      ["ry",radioEllipse3.y]
    ],
    ellipse2Props = [
      ["cx",ellipse3Props[0][1] + radioEllipse3.x + radioEllipse2.x],
      ["cy",ellipse3Props[1][1] - (radioEllipse3.y + gapY + radioEllipse2.y)],
      ["rx",radioEllipse2.x],
      ["ry",radioEllipse2.y]
    ];
    
    atributeToModify = [ellipse4Props,ellipse3Props,ellipse2Props,ellipse1Props].map(array=>{
      let props = {
        atributes:[],
        values:[]
      };
      
      array.forEach(([atrname,value])=>{
        props.atributes.push(atrname);
        props.values.push(value);
      })
      
      return props;
    })
  }
  else if (idshape === "custom-clip-path") {
    let xCenterSVG = widthContainerSVG / 2;
    let yCenterSVG = heightContainerSVG / 2
    
    let xLeftShape = xCenterSVG - (widthOriginalShape / 2);
    
    let xRightShape = xCenterSVG + (widthOriginalShape / 2);
    
    let yBottomShape = yCenterSVG - (heightOriginalShape / 2);
    
    let yTopShape = yCenterSVG + (heightOriginalShape / 2);
    
    valuesPathShape = [
      {comandPath:"M",value:{x:xLeftShape,y:yBottomShape}},
      {comandPath:"L",value:{x:xLeftShape,y:yBottomShape}},
      {comandPath:"L",value:{x:xLeftShape,y:yTopShape}},
      {comandPath:"L",value:{x:xRightShape,y:yTopShape}},
      {comandPath:"L",value:{x:xRightShape,y:yBottomShape}},
      {comandPath:"Z",value:""}
    ]
  }
  else if (idshape === "hat") {
    let leftStart = (widthContainerSVG / 2) - (widthOriginalShape / 2),
    topStart = (heightContainerSVG / 2) - (heightOriginalShape / 2);
  
    let radioYCircleTop = 54.5454545 * heightOriginalShape / 100,
    firstPointXCircleTop = 25 * widthOriginalShape / 100,
    secondPointXCircleTop = 75 * widthOriginalShape / 100,
    radioXCircleTop = (secondPointXCircleTop - firstPointXCircleTop) / 2,
    yCorners = 45.4545455 * heightOriginalShape / 100;
    
    valuesPathShape = [
      {comandPath:"M",value:{x:leftStart + firstPointXCircleTop,y:topStart + radioYCircleTop}},
      {comandPath:"A",value:`${radioXCircleTop} ${radioYCircleTop} 0 1 1 ${leftStart + secondPointXCircleTop} ${topStart + radioYCircleTop}`},
      {comandPath:"L",value:{x:leftStart + widthOriginalShape,y:topStart + yCorners}},
      {comandPath:"A",value:`${8.33333333 * widthOriginalShape / 100} ${9.09090909 * heightOriginalShape / 100} 0 1 1 ${leftStart} ${topStart + yCorners}`},
      {comandPath:"Z",value:""}
    ]
  }
  else if (idshape === "squareWithoutCorners") {
    let leftStart = (widthContainerSVG / 2) - (widthOriginalShape / 2),
    topStart = (heightContainerSVG / 2) - (heightOriginalShape / 2);
    
    let radioXCorners = 11.1111111 * widthOriginalShape / 100,
    radioYCorners = 11.1111111 * heightOriginalShape / 100,
    xEndLineTop = leftStart + (88.8888889 * widthOriginalShape / 100),
    yEndLineRight = topStart + (88.8888889 * heightOriginalShape / 100);
    
    valuesPathShape = [
      {comandPath:"M",value:{x:leftStart,y:topStart + radioYCorners}},
      {comandPath:"A",value:`${radioXCorners} ${radioYCorners} 0 0 0 ${leftStart + radioXCorners} ${topStart}`},
      {comandPath:"L",value:{x:xEndLineTop,y:topStart}},
      {comandPath:"A",value:`${radioXCorners} ${radioYCorners} 0 0 0 ${xEndLineTop + radioXCorners} ${topStart + radioYCorners}`},
      {comandPath:"L",value:{x:xEndLineTop + radioXCorners,y:yEndLineRight}},
      {comandPath:"A",value:`${radioXCorners} ${radioYCorners} 0 0 0 ${xEndLineTop} ${yEndLineRight + radioYCorners}`},
      {comandPath:"L",value:{x:leftStart + radioXCorners,y:yEndLineRight + radioYCorners}},
      {comandPath:"A",value:`${radioXCorners} ${radioYCorners} 0 0 0 ${leftStart} ${yEndLineRight}`},
      {comandPath:"Z",value:""}
    ]
  }
  else if (idshape === "shuriken") {
    let leftStart = (widthContainerSVG / 2) - (widthOriginalShape / 2),
    topStart = (heightContainerSVG / 2) - (heightOriginalShape / 2);
    
    let radioXArcs = 25 * widthOriginalShape / 100,
    radioYArcs = 25 * heightOriginalShape / 100,
    yArcDownBothSidesLR = 62.5 * heightOriginalShape / 100,
    sizeLinesLongX = 37.5 * widthOriginalShape / 100,
    sizeLinesLongY = 37.5 * heightOriginalShape / 100,
    sizeLinesShortY = 12.5 * heightOriginalShape / 100,
    sizeLinesShortX = 12.5 * widthOriginalShape / 100;
    
    valuesPathShape = [
      {comandPath:"M",value:{x:leftStart,y:topStart + yArcDownBothSidesLR}},
      {comandPath:"A",value:`${radioXArcs} ${radioYArcs} 0 0 1 ${leftStart + radioXArcs} ${topStart + (yArcDownBothSidesLR - radioYArcs)}`},
      {comandPath:"L",value:{x:leftStart + radioXArcs + sizeLinesShortX,y:topStart + (yArcDownBothSidesLR - radioYArcs)}},
      {comandPath:"L",value:{x:leftStart + radioXArcs + sizeLinesShortX,y:topStart}},
      {comandPath:"A",value:`${radioXArcs} ${radioYArcs} 0 0 1 ${leftStart + radioXArcs + sizeLinesShortX + radioXArcs} ${topStart + radioYArcs}`},
      {comandPath:"L",value:{x:leftStart + radioXArcs + sizeLinesShortX + radioXArcs,y:topStart + radioYArcs + sizeLinesShortY}},
      {comandPath:"L",value:{x:leftStart + radioXArcs + sizeLinesShortX + radioXArcs + sizeLinesLongX,y:topStart + radioYArcs + sizeLinesShortY}},
      {comandPath:"A",value:`${radioXArcs} ${radioYArcs} 0 0 1 ${leftStart + radioXArcs + sizeLinesShortX + radioXArcs + sizeLinesShortX} ${topStart + yArcDownBothSidesLR}`}
      ,{comandPath:"L",value:{x:leftStart + radioXArcs + sizeLinesShortX + radioXArcs,y:topStart + yArcDownBothSidesLR}},
      {comandPath:"L",value:{x:leftStart + radioXArcs + sizeLinesShortX + radioXArcs,y:topStart + yArcDownBothSidesLR + sizeLinesLongY}},
      {comandPath:"A",value:`${radioXArcs} ${radioYArcs} 0 0 1 ${leftStart + radioXArcs + sizeLinesShortX} ${topStart + yArcDownBothSidesLR + sizeLinesShortY}`},
      {comandPath:"L",value:{x:leftStart + radioXArcs + sizeLinesShortX,y:topStart + yArcDownBothSidesLR}},
      {comandPath:"Z",value:""}
    ]
  }
  else if (idshape === "bone") {
    let leftStart = (widthContainerSVG / 2) - (widthOriginalShape / 2),
    topStart = (heightContainerSVG / 2) - (heightOriginalShape / 2);
    
    let radioXArc = 11.1111111 * widthOriginalShape / 100,
    radioYArc = 25 * heightOriginalShape / 100,endXArc1 = leftStart + (radioXArc * 2),endYArc1 = topStart + radioYArc,
    centerYShape = topStart + (radioYArc * 2),
    xEndLineHTop = leftStart + (77.7777778 * widthOriginalShape / 100);
    
    valuesPathShape = [
      {comandPath:"M",value:{x:leftStart + radioXArc,y:centerYShape}},
      {comandPath:"A",value:`${radioXArc} ${radioYArc} 0 1 1 ${endXArc1} ${endYArc1}`},
      {comandPath:"H",value:xEndLineHTop},
      {comandPath:"A",value:`${radioXArc} ${radioYArc} 0 1 1 ${xEndLineHTop + radioXArc} ${centerYShape}`},
      {comandPath:"A",value:`${radioXArc} ${radioYArc} 0 1 1 ${xEndLineHTop} ${centerYShape + radioYArc}`},
      {comandPath:"H",value:endXArc1},
      {comandPath:"A",value:`${radioXArc} ${radioYArc} 0 1 1 ${leftStart + radioXArc} ${centerYShape}`},
    ]
  }
  else if (idshape === "flower") {
    let leftStart = (widthContainerSVG / 2) - (widthOriginalShape / 2),
    topStart = (heightContainerSVG / 2) - (heightOriginalShape / 2);
    
    let linesVerticalSize = 55.5555556 * heightOriginalShape / 100,
    radioYArc = 44.4444444 * heightOriginalShape / 100,
    radioXArc = widthOriginalShape / 2;
    
    valuesPathShape = [
      {comandPath:"M",value:{x:leftStart,y:topStart}},
      {comandPath:"V",value:topStart + linesVerticalSize},
      {comandPath:"A",value:`${radioXArc} ${radioYArc} 0 1 0 ${leftStart + radioXArc * 2} ${topStart + linesVerticalSize}`},
      {comandPath:"V",value:topStart},
      {comandPath:"A",value:`${radioXArc} ${radioYArc} 0 0 0 ${leftStart + radioXArc} ${topStart + radioYArc}`},
      {comandPath:"A",value:`${radioXArc} ${radioYArc} 0 0 0 ${leftStart} ${topStart}`},
      {comandPath:"Z",value:""}
    ]
  }
  else if (idshape === "packMan") {
    let leftStart = (widthContainerSVG / 2) - (widthOriginalShape / 2),
    topStart = (heightContainerSVG / 2) - (heightOriginalShape / 2);
    
    let halfWidthShape = widthOriginalShape / 2,halfHeightShape = heightOriginalShape / 2;
    
    valuesPathShape = [
      {comandPath:"M",value:{x:leftStart + halfWidthShape,y:topStart}},
      {comandPath:"A",value:`${halfWidthShape} ${halfHeightShape} 0 1 0 ${leftStart + widthOriginalShape} ${topStart + halfHeightShape}`},
      {comandPath:"H",value:leftStart + halfWidthShape},
      {comandPath:"V",value:topStart},
      {comandPath:"Z",value:""}
    ]
  }
  else if (idshape === "hourglass") {
    let leftStart = (widthContainerSVG / 2) - (widthOriginalShape / 2),
    topStart = (heightContainerSVG / 2) - (heightOriginalShape / 2);
    
    let radioXArc = 43.75 * widthOriginalShape / 100,
    radioYArc = heightOriginalShape / 2;
    
    valuesPathShape = [
      {comandPath:"M",value:{x:leftStart,y:topStart}},
      {comandPath:"H",value:leftStart + widthOriginalShape},
      {comandPath:"A",value:`${radioXArc} ${radioYArc} 0 0 1 ${leftStart + widthOriginalShape - radioXArc} ${topStart + radioYArc}`},
      {comandPath:"A",value:`${radioXArc} ${radioYArc} 0 0 1 ${leftStart + widthOriginalShape} ${topStart + radioYArc * 2}`},
      {comandPath:"H",value:leftStart},
      {comandPath:"A",value:`${radioXArc} ${radioYArc} 0 0 1 ${leftStart + radioXArc} ${topStart + radioYArc}`},
      {comandPath:"A",value:`${radioXArc} ${radioYArc} 0 0 1 ${leftStart} ${topStart}`},
      {comandPath:"Z",value:``}
    ]
  }
  else if (idshape === "moon") {
    let leftStart = (widthContainerSVG / 2) - (widthOriginalShape / 2),
    topStart = (heightContainerSVG / 2) - (heightOriginalShape / 2);
    
    let distancePoints = 86.5384552 * heightOriginalShape / 100,
    endYFirsArc = 6.73077239 * heightOriginalShape / 100,
    radioXArc1 = 57.649717251274026 * widthOriginalShape / 100,
    radioXArc2 = 66.61745104591665 * widthOriginalShape / 100,
    radioYArc1 = distancePoints / 2,
    radioYArc2 = 49.99999633202213 * heightOriginalShape / 100;
    
    valuesPathShape = [
      {comandPath:"M",value:{x:leftStart + widthOriginalShape,y:topStart + heightOriginalShape - endYFirsArc}}
      ,{comandPath:"A",value:`${radioXArc1} ${radioYArc1} 0 0 1 ${leftStart + widthOriginalShape} ${topStart + endYFirsArc}`},
      {comandPath:"A",value:`${radioXArc2} ${radioYArc2} 0 1 0 ${leftStart + widthOriginalShape} ${topStart + heightOriginalShape - endYFirsArc}`},
      {comandPath:"Z",value:""}
    ]
  }
  
  if (valuesPathShape) {
    let valuesPathShapeToString = movePointsOfPathInSVG(0,0,valuesPathShape);
    
    atributeToModify = [{atribute:"d",value:valuesPathShapeToString}];
  }
  
  return {atributeToModify,valuesPathShape}
}

function changeShape () {
  const {idshape} = toolSelected.modalFigures["SHAPE"],
  {borderRoundActived} = toolSelected.valuesSettingThicknessSHAPELINE;
  
  const $SVGCONTAINER = $(".figures-modal .preview-shape > svg");
  
  const $PREVIEWSHAPE = $SVGCONTAINER.parentElement;
  
  const ALLSHADOWS = $SVGCONTAINER.querySelectorAll(".shadow-SVG");
  
  $SVGCONTAINER.querySelectorAll(".shape-SVG").forEach(($SHAPE,index)=>{
    const $SHADOW = ALLSHADOWS[index];
    $SHADOW?.remove();
    $SHAPE.remove();
  })
  
  const widthContainerSVG = getPropertyValueElement("width",$SVGCONTAINER);
  
  const heightContainerSVG = getPropertyValueElement("height",$SVGCONTAINER);
  
  let propertysSHAPE = {};
  
  const pointsClipPath = toolSelected.modalFigures.SHAPE.shapesWithClipPath[idshape];
  
  const {typeLineSelectedPrevious} = toolSelected.modalFigures.ALLTYPESLINE;
  
  let {atributeToModify,valuesPathShape} = getMeasuresOfShapeInSVGContainer(idshape,widthContainerSVG,heightContainerSVG);
  
  if (idshape === "bubbleMessage") {
    Array.from({length:4}).forEach(()=>{
      $SVGCONTAINER.insertAdjacentHTML("beforeend",`<ellipse class="shadow-SVG"></ellipse>`);
    })
  }
  else if (idshape === "line" && typeLineSelectedPrevious !== "line1") {
    const $CONTAINERPREVIEWSHAPE = $(".figures-modal .preview-shape");
    
    addOrRemoveMiniContainerShapeLINEInModalFigures($CONTAINERPREVIEWSHAPE);
    
    const {valueCheckboxPrevious} = toolSelected.modalFigures.ALLTYPESLINE;
    
    changeButtonRoundShapeLineInModalFigures({target:{checked:valueCheckboxPrevious}});
    
    return;
  }
  else if (pointsClipPath) {
    $SVGCONTAINER.insertAdjacentHTML("beforeend",`<polygon class="shadow-SVG"></polygon>`);
  }
  else if (idshape === "circle") {
    $SVGCONTAINER.insertAdjacentHTML("beforeend",`<circle class="shadow-SVG"></circle>`);
  }
  else if (idshape === "ellipse") {
    $SVGCONTAINER.insertAdjacentHTML("beforeend",`<ellipse class="shadow-SVG"></ellipse>`);
  }
  else if (idshape === "ellipseStretched" || idshape === "line") {
    $SVGCONTAINER.insertAdjacentHTML("beforeend",`<rect class="shadow-SVG"></rect>`);
  }
  else if (idshape !== "text") {
    $SVGCONTAINER.insertAdjacentHTML("beforeend",`<path class="shadow-SVG"/>`);
  }
  
  if (valuesPathShape) toolSelected.modalFigures.SHAPE.valuesPathShape = valuesPathShape;
  
  $SVGCONTAINER.querySelectorAll(".shadow-SVG").forEach(($SHADOW,index)=>{
    if (idshape === "bubbleMessage") {
      const props = atributeToModify[index]
      ;props.atributes.forEach((atrname,i)=>{
        let value = props.values[i];
        $SHADOW.setAttribute(atrname,value);
      });
    }
    else if (idshape !== "text") atributeToModify.forEach(atribute=>{
      $SHADOW.setAttribute(atribute.atribute,atribute.value);
    });
    
    const $SHAPEFILL = $SHADOW.cloneNode(true);
    
    $SHAPEFILL.classList.replace("shadow-SVG","shape-SVG");
    
    $SHAPEFILL.classList.add("fill");
    
    $SHAPEFILL.setAttribute("fill","url(#gradientForFill)");
    
    const $SHAPESTROKE = $SHAPEFILL.cloneNode(true);
    
    $SHAPESTROKE.classList.replace("fill","stroke");
  
    $SHAPESTROKE.setAttribute("fill","none");
    
    $SHAPESTROKE.setAttribute("stroke","url(#gradientForStroke)");
  
    $SVGCONTAINER.appendChild($SHAPEFILL);
    $SVGCONTAINER.appendChild($SHAPESTROKE)
  })
  
  if (idshape === "line") {
    const {valueCheckboxPrevious} = toolSelected.modalFigures.ALLTYPESLINE;
    changeButtonRoundShapeLineInModalFigures({target:{checked:valueCheckboxPrevious}});
  }
}

function updataHeightLineIndicatorColor (colorProp,indexHeight,indexCircleMove) {
  const {OPTION} = toolSelected.modalFigures,
  {colorsGradient} = toolSelected.modalFigures[OPTION],
  indexColorProp = colorsGradient.indexOf(colorProp);
  
  const $lineIndicator = $(`.figures-modal .modal-adjust-gradient-black-white main .children-center .circle[data-index='${indexColorProp}']`).previousElementSibling,
  allHeights = [10,52.5,95];
  
  colorsGradient[indexColorProp].originalHeight = allHeights[indexHeight];
  
  if (indexColorProp !== indexCircleMove) {
    setPropertyElement(
      $lineIndicator,
      "height",
      allHeights[indexHeight] + "px"
    );
  }
}

function joinColorsGradient (colorsGradient,direction,indexCircleMove,inFAVORITES) {
  
  colorsGradient.sort((a,b)=>{return a.porcentage - b.porcentage});
  
  let gradient;
  let sizeRadio;
  
  if (typeof(direction) === "object" && direction.modeGradientSelected === "ellipse") {
    sizeRadio = 50 - ((direction.deg * 100 / 359) * 25 / 100);
    gradient = `radial-gradient(ellipse ${sizeRadio}% ${sizeRadio}%,`;
  } else if ((typeof(direction) === "object" && direction.modeGradientSelected === "linear") || typeof(direction) === "string") {
    let directionGradient = direction?.direction ?? direction;
    gradient = `linear-gradient(${directionGradient},`;
  }
  
  const {idshape} = toolSelected.modalFigures.SHAPE;
  
  let indexHeight = 0;
  
  const $modalAdjustGradient = $(".figures-modal .modal-adjust-gradient-black-white");
  
  for (let i = 0;i < colorsGradient.length;i++) {
    const prop = colorsGradient[i];
    gradient += `${prop.color} ${prop.porcentage}%`;
    if (i === colorsGradient.length - 1) gradient += ")";
    else gradient += ",";
    
    if (!inFAVORITES && direction === "to right" && $modalAdjustGradient) {
      updataHeightLineIndicatorColor(prop,indexHeight,indexCircleMove);
      indexHeight = indexHeight === 2 ? 0 : indexHeight + 1;
    }
  }
  return gradient;
}

function changeGradientCONTAINER (OPTION,placeCall) {
  const {colorTopGradient,
  colorBottomGradient,
  degreesColorsGradient,
  typeColorsGradient,
  valuesOfTypeGradient,
  colorsGradientCurrent,
  modeGradient
  } = toolSelected.modalFigures[OPTION];
  
  let $CONTAINERGRADIENTS = $(".figures-modal .preview-shape svg defs");
  
  if (!$CONTAINERGRADIENTS) {
    const $SVG = $(".figures-modal .preview-shape svg");
    
    $SVG.insertAdjacentHTML("beforeend","<defs></defs>");
    
    $CONTAINERGRADIENTS = $SVG.querySelector("defs");
  }
  
  let HTMLSTOPGRADIENT = [];
  
  let idGradient = OPTION === "FILL" ? "gradientForFill" : "gradientForStroke"
  
  let $GRADIENTTOAPPLYCOLORS = $CONTAINERGRADIENTS?.children[idGradient];
  
  if ((modeGradient === "linear" && !$GRADIENTTOAPPLYCOLORS) || (modeGradient === "linear" && $GRADIENTTOAPPLYCOLORS.nodeName !== "linearGradient")) {
    $GRADIENTTOAPPLYCOLORS?.remove();
    $CONTAINERGRADIENTS.insertAdjacentHTML("beforeend",`<linearGradient id="${idGradient}"></linearGradient>`);
    $GRADIENTTOAPPLYCOLORS = $CONTAINERGRADIENTS.children[idGradient];
  }
  else if ((modeGradient === "ellipse" && !$GRADIENTTOAPPLYCOLORS) || (modeGradient === "ellipse" && $GRADIENTTOAPPLYCOLORS.nodeName !== "radialGradient")) {
    $GRADIENTTOAPPLYCOLORS?.remove();
    $CONTAINERGRADIENTS.insertAdjacentHTML("beforeend",`<radialGradient id="${idGradient}"></radialGradient>`);
    $GRADIENTTOAPPLYCOLORS = $CONTAINERGRADIENTS.children[idGradient];
  }
  
  let gradient;
  if (typeColorsGradient === "color-definite") {
    let colorsOrderAsc = colorsGradientCurrent.toSorted((a,b)=>{return a.porcentage - b.porcentage});
    
    colorsOrderAsc.forEach(({color,porcentage})=>{
      HTMLSTOPGRADIENT.push(`<stop offset="${porcentage}%" stop-color="${color}"></stop>`)
    })
  }
  else {
    let colorsOrderDependingModeGradient = valuesOfTypeGradient;
    
    if (modeGradient === "ellipse") colorsOrderDependingModeGradient = valuesOfTypeGradient.toReversed();
    
    colorsOrderDependingModeGradient.forEach((value,i)=>{
      const {top,bottom} = value;
      const {start,end} = valuesOfTypeGradient[i];
    
      let colorIndicate = top ? colorTopGradient : colorBottomGradient;
      
      HTMLSTOPGRADIENT.push(`<stop offset="${start}%" stop-color="${colorIndicate}"></stop>`)
    
      if (end !== undefined) HTMLSTOPGRADIENT.push(`<stop offset="${end}%" stop-color="${colorIndicate}"></stop>`)
    })
  }
  
  if (modeGradient === "linear") {
    let degCorrectForGradient = degreesColorsGradient + 270;
    
    degCorrectForGradient = degCorrectForGradient > 360 ? degCorrectForGradient - 360 : degCorrectForGradient;
    
    let degRotateToRadian = (degCorrectForGradient * Math.PI) / 180;
    
    const {widthBASE,heightBASE} = toolSelected.modalFigures.SHAPE;
    
    let xCenterShape = (widthBASE / 2),
    yCenterShape = (heightBASE / 2),
    maxXShape = widthBASE,
    maxYShape = heightBASE;
    
    const positionPointTop = getPositionPointGradient(degRotateToRadian,xCenterShape,yCenterShape,0,maxXShape,0,maxYShape,0);
    
    let degPositionBottom = degCorrectForGradient + 180;
    
    degPositionBottom = degPositionBottom > 360 ? degPositionBottom - 360 : degPositionBottom;
    
    let degPositionBottomToRadian = (degPositionBottom * Math.PI) / 180;
    
    const positionPointBottom = getPositionPointGradient(degPositionBottomToRadian,xCenterShape,yCenterShape,0,maxXShape,0,maxYShape,0);
    
    const positionDegGradient = {
      x1:positionPointBottom.x / widthBASE,
      y1:positionPointBottom.y / heightBASE
      ,x2:positionPointTop.x / widthBASE
      ,y2:positionPointTop.y / heightBASE
    }
    
    ;["x1","y1","x2","y2"].forEach(key=>{
      let value = positionDegGradient[key];
      if (value > 1) value = 1;
      else if (value < 0) value = 0;
      $GRADIENTTOAPPLYCOLORS.setAttribute(key,value);
    })
  }
  else {
    let sizeRadio = 50 - (((degreesColorsGradient * 100 / 359) * 25) / 100);
    
    $GRADIENTTOAPPLYCOLORS.setAttribute("r",sizeRadio + "%");
  }
  
  $GRADIENTTOAPPLYCOLORS.innerHTML = HTMLSTOPGRADIENT.join("\n");
}

function getSizeBaseOfShape (idshape) {
  let widthOriginalShape,heightOriginalShape;
  
  if (idshape in toolSelected.modalFigures["SHAPE"]) {
    const {width,height} = toolSelected.modalFigures["SHAPE"][idshape];
    widthOriginalShape = width;
    heightOriginalShape = height;
  }
  else {
    const {widthBASE,heightBASE} = toolSelected.modalFigures["SHAPE"]
    
    ;widthOriginalShape = widthBASE;
    heightOriginalShape = heightBASE;
  }
  
  return {widthOriginalShape,heightOriginalShape}
}

function changeSelectedOfShape () {
  changeShape();
  updateOUTLINE();
  updateSHADOW();
  updateHARDNESSSHAPE("FILL");
  updateHARDNESSSHAPE("OUTLINE");
  showOrHideShapeCentral();
  updateOPACITY();
}

function getThicknessOutlineOfShape () {
  const {idshape} = toolSelected.modalFigures.SHAPE,
  {thickness} = toolSelected.modalFigures["OUTLINE"];
  
  const typeOfFigureSVG = $(".figures-modal .preview-shape svg .shape-SVG.fill").nodeName;
  
  let thicknessMaxPx = 20;
  if (idshape === "line") thicknessMaxPx = 15;
  else if (idshape === "text") {
    const fontSizeTextsInSVGPreviewShape = Number($(".figures-modal .preview-shape svg").dataset.fontsizetexts);
    thicknessMaxPx = (fontSizeTextsInSVGPreviewShape / 70) * 20;
  }
  else if (idshape === "arrowIndicator" || idshape === "cloud") thicknessMaxPx = 10;
  else if (idshape === "bubbleMessage") thicknessMaxPx = 8;
  else if (idshape === "ray") thicknessMaxPx = 6;
  else if (typeOfFigureSVG === "path" || typeOfFigureSVG === "polygon") thicknessMaxPx = 20;
  
  return (thickness * thicknessMaxPx) / 100
}

function updateOUTLINE () {
  const {idshape} = toolSelected.modalFigures["SHAPE"];
  
  const pxThickness = getThicknessOutlineOfShape();
  
  const $CONTAINERPREVIEWSHAPES = $(".figures-modal .preview-shape");
  
  const allShadows = $CONTAINERPREVIEWSHAPES.querySelectorAll("svg .shadow-SVG")
  
  $CONTAINERPREVIEWSHAPES.querySelectorAll("svg .shape-SVG.stroke").forEach(($SHAPESTROKE,index)=>{
    const $SHADOW = allShadows[index];
    
    $SHAPESTROKE.setAttribute("stroke-width",pxThickness);
    
    $SHADOW.setAttribute("stroke-width",pxThickness);
  })
}

function updateOPACITY () {
  const maxValueOpacity = 255,
  {OPACITY} = toolSelected.modalFigures;
  
  const {idshape} = toolSelected.modalFigures.SHAPE;
  
  let opacity = (((OPACITY * 100) / maxValueOpacity) * 1) / 100,
  WARNINGOPACITY;
  
  const ALLSHADOWS = $$(".figures-modal .preview-shape svg .shadow-SVG");
  
  $$(".figures-modal .preview-shape svg .shape-SVG").forEach(($SHAPE,index)=>{
    const $SHADOW = ALLSHADOWS[index];
    if ($SHADOW) setPropertyElement($SHADOW,"opacity",opacity);
    setPropertyElement($SHAPE,"opacity",opacity);
  })
  
  
  if (OPACITY < 30) {
    const WARNINGOPACITY = `<p class="warning-opacity" id="warning-opacity"></p>`,
    $CONTAINERPREVIEWSHAPES = $(".figures-modal .preview-shape");
    
    if (!$CONTAINERPREVIEWSHAPES.children["warning-opacity"]) $CONTAINERPREVIEWSHAPES.insertAdjacentHTML("beforeend",WARNINGOPACITY);
    
    $CONTAINERPREVIEWSHAPES.children["warning-opacity"].innerText = `Opacity = ${OPACITY}`
  } else $(".figures-modal .preview-shape .warning-opacity")?.remove();
}

function updateHARDNESSSHAPE (option) {
  const {idshape} = toolSelected.modalFigures.SHAPE;
  
  const {hardness} = toolSelected.modalFigures[option];
  
  let hardnessSHAPE = 30 - ((30 * hardness) / 100);
  
  let typeShape = option === "FILL" ? "fill" : "stroke";
  
  $$(`.figures-modal .preview-shape svg .shape-SVG.${typeShape}`).forEach($SHAPE=>{
    setPropertyElement($SHAPE,"filter",`blur(${hardnessSHAPE}px)`);
  })
}

function getRadioToMoveShadowDependingOfShape (percentageOfMaxRadio,idshape) {
  let maxRadio;
  if (idshape === "line") maxRadio = 10;
  else maxRadio = 22;
  
  return (percentageOfMaxRadio * maxRadio) / 100;
}

function getPointsInPolygonOfShadow (pointsOfReference,xMoveShadow,yMoveShadow) {
  let pointsShadow = [];
  pointsOfReference.split(",").forEach(position=>{
    let [xR,yR] = position.split(" ").map(pos=>{return Number(pos)});
    
    let xWithDistanceShadow = xR + xMoveShadow,
    yWithDistanceShadow = yR + yMoveShadow;
    
    pointsShadow.push(`${xWithDistanceShadow} ${yWithDistanceShadow}`);
  });
  
  return pointsShadow.join(",");
}

function getPositionShadowSVG (idshape,$SHAPE,xMoveShadow,yMoveShadow,valuesPathShape) {
  let nodeName = $SHAPE.nodeName;
  let atributes;
  
  if (idshape === "ellipseStretched") {
    let xOfReference = Number($SHAPE.getAttribute("x")),
    yOfReference = Number($SHAPE.getAttribute("y"));
    
    atributes = [{atribute:"x",value:xOfReference + xMoveShadow},{atribute:"y",value:yOfReference + yMoveShadow}]
  }
  else if (idshape === "circle" || idshape === "ellipse") {
    let xOfReference = Number($SHAPE.getAttribute("cx")),
    yOfReference = Number($SHAPE.getAttribute("cy"));
    
    atributes = [{atribute:"cx",value:xOfReference + xMoveShadow},{atribute:"cy",value:yOfReference + yMoveShadow}]
  }
  else if (nodeName === "polygon") {
    const pointsOfReference = $SHAPE.getAttribute("points");
    
    let pointsShadow = getPointsInPolygonOfShadow(pointsOfReference,xMoveShadow,yMoveShadow);
    
    atributes = [{atribute:"points",value:pointsShadow}];
  }
  else if (nodeName === "text") {
    const baseLineReference = Number($SHAPE.getAttribute("dy"));
    const xStartOfReference = Number($SHAPE.getAttribute("dx"));
    
    atributes = [{atribute:"dx",value:xStartOfReference + xMoveShadow},{atribute:"dy",value:baseLineReference + yMoveShadow}]
  }
  else if (nodeName === "path") {
    let valuesD = movePointsOfPathInSVG(xMoveShadow,yMoveShadow,valuesPathShape);
    
    atributes = [{atribute:"d",value:valuesD}];
  }
  
  return atributes;
}

function updateSHADOW () {
  const {idshape} = toolSelected.modalFigures.SHAPE;
  
  const {distance,angle,color,blur} = toolSelected.modalFigures["SHADOW"];
  
  let circleFILL = Math.PI * 2;
  
  let radio = getRadioToMoveShadowDependingOfShape(distance,idshape);
  
  let porcentage = ((360 - angle)  * 100) / 360,
  radian = (porcentage * circleFILL) / 100,
  fourthPartCircle = circleFILL / 4,
  x = (Math.cos(radian + fourthPartCircle) * radio),
  y = (Math.sin(radian + fourthPartCircle) * radio),
  hardness = (blur * 5) / 100;
  
  const $PREVIEWSHAPE = $(".figures-modal .preview-shape");
  
  const $SHADOW = $(".figures-modal .preview-shape svg .shadow-SVG");
  const $SHAPE = $(".figures-modal .preview-shape svg .shape-SVG.fill");
  
  const {valuesPathShape} = toolSelected.modalFigures.SHAPE;
  
  const newValuesAtributesShadow = getPositionShadowSVG(idshape,$SHAPE,x,y,valuesPathShape);
  
  if (newValuesAtributesShadow) {
    newValuesAtributesShadow.forEach(atr=>{
      $SHADOW.setAttribute(atr.atribute,atr.value);
    })
  }
  
  const ALLSHADOWS = $$(".figures-modal .preview-shape svg .shadow-SVG");
  
  $$(".figures-modal .preview-shape svg .shape-SVG.fill").forEach(($SHAPE,index)=>{
    const $SHADOW = ALLSHADOWS[index];
    if (idshape === "line") {
      let xOfReference = Number($SHAPE.getAttribute("x"));
      let yOfReference = Number($SHAPE.getAttribute("y"));
      
      $SHADOW.setAttribute("x",`${xOfReference + x}`);
      $SHADOW.setAttribute("y",`${yOfReference + y}`);
    }
    else if (idshape === "bubbleMessage") {
      let xOfReference = Number($SHAPE.getAttribute("cx")),
      yOfReference = Number($SHAPE.getAttribute("cy"));
    
      $SHADOW.setAttribute("cx",`${xOfReference + x}`);
      $SHADOW.setAttribute("cy",`${yOfReference + y}`);
    }
    else if (idshape === "text") {
      let atrsForMoveShadow = getPositionShadowSVG("text",$SHAPE,x,y);
      atrsForMoveShadow.forEach(atr=>{
        $SHADOW.setAttribute(atr.atribute,atr.value);
      })
    }
    
    $SHAPE.setAttribute("data-xmovedshadow",x);
    $SHAPE.setAttribute("data-ymovedshadow",y);
    
    $SHADOW.setAttribute("stroke",color);
    
    setPropertyElement($SHADOW,"filter",`blur(${hardness}px)`);
  
    const {buttonsActived} = toolSelected.modalFigures.FILL;
  
    if (!buttonsActived) $SHADOW.setAttribute("fill",`transparent`);
    else $SHADOW.setAttribute("fill",color);
  
    hideShadowShapeIfNotVisible($SHADOW,distance,blur);
  })
}

function hideShadowShapeIfNotVisible ($SHADOW,distance,blur) {
  if (distance > 0 || blur > 0) $SHADOW.classList.remove("visibility-hidden");
  else $SHADOW.classList.add("visibility-hidden");
}

function getTopMarkAndMeasureDependingInput ($INPUT) {
  let showWhenStart = true,
  measure = "",topMarker;
  if ($INPUT.id === "degrees-gradient-center") {
    topMarker = 201;
    measure = "°";
  }
  else if ($INPUT.id === "degrees-gradient-top") {
    showWhenStart = false;
    topMarker = 110;
  }
  else if ($INPUT.id === "range-size") {
    topMarker = 201;
    showWhenStart = false;
    measure = "px";
  }
  else if ($INPUT.id === "opacity-range") topMarker = 450;
  else if ($INPUT.id === "range-distance") {
    topMarker = 110;
    showWhenStart = false;
    measure = "%";
  }
  else if ($INPUT.id === "range-angle") {
    topMarker = 155;
    showWhenStart = false;
    measure = "°";
  }
  else if ($INPUT.id === "range-blur") {
    topMarker = 195;
    showWhenStart = false;
    measure = "%";
  }
  else if ($INPUT.id === "range-size-line") {
    topMarker = 380;
    measure = "%";
  }
  else if ($INPUT.id === "hardness-range") {
    topMarker = 270;
    showWhenStart = false;
  }
  else if ($INPUT.id === "range-degrees-in-modal-types-gradient") {
    topMarker = $(".figures-modal .modal-select-mode-gradient .container-all-types-gradient") ? 417 : 305;
    measure = "°";
  }
  
  return {
    topMarker,
    showWhenStart,
    measure
  };
}

function touchInputRange (e) {
  let leftMarker;
  const $mark = toolSelected.modalFigures["MARKGLOBAL"],
  $INPUT = e.target;
  
  if ($INPUT.disabled) return;
  
  if (e.type !== "touchend") {
    let TOUCH = e.touches[0],
    xDiv;
    
    if ($INPUT.id === "range-degrees-in-modal-types-gradient" && !e.manual) clearTimeout(toolSelected.modalFigures.idSetTimeOuts["deggradientinmodaltypestimeout"]);
    
    if (e.type === "touchstart") {
      e.preventDefault();
      xDiv = $(".figures-modal > div").getBoundingClientRect().x;
      let {x,width} = $INPUT.getBoundingClientRect(),
      inputLEFT = x,
      inputRIGHT = x + width;
      
      $INPUT.setAttribute("data-containersposition",JSON.stringify({parent:xDiv,inputLEFT,inputRIGHT}));
      
      const {topMarker,
      showWhenStart,measure} = getTopMarkAndMeasureDependingInput($INPUT);
      
      let {clientX} = TOUCH;
      if (clientX < (inputLEFT + 7)) clientX = (inputLEFT + 7);
      else if (clientX > (inputRIGHT - 7)) clientX = inputRIGHT - 7;
      
      let widthTight = (inputRIGHT - 7)  - (inputLEFT + 7),
      xTouch = clientX - (inputLEFT + 7),
      porcentage = (xTouch * 100) / widthTight,
      maxVALUE = Number($INPUT.max),
      minVALUE = Number($INPUT.min),
      value = ((porcentage * (maxVALUE - minVALUE)) / 100) + minVALUE;
      
      if (showWhenStart || e.manual) {
        setPropertyElement($mark,"top",`${topMarker}px`);
        setPropertyElement($mark,"left",`${(clientX - xDiv) - 25}px`);
        if (!e.manual) {
          $INPUT.value = value;
          $mark.setAttribute("data-touching",true);
        }
        $mark.innerText = $INPUT.valueAsNumber + measure;
        $mark.classList.remove("hide");
        changeProperty($INPUT);
        if ($INPUT.id === "degrees-gradient-center") $(".figures-modal .top-container #degrees-gradient-top").value = value;
        else if ($INPUT.id === "opacity-range") $(".figures-modal .footer-container #opacity").innerText = `Opacity - ${$INPUT.valueAsNumber}`;
      }
    }
    else xDiv = JSON.parse($INPUT.dataset.containersposition).parent;
    
    leftMarker = (TOUCH.clientX - xDiv) - 25;
  }
  else {
    if ($INPUT.id === "range-size" || $INPUT.id === "range-distance" || $INPUT.id === "range-angle" || $INPUT.id === "range-blur" || $INPUT.id === "degrees-gradient-top" || $INPUT.id === "hardness-range") {
      let {clientX} = e.changedTouches[0],{inputLEFT,inputRIGHT} = JSON.parse($INPUT.dataset.containersposition),
      width = (inputRIGHT - 7)  - (inputLEFT + 7),
      xTouch = clientX - (inputLEFT + 7),
      porcentage = (xTouch * 100) / width,
      value = (porcentage * Number($INPUT.max)) / 100;
      
      $INPUT.value = value;
      $mark.innerText = "";
      changeProperty($INPUT);
      
      if ($INPUT.id === "degrees-gradient-top") $(".figures-modal .center-container #degrees-gradient-center").value = value;
    }
    $mark.setAttribute("data-touching",false);
    $mark.classList.add("hide");
    return;
  }
  
  if (e.type === "touchmove") {
    let {clientX} = e.touches[0];
    
    const {inputLEFT,inputRIGHT} = JSON.parse($INPUT.dataset.containersposition),
    {measure,topMarker} = getTopMarkAndMeasureDependingInput($INPUT);
    
    setPropertyElement($mark,"top",topMarker + "px");
    
    let value;
    if (!e.manual) {
      let width = (inputRIGHT - 7)  - (inputLEFT + 7),
      xTouch = clientX - (inputLEFT + 7),
      porcentage = (xTouch * 100) / width,maxVALUE = Number($INPUT.max),
      minVALUE = Number($INPUT.min);
      
      value = ((porcentage * (maxVALUE - minVALUE)) / 100) + minVALUE;
      $INPUT.value = value;
      
      $mark.setAttribute("data-touching",true);
    }
    
    value = $INPUT.valueAsNumber;
    changeProperty($INPUT);
    
    if ($INPUT.id === "degrees-gradient-center") $(".figures-modal .top-container #degrees-gradient-top").value = value;
    else if ($INPUT.id === "degrees-gradient-top") $(".figures-modal .center-container #degrees-gradient-center").value = value;
    else if ($INPUT.id === "opacity-range") $(".figures-modal .footer-container #opacity").innerText = `Opacity - ${value}`;
    
    let lastValueMark = $mark.innerText;
    if (lastValueMark === $INPUT.value + measure) return;
    
    $mark.innerText = $INPUT.value + measure;
    
    if (clientX >= (inputLEFT + 7) && clientX <= (inputRIGHT - 7)) {
      setPropertyElement($mark,"left",`${leftMarker}px`);
    }
    
    $mark.classList.remove("hide");
  }
}

function changeBGandColorButtonsTopBottomOfGradient (idContainerModify,colorSelected) {
  const $containerColor = $(`.figures-modal  #${idContainerModify}`);
  
  let {r,g,b} = convertColorToRgb(colorSelected),colorText;
  
  if ((g <= 150 && b <= 150) || (r <= 150 && g <= 150) || (g <= 150)) colorText = "#fff";
  else colorText = "#000";
  
  setPropertyElement($containerColor,"background-color",colorSelected);
  setPropertyElement($containerColor,"color",colorText);
}

function changeColorContainer (e) {
  const idContainerModify = e.target.dataset.idcontainerchangecolor,
  colorSelected = e.target.value,
  optionSelected = toolSelected.modalFigures.OPTION;
  
  changeBGandColorButtonsTopBottomOfGradient(idContainerModify,colorSelected)
  
  if (optionSelected !== "SHADOW") {
    toolSelected.modalFigures[optionSelected][idContainerModify === "color-top" ? "colorTopGradient" : "colorBottomGradient"] = colorSelected;
    changeGradientCONTAINER(optionSelected)
  }
  else {
    toolSelected.modalFigures["SHADOW"]["color"] = colorSelected;
    
    const $containerColor = $(`.figures-modal #${idContainerModify}`);
    
    $containerColor.innerText = colorSelected.toUpperCase();
    
    updateSHADOW();
  }
}

function getValuesCurrentInModalFigures () {
  let currentValues;
  if ((currentValues = localStorage.getItem("propertysInModalFiguresToolDraw"))) {
    currentValues = JSON.parse(currentValues);
    currentValues.ALLTYPESLINE.typesLine.line1.timesRepeatPx = [Infinity];
  }
  else currentValues = {
    SHAPE:{
      idshape:"square",
      widthBASE:90,
      heightBASE:90,
      ellipse:{width:115,height:90},
      ellipseStretched:{width:125,height:90},
      line:{width:280,height:20},
      arrowSignal:{width:280,height:80},
      arrowIndicator:{
        width:300,
        height:60
      },
      ray:{
        width:70,
        height:90
      },
      message:{
        width:130,
        height:93
      },
      basicCloud:{
        width:137.01,
        height:88.24
      },
      heart:{
        width:90.62,
        height:92.52
      },
      cloud:{
        width:149,
        height:87.57
      },
      halfCircle:{
        width:45,
        height:90
      },
      bubbleMessage:{
        width:120,
        height:90
      },
      shield:{
        width:80,
        height:90
      },
      diamond:{
        width:90,
        height:60
      },
      hat:{
        width:120,
        height:55
      },
      bone:{
        width:90,
        height:40
      },
      flower:{
        width:80,
        height:90
      },
      flag:{
        width:80,
        height:100
      },
      hourglass:{
        width:80,
        height:70
      },
      moon:{
        width:78.05762481689453,
        height:104.00000762939453
      },
      shapesWithClipPath:{
        triangle:[[50,0],[100,100],[0,100]]
        ,pentagon:[[0,35],[50,0],[100,35],[80,100],[20,100]],
        middleTrapeze:[[0,0],[50,0],[100,100],[0,100]],
        arrowSignal:[[0,100],[15,50],[0,0],[85,0],[100,50],[85,100]],
        ray:[[45,0],[100,0],[60,35],[85,35],[45,65],[65,65],[0,100],[30,65],[10,65],[40,35],[15,35]],
        octagon:[[25,0],[75,0],[100,25],[100,75],[75,100],[25,100],[0,75],[0,25]],
        star:[[50,0],[64,33],[100,40],[73,63],[82,100],[50,80],[18,100],[27,63],[0,40],[36,33]],
        narrowStar:[[0,50],[47.77777777777778,47.77777777777778],[50,0],[52.22222222222222,47.77777777777778],[100,50],[52.22222222222222,52.22222222222222],[50,100],[47.77777777777778,52.22222222222222]],
        flash:[[0,50],[46.666666666666664
,47.77777777777778],[25
,11.11111111111111],[47.77777777777778
,45.55555555555556],[50,0],[52.22222222222222
,45.55555555555556],[75,11.11111111111111],[53.333333333333336
,47.77777777777778],[100,50],[53.333333333333336,52.22222222222222],[75,88.88888888888889],[52.22222222222222,54.44444444444444],[50,100],[47.77777777777778,54.44444444444444],[25,88.88888888888889],[46.666666666666664,52.22222222222222]],
        circlePoints:[[100,50],[87.56378213346377,60.06518508732025],[93.30127018922194,75],[77.49859704614352,77.49859704614352],[75,93.30127018922194],[60.06518508732025,87.56378213346377],[50,100],[39.93481491267974,87.56378213346377],[25.00000000000001,93.30127018922194],[22.501402953856488,77.49859704614352],[6.698729810778066,75],[12.436217866536236,60.06518508732026],[0,50.00000000000001],[12.436217866536229,39.934814912679755],[6.698729810778066,24.999999999999996],[22.50140295385648,22.501402953856488],[24.999999999999975,6.698729810778081],[39.934814912679755,12.436217866536236],[49.99999999999999,0],[60.06518508732026,12.436217866536236],[75,6.698729810778066],[77.49859704614352,22.50140295385648],[93.30127018922192,24.999999999999975],[87.56378213346377,39.934814912679755],[100,49.99999999999998]],
        diamond:[[50,100],[0,16.6666667],[22.2222222,0],[77.7777778,0],[100,16.6666667]],
        flag:[[0,0],[0,100],[50,50],[100,100],[100,0]]
      }
    },
    FILL:{
      typeColorsGradient:"color-customizable",
      degreesColorsGradient:0,
      colorTopGradient:"#000",
      colorBottomGradient:"#000",
      hardness:100,
      buttonsActived:true,
      colorDefiniteInputRangeActived:false,
      colorsGradient:[],
      colorsGradientCurrent:[
        {color:"#fff",porcentage:0,originalHeight:0},
        {color:"#000",porcentage:100,originalHeight:0}
      ],
      valuesOfTypeGradient:[{bottom:true,start:0},{top:true,start:100}],
      indexTypeGradientSelected:0,
      modeGradient:"linear",
      gradientSelected:"linear-gradient(to top,#000,#fff)"
    },
    OUTLINE:{
      typeColorsGradient:"color-customizable",
      degreesColorsGradient:0,
      colorTopGradient:"#000",
      colorBottomGradient:"#000",
      hardness:100,
      typeOutline:"solid",
      thickness:0,
      colorDefiniteInputRangeActived:false,
      colorsGradient:[],
      colorsGradientCurrent:[
        {color:"#fff",porcentage:0,originalHeight:0},
        {color:"#000",porcentage:100,originalHeight:0}
      ],
      valuesOfTypeGradient:[{bottom:true,start:0},{top:true,start:100}],
      indexTypeGradientSelected:0,
      modeGradient:"linear",
      gradientSelected:"linear-gradient(to top,#000,#fff)"
    },
    SHADOW:{
      distance:0,
      angle:0,
      blur:0,
      color:"#000"
    },
    OPTION:"SHAPE",
    OPACITY:255,
    MODALADJUSTGRADIENT:{
      MODESELECTED:"GRADIENT",
      FAVORITES:[],
      POSITIONSFAVORITES:[]
    },
    idSetTimeOuts:{},
    ALLTYPESLINE:{
      typeLineSelected:"line1",
      typeLineSelectedPrevious:"line1",
      gapBettweenLines:1,
      typesLine:{
        line1:{
          timesRepeatPx:[Infinity],
          maxRepeatPattern:1
        },
        line2:{
          timesRepeatPx:[1.3],
          maxRepeatPattern:1
        },
        line3:{
          timesRepeatPx:[2.2],
          maxRepeatPattern:1
        },
        line4:{
          timesRepeatPx:[2.2,1.3],
          maxRepeatPattern:2
        },
        line5:{
          timesRepeatPx:[5],
          maxRepeatPattern:1
        },
        line6:{
          timesRepeatPx:[5,1.3],
          maxRepeatPattern:2
        },
        line7:{
          timesRepeatPx:[5,1.3,1.3],
          maxRepeatPattern:3
        },
        line8:{
          timesRepeatPx:[5,2.2,2.2],
          maxRepeatPattern:3
        }
      },
      valueInput:100,
      valueInputPrevious:100,
      valueCheckboxPrevious:false
    }
  };
  
  toolSelected.modalFigures = currentValues
}

function setRounderToShapesLine ($ALLSHADOWS,$ALLSHAPES,actived) {
  $ALLSHAPES.forEach(($SHAPE,index)=>{
    const $SHADOW = $ALLSHADOWS[index];
    
    let halfHeightShape = Number($SHAPE.getAttribute("height")) / 2;
    
    let ry = actived ? halfHeightShape : 0;
    
    $SHAPE.setAttribute("ry",ry);
    $SHAPE.setAttribute("rx",ry);
    
    if ($SHADOW) {
      $SHADOW.setAttribute("ry",ry);
      $SHADOW.setAttribute("rx",ry);
    }
  })
}

function changeButtonRoundShapeLineInModalFigures ({target}) {
  const {checked} = target;
  
  toolSelected.modalFigures.ALLTYPESLINE.valueCheckboxPrevious = checked;
  
  const $ALLSHADOWS = $$(".figures-modal .preview-shape svg .shadow-SVG"),
  $ALLSHAPES = $$(".figures-modal .preview-shape svg .shape-SVG");
  
  setRounderToShapesLine($ALLSHADOWS,$ALLSHAPES,checked);
}

function setValuesInOptionSelectedModalFigures (option) {
  if (option === "shape") {
    const $figure = 
    $(`.figures-modal .tool-shapes #${toolSelected.modalFigures["SHAPE"]["idshape"]}`);
    
    $figure.classList.add("tool-selected");
  }
  else if (option === "fill" || option === "outline") {
    const {
      typeColorsGradient,
      degreesColorsGradient,
      colorTopGradient,
      colorBottomGradient,
      buttonsActived,
      typeOutline,
      thickness,
      colorDefiniteInputRangeActived,
      gradientSelected
    } = toolSelected.modalFigures[option.toUpperCase()];
    
    const {idshape} = toolSelected.modalFigures.SHAPE;
    
    const $typeColorsGradient = $(".figures-modal .tool-fill-outline #change-type-colors"),
    $buttonSwitchButtonsFILL = $(".figures-modal .tool-fill-outline .center-container #on-off-buttons"),
    $containerColorTop = $(".figures-modal .tool-fill-outline .top-container #color-top"),
    $containerColorBottom = $containerColorTop.nextElementSibling
    ,$inputRangeGradient = $(".figures-modal .tool-fill-outline .center-container .angle-gradient-range #degrees-gradient-center"),
    $inputRangeGradientTop = $(".figures-modal .tool-fill-outline .top-container #degrees-gradient-top"),
    $buttonMatchOrInput = $(".figures-modal .tool-fill-outline .top-container .matchOrinput"),
    $ICONMODEGRADIENTSELECTED = $(".figures-modal .tool-fill-outline .top-container #mode-gradient .gradient-selected"),
    $ICONBUTTONMATCHORINPUT = $buttonMatchOrInput.firstElementChild
    
    if (typeColorsGradient === "color-customizable") {
      $typeColorsGradient.classList.remove("tool-selected");
      $containerColorTop.classList.remove("hide");
      $containerColorBottom.classList.remove("hide");
      $containerColorBottom.nextElementSibling.classList.add("hide");
      $containerColorBottom.nextElementSibling.nextElementSibling.classList.add("hide");
      
      $buttonMatchOrInput.setAttribute("id","match-color");
      $buttonMatchOrInput.classList.remove("tool-selected");
      
      $ICONBUTTONMATCHORINPUT.src = "./icons-svg/equal-svgrepo-com.svg";
      $ICONBUTTONMATCHORINPUT.alt = "match"
    }
    else {
      $typeColorsGradient.classList.add("tool-selected");
      $containerColorTop.classList.add("hide");
      $containerColorBottom.classList.add("hide");
      
      let colorContainerMethod,
      inputMethod;
      if (colorDefiniteInputRangeActived) {
        colorContainerMethod = "add";
        inputMethod = "remove";
      } else {
        colorContainerMethod = "remove";
        inputMethod = "add";
      }
      
      $containerColorBottom.nextElementSibling.classList[colorContainerMethod]("hide");
      $containerColorBottom.nextElementSibling.nextElementSibling.classList[inputMethod]("hide");
      
      $buttonMatchOrInput.setAttribute("id","show-input-degrees");
      
      $ICONBUTTONMATCHORINPUT.src = "./icons-svg/quarter-circle.svg";
      $ICONBUTTONMATCHORINPUT.alt = "input"
      
      $buttonMatchOrInput.classList[colorContainerMethod]("tool-selected");
    }
    
    let displayContainerSettingOutline,
    idButton,stateButton = "disable";
    
    if (option === "fill") {
      displayContainerSettingOutline = "none";
      
      setPropertyElement($buttonSwitchButtonsFILL,"display","block");
      
      let TEXTBUTTON = "Off";
      if (buttonsActived) {
        $buttonSwitchButtonsFILL.classList.add("tool-selected");
        TEXTBUTTON = "On";
        stateButton = "enable";
      }
      
      $buttonSwitchButtonsFILL.innerText = TEXTBUTTON;
    }
    else {
      displayContainerSettingOutline = "flex";
      stateButton = "enable";
      
      $(".figures-modal .tool-fill-outline .size-outline #range-size").value = thickness;
      
      setPropertyElement($buttonSwitchButtonsFILL,"display","none")
    }
    
    enableOrDisabledButtons(stateButton,
     [$typeColorsGradient,
     $containerColorTop,
      $containerColorBottom,
      $buttonMatchOrInput.nextElementSibling,
      $(".figures-modal .center-container #angle-gradient"),
      $(".figures-modal .center-container #blur"),
      $(".figures-modal .top-container #degrees-gradient-top"),
      $(".figures-modal .top-container #gradient-white-black"),
      $buttonMatchOrInput
      ]
    );
    
    setPropertyElement($ICONMODEGRADIENTSELECTED,"background-image",gradientSelected)
    
    const $CONTAINERFOOTER = $(".figures-modal .footer-container");
    
    const $BUTTONSELECTTYPELINE = $CONTAINERFOOTER.children["types-line"];
    
    if (option === "fill" && idshape === "line") setPropertyElement($BUTTONSELECTTYPELINE,"display","flex");
    else setPropertyElement($BUTTONSELECTTYPELINE,"display","none");
    
    setPropertyElement($(".figures-modal .container-options .size-outline"),"display",displayContainerSettingOutline);
    
    $inputRangeGradient.value = degreesColorsGradient;
    $inputRangeGradientTop.value = degreesColorsGradient;
    
    const CURRENTOPACITY = toolSelected.modalFigures.OPACITY,
    {name} = JSON.parse($(".figures-modal").dataset.superposition);
    
    $(".figures-modal .opacity-range-container #opacity-range").value = CURRENTOPACITY;
    $(".figures-modal .footer-container #opacity").innerText = `Opacity - ${CURRENTOPACITY}`;
    
    $(".figures-modal .footer-container #superposition-shape").innerText = name;
    
    const $CHECKBOX = $CONTAINERFOOTER.querySelector(".container-types-line #checkbox-round");
    
    const {typeLineSelectedPrevious,valueInputPrevious,valueCheckboxPrevious} = toolSelected.modalFigures.ALLTYPESLINE;
    
    const $BUTTONTYPELINESELECTED = $(`.container-types-line #${typeLineSelectedPrevious}`);
    
    if (!$CHECKBOX.onchange) $CHECKBOX.onchange = changeButtonRoundShapeLineInModalFigures;
    
    $BUTTONSELECTTYPELINE.innerHTML = "";
    
    const $COPYSVG = $BUTTONTYPELINESELECTED.querySelector("svg").cloneNode(true);
    
    adjustInButtonTheShapeOfTypeLineSelect($COPYSVG);
    
    $BUTTONSELECTTYPELINE.appendChild($COPYSVG);
    
    $CHECKBOX.checked = valueCheckboxPrevious;
    
    $BUTTONTYPELINESELECTED.classList.add("tool-selected");
    
    $CONTAINERFOOTER.querySelector(".container-types-line #range-size-line").value = valueInputPrevious
  }
  else if (option === "shadow") {
    const {
      distance,
      angle,
      blur,
      color
    } = toolSelected.modalFigures["SHADOW"]
    
    $(".figures-modal .tool-shadow #range-distance").value = distance
    $(".figures-modal .tool-shadow #range-angle").value = angle;
    $(".figures-modal .tool-shadow #range-blur").value = blur;
    
    changeBGandColorButtonsTopBottomOfGradient("color-shadow",color);
    
    const $BUTTONCOLOR = $(".figures-modal #color-shadow");
    
    $BUTTONCOLOR.innerText = color;
  }
}

function enableOrDisabledButtons (mode,buttons) {
  let method,enable;
  if (mode === "enable") {
    method = "remove";
    enable = true;
  } else {
    method = "add";
    enable = false;
  }
  
  for (const $button of buttons) {
    const id = $button.id;
    
    let OPTION = toolSelected.modalFigures["OPTION"],
    PROPSMODE = toolSelected.modalFigures[OPTION];
    
    $button.classList[method]("color-disabled");
    
    if (id === "color-top" || id === "color-bottom") {
      if (!enable) {
        setPropertyElement($button,"background-color","#898989");
        setPropertyElement($button,"color","#c8c8c8");
      }
      else changeBGandColorButtonsTopBottomOfGradient(id,id === "color-top" ? PROPSMODE.colorTopGradient : PROPSMODE.colorBottomGradient);
    }
    else if (id === "gradient-white-black") {
      if (!enable) {
        setPropertyElement($button,"background-image","none");
        setPropertyElement($button,"background-color","#3f3f3f12");
      }
      else {
        let gradient = joinColorsGradient([...PROPSMODE.colorsGradientCurrent],"to right");
        setPropertyElement($button,"background-image",gradient);
        setPropertyElement($button,"background-color","transparent");
      }
    }
    else if ($button.classList.contains("matchOrinput")) {
      const $buttonChangeTypeGradient = $(".figures-modal .tool-fill-outline .top-container #change-type-colors"),
      $buttonGradientBlackWhite = $(".figures-modal .tool-fill-outline .top-container .container-color #gradient-white-black");
      
      if (PROPSMODE.typeColorsGradient === "color-definite" && $buttonGradientBlackWhite.classList.contains("hide") && enable) $button.classList.add("tool-selected");
      else if (PROPSMODE.typeColorsGradient === "color-definite" && $buttonGradientBlackWhite.classList.contains("hide") && !enable) $button.classList.remove("tool-selected");
      
      const $ICONBUTTON = $button.firstElementChild;
      
      if (enable) $ICONBUTTON.classList.remove("opacity-midle")
      else $ICONBUTTON.classList.add("opacity-midle")
    }
    else if (id === "change-type-colors" && PROPSMODE.typeColorsGradient === "color-definite") {
      if (!enable) $button.classList.remove("tool-selected");
      else $button.classList.add("tool-selected");
    }
    
     const $ICONBUTTON = $button.firstElementChild;
      
    if ($ICONBUTTON?.nodeName === "IMG" || $ICONBUTTON?.classList.contains("gradient-selected")) enable ? $ICONBUTTON.classList.remove("opacity-midle") : $ICONBUTTON.classList.add("opacity-midle");
    
    $button.disabled = !enable;
  }
}

//ESCUCHANDO EL CLICK DE ALGUNA HERRAMIENTA DE LA APLICACION
$toolsUp.addEventListener("click",(e)=>{
  let tool = e.target,
  {runningshrinkcontainer} = $aplication.dataset;
  
  let buttonOutClick = tool.id === "out";
  
  if (buttonOutClick && toolSelected.toolName === "pixel") {
    if ($(".pixel-tool")) {
      let shrink = shrinkContainerIfIsNecesary();
      if (shrink) return;
    }
    goBackInToolPixel("out");
  }
  else if (buttonOutClick && toolSelected.toolName === "crop") {
    const $CONTAINERMOREASPECTRATIO = $(".crop-tool .container-more-aspect-ratio");
    
    if ($CONTAINERMOREASPECTRATIO.classList.contains("scaleY-1")) {
      $CONTAINERMOREASPECTRATIO.classList.remove("scaleY-1");
      return;
    }
    
    if (!$buttonSave.disabled && !notShowModalSaveChangeAgain) askSaveBeforeOutToHome("out","Crop");
    else goHomeAplication("out");
  }
  else if (buttonOutClick && toolSelected.toolName === "draw" && !runningshrinkcontainer) {
    const {index} = toolSelected.layer;
    
    if (index > 0 && !notShowModalSaveChangeAgain) askSaveBeforeOutToHome("out","Drawing");
    else goHomeAplication("out");
  }
})

function shrinkContainerIfIsNecesary () {
  const $TOOLSEDITSIZE= $(".pixel-tool .size-children"),
  $TOOLSEDITZOOM = $(".pixel-tool .zoom-children");
  
  let stopCode = false;
  
  let shrinkToolsEditZoom = $TOOLSEDITZOOM.classList.contains("shrink"),
  shrinkToolsEditSizes = $TOOLSEDITSIZE.classList.contains("shrink");
  
  if (!shrinkToolsEditSizes) {
    clearTimeout(toolSelected[`idSetTimeOut-brush`]);
    clearTimeout(toolSelected[`idSetTimeOut-eraser`]);
    
    let nameBrushIsHide = $TOOLSEDITSIZE.querySelector("#brush-name").classList.contains("hide"),
    nameEraserIsHide = $TOOLSEDITSIZE.querySelector("#eraser-name").classList.contains("hide");
    
    $TOOLSEDITSIZE.ontransitionend = () => {
      if (nameEraserIsHide) showOrHideButtons("#eraser-name","#eraser-add","#eraser-subtract");
    
      if (nameBrushIsHide) showOrHideButtons("#brush-name","#brush-add","#brush-subtract");
      
      if (nameEraserIsHide || nameBrushIsHide) $(".pixel-tool .size-children .marker-size").classList.add("hide");
      
      $TOOLSEDITSIZE.ontransitionend = null
    }
    
    $TOOLSEDITSIZE.classList.add("shrink")
    
    stopCode = true;
  }
  else if (!shrinkToolsEditZoom) {
    clearTimeout(toolSelected[`idSetTimeOut-zoom`]);
    
    let nameZoomIsHide = $TOOLSEDITZOOM.querySelector("#zoom-amount").classList.contains("hide");
    
    $TOOLSEDITZOOM.ontransitionend = () => {
      if (nameZoomIsHide) {
        showOrHideButtons("#zoom-amount","#zoom-add","#zoom-subtract");
        $(".pixel-tool .zoom-children .marker-zoom").classList.add("hide");
      }
      
      $TOOLSEDITZOOM.ontransitionend = null
    }
    
    $TOOLSEDITZOOM.classList.add("shrink")
    
    stopCode = true;
  }
  
  return stopCode;
}

$toolsDown.addEventListener("click",(e)=>{
  const tool = e.target,
  $modalAllTools = $(".container-allTools .modal-allTools");
  
  const $CONTAINEROPTIONSSHAPE = $(".draw-tool #shapes-draw .options");
  
  const $CONTAINERMOREASPECTRATIO = $(".crop-tool .container-more-aspect-ratio");
  
  if (tool.id === "button-allTools") $modalAllTools.classList.toggle("scale-1");
  else if ($modalAllTools.classList.contains("scale-1")) {
    $modalAllTools.classList.remove("scale-1");
    if (!tool.parentElement.classList.contains("modal-allTools")) return
  }
  else if (tool.id !== "shapes-draw" && $CONTAINEROPTIONSSHAPE?.classList.contains("scaleY-1")) {
    $CONTAINEROPTIONSSHAPE.classList.remove("scaleY-1");
    
    if (tool.id === "figures") {
      showModalFigures("SHAPE");
    }
    
    e.preventDefault();
    return;
  }
  else if ($CONTAINERMOREASPECTRATIO?.classList.contains("scaleY-1") && !tool.classList.contains("aspect-ratio-in-container-more")) {
    $CONTAINERMOREASPECTRATIO.classList.remove("scaleY-1");
    return;
  }
  
  if (tool.id === "folder") {
    const $BUTTONFOLDER = $(".tools_down #folder");
    
    const inputHtml = `<input type="file" accept=".jpg,.png" class='hide'>`;
    
    $BUTTONFOLDER.insertAdjacentHTML("beforeend",inputHtml);
    
    const inputElement = $BUTTONFOLDER.querySelector("input");
    
    inputElement.click();
    
    inputElement.addEventListener("change",(e)=>{
      const file = e.target.files[0];
      const reader = new FileReader ();
      reader.readAsDataURL(file);
      
      const $loading = loading();
      const $containerIMG = $(".img");
      
      if (!$(".loading")) {
        $containerIMG.replaceChild($loading,$canvas);
        setPropertyElement($containerIMG,"border","none");
      }
      
      reader.addEventListener("load",(e)=>{
        const img = new Image();
        
        img.src = reader.result;
        
        img.onload = (e)=>{
          $containerIMG.replaceChild($canvas,$(".loading"));
          setPropertyElement($containerIMG,"border","1px solid #fff");
          
          setInfoImg(file,img);
          showImgSelected(e);
        }
        inputElement.remove();
      })
    })
  }
  else if (tool.id === "pixel") {
    toolSelected = Pixel.initTool(getDataOfImgInCanvas());
    
    let zoom = localStorage.getItem("zoomOfPixel"),
    color = localStorage.getItem("colorOfPixel"),
    penzil = localStorage.getItem("penzilOfPixel"),
    eraser = localStorage.getItem("eraserOfPixel");
    
    if (zoom) {
      toolSelected.color = color;
      toolSelected.penzil = Number(penzil);
      toolSelected.eraser = Number(eraser);
      toolSelected.zoom = Number(zoom);
    }
    
    hideOrShowTools($toolsDown,"hide");
    
    const span = document.createElement("SPAN");
    span.textContent = 'Tap the point on which you want to edit pixel';
    span.style.textAlign = "center";
    
    $toolsDown.appendChild(span);
    changePaddingToolDown("7px 0");
    
    $buttonSave.querySelector("img").src = "./icons-svg/correct-signal-svgrepo-com.svg";
    
    hideOrShowButtonOutToMainAplication("show");
    
    disableOrEnableButtonSaveChange("disable");
    
    $canvas.onclick = canvasClicked;
  }
  else if (tool.id === "modifier-pixel") {
    let shrink = shrinkContainerIfIsNecesary();
    
    if (!shrink) $(".modifier-children").classList.toggle("hide");
  }
  else if (tool.id === "close") {
    $(".modifier-children").classList.toggle("hide");
  }
  else if (tool.id === "close-pixel") {
    let shrink = shrinkContainerIfIsNecesary();
    
    if (!shrink) removeToolsPixel();
  }
  else if (tool.id === "resize" || tool.id === "penzil" || tool.id === "eraser") {
    $(".tool-selected")?.classList.remove("tool-selected");
    
    toolSelected.tool = tool.id;
    
    tool.classList.add("tool-selected");
    
    $(".pixel-tool #modifier-pixel").innerHTML = tool.innerHTML;
  }
  else if (tool.id === "back" || tool.id === "next") {
    let {index,layer} = layers;
    
    let indexForApply;
    
    if (tool.id === "next") indexForApply = index + 1 < layer.length ? index + 1 : layer.length - 1;
    else indexForApply = index - 1 >= 0 ? index - 1 : 0;
    
    const $PBUTTONNEXT = $(".tools_down #next p");
    
    const $PBUTTONBACK = $(".tools_down #back p");
    
    layers.index = indexForApply;
    
    let indexShowInNext = (layer.length - 1) - indexForApply;
    
    $PBUTTONBACK.innerText = indexForApply;
    
    $PBUTTONNEXT.innerText = indexShowInNext;
    
    if (indexForApply === 0) {
      $PBUTTONBACK.classList.add("opacity-midle");
      $PBUTTONBACK.previousElementSibling.classList.add("opacity-midle");
    }
    else {
      $PBUTTONBACK.classList.remove("opacity-midle");
      $PBUTTONBACK.previousElementSibling.classList.remove("opacity-midle");
    }
    
    if (indexForApply === layer.length - 1) {
      $PBUTTONNEXT.classList.add("opacity-midle");
      $PBUTTONNEXT.previousElementSibling.classList.add("opacity-midle");
    }
    else {
      $PBUTTONNEXT.classList.remove("opacity-midle");
      $PBUTTONNEXT.previousElementSibling.classList.remove("opacity-midle");
    }
    
    const layerData = layer[indexForApply];
    
    $canvas.width = layerData.width;
    $canvas.height = layerData.height;
    
    putImageData(layerData);
  }
  else if (tool.id === "information") {
    const modalInfo = modalInfoIMG(informationIMG);
    
    insertModalInApp(modalInfo);
    
    const modal = $(".information-modal");
    
    $(".information-modal > button").onclick = e=>removeElementOfDom(modal);
  }
  else if (tool.id === "size-pixel") {
    let shrink = shrinkContainerIfIsNecesary();
    
    if (!shrink) $(".pixel-tool .size-children").classList.toggle("shrink");
  }
  else if (tool.id === "color-pixel") {
    let shrink = shrinkContainerIfIsNecesary();
    
    if (shrink) e.preventDefault();
  }
  else if (tool.id === "eraser-name" || tool.id === "brush-name" || tool.id === "zoom-amount") {
    const typeTool = tool.id.split("-")[0];
    
    let name = `#${typeTool}-name`,
    add = `#${typeTool}-add`,
    subtract = `#${typeTool}-subtract`,
    forChange = "size";
    
    if (typeTool === "zoom") {
      name = "#zoom-amount";
      forChange = "zoom";
    }
    
    const $INPUT = tool.parentElement.nextElementSibling;
    
    let {valueAsNumber,min,max} = $INPUT;
    
    let {x,width} = $INPUT.getBoundingClientRect();
    
    let clientX = Math.ceil(x + ((valueAsNumber - Number(min)) * (width / (Number(max) - Number(min)))));
    
    touchesInputSizeToolForPixel({
      target:$INPUT,
      type:"touchmove",
      touches:[{
        clientX
      }]
    })
    
    toolSelected[`idSetTimeOut-${typeTool}`] = setTimeout(()=>{
      showOrHideButtons(name,add,subtract);
      hideMarkerIfIsNecesary(forChange);
    },2000);
    
    showOrHideButtons(name,add,subtract);
  }
  else if (tool.id === "brush-subtract" || tool.id === "brush-add" || tool.id === "eraser-subtract" || tool.id === "eraser-add" || tool.id === "zoom-subtract" || tool.id === "zoom-add") {
    let [toolToModify,op] = tool.id.split("-");
    
    let forChange = toolToModify === "zoom" ? toolToModify : "size";
    
    clearTimeout(toolSelected[`idSetTimeOut-${toolToModify}`]);
    
    toolSelected[`idSetTimeOut-${toolToModify}`] = setTimeout(()=>{
      showOrHideButtons(toolToModify === "zoom" ? "#zoom-amount" : `#${toolToModify}-name`,`#${toolToModify}-add`,`#${toolToModify}-subtract`);
      hideMarkerIfIsNecesary(forChange);
    },2000);
    
    const $INPUT = tool.parentElement.nextElementSibling;
    
    let {valueAsNumber,min,max} = $INPUT,
    MAX = Number(max),
    MIN = Number(min);
    
    let {x,width} = $INPUT.getBoundingClientRect();
    
    let newValue = valueAsNumber;
    
    if (op === "add" && valueAsNumber + 1 <= MAX) newValue += 1;
    else if (op === "subtract" && valueAsNumber - 1 >= MIN) newValue -= 1;
    
    let distanceBetweenRange = MAX - MIN;
    
    let amountPxForMoveClientX = width / distanceBetweenRange;
    
    let clientX = Math.ceil(x + (newValue - MIN) * amountPxForMoveClientX);
    
    touchesInputSizeToolForPixel({
      target:$INPUT,
      type:"touchmove",
      touches:[{
        clientX
      }]
    })
  }
  else if (tool.id === "zoom-pixel") {
    let shrink = shrinkContainerIfIsNecesary();
    
    if (!shrink) $(".pixel-tool .zoom-children").classList.toggle("shrink");
  }
  else if (tool.id === "crop") {
    const {alltools,grid,curtain,infoSize} = toolsOfCrop(0,0,$canvas.width,$canvas.height);
    hideOrShowTools($toolsDown,"hide");
    
    $toolsDown.insertAdjacentHTML("beforeend",alltools);
    changePaddingToolDown("3px");
    
    const $imgContainer = $(".img");
    setPropertyElement($imgContainer,"--sizeX",`${$canvas.width}px`);
    setPropertyElement($imgContainer,"--sizeY",`${$canvas.height}px`);
    setPropertyElement($imgContainer,"--left",`0px`);
    setPropertyElement($imgContainer,"--top",`0px`);
    
    $imgContainer.insertAdjacentHTML("beforeend",grid);
    $imgContainer.insertAdjacentHTML("beforeend",curtain);
    $aplication.insertAdjacentHTML("beforeend",infoSize);
    
    $(".grid").ontouchstart = touchesGrid
    $(".grid").ontouchend = touchesGrid
    $(".grid").ontouchmove = touchesGrid
    
    let minHeight = 30,
    minWidth = 30,
    maxWidth = $canvas.width,
    maxHeight = $canvas.height;
    
    toolSelected = Crop.initTool(maxWidth,minWidth,maxHeight,minHeight);
    
    const canvas2 = $(".grid #see-panorama");
    
    toolSelected.canvasPanorama = canvas2
    toolSelected.ctxPanorama = canvas2.getContext("2d");
    toolSelected.infoSizeE = $(".aplication > .info-current-size-crop");
    
    showWithOpacityPanorama({
      width:maxWidth,
      height:maxHeight,
      left:0,
      top:0
    });
    
    $buttonSave.querySelector("img").src = "./icons-svg/correct-signal-svgrepo-com.svg";
    
    hideOrShowButtonOutToMainAplication("show");
    
    disableOrEnableButtonSaveChange("disable");
  }
  else if (tool.id === "crop-padlock") {
    const $BUTTON = $(".crop-tool #crop-padlock");
    
    $BUTTON.classList.toggle("tool-selected");
    
    const $GRID = $aplication.querySelector("#container-canvas .grid")
    
    let srcCorrectImage;
    
    if ($BUTTON.classList.contains("tool-selected")) {
      const $CONTAINERCANVAS = $GRID.parentElement;
      
      let width = getPropertyValueElement("--sizeX",$CONTAINERCANVAS);
      
      let height = getPropertyValueElement("--sizeY",$CONTAINERCANVAS);
      
      let minSize = Math.min(width,height);
      
      let xRatio = getAspectRatioNormalize(width / minSize);
      
      let yRatio = getAspectRatioNormalize(height / minSize);
      
      srcCorrectImage = "./icons-svg/icons8-candado.svg";
      
      $GRID.setAttribute("data-aspectratio",`${xRatio}:${yRatio}`);
    }
    else {
      srcCorrectImage = "./icons-svg/icons8-padlock.svg";
      
      $GRID.removeAttribute("data-aspectratio");
      
      $GRID.removeAttribute("data-notresize");
    }
    
    $BUTTON.querySelector("img").src = srcCorrectImage;
  }
  else if (tool.classList.contains("size-crop")) {
    let button = tool.id,
    newWidth,newHeight;
    const $imgC = $(".img");
    const {maxWidth,maxHeight} = toolSelected;
    
    let measurePulseAspectRatioInContainerMoreMeasures = tool.classList.contains("aspect-ratio-in-container-more");
    
    if (measurePulseAspectRatioInContainerMoreMeasures) $CONTAINERMOREASPECTRATIO.classList.remove("scaleY-1");
    
    let ratioX,
    ratioY;
    
    let ratioSizeToApply = {};
    
    const $GRID = $imgC.querySelector(".grid");
    
    if (button === "original") {
      let minSize = Math.min(maxWidth,maxHeight);
      
      let ratioX = getAspectRatioNormalize(maxWidth / minSize);
      
      let ratioY = getAspectRatioNormalize(maxHeight / minSize);
      
      ratioSizeToApply.x = ratioX;
      ratioSizeToApply.y = ratioY;
    }
    else {
      let [xRatio,yRatio] = button.split(":").map(sizeInRatio=>{return Number(sizeInRatio)});
      
      ratioSizeToApply.x = xRatio;
      ratioSizeToApply.y = yRatio;
      
      if (!measurePulseAspectRatioInContainerMoreMeasures) {
        let aspectRatioReverse = `${yRatio}:${xRatio}`;
      
        tool.id = aspectRatioReverse;
        tool.innerText = aspectRatioReverse
      }
    }
    
    $GRID.setAttribute("data-aspectratio",`${ratioSizeToApply.x}:${ratioSizeToApply.y}`);
    
    let ratioOfSizeMin,
    ratioOfSizeMax,
    sizeMax,
    sizeMin;
    
    if (maxWidth < maxHeight) {
      ratioOfSizeMin = ratioSizeToApply.x;
      ratioOfSizeMax = ratioSizeToApply.y
      sizeMin = maxWidth;
      sizeMax = maxHeight;
    }
    else {
      ratioOfSizeMin = ratioSizeToApply.y;
      sizeMin = maxHeight;
      ratioOfSizeMax = ratioSizeToApply.x
      sizeMax = maxWidth;
    }
    
    let sizeToApplyInSizeMin = getSizeToApplyInSizeMinForNotOverflowInSizeHigher(Math.round((80 * sizeMin) / 100),ratioOfSizeMin,sizeMax,ratioOfSizeMax);
    
    let pxOfReferenceForMultiplyRatio = sizeToApplyInSizeMin / ratioOfSizeMin
    
    newWidth = Math.round(pxOfReferenceForMultiplyRatio * ratioSizeToApply.x);
    newHeight = Math.round(pxOfReferenceForMultiplyRatio * ratioSizeToApply.y);
    
    setPropertyElement($imgC,"--left",`${Math.round((maxWidth / 2) - (newWidth / 2))}px`);
    setPropertyElement($imgC,"--top",`${Math.round((maxHeight / 2) - (newHeight / 2))}px`);
      
    setPropertyElement($imgC,"--sizeX",`${newWidth}px`);
    setPropertyElement($imgC,"--sizeY",`${newHeight}px`);
    
    if (newWidth < maxWidth || newHeight < maxHeight) {
      disableOrEnableButtonSaveChange("enable");
    }
    else {
      disableOrEnableButtonSaveChange("disable");
    }
    
    const newSizePositionGrid = {
      width:getPropertyValueElement("--sizeX",$imgC),
      height:getPropertyValueElement("--sizeY",$imgC),
      top:getPropertyValueElement("--top",$imgC),
      left:getPropertyValueElement("--left",$imgC)
    };
    
    showWithOpacityPanorama(newSizePositionGrid);
    changeValueSizeGrid(newSizePositionGrid)
    
    const $padlock = $(".crop-tool #crop-padlock");
    
    $padlock.classList.add("tool-selected")
    
    $padlock.querySelector("img").src = `./icons-svg/icons8-candado.svg`;
  }
  else if (tool.id === "crop-edit") {
    const modalHTML = modalEditSizeCrop().modal;
    
    $aplication.insertAdjacentHTML("beforeend",modalHTML);
    
    const $modalEditSizeCrop = $(".modal-edit-size-crop");
    
    let typeSizeSelected = localStorage.getItem("IDtypeSizeToEditSelected") ?? "crop-ratio";
    
    const $BUTTONAMESIZE = $modalEditSizeCrop.querySelector(`.modal-crop-header button#${typeSizeSelected}`);
    
    let typeOfSeparatorSize = typeSizeSelected === "crop-ratio" ? ":" : "×";
    
    $modalEditSizeCrop.querySelector(".separator-of-measures").innerText = typeOfSeparatorSize;
    
    const {x,width} = $BUTTONAMESIZE.getBoundingClientRect();
    
    setPropertyElement($modalEditSizeCrop,"--leftScroll",`${x - $BUTTONAMESIZE.parentElement.getBoundingClientRect().x}px`)
    
    setPropertyElement($modalEditSizeCrop,"--widthScroll",`${width}px`);
    
    const $CONTAINERGRID = $(".img");
    
    $modalEditSizeCrop.onclick = clickedModalEditSizeCrop;
    
    $BUTTONAMESIZE.classList.add("color-white-low");
    
    let widthCurrentGrid = getPropertyValueElement("--sizeX",$CONTAINERGRID),heightCurrentGrid = getPropertyValueElement("--sizeY",$CONTAINERGRID)
    
    const $INPUTWIDTH = $modalEditSizeCrop.querySelector("#crop-input-width"),
    $INPUTHEIGHT = $modalEditSizeCrop.querySelector("#crop-input-height");
    
    [$INPUTHEIGHT,$INPUTWIDTH].forEach(input=>{
      input.onfocus = (e)=>{
        const $span = e.target.previousElementSibling,
        $parent = e.target.parentElement;
        
        setPropertyElement($span,"color","#3097ff");
        
        if (e.target.value === "") {
          setPropertyElement($parent,"--fontSizeSpan","12px");
          setPropertyElement($parent,"--bottomSpan","30px");
        }
      }
      input.onblur = (e)=>{
        const $span = e.target.previousElementSibling,
        $parent = e.target.parentElement;
        
        setPropertyElement($span,"color","#ffffff70");
        
        if (e.target.value === "") {
          setPropertyElement($parent,"--fontSizeSpan","15px");
          setPropertyElement($parent,"--bottomSpan","4px");
        }
      }
      input.oninput = (e)=>{
        let value = e.target.value;
        if (value.length > 6) e.target.value = value.slice(0,6);
      }
      
      const $span = input.previousElementSibling,
      $parent = input.parentElement;
    })
    
    const $SPANNAMESIZE = $INPUTWIDTH.previousElementSibling;
    const $INPUTWIDTHPARENT = $INPUTWIDTH.parentElement;
    
    setPropertyElement($SPANNAMESIZE,"color","#ffffff70");
    
    setPropertyElement($INPUTWIDTHPARENT,"--fontSizeSpan","12px");
    setPropertyElement($INPUTWIDTHPARENT,"--bottomSpan","30px");
    
    $INPUTHEIGHT.focus();
    
    const $GRID = $CONTAINERGRID.querySelector(".grid");
    
    const {aspectratio} = $GRID.dataset;
    
    let xRatio,yRatio;
    if (aspectratio) [xRatio,yRatio] = aspectratio.split(":").map(ratio=>{return Number(ratio)})
    else {
      let sizeMin = Math.min(widthCurrentGrid,heightCurrentGrid);
      
      let ratioX = getAspectRatioNormalize(widthCurrentGrid / sizeMin);
      
      let ratioY = getAspectRatioNormalize(heightCurrentGrid / sizeMin);
      
      xRatio = ratioX;
      yRatio = ratioY;
    }
    
    if (typeSizeSelected === "crop-ratio") {
      $INPUTWIDTH.value = xRatio
      $INPUTHEIGHT.value = yRatio;
    }
    else {
      $INPUTWIDTH.value = widthCurrentGrid
      $INPUTHEIGHT.value = heightCurrentGrid;
    }
    
    toolSelected.valueMeasureSIZE = {
      sizeX:widthCurrentGrid,
      sizeY:heightCurrentGrid
    }
    
    toolSelected.valueMeasureRATIO = {
      sizeX:xRatio,
      sizeY:yRatio
    }
    
    let nameTypeSizeToEditSelected = typeSizeSelected.split("-")[1];
    
    let allRatioSave= JSON.parse(localStorage.getItem("allRatioSave") ?? "[]");
    
    let allSizesSave = JSON.parse(localStorage.getItem("allSizesSave") ?? "[]");
    
    toolSelected.allRatioSave = allRatioSave;
    toolSelected.allSizesSave = allSizesSave;
    
    showOptionsInCropHistory(nameTypeSizeToEditSelected);
  }
  else if (tool.id === "more-measures-aspect-ratio-of-tool-crop") {
    const $CONTAINERMOREASPECTRATIO = $(".crop-tool .container-more-aspect-ratio");
    
    $CONTAINERMOREASPECTRATIO.classList.toggle("scaleY-1");
  }
  else if (tool.id === "draw") {
    const html = toolsOfDraw();
    
    hideOrShowTools($toolsDown,"hide");
    
    $buttonSave.querySelector("img").src = "./icons-svg/correct-signal-svgrepo-com.svg";
    
    hideOrShowButtonOutToMainAplication("show");
    
    disableOrEnableButtonSaveChange("disable");
    
    $toolsDown.insertAdjacentHTML("beforeend",html.drawtool);
    
    changePaddingToolDown("3px");
    setPropertyElement($toolsDown,"--gapFlex","3px");
    
    addOrRemoveEventElement("addEventListener","touchstart",touchesCanvas,$canvas);
    addOrRemoveEventElement("addEventListener","touchmove",touchesCanvas,$canvas);
    addOrRemoveEventElement("addEventListener","touchend",touchesCanvas,$canvas);
    
    const circle1 = document.createElement("SPAN"),
    circle2 = document.createElement("SPAN"),
    $cursor = document.createElement("SPAN");
    
    circle1.ontouchstart = touchesCircle
    circle2.ontouchstart = touchesCircle
    circle1.ontouchend = touchesCircle;
    circle2.ontouchend = touchesCircle;
    circle1.ontouchmove = touchesCircle;
    circle2.ontouchmove = touchesCircle;
    
    circle1.classList.add("circle-mode-cut","hide");
    circle2.classList.add("circle-mode-cut","hide");
    $cursor.classList.add("cursor-draw");
    
    circle1.setAttribute("id","static");
    circle2.setAttribute("id","move");
    
    let propsModalSettingBorderRoundSHAPE = localStorage.getItem("valuesSettingRoundBorderSHAPESQUAREInDRAW") ?? {
      topLeft:false,
      topRight:false,
      bottomLeft:false,
      bottomRight:false,
      rangeValue:0
    },
    optionsOfPositioningSHAPE = localStorage.getItem("optionsPositioningSHAPE") ?? {
      rotationHandle:true,
      rotationHandleNinetyDeg:false,
      adjustToSpecifiedDegree:false,
      alignmentGuidesEdge:false,
      alignmentGuidesCenter:false
    },
    propsModalEditShapeText = {
      percentageLineSpacing:100,
      directionOfWrite:"start",
      keepAspectRatio:true,
      texts:"",
      fontFamily:{
        type:"className",
        name:"roboto"
      }
    },
    valuesSettingShapeClipPath = localStorage.getItem("valuesSettingShapeClipPath") ?? {
      pointsInBorders:4,
      strokeType:"square"
    },
    valuesCurrentSettingOfShapeArrowIndicator = localStorage.getItem("valuesSettingShapeArrowIndicator") ?? {
      thickness:60,
      tail:0,
      roundTail:false
    }
    
    if (typeof(propsModalSettingBorderRoundSHAPE) === "string") propsModalSettingBorderRoundSHAPE = JSON.parse(propsModalSettingBorderRoundSHAPE)
    
    if (typeof(optionsOfPositioningSHAPE) === "string") optionsOfPositioningSHAPE = JSON.parse(optionsOfPositioningSHAPE);
    
    if (typeof(valuesSettingShapeClipPath) === "string") valuesSettingShapeClipPath = JSON.parse(valuesSettingShapeClipPath);
    
    if (typeof(valuesCurrentSettingOfShapeArrowIndicator) === "string") valuesCurrentSettingOfShapeArrowIndicator = JSON.parse(valuesCurrentSettingOfShapeArrowIndicator);
    
    toolSelected = Draw.initTool(html,circle1,circle2,getDataOfImgInCanvas(),$cursor,propsModalSettingBorderRoundSHAPE,optionsOfPositioningSHAPE,propsModalEditShapeText,valuesSettingShapeClipPath);
    
    toolSelected.valuesSettingShapeArrowIndicator = valuesCurrentSettingOfShapeArrowIndicator;
    
    toolSelected.valuesSettingShapeText.texts = "";
    
    if (localStorage.getItem("borderRoundActivedShapeLine")) toolSelected.valuesSettingThicknessSHAPELINE.borderRoundActived = true;
    
    getValuesCurrentInDraw();
    
    toolSelected.lastShapeDrawSelected = localStorage.getItem("lastShapeDrawSelected") ?? "center"
    
    rotateContainerDependingShape();
    
    const $inputColor = $(".draw-tool #color-draw");
    $inputColor.value = toolSelected.colorCurrent;
    $inputColor.onchange = ({target})=>{
      let color = target.value;
      localStorage.setItem("colorOfDraw",color);
      toolSelected.colorCurrent = color
    }
  }
  else if (tool.id === "options-draw") {
    let $options = $(".options-tool-draw");
    
    if (!$options) {
      const {optionsTool} = toolSelected.htmlChildren;
      $toolsDown.insertAdjacentHTML("afterbegin",optionsTool);
      const {optionselected} = $(".draw-tool #options-draw").dataset;
      
      $(`.options-tool-draw #${optionselected}`).classList.add("tool-selected");
    }
    else $options.remove();
    
  }
  else if (tool.id === "close-option-Draw") $(".options-tool-draw").remove();
  else if (tool.id.endsWith("option-Draw") && tool.id !== "superposition-option-Draw") {
    $("button.tool-selected").classList.remove("tool-selected");
    
    const $toolSelected = tool;
    
    $toolSelected.classList.add("tool-selected");
    
    const $buttonOptions = $(".draw-tool #options-draw");
    
    $buttonOptions.setAttribute("data-optionselected",`${$toolSelected.id}`);
    
    $buttonOptions.innerHTML = $toolSelected.innerHTML;
    
    if ($toolSelected.id.startsWith("lasso") && !$(".img > .circle-mode-cut")) {
      const {noMove,move} = toolSelected.optionCutCircles;
      
      toolSelected.variablesSubtoolLasso = {direction:"move",lines:[],notJoinCircles:false};
      
      $(".img").appendChild(noMove);
      $(".img").appendChild(move);
    }
    else if (!$toolSelected.id.startsWith("lasso") && $(".img > .circle-mode-cut")) removeAndHideCirclesOfLassoTool();
    
    toolSelected.optionSelected = $toolSelected.id.split("-")[0];
    
    if ($toolSelected.id.startsWith("lasso") || $toolSelected.id.startsWith("resize")) $(".img > .mode-of-paint")?.remove();
    else rotateContainerDependingShape();
  }
  else if (tool.id === "superposition-option-Draw") {
    const htmlModal = toolSelected.htmlChildren.modalSuerposition;
    $aplication.insertAdjacentHTML("beforeend",htmlModal);
    
    const $modalSuerposition = $(".modal-draw-superposition");
    $(".modal-draw-superposition #choose-option").innerText = toolSelected.typeSuperpositionDraw.name;
    
    $modalSuerposition.onclick = (e)=>{
      const $button = e.target;
      
      if ($button.id === "apply") {
        let {superposition} = $(".modal-draw-superposition #choose-option").dataset;
        if (superposition) toolSelected.typeSuperpositionDraw = {...JSON.parse(superposition)};
      }
      else if ($button.id === "choose-option") {
        let {superpositionOptionsModal} = toolSelected.htmlChildren;
        $aplication.insertAdjacentHTML("beforeend",superpositionOptionsModal);
        const $modal = $(".modal-choose-superposition");
        $modal.onclick = clickedModalSuperposition;
        
        let {superposition} = $button.dataset;
        superposition = superposition ? JSON.parse(superposition).type : toolSelected.typeSuperpositionDraw.type;
        
        const $containerCircleSelected = $(`.modal-choose-superposition .container-circle[data-value=${superposition}]`);
        
        setPropertyElement($containerCircleSelected,"--scaleCircle","1");
        setPropertyElement($containerCircleSelected,"--colorBorderContainer","var(--BGbuttonSelected)");
      }
      
      if ($button.id === "cancel" || $button.id === "apply" || ($button.classList.contains("modal-draw-superposition") &&  !$(".modal-choose-superposition"))) {
        removeElementOfDom($modalSuerposition);
      }
    }
  }
  else if (tool.id === "size-draw") {
    const {sizesTool} = toolSelected.htmlChildren;
    
    $aplication.insertAdjacentHTML("beforeend",sizesTool);
    
    getValuesCurrentInDraw();
    
    const $modalSizeDraw = $(".modal-sizes-draw");
    
    toolSelected.markerElement = $(".modal-sizes-draw .marker-amount");
    
    let shapeDraw = localStorage.getItem(`lastShapeDrawSelected`) ?? "center",$modeSelected,widthScroll,leftScroll
    
    const {optionselected} = $(".draw-tool #options-draw").dataset;
    
    if (optionselected.startsWith("lasso") || optionselected.startsWith("eraser")) {
      let mode = optionselected.split("-")[0];
      
      $modeSelected = $(`.modal-sizes-draw .header-modal-sizes-draw #${mode}`);
      
      widthScroll = $modeSelected.getBoundingClientRect().width;
      leftScroll = getLeftScroll($modeSelected);
      
      toolSelected.lastModeSelected = mode;
    }
    else {
      $modeSelected = $(`.modal-sizes-draw .header-modal-sizes-draw #brush`);
      
      widthScroll = $modeSelected.getBoundingClientRect().width;
      leftScroll = 0;
      
      toolSelected.lastModeSelected = "brush";
    }
    
    const {lastModeSelected} = toolSelected
    
    modifyCircleWithTheValuesCurrent(lastModeSelected);
    
    const $shapeSelected = $(`.modal-sizes-draw .shapes-draw > #${shapeDraw}`);
    
    if (!$shapeSelected) {
      const $buttonAllShapes = $(".modal-sizes-draw .shapes-draw > #all-shape-draw");
      $buttonAllShapes.classList.add("tool-selected");
      $buttonAllShapes.setAttribute("data-idshape",shapeDraw);
    }
    else $shapeSelected.classList.add("tool-selected");
    
    $modeSelected.classList.add("color-white-low");
      
    setPropertyElement($(`.modal-sizes-draw .header-modal-sizes-draw`),"--leftScroll",leftScroll + "px");
    setPropertyElement($(`.modal-sizes-draw .header-modal-sizes-draw`),"--widthScroll",widthScroll + "px");
    
    $modalSizeDraw.onclick = clickedModalSizeDraw;
    
    $modalSizeDraw.querySelectorAll("input").forEach(input=>{
      input.ontouchmove = eventsOfInput;
      input.ontouchend = eventsOfInput;
      input.ontouchstart = eventsOfInput;
      setValuesInModalSettingToolsDraw(lastModeSelected,input);
    })
  }
  else if (tool.id === "shapes-draw") {
    const $TOOLSHAPES = $(".draw-tool #shapes-draw");
    
    let $OPTIONS = $TOOLSHAPES.querySelector(".options");
    
    if ($OPTIONS) $OPTIONS.classList.toggle("scaleY-1");
    else {
      $TOOLSHAPES.insertAdjacentHTML("beforeend",toolSelected.htmlChildren.optionsShapes);
      
      setTimeout(()=>{
        $TOOLSHAPES.querySelector(".options").classList.add("scaleY-1");
      },0);
    }
  }
  else if (tool.id === "backToolDraw") {
    let {index,layers} = toolSelected.layer
    if (index - 1 >= 0) {
      index -= 1;
      let layer = layers[index];
      clearCanvas();
      putImageData(layer);
      ifToolInDrawIsLassoAndIsActive();
    }
    
    toolSelected.layer.index = index;
    
    if (index === 0) {
      tool.querySelector("img").classList.add("opacity-midle");
      
      disableOrEnableButtonSaveChange("disable");
    }
    
    if (index < (layers.length - 1)) tool.nextElementSibling.querySelector("img").classList.remove("opacity-midle");
  }
  else if (tool.id === "nextToolDraw") {
    let {index,layers} = toolSelected.layer
    
    if (index + 1 < layers.length) {
      index += 1; 
      let layer = toolSelected.layer.layers[index];
      clearCanvas()
      putImageData(layer);
      ifToolInDrawIsLassoAndIsActive();
    }
    
    toolSelected.layer.index = index;
    
    if ((index + 1) === layers.length) tool.querySelector("img").classList.add("opacity-midle");
    
    if (index > 0) {
      tool.previousElementSibling.querySelector("img").classList.remove("opacity-midle");
      disableOrEnableButtonSaveChange("enable");
    }
  }
})

function hideOrShowButtonOutToMainAplication (action) {
  const $BUTTON = $toolsUp.querySelector("#out");
  
  if (action === "hide") $BUTTON.classList.add("visibility-hidden");
  else $BUTTON.classList.remove("visibility-hidden");
}

function getSizeToApplyInSizeMinForNotOverflowInSizeHigher (sizeIntMin,ratioOfSizeMin,sizeMax,ratioOfSizeMax) {
  for (;;) {
    let pxToMultiplyInAspectRatio = sizeIntMin / ratioOfSizeMin;
    
    let newSizeInTheSizeMax = Math.round(pxToMultiplyInAspectRatio * ratioOfSizeMax);
    
    if (sizeIntMin % ratioOfSizeMin === 0 && newSizeInTheSizeMax < sizeMax) return sizeIntMin;
    else sizeIntMin--
  }
}

function getAspectRatioNormalize (ratio) {
  const normalizeRatio = (ratioAsString,ratioAsNumber) => {
    let [numbersInt,numbersFloat] = ratioAsString.split(".");
    
    if (numbersFloat === undefined) numbersFloat = 0;
    
    let amountDecimals = 0
    if (numbersInt.length + numbersFloat.length + 1 > 6) amountDecimals = (6 - numbersInt.length) - 1;
    
    return ratioAsNumber.toFixed(amountDecimals);
  }
  
  return normalizeRatio(ratio.toString(),ratio);
}

function ifToolInDrawIsLassoAndIsActive () {
  let {optionSelected} = toolSelected;
  
  if (optionSelected === "lasso" && !toolSelected.optionCutCircles.noMove.classList.contains("hide")) {
    toolSelected.imgDataBeforeOfStartStroke = getDataOfImgInCanvas();
    drawLines();
    ctx.stroke();
  }
}

function removeAndHideCirclesOfLassoTool () {
  const $circles = $$(".img > .circle-mode-cut");
  
  if ($circles[0] && !$circles[0].classList.contains("hide")) {
    let {index,layers} = toolSelected.layer
    putImageDataCorrectlyInCanvas(layers[index]);
  }
  
  $circles.forEach(circle=>{
    circle.remove();
    circle.classList.add("hide");
  });
}

function rotateContainerDependingShape () {
  let shape = toolSelected["lastShapeDrawSelected"],
  deg;
  
  if (shape === "top-left") deg = -45;
  else if (shape === "top-right") deg = 45;
  else if (shape === "down-right") deg = 135;
  else if (shape === "down-left") deg = -135;
  else if (shape === "top") deg = 0;
  else if (shape === "down") deg = 180;
  else if (shape === "left") deg = -90;
  else if (shape === "right") deg = 90;
  
  if (deg !== undefined) {
    const $img = $(".img");
    let {size,hardness} = toolSelected[toolSelected.optionSelected],
    {lastPoint} = toolSelected;
    
    setPropertyElement($img,"--degRotateModePaint",deg + "deg");
    
    if (!lastPoint) lastPoint = {xTouch:$canvas.width / 2,yTouch:$canvas.height / 2};
    
    if (!$(".img .mode-of-paint") && toolSelected.optionSelected !== "lasso") {
      $img.insertAdjacentHTML("beforeend",toolSelected.htmlChildren.shapeDraw);
      
      const $circleMove = $(".img .mode-of-paint > .fill"),
      $paintButton = $(".img .mode-of-paint > .paint");
    
      $circleMove.ontouchmove = moveShapeDraw;
      $circleMove.ontouchstart = moveShapeDraw;
      $circleMove.ontouchend = moveShapeDraw;
      
      $paintButton.ontouchmove = moveShapeDraw;
      $paintButton.ontouchstart = moveShapeDraw;
    }
    
    let $modeOfPaint;
    if (($modeOfPaint = $(".img .mode-of-paint"))) {
      let radio = ((((size * 100) / 263) * 45) / 100) + 0.6,
      blur = 15 - ((hardness * 15) / 100),diameter,borderRadius;
      
      if (toolSelected.optionSelected === "eraser") {
        diameter = (Math.round(radio) * 2);
        borderRadius = "0";
      }
      else {
        diameter = (radio * 2) + blur;
        borderRadius = "50%";
      }
      
      setPropertyElement($img,"--diameter",diameter + "px");
      setPropertyElement($img,"--borderRadiusPaintCircle",borderRadius);
      
      const positionScreen = $img.getBoundingClientRect(),
      leftScreen = positionScreen.x,
      topScreen = positionScreen.y,
      positionShape = $modeOfPaint.getBoundingClientRect(),
      leftShape = positionShape.x,
      topShape = positionShape.y;
      
      let {xTouch,yTouch} = lastPoint,
      {x,y} = $(".img .mode-of-paint > .paint").getBoundingClientRect(),
      diferenceX = (x - leftScreen) - xTouch,
      diferenceY = (y - topScreen) - yTouch,
      newTop = (topShape - topScreen) - (diferenceY),
      newLeft = (leftShape - leftScreen) - diferenceX;
      
      setPropertyElement($img,"--topShapeOfPaint",newTop + "px");
      setPropertyElement($img,"--leftShapeOfPaint",newLeft + "px");
    }
    
  }
  else $(".img .mode-of-paint")?.remove();
}

function moveShapeDraw (e) {
  let eventType = e.type,
  circle = e.target.className,
  xTouch,yTouch,
  exec = circle === "fill" || circle === "paint";
  
  if (eventType === "touchstart" && exec) {
    let {clientX,clientY} = e.touches[0];
    toolSelected.lastPointCircleShape = {
      clientX,clientY
    };
    if (circle === "fill") callTouchesCanvas(eventType);
  }
  else if (eventType === "touchmove" && exec) {
    const $img = $(".img");
    
    let {clientX,clientY} = e.touches[0],
    diferenceX = clientX - toolSelected.lastPointCircleShape.clientX,
    diferenceY = clientY - toolSelected.lastPointCircleShape.clientY,
    currentX = getPropertyValueElement("--leftShapeOfPaint",$img),
    currentY = getPropertyValueElement("--topShapeOfPaint",$img),
    newX = currentX + diferenceX,
    newY = currentY + diferenceY;
    
    
    setPropertyElement($img,"--leftShapeOfPaint",newX + "px");
    setPropertyElement($img,"--topShapeOfPaint",newY + "px");
    
    toolSelected.lastPointCircleShape = {
      clientX,clientY
    };
    
    if (circle === "fill") callTouchesCanvas(eventType);
  }
  else if (eventType === "touchend" && exec) {
    if (circle === "fill") callTouchesCanvas(eventType);
  }
}

function callTouchesCanvas (eventType) {
  let {x,y,width,height} = $(".img .mode-of-paint .paint").getBoundingClientRect();
  touchesCanvas({type:eventType,touches:[{clientX:x + (width / 2),clientY:y + (height / 2)}],eventfromCircle:true});
}

function clickedModalSuperposition ({target}) {
  let name,type;
  if (target.id === "cancel") {
    const $modal = $(".modal-choose-superposition"),
    $curtainInFiguresModal = $(".figures-modal .curtain-in-figures-modal");
    
    if ($curtainInFiguresModal) removeElementOfDom($curtainInFiguresModal);
    removeElementOfDom($modal);
  }
  else if (target.classList.contains("container-circle")) {
    [name,type] = [target.nextElementSibling.innerText,target.dataset.value];
  }
  else if (target.parentElement.classList.contains("options")) {
    [name,type] = [target.lastElementChild.innerText,target.firstElementChild.dataset.value];
  }
  else if (target.classList.contains("text-value")) {
    [name,type] = [target.innerText,target.previousElementSibling.dataset.value];
  }
  
  let $FIGURESMODAL;
  if (($FIGURESMODAL = $(".figures-modal")) && name) {
    $FIGURESMODAL.setAttribute("data-superposition",JSON.stringify({name,type}));
    
    const $modal = $(".modal-choose-superposition"),
    $curtainInFiguresModal = $(".figures-modal .curtain-in-figures-modal"),
    $buttonSuperposition = $(".figures-modal .tool-fill-outline .footer-container #superposition-shape");
    
    $buttonSuperposition.innerText = name
    
    removeElementOfDom($curtainInFiguresModal)
    ;removeElementOfDom($modal);
    
    return;
  }
  
  if (name) {
    const $buttonChoose = $(".modal-draw-superposition #choose-option");
    $buttonChoose.setAttribute("data-superposition",JSON.stringify({name,type}));
    
    $buttonChoose.innerText = name;
    
    const $modal = $(".modal-choose-superposition");
    removeElementOfDom($modal);
  }
}

//ME MODIFICA EL TAMAÑO Y EL BLUR DE EL CIRCULO DEL MODAL EDITAR TAMAÑOS EN EL HERRAMIENTA DRAW
function modifyCircleWithTheValuesCurrent (modeselected) {
  let sizeCircle,blurCircle;
  if (modeselected === "eraser" || modeselected === "brush") {
    let {size,hardness} = toolSelected[modeselected];
    sizeCircle = (100 / 263) * size;
    blurCircle = modeselected === "brush" ? 30 - ((30 * hardness) / 100) : 0;
  }
  else if (modeselected === "lasso") {
    let {hardness} = toolSelected.lasso;
    sizeCircle = 100;
    blurCircle = 30 - ((30 * hardness) / 100);
  }
  
  const $modal = $(".modal-sizes-draw");
  
  setPropertyElement($modal,"--sizeCircle",sizeCircle + "px");
  setPropertyElement($modal,"--blurCircle",blurCircle + "px");
}

//EN EL MODO DRAW AL ABRIR EL MODAL DE EDICION DE TAMAÑO ME RETURNA EL LEFT DEL SCROLL EN EL MODO SELECCIONADO 
function getLeftScroll ($mode) {
  let left = 0,
  lastBrother = $mode;
  for (;;) {
    let previousElement;
    if ((previousElement = lastBrother.previousElementSibling)) {
      left += previousElement.getBoundingClientRect().width;
      lastBrother = previousElement;
      continue;
    }
    return left;
  }
}

//ESTA FUNCION SE LLAMA CADA VES QUE QUE SE LANCE UNO DE LOS TRES EVENTOS (TOUCHEND,TOUCHMOVE,TOUCHSTART) EN EL INPUT DEL MODAL QUE EDITA LOS TAMAÑOS EN LA HERRAMIENTA DRAW 
function eventsOfInput (e) {
  let midleWidthMarker = 22.5;
  if (e.type === "touchstart") {
    toolSelected["lastValueInput"] = e.target.valueAsNumber;
    toolSelected["movedInput"] = false;
    
    let {clientX,clientY} = e.touches[0]
    ;toolSelected["positionTouch"] = {clientX,clientY};
  }
  else if (e.type === "touchmove") {
    let {clientX,clientY} = e.touches[0]
    ,modalSizePosX = $(".modal-sizes-draw > div").getBoundingClientRect().x,
    currentPositionX = clientX - modalSizePosX,
    {left,width} = e.target.getBoundingClientRect(),
    currenValue = e.target.valueAsNumber
    
    ;left = (left - modalSizePosX) + 2;
    
    toolSelected.markerElement.innerText = currenValue;
    toolSelected.movedInput = true;
    
    clearTimeout(registrationSetTimeOut.idmarkerdraw);
    
    let {lastModeSelected} = toolSelected
    ;toolSelected[lastModeSelected][e.target.id] = currenValue;
    modifyCircleWithTheValuesCurrent(lastModeSelected);
    
    if (currentPositionX >= left && currentPositionX <= (left + width) - 10 && currenValue !== toolSelected.lastValueInput) {
      const $modal = $(".modal-sizes-draw");
      
      setPropertyElement($modal,"--topMarker",`${e.target.id === "size" ? 130 : 160}px`)
      setPropertyElement($modal,"--leftMarker",`${currentPositionX - midleWidthMarker}px`);
      toolSelected.lastValueInput = currenValue;
      
      toolSelected.markerElement.classList.remove("hide");
    }
    
  }
  else if (e.type === "touchend" && toolSelected.movedInput) {
    toolSelected.markerElement.classList.add("hide");
  }
}

//NOS DA LOS VALORES ACTUALES DE ALGUNAS OPCIOMES EN LA HERRAMIENTA DRAW
function getValuesCurrentInDraw () {
  if (localStorage.getItem("brush")) {
    toolSelected.brush = JSON.parse(localStorage.getItem("brush"));
    toolSelected.eraser = JSON.parse(localStorage.getItem("eraser"));
    toolSelected.lasso = JSON.parse(localStorage.getItem("lasso"));
  }
  else {
    toolSelected.brush = {size:1,hardness:0};
    toolSelected.eraser = {size:1};
    toolSelected.lasso = {hardness:0};
  }
  
  let color;
  if ((color = localStorage.getItem("colorOfDraw"))) toolSelected.colorCurrent = color;
  else toolSelected.colorCurrent = "#000";
}

//CADA QUE DEMOS UN CLICK EN EL MODAL DE EDICION DE TAMAÑO EN LA HERRAMIENTA DE DRAW 
function clickedModalSizeDraw ({target}) {
  const $button = target;
  
  let $modalAllShapes = $(".modal-sizes-draw .shapes-draw .all-shapes .all-shapes-of-draw-modal");
  
  if ($modalAllShapes.classList.contains("scaleY-1") && !$button.parentElement.classList.contains("all-shapes-of-draw-modal") && !$button.classList.contains("all-shapes-of-draw-modal")) {
    $modalAllShapes.classList.remove("scaleY-1");
    return;
  }
  
  if ($button.id === "cancel-modal-size-draw") {
    const $modalSizeInDraw = $(".modal-sizes-draw");
    removeElementOfDom($modalSizeInDraw);
    getValuesCurrentInDraw();
    
    ['idsizedraw',"idhardnessdraw","idmarkerdraw"].forEach(id=>{
      clearTimeout(registrationSetTimeOut[id]);
    })
  }
  else if ($button.id === "apply-modal-size-draw") {
    const $modalSizeInDraw = $(".modal-sizes-draw");
    
    let shape = $(".modal-sizes-draw .shapes-draw button.tool-selected");
    
    if (shape.id === "all-shape-draw") shape = shape.dataset.idshape;
    else shape = shape.id;
    
    toolSelected.lastShapeDrawSelected = shape;
    
    localStorage.setItem("lastShapeDrawSelected",shape);
    
    if (toolSelected.optionSelected !== "resize") rotateContainerDependingShape();
    
    localStorage.setItem("brush",JSON.stringify(toolSelected["brush"]));
    localStorage.setItem("lasso",JSON.stringify(toolSelected["lasso"]));
    localStorage.setItem("eraser",JSON.stringify(toolSelected["eraser"]));
    
    ['idsizedraw',"idhardnessdraw","idmarkerdraw"].forEach(id=>{
      clearTimeout(registrationSetTimeOut[id]);
    });
    
    $modalSizeInDraw.remove();
  }
  else if ($button.id === "size-name" || $button.id === "hardness-name") {
    const subtool = $button.id.split("-")[0];
    
    const $INPUT = $button.parentElement.nextElementSibling;
    
    const {left} = $INPUT.getBoundingClientRect();
    
    let leftInit = left - toolSelected.markerElement.parentElement.getBoundingClientRect().left;
    
    let currentValue = $INPUT.valueAsNumber;
    
    let name,add,subtract,id;
    
    [name,add,subtract] = [`.modal-sizes-draw .adjustsize #${subtool}-name`,`.modal-sizes-draw .adjustsize #${subtool}-add`,`.modal-sizes-draw .adjustsize #${subtool}-subtract`];
    
    id = subtool === "size" ? "idsizedraw" : "idhardnessdraw";
    
    const $modal = $(".modal-sizes-draw");
    
    setPropertyElement($modal,"--topMarker",`${subtool === "size" ? 130 : 160}px`);
    setPropertyElement($modal,"--leftMarker",`${leftInit + (currentValue * (subtool === "size" ? 0.90 : 2.35)) - 22.5}px`);
    
    toolSelected.markerElement.innerText = currentValue;
    
    clearTimeout(registrationSetTimeOut.idmarkerdraw);
    
    toolSelected.markerElement.classList.remove("hide");
    
    toolSelected.lastInputModify = subtool;
    
    registrationSetTimeOut[id] = setTimeout(()=>{
      showOrHideButtons(name,add,subtract);
    },1000);
    
    registrationSetTimeOut.idmarkerdraw = setTimeout(()=>{
      toolSelected.markerElement.classList.add("hide");
    },1000);
    
    showOrHideButtons(name,add,subtract);
  }
  else if ($button.id === "size-add" || $button.id === "size-subtract" || $button.id === "hardness-add" || $button.id === "hardness-subtract") {
    const idCorrect = $button.id;
    
    let buttonIdToArray = idCorrect.split("-");
    
    let name,add,subtract,id;
    
    [name,add,subtract] = [`.modal-sizes-draw .adjustsize #${buttonIdToArray[0]}-name`,`.modal-sizes-draw .adjustsize #${buttonIdToArray[0]}-add`,`.modal-sizes-draw .adjustsize #${buttonIdToArray[0]}-subtract`];
    
    id = buttonIdToArray[0] === "size" ? "idsizedraw" : "idhardnessdraw";
    
    addOrSubtractAmountDraw(buttonIdToArray);
    
    toolSelected.markerElement.classList.remove("hide");
    
    clearTimeout(registrationSetTimeOut[id]);
    clearTimeout(registrationSetTimeOut.idmarkerdraw);
    
    registrationSetTimeOut[id] = setTimeout(()=>{
      showOrHideButtons(name,add,subtract);
    },1000);
    
    registrationSetTimeOut.idmarkerdraw = setTimeout(()=>{
      toolSelected.markerElement.classList.add("hide");
    },1000);
  }
  else if ($button.classList.contains("shapes-draw-button") && (!$button.parentElement.classList.contains("all-shapes-of-draw-modal") || ($button.parentElement.classList.contains("all-shapes-of-draw-modal") && $button.parentElement.classList.contains("scaleY-1")))) {
    $(".modal-sizes-draw button.tool-selected").classList.remove("tool-selected");
    if ($button.parentElement.classList.contains("all-shapes-of-draw-modal")) {
      let id = $button.id;
      const shape = $(".modal-sizes-draw .shapes-draw").children[id];
      
      if (shape) shape.classList.add("tool-selected");
      else {
        const $buttonAllShapes = $button.parentElement.parentElement;
        $buttonAllShapes.classList.add("tool-selected");
        $buttonAllShapes.setAttribute("data-idshape",id);
      }
      
      $button.parentElement.classList.remove("scaleY-1");
    }
    else $button.classList.add("tool-selected");
    
  }
  else if ($button.id !== toolSelected.lastModeSelected && ($button.id === "brush" || $button.id === "lasso" || $button.id === "eraser")) {
    
    $$(".modal-sizes-draw .body-modal-sizes-draw .adjustsize input").forEach(input=>{
      setValuesInModalSettingToolsDraw($button.id,input);
    });
    
    $(".modal-sizes-draw .header-modal-sizes-draw button.color-white-low").classList.remove("color-white-low");
    $button.classList.add("color-white-low");
    
    let leftScroll = getLeftScroll($button),widthScroll = $button.getBoundingClientRect().width;
    
    setPropertyElement($(`.modal-sizes-draw .header-modal-sizes-draw`),"--leftScroll",leftScroll + "px");
    setPropertyElement($(`.modal-sizes-draw .header-modal-sizes-draw`),"--widthScroll",widthScroll + "px");
    
    toolSelected.lastModeSelected = $button.id;
    
    modifyCircleWithTheValuesCurrent($button.id);
    
    const $lastInputModify = $(`.modal-sizes-draw .adjustsize input#${toolSelected.lastInputModify}`);
    
    if ($lastInputModify) {
      if (!$lastInputModify.classList.contains("hide") && $lastInputModify.previousElementSibling.firstElementChild.classList.contains("hide")) {
      let newValue = toolSelected[$button.id][toolSelected.lastInputModify],velocity;
      
      let leftInit = $lastInputModify.getBoundingClientRect().left - toolSelected.markerElement.parentElement.getBoundingClientRect().left;
      
      toolSelected.markerElement.innerText = newValue;
      
      setPropertyElement($(".modal-sizes-draw"),"--leftMarker",`${leftInit + (toolSelected.lastInputModify === "size" ? newValue * 0.90 : newValue * 2.35) - 22.5}px`);
    }
      else toolSelected.markerElement.classList.add("hide");
    }
  }
  else if ($button.id === "all-shape-draw") {
    const $MODALALLSHAPESOFDRAW = $(".modal-sizes-draw .shapes-draw .all-shapes .all-shapes-of-draw-modal");
    
    $MODALALLSHAPESOFDRAW.querySelector(".shapes-draw-button.tool-selected")?.classList.remove("tool-selected");
    
    let id;
    if ($button.classList.contains("tool-selected")) id = $button.dataset.idshape;
    else id = $(".modal-sizes-draw button.tool-selected").id;
    
    const inModal = $(".modal-sizes-draw .shapes-draw .all-shapes .all-shapes-of-draw-modal").children[id];
    
    inModal.classList.add("tool-selected");
    
    $MODALALLSHAPESOFDRAW.classList.toggle("scaleY-1");
  }
}

function setValuesInModalSettingToolsDraw (option,input) {
  if (option === "lasso") {
    let methodAction;
    if (input.id === "size") methodAction = "add";
    else {
      methodAction = "remove";
      input.value = toolSelected["lasso"]["hardness"];
    }
    
    input.previousElementSibling.classList[methodAction]("hide");
    input.classList[methodAction]("hide");
  }
  else if (option === "eraser") {
    let methodAction;
    if (input.id === "size") {
      methodAction = "remove";
      input.value = toolSelected["eraser"]["size"];
    }
    else methodAction = "add";
    
    input.previousElementSibling.classList[methodAction]("hide");
    input.classList[methodAction]("hide");
  }
  else {
    input.previousElementSibling.classList.remove("hide");
    input.classList.remove("hide");
    input.value = toolSelected[option][input.id];
  }
  
  if ((option === "eraser" && input.id === "hardness") || (option !== "eraser" && input.id === "size")) {
    const $CONTAINERTOINSERTBEFORE = input.parentElement;
    const $containerMainSettingInputs = $CONTAINERTOINSERTBEFORE.parentElement;
    const $CONTAINERSETTINGOTHER = $containerMainSettingInputs.children[input.id === "hardness" ? "setting-size" : "setting-hardness"];
    
    $containerMainSettingInputs.insertBefore($CONTAINERTOINSERTBEFORE,$CONTAINERSETTINGOTHER);
  }
}



function moveCirclePulsed (circleStatic,circleMove,lastPoint,xTouch,yTouch) {
  setPropertyElement(circleStatic,"left",`${lastPoint.xTouch - 15}px`);
  setPropertyElement(circleStatic,"top",`${lastPoint.yTouch - 15}px`);
  
  setPropertyElement(circleMove,"left",`${xTouch - 15}px`);
  setPropertyElement(circleMove,"top",`${yTouch - 15}px`);
}

//METODO DE LA HERRAMIENTA DRAW 
//SE LLAMA CADA QUE SE LANSE EN UN EVENTO TOUCH AL MOVER UNO DE LOS CIRCULOS EL MODO LASSO
function touchesCircle (e) {
  let eventType = e.type,
  circlePULSED = e.target.id,
  xTouch,yTouch;
  
  if (eventType === "touchmove") {
    let touchOBJ = e.touches[0],
    {x,y} = $(".img").getBoundingClientRect();
    
    [xTouch,yTouch] = [touchOBJ.clientX - x,touchOBJ.clientY - y];
    
    let {variablesSubtoolLasso} = toolSelected,
    {direction} = variablesSubtoolLasso;
    
    if (direction !== circlePULSED) {
    toolSelected.variablesSubtoolLasso["lines"].reverse();
    toolSelected.variablesSubtoolLasso["direction"] = circlePULSED;
    drawLines();
    }
    touchesCanvas({type:"touchMoveCircle",circleElement:e.target,xTouch,yTouch});
  }
  else if (eventType === "touchend") touchesCanvas({type:"touchend"});
}

//METODO DE LA HERRAMIENTA DRAW 
//ME TRAZA LINEAS CON LAS POSICIONES QUE SE ENCUNTRA EN UN ARRAY, DEPENDIENDO DEL CIRCLE QUE PULSAMOS AL ESTAR EN LA OPCION LASSO ME HACE UN REVERSE O NO DEL ARRAY Y EMPEZAMOS A TRASAR
function drawLines (remark) {
  let {variablesSubtoolLasso} = toolSelected,
  {lines} = variablesSubtoolLasso;
  
  ctx.beginPath();
  lines.forEach(({xTouch,yTouch},index)=>{
    if (index === 0) ctx.moveTo(xTouch,yTouch);
    else {
      ctx.lineTo(xTouch,yTouch);
      if (remark) ctx.stroke();
    }
  })
}

//METODO DE LA HERRAMIENTA DRAW
//CAMBEA EL globalCompositeOperation DEPENDIENDO DE LA OPCION ELEGIDA (BRUSH,ERASER,LASSO);
function changeGlobalCompositeOperation (mode) {
  let typeSuperposition;
  if (mode === "eraser" || mode === "lasso") typeSuperposition = "source-over";
  else if (mode === "brush") typeSuperposition = toolSelected.typeSuperpositionDraw.type;
  
  ctx.globalCompositeOperation = typeSuperposition;
}

function shrinkContainerCorrectIfExist (e) {
  const $settingSHAPEMODAL = $(".aplication > .container-setting-SHAPE"),
  $optionsAdjustShape = $(".tools_down .container-tools-adjust-shape .modal-options-adjust-shape"),
  $containerButtonsMoveShape = $(".container-buttons-move-shape"),
  $containerToolsModifyDegShape = $(".container-modify-deg-shape");
  
  if (e?.target.className === "circle-setting-shape-clip-path") return;
  
  let ELEMENTSHRINK;
  if ($settingSHAPEMODAL && !$settingSHAPEMODAL.dataset.shrink) {
    shrinkContainer($settingSHAPEMODAL);
    clearTimeout(toolSelected.idtimeoutmarker);
    hideElementMarkerSettingShape();
    ELEMENTSHRINK = $settingSHAPEMODAL;
  }
  else if ($optionsAdjustShape && !$optionsAdjustShape.dataset.shrink) {
    shrinkContainer($optionsAdjustShape,"lowerOpacity");
    ELEMENTSHRINK = $optionsAdjustShape;
  }
  else if ($containerButtonsMoveShape && !$containerButtonsMoveShape.dataset.shrink) {
    shrinkContainer($containerButtonsMoveShape,"lowerOpacity");
    ELEMENTSHRINK = $containerButtonsMoveShape;
  }
  else if ($containerToolsModifyDegShape && !$containerToolsModifyDegShape.dataset.shrink) {
    shrinkContainer($containerToolsModifyDegShape,"lowerOpacity");
    ELEMENTSHRINK = $containerToolsModifyDegShape;
  }
  
  if (ELEMENTSHRINK) {
    $aplication.setAttribute("data-runningshrinkcontainer","true");
    ELEMENTSHRINK.addEventListener("transitionend",()=>{
      $aplication.removeAttribute("data-runningshrinkcontainer");
    },{once:true})
  }
}

//SE LLAMA CUANDO SE LANSA ALGUN EVENTO TOUCH EN EL CANVAS 
function touchesCanvas (e) {
  let {optionSelected,colorCurrent,lastPoint,propsContainerAdjustShapes} = toolSelected,
  typeEvent = e.type,
  xTouch,yTouch;
  
  shrinkContainerCorrectIfExist();
  
  if (!(optionSelected === "lasso" || ((optionSelected === "brush" || optionSelected === "eraser") && toolSelected.lastShapeDrawSelected === "center") || e.eventfromCircle) || propsContainerAdjustShapes) return;
  
  if (typeEvent === "touchstart" || typeEvent === "touchmove") {
    let touchOBJ = e.touches[0],
    {x,y} = $(".img").getBoundingClientRect();
    
    [xTouch,yTouch] = [touchOBJ.clientX - x,touchOBJ.clientY - y];
    
    if (typeEvent === "touchstart") {
      toolSelected.lastPoint = {xTouch,yTouch};
      toolSelected.moveFingerInCanvas = false;
      
      ctx.filter = "none";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = 1;
      
      changeGlobalCompositeOperation(optionSelected);
      
      if (optionSelected === "lasso") {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
      }
      else if (optionSelected === "brush") {
        let {hardness} = toolSelected[optionSelected],
        blur = 30 - ((30 * hardness) / 100);
        
        let radio = ((((toolSelected.brush.size * 100) / 263) * 45) / 100) + 0.6;
        
        ctx.filter = `blur(${blur}px)`;
        ctx.lineWidth = radio * 2;
        ctx.strokeStyle = colorCurrent;
        
        toolSelected.pointsInCanvasSave = [];
      }
      else if (optionSelected === "eraser") {
        toolSelected.deletedSomething = false;
      }
    }
  }
  
  if (typeEvent === "touchmove") {
    if (optionSelected === "brush" || optionSelected === "eraser") {
      let subtool = toolSelected[optionSelected];
      
      if (toolSelected.lastShapeDrawSelected === "center") adjustCircle(xTouch,yTouch,optionSelected,subtool);
      
      if (optionSelected === "brush") drawBrushInCanvas(xTouch,yTouch);
      else if (optionSelected === "eraser") drawEraserInCanvas(subtool.size,xTouch,yTouch);
    
      toolSelected.lastPoint = {xTouch,yTouch};
      toolSelected.moveFingerInCanvas = true;
    }
    else if (optionSelected === "lasso") {
      const {optionCutCircles,variablesSubtoolLasso} = toolSelected,
      {noMove,move} = optionCutCircles,
      {notJoinCircles} = variablesSubtoolLasso,
      {index,layers} = toolSelected.layer;
      
      if (variablesSubtoolLasso.lines.length === 0) {
        toolSelected.imgDataBeforeOfStartStroke = getDataOfImgInCanvas();
        
        variablesSubtoolLasso.lines.push({xTouch:lastPoint.xTouch,yTouch:lastPoint.yTouch});
        
        noMove.classList.remove("hide");
        move.classList.remove("hide");
      }
      else if (notJoinCircles) return;
      
      clearCanvas();
      putImageData(layers[index]);
      
      drawLines();
      ctx.lineTo(xTouch,yTouch);
      ctx.stroke();
      
      variablesSubtoolLasso.lines.push({xTouch,yTouch});
      
      moveCirclePulsed(noMove,move,lastPoint,xTouch,yTouch);
    }
  }
  else if (typeEvent === "touchend") {
    if (optionSelected === "brush" || optionSelected === "eraser") {
      let subTool = toolSelected[optionSelected];
      
      if (!toolSelected.moveFingerInCanvas && optionSelected === "brush") {
        drawBrushInCanvas(lastPoint.xTouch,lastPoint.yTouch);
      }
      else if (!toolSelected.moveFingerInCanvas && optionSelected === "eraser") drawEraserInCanvas(subTool.size,lastPoint.xTouch,lastPoint.yTouch);
      else if ($(".cursor-draw")) toolSelected.cursor.remove();
      
      if ((optionSelected === "eraser" && toolSelected.deletedSomething) || optionSelected === "brush") {
        saveLayerInToolDraw();
        updateButtonsBNInToolDraw();
      }
      
    }
    else if (optionSelected === "lasso" && !toolSelected.optionCutCircles.noMove.classList.contains("hide")) {
      let {optionCutCircles,colorCurrent,typeSuperpositionDraw} = toolSelected,
      {noMove,move} = optionCutCircles,
      leftCircle1 = getPropertyValueElement("left",move),
      topCircle1 = getPropertyValueElement("top",move),
      leftCircle2 = getPropertyValueElement("left",noMove),
      topCircle2 = getPropertyValueElement("top",noMove),
      sizeCircle = 30,
      overlap = (leftCircle1 + sizeCircle) >= (leftCircle2 + 15) && leftCircle1 <= (leftCircle2 + 15) && (topCircle1 + sizeCircle) >= (topCircle2 + 15) && topCircle1 <= (topCircle2 + 15);
      
      if (overlap) {
        let {imgDataBeforeOfStartStroke,lasso} = toolSelected;
        
        const {layers,index} = toolSelected.layer;
        
        const {hardness} = lasso;
        
        clearCanvas();
        putImageData(layers[index]);
        drawLines();
        
        ctx.filter = `blur(${30 - ((30 * hardness) / 100)}px)`;
        ctx.globalCompositeOperation = typeSuperpositionDraw.type;
        ctx.fillStyle = colorCurrent;
        
        ctx.closePath();
        ctx.fill();
        
        saveLayerInToolDraw();
        updateButtonsBNInToolDraw();
        
        move.classList.add("hide");
        noMove.classList.add("hide");
  
        toolSelected.variablesSubtoolLasso.notJoinCircles = false;
        toolSelected.variablesSubtoolLasso.lines = [];
        toolSelected.variablesSubtoolLasso.direction = "move";
      }
      else toolSelected.variablesSubtoolLasso.notJoinCircles = true;
    }
  }
  else if (typeEvent === "touchMoveCircle") {
    let {circleElement,xTouch,yTouch} = e;
    
    const {index,layers} = toolSelected.layer;
    
    clearCanvas();
    putImageData(layers[index]);
    
    drawLines();
    ctx.lineTo(xTouch,yTouch);
    ctx.stroke();
    
    toolSelected.variablesSubtoolLasso.lines.push({xTouch,yTouch});
    
    setPropertyElement(circleElement,"left",`${xTouch - 15}px`);
    setPropertyElement(circleElement,"top",`${yTouch - 15}px`);
  }
}

function adjustCircle (xTouch,yTouch,optionSelected,subtool) {
  let {cursor} = toolSelected,
  radio = ((((subtool.size * 100) / 263) * 45) / 100) + 0.6,
  blur = 15 - ((subtool.hardness * 15) / 100),topCircle,leftCircle;
  
  if (optionSelected === "brush") {
    topCircle = yTouch - (radio + (blur / 2));
    leftCircle = xTouch - (radio + (blur / 2));
  }
  else {
    let {startY,startX} = getPropertysOfPointInCanvas(xTouch,yTouch,Math.round(radio));
    
    topCircle = startY;
    leftCircle = startX;
  }
  
  setPropertyElement(cursor,"top",`${topCircle}px`);
  setPropertyElement(cursor,"left",`${leftCircle}px`);
  
  if (!toolSelected.moveFingerInCanvas) {
    let size,borderRadius;
    if (optionSelected === "brush") {
      size = (radio * 2) + blur;
      borderRadius = "50%";
    }
    else {
      let {startX,endX} = getPropertysOfPointInCanvas(xTouch,yTouch,Math.round(radio));
      size = endX - startX;
      borderRadius = "0";
    }
    
    setPropertyElement(cursor,"width",`${size}px`);
    setPropertyElement(cursor,"height",`${size}px`);
    setPropertyElement(cursor,"border-radius",`${borderRadius}`);
    
    $(".img").appendChild(cursor);
  }
}

function saveLayerInToolDraw () {
  let {index,layers} = toolSelected.layer;
  
  toolSelected.layer.layers = layers.slice(0,index + 1);
  
  toolSelected.layer.index += 1
  
  toolSelected.layer.layers.push(getDataOfImgInCanvas());
  
  disableOrEnableButtonSaveChange("enable")
}

function updateButtonsBNInToolDraw () {
  const {backToolDraw,nextToolDraw} = $(".draw-tool").children;
  nextToolDraw.querySelector("img").classList.add("opacity-midle");
  backToolDraw.querySelector("img").classList.remove("opacity-midle");
}

function drawPixelntoEraser (currentProp) {
  let {startX,endX,startY,endY,centerXInt,centerYInt} = currentProp,
  pixelsInTop = [];
  
  const dataIMGoriginal = toolSelected["layer"]["layers"][0],
  datIMGCurrent = toolSelected["layer"]["layers"][toolSelected.layer.index];
  
  for (let Y = startY;Y <= endY;Y++) {
    if (Y < 0) continue;
    else if (Y >= dataIMGoriginal.height) break;
    
    if (toolSelected.lastShapeDrawSelected.split("-").length === 2) {
      let amountInX = Y - startY;
      startX = centerXInt - amountInX;
      endX = centerXInt + amountInX;
    
      if (Y < centerYInt) pixelsInTop.push([startX,endX]);
      else if (Y > centerYInt) {
        let indexLastItem = pixelsInTop.length - 1,positions = pixelsInTop[indexLastItem];
      
        if (positions?.length > 0) {
          startX = positions[0];
          endX = positions[1];
        }
        
        pixelsInTop = pixelsInTop.slice(0,indexLastItem);
      }
    }
    
    for (let X = startX;X <= endX;X++) {
      if (X < 0) continue;
      else if (X >= dataIMGoriginal.width) break;
      let positionPx = getPositionPixel(X,Y,dataIMGoriginal),
      r = dataIMGoriginal.data[positionPx],
      g = dataIMGoriginal.data[positionPx + 1],
      b = dataIMGoriginal.data[positionPx + 2],
      r2 = datIMGCurrent.data[positionPx],
      g2 = datIMGCurrent.data[positionPx + 1],
      b2 = datIMGCurrent.data[positionPx + 2];
      
      if (r !== r2 || g !== g2 || b !== b2) {
        let colorHEX = "#" + hex(r) + hex(g) + hex(b);
        ctx.fillStyle = colorHEX;
        ctx.fillRect(X,Y,1,1);
        toolSelected.deletedSomething = true;
      }
    }
  }
}

function joinSquare (currentProp,previousProp,radio) {
  let startX,endX,startY,endY;
  
  if (currentProp.startX <= previousProp.endX) {}
  else {
    startX = previousProp.endX;
    endX = currentProp.startX;
  }
  
  if (currentProp.endX >= previousProp.startX) {}
  else {
    startX = currentProp.endX;
    endX = previousProp.startX;
  }
  
  if (currentProp.startY <= previousProp.endY) {}
  else {
    startY = previousProp.endY;
    endY = currentProp.startY;
  }
  
  if (currentProp.endY >= previousProp.startY) {}
  else {
    startY = currentProp.endY;
    endY = previousProp.startY
  }
  
  if (startY === undefined && startX === undefined) return;
  else if (startY !== undefined && startX === undefined) {
    startX = currentProp.startX;
    endX = currentProp.endX;
  }
  else if (startX !== undefined && startY === undefined) {
    startY = currentProp.startY;
    endY = currentProp.endY;
  }
  
  drawPixelntoEraser({startX,endX,startY,endY});
}

function getPropertysOfPointInCanvas (x,y,radioInt) {
  let centerXInt = Math.round(x),
  centerYInt = Math.round(y),
  startY = centerYInt - radioInt,
  endY = centerYInt + radioInt,
  startX = centerXInt - radioInt,
  endX = centerXInt + radioInt;
  return {
    centerXInt,
    centerYInt,
    startY,
    endY,
    startX,
    endX
  }
}

function drawEraserInCanvas (size,x,y) {
  let {lastPoint} = toolSelected,
  radioInt = Math.round(((((size * 100) / 263) * 45) / 100) + 0.6),
  currentProp = getPropertysOfPointInCanvas(x,y,radioInt),
  previousProp = getPropertysOfPointInCanvas(lastPoint.xTouch,lastPoint.yTouch,radioInt);
  
  
  joinSquare(currentProp,previousProp,radioInt);
  drawPixelntoEraser(currentProp);
  
}

function drawBrushInCanvas (xInCanvas,yInCanvas) {
  
  const {index,layers} = toolSelected.layer,LAYERSEE = layers[index],
  {pointsInCanvasSave} = toolSelected;
  
  clearCanvas();
  putImageData(LAYERSEE);
  
  ctx.beginPath();
  if (pointsInCanvasSave.length > 0) {
    for (let point of pointsInCanvasSave) {
      let [x,y] = point;
      ctx.lineTo(x,y);
    }
  }
  
  ctx.lineTo(xInCanvas,yInCanvas);
  ctx.stroke();
  
  pointsInCanvasSave.push([xInCanvas,yInCanvas]);
}

//AUMENTA O DECREMENTA EL VALUE DEL INPUT EN EL MODO DRAW DENTRO DEL MODAL DE EDICION DE TAMAÑO
function addOrSubtractAmountDraw ([typeTool,method]) {
  
  const $MODALMAIN = $aplication.children["setting-sizes-tools"];
  
  let $input = $(`.modal-sizes-draw .adjustsize input#${typeTool}`),
  {valueAsNumber} = $input;
  
  const {left} = $input.getBoundingClientRect();
  
  let leftInit = left - toolSelected.markerElement.parentElement.getBoundingClientRect().left;
  
  setPropertyElement($MODALMAIN,"--topMarker",`${typeTool === "size" ? 130 : 160}px`);
  
  $input.value = method === "add" ? valueAsNumber + 1 : valueAsNumber - 1;
  
  let newValue = $input.valueAsNumber;
  
  let leftDinamic = typeTool === "size" ? newValue * 0.90 : newValue * 2.35;
  
  setPropertyElement($MODALMAIN,"--leftMarker",`${leftInit + leftDinamic - 22.5}px`);
  
  toolSelected.markerElement.innerText = newValue;
  
  let {lastModeSelected} = toolSelected;
  toolSelected[lastModeSelected][typeTool] = newValue;
  
  modifyCircleWithTheValuesCurrent(lastModeSelected);
  
  toolSelected.lastInputModify = typeTool;
}

//ME MUESTRA EL HISTORIAL DE LAS OPCIONES DE TAMAÑO EN EL MODAL DE TAMAÑO EN LA HERRAMIENTA CROP 
function showOptionsInCropHistory (OPTIONSIZECURRENT) {
  const $containerHistory = $(".modal-edit-size-crop .modal-crop-history");
  
  $containerHistory.querySelectorAll(".crop-history-option").forEach($OPTION=>{$OPTION.remove()})
  
  const $BUTTONREMOVESIZESSAVE = $(".modal-edit-size-crop #crop-clear-history");
  
  let allValuesOfTypeMeasureCurrent,
  separatorOfMeasures;
  
  if (OPTIONSIZECURRENT === "ratio") {
    allValuesOfTypeMeasureCurrent = toolSelected.allRatioSave;
    separatorOfMeasures = ":";
  } else {
    allValuesOfTypeMeasureCurrent = toolSelected.allSizesSave;
    separatorOfMeasures = "x";
  }
  
  allValuesOfTypeMeasureCurrent.forEach(({xSize,ySize},index)=>{
    $containerHistory.insertAdjacentHTML("afterbegin",`<span class="crop-history-option" data-indexsize="${index}">${xSize} ${separatorOfMeasures} ${ySize}</span>`);
  })
  
  if (allValuesOfTypeMeasureCurrent.length > 0) $BUTTONREMOVESIZESSAVE.classList.remove("hide");
  else $BUTTONREMOVESIZESSAVE.classList.add("hide");
}

//REVISANDO LOS BOTONES CLICKEADO EN EL MODAL DEL MODO CROP AL EDITAR EL TAMAÑO DEL CROP 
function clickedModalEditSizeCrop (e) {
  const $button = e.target,
  $headerModal = $(".modal-edit-size-crop .modal-crop-header"),
  $previousModeSelected = e.currentTarget.querySelector(".modal-crop-header button.color-white-low");
  
  const changePropertysInputSize = ($INPUTS) => {
    $INPUTS.forEach(input=>{
      const $span = input.previousElementSibling,
      $parent = input.parentElement;
      
      setPropertyElement($span,"color","#ffffff70");
      setPropertyElement($parent,"--fontSizeSpan","12px");
      setPropertyElement($parent,"--bottomSpan","30px");
    })
  }
  
  let optionClicked = $button.id;
  
  if ($button.id !== $previousModeSelected.id && (optionClicked === "crop-ratio" || optionClicked === "crop-size")) {
    let {width,x} = $button.getBoundingClientRect();
    
    let leftScrollBar = x - $button.parentElement.getBoundingClientRect().x;
    
    const $modalEditSizeCrop = e.currentTarget,
    $ELEMENTTOSHOWMESURESOUTOFRANGE = e.currentTarget.querySelector("#message-modal-crop-size");
    
    setPropertyElement($modalEditSizeCrop,"--leftScroll",`${leftScrollBar}px`);
    setPropertyElement($modalEditSizeCrop,"--widthScroll",`${width}px`);
    
    $previousModeSelected.classList.remove("color-white-low");
    
    $button.classList.add("color-white-low");
    
    $modalEditSizeCrop.querySelector(".separator-of-measures").innerText = optionClicked === "crop-ratio" ? ":" : "×";
    
    let typeOfMeasureBefore = $previousModeSelected.id;
    
    let valueOfMeasureToShow,
    typeOfMeasureBeforeForSaveValues;
    
    if (typeOfMeasureBefore === "crop-ratio") {
      typeOfMeasureBeforeForSaveValues = toolSelected.valueMeasureRATIO;
      valueOfMeasureToShow = toolSelected.valueMeasureSIZE;
    } else {
      typeOfMeasureBeforeForSaveValues = toolSelected.valueMeasureSIZE;
      valueOfMeasureToShow = toolSelected.valueMeasureRATIO;
    }
    
    const $INPUTWIDTH = $modalEditSizeCrop.querySelector("#crop-input-width"),
    $INPUTHEIGHT = $modalEditSizeCrop.querySelector("#crop-input-height");
    
    typeOfMeasureBeforeForSaveValues.sizeX = isNaN($INPUTWIDTH.valueAsNumber) ? 0 : $INPUTWIDTH.valueAsNumber;
    typeOfMeasureBeforeForSaveValues.sizeY = isNaN($INPUTHEIGHT.valueAsNumber) ? 0 : $INPUTHEIGHT.valueAsNumber;
    
    $INPUTWIDTH.value = valueOfMeasureToShow.sizeX;
    $INPUTHEIGHT.value = valueOfMeasureToShow.sizeY;
    
    changePropertysInputSize([$INPUTWIDTH,$INPUTHEIGHT]);
    
    let typeMeasure = optionClicked.split("-")[1];
    
    showOptionsInCropHistory(typeMeasure);
    
    let messageOfRangeAccept = toolSelected[`messageOfRangeSizeAccept-${typeMeasure}`];
    
    if (messageOfRangeAccept) {
      $ELEMENTTOSHOWMESURESOUTOFRANGE.innerText = messageOfRangeAccept;
      $ELEMENTTOSHOWMESURESOUTOFRANGE.classList.remove("hide");
    }
    else $ELEMENTTOSHOWMESURESOUTOFRANGE.classList.add("hide");
  }
  else if ($button.id === "crop-cancel" || $button.id === "parent") {
    delete toolSelected["messageOfRangeSizeAccept-ratio"];
    delete toolSelected["messageOfRangeSizeAccept-size"];
    
    localStorage.setItem("allRatioSave",JSON.stringify(toolSelected.allRatioSave));
    
    localStorage.setItem("allSizesSave",JSON.stringify(toolSelected.allSizesSave));
    
    localStorage.setItem("IDtypeSizeToEditSelected",$previousModeSelected.id);
    
    removeElementOfDom(e.currentTarget);
  }
  else if ($button.id === "crop-apply") {
    const $modalEditSizeCrop = e.currentTarget,
    $containerIMG = $(".img"),
    {maxHeight,maxWidth,minWidth,minHeight} = toolSelected,
    sizeAndPositionGridBefore = {
      top:getPropertyValueElement("--top",$containerIMG),
      left:getPropertyValueElement("--left",$containerIMG),
      width:getPropertyValueElement("--sizeX",$containerIMG),
      height:getPropertyValueElement("--sizeY",$containerIMG)
    };
    
    const $GRID = $containerIMG.querySelector(".grid");
    
    const getSizeToApplyInSizeMin = (sizeMin,ratioOfSizeMin,sizeMax,ratioOfSizeMax) => {
      for (;;) {
        let pxToMultiplyInAspectRatio = Math.round(sizeMin / ratioOfSizeMin);
    
        let newSizeInTheSizeMax = Math.round(pxToMultiplyInAspectRatio * ratioOfSizeMax);
    
        if (newSizeInTheSizeMax < sizeMax && newSizeInTheSizeMax > 5) return sizeMin;
        else if (sizeMin === 1) return "outOfRange";
        else sizeMin--
      }
    }
    
    const showMessageOfRangeSizeAccept = (typeSize,sizeX,sizeY) => {
      const $messageShow = $modalEditSizeCrop.querySelector("#message-modal-crop-size");
      
      let textMessage;
      if (typeSize === "size") textMessage = `Possible range: 1 × 1 ~ ${sizeX} × ${sizeY}`;
      else textMessage = `Possible range:${sizeX} ~ ${sizeY}`;
      
      $messageShow.innerText = textMessage;
      
      toolSelected[`messageOfRangeSizeAccept-${typeSize}`] = textMessage;
      
      $messageShow.classList.remove("hide")
    }
    
    const resizeAndMoveGrid = () => {
      let {width,left,top,height} = sizeAndPositionGridBefore;
      
      let diferenceBetweenWidthSize = newWidthGrid - width;
      
      let diferenceBetweenHeightSize = newHeightGrid - height;
      
      let newLeftGrid = Math.floor(left - (diferenceBetweenWidthSize / 2))
      
      let newTopGrid = Math.floor(top - (diferenceBetweenHeightSize / 2))
      
      if (newLeftGrid < 0) newLeftGrid = 0;
      
      if (newTopGrid < 0) newTopGrid = 0;
      
      if (newLeftGrid + newWidthGrid > maxWidth) newLeftGrid -= (newLeftGrid + newWidthGrid) - maxWidth;
      
      if (newTopGrid + newHeightGrid > maxHeight) newTopGrid -= (newTopGrid + newHeightGrid) - maxHeight;
      
      setPropertyElement($containerIMG,"--top",newTopGrid + "px");
      setPropertyElement($containerIMG,"--left",newLeftGrid + "px");
      
      setPropertyElement($containerIMG,"--sizeX",newWidthGrid + "px");
      setPropertyElement($containerIMG,"--sizeY",newHeightGrid + "px");
    }
    
    const dependingSizeToApplyActivedOrDesactivedButtonSave = () => {
      if (newHeightGrid < maxHeight || newWidthGrid < maxWidth) disableOrEnableButtonSaveChange("enable");
      else disableOrEnableButtonSaveChange("disable");
    }
    
    const showGridWithNewsMeasures = () => {
      removeElementOfDom($modalEditSizeCrop);
      
      const newSizePositionGrid = {
      width:getPropertyValueElement("--sizeX",$containerIMG),
      height:getPropertyValueElement("--sizeY",$containerIMG),
      top:getPropertyValueElement("--top",$containerIMG),
      left:getPropertyValueElement("--left",$containerIMG)
      }
      
      showWithOpacityPanorama(newSizePositionGrid);
      
      changeValueSizeGrid(newSizePositionGrid);
      
      const $padlock = $(".crop-tool #crop-padlock"),
      $ICON = $padlock.querySelector("img");
      
      $padlock.classList.add("tool-selected");
      
      $ICON.src = "./icons-svg/icons8-candado.svg";
      
      delete toolSelected["messageOfRangeSizeAccept-ratio"];
      delete toolSelected["messageOfRangeSizeAccept-size"];
    }
    
    const saveSizeToApplyInTheMeasureIndicate = (allSizesSavedInOptionToApply,xSize,ySize) => {
      if (allSizesSavedInOptionToApply.length === 5) allSizesSavedInOptionToApply.shift();
      
      let indexOfSizeRepeat = allSizesSavedInOptionToApply.findIndex(sizes=>sizes.xSize === xSize && sizes.ySize === ySize);
      
      if (indexOfSizeRepeat !== -1) allSizesSavedInOptionToApply.splice(indexOfSizeRepeat,1);
      
      allSizesSavedInOptionToApply.push({
        xSize,
        ySize
      })
    }
    
    const optionTypeMeasureToApply = $modalEditSizeCrop.querySelector(".modal-crop-header button.color-white-low").id.split("-")[1];
    
    const $INPUTWIDTH = $modalEditSizeCrop.querySelector("#crop-input-width"),
    $INPUTHEIGHT = $modalEditSizeCrop.querySelector("#crop-input-height");
    
    let valueWidth = $INPUTWIDTH.valueAsNumber,
    valueHeight = $INPUTHEIGHT.valueAsNumber;
    
    valueWidth = isNaN(valueWidth) ? 0 : valueWidth;
    valueHeight = isNaN(valueHeight) ? 0 : valueHeight;
    
    let newWidthGrid,newHeightGrid;
    
    if (optionTypeMeasureToApply === "size") {
      if (valueWidth === 0 || valueHeight === 0 || valueWidth > maxWidth || valueHeight > maxHeight) showMessageOfRangeSizeAccept(optionTypeMeasureToApply,maxWidth,maxHeight);
      else {
        newWidthGrid = valueWidth;
        newHeightGrid = valueHeight;
        
        saveSizeToApplyInTheMeasureIndicate(toolSelected.allSizesSave,newWidthGrid,newHeightGrid);
        
        localStorage.setItem("allSizesSave",JSON.stringify(toolSelected.allSizesSave));
        
        localStorage.setItem("IDtypeSizeToEditSelected",$previousModeSelected.id);
        
        dependingSizeToApplyActivedOrDesactivedButtonSave();
        
        resizeAndMoveGrid();
        
        showGridWithNewsMeasures();
        
        $GRID.removeAttribute("data-aspectratio");
        $GRID.setAttribute("data-notresize","true");
      }
      return;
    }
    
    let existBeforeValueOfInputWithCero;
    if (valueWidth === 0) {
      valueWidth = 1;
      existBeforeValueOfInputWithCero = true;
    }
    if (valueHeight === 0) {
      valueHeight = 1;
      existBeforeValueOfInputWithCero = true;
    }
    
    let minSize,ratioOfSizeMin,maxSize,ratioOfSizeMax,maxSizeInAxisOfGrid;
    
    if (maxWidth < maxHeight) {
      minSize = maxWidth;
      ratioOfSizeMin = valueWidth;
      maxSize = maxHeight;
      ratioOfSizeMax = valueHeight;
      maxSizeInAxisOfGrid = maxHeight;
    } else {
      minSize = maxHeight
      ratioOfSizeMin = valueHeight;
      maxSize = maxWidth
      ratioOfSizeMax = valueWidth;
      maxSizeInAxisOfGrid = maxWidth;
    }
    
    let sizeToApplyInMinSize = getSizeToApplyInSizeMin(Math.round((80 * minSize) / 100),ratioOfSizeMin,maxSize,ratioOfSizeMax);
    
    if (sizeToApplyInMinSize === "outOfRange" || existBeforeValueOfInputWithCero) {
      let ratioX,ratioY;
      
      let sizeApplyInMinSize = Math.round((80 * minSize) / 100);
      
      if (maxWidth < maxHeight) {
        ratioX = 1
        ratioY = getAspectRatioNormalize(maxHeight / sizeApplyInMinSize)
      }
      else {
        ratioY = 1;
        ratioX = getAspectRatioNormalize(maxWidth / sizeApplyInMinSize);
      }
      
      showMessageOfRangeSizeAccept(optionTypeMeasureToApply,ratioX,ratioY);
    }
    else {
      let pxForMultiplyRatio = sizeToApplyInMinSize / ratioOfSizeMin;
      
      newWidthGrid = Math.round(pxForMultiplyRatio * valueWidth);
      newHeightGrid = Math.round(pxForMultiplyRatio * valueHeight);
      
      saveSizeToApplyInTheMeasureIndicate(toolSelected.allRatioSave,valueWidth,valueHeight);
      
      localStorage.setItem("allRatioSave",JSON.stringify(toolSelected.allRatioSave));
      
      localStorage.setItem("IDtypeSizeToEditSelected",$previousModeSelected.id);
      
      resizeAndMoveGrid();
      
      dependingSizeToApplyActivedOrDesactivedButtonSave();
      
      showGridWithNewsMeasures();
      
      $GRID.setAttribute("data-aspectratio",`${valueWidth}:${valueHeight}`);
    }
  }
  else if ($button.classList.contains("crop-history-option")) {
    const indexOfSize = Number($button.dataset.indexsize);
    
    const $INPUTSIZEWIDTH = e.currentTarget.querySelector("#crop-input-width"),
    $INPUTSIZEHEIGHT = e.currentTarget.querySelector("#crop-input-height");
    
    changePropertysInputSize([$INPUTSIZEWIDTH,$INPUTSIZEHEIGHT]);
    
    let {xSize,ySize} = $previousModeSelected.id === "crop-ratio" ? toolSelected.allRatioSave[indexOfSize] : toolSelected.allSizesSave[indexOfSize];
    
    $INPUTSIZEWIDTH.value = xSize;
    $INPUTSIZEHEIGHT.value = ySize;
  }
  else if ($button.id === "crop-exchange-value" || $button.parentElement.id === "crop-exchange-value") {
    const $INPUTWIDTH = e.currentTarget.querySelector("#crop-input-width");
    
    const $INPUTHEIGHT = e.currentTarget.querySelector("#crop-input-height");
    
    if (isNaN($INPUTHEIGHT.valueAsNumber) || isNaN($INPUTWIDTH.valueAsNumber)) {
      let variablesToChange = toolSelected[$previousModeSelected.id === "crop-size" ? "valueMeasureSIZE" : "valueMeasureRATIO"];
      
      let valueSizeX = variablesToChange.sizeX;
      
      let {sizeX,sizeY} = variablesToChange
      
      $INPUTWIDTH.value = sizeX;
      $INPUTHEIGHT.value = sizeY;
      
      changePropertysInputSize([$INPUTWIDTH,$INPUTHEIGHT]);
      
      variablesToChange.sizeX = variablesToChange.sizeY;
      variablesToChange.sizeY = valueSizeX;
    }
    
    let widthValue = $INPUTWIDTH.valueAsNumber;
    
    $INPUTWIDTH.value = $INPUTHEIGHT.valueAsNumber;
    $INPUTHEIGHT.value = widthValue;
  }
  else if ($button.id === "crop-clear-history") {
    const htmlModal = modalEditSizeCrop()["modalClearHistory"];
    $(".modal-edit-size-crop > div").insertAdjacentHTML("beforeend",htmlModal);
  }
  else if ($button.id === "clear-DELETEALLHISTORY") {
    if ($previousModeSelected.id === "crop-ratio") toolSelected.allRatioSave = [];
    else toolSelected.allSizesSave = [];
    
    showOptionsInCropHistory($previousModeSelected.id.split("-")[1]);
    
    $(".modal-edit-size-crop .modal-in-modal-crop").remove();
  }
  else if ($button.id === "cancel-DELETEALLHISTORY") {
    $(".modal-edit-size-crop .modal-in-modal-crop").remove();
  }
  else if ($button.id === "label-width" || $button.id === "label-height") $button.nextElementSibling.focus();
  
}

//ME VERIFICA SI LA NUEVA OPCION CREADA SE REPITE CON UNO YA EXISTENTE EN LAS OPCIONES DEL HISTORIAL DE EL MODO CROP EN LA SUBHERRAMIENTA EDITAR
function hasOptionDuplicate (history,newWidth,newHeight) {
  newHeight = Number(newHeight);
  newWidth = Number(newWidth); 
  for (let optionH of history) {
    let {width,height} = JSON.parse(optionH.dataset.sizes);
    
    width = Number(width);
    height = Number(height);
    
    if (width === newWidth && height === newHeight) {return optionH}
  }
}

//OBTENER EL WIDTH O EL HEIGHT DE UN ELEMENTO HTML 
function getPropertyValueElement (prop,element) {
  return Number(getComputedStyle(element).getPropertyValue(prop).split("px")[0]);
}

//APLICAMOS UN VALOR A LA PROPIEDAD PASADA COMO ARGUMENTO DE UN ELEMENTO DADO
function setPropertyElement (element,prop,value) {
  element.style.setProperty(prop,value);
}

//REDIMENSIONA EL GRID EN LA HERRAMIENTA CROP EN EL MODO BLOQUEDO;
function resizeInModeLocked ($parentGrid,direction,left,width,top,height,minWidth,minHeight,maxWidth,maxHeight,velocity) {
  let velocityX,
  velocityY;
  
  if (direction === "right" || direction === "left") velocityX = Math.floor(velocity);
  else if (direction === "up" || direction === "down") velocityY = Math.floor(velocity);
  
  if (direction === "right") {
    if (left + width + (velocityX * 1.5) <= maxWidth && width + (velocityX * 1.5) >= minWidth) {
      if (height + (velocityX * 1.5) > minHeight) {
      setPropertyElement($parentGrid,"--sizeX",`${width + (velocityX * 1.5)}px`);
      setPropertyElement($parentGrid,"--top",`${top - velocityX < 0  ? 0 : top - velocityX}px`);
      setPropertyElement($parentGrid,"--sizeY",`${top + height + (velocityX * 1.5) > maxHeight ? (maxHeight - top) + 2 : height + (velocityX * 1.5)}px`);
      }
    }
    else if (width + (velocityX * 1.5) < minWidth && width !== minWidth && height + (velocityX * 1.5) > minHeight) {
      setPropertyElement($parentGrid,"--top",`${top - velocityX < 0  ? 0 : top - velocityX}px`);
      setPropertyElement($parentGrid,"--sizeX",`${minWidth}px`);
      setPropertyElement($parentGrid,"--sizeY",`${top + height + (velocityX * 1.5) > maxHeight ? (maxHeight - top) + 2 : height + (velocityX * 1.5)}px`);
    }
    else if (left + width + (velocityX * 1.5) > maxWidth && left + width !== maxWidth) {
      setPropertyElement($parentGrid,"--top",`${top - velocityX < 0  ? 0 : top - velocityX}px`);
      setPropertyElement($parentGrid,"--sizeX",`${maxWidth - left}px`);
      setPropertyElement($parentGrid,"--sizeY",`${top + height + (velocityX * 1.5) > maxHeight ? (maxHeight - top) + 2 : height + (velocityX * 1.5)}px`);
    }
  }
  else if (direction === "left") {
    if (left + (velocityX * 1.5) >= 0 && width - (velocityX * 1.5) >= minWidth) {
      if (height - (velocityX * 1.5) > minHeight) {
      setPropertyElement($parentGrid,"--left",`${left + (velocityX * 1.5)}px`);
      setPropertyElement($parentGrid,"--sizeX",`${width - (velocityX * 1.5)}px`);
      setPropertyElement($parentGrid,"--top",`${top + velocityX < 0  ? 0 : top + velocityX}px`);
      setPropertyElement($parentGrid,"--sizeY",`${top + height - (velocityX * 1.5) > maxHeight ? (maxHeight - top) + 2 : height - (velocityX * 1.5)}px`);
      }
    }
    else if (width - (velocityX * 1.5) < minWidth && width !== minWidth && height - (velocityX * 1.5) > minHeight) {
      setPropertyElement($parentGrid,"--left",`${left + (velocityX * 1.5)}px`);
      setPropertyElement($parentGrid,"--sizeX",`${minWidth}px`);
      setPropertyElement($parentGrid,"--top",`${top + velocityX < 0  ? 0 : top + velocityX}px`);
      setPropertyElement($parentGrid,"--sizeY",`${top + height - (velocityX * 1.5) > maxHeight ? (maxHeight - top) + 2 : height - (velocityX * 1.5)}px`);
    }
    else if (left + (velocityX * 1.5) < 0 && left !== 0) {
      setPropertyElement($parentGrid,"--left",`${0}px`);
      setPropertyElement($parentGrid,"--sizeX",`${left + width > maxWidth ? maxWidth - left : left + width}px`);
      setPropertyElement($parentGrid,"--top",`${top - left < 0  ? 0 : top - left}px`);
      setPropertyElement($parentGrid,"--sizeY",`${top + height + left > maxHeight ? (maxHeight - top) + 2 : height + left}px`);
    }
  }
  else if (direction === "down") {
    if (top + height + (velocityY * 1.5) <= maxHeight && height + (velocityY * 1.5) >= minHeight) {
      if (width + (velocityY * 1.5) > minWidth) {
      setPropertyElement($parentGrid,"--sizeY",`${height + (velocityY * 1.5)}px`);
      setPropertyElement($parentGrid,"--left",`${left - velocityY < 0 ? 0 : left - velocityY}px`);
      setPropertyElement($parentGrid,"--sizeX",`${left + width + (velocityY * 1.5) > maxWidth ? maxWidth - left + 2 : width + (velocityY * 1.5)}px`);
      }
    }
    else if (height + (velocityY * 1.5) < minHeight && height !== minHeight && width + (velocityY * 1.5) > minWidth) {
      setPropertyElement($parentGrid,"--left",`${left - velocityY}px`);
      setPropertyElement($parentGrid,"--sizeX",`${width + (velocityY * 1.5)}px`);
      setPropertyElement($parentGrid,"--sizeY",`${minHeight}px`);
    }
    else if (top + height + (velocityY * 1.5) > maxHeight && top + height !== maxHeight) {
      setPropertyElement($parentGrid,"--left",`${left - velocityY < 0  ? 0 : left - velocityY}px`);
      setPropertyElement($parentGrid,"--sizeX",`${left + width + (velocityY * 1.5) > maxWidth ? (maxWidth - left) + 2 : width + (velocityY * 1.5)}px`);
      setPropertyElement($parentGrid,"--sizeY",`${maxHeight - top}px`);
    }
  }
  else if (direction === "up") {
    if (top + (velocityY * 1.5) >= 0 && height - (velocityY * 1.5) >= minHeight) {
      if (width - (velocityY * 1.5) > minWidth) {
      setPropertyElement($parentGrid,"--top",`${top + (velocityY * 1.5)}px`);
      setPropertyElement($parentGrid,"--sizeY",`${height - (velocityY * 1.5)}px`);
      setPropertyElement($parentGrid,"--left",`${left + velocityY < 0 ? 0 : left + velocityY}px`);
      setPropertyElement($parentGrid,"--sizeX",`${left + width - (velocityY * 1.5) > maxWidth ? maxWidth - left + 2 : width - (velocityY * 1.5)}px`);
      }
    }
    else if (height - (velocityY * 1.5) < minHeight && height > minHeight && width - (velocityY * 1.5) > minWidth) {
      let diferenceY = height - minHeight,
      newWidth = width - (diferenceY * 2);
      
      setPropertyElement($parentGrid,"--top",`${top + diferenceY}px`);
      setPropertyElement($parentGrid,"--left",`${left + diferenceY}px`);
      setPropertyElement($parentGrid,"--sizeX",`${newWidth < minWidth ? minWidth : newWidth}px`);
      setPropertyElement($parentGrid,"--sizeY",`${height - diferenceY}px`);
    }
    else if (top + (velocityY * 1.5) < 0 && top > 0) {
      setPropertyElement($parentGrid,"--top",`${0}px`);
      setPropertyElement($parentGrid,"--left",`${left + velocityY < 0  ? 0 : left + velocityY}px`);
      setPropertyElement($parentGrid,"--sizeX",`${left + width - (velocityY * 1.5) > maxWidth ? (maxWidth - left) + 2 : width - (velocityY * 1.5)}px`);
      setPropertyElement($parentGrid,"--sizeY",`${height + top}px`);
    }
  }
}

function getPxAddedInSizeGrid (directionPulsing,clientX,lastClientX,clientY,lastClientY) {
  let pxAddedInWidth,
  pxAddedInHeight;
  
  let directionY = directionPulsing,directionX = directionPulsing;
  
  if (directionPulsing === "right") {
    pxAddedInWidth = clientX - lastClientX;
  }
  else if (directionPulsing === "top-right") {
    pxAddedInWidth = clientX - lastClientX
    pxAddedInHeight = lastClientY - clientY
  }
  else if (directionPulsing === "top") {
    pxAddedInHeight = lastClientY - clientY
  }
  else if (directionPulsing === "left") {
    pxAddedInWidth = lastClientX - clientX;
  }
  else if (directionPulsing === "top-left") {
    pxAddedInWidth = lastClientX - clientX
    pxAddedInHeight = lastClientY - clientY
  }
  else if (directionPulsing === "bottom-left") {
    pxAddedInWidth = lastClientX - clientX
    pxAddedInHeight = clientY - lastClientY
  }
  else if (directionPulsing === "bottom") {
    pxAddedInHeight = clientY - lastClientY
  }
  else if (directionPulsing === "bottom-right") {
    pxAddedInWidth = clientX - lastClientX
    pxAddedInHeight = clientY - lastClientY
  }
  
  let [directionInY,directionInX] = directionPulsing.split("-");
  
  if (directionInX) {
    directionY = directionInY;
    directionX = directionInX;
  }
  
  let pxAddInSize = {};
  
  if (pxAddedInHeight !== undefined) {
    pxAddInSize.pxAddedInHeight = pxAddedInHeight;
    pxAddInSize.directionY = directionY;
  }
  
  if (pxAddedInWidth !== undefined) {
    pxAddInSize.pxAddedInWidth = pxAddedInWidth;
    pxAddInSize.directionX = directionX;
  }
  
  return pxAddInSize;
}

function resizeGridInWidth (pxAddedInWidth,direction,$GRIDPARENT,currentWidth,leftGrid) {
  const {maxWidth,minWidth} = toolSelected;
  
  let pxToINT = Math.round(pxAddedInWidth);
  
  let nextWidth = currentWidth + pxToINT;
  
  if (nextWidth < currentWidth && currentWidth < minWidth) return;
  
  if (direction === "right" && leftGrid + nextWidth <= maxWidth && (nextWidth >= minWidth || currentWidth < minWidth)) {
    setPropertyElement($GRIDPARENT,"--sizeX",`${nextWidth}px`);
  }
  else if (direction === "right" && nextWidth < currentWidth) {
    setPropertyElement($GRIDPARENT,"--sizeX",`${minWidth}px`);
  }
  else if (direction === "right") {
    let pxAddedForLimit = maxWidth - (leftGrid + currentWidth);
    setPropertyElement($GRIDPARENT,"--sizeX",`${currentWidth + pxAddedForLimit}px`);
  }
  else if (direction === "left" && (leftGrid - pxToINT) >= 0 && (nextWidth >= minWidth || currentWidth < minWidth)) {
    setPropertyElement($GRIDPARENT,"--left",`${leftGrid - pxToINT}px`);
    setPropertyElement($GRIDPARENT,"--sizeX",`${nextWidth}px`);
  }
  else if (direction === "left" && nextWidth < currentWidth) {
    let diferenceForMinWidth = currentWidth - minWidth;
    
    setPropertyElement($GRIDPARENT,"--left",`${leftGrid + diferenceForMinWidth}px`);
    setPropertyElement($GRIDPARENT,"--sizeX",`${currentWidth - diferenceForMinWidth}px`);
  }
  else if (direction === "left") {
    setPropertyElement($GRIDPARENT,"--left",`${leftGrid - leftGrid}px`);
    setPropertyElement($GRIDPARENT,"--sizeX",`${currentWidth + leftGrid}px`);
  }
}

function resizeGridInHeight (pxAddedInHeight,direction,$GRIDPARENT,currentHeight,topGrid) {
  const {maxHeight,minHeight} = toolSelected;
  
  let pxToINT = Math.round(pxAddedInHeight)
  
  let nextHeight = currentHeight + pxToINT;
  
  if (nextHeight < currentHeight && currentHeight < minHeight) return;
  
  if (direction === "bottom" && (topGrid + nextHeight) <= maxHeight && (nextHeight >= minHeight || currentHeight < minHeight)) {
    setPropertyElement($GRIDPARENT,"--sizeY",`${nextHeight}px`);
  }
  else if (direction === "bottom" && nextHeight < currentHeight) {
    setPropertyElement($GRIDPARENT,"--sizeY",`${minHeight}px`);
  }
  else if (direction === "bottom") {
    let pxAddedForLimit = maxHeight - (topGrid + currentHeight);
    setPropertyElement($GRIDPARENT,"--sizeY",`${currentHeight + pxAddedForLimit}px`);
  }
  else if (direction === "top" && (topGrid - pxToINT) >= 0 && (nextHeight >= minHeight || currentHeight < minHeight)) {
    setPropertyElement($GRIDPARENT,"--top",`${topGrid - pxToINT}px`);
    setPropertyElement($GRIDPARENT,"--sizeY",`${nextHeight}px`);
  }
  else if (direction === "top" && nextHeight < currentHeight) {
    let diferenceForMinHeight = currentHeight - minHeight;
    
    setPropertyElement($GRIDPARENT,"--top",`${topGrid + diferenceForMinHeight}px`);
    setPropertyElement($GRIDPARENT,"--sizeY",`${minHeight}px`);
  }
  else if (direction === "top") {
    setPropertyElement($GRIDPARENT,"--top",`${topGrid - topGrid}px`);
    setPropertyElement($GRIDPARENT,"--sizeY",`${currentHeight + topGrid}px`);
  }
}

function resizeGridWithAspectRatioDependingOfAxis ($GRIDPARENT,currentSizeAxis,currentSizeAxisContrary,ratioOfAxisMoving,ratioOfAxisContrary,pxAddedInAxis,maxSizeAxisContrary,maxSizeAxisMoving,sizeToModifyOfAxis,directionInToResizeAxis,directionOfAxisForMovePosition,currentPositionInAxisMoving,currentPositionInAxisContrary,nameAxisContraryForMove,nameSizeOfAxisContraryForResize,resizeInAxis,minSizeAxisMoving,minSizeAxisContrary) {
  let nextSizeOfAxisMoving = currentSizeAxis + Math.round(pxAddedInAxis);
  
  let nextSizeOfAxisContrary = Math.round((nextSizeOfAxisMoving / ratioOfAxisMoving) * ratioOfAxisContrary);
  
  if (nextSizeOfAxisMoving < currentSizeAxis && nextSizeOfAxisContrary <= minSizeAxisContrary) return;
  
  let nextPositionAxisContrary = currentPositionInAxisContrary - Math.round((nextSizeOfAxisContrary - currentSizeAxisContrary) / 2);
  
  if (nextPositionAxisContrary < 0) nextPositionAxisContrary = 0;
  
  let overFlowInAxisContrary;
  if (nextPositionAxisContrary + nextSizeOfAxisContrary >= maxSizeAxisContrary && nextPositionAxisContrary === 0) overFlowInAxisContrary = true;
  else if (nextPositionAxisContrary + nextSizeOfAxisContrary > maxSizeAxisContrary) {
    nextPositionAxisContrary = maxSizeAxisContrary - nextSizeOfAxisContrary;
    
    if (nextPositionAxisContrary < 0) overFlowInAxisContrary = true;
  }
  
  let newPositionAxisContrary,
  newSizeAxisContrary;
  
  //ESTO INDICA QUE EL TAMAÑO YA A SUPERADO AL TAMAÑO MAXIMO DE REFERENCIA DE SU EJE • LA CONDICION 1
  if (overFlowInAxisContrary) {
    let sizeForKeepAspectRatioOfAxis = Math.round((maxSizeAxisContrary / ratioOfAxisContrary) * ratioOfAxisMoving);
    
    if (currentPositionInAxisMoving + sizeForKeepAspectRatioOfAxis > maxSizeAxisMoving) {
      sizeForKeepAspectRatioOfAxis = maxSizeAxisMoving - currentPositionInAxisMoving;
      
      newSizeAxisContrary = Math.round((sizeForKeepAspectRatioOfAxis / ratioOfAxisMoving) * ratioOfAxisContrary);
    } 
    else if (directionInToResizeAxis === directionOfAxisForMovePosition && (currentPositionInAxisMoving - (sizeForKeepAspectRatioOfAxis - currentSizeAxis)) < 0) {
      sizeForKeepAspectRatioOfAxis = currentSizeAxis + currentPositionInAxisMoving;
      
      newSizeAxisContrary = Math.round((sizeForKeepAspectRatioOfAxis / ratioOfAxisMoving) * ratioOfAxisContrary);
    }
    else newSizeAxisContrary = maxSizeAxisContrary;
    
    setPropertyElement($GRIDPARENT,sizeToModifyOfAxis,`${sizeForKeepAspectRatioOfAxis}px`)
    
    if (directionInToResizeAxis === directionOfAxisForMovePosition) setPropertyElement($GRIDPARENT,`--${directionOfAxisForMovePosition}`,`${currentPositionInAxisMoving - (sizeForKeepAspectRatioOfAxis - currentSizeAxis)}px`);
    
    newPositionAxisContrary = Math.round((maxSizeAxisContrary / 2) - (newSizeAxisContrary / 2));
  }
  else {
    resizeInAxis(pxAddedInAxis,directionInToResizeAxis,$GRIDPARENT,currentSizeAxis,currentPositionInAxisMoving);
    
    let newSizeOfAxisMoving = getPropertyValueElement(sizeToModifyOfAxis,$GRIDPARENT);
    
    let pxForMultiplyRatioOfAxisContrary = newSizeOfAxisMoving / ratioOfAxisMoving;
    
    newSizeAxisContrary = Math.round(pxForMultiplyRatioOfAxisContrary * ratioOfAxisContrary);
    
    let diferenceInSizeOfAxisContrary = newSizeAxisContrary - currentSizeAxisContrary;
    
    newPositionAxisContrary = currentPositionInAxisContrary - Math.round((diferenceInSizeOfAxisContrary / 2));
    
    if (newPositionAxisContrary < 0) newPositionAxisContrary = 0;
    
    if (newPositionAxisContrary + newSizeAxisContrary > maxSizeAxisContrary) newPositionAxisContrary -= (newPositionAxisContrary +  newSizeAxisContrary) - maxSizeAxisContrary
  }
  
  setPropertyElement($GRIDPARENT,`--${nameAxisContraryForMove}`,`${newPositionAxisContrary}px`);
  
  setPropertyElement($GRIDPARENT,`${nameSizeOfAxisContraryForResize}`,`${newSizeAxisContrary}px`);
}

function resizeGridWithAspectRatio (aspectratio,pxToAddedInSizes,currentWidth,currentHeight,leftGrid,topGrid,$GRIDPARENT) {
  const {maxHeight,maxWidth,minWidth,minHeight} = toolSelected
  
  let [ratioX,ratioY] = aspectratio.split(":").map(ratio=>{return Number(ratio)});
  
  let resizeInWidth = ("pxAddedInWidth" in pxToAddedInSizes),
  resizeInHeight =  ("pxAddedInHeight" in pxToAddedInSizes);
  
  if ((resizeInWidth && resizeInHeight) || resizeInWidth) {
    const {directionX,pxAddedInWidth} = pxToAddedInSizes;
    
    let directionInAxisX = resizeGridWithAspectRatioDependingOfAxis ($GRIDPARENT,currentWidth,currentHeight,ratioX,ratioY,pxAddedInWidth,maxHeight,maxWidth,"--sizeX",directionX,"left",leftGrid,topGrid,"top","--sizeY",resizeGridInWidth,minWidth,minHeight);
  }
  else {
    const {directionY,pxAddedInHeight} = pxToAddedInSizes;
    
    resizeGridWithAspectRatioDependingOfAxis ($GRIDPARENT,currentHeight,currentWidth,ratioY,ratioX,pxAddedInHeight,maxWidth,maxHeight,"--sizeY",directionY,"top",topGrid,leftGrid,"left","--sizeX",resizeGridInHeight,minHeight,minWidth)
  }
}

function moveGridContainerWithoutOverflow (pxToMove,positionCurrent,size,sizeMaxOfReference,namePositionToChange,$GRIDPARENT) {
  let nextPositionInStartIsLess = pxToMove + positionCurrent < 0,
  nextPositionInEndIsHigher = pxToMove + positionCurrent + size > sizeMaxOfReference;
  
  if (!nextPositionInStartIsLess && !nextPositionInEndIsHigher) {
    setPropertyElement($GRIDPARENT,namePositionToChange,`${positionCurrent + pxToMove}px`);
  }
  else if (nextPositionInStartIsLess) {
    setPropertyElement($GRIDPARENT,namePositionToChange,`0px`);
  }
  else if (nextPositionInEndIsHigher) {
    setPropertyElement($GRIDPARENT,namePositionToChange,`${sizeMaxOfReference - size}px`);
  }
}

//SE LLAMA CADA VEZ QUE EL GRID SE PULSE CUANDO ESTAMOS EN LA HERRAMIENTA CROP - CORTAR
function touchesGrid (e) {
  const typeEvent = e.type,
  $parentGrid = $(".img"),
  width = getPropertyValueElement("--sizeX",$parentGrid),
  height = getPropertyValueElement("--sizeY",$parentGrid),
  left = getPropertyValueElement("--left",$parentGrid),
  top = getPropertyValueElement("--top",$parentGrid);
  
  const $CONTAINERMOREASPECTRATIO = $(".crop-tool .container-more-aspect-ratio");
  
  if ($CONTAINERMOREASPECTRATIO.classList.contains("scaleY-1")) {
    $CONTAINERMOREASPECTRATIO.classList.remove("scaleY-1");
    e.currentTarget.setAttribute("data-preventmovement","true");
    return;
  }
  else if (e.currentTarget.dataset.preventmovement && e.type === "touchmove") return;
  else if (e.currentTarget.dataset.preventmovement && e.type === "touchend") {
    e.currentTarget.removeAttribute("data-preventmovement");
    return;
  }
  
  const $GRID = $parentGrid.querySelector(".grid");
  
  let touches = typeEvent !== "touchend" ? e.touches[0] : {};
  
  let directionPulsing = e.target.id;
  
  if (directionPulsing === "") return;
  
  if (typeEvent === "touchstart") {
    toolSelected.lastClientX = touches.clientX;
    toolSelected.lastClientY = touches.clientY;
    return;
  }
  else if (typeEvent === "touchend") return
  
  const {clientX,clientY} = touches;
  
  const {lastClientX,lastClientY} = toolSelected;
  
  let sizesToResize = getPxAddedInSizeGrid(directionPulsing,clientX,lastClientX,clientY,lastClientY);
  
  toolSelected.lastClientX = clientX;
  toolSelected.lastClientY = clientY;
  
  let {aspectratio,notresize} = $GRID.dataset;
  
  if (directionPulsing === "move-grid") {
    let {pxAddedInWidth,pxAddedInHeight} = getPxAddedInSizeGrid("bottom-right",clientX,lastClientX,clientY,lastClientY);
    
    const {maxWidth,maxHeight} = toolSelected;
    
    moveGridContainerWithoutOverflow (Math.round(pxAddedInWidth),left,width,maxWidth,"--left",$parentGrid);
    moveGridContainerWithoutOverflow (Math.round(pxAddedInHeight),top,height,maxHeight,"--top",$parentGrid);
  }
  else if (aspectratio) resizeGridWithAspectRatio(aspectratio,sizesToResize,width,height,left,top,$parentGrid);
  else if (!notresize) {
    if ("pxAddedInWidth" in sizesToResize) resizeGridInWidth(sizesToResize.pxAddedInWidth,sizesToResize.directionX,$parentGrid,width,left);
    
    if ("pxAddedInHeight" in sizesToResize) resizeGridInHeight(sizesToResize.pxAddedInHeight,sizesToResize.directionY,$parentGrid,height,top);
  }
  
  let newSizeGrid = {
    width:getPropertyValueElement("--sizeX",$parentGrid),
    height:getPropertyValueElement("--sizeY",$parentGrid),
    top:getPropertyValueElement("--top",$parentGrid),
    left:getPropertyValueElement("--left",$parentGrid)
  },
  maxW = toolSelected.maxWidth,
  maxH = toolSelected.maxHeight;
  
  if (newSizeGrid.width < maxW || newSizeGrid.height < maxH) disableOrEnableButtonSaveChange("enable");
  else disableOrEnableButtonSaveChange("disable");
  
  showWithOpacityPanorama(newSizeGrid);
  changeValueSizeGrid(newSizeGrid);
}

//CAMBIA EL INNER TEXT DE EL ELEMENTO QUE NOS MUESTRA EL TAMAÑO Y LA POSICION DEL GRID EN LA HERRAMIENTA CROP
function changeValueSizeGrid ({left,top,width,height}) {
  toolSelected.infoSizeE.innerText = `${left},${top} - ${width} × ${height}`
}

//LO QUE HACE ES MOSTRARME EL CANVAS QUE ESTA EN EL GRID
function showWithOpacityPanorama ({width,height,top,left}) {
  const dataPanorama = ctx.getImageData(left,top,width,height);
  
  const {canvasPanorama,ctxPanorama} = toolSelected;
  
  canvasPanorama.width = dataPanorama.width
  canvasPanorama.height = dataPanorama.height;
  
  ctxPanorama.putImageData(dataPanorama,0,0);
}

//MUESTRA O OCULTA LOS BOTONES DE SUMAR Y RESTAR EN EL TAMAÑO DE LA HERRAMIENTA SELECCIONADA ACTUALMENTE
function showOrHideButtons (name,add,subtract) {
  $(subtract)?.classList.toggle("hide");
  $(add)?.classList.toggle("hide");
  $(name)?.classList.toggle("hide");
}

//INSERTA MODAL PASADO COMO ARGUMENTO EN LA APLICACION
function insertModalInApp (modal) {
  $aplication.insertAdjacentHTML("beforeend",modal);
}

//ELIMINA LAS HERRAMIENTAS DE EL MODO PIXEL
function removeToolsPixel () {
  $(".modifier-children").remove();
  $(".pixel-tool").remove();
  $(".tools_down .container-buttons-change-layer").remove();
  
  $toolsDown.lastElementChild.classList.remove("hide");
  changePaddingToolDown("7px 0");
  $toolsDown.style.setProperty("--gapFlex","5px");
  //VOLVEMOS A ESCUCHAR EL EVENTO CLICK DE CANVAS
  $canvas.onclick = canvasClicked;
  //ELIMINAMOS LOS EVENTOS DE TOUCH DEL CANVAS
  $canvas.ontouchstart = null;
  $canvas.ontouchmove = null;
  $canvas.ontouchend = null;
  
  let {index,layers} = toolSelected.layers;
  
  let [imgEditing] = layers[index];
  
  putImageDataCorrectlyInCanvas(imgEditing)
}

//MOSTRAMOS O OCULTAMOS LAS HERRAMIENTAS DE ABAJO SEGUN LA OPCION RECIBIDA
function hideOrShowTools (parent,option) {
  for (let element of Array.from(parent.children)) {
    if (option === "hide") element.classList.add("hide");
    else if (option === "show") element.classList.remove("hide");
  }
}

//CAMBIAMOS EL PADDING DEL CONTENEDOR DE HERRAMIENTAS DOWN 
function changePaddingToolDown (padding) {
  $toolsDown.style.setProperty("--padding",padding);
}

//MUESTRA LA IMAGEN QUE HEMOS SELECCIONADO
function showImgSelected (e) {
  const img = e.target;
  
  let {newHeightImg,newWidthImg} = adjustImg(img.width,img.height);
  
  img.width = newWidthImg;
  img.height = newHeightImg;
  
  $canvas.width = newWidthImg;
  $canvas.height = newHeightImg;
  
  ctx.drawImage(img,0,0,newWidthImg,newHeightImg);
  
  const originalIMG = getDataOfImgInCanvas();
  
  layers.index = 0;
  layers.layer = [originalIMG];
  
  const $pNext = $("#next p"),
  $imgNext = $pNext.previousElementSibling;
  
  const $pBack = $("#back p"),
  $imgBack = $pBack.previousElementSibling;
  
  [$pNext,$pBack,$imgBack,$imgNext].forEach($element=>{
    $element.classList.add("opacity-midle")
  })
  
  $pNext.innerText = 0;
  $pBack.innerText = 0;
}

//AJUSTA EL TAMAÑO DE LA IMAGEN PARA QUE SE MUESTRE CON UN TAMAÑO ADECUADO CON UN WIDTH <= 350
function adjustImg (width,height) {
  let percentageHeightInWidth = (height * 100) / width,
  percentageWidthInHeight = (width * 100) / height;
  
  let newWidthImg = 350,
  newHeightImg = (percentageHeightInWidth * newWidthImg) / 100;
  
  if (newHeightImg > 450) {
    newHeightImg = 450;
    newWidthImg = (percentageWidthInHeight * newHeightImg) / 100;
  }
  
  return {newHeightImg,newWidthImg}
}

//OBTIENE LOS DATOS DE LA IMAGEN ACTUAL EN EL CANVAS 
function getDataOfImgInCanvas () {
  return ctx.getImageData(0,0,$canvas.width,$canvas.height);
}

//OBTIENE LA POCICION DE EL PIXEL EN EL EJE INDICADO 
function getPositionPixel (x,y,imgInData) {
  return (imgInData.width*4*y)+(x*4);
}

//LIMPIA EL CANVAS 
function clearCanvas () {
  ctx.clearRect(0,0,$canvas.width,$canvas.height);
}

//CONVIERTE UN VALOR DE COLOR RGB EN HEX 
function hex(n) {
  return n.toString(16).padStart(2, "0");
}

//DIBUAJA UNA IMAGEN A PARTIR DE UN OBJETO DE CANVAS IMAGE
function putImageData (imgData) {
  ctx.putImageData(imgData,0,0);
}