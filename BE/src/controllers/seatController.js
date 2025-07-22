const seatService = require('../services/seatService');

const getAll = async (req, res) => {
  const { scheduleId } = req.query;
  const seats = await seatService.getAll(scheduleId);
  return res.success(seats, 'Lấy danh sách ghế thành công');
};

const getById = async (req, res) => {
  const seat = await seatService.getById(req.params.id);
  if (!seat) return res.notFound('Không tìm thấy ghế');
  return res.success(seat, 'Lấy thông tin ghế thành công');
};

const create = async (req, res) => {
  const { scheduleId, seatNumber, floor, status } = req.body;
  if (!scheduleId || !seatNumber) return res.validationError('Thiếu thông tin bắt buộc', ['scheduleId', 'seatNumber']);
  try {
    const seat = await seatService.create({ scheduleId, seatNumber, floor, status });
    return res.created(seat, 'Tạo ghế thành công');
  } catch (err) {
    if (err.message === 'Số ghế đã tồn tại trong lịch trình này') {
      return res.error(err.message, 400);
    }
    return res.serverError(err.message);
  }
};

const update = async (req, res) => {
  const { seatNumber, floor, status } = req.body;
  try {
    const seat = await seatService.update(req.params.id, { seatNumber, floor, status });
    if (!seat) return res.notFound('Không tìm thấy ghế');
    return res.success(seat, 'Cập nhật ghế thành công');
  } catch (err) {
    if (err.message === 'Số ghế đã tồn tại trong lịch trình này') {
      return res.error(err.message, 400);
    }
    return res.serverError(err.message);
  }
};

const remove = async (req, res) => {
  const ok = await seatService.remove(req.params.id);
  if (!ok) return res.notFound('Không tìm thấy ghế');
  return res.success(null, 'Xóa ghế thành công');
};

module.exports = { getAll, getById, create, update, remove }; 