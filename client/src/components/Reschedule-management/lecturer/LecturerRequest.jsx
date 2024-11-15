import React, { useEffect, useState} from "react";
import axios from "axios"
import SuccessAlert from "../../TimeTableManagement/Common/SuccessAlert";
import ModuleDropdown from "../common/ModuleDropdown";
import { getAllTimes } from "../../TimeTableManagement/Services/DaysAndTimeService";
import { getSubjects } from "../../TimeTableManagement/Services/SubjectService";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';

function LecturerRequest ({onClose, selectedCellData, timeTableModule})  { 

const [minDate, setMinDate] = useState('');
const [maxDate, setMaxDate] = useState('');
const [prevStartDate, setPrevStartDate] = useState(null);
const [curStartDate, setCurStartDate] = useState(null);
const [selectedModule, setSelectedModule] = useState(null);
const [times, setTimes] = useState([]);
const [modules, setModules] = useState([]);

const initial = {
    moduleCode: "",
    moduleName: "",
    previousDate: "",
    previousTime: "",
    currentDate: "",
    currentTime: "",
    lecturerName: "",
    sessionType: "",
    specialNotes: "",
    status: ""


}
const [input, setInput] = useState(initial);



    useEffect(() => {
        const today = new Date();
    const dayOfWeek = today.getDay();

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));
    endOfWeek.setHours(23, 59, 59, 999);

    setMinDate(startOfWeek);
    setMaxDate(endOfWeek);
    setInput({...initial})
    }, []);

    

    const initialErrors  = {
        moduleCode: "",
        moduleName: "",
        previousDate: "",
        previousTime: "",
        currentDate: "",
        currentTime: "",
        lecturerName: "",
        sessionType: "",
        specialNotes: ""

    }

    const [errormsg, setErrMsg] = useState(initialErrors);

    useEffect(()=> {
       setInput((prevInput) => ({
            ...prevInput,
            "currentTime": selectedCellData.time.name,
        }))
        console.log(selectedCellData.day);
        console.log(selectedCellData.time);
        fetchTimes();
        fetchModules();
    },[])

    useEffect(() => {
        setModuleData();

    },[modules])

    const fetchTimes = async () => {
        const { data: times } = await getAllTimes();
        setTimes(times);
    }

    const fetchModules = async () => {
        const { data } = await getSubjects();
        setModules(data);
    }

    const handleChange = (e) => {
        const { name, value} = e.target;
        setInput((prevInput) => ({
            ...prevInput,
            [name]: value,
        }))
    }

    function formatDateToISO(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-based month
        const day = String(date.getDate()).padStart(2, '0');
      
        return `${year}-${month}-${day}`;
      }

    const handleDateChange = (date, name) => {
        setInput((prevInput) => ({
            ...prevInput,
            [name]: formatDateToISO(date),
        }))
    }

    const setModuleData = () => {

        if(timeTableModule)
            {
                const module = modules.find(m => m.subjectCode == timeTableModule);

                console.log("modules", modules);
                console.log("selectedModule", timeTableModule)

                if(module)
                {
                    setInput((prevInput) => ({
                        ...prevInput,
                        moduleCode: module.subjectCode,
                        moduleName: module.subjectName,
                        lecturerName: module.lecturer.lecturerName,
                      }));
            
                      setSelectedModule(module);
                }
                
            }

        
    }

    const handleModuleSelect = (module) => {

        setInput((prevInput) => ({
            ...prevInput,
            moduleCode: module.subjectCode,
            moduleName: module.subjectName,
            lecturerName: module.lecturer.lecturerName,
          }));

          setSelectedModule(module);
    }

    const handleClick = (e) => {
        e.preventDefault();
        console.log("Send Request Clicked", input);

        if(selectedModule.subjectCode !== timeTableModule)
            {
                alert("Please select same module as timetable")
                return;
            }
        
        if(validate()){

        const module = modules.find(m => m.subjectCode === selectedModule.subjectCode && m.sessionType == input.sessionType);

        const prevStartTime = times.find(time => time.name === input.previousTime);
        const prevEndTimeIdx = prevStartTime.index + module.duration;
        var prevEndTime = {name: "17:30"}
        if(prevEndTimeIdx < 10)
        {
             prevEndTime = times.find(time => time.index === prevEndTimeIdx);
        }
        if(!prevEndTime || prevEndTimeIdx > 10)
        {
                setError("previousTime", "Previous lecture end time exceeds limit")
                return;
        }
        const prevTime = `${prevStartTime.name} - ${prevEndTime.name}`

        const curStartTime = times.find(time => time.name === input.currentTime);
        const curEndTimeIdx = curStartTime.index + module.duration;
        var curEndTime = {name: "17:30"};
        if (curEndTimeIdx < 10) {
            curEndTime = times.find(time => time.index === curEndTimeIdx);
        }
        if(!curEndTime || curEndTimeIdx > 10)
            {
                setError("currentTime", "Current lecture end time exceeds limit")
                return;
            }
        const curTime = `${curStartTime.name} - ${curEndTime.name}`

        const data = {...input, previousTime: prevTime, currentTime: curTime, timeTableModule: timeTableModule };

        console.log("data", data)

            axios.post("http://localhost:3001/api/saveRequest", data)

            .then(response => {
                console.log("Request saved successfully!!", response.data);
                SuccessAlert("Request sent successfully.");
                setInput(initial);
            })
            .catch(error => {
                console.error("Error saving request:", error);
                if(error.response.data.error)
                {
                    alert(error.response.data.error)
                }
            })
        onClose();

        }
    
    }

    const validate = () =>{
        let isValid = true;
        if(input.moduleCode.trim().length === 0 || input.moduleCode === ""){
            isValid = false;
           setError("moduleCode", "Module Code cannot be empty")
        }else {
            setError("moduleCode", "")
        }
        if(input.moduleName.trim().length === 0 || input.moduleName === ""){
            isValid = false;
           setError("moduleName", "* Module Name cannot be empty")
        }else {
            setError("moduleName", "")
        }
        if (input.sessionType.trim().length === 0 || input.sessionType === ""){
            isValid = false;
           setError("sessionType", "SessionType cannot be empty")
        }else {
            setError("sessionType", "")
        }
        if (input.lecturerName.trim().length === 0 || input.lecturerName === ""){
            isValid = false;
           setError("lecturerName", "LecturerName cannot be empty")
        }else {
            setError("lecturerName", "")
        }
        if (input.previousDate.trim().length === 0 || input.previousDate === ""){
            isValid = false;
           setError("previousDate", "PreviousDate cannot be empty")
        }else {
            setError("previousDate", "")
        }
         if(input.previousTime.trim().length === 0 || input.previousTime === "") {
            isValid = false;
           setError("previousTime", "Incorrect time format")
        }else {
            setError("previousTime", "")
        }
        if (input.currentDate.trim().length === 0 || input.currentDate === ""){
            isValid = false;
           setError("currentDate", "CurrentDate cannot be empty")
        }else {
            setError("currentDate", "")
        }
        if(input.currentTime.trim().length === 0 || input.currentTime === "") {
            isValid = false;
           setError("currentTime", "Incorrect time format")
        }else {
            setError("currentTime", "")
        }
        if (input.specialNotes.trim().length !== "" && input.specialNotes.length > 100){
            isValid = false;
           setError("specialNotes", "Special Notes must be between 10 and 100 characters")
        }else {
            setError("specialNotes", "")
        }
        return isValid;
        
    }

    const setError = (key, msg) =>{
        setErrMsg((prevState)=> ({

            ...prevState,
            [key]: msg,
        }))
    }


    const handleClose = (e) => {
        e.preventDefault();
        setInput(initial);
        console.log("Cancel Clicked!!")
        onClose();
    }


   
    return (
        <div className="container">
           <form>
            <main className="card shadow position-fixed top-50 start-50 translate-middle p-4" style={{ width: '30%', padding: '10px', backgroundColor: "#F0EDD4", color: "#000000", border: "2px solid #F0EDD4" }}>
                
                    <h5 className="card-title text-center fw-bold mb-4">Reschedule Request</h5>
                    <div className="card-body row">
                    <div className="form-group col-md-6 mb-2">
                        <label className="mb-1">Module Code</label>
                        <ModuleDropdown light noPadding onSelect={handleModuleSelect} value={selectedModule ? selectedModule.subjectCode : selectedCellData.moduleCode}/>
                        <span style={{ color: "#E72929" }}>{errormsg.moduleCode}</span>
                        </div>
                        <div className="form-group col-md-6 mb-2">
                        <label className="mb-1">Module Name</label>
                      <input
                        className="form-control"
                        placeholder="Module Name"
                        name="moduleName"
                        value={input.moduleName}
                        onChange={handleChange}
                         />
                        <span style={{ color: "#E72929" }}>{errormsg.moduleName}</span>
                        </div>
                        <div className="form-group col-md-6 mb-2">
                            <label>Lecturer Name</label>
                                <input type="text" className="form-control" placeholder="Lecturer Name" name="lecturerName" value={input.lecturerName} onChange={handleChange} style={{ width: "100%" }} />
                                <span style={{ color: "#E72929" }}>{errormsg.lecturerName}</span>
                        
                        </div>
                        <div className="form-group col-md-6 mb-2">
                        <label>Session Type</label>
                        <select className="form-select" name="sessionType" value={input.sessionType} onChange={handleChange} >
                            <option value="">Session Type</option>
                            <option value="Lecture">Lecture</option>
                            <option value="Lab">Lab</option>
                            <option value="Tute">Tute</option>
                            <option value="Workshop">Workshop</option>
                            <option value="Seminar">Seminar</option>
                        </select>
                        <span style={{ color: "#E72929" }}>{errormsg.sessionType}</span>
                        </div>
                        <div className="form-group col-md-6 mb-2">
                        <label className="mb-1">Previous Date</label>
                        <DatePicker
                            id="week-date-picker"
                            className="form-control"
                            name="previousDate"
                            placeholderText="Pick a date"
                            selected={prevStartDate}
                            onChange={(date) => {setPrevStartDate(date); handleDateChange(date, "previousDate")}}
                            minDate={minDate}
                            maxDate={maxDate}
                            filterDate={(date) => date >= minDate && date <= maxDate}
                            dateFormat="yyyy-MM-dd"
                        />
                         <span style={{ color: "#E72929" }}>{errormsg.previousDate}</span>
                        </div>
                        <div className="form-group col-md-6 mb-2">
                        <label>Previous Time</label>
                        <select type="previousTime" className="form-control" placeholder="00:00 - 00:00"
                        name="previousTime" value={input.previousTime} onChange={handleChange}>
                            <option value={""}>Select time</option>
                            {times.map((time, index) => {
                                return <option key={index} value={time.name}>{time.name}</option>
                            })}
                        </select>
                        <span style={{ color: "#E72929" }}>{errormsg.previousTime}</span>
                        </div>
                        <div className="form-group col-md-6 mb-2">
                        <label className="mb-1">Current Date</label>
                        <DatePicker
                            id="week-date-picker"
                            className="form-control"
                            name="currentDate"
                            placeholderText="Pick a date"

                            selected={curStartDate}
                            onChange={(date) => {setCurStartDate(date); handleDateChange(date, "currentDate")}}
                            minDate={minDate}
                            maxDate={maxDate}
                            filterDate={(date) => date >= minDate && date <= maxDate}
                            dateFormat="yyyy-MM-dd"
                        />
                         <span style={{ color: "#E72929" }}>{errormsg.currentDate}</span>
                        </div>
                        <div className="form-group col-md-6 mb-2">
                        <label>Current Time</label>
                        <select type="currentTime" className="form-control" placeholder="Current Time"
                        name="currentTime" value={input.currentTime} onChange={handleChange} > 
                        <option value={""}>Select time</option>
                        {times.map((time,index) => {
                                return <option key={index} value={time.name}>{time.name}</option>
                            })}
                        </select>
                        <span style={{ color: "#E72929" }}>{errormsg.currentTime}</span>
                        </div>
                        <div className="form-group col-md-12 mb-2">
                        <label >Special Notes</label>
                        <textarea rows={4} type="specialNotes" className="form-control"placeholder="Special Notes"
                        name="specialNotes" value={input.specialNotes} onChange={handleChange}  />
                         <span style={{ color: "#E72929" }}>{errormsg.specialNotes}</span>
                        </div>

                        
                        <div className="form-row">
                            <div className="form-group mt-5 d-flex justify-content-between">
                                <button type="button" onClick={handleClose} className="btn btn-secondary" style={{ background: "linear-gradient(to right, #FFFFFF, #FFE9B1)", borderWidth: 0, color: "#000000", fontWeight: "bold", minWidth: '6rem' }}>Cancel</button>
                                <button type="submit" onClick={handleClick} className="btn btn-secondary" style={{ background: "linear-gradient(to right, #FFFFFF, #FFE9B1)", borderWidth: 0, color: "#000000", fontWeight: "bold",  minWidth: '6rem'}}>Send Request</button>
                                
                            </div>
                        </div>
                    </div>
                </main>
            </form>
           
        </div>
    )
       
}

export default LecturerRequest;