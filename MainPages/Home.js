import wixWindow from 'wix-window';
// For full API documentation, including code examples, visit http://wix.to/94BuAAs
let x1, y1, d1, dy1
let x2, y2, d2

let invType = -1

const invHigh = 40
const invHighSpace = 20
const invWidth = 40
const invWidthSpace = 40

const invSpeed = 10
const invNumRaw = 6
const invNumCol = 8
const invNumTotal = invNumCol * invNumRaw;
const invSpeedInt = [invNumTotal, invNumTotal / 2, invNumTotal / 4, invNumTotal / 8, invNumTotal / 16, invNumTotal / 32, invNumTotal / 64, 0]

let invLeft

const timeInterval = 150;

const shipHigh = 30
const shipWidth = 60

const svgHigh = 563
const svgWidth = 980

let invArr

let shootArr
let shootStartY

let bombArr
let bombIntervalCount
const bombSpeed = 2
const bombInterval = 40
const bombHigh = 10

const shootSpeed = -30

const point = 10;

const shootMaxNum = 3;

$w.onReady(function () {});

function initVar() {
	x1 = 0
	y1 = 60
	d1 = +invSpeed
	dy1 = +15
	x2 = 0
	y2 = 500
	d2 = 20
	shootArr = []
	invArr = []
	shootStartY = y2

	for (let iR = 0; iR < invNumRaw; iR++) {
		let tmpArr = []
		for (let iC = 0; iC < invNumCol; iC++) {
			tmpArr.push(true)
		}
		invArr.push(tmpArr)
	}

	calDimention()

	$w("#Score").text = "0"
	invLeft = invNumTotal

	bombArr = [];

	bombIntervalCount = bombInterval / 2
}

function svgInvendors(iX, iY) {
	return (invType < 0) ?
		`<path d="m${iX},${iY}l0,0l4,0l0,20l4,0l0,-10l5,0l0,-5l14,0l0,5l5,0l0,10l4,0l0,-20l4,0l0,30l-10,0l10,10l-4,0l-10,-10l-12,0l-10,10l-4,0l10,-10l-10,0l0,-30" fill="#FFFFFF"/>` :
		`<path d="m${iX},${iY + 20}l5,-20l4,0l-5,20l4,0l0,-10l5,0l0,-5l14,0l0,5l5,0l0,10l4,0l-5,-20l4,0l5,20l0,10l-10,0l5,5l-5,5l-4,0l5,-5l-5,-5l-12,0l-5,5l5,5l-4,0l-5,-5l5,-5l-10,0l0,-10" fill="#FFFFFF"/>`
}

function picInv(iStartX, iStartY) {
	let svgFile = ``
	for (let iR = 0; iR < invNumRaw; iR++) {
		for (let iC = 0; iC < invNumCol; iC++) {
			if (invArr[iR][iC]) {
				svgFile += svgInvendors(iC * (invWidth + invWidthSpace) + iStartX, iR * (invHigh + invHighSpace) + iStartY)
			}
		}
	}
	return svgFile
}

function picShip(iStartX, iStartY) {
	return `<path d="m${iStartX},${iStartY}l5,-5l20,0l5,-5l5,5l20,0l5,5l0,10l-60,0l0,-10" fill="#FFFFFF"/>`
}

function picShoot(iStartX, iStartY) {
	return `<rect fill="#0000FF" height="10" width="3" x="${iStartX}" y="${iStartY}"/>`
}

function picBomb(iStartX, iStartY) {
	return `<rect fill="#FF0000" height="${bombHigh}" width="3" x="${iStartX}" y="${iStartY}"/>`
}

let dimMinX = 0
let dimMaxX = 0
let dimMaxY = 0

function calDimention() {
	let tmpMaxR = 0
	let tmpMaxC = 1
	let tmpMinC = invNumCol

	for (let iR = 0; iR < invNumRaw; iR++) {
		for (let iC = 0; iC < invNumCol; iC++) {
			if (invArr[iR][iC]) {
				if (iC > tmpMaxC) { tmpMaxC = iC }
				if (iC < tmpMinC) { tmpMinC = iC }
				if (iR > tmpMaxR) { tmpMaxR = iR }
			}
		}
	}

	dimMaxX = (invWidth + invWidthSpace) * tmpMaxC + invWidth
	dimMinX = (invWidth + invWidthSpace) * tmpMinC
	dimMaxY = tmpMaxR * (invHigh + invHighSpace) + invHigh
}

function recorsive() {
	invType *= -1
	x1 += d1;

	if (dimMaxX + x1 > svgWidth || dimMinX + x1 < 0) {
		d1 = d1 * -1
		if (d1 > 0) { x1 = (-1) * dimMinX } else { x1 = svgWidth - dimMaxX }
		y1 += dy1
		if (y1 + dimMaxY > y2) {
			$w('#MessageText1').text = "You Lost it"
			$w("#MessageBox").show("FadeIn")
			return
		}
	}

	let svgFile = `<svg width="${svgWidth}" height="${svgHigh}"> <g class="layer">`

	let tmpStr = picInv(x1, y1)
	if (tmpStr === ``) {
		$w('#MessageText1').text = "You Won !!!"
		$w("#MessageBox").show("FadeIn")
		return
	}

	svgFile += tmpStr

	let invMinX = x1
	let invMaxX = x1 + invNumCol * (invWidth + invWidthSpace)
	let invMinY = y1
	let invMaxY = y1 + invNumRaw * (invHigh + invHighSpace)
	svgFile += picShip(x2, y2)
	shootArr.forEach((item) => {
		item.y += shootSpeed
		if (item.x >= invMinX && item.x <= invMaxX && item.y >= invMinY && item.y <= invMaxY) {
			let tmpCol = Math.floor((item.x - invMinX) / (invWidth + invWidthSpace))
			let tmpColMod = (item.x - invMinX) % (invWidth + invWidthSpace)
			let tmpRaw = Math.floor((item.y - invMinY) / (invHigh + invHighSpace))
			let tmpRawMod = (item.y - invMinY) % (invHigh + invHighSpace)

			if (tmpRaw < invNumRaw && tmpCol < invNumCol) {
				if (invArr[tmpRaw][tmpCol]) {
					if (tmpRawMod <= invHigh && tmpColMod <= invWidth) {
						invArr[tmpRaw][tmpCol] = false
						shootArr.shift()
						calDimention()
						$w("#Score").text = (parseInt($w("#Score").text, 10) + point) + ""
						invLeft--
						d1 = (d1 / Math.abs(d1)) * invSpeed * invSpeedInt.findIndex((inv) => { return inv < invLeft })
					}
				}
			}
		}

		svgFile += picShoot(item.x, item.y)
		if (item.y <= 0) { shootArr.shift() }
	})

	bombIntervalCount--
	if (bombIntervalCount <= 0) {
		bombIntervalCount = bombInterval
		bombArr.push({ x: (Math.floor(Math.random() * (dimMaxX + dimMinX)) + x1 - dimMinX), y: y1 + dimMaxY })
		console.log(bombArr[bombArr.length - 1])
	}

	bombArr.forEach((item) => {
		item.y += bombSpeed
		if (item.y + bombHigh >= y2 && item.x >= x2 && item.x <= x2 + shipWidth) {
			$w('#MessageText1').text = "You Lost it"
			$w("#MessageBox").show("FadeIn")
			return
		}
		if (item.y + bombHigh >= y2 + shipHigh) {
			bombArr.shift()
		}
		svgFile += picBomb(item.x, item.y)
	})

	svgFile += `</g> </svg>`
	$w('#vectorImage1').src = svgFile;
	$w("#input1").focus()

	setTimeout(function () { recorsive() }, timeInterval);
}

export function input1_keyPress(event) {
	if (event.key === "ArrowLeft") { if (x2 > 0) { x2 -= d2 } } else
	if (event.key === "ArrowRight") { if (x2 + shipWidth < svgWidth) { x2 += d2 } } else
	if (event.key === "ArrowUp") {
		if (shootArr.length < shootMaxNum) {
			shootArr.push({ x: Math.floor(x2 + shipWidth / 2), y: shootStartY })
		}
	}
}

export function button1_click(event) {
	$w("#MessageBox").hide("FadeOut")
	initVar()
	recorsive()
}
