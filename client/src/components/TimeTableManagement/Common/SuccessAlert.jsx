import Swal from "sweetalert2";
import "../Css/button.css";

const SuccessAlert = (message) => {
  Swal.fire({
    title: "Success!",
    text: message,
    icon: "success",
    confirmButtonColor: "#ECB753",
    background: "#f0edd4",
    color: "#000",
  });
};

export default SuccessAlert;
