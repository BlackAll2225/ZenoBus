const Province = require('../models/provinceModel');

const getAll = async () => {
  return await Province.findAll();
};

const getById = async (id) => {
  return await Province.findByPk(id);
};

const create = async (data) => {
  return await Province.create(data);
};

const update = async (id, data) => {
  const province = await Province.findByPk(id);
  if (!province) return null;
  await province.update(data);
  return province;
};

const remove = async (id) => {
  const province = await Province.findByPk(id);
  if (!province) return null;
  await province.destroy();
  return true;
};

module.exports = { getAll, getById, create, update, remove }; 