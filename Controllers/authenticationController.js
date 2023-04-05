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
        res.status(200).send(newUser)

    }catch(err){
        res.status(400).send({
            'status':'fail',
            'error':err.message
        })
    }
};

const login = async (req,res) => {
    const email = req.body.email
    const password = req.body.password

    if(email == null || password == null) return sendError(res,400,'wrong email or password')
    
    try{
        const user = await User.findOne({'email': email})
        if(user == null) return sendError(res,400,'wrong email ')

        const match = await bcrypt.compare(password, user.password)
        
        console.log("pass is: " + password)
        console.log("user pass is: " + user.password)
        if(!match) return sendError(res,400,'wrong password')

        const accessToken = jwt.sign(
            {'id':user._id},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn:process.env.JWT_EXPIRATION}
        )

        res.status(200).send({'access':accessToken})
    }catch(err){
        return sendError(res,400,err.message)
    }
};

const logout = async (req,res) => {
    res.status(400).send({
     'status':'fail',
     'error':'not implemented'
    })
};

module.exports = {
    login,
    register,
    logout
}

