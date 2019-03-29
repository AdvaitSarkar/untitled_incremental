let incomeTaxRate = 0
let researchFunding = 0
let educationFunding = 0

let stats = {
    "population": 10,
    "educated": 0,
    "productivity": 1,
    "nationalProductivity": 0,
    "governmentIncome": 0,
    "researchPoints": 0,
    "qualityOfLife": 0
}

let levers = {
    "incomeTaxRate": 0.5,
    "researchFunding": 0.5,
    "educationFunding": 0.5
}

// create stats divs
forEachPropertyIn(stats, function(id) {
    const element = document.createElement("div")
    element.id = id
    //element.onmouseover = function(){tooltip(id)}
    //element.onmouseout = function(){tooltip(null)}
    element.innerHTML = id + ": " + niceNumber(stats[id])
    byId("stats").appendChild(element)
    //refreshResource(id)
})

forEachPropertyIn(levers, function(id) {
    const slider = document.createElement("input")
    const label = document.createElement("label")
    label.setAttribute("for", id)

    slider.type = "range"
    slider.min = 0
    slider.max = 1
    slider.step = 0.1
    slider.value = levers[id]
    slider.className = "form-control-range"
    slider.id = id
    slider.oninput = function(){
        label.innerHTML = id + ": " + slider.value    
    }

    label.innerHTML = id + ": " + slider.value

    byId("levers").appendChild(label)
    byId("levers").appendChild(slider)
    //refreshResource(id)
})

function step(timestamp) {
    if(timestamp-previousTickTime < 1000) window.requestAnimationFrame(step)
    else {
        let elapsedTicks = Math.floor((timestamp-previousTickTime)/1000)
        previousTickTime = timestamp
        
        // run simulation for elapsedTicks steps
        for(i=0; i<elapsedTicks; i++)
        {
            const educatedProportion = (stats.population===0)? 0 : stats.educated/stats.population
            incomeTaxRate = byId("incomeTaxRate").value
            researchFunding = byId("researchFunding").value
            educationFunding = byId("educationFunding").value

            stats.population += (stats.qualityOfLife/100) * stats.population
            stats.educated = Math.min(stats.population, stats.educated+((educationFunding/100)*stats.population))
            stats.productivity = stats.qualityOfLife
            stats.researchPoints += researchFunding * stats.governmentIncome * Math.max(0.1, educatedProportion)
            stats.qualityOfLife = 1 - incomeTaxRate + educatedProportion
            stats.nationalProductivity = stats.population * stats.productivity
            stats.governmentIncome = incomeTaxRate * stats.nationalProductivity
        }

        // update stats divs
        forEachPropertyIn(stats, function(id) {
            byId(id).innerHTML = id + ": " + niceNumber(stats[id])
        })

        window.requestAnimationFrame(step)
    }
}

let previousTickTime = window.performance.now()
window.requestAnimationFrame(step)

/***** ***** ***** ***** ***** UTILITIES ***** ***** ***** ***** *****/
function byId(id) {return document.getElementById(id)}

function forEachPropertyIn(object, f) {
	for(let field in object) {
		if (!object.hasOwnProperty(field)) {continue} 
		else {f(field)}
	}
}

// returns rawNumber rounded to decimalPlaces decimal places
function decimalPlaces(rawNumber, decimalPlaces) {
	const powerOfTen = Math.pow(10, decimalPlaces)
	return Math.floor(rawNumber*powerOfTen)/powerOfTen
}

function niceNumber(rawNumber) {
	const K = 1000, M = K*K, B = M*K, trillion = B*K
	if (rawNumber <= K) return decimalPlaces(rawNumber, 2)
	else if (rawNumber <= M) return decimalPlaces(rawNumber/K, 2)+"k" 
	else if (rawNumber <= B) return decimalPlaces(rawNumber/M, 2)+"m" 
	else if (rawNumber <= trillion) return decimalPlaces(rawNumber/B, 2)+"b" 
	else return decimalPlaces(rawNumber/trillion, 2)+"t" 
}