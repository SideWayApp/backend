const app = require('../server')
const request = require('supertest')
const mongoose = require('mongoose')
const { response } = require('../server')
const User = require('../Models/User')

const email = 'test@a.com'
const pwd = '123456'

beforeAll(async ()=>{
    await User.deleteMany({'email' : email})
    })

afterAll((done) => {
    mongoose.connection.close();
    done();
  });


describe('Testing Auth API',()=>{

    test('test registration',async ()=>{
        const response = await request(app).post('/authentication/register').send({
            'email' : email,
            'password':pwd
        })
        expect(response.statusCode).toEqual(200)
    })

    test('test login',async ()=>{
        const response = await request(app).post('/authentication/login').send({
            'email' : email,
            'password':pwd
        })
        expect(response.statusCode).toEqual(200)
    })
   
})