export function phoneValidator(phone) {
    const re = /^\d{10}$/
    if (!phone) return "Phone can't be empty."
    if (!re.test(phone)) return 'Ooops! Phone must be a 10-digit number.'
    return ''
  }