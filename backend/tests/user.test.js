import request from 'supertest';
import  {app,server}  from '../server.js';

const token = '';
let userId;

describe('User API Integration Tests', () => {
    afterAll(() => {
        server.close();
    });

    describe('POST /api/users/register', () => {
        it('should register a new user', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('_id');
            userId = response.body.data._id;
        });
    });

    describe('POST /api/users/login', () => {
        it('should log in a user with correct credentials', async () => {
            const response = await request(app)
                .post('/api/users/login')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('token');
        });

        it('should return 400 for invalid credentials', async () => {
            const response = await request(app)
                .post('/api/users/login')
                .send({ email: 'test@example.com', password: 'wrongpassword' });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/users/profile/:id', () => {
        it('should fetch user profile', async () => {
            const response = await request(app)
                .get(`/api/users/profile/${userId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        
        });

        it('should return 404 if user is not found', async () => {
            const response = await request(app)
                .get('/api/users/profile/invalidId')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/users/update', () => {
        it('should update the user profile', async () => {
            const response = await request(app)
                .put('/api/users/update')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Updated User' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Updated User');
        });
    });

    describe('POST /api/users/request-password-reset', () => {
        it('should request a password reset', async () => {
            const response = await request(app)
                .post('/api/users/request-password-reset')
                .send({ email: 'test@example.com' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('message', 'Password reset token generated successfully');
        });
    });

    describe('POST /api/users/reset-password/:resetToken', () => {
        it('should reset the user password', async () => {
            const response = await request(app)
                .post('/api/users/reset-password/fake-reset-token')
                .send({ password: 'newpassword123' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('message', 'Password has been reset successfully');
        });
    });
});
