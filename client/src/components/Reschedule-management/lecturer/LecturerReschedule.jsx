import React, {useState} from "react";
import _ from "lodash";
import LecResTimetable from "./LecResTimetable"
import ModuleDropdown from "../common/ModuleDropdown";
import NotificationBar from "../../NotificationManagement/NotificationBar";


function LecturerReschedule({user}) {
   const [selectedModule, setSelectedModule] = useState("");

   const handleSelect = (option) => {
    setSelectedModule(option.subjectCode);
  };


    return (
        <div className="col d-flex flex-column">
          <div
            className="container-fluid d-flex justify-content-end"
            style={{ paddingBottom: 10, paddingTop: 20 }}
          ></div>
            {user && <NotificationBar user={user}/>}
            <ModuleDropdown onSelect={handleSelect} />
               {selectedModule && 
                    <LecResTimetable selectedModule={selectedModule}  />}
        </div>  
            
    )
   
}
export default LecturerReschedule;
