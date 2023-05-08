const Street = require("../models/Street")

const getStreetsStartingWith = async (letters) => {
	const regex = new RegExp(`${letters}`, "i")
	const cities = await Street.distinct("city", { name: regex }).exec()

	const streetNames = []
	let suggestionCount = 0

	for (const city of cities) {
		const streets = await Street.find({ city, name: regex })
			.limit(5 - suggestionCount)
			.select("name")
			.exec()
		const streetNamesInCity = streets.map((street) => `${street.name}, ${city}`)
		streetNames.push(...streetNamesInCity)
		suggestionCount += streetNamesInCity.length
		if (suggestionCount >= 5) break
	}

	return streetNames.slice(0, 5)
}

const getAllStreets = async (city) => {
	try {
		const results = await Street.find({ city: city })
		return results
	} catch (err) {
		console.error(err)
	}
}

const getSingleStreet = async (city, streetName) => {
	try {
		console.log(streetName, city)
		const result = await Street.findOne({ city: city, name: streetName })
		console.log(`Retrieved street "${streetName}":`, result)
		return result
	} catch (err) {
		console.error(err)
	}
}

const deleteStreet = async (city, streetName) => {
	try {
		const result = await Street.deleteOne({ city: city, name: streetName })
		console.log(`Deleted street "${streetName}":`, result)
		return result
	} catch (err) {
		console.error(err)
	}
}

const updateStreet = async (city, streetName, newStreetValue) => {
	try {
		const street = await Street.findOne({ city: city, name: streetName })
		if (!street) {
			throw new Error(`Street '${streetName}' not found`)
		}

		if (newStreetValue.scenery !== undefined) {
			street.scenery.push({ score: newStreetValue.scenery })
		}

		if (newStreetValue.accessible !== undefined) {
			street.accessible.push({ score: newStreetValue.accessible })
		}

		if (newStreetValue.safe !== undefined) {
			street.safe.push({ score: newStreetValue.safe })
		}

		if (newStreetValue.clean !== undefined) {
			street.clean.push({ score: newStreetValue.clean })
		}

		await street.save()

		return street
	} catch (err) {
		console.error(err)
	}
}

const createStreets = async (streets) => {
	const arr = []
	await Promise.all(
		streets.map(async (element) => {
			console.log(`Creating street "${element.name}":`, element)
			if (element.name != null && element.name != "") {
				const street = await createStreet(element)
				arr.push(street)
			}
		})
	)

	return arr
}

const createStreet = async (street) => {
	try {
		const ret = await new Street(street).save()
		console.log(ret)
		return ret
	} catch (err) {
		throw err
	}
}

// const getFieldScoreForStreets = async (streetNames, field) => {
// 	try {
// 		const streets = await Street.find({
// 			name: { $regex: new RegExp(streetNames.join("|"), "i") },
// 		})
// 		findUniqueStreets(streetNames, streets)
// 		if (field === "total") {
// 			let totalScore = 0
// 			for (const street of streets) {
// 				totalScore += street[field]
// 			}
// 			return totalScore
// 		} else {
// 			const totalScore = streets.reduce((sum, street) => {
// 				if (Array.isArray(street[field])) {
// 					const fieldSum = street[field].reduce(
// 						(scoreSum, scoreObj) => scoreSum + scoreObj.score,
// 						0
// 					)
// 					return sum + fieldSum
// 				} else {
// 					return sum
// 				}
// 			}, 0)
// 			return totalScore
// 		}
// 	} catch (err) {
// 		console.error(err)
// 	}
// }

//updated:

const getFieldScoreForStreets = async (streetNames, preferences) => {
	try {
		const streets = await Street.find({
			name: { $regex: new RegExp(streetNames.join("|"), "i") },
		})
		findUniqueStreets(streetNames, streets)
		let totalScore = 0
		for (const street of streets) {
			let streetScore = 0
			for (const preference in preferences) {
				if (preferences[preference]) {
					if (Array.isArray(street[preference])) {
						streetScore += street[preference].reduce(
							(sum, scoreObj) => sum + scoreObj.score,
							0
						)
					} else {
						streetScore += street[preference] || 0
					}
				}
			}
			totalScore += streetScore
		}
		return totalScore
	} catch (err) {
		console.error(err)
	}
}

const findUniqueStreets = async (streetNames, streets) => {
	const matchedStreets = []
	for (const street of streets) {
		matchedStreets.push(street.name)
	}
	const uniqueNames = [
		...streetNames.filter((name) => !matchedStreets.includes(name)),
	]
	console.log("unmached streets", uniqueNames)
}

async function removeDuplicates() {
	const pipeline = [
		{
			$group: {
				_id: { name: "$name", city: "$city" },
				count: { $sum: 1 },
				ids: { $push: "$_id" },
			},
		},
		{
			$match: {
				count: { $gt: 1 },
			},
		},
	]

	const duplicates = await Street.aggregate(pipeline).exec()

	for (const duplicate of duplicates) {
		const idsToRemove = duplicate.ids.slice(1)
		await Street.deleteMany({ _id: { $in: idsToRemove } })
	}

	console.log(`Removed ${duplicates.length} duplicates.`)
	return duplicates
}

const removeTotalScoreForStreets = async (streetNames) => {
	try {
		const streets = await Street.find({})

		for (const street of streets) {
			if (street.total != undefined) {
				street.total = undefined
				console.log("street", street)
				await street.save()
			}
		}
	} catch (err) {
		console.error(err)
	}
}

const updateVirtualScore = async () => {
	try {
		await Street.updateMany(
			{},
			{
				$set: {
					clean: [],
					safe: [],
					scenery: [],
					accessible: [],
				},
			},
			{ strict: false }
		)
		console.log("Old street schema objects updated successfully")
	} catch (err) {
		console.log("Error updating old street schema objects: ", err)
	}
}

const getAmountByCity = async (city) => {
	try {
		console.log("Getting amount", city)
		const street = await Street.find({ city: city })
		return street.length
	} catch (err) {
		console.log(err)
	}
}

const deleteStreetsByName = async (name) => {
	try {
		const result = await Street.deleteMany({
			city: "Rishon Le-Zion",
			name: name,
		})
		console.log(`${result.deletedCount} streets deleted.`)
	} catch (err) {
		console.log(err)
	}
}

module.exports = {
	getStreetsStartingWith,
	getAllStreets,
	getSingleStreet,
	deleteStreet,
	updateStreet,
	createStreets,
	createStreet,
	getFieldScoreForStreets,
	removeDuplicates,
	removeTotalScoreForStreets,
	updateVirtualScore,
	getAmountByCity,
	deleteStreetsByName,
}
