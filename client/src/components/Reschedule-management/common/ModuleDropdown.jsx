import React, {useState, useEffect, useRef} from "react";
import axios from "axios";
import "../css/theme.css";


function ModuleDropdown ({ onSelect, value, light, noPadding}) {
    const [module, setModule] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedModule, setSelectedModule] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [filteredModules, setFilteredModules] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef(null);

    useEffect(() => {
        fetchFilterModules();
    }, []);

    useEffect(() => {
      const handleArrowNavigation = (e) => {

        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const increment = e.key === "ArrowDown" ? 1 : -1;
          let newIndex = selectedIndex + increment;
          if (newIndex < 0) {
            newIndex = filteredModules.length - 1; 
          } else if (newIndex >= filteredModules.length) {
            newIndex = 0; 
          }
          setSelectedIndex(newIndex)
        } else if (e.key === "Enter" && selectedIndex !== -1) {
          handleSelect(filteredModules[selectedIndex]);
        }
      };
    
      window.addEventListener("keydown", handleArrowNavigation);
    
      return () => {
        window.removeEventListener("keydown", handleArrowNavigation);
      };
    }, [selectedIndex, filteredModules]);
    

    useEffect(() => {
      const handleArrowNavigation = (e) => {

        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const increment = e.key === "ArrowDown" ? 1 : -1;
          let newIndex = selectedIndex + increment;

          if (newIndex < 0) {
            newIndex = filteredModules.length - 1;
          } else if (newIndex >= filteredModules.length) {
            newIndex = 0;
          }
          setSelectedIndex(newIndex)
        } else if (e.key === "Enter" && selectedIndex !== -1) {
          handleSelect(filteredModules[selectedIndex]);
        }
      };
    
      window.addEventListener("keydown", handleArrowNavigation);
    
      return () => {
        window.removeEventListener("keydown", handleArrowNavigation);
      };
    }, [selectedIndex, filteredModules]);
    
    
    const fetchFilterModules = async () => {
        try{
            axios.get("http://localhost:3001/api/subjects").then((response) => {
                setModule(response.data);
            })
    
        } catch(error){
            console.error('Error fetching filter modules', error);
    
        }
        
    }
    
    const handleSelect = (module) => {
        setInputValue(module.subjectCode);
        onSelect(module);
        setShowSuggestions(false);
    }; 

    const handleInputChange = (e) => {
        const input = e.target.value;
        setInputValue(input);
        const filtered = module.filter((modules,index,self) => {
            const isUnique = self.findIndex(item => item.subjectCode === modules.subjectCode) === index;
         const matchesKeyword = modules.subjectCode.toLowerCase().includes(input.toLowerCase());
         return isUnique && matchesKeyword;
    });
        setFilteredModules(filtered);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      };

      const handleSuggestionHover = (index) => {
        setSelectedIndex(index);
      };

    return (
        <div className="container" style={{padding: noPadding ? "0" : ""}}>
        <div style={{ maxWidth: "200px", position: 'relative'}}>
        
        <input
          type="text"
          value={value ? value : inputValue}
          onChange={handleInputChange}
          disabled={value}
          placeholder="Search Module"
          className={`form-control ${!light && 'dark-dropdown'}`}
          style={{ paddingRight: noPadding ? "" : "25px", backgroundColor: light ? "#ffffe0" : "#353535" , color: light ? "#353535" :  "#ffffe0" }}
          data-intro="Select a module from the dropdown."
        />
        {inputValue !== "" && showSuggestions && <div style={{zIndex: '100', width:'100%',backgroundColor: '#fcf5e4',borderRadius: '10px',padding: '1rem', position: 'absolute', bottom: '100'}}>
          {filteredModules.map((module, index) => (
            <div
              key={module._id}
              onClick={() => handleSelect(module)}
              onMouseEnter={() => handleSuggestionHover(index)}
              className={`suggestion-item ${index === selectedIndex ? "selected" : ""}`}

              style={{ cursor: "pointer", margin: '1rem', backgroundColor: index === selectedIndex ? "#ccc" : "transparent", borderRadius: index === selectedIndex ? "5px" : "0px", // Adjust the border radius as desired
              padding: "0.5rem 1rem", fontWeight: index === selectedIndex ? "bold" : "normal",
              color: index === selectedIndex ? "white" : "black" }} 
            >
              {module.subjectCode}
            </div>
          ))}
        </div>}

        
        </div>
        </div>
    )

}

export default ModuleDropdown;
