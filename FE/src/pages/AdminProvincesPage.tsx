import React, { useState, useEffect } from 'react';
import { provinceService, Province, CreateProvinceData, UpdateProvinceData } from '@/services/provinceService';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

const AdminProvincesPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [provinceCode, setProvinceCode] = useState('');
  const [provinceName, setProvinceName] = useState('');
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Validation state for create
  const [createErrors, setCreateErrors] = useState<{ code?: string; name?: string }>({});

  // Detail/Edit modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');
  const [editErrors, setEditErrors] = useState<{ code?: string; name?: string }>({});

  // Delete confirm state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load provinces on component mount
  useEffect(() => {
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    try {
      setLoading(true);
      const provinces = await provinceService.getAllProvinces();
      setProvinces(provinces);
    } catch (error: unknown) {
      console.error('Error loading provinces:', error);
      toast.error('Không thể tải danh sách tỉnh/thành');
    } finally {
      setLoading(false);
    }
  };

  // Create province
  const handleCreateProvince = () => {
    setShowCreateModal(true);
    setCreateErrors({});
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setProvinceCode('');
    setProvinceName('');
    setCreateErrors({});
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { code?: string; name?: string } = {};
    if (!provinceCode.trim()) errors.code = 'Mã tỉnh không được để trống';
    if (!provinceName.trim()) errors.name = 'Tên tỉnh không được để trống';
    setCreateErrors(errors);
    
    if (Object.keys(errors).length > 0) return;

    try {
      setCreateLoading(true);
      const createData: CreateProvinceData = {
        code: provinceCode.trim(),
        name: provinceName.trim()
      };
      
      await provinceService.create(createData);
      toast.success('Tạo tỉnh/thành thành công!');
      handleCloseCreateModal();
      loadProvinces(); // Reload the list
    } catch (error: unknown) {
      console.error('Error creating province:', error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể tạo tỉnh/thành. Vui lòng thử lại.');
      }
    } finally {
      setCreateLoading(false);
    }
  };

  // Detail/Edit modal
  const handleShowDetail = (province: Province) => {
    setSelectedProvince(province);
    setEditCode(province.code);
    setEditName(province.name);
    setIsEditMode(false);
    setEditErrors({});
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedProvince(null);
    setIsEditMode(false);
    setEditErrors({});
    setShowDeleteConfirm(false);
  };

  const handleEdit = () => {
    setIsEditMode(true);
    setEditErrors({});
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { code?: string; name?: string } = {};
    if (!editCode.trim()) errors.code = 'Mã tỉnh không được để trống';
    if (!editName.trim()) errors.name = 'Tên tỉnh không được để trống';
    setEditErrors(errors);
    
    if (Object.keys(errors).length > 0) return;
    if (!selectedProvince) return;

    try {
      setUpdateLoading(true);
      const updateData: UpdateProvinceData = {
        code: editCode.trim(),
        name: editName.trim()
      };
      
      await provinceService.update(selectedProvince.id, updateData);
      toast.success('Cập nhật tỉnh/thành thành công!');
      handleCloseDetailModal();
      loadProvinces(); // Reload the list
    } catch (error: unknown) {
      console.error('Error updating province:', error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể cập nhật tỉnh/thành. Vui lòng thử lại.');
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  // Delete
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedProvince) return;

    try {
      setDeleteLoading(true);
      await provinceService.delete(selectedProvince.id);
      toast.success('Xóa tỉnh/thành thành công!');
      handleCloseDetailModal();
      loadProvinces(); // Reload the list
    } catch (error: unknown) {
      console.error('Error deleting province:', error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể xóa tỉnh/thành. Vui lòng thử lại.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-700 mb-6">Quản lý tỉnh/thành</h1>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleCreateProvince}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow"
        >
          + Tạo tỉnh/thành
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Đang tải danh sách tỉnh/thành...</p>
          </div>
        ) : (
          <>
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
                        {new Date(province.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => handleShowDetail(province)}
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Modal tạo tỉnh */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold mb-4 text-green-700">Tạo tỉnh/thành mới</h2>
            <form onSubmit={handleSubmitCreate}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Mã tỉnh/thành</label>
                <input
                  type="text"
                  className={`w-full border ${createErrors.code ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400`}
                  value={provinceCode}
                  onChange={e => setProvinceCode(e.target.value)}
                  required
                  disabled={createLoading}
                />
                {createErrors.code && <div className="text-red-500 text-xs mt-1">{createErrors.code}</div>}
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-1">Tên tỉnh/thành</label>
                <input
                  type="text"
                  className={`w-full border ${createErrors.name ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400`}
                  value={provinceName}
                  onChange={e => setProvinceName(e.target.value)}
                  required
                  disabled={createLoading}
                />
                {createErrors.name && <div className="text-red-500 text-xs mt-1">{createErrors.name}</div>}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                  disabled={createLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 font-semibold disabled:bg-green-400"
                  disabled={createLoading}
                >
                  {createLoading ? 'Đang tạo...' : 'Tạo'}
                </button>
              </div>
            </form>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
              onClick={handleCloseCreateModal}
              aria-label="Đóng"
              disabled={createLoading}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Modal chi tiết/chỉnh sửa */}
      {showDetailModal && selectedProvince && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold mb-4 text-green-700">
              {isEditMode ? 'Chỉnh sửa tỉnh/thành' : 'Chi tiết tỉnh/thành'}
            </h2>
            
            {!isEditMode ? (
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
                  <p className="text-gray-900">{new Date(selectedProvince.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-semibold"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-semibold"
                  >
                    Xóa
                  </button>
                  <button
                    onClick={handleCloseDetailModal}
                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdate}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Mã tỉnh/thành</label>
                  <input
                    type="text"
                    className={`w-full border ${editErrors.code ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400`}
                    value={editCode}
                    onChange={e => setEditCode(e.target.value)}
                    required
                    disabled={updateLoading}
                  />
                  {editErrors.code && <div className="text-red-500 text-xs mt-1">{editErrors.code}</div>}
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-1">Tên tỉnh/thành</label>
                  <input
                    type="text"
                    className={`w-full border ${editErrors.name ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400`}
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    required
                    disabled={updateLoading}
                  />
                  {editErrors.name && <div className="text-red-500 text-xs mt-1">{editErrors.name}</div>}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditMode(false)}
                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                    disabled={updateLoading}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 font-semibold disabled:bg-green-400"
                    disabled={updateLoading}
                  >
                    {updateLoading ? 'Đang cập nhật...' : 'Cập nhật'}
                  </button>
                </div>
              </form>
            )}
            
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
              onClick={handleCloseDetailModal}
              aria-label="Đóng"
              disabled={updateLoading}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-red-700">Xác nhận xóa</h2>
            <p className="text-gray-700 mb-6">
              Bạn có chắc chắn muốn xóa tỉnh/thành <strong>{selectedProvince?.name}</strong> không?
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                disabled={deleteLoading}
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-semibold disabled:bg-red-400"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProvincesPage; 