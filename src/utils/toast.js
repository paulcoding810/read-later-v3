import Swal from 'sweetalert2'

const toast = (options) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    didOpen: (_toast) => {
      _toast.addEventListener('mouseenter', Swal.stopTimer)
      _toast.addEventListener('mouseleave', Swal.resumeTimer)
    },
  })

  Toast.fire({
    customClass: {
      container: 'swal2-small',
    },
    ...options,
  })
}

export default toast
