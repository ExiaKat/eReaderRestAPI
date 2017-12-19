## Restful API for eReader

This is a Restful API for eReader book rental system. 

## Restful API

POST /api/users 
Get user authentication token and set in response header

POST /api/users/login
User login and return valid user authentication token

DELETE /api/users/logout
User logout

POST /api/member
Register new member

GET /api/member
Search for member by passing parentName, serialNumber, mobile query parameters

PATCH /api/member/:id
Update member information 

DELETE /api/member/:id
Delete member information

