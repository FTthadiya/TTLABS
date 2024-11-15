import Swal from "sweetalert2";
import { getYear, addYears } from "date-fns";
import "../../Css/currSemUpdate.css";

const CurrSemUpdater = async (actionCallback) => {
  const currentYear = getYear(new Date());
  const nextYear = getYear(addYears(new Date(), 1));

  const yearOptions = {
    [currentYear]: currentYear,
    [nextYear]: nextYear,
  };

  const semOptions = {
    1: "February - June",
    2: "July - November",
  };

  const { value: year } = await Swal.fire({
    title: "Select year",
    input: "radio",
    inputOptions: yearOptions,
    confirmButtonColor: "#ECB753",
    background: "#f0edd4",
    color: "#000",
    customClass: {
      input: "custom-radio-input",
    },
    inputValidator: (value) => {
      if (!value) {
        return "You need to select a year!";
      }
    },
  });

  if (year) {
    const { value: semester } = await Swal.fire({
      title: "Select semester",
      input: "radio",
      inputOptions: semOptions,
      confirmButtonColor: "#ECB753",
      background: "#f0edd4",
      color: "#000",
      customClass: {
        input: "custom-radio-input",
      },
      inputValidator: (value) => {
        if (!value) {
          return "You need to select a semester!";
        }
      },
    });

    if (semester) {
      const result = {
        functionName: "getCurrSemester",
        year: parseInt(year),
        semester: {
          periodIndex: parseInt(semester),
          periodName: semOptions[semester],
        },
      };

      if (actionCallback) {
        actionCallback(result);
      }
    }
  }
};

export default CurrSemUpdater;
