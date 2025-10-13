export const getRandomColor = (name: string) => {
   const colors = [
      '#f56a00',
      '#7265e6',
      '#ffbf00',
      '#00a2ae',
      '#87d068',
      '#108ee9',
      '#f50',
      '#2db7f5',
      '#87d068',
      '#9c27b0',
      '#e91e63',
      '#ff5722',
      '#795548',
      '#607d8b',
      '#3f51b5',
   ]
   const index = name.charCodeAt(0) % colors.length
   return colors[index]
}
