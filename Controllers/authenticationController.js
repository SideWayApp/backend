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

    try{
        const exists = await User.findOne({'email': email})
        if (exists != null){
            return res.status(400).send({
                'status':'fail',
                'error':'not implemented'
            })
        }
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password,salt)

        const user = User ({
            'email' : email,
            'password' : hashPassword
        })
        const newUser = await user.save()
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

    if(email == null || password == null)return sendError(res,400,'wrong email or password')
    
    try{
        const user = await User.findOne({'email': email})
        if(user == null) sendError(res,400,'wrong email or password')

        const match = bcrypt.compare(password,user.password)
        if(!match) sendError(res,400,'wrong email or password')

        const accessToken = jwt.sign(
            {'id':user._id},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn:process.env.JWT_EXPIRATION}
        )

        res.status(200).send({'access':accessToken})
    }catch(err){

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

