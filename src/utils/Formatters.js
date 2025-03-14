export const formatDate = (dateString) => {
    if (!dateString) return "N/A"
  
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }
  
  export const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "N/A"
  
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }
  
  