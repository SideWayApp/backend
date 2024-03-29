
const MapItem = require("../Models/MapItem");
const Street = require("../Models/Street");
const { getAddressFromCoordinates } = require("./directionsContorller");

//this function using lat & long to add new item map and to add score to the appropriate street
const addMapItemLatLong = async (req,res)=>{

  const longitude = req.body.longitude
  const latitude = req.body.latitude
  const type = req.body.type

  const resFromLatLong = await getAddressFromCoordinates(latitude,longitude);
  console.log(resFromLatLong)
  const tempStreetName = resFromLatLong.split(', ')[0]
  var cityName = resFromLatLong.split(', ')[1]

  streetName = tempStreetName.replace(/[0-9]/g, '').concat("St");
  
  switch(cityName){
    case "Rishon LeZion":
      cityName = "Rishon Le-Zion"
      break;
    case "Tel Aviv-Yafo": 
      cityName = "Tel-Aviv"
      break;
  }

  try{
	const fromLongitude = longitude.toFixed(3) 
	const fromLatitude = latitude.toFixed(3) 
	const maxRange = 999

	const toLongitude = fromLongitude + maxRange
	const toLatitude = fromLatitude + maxRange

	const mapItem = await MapItem.findOne({'type':type,
											'longitude':{$gt:fromLongitude,$lt :toLongitude},
											'latitude':{$gt:fromLatitude,$lt :toLatitude}
										})
											
    if(mapItem != null){
		res.status(200).send("mapItem already exist in this cords:\n" + mapItem) 
	}
	else{
		const mapItem = MapItem({
			'type':type,
			'hebrew':'hebrew',
			'formattedStreetName':streetName,
			'city':cityName,
			'longitude':longitude,
			'latitude':latitude,
			'creator':req.body.creator,
			'exists':req.body.exists 
		  });
		  newItem = await mapItem.save()
	  
		  res.status(200).send(newItem)
		  addStreetScore(streetName,cityName,req.body.type,newItem._id);
	} 
  }catch(err){
    res.status(400).send({
      'status':'fail',
      'error':err.message
    })
	console.log(err.message)
  }
}

const addStreetScore = async(streetName,cityName,type,id)=>{
  try{
    const street = await Street.findOne({
      name: streetName,
      city: cityName,
    })

	const fieldsAndScore = getFieldAndScoreByType(type)
	const fields = fieldsAndScore.fields
	const score = { foreignKey: id, score:fieldsAndScore.score}

    fields.forEach(field => {
      street[field].push(score);
    })
    await street.save()

  }catch(err) {
		throw err
	}
}

const getFieldAndScoreByType = (type)=>{
	var score = 0;
	const fields = []
	switch(type){
		case "Blocked":
		  score = -10;
		  fields[0] = "accessible"
		  break;
		case "Danger":
		  score = -5; 
		  fields[0] = "safe"
		  break;
		case "Flood":
		  score = -4;
		  fields[0] = "accessible"
		  fields[1] = "safe"
		  break;
		case "Protest":
		  score = -3; 
		  fields[0] = "accessible"
		  fields[1] = "speed"
		  break;
		case "Poop":
		  score = -3;
		  fields[0] = "clean"
		  break;
		case "No lights":
		  score = -4;
		  fields[0] = "safe"
		  break;
		case "Dirty":
		  score = -3;
		  fields[0] = "clean"
		  break;
		case "No shadow":
		  score = -2;
		  fields[0] = "scenery"
		  break; 
		case "Constraction":
		  score = -5;
		  fields[0] = "scenery"
		  break;
		default:
			break; 
		}
	
	return {fields,score}
}

//delete mapItem & streetScore from DB
const updateExistMapItem = async (req,res)=>{
	const mapItemId = req.body._id
	const userEmail = req.body.userEmail
	try{
		mapItem = await MapItem.findById({_id:mapItemId});	
		if(mapItem == null) return res.status(403).send('invalid request')

		if(!mapItem.whoChanged){
			mapItem.whoChanged[0] = userEmail
		}
		else if(!mapItem.whoChanged.includes(userEmail)){
			if(mapItem.exists == -2){
				deleteStreetScore(mapItem.formattedStreetName, mapItem.city, mapItemId ,mapItem.type )
				mapItem = await MapItem.findByIdAndDelete({_id:mapItemId});
				res.status(200).send("mapItem deleted")
			}else{
				mapItem.exists--
				mapItem.whoChanged.push(userEmail)
				await mapItem.save()
				res.status(200).send("mapItem updated")
			}
		} 
    }catch(err){
        res.status(403).send(err.message)
    }  
}

const deleteStreetScore = async (streetName, cityName ,id , type)=>{
	try{
		const fields = getFieldAndScoreByType(type).fields

		const street = await Street.findOne({
			name: streetName,
			city: cityName,
		})

		fields.forEach(field => {
			const arr = street[field]
			console.log(arr)
			arrayRemove(arr,id)
		  })
		await street.save()

	}catch(err){
		console.log(err.message);
	}
}

function arrayRemove(arr, id) { 
	const index = arr.findIndex(item => item.foreignKey.toString() === id);
	if(index!=-1)arr.splice(index,1);
}

// Function to add a new map item
const addMapItem = async (
	type,
	hebrew,
	formattedStreetName,
	city,
	longitude,
	latitude,
	creator,
	exists
) => {
	try {
		const newItem = new MapItem({
			type,
			hebrew,
			formattedStreetName,
			city,
			longitude,
			latitude,
			creator,
			exists,
		})
		const result = await newItem.save()
		return result
	} catch (err) {
		throw err
	}
}

async function countStreetNamesByType(mapItems) {
	const result = {}

	for (const mapItem of mapItems) {
		if (!result[mapItem.formattedStreetName]) {
			result[mapItem.formattedStreetName] = {}
		}
		if (!result[mapItem.formattedStreetName][mapItem.type]) {
			result[mapItem.formattedStreetName][mapItem.type] = 1
		} else {
			result[mapItem.formattedStreetName][mapItem.type]++
		}
	}

	return result
}

const getMapItemsPerStreet = async () => {
	try {
		const mapItems = await MapItem.find({})
		// Count the street names by type
		const result = await countStreetNamesByType(mapItems)
		return result
	} catch (error) {
		console.log(error)
	}
}

// Function to update a map item by its id
const updateMapItem = async (id, updates) => {
	try {
		const result = await MapItem.findByIdAndUpdate(id, updates, { new: true })
		return result
	} catch (err) {
		throw err
	}
}

const tempUpdateMapItems = async (req,res) => {
	try {
		const result = await MapItem.updateMany({}, { exists: 0 })
		res.status(200).send("mapItems updated ")
	} catch (err) {
		res.status(403).send(err.message);
		throw err // Rethrow the error if necessary
	}
}

// Function to delete a map item by its id
const deleteMapItem = async (id) => {
	try {
		const result = await MapItem.findByIdAndDelete(id)
		return result
	} catch (error) {
		throw error
	}
}

// Function to delete a map item by street name
const deleteMapItemByStreetName = async (streetName) => {
	try {
		const result = await MapItem.findOneAndDelete({ streetName })
		return result
	} catch (error) {
		throw error
	}
}

// Function to get a map item by its type
const getMapItemsByType = async (type) => {
	try {
		const result = await MapItem.find({ type: type })
		return result.map((item) => ({ x: item.x, y: item.y }))
	} catch (error) {
		throw error
	}
}

const getAllNoneAddressedMapItem = async (type) => {
	try {
		let arr = []
		const result = await MapItem.find({ type: type })
		for (let i = 0; i < 2; i++) {
			const address = await getAddressFromLatLngMapItem(result[i].y, result[i].x)
			let isAddressInArr = false
			for (let j = 0; j < arr.length; j++) {
				if (arr[j].address === address) {
					isAddressInArr = true
					break
				}
			}
			if (!isAddressInArr) {
				arr.push({ address: address })
			}
		}
		return arr
	} catch (error) {
		throw error
	}
}

// Function to get all map items
const getAllMapItemsByCity = async (city) => {
	try {
		const items = await MapItem.find({ city: city }).limit(1000)
		return items
	} catch (error) {
		throw error
	}
}

const getTypesFromPrefrences = async (preferences) => {
	const allTypes = {
		Beaches: "Beaches",
		Camera: "Camera",
		DangerousBuildings: "Dangerous Buildings",
		Defibrillator: "Defibrillator",
		Fountain: "Fountain",
		LightPost: "Light Post",
		MADAStation: "MADA Station",
		Museum: "Museum",
		PollutedArea: "Polluted Area",
		PublicShelter: "Public Shelter",
		PublicWIFIHotspots: "Public WIFI Hotspots",
		Blocked:"Blocked",
		Danger:"Danger",
		Flood:"Flood",
		Protest:"Protest",
		Poop: "Poop",
		No_lights:"No lights",
		Dirty:"Dirty",
		No_shadow:"No shadow",
		Constraction:"Constraction"
	}
	const selectedTypes = new Set()
	selectedTypes.add(allTypes.Blocked)
				.add(allTypes.Flood)
				.add(allTypes.Protest)
				.add(allTypes.Poop)
				.add(allTypes.Dirty)
				.add(allTypes.No_shadow)
				.add(allTypes.Constraction)
				.add(allTypes.Danger)
				.add(allTypes.No_lights)

	for (let key in preferences) {
		if (preferences[key]) {
			switch (key) {
				case "accessibility":
					selectedTypes
						.add(allTypes.Defibrillator)
						.add(allTypes.DangerousBuildings)
						.add(allTypes.Camera)
					break
				case "clean":
					selectedTypes
						.add(allTypes.Fountain)
						.add(allTypes.Museum)
						.add(allTypes.Beaches)
						.add(allTypes.Camera)
					break
				case "scenery":
					selectedTypes
						.add(allTypes.Beaches)
						.add(allTypes.Museum)
						.add(allTypes.Fountain)
						.add(allTypes.Camera)
					break
				case "security":
					selectedTypes
						.add(allTypes.PublicShelter)
						.add(allTypes.MADAStation)
						.add(allTypes.Camera)
					break
				case "speed":
					selectedTypes
						.add(allTypes.Camera)
						.add(allTypes.LightPost)
					break
				default:
					console.log("Unknown preference.")
					break
			}
		}
	}
	return selectedTypes
}

const getMapItemsByRegion = async (region, preferences) => {
	const { latitude, longitude, latitudeDelta, longitudeDelta } = region
	const minLatitude = latitude - latitudeDelta / 2
	const maxLatitude = latitude + latitudeDelta / 2
	const minLongitude = longitude - longitudeDelta / 2
	const maxLongitude = longitude + longitudeDelta / 2

	const types = await getTypesFromPrefrences(preferences)

	const items = await MapItem.find({
		latitude: { $gte: minLatitude, $lte: maxLatitude },
		longitude: { $gte: minLongitude, $lte: maxLongitude },
		type: { $in: Array.from(types) },
	})

	return items
}

const getAllTypes = async () => {
	const types = await MapItem.distinct("type")
	return types
}

const countTypes = async () => {
	const count = await MapItem.aggregate([
		{ $group: { _id: "$type", count: { $sum: 1 } } },
	])
	return count
}

const getDuplicateCoordinates = async (type) => {
	const items = await MapItem.find({ type: type })

	const coordinatesMap = new Map()

	const duplicates = []

	for (const item of items) {
		const { longitude, latitude } = item

		if (coordinatesMap.has(`${longitude},${latitude}`)) {
			duplicates.push(item)
		} else {
			coordinatesMap.set(`${longitude},${latitude}`, true)
		}
	}

	// Return the array of duplicates
	return duplicates
}

const groupItemsWithinRadius = async (type) => {
	const items = await MapItem.aggregate([
		{
			$match: {
				type: type, // match only items of the specified type
			},
		},
		{
			$group: {
				_id: {
					type: type,
					longitude: { $trunc: [{ $toDouble: "$longtitude" }, 4] },
					latitude: { $trunc: [{ $toDouble: "$latitude" }, 4] },
				},
				items: { $push: "$$ROOT" },
			},
		},
	])

	const ret = items
		.filter((item) => item.items.length > 1)
		.sort((a, b) => b.items.length - a.items.length)
	return ret
}

const groupItemsByStreet = async (type) => {
	try {
		const items = await MapItem.aggregate([
			{
				$match: {
					type: type, // match only items of the specified type
				},
			},
			{
				$group: {
					_id: "$formattedStreetName", // group by the hebrew field
					items: { $push: "$$ROOT" }, // add all matching documents to an array
				},
			},
		])
		const ret = items
			.filter((item) => item.items.length > 1)
			.sort((a, b) => b.items.length - a.items.length)
		return ret
	} catch (err) {
		console.log(err)
	}
}

const deleteDuplicateItems = async (type) => {
	const items = await groupItemsByStreet(type)
	console.log(items.length)
	items.forEach((item) => {
		for (let i = 1; i < item.items.length; i++) {
			const doc = item.items[i]
		}
	})

	return []
}
// case "clean":
// 					scoreProp = "clean"
// 					break
// 				case "safe":
// 					scoreProp = "safe"
// 					break
// 				case "scenery":
// 					scoreProp = "scenery"
// 					break
// 				case "accessible":
// 					scoreProp = "accessible"

const type = {
	Flood: { field: "safe", score: -5 },

	Light_Post: { field: "safe", score: 1 },

	No_Light_Post: { field: "safe", score: -1 },

	Defibrillator: { field: "accessible", score: 3 },

	Shelter: { field: "safe", score: 5 },

	Public_Toilet: { field: "clean", score: 4 },

	Camera: { field: "safe", score: 3 },

	Dangerous_Building: { field: "accessible", score: -1 },

	Fountain: { field: "scenery", score: 4 },

	Public_Wi_Fi_Hotspot: { field: "accessible", score: 2 },

	Dogs_Park: { field: "scenery", score: 1 },

	Tree: { field: "scenery", score: 2 },

	Pharmacy: { field: "accessible", score: 2 },

	Police_Station: { field: "safe", score: 5 },

	MADA_Station: { field: "accessible", score: 4 },

	Kupat_Holim: { field: "accessible", score: 3 },

	Protest: { field: "accessible", score: -5 },

	Poop: { field: "clean", score: -3 },

	No_shadow: { field: "scenery", score: -3 },

	Trash: { field: "clean", score: -5 },

	Block: { field: "accessible", score: -5 },
}

const map = new Map()
for (const key in type) {
	map.set(key, type[key])
}

async function updateStreetScores() {
	try {
		const mapItems = await MapItem.find({})
		let count = 0
		for (const mapItem of mapItems) {
			const { type, formattedStreetName, _id, city } = mapItem
			const tempJSON = map.get(type)
			if (!_id || !tempJSON) {
				continue
			}
			const score = { foreignKey: _id, score: tempJSON.score }
			if (!score || typeof score.score !== "number") {
				continue
			}
			const street = await Street.findOne({
				name: formattedStreetName,
				city: city,
			})
			if (street) {
				count += 1
				street[tempJSON.field].push(score)

				await street.save()
			}
		}
		console.log("how many count " + count)
		console.log("how many mapItems " + mapItems.length)
		console.log("Successfully updated street scores.")
	} catch (err) {
		console.error(err)
	}
}

module.exports = {
  addMapItemLatLong,
  addMapItem,
  updateMapItem,
  deleteMapItem,
  getMapItemsByType,
  getAllMapItemsByCity,
  getMapItemsByRegion,
  getAllTypes,
  countTypes,
  getMapItemsPerStreet,
  getAllNoneAddressedMapItem,
  getDuplicateCoordinates,
  groupItemsWithinRadius,
  groupItemsByStreet,
  deleteDuplicateItems,
  tempUpdateMapItems,
  updateStreetScores,
  updateExistMapItem
};

