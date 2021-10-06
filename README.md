# shopping-api
Marketplace-style API

Features browsing products, registering users, posting new listings and editing/removing those listings.
Uses Basic authentication, with passwords being encrypted with bcrypt. Data validation is used when adding users or listings.

Postman formats:
Use raw data, json
POST /register :

{
    "fName": "", 
    "lName": "",  
    "email": "", 
    "mobileNumber": ,
    "username": "",
    "password": ""
}

Use form-data with 'image' as files, required fields below
POST /item/add  :

name,
description,
price, 
location, 
category, 
delivery,
image (format: files)

Requires you to enter all fields again. Seems like only raw data works for this, so use that
PUT /item/modify/:id

{
    "name": "",
    "description": "" ,
    "location": "",
    "category": "",
    "delivery": "",
    "price": ""
}
