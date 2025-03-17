import request from 'supertest';
import  {app,server}  from '../server.js';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDMyNzlhY2YxMTA1NjI1ODhkYzFiYiIsImlhdCI6MTc0MjEwNDk2MCwiZXhwIjoxNzQ0Njk2OTYwfQ.av1nauw6oIrNoQTbDuraEi4WMv2FHzXLRYgZVf9q7G0';
let emotionId;

describe('Emotion API Integration Tests', () => {
    afterAll(() => {
        server.close();
    });

    describe('POST /api/emotions', () => {
        it('should create a new emotion', async () => {
            const response = await request(app)
                .post('/api/emotions')
                .set('Authorization', `Bearer ${token}`)
                .send({ emotion: 'happy', intensity: 8 });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('_id');
            emotionId = response.body.data._id;
        });
    });

    describe('GET /api/emotions', () => {
        it('should fetch all user emotions', async () => {
            const response = await request(app)
                .get('/api/emotions')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBeTruthy();
        });
    });

    describe('GET /api/emotions/:id', () => {
        it('should fetch a single emotion by ID', async () => {
            const response = await request(app)
                .get(`/api/emotions/${emotionId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('_id', emotionId);
        });

        it('should return 404 if emotion is not found', async () => {
            const response = await request(app)
                .get('/api/emotions/invalidId')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/emotions/:id', () => {
        it('should update an existing emotion', async () => {
            const response = await request(app)
                .put(`/api/emotions/${emotionId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ emotion: 'excited', intensity: 9 });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.emotion).toBe('excited');
        });

        it('should return 404 if emotion is not found', async () => {
            const response = await request(app)
                .put('/api/emotions/invalidId')
                .set('Authorization', `Bearer ${token}`)
                .send({ emotion: 'sad' });

            expect(response.status).toBe(404);
        });
    });

    describe('GET /api/emotions/summary/:userId', () => {
        it('should return the emotion summary for a user', async () => {
            const response = await request(app)
                .get(`/api/emotions/summary/your-user-id`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('count');
        });
    });

    describe('DELETE /api/emotions/:id', () => {
        it('should delete an emotion', async () => {
            const response = await request(app)
                .delete(`/api/emotions/${emotionId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('message', 'Emotion deleted successfully');
        });

        it('should return 404 if emotion is not found', async () => {
            const response = await request(app)
                .delete('/api/emotions/invalidId')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
        });
    });
});
