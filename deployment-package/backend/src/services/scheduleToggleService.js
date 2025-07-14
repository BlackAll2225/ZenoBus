const sql = require('mssql');
const { getConnection } = require('../config/database');

const scheduleToggleService = {
  // Bật/tắt lịch trình
  async toggleSchedule(toggleData) {
    try {
      const { scheduleId, isEnabled, isSeatEnabled, adminNote, adminId } = toggleData;
      const pool = await getConnection();
      
      // Check if schedule exists
      const scheduleQuery = `SELECT id FROM schedules WHERE id = @scheduleId`;
      const scheduleRequest = pool.request();
      scheduleRequest.input('scheduleId', sql.Int, scheduleId);
      const scheduleResult = await scheduleRequest.query(scheduleQuery);
      
      if (scheduleResult.recordset.length === 0) {
        return null;
      }
      
      // Check if schedule_management record exists
      const existingQuery = `
        SELECT id FROM schedule_management WHERE schedule_id = @scheduleId
      `;
      const existingRequest = pool.request();
      existingRequest.input('scheduleId', sql.Int, scheduleId);
      const existingResult = await existingRequest.query(existingQuery);
      
      let managementId;
      
      if (existingResult.recordset.length === 0) {
        // Create new schedule_management record
        const insertQuery = `
          INSERT INTO schedule_management (
            schedule_id, is_enabled, is_seat_enabled, admin_note, modified_by, modified_at
          )
          OUTPUT INSERTED.id
          VALUES (@scheduleId, @isEnabled, @isSeatEnabled, @adminNote, @adminId, GETDATE())
        `;
        
        const insertRequest = pool.request();
        insertRequest.input('scheduleId', sql.Int, scheduleId);
        insertRequest.input('isEnabled', sql.Bit, isEnabled);
        insertRequest.input('isSeatEnabled', sql.Bit, isSeatEnabled !== undefined ? isSeatEnabled : isEnabled);
        insertRequest.input('adminNote', sql.NVarChar, adminNote || null);
        insertRequest.input('adminId', sql.Int, adminId);
        
        const insertResult = await insertRequest.query(insertQuery);
        managementId = insertResult.recordset[0].id;
      } else {
        // Update existing schedule_management record
        managementId = existingResult.recordset[0].id;
        
        const updateQuery = `
          UPDATE schedule_management 
          SET is_enabled = @isEnabled,
              is_seat_enabled = @isSeatEnabled,
              admin_note = @adminNote,
              modified_by = @adminId,
              modified_at = GETDATE()
          WHERE id = @managementId
        `;
        
        const updateRequest = pool.request();
        updateRequest.input('isEnabled', sql.Bit, isEnabled);
        updateRequest.input('isSeatEnabled', sql.Bit, isSeatEnabled !== undefined ? isSeatEnabled : isEnabled);
        updateRequest.input('adminNote', sql.NVarChar, adminNote || null);
        updateRequest.input('adminId', sql.Int, adminId);
        updateRequest.input('managementId', sql.Int, managementId);
        
        await updateRequest.query(updateQuery);
      }
      
      // Update seats if seat enabled status changed
      if (isSeatEnabled !== undefined) {
        const updateSeatsQuery = `
          UPDATE seats 
          SET is_enabled = @isSeatEnabled
          WHERE schedule_id = @scheduleId
        `;
        
        const updateSeatsRequest = pool.request();
        updateSeatsRequest.input('isSeatEnabled', sql.Bit, isSeatEnabled);
        updateSeatsRequest.input('scheduleId', sql.Int, scheduleId);
        
        await updateSeatsRequest.query(updateSeatsQuery);
      }
      
      // Return the updated schedule management info
      return await this.getScheduleManagement(scheduleId);
    } catch (error) {
      console.error('Error in toggleSchedule:', error);
      throw error;
    }
  },

  // Bật/tắt ghế
  async toggleSeats(toggleData) {
    try {
      const { scheduleId, seatIds, isEnabled, adminNote, adminId } = toggleData;
      const pool = await getConnection();
      
      // Check if schedule exists
      const scheduleQuery = `SELECT id FROM schedules WHERE id = @scheduleId`;
      const scheduleRequest = pool.request();
      scheduleRequest.input('scheduleId', sql.Int, scheduleId);
      const scheduleResult = await scheduleRequest.query(scheduleQuery);
      
      if (scheduleResult.recordset.length === 0) {
        throw new Error('Lịch trình không tồn tại');
      }
      
      // Update seats
      const seatIdsString = seatIds.join(',');
      const updateSeatsQuery = `
        UPDATE seats 
        SET is_enabled = @isEnabled
        WHERE schedule_id = @scheduleId AND id IN (${seatIdsString})
      `;
      
      const updateSeatsRequest = pool.request();
      updateSeatsRequest.input('isEnabled', sql.Bit, isEnabled);
      updateSeatsRequest.input('scheduleId', sql.Int, scheduleId);
      
      const updateResult = await updateSeatsRequest.query(updateSeatsQuery);
      const updatedCount = updateResult.rowsAffected[0];
      
      // Update or create schedule_management record
      await this.toggleSchedule({
        scheduleId,
        isEnabled: true, // Keep schedule enabled when toggling seats
        isSeatEnabled: isEnabled,
        adminNote,
        adminId
      });
      
      // Get updated seats info
      const seatsQuery = `
        SELECT id, seat_number as seatNumber, is_enabled as isEnabled
        FROM seats 
        WHERE schedule_id = @scheduleId AND id IN (${seatIdsString})
      `;
      
      const seatsRequest = pool.request();
      seatsRequest.input('scheduleId', sql.Int, scheduleId);
      const seatsResult = await seatsRequest.query(seatsQuery);
      
      return {
        updated: updatedCount,
        seats: seatsResult.recordset
      };
    } catch (error) {
      console.error('Error in toggleSeats:', error);
      throw error;
    }
  },

  // Lấy thông tin quản lý lịch trình
  async getScheduleManagement(scheduleId) {
    try {
      const pool = await getConnection();
      
      const query = `
        SELECT 
          sm.id,
          sm.schedule_id as scheduleId,
          sm.is_enabled as isEnabled,
          sm.is_seat_enabled as isSeatEnabled,
          sm.admin_note as adminNote,
          sm.modified_by as modifiedBy,
          sm.modified_at as modifiedAt,
          sa.full_name as modifiedByName,
          sa.username as modifiedByUsername
        FROM schedule_management sm
        LEFT JOIN staff_accounts sa ON sm.modified_by = sa.id
        WHERE sm.schedule_id = @scheduleId
      `;
      
      const request = pool.request();
      request.input('scheduleId', sql.Int, scheduleId);
      
      const result = await request.query(query);
      
      if (result.recordset.length === 0) {
        // Return default values if no management record exists
        return {
          scheduleId: scheduleId,
          isEnabled: true,
          isSeatEnabled: true,
          adminNote: null,
          modifiedBy: null,
          modifiedAt: null,
          modifiedByAdmin: null
        };
      }
      
      const row = result.recordset[0];
      return {
        id: row.id,
        scheduleId: row.scheduleId,
        isEnabled: row.isEnabled,
        isSeatEnabled: row.isSeatEnabled,
        adminNote: row.adminNote,
        modifiedBy: row.modifiedBy,
        modifiedAt: row.modifiedAt,
        modifiedByAdmin: row.modifiedBy ? {
          id: row.modifiedBy,
          fullName: row.modifiedByName,
          username: row.modifiedByUsername
        } : null
      };
    } catch (error) {
      console.error('Error in getScheduleManagement:', error);
      throw error;
    }
  },

  // Lấy danh sách ghế với trạng thái
  async getScheduleSeats(scheduleId) {
    try {
      const pool = await getConnection();
      
      // Check if schedule exists
      const scheduleQuery = `SELECT id FROM schedules WHERE id = @scheduleId`;
      const scheduleRequest = pool.request();
      scheduleRequest.input('scheduleId', sql.Int, scheduleId);
      const scheduleResult = await scheduleRequest.query(scheduleQuery);
      
      if (scheduleResult.recordset.length === 0) {
        return null;
      }
      
      // Get seats
      const seatsQuery = `
        SELECT 
          id,
          seat_number as seatNumber,
          status,
          floor,
          is_enabled as isEnabled
        FROM seats 
        WHERE schedule_id = @scheduleId
        ORDER BY seat_number
      `;
      
      const seatsRequest = pool.request();
      seatsRequest.input('scheduleId', sql.Int, scheduleId);
      const seatsResult = await seatsRequest.query(seatsQuery);
      
      const seats = seatsResult.recordset;
      const totalSeats = seats.length;
      const enabledSeats = seats.filter(seat => seat.isEnabled).length;
      const disabledSeats = totalSeats - enabledSeats;
      
      return {
        scheduleId: scheduleId,
        totalSeats: totalSeats,
        enabledSeats: enabledSeats,
        disabledSeats: disabledSeats,
        seats: seats
      };
    } catch (error) {
      console.error('Error in getScheduleSeats:', error);
      throw error;
    }
  },

  // Bật/tắt nhiều lịch trình
  async bulkToggleSchedules(bulkData) {
    try {
      const { scheduleIds, isEnabled, isSeatEnabled, adminNote, adminId } = bulkData;
      const pool = await getConnection();
      
      // Check which schedules exist
      const scheduleIdsString = scheduleIds.join(',');
      const existingSchedulesQuery = `
        SELECT id FROM schedules WHERE id IN (${scheduleIdsString})
      `;
      
      const existingSchedulesResult = await pool.request().query(existingSchedulesQuery);
      const existingScheduleIds = existingSchedulesResult.recordset.map(row => row.id);
      
      if (existingScheduleIds.length === 0) {
        return { updated: 0, schedules: [] };
      }
      
      // Process each schedule
      const updatedSchedules = [];
      
      for (const scheduleId of existingScheduleIds) {
        const result = await this.toggleSchedule({
          scheduleId,
          isEnabled,
          isSeatEnabled,
          adminNote,
          adminId
        });
        
        if (result) {
          updatedSchedules.push(result);
        }
      }
      
      return {
        updated: updatedSchedules.length,
        schedules: updatedSchedules
      };
    } catch (error) {
      console.error('Error in bulkToggleSchedules:', error);
      throw error;
    }
  }
};

module.exports = scheduleToggleService; 