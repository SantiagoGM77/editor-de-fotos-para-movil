export function toolsToEditPixels () {
  return {
  html:`
  <div class='pixel-tool'>
  <button id="modifier-pixel">
    <img src="./icons-svg/brush-sharp-svgrepo-com.svg" alt="icon paint">
  </button>
  <input type="color" id="color-pixel">
  <button id="size-pixel">
    <img src="./icons-svg/circle-dot-svgrepo-com.svg" alt="icon sizes tool">
  </button>
  <button id="zoom-pixel">
    <img src="./icons-svg/setting-svgrepo-com.svg" alt="zoom">
  </button>
  <button id="close-pixel">
    <img src="./icons-svg/close-svgrepo-com.svg" alt="icon close">
  </button>
  <div class="zoom-children shrink">
    <div>
      <button>
      <span id="zoom-amount"></span>
      <span id="zoom-subtract" class=" subtract hide">
        <img src="./icons-svg/subtract-svgrepo-com.svg" alt="icon subtract">
      </span>
      <span id="zoom-add" class="add hide">
        <img src="./icons-svg/add-svgrepo-com.svg" alt="icon add">
      </span>
      </button>
      <input type="range" min="10" max="30" id="zoom-range">
    </div>
    <p class='marker-zoom hide'>4px</p>
  </div>
  <div class="size-children shrink">
    <div>
      <button>
      <span id="brush-name">Brush</span>
      <span id="brush-subtract" class=" subtract hide">
        <img src="./icons-svg/subtract-svgrepo-com.svg" alt="icon subtract">
      </span>
      <span id="brush-add" class="add hide">
        <img src="./icons-svg/add-svgrepo-com.svg" alt="icon add">
      </span>
      </button>
      <input type="range" min="1" max="10" id="brush-range">
    </div>
    <div>
      <button>
      <span id="eraser-name">Eraser</span>
      <span id="eraser-subtract" class="subtract hide">
        <img src="./icons-svg/subtract-svgrepo-com.svg" alt="icon subtract">
      </span>
      <span id="eraser-add" class="add hide">
        <img src="./icons-svg/add-svgrepo-com.svg" alt="icon add">
      </span>
      </button>
      <input type="range" min="1" max="10" id="eraser-range">
    </div>
    <p class='marker-size hide'>1px</p>
  </div></div>`,
  modifierChildren:`
  <div class='modifier-children hide'>
  <button id="resize">
    <img src="./icons-svg/resize-out-svgrepo-com.svg" alt="icon resize">
  </button>
  <button id="penzil">
    <img src="./icons-svg/brush-sharp-svgrepo-com.svg" alt="icon paint">
  </button>
  <button id="eraser">
    <img src="./icons-svg/eraser-svgrepo-com.svg" alt="icon eraser">
  </button>
  <button id="close">
    <img src="./icons-svg/close-svgrepo-com.svg" alt="icon close">
  </button>
  </div>`,
  buttonsForChangeOfLayer:`<div class="container-buttons-change-layer">
    <button id="before-layer-pixel">
      <img src="./icons-svg/arrow-go-back-svgrepo-com.svg" alt="icon go back" class="opacity-midle">
    </button>
    <button id="next-layer-pixel">
      <img src="./icons-svg/arrow-go-back-svgrepo-contrary.svg" alt="icon go next" class="opacity-midle">
    </button>
  </div>`
  }
}

export function modalAskSave (tool) {
  return `<article class="modalAskSave" id="parent">
    <div>
      <div class="modalAskSave__div div--question">
      <span>
        Do You Want To Quit "${tool}"?
      </span>
      <span>
        You Can Lose Unsaved Changes.
      </span>
    </div>
      <div class="modalAskSave__div div--checkbox">
      <input type="checkbox" value="Do Not Show Again" id="checkbox">
      <label for="checkbox">Do Not Show Again</label>
    </div>
      <div class="modalAskSave__div div--buttons">
      <button id='cancel'>cancel</button>
      <button id='discard'>discard changes</button>
    </div>
    </div>
  </article>`
}

export function modalAskDownload (nameIMG) {
  return `<article class="modal-nameIMG">
    <div>
      <div class="fileName">
        <span class="output-filename">Output Filename</span>
        <input type="text" value='${nameIMG}'>
        <span>.png</span>
      </div>
      <div class="buttons">
        <button id="cancel">cancel</button>
        <button id="save">save</button>
      </div>
    </div>
  </article>` 
}

export function modalInfoIMG ({name,type,size,time,imgSize}) {
  return `<article class="information-modal">
    <span class="property-name">
      File Name
    </span>
    <span class="property-value">
      ${name}
    </span>
    <span class="property-name">
      File Type
    </span>
    <span class="property-value">
      ${type}
    </span>
    <span class="property-name">
      File Size
    </span>
    <span class="property-value">
      ${size}
    </span>
    <span class="property-name">
      File Modification Time
    </span>
    <span class="property-value">
      ${time}
    </span>
    <span class="property-name">
      File Size
    </span>
    <span class="property-value">
      ${imgSize}
    </span>
    <button>ok</button>
  </article>`
}

export function loading () {
  const div = document.createElement("DIV");
  div.classList.add("loading");
  return div;
}

export function toolsOfCrop (left,top,width,height) {
  return {alltools:`<div class="crop-tool">
    <div>
      <button id="original" class="size-crop">Original</button>
      <button id="2:3" class="size-crop">2:3</button>
      <button id="16:9" class="size-crop">16:9</button>
      <button id="5:7" class="size-crop">5:7</button>
      <button id="more-measures-aspect-ratio-of-tool-crop">
        <img src="./icons-svg/ellipsis-svgrepo-com.svg" alt="icon more aspect ratio">
      </button>
      <div class="container-more-aspect-ratio">
        <button id="3:1" class="size-crop aspect-ratio-in-container-more">3:1</button>
        <button id="1:3" class="size-crop aspect-ratio-in-container-more">1:3</button>
        <button id="5:3" class="size-crop aspect-ratio-in-container-more">5:3</button>
        <button id="3:5" class="size-crop aspect-ratio-in-container-more">3:5</button>
        <button id="5:4" class="size-crop aspect-ratio-in-container-more">5:4</button>
        <button id="4:5" class="size-crop aspect-ratio-in-container-more">4:5</button>
        <button id="8:3" class="size-crop aspect-ratio-in-container-more">8:3</button>
        <button id="3:8" class="size-crop aspect-ratio-in-container-more">3:8</button>
        <button id="8:5" class="size-crop aspect-ratio-in-container-more">8:5</button>
        <button id="5:8" class="size-crop aspect-ratio-in-container-more">5:8</button>
      </div>
    </div>
    <div>
      <button id="1:1" class="size-crop">1:1</button>
      <button id="4:3" class="size-crop">4:3</button>
      <button id="21:9" class="size-crop">21:9</button>
      <button id="crop-edit">
         <img src="./icons-svg/pencil-svgrepo-com.svg" alt="icon edit values sizes grid">
      </button>
      <button id="crop-padlock">
        <img src="./icons-svg/icons8-padlock.svg" alt="icon keep or not keep aspect ratio">
      </button>
    </div>
  </div>`,
  grid:`<div class="grid">
        <div class="child-grid top-left">
          <span id="left" class="left"></span>
          <span id="top-left" class="top-left"></span>
          <span id="top" class="top"></span>
        </div>
        <div class="child-grid top">
          <span id="top"></span>
        </div>
        <div class="child-grid top-right">
          <span id="right" class="right"></span>
          <span id="top-right" class="top-right"></span>
          <span id="top" class="top"></span>
        </div>
        <div class="child-grid left-center">
          <span id="left" class="left"></span>
        </div>
        <div class="child-grid center-child">
          <span id='move-grid'>+</span>
        </div>
        <div class="child-grid right-center">
          <span id="right" class="right"></span>
        </div>
        <div class="child-grid bottom-left">
          <span id="left" class="left"></span>
          <span id="bottom-left" class="bottom-left"></span>
          <span id="bottom" class="bottom"></span>
        </div>
        <div class="child-grid bottom">
          <span id="bottom"></span>
        </div>
        <div class="child-grid bottom-right">
          <span id="right" class="right"></span>
          <span id="bottom-right" class="bottom-right"></span>
          <span id="bottom" class="bottom"></span>
        </div>
        <canvas id="see-panorama"></canvas>
      </div>`,
    curtain:`<div class="curtain-crop"></div>`,
    infoSize:`<article class="info-current-size-crop">
    ${left},${top} - ${width} × ${height}
    </article>`
  }
}

export function toolsOfDraw () {
  return {
    drawtool:`<div class='draw-tool'>
  <button id="options-draw" data-optionselected="brush-option-Draw">
    <img src="./icons-svg/brush-sharp-svgrepo-com.svg" alt="icon draw">
  </button>
  <input type="color" id="color-draw">
  <button id="size-draw">
    <img src="./icons-svg/circle-dot-svgrepo-com.svg" alt="icon setting size tools">
  </button>
  <button id="shapes-draw" class="shapes">
    <img src="./icons-svg/ellipsis-svgrepo-com.svg" alt="icon shapes for draw">
  </button>
  <button id="backToolDraw">
    <img src="./icons-svg/arrow-go-back-svgrepo-com.svg" alt="icon draw previous" class="opacity-midle">
  </button>
  <button id="nextToolDraw">
    <img src="./icons-svg/arrow-go-back-svgrepo-contrary.svg" alt="icon draw next" class="opacity-midle">
  </button>
  </div>`,
  optionsTool:`<div class='options-tool-draw'>
  <button id="brush-option-Draw">
    <img src="./icons-svg/brush-sharp-svgrepo-com.svg" alt="icon draw">
  </button>
  <button id="lasso-option-Draw">
    <img src="./icons-svg/scissors-svgrepo-com.svg" alt="icon cut for draw">
  </button>
  <button id="eraser-option-Draw">
    <img src="./icons-svg/eraser-svgrepo-com.svg" alt="icon eraser drawing">
  </button>
  <button id="superposition-option-Draw">
    <img src="./icons-svg/setting-svgrepo-com.svg" alt="icon types superposition">
  </button>
  <button id="close-option-Draw">
    <img src="./icons-svg/close-svgrepo-com.svg" alt="icon hide tools">
  </button>
  </div>`,
  optionsShapes:`<div class="options">
      <span id="figures">Figure</span>
    </div>`,
  sizesTool:`<article class="modal-sizes-draw" id="setting-sizes-tools">
    <div>
    <div class="header-modal-sizes-draw">
      <button id="brush">BRUSH</button>
      <button id="lasso">LASSO</button>
      <button id="eraser">ERASER</button>
      <span></span>
    </div>
    <div class="body-modal-sizes-draw">
      <div class="imgSize">
        <span class="circle-example"></span>
      </div>
      <div class="adjustsize" id="setting-size">
        <button>
        <span id="size-name" class="name">Size</span>
        <span id="size-subtract" class="hide">
          <img src="./icons-svg/subtract-svgrepo-com.svg" alt="icon subtract">
        </span>
        <span id="size-add" class="hide">
          <img src="./icons-svg/add-svgrepo-com.svg" alt="icon add">
        </span>
        </button>
        <input type="range" id="size" min="1" max="263" value="1">
      </div>
      <div class="adjustsize" id="setting-hardness">
        <button>
        <span id="hardness-name" class="name">Hardness</span>
        <span id="hardness-subtract" class="hide">
          <img src="./icons-svg/subtract-svgrepo-com.svg" alt="icon subtract">
        </span>
        <span id="hardness-add" class="hide">
          <img src="./icons-svg/add-svgrepo-com.svg" alt="icon add">
        </span>
        </button>
        <input type="range" id="hardness" min="0" max="100" value="0">
      </div>
      <span class="marker-amount hide"></span>
      <div class="shapes-draw">
        <button id="top-left" class="shapes-draw-button top-left">
          <img src="./icons-svg/circle-with-line.svg" alt="top-left">
        </button>
        <button id="top-right" class="shapes-draw-button top-right">
          <img src="./icons-svg/circle-with-line.svg" alt="top-right">
        </button>
        <button id="center" class="shapes-draw-button">
          <img src="./icons-svg/circle-min.svg" alt="center">
        </button>
        <button id="down-left" class="shapes-draw-button down-left">
          <img src="./icons-svg/circle-with-line.svg" alt="down-left">
        </button>
        <button id="down-right" class="shapes-draw-button down-right">
          <img src="./icons-svg/circle-with-line.svg" alt="down-right">
        </button>
        <button id="all-shape-draw" class="all-shapes">
          <img src="./icons-svg/ellipsis-svgrepo-com.svg" alt="icon more options">
  <div class="all-shapes-of-draw-modal">
    <buttons id="top-left" class="shapes-draw-button top-left">
       <img src="./icons-svg/circle-with-line.svg" alt="top-left">
    </buttons>
    <buttons id="top" class="shapes-draw-button top">
       <img src="./icons-svg/circle-with-line.svg" alt="top">
    </buttons>
    <buttons id="top-right" class="shapes-draw-button top-right">
      <img src="./icons-svg/circle-with-line.svg" alt="top-right">
    </buttons>
    <buttons id="left" class="shapes-draw-button">
      <img src="./icons-svg/circle-with-line.svg" alt="left">
    </buttons>
    <buttons id="center" class="shapes-draw-button">
      <img src="./icons-svg/circle-min.svg" alt="center">
    </buttons>
    <buttons id="right" class="shapes-draw-button right">
      <img src="./icons-svg/circle-with-line.svg" alt="right">
    </buttons>
    <buttons id="down-left" class="shapes-draw-button down-left">
      <img src="./icons-svg/circle-with-line.svg" alt="down-left">
    </buttons>
    <buttons id="down" class="shapes-draw-button down">
      <img src="./icons-svg/circle-with-line.svg" alt="down">
    </buttons>
    <buttons id="down-right" class="shapes-draw-button down-right">
      <img src="./icons-svg/circle-with-line.svg" alt="down-right">
    </buttons>
  </div>
        </button>
      </div>
      <div class="buttons-modal">
        <button id="cancel-modal-size-draw">
          cancel
        </button>
        <button id="apply-modal-size-draw">
          apply
        </button>
      </div>
    </div>
    </div>
  </article>`,
  modalSuerposition:`<article class="modal-draw-superposition">
    <div id="main">
      <button class="choose-option" id="choose-option">Normal</button>
      <div>
        <button id="cancel">cancel</button>
        <button id="apply">apply</button>
      </div>
    </div>
  </article>`,
  superpositionOptionsModal:`<article class="modal-choose-superposition">
  <div class="options">
    <div>
      <div class="container-circle" data-value="source-over">
        <span class="circle-fill"></span>
      </div>
      <span class="text-value">Normal</span>
    </div>
    <div>
      <div class="container-circle" data-value="source-atop">
        <span class="circle-fill"></span>
      </div>
     <span class="text-value">Source Atop</span>
    </div>
    <div>
      <div class="container-circle" data-value="darken">
        <span class="circle-fill"></span>
      </div>
      <span class="text-value">Darken</span>
    </div>
    <div>
      <div class="container-circle" data-value="multiply">
        <span class="circle-fill"></span>
      </div>
      <span class="text-value">Multiply</span>
    </div>
    <div>
      <div class="container-circle" data-value="color-burn">
        <span class="circle-fill"></span>
      </div>
      <span class="text-value">Color Burn</span>
    </div>
    <div>
      <div class="container-circle" data-value="lighten">
        <span class="circle-fill"></span>
      </div>
      <span class="text-value">Lighten</span>
    </div>
    <div>
      <div class="container-circle" data-value="screen">
        <span class="circle-fill"></span>
      </div>
      <span class="text-value">Screen</span>
    </div>
    <div>
      <div class="container-circle" data-value="color-dodge">
        <span class="circle-fill"></span>
      </div>
      <span class="text-value">Color Dodge</span>
    </div>
    <div>
      <div class="container-circle" data-value="overlay">
        <span class="circle-fill"></span>
      </div>
      <span class="text-value">Overlay</span>
    </div>
    <div>
      <div class="container-circle" data-value="soft-light">
        <span class="circle-fill"></span>
      </div>
      <span class="text-value">Soft Light</span>
    </div>
    <div>
      <div class="container-circle" data-value="hard-light">
        <span class="circle-fill"></span>
      </div>
      <span class="text-value">Hard Light</span>
    </div>
    <div>
      <div class="container-circle" data-value="difference">
        <span class="circle-fill"></span>
      </div>
      <span class="text-value">Difference</span>
    </div>
    <div>
      <div class="container-circle" data-value="exclusion">
        <span class="circle-fill"></span>
      </div>
      <span class="text-value">Exclusion</span>
    </div>
    <div>
      <div class="container-circle" data-value="hue">
        <span class="circle-fill"></span>
      </div>
      <span class="text-value">Hue</span>
    </div>
    <div>
      <div class="container-circle" data-value="saturation">
        <span class="circle-fill"></span>
      </div>
      <span class="text-value">Saturation</span>
    </div>
    <div>
      <div class="container-circle" data-value="color">
        <span class="circle-fill"></span>
      </div>
      <span class="text-value">Color</span>
    </div>
    <div>
      <div class="container-circle" data-value="luminosity">
        <span class="circle-fill"></span>
      </div>
      <span class="text-value">Luminosity</span>
    </div>
    </div>
    <div class="footer">
      <button id="cancel">cancel</button>
    </div>
  </article>`,
  shapeDraw:`<div class="mode-of-paint">
    <span class="fill"></span>
    <span class="line-join"></span>
    <span class="paint"></span>
  </div>`,
  toolsAdjustShape:`<div class="container-tools-adjust-shape">
    <button class="filled"></button>
    <button id='close-modal-adjust-shape'>
    <img src="./icons-svg/close-svgrepo-com.svg" alt="close options">
    </button>
    <button id='edit-values-of-modal-figures'>Edit</button>
    <button id="options">Options</button>
    <button id="done">Done</button>
  </div>`,
  modalOptionsAdjustShape:`<div class="modal-options-adjust-shape">
    <button id="options-rotate" class="button-in-options options">Options</button>
    <button id="modify-position-and-size-shape" class="button-in-options">Move / Size</button>
    <button id="angle-shape" class="button-in-options">Angle</button>
    <button id="lock-ratio" class="button-in-options">Lock Ratio</button>
    <button id="flip-horizontal" class="button-in-options">Flip (Horizontal)</button>
    <button id="flip-vertical" class="button-in-options">Flip (Vertical)</button>
  </div>`,
  containerOptionsDegShape:`<article class="container-options-positioning" id="container-parent">
    <div>
    <div class="option-for-selection">
      <input type="checkbox" id="rotationHandle">
      <label for="rotationHandle">
      <p>ROTATION handle</p>
      </label>
    </div>
    <div class="option-for-selection">
      <input type="checkbox" id="rotationHandleNinetyDeg">
      <label for="rotationHandleNinetyDeg">
      <p>90° ROTATION handle</p>
      </label>
    </div>
    <div class="option-for-selection">
      <input type="checkbox" id="adjustToSpecifiedDegree">
      <label for="adjustToSpecifiedDegree">
      <p>Snap to 0° / 90° / 180° / 270°</p>
      </label>
    </div>
    <div class="option-for-selection">
      <input type="checkbox" id="alignmentGuidesEdge">
      <label for="alignmentGuidesEdge">
      <p>Alignment guides (Edge)</p>
      </label>
    </div>
    <div class="option-for-selection">
      <input type="checkbox" id="alignmentGuidesCenter">
      <label for="alignmentGuidesCenter">
      <p>Alignment guides (Center)</p>
      </label>
    </div>
    <div class="buttons-footer">
      <button id="cancel">cancel</button>
      <button id="apply">apply</button>
    </div>
    </div>
  </article>`,
  containerButtonsMoveShape:`
  <div class="container-buttons-move-shape">
    <button id="up">
      <img src="./icons-svg/down-arrow-backup-3-svgrepo-com.svg" alt="up">
    </button>
    <button id="down">
      <img src="./icons-svg/down-arrow-backup-2-svgrepo-com.svg" alt="down">
    </button>
    <button id="left">
      <img src="./icons-svg/left-arrow-backup-2-svgrepo-com.svg" alt="left">
    </button>
    <button id="right">
      <img src="./icons-svg/right-arrow-backup-2-svgrepo-com.svg" alt="up">
    </button>
    <button id="custom-position">
      <img src="./icons-svg/change-position.svg" alt="position">
    </button>
    <button id="custom-size">
      <img src="./icons-svg/double-resize-arrow-svgrepo-com.svg" alt="resize">
    </button>
  </div>
  `,
  containerMoveDegShape:`<div class="container-modify-deg-shape">
    <div class="header">
      <div class="texts-deg">
        <p id="deg-original">90°</p>
        <p id="deg-contrary">-270°</p>
      </div>
      <div class="buttons-work-decimal-deg">
        <button id="subtract-deg-step-decimal">-0.1</button>
        <button id="add-deg-step-decimal">+0.1</button>
      </div>
    </div>
    <div class="footer">
      <div class="buttons">
        <button id="name-button-angle">Round</button>
        <button class="hide" id="subtract-deg-step-int">
          <img src="./icons-svg/subtract-svgrepo-com.svg" alt="subtract">
        </button>
        <button class="hide" id="add-deg-step-int">
          <img src="./icons-svg/add-svgrepo-com.svg" alt="add">
        </button>
      </div>
      <input type="range" max="359" min="0" step="1" id="range-deg-rotate-shape">
    </div>
  </div>`,
  containerSHAPEINSERT:`
  <div class="container-SHAPES-insert" id="container-SHAPES-INSERT">
    <span class="point-corner top-left" id="top-left" style="--leftCorner:0;--topCorner:0" data-numberpoint="2"></span>
    <span class="point-corner top-right" id="top-right" style="--leftCorner:100%;--topCorner:0" data-numberpoint="3"></span>
    <span class="point-corner bottom-right" id="bottom-right" style="--leftCorner:100%;--topCorner:100%" data-numberpoint="4"></span>
    <span class="point-corner bottom-left" id="bottom-left" style="--leftCorner:0;--topCorner:100%" data-numberpoint="1"></span>
  </div>`,
  containerAdjustShapesInScreen:`<div class="square-of-adjust-SHAPES" id="square-adjust-SHAPES">
  <span class="circle-top-left circle" data-direction="top-left" id="top-left"></span>
  <span class="circle-top-right circle" data-direction="top-right" id="top-right"></span>
  <span class="circle-bottom-left circle" data-direction="bottom-left" id="bottom-left"></span>
  <span class="circle-bottom-right circle" data-direction="bottom-right" id="bottom-right"></span>
  <span class="circle-top-center circle" id="center"></span>
  <span class="central-point point" id="central-point"></span>
  <span class="point-top-left point"></span>
  <span class="point-top-right point"></span>
  <span class="point-bottom-right point"></span>
  <span class="point-bottom-left point"></span>
  <span class="point-center-in-button-rotate point"></span>
  <div class="container-button-rotate-SHAPES">
    <span class="line" id="line"></span>
    <span class="button-rotate" id="button-rotate">
      <img src="./icons-svg/rotate-cw-svgrepo-com.svg" alt="rotate">
    </span>
    <div class="container-button-rotate-ninety-deg">
      <span class="button-rotate" id="button-rotate-ninety-deg">
        <img src="./icons-svg/arrow-elbow-down-left-bold-svgrepo-com.svg" alt="rotate 90 deg">
      </span>
      <span class="line" id="line"></span>
    </div>
  </div>
  </div>`,
  htmlSettingShapeSQUARE:`<div class="container-button-and-range">
      <div class="buttons" id="buttons-for-round">
        <button id="text-name-button">Round</button>
        <button class="hide" id="subtract">
          <img src="./icons-svg/subtract-svgrepo-com.svg" alt="subtract">
        </button>
        <button class="hide" id="add">
          <img src="./icons-svg/add-svgrepo-com.svg" alt="add">
        </button>
      </div>
      <input type="range" max="100" min="0" id="round-border-range">
    </div>
    <div class="container-border-avaliable">
      <div class="border-option">
        <input type="checkbox" data-border="top-left" id="topLeft">
         <label for="topLeft"><p class="name-border">Top - left</p></label>
      </div>
      <div class="border-option">
        <input type="checkbox" data-border="top-right" id="topRight">
         <label for="topRight"><p class="name-border">Top - Right</p></label>
      </div>
    </div>
    <div class="container-border-avaliable">
      <div class="border-option">
        <input type="checkbox" data-border="bottom-left" id="bottomLeft">
         <label for="bottomLeft"><p class="name-border">Bottom - left</p></label>
      </div>
      <div class="border-option">
        <input type="checkbox" data-border="bottom-right" id="bottomRight">
         <label for="bottomRight"><p class="name-border">Bottom - Right</p></label>
      </div>
    </div>`,
  htmlSettingShapeLINE:`<div class="container-button-and-range">
      <div class="buttons" id="buttons-for-thickness">
        <button id="text-name-button">Thickness</button>
        <button class="hide" id="subtract">
          <img src="./icons-svg/subtract-svgrepo-com.svg" alt="subtract">
        </button>
        <button class="hide" id="add">
          <img src="./icons-svg/add-svgrepo-com.svg" alt="add">
        </button>
      </div>
      <input type="range" max="200" min="5" id="thickness-range">
    </div>
    <button id="round-borders-switch" class="button-rounder">Round</button>`,
  htmlSettingShapeArrowIndicator:`
  <div class="container-button-and-range">
    <div class="buttons" id="buttons-for-thickness">
      <button id="text-name-button">Thickness</button>
      <button class="hide" id="subtract">
        <img src="./icons-svg/subtract-svgrepo-com.svg" alt="subtract">
      </button>
      <button class="hide" id="add">
        <img src="./icons-svg/add-svgrepo-com.svg" alt="add">
      </button>
    </div>
    <input type="range" max="120" min="5" id="thickness-range">
  </div>
  <div class="container-button-and-range">
    <div class="buttons" id="buttons-for-tail">
      <button id="text-name-button">Tail</button>
      <button class="hide" id="subtract">
        <img src="./icons-svg/subtract-svgrepo-com.svg" alt="subtract">
      </button>
      <button class="hide" id="add">
        <img src="./icons-svg/add-svgrepo-com.svg" alt="add">
      </button>
    </div>
    <input type="range" max="100" min="0" id="tail-range">
  </div>
  <button id="round-tail" class="button-rounder">Round</button>`,
  htmlSettingShapeClipPath:`
  <div class="types-of-borde">
    <button id="square">
     <svg width="21.5" height="21.5">
      <rect x="0.75" y="0.75" width="20" height="20" stroke-width="1.5" stroke="#e7e7e7" fill="transparent"></rect>
      </svg> 
    </button>
    <button id="bezier-cuadratic-in-sides">
      <svg width="21.5" height="21.5">
        <path d="M 0.75 20.75 Q 4.75 10.75 0.75 0.75 Q 10.75 4.75 20.75 0.75 Q 16.75 10.75 20.75 20.75 Q 10.75 16.75 0.75 20.75 Z" stroke-width="1.5" stroke="#e7e7e7" fill="transparent">
      </svg>
    </button>
    <button id="bezier-cuadratic-in-corners">
      <svg width="36.5" height="36.5">
        <path d="M 13 18.25 Q 0.75 35.75 18.25 23.5 Q 35.75 35.75 23.5 18.25 Q 35.75 0.75 18.25 13 Q 0.75 0.75 13 18.25 Z" stroke-width="1.5" stroke="#e7e7e7" fill="transparent">
      </svg>
    </button>
  </div>
  <div class="buttons-amount-point-in-clip-path">
    <button data-numberpoint="4">4</button>
    <button data-numberpoint="8">8</button>
    <button data-numberpoint="12">12</button>
    <button data-numberpoint="16">16</button>
    <button data-numberpoint="20">20</button>
    <button id="more-amount-points">
      <img src="./icons-svg/ellipsis-svgrepo-com.svg" alt="more options">
    </button>
  </div>
  `,
  containerSettingSHAPE:`<div class="container-setting-SHAPE">
  </div>`,
  htmlEditShapeText:`<div class="modal-edit-shape-text">
    <div>
      <svg></svg>
      <textarea></textarea>
      <div class="container-checkbox">
        <input type="checkbox" id="checkbox">
        <label for="checkbox">Keep Aspect Ratio</label>
      </div>
      <div class="container-buttons-setting-text">
        <button id="button-types-align-text">Center</button>
        <button id="button-line-spacing">Line Spacing</button>
        <div class="container-input-range">
          <div class="buttons">
            <button id="subtract">
              <img src="./icons-svg/subtract-svgrepo-com.svg" alt="subtract">
            </button>
            <button id="add">
              <img src="./icons-svg/add-svgrepo-com.svg" alt="add">
            </button>
          </div>
          <input type="range" min="50" max="150" id="range-line-spacing">
          <span class="marker-line-spacing visibility-hidden"></span>
        </div>
        <div class="container-types-align-text">
          <button class="type-align-text" data-direction="start">Left</button>
          <button class="type-align-text" data-direction="middle">Center</button>
          <button class="type-align-text" data-direction="end">Right</button>
        </div>
      </div>
      <div class="container-change-font">
        <button class="buttons-change-font" id="font-before">
          <img src="./icons-svg/subtract-svgrepo-com.svg" alt="before">
        </button>
        <button class="button-select-font" id="types-font">Droid Sans</button>
        <button class="buttons-change-font" id="font-next">
          <img src="./icons-svg/add-svgrepo-com.svg" alt="next">
        </button>
      </div>
      <div class="buttons-close-and-apply">
        <button id="cancel-modal">cancel</button>
        <button id="apply-setting">apply</button>
      </div>
    </div>
  </div>`,
  htmlsModalSelectFont:{
    main:`<div class="modal-all-types-fonts">
      <div class="header">
        <button id="system">system</button>
        <button id="custom">custom</button>
        <button id="favorites">favorites</button>
        <span class="scroll-bar"></span>
      </div>
      <div class="container-center-modal">
      </div>
      <div class="footer-tools">
        <div class="container-tools-search">
          <img src="./icons-svg/search-svgrepo-com.svg" alt="search font">
          <input type="text" id="search-font">
          <button id="reset-input-search">
            <img src="./icons-svg/restore-svgrepo-com.svg" alt="reset search">
          </button>
        </div>
        <button id="out-of-modal-main">cancel</button>
      </div>
    </div>`,
    containerForFonts:`<div class="container-fonts"></div>`,
    containerForInsertNewFont:`<div class="container-type-font" data-option="custom">
          <svg  id="svg-container-for-star-icon">
            <polygon class="star-logo" points="9.31 0,11.9168 6.27343182520415,18.62 7.604159788126242,13.5926 11.97655166629883,15.268400000000002 19.010399470315605,9.31 15.208319576252483,3.3516000000000004 19.010399470315605,5.0274 11.97655166629883,0 7.604159788126242,6.703200000000001 6.27343182520415" fill="var(--colorWhiteLow)"></polygon>
          </svg>
          <p></p>
        </div>`,
    fontsDefault:`<div class="container-type-font" data-indexfont="0" data-option="system">
          <svg id="svg-container-for-star-icon">
            <polygon class="star-logo" points="9.31 0,11.9168 6.27343182520415,18.62 7.604159788126242,13.5926 11.97655166629883,15.268400000000002 19.010399470315605,9.31 15.208319576252483,3.3516000000000004 19.010399470315605,5.0274 11.97655166629883,0 7.604159788126242,6.703200000000001 6.27343182520415" fill="var(--colorWhiteLow)"></polygon>
          </svg>
          <p class="Bebas-Neue">Bebas Neue</p>
        </div>
        <div class="container-type-font" data-indexfont="1" data-option="system">
          <svg id="svg-container-for-star-icon">
            <polygon class="star-logo" points="9.31 0,11.9168 6.27343182520415,18.62 7.604159788126242,13.5926 11.97655166629883,15.268400000000002 19.010399470315605,9.31 15.208319576252483,3.3516000000000004 19.010399470315605,5.0274 11.97655166629883,0 7.604159788126242,6.703200000000001 6.27343182520415" fill="var(--colorWhiteLow)"></polygon>
          </svg>
          <p class="Caprasimo">Caprasimo</p>
        </div>
        <div class="container-type-font" data-indexfont="2" data-option="system">
          <svg id="svg-container-for-star-icon">
            <polygon class="star-logo" points="9.31 0,11.9168 6.27343182520415,18.62 7.604159788126242,13.5926 11.97655166629883,15.268400000000002 19.010399470315605,9.31 15.208319576252483,3.3516000000000004 19.010399470315605,5.0274 11.97655166629883,0 7.604159788126242,6.703200000000001 6.27343182520415" fill="var(--colorWhiteLow)"></polygon>
          </svg>
          <p class="Edu-NSW-ACT-Hand-Pre">Edu NSW ACT Hand Pre 400</p>
        </div>
        <div class="container-type-font" data-indexfont="3" data-option="system">
          <svg id="svg-container-for-star-icon">
            <polygon class="star-logo" points="9.31 0,11.9168 6.27343182520415,18.62 7.604159788126242,13.5926 11.97655166629883,15.268400000000002 19.010399470315605,9.31 15.208319576252483,3.3516000000000004 19.010399470315605,5.0274 11.97655166629883,0 7.604159788126242,6.703200000000001 6.27343182520415" fill="var(--colorWhiteLow)"></polygon>
          </svg>
          <p class="Edu-NSW-ACT-Hand-Pre weight-500">Edu NSW ACT Hand Pre 500</p>
        </div>
        <div class="container-type-font" data-indexfont="4" data-option="system">
          <svg id="svg-container-for-star-icon">
            <polygon class="star-logo" points="9.31 0,11.9168 6.27343182520415,18.62 7.604159788126242,13.5926 11.97655166629883,15.268400000000002 19.010399470315605,9.31 15.208319576252483,3.3516000000000004 19.010399470315605,5.0274 11.97655166629883,0 7.604159788126242,6.703200000000001 6.27343182520415" fill="var(--colorWhiteLow)"></polygon>
          </svg>
          <p class="Edu-NSW-ACT-Hand-Pre weight-600">Edu NSW ACT Hand Pre 600</p>
        </div>
        <div class="container-type-font" data-indexfont="5" data-option="system">
          <svg id="svg-container-for-star-icon">
            <polygon class="star-logo" points="9.31 0,11.9168 6.27343182520415,18.62 7.604159788126242,13.5926 11.97655166629883,15.268400000000002 19.010399470315605,9.31 15.208319576252483,3.3516000000000004 19.010399470315605,5.0274 11.97655166629883,0 7.604159788126242,6.703200000000001 6.27343182520415" fill="var(--colorWhiteLow)"></polygon>
          </svg>
          <p class="Edu-NSW-ACT-Hand-Pre weight-700">Edu NSW ACT Hand Pre 700</p>
        </div>
        <div class="container-type-font" data-indexfont="6" data-option="system">
          <svg id="svg-container-for-star-icon">
            <polygon class="star-logo" points="9.31 0,11.9168 6.27343182520415,18.62 7.604159788126242,13.5926 11.97655166629883,15.268400000000002 19.010399470315605,9.31 15.208319576252483,3.3516000000000004 19.010399470315605,5.0274 11.97655166629883,0 7.604159788126242,6.703200000000001 6.27343182520415" fill="var(--colorWhiteLow)"></polygon>
          </svg>
          <p class="Kapakana">Kapakana 300</p>
        </div>
        <div class="container-type-font" data-indexfont="7" data-option="system">
          <svg id="svg-container-for-star-icon">
            <polygon class="star-logo" points="9.31 0,11.9168 6.27343182520415,18.62 7.604159788126242,13.5926 11.97655166629883,15.268400000000002 19.010399470315605,9.31 15.208319576252483,3.3516000000000004 19.010399470315605,5.0274 11.97655166629883,0 7.604159788126242,6.703200000000001 6.27343182520415" fill="var(--colorWhiteLow)"></polygon>
          </svg>
          <p class="Kapakana weight-400">Kapakana 400</p>
        </div>
        <div class="container-type-font" data-indexfont="8" data-option="system">
          <svg id="svg-container-for-star-icon">
            <polygon class="star-logo" points="9.31 0,11.9168 6.27343182520415,18.62 7.604159788126242,13.5926 11.97655166629883,15.268400000000002 19.010399470315605,9.31 15.208319576252483,3.3516000000000004 19.010399470315605,5.0274 11.97655166629883,0 7.604159788126242,6.703200000000001 6.27343182520415" fill="var(--colorWhiteLow)"></polygon>
          </svg>
          <p class="LXGW-Marker-Gothic">LXGW Marker Gothic</p>
        </div>
        <div class="container-type-font" data-indexfont="9" data-option="system">
          <svg id="svg-container-for-star-icon">
            <polygon class="star-logo" points="9.31 0,11.9168 6.27343182520415,18.62 7.604159788126242,13.5926 11.97655166629883,15.268400000000002 19.010399470315605,9.31 15.208319576252483,3.3516000000000004 19.010399470315605,5.0274 11.97655166629883,0 7.604159788126242,6.703200000000001 6.27343182520415" fill="var(--colorWhiteLow)"></polygon>
          </svg>
          <p class="Michroma">Michroma</p>
        </div>
        <div class="container-type-font" data-indexfont="10" data-option="system">
          <svg id="svg-container-for-star-icon">
            <polygon class="star-logo" points="9.31 0,11.9168 6.27343182520415,18.62 7.604159788126242,13.5926 11.97655166629883,15.268400000000002 19.010399470315605,9.31 15.208319576252483,3.3516000000000004 19.010399470315605,5.0274 11.97655166629883,0 7.604159788126242,6.703200000000001 6.27343182520415" fill="var(--colorWhiteLow)"></polygon>
          </svg>
          <p class="Poppins">Poppins 400</p>
        </div>
        <div class="container-type-font" data-indexfont="11" data-option="system">
          <svg id="svg-container-for-star-icon">
            <polygon class="star-logo" points="9.31 0,11.9168 6.27343182520415,18.62 7.604159788126242,13.5926 11.97655166629883,15.268400000000002 19.010399470315605,9.31 15.208319576252483,3.3516000000000004 19.010399470315605,5.0274 11.97655166629883,0 7.604159788126242,6.703200000000001 6.27343182520415" fill="var(--colorWhiteLow)"></polygon>
          </svg>
          <p class="Poppins weight-500">Poppins 500</p>
        </div>
        <div class="container-type-font" data-indexfont="12" data-option="system">
          <svg id="svg-container-for-star-icon">
            <polygon class="star-logo" points="9.31 0,11.9168 6.27343182520415,18.62 7.604159788126242,13.5926 11.97655166629883,15.268400000000002 19.010399470315605,9.31 15.208319576252483,3.3516000000000004 19.010399470315605,5.0274 11.97655166629883,0 7.604159788126242,6.703200000000001 6.27343182520415" fill="var(--colorWhiteLow)"></polygon>
          </svg>
          <p class="Poppins weight-600">Poppins 600</p>
        </div>
        <div class="container-type-font" data-indexfont="13" data-option="system">
          <svg id="svg-container-for-star-icon">
            <polygon class="star-logo" points="9.31 0,11.9168 6.27343182520415,18.62 7.604159788126242,13.5926 11.97655166629883,15.268400000000002 19.010399470315605,9.31 15.208319576252483,3.3516000000000004 19.010399470315605,5.0274 11.97655166629883,0 7.604159788126242,6.703200000000001 6.27343182520415" fill="var(--colorWhiteLow)"></polygon>
          </svg>
          <p class="Poppins weight-700">Poppins 700</p>
        </div>
        <div class="container-type-font" data-indexfont="14" data-option="system">
          <svg id="svg-container-for-star-icon">
            <polygon class="star-logo" points="9.31 0,11.9168 6.27343182520415,18.62 7.604159788126242,13.5926 11.97655166629883,15.268400000000002 19.010399470315605,9.31 15.208319576252483,3.3516000000000004 19.010399470315605,5.0274 11.97655166629883,0 7.604159788126242,6.703200000000001 6.27343182520415" fill="var(--colorWhiteLow)"></polygon>
          </svg>
          <p class="Press-Start-2P">Press Start 2P</p>
        </div>
        <div class="container-type-font" data-indexfont="15" data-option="system">
          <svg id="svg-container-for-star-icon">
            <polygon class="star-logo" points="9.31 0,11.9168 6.27343182520415,18.62 7.604159788126242,13.5926 11.97655166629883,15.268400000000002 19.010399470315605,9.31 15.208319576252483,3.3516000000000004 19.010399470315605,5.0274 11.97655166629883,0 7.604159788126242,6.703200000000001 6.27343182520415" fill="var(--colorWhiteLow)"></polygon>
          </svg>
          <p class="Roboto">Roboto 400</p>
        </div>
        <div class="container-type-font" data-indexfont="16" data-option="system">
          <svg id="svg-container-for-star-icon">
            <polygon class="star-logo" points="9.31 0,11.9168 6.27343182520415,18.62 7.604159788126242,13.5926 11.97655166629883,15.268400000000002 19.010399470315605,9.31 15.208319576252483,3.3516000000000004 19.010399470315605,5.0274 11.97655166629883,0 7.604159788126242,6.703200000000001 6.27343182520415" fill="var(--colorWhiteLow)"></polygon>
          </svg>
          <p class="Roboto weight-500">Roboto 500</p>
        </div>
        <div class="container-type-font" data-indexfont="17" data-option="system">
          <svg id="svg-container-for-star-icon">
            <polygon class="star-logo" points="9.31 0,11.9168 6.27343182520415,18.62 7.604159788126242,13.5926 11.97655166629883,15.268400000000002 19.010399470315605,9.31 15.208319576252483,3.3516000000000004 19.010399470315605,5.0274 11.97655166629883,0 7.604159788126242,6.703200000000001 6.27343182520415" fill="var(--colorWhiteLow)"></polygon>
          </svg>
          <p class="Roboto weight-600">Roboto 600</p>
        </div>
        <div class="container-type-font" data-indexfont="18" data-option="system">
          <svg id="svg-container-for-star-icon">
            <polygon class="star-logo" points="9.31 0,11.9168 6.27343182520415,18.62 7.604159788126242,13.5926 11.97655166629883,15.268400000000002 19.010399470315605,9.31 15.208319576252483,3.3516000000000004 19.010399470315605,5.0274 11.97655166629883,0 7.604159788126242,6.703200000000001 6.27343182520415" fill="var(--colorWhiteLow)"></polygon>
          </svg>
          <p class="Roboto weight-700">Roboto 700</p>
        </div>
        <div class="container-type-font" data-indexfont="19" data-option="system">
          <svg id="svg-container-for-star-icon">
            <polygon class="star-logo" points="9.31 0,11.9168 6.27343182520415,18.62 7.604159788126242,13.5926 11.97655166629883,15.268400000000002 19.010399470315605,9.31 15.208319576252483,3.3516000000000004 19.010399470315605,5.0274 11.97655166629883,0 7.604159788126242,6.703200000000001 6.27343182520415" fill="var(--colorWhiteLow)"></polygon>
          </svg>
          <p class="WDXL-Lubrifont-SC">WDXL Lubrifont SC</p>
        </div>`,
    contaienerToolsAddMyFont:`
    <div class="container-tools-add-my-font">
      <button id="go-back-folder">
        <img src="./icons-svg/up-arrow-svgrepo-com.svg" alt="back">
      </button>
      <p class="name-folder-current" id="name-folder-current"></p>
      <button id="create-folder">
        <img src="./icons-svg/add-folder-svgrepo-com.svg" alt="create folder">
      </button>
      <button id="add-my-font-local">
        <img src="./icons-svg/text-size-plus-svgrepo-com.svg" alt="add my font">
      </button>
      <button id="remove-fonts-added">
        <img src="./icons-svg/trash-svgrepo-com.svg" alt="delete">
      </button>
    </div>
    `,
    containerFontsAvaliablesForRemove:`<div class="container-fonts-for-remove">
      <div>
      <div class="container-fonts-avaliables">
      </div>
      <div class="container-footer">
        <input type="checkbox" id="select-all-fonts-in-remove">
        <div>
          <button id="cancel-remove-fonts">cancel</button>
          <button id="apply-remove-fonts">apply</button>
        </div>
      </div>
      </div>
    </div>`,
    containerCreateFolder:`<div class="container-create-folder">
      <div>
        <p>Create Folder</p>
        <input type="text">
        <div class="footer">
          <button id="cancel-create-folder">cancel</button>
          <button id="apply-create-folder">ok</button>
        </div>
      </div>
    </div>`,
    containerFontInCustomForDelete:`
    <div class="container-font-custom-for-delete">
      <input type="checkbox">
      <p></p>
    </div>`,
    containerFontCreate:`<div class="container-folder" id="container-folder">
      <img src="./icons-svg/folder-in-text-svgrepo-com.svg" alt="folder">
      <p class="name-folder" id="name-folder"></p>
    </div>`
  },
  modalFiguresOptionsHTML:{
    modal:`<article class="figures-modal" data-superposition='{"name":"Normal","type":"source-over"}' id="figures-modal">
    <div>
      <div class="preview-shape">
        <svg width="100%" height="100%"></svg>
      </div>
      <div class="options">
        <button id="shape">SHAPE</button>
        <button id="fill">FILL</button>
        <button id="outline">OUTLINE</button>
        <button id="shadow">SHADOW</button>
        <span class="scroll"></span>
      </div>
      <div class="container-options">
      </div>
      <div class="footer">
        <button id="cancel-modal-figures">cancel</button>
        <button id="apply-modal-figures">apply</button>
      </div>
      <span class="marker-value hide">0</span>
    </div>
  </article>`,
    shape:`<div class="tool-shapes">
        <button id="line">
          <svg width="20" height="1.5">
            <rect x="0" y="0" width="20" height="1.5" fill="#e7e7e7"></rect>
          </svg>
        </button>
        <button id="arrowIndicator">
          <svg width="20" height="20">
            <polygon points="0 9.25,15 9.25,10 3,11.5 3,20 10,11.5 17,10 17,15 10.75,0 10.75" fill="#e7e7e7"></polygon>
          </svg>
        </button>
        <button id="circle">
          <svg width="21.5" height="21.5">
            <circle cx="10.75" cy="10.75" r="10" stroke-width="1.5" stroke="#e7e7e7" fill="transparent"></circle>
          </svg>
        </button>
        <button id="ellipse">
          <svg width="21.5" height="17.5">
            <ellipse cx="10.75" cy="8.75" rx="10" ry="8" stroke-width="1.5" stroke="#e7e7e7" fill="transparent"></ellipse>
          </svg>
        </button>
        <button id="halfCircle">
          <svg width="21.5" height="21.5">
            <path d="M 10.5 0.75 A 10 10 0 1 1 10.5 20.75 Z" stroke-width="1.5" stroke="#e7e7e7" fill="transparent">
          </svg>
        </button>
        <button id="triangle">
          <svg width="21.5" height="21.5">
            <polygon points="0.75 20.75,10.75 0.75,20.75 20.75" stroke-width="1.5" stroke="#e7e7e7" fill="transparent"></polygon>
          </polygon>
        </button>
        <button id="square">
          <svg width="21.5" height="21.5">
            <rect x="0.75" y="0.75" width="20" height="20" stroke-width="1.5" stroke="#e7e7e7" fill="transparent"></rect>
          </svg>
        </button>
        <button id="pentagon">
          <svg width="21.5" height="21.5">
            <polygon points="0.75 7.75,10.75 0.75,20.75 7.75,16.75 20.75,4.75 20.75" stroke-width="1.5" stroke="#e7e7e7" fill="transparent"></polygon>
          </svg>
        </button>
        <button id="arrowSignal">
          <svg width="21.5" height="21.5">
            <polygon points="0.75 0.75,15.75 0.75,20.75 10.75,15.75 20.75,0.75 20.75,5.75 10.75" stroke-width="1.5" stroke="#e7e7e7" fill="transparent"></polygon>
          </svg>
        </button>
        <button id="middleTrapeze">
          <svg width="21.5" height="21.5">
            <polygon points="0.75 0.75,10.75 0.75,20.75 20.75,0.75 20.75" stroke-width="1.5" stroke="#e7e7e7" fill="transparent"></polygon>
          </svg>
        </button>
        <button id="custom-clip-path">
          <svg width="21.5" height="21.5">
            <path d="M 0.75 20.75 Q 4.75 10.75 0.75 0.75 Q 10.75 4.75 20.75 0.75 Q 16.75 10.75 20.75 20.75 Q 10.75 16.75 0.75 20.75 Z" stroke-width="1.5" stroke="#e7e7e7" fill="transparent">
          </svg>
        </button>
        <button id="shuriken">
          <svg width="21.5" height="21.5">
            <path d="M 0.75 13.25 A 5 5 0 0 1 5.75 8.25 L 8.25 8.25 L 8.25 0.75 A 5 5 0 0 1 13.25 5.75 L 13.25 8.25 L 20.75 8.25 A 5 5 0 0 1 15.75 13.25 L 13.25 13.25  L 13.25 20.75 A 5 5 0 0 1 8.25 15.75 L 8.25 13.25 Z" stroke-width="1.5" stroke="#e7e7e7" fill="transparent">
          </svg>
        </button>
        <button id="text">
          <svg width="20" height="22">
            <text dx="0" dy="22" stroke-width="1.5" stroke="#e7e7e7" fill="transparent" style="font:normal 30px sans-serif;">A</text>
          </svg>
        </button>
        <button id="star">
          <svg width="21.5" height="21.5">
            <polygon points="10.75 0.75,13.55 7.35,20.75 8.75,15.35 13.35,17.15 20.75,10.75 16.75,4.35 20.75,6.15 13.35,0.75 8.75,7.95 7.35" stroke-width="1.5" stroke="#e7e7e7" fill="transparent"></polygon>
          </svg>
        </button>
        <button id="heart">
          <svg width="21.5" height="22">
            <path d="M 10.75 3.5530690796733615 C -0.2859999999999996 -5.937837122048112 -4.699999999999999 11.277702935334363 10.75 21.209666740233942 C 26.2 11.277702935334363 21.786 -5.937837122048112 10.75 3.5530690796733615 Z" stroke-width="1.5" stroke="#e7e7e7" fill="transparent">
          </svg>
        </button>
        <button id="shield">
          <svg width="19.28" height="21.5">
            <path d="M 0.7511111100000019 4.08333334 Q 5.195555555000001 3.63888888 9.64 0.75 Q 14.084444444999999 3.63888888 18.528888889999998 4.08333334 Q 18.528888889999998 14.08333334 9.64 20.75 Q 0.7511111100000019 14.08333334 0.7511111100000019 4.08333334 Z" stroke-width="1.5" stroke="#e7e7e7" fill="transparent">
          </svg>
        </button>
        <button id="diamond">
        <svg width="21.5" height="14.84">
          <polygon points="10.75 14.08666665,0.75 2.9755555711111112,5.194444440000001 0.7533333500000001,16.30555556 0.7533333500000001,20.75 2.9755555711111112" stroke-width="1.5" stroke="#e7e7e7" fill="transparent"></polygon>
        </svg>
        </button>
        <button id="bubbleMessage">
          <svg width="21.5" height="16.5">
            <ellipse cx="3.75" cy="15.4155" rx="0.6659999999999999" ry="0.3345" stroke-width="1.5" stroke="#e7e7e7" fill="transparent"></ellipse>
            <ellipse cx="5.416" cy="13.7475" rx="1" ry="0.49950000000000006" stroke-width="1.5" stroke="#e7e7e7" fill="transparent"></ellipse>
            <ellipse cx="7.748" cy="11.748000000000001" rx="1.3319999999999999" ry="0.666" stroke-width="1.5" stroke="#e7e7e7" fill="transparent"></ellipse>
            <ellipse cx="10.75" cy="5.7495" rx="10" ry="4.9995" stroke-width="1.5" stroke="#e7e7e7" fill="transparent"></ellipse>
          </svg>
        </button>
        <button id="basicCloud">
          <svg width="26.5" height="17.61">
            <path d="M 6.9525 4.446455368221297 A 6.205 6.205330997737392 0 0 0 6.9525 16.857117363696084 H 20.4575 A 5.2925 5.292403474198964 0 0 0 20.4575 6.272310415298153 A 7.1175 6.387272461864098 0 0 0 6.9525 4.446455368221297 Z" stroke-width="1.5" stroke="#e7e7e7" fill="transparent">
          </svg>
        </button>
        <button id="message">
          <svg width="26.5" height="19">
            <path d="M 0.75 2.4820769230769235 A 1.925 1.9243846153846151 0 0 1 2.675 0.5576923076923084 H 23.830000000000002 A 1.925 1.9243846153846151 0 0 1 25.755000000000003 2.4820769230769235 V 12.098634615384615 A 1.925 1.9243846153846151 0 0 1 23.830000000000002 14.02301923076923 H 10.367500000000001 L 6.520000000000001 18.447673076923074 L 7.097500000000002 14.02301923076923 H 2.6750000000000016 A 1.925 1.9243846153846151 0 0 1 0.7500000000000018 12.098634615384615 V 2.4838653846153846" stroke-width="1.5" stroke="#e7e7e7" fill="transparent">
          </svg>
        </button>
        <button id="ray">
          <svg width="21.5" height="21.5">
            <polygon points="7.749999999999999 0.75,16.305555555555554 0.75,10.083333333333332 7.75,13.97222222222222 7.75,7.749999999999999 13.75,10.861111111111109 13.75,0.75 20.75,5.416666666666666 13.75,2.3055555555555554 13.75,6.972222222222221 7.75,3.083333333333333 7.75" stroke-width="1.5" stroke="#e7e7e7" fill="transparent"></polygon>
          </svg>
        </button>
        <button id="hat">
        <svg width="26.5" height="12.96">
          <path d="M 7 7.000833326609849 A 6.25 6.249999976609848 0 1 1 19.5 7.000833326609849 L 25.75 5.959166673390151 A 2.0833333325 1.041666663532197 0 1 1 0.75 5.959166673390151 Z" stroke-width="1.5" stroke="#e7e7e7" fill="transparent">
        </svg>
        </button>
        <button id="squareWithoutCorners">
          <svg width="21.5" height="21.5">
            <path d="M 0.75 2.9722222200000004 A 2.2222222200000004 2.2222222200000004 0 0 0 2.9722222200000004 0.75 L 18.527777779999997 0.75 A 2.2222222200000004 2.2222222200000004 0 0 0 20.749999999999996 2.9722222200000004 L 20.749999999999996 18.527777779999997 A 2.2222222200000004 2.2222222200000004 0 0 0 18.527777779999997 20.749999999999996 L 2.9722222200000004 20.749999999999996 A 2.2222222200000004 2.2222222200000004 0 0 0 0.75 18.527777779999997 Z" stroke-width="1.5" stroke="#e7e7e7" fill="transparent">
          </svg>
        </button>
        <button id="packMan">
          <svg width="21.5" height="21.5">
            <path d="M 10.75 0.75 A 10 10 0 1 0 20.75 10.75 H 10.75 V 0.75" stroke-width="1.5" stroke="#e7e7e7" fill="transparent">
          </svg>
        </button>
        <button id="circleOneBorderTip">
          <svg width="21.5" height="21.5">
            <path d="M 0.75 0.75 L 0.75 10.75 A 10 10 0 1 0 10.75 0.75 Z" stroke-width="1.5" stroke="#e7e7e7" fill="transparent">
          </svg>
        </button>
        <button id="cloud">
          <svg width="26.5" height="16.20">
            <path d="M 4.1075 8.734735570469798 A 3.3575 3.3558704697986577 0 0 0 4.1075 15.446476510067114 H 23.567500000000003 A 2.1825 1.6779352348993288 0 0 0 23.567500000000003 12.090606040268456 A 1.6775 1.6779352348993288 0 0 0 21.887500000000003 8.734735570469798 A 7.0475 7.550708557046979 0 0 0 7.792500000000002 7.897237248322147 A 1.8425000000000011 1.842496308724832 0 0 0 4.1075 8.734735570469798 Z" stroke-width="1.5" stroke="#e7e7e7" fill="transparent">
          </svg>
        </button>
        <button id="bone">
          <svg width="26.5" height="12.62">
            <path d="M 3.527777775 6.31 A 2.777777775 2.777777775 0 1 1 6.30555555 3.5322222249999995 H 20.19444445 A 2.777777775 2.777777775 0 1 1 22.972222225 6.31 A 2.777777775 2.777777775 0 1 1 20.19444445 9.087777775 H 6.30555555 A 2.777777775 2.777777775 0 1 1 3.527777775 6.31" stroke-width="1.5" stroke="#e7e7e7" fill="transparent">
          </svg>
        </button>
        <button id="flower">
          <svg height="21.5" width="19.28">
            <path d="M 0.751111100000001 0.75 V 11.86111112 A 8.8888889 8.888888880000001 0 1 0 18.5288889 11.86111112 V 0.75 A 8.8888889 8.888888880000001 0 0 0 9.64 9.638888880000001 A 8.8888889 8.888888880000001 0 0 0 0.751111100000001 0.75" stroke-width="1.5" stroke="#e7e7e7" fill="transparent">
          </svg>
        </button>
        <button id="octagon">
          <svg width="21.5" height="21.5">
            <polygon points="5.75 0.75,15.75 0.75,20.75 5.75,20.75 15.75,15.75 20.75,5.75 20.75,0.75 15.75,0.75 5.75" stroke-width="1.5" stroke="#e7e7e7" fill="transparent"></polygon>
          </svg>
        </button>
        <button id="circlePoints">
          <svg width="21.5" height="21.5">
            <polygon points="20.75 10.75,18.262756426692754 12.76303701746405,19.41025403784439 15.75,16.249719409228703 16.249719409228703,15.75 19.41025403784439,12.76303701746405 18.262756426692754,10.75 20.75,8.736962982535948 18.262756426692754,5.750000000000003 19.41025403784439,5.250280590771298 16.249719409228703,2.089745962155613 15.75,3.2372435733072473 12.763037017464052,0.75 10.750000000000002,3.2372435733072455 8.736962982535951,2.089745962155613 5.749999999999999,5.250280590771296 5.250280590771298,5.749999999999995 2.0897459621556163,8.736962982535951 3.2372435733072473,10.749999999999998 0.75,12.763037017464052 3.2372435733072473,15.75 2.089745962155613,16.249719409228703 5.250280590771296,19.410254037844382 5.749999999999995,18.262756426692754 8.736962982535951,20.75 10.749999999999995" stroke-width="1.5" stroke="#e7e7e7" fill="transparent"></polygon>
          </svg>
        </button>
        <button id="flag">
          <svg width="17.5" height="21.5">
            <polygon points="0.75 0.75,0.75 20.75,8.75 10.75,16.75 20.75,16.75 0.75" stroke-width="1.5" stroke="#e7e7e7" fill="transparent"></polygon>
          </svg>
        </button>
        <button id="hourglass">
          <svg width="21.5" height="19">
            <path d="M 0.75 0.75 H 20.75 A 8.75 8.75 0 0 1 12 9.5 A 8.75 8.75 0 0 1 20.75 18.25 H 0.75 A 8.75 8.75 0 0 1 9.5 9.5 A 8.75 8.75 0 0 1 0.75 0.75" stroke-width="1.5" stroke="#e7e7e7" fill="transparent">
          </svg>
        </button>
        <button id="ellipseStretched">
          <svg width="21.5" height="15.5">
            <rect x="0.75" y="0.75" width="20" height="14" rx="8" ry="5.6" stroke-width="1.5" stroke="#e7e7e7" fill="transparent"></rect>
          </svg>
        </button>
        <button id="moon">
         <svg width="16.52" height="21.5">
          <path d="M 15.765540297175166 19.403845522 A 8.65384551900383 8.653845519999999 0 0 1 15.765540297175166 2.096154478 A 9.999999266404426 9.999999266404426 0 1 0 15.765540297175166 19.403845522 Z" stroke-width="1.5" stroke="#e7e7e7" fill="transparent">
         </svg>
        </button>
        <button id="flash">
          <svg width="25" height="25">
            <polygon points="0 12.5,11.666666666666664 11.944444444444446,6.25 2.7777777777777777,11.944444444444446 11.38888888888889,12.5 0,13.055555555555554 11.38888888888889,18.75 2.7777777777777777,13.333333333333336 11.944444444444446,25 12.5,13.333333333333336 13.055555555555554,18.75 22.22222222222222,13.055555555555554 13.61111111111111,12.5 25,11.944444444444446 13.61111111111111,6.25 22.22222222222222,11.666666666666664 13.055555555555554" fill="#e7e7e7"></polygon>
          </svg>
        </button>
        <button id="narrowStar">
          <svg width="25" height="25">
           <polygon points="0 12.5,11.944444444444446 11.944444444444446,12.5 0,13.055555555555554 11.944444444444446,25 12.5,13.055555555555554 13.055555555555554,12.5 25,11.944444444444446 13.055555555555554" fill="#e7e7e7"></polygon>
          </svg>
        </button>
      </div>`,
      toolsOutlineFill:`<div class="tool-fill-outline">
        <div class="top-container">
          <button id="change-type-colors">
            <img src="./icons-svg/lines-desc.svg" alt="free style gradient">
          </button>
          <div class="container-color">
            <button id="color-top" class="color">Top</button>
            <button id="color-bottom" class="color">Bottom</button>
            <button id="gradient-white-black" class="gradient hide"></button>
            <input type="range" min="0" max="359" id="degrees-gradient-top" class="hide">
          </div>
          <button class="matchOrinput" id="match-color">
            <img src="./icons-svg/equal-svgrepo-com.svg" alt="icon match">
          </button>
          <button id="mode-gradient">
            <span class="gradient-selected"></span>
          </button>
        </div>
        <div class="center-container">
          <div class="angle-gradient-range">
            <div class="container-buttons-gradient" data-intominimodal="true">
              <button class="name-gradient" data-intominimodal="true">Gradient</button>
              <button class="subtract-gradient hide" data-intominimodal="true">
                <img src="./icons-svg/subtract-svgrepo-com.svg" alt="icon subtract">
              </button>
              <button class="add-gradient gradient hide" data-intominimodal="true">
                <img src="./icons-svg/add-svgrepo-com.svg" alt="icon add">
              </button>
            </div>
            <input type="range" min="0" max="359" id="degrees-gradient-center" data-intominimodal="true">
          </div>
          <button id="on-off-buttons">On</button>
          <button id="angle-gradient">
            <img src="./icons-svg/circle-with-right-half-black-svgrepo-com.svg" alt="gradientDeg">
          </button>
          <button id="blur">
            <img src="./icons-svg/circle-dot-svgrepo-com.svg" alt="icon blur shape">
          </button>
        </div>
        <div class="size-outline">
          <div class="container-buttons-size">
            <button class="name-size">Thickness</button>
            <button class="subtract-size hide">
              <img src="./icons-svg/subtract-svgrepo-com.svg" alt="icon subtract">
            </button>
            <button class="add-size hide">
              <img src="./icons-svg/add-svgrepo-com.svg" alt="icon add">
            </button>
          </div>
          <input type="range" min="0" max="100" id="range-size">
        </div>
        <div class="footer-container">
          <div class="opacity-range-container">
            <div class="container-buttons-opacity" data-intominimodal="true">
              <button class="name-opacity" data-intominimodal="true">Opacity</button>
              <button class="subtract-opacity hide" data-intominimodal="true">
                <img src="./icons-svg/subtract-svgrepo-com.svg" alt="icon subtract">
              </button>
              <button class="add-opacity hide" data-intominimodal="true">
                <img src="./icons-svg/add-svgrepo-com.svg" alt="icon add">
              </button>
            </div>
            <input type="range" min="0" max="255" id="opacity-range" data-intominimodal="true">
          </div>
          <div class="container-types-line">
            <button data-intominimodal="true" id="line1">
            <svg width="108" height="4">
              <rect width="108" height="4" rx="2" ry="2"></rect>
            </svg>
            </button>
            <button data-intominimodal="true" id="line2">
              <svg width="120" height="4">
    <circle r="2" cx="2" cy="2"></circle>
    <circle r="2" cx="11" cy="2"></circle>
    <circle r="2" cx="20" cy="2"></circle>
    <circle r="2" cx="29" cy="2"></circle>
    <circle r="2" cx="38" cy="2"></circle>
    <circle r="2" cx="47" cy="2"></circle>
    <circle r="2" cx="56" cy="2"></circle>
    <circle r="2" cx="64" cy="2"></circle>
    <circle r="2" cx="73" cy="2"></circle>
    <circle r="2" cx="82" cy="2"></circle>
    <circle r="2" cx="91" cy="2"></circle>
    <circle r="2" cx="100" cy="2"></circle>
    <circle r="2" cx="109" cy="2"></circle>
    <circle r="2" cx="118" cy="2"></circle>
  </svg>
            </button>
            <button data-intominimodal="true" id="line3">
            <svg width="115" height="4">
              <rect  x="0" y="0" width="10" height="4" rx="2" ry="2"></rect>
              <rect  x="15" y="0" width="10" height="4" rx="2" ry="2"></rect>
              <rect  x="30" y="0" width="10" height="4" rx="2" ry="2"></rect>
              <rect  x="45" y="0" width="10" height="4" rx="2" ry="2"></rect>
              <rect x="60" y="0" width="10" height="4" rx="2" ry="2"></rect>
              <rect  x="75" y="0" width="10" height="4" rx="2" ry="2"></rect>
              <rect  x="90" y="0" width="10" height="4" rx="2" ry="2"></rect>
              <rect  x="105" y="0" width="10" height="4" rx="2" ry="2"></rect>
            </svg>
            </button>
            <button data-intominimodal="true" id="line4">
              <svg width="115" height="4">
              <rect x="0" y="0" width="10" height="4" rx="2" ry="2"></rect>
              <circle r="2" cx="17" cy="2" ></circle>
              <rect  x="24" y="0" width="10" height="4" rx="2" ry="2"></rect>
              <circle r="2" cx="41" cy="2" ></circle> 
              <rect  x="48" y="0" width="10" height="4" rx="2" ry="2"></rect>
              <circle r="2" cx="65" cy="2" ></circle>
              <rect  x="72" y="0" width="10" height="4" rx="2" ry="2"></rect>
              <circle r="2" cx="89" cy="2" ></circle>
              <rect  x="96" y="0" width="10" height="4" rx="2" ry="2"></rect>
              <circle r="2" cx="113" cy="2" ></circle>
              </svg>
            </button>
            <button data-intominimodal="true" id="line5">
              <svg width="120" height="4">
              <rect x="0" y="0" width="20" height="4" rx="2" ry="2"></rect>
              <rect x="25" y="0" width="20" height="4" rx="2" ry="2"></rect>
              <rect x="50" y="0" width="20" height="4" rx="2" ry="2"></rect>
              <rect x="75" y="0" width="20" height="4" rx="2" ry="2"></rect>
              <rect x="100" y="0" width="20" height="4" rx="2" ry="2"></rect>
            </svg>
            </button>
            <button data-intominimodal="true" id="line6">
              <svg width="122" height="4">
              <rect x="0" y="0" width="20" height="4" rx="2" ry="2"></rect>
              <circle r="2" cx="27" cy="2"></circle>
              <rect x="34" y="0" width="20" height="4" rx="2" ry="2"></rect>
              <circle r="2" cx="61" cy="2"></circle> 
              <rect x="68" y="0" width="20" height="4" rx="2" ry="2"></rect>
              <circle r="2" cx="95" cy="2"></circle>
              <rect x="102" y="0" width="20" height="4" rx="2" ry="2"></rect>
              </svg>
            </button>
            <button data-intominimodal="true" id="line7">
              <svg width="124" height="4">
              <rect  x="0" y="0" width="20" height="4" rx="2" ry="2"></rect>
              <circle r="2" cx="27" cy="2" ></circle>
              <circle r="2" cx="36" cy="2" ></circle>
              <rect  x="43" y="0" width="20" height="4" rx="2" ry="2"></rect>
              <circle r="2" cx="70" cy="2" ></circle>
              <circle r="2" cx="79" cy="2" ></circle>
              <rect x="86" y="0" width="20" height="4" rx="2" ry="2"></rect>
              <circle r="2" cx="113" cy="2" ></circle>
              <circle r="2" cx="122" cy="2" ></circle>
              </svg>
            </button>
            <button data-intominimodal="true" id="line8">
              <svg width="130" height="4">
              <rect x="0" y="0" width="20" height="4" rx="2" ry="2"></rect>
              <rect x="25" y="0" width="10" height="4" rx="2" ry="2"></rect>
              <rect x="40" y="0" width="10" height="4" rx="2" ry="2"></rect>
              <rect x="55" y="0" width="20" height="4" rx="2" ry="2"></rect>
              <rect x="80" y="0" width="10" height="4" rx="2" ry="2"></rect>
              <rect x="95" y="0" width="10" height="4" rx="2" ry="2"></rect>
              <rect x="110" y="0" width="20" height="4" rx="2" ry="2"></rect>
              </svg>
            </button>
            <div class="container-long-range" data-intominimodal="true">
              <div class="round-container" data-intominimodal="true">
                <input type="checkbox" id="checkbox-round" data-intominimodal="true">
                <label for="checkbox-round" data-intominimodal="true">Round</label>
              </div>
              <input type="range" id="range-size-line" data-intominimodal="true" min="10" max="200">
            </div>
          </div>
          <button id="types-line"></button>
          <button id="opacity">Opacity - 255</button>
          <button id="superposition-shape">Normal</button>
        </div>
      </div>`,
      shadow:`<div class="tool-shadow">
        <div>
          <div class="container-buttons">
            <button class="name-distance">Distance</button>
            <button class="subtract-distance hide">
              <img src="./icons-svg/subtract-svgrepo-com.svg" alt="icon subtract">
            </button>
            <button class="add-distance hide">
              <img src="./icons-svg/add-svgrepo-com.svg" alt="icon add">
            </button>
          </div>
          <input type="range" min="0" max="100" id="range-distance">
        </div>
        <div>
          <div class="container-buttons">
            <button class="name-angle">Angle</button>
            <button class="subtract-angle hide">
              <img src="./icons-svg/subtract-svgrepo-com.svg" alt="icon subtract">
            </button>
            <button class="add-angle hide">
              <img src="./icons-svg/add-svgrepo-com.svg" alt="icon add">
            </button>
          </div>
          <input type="range" id="range-angle" min="0" max="360">
        </div>
        <div>
          <div class="container-buttons">
            <button class="name-blur">Blur</button>
            <button class="subtract-blur hide">
              <img src="./icons-svg/subtract-svgrepo-com.svg" alt="icon subtract">
            </button>
            <button class="add-blur hide">
              <img src="./icons-svg/add-svgrepo-com.svg" alt="icon add">
            </button>
          </div>
        <input type="range" min="0" max="100" id="range-blur">
        </div>
        <div class="footer-container-shadow">
          <button id="color-shadow" class="color"></button>
          <button id="reset-setting">
            <img src="./icons-svg/close-svgrepo-com.svg" alt="icon reset values">
          </button>
        </div>
      </div>`,
      hardnessModal:`<div class="modal-blur">
        <div>
          <span class="preview-blur-shape"></span>
          <div class="container-input">
            <div>
              <button class="name-hardness">Hardness</button>
              <button class="subtract-hardness hide">
                <img src="./icons-svg/subtract-svgrepo-com.svg" alt="icon subtract">
              </button>
              <button class="add-hardness hide">
                <img src="./icons-svg/add-svgrepo-com.svg" alt="icon add">
              </button>
            </div>
            <input type="range" min="0" max="100" id="hardness-range">
          </div>
          <div class="container-buttons-footer">
            <button id="cancel-modalHARDNESS">cancel</button>
            <button id="apply-modalHARDNESS">apply</button>
          </div>
        </div>
      </div>`,
      modalAdjustGradientBlackWhite:`<div class="modal-adjust-gradient-black-white">
    <div>
      <nav>
        <ul>
          <li id="GRADIENT">GRADIENT</li>
          <li id="FAVORITES">FAVORITES</li>
        </ul>
        <span class="scroll">
        </span>
      </nav>
      <main>
      </main>
      <div class="container-footer">
        <button id="cancel-modal-adjust-gradient-black-white">cancel</button>
        <button id="apply-modal-adjust-gradient-black-white">apply</button>
      </div>
    </div>
  </div>`,
  indicator:`
  <div class="indicators">
    <span class="line"></span>
    <span class="circle"></span>
  </div>
  `,
  GRADIENT:`
  <div class="children-top">
    <button id="add-as-favorite">
      <img src="./icons-svg/start-favorite-svgrepo-com.svg" alt="icon add as favorite">
    </button>
    <button id="button-add-more-colors">
      <img src="./icons-svg/add-svgrepo-com.svg" alt="icon add">
    </button>
  </div>
  <div class="children-center">
    <span class="preview-gradient">
    </span>
    <div class="delete-circle">
      To Delete, Drag The Node HERE
    </div>
  </div>
  `,
  FAVORITES:`
  <div class="top-container-favorites">
    <span class="current-gradient">
    </span>
    <button class="position-as-favorite">
      <img src="./icons-svg/start-favorite-svgrepo-com.svg" alt="icon add as favorite">
    </button>
  </div>
  <div class="center-container-favorites">
    <span class="indicator-position"></span>
    <span class="indicator-position"></span>
    <span class="indicator-position"></span>
    <span class="indicator-position"></span>
    <span class="indicator-position"></span>
    <span class="indicator-position"></span>
  </div>
  <div class="footer-container-favorites">
    <button id="change-order-gradient-favorites">
      <img src="./icons-svg/sortdescending-svgrepo-com.svg" alt="icon order">
    </button>
    <button id="delete-gradient-favorites">
      <img src="./icons-svg/trash-svgrepo-com.svg" alt="icon delete">
    </button>
  </div>
  `,
  gradientFAVORITE:`<span class="gradient-favorite"></span>`,
  modalRemoveGradientFavorite:`<article class="modal-remove-gradient-favorite">
    <div>
      <p class="header">Delete</p>
      <div class="container-gradients">
      </div>
      <div class="footer">
        <button id="cancel-remove-gradient">
          cancel
        </button>
        <button id="apply-remove-gradient">
          apply
        </button>
      </div>
    </div>
  </article>`,
  modalOrderGradientsFavorites:`<article class="modal-order-gradient-favorite">
    <div>
      <p class="text-top">Drag The Handle To Change The Order</p>
      <div class="container-gradients">
      </div>
      <div class="footer">
        <button id="cancel-order-gradient">
          cancel
        </button>
        <button id="apply-order-gradient">
          apply
        </button>
      </div>
    </div>
  </article>`,
  containerParentOfGradientFavorite:`<div class="container-parent-gradient">
    <span class="gradient-favorite order-gradient">
    </span>
    <button id="handle-order-gradient">
      <img src="./icons-svg/menu-1-svgrepo-com.svg" alt="icon drag">
    </button>
  </div>`,
  modalTypesGradient:`<article class="modal-select-mode-gradient">
    <div>
      <span class="preview-gradient-selected">
      </span>
      <div class="container-all-types-gradient">
        <div class="container-gradient" data-percentajes='{"values":[{"bottom":true,"start":0},{"top":true,"start":100}]}' id="type-gradient-definite">
          <span class="gradient"></span>
        </div>
        <div class="container-gradient" data-percentajes='{"values":[{"bottom":true,"start":20},{"top":true,"start":80}]}' id="type-gradient-definite">
          <span class="gradient"></span>
        </div>
        <div class="container-gradient" data-percentajes='{"values":[{"bottom":true,"start":30},{"top":true,"start":70}]}' id="type-gradient-definite">
          <span class="gradient"></span>
        </div>
        <div class="container-gradient" data-percentajes='{"values":[{"bottom":true,"start":40},{"top":true,"start":60}]}' id="type-gradient-definite">
          <span class="gradient"></span>
        </div>
        <div class="container-gradient" data-percentajes='{"values":[{"bottom":true,"start":50},{"top":true,"start":50}]}' id="type-gradient-definite">
          <span class="gradient"></span>
        </div>
        <div class="container-gradient" data-percentajes='{"values":[{"bottom":true,"start":50},{"top":true,"start":100}]}' id="type-gradient-definite">
          <span class="gradient"></span>
        </div>
        <div class="container-gradient" data-percentajes='{"values":[{"bottom":true,"start":56.25},{"top":true,"start":93.75}]}' id="type-gradient-definite">
          <span class="gradient"></span>
        </div>
        <div class="container-gradient" data-percentajes='{"values":[{"bottom":true,"start":62.5},{"top":true,"start":87.5}]}' id="type-gradient-definite">
          <span class="gradient"></span>
        </div>
        <div class="container-gradient" data-percentajes='{"values":[{"bottom":true,"start":68.75},{"top":true,"start":81.25}]}' id="type-gradient-definite">
          <span class="gradient"></span>
        </div>
        <div class="container-gradient" data-percentajes='{"values":[{"bottom":true,"start":75},{"top":true,"start":75}]}' id="type-gradient-definite">
          <span class="gradient"></span>
        </div>
        <div class="container-gradient" data-percentajes='{"values":[{"bottom":true,"start":0},{"top":true,"start":50}]}' id="type-gradient-definite">
          <span class="gradient"></span>
        </div>
        <div class="container-gradient" data-percentajes='{"values":[{"bottom":true,"start":6.25},{"top":true,"start":43.75}]}' id="type-gradient-definite">
          <span class="gradient"></span>
        </div>
        <div class="container-gradient" data-percentajes='{"values":[{"bottom":true,"start":12.5},{"top":true,"start":37.5}]}' id="type-gradient-definite">
          <span class="gradient"></span>
        </div>
        <div class="container-gradient" data-percentajes='{"values":[{"bottom":true,"start":18.75},{"top":true,"start":31.25}]}' id="type-gradient-definite">
          <span class="gradient"></span>
        </div>
        <div class="container-gradient" data-percentajes='{"values":[{"bottom":true,"start":25},{"top":true,"start":25}]}' id="type-gradient-definite">
          <span class="gradient"></span>
        </div>
        <div class="container-gradient" data-percentajes='{"values":[{"top":true,"start":0},{"bottom":true,"start":50},{"top":true,"start":100}]}' id="type-gradient-definite">
          <span class="gradient"></span>
        </div>
        <div class="container-gradient" data-percentajes='{"values":[{"top":true,"start":6.25},{"bottom":true,"start":43.75,"end":56.25},{"top":true,"start":93.75}]}' id="type-gradient-definite">
          <span class="gradient"></span>
        </div>
        <div class="container-gradient" data-percentajes='{"values":[{"top":true,"start":12.5},{"bottom":true,"start":37.5,"end":62.5},{"top":true,"start":87.5}]}' id="type-gradient-definite">
          <span class="gradient"></span>
        </div>
        <div class="container-gradient" data-percentajes='{"values":[{"top":true,"start":18.75},{"bottom":true,"start":31.25,"end":68.75},{"top":true,"start":81.25}]}' id="type-gradient-definite">
          <span class="gradient"></span>
        </div>
        <div class="container-gradient" data-percentajes='{"values":[{"top":true,"start":25},{"bottom":true,"start":25,"end":75},{"top":true,"start":75}]}' id="type-gradient-definite">
          <span class="gradient"></span>
        </div>
        <div class="container-gradient" data-percentajes='{"values":[{"bottom":true,"start":0},{"top":true,"start":50},{"bottom":true,"start":100}]}' id="type-gradient-definite">
          <span class="gradient"></span>
        </div>
        <div class="container-gradient" data-percentajes='{"values":[{"bottom":true,"start":6.25},{"top":true,"start":43.75,"end":56.25},{"bottom":true,"start":93.75}]}' id="type-gradient-definite">
          <span class="gradient"></span>
        </div>
        <div class="container-gradient" data-percentajes='{"values":[{"bottom":true,"start":12.5},{"top":true,"start":37.5,"end":62.5},{"bottom":true,"start":87.5}]}' id="type-gradient-definite">
          <span class="gradient"></span>
        </div>
        <div class="container-gradient" data-percentajes='{"values":[{"bottom":true,"start":18.75},{"top":true,"start":31.25,"end":68.75},{"bottom":true,"start":81.25}]}' id="type-gradient-definite">
          <span class="gradient"></span>
        </div>
        <div class="container-gradient" data-percentajes='{"values":[{"bottom":true,"start":25},{"top":true,"start":25,"end":75},{"bottom":true,"start":75}]}' id="type-gradient-definite">
          <span class="gradient"></span>
        </div>
      </div>
      <div class="options-in-type-gradient">
        <button class="linear-gradient" id="mode-gradient-linear">
          <img src="./icons-svg/menu-svgrepo-com.svg" alt="linear">
        </button>
        <button class="ellipse-gradient" id="mode-gradient-ellipse">
          <img src="./icons-svg/radial-gradient-icon.svg" alt="radial">
        </button>
      </div>
      <div class="controls-deg">
        <div class="buttons-add-subtract">
          <button id="less-deg-gradient">
            <img src="./icons-svg/subtract-svgrepo-com.svg" alt="subtract">
          </button>
          <button id="sum-deg-gradient">
            <img src="./icons-svg/add-svgrepo-com.svg" alt="add">
          </button>
        </div>
        <input type="range" id="range-degrees-in-modal-types-gradient" min="0" max="359">
      </div>
      <div class="container-footer">
        <button id="cancel-modal-type-gradient">cancel</button>
        <button id="apply-modal-type-gradient">apply</button>
      </div>
    </div>
  </article>`
  }
  }
}

export function modalEditSizeCrop () {
  return {
    modal:`<article class="modal-edit-size-crop" id="parent">
    <div>
    <div class="modal-crop-header">
      <button id="crop-ratio">
        ratio
      </button>
      <button id="crop-size">
        size
      </button>
      <span></span>
    </div>
    <div class="modal-crop-body">
      <div class="modal-crop-sizes">
        <div>
          <span id="label-width">Width</span>
          <input type="number" id="crop-input-width" maxlength="6">
        </div>
        <span class="separator-of-measures">:</span>
        <div>
          <span id="label-height">Height</span>
          <input type="number" id="crop-input-height">
        </div>
        <button id="crop-exchange-value">
          <img src="./icons-svg/arrows-couple-to-opposite-directions-svgrepo-com.svg" alt="icon change value with contrary">  
        </button>
      </div>
      <span id="message-modal-crop-size" class="hide"></span>
      <div class="modal-crop-history">
        <span id="crop-clear-history" class="hide">Clear</span>
      </div>
      <div class="buttons-apply-cancel">
        <button id="crop-cancel">
          cancel
        </button>
        <button id="crop-apply">
          apply
        </button>
      </div>
    </div>
    </div>
  </article>`,
  modalClearHistory:`<article class="modal-in-modal-crop">
    <div>
    <p>Are You Sure You Want To DELETE ALL?</p>
    <div>
      <button id="cancel-DELETEALLHISTORY">
        cancel
      </button>
      <button id="clear-DELETEALLHISTORY">
        clear
      </button>
    </div>
    </div>
  </article>`
  }
}