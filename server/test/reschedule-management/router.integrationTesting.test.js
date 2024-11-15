const express = require('express');
const supertest = require('supertest');
const mongoose = require('mongoose');
const Request = require('../../models/reschedule-management/request_model'); 
const router = require('../../routes/reschedule-management/request_route');
const ResTimetable = require('../../models/reschedule-management/resTimetable_model');
const router2 = require("../../routes/reschedule-management/resTimetable_route");
const router3 = require("../../routes/TimeTableManagement/subjects");
const {Subject} = require('../../models/TimeTableManagement/subject');
const { CurrSemFunction } = require('../../models/TimeTableManagement/functionality');
const { Day } = require("../../models/TimeTableManagement/day");
const { StartTime } = require("../../models/TimeTableManagement/startTime");
const {getDuration, checkTimeTableSlot } = require('../../routes/reschedule-management/request_route')


const app = express();
app.use(express.json());
app.use(router);
app.use(router2);
app.use(router3);
beforeAll(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/TTLABS_DB');
  
} , 10000);

afterAll(async () => {
  await mongoose.connection.close();
}, 10000);


describe('ResTimetable API', () => {
beforeEach(async () => {
  await ResTimetable.deleteMany({});
});


it('should create a new timetable entry', async () => {
  const mockResTimetable = {
    currSemester: {
        functionName: "getCurrSemester",
        year: 2024,
        semester: {
        periodIndex: 1,
        periodName: "February - June"
        }
    },
    subject: {
        subjectName: "Capstone Project 2",
        subjectCode: "CCP2",
        sessionType: "lecture",
        studentCount: 50,
        duration: 1,
        lecturer: {
        _id: new mongoose.Types.ObjectId(),
        lecturerName: "Mrs.Geethanjali",
        email: "geetha@example.com"
        },
        specBatches: [
          {
            specName: "IT",
            year: 2024,
            semester: 1
          }
        ]
    },
    lectureHall: {

        hallid: "LT101",
        capacity: 50,
        assigned: false

    },
    day: { index: 1, name: "Tuesday" },
    startTime: {  index: 1, name: "10:00 AM" }
    };

    const mockCurrSemester = {
       functionName: "getCurrSemester",
       year: 2024,
       semester: {
       periodIndex: 1,
       periodName: "February - June"
       }
     };

  jest.spyOn(CurrSemFunction, 'findOne').mockResolvedValueOnce(mockCurrSemester);

  const response = await supertest(app)
    .post('/data')
    .send(mockResTimetable);

  const foundEntry = await ResTimetable.findById(response.body._id);

  expect(response.status).toBe(201);
  expect(foundEntry).toBeDefined();
  expect(foundEntry.subject.subjectName).toBe('Capstone Project 2');
});
it('should return 400 if the request is invalid', async () => {
  const mockResTimetable = {};

  const mockCurrSemester = {
    functionName: "getCurrSemester",
    year: 2024,
    semester: {
      periodIndex: 1,
      periodName: "February - June"
    }
  };

  jest.spyOn(CurrSemFunction, 'findOne').mockResolvedValueOnce(mockCurrSemester);

  const response = await supertest(app)
    .post('/data')
    .send(mockResTimetable);

  expect(response.status).toBe(400);
});

it('should get all timetable entries', async () => {
  await ResTimetable.create({
    subject: {
      subjectName: "Capstone Project 2",
      subjectCode: "CCP2",
      sessionType: "lecture",
      studentCount: 50,
      duration: 1,
      lecturer: {
        lecturerName: "Mrs.Geethanjali",
        email: "geetha@example.com"
      }
    },
    lectureHall: {
      hallid: "LT101",
      capacity: 50
    },
    day: { _id: "2", index: 1, name: "Tuesday" },
    startTime: { _id: "2", index: 1, name: "10:00 AM" }
  });

  const response = await supertest(app)
    .get('/data')
    .expect(200);

  expect(response.body.length).toBe(1);
  expect(response.body[0].subject.subjectName).toBe('Capstone Project 2');
});
it('should return 500 if an error occurs', async () => {

  jest.spyOn(ResTimetable, 'find').mockRejectedValueOnce(new Error('Database error'));

  const response = await supertest(app)
    .get('/data');
  expect(response.status).toBe(500);
});

it('should update an existing timetable entry', async () => {
  const timetable = await ResTimetable.create({
    subject: {
      subjectName: "Design Analysis and Algorithms",
      subjectCode: "DAA",
      sessionType: "lecture",
      studentCount: 50,
      duration: 1,
      specBatches: 
      [
      ],
      lecturer: {
        lecturerName: "Mr.Samantha Rajapaksha",
        email: "samantha@example.com"
      }
    },
    lectureHall: {
      hallid: "LT201",
      capacity: 50
    },
    day: { _id: "3", index: 2, name: "Wednesday" },
    startTime: { _id: "3", index: 2, name: "11:00 AM" }
  });


const updatedData = {
  ...timetable.toObject(), 
  subject: {
    ...timetable.subject.toObject(), 
    subjectName: "Design Algorithms", 
  },
};


  const response = await supertest(app)
    .put(`/data/${timetable._id}`)
    .send(updatedData)
    .expect(201);
    
  expect(response.body.subject.subjectName).toBe('Design Algorithms');
});

it('should return 400 if the update operation fails', async () => {
  const mockTimetableId = 'mockId';
  const mockUpdateFields = { invalidField: 'value' };
  
  jest.spyOn(ResTimetable, 'findById').mockResolvedValueOnce({
    _id: mockTimetableId,
  });

  jest.spyOn(ResTimetable, 'findByIdAndUpdate').mockRejectedValueOnce(new Error('Update error'));

  const response = await supertest(app)
    .put(`/data/${mockTimetableId}`)
    .send(mockUpdateFields);

  expect(response.status).toBe(400);
});


it('should delete an existing timetable entry', async () => {
  
  const timetable = await ResTimetable.create({
    subject: {
      subjectName: "Design Analysis and Algorithms",
      subjectCode: "DAA",
      sessionType: "lecture",
      studentCount: 50,
      duration: 1,
      lecturer: {
        lecturerName: "Mr.Samantha Rajapaksha",
        email: "samantha@example.com"
      }
    },
    lectureHall: {
      hallid: "LT201",
      capacity: 50
    },
    day: { _id: "3", index: 2, name: "Wednesday" },
    startTime: { _id: "3", index: 2, name: "11:00 AM" }
  });
  
  const response = await supertest(app)
    .delete(`/data/${timetable._id.toString()}`) 
    .expect(200);
  
  expect(response.body.message).toBe('Timetable data deleted successfully');
  
  const deletedTimetable = await ResTimetable.findById(timetable._id);
  expect(deletedTimetable).toBeNull(); 
});
it('should return 500 if the deletion operation fails', async () => {
  const mockTimetableId = 'mockId';

  jest.spyOn(ResTimetable, 'findByIdAndDelete').mockRejectedValueOnce(new Error('Deletion error'));

  const response = await supertest(app)
    .delete(`/data/${mockTimetableId}`);

  expect(response.status).toBe(500);
});



  it('should return filtered timetable data based on subject code', async () => {

    
    
    const mockTimetableData = [
      {
        currSemester: {
          functionName: 'getCurrentSemester',
          year: 2024,
          semester: {
            periodIndex: 1,
            periodName: "February - June",
          },
        },
        subject: {
          subjectName: 'Computer Systems',
          subjectCode: 'COMP2006',
          sessionType: 'Lecture',
          studentCount: 50,
          duration: 2,
          lecturer: {
            _id: '609c3f7f0a2c84001f92144b',
            lecturerName: 'Mr.Samantha Rajapaksha',
            email: 'samantha@example.com',
          },
          specBatches: [
            {
              specName: 'Computer Science',
              year: 1,
              semester: 1,
            },
          ],
        },
        lectureHall: {
          _id: '609c3f7f0a2c84001f92144c',
          hallid: 'LT100',
          capacity: 100,
        },
        day: {
          _id: '609c3f7f0a2c84001f92144d',
          index: 2,
          name: 'Wednesday',
        },
        startTime: {
          _id: '609c3f7f0a2c84001f92144e',
          index: 3,
          name: '09:00 AM',
        },
      },
     
    ];

    
    const mockSubjectData = {
      subjectName: 'Computer Systems',
      subjectCode: 'COMP2006',
      sessionType: 'Lecture',
      studentCount: 50,
      duration: 2,
      lecturer: {
        _id: '609c3f7f0a2c84001f92144b',
        lecturerName: 'Mr.Samantha Rajapaksha',
        email: 'samantha@example.com',
      },
      specBatches: [
        {
          specName: 'Computer Science',
          year: 1,
          semester: 1,
        },
      ],
    };

    jest.spyOn(Subject, 'findOne').mockResolvedValue(mockSubjectData);
    jest.spyOn(ResTimetable, 'find').mockResolvedValue(mockTimetableData);
   
    const response = await supertest(app).get('/data/COMP2006');

  
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toEqual([mockTimetableData[0]]);
  });

  it('should handle errors', async () => {
  
    const spy = jest.spyOn(ResTimetable, 'find').mockRejectedValue(new Error('Database error'));
    const response = await supertest(app).get('/data/COMP2006');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Database error' });

    spy.mockRestore();
  });
});

describe('Lecturer Request API', () => {
  beforeEach(async () => {


    await Request.deleteMany({});
    await ResTimetable.deleteMany({});

  });

  describe('POST "/" valid request and invalid request ', () => {
  it('should pass a new request', async () => {

    const resTimetableEntry = {
      currSemester: {
        functionName: "2024 - sem 1",
        year: 2024,
        semester: {
          periodIndex: 1,
          periodName: "Semester 1"
        }
      },
      subject: {
        subjectName: "Object Oriented Software Engineering",
        subjectCode: "COMP2003",
        sessionType: "lab",
        studentCount: 30,
        duration: 2,
        lecturer: {
          _id: new mongoose.Types.ObjectId(),
          lecturerName: "Divya",
          email: "divya@gmail.com",
        },
        specBatches: [
          {
            specName: "Software Engineering",
            year: 2,
            semester: 3,
          }
        ]
      },
      lectureHall: {
        _id: new mongoose.Types.ObjectId(),
        hallid: "A101",
        capacity: 50,
      },
      day: { _id: new mongoose.Types.ObjectId(), index: 1, name: "Tuesday" },
      startTime: { _id: new mongoose.Types.ObjectId(), index: 1, name: "08:30" },
    };

    await ResTimetable.create(resTimetableEntry);


    const requestData = { 
      timeTableModule: "COMP2003",
      moduleCode: "COMP2003",
      moduleName: "Object Oriented Software Engineering ", 
      sessionType: "lab",
      lecturerName: "Divya",
      previousDate: new Date("2024-04-16T00:00:00.000Z"), 
      previousTime: "08:30 - 10:30", 
      currentDate: new Date ("2024-04-16T00:00:00.000Z"), 
      currentTime: "11:30 - 12:30", 
      specialNotes: "test request", 
      status: "", 
      isResolved: false, 
      approvedOrDeniedAt: null, 
      createdAt: new Date("2024-04-22T18:51:08.102Z")}; 

    const response = await supertest(app)
      .post('/')
      .send(requestData)
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Request saved successfully');


  });
  it('should return 500 if an error occurs during request processing', async () => {
  
    jest.spyOn(Request.prototype, 'save').mockRejectedValueOnce(new Error('Save error'));
  
    const mockRequestBody = {
    };
  
    const response = await supertest(app)
      .post('/')
      .send(mockRequestBody);
  
    expect(response.status).toBe(500);
  });
  
});
})

describe('Preview Request Route', () => {
  let requestId;

  beforeAll(async () => {
 
    const mockTimetableEntry = {
      subject: {
        subjectName: "Design Analysis and Algorithms",
        subjectCode: "DAA",
        sessionType: "lecture",
        studentCount: 50,
        duration: 1,
        specBatches: 
        [
        ],
        lecturer: {
          lecturerName: "Mr.Samantha Rajapaksha",
          email: "samantha@example.com"
        }
      },
      lectureHall: {
        hallid: "LT201",
        capacity: 50
      },
      day: { _id: "3", index: 2, name: "Wednesday" },
      startTime: { _id: "3", index: 2, name: "11:00" }
    };
  
  
    const mockRequest = {
        moduleCode: 'DAA',
        moduleName: 'Design Analysis and Algorithms',
        sessionType: 'lecture',
        lecturerName: 'Mr.Samantha Rajapaksha',
        previousDate: new Date('2024-04-24T00:00:00.000Z'),
        previousTime: '11:00 - 12:00',
        currentDate: new Date('2024-04-25T00:00:00.000Z'),
        currentTime: '10:00 - 11:00',
        specialNotes: 'test request',
        status: '',
        isResolved: false,
        approvedOrDeniedAt: null,
        createdAt: new Date('2024-04-23T18:51:08.102Z'),
    };
  
    const mockDay = {
      _id: new mongoose.Types.ObjectId(),
      index: 1,
      name: 'Thursday'
    }
  
    const mockStartTime = {
  
      _id: new mongoose.Types.ObjectId(),
      index: 1,
      name: '10:00'
    }
  
    await ResTimetable.create(mockTimetableEntry);
    await Day.create(mockDay);
    await StartTime.create(mockStartTime);
    const request = await Request.create(mockRequest);
    requestId = request._id;
  });

  afterAll(async () => {
    await Request.findByIdAndDelete(requestId);
  });

  it('should return preview data for a valid request ID', async () => {
    const response = await supertest(app)
      .get(`/preview/${requestId}`)
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toHaveProperty('subject');
    expect(response.body[0]).toHaveProperty('day');
    expect(response.body[0]).toHaveProperty('startTime');
    expect(response.body[1]).toHaveProperty('subject');
    expect(response.body[1]).toHaveProperty('day');
    expect(response.body[1]).toHaveProperty('startTime');
  });

  it('should return an error for an invalid request ID', async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const response = await supertest(app)
      .get(`/preview/${invalidId}`)
      .expect(500);

    expect(response.body).toHaveProperty('error', 'An error occurred while retriving preview data');
  });

  describe('GET /getTimetable/:id available slot for the request and unavailable slot for the request ', () => {

  it('should return the timetable entry if the request is successful', async () => {
  
    const mockRequestId = 'mockId';
    const mockRequest = {
      _id: mockRequestId,
      moduleCode: 'DAA',
      moduleName: 'Design Analysis and Algorithms',
      sessionType: 'lecture',
      lecturerName: 'Mr.Samantha Rajapaksha',
      previousDate: new Date('2024-04-24T00:00:00.000Z'),
      previousTime: '11:00 - 12:00',
      currentDate: new Date('2024-04-25T00:00:00.000Z'),
      currentTime: '10:00 - 11:00',
      specialNotes: 'test request',
      status: '',
      isResolved: false,
      approvedOrDeniedAt: null,
      createdAt: new Date('2024-04-23T18:51:08.102Z'),
    };
    const mockResTimetableEntry = {
    
      subject: {
        subjectName: "Design Analysis and Algorithms",
        subjectCode: "DAA",
        sessionType: "lecture",
        studentCount: 50,
        duration: 1,
        specBatches: 
        [
        ],
        lecturer: {
          lecturerName: "Mr.Samantha Rajapaksha",
          email: "samantha@example.com"
        }
      },
      lectureHall: {
        hallid: "LT201",
        capacity: 50
      },
      day: { _id: "3", index: 2, name: "Wednesday" },
      startTime: { _id: "3", index: 2, name: "11:00" }
  
    };
  
    jest.spyOn(Request, 'findById').mockResolvedValueOnce(mockRequest);
    jest.spyOn(ResTimetable, 'findOne').mockResolvedValueOnce(mockResTimetableEntry);
  
    const response = await supertest(app)
      .get(`/getTimetable/${mockRequestId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResTimetableEntry);
  });
  it('should return 500 if an error occurs while finding data', async () => {

    jest.spyOn(Request, 'findById').mockRejectedValueOnce(new Error('Find error'));
  
    const mockRequestId = 'mockId';
  
    const response = await supertest(app)
      .get(`/getTimetable/${mockRequestId}`);
  
    expect(response.status).toBe(500);
  });

});
  
  describe('PUT /approve/:id reschedule request approved successed or failed', () => {


    it('should approve a request and update the timetable entry', async () => {
      
      const response = await supertest(app)
        .put(`/approve/${requestId}`)
        .expect(200);
      
        expect(response.body.day.name).toBe('Thursday');
      
      const updatedTimetableEntry = await ResTimetable.findOne({
          'subject.subjectCode': 'DAA',
          'day.name': 'Thursday',
          'startTime.name': '10:00',
      });
      
      expect(updatedTimetableEntry).toBeDefined();
      expect(updatedTimetableEntry.subject.duration).toBe(1);
      });
    });
    // Test case for when the request ID does not exist
    it('should return 500 if the request ID does not exist', async () => {
      const mockRequestId = 'nonexistentId';

      jest.spyOn(Request, 'findById').mockResolvedValueOnce(null);

      const response = await supertest(app)
        .put(`/approve/${mockRequestId}`);

      expect(response.status).toBe(500);
    });
    it('should return 500 if no matching timetable entry is found', async () => {
      const mockRequestId = 'existingId';

      jest.spyOn(Request, 'findById').mockResolvedValueOnce({ });
      jest.spyOn(ResTimetable, 'findOne').mockResolvedValueOnce(null);

      const response = await supertest(app)
        .put(`/approve/${mockRequestId}`);

      expect(response.status).toBe(500);
    });
});