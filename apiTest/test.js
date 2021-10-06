var assert = require('assert');
const chai = require('chai');
const chaiJsonSchemaAjv = require('chai-json-schema-ajv')
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp)
chai.use(chaiJsonSchemaAjv)
const server = require('../server')
const request = require('supertest');

//I tried using these schemas for data verification, but they only caused errors..
//const userArraySchema = require('./testSchemas/userInfoArray.schema.json')
//const itemArraySchema = require('./testSchemas/itemInfoArray.schema.json')


//Some tests, one for get and put. Two for put. Delete is not there since put has errors too.
//Tests should pass only if correct

const serverAddress = 'http://localhost:2000'
describe('User API Tests', function () {

    //Automatically start and close the server
    before(function () {
        server.start();
    })

    after(function () {
        server.close();
    })

    describe('POST /register', function () {

        it('should register a new user when info is correctly put', function(done) {
            chai.request(serverAddress)
             .post('/register')
             .send({
                fName: "Mocha",
                lName: "Test",
                email: "mymail@mail",
                mobileNumber: 112233238,
                username: "user",
                password: "pass"
             })

             .end(function(err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(201);
                done();
             })
        })
    })

    describe('POST /item/add', function () {

        it('should add a new item using previously created login info', function(done) {
            chai.request(serverAddress)
             .post('/item/add')
             .auth('user','pass')    //error 401 if this is incorrect!
             .send({
                name: "Screwdriver",
                description: "Small screwdriver, okay quality. Bought 1 year ago.",
                price: "8",
                location: "Stockholm",
                category: "tools",
                delivery: "Pickup"
             })

             .end(function(err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(201);
                done();
             })
        })
    })

    describe('GET /all', function () {
        it('should return all items', function (done) {
            chai.request(serverAddress)
            .get('/all')
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            })

        })
    })

    describe('PUT /item/modify/:id', function () {

        it('should add a new item using previously created login info', function(done) {
            chai.request(serverAddress)

             .put('/item/modify/123')     //This fails because the address is incorrect. don't know how you're supposed to get that generated uuid from earlier
             .auth('user','pass')    //error 401 if this is incorrect!
             .send({
                name: "Paintbrush",
                description: "A dry paintbrush",
                price: "2",
                location: "Stockholm",
                category: "tools",
                delivery: "Any"
             })

             .end(function(err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                //expect(res.body).to.be.jsonSchema(userSchema);
                done();
             })
        })
    })
})