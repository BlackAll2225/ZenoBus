import React from 'react';
import { AdminRevenue } from '@/components/AdminRevenue';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const AdminRevenuePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Tổng Quan Doanh Thu</h1>
            <p className="text-gray-600">Thống kê doanh thu và vé theo tháng</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="border-green-500 text-green-700 hover:bg-green-100"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm Mới
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 pb-10 max-w-7xl mx-auto">
        <AdminRevenue />
      </div>
    </div>
  );
};

export default AdminRevenuePage;
