let stats = {
    "population": 10,
    "educated": 0,
    "productivity": 1,
	"nationalProductivity": 0,
	"peopleWealth": 0,
	"perCapitaWealth": 0,
    "governmentIncome": 0,
    "researchPoints": 0,
    "qualityOfLife": 0
}

let levers = {
    "incomeTaxRate": 0.5,
    "researchFunding": 0.20,
    "educationFunding": 0.20,
    "healthFunding": 0.20,
    "environmentFunding": 0.20,
    "militaryFunding": 0.20
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
    slider.step = 0.01
    slider.value = levers[id]
    slider.className = "form-control-range"
    slider.id = id
    slider.oninput = function(){sliderChanged(id, slider.value, label)}
    label.innerHTML = id + ": " + slider.value

    byId("levers").appendChild(label)
    byId("levers").appendChild(slider)
    //refreshResource(id)
})

function sliderChanged(id, value, label) {
    label.innerHTML = id + ": " + value
    if(id==="incomeTaxRate") {}
        //
    else {
        // normalise funding sliders
        const remainingValue = 1 - parseFloat(byId(id).value)
        //console.log("remaining: "+remainingValue)

        let ids = ["researchFunding", "educationFunding", "healthFunding", "environmentFunding", "militaryFunding"]
        let desiredFunds = 0
        for (let j=0; j<ids.length; j++) {
            if(ids[j]===id) continue
            desiredFunds += parseFloat(byId(ids[j]).value)
        }
        //console.log("desired: "+desiredFunds)


        const unitRemainingFunds = (desiredFunds===0) ? 0 : remainingValue / desiredFunds
        //console.log("unit: "+unitRemainingFunds)
        //console.log("---")


        let totalAllocatedFunds = 0
        for (let j=0; j<ids.length; j++) {
            const i = ids[j]
            totalAllocatedFunds += parseFloat(byId(i).value)
            if(i===id) continue
            else {
                byId(i).value = parseFloat(byId(i).value)*unitRemainingFunds //(remainingValue / (ids.length-1))// (remainingValue===0) ? 0 : parseFloat(byId(i).value) * (remainingValue / (ids.length-1))
                byId(i).previousSibling.innerHTML = i+ ": " + byId(i).value
            }
        }
        //console.log(totalAllocatedFunds)
    }
}

function step(timestamp) {
    if(timestamp-previousTickTime < 1000) window.requestAnimationFrame(step)
    else {
        let elapsedTicks = Math.floor((timestamp-previousTickTime)/1000)
        previousTickTime = timestamp
        
        // run simulation for elapsedTicks steps
        for(i=0; i<elapsedTicks; i++)
        {
            const educatedProportion = (stats.population===0)? 0 : stats.educated/stats.population
            let incomeTaxRate = parseFloat(byId("incomeTaxRate").value)
            let researchFunding = parseFloat(byId("researchFunding").value)
            let educationFunding = parseFloat(byId("educationFunding").value)

            stats.population += Math.min(stats.peopleWealth, (stats.qualityOfLife/100) * stats.population)
            stats.educated = Math.min(stats.population, stats.educated+((educationFunding/100)*stats.population))
            stats.productivity = stats.qualityOfLife
            stats.researchPoints += researchFunding * stats.governmentIncome * Math.max(0.1, educatedProportion)
            stats.qualityOfLife = 1 - incomeTaxRate + educatedProportion
			stats.nationalProductivity = stats.population * stats.productivity
			stats.governmentIncome = incomeTaxRate * stats.nationalProductivity
			stats.peopleWealth += stats.nationalProductivity - stats.governmentIncome - (0.1*stats.population) // 0.1 represents wealth demand per capita
			stats.perCapitaWealth = stats.peopleWealth / stats.population
			
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