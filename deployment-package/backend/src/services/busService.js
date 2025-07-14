const Bus = require('../models/BusModel');
const BusType = require('../models/BusTypeModel');

const getAll = async () => {
  return await Bus.findAll({ include: [{ model: BusType, as: 'busType' }] });
};

const getById = async (id) => {
  return await Bus.findByPk(id, { include: [{ model: BusType, as: 'busType' }] });
};

const create = async (data) => {
  // Kiểm tra trùng biển số xe
  const existed = await Bus.findOne({ where: { licensePlate: data.licensePlate } });
  if (existed) throw new Error('Biển số xe đã tồn tại');
  return await Bus.create(data);
};

const update = async (id, data) => {
  const bus = await Bus.findByPk(id);
  if (!bus) return null;
  // Nếu cập nhật biển số, kiểm tra trùng
  if (data.licensePlate && data.licensePlate !== bus.licensePlate) {
    const existed = await Bus.findOne({ where: { licensePlate: data.licensePlate } });
    if (existed) throw new Error('Biển số xe đã tồn tại');
  }
  await bus.update(data);
  return await Bus.findByPk(id, { include: [{ model: BusType, as: 'busType' }] });
};

const remove = async (id) => {
  const bus = await Bus.findByPk(id);
  if (!bus) return null;
  await bus.destroy();
  return true;
};

module.exports = { getAll, getById, create, update, remove }; 