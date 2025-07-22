const busService = require('../services/busService');

const getAll = async (req, res) => {
  const buses = await busService.getAll();
  return res.success(buses, 'Lấy danh sách xe thành công');
};

const getById = async (req, res) => {
  const bus = await busService.getById(req.params.id);
  if (!bus) return res.notFound('Không tìm thấy xe');
  return res.success(bus, 'Lấy thông tin xe thành công');
};

const create = async (req, res) => {
  const { licensePlate, seatCount, busTypeId, description } = req.body;
  if (!licensePlate || !seatCount || !busTypeId) return res.validationError('Thiếu thông tin bắt buộc', ['licensePlate', 'seatCount', 'busTypeId']);
  try {
    const bus = await busService.create({ licensePlate, seatCount, busTypeId, description });
    return res.created(bus, 'Tạo xe thành công');
  } catch (err) {
    if (err.message === 'Biển số xe đã tồn tại') {
      return res.error(err.message, 400);
    }
    return res.serverError(err.message);
  }
};

const update = async (req, res) => {
  const { licensePlate, seatCount, busTypeId, description } = req.body;
  try {
    const bus = await busService.update(req.params.id, { licensePlate, seatCount, busTypeId, description });
    if (!bus) return res.notFound('Không tìm thấy xe');
    return res.success(bus, 'Cập nhật xe thành công');
  } catch (err) {
    if (err.message === 'Biển số xe đã tồn tại') {
      return res.error(err.message, 400);
    }
    return res.serverError(err.message);
  }
};

const remove = async (req, res) => {
  const ok = await busService.remove(req.params.id);
  if (!ok) return res.notFound('Không tìm thấy xe');
  return res.success(null, 'Xóa xe thành công');
};

module.exports = { getAll, getById, create, update, remove }; 