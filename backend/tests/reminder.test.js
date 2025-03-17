import request from 'supertest';
import  {app,server}  from '../server.js';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDMyNzlhY2YxMTA1NjI1ODhkYzFiYiIsImlhdCI6MTc0MjEwNDk2MCwiZXhwIjoxNzQ0Njk2OTYwfQ.av1nauw6oIrNoQTbDuraEi4WMv2FHzXLRYgZVf9q7G0';

describe('Reminder API Integration Tests', () => {
    let reminderId;

    afterAll(() => {
        server.close();
    });

    describe('POST /api/reminders', () => {
        it('should create a new reminder', async () => {
            const response = await request(server)
                .post('/api/reminders')
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Test Reminder', description: 'Reminder details' });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('_id');
            reminderId = response.body._id;
        });
    });

    describe('GET /api/reminders', () => {
        it('should fetch all reminders', async () => {
            const response = await request(server)
                .get('/api/reminders')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
        });
    });

    describe('GET /api/reminders/:id', () => {
        it('should fetch a single reminder by ID', async () => {
            const response = await request(server)
                .get(`/api/reminders/${reminderId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('_id', reminderId);
        });

        it('should return 404 if reminder is not found', async () => {
            const response = await request(server)
                .get('/api/reminders/invalidId')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/reminders/:id', () => {
        it('should update an existing reminder', async () => {
            const response = await request(server)
                .put(`/api/reminders/reminder/${reminderId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Updated Reminder' });

            expect(response.status).toBe(200);
            expect(response.body.title).toBe('Updated Reminder');
        });

        it('should return 404 if reminder is not found', async () => {
            const response = await request(server)
                .put('/api/reminders/invalidId')
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Non-existent Reminder' });

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/reminders/:id', () => {
        it('should delete a reminder', async () => {
            const response = await request(server)
                .delete(`/api/reminders/${reminderId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Reminder deleted successfully');
        });

        it('should return 404 if reminder is not found', async () => {
            const response = await request(server)
                .delete('/api/reminders/invalidId')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
        });
    });
});
