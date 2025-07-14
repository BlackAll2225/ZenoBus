const busTypeService = require('../services/busTypeService');

const getAll = async (req, res) => {
  const types = await busTypeService.getAll();
  return res.success(types, 'Lấy danh sách loại xe thành công');
};

const getById = async (req, res) => {
  const type = await busTypeService.getById(req.params.id);
  if (!type) return res.notFound('Không tìm thấy loại xe');
  return res.success(type, 'Lấy thông tin loại xe thành công');
};

const create = async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.validationError('Thiếu tên loại xe', ['name']);
  try {
    const type = await busTypeService.create({ name, description });
    return res.created(type, 'Tạo loại xe thành công');
  } catch (err) {
    if (err.message === 'Tên loại xe đã tồn tại') {
      return res.error(err.message, 400);
    }
    return res.serverError(err.message);
  }
};

const update = async (req, res) => {
  const { name, description } = req.body;
  try {
    const type = await busTypeService.update(req.params.id, { name, description });
    if (!type) return res.notFound('Không tìm thấy loại xe');
    return res.success(type, 'Cập nhật loại xe thành công');
  } catch (err) {
    if (err.message === 'Tên loại xe đã tồn tại') {
      return res.error(err.message, 400);
    }
    return res.serverError(err.message);
  }
};

const remove = async (req, res) => {
  const ok = await busTypeService.remove(req.params.id);
  if (!ok) return res.notFound('Không tìm thấy loại xe');
  return res.success(null, 'Xóa loại xe thành công');
};

module.exports = { getAll, getById, create, update, remove }; 