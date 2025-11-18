const cells = document.querySelectorAll(".board");
var isMouseDown = false;
var changeCellToSelected = false;
let eventHandlersExist = false;
function giveBoardCellsEventHandlers() {
	if (eventHandlersExist == true) return;

	for (var i = 0; i < cells.length; i++) {
		cells[i].addEventListener("mouseover", changeBoardCellSelection);
		cells[i].addEventListener("mousedown", onMouseDown);
		cells[i].addEventListener("mouseup", onMouseUp);
		/*
				cells[i].addEventListener("ontouchmove", changeBoardCellSelection);
				cells[i].addEventListener("ontouchstart", onMouseDown);
				cells[i].addEventListener("ontouchend", onMouseUp);*/
		// add id for each cell
		cells[i].cellLocationId = createCellLocationId(cells[i].parentNode.rowIndex, cells[i].cellIndex);
	}
	eventHandlersExist = true;
}

function removeBoardCellsEventHandlers() {
	if (eventHandlersExist == false) return;
	for (var i = 0; i < cells.length; i++) {
		cells[i].removeEventListener("mouseover", changeBoardCellSelection);
		cells[i].removeEventListener("mousedown", onMouseDown);
		cells[i].removeEventListener("mouseup", onMouseUp);
		/*
				cells[i].addEventListener("ontouchmove", changeBoardCellSelection);
				cells[i].addEventListener("ontouchstart", onMouseDown);
				cells[i].addEventListener("ontouchend", onMouseUp);*/
	}
	eventHandlersExist = false;
}

function onMouseDown() {
	//console.log('down event');
	isMouseDown = true;
	if (this.getAttribute('class') == 'board-selected') {
		this.setAttribute('class', 'board');
		changeCellToSelected = false;
	} else {
		this.setAttribute('class', 'board-selected');
		changeCellToSelected = true;
	}
}

function onMouseUp() {
	//console.log('up event');
	isMouseDown = false;

	if (changeCellToSelected) {
		logEvent("user", "add");
	} else {
		logEvent("user", "delete");
	}
}

function changeBoardCellSelection(e) {
	//console.log('move event');
	var flags = e.buttons !== undefined ? e.buttons : e.which;
	isMouseDown = (flags & 1) === 1;

	if (isMouseDown) {
		if (changeCellToSelected) {
			this.setAttribute('class', 'board-selected');
		} else {
			this.setAttribute('class', 'board');
		}
	}
}


function clearBoard() {
	let selected_cells = document.querySelectorAll(".board-selected");
	for (var i = 0; i < selected_cells.length; i++) {
		selected_cells[i].setAttribute('class', 'board');
	}

	selected_cells = document.querySelectorAll(".board-tutorial-blue");
	for (var i = 0; i < selected_cells.length; i++) {
		selected_cells[i].setAttribute('class', 'board');
	}

	selectedCellsSize = 0;
}

let minimizeGreyCellsMsgShown = false;

function checkBoard() {

	if (checkConnectivity() == true) {
		tutorial5_submit_btn_pressed = true;
		console.log('cells are adjecent');
		//alert('connectivity ok');
		clearProductionBoard();
		findConvexHull();

		drawMarkedCells();
		findPenaltyCells();
		drawCircle();
		drawHull();
		updateScore();

		let error_messages = document.getElementById('error_messages');
		error_messages.innerText = '';

		logEvent("system", "check");

		if (!minimizeGreyCellsMsgShown && penaltyCellsSize == 0) {

			alert(translation.minimize_grey_cells);
			minimizeGreyCellsMsgShown = true;
		}
		if (mobile_mode) {
			switchToProductionMode();
		}
	} else {
		console.log('cells are not adjecent');
		alert(translation.no_connectivity);
		//let error_messages = document.getElementById('error_messages');
		//error_messages.innerText = translation.no_connectivity;
		logEvent("system", "error");
	}

}

function checkConnectivity() {
	//console.log('checking board');

	let selected_cells = document.querySelectorAll(".board-selected");
	if (selected_cells.length < 2) return false;

	let current_marked_cells = [];
	current_marked_cells.push(selected_cells[0].cellLocationId);


	let cells_locationIds = new Set();
	for (var i = 1; i < selected_cells.length; i++) {
		//console.log(selected_cells[i].cellLocationId);
		cells_locationIds.add(selected_cells[i].cellLocationId);
	}

	while (current_marked_cells.length > 0) {
		var current_id = current_marked_cells.shift();
		console.log('current id ' + current_id);

		//check for adajcent cells
		let indices = current_id.split("|");
		let cell_row = parseInt(indices[0]);
		let cell_col = parseInt(indices[1]);

		let found_adjecent_cell = false;
		if (cell_row > 1) {
			if (checkAdjecentCell(cell_row - 1, cell_col, cells_locationIds, current_marked_cells))
				found_adjecent_cell = true;
		}

		if (cell_row < 10) {
			if (checkAdjecentCell(cell_row + 1, cell_col, cells_locationIds, current_marked_cells))
				found_adjecent_cell = true;
		}

		if (cell_col > 1) {
			if (checkAdjecentCell(cell_row, cell_col - 1, cells_locationIds, current_marked_cells))
				found_adjecent_cell = true;

		}
		if (cell_col < 10) {
			if (checkAdjecentCell(cell_row, cell_col + 1, cells_locationIds, current_marked_cells))
				found_adjecent_cell = true;
		}

		if (found_adjecent_cell == false && current_marked_cells.length == 0) {
			if (cells_locationIds.size == 0) {
				console.log('cells are adjecent');
				return true;
			} else {
				console.log('cells are not adjecent');
				return false;
			}
		}
	}
}

function updateScore() {
	markedCells = document.getElementById('markedCells');
	markedCells.innerText = selectedCellsSize;

	penaltyCells = document.getElementById('penaltyCells');
	penaltyCells.innerText = penaltyCellsSize;

	score = document.getElementById('score');
	let currScore = selectedCellsSize + penaltyCellsSize;
	scoreSize = currScore;
	score.innerText = currScore;

	highScore = document.getElementById('highScore');
	if (highScoreSize == undefined || highScoreSize > currScore) {
		highScoreSize = currScore;
		highScore.innerText = currScore;
	}
}

function checkAdjecentCell(cell_row, cell_col, cells_locationIds, current_marked_cells) {
	let adjecent_cell_id = createCellLocationId(cell_row, cell_col);

	if (cells_locationIds.has(adjecent_cell_id)) {
		console.log('found adjecent cell id ' + adjecent_cell_id);
		current_marked_cells.push(adjecent_cell_id);
		cells_locationIds.delete(adjecent_cell_id);
		return true;
	}

	return false;
}

function createCellLocationId(row, column) {
	return row + "|" + column;
}

function drawCircle() {
	const canvas = document.getElementById('Canvas');
	const context = canvas.getContext('2d');

	context.beginPath();
	let circleCenter = getCircleCenter();
	//console.log("circleCenter", circleCenter, getCircleRadius());
	context.arc(circleCenter.x, circleCenter.y, getCircleRadius(), 0, 2 * Math.PI, false);

	context.lineWidth = 1;
	context.strokeStyle = 'blue';
	context.stroke();
}

function getCircleCenter() {
	const canvas = document.getElementById('Canvas');
	return { x: canvas.width / 2, y: canvas.height / 2 };
}

function getCircleRadius() {
	const canvas = document.getElementById('Canvas');
	return canvas.height * 0.4;
}

function drawMarkedCells() {

	let selected_cells = document.querySelectorAll(".board-selected");
	selectedCellsSize = selected_cells.length;
	if (selected_cells.length == 0) return;

	if (!draw_Recs_In_Production) return;
	const canvas = document.getElementById('Canvas');
	const context = canvas.getContext('2d');

	for (var i = 0; i < selected_cells.length; i++) {

		let indices = selected_cells[i].cellLocationId.split("|");
		let centerX = parseInt(indices[1]) - 1;
		let centerY = parseInt(indices[0]) - 1;
		let cell_size_Y = canvas.height / 10;
		let cell_size_X = canvas.width / 10;

		context.fillStyle = '#f9f480';
		context.fillRect((centerX * cell_size_X) + 1, (centerY * cell_size_Y) + 1, cell_size_X - 2, cell_size_Y - 2);

		/*
				context.beginPath();
				context.arc((centerX * cell_size_X) + (cell_size_X / 2), (centerY * cell_size_Y) + (cell_size_Y / 2), 4, 0, 2 * Math.PI, false);
				context.fillStyle = '#c7c7c7';
				context.fill();
				context.lineWidth = 1;
				context.strokeStyle = 'white';
				context.stroke();*/
	}
}

function findConvexHull() {
	let selected_cells = document.querySelectorAll(".board-selected");
	if (selected_cells.length == 0) return;

	let points = [];
	let locationIds = new Set();
	for (var i = 0; i < selected_cells.length; i++) {

		let indices = selected_cells[i].cellLocationId.split("|");
		let xCoord = parseInt(indices[1]) - 1;
		let yCoord = parseInt(indices[0]) - 1;

		if (!locationIds.has({ x: xCoord, y: yCoord })) {
			points.push({ x: xCoord, y: yCoord });
		}
		if (!locationIds.has({ x: xCoord + 1, y: yCoord })) {
			points.push({ x: xCoord + 1, y: yCoord });
		}
		if (!locationIds.has({ x: xCoord, y: yCoord + 1 })) {
			points.push({ x: xCoord, y: yCoord + 1 });
		}
		if (!locationIds.has({ x: xCoord + 1, y: yCoord + 1 })) {
			points.push({ x: xCoord + 1, y: yCoord + 1 });
		}
		//console.log("findConvexHull" , xCoord, yCoord);
	}

	hull = [];
	// The 1st point of selected_cells is with the minimum Y coord - adding to hull
	hull.push(points[0]);

	let prev_point = 0;
	while (true) {
		let candidate = -1;
		for (var i = 0; i < points.length; i++) {
			if (i == prev_point)
				continue;
			if (candidate == -1) {
				candidate = i;
				continue;
			}

			let ccw = pointsCCW(points[prev_point], points[candidate], points[i]);
			if (ccw == 0 && squarePointsDistance(points[prev_point], points[candidate]) < squarePointsDistance(points[prev_point], points[i])) {
				candidate = i;
			} else if (ccw < 0) {
				candidate = i;
			}
		}

		if (candidate == 0) // candidate is starting point - found hull
			break;

		hull.push(points[candidate]);
		prev_point = candidate;
	}
}

function drawHull() {
	const canvas = document.getElementById('Canvas');
	const context = canvas.getContext('2d');
	context.strokeStyle = 'black';
	let cell_size_Y = canvas.height / 10;
	let cell_size_X = canvas.width / 10;

	console.log("hull", hull[0].x, hull[0].y);
	context.beginPath();
	context.lineWidth = 3;
	context.moveTo(hull[0].x * cell_size_X, hull[0].y * cell_size_Y);


	for (var i = 1; i < hull.length; i++) {
		console.log("hull", hull[i].x, hull[i].y);
		context.lineTo(hull[i].x * cell_size_X, hull[i].y * cell_size_Y);
	}
	context.closePath();
	context.fillStyle = "rgba(0,0,0,0.1)";
	context.fill();
	context.stroke();

	for (var i = 0; i < hull.length; i++) {
		context.beginPath();
		context.arc(hull[i].x * cell_size_X, hull[i].y * cell_size_Y, 3, 0, 2 * Math.PI, false);
		context.fillStyle = 'black';
		context.fill();
		/*	context.lineWidth = 1;
			context.strokeStyle = 'white';*/
		context.stroke();

	}

	poligonSize = hull.length;
	poligonVector = "P:";
	for (var i = 0; i < hull.length; i++) {
		poligonVector += (hull[i].x + 1).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
		poligonVector += (hull[i].y + 1).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
	}

	poligonVector += (hull[0].x + 1).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
	poligonVector += (hull[0].y + 1).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });

	console.log("poligon vector log", poligonSize, poligonVector);
}

function squarePointsDistance(point1, point2) {
	let deltaY = point2.y - point1.y;
	let deltaX = point2.x - point1.x;
	return deltaY * deltaY + deltaX * deltaX;
}

function pointsCCW(prevPoint, candidatePoint, currentPoint) {
	let point1 = { x: candidatePoint.x - prevPoint.x, y: candidatePoint.y - prevPoint.y };
	let point2 = { x: currentPoint.x - candidatePoint.x, y: currentPoint.y - candidatePoint.y };
	return point1.x * point2.y - point2.x * point1.y;
}

function findPenaltyCells() {

	const canvas = document.getElementById('Canvas');

	let cell_size_Y = canvas.height / 10;
	let cell_size_X = canvas.width / 10;
	let penaltyCells = [];
	let pointsInCircle = 0;
	testMatrixLog = 'T:';
	for (j = 0; j < 10; j++) {
		for (i = 0; i < 10; i++) {
			let cellLog = '0';
			let point = { x: i * cell_size_X + cell_size_X / 2, y: j * cell_size_Y + cell_size_Y / 2 };
			let inPolygon = pointInPolygon({ x: i + 0.5, y: j + 0.5 });
			if (pointInCircle(point)) {
				pointsInCircle++;
				if (!inPolygon) {
					penaltyCells.push(point);
					console.log("findPenaltyCells in circle", point);
					cellLog = '1';
				}
			} else if (inPolygon) {
				penaltyCells.push(point);
				console.log("findPenaltyCells in poligon", point);
				cellLog = '2';
			}
			testMatrixLog += cellLog;
		}
	}

	const context = canvas.getContext('2d');
	context.strokeStyle = 'red';



	for (i = 0; i < penaltyCells.length; i++) {
		context.beginPath();
		context.lineWidth = 1;
		context.moveTo(penaltyCells[i].x - (cell_size_X / 2) + 1, penaltyCells[i].y - (cell_size_Y / 2) + 1);
		context.lineTo(penaltyCells[i].x + (cell_size_X / 2) - 1, penaltyCells[i].y + (cell_size_Y / 2) - 1);
		context.stroke();

		context.beginPath();
		context.moveTo(penaltyCells[i].x - (cell_size_X / 2) + 1, penaltyCells[i].y + (cell_size_Y / 2) - 1);
		context.lineTo(penaltyCells[i].x + (cell_size_X / 2) - 1, penaltyCells[i].y - (cell_size_Y / 2) + 1);
		context.stroke();
		//context.fillRect(penaltyCells[i].x - cell_size_X / 2, penaltyCells[i].y - cell_size_Y / 2, cell_size_X / 3, cell_size_Y / 3);
	}

	penaltyCellsSize = penaltyCells.length;
	pointsInCircleSize = pointsInCircle;
}

function clearProductionBoard() {
	const canvas = document.getElementById('Canvas');
	const context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
}

function pointInPolygon(point) {

	//console.log("pointInPolygon start", hull[hull.length-1], hull[0],point);
	let ccw = pointsCCW(hull[hull.length - 1], hull[0], point);
	//console.log("pointInPolygon", ccw);
	if (ccw <= 0)
		return false;

	for (var i = 0; i < hull.length - 1; i++) {
		let ccw = pointsCCW(hull[i], hull[i + 1], point);
		//console.log("pointInPolygon", ccw);
		if (ccw <= 0)
			return false;
	}
	return true;
}

function pointInCircle(point) {
	let radius = getCircleRadius();
	let center = getCircleCenter();
	return squarePointsDistance(point, center) < radius * radius;
}

let hull = [];
let selectedCellsSize = 0;
let penaltyCellsSize = undefined;
let pointsInCircleSize = undefined;
let highScoreSize = undefined;
let scoreSize = undefined;
let startTime = null;
let translation = engTrans;
let tutorialScreen = 3;
let tutorial_clear_all_pressed = false;
let tutorial5_submit_btn_pressed = false;
let timerLength = 30;
let display_timer = false;
let active_timer = true;
let draw_Recs_In_Production = true;
let eventNamePrefix = "Tutorial";
let testMatrixLog = 99;
let poligonSize = 99;
let poligonVector = 99;
let id = "";
let mobile_mode = false;
let manual_id = "";
let manual_id_mode = false;
let file_id_part = "";
let tutorial_mode = false;
let game_mode = false;

const generateUUID = () => {
	if (typeof crypto === 'object') {
		if (typeof crypto.randomUUID === 'function') {
			// https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
			return crypto.randomUUID();
		}
		if (typeof crypto.getRandomValues === 'function' && typeof Uint8Array === 'function') {
			// https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
			const callback = (c) => {
				const num = Number(c);
				return (num ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (num / 4)))).toString(16);
			};
			return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, callback);
		}
	}
	let timestamp = new Date().getTime();
	let perforNow = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0;
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		let random = Math.random() * 16;
		if (timestamp > 0) {
			random = (timestamp + random) % 16 | 0;
			timestamp = Math.floor(timestamp / 16);
		} else {
			random = (perforNow + random) % 16 | 0;
			perforNow = Math.floor(perforNow / 16);
		}
		return (c === 'x' ? random : (random & 0x3) | 0x8).toString(16);
	});
};

let filenameIsoDate = (new Date()).toISOString().split("T")[0];

function updateTimer() {
	const date = new Date();
	let distance = date - startTime;

	if (distance > timerLength * 60 * 1000) {

		document.getElementById('intro').style.display = 'initial';
		document.getElementById('all_game_elements').style.display = 'none';
		document.getElementById('introStart').style.display = 'none';
		document.getElementById('score_area').style.visibility = 'hidden';
		document.getElementById('design_area').style.visibility = 'hidden';
		document.getElementById('production_area').style.visibility = 'hidden';
		document.getElementById('messages').innerText = "";
		document.getElementById('smallHeader').innerText = translation.test_end;

		document.getElementById('design_button_submit').style.visibility = 'hidden';
		document.getElementById('design_button_clearall').style.visibility = 'hidden';
		clearInterval(updateTimer);
	} else if (display_timer) {

		let minutes = distance / (1000 * 60);
		let seconds = (distance % (1000 * 60)) / 1000;
		//console.log(minutes,seconds);

		let timerStr = translation.timer_desc + " ";
		timerStr += ((timerLength - 1) - Math.floor(minutes)).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false }) +
			":" + (59 - Math.floor(seconds)).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
		document.getElementById("counter").innerHTML = timerStr;

	}
}

giveBoardCellsEventHandlers();


function init() {

	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);

	const lang = urlParams.get('lang');
	if (lang != null && lang == 'heb') {
		document.dir = "rtl";
		translation = hebTrans;
	}

	id = urlParams.get('id');
	if (id == null) {
		id = generateUUID();
	}
	file_id_part = id;

	let timerDisplay = urlParams.get('display_timer');
	if (timerDisplay != null) {
		if (timerDisplay == "on") {
			display_timer = true;
		}
	}

	let timerStr = urlParams.get('timer');
	if (timerStr != null) {
		if (timerStr == 'off') {
			active_timer = false;
		} else {
			timerLength = timerStr * 1; // convert to int
		}
	}

	let drawRecsInProduction = urlParams.get('recsInProd');
	if (drawRecsInProduction != null) {
		if (drawRecsInProduction == 'off') {
			draw_Recs_In_Production = false;
		}
	}

	const startScreen = urlParams.get('start');

	if (startScreen != null && startScreen == 'game') {
		game_mode = true;
	}

	const mobileMode = urlParams.get('mobile');
	if (mobileMode != null && mobileMode == 'on') {
		mobile_mode = true;
	}

	const manualIdMode = urlParams.get('manualId');
	if (manualIdMode != null && manualIdMode == 'on') {
		manual_id_mode = true;
	}

	const tutorialMode = urlParams.get('tutorial');
	if (tutorialMode != null && tutorialMode == 'on') {
		tutorial_mode = true;
	}
	loadScreen();

	console.log("id", id);
}

function initIntro() {

	document.getElementById('intro').style.display = 'flex';

	document.getElementById("tutorial_controls").style.display = 'none';

	document.getElementById('largeHeader').innerText = translation.intro_large_header;
	document.getElementById('largeHeader2ndRow').innerText = translation.intro_large_header_2;
	document.getElementById('messages').innerText = "";
	document.getElementById('all_game_elements').style.display = 'none';
	document.getElementById('introStart').innerText = translation.start_button;

	if (manual_id_mode) {
		document.getElementById('smallHeader').innerText = translation.intro_small_header;
		document.getElementById('manual_id_text').style.visibility = 'visible';
	}
}

function startBtnPressed() {
	if (mobile_mode || game_mode) {
		tutorialScreen = 14;
	} else {
		tutorialScreen = 4;
	}

	loadScreen();
}

function initTutorial() {

	if (manual_id_mode) {
		manual_id = document.getElementById('manual_id_text').value;
		if (manual_id == "") {
			alert(translation.intro_small_header);
			return;
		}

		file_id_part = manual_id + "_" + id;
	}

	tutorialScreen = 4;
	//let game_elements_container = document.getElementById('all_game_elements');
	//game_elements_container.style.visibility = 'hidden';
	document.getElementById('intro').style.display = 'none';

	document.getElementById('all_game_elements').style.display = 'flex';

	let design_area = document.getElementById('design_area');
	design_area.style.visibility = 'visible';
	document.getElementById('production_area').style.visibility = 'hidden';

	document.getElementById("tutorial_controls").style.display = 'initial';
	//document.getElementById('tutorial_back').style.visibility = 'hidden';
	document.getElementById('tutorial_back').innerText = translation.tutorial_back_button;
	document.getElementById('tutorial_next').innerText = translation.tutorial_next_button;

	document.getElementById('messages').innerText = translation.tutorial_1_desc;
	document.getElementById('tutorial_back').style.visibility = 'visible';

	document.getElementById('design_title').innerText = translation.game_design_title;
	document.getElementById('design_button_submit').innerText = translation.design_button_submit;
	document.getElementById('design_button_clearall').innerText = translation.design_button_clearall;

	document.getElementById('design_button_submit').style.visibility = 'hidden';
	clearBoard();
}

function initTutorial2_coloring() {
	/*
		let design_area = document.getElementById('design_area');
		design_area.style.visibility = 'visible';
	
		document.getElementById('design_title').innerText = translation.game_design_title;
		document.getElementById('design_button_submit').innerText = translation.design_button_submit;
		document.getElementById('design_button_clearall').innerText = translation.design_button_clearall;
		document.getElementById('messages').innerText = translation.tutorial_2_desc;
	
		document.getElementById('tutorial_back').style.visibility = 'visible';
	
	
		*/
}

function initTutorial2_coloring_check() {

	let selected_cells = document.querySelectorAll(".board-selected");
	let passCheck = (selected_cells.length > 4);

	if (!passCheck) {
		alert(translation.tutorial_2_check_fail);
	}

	return passCheck;
}
/*
function initTutorial3_coloring() {

	document.getElementById('messages').innerText = translation.tutorial_3_desc;
	clearBoard();

	// color row 4 - cyan
	let design_table = document.getElementById('design_table');

	for (var i = 1; i < design_table.rows[4].cells.length - 1; i++) {
		design_table.rows[4].cells[i].setAttribute('class', 'board-tutorial-blue');
	}
}

function initTutorial3_coloring_check() {
	let selected_cells = document.querySelectorAll(".board-selected");
	let blue_cells = document.querySelectorAll(".board-tutorial-blue");

	return blue_cells.length == 0 && selected_cells.length > 9;
}
*/
function initTutorial4_coloring() {
	document.getElementById('messages').innerText = translation.tutorial_4_desc;
	document.getElementById('production_area').style.visibility = 'hidden';

	let submitBtn = document.getElementById('design_button_submit');
	submitBtn.style.visibility = 'hidden';

	clearBoard();
	tutorial_clear_all_pressed = false;

	let design_table = document.getElementById('design_table');
	let curRowCells = design_table.rows[2].cells;
	for (var i = 4; i < 7; i++) {
		curRowCells[i].setAttribute('class', 'board-selected');
	}

	curRowCells = design_table.rows[3].cells;
	for (var i = 4; i < 7; i++) {
		curRowCells[i].setAttribute('class', 'board-selected');
	}

	curRowCells = design_table.rows[4].cells;
	for (var i = 4; i < 7; i++) {
		curRowCells[i].setAttribute('class', 'board-selected');
	}

	curRowCells = design_table.rows[5].cells;
	for (var i = 1; i < curRowCells.length - 1; i++) {
		curRowCells[i].setAttribute('class', 'board-selected');
	}

	curRowCells = design_table.rows[6].cells;
	for (var i = 1; i < curRowCells.length - 1; i++) {
		curRowCells[i].setAttribute('class', 'board-selected');
	}

	curRowCells = design_table.rows[7].cells;
	for (var i = 1; i < curRowCells.length - 1; i++) {
		curRowCells[i].setAttribute('class', 'board-selected');
	}

	curRowCells = design_table.rows[8].cells;
	for (var i = 2; i < 5; i++) {
		curRowCells[i].setAttribute('class', 'board-selected');
	}
	for (var i = 7; i < 10; i++) {
		curRowCells[i].setAttribute('class', 'board-selected');
	}

	curRowCells = design_table.rows[9].cells;
	curRowCells[3].setAttribute('class', 'board-selected');
	curRowCells[8].setAttribute('class', 'board-selected');
}

function initTutorial4_coloring_check() {
	return tutorial_clear_all_pressed;
}

function clear_call_button_press() {
	tutorial_clear_all_pressed = true;
	clearBoard();

	logEvent("system", "clear");
}

function initTutorial5_createPoligon() {
	tutorial5_submit_btn_pressed = false;
	document.getElementById('messages').innerText = translation.tutorial_5_desc;
	document.getElementById('tutorial_back').style.visibility = 'visible';

	clearBoard();

	let design_table = document.getElementById('design_table');
	let rowCells = design_table.rows[2].cells;
	for (var i = 2; i < rowCells.length - 2; i++) {
		rowCells[i].setAttribute('class', 'board-selected');
	}

	for (var i = 3; i < 10; i++) {
		rowCells = design_table.rows[i].cells;
		rowCells[7].setAttribute('class', 'board-selected');
	}

	document.getElementById('design_button_clearall').style.visibility = 'hidden';

	let submitBtn = document.getElementById('design_button_submit');
	submitBtn.style.visibility = 'visible';
	submitBtn.onclick = initTutorial5_submit;

	document.getElementById('production_area').style.visibility = 'visible';
	document.getElementById('production_title').innerText = translation.production_title;
	clearProductionBoard();
	removeBoardCellsEventHandlers();

}

function initTutorial5_submit() {
	if (checkConnectivity()) {
		tutorial5_submit_btn_pressed = true;
		clearProductionBoard();
		findConvexHull();
		drawMarkedCells();
		drawHull();

		let error_messages = document.getElementById('error_messages');
		error_messages.innerText = '';
		logEvent("system", "check");
	} else {
		console.log('cells are not adjecent');
		alert(translation.no_connectivity);
		//let error_messages = document.getElementById('error_messages');
		//error_messages.innerText = translation.no_connectivity;
		logEvent("system", "error");
	}

}

function initTutorial5_createPoligon_check() {
	if (!tutorial5_submit_btn_pressed) {
		alert(translation.press_submit);
	}
	return tutorial5_submit_btn_pressed;
}

function initTutorial6_fixPoligon1() {
	tutorial5_submit_btn_pressed = false;
	document.getElementById('messages').innerText = translation.tutorial_6_desc;
	document.getElementById('design_button_clearall').style.visibility = 'hidden';

	clearBoard();

	let design_table = document.getElementById('design_table');
	let rowCells = design_table.rows[2].cells;
	for (var i = 2; i < rowCells.length - 2; i++) {
		rowCells[i].setAttribute('class', 'board-selected');
	}

	for (var i = 3; i < 10; i++) {
		if (i != 6) {
			rowCells = design_table.rows[i].cells;
			rowCells[6].setAttribute('class', 'board-selected');
		}
	}

	clearProductionBoard();
}

function initTutorial6_createPoligon_check() {
	if (checkConnectivity()) {

		return true;
	} else {
		console.log('cells are not adjecent');
		alert(translation.no_connectivity);
		//let error_messages = document.getElementById('error_messages');
		//error_messages.innerText = translation.no_connectivity;
		logEvent("system", "error");
		return false;
	}
}

function initTutorial7_fixPoligon2() {
	tutorial5_submit_btn_pressed = false;
	document.getElementById('messages').innerText = translation.tutorial_7_desc;
	clearBoard();

	let design_table = document.getElementById('design_table');
	let rowCells = design_table.rows[2].cells;
	for (var i = 2; i < rowCells.length - 2; i++) {
		rowCells[i].setAttribute('class', 'board-selected');
	}

	for (var i = 3; i < 6; i++) {
		rowCells = design_table.rows[i].cells;
		rowCells[6].setAttribute('class', 'board-selected');
	}

	for (var i = 6; i < 10; i++) {
		rowCells = design_table.rows[i].cells;
		rowCells[7].setAttribute('class', 'board-selected');
	}
	clearProductionBoard();
}

function initTutorial8_fixPoligon3() {
	tutorialScreen++;
	loadScreen();
	/*
	tutorial5_submit_btn_pressed = false;
	document.getElementById('messages').innerText = translation.tutorial_8_desc;
	clearBoard();

	let design_table = document.getElementById('design_table');
	let rowCells = design_table.rows[3].cells;
	for (var i = 2; i < rowCells.length - 1; i++) {
		if (i != 7) {
			rowCells[i].setAttribute('class', 'board-selected');
		}
	}

	for (var i = 4; i < 11; i++) {
		rowCells = design_table.rows[i].cells;
		rowCells[7].setAttribute('class', 'board-selected');
	}

	clearProductionBoard();*/
}

function initTutorial9_fixPoligon4() {

	tutorial5_submit_btn_pressed = false;
	document.getElementById('messages').innerText = translation.tutorial_9_desc;
	clearBoard();

	let design_table = document.getElementById('design_table');
	let rowCells = design_table.rows[2].cells;
	for (var i = 2; i < rowCells.length - 2; i++) {
		rowCells[i].setAttribute('class', 'board-selected');

	}

	for (var i = 3; i < 6; i++) {
		rowCells = design_table.rows[i].cells;
		rowCells[6].setAttribute('class', 'board-selected');
	}
	for (var i = 6; i < 10; i++) {
		rowCells = design_table.rows[i].cells;
		rowCells[i].setAttribute('class', 'board-selected');
	}

	let submitBtn = document.getElementById('design_button_submit');
	submitBtn.onclick = initTutorial5_submit;

	document.getElementById('production_area').style.visibility = 'hidden';

	document.getElementById('design_button_submit').style.visibility = 'hidden';
	clearProductionBoard();
	giveBoardCellsEventHandlers();
}

function initTutorial10_circle() {

	tutorial5_submit_btn_pressed = false;
	document.getElementById('messages').innerText = translation.tutorial_10_desc;

	let submitBtn = document.getElementById('design_button_submit');
	submitBtn.onclick = initTutorial10_submit;
	document.getElementById('design_button_submit').style.visibility = 'visible';
	document.getElementById('score_area').style.visibility = 'hidden';

	clearProductionBoard();
	drawCircle();
	showPenaltyCells = false;
}

let showPenaltyCells = false;
function initTutorial10_2_circle() {

	//tutorial5_submit_btn_pressed = false;
	document.getElementById('messages').innerText = translation.tutorial_10_2_desc;
	//showPenaltyCells = true;

	document.getElementById('design_button_submit').style.visibility = 'hidden';
	findPenaltyCells();

	if (tutorial_mode) {
		document.getElementById('tutorial_next').style.visibility = 'visible';
	}
}

function initTutorial10_submit() {
	if (checkConnectivity()) {
		tutorial5_submit_btn_pressed = true;

		clearProductionBoard();

		findConvexHull();

		drawMarkedCells();
		if (showPenaltyCells) {
			findPenaltyCells();
		}

		drawCircle();
		drawHull();
		let error_messages = document.getElementById('error_messages');
		error_messages.innerText = '';
		logEvent("system", "check");
	} else {
		console.log('cells are not adjecent');
		alert(translation.no_connectivity);
		//let error_messages = document.getElementById('error_messages');
		//error_messages.innerText = translation.no_connectivity;
		logEvent("system", "error");
	}
}

function initTutorial11_scoreBoard() {

	//tutorial5_submit_btn_pressed = false;
	document.getElementById('messages').innerText = translation.tutorial_11_desc;

	document.getElementById('score_area').style.visibility = 'visible';
	document.getElementById('score_title').innerText = translation.score_title;

	document.getElementById('scoreboard_grey_cells').innerText = translation.scoreboard_grey_cells;
	document.getElementById('scoreboard_penalty_cells').innerText = translation.scoreboard_penalty_cells;
	document.getElementById('scoreboard_effiency').innerText = translation.scoreboard_effiency;
	document.getElementById('scoreboard_high_score').innerText = translation.scoreboard_high_score;

	document.getElementById('table_high_score').style.visibility = 'hidden';
	/*clearScoreBoard();
	clearProductionBoard();
	drawCircle();
*/
	updateScore();
	let submitBtn = document.getElementById('design_button_submit');
	submitBtn.onclick = checkBoard;

	if (tutorial_mode) {
		document.getElementById('tutorial_next').style.visibility = 'hidden';
	}
}

function initTutorial12_scoreBoard() {
	tutorialScreen++;
	loadScreen();
	/*
	document.getElementById('messages').innerText = translation.tutorial_11_2_desc;

	document.getElementById('table_high_score').style.visibility = 'visible';*/
}

function endTutorial() {

	document.getElementById('intro').style.display = 'flex';

	document.getElementById("tutorial_controls").style.display = 'none';

	document.getElementById('largeHeader').innerText = "";
	document.getElementById("largeHeader2ndRow").innerText = "";
	document.getElementById('messages').innerText = "";
	document.getElementById('all_game_elements').style.display = 'none';


	let msg = translation.tutorial_12_desc + "\n\n";
	if (active_timer) {
		msg += translation.tutorial_12_1_desc.replace('{0}', timerLength) + "\n";
	}

	document.getElementById('smallHeader').innerText = msg;

	document.getElementById('messages').innerText = "";
	document.getElementById("gameImg").style.display = 'none';
	document.getElementById('manual_id_text').style.display = 'none';

	document.getElementById("introStart").onclick = initGame;
}

function initGame() {

	document.getElementById('intro').style.display = 'none';
	document.getElementById('tutorial_controls').style.display = 'initial';
	document.getElementById('all_game_elements').style.display = 'flex';
	giveBoardCellsEventHandlers();
	clearProductionBoard();
	drawCircle();
	clearBoard();

	startTime = new Date();
	if (active_timer) {
		setInterval(updateTimer, 1000);
	}

	let game_elements_container = document.getElementById('all_game_elements');
	game_elements_container.style.visibility = 'visible';

	document.getElementById('tutorial_back').style.visibility = 'hidden';
	document.getElementById('tutorial_next').style.visibility = 'hidden';
	document.getElementById('design_button_submit').style.visibility = 'visible';
	document.getElementById('table_high_score').style.visibility = 'visible';
	let msg = "";/*
	if (active_timer) {
		msg += translation.tutorial_12_1_desc.replace('{0}', timerLength) + "\n";
	}*/
	msg += translation.game_desc;
	document.getElementById('messages').innerText = msg;

	document.getElementById('production_title').innerText = translation.production_title;
	document.getElementById('score_title').innerText = translation.score_title;
	document.getElementById('design_title').innerText = translation.game_design_title;

	document.getElementById('scoreboard_grey_cells').innerText = translation.scoreboard_grey_cells;
	document.getElementById('scoreboard_penalty_cells').innerText = translation.scoreboard_penalty_cells;
	document.getElementById('scoreboard_effiency').innerText = translation.scoreboard_effiency;
	document.getElementById('scoreboard_high_score').innerText = translation.scoreboard_high_score;
	clearScoreBoard();
	document.getElementById('design_button_submit').innerText = translation.design_button_submit;
	document.getElementById('design_button_clearall').innerText = translation.design_button_clearall;

	document.getElementById('score_area').style.visibility = 'visible';
	document.getElementById('design_area').style.visibility = 'visible';
	document.getElementById('production_area').style.visibility = 'visible';

	let submitBtn = document.getElementById('design_button_submit');
	submitBtn.style.visibility = 'visible';
	submitBtn.onclick = checkBoard;

	document.getElementById('design_button_clearall').style.visibility = 'visible';
	if (mobile_mode) {
		switchToDesignMode();
		document.getElementById('score_area').style.display = 'none';
	}
	document.getElementById("view_design_area").style.visibility = mobile_mode ? 'visible' : 'hidden';
	eventNamePrefix = "Test";
}

function switchToDesignMode() {
	document.getElementById('design_area').style.display = 'flex';
	document.getElementById('design_area').style.visibility = 'visible';
	document.getElementById('production_area').style.display = 'none';
}

function switchToProductionMode() {

	document.getElementById('design_area').style.display = 'none';
	document.getElementById('production_area').style.display = 'flex'
	document.getElementById('production_area').style.visibility = 'visible';
}

function clearScoreBoard() {
	document.getElementById('markedCells').innerText = '';
	document.getElementById('penaltyCells').innerText = '';
	document.getElementById('score').innerText = '';
	document.getElementById('highScore').innerText = '';

	highScoreSize = undefined;
	scoreSize = undefined;
	penaltyCellsSize = undefined;
}

function onTutorialBack() {
	tutorialScreen--;
	loadScreen();
}

function onTutorialNext() {

	let passCheck = true;
	switch (tutorialScreen) {

		case 4:
			passCheck = initTutorial2_coloring_check();
			break;
		case 5:
		case 6:
		case 7:
			passCheck = initTutorial6_createPoligon_check();
			break;
		case 8:
		case 9:
			passCheck = initTutorial5_createPoligon_check();
			break;
		case 10:
		case 11:

		case 12:
		case 13:
			passCheck = true;
			break;
	}

	if (passCheck == false) return;

	tutorialScreen++;
	loadScreen();
}

function loadScreen() {
	console.log('goto screen', tutorialScreen)
	switch (tutorialScreen) {
		case 3:
			initIntro();
			break;
		case 4:
			initTutorial();
			break;

		case 5:
			initTutorial6_fixPoligon1();
			break;
		case 6:
			initTutorial7_fixPoligon2();
			break;
		case 7:
			initTutorial9_fixPoligon4();
			break;
		case 8:
			initTutorial5_createPoligon();
			break;
		case 9:
			initTutorial10_circle();
			break;
		case 10:
			initTutorial10_2_circle();
			break;
		case 11:
			initTutorial11_scoreBoard();
			break;
		case 12:
			initTutorial12_scoreBoard();
			break;
		case 13:
			endTutorial();
			break;
		case 14:
			initGame();
			break;
	}
}

function logEvent(typeEvent, name) {

	let penaltyCells = 99;
	if (penaltyCellsSize != undefined) {
		penaltyCells = penaltyCellsSize;
	}

	let blackSquares = document.querySelectorAll(".board-selected").length;

	let score = 99;
	if (scoreSize != undefined) {
		score = scoreSize;
	}

	let highscore = 99;
	if (highScoreSize != undefined) {
		highscore = highScoreSize;
	}

	let designVector = 'D:';
	let designTable = document.getElementById('design_table');
	for (let i = 1; i < designTable.rows.length - 1; i++) {
		let currRow = designTable.rows[i];
		for (let j = 1; j < currRow.cells.length - 1; j++) {
			let currCell = currRow.cells[j];
			//console.log(currCell.className);
			if (currCell.className == 'board') {
				designVector += '0';
			} else {
				designVector += '1';
			}
			//console.log(designVector);
		}
	}
	sendDataToServer(typeEvent, name, blackSquares, penaltyCells,
		score, highscore, designVector,
		poligonSize, poligonVector);
}

async function sendDataToServer(type, name, blackSquares, penaltyCells, score, highscore, designVector, poligonSize, poligonVector) {

	var seconds = Math.floor(new Date() / 1000);

	let urlStr = "https://technion.link/logs/log.php?" +
		"user_id=" + file_id_part + "_" + filenameIsoDate +
		"&bucket_id=poligon-model" +
		"&column0=time" +
		"&time=" + seconds +
		"&column1=type" +
		"&type=" + type +
		"&column2=event" +
		"&event=" + eventNamePrefix + "-" + name +
		"&column3=design" +
		"&design=" + designVector +
		"&column4=polygon" +
		"&polygon=" + poligonVector +
		"&column5=testMatrix" +
		"&testMatrix=" + testMatrixLog +
		"&column6=blackSquares" +
		"&blackSquares=" + blackSquares +
		"&column7=errorSquares" +
		"&errorSquares=" + penaltyCells +
		"&column8=polySides" +
		"&polySides=" + poligonSize +
		"&column9=score" +
		"&score=" + score +
		"&column10=bestScore" +
		"&bestScore=" + highscore +
		"&column11=ID_prolific" +
		"&ID_prolific=" + id +
		"&column12=ID_manual" +
		"&ID_manual=" + manual_id;
	;

	let response = await fetch(urlStr, { mode: "no-cors" });
	//let data = await response.text();
	console.log("send log", urlStr);
	//return data;
}


init();