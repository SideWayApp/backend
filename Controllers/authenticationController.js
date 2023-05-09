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
            {'id':user._id},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn:process.env.JWT_EXPIRATION}
        )

        const refreshToken = await jwt.sign(
            {'id':user._id},
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
    const email = req.body.email
    const password = req.body.password
    if(email == null || password == null) return sendError(res,400,'wrong email or password')
    
    try{
        const user = await User.findOne({'email': email})
        if(user == null) return sendError(res,400,'wrong email ')

        console.log(user._id)

        const match = await bcrypt.compare(password, user.password)
        if(!match) return sendError(res,400,'wrong password')

        const accessToken = jwt.sign(
            {'id':user._id},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn:process.env.JWT_EXPIRATION}
        )

        const refreshToken = await jwt.sign(
            {'id':user._id},
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

const refreshToken = async  (req,res,next) =>{
    authHeaders = req.headers['authorization']
    const token = authHeaders && authHeaders.split(' ')[1]
    if (token == null) return res.sendStatus('401')

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, userInfo)=>{
        if(err) return res.status(403).send(err.message)
        const userId = userInfo._id
        try{
            const user = await User.findById(userId)
            if(user == null) return res.status(403).send('invalid fucking request')
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
    authHeaders = req.headers['authorization']
    const token = authHeaders && authHeaders.split(' ')[1]
    if (token == null) return res.sendStatus('401')

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, userInfo)=>{
        if(err) return res.status(403).send(err.message)
        const userId = userInfo._id
        console.log(userId)
        try{
            user = await User.findById(userId)
            if(user == null) return res.status(403).send('invalid request')

            res.status(200).send(user)
        }catch(err){
            res.status(403).send(err.message)
        }  
    })
}

const editUserPreferences = async (req, res) => {
    authHeaders = req.headers['authorization']
    const token = authHeaders && authHeaders.split(' ')[1]
    console.log(token)
    if (token == null) return res.sendStatus('401')

    const accessibility = req.body.preferences.accessibility
    const clean = req.body.preferences.clean
    const scenery = req.body.preferences.scenery
    const security = req.body.preferences.security
    const speed = req.body.preferences.speed

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, userInfo)=>{
        if(err) return res.status(403).send(err.message)
        const userId = userInfo._id
        try{
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
    })
};


const deleteUser = async(req,res)=>{
    authHeaders = req.headers['authorization']
    const token = authHeaders && authHeaders.split(' ')[1]
    console.log(token)
    if (token == null) return res.sendStatus('401')

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, userInfo)=>{
        if(err) return res.status(403).send(err.message)
        const userId = userInfo._id
        try{
            user = await User.findByIdAndDelete(userId)
            if(user == null) return res.status(403).send('invalid request')

            res.status(200).send("user deleted")
        }catch(err){
            res.status(403).send(err.message)
        }  
    })
}

const addFavorite = async(req,res)=>{
    authHeaders = req.headers['authorization']
    const token = authHeaders && authHeaders.split(' ')[1]
    console.log(token)
    if (token == null) return res.sendStatus('401')

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, userInfo)=>{
        if(err) return res.status(403).send(err.message)
        const userId = userInfo._id
        try{
            user = await User.findById(userId)
            if(user == null) return res.status(403).send('invalid request')

            user.favorites[user.favorites.length] = req.body.favorite
            await user.save()
            res.status(200).send("favorite added")
        }catch(err){
            res.status(403).send(err.message)
        }  
    })
}

const addRecent = async (req,res)=>{
    authHeaders = req.headers['authorization']
    const token = authHeaders && authHeaders.split(' ')[1]
    if (token == null) return res.sendStatus('401')

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, userInfo)=>{
        if(err) return res.status(403).send(err.message)
        const userId = userInfo._id
        try{
            user = await User.findById(userId)
            if(user == null) return res.status(403).send('invalid request')

            const newArr = [] 
            newArr[0] = req.body.recent
            user.recents =newArr.concat(user.recents)
            await user.save()

            res.status(200).send("recent location added")
        }catch(err){
            res.status(403).send(err.message)
        }  
    })
}

//
const deleteFavorite = async (req,res)=>{
    authHeaders = req.headers['authorization']
    const token = authHeaders && authHeaders.split(' ')[1]
    if (token == null) return res.sendStatus('401')

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, userInfo)=>{
        if(err) return res.status(403).send(err.message)
        const userId = userInfo._id
        try{
            user = await User.updateOne({_id:userId},{$pull:{favorites:req.body.favorite}})
            if(user == null) return res.status(403).send('invalid request')

            res.status(200).send("favorite location deleted")
        }catch(err){
            res.status(403).send(err.message)
        }  
    })
}

const deleteRecent = async (req,res)=>{
    authHeaders = req.headers['authorization']
    const token = authHeaders && authHeaders.split(' ')[1]
    if (token == null) return res.sendStatus('401')

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, userInfo)=>{
        if(err) return res.status(403).send(err.message)
        const userId = userInfo._id
        try{
            user = await User.updateOne({_id:userId},{$pull:{recents:req.body.recent}})
            if(user == null) return res.status(403).send('invalid request')

            res.status(200).send("recent location deleted")
        }catch(err){
            res.status(403).send(err.message)
        }  
    })
}

module.exports = {
    login,
    register,
    logout,
    refreshToken,
    getUser,
    editUserPreferences,
    deleteUser,
    addFavorite,
    addRecent,
    deleteFavorite,
    deleteRecent
}

 