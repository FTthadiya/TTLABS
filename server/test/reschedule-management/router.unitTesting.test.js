const express = require('express');
const supertest = require('supertest');
const ResTimetable = require('../../models/reschedule-management/resTimetable_model');
const Request = require('../../models/reschedule-management/request_model');
const {Timetable} = require('../../models/TimeTableManagement/timetable');
const router1 = require("../../routes/reschedule-management/resTimetable_route");
const router2 = require("../../routes/reschedule-management/request_route");
const {Subject} = require('../../models/TimeTableManagement/subject');
const {CurrSemFunction}  = require('../../models/TimeTableManagement/functionality');
var bodyParser = require('body-parser');
const { before, after } = require('lodash');
const { mockRequest, mockResponse } = require('jest-mock-req-res');


jest.mock('node-cron', () => {
    return {
      schedule: jest.fn(),
    };
  });


describe('ResTimetable API Unit Testing', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();

    });

    afterEach(() => {
        jest.resetAllMocks();
    });

        it('GET /data : should get all timetable entries', async () => {
            const mockResTimetable = ({
            _id: "609c3", 
            subject: {
                subjectName: "Capstone Project 2",
                subjectCode: "CCP2",
                sessionType: "lecture",
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

            ResTimetable.find = jest.fn().mockResolvedValueOnce(mockResTimetable);
    
            const req = mockRequest({params: {id: "609c3"}});
            const res = mockResponse();

            await router1.stack[0].route.stack[0].handle(req, res);
            
            expect(ResTimetable.find).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith(mockResTimetable);
        });

        it('GET /findOne/:id : should find the reschedule timetable slot using Id ', async () => {
            const mockResTimetable = ({
             _id: "609c3", 
            subject: {
                subjectName: "Capstone Project 2",
                subjectCode: "CCP2",
                sessionType: "lecture",
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

            ResTimetable.findById = jest.fn().mockResolvedValueOnce(mockResTimetable);
        
            const req = mockRequest({params: {id: "609c3"}});
            const res = mockResponse();

            await router1.stack[1].route.stack[0].handle(req, res);

            
            expect(ResTimetable.findById).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith(mockResTimetable);
        });

        it('GET /data/:id : should find the filtered timetable using moduleCode', async () => {
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
                    subjectName: 'Capstone',
                    subjectCode: 'CCP2',
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
                subjectName: 'Capstone',
                subjectCode: 'CCP2',
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
        
            Subject.findOne = jest.fn().mockResolvedValueOnce(mockSubjectData);
            ResTimetable.find = jest.fn().mockResolvedValueOnce(mockTimetableData);
            
            const req = mockRequest({body: mockSubjectData});
            const res = mockResponse();

            await router1.stack[2].route.stack[0].handle(req, res);

            expect(Subject.findOne).toHaveBeenCalledTimes(1);
            expect(ResTimetable.find).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith(mockTimetableData);
        });

        it('PUT /data/:id : should find and update the timetable slot using Id ', async () => {
            const mockResTimetable = ({
            _id: "609c3", 
            subject: {
                subjectName: "Capstone Project 2",
                subjectCode: "CCP2",
                sessionType: "lecture",
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
            day: { _id: "2", index: 2, name: "Tuesday" },
            startTime: { _id: "2", index: 1, name: "10:00 AM" }
            });

            const mockUpdatedData = ({
                day: { name: "Monday" },
            })

            const mockResUpdatedTimetable = ({
                _id: "609c3", 
                subject: {
                subjectName: "Capstone Project 2",
                subjectCode: "CCP2",
                sessionType: "lecture",
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
                day: { _id: "2", index: 2, name: "Monday" },
                startTime: { _id: "2", index: 1, name: "10:00 AM" }
            });
        


            ResTimetable.findById = jest.fn().mockResolvedValueOnce(mockResTimetable);
            ResTimetable.findByIdAndUpdate = jest.fn().mockResolvedValueOnce(mockResUpdatedTimetable);
        
            const req = mockRequest({body: mockUpdatedData, params: {id: "609c3"}});
            const res = mockResponse();

            await router1.stack[3].route.stack[0].handle(req, res);
            
            expect(ResTimetable.findById).toHaveBeenCalledTimes(1);
            expect(ResTimetable.findByIdAndUpdate).toHaveBeenCalledTimes(1);
            expect(res.send).toBeDefined();
            expect(res.status).toBeCalledWith(201);
            
        });

        it('PUT /updateLecHall/:id : should find and update the hall and labs in the timetable slot using Id ', async () => {
            const mockResTimetable = ({
            _id: "609c3",  
            subject: {
                subjectName: "Capstone Project 2",
                subjectCode: "CCP2",
                sessionType: "lecture",
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
            day: { _id: "2", index: 2, name: "Tuesday" },
            startTime: { _id: "2", index: 1, name: "10:00 AM" }
            });

            const mockLectureHall = ({
                lectureHall: {
                   
                    hallid: "LT102",
                    capacity: 50
                },
            })
                

            const mockResUpdatedTimetable = ({
                _id: "609c3",
                subject: {
                subjectName: "Capstone Project 2",
                subjectCode: "CCP2",
                sessionType: "lecture",
                duration: 1,
                lecturer: {
                    lecturerName: "Mrs.Geethanjali",
                    email: "geetha@example.com"
                }
                },
                lectureHall: {
                hallid: "LT102",
                capacity: 50
                },
                day: { _id: "2", index: 2, name: "Tuesday" },
                startTime: { _id: "2", index: 1, name: "10:00 AM" }
            });
        


            ResTimetable.findById = jest.fn().mockResolvedValueOnce(mockResTimetable);
            ResTimetable.findByIdAndUpdate = jest.fn().mockResolvedValueOnce(mockResUpdatedTimetable);
        
            const req = mockRequest({body: mockLectureHall, params: {id: "609c3"}});
            const res = mockResponse();

            await router1.stack[4].route.stack[0].handle(req, res);
            
            expect(ResTimetable.findById).toHaveBeenCalledTimes(1);
            expect(ResTimetable.findByIdAndUpdate).toHaveBeenCalledTimes(1);
            expect(res.send).toBeDefined();
            expect(res.status).toBeCalledWith(201);
            
        });

        it('POST /data : should post new timetable data', async () => {
            const mockResTimetable = ({
            currSemester: {
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

            const mockCurrSemester = {
                year: 2024,
                semester: {
                    periodIndex: 1,
                    periodName: "February - June"
                }
            };


            CurrSemFunction.findOne = jest.fn().mockResolvedValueOnce(mockCurrSemester);
            ResTimetable.prototype.save = jest.fn().mockResolvedValueOnce(mockResTimetable);
        
            const req = mockRequest({body: mockResTimetable});
            const res = mockResponse();

            await router1.stack[5].route.stack[0].handle(req, res);
            
            expect(CurrSemFunction.findOne).toHaveBeenCalledTimes(1);
            expect(ResTimetable.prototype.save).toHaveBeenCalledTimes(1);
            expect(res.json).toBeCalledWith(mockResTimetable);
            expect(res.status).toBeCalledWith(201);
        });

        it('DELETE /data/:id : should find and delete the timetable slot using Id ', async () => {

            ResTimetable.findByIdAndDelete = jest.fn();
        
            const req = mockRequest({params: {id: "993452"}});
            const res = mockResponse();

            await router1.stack[6].route.stack[0].handle(req, res);
            
            expect(ResTimetable.findByIdAndDelete).toHaveBeenCalledTimes(1);
            expect(res.json).toBeCalledWith({ message: 'Timetable data deleted successfully' });
            
        });

it('POST /lecturer/:id : should find the timetable slots using lecturer Id ', async () => {
    const mockResTimetables = ([{
        currSemester: {
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
                _id: "609c3",
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
        }]);

        const mockCurrSemester = {
            year: 2024,
            semester: {
                periodIndex: 1,
                periodName: "February - June"
            }
        };

        CurrSemFunction.findOne = jest.fn().mockResolvedValueOnce(mockCurrSemester);
        ResTimetable.find = jest.fn().mockResolvedValueOnce(mockResTimetables);

        const req = mockRequest({body: mockCurrSemester, params: {id: "609c3"}});
        const res = mockResponse();

        await router1.stack[7].route.stack[0].handle(req, res);

        expect(CurrSemFunction.findOne).toHaveBeenCalledTimes(1);
        expect(ResTimetable.find).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(mockResTimetables);

});

            it('POST /specBatch:id : should find the timetable slots using specBatch Id ', async () => {
                const mockResTimetables = ([{
                    currSemester: {
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
                        lecturerName: "Mrs.Geethanjali",
                        email: "geetha@example.com"
                        },
                        specBatches: [
                            {
                                specName: "Software Engineering",
                                year: 2,
                                semester: 3,
                            }
                        ],
                    },
                    lectureHall: {
                        hallid: "LT101",
                        capacity: 50
                    },
                    day: { _id: "2", index: 1, name: "Tuesday" },
                    startTime: { _id: "2", index: 1, name: "10:00 AM" }
                    }]);

                    const mockCurrSemester = {
                        _id: "609c3f7",
                        year: 2024,
                        semester: {
                            periodIndex: 1,
                            periodName: "February - June"
                        }
                    };

                    CurrSemFunction.findOne = jest.fn().mockResolvedValueOnce(mockCurrSemester);
                    ResTimetable.find = jest.fn().mockResolvedValueOnce(mockResTimetables);

                    const req = mockRequest({body: mockCurrSemester, params: {id: mockCurrSemester._id}});
                    const res = mockResponse();

                    await router1.stack[8].route.stack[0].handle(req, res);

                    expect(CurrSemFunction.findOne).toHaveBeenCalledTimes(1);
                    expect(ResTimetable.find).toHaveBeenCalledTimes(1);
                    expect(res.send).toHaveBeenCalledWith(mockResTimetables);

    });

  describe('DELETE ALL API', () => {

        it('DELETE /deleteAll : should find and delete all the timetable slots ', async () => {
            
            ResTimetable.deleteMany = jest.fn();
        
            const req = mockRequest();
            const res = mockResponse();

            await router1.stack[9].route.stack[0].handle(req, res);
            
            expect(ResTimetable.deleteMany).toHaveBeenCalledTimes(1);
            expect(res.status).toBeCalledWith(200);
            
        });

        it('DELETE /deleteAll : should return 500 if an error occurs ', async () => {
            
            ResTimetable.deleteMany = jest.fn().mockRejectedValue(new Error('Internal Server Error'));
        
            const req = mockRequest();
            const res = mockResponse();

            await router1.stack[9].route.stack[0].handle(req, res);
            
            expect(ResTimetable.deleteMany).toHaveBeenCalledTimes(1);
            expect(res.status).toBeCalledWith(500);
            
        });
    });

    it('GET /reset : should reset the reschedule timetable', async () => {
        const mockTimetable = ({
            currSemester: {
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

            const mockCurrSemester = ({
                year: 2024,
                semester: {
                    periodIndex: 1,
                    periodName: "February - June"
                }
            });
        
        CurrSemFunction.findOne = jest.fn().mockResolvedValueOnce(mockCurrSemester);
        Timetable.find = jest.fn().mockResolvedValueOnce(mockTimetable);
        ResTimetable.deleteMany = jest.fn();
        ResTimetable.insertMany = jest.fn().mockResolvedValueOnce(mockTimetable);

    
        const req = mockRequest();
        const res = mockResponse();

        //console.log("Reset route", router1.stack[10]);
        await router1.stack[10].route.stack[0].handle(req, res);

        
        expect(CurrSemFunction.findOne).toHaveBeenCalledTimes(1);
        expect(ResTimetable.deleteMany).toHaveBeenCalledTimes(1);
        expect(ResTimetable.insertMany).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(mockTimetable);
    });

    it('POST /insertData : should create new timetable data baed on the currSemetser', async () => {

        //console.log("routes", router1.stack[11])
        
        const mockResTimetable = ({
        currSemester: {
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

        const mockCurrSemester = ({
            year: 2024,
            semester: {
                periodIndex: 1,
                periodName: "February - June"
            }
        });


        CurrSemFunction.findOne = jest.fn().mockResolvedValueOnce(mockCurrSemester);
        ResTimetable.create = jest.fn().mockResolvedValueOnce(mockResTimetable);

        const req = mockRequest({body: {data: mockResTimetable}});
        const res = mockResponse();

        await router1.stack[11].route.stack[0].handle(req, res);
        
        expect(CurrSemFunction.findOne).toHaveBeenCalledTimes(1);
        expect(ResTimetable.create).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(mockResTimetable);

    });

    it('PUT /lectureHallUpdate/:timetableId : update halls and labs to the generated timeslots', async () => {
        const mockResTimetable = ({
        _id: "609c3",  
        subject: {
            subjectName: "Capstone Project 2",
            subjectCode: "CCP2",
            sessionType: "lecture",
            duration: 1,
            lecturer: {
            lecturerName: "Mrs.Geethanjali",
            email: "geetha@example.com"
            }
        },
        lectureHall: {
         
            hallid: "",
            capacity: 0
        },
        day: { _id: "2", index: 2, name: "Tuesday" },
        startTime: { _id: "2", index: 1, name: "10:00 AM" }
        });

        const mockLectureHall = ({
            lectureHall: {
               
                hallid: "LT102",
                capacity: 50
            },
        })
            

        const mockResUpdatedTimetable = ({
            _id: "609c3",
            subject: {
            subjectName: "Capstone Project 2",
            subjectCode: "CCP2",
            sessionType: "lecture",
            duration: 1,
            lecturer: {
                lecturerName: "Mrs.Geethanjali",
                email: "geetha@example.com"
            }
            },
            lectureHall: {
            hallid: "LT102",
            capacity: 50
            },
            day: { _id: "2", index: 2, name: "Tuesday" },
            startTime: { _id: "2", index: 1, name: "10:00 AM" }
        });
    


        Timetable.findById = jest.fn().mockResolvedValueOnce(mockResTimetable);
        ResTimetable.findOneAndUpdate = jest.fn().mockResolvedValueOnce(mockResUpdatedTimetable);
    
        const req = mockRequest({body: mockLectureHall, params: {id: "609c3"}});
        const res = mockResponse();

        await router1.stack[12].route.stack[0].handle(req, res);
        
        expect(Timetable.findById).toHaveBeenCalledTimes(1);
        expect(ResTimetable.findOneAndUpdate).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(mockResUpdatedTimetable);
        
    });


})












