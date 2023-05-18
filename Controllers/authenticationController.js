const User = require("../Models/User")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const sendError = (res,code,message)=>{
    return res.status(code).send({
        'status':'fail',
        'error':message
    })
}

const register = async (req,res) => {
    const email = req.body.email
    const password = req.body.password
    const accessibility = req.body.preferences.accessibility
    const clean = req.body.preferences.clean
    const scenery = req.body.preferences.scenery
    const security = req.body.preferences.security
    const speed = req.body.preferences.speed
    const age = req.body.signUpData.age
    const gender = req.body.signUpData.gender
    const name = req.body.signUpData.name

    try{
        const exists = await User.findOne({'email': email})
        if (exists != null){
            return res.status(400).send({
                'status':'fail',
                'error':'this email address is already in use'
            })
        }
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password,salt)

        const user = User ({
            'email' : email,
            'password' : hashPassword,
            'preferences' : {
                'accessibility' : accessibility,
                'clean' : clean,
                'scenery' : scenery,
                'security' : security,
                'speed' : speed,
            }, 
            'signUpData':{
                'name': name,
                'gender' : gender,
                'age' : age,
            }
        })

        newUser = await user.save()
        
        //create access & refresh tokens
        const accessToken = jwt.sign(
            {'_id':user._id},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn:process.env.JWT_EXPIRATION}
        )

        const refreshToken = await jwt.sign(
            {'_id':user._id},
            process.env.REFRESH_TOKEN_SECRET
        )

        console.log("ACCESS token:", accessToken)
        console.log("REFRESH token:", refreshToken)

        user.tokens = [refreshToken]
        await user.save()

        res.status(200).send({
            'accessToken' : accessToken,
            'refreshToken' : refreshToken
        })

    }catch(err){
        res.status(400).send({
            'status':'fail',
            'error':err.message
        })
    }
};

const login = async (req,res,next) => {
    console.log('login')
    console.log(req.body)
    const email = req.body.email
    const password = req.body.password
    console.log("Email = " + email + " , Password = " + password)
    if(email == null || password == null) return sendError(res,400,'wrong email or password')
    
    try{
        const user = await User.findOne({'email': email})
        if(user == null) return sendError(res,400,'wrong email ')

        console.log(user._id)

        const match = await bcrypt.compare(password, user.password)
        if(!match) return sendError(res,400,'wrong password')

        const accessToken = jwt.sign(
            {'_id':user._id},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn:process.env.JWT_EXPIRATION}
        )

        const refreshToken = await jwt.sign(
            {'_id':user._id},
            process.env.REFRESH_TOKEN_SECRET
        )

        if(user.tokens == null) {
            user.tokens = [refreshToken]
        }
        else{
            user.tokens.push(refreshToken)
        }
        await user.save()

        res.status(200).send({
            'accessToken' : accessToken,
            'refreshToken' : refreshToken
        })
    }catch(err){
        return sendError(res,400,err.message)
    }
};

const logout = async (req,res,next) => {
    authHeaders = req.headers['authorization']
    const token = authHeaders && authHeaders.split(' ')[1]
    if (token == null) return res.sendStatus('401')

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, userInfo)=>{
        if(err) return res.status(403).send(err.message)
        const userId = userInfo._id
        try{
            user = await User.findById(userId)
            if(user == null) return res.status(403).send('invalid request')
            if(!user.tokens.includes(token)){
                user.tokens = []
                await user.save()
                return res.status(403).send('invalid request')
            }

            user.tokens.splice(user.tokens.indexOf(token),1)
            await user.save()
            res.status(200).send()
        }catch(err){
            res.status(403).send(err.message)
        }  
    })     
};

const refreshToken = async  (req,res,next) =>{//authorization based on refreshToken
    authHeaders = req.headers['authorization']
    const token = authHeaders && authHeaders.split(' ')[1]
    if (token == null) return res.sendStatus('401')

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, userInfo)=>{
        if(err) return res.status(403).send(err.message)
        const userId = userInfo._id
        try{
            const user = await User.findById(userId)
            if(user == null) return res.status(403).send('invalid request')
            if(!user.tokens.includes(token)){
                user.tokens = []
                await user.save()
                return res.status(403).send('invalid request')
            }

            const accessToken = await jwt.sign(
                {'_id' : user._id},
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: process.env.JWT_EXPIRATION}
            )
            const refreshToken = await jwt.sign(
                {'_id' : user._id},
                process.env.REFRESH_TOKEN_SECRET
            )

            user.tokens[user.tokens.indexOf(token)] = refreshToken
            await user.save()
            res.status(200).send({'accessToken' : accessToken,'refreshToken' : refreshToken})
        }catch(err){
            res.status(403).send(err.message)
        }
    })
}

const getUser = async (req, res)=>{
    const userId = await getUserId(req);
    try{
        if(userId == null){
           res.status(403).send({'fail':'problem in getUserId'}) 
        }
        user = await User.findById(userId)
        if(user == null) return res.status(403).send('invalid request')

        const data = {
            'email' : user.email,
            'preferences' : {
                'accessibility' : user.preferences.accessibility,
                'clean' : user.preferences.clean,
                'scenery' : user.preferences.scenery,
                'security' : user.preferences.security,
                'speed' : user.preferences.speed,
            }, 
            'signUpData':{
                'name': user.signUpData.name,
                'gender' : user.signUpData.gender,
                'age' : user.signUpData.age,
            },
            'favorites': user.favorites,
            'recents':user.recents,
        }

        res.status(200).send(data)
    }catch(err){
        res.status(403).send(err.message)
    }              
}

const editUserPreferences = async (req, res) => {
    const userId = await getUserId(req);

    const accessibility = req.body.preferences.accessibility
    const clean = req.body.preferences.clean
    const scenery = req.body.preferences.scenery
    const security = req.body.preferences.security
    const speed = req.body.preferences.speed
    try{
        if(userId == null){
            res.status(403).send({'fail':'problem in getUserId'}) 
        }
        user = await User.findByIdAndUpdate(userId,
            {'preferences' : {
                'accessibility' : accessibility,
                'clean' : clean,
                'scenery' : scenery,
                'security' : security,
                'speed' : speed,
                }
            }, 
        )
        if(user == null) return res.status(403).send('invalid request')

        await user.save()
        res.status(200).send("preferences changed")
    }catch(err){
        res.status(403).send(err.message)
    }     
};

const editUserDetails = async (req,res)=>{
    const userId = await getUserId(req);

    const name = req.body.signUpData.name
    const gender = req.body.signUpData.gender
    const age = req.body.signUpData.age

    try{
        if(userId == null){
            res.status(403).send({'fail':'problem in getUserId'}) 
        }
        user = await User.findByIdAndUpdate(userId,
            {'signUpData' : {
                'name' : name,
                'gender' : gender,
                'age' : age,
                }
            }, 
        )
        if(user == null) return res.status(403).send('invalid request')

        await user.save()
        res.status(200).send("user details changed")
    }catch(err){
        res.status(403).send(err.message)
    } 
}

const getUserId = async (req,res)=>{
    authHeaders = req.headers['authorization']
    const token = authHeaders && authHeaders.split(' ')[1]
    if (token == null) return res.sendStatus('401')

    var userId;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, userInfo)=>{
        if(err) return res.status(403).send(err.message)
        userId = userInfo._id
    })
    return userId;
}

const deleteUser = async(req,res)=>{
    const userId = await getUserId(req);
    try{
        if(userId == null){
            res.status(403).send({'fail':'problem in getUserId'}) 
        }
        user = await User.findByIdAndDelete(userId)
        if(user == null) return res.status(403).send('invalid request')

        res.status(200).send("user deleted")
    }catch(err){
        res.status(403).send(err.message)
    }      
}

const addFavorite = async(req,res)=>{
    const userId = await getUserId(req);
    try{
        if(userId == null){
            res.status(403).send({'fail':'problem in getUserId'}) 
        }
        user = await User.findById(userId)
        if(user == null) return res.status(403).send('invalid request')

        user.favorites[user.favorites.length] = req.body.favorite
        await user.save()
        res.status(200).send("favorite added")
    }catch(err){
        res.status(403).send(err.message)
    }  
}

const addRecent = async (req,res)=>{
    const userId = await getUserId(req);
    try{
        if(userId == null){
            res.status(403).send({'fail':'problem in getUserId'}) 
        }
        user = await User.findById(userId)
        if(user == null) return res.status(403).send('invalid request')

        const newArr = [] 
        newArr[0] = req.body.recent
        user.recents =newArr.concat(user.recents)

        if(user.recents.length > 5){
            user.recents.length = 5
        }
        await user.save()

        res.status(200).send("recent location added")
    }catch(err){
        res.status(403).send(err.message)
    } 
}

const deleteFavorite = async (req,res)=>{
    const userId = await getUserId(req);
    try{
        if(userId == null){
            res.status(403).send({'fail':'problem in getUserId'}) 
        }
        user = await User.updateOne({_id:userId},{$pull:{favorites:req.body.favorite}})
        if(user == null) return res.status(403).send('invalid request')

        res.status(200).send("favorite location deleted")
    }catch(err){
        res.status(403).send(err.message)
    }  
}

const deleteRecent = async (req,res)=>{
    const userId = await getUserId(req);
    try{
        if(userId == null){
            res.status(403).send({'fail':'problem in getUserId'}) 
        }
        user = await User.updateOne({_id:userId},{$pull:{recents:req.body.recent}})
        if(user == null) return res.status(403).send('invalid request')

        res.status(200).send("recent location deleted")
    }catch(err){
        res.status(403).send(err.message)
    }
}

module.exports = {
    login,
    register,
    logout,
    refreshToken,
    getUser,
    editUserPreferences,
    editUserDetails,
    deleteUser,
    addFavorite,
    addRecent,
    deleteFavorite,
    deleteRecent
}

 