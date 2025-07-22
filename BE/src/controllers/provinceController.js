const provinceService = require('../services/provinceService');

const getAll = async (req, res) => {
  const provinces = await provinceService.getAll();
  return res.success(provinces, 'Lấy danh sách tỉnh/thành công');
};

const getById = async (req, res) => {
  const province = await provinceService.getById(req.params.id);
  if (!province) return res.notFound('Không tìm thấy tỉnh/thành');
  return res.success(province, 'Lấy thông tin tỉnh/thành công');
};

const create = async (req, res) => {
  const { name, code } = req.body;
  if (!name || !code) return res.validationError('Thiếu name hoặc code', ['name', 'code']);
  const province = await provinceService.create({ name, code });
  return res.created(province, 'Tạo tỉnh/thành công');
};

const update = async (req, res) => {
  const { name, code } = req.body;
  const province = await provinceService.update(req.params.id, { name, code });
  if (!province) return res.notFound('Không tìm thấy tỉnh/thành');
  return res.success(province, 'Cập nhật tỉnh/thành công');
};

const remove = async (req, res) => {
  const ok = await provinceService.remove(req.params.id);
  if (!ok) return res.notFound('Không tìm thấy tỉnh/thành');
  return res.success(null, 'Xóa tỉnh/thành công');
};

module.exports = { getAll, getById, create, update, remove };
