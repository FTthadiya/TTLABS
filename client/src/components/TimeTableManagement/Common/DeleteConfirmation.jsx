import Swal from "sweetalert2";

const DeleteConfirmation = (
  actionCallback,
  message = "This action may impact other areas of the application."
) => {
  Swal.fire({
    title: "Are you sure?",
    text: message,
    icon: "warning",
    showCancelButton: true,
    background: "#f0edd4",
    color: "#000",
    confirmButtonColor: "#ECB753",
    cancelButtonColor: "#dc3545",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      actionCallback && actionCallback();
      Swal.fire({
        title: "Deleted!",
        text: "Your data has been deleted.",
        icon: "success",
        background: "#f0edd4",
        color: "#000",
        confirmButtonColor: "#ECB753",
      });
    }
  });
};

export default DeleteConfirmation;
