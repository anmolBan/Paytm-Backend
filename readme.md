# Paytm-like Project

This project implements basic user and account management functionalities similar to Paytm. It includes features such as user signup, signin, profile update, account balance retrieval, and fund transfer between accounts. User passwords are securely hashed before being stored in the database for enhanced security.

## Features

1. **User Management**:
   - **Signup**: Users can create a new account by providing their email, first name, last name, and password. Upon successful signup, a JWT token is generated and provided to the user for authentication.
   - **Signin**: Users can sign in to their account using their email and password. Upon successful authentication, a JWT token is provided to the user for accessing protected routes.
   - **Profile Update**: Authenticated users can update their profile information including first name, last name, and password.

2. **Account Management**:
   - **Account Balance Retrieval**: Authenticated users can retrieve their account balance.
   - **Fund Transfer**: Authenticated users can transfer funds between their accounts and other user accounts by providing the recipient's email and the amount to transfer.

## Technologies Used

- Node.js: Server-side JavaScript runtime environment.
- Express.js: Web application framework for Node.js.
- MongoDB: NoSQL database for storing user and account information.
- Mongoose: MongoDB object modeling for Node.js.
- bcrypt: Library for securely hashing passwords.
- JSON Web Tokens (JWT): Used for authentication and authorization.
- Zod: Schema validation library for validating user input data.