import React, { useState, useEffect} from "react";
import axios from "axios";
import { getDays, getAllTimes } from "../../TimeTableManagement/Services/DaysAndTimeService";
import SuccessAlert from "../../TimeTableManagement/Common/SuccessAlert";
import { getSubjects } from "../../TimeTableManagement/Services/SubjectService";
import ModuleDropdown from "../common/ModuleDropdown";
import { resAssignHall, resDeleteAssignHall } from "../../LabHall-Management/halls/ResAssignHall";
import { resAssignLab, resDeleteAssignLab } from "../../LabHall-Management/labs/ResAssignLab";

export const AdminResEdit = ({selectedCellData,onClose,updateData}) => { 

  const [days, setDays] = useState([]);
  const [times, setTimes] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [selectedLecturer, setSelectedLecturer] = useState("");
  const [selectedModule, setSelectedModule] = useState([]);
  const [halls, setHalls] = useState([]);
  const [selectedHall, setSelectedHall] = useState("");


    const initial = {
        moduleCode:"",
        module: "",
        lecturerName: "",
        sessionType: "",
        duration:"",
        hall:"",
        newDate: "",
        newTime: "",

    }
    const [input, setInput] = useState(initial);
    console.log("selectedCelldata", selectedCellData);

    const initialErrors = {
        moduleCode:"",
        module: "",
        lecturerName: "",
        sessionType: "",
        duration:"",
        hall:"",
        
    }

    const [errormsg, setErrMsg] = useState(initialErrors);

    useEffect(() => {
        if (selectedCellData) {
          setInput({
            
            moduleCode: selectedCellData.moduleCode || "",
            module: selectedCellData.module || "",
            duration: "",
            lecturerName: selectedCellData.lecturerName || "",
            sessionType: selectedCellData.sessionType || "",
            hall: selectedCellData.hall || "",
            newDate: selectedCellData.day.name || "",
            newTime: selectedCellData.time.name || "",

          });
          
          setSelectedLecturer(selectedCellData.lecturerName || "");
        } else {
          setInput(initial);
        }
      }, [selectedCellData]);

      console.log("where is currsemester", selectedCellData)

      useEffect(() => {
        const fetchDaysTimes = async () => {
          await handleRenderDaysAndTimes();
        };
        fetchDaysTimes();
        fetchLectureHall();
        fetchLecturers();
      }, []);


      const handleRenderDaysAndTimes = async () => {
        try {
          const { data: days } = await getDays();
          setDays(days);
    
          const { data: times } = await getAllTimes();
          setTimes(times);
        } catch (error) {
          console.log(error);
        }
      };

   

    
    const fetchLecturers= async () => {
        try{
            axios.get("http://localhost:3001/api/lecturers").then((response) => {
                setLecturers(response.data);
                
            })
    
        } catch(error){
            console.error('Error fetching filter modules', error);
    
        }
        
    }

      const handleLecturerSelect = (e) => {
        const selectedOption = e.target.value;
    
        setSelectedLecturer(selectedOption);
       
    }

    const fetchLectureHall= async () => {
        try{
            axios.get("http://localhost:3001/api/hall/getHalls").then((response) => {
                setHalls(response.data);
                console.log("response", response.data);
            })
    
        } catch(error){
            console.error('Error fetching filter modules', error);
    
        }
        
    }

      const handleLectureHallSelect = (e) => {
        const selectedOption = e.target.value;
        setSelectedHall(selectedOption);
       
    }
    

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prevInput) => ({
      ...prevInput,
      [name]: value,
    }));
  };

  const assignLectureHall = async(timetable) => {

    if(timetable.subject.sessionType !== "Lab")
        {
            if(timetable.lectureHall !== null && timetable.lectureHall.hallId !== "" && timetable.lectureHall.hallId !== " ")
              {
                await resDeleteAssignHall(timetable.lectureHall._id);
              }
            const msg = await resAssignHall(timetable);
            console.log("Lecturehall assign: ", msg);

        }
        else{
          if(timetable.lectureHall !== null && timetable.lectureHall.hallId !== "" && timetable.lectureHall.hallId !== " ")
            {
              await resDeleteAssignLab(timetable.lectureHall._id);
            }
          const msg = await resAssignLab(timetable);
          console.log("Lab assign: ", msg);
        }
  }


  const handleClick = (e) => {
    e.preventDefault();
    console.log("session type", input.sessionType);
               
        if(selectedCellData.updateId) {

            const day = days.filter((d) => d.name === input.newDate)
            
            const time = times.filter((t) => t.name === input.newTime)

            const lecturer = lecturers.filter((l) => l.lecturerName === selectedLecturer)
            // const hall = halls.filter((h) =>h.hallid === selectedHall )

            const newData = {
                currSemester: selectedCellData.currSemester,
                subject: {
                    subjectName: input.module,
                subjectCode: input.moduleCode,
                sessionType: input.sessionType,
                studentCount: selectedCellData.studentCount,
                duration: input.duration,
                lecturer: lecturer[0],
                specBatches: selectedCellData.specBatches,
                },
                day: day[0],
                startTime: time[0],
            }
            console.log("if condition", newData)
            
            if(day.length === 0 || time.length === 0){
                alert("day/time format invalid")
            }else{

            if(validate()){
                axios.put("http://localhost:3001/api/resTimetable/data/" + selectedCellData.updateId, newData)
                .then((response) => {
                console.log("Data added successfully:", response.data);
                SuccessAlert("Data saved successfully.");
                setInput(initial);
                onClose(); 
                updateData();

                const timetable = response.data
                assignLectureHall(timetable);
                
                })
                .catch((error) => {
                console.error("Error adding data:", error);
                })
            }
            }

            
    

        }else {

            const day = days.filter((d) => d.name === input.newDate)
            
            const time = times.filter((t) => t.name === input.newTime)

            const lecturer = lecturers.filter((l) => l.lecturerName === selectedLecturer)
            // const hall = halls.filter((h) =>h.hallid === selectedHall )



            const newData = {
                currSemester: 
                    selectedCellData.currSemester || null,
                subject: {
                    subjectName: input.module,
                subjectCode: input.moduleCode,
                sessionType: input.sessionType,
                studentCount: selectedModule.studentCount,
                duration: input.duration,
                lecturer: lecturer[0],
                specBatches: selectedModule.specBatches,

                },
                day: day[0],
                startTime: time[0],
            }
            console.log("else condition: ", newData)
            if(validate()){
                axios.post("http://localhost:3001/api/resTimetable/data", newData)
                .then((response) => {
                    console.log("Data added successfully", response.data);
                    SuccessAlert("Data saved successfully.");
                    setInput(initial);
                    onClose();
                updateData();

              const timetable = response.data
              assignLectureHall(timetable);
                })
                .catch((error) => {
                    console.error("error adding data", error)
                });
             }
        }
    
    }

    const setError = (key, msg) =>{
        setErrMsg((prevState)=> ({
            ...prevState,
            [key]: msg,
        }))
    }

    const validate = () =>{
        let isValid = true;
        if(input.moduleCode.trim() === 0 || input.moduleCode === ""){
            isValid = false;
           setError("moduleCode", "ModuleCode cannot be empty")
        }else {
            setError("moduleCode", "")
        }
        if(input.module.trim() === 0 || input.module === ""){
            isValid = false;
           setError("module", "Module cannot be empty")
        }else {
            setError("module", "")
        }
        if (input.sessionType.trim() === 0 || input.sessionType === ""){
            isValid = false;
           setError("sessionType", "SessionType cannot be empty")
        }else {
            setError("sessionType", "")
        }
        if (selectedLecturer.trim().length === 0 || selectedLecturer === ""){
            isValid = false;
           setError("lecturerName", "LecturerName cannot be empty")
        }else {
            setError("lecturerName", "")
        }
        if (input.duration.trim().length === 0 || input.duration === ""){
            isValid = false;
           setError("duration", "Duration cannot be empty")
        }else {
            setError("duration", "")
        }
        return isValid;
        
            
    }
    const handleClose = (e) => {
        e.preventDefault();
        setInput(initial);
        console.log("Cancel Clicked!!")
        onClose();
    }

    const handleDelete = (e) => {
        e.preventDefault();
        if (selectedCellData.updateId) {
            axios.delete("http://localhost:3001/api/resTimetable/data/" + selectedCellData.updateId)
                .then((response) => {
                    console.log("Data deleted successfully:", response.data);
                    onClose();
                    updateData();
                })
                .catch((error) => {
                    console.error("Error deleting data:", error);
                });
        }
    }

    const handleModuleSelect = (module) => {
        setInput((prevInput) => ({
            ...prevInput,
            moduleCode: module.subjectCode,
            module: module.subjectName,
            lecturerName: module.lecturer.lecturerName,

          }));

          setSelectedLecturer(module.lecturer.lecturerName);
          setSelectedModule(module);
          console.log("module", module)
    }



    
    return (
        <div className="container">
           <form>
            <main className="card shadow position-fixed top-50 start-50 translate-middle p-4" style={{ width: '30%', padding: '10px', backgroundColor: "#F0EDD4" , color: "#000000", border: "2px solid #F0EDD4" }}>
                
                    <h5 className="card-title text-center fw-bold">Reschedule Form</h5>
                    <div className=" card-body row">
                    <div className="form-group col-md-6 py-3">
                        <label>Module Code
                        <ModuleDropdown light noPadding onSelect={handleModuleSelect} value={selectedCellData.moduleCode}/>
                        </label>
                        
                    </div>
                    <div className="form-group col-md-6 py-3">
                        <label>Module
                            </label>
                        <input type="module" className="form-control" placeholder="Module" disabled
                        name="module" value={input.module} onChange={handleChange} />
                        <span style={{ color: "#E72929" }}>{errormsg.module}</span>
                    </div>
                    <div className="form-group col-md-6 py-2">
                        <label>Session Type</label>
                        <select className="form-select" name="sessionType" value={selectedCellData.sessionType ? selectedCellData.sessionType : input.sessionType} onChange={handleChange} disabled={selectedCellData.sessionType}>
                           
                            <option value="">Select Type</option>
                            <option value="Lecture">Lecture</option>
                            <option value="Lab">Lab</option>
                            <option value="Tute">Tute</option>
                            <option value="Workshop">Workshop</option>
                            <option value="Seminar">Seminar</option>
                        </select>
                        <span style={{ color: "#E72929" }}>{errormsg.sessionType}</span>
                    </div>
                    <div className="form-group col-md-6 py-2">
                        <label>Duration</label>
                        <input type="number"  min="1" className="form-control" placeholder="Duration"
                        name="duration" value={input.duration} onChange={handleChange} />
                        <span style={{ color: "#E72929" }}>{errormsg.duration}</span>
                    </div>
                    <div className="form-group col-md-12 py-3" style={{  }}>
                    {selectedCellData.hall && <div>
                        <label>Hall</label>
                        <select
                            value={selectedCellData.hall ? selectedCellData.hall : selectedHall.hallid}
                            onChange={handleLectureHallSelect}
                            className="form-select"
                            style={{ paddingRight: "25px", width: '100%'}}
                            disabled={selectedCellData.hall}
                            >
                            <option value="">Select Hall</option>
                            {halls.map((hall) => (
                                <option key={hall._id} value={hall.hallid}>
                                {hall.hallid}
                                </option>
                            ))}
                        </select>
                        <span style={{ color: "#E72929" }}>{errormsg.hall}</span>
                    </div>}
                    </div>
                    <div className="form-group col-md-12 py-3" style={{  }}>
                        <label >Lecturer Name </label>
                        <select
                            value={selectedCellData.lecturerName ? selectedCellData.lecturerName : selectedLecturer}
                            onChange={handleLecturerSelect}
                            className="form-select"
                            style={{ paddingRight: "25px"}}
                            disabled={selectedCellData.lecturerName}
                            name="lecturerName"
                            >
                            <option value="">Select Lecturer</option>
                            {lecturers.map((lecturer) => (
                                <option key={lecturer._id} value={lecturer.lecturerName}>
                                {lecturer.lecturerName}
                                </option>
                            ))}

                        </select>
                        <span style={{ color: "#E72929" }}>{errormsg.lecturerName}</span>
                    </div>   
                    <div className="form-group col-md-6 py-3">
                        <label>New Date</label>
                        <select type="newDate" className="form-control" placeholder="New Date"
                        name="newDate" value={input.newDate} onChange={handleChange} >
                            {days.map((day) => (
                                <option key={day._id} value={day.name}>
                                {day.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group col-md-6 py-3">
                        <label>New Time</label>
                        <select type="newTime" className="form-control" placeholder="newTime"
                        name="newTime" value={input.newTime} onChange={handleChange} >
                            {times.map((time) => (
                                <option key={time._id} value={time.name}>
                                {time.name}
                                </option>
                            ))}
                            </select>
                    </div>
                    <div className="form-row">
                    <div className="form-group mt-5 d-flex justify-content-between">
                    
                        <button type="cancel" onClick={handleClose} className="btn btn-primary" style={{ background: "linear-gradient(to right, #FFFFFF, #FFE9B1)", borderWidth: 0, color: "#000000", fontWeight: "bold", minWidth: '6rem'}}>Cancel</button>
                        <button type="submit" onClick={handleClick} className="btn btn-primary" style={{ background: "linear-gradient(to right, #FFFFFF, #FFE9B1)", borderWidth: 0, color: "#000000", fontWeight: "bold", minWidth: '6rem'}}>Add</button>
                        <button type="submit" onClick={handleDelete} className="btn btn-primary" style={{ background: "linear-gradient(to right, #FFFFFF, #FFE9B1)", borderWidth: 0, color: "#000000", fontWeight: "bold", minWidth: '6rem'}}>Delete</button>
                    </div>
                    </div>
                </div>
            </main>
           </form>
           
        </div>
    
    )
}