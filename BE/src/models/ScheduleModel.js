const { sql, poolPromise } = require("../config/db");

const getAllSchedules = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT 
      s.ScheduleID,
      s.RouteID,
      r.FromLocation,
      r.ToLocation,
      s.BusID,
      b.LicensePlate,
      b.BusType,
      b.SeatCount,
      s.DepartureTime,
      s.ArrivalTime,
      s.Status,
      o.OperatorID,
      o.FullName AS OperatorName
    FROM Schedule s
    JOIN Route r ON s.RouteID = r.RouteID
    JOIN Bus b ON s.BusID = b.BusID
    JOIN Operator o ON b.OperatorID = o.OperatorID
  `);
  return result.recordset;
};

const getScheduleById = async (id) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .query("SELECT * FROM Schedule WHERE ScheduleID = @id");
  return result.recordset[0];
};

const getSchedulesByRoute = async (routeId) => {
  const pool = await poolPromise;;
  const result = await pool
    .request()
    .input("routeId", sql.Int, routeId)
    .query(`
      SELECT s.ScheduleID, s.DepartureTime, s.ArrivalTime, s.Status,
             b.LicensePlate, b.BusType, b.SeatCount
      FROM Schedule s
      JOIN Bus b ON s.BusID = b.BusID
      WHERE s.RouteID = @routeId
    `);
  return result.recordset;
};

const createSchedule = async (routeID, busID, departureTime, arrivalTime, status) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("routeID", sql.Int, routeID)
    .input("busID", sql.Int, busID)
    .input("departureTime", sql.DateTime, departureTime)
    .input("arrivalTime", sql.DateTime, arrivalTime)
    .input("status", sql.NVarChar, status)
    .query(`
      INSERT INTO Schedule (RouteID, BusID, DepartureTime, ArrivalTime, Status)
      OUTPUT INSERTED.*
      VALUES (@routeID, @busID, @departureTime, @arrivalTime, @status)
    `);
  return result.recordset[0];
};

const updateSchedule = async (id, routeID, busID, departureTime, arrivalTime, status) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .input("routeID", sql.Int, routeID)
    .input("busID", sql.Int, busID)
    .input("departureTime", sql.DateTime, departureTime)
    .input("arrivalTime", sql.DateTime, arrivalTime)
    .input("status", sql.NVarChar, status)
    .query(`
      UPDATE Schedule
      SET RouteID = @routeID, BusID = @busID,
          DepartureTime = @departureTime,
          ArrivalTime = @arrivalTime,
          Status = @status
      OUTPUT INSERTED.*
      WHERE ScheduleID = @id
    `);
  return result.recordset[0];
};

const deleteSchedule = async (id) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`DELETE FROM Schedule WHERE ScheduleID = @id`);

  return {
    message: 'Schedule deleted successfully',
    affectedRows: result.rowsAffected[0]  
  };
};

module.exports = {
  getAllSchedules,
  getScheduleById,
  getSchedulesByRoute,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};
