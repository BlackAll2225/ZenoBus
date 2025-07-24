import React, { useState, useEffect } from 'react';
import { provinceService, Province, CreateProvinceData, UpdateProvinceData } from '@/services/provinceService';
import { stopService, Stop } from '@/services/stopService';
import { formatShortDate } from '@/lib/dateUtils';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

const AdminProvincesPage = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'provinces' | 'stops'>('provinces');

  // Province states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [provinceLoading, setProvinceLoading] = useState(true);
  const [showCreateProvinceModal, setShowCreateProvinceModal] = useState(false);
  const [provinceCode, setProvinceCode] = useState('');
  const [provinceName, setProvinceName] = useState('');
  const [createProvinceLoading, setCreateProvinceLoading] = useState(false);
  const [updateProvinceLoading, setUpdateProvinceLoading] = useState(false);
  const [deleteProvinceLoading, setDeleteProvinceLoading] = useState(false);
  const [createProvinceErrors, setCreateProvinceErrors] = useState<{ code?: string; name?: string }>({});
  const [showProvinceDetailModal, setShowProvinceDetailModal] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [isProvinceEditMode, setIsProvinceEditMode] = useState(false);
  const [editProvinceCode, setEditProvinceCode] = useState('');
  const [editProvinceName, setEditProvinceName] = useState('');
  const [editProvinceErrors, setEditProvinceErrors] = useState<{ code?: string; name?: string }>({});
  const [showProvinceDeleteConfirm, setShowProvinceDeleteConfirm] = useState(false);

  // Stop states
  const [stops, setStops] = useState<Stop[]>([]);
  const [stopLoading, setStopLoading] = useState(true);
  const [showCreateStopModal, setShowCreateStopModal] = useState(false);
  const [stopName, setStopName] = useState('');
  const [stopAddress, setStopAddress] = useState('');
  const [stopProvinceId, setStopProvinceId] = useState<number | ''>('');
  const [stopType, setStopType] = useState<'pickup' | 'dropoff' | ''>('');
  const [createStopLoading, setCreateStopLoading] = useState(false);
  const [updateStopLoading, setUpdateStopLoading] = useState(false);
  const [deleteStopLoading, setDeleteStopLoading] = useState(false);
  const [createStopErrors, setCreateStopErrors] = useState<{ name?: string; provinceId?: string; type?: string }>({});
  const [showStopDetailModal, setShowStopDetailModal] = useState(false);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [isStopEditMode, setIsStopEditMode] = useState(false);
  const [editStopName, setEditStopName] = useState('');
  const [editStopAddress, setEditStopAddress] = useState('');
  const [editStopProvinceId, setEditStopProvinceId] = useState<number | ''>('');
  const [editStopType, setEditStopType] = useState<'pickup' | 'dropoff' | ''>('');
  const [editStopErrors, setEditStopErrors] = useState<{ name?: string; provinceId?: string; type?: string }>({});
  const [showStopDeleteConfirm, setShowStopDeleteConfirm] = useState(false);

  // Filters for stops
  const [stopFilterProvince, setStopFilterProvince] = useState<number | ''>('');
  const [stopFilterType, setStopFilterType] = useState<'pickup' | 'dropoff' | ''>('');

  // Load data on component mount
  useEffect(() => {
    loadProvinces();
    loadStops();
  }, []);

  // Reload stops when filters change
  useEffect(() => {
    if (activeTab === 'stops') {
      loadStops();
    }
  }, [stopFilterProvince, stopFilterType, activeTab]);

  const loadProvinces = async () => {
    try {
      setProvinceLoading(true);
      const provinces = await provinceService.getAllProvinces();
      setProvinces(provinces);
    } catch (error: unknown) {
      console.error('Error loading provinces:', error);
      toast.error('Không thể tải danh sách tỉnh/thành');
    } finally {
      setProvinceLoading(false);
    }
  };

  const loadStops = async () => {
    try {
      setStopLoading(true);
      const provinceId = stopFilterProvince || undefined;
      const type = stopFilterType || undefined;
      const stops = await stopService.getAllStops(provinceId, type);
      setStops(stops);
    } catch (error: unknown) {
      console.error('Error loading stops:', error);
      toast.error('Không thể tải danh sách điểm đón/trả');
    } finally {
      setStopLoading(false);
    }
  };

  // Province CRUD functions
  const handleCreateProvince = () => {
    setShowCreateProvinceModal(true);
    setCreateProvinceErrors({});
  };

  const handleCloseCreateProvinceModal = () => {
    setShowCreateProvinceModal(false);
    setProvinceCode('');
    setProvinceName('');
    setCreateProvinceErrors({});
  };

  const handleSubmitCreateProvince = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { code?: string; name?: string } = {};
    if (!provinceCode.trim()) errors.code = 'Mã tỉnh không được để trống';
    if (!provinceName.trim()) errors.name = 'Tên tỉnh không được để trống';
    setCreateProvinceErrors(errors);
    
    if (Object.keys(errors).length > 0) return;

    try {
      setCreateProvinceLoading(true);
      const createData: CreateProvinceData = {
        code: provinceCode.trim(),
        name: provinceName.trim()
      };
      
      await provinceService.create(createData);
      toast.success('Tạo tỉnh/thành thành công!');
      handleCloseCreateProvinceModal();
      loadProvinces();
    } catch (error: unknown) {
      console.error('Error creating province:', error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể tạo tỉnh/thành. Vui lòng thử lại.');
      }
    } finally {
      setCreateProvinceLoading(false);
    }
  };

  const handleShowProvinceDetail = (province: Province) => {
    setSelectedProvince(province);
    setEditProvinceCode(province.code);
    setEditProvinceName(province.name);
    setIsProvinceEditMode(false);
    setEditProvinceErrors({});
    setShowProvinceDetailModal(true);
  };

  const handleCloseProvinceDetailModal = () => {
    setShowProvinceDetailModal(false);
    setSelectedProvince(null);
    setIsProvinceEditMode(false);
    setEditProvinceErrors({});
    setShowProvinceDeleteConfirm(false);
  };

  const handleEditProvince = () => {
    setIsProvinceEditMode(true);
    setEditProvinceErrors({});
  };

  const handleUpdateProvince = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { code?: string; name?: string } = {};
    if (!editProvinceCode.trim()) errors.code = 'Mã tỉnh không được để trống';
    if (!editProvinceName.trim()) errors.name = 'Tên tỉnh không được để trống';
    setEditProvinceErrors(errors);
    
    if (Object.keys(errors).length > 0) return;
    if (!selectedProvince) return;

    try {
      setUpdateProvinceLoading(true);
      const updateData: UpdateProvinceData = {
        code: editProvinceCode.trim(),
        name: editProvinceName.trim()
      };
      
      await provinceService.update(selectedProvince.id, updateData);
      toast.success('Cập nhật tỉnh/thành thành công!');
      handleCloseProvinceDetailModal();
      loadProvinces();
    } catch (error: unknown) {
      console.error('Error updating province:', error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể cập nhật tỉnh/thành. Vui lòng thử lại.');
      }
    } finally {
      setUpdateProvinceLoading(false);
    }
  };

  const handleDeleteProvince = () => {
    setShowProvinceDeleteConfirm(true);
  };

  const confirmDeleteProvince = async () => {
    if (!selectedProvince) return;

    try {
      setDeleteProvinceLoading(true);
      await provinceService.delete(selectedProvince.id);
      toast.success('Xóa tỉnh/thành thành công!');
      handleCloseProvinceDetailModal();
      loadProvinces();
    } catch (error: unknown) {
      console.error('Error deleting province:', error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể xóa tỉnh/thành. Vui lòng thử lại.');
      }
    } finally {
      setDeleteProvinceLoading(false);
    }
  };

  // Stop CRUD functions
  const handleCreateStop = () => {
    setShowCreateStopModal(true);
    setCreateStopErrors({});
  };

  const handleCloseCreateStopModal = () => {
    setShowCreateStopModal(false);
    setStopName('');
    setStopAddress('');
    setStopProvinceId('');
    setStopType('');
    setCreateStopErrors({});
  };

  const handleSubmitCreateStop = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; provinceId?: string; type?: string } = {};
    if (!stopName.trim()) errors.name = 'Tên điểm đón/trả không được để trống';
    if (!stopProvinceId) errors.provinceId = 'Vui lòng chọn tỉnh/thành';
    if (!stopType) errors.type = 'Vui lòng chọn loại điểm';
    setCreateStopErrors(errors);
    
    if (Object.keys(errors).length > 0) return;

    try {
      setCreateStopLoading(true);
      const createData = {
        name: stopName.trim(),
        address: stopAddress.trim() || undefined,
        provinceId: Number(stopProvinceId),
        type: stopType as 'pickup' | 'dropoff'
      };
      
      await stopService.createStop(createData);
      toast.success('Tạo điểm đón/trả thành công!');
      handleCloseCreateStopModal();
      loadStops();
    } catch (error: unknown) {
      console.error('Error creating stop:', error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể tạo điểm đón/trả. Vui lòng thử lại.');
      }
    } finally {
      setCreateStopLoading(false);
    }
  };

  const handleShowStopDetail = (stop: Stop) => {
    setSelectedStop(stop);
    setEditStopName(stop.name);
    setEditStopAddress(stop.address || '');
    setEditStopProvinceId(stop.provinceId);
    setEditStopType(stop.type);
    setIsStopEditMode(false);
    setEditStopErrors({});
    setShowStopDetailModal(true);
  };

  const handleCloseStopDetailModal = () => {
    setShowStopDetailModal(false);
    setSelectedStop(null);
    setIsStopEditMode(false);
    setEditStopErrors({});
    setShowStopDeleteConfirm(false);
  };

  const handleEditStop = () => {
    setIsStopEditMode(true);
    setEditStopErrors({});
  };

  const handleUpdateStop = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; provinceId?: string; type?: string } = {};
    if (!editStopName.trim()) errors.name = 'Tên điểm đón/trả không được để trống';
    if (!editStopProvinceId) errors.provinceId = 'Vui lòng chọn tỉnh/thành';
    if (!editStopType) errors.type = 'Vui lòng chọn loại điểm';
    setEditStopErrors(errors);
    
    if (Object.keys(errors).length > 0) return;
    if (!selectedStop) return;

    try {
      setUpdateStopLoading(true);
      const updateData = {
        name: editStopName.trim(),
        address: editStopAddress.trim() || undefined,
        provinceId: Number(editStopProvinceId),
        type: editStopType as 'pickup' | 'dropoff'
      };
      
      await stopService.updateStop(selectedStop.id, updateData);
      toast.success('Cập nhật điểm đón/trả thành công!');
      handleCloseStopDetailModal();
      loadStops();
    } catch (error: unknown) {
      console.error('Error updating stop:', error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể cập nhật điểm đón/trả. Vui lòng thử lại.');
      }
    } finally {
      setUpdateStopLoading(false);
    }
  };

  const handleDeleteStop = () => {
    setShowStopDeleteConfirm(true);
  };

  const confirmDeleteStop = async () => {
    if (!selectedStop) return;

    try {
      setDeleteStopLoading(true);
      await stopService.deleteStop(selectedStop.id);
      toast.success('Xóa điểm đón/trả thành công!');
      handleCloseStopDetailModal();
      loadStops();
    } catch (error: unknown) {
      console.error('Error deleting stop:', error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể xóa điểm đón/trả. Vui lòng thử lại.');
      }
    } finally {
      setDeleteStopLoading(false);
    }
  };

  const getTypeLabel = (type: 'pickup' | 'dropoff') => {
    return type === 'pickup' ? 'Điểm đón' : 'Điểm trả';
  };

  const getTypeColor = (type: 'pickup' | 'dropoff') => {
    return type === 'pickup' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-700 mb-6">Quản lý Tỉnh/Thành & Điểm đón/trả</h1>
      
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('provinces')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'provinces'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tỉnh/Thành
            </button>
            <button
              onClick={() => setActiveTab('stops')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stops'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Điểm đón/trả
            </button>
          </nav>
        </div>
      </div>

      {/* Provinces Tab */}
      {activeTab === 'provinces' && (
        <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleCreateProvince}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow"
        >
          + Tạo tỉnh/thành
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
            {provinceLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Đang tải danh sách tỉnh/thành...</p>
          </div>
        ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã tỉnh</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên tỉnh</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {provinces.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Chưa có tỉnh/thành nào
                    </td>
                  </tr>
                ) : (
                  provinces.map((province) => (
                    <tr key={province.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{province.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{province.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatShortDate(province.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                            onClick={() => handleShowProvinceDetail(province)}
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
        )}
      </div>
        </div>
      )}

      {/* Stops Tab */}
      {activeTab === 'stops' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            {/* Filters */}
            <div className="flex gap-4">
              <select
                value={stopFilterProvince}
                onChange={(e) => setStopFilterProvince(e.target.value ? Number(e.target.value) : '')}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="">Tất cả tỉnh/thành</option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>
              <select
                value={stopFilterType}
                onChange={(e) => setStopFilterType(e.target.value as 'pickup' | 'dropoff' | '')}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="">Tất cả loại</option>
                <option value="pickup">Điểm đón</option>
                <option value="dropoff">Điểm trả</option>
              </select>
            </div>
            
            <button
              onClick={handleCreateStop}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow"
            >
              + Tạo điểm đón/trả
            </button>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            {stopLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Đang tải danh sách điểm đón/trả...</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên điểm</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa chỉ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tỉnh/Thành</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stops.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        Chưa có điểm đón/trả nào
                      </td>
                    </tr>
                  ) : (
                    stops.map((stop) => (
                      <tr key={stop.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{stop.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{stop.address || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(stop.type)}`}>
                            {getTypeLabel(stop.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{stop.provinceName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => handleShowStopDetail(stop)}
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Create Province Modal */}
      {showCreateProvinceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold mb-4 text-green-700">Tạo tỉnh/thành mới</h2>
            <form onSubmit={handleSubmitCreateProvince}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Mã tỉnh/thành</label>
                <input
                  type="text"
                  className={`w-full border ${createProvinceErrors.code ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400`}
                  value={provinceCode}
                  onChange={e => setProvinceCode(e.target.value)}
                  required
                  disabled={createProvinceLoading}
                />
                {createProvinceErrors.code && <div className="text-red-500 text-xs mt-1">{createProvinceErrors.code}</div>}
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-1">Tên tỉnh/thành</label>
                <input
                  type="text"
                  className={`w-full border ${createProvinceErrors.name ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400`}
                  value={provinceName}
                  onChange={e => setProvinceName(e.target.value)}
                  required
                  disabled={createProvinceLoading}
                />
                {createProvinceErrors.name && <div className="text-red-500 text-xs mt-1">{createProvinceErrors.name}</div>}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseCreateProvinceModal}
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                  disabled={createProvinceLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 font-semibold disabled:bg-green-400"
                  disabled={createProvinceLoading}
                >
                  {createProvinceLoading ? 'Đang tạo...' : 'Tạo'}
                </button>
              </div>
            </form>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
              onClick={handleCloseCreateProvinceModal}
              aria-label="Đóng"
              disabled={createProvinceLoading}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Create Stop Modal */}
      {showCreateStopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold mb-4 text-green-700">Tạo điểm đón/trả mới</h2>
            <form onSubmit={handleSubmitCreateStop}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Tên điểm đón/trả</label>
                <input
                  type="text"
                  className={`w-full border ${createStopErrors.name ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400`}
                  value={stopName}
                  onChange={e => setStopName(e.target.value)}
                  required
                  disabled={createStopLoading}
                />
                {createStopErrors.name && <div className="text-red-500 text-xs mt-1">{createStopErrors.name}</div>}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Địa chỉ (tùy chọn)</label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={stopAddress}
                  onChange={e => setStopAddress(e.target.value)}
                  rows={2}
                  disabled={createStopLoading}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Tỉnh/Thành</label>
                <select
                  className={`w-full border ${createStopErrors.provinceId ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400`}
                  value={stopProvinceId}
                  onChange={e => setStopProvinceId(e.target.value ? Number(e.target.value) : '')}
                  required
                  disabled={createStopLoading}
                >
                  <option value="">Chọn tỉnh/thành</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
                {createStopErrors.provinceId && <div className="text-red-500 text-xs mt-1">{createStopErrors.provinceId}</div>}
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-1">Loại điểm</label>
                <select
                  className={`w-full border ${createStopErrors.type ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400`}
                  value={stopType}
                  onChange={e => setStopType(e.target.value as 'pickup' | 'dropoff' | '')}
                  required
                  disabled={createStopLoading}
                >
                  <option value="">Chọn loại điểm</option>
                  <option value="pickup">Điểm đón</option>
                  <option value="dropoff">Điểm trả</option>
                </select>
                {createStopErrors.type && <div className="text-red-500 text-xs mt-1">{createStopErrors.type}</div>}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseCreateStopModal}
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                  disabled={createStopLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 font-semibold disabled:bg-green-400"
                  disabled={createStopLoading}
                >
                  {createStopLoading ? 'Đang tạo...' : 'Tạo'}
                </button>
              </div>
            </form>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
              onClick={handleCloseCreateStopModal}
              aria-label="Đóng"
              disabled={createStopLoading}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Province Detail/Edit Modal */}
      {showProvinceDetailModal && selectedProvince && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold mb-4 text-green-700">
              {isProvinceEditMode ? 'Chỉnh sửa tỉnh/thành' : 'Chi tiết tỉnh/thành'}
            </h2>
            
            {!isProvinceEditMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">Mã tỉnh/thành</label>
                  <p className="text-gray-900">{selectedProvince.code}</p>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">Tên tỉnh/thành</label>
                  <p className="text-gray-900">{selectedProvince.name}</p>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">Ngày tạo</label>
                  <p className="text-gray-900">{formatShortDate(selectedProvince.createdAt)}</p>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={handleEditProvince}
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-semibold"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={handleCloseProvinceDetailModal}
                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProvince}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Mã tỉnh/thành</label>
                  <input
                    type="text"
                    className={`w-full border ${editProvinceErrors.code ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400`}
                    value={editProvinceCode}
                    onChange={e => setEditProvinceCode(e.target.value)}
                    required
                    disabled={updateProvinceLoading}
                  />
                  {editProvinceErrors.code && <div className="text-red-500 text-xs mt-1">{editProvinceErrors.code}</div>}
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-1">Tên tỉnh/thành</label>
                  <input
                    type="text"
                    className={`w-full border ${editProvinceErrors.name ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400`}
                    value={editProvinceName}
                    onChange={e => setEditProvinceName(e.target.value)}
                    required
                    disabled={updateProvinceLoading}
                  />
                  {editProvinceErrors.name && <div className="text-red-500 text-xs mt-1">{editProvinceErrors.name}</div>}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProvinceEditMode(false)}
                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                    disabled={updateProvinceLoading}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 font-semibold disabled:bg-green-400"
                    disabled={updateProvinceLoading}
                  >
                    {updateProvinceLoading ? 'Đang cập nhật...' : 'Cập nhật'}
                  </button>
                </div>
              </form>
            )}
            
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
              onClick={handleCloseProvinceDetailModal}
              aria-label="Đóng"
              disabled={updateProvinceLoading}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Stop Detail/Edit Modal */}
      {showStopDetailModal && selectedStop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold mb-4 text-green-700">
              {isStopEditMode ? 'Chỉnh sửa điểm đón/trả' : 'Chi tiết điểm đón/trả'}
            </h2>
            
            {!isStopEditMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">Tên điểm</label>
                  <p className="text-gray-900">{selectedStop.name}</p>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">Địa chỉ</label>
                  <p className="text-gray-900">{selectedStop.address || '-'}</p>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">Loại</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedStop.type)}`}>
                    {getTypeLabel(selectedStop.type)}
                  </span>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">Tỉnh/Thành</label>
                  <p className="text-gray-900">{selectedStop.provinceName}</p>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={handleEditStop}
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-semibold"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={handleDeleteStop}
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-semibold"
                  >
                    Xóa
                  </button>
                  <button
                    onClick={handleCloseStopDetailModal}
                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateStop}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Tên điểm đón/trả</label>
                  <input
                    type="text"
                    className={`w-full border ${editStopErrors.name ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400`}
                    value={editStopName}
                    onChange={e => setEditStopName(e.target.value)}
                    required
                    disabled={updateStopLoading}
                  />
                  {editStopErrors.name && <div className="text-red-500 text-xs mt-1">{editStopErrors.name}</div>}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Địa chỉ (tùy chọn)</label>
                  <textarea
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={editStopAddress}
                    onChange={e => setEditStopAddress(e.target.value)}
                    rows={2}
                    disabled={updateStopLoading}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Tỉnh/Thành</label>
                  <select
                    className={`w-full border ${editStopErrors.provinceId ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400`}
                    value={editStopProvinceId}
                    onChange={e => setEditStopProvinceId(e.target.value ? Number(e.target.value) : '')}
                    required
                    disabled={updateStopLoading}
                  >
                    <option value="">Chọn tỉnh/thành</option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  {editStopErrors.provinceId && <div className="text-red-500 text-xs mt-1">{editStopErrors.provinceId}</div>}
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-1">Loại điểm</label>
                  <select
                    className={`w-full border ${editStopErrors.type ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400`}
                    value={editStopType}
                    onChange={e => setEditStopType(e.target.value as 'pickup' | 'dropoff' | '')}
                    required
                    disabled={updateStopLoading}
                  >
                    <option value="">Chọn loại điểm</option>
                    <option value="pickup">Điểm đón</option>
                    <option value="dropoff">Điểm trả</option>
                  </select>
                  {editStopErrors.type && <div className="text-red-500 text-xs mt-1">{editStopErrors.type}</div>}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsStopEditMode(false)}
                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                    disabled={updateStopLoading}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 font-semibold disabled:bg-green-400"
                    disabled={updateStopLoading}
                  >
                    {updateStopLoading ? 'Đang cập nhật...' : 'Cập nhật'}
                  </button>
                </div>
              </form>
            )}
            
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
              onClick={handleCloseStopDetailModal}
              aria-label="Đóng"
              disabled={updateStopLoading}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Province Delete Confirm Modal */}
      {showProvinceDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-red-700">Xác nhận xóa</h2>
            <p className="text-gray-700 mb-6">
              Bạn có chắc chắn muốn xóa tỉnh/thành <strong>{selectedProvince?.name}</strong> không?
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowProvinceDeleteConfirm(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                disabled={deleteProvinceLoading}
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteProvince}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-semibold disabled:bg-red-400"
                disabled={deleteProvinceLoading}
              >
                {deleteProvinceLoading ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stop Delete Confirm Modal */}
      {showStopDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-red-700">Xác nhận xóa</h2>
            <p className="text-gray-700 mb-6">
              Bạn có chắc chắn muốn xóa điểm đón/trả <strong>{selectedStop?.name}</strong> không?
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowStopDeleteConfirm(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                disabled={deleteStopLoading}
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteStop}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-semibold disabled:bg-red-400"
                disabled={deleteStopLoading}
              >
                {deleteStopLoading ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProvincesPage; 