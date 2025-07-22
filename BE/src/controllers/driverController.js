const driverService = require('../services/driverService');

/**
 * @swagger
 * components:
 *   schemas:
 *     Driver:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Driver ID
 *         fullName:
 *           type: string
 *           description: Driver full name
 *         phoneNumber:
 *           type: string
 *           description: Driver phone number
 *         licenseNumber:
 *           type: string
 *           description: Driver license number
 *         hireDate:
 *           type: string
 *           format: date
 *           description: Driver hire date
 *         isActive:
 *           type: boolean
 *           description: Driver active status
 *     CreateDriverRequest:
 *       type: object
 *       required:
 *         - fullName
 *         - phoneNumber
 *         - licenseNumber
 *       properties:
 *         fullName:
 *           type: string
 *           description: Driver full name
 *         phoneNumber:
 *           type: string
 *           description: Driver phone number
 *         licenseNumber:
 *           type: string
 *           description: Driver license number
 *         hireDate:
 *           type: string
 *           format: date
 *           description: Driver hire date
 *     UpdateDriverRequest:
 *       type: object
 *       properties:
 *         fullName:
 *           type: string
 *           description: Driver full name
 *         phoneNumber:
 *           type: string
 *           description: Driver phone number
 *         licenseNumber:
 *           type: string
 *           description: Driver license number
 *         hireDate:
 *           type: string
 *           format: date
 *           description: Driver hire date
 *         isActive:
 *           type: boolean
 *           description: Driver active status
 */

class DriverController {
  /**
   * @swagger
   * /api/drivers:
   *   get:
   *     summary: Lấy danh sách tài xế
   *     tags: [Drivers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: isActive
   *         schema:
   *           type: boolean
   *         description: Lọc theo trạng thái active
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Tìm kiếm theo tên
   *     responses:
   *       200:
   *         description: Danh sách tài xế
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Driver'
   *       500:
   *         description: Server error
   */
  async getAllDrivers(req, res) {
    try {
      const filters = {
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        search: req.query.search
      };

      const drivers = await driverService.getAllDrivers(filters);
      res.success(drivers);
    } catch (error) {
      res.serverError(error.message);
    }
  }

  /**
   * @swagger
   * /api/drivers/active:
   *   get:
   *     summary: Lấy danh sách tài xế active cho dropdown
   *     tags: [Drivers]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Danh sách tài xế active
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                       fullName:
   *                         type: string
   *                       phoneNumber:
   *                         type: string
   *                       licenseNumber:
   *                         type: string
   *       500:
   *         description: Server error
   */
  async getActiveDrivers(req, res) {
    try {
      const drivers = await driverService.getActiveDrivers();
      res.success(drivers);
    } catch (error) {
      res.serverError(error.message);
    }
  }

  /**
   * @swagger
   * /api/drivers/{id}:
   *   get:
   *     summary: Lấy thông tin tài xế theo ID
   *     tags: [Drivers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Driver ID
   *     responses:
   *       200:
   *         description: Thông tin tài xế
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Driver'
   *       404:
   *         description: Driver not found
   *       500:
   *         description: Server error
   */
  async getDriverById(req, res) {
    try {
      const { id } = req.params;
      const driver = await driverService.getDriverById(parseInt(id));
      res.success(driver);
    } catch (error) {
      if (error.message === 'Driver not found') {
        res.notFound(error.message);
      } else {
        res.serverError(error.message);
      }
    }
  }

  /**
   * @swagger
   * /api/drivers:
   *   post:
   *     summary: Tạo tài xế mới
   *     tags: [Drivers]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateDriverRequest'
   *     responses:
   *       201:
   *         description: Tài xế đã được tạo
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Driver'
   *       400:
   *         description: Bad request
   *       500:
   *         description: Server error
   */
  async createDriver(req, res) {
    try {
      const driverData = req.body;
      const driver = await driverService.createDriver(driverData);
      res.created(driver);
    } catch (error) {
      res.badRequest(error.message);
    }
  }

  /**
   * @swagger
   * /api/drivers/{id}:
   *   put:
   *     summary: Cập nhật tài xế
   *     tags: [Drivers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Driver ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateDriverRequest'
   *     responses:
   *       200:
   *         description: Tài xế đã được cập nhật
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Driver'
   *       404:
   *         description: Driver not found
   *       400:
   *         description: Bad request
   *       500:
   *         description: Server error
   */
  async updateDriver(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const driver = await driverService.updateDriver(parseInt(id), updateData);
      res.success(driver);
    } catch (error) {
      if (error.message === 'Driver not found') {
        res.notFound(error.message);
      } else {
        res.badRequest(error.message);
      }
    }
  }

  /**
   * @swagger
   * /api/drivers/{id}:
   *   delete:
   *     summary: Xóa tài xế (soft delete)
   *     tags: [Drivers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Driver ID
   *     responses:
   *       200:
   *         description: Tài xế đã được xóa
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *       404:
   *         description: Driver not found
   *       500:
   *         description: Server error
   */
  async deleteDriver(req, res) {
    try {
      const { id } = req.params;
      await driverService.deleteDriver(parseInt(id));
      res.success({ message: 'Driver deleted successfully' });
    } catch (error) {
      if (error.message === 'Driver not found') {
        res.notFound(error.message);
      } else {
        res.serverError(error.message);
      }
    }
  }
}

module.exports = new DriverController(); 