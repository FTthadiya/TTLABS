const mongoose = require('mongoose');
const express = require('express');
const supertest = require('supertest');
const LabModel = require('../../models/LabHall-Management/Labs');
const AssLabModel = require('../../models/LabHall-Management/AssignLab');
const labRoutes = require('../../routes/LabHall-Management/lab_route');
const assLabRoutes = require('../../routes/LabHall-Management/asslab_route');

const app = express();
app.use(express.json());
app.use('/labs', labRoutes);
app.use('/assignmentlabs', assLabRoutes);

describe('Lab routes', () => {
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
        await LabModel.deleteMany({});
    });

    it('should get all labs', async () => {
        await LabModel.create({ labid: '1', capacity: 30, available: true });
        await LabModel.create({ labid: '2', capacity: 40, available: true });

        const response = await supertest(app).get('/labs/getLabs').expect(200);

        expect(response.body).toHaveLength(2);
    }, 10000); // Increase timeout to 10 seconds

    it('should create a new lab', async () => {
        const labData = { labid: '3', capacity: 50 };
        const response = await supertest(app).post('/labs/createLab').send(labData).expect(200);

        expect(response.body.labid).toBe('3');
        expect(response.body.capacity).toBe(50);
        expect(response.body.available).toBe(true);
    }, 10000); // Increase timeout to 10 seconds

    it('should delete a lab', async () => {
        await LabModel.create({ labid: '4', capacity: 60, available: true });
    
        const response = await supertest(app).delete('/labs/deleteLab/4').expect(200);
    
        expect(response.body.message).toBe('lab deleted successfully'); // Updated expectation
    }, 10000); // Increase timeout to 10 seconds
    

    it('should update a lab', async () => {
        await LabModel.create({ labid: '5', capacity: 70, available: true });

        const updatedLabData = { capacity: 80, available: false };
        const response = await supertest(app).put('/labs/updateLab/5').send(updatedLabData).expect(200);

        expect(response.body.capacity).toBe(80);
        expect(response.body.available).toBe(false);
    }, 10000); // Increase timeout to 10 seconds
});

describe('Assignment Lab routes', () => {
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
        await AssLabModel.deleteMany({});
    });

    it('should get all assignment labs', async () => {
        await AssLabModel.create({ labid: '1', day: 'Monday', startTime: '10:00', duration: 2, subjectCode: 'CS101', timeIndex: 1 });
        await AssLabModel.create({ labid: '2', day: 'Tuesday', startTime: '14:00', duration: 3, subjectCode: 'CS102', timeIndex: 2 });

        const response = await supertest(app).get('/assignmentlabs/getAssignmentLabs').expect(200);

        expect(response.body).toHaveLength(2);
    }, 10000); // Increase timeout to 10 seconds

    it('should create a new assignment lab', async () => {
        const assignmentLabData = { labid: '3', day: 'Wednesday', startTime: '09:00', duration: 2, subjectCode: 'CS103', timeIndex: 3 };
        const response = await supertest(app).post('/assignmentlabs/createAssignmentLab').send(assignmentLabData).expect(200);

        expect(response.body.labid).toBe('3');
        expect(response.body.day).toBe('Wednesday');
        expect(response.body.startTime).toBe('09:00');
        expect(response.body.duration).toBe(2);
        expect(response.body.subjectCode).toBe('CS103');
        expect(response.body.timeIndex).toBe(3);
    }, 10000); // Increase timeout to 10 seconds

    it('should delete an assignment lab', async () => {
        const assignmentLab = await AssLabModel.create({
            labid: '4',
            day: 'Thursday',
            startTime: '11:00',
            duration: 1,
            subjectCode: 'CS104',
            timeIndex: 4
        });
    
        const response = await supertest(app).delete(`/assignmentlabs/deleteAssignmentLab/${assignmentLab._id}`).expect(200);
    
        expect(response.body.message).toBe('Assignment lab deleted successfully');
    }, 10000); // Increase timeout to 10 seconds
    
    
    it('should update an assignment lab', async () => {
        const assignmentLab = await AssLabModel.create({
            labid: '5',
            day: 'Friday',
            startTime: '13:00',
            duration: 1,
            subjectCode: 'CS105',
            timeIndex: 5
        });
    
        const updatedAssignmentLabData = {
            day: 'Saturday',
            startTime: '10:00',
            duration: 3,
            subjectCode: 'CS106',
            timeIndex: 6
        };
        const response = await supertest(app).put(`/assignmentlabs/updateAssignmentLab/${assignmentLab._id}`).send(updatedAssignmentLabData).expect(200);
    
        expect(response.body.day).toBe('Saturday');
        expect(response.body.startTime).toBe('10:00');
        expect(response.body.duration).toBe(3);
        expect(response.body.subjectCode).toBe('CS106');
        expect(response.body.timeIndex).toBe(6);
    }, 10000);
    
    
});

