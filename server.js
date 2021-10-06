const moment = require('moment')
const { uuid } = require('uuidv4')
//var uuid = uuidv4();
const express = require('express')
const bodyParser = require('body-parser')
const multer  = require('multer')
const passport = require('passport')
const bcrypt = require('bcryptjs')
const Ajv = require("ajv")
const ajv = new Ajv()
const BasicStrategy = require('passport-http').BasicStrategy;   //basic password authentication
const upload = multer({ dest: './upload/' })
const app = express()
const port = 2000

app.use(bodyParser.json())
//'use strict';

const itemInfoSchema = require('./schemas/itemInfo.schema.json')
const validateItem = ajv.compile(itemInfoSchema)

const userInfoSchema = require('./schemas/userInfo.schema.json')
const validateUser = ajv.compile(userInfoSchema)

//Array of users, need to register
const users = [
    {
        //register to add users
    }
];

//array of items
const item = [
    { 
        //register, then use /item/add
    }
]
 //Current date and time  // USES moment.js, requires 'npm i moment'
function DateTimeNow() {
    const currentDT = moment().format('LLL');
    return currentDT;
}

//BasicStrategy logging in with bcrypt
passport.use(new BasicStrategy(
    (username, password, done) => {
       const searchResult = users.find(user => {
           if(username === user.username) {
                if (bcrypt.compareSync(password, user.password)) {
                    return true;
                }
           }
        return false;
       })

       if (searchResult != undefined) {
         done(null, searchResult) //OK
       } else {
         done(null,false)  //not found/matching
       }
    }
));

//"Homepage"
app.get('/', (req, res) => {
    res.send('Welcome!')
})


//Lists all items in order (oldest first)
app.get('/all', (req, res) => {
    res.json(item)
})

//Searching for items with filters
//This will find item by ID
app.get('/search/id/:id', (req, res) => {
    const items = item.find(i => i.itemID === req.params.id);
    if(items === undefined) {
        res.sendStatus(404); //not found
    }
    else {
        res.json(items)
    }
})

app.get('/search/location/:location', (req, res) => {
    const items = item.find(i => i.location === req.params.location); //method lists one item ONLY
    if(items === undefined) {
        res.sendStatus(404); //not found
    }
    else {
        res.json(items)
    }
})

app.get('/search/category/:category', (req, res) => {
    const items = item.find(i => i.category === req.params.category);
    if(items === undefined) {
        res.sendStatus(404); //not found
    }
    else {
        res.json(items)
    }
})

//Add user
//Make sure that all but mobileNumber are strings. mobileNumber is a number
app.post('/register', (req, res) => {
    //register user -> put into users --- incl example user

   const valid = validateUser(req.body)
   console.log(valid)

   if (valid == true) {
        //Generating salted password
        const hashedPw = bcrypt.hashSync(req.body.password, 9)
        const newUser = {
            userID: uuid(),
            fName: req.body.fName, 
            lName: req.body.lName,  
            email: req.body.email, 
            mobileNumber: req.body.mobileNumber,
            username: req.body.username,
            password: hashedPw, 
            //country: req.body.country,        //info not added because each listing will require location anyway
            //location: req.body.location,
            createdOn: DateTimeNow()
        }
        users.push(newUser);
        res.sendStatus(201);
        console.log(newUser);
        //User Created
    }
    else {
        res.sendStatus(400);
    }
})

//add item
// Required Login;; only view site if successful
// User only needs to put the name, description, price, location, delivery method and category. + optional images
// All required values are in string format, image is optional and files format
app.post('/item/add',
  passport.authenticate('basic', {session: false}),
  upload.array('image', 4),
  (req, res) => {

    const valid = validateItem(req.body)
    console.log(valid)

    if (valid == true) {
        const newItem = {
            itemID: uuid(),
            name: req.body.name,
            description: req.body.description,
            price: req.body.price + "€",    //this was supposed to be number only, but postman doesnt allow you to do that and send files
            location: req.body.location, 
            category: req.body.category, 
            delivery: req.body.delivery,
            image: req.files,
            datetime: DateTimeNow(),
            ownerID: req.user.userID,   //fields with req.user are automatically filled, data from login username
            ownerName: req.user.fName + " " + req.user.lName,
            ownerMobileNumber: req.user.mobileNumber,
            ownerEmail: req.user.email
        }

        item.push(newItem);
        res.sendStatus(201);
        console.log(newItem);
    }
    else {
        res.sendStatus(400);
    }
});

//Delete item     //Requires owner login
app.delete('/item/delete/:id',
  passport.authenticate('basic', {session: false}), (req, res) => {

    ownerID = req.user.userID;
    const items = item.find(i => i.itemID === req.params.id);

    if(items === undefined) {
        res.sendStatus(404); //item not found
    }
    else if (ownerID != items.ownerID) {
        res.sendStatus(403);  //Item Owner ID does not match logged in user
    }
    else {     //item found and item owner matches logged in userID; proceed to delete item
        item.splice(item.indexOf(items),1) //remove 1 line from array "item" (list of items)
        console.log("Item successfully deleted");
        res.sendStatus(200);
    }
})

//Modify existing item     //Requires owner login
//Same method as delete, but instead you give input.
//Seems to require raw json data from postman.

/* Enter in postman raw data (json):
{
    "name": "",
    "description": "" ,
    "location": "",
    "category": "",
    "delivery": "",
    "price": ""
}
*/

app.put('/item/modify/:id',
  passport.authenticate('basic', {session: false}), (req, res) => {

    ownerID = req.user.userID;
    const items = item.find(i => i.itemID === req.params.id);

    if(items === undefined) {
        res.sendStatus(404); //item not found
    }
    else if (ownerID != items.ownerID) {
        res.sendStatus(403);  //Item Owner ID does not match logged in user
    }
    else {     //item found and item owner matches logged in userID; edit item

        const valid = validateItem(req.body)
        console.log(valid)

        if (valid == true) {

            index = item.indexOf(items)
            item[index].name = req.body.name;
            item[index].description = req.body.description;
            item[index].price = req.body.price + "€";
            item[index].location = req.body.location;
            item[index].category = req.body.category;
            item[index].delivery = req.body.delivery;
            console.log("Item edited");
            res.sendStatus(200);
        }
        
        else {
            res.sendStatus(400);
        }
    }
})
/*
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

*/
let serverInstance = null;
module.exports = {
    start: function() {
        serverInstance = app.listen(port, () => {
            console.log(`Example app listening at http://localhost:${port}`)
        })
    },
    close: function() {
        serverInstance.close();
    }
}