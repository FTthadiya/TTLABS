const mongoose = require('mongoose');
const express = require('express');
const supertest = require('supertest');
const HallModel = require('../../models/LabHall-Management/Halls');
const AssHallModel = require('../../models/LabHall-Management/AssignHall');
const hallRoutes = require('../../routes/LabHall-Management/hall_route');
const assHallRoutes = require('../../routes/LabHall-Management/asshall_route');

const app = express();
app.use(express.json());
app.use('/halls', hallRoutes);
app.use('/assignmenthalls', assHallRoutes);

describe('Hall routes', () => {
    beforeAll(async () => {
        await mongoose.connect('mongodb://127.0.0.1:27017/TTLABS_TB', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }, 10000); // Increase timeout to 10 seconds
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await HallModel.deleteMany({});
    });

    it('should get all halls', async () => {
        await HallModel.create({ hallid: '1', capacity: 50, available: true });
        await HallModel.create({ hallid: '2', capacity: 100, available: true });

        const response = await supertest(app).get('/halls/getHalls').expect(200);

        expect(response.body).toHaveLength(2);
    }, 10000); // Increase timeout to 10 seconds

    it('should create a new hall', async () => {
        const hallData = { hallid: '3', capacity: 75 };
        const response = await supertest(app).post('/halls/createHall').send(hallData).expect(200);

        expect(response.body.hallid).toBe('3');
        expect(response.body.capacity).toBe(75);
        expect(response.body.available).toBe(true);
    }, 10000); // Increase timeout to 10 seconds

    it('should delete a hall', async () => {
        await HallModel.create({ hallid: '4', capacity: 80, available: true });

        const response = await supertest(app).delete('/halls/deleteHall/4').expect(200);

        expect(response.body.message).toBe('Hall deleted successfully');
    }, 10000); // Increase timeout to 10 seconds

    it('should update a hall', async () => {
        await HallModel.create({ hallid: '5', capacity: 60, available: true });

        const updatedHallData = { capacity: 70, available: false };
        const response = await supertest(app).put('/halls/updateHall/5').send(updatedHallData).expect(200);

        expect(response.body.capacity).toBe(70);
        expect(response.body.available).toBe(false);
    }, 10000); // Increase timeout to 10 seconds
});

describe('Assignment hall routes', () => {
    beforeAll(async () => {
        await mongoose.connect('mongodb://127.0.0.1:27017/TTLABS_TB', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }, 10000); // Increase timeout to 10 seconds
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await AssHallModel.deleteMany({});
    });

    it('should get all assignment halls', async () => {
        await AssHallModel.create({
            hallid: '1',
            day: 'Monday',
            startTime: '09:00',
            duration: 2,
            subjectCode: 'CS101',
            timeIndex: 1
        });
        await AssHallModel.create({
            hallid: '2',
            day: 'Tuesday',
            startTime: '11:00',
            duration: 1,
            subjectCode: 'CS202',
            timeIndex: 2
        });
    
        const response = await supertest(app).get('/assignmenthalls/getAssignmentHalls').expect(200);
    
        expect(response.body).toHaveLength(2);
    }, 10000);
    
    it('should create a new assignment hall', async () => {
        const assignmentHallData = {
            hallid: '3',
            day: 'Wednesday',
            startTime: '10:00',
            duration: 3,
            subjectCode: 'CS303',
            timeIndex: 3
        };
        const response = await supertest(app).post('/assignmenthalls/createAssignmentHall').send(assignmentHallData).expect(200);
    
        expect(response.body.hallid).toBe('3');
        expect(response.body.day).toBe('Wednesday');
        expect(response.body.startTime).toBe('10:00');
        expect(response.body.duration).toBe(3);
        expect(response.body.subjectCode).toBe('CS303');
        expect(response.body.timeIndex).toBe(3);
    }, 10000);
    
    it('should delete an assignment hall', async () => {
        const assignmentHall = await AssHallModel.create({
            hallid: '4',
            day: 'Thursday',
            startTime: '14:00',
            duration: 2,
            subjectCode: 'CS404',
            timeIndex: 4
        });
    
        const response = await supertest(app).delete(`/assignmenthalls/deleteAssignmentHall/${assignmentHall._id}`).expect(200);
    
        expect(response.body.message).toBe('Assignment hall deleted successfully');
    }, 10000);
    
    it('should update an assignment hall', async () => {
        const assignmentHall = await AssHallModel.create({
            hallid: '5',
            day: 'Friday',
            startTime: '13:00',
            duration: 1,
            subjectCode: 'CS505',
            timeIndex: 5
        });
    
        const updatedAssignmentHallData = {
            day: 'Saturday',
            startTime: '09:00',
            duration: 2,
            subjectCode: 'CS606',
            timeIndex: 6
        };
        const response = await supertest(app).put(`/assignmenthalls/updateAssignmentHall/${assignmentHall._id}`).send(updatedAssignmentHallData).expect(200);
    
        expect(response.body.day).toBe('Saturday');
        expect(response.body.startTime).toBe('09:00');
        expect(response.body.duration).toBe(2);
        expect(response.body.subjectCode).toBe('CS606');
        expect(response.body.timeIndex).toBe(6);
    }, 10000);
    
});
