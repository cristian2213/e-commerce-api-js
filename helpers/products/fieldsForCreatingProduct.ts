const fieldsForCreatingProduct = () => {
  const requiredFields = [
    {
      type: 'select',
      label: 'Name',
    },
    {
      type: 'select',
      label: 'Title',
    },
    {
      type: 'select',
      label: 'Description',
    },
    {
      type: 'select',
      label: 'Name',
    },
    {
      type: 'select',
      label: 'Stock',
    },
  ];
  return requiredFields;
};

module.exports = fieldsForCreatingProduct;
