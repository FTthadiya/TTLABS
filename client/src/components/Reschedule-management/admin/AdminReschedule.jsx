import React, {useState} from "react";
import _, { size } from "lodash";
import AdminResTimetable from "./AdminResTimetable";
import ModuleDropdown from "../common/ModuleDropdown";
import errorIcon from "../../../assets/reschedule-management/select_error_icon.png"
import NotificationBar from "../../NotificationManagement/NotificationBar";


function AdminReschedule({user}) {
   const [selectedModule, setSelectedModule] = useState("");
   const [previewId, setPreviewId] = useState(null);

   const handleSelect = (option) => {
    setSelectedModule(option.subjectCode);
    setPreviewId(null);
  };

  const setPreview = (id) => {
    setSelectedModule("");
    setPreviewId(id);
    console.log("previewId", id);
  }

    return(
        <div className="col d-flex flex-column">
          {user && <NotificationBar setPreviewId={setPreview} setSelectedModule={handleSelect} user={user} data-intro="To view the reschedule request notification"/>}
             <ModuleDropdown onSelect={handleSelect} className="module-dropdown"/> 
               {(selectedModule || previewId) ?
                    <AdminResTimetable previewId={previewId} selectedModule={selectedModule}  /> :
                    <div className="container d-flex flex-column justify-content-center align-items-center" style={{height: "70vh"}}>
                      <img style={{width: "10rem", marginBottom: "2rem"}} src={errorIcon} alt="Error Icon" />
                     
                      <h3 style={{ color: "#000000", fontWeight: "bold", fontSize: "25px", fontStyle: "italic",}}>Looks like there's no timetable here,</h3>
                      <h3 style={{ color: "#000000", fontWeight: "bold", fontSize: "15px", fontStyle: "italic",}}>Select a module to view filtered timetable</h3>

                      

                      
                    </div>
                }  
        </div>  

        
    
    )
}
export default AdminReschedule;
