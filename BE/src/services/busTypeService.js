const BusType = require('../models/BusTypeModel');

const getAll = async () => {
  return await BusType.findAll();
};

const getById = async (id) => {
  return await BusType.findByPk(id);
};

const create = async (data) => {
  // Kiểm tra trùng tên loại xe
  const existed = await BusType.findOne({ where: { name: data.name } });
  if (existed) throw new Error('Tên loại xe đã tồn tại');
  return await BusType.create(data);
};

const update = async (id, data) => {
  const busType = await BusType.findByPk(id);
  if (!busType) return null;
  // Nếu cập nhật tên, kiểm tra trùng
  if (data.name && data.name !== busType.name) {
    const existed = await BusType.findOne({ where: { name: data.name } });
    if (existed) throw new Error('Tên loại xe đã tồn tại');
  }
  await busType.update(data);
  return busType;
};

const remove = async (id) => {
  const busType = await BusType.findByPk(id);
  if (!busType) return null;
  await busType.destroy();
  return true;
};

module.exports = { getAll, getById, create, update, remove }; 