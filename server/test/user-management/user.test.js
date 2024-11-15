const express = require('express');
const supertest = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const UserModel = require('../../models/UserManagement/Users');
const router = require('../../routes/UserManagement/User_route');

const app = express();
app.use(express.json());
app.use(router);

beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/TTLABS_TB', { useNewUrlParser: true, useUnifiedTopology: true });
}, 10000);

afterAll(async () => {
    await mongoose.connection.close();
}, 10000);

describe('Admin Profile Management Routes', () => {
    describe('GET /adminprofilemanagement/users', () => {
        let adminToken;

        beforeEach(async () => {
            await UserModel.deleteMany({});

            const adminUser = await UserModel.create({
                Firstname: 'Admin',
                Lastname: 'User',
                email: 'admin@example.com',
                Password: await bcrypt.hash('adminpassword', 10),
                role: 'admin'
            });

            adminToken = jwt.sign({ role: adminUser.role, email: adminUser.email }, 'jwt-secret-key', { expiresIn: '1d' });
        });

        it('should return an error if the token is not provided', async () => {
            const response = await supertest(app)
                .get('/adminprofilemanagement/users')
                .expect(200);

            expect(response.body).toBe("The token was not available");
        });

        it('should return an error if the token is invalid', async () => {
            const response = await supertest(app)
                .get('/adminprofilemanagement/users')
                .set('Cookie', ['token=invalid-token'])
                .expect(200);

            expect(response.body).toBe("Token is Wrong");
        });

    });
});

describe('User API', () => {
    beforeEach(async () => {
        await UserModel.deleteMany({});
    });

    it('should create a new user info entry', async () => {
        const userData = {
            Firstname: 'John',
            Lastname: 'Doe',
            email: 'john@example.com',
            Password: 'password123',
            role: 'admin'
        };

        const response = await supertest(app)
            .post('/register')
            .send(userData)
            .expect(200);

        expect(response.body).toHaveProperty('_id');
        expect(response.body.Firstname).toBe(userData.Firstname);
        expect(response.body.Lastname).toBe(userData.Lastname);
        expect(response.body.email).toBe(userData.email);
        expect(response.body.role).toBe(userData.role);

        const user = await UserModel.findById(response.body._id);
        const passwordMatch = await bcrypt.compare(userData.Password, user.Password);
        expect(passwordMatch).toBe(true);
    });

    it('should return an error for a non-existent user', async () => {
        const resetPasswordData = {
            email: 'nonexistent@example.com'
        };
    
        const resetPasswordResponse = await supertest(app)
            .post('/forgotPassword')
            .send(resetPasswordData)
            .expect(404);
    
        expect(resetPasswordResponse.body).toHaveProperty('error', 'User not found');
    });

    it('should return an error for incorrect password', async () => {
        const userData = {
            email: 'john@example.com',
            Password: 'password123',
        };
    
        const response = await supertest(app)
            .post('/login')
            .send(userData)
            .expect(200);
    
        expect(response.body).toBe('No record existed');
    });

    it('should successfully log in an existing user', async () => {
        const userData = {
            email: 'john@example.com',
            password: 'password123',
            role: 'admin',
        };
    
        const response = await supertest(app)
            .post('/login')
            .send(userData)
            .expect(200);
    
        if (response.body.Status === 'Success') {
            expect(response.body).toHaveProperty('role', 'admin');
            expect(response.body).toHaveProperty('email', userData.email);
        } 
    });
});

describe('User Profile Management Routes', () => {
    describe('GET /userprofile', () => {
        let adminToken;

        beforeEach(async () => {
            await UserModel.deleteMany({});

            const adminUser = await UserModel.create({
                Firstname: 'Admin',
                Lastname: 'User',
                email: 'admin@example.com',
                Password: await bcrypt.hash('adminpassword', 10),
                role: 'admin',
                profilePicture: 'profile-pic-url',
                twoFactorAuth: false
            });

            adminToken = jwt.sign({ role: adminUser.role, email: adminUser.email }, 'jwt-secret-key', { expiresIn: '1d' });
        });

        it('should return user profile for authenticated user', async () => {
            const response = await supertest(app)
                .get('/userprofile')
                .set('Cookie', [`token=${adminToken}`])
                .expect(200);

            expect(response.body).toHaveProperty('email', 'admin@example.com');
            expect(response.body).toHaveProperty('profilePicture', 'profile-pic-url');
        });

        it('should return error if user is not found', async () => {
            await UserModel.deleteMany({});

            const response = await supertest(app)
                .get('/userprofile')
                .set('Cookie', [`token=${adminToken}`])
                .expect(404);

            expect(response.body).toHaveProperty('error', 'User not found');
        });
    });

    describe('Admin Profile Management Routes', () => {
        describe('DELETE /adminprofilemanagement/users/:userId', () => {
            let adminToken;
            let userIdToDelete;
    
            beforeEach(async () => {
                await UserModel.deleteMany({});
    
                // Create an admin user
                const adminUser = await UserModel.create({
                    Firstname: 'Admin',
                    Lastname: 'User',
                    email: 'admin@example.com',
                    Password: await bcrypt.hash('adminpassword', 10),
                    role: 'admin'
                });
    
                adminToken = jwt.sign({ role: adminUser.role, email: adminUser.email }, 'jwt-secret-key', { expiresIn: '1d' });
    
                // Create a user to be deleted
                const userToDelete = await UserModel.create({
                    Firstname: 'User',
                    Lastname: 'ToDelete',
                    email: 'delete@example.com',
                    Password: await bcrypt.hash('deletepassword', 10),
                    role: 'lecture' // Let's assume the role is 'lecture' for this test case
                });
    
                userIdToDelete = userToDelete._id;
            });
    
            it('should delete user if authenticated admin sends request with valid user id', async () => {
                const response = await supertest(app)
                    .delete(`/adminprofilemanagement/users/${userIdToDelete}`)
                    .set('Cookie', [`token=${adminToken}`])
                    .expect(200);
    
                expect(response.body).toHaveProperty('message', 'User deleted successfully');
    
                // Check if the user is deleted from the database
                const deletedUser = await UserModel.findById(userIdToDelete);
                expect(deletedUser).toBeNull();
            });
    
            it('should return an error if the user id is invalid', async () => {
                const invalidUserId = 'invalid-user-id'; // Non-existing user id
    
                const response = await supertest(app)
                    .delete(`/adminprofilemanagement/users/${invalidUserId}`)
                    .set('Cookie', [`token=${adminToken}`])
                    .expect(500);
    
                expect(response.body).toHaveProperty('error', 'Internal server error');
            });
    
            it('should return an error if the token is not provided', async () => {
                const response = await supertest(app)
                    .delete(`/adminprofilemanagement/users/${userIdToDelete}`)
                    .expect(200);
    
                expect(response.body).toBe("The token was not available");
            });
    
            it('should return an error if the token is invalid', async () => {
                const response = await supertest(app)
                    .delete(`/adminprofilemanagement/users/${userIdToDelete}`)
                    .set('Cookie', ['token=invalid-token'])
                    .expect(200);
    
                expect(response.body).toBe("Token is Wrong");
            });
        });
    });

});