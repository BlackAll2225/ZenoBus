const { sql, poolPromise } = require('../config/db');

const getAll = async (filters = {}) => {
  try {
    const pool = await poolPromise;
    let query = `
      SELECT 
        sp.id,
        sp.name,
        sp.description,
        sp.route_id as routeId,
        sp.bus_type_id as busTypeId,
        sp.departure_times as departureTimes,
        sp.days_of_week as daysOfWeek,
        sp.base_price as basePrice,
        sp.is_active as isActive,
        sp.created_at as createdAt,
        sp.updated_at as updatedAt,
        r.departure_province_id as departureProvinceId,
        r.arrival_province_id as arrivalProvinceId,
        dp.name as departureProvince,
        ap.name as arrivalProvince,
        bt.name as busTypeName
      FROM schedule_patterns sp
      JOIN routes r ON sp.route_id = r.id
      JOIN provinces dp ON r.departure_province_id = dp.id
      JOIN provinces ap ON r.arrival_province_id = ap.id
      JOIN bus_types bt ON sp.bus_type_id = bt.id
    `;
    
    const params = [];
    const conditions = [];
    
    if (filters.routeId) {
      conditions.push('sp.route_id = @routeId');
      params.push({ name: 'routeId', type: sql.Int, value: filters.routeId });
    }
    
    if (filters.busTypeId) {
      conditions.push('sp.bus_type_id = @busTypeId');
      params.push({ name: 'busTypeId', type: sql.Int, value: filters.busTypeId });
    }
    
    if (filters.isActive !== undefined) {
      conditions.push('sp.is_active = @isActive');
      params.push({ name: 'isActive', type: sql.Bit, value: filters.isActive });
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY sp.created_at DESC';
    
    const request = pool.request();
    params.forEach(param => {
      request.input(param.name, param.type, param.value);
    });
    
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    throw new Error(`Error fetching schedule patterns: ${error.message}`);
  }
};

const getById = async (id) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          sp.id,
          sp.name,
          sp.description,
          sp.route_id as routeId,
          sp.bus_type_id as busTypeId,
          sp.departure_times as departureTimes,
          sp.days_of_week as daysOfWeek,
          sp.base_price as basePrice,
          sp.is_active as isActive,
          sp.created_at as createdAt,
          sp.updated_at as updatedAt,
          r.departure_province_id as departureProvinceId,
          r.arrival_province_id as arrivalProvinceId,
          dp.name as departureProvince,
          ap.name as arrivalProvince,
          bt.name as busTypeName
        FROM schedule_patterns sp
        JOIN routes r ON sp.route_id = r.id
        JOIN provinces dp ON r.departure_province_id = dp.id
        JOIN provinces ap ON r.arrival_province_id = ap.id
        JOIN bus_types bt ON sp.bus_type_id = bt.id
        WHERE sp.id = @id
      `);
    
    return result.recordset[0] || null;
  } catch (error) {
    throw new Error(`Error fetching schedule pattern: ${error.message}`);
  }
};

const create = async (patternData) => {
  try {
    const { name, description, routeId, busTypeId, departureTimes, daysOfWeek, basePrice, isActive = true } = patternData;
    
    // Validate required fields
    if (!name || !routeId || !busTypeId || !departureTimes || !daysOfWeek || !basePrice) {
      throw new Error('Thiếu thông tin bắt buộc');
    }
    
    // Check if route exists
    const pool = await poolPromise;
    const routeResult = await pool.request()
      .input('routeId', sql.Int, routeId)
      .query('SELECT id FROM routes WHERE id = @routeId');
    
    if (routeResult.recordset.length === 0) {
      throw new Error('Tuyến đường không tồn tại');
    }
    
    // Check if bus type exists
    const busTypeResult = await pool.request()
      .input('busTypeId', sql.Int, busTypeId)
      .query('SELECT id FROM bus_types WHERE id = @busTypeId');
    
    if (busTypeResult.recordset.length === 0) {
      throw new Error('Loại xe không tồn tại');
    }
    
    // Check if pattern with same name exists
    const existingResult = await pool.request()
      .input('name', sql.NVarChar(100), name)
      .query('SELECT id FROM schedule_patterns WHERE name = @name');
    
    if (existingResult.recordset.length > 0) {
      throw new Error('Mẫu lịch trình với tên này đã tồn tại');
    }
    
    // Create pattern
    const result = await pool.request()
      .input('name', sql.NVarChar(100), name)
      .input('description', sql.NVarChar(500), description)
      .input('routeId', sql.Int, routeId)
      .input('busTypeId', sql.Int, busTypeId)
      .input('departureTimes', sql.NVarChar(sql.MAX), departureTimes)
      .input('daysOfWeek', sql.NVarChar(20), daysOfWeek)
      .input('basePrice', sql.Decimal(10, 2), basePrice)
      .input('isActive', sql.Bit, isActive)
      .query(`
        INSERT INTO schedule_patterns (name, description, route_id, bus_type_id, departure_times, days_of_week, base_price, is_active, created_at, updated_at)
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.description, INSERTED.route_id, INSERTED.bus_type_id, INSERTED.departure_times, INSERTED.days_of_week, INSERTED.base_price, INSERTED.is_active, INSERTED.created_at, INSERTED.updated_at
        VALUES (@name, @description, @routeId, @busTypeId, @departureTimes, @daysOfWeek, @basePrice, @isActive, GETDATE(), GETDATE())
      `);
    
    const pattern = result.recordset[0];
    
    // Get full pattern info with related data
    return await getById(pattern.id);
  } catch (error) {
    throw new Error(error.message);
  }
};

const update = async (id, patternData) => {
  try {
    const { name, description, routeId, busTypeId, departureTimes, daysOfWeek, basePrice, isActive } = patternData;
    
    // Check if pattern exists
    const existingPattern = await getById(id);
    if (!existingPattern) {
      return null;
    }
    
    // Validate required fields
    if (!name || !routeId || !busTypeId || !departureTimes || !daysOfWeek || !basePrice) {
      throw new Error('Thiếu thông tin bắt buộc');
    }
    
    const pool = await poolPromise;
    
    // Check if route exists
    const routeResult = await pool.request()
      .input('routeId', sql.Int, routeId)
      .query('SELECT id FROM routes WHERE id = @routeId');
    
    if (routeResult.recordset.length === 0) {
      throw new Error('Tuyến đường không tồn tại');
    }
    
    // Check if bus type exists
    const busTypeResult = await pool.request()
      .input('busTypeId', sql.Int, busTypeId)
      .query('SELECT id FROM bus_types WHERE id = @busTypeId');
    
    if (busTypeResult.recordset.length === 0) {
      throw new Error('Loại xe không tồn tại');
    }
    
    // Check if pattern with same name exists (excluding current pattern)
    const existingResult = await pool.request()
      .input('name', sql.NVarChar(100), name)
      .input('id', sql.Int, id)
      .query('SELECT id FROM schedule_patterns WHERE name = @name AND id != @id');
    
    if (existingResult.recordset.length > 0) {
      throw new Error('Mẫu lịch trình với tên này đã tồn tại');
    }
    
    // Update pattern
    await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar(100), name)
      .input('description', sql.NVarChar(500), description)
      .input('routeId', sql.Int, routeId)
      .input('busTypeId', sql.Int, busTypeId)
      .input('departureTimes', sql.NVarChar(sql.MAX), departureTimes)
      .input('daysOfWeek', sql.NVarChar(20), daysOfWeek)
      .input('basePrice', sql.Decimal(10, 2), basePrice)
      .input('isActive', sql.Bit, isActive)
      .query(`
        UPDATE schedule_patterns 
        SET name = @name, description = @description, route_id = @routeId, bus_type_id = @busTypeId, 
            departure_times = @departureTimes, days_of_week = @daysOfWeek, base_price = @basePrice, 
            is_active = @isActive, updated_at = GETDATE()
        WHERE id = @id
      `);
    
    // Get updated pattern
    return await getById(id);
  } catch (error) {
    throw new Error(error.message);
  }
};

const remove = async (id) => {
  try {
    const pool = await poolPromise;
    
    // Check if pattern exists
    const existingPattern = await getById(id);
    if (!existingPattern) {
      return null;
    }
    
    // Check if pattern is being used by any schedules
    const usageResult = await pool.request()
      .input('patternId', sql.Int, id)
      .query('SELECT COUNT(*) as count FROM schedules WHERE pattern_id = @patternId');
    
    if (usageResult.recordset[0].count > 0) {
      return { error: 'Không thể xóa mẫu lịch trình đang được sử dụng' };
    }
    
    // Delete pattern
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM schedule_patterns WHERE id = @id');
    
    return true;
  } catch (error) {
    throw new Error(`Error removing schedule pattern: ${error.message}`);
  }
};

module.exports = { getAll, getById, create, update, remove }; 