const { sql, poolPromise } = require('../config/db');

const getAllStops = async (provinceId = null) => {
  try {
    const pool = await poolPromise;
    let query = `
      SELECT 
        s.id,
        s.province_id as provinceId,
        s.name,
        s.address,
        s.type,
        p.name as provinceName,
        p.code as provinceCode
      FROM stops s
      JOIN provinces p ON s.province_id = p.id
    `;
    
    const params = [];
    if (provinceId) {
      query += ' WHERE s.province_id = @provinceId';
      params.push({ name: 'provinceId', type: sql.Int, value: provinceId });
    }
    
    query += ' ORDER BY p.name, s.name';
    
    const request = pool.request();
    params.forEach(param => {
      request.input(param.name, param.type, param.value);
    });
    
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    throw new Error(`Error fetching stops: ${error.message}`);
  }
};

const getStopById = async (id) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          s.id,
          s.province_id as provinceId,
          s.name,
          s.address,
          s.type,
          p.name as provinceName,
          p.code as provinceCode
        FROM stops s
        JOIN provinces p ON s.province_id = p.id
        WHERE s.id = @id
      `);
    
    return result.recordset[0] || null;
  } catch (error) {
    throw new Error(`Error fetching stop: ${error.message}`);
  }
};

const createStop = async (stopData) => {
  try {
    const { provinceId, name, address, type } = stopData;
    
    // Validate required fields
    if (!provinceId || !name || !type) {
      throw new Error('Province ID, name, and type are required');
    }
    
    // Validate type
    if (!['pickup', 'dropoff'].includes(type)) {
      throw new Error('Type must be either "pickup" or "dropoff"');
    }
    
    // Check if province exists
    const pool = await poolPromise;
    const provinceResult = await pool.request()
      .input('provinceId', sql.Int, provinceId)
      .query('SELECT id FROM provinces WHERE id = @provinceId');
    
    if (provinceResult.recordset.length === 0) {
      throw new Error('Province not found');
    }
    
    // Create stop
    const result = await pool.request()
      .input('provinceId', sql.Int, provinceId)
      .input('name', sql.NVarChar(255), name)
      .input('address', sql.NVarChar(255), address)
      .input('type', sql.NVarChar(10), type)
      .query(`
        INSERT INTO stops (province_id, name, address, type)
        OUTPUT INSERTED.id, INSERTED.province_id, INSERTED.name, INSERTED.address, INSERTED.type
        VALUES (@provinceId, @name, @address, @type)
      `);
    
    const stop = result.recordset[0];
    
    // Get full stop info with province
    return await getStopById(stop.id);
  } catch (error) {
    throw new Error(`Error creating stop: ${error.message}`);
  }
};

const updateStop = async (id, updateData) => {
  try {
    const { provinceId, name, address, type } = updateData;
    
    // Check if stop exists
    const existingStop = await getStopById(id);
    if (!existingStop) {
      throw new Error('Stop not found');
    }
    
    // Validate type if provided
    if (type && !['pickup', 'dropoff'].includes(type)) {
      throw new Error('Type must be either "pickup" or "dropoff"');
    }
    
    // Check if province exists if provided
    if (provinceId) {
      const pool = await poolPromise;
      const provinceResult = await pool.request()
        .input('provinceId', sql.Int, provinceId)
        .query('SELECT id FROM provinces WHERE id = @provinceId');
      
      if (provinceResult.recordset.length === 0) {
        throw new Error('Province not found');
      }
    }
    
    // Build update query
    const updateFields = [];
    const inputs = [];
    
    if (provinceId !== undefined) {
      updateFields.push('province_id = @provinceId');
      inputs.push({ name: 'provinceId', type: sql.Int, value: provinceId });
    }
    
    if (name !== undefined) {
      updateFields.push('name = @name');
      inputs.push({ name: 'name', type: sql.NVarChar(255), value: name });
    }
    
    if (address !== undefined) {
      updateFields.push('address = @address');
      inputs.push({ name: 'address', type: sql.NVarChar(255), value: address });
    }
    
    if (type !== undefined) {
      updateFields.push('type = @type');
      inputs.push({ name: 'type', type: sql.NVarChar(10), value: type });
    }
    
    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }
    
    // Update stop
    const pool = await poolPromise;
    const request = pool.request();
    request.input('id', sql.Int, id);
    
    inputs.forEach(input => {
      request.input(input.name, input.type, input.value);
    });
    
    await request.query(`
      UPDATE stops 
      SET ${updateFields.join(', ')}
      WHERE id = @id
    `);
    
    // Get updated stop
    return await getStopById(id);
  } catch (error) {
    throw new Error(`Error updating stop: ${error.message}`);
  }
};

const deleteStop = async (id) => {
  try {
    // Check if stop exists
    const existingStop = await getStopById(id);
    if (!existingStop) {
      throw new Error('Stop not found');
    }
    
    // Check if stop is being used in bookings
    const pool = await poolPromise;
    const bookingResult = await pool.request()
      .input('stopId', sql.Int, id)
      .query(`
        SELECT COUNT(*) as count 
        FROM bookings 
        WHERE pickup_stop_id = @stopId OR dropoff_stop_id = @stopId
      `);
    
    if (bookingResult.recordset[0].count > 0) {
      throw new Error('Cannot delete stop that is being used in bookings');
    }
    
    // Delete stop
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM stops WHERE id = @id');
    
    return { message: 'Stop deleted successfully' };
  } catch (error) {
    throw new Error(`Error deleting stop: ${error.message}`);
  }
};

const getStopsByProvince = async (provinceId) => {
  return await getAllStops(provinceId);
};

const getStopsByType = async (type) => {
  try {
    if (!['pickup', 'dropoff'].includes(type)) {
      throw new Error('Type must be either "pickup" or "dropoff"');
    }
    
    const pool = await poolPromise;
    const result = await pool.request()
      .input('type', sql.NVarChar(10), type)
      .query(`
        SELECT 
          s.id,
          s.province_id as provinceId,
          s.name,
          s.address,
          s.type,
          p.name as provinceName,
          p.code as provinceCode
        FROM stops s
        JOIN provinces p ON s.province_id = p.id
        WHERE s.type = @type
        ORDER BY p.name, s.name
      `);
    
    return result.recordset;
  } catch (error) {
    throw new Error(`Error fetching stops by type: ${error.message}`);
  }
};

module.exports = {
  getAllStops,
  getStopById,
  createStop,
  updateStop,
  deleteStop,
  getStopsByProvince,
  getStopsByType
}; 