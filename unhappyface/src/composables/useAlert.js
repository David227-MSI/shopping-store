import Swal from 'sweetalert2'

export function useAlert() {
  const success = (title = '成功', text = '') =>
    Swal.fire({ icon: 'success', title, text })

  const error = (title = '失敗', text = '') =>
    Swal.fire({ icon: 'error', title, text })

  const confirm = (title = '確定嗎？', text = '') =>
    Swal.fire({
      icon: 'warning',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: '確定',
      cancelButtonText: '取消'
    })

  return { success, error, confirm }
}