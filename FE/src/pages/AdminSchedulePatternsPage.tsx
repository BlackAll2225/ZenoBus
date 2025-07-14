import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import PatternList from '@/components/PatternList';
import PatternForm from '@/components/PatternForm';
import PatternDetail from '@/components/PatternDetail';
import { schedulePatternService, SchedulePattern, SchedulePatternInput } from '@/services/schedulePatternService';



type ViewMode = 'list' | 'create' | 'edit' | 'detail';

const AdminSchedulePatternsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPattern, setSelectedPattern] = useState<SchedulePattern | undefined>();
  const { toast } = useToast();

  const handleCreatePattern = () => {
    setSelectedPattern(undefined);
    setViewMode('create');
  };

  const handleEditPattern = (pattern: SchedulePattern) => {
    setSelectedPattern(pattern);
    setViewMode('edit');
  };

  const handleViewPattern = (pattern: SchedulePattern) => {
    setSelectedPattern(pattern);
    setViewMode('detail');
  };

  const handleDeletePattern = async (patternId: number) => {
    try {
      await schedulePatternService.delete(patternId);
      
      toast({
        title: "Thành công",
        description: "Xóa mẫu lịch trình thành công!",
      });
      
      // Return to list view
      setViewMode('list');
    } catch (error) {
      console.error('Error deleting pattern:', error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa mẫu lịch trình!",
        variant: "destructive",
      });
    }
  };

  const handleSavePattern = async (patternData: SchedulePatternInput) => {
    try {
      if (selectedPattern) {
        await schedulePatternService.update(selectedPattern.id, patternData);
        toast({
          title: "Thành công",
          description: "Cập nhật mẫu lịch trình thành công!",
        });
      } else {
        await schedulePatternService.create(patternData);
        toast({
          title: "Thành công", 
          description: "Tạo mẫu lịch trình thành công!",
        });
      }
      
      // Return to list view
      setViewMode('list');
    } catch (error) {
      console.error('Error saving pattern:', error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra khi lưu mẫu lịch trình!",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setSelectedPattern(undefined);
    setViewMode('list');
  };

  const getPageTitle = () => {
    switch (viewMode) {
      case 'create':
        return 'Tạo mẫu lịch trình mới';
      case 'edit':
        return 'Chỉnh sửa mẫu lịch trình';
      case 'detail':
        return 'Chi tiết mẫu lịch trình';
      default:
        return 'Quản lý mẫu lịch trình';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {viewMode !== 'list' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{getPageTitle()}</h1>
              <p className="text-gray-600">
                {viewMode === 'list' 
                  ? 'Quản lý các mẫu lịch trình tự động cho hệ thống'
                  : 'Cấu hình mẫu lịch trình để tự động tạo schedules'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 max-w-7xl">
        {viewMode === 'list' && (
          <PatternList
            onCreatePattern={handleCreatePattern}
            onEditPattern={handleEditPattern}
            onDeletePattern={handleDeletePattern}
          />
        )}

        {(viewMode === 'create' || viewMode === 'edit') && (
          <PatternForm
            pattern={selectedPattern}
            onSave={handleSavePattern}
            onCancel={handleCancel}
          />
        )}

        {viewMode === 'detail' && selectedPattern && (
          <PatternDetail
            pattern={selectedPattern}
            onEdit={() => setViewMode('edit')}
            onDelete={() => handleDeletePattern(selectedPattern.id)}
            onClose={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default AdminSchedulePatternsPage; 